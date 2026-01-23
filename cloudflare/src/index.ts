// FamilyPath Cloudflare Worker API
// Uses Hono for routing, D1 for database, JWT for auth

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { generateWeeklyPlan, getSmartWeekStart } from './planner';
import { AiCoach } from './ai';
import { PdfService } from './services/pdf-service';
import { handleArchiveExport, handleSignedDownload } from './export';

// Types
export interface Env {

  // Core bindings
  DB: D1Database;
  BOOKS_BUCKET: R2Bucket;

  // AI bindings
  AI: any;  // Workers AI binding
  CURRICULUM_INDEX: VectorizeIndex;  // Vectorize for curriculum RAG

  // AI Gateway config
  AI_GATEWAY_HOST: string;
  AI_GATEWAY_ACCOUNT_ID: string;
  AI_GATEWAY_NAME: string;

  // Auth & Config
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  ENVIRONMENT: string;
  ADMIN_SECRET?: string;
}

export interface BookMetadata {
  id: string;
  series: string;
  seriesTitle?: string;
  title: string;
  author?: string;
  illustrator?: string;
  description: string;
  minAgeMonths: number;
  maxAgeMonths: number;
  pageCount: number;
  domain: string;
  learningStage: string;
  readingPrompts?: { page: number; prompt: string }[];
  coverUrl?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  provider: string;
  household_id?: string;
  role?: 'parent' | 'student';
  student_id?: string;
}

interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  household_id?: string;
  role?: 'parent' | 'student';
  student_id?: string;
  exp: number;
  iat: number;
}

// Security helper: Escape HTML special characters
function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Security helper: Validate path segment to prevent traversal
function isValidPathSegment(segment: string): boolean {
  if (!segment) return false;
  // Disallow ".." components to prevent traversing up the bucket
  const parts = segment.split(/[/\\]/);
  return !parts.includes('..');
}

// Security helper: Constant-time comparison using Web Crypto to prevent timing attacks
async function safeCompare(a: string | undefined | null, b: string | undefined | null): Promise<boolean> {
  if (!a || !b) {
    return false;
  }

  const encoder = new TextEncoder();
  const aBuf = encoder.encode(a);
  const bBuf = encoder.encode(b);

  // Use SHA-256 to hash inputs to fixed length, preventing length leaks
  const aHash = await crypto.subtle.digest('SHA-256', aBuf);
  const bHash = await crypto.subtle.digest('SHA-256', bBuf);

  // Compare hashes in constant time
  return crypto.subtle.timingSafeEqual(aHash, bHash);
}

const app = new Hono<{ Bindings: Env; Variables: { user: User | null; nonce: string } }>();

// Security Headers
app.use('*', async (c, next) => {
  // Generate a random nonce for CSP to prevent XSS
  const nonce = crypto.randomUUID();
  c.set('nonce', nonce);

  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Security: Use nonce for scripts, disallow unsafe-inline
  c.header('Content-Security-Policy', `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';`);
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Security: Force HTTPS
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
});

// ============ R2 ASSET ROUTES ============
// All book assets are served via /api/books/* routes for consistency and CORS handling
// The /books/* public proxy was removed due to net::ERR_CONNECTION_REFUSED issues

// Debug R2 contents (admin only, keep for troubleshooting)
app.get('/api/r2-debug', async (c) => {
  try {
    const prefix = c.req.query('prefix') || '';
    const list = await c.env.BOOKS_BUCKET.list({ limit: 100, prefix });
    return c.json(list);
  } catch (e: any) {
    return c.text(`Error listing bucket: ${e.message}`, 500);
  }
});

app.get('/', async (c) => {
  const key = c.req.query('key');
  const secret = c.env.ADMIN_SECRET;
  const nonce = c.get('nonce');

  if (!secret) {
    return c.text('Admin secret not configured', 500);
  }

  // Use constant-time comparison
  if (!(await safeCompare(key, secret))) {
    return c.html(`
      <html>
        <head><title>Unauthorized</title><style>body{background:#111;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;}</style></head>
        <body>
          <div style="text-align:center">
            <h1>401 Unauthorized</h1>
            <p>Access requires a valid key parameter.</p>
          </div>
        </body>
      </html>
    `, 401);
  }

  try {
    const start = Date.now();
    // 1. App Health
    let usersCount, newUsers, plansCount, activeParents;
    try {
      usersCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<any>();
      newUsers = await c.env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE created_at > datetime('now', '-24 hours')").first<any>();
      plansCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM weekly_plans').first<any>();
      activeParents = await c.env.DB.prepare("SELECT COUNT(DISTINCT parent_id) as count FROM weekly_plans WHERE updated_at > datetime('now', '-7 days')").first<any>();
    } catch (e) {
      console.error("DB Health Check Error", e);
    }

    // DB Latency Check
    const dbLatency = Date.now() - start;

    // 2. AI Stats
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.slice(0, 7); // YYYY-MM

    let aiToday, aiMonth, recentLogs: any[] = [], triageStats: any = { results: [] }, recentTriageLogs: any[] = [];
    try {
      aiToday = await c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM ai_logs WHERE date(created_at) = ?"
      ).bind(today).first<any>();

      aiMonth = await c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM ai_logs WHERE strftime('%Y-%m', created_at) = ?"
      ).bind(currentMonth).first<any>();

      // 3. Recent Activity (Expanded)
      const logsResult = await c.env.DB.prepare(
        'SELECT id, interaction_type, question, answer, context_json, created_at FROM ai_logs ORDER BY created_at DESC LIMIT 20'
      ).all();
      recentLogs = logsResult.results;

      // 4. Triage Stats
      triageStats = await c.env.DB.prepare(
        "SELECT status, COUNT(*) as count FROM ai_triage_logs WHERE date(created_at) = ? GROUP BY status"
      ).bind(today).all();

      const triageLogsResult = await c.env.DB.prepare(
        'SELECT input_text, status, reasoning, confidence, created_at FROM ai_triage_logs ORDER BY created_at DESC LIMIT 20'
      ).all();
      recentTriageLogs = triageLogsResult.results;

    } catch (e) {
      console.error("AI Stats Error", e);
    }

    // 4. Render HTML
    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Teacher's Aide System Console</title>
        <style>
          :root { --bg: #0f172a; --card: #1e293b; --text: #e2e8f0; --accent: #38bdf8; --success: #22c55e; --error: #ef4444; --border: #334155; --muted: #64748b; }
          * { box-sizing: border-box; }
          body { font-family: 'SF Mono', SFMono-Regular, ui-monospace, 'DejaVu Sans Mono', monospace; background: var(--bg); color: var(--text); max-width: 1200px; margin: 0 auto; padding: 20px; font-size: 14px; }
          
          header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 20px; margin-bottom: 20px; }
          h1 { margin: 0; font-size: 1.5rem; color: #fff; display: flex; align-items: center; gap: 10px; }
          .status-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--success); box-shadow: 0 0 10px var(--success); }
          .meta { font-size: 0.8rem; color: var(--muted); text-align: right; }

          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px; }
          .tile { background: var(--card); padding: 20px; border-radius: 8px; border: 1px solid var(--border); }
          .tile h3 { margin: 0 0 10px 0; font-size: 0.75rem; text-transform: uppercase; color: var(--muted); letter-spacing: 0.05em; }
          .tile .value { font-size: 2rem; font-weight: 700; color: #fff; }
          .tile .sub { font-size: 0.85rem; color: var(--muted); margin-top: 5px; display: flex; justify-content: space-between; }
          .tile .highlight { color: var(--accent); }

          .panel { background: var(--card); border-radius: 8px; border: 1px solid var(--border); overflow: hidden; }
          .panel-header { padding: 15px 20px; background: rgba(0,0,0,0.2); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
          .panel-header h2 { margin: 0; font-size: 1rem; color: #fff; }

          .log-table { width: 100%; border-collapse: collapse; }
          .log-table th { text-align: left; padding: 12px 20px; color: var(--muted); font-weight: 600; font-size: 0.75rem; border-bottom: 1px solid var(--border); background: rgba(0,0,0,0.1); }
          .log-row { border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.1s; }
          .log-row:hover { background: rgba(255,255,255,0.02); }
          .log-row td { padding: 12px 20px; vertical-align: top; }
          .log-meta { white-space: nowrap; width: 180px; color: var(--muted); font-size: 0.8rem; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; background: #334155; color: #fff; text-transform: uppercase; }
          .badge.explain { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
          .badge.feedback { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
          
          .log-details { display: none; background: rgba(0,0,0,0.3); }
          .log-details.open { display: table-row; }
          .log-details td { padding: 0; }
          .details-wrapper { padding: 20px; border-bottom: 1px solid var(--border); }
          
          .json-block { background: #0b1120; padding: 15px; border-radius: 6px; overflow-x: auto; font-family: monospace; font-size: 0.8rem; color: #a5b4fc; margin-top: 10px; border: 1px solid var(--border); white-space: pre-wrap; }
          .key { color: #7dd3fc; }
          .string { color: #a5f3fc; }
          .number { color: #fca5a5; }

          .action-btn { background: transparent; border: 1px solid var(--border); color: var(--muted); padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.75rem; transition: all 0.2s; }
          .action-btn:hover { background: var(--border); color: #fff; }
          
          .controls { display: flex; gap: 10px; align-items: center; }
          .refresh-timer { font-size: 0.8rem; color: var(--muted); }
        </style>
      </head>
      <body>
        <header>
          <h1><div class="status-dot"></div> Teacher's Aide Console</h1>
          <div class="controls">
             <span class="refresh-timer" id="timer">Refreshing in 60s</span>
             <button class="action-btn" id="pauseBtn">Pause</button>
             <button class="action-btn" id="refreshBtn">Refresh Now</button>
          </div>
        </header>

        <div class="grid">
          <!-- Triage Logs -->
        <div class="card full-width">
          <h2>🛡️ AI Front Desk Triage</h2>
          <div style="display:flex; gap: 20px; margin-bottom: 20px;">
            <div class="stat-box">
              <div class="stat-value">${(triageStats.results.find((r: any) => r.status === 'VALID')?.count) || 0}</div>
              <div class="stat-label">Valid Intent</div>
            </div>
            <div class="stat-box" style="border-left: 4px solid #f59e0b;">
              <div class="stat-value">${(triageStats.results.find((r: any) => r.status === 'AMBIGUOUS')?.count) || 0}</div>
              <div class="stat-label">Ambiguous (Clarified)</div>
            </div>
            <div class="stat-box" style="border-left: 4px solid #ef4444;">
              <div class="stat-value">${(triageStats.results.find((r: any) => r.status === 'INVALID')?.count) || 0}</div>
              <div class="stat-label">Blocked/Invalid</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Status</th>
                <th>Confidence</th>
                <th>Input</th>
                <th>Reasoning</th>
              </tr>
            </thead>
            <tbody>
              ${recentTriageLogs.map((log: any) => `
                <tr>
                  <td>${new Date(log.created_at).toLocaleTimeString()}</td>
                  <td>
                    <span class="badge badge-${log.status === 'VALID' ? 'success' : log.status === 'AMBIGUOUS' ? 'warning' : 'danger'}">
                      ${escapeHtml(log.status)}
                    </span>
                  </td>
                  <td>${Math.round(log.confidence * 100)}%</td>
                  <td class="code-cell">${escapeHtml(log.input_text)}</td>
                  <td>${escapeHtml(log.reasoning)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="card full-width">
          <h2>🧠 AI Resolution Logs (Main Coach)</h2>
            <div class="value">${aiToday?.count || 0}</div>
            <div class="sub">
              <span>Today</span>
              <span class="highlight">Monthly: ${aiMonth?.count || 0}</span>
            </div>
          </div>

          <!-- User Growth -->
          <div class="tile">
            <h3>User Base</h3>
            <div class="value">${usersCount?.count || 0}</div>
            <div class="sub">
              <span>Total Users</span>
              <span class="highlight">+${newUsers?.count || 0} (24h)</span>
            </div>
          </div>

           <!-- System Health -->
          <div class="tile">
            <h3>System Status</h3>
            <div class="value" style="color:#22c55e">Healthy</div>
            <div class="sub">
              <span>${plansCount?.count || 0} Plans Active</span>
              <span style="font-family:monospace">DB Latency: ${dbLatency}ms</span>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h2>Flight Recorder (Last 20 Logs)</h2>
            <div class="meta">Click row to expand details</div>
          </div>
          <table class="log-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Type</th>
                <th>Interaction Preview</th>
                <th style="text-align:right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${recentLogs && recentLogs.length > 0 ? recentLogs.map((log: any) => {
      const safeContext = log.context_json ? JSON.stringify(JSON.parse(log.context_json), null, 2).replace(/</g, '&lt;') : '{}';

      const safeQuestion = escapeHtml(log.question || '');
      const safeQuestionShort = safeQuestion.length > 80 ? safeQuestion.substring(0, 80) + '...' : safeQuestion;

      const debugObjRaw = JSON.stringify({
        id: log.id,
        type: log.interaction_type,
        question: log.question,
        context: log.context_json ? JSON.parse(log.context_json) : null,
        answer: log.answer,
        timestamp: log.created_at
      }, null, 2);

      // Escape for textarea content (specifically </textarea>)
      const safeDebugObj = debugObjRaw.replace(/</g, '&lt;');
      const safeId = escapeHtml(log.id);

      return `
                <tr class="log-row" data-id="${safeId}">
                  <td class="log-meta">
                    <div>${new Date(log.created_at).toLocaleTimeString()}</div>
                    <div style="font-size:0.75rem; opacity:0.6">${new Date(log.created_at).toLocaleDateString()}</div>
                  </td>
                  <td width="100"><span class="badge ${escapeHtml(log.interaction_type)}">${escapeHtml(log.interaction_type)}</span></td>
                  <td>
                    <div style="font-weight:600;margin-bottom:4px;color:#fff">${safeQuestion ? safeQuestionShort : '(No Query)'}</div>
                    <div style="color:var(--muted);font-size:0.8rem;font-style:italic">ID: ${safeId}</div>
                  </td>
                  <td class="actions-cell" style="text-align:right">
                     <button class="action-btn copy-btn" data-id="${safeId}">Copy Debug Object</button>
                     <textarea id="debug-${safeId}" style="display:none">${safeDebugObj}</textarea>
                  </td>
                </tr>
                <tr class="log-details" id="row-${safeId}">
                  <td colspan="4">
                    <div class="details-wrapper">
                      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                          <h4 style="margin:0 0 10px 0; color:var(--muted)">Context Payload</h4>
                          <div class="json-block">${safeContext}</div>
                        </div>
                        <div>
                           <h4 style="margin:0 0 10px 0; color:var(--muted)">AI Response</h4>
                           <div class="json-block" style="color:#e2e8f0;white-space:pre-line">${log.answer ? escapeHtml(log.answer) : '(No Response)'}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                `;
    }).join('') : '<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--muted)">No interactions recorded yet.</td></tr>'}
            </tbody>
          </table>
        </div>

        <script nonce="${nonce}">
          let paused = false;
          let timeLeft = 60;

          function toggleRow(id) {
            const row = document.getElementById('row-' + id);
            if (row) row.classList.toggle('open');
          };

          function copyDebug(id) {
            const content = document.getElementById('debug-' + id).value;
            const txt = document.createElement('textarea');
            txt.innerHTML = content;
            navigator.clipboard.writeText(txt.value).then(() => {
              alert('Debug JSON copied to clipboard!');
            });
          };

          function togglePause() {
            paused = !paused;
            const btn = document.getElementById('pauseBtn');
            if (btn) {
              btn.innerText = paused ? "Resume" : "Pause";
              btn.style.borderColor = paused ? "#fcd34d" : "var(--border)";
              btn.style.color = paused ? "#fcd34d" : "var(--muted)";
            }
          };

          // Event Delegation for dynamic rows
          document.addEventListener('click', function(e) {
            // Row Toggle
            const row = e.target.closest('.log-row');
            // Check if we clicked inside actions column or textarea
            const isActions = e.target.closest('.actions-cell') || e.target.closest('textarea');

            if (row && !isActions) {
              toggleRow(row.dataset.id);
            }

            // Copy Button
            const copyBtn = e.target.closest('.copy-btn');
            if (copyBtn) {
              e.stopPropagation(); // prevent row toggle safety
              copyDebug(copyBtn.dataset.id);
            }
          });

          // Static Buttons
          document.getElementById('pauseBtn')?.addEventListener('click', togglePause);
          document.getElementById('refreshBtn')?.addEventListener('click', () => window.location.reload());

          setInterval(() => {
            if (!paused) {
              timeLeft--;
              const timer = document.getElementById('timer');
              if (timer) timer.innerText = 'Refreshing in ' + timeLeft + 's';
              if (timeLeft <= 0) {
                 window.location.reload();
              }
            } else {
               const timer = document.getElementById('timer');
               if (timer) timer.innerText = 'Paused';
            }
          }, 1000);
        </script>
      </body>
      </html>
    `);

  } catch (err: any) {
    return c.html(`<h1>System Error</h1><pre>${err.message}</pre>`, 500);
  }
});

// CORS middleware - allows Cloudflare Pages and Lovable preview
app.use('*', cors({
  origin: (origin, c) => {
    const frontendUrl = c.env.FRONTEND_URL || 'https://stage-builder-9hh.pages.dev';
    const allowedOrigins = [
      frontendUrl,
      'https://stage-builder-9hh.pages.dev',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8080',
    ];
    // Also allow any lovable.app or lovableproject.com subdomain
    if (origin && (
      allowedOrigins.includes(origin) || 
      origin.endsWith('.lovable.app') || 
      origin.endsWith('.lovableproject.com')
    )) {
      return origin;
    }
    return frontendUrl;
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// JWT utilities using Web Crypto
async function signJWT(payload: Omit<JWTPayload, 'iat'>, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat };

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(fullPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !encodedSignature) return null;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureData = Uint8Array.from(
      atob(encodedSignature.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureData,
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    );

    if (!valid) return null;

    const payload: JWTPayload = JSON.parse(
      atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'))
    );

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// Auth middleware
app.use('/api/*', async (c, next) => {
  // Prevent caching of sensitive API responses
  c.header('Cache-Control', 'no-store, max-age=0');

  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '') || c.req.query('token');

  if (token) {
    const payload = await verifyJWT(token, c.env.JWT_SECRET);
    if (payload) {
      const user = await c.env.DB.prepare(
        'SELECT * FROM users WHERE id = ?'
      ).bind(payload.sub).first<User>();
      c.set('user', user);
    }
  }

  await next();
});

// Require auth helper (Base)
function requireAuth(c: any): User {
  const user = c.get('user');
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

// Require Parent role
function requireParent(c: any): User {
  const user = requireAuth(c);
  // Default to parent if role is missing (backward compatibility)
  if (user.role && user.role !== 'parent') {
    throw new Error('Unauthorized: Parents only');
  }
  return user;
}

// Require Household Member (Parent or Student)
function requireHouseholdMember(c: any): User {
  const user = requireAuth(c);
  if (!user.household_id) {
    // If no household_id, they might be a legacy user. 
    // In strict mode, we might want to block or auto-create household.
    // For now, allow legacy users (they are parents effectively)
  }
  return user;
}

// Generate unique ID
function generateId(prefix: string): string {
  // Use crypto.randomUUID for secure randomness
  // UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // We take the last segment (12 hex chars) to replace the 9 base36 chars
  // This increases entropy from ~46 bits to 48 bits and is cryptographically secure.
  const randomPart = crypto.randomUUID().substring(24);
  return `${prefix}-${Date.now()}-${randomPart}`;
}

// Security helper: Generate cryptographically secure invite code
function generateInviteCode(): string {
  // Format: XXXX-XXXX (Base36ish)
  // We want uppercase alphanumeric.
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const values = new Uint8Array(8);
  crypto.getRandomValues(values);

  for (let i = 0; i < 8; i++) {
    // Rejection sampling to avoid bias
    // 36 (charset length) * 7 = 252.
    // Bytes are 0-255.
    // If we get 252, 253, 254, 255, we retry.
    let val = values[i];
    while (val >= 252) {
      const replacement = new Uint8Array(1);
      crypto.getRandomValues(replacement);
      val = replacement[0];
    }

    result += charset[val % 36];
    if (i === 3) result += '-';
  }
  return result;
}


// ============ EXPORT ROUTES ============

app.get('/api/export/transcript/:studentId', async (c) => {
  const studentId = c.req.param('studentId');
  const user = requireHouseholdMember(c); // Ensure user has access

  // 1. Get Student
  const student = await c.env.DB.prepare('SELECT * FROM students WHERE id = ?').bind(studentId).first<any>();
  if (!student) return c.text('Student not found', 404);

  // Security check: User must be in same household as student
  if (user.household_id !== student.household_id) return c.text('Unauthorized', 403);

  // 2. Fetch Evidences (Formations)
  const evidences = await c.env.DB.prepare(`
    SELECT e.duration_minutes, f.title, f.primary_virtue, f.cluster_tag, f.formation_type, strftime('%Y', e.captured_at) as year
    FROM evidences e
    JOIN formations f ON e.formation_id = f.id
    WHERE e.student_id = ?
  `).bind(studentId).all<any>();

  // 3. Fetch Apprenticeships (Work)
  const workEntries = await c.env.DB.prepare(`
    SELECT a.title, a.organization_name, a.type, SUM(w.hours) as total_hours
    FROM apprenticeships a
    JOIN work_entries w ON w.apprenticeship_id = a.id
    WHERE a.student_id = ? AND w.status = 'approved'
    GROUP BY a.id
  `).bind(studentId).all<any>();

  // 4. Aggregate Data
  const courseMap = new Map<string, { title: string, year: string, minutes: number }>();

  for (const ev of evidences.results) {
    if (!ev.duration_minutes) continue;

    // Grouping Strategy: Subject (Cluster) + Year
    const subject = ev.cluster_tag || ev.primary_virtue || 'General';
    const year = ev.year || 'Unknown';
    const key = `${subject}-${year}`;

    if (!courseMap.has(key)) {
      courseMap.set(key, { title: subject, year, minutes: 0 });
    }
    const entry = courseMap.get(key)!;
    entry.minutes += ev.duration_minutes;
  }

  const courses: any[] = [];
  let totalCredits = 0;

  for (const [key, data] of courseMap.entries()) {
    const hours = data.minutes / 60;
    const credits = hours / 120; // Carnegie Unit
    if (credits < 0.1) continue; // Filter out tiny entries

    totalCredits += credits;
    courses.push({
      subject: data.title,
      title: `${data.title} Studies`, // Can refine this name
      year: data.year,
      credits: credits,
      grade: 'Pass', // Defaulting to Pass for now
    });
  }

  // Work to Activities
  const activities = workEntries.results.map((w: any) => ({
    role: w.title,
    organization: w.organization_name || 'Self-Directed',
    hours: w.total_hours,
    description: `Type: ${w.type}`
  }));

  // 5. Generate PDF
  const pdfBytes = await PdfService.generateTranscript({
    studentName: student.name,
    dateOfBirth: student.date_of_birth,
    graduationDate: undefined, // Could add this to student schema later
    courses,
    activities,
    totalCredits
  });

  return new Response(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${student.name}_Transcript.pdf"`
    }
  });
});

app.get('/api/export/diploma/:studentId', async (c) => {
  const studentId = c.req.param('studentId');
  const user = requireHouseholdMember(c);

  const student = await c.env.DB.prepare('SELECT * FROM students WHERE id = ?').bind(studentId).first<any>();
  if (!student) return c.text('Student not found', 404);

  if (user.household_id !== student.household_id) return c.text('Unauthorized', 403);

  const pdfBytes = await PdfService.generateDiploma(student.name, new Date().toLocaleDateString());

  return new Response(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${student.name}_Diploma.pdf"`
    }
  });
});

// ============ DEV BYPASS AUTH (Development Only) ============
// Access: GET /auth/dev-bypass?email=test@example.com&name=Test%20User
// This creates or finds a user and returns a JWT token
app.get('/auth/dev-bypass', async (c) => {
  // Only allow if explicitly in development environment (FAIL SECURE)
  // If ENVIRONMENT is missing or 'production', this will block.
  if (c.env.ENVIRONMENT !== 'development') {
    return c.json({ error: 'Dev bypass not available in production' }, 403);
  }

  const email = c.req.query('email') || 'test.family@schoolos.dev';
  const name = c.req.query('name') || 'Test Family';

  try {
    // Find or create user
    let user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first<User>();

    if (!user) {
      const userId = generateId('user');
      const householdId = generateId('hh');

      // Create household for dev user
      await c.env.DB.prepare(
        'INSERT INTO households (id, name, invite_code) VALUES (?, ?, ?)'
      ).bind(householdId, `${name}'s Household`, `DEV-${Date.now()}`).run();

      await c.env.DB.prepare(
        'INSERT INTO users (id, email, name, avatar_url, provider, household_id, role) VALUES (?, ?, ?, NULL, ?, ?, ?)'
      ).bind(userId, email, name, 'dev-bypass', householdId, 'parent').run();

      user = { id: userId, email, name, avatar_url: null, provider: 'dev-bypass', household_id: householdId, role: 'parent' };
    }

    // Generate JWT
    const jwt = await signJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      household_id: user.household_id,
      role: 'parent',
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days for dev
    }, c.env.JWT_SECRET);

    // Return token (frontend can store and use)
    return c.json({
      token: jwt,
      user,
      message: 'Dev bypass successful. Store this token in localStorage as "schoolos_token"'
    });
  } catch (error) {
    console.error('Dev bypass error:', error);
    return c.json({ error: 'Dev bypass failed' }, 500);
  }
});

// ============ AUTH ROUTES ============

// Start Google OAuth flow
app.get('/auth/google', (c) => {
  // Security: Prevent CSRF with state parameter
  const state = crypto.randomUUID();
  setCookie(c, 'oauth_state', state, {
    httpOnly: true,
    secure: c.env.ENVIRONMENT !== 'development', // Secure in prod
    sameSite: 'Lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/'
  });

  const scope = encodeURIComponent('openid email profile');
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(c.env.GOOGLE_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(c.env.GOOGLE_REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&state=${state}` +
    `&access_type=offline`;

  return c.redirect(authUrl);
});

// Google OAuth callback
app.get('/auth/google/callback', async (c) => {
  const code = c.req.query('code');
  const state = c.req.query('state');
  const storedState = getCookie(c, 'oauth_state');

  // Verify state to prevent CSRF
  if (!state || !storedState || state !== storedState) {
    return c.redirect(`${c.env.FRONTEND_URL}/login?error=csrf_mismatch`);
  }

  // Clean up state cookie
  deleteCookie(c, 'oauth_state');

  if (!code) {
    return c.redirect(`${c.env.FRONTEND_URL}/login?error=no_code`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: c.env.GOOGLE_CLIENT_ID,
        client_secret: c.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: c.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens: any = await tokenResponse.json();
    if (!tokens.access_token) {
      return c.redirect(`${c.env.FRONTEND_URL}/login?error=token_failed`);
    }

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser: any = await userInfoResponse.json();

    // Check if this is a STUDENT login
    const pendingStudent = await c.env.DB.prepare(
      'SELECT * FROM students WHERE pending_login_email = ?'
    ).bind(googleUser.email).first<any>();

    let user: User | null = null;
    let userId = generateId('user');

    if (pendingStudent) {
      // Create STUDENT user
      user = await c.env.DB.prepare(
        'SELECT * FROM users WHERE email = ?'
      ).bind(googleUser.email).first<User>();

      if (!user) {
        await c.env.DB.prepare(
          'INSERT INTO users (id, email, name, avatar_url, provider, household_id, role, student_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(userId, googleUser.email, googleUser.name, googleUser.picture, 'google', pendingStudent.household_id, 'student', pendingStudent.id).run();
        user = {
          id: userId,
          email: googleUser.email,
          name: googleUser.name,
          avatar_url: googleUser.picture,
          provider: 'google',
          household_id: pendingStudent.household_id,
          role: 'student',
          student_id: pendingStudent.id
        };
      } else {
        // Update existing user (re-link if needed) checks omitted for brevity
      }

      // Clear pending status
      await c.env.DB.prepare(
        'UPDATE students SET pending_login_email = NULL WHERE id = ?'
      ).bind(pendingStudent.id).run();

    } else {
      // PARENT Login
      const existingUser = await c.env.DB.prepare(
        'SELECT * FROM users WHERE email = ?'
      ).bind(googleUser.email).first<User>();

      if (existingUser) {
        // Update profile
        await c.env.DB.prepare(
          'UPDATE users SET name = ?, avatar_url = ?, updated_at = datetime("now") WHERE id = ?'
        ).bind(googleUser.name, googleUser.picture, existingUser.id).run();

        user = existingUser;

        // Ensure household exists (migration fix for old users)
        if (!user.household_id) {
          const householdId = generateId('hh');
          await c.env.DB.prepare(
            'INSERT INTO households (id, name, invite_code) VALUES (?, ?, ?)'
          ).bind(householdId, `${user.name}'s Household`, generateId('INV').split('-').pop()).run();

          await c.env.DB.prepare('UPDATE users SET household_id = ? WHERE id = ?').bind(householdId, user.id).run();
          user.household_id = householdId;
        }

      } else {
        // New Parent User -> Create Household
        const householdId = generateId('hh');
        // Secure invite code generation
        const inviteCode = generateInviteCode();

        await c.env.DB.prepare(
          'INSERT INTO households (id, name, invite_code) VALUES (?, ?, ?)'
        ).bind(householdId, `${googleUser.name}'s Family`, inviteCode).run();

        await c.env.DB.prepare(
          'INSERT INTO users (id, email, name, avatar_url, provider, household_id, role) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(userId, googleUser.email, googleUser.name, googleUser.picture, 'google', householdId, 'parent').run();

        user = {
          id: userId,
          email: googleUser.email,
          name: googleUser.name,
          avatar_url: googleUser.picture,
          provider: 'google',
          household_id: householdId,
          role: 'parent'
        };
      }
    }

    // Create JWT
    const jwt = await signJWT({
      sub: user!.id,
      email: user!.email,
      name: user!.name,
      household_id: user!.household_id,
      role: user!.role,
      student_id: user!.student_id,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    }, c.env.JWT_SECRET);

    // Redirect to frontend with token
    return c.redirect(`${c.env.FRONTEND_URL}/auth/callback?token=${jwt}`);
  } catch (error: any) {
    console.error('OAuth error:', error);
    const errorMessage = encodeURIComponent(error.message || 'Unknown error');
    return c.redirect(`${c.env.FRONTEND_URL}/login?error=oauth_failed&error_description=${errorMessage}`);
  }
});

// Household Invite (Parent Only)
app.post('/api/household/invite', async (c) => {
  try {
    const user = requireParent(c); // Only parents can invite

    // Get current household to ensure we have code
    const household = await c.env.DB.prepare(
      'SELECT * FROM households WHERE id = ?'
    ).bind(user.household_id).first<any>();

    if (!household) return c.json({ error: 'Household not found' }, 404);

    // If no code, generate one
    let inviteCode = household.invite_code;
    if (!inviteCode) {
      inviteCode = generateInviteCode();
      await c.env.DB.prepare('UPDATE households SET invite_code = ? WHERE id = ?').bind(inviteCode, household.id).run();
    }

    return c.json({ invite_code: inviteCode });
  } catch (e: any) {
    return c.json({ error: e.message }, 401);
  }
});

// Join Household (Via Link/Code)
// GET /api/join/:code -> Verify and return info (or perform join if frontend calls this to action)
// Strategy: This endpoint performs the join for the CURRENTLY AUTHENTICATED user
app.post('/api/join', async (c) => {
  try {
    const user = requireAuth(c); // Any user can join, but typically a parent 2nd account
    const { code } = await c.req.json();

    if (!code) return c.json({ error: 'Code required' }, 400);

    const household = await c.env.DB.prepare(
      'SELECT * FROM households WHERE invite_code = ?'
    ).bind(code).first<any>();

    if (!household) return c.json({ error: 'Invalid invite code' }, 404);

    // Link user to household
    await c.env.DB.prepare(
      'UPDATE users SET household_id = ?, role = ? WHERE id = ?'
    ).bind(household.id, 'parent', user.id).run(); // Joining via code implies acting as parent/guardian

    return c.json({ success: true, household_name: household.name });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// Enable Student Login
app.post('/api/student/enable-login', async (c) => {
  try {
    const user = requireParent(c);
    const { student_id, email } = await c.req.json();

    if (!student_id || !email) return c.json({ error: 'Missing fields' }, 400);

    // Verify student belongs to parent's household
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND household_id = ?'
    ).bind(student_id, user.household_id).first<any>();

    if (!student) return c.json({ error: 'Student not found in your household' }, 404);

    await c.env.DB.prepare(
      'UPDATE students SET pending_login_email = ? WHERE id = ?'
    ).bind(email, student_id).run();

    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// Get current user
app.get('/api/auth/me', async (c) => {
  try {
    const user = requireAuth(c);

    // Get household members (children)
    // If user is student, they might only see themselves or siblings? 
    // Usually "me" returns context.

    // Get household members (children)
    let children: any[] = [];
    if (user.household_id) {
      const result = await c.env.DB.prepare(
        'SELECT * FROM students WHERE household_id = ? ORDER BY created_at'
      ).bind(user.household_id).all();
      children = result.results;
    }

    return c.json({ user, children });
  } catch (error: any) {
    console.error('Auth error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ user: null, children: [] }, status);
  }
});

// Logout (client-side token removal, but we can invalidate sessions if needed)
app.post('/api/auth/logout', (c) => {
  return c.json({ success: true });
});

// ============ STUDENTS (CHILDREN) ROUTES ============

// Get all children for current user
app.get('/api/students', async (c) => {
  try {
    const user = requireHouseholdMember(c); // Students can verify list of siblings? Or just parents? Assuming members.

    let results: any[] = [];
    if (user.household_id) {
      const query = await c.env.DB.prepare(
        'SELECT * FROM students WHERE household_id = ? ORDER BY created_at'
      ).bind(user.household_id).all();
      results = query.results;
    }

    // Parse JSON fields
    const parsedResults = results.map((student: any) => ({
      ...student,
      independence_settings: JSON.parse(student.independence_settings || '{}'),
      pace_overrides: JSON.parse(student.pace_overrides || 'null')
    }));

    return c.json(parsedResults);
  } catch (error: any) {
    console.error('Students list error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// Get notifications
app.get('/api/notifications', async (c) => {
  try {
    const user = requireParent(c);
    const notifications = [];
    const today = new Date().toISOString().split('T')[0];

    try {
      // 1. Milestone Triggers (Simplified: Count completions per virtue)
      const { results: virtueCounts } = await c.env.DB.prepare(`
        SELECT f.primary_virtue as virtue, COUNT(*) as count
        FROM evidences e
        JOIN formations f ON e.formation_id = f.id
        WHERE e.student_id IN (SELECT id FROM students WHERE household_id = ?)
        GROUP BY f.primary_virtue
        HAVING count >= 5
      `).bind(user.household_id).all();

      virtueCounts.forEach((v: any) => {
        // Logic to determine if this is a "new" milestone could be complex
        // For now, we just show "Milestone" if count is a multiple of 10
        if (v.count % 10 === 0 && v.count > 0) {
          notifications.push({
            id: `milestone-${v.virtue}-${v.count}`,
            type: 'milestone',
            title: `Milestone Unlocked!`,
            message: `Your family has completed ${v.count} formations in the virtue of ${v.virtue}!`,
            date: today
          });
        }
      });
    } catch (e: any) {
      console.error('Milestone notification error:', e);
    }

    try {
      // 2. Coverage Alerts (2+ weeks without virtue)
      // Simplified: Check distinct virtues in last 14 days
      const { results: recentVirtues } = await c.env.DB.prepare(`
        SELECT DISTINCT f.primary_virtue as virtue
        FROM evidences e
        JOIN formations f ON e.formation_id = f.id
        WHERE e.student_id IN (SELECT id FROM students WHERE household_id = ?)
        AND e.created_at > datetime('now', '-14 days')
      `).bind(user.household_id).all();

      const recentVirtueSet = new Set(recentVirtues.map((r: any) => r.virtue));
      const allVirtues = ['Wisdom', 'Stewardship', 'Love', 'Order', 'Wonder'];

      // Only alert if we have SOME evidence but missing a virtue (avoid alerting new users with 0 evidence)
      if (recentVirtues.length > 0) {
        const missing = allVirtues.find(v => !recentVirtueSet.has(v));
        if (missing) {
          notifications.push({
            id: `alert-missing-${missing}`,
            type: 'alert',
            title: 'Coverage Alert',
            message: `You haven't focused on the virtue of ${missing} recently.`,
            date: today
          });
        }
      }

      // 3. Encouragement (Weekly Balance)
      // If > 3 virtues covered this week
      if (recentVirtues.length >= 3) {
        notifications.push({
          id: `enc-balance-${today}`,
          type: 'encouragement',
          title: 'Great Balance!',
          message: 'You are cultivating a wide range of virtues this week.',
          date: today
        });
      }
    } catch (e: any) {
      console.error('Coverage/Balance notification error:', e);
    }

    // Limit to 2 for the UI stack
    return c.json(notifications.slice(0, 2));

  } catch (error: any) {
    console.error('Notifications API error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get tomorrow's preview
app.get('/api/family/tomorrow-preview', async (c) => {
  try {
    const user = requireParent(c);

    // Calculate tomorrow's date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][tomorrow.getDay()];

    // Check available days
    // Check available days (using defaults for now as weekly_time_model is deprecated)
    // const timeModel = await c.env.DB.prepare('SELECT available_days FROM weekly_time_model WHERE parent_id = ?').bind(user.id).first();
    const availableDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']; // Default

    if (!availableDays.includes(dayOfWeek)) {
      return c.json({
        date: tomorrow.toISOString().split('T')[0],
        restDay: true,
        summary: "Tomorrow is a rest day. Enjoy time together!"
      });
    }

    // Get plan
    const weekStart = getSmartWeekStart(); // Assuming same week, handling week crossover is trickier but this is MVP
    // If tomorrow is Monday, it might be a new week.
    // Simplified logic: Just fetch current plan. If tomorrow is in current plan, return it.

    const plan = await c.env.DB.prepare('SELECT plan_json FROM weekly_plans WHERE parent_id = ? AND week_start = ?')
      .bind(user.id, weekStart).first();

    if (!plan) {
      return c.json({
        date: tomorrow.toISOString().split('T')[0],
        needsPlan: true,
        summary: "You don't have a plan for tomorrow yet."
      });
    }

    const planData = JSON.parse((plan as any).plan_json);
    const tomorrowSlots = planData.slots.filter((s: any) => s.day === dayOfWeek);

    // Fetch details
    const activityIds = tomorrowSlots.map((s: any) => s.activityId);
    let activities: any[] = [];

    if (activityIds.length > 0) {
      const placeholders = activityIds.map(() => '?').join(',');
      const { results } = await c.env.DB.prepare(`
            SELECT id, title, description, primary_virtue as domain FROM formations WHERE id IN (${placeholders})
        `).bind(...activityIds).all();
      activities = results;
    }

    // Generate AI Summary (lightweight)
    let summary = `You have ${activities.length} activities planned for tomorrow.`;
    if (activities.length > 0) {
      const domains = [...new Set(activities.map((a: any) => a.domain))];
      summary += ` Focus areas include ${domains.join(', ')}.`;
    }

    return c.json({
      date: tomorrow.toISOString().split('T')[0],
      activities,
      summary
    });

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Add a child (max 5)
// Add a child (max 5)
app.post('/api/students', async (c) => {
  try {
    const user = requireParent(c);

    if (!user.household_id) {
      return c.json({ error: 'Household not set up' }, 400);
    }

    // Check limit
    const { results: existing } = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM students WHERE household_id = ?'
    ).bind(user.household_id).all();

    if ((existing[0] as any).count >= 5) {
      return c.json({ error: 'Maximum 5 children allowed. Contact support for more.' }, 400);
    }

    const body = await c.req.json();
    const { name, dateOfBirth } = body;

    const studentId = generateId('student');

    // V2 Schema: no age_in_months, no current_stage, use household_id
    await c.env.DB.prepare(
      'INSERT INTO students (id, household_id, name, date_of_birth) VALUES (?, ?, ?, ?)'
    ).bind(studentId, user.household_id, name, dateOfBirth).run();

    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ?'
    ).bind(studentId).first();

    return c.json(student, 201);
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to add child' }, 400);
  }
});

// Update a child
app.put('/api/students/:id', async (c) => {
  try {
    const user = requireParent(c);
    const studentId = c.req.param('id');
    const body = await c.req.json();

    // Verify ownership
    const existing = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND household_id = ?'
    ).bind(studentId, user.household_id).first();

    if (!existing) {
      return c.json({ error: 'Child not found' }, 404);
    }

    const { name, dateOfBirth, avatarUrl, independence_settings, pace_overrides } = body;

    await c.env.DB.prepare(
      'UPDATE students SET name = COALESCE(?, name), date_of_birth = COALESCE(?, date_of_birth), avatar_url = COALESCE(?, avatar_url), independence_settings = COALESCE(?, independence_settings), pace_overrides = COALESCE(?, pace_overrides), updated_at = datetime("now") WHERE id = ?'
    ).bind(name || null, dateOfBirth || null, avatarUrl || null, independence_settings ? JSON.stringify(independence_settings) : null, pace_overrides ? JSON.stringify(pace_overrides) : null, studentId).run();

    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ?'
    ).bind(studentId).first();

    // Parse for response
    if (student) {
      (student as any).independence_settings = JSON.parse((student as any).independence_settings || '{}');
      (student as any).pace_overrides = JSON.parse((student as any).pace_overrides || 'null');
    }

    return c.json(student);
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to update child' }, 400);
  }
});

// ============ FORMATIONS ROUTES ============

// Get formations (filtered by age and virtue)
app.get('/api/formations', async (c) => {
  // Optimization: Allow caching for curriculum data
  c.header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');

  const virtue = c.req.query('virtue'); // Previously 'domain'
  const ageMonths = c.req.query('ageMonths');
  const formationType = c.req.query('formationType');
  const context = c.req.query('context');
  const limit = c.req.query('limit') || '50';

  let query = "SELECT * FROM formations WHERE is_active = 1";
  const params: any[] = [];

  if (virtue) {
    query += ' AND primary_virtue = ?';
    params.push(virtue);
  }

  if (ageMonths) {
    const age = parseInt(ageMonths);
    query += ' AND min_age_months <= ? AND max_age_months >= ?';
    params.push(age, age);
  }

  if (formationType) {
    query += ' AND formation_type = ?';
    params.push(formationType);
  }

  if (context) {
    query += ' AND context_anchor = ?';
    params.push(context);
  }

  query += ' ORDER BY primary_virtue, min_age_months LIMIT ?';
  params.push(parseInt(limit === '50' ? '1000' : limit));

  const stmt = c.env.DB.prepare(query);
  const { results } = await stmt.bind(...params).all();

  // Safe JSON parse helper
  const safeParseJson = (value: any, fallback: any[] = []) => {
    if (!value) return fallback;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  // Parse JSON fields
  const formations = results.map((f: any) => ({
    ...f,
    materials: safeParseJson(f.materials, []),
    guide_steps: safeParseJson(f.guide_steps, []),
    learning_outcomes: safeParseJson(f.learning_outcomes, []),
    success_indicators: safeParseJson(f.success_indicators, []),
    tips: safeParseJson(f.tips, []),
    tiered_expectations: safeParseJson(f.tiered_expectations, [])
  }));

  return c.json(formations);
});

// Get single formation
app.get('/api/formations/:id', async (c) => {
  const id = c.req.param('id');
  const formation = await c.env.DB.prepare(
    'SELECT * FROM formations WHERE id = ?'
  ).bind(id).first();

  if (!formation) {
    return c.json({ error: 'Formation not found' }, 404);
  }

  // Safe JSON parse helper
  const safeParseJson = (value: any, fallback: any[] = []) => {
    if (!value) return fallback;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  return c.json({
    ...formation,
    materials: safeParseJson((formation as any).materials, []),
    guide_steps: safeParseJson((formation as any).guide_steps, []),
    learning_outcomes: safeParseJson((formation as any).learning_outcomes, []),
    success_indicators: safeParseJson((formation as any).success_indicators, []),
    tips: safeParseJson((formation as any).tips, []),
    tiered_expectations: safeParseJson((formation as any).tiered_expectations, [])
  });
});

// ============ EVIDENCES ROUTES (Legacy + New) ============

// Simple Evidence Creation (replaces activity-completions)
app.post('/api/evidences', async (c) => {
  try {
    const user = requireParent(c); // Only parents record evidence
    const { studentId, formationId, stage, note, duration_minutes, loved_it } = await c.req.json();

    const id = crypto.randomUUID();

    // Normalize stage to match V2 schema CHECK constraint (Seeding, Rooting, Fruiting)
    // Accept lowercase from frontend and capitalize first letter
    let habitStage: string | null = null;
    if (stage) {
      const stageMap: Record<string, string> = {
        'seeding': 'Seeding',
        'rooting': 'Rooting',
        'fruiting': 'Fruiting'
      };
      habitStage = stageMap[stage.toLowerCase()] || null;
    }

    // V2 schema: evidences(id, student_id, parent_id, formation_id, habit_stage, notes, duration_minutes, loved_it, captured_at)
    await c.env.DB.prepare(`
      INSERT INTO evidences (id, student_id, parent_id, formation_id, habit_stage, notes, duration_minutes, loved_it, captured_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      id,
      studentId || null,
      user.id,
      formationId,
      habitStage,
      note || null,
      duration_minutes || null,
      loved_it ? 1 : 0
    ).run();

    return c.json({ success: true, id });
  } catch (error: any) {
    console.error("Create Evidence Error:", error);
    return c.json({ error: error.message || 'Failed to record evidence' }, 400);
  }
});

// Legacy adapter for 'activity-completions' if frontend still calls it briefly
app.post('/api/activity-completions', async (c) => {
  return c.json({ error: "Endpoint deprecated. Use /api/evidences" }, 410);
});

// ============ WORK LOGS & APPRENTICESHIPS ROUTES ============

// Log Work Entry
app.post('/api/work/log', async (c) => {
  try {
    const user = requireAuth(c);
    // User can be student or parent logging on behalf
    const body = await c.req.json();
    const { apprenticeshipId, date, hours, description, photoUrl, skillsApplied } = body;

    if (!apprenticeshipId || !date || !hours || !description) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const id = generateId('work');
    const now = new Date().toISOString();

    // Verify apprenticeship exists and belongs to student (or student in household)
    // For MVP, we trust the ID if it's valid, but ideally we check ownership.

    await c.env.DB.prepare(`
      INSERT INTO work_entries (id, apprenticeship_id, date, hours, description, photo_url, skills_applied, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).bind(
      id,
      apprenticeshipId,
      date,
      hours,
      description,
      photoUrl || null,
      skillsApplied ? JSON.stringify(skillsApplied) : '[]',
      now,
      now
    ).run();

    return c.json({ success: true, id });
  } catch (e: any) {
    return c.json({ error: e.message || 'Failed to log work' }, 500);
  }
});

// Get Active Apprenticeships (for Dropdown)
app.get('/api/apprenticeships', async (c) => {
  try {
    const user = requireAuth(c);
    let studentId = user.student_id;

    let query = '';
    let params: any[] = [];

    if (user.role === 'student' && studentId) {
      query = `SELECT * FROM apprenticeships WHERE student_id = ? AND status = 'active'`;
      params = [studentId];
    } else if (user.role === 'parent' && user.household_id) {
      query = `
                SELECT a.*, s.name as student_name 
                FROM apprenticeships a
                JOIN students s ON a.student_id = s.id
                WHERE s.household_id = ? AND a.status = 'active'
             `;
      params = [user.household_id];
    } else {
      return c.json([]);
    }

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    const parsed = results.map((r: any) => ({
      ...r,
      skills_learned: JSON.parse(r.skills_learned || '[]')
    }));

    return c.json(parsed);

  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// Get Pending Work Entries (For Parents)
app.get('/api/work/pending', async (c) => {
  try {
    const user = requireParent(c);

    // Get entries for all students in household
    const query = `
      SELECT 
        w.*,
        a.title as apprenticeship_title,
        s.name as student_name,
        s.avatar_url as student_avatar
      FROM work_entries w
      JOIN apprenticeships a ON w.apprenticeship_id = a.id
      JOIN students s ON a.student_id = s.id
      WHERE s.household_id = ? AND w.status = 'pending'
      ORDER BY w.date DESC
    `;

    const { results } = await c.env.DB.prepare(query)
      .bind(user.household_id)
      .all();

    const parsed = results.map((r: any) => ({
      ...r,
      skills_applied: JSON.parse(r.skills_applied || '[]')
    }));

    return c.json(parsed);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// Approve/Reject Work Entry
app.put('/api/work/approve/:id', async (c) => {
  try {
    const user = requireParent(c);
    const id = c.req.param('id');
    const { status, supervisorNote } = await c.req.json();

    if (!['approved', 'rejected'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }

    // Verify entry belongs to household
    const entry = await c.env.DB.prepare(`
      SELECT w.id 
      FROM work_entries w
      JOIN apprenticeships a ON w.apprenticeship_id = a.id
      JOIN students s ON a.student_id = s.id
      WHERE w.id = ? AND s.household_id = ?
    `).bind(id, user.household_id).first();

    if (!entry) {
      return c.json({ error: 'Entry not found or unauthorized' }, 404);
    }

    await c.env.DB.prepare(`
      UPDATE work_entries 
      SET status = ?, supervisor_note = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(status, supervisorNote || null, id).run();

    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// ============ ANALYTICS ROUTES ============

// Get time spent this week aggregated by student
app.get('/api/analytics/time-spent', async (c) => {
  try {
    const user = requireParent(c);

    // Get all students for this household/parent
    let studentIds: string[] = [];
    if (user.household_id) {
      const { results } = await c.env.DB.prepare(
        'SELECT id FROM students WHERE household_id = ?'
      ).bind(user.household_id).all();
      studentIds = results.map((s: any) => s.id);
    }

    if (studentIds.length === 0) {
      return c.json({ students: [], totalMinutes: 0 });
    }

    // Get time spent per student in the last 7 days
    const placeholders = studentIds.map(() => '?').join(',');
    const { results: timeData } = await c.env.DB.prepare(`
      SELECT 
        e.student_id,
        s.name as student_name,
        COALESCE(SUM(e.duration_minutes), 0) as total_minutes,
        COUNT(*) as formations_completed
      FROM evidences e
      JOIN students s ON e.student_id = s.id
      WHERE e.student_id IN (${placeholders})
        AND e.captured_at > datetime('now', '-7 days')
        AND e.duration_minutes IS NOT NULL
      GROUP BY e.student_id
    `).bind(...studentIds).all();

    const totalMinutes = timeData.reduce((acc: number, row: any) => acc + (row.total_minutes || 0), 0);

    return c.json({
      students: timeData,
      totalMinutes,
      weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  } catch (error: any) {
    console.error("Time Spent Analytics Error:", error);
    return c.json({ error: error.message || 'Failed to get analytics' }, 500);
  }
});

// Helper: Get or generate daily recommendations for a student (using formations)
async function getStudentDailyRecommendations(db: D1Database, student: any) {
  const today = new Date().toISOString().split('T')[0];
  const studentId = student.id;

  // Check for existing family rhythms (formerly daily_recommendations)
  let { results: recommendations } = await db.prepare(`
    SELECT fr.*, f.* FROM family_rhythms fr
    JOIN formations f ON fr.formation_id = f.id
    WHERE fr.student_id = ? AND fr.rhythm_date = ?
    ORDER BY fr.position
  `).bind(studentId, today).all();

  // Generate recommendations if none exist
  if (recommendations.length === 0) {
    const ageMonths = (student as any).age_in_months;

    // Get one formation from each virtue that hasn't been completed recently
    const virtues = ['Wisdom', 'Stewardship', 'Love', 'Order', 'Wonder']; // New Virtues

    for (let i = 0; i < virtues.length; i++) {
      const virtue = virtues[i];
      const formation = await db.prepare(`
        SELECT * FROM formations 
        WHERE primary_virtue = ? AND min_age_months <= ? AND max_age_months >= ? AND is_active = 1
        AND id NOT IN (
          SELECT formation_id FROM evidences WHERE student_id = ? 
          AND created_at > datetime('now', '-7 days')
        )
        ORDER BY RANDOM() LIMIT 1
      `).bind(virtue, ageMonths, ageMonths, studentId).first();

      if (formation) {
        const rhythmId = generateId('rhythm');
        await db.prepare(
          'INSERT INTO family_rhythms (id, student_id, formation_id, rhythm_date, position) VALUES (?, ?, ?, ?, ?)'
        ).bind(rhythmId, studentId, (formation as any).id, today, i).run();
      }
    }

    // Fetch the newly created recommendations
    const result = await db.prepare(`
      SELECT fr.*, f.* FROM family_rhythms fr
      JOIN formations f ON fr.formation_id = f.id
      WHERE fr.student_id = ? AND fr.rhythm_date = ?
      ORDER BY fr.position
    `).bind(studentId, today).all();
    recommendations = result.results;
  }

  return recommendations;
}

// Get today's recommended formations for a student
app.get('/api/students/:studentId/today', async (c) => {
  try {
    const user = requireHouseholdMember(c);
    const studentId = c.req.param('studentId');

    // Verify ownership
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND household_id = ?'
    ).bind(studentId, user.household_id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    const recommendations = await getStudentDailyRecommendations(c.env.DB, student);

    // Parse JSON fields
    const formations = recommendations.map((r: any) => ({
      ...r,
      materials: JSON.parse(r.materials || '[]'),
      guide_steps: JSON.parse(r.guide_steps || '[]'),
      success_indicators: JSON.parse(r.success_indicators || '[]'),
      tips: JSON.parse(r.tips || '[]'),
      tiered_expectations: JSON.parse(r.tiered_expectations || '[]')
    }));

    // ========== SIBLING-AWARE RECOMMENDATIONS ==========
    // Get all siblings for this parent
    const { results: allChildren } = await c.env.DB.prepare(
      'SELECT * FROM students WHERE household_id = ? ORDER BY date_of_birth DESC' // using dob or created_at
    ).bind(user.household_id).all();

    let familyActivities: any[] = [];

    // Only compute family formations if there are multiple children
    if (allChildren.length > 1) {
      // Find age range that covers all children
      const ages = allChildren.map((c: any) => c.age_in_months);
      const oldestAge = Math.max(...ages);
      const youngestAge = Math.min(...ages);

      // Find formations where the age range overlaps with ALL children
      const { results: sharedFormations } = await c.env.DB.prepare(`
        SELECT * FROM formations 
        WHERE min_age_months <= ? AND max_age_months >= ? AND is_active = 1
        ORDER BY RANDOM() LIMIT 3
      `).bind(youngestAge, oldestAge).all();

      // Build family formation recommendations with variations
      familyActivities = sharedFormations.map((formation: any) => {
        const variations: Record<string, string> = {};

        allChildren.forEach((child: any) => {
          const childAge = child.age_in_months;
          const formationMidpoint = (formation.min_age_months + formation.max_age_months) / 2;

          if (childAge < formationMidpoint - 6) {
            variations[child.id] = 'easier';
          } else if (childAge > formationMidpoint + 6) {
            variations[child.id] = 'harder';
          } else {
            variations[child.id] = 'standard';
          }
        });

        return {
          formation: {
            ...formation,
            materials: JSON.parse(formation.materials || '[]'),
            guide_steps: JSON.parse(formation.guide_steps || '[]'),
            success_indicators: JSON.parse(formation.success_indicators || '[]'),
            tips: JSON.parse(formation.tips || '[]'),
          },
          suitableFor: allChildren.map((c: any) => c.id),
          variations,
        };
      });
    }

    return c.json({ student, formations, familyActivities });
  } catch (error: any) {
    console.error('Student today error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// Helper function to fetch daily practices
async function getDailyPractices(db: D1Database) {
  const { results: dailyPractices } = await db.prepare(`
    SELECT * FROM formations 
    WHERE formation_type = 'daily_practice' AND is_active = 1
    ORDER BY RANDOM() LIMIT 3
  `).all();

  return dailyPractices.map((formation: any) => ({
    ...formation,
    materials: JSON.parse(formation.materials || '[]'),
    guide_steps: JSON.parse(formation.guide_steps || '[]'),
    success_indicators: JSON.parse(formation.success_indicators || '[]'),
    tips: JSON.parse(formation.tips || '[]'),
  }));
}

// Get family dashboard data - UNIFIED PLANNER VERSION
app.get('/api/family/today', async (c) => {
  try {
    const user = requireHouseholdMember(c);

    // Get all children for the household
    let children: any[] = [];
    if (user.household_id) {
      children = (await c.env.DB.prepare(
        'SELECT * FROM students WHERE household_id = ? ORDER BY date_of_birth DESC'
      ).bind(user.household_id).all()).results || [];
    }

    if (children.length === 0) {
      return c.json({
        date: new Date().toISOString().split('T')[0],
        children: [],
        familySessions: [],
        materials: [],
        totalDuration: 0,
        coreKitCoverage: 0
      });
    }

    // 1. Get today's day of week
    const today = new Date();
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()];

    // 2. Check if today is an available day
    // 2. Check if today is an available day
    // Get available days from family_preferences.overrides_json or use defaults
    const prefs = await c.env.DB.prepare('SELECT overrides_json FROM family_preferences WHERE parent_id = ?')
      .bind(user.id).first();
    const overrides = prefs ? JSON.parse((prefs as any).overrides_json || '{}') : {};
    const availableDays = overrides.available_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    // 3. If not an available day, return REST DAY response
    if (!availableDays.includes(dayOfWeek)) {
      const dailyPractices = await getDailyPractices(c.env.DB);

      return c.json({
        date: new Date().toISOString().split('T')[0],
        children,
        restDay: true,
        message: "Today is a rest day! Here are some gentle practices you can do if you'd like.",
        familySessions: [],
        dailyPractices,
        materials: [],
        totalDuration: 0,
        coreKitCoverage: 0
      });
    }

    // 4. Get this week's plan
    const weekStart = getSmartWeekStart();
    const plan = await c.env.DB.prepare('SELECT plan_json FROM weekly_plans WHERE parent_id = ? AND week_start = ?')
      .bind(user.id, weekStart).first();

    // 5. If no plan exists, prompt to generate
    if (!plan) {
      const dailyPractices = await getDailyPractices(c.env.DB);

      return c.json({
        date: new Date().toISOString().split('T')[0],
        children,
        needsPlan: true,
        message: "Let's plan your week! Generate a schedule to get personalized activities.",
        familySessions: [],
        dailyPractices,
        materials: [],
        totalDuration: 0,
        coreKitCoverage: 0
      });
    }

    // 6. Return today's activities from the plan
    const planData = JSON.parse((plan as any).plan_json);
    const todaysSlots = planData.slots.filter((s: any) => s.day === dayOfWeek);

    // Hydrate formations
    const activityIds = todaysSlots.map((s: any) => s.activityId); // Retain 'activityId' in slots for back-compat
    let familySessions: any[] = [];
    let materialsList: any[] = [];

    if (activityIds.length > 0) {
      const placeholders = activityIds.map(() => '?').join(',');
      const { results: formations } = await c.env.DB.prepare(`
            SELECT * FROM formations WHERE id IN (${placeholders})
        `).bind(...activityIds).all();

      const formationMap = new Map(formations.map((f: any) => [f.id, f]));

      familySessions = todaysSlots.map((slot: any) => {
        const formation: any = formationMap.get(slot.activityId);
        if (!formation) return null;

        const tiers = JSON.parse(formation.tiered_expectations || '[]');
        const childTiers = children.map((child: any) => {
          const age = child.age_in_months;
          let tier = tiers.find((t: any) => age >= t.age_min && age <= t.age_max);
          if (!tier) {
            if (age < tiers[0]?.age_min) tier = tiers[0];
            else if (age > tiers[tiers.length - 1]?.age_max) tier = tiers[tiers.length - 1];
          }
          return {
            childId: child.id,
            childName: child.name,
            tier: tier?.tier || 'Standard',
            expectation: tier?.expectation || 'Participate with support',
            childAge: age
          };
        });

        // Map Virtue (formerly Domain)
        const virtue = formation.primary_virtue;

        return {
          formation: {
            ...formation,
            materials: JSON.parse(formation.materials || '[]'),
            guide_steps: JSON.parse(formation.guide_steps || '[]'),
            success_indicators: JSON.parse(formation.success_indicators || '[]'),
            tips: JSON.parse(formation.tips || '[]'),
          },
          childTiers,
          messLevel: formation.mess_level,
          prepMinutes: 5, // Default or add to schema if needed
          materialsAvailable: true,
          reasoning: slot.reasoning || `Planned for ${slot.timeSlot}`,
          timeSlot: slot.timeSlot,
          day: slot.day
        };
      }).filter(Boolean);

      // Collect materials
      const neededMaterials = new Set<string>();
      familySessions.forEach((session: any) => {
        session.formation.materials.forEach((m: string) => neededMaterials.add(m));
      });

      if (neededMaterials.size > 0) {
        // family_materials table is deprecated/removed in v2 schema
        // Returning 'unknown' status for all materials for now
        neededMaterials.forEach(m => {
          materialsList.push({
            name: m,
            status: 'unknown'
          });
        });
      }
    }

    // Compute metrics
    const totalDuration = familySessions.reduce((acc: number, s: any) => acc + (s.formation.duration_minutes || 15), 0);
    const coreKitCount = familySessions.filter((s: any) => s.formation.uses_core_kit).length;
    const coreKitCoverage = familySessions.length > 0 ? (coreKitCount / familySessions.length) * 100 : 0;

    return c.json({
      date: new Date().toISOString().split('T')[0],
      children,
      familySessions,
      materials: materialsList,
      totalDuration,
      coreKitCoverage
    });
  } catch (error: any) {
    console.error('Family today error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// Get activities for a specific date (for day navigation on dashboard)
app.get('/api/family/day/:date', async (c) => {
  try {
    const user = requireAuth(c);
    const dateParam = c.req.param('date'); // yyyy-MM-dd format

    // Validate date format
    const targetDate = new Date(dateParam);
    if (isNaN(targetDate.getTime())) {
      return c.json({ error: 'Invalid date format. Use yyyy-MM-dd' }, 400);
    }

    // Get all children
    const { results: children } = await c.env.DB.prepare(
      'SELECT * FROM students WHERE household_id = ? ORDER BY date_of_birth DESC'
    ).bind(user.household_id).all();

    if (children.length === 0) {
      return c.json({
        date: dateParam,
        children: [],
        familySessions: [],
        materials: [],
        totalDuration: 0,
        coreKitCoverage: 0
      });
    }

    // Get day of week for the target date
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][targetDate.getDay()];

    // Check if this is an available day
    const timeModel = await c.env.DB.prepare('SELECT available_days FROM weekly_time_model WHERE parent_id = ?')
      .bind(user.id).first();
    const availableDays = JSON.parse((timeModel as any)?.available_days || '["Mon","Tue","Wed","Thu","Fri"]');

    if (!availableDays.includes(dayOfWeek)) {
      return c.json({
        date: dateParam,
        children,
        restDay: true,
        message: "This is a rest day!",
        familySessions: [],
        materials: [],
        totalDuration: 0,
        coreKitCoverage: 0
      });
    }

    // Get the week start for the target date
    const weekStart = getSmartWeekStart(dateParam);
    const plan = await c.env.DB.prepare('SELECT plan_json FROM weekly_plans WHERE parent_id = ? AND week_start = ?')
      .bind(user.id, weekStart).first();

    if (!plan) {
      return c.json({
        date: dateParam,
        children,
        needsPlan: true,
        message: "No plan exists for this week.",
        familySessions: [],
        materials: [],
        totalDuration: 0,
        coreKitCoverage: 0
      });
    }

    // Get activities for the target day
    const planData = JSON.parse((plan as any).plan_json);
    const daySlots = planData.slots.filter((s: any) => s.day === dayOfWeek);

    const activityIds = daySlots.map((s: any) => s.activityId);
    let familySessions: any[] = [];

    if (activityIds.length > 0) {
      const placeholders = activityIds.map(() => '?').join(',');
      const { results: formations } = await c.env.DB.prepare(`
        SELECT * FROM formations WHERE id IN (${placeholders})
      `).bind(...activityIds).all();

      const formationMap = new Map(formations.map((f: any) => [f.id, f]));

      familySessions = daySlots.map((slot: any) => {
        const formation: any = formationMap.get(slot.activityId);
        if (!formation) return null;

        const tiers = JSON.parse(formation.tiered_expectations || '[]');
        const childTiers = children.map((child: any) => {
          const age = child.age_in_months;
          let tier = tiers.find((t: any) => age >= t.age_min && age <= t.age_max);
          if (!tier) {
            if (age < tiers[0]?.age_min) tier = tiers[0];
            else if (age > tiers[tiers.length - 1]?.age_max) tier = tiers[tiers.length - 1];
          }
          return {
            childId: child.id,
            childName: child.name,
            tier: tier?.tier || 'Standard',
            expectation: tier?.expectation || 'Participate with support',
            childAge: age
          };
        });

        return {
          formation: {
            ...formation,
            materials: JSON.parse(formation.materials || '[]'),
            guide_steps: JSON.parse(formation.guide_steps || '[]'),
            success_indicators: JSON.parse(formation.success_indicators || '[]'),
            tips: JSON.parse(formation.tips || '[]'),
          },
          childTiers,
          reasoning: slot.reasoning || `Planned for ${slot.timeSlot}`,
          timeSlot: slot.timeSlot,
          day: slot.day
        };
      }).filter(Boolean);
    }

    // Get completions for this day (Using evidences table)
    const { results: completions } = await c.env.DB.prepare(`
      SELECT formation_id FROM evidences 
      WHERE student_id IN (SELECT id FROM students WHERE household_id = ?) 
      AND date(created_at) = ?
    `).bind(user.household_id, dateParam).all();

    const completedIds = new Set(completions.map((c: any) => c.formation_id));

    // Mark completed sessions
    familySessions = familySessions.map((session: any) => ({
      ...session,
      isCompleted: completedIds.has(session.formation.id)
    }));

    const totalDuration = familySessions.reduce((acc: number, s: any) => acc + (s.formation.duration_minutes || 15), 0);

    return c.json({
      date: dateParam,
      children,
      familySessions,
      materials: [],
      totalDuration,
      coreKitCoverage: 0
    });
  } catch (error: any) {
    console.error('Family day error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// Get week summary - completion stats for each day (for WeekStrip component)
app.get('/api/family/week-summary', async (c) => {
  try {
    const user = requireAuth(c);
    const queryParam = c.req.query('weekStart');
    let weekStartParam = queryParam || getSmartWeekStart();

    // Validate weekStartParam
    if (!weekStartParam || isNaN(new Date(weekStartParam).getTime())) {
      weekStartParam = getSmartWeekStart();
    }

    // Get the weekly plan
    const plan = await c.env.DB.prepare('SELECT plan_json FROM weekly_plans WHERE parent_id = ? AND week_start = ?')
      .bind(user.id, weekStartParam).first();

    if (!plan) {
      return c.json({ days: {} });
    }

    let planData;
    try {
      planData = JSON.parse((plan as any).plan_json);
    } catch (e) {
      console.error('Failed to parse plan_json', e);
      return c.json({ days: {} });
    }

    const slots = Array.isArray(planData?.slots) ? planData.slots : [];

    // Group slots by day
    const daySlots: Record<string, any[]> = {};
    for (const slot of slots) {
      if (!daySlots[slot.day]) daySlots[slot.day] = [];
      daySlots[slot.day].push(slot);
    }

    // Get all completions for this week
    const weekEnd = new Date(weekStartParam);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    let completions: any[] = [];
    try {
      const result = await c.env.DB.prepare(`
          SELECT formation_id, date(created_at) as completed_date
          FROM evidences
          WHERE student_id IN (SELECT id FROM students WHERE household_id = ?)
          AND date(created_at) >= ? AND date(created_at) <= ?
        `).bind(user.household_id, weekStartParam, weekEndStr).all();
      completions = result.results || [];
    } catch (dbError) {
      console.error('Failed to fetch completions', dbError);
      // Continue with empty completions to show the plan at least
    }

    const completedByDay: Record<string, Set<string>> = {};
    for (const comp of completions) {
      // Safety check for date parsing
      if (!comp.completed_date) continue;

      const compDate = new Date(comp.completed_date);
      if (isNaN(compDate.getTime())) continue;

      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][compDate.getDay()];
      if (!completedByDay[dayName]) completedByDay[dayName] = new Set();
      completedByDay[dayName].add(comp.formation_id);
    }

    // Build response
    const days: Record<string, { completed: number; total: number; domains: string[] }> = {};
    const weekStartDate = new Date(weekStartParam);

    for (let i = 0; i < 5; i++) {
      const dayDate = new Date(weekStartDate);
      dayDate.setDate(weekStartDate.getDate() + i);
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayDate.getDay()];
      const dateStr = dayDate.toISOString().split('T')[0];

      const slotsForDay = daySlots[dayName] || [];
      const completedSet = completedByDay[dayName] || new Set();

      const completedCount = slotsForDay.filter((s: any) => completedSet.has(s.activityId)).length;
      const virtues = [...new Set(slotsForDay.map((s: any) => s.virtue || 'Wisdom'))]; // Fallback if virtue not in slot yet

      days[dateStr] = {
        completed: completedCount,
        total: slotsForDay.length,
        domains: virtues // Keeping key as 'domains' for frontend compatibility for now, but sending virtues
      };
    }

    return c.json({ days });
  } catch (error: any) {
    console.error('Week summary error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// Persist an activity swap to the weekly plan
app.post('/api/family/swap-persist', async (c) => {
  try {
    const user = requireAuth(c);
    const { oldActivityId, newActivityId, day, weekStart } = await c.req.json();

    if (!newActivityId || !day || !weekStart) {
      return c.json({ error: 'newActivityId, day, and weekStart are required' }, 400);
    }

    // Get the current plan
    const plan = await c.env.DB.prepare('SELECT id, plan_json FROM weekly_plans WHERE parent_id = ? AND week_start = ?')
      .bind(user.id, weekStart).first();

    if (!plan) {
      return c.json({ error: 'No plan found for this week' }, 404);
    }

    const planData = JSON.parse((plan as any).plan_json);

    // Find and update the slot
    let updated = false;
    for (const slot of planData.slots) {
      if (slot.day === day && slot.activityId === oldActivityId) {
        // Fetch new formation details
        const newFormation = await c.env.DB.prepare('SELECT * FROM formations WHERE id = ?')
          .bind(newActivityId).first();

        if (!newFormation) {
          return c.json({ error: 'New formation not found' }, 404);
        }

        slot.activityId = newActivityId;
        slot.activityTitle = (newFormation as any).title; // Kept as activityTitle for compatibility if needed, or change to title
        slot.virtue = (newFormation as any).primary_virtue;
        slot.duration = (newFormation as any).duration_minutes;
        slot.reasoning = `Manually swapped by parent.`;
        updated = true;
        break;
      }
    }

    if (!updated) {
      return c.json({ error: 'Could not find the activity to swap' }, 404);
    }

    // Save the updated plan
    await c.env.DB.prepare('UPDATE weekly_plans SET plan_json = ?, updated_at = datetime("now") WHERE id = ?')
      .bind(JSON.stringify(planData), (plan as any).id).run();

    // Get the new formation for response
    const newFormation = await c.env.DB.prepare('SELECT * FROM formations WHERE id = ?')
      .bind(newActivityId).first();

    return c.json({
      success: true,
      newFormation: {
        ...newFormation,
        materials: JSON.parse((newFormation as any)?.materials || '[]'),
        guide_steps: JSON.parse((newFormation as any)?.guide_steps || '[]'),
        success_indicators: JSON.parse((newFormation as any)?.success_indicators || '[]'),
        tips: JSON.parse((newFormation as any)?.tips || '[]'),
      }
    });
  } catch (error: any) {
    console.error('Swap persist error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// ============ FORMATION PREFERENCES ROUTES ============

// Get formation preferences (defaults to all enabled if not set)
app.get('/api/family/preferences', async (c) => {
  try {
    const user = requireAuth(c);

    let prefs = await c.env.DB.prepare(
      'SELECT * FROM family_preferences WHERE parent_id = ?'
    ).bind(user.id).first();

    if (!prefs) {
      // Return defaults if no preferences set
      return c.json({
        activitiesEnabled: true,
        readingEnabled: true,
        liturgyEnabled: true,
        learningFocus: 'balanced',
        focusDomains: []
      });
    }

    return c.json({
      activitiesEnabled: !!(prefs as any).activities_enabled,
      readingEnabled: !!(prefs as any).reading_enabled,
      liturgyEnabled: !!(prefs as any).liturgy_enabled,
      learningFocus: (prefs as any).learning_focus || 'balanced',
      focusDomains: JSON.parse((prefs as any).focus_domains || '[]')
    });
  } catch (error: any) {
    console.error('Formation preferences get error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// Update formation preferences
app.post('/api/family/preferences', async (c) => {
  try {
    const user = requireAuth(c);
    const body = await c.req.json();

    const { activitiesEnabled, readingEnabled, liturgyEnabled, learningFocus, focusDomains } = body;

    // Upsert preferences
    // For upsert to work correctly with COALESCE on partial updates, we must pass NULL for undefined fields
    // Defaulting to 1 in the bind params overwrites existing preferences during partial updates.

    // Check if record exists first to determine defaults for NEW records
    const existing = await c.env.DB.prepare('SELECT 1 FROM family_preferences WHERE parent_id = ?').bind(user.id).first();
    const isNew = !existing;

    // Defaults only apply if it's a NEW record and the field is missing
    const getVal = (val: any) => {
      if (val !== undefined) return val ? 1 : 0;
      return isNew ? 1 : null; // Default to 1 for new, null (preserve) for existing
    };

    await c.env.DB.prepare(`
      INSERT INTO family_preferences (id, parent_id, activities_enabled, reading_enabled, liturgy_enabled, learning_focus, focus_domains, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(parent_id) DO UPDATE SET 
        activities_enabled = COALESCE(excluded.activities_enabled, activities_enabled),
        reading_enabled = COALESCE(excluded.reading_enabled, reading_enabled),
        liturgy_enabled = COALESCE(excluded.liturgy_enabled, liturgy_enabled),
        learning_focus = COALESCE(excluded.learning_focus, learning_focus),
        focus_domains = COALESCE(excluded.focus_domains, focus_domains),
        updated_at = datetime('now')
    `).bind(
      generateId('fpref'),
      user.id,
      getVal(activitiesEnabled),
      getVal(readingEnabled),
      getVal(liturgyEnabled),
      learningFocus || (isNew ? 'balanced' : null),
      focusDomains ? JSON.stringify(focusDomains) : null
    ).run();

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Formation preferences update error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// ============ PACE SETTINGS ROUTES (Phase 4) ============

// Get pace settings for a specific child
app.get('/api/family/pace/:studentId', async (c) => {
  try {
    const user = requireAuth(c);
    const studentId = c.req.param('studentId');

    // Verify ownership
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND household_id = ?'
    ).bind(studentId, user.household_id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    const { results } = await c.env.DB.prepare(
      'SELECT * FROM pace_settings WHERE student_id = ? AND parent_id = ?'
    ).bind(studentId, user.id).all();

    return c.json(results);
  } catch (error: any) {
    console.error('Pace settings get error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// Create or update a pace setting
app.post('/api/family/pace', async (c) => {
  try {
    const user = requireAuth(c);
    const { studentId, domain, stageOverride, tierOverride, reason } = await c.req.json();

    if (!studentId || !domain) {
      return c.json({ error: 'studentId and domain are required' }, 400);
    }

    // Verify ownership
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND household_id = ?'
    ).bind(studentId, user.household_id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    // Upsert pace setting
    await c.env.DB.prepare(`
      INSERT INTO pace_settings (id, parent_id, student_id, domain, stage_override, tier_override, reason, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(student_id, domain) DO UPDATE SET
        stage_override = excluded.stage_override,
        tier_override = excluded.tier_override,
        reason = excluded.reason,
        updated_at = datetime('now')
    `).bind(
      generateId('pace'),
      user.id,
      studentId,
      domain,
      stageOverride || null,
      tierOverride || null,
      reason || null
    ).run();

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Pace settings update error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// ============ PASSION SIGNALS ROUTES (Phase 4) ============

// Record a passion signal (when child "loved" an activity)
app.post('/api/passion-signals', async (c) => {
  try {
    const user = requireAuth(c);
    const { studentId, domain, activityId, notes } = await c.req.json();

    if (!studentId || !domain) {
      return c.json({ error: 'studentId and domain are required' }, 400);
    }

    // Verify ownership
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND household_id = ?'
    ).bind(studentId, user.household_id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    await c.env.DB.prepare(`
      INSERT INTO passion_signals (id, student_id, parent_id, domain, signal_type, intensity, notes, created_at)
      VALUES (?, ?, ?, ?, 'loved_activity', 5, ?, datetime('now'))
    `).bind(
      generateId('passion'),
      studentId,
      user.id,
      domain,
      notes || `Loved activity ${activityId || ''}`
    ).run();

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Passion signal error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// Get all hymns
app.get('/api/hymns', async (c) => {
  try {
    // Disable cache to ensure new audio_url field is fetched
    c.header('Cache-Control', 'no-store, max-age=0');
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM formations WHERE cluster_tag = 'hymn' AND formation_type = 'liturgy' AND is_active = 1 ORDER BY sequence_number"
    ).all();
    return c.json(results);
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to fetch hymns' }, 500);
  }
});

// Get all catechism items
app.get('/api/catechism', async (c) => {
  try {
    c.header('Cache-Control', 'public, max-age=3600');
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM formations WHERE cluster_tag = 'catechism' AND formation_type = 'liturgy' AND is_active = 1 ORDER BY sequence_number"
    ).all();
    return c.json(results);
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to fetch catechism' }, 500);
  }
});

// Helper: Get or create liturgy progress
async function getOrCreateLiturgyProgress(db: D1Database, userId: string): Promise<any> {
  // Try to fetch existing progress
  const progress = await db.prepare(
    'SELECT * FROM family_liturgy_progress WHERE parent_id = ?'
  ).bind(userId).first();

  if (progress) return progress;

  // If missing, migrate from family_preferences if available
  const prefs = await db.prepare(
    'SELECT current_catechism_week, current_hymn_week, current_scripture_week FROM family_preferences WHERE parent_id = ?'
  ).bind(userId).first();

  const id = generateId('litprog');
  const now = new Date().toISOString();

  // Use values from prefs or defaults
  const catechismPos = (prefs as any)?.current_catechism_week || 1;
  const hymnPos = (prefs as any)?.current_hymn_week || 1;
  const scripturePos = (prefs as any)?.current_scripture_week || 1;

  // Determine catechism source based on oldest child age
  let catechismSource = 'prove_it'; // Default

  try {
     const { results: children } = await db.prepare(
       'SELECT date_of_birth FROM students WHERE household_id = (SELECT household_id FROM users WHERE id = ?)'
     ).bind(userId).all();

     if (children && children.length > 0) {
        const ages = children.map((c: any) => {
            const dob = new Date(c.date_of_birth);
            const nowTime = new Date();
            return (nowTime.getFullYear() - dob.getFullYear()) * 12 + (nowTime.getMonth() - dob.getMonth());
        });
        const oldestAge = Math.max(...ages);
        if (oldestAge >= 120) { // 10 years
            catechismSource = 'westminster_shorter';
        }
     }
  } catch (e) {
    console.warn('Failed to determine catechism source from children ages', e);
  }

  await db.prepare(`
    INSERT INTO family_liturgy_progress (id, parent_id, catechism_position, catechism_source, hymn_position, scripture_position, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, userId, catechismPos, catechismSource, hymnPos, scripturePos, now, now).run();

  return {
    id,
    parent_id: userId,
    catechism_position: catechismPos,
    catechism_source: catechismSource,
    hymn_position: hymnPos,
    scripture_position: scripturePos,
    created_at: now,
    updated_at: now
  };
}

// Get unified daily rhythm - composes activities, books, and liturgy
app.get('/api/family/daily-rhythm', async (c) => {
  try {
    const user = requireAuth(c);
    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];

    // Get formation preferences
    let prefs = await c.env.DB.prepare(
      'SELECT * FROM family_preferences WHERE parent_id = ?'
    ).bind(user.id).first() as any;

    const activitiesEnabled = prefs ? !!prefs.activities_enabled : true;
    const readingEnabled = prefs ? !!prefs.reading_enabled : true;
    const liturgyEnabled = prefs ? !!prefs.liturgy_enabled : true;

    // Get children
    const { results: children } = await c.env.DB.prepare(
      'SELECT * FROM students WHERE household_id = ? ORDER BY date_of_birth DESC'
    ).bind(user.household_id).all();

    const items: any[] = [];
    const completions: Record<string, boolean> = {};

    // 1. LITURGY (if enabled)
    if (liturgyEnabled) {
      // Get progress
      const progress = await getOrCreateLiturgyProgress(c.env.DB, user.id);

      if (progress) {
        // Check liturgy completions for today
        // Note: We check 'evidences' now for unified tracking, but legacy 'liturgy_completions' might still be used?
        // The endpoint /api/liturgy/complete writes to 'evidences' (lines 4335).
        // So we should check 'evidences'.
        // Wait, line 2736 below uses 'evidences' for activity completions.
        // Let's use 'evidences' for consistency with the new system.

        const { results: liturgyCompletions } = await c.env.DB.prepare(
          'SELECT formation_id FROM evidences WHERE parent_id = ? AND date(captured_at) = ?'
        ).bind(user.id, today).all();

        const completedIds = new Set(liturgyCompletions.map((lc: any) => lc.formation_id));

        // 1. Catechism
        const catechism = await c.env.DB.prepare(`
          SELECT * FROM formations 
          WHERE formation_type = 'liturgy' AND cluster_tag = 'catechism'
          AND source = ? AND sequence_number = ? AND is_active = 1
        `).bind(progress.catechism_source, progress.catechism_position).first();

        if (catechism) {
            const isCompleted = completedIds.has((catechism as any).id);
            items.push({
                id: (catechism as any).id,
                timeSlot: '08:00',
                title: 'Catechism',
                description: (catechism as any).title,
                type: 'liturgy',
                status: isCompleted ? 'completed' : 'upcoming',
                data: { ...catechism, itemType: 'catechism' }
            });
            completions[(catechism as any).id] = isCompleted;
        }

        // 2. Hymn
        // Note: Hymns might filter by source if needed, but schema usually has 'classic_hymns' or similar
        // We'll assume cluster_tag='hymn' is enough or add source check if needed.
        // Usually source='classic_hymns' or 'reformed_hymns'.
        // Let's just use cluster_tag and sequence_number for now as hymns are unified.
        const hymn = await c.env.DB.prepare(`
          SELECT * FROM formations
          WHERE formation_type = 'liturgy' AND cluster_tag = 'hymn'
          AND sequence_number = ? AND is_active = 1
        `).bind(progress.hymn_position).first();

        if (hymn) {
            const isCompleted = completedIds.has((hymn as any).id);
            items.push({
                id: (hymn as any).id,
                timeSlot: '08:05',
                title: 'Hymn',
                description: (hymn as any).title,
                type: 'liturgy',
                status: isCompleted ? 'completed' : 'upcoming',
                data: { ...hymn, itemType: 'hymn' }
            });
            completions[(hymn as any).id] = isCompleted;
        }

        // 3. Scripture
        const scripture = await c.env.DB.prepare(`
          SELECT * FROM formations
          WHERE formation_type = 'liturgy' AND cluster_tag = 'scripture'
          AND sequence_number = ? AND is_active = 1
        `).bind(progress.scripture_position).first();

        if (scripture) {
            const isCompleted = completedIds.has((scripture as any).id);
            items.push({
                id: (scripture as any).id,
                timeSlot: '08:10',
                title: 'Scripture',
                description: (scripture as any).title,
                type: 'liturgy',
                status: isCompleted ? 'completed' : 'upcoming',
                data: { ...scripture, itemType: 'scripture' }
            });
            completions[(scripture as any).id] = isCompleted;
        }
      }
    }

    // 2. ACTIVITIES (if enabled)
    if (activitiesEnabled && children.length > 0) {
      // Check time model for rest days
      // Check time model for rest days
      const prefs = await c.env.DB.prepare('SELECT overrides_json FROM family_preferences WHERE parent_id = ?')
        .bind(user.id).first();
      const overrides = prefs ? JSON.parse((prefs as any).overrides_json || '{}') : {};
      const availableDays = overrides.available_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

      if (availableDays.includes(dayOfWeek)) {
        // Get weekly plan
        const weekStart = getSmartWeekStart();
        const plan = await c.env.DB.prepare('SELECT plan_json FROM weekly_plans WHERE parent_id = ? AND week_start = ?')
          .bind(user.id, weekStart).first();

        if (plan) {
          const planData = JSON.parse((plan as any).plan_json);
          const todaysSlots = planData.slots.filter((s: any) => s.day === dayOfWeek);

          // Get activity completions for today (using unified evidences)
          const { results: activityCompletions } = await c.env.DB.prepare(`
            SELECT formation_id as activity_id FROM evidences 
            WHERE parent_id = ? AND date(captured_at) = ?
          `).bind(user.id, today).all();

          const completedActivityIds = new Set(activityCompletions.map((ac: any) => ac.activity_id));

          // Hydrate activities
          const activityIds = todaysSlots.map((s: any) => s.activityId);
          if (activityIds.length > 0) {
            const placeholders = activityIds.map(() => '?').join(',');
            const { results: activities } = await c.env.DB.prepare(`
              SELECT * FROM formations WHERE id IN (${placeholders})
            `).bind(...activityIds).all();

            const activityMap = new Map(activities.map((a: any) => [a.id, a]));

            todaysSlots.forEach((slot: any, index: number) => {
              const activity = activityMap.get(slot.activityId) as any;
              if (!activity) return;

              const isCompleted = completedActivityIds.has(activity.id);
              const itemId = `activity-${index}`;

              // Map timeSlot to realistic time
              let time = '09:00';
              if (slot.timeSlot === 'afternoon') time = '14:00';
              if (index > 0 && time === '09:00') time = `${9 + index}:00`.padStart(5, '0');

              items.push({
                id: itemId,
                timeSlot: time,
                title: activity.title,
                description: activity.description,
                type: 'activity',
                status: isCompleted ? 'completed' : 'upcoming',
                data: {
                  ...activity,
                  materials: JSON.parse(activity.materials || '[]'),
                  instructions: JSON.parse(activity.instructions || '[]'),
                  learning_outcomes: JSON.parse(activity.learning_outcomes || '[]'),
                }
              });

              completions[itemId] = isCompleted;
            });
          }
        }
      }
    }

    // 3. READING (if enabled)
    if (readingEnabled && children.length > 0) {
      // Get youngest child for age-appropriate book selection
      const youngestChild = children.reduce((youngest: any, child: any) =>
        child.age_in_months < youngest.age_in_months ? child : youngest
        , children[0]);

      // Check if a book was read today
      const todaysReading = await c.env.DB.prepare(`
        SELECT * FROM reading_sessions 
        WHERE parent_id = ? AND date(completed_at) = ?
        LIMIT 1
      `).bind(user.id, today).first();

      const readingCompleted = !!todaysReading;

      items.push({
        id: 'book-reading',
        timeSlot: '11:00',
        title: 'Read Aloud Time',
        description: 'Daily family reading.',
        type: 'book',
        status: readingCompleted ? 'completed' : 'upcoming',
        data: {
          childAgeMonths: (youngestChild as any).age_in_months,
          // Note: Actual book recommendation is fetched separately by frontend
          // This endpoint just indicates the rhythm slot
        }
      });

      completions['book-reading'] = readingCompleted;
    }

    // Sort by time
    items.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

    return c.json({
      date: today,
      items,
      completions,
      preferences: {
        activitiesEnabled,
        readingEnabled,
        liturgyEnabled
      }
    });
  } catch (error: any) {
    console.error('Daily rhythm error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// ============ FAMILY MATERIALS ROUTES ============

// Get family materials
app.get('/api/family/materials', async (c) => {
  try {
    const user = requireAuth(c);
    // family_materials is deprecated, returning empty array
    const results: any[] = [];
    /*
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM family_materials WHERE parent_id = ? ORDER BY material_name'
    ).bind(user.id).all();
    */

    // Normalize field names: material_name → name for frontend consistency
    const normalized = results.map((row: any) => ({
      name: row.material_name,
      status: row.status
    }));

    return c.json(normalized);
  } catch (error: any) {
    console.error('Family materials error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// Update family materials
app.put('/api/family/materials', async (c) => {
  try {
    const user = requireAuth(c);
    const body = await c.req.json();
    const { materials } = body; // Array of { name, status }

    if (!Array.isArray(materials)) {
      return c.json({ error: 'Materials must be an array' }, 400);
    }

    // Validate each material entry
    const validStatuses = ['have', 'willing_to_buy', 'not_interested', 'unknown'];
    const invalidEntries = materials.filter((m: any) =>
      !m.name || typeof m.name !== 'string' || !validStatuses.includes(m.status)
    );

    if (invalidEntries.length > 0) {
      return c.json({
        error: 'Invalid material entries found. Each must have a valid name and status.',
        details: `Found ${invalidEntries.length} invalid entries`
      }, 400);
    }

    const stmt = c.env.DB.prepare(`
      INSERT INTO family_materials (id, parent_id, material_name, status, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(parent_id, material_name) 
      DO UPDATE SET status = excluded.status, updated_at = datetime('now')
    `);

    const batch = materials.map((m: any) =>
      stmt.bind(generateId('mat'), user.id, m.name, m.status)
    );

    await c.env.DB.batch(batch);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Materials update error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// Swap activity - get an alternative activity
app.post('/api/family/swap', async (c) => {
  try {
    const user = requireAuth(c);
    const body = await c.req.json();
    const { activityId } = body;

    if (!activityId) {
      return c.json({ error: 'activityId is required' }, 400);
    }

    // Get the current activity to understand criteria
    const currentActivity = await c.env.DB.prepare(
      'SELECT *, primary_virtue as domain FROM formations WHERE id = ?'
    ).bind(activityId).first();

    if (!currentActivity) {
      return c.json({ error: 'Activity not found' }, 404);
    }

    // Get children for age range
    const { results: children } = await c.env.DB.prepare(
      'SELECT * FROM students WHERE household_id = ? ORDER BY date_of_birth DESC'
    ).bind(user.household_id).all();

    if (children.length === 0) {
      return c.json({ error: 'No children registered' }, 400);
    }

    const ages = children.map((c: any) => c.age_in_months);
    const youngestAge = Math.min(...ages);
    const oldestAge = Math.max(...ages);

    // Get parent's materials
    const { results: materialPrefs } = await c.env.DB.prepare(
      'SELECT material_name, status FROM family_materials WHERE parent_id = ?'
    ).bind(user.id).all();

    const haveMaterials = new Set(
      materialPrefs
        .filter((m: any) => m.status === 'have' || m.status === 'willing_to_buy')
        .map((m: any) => m.material_name.toLowerCase())
    );

    // Find alternative activity with same criteria but different ID
    const { results: alternatives } = await c.env.DB.prepare(`
      SELECT *, primary_virtue as domain FROM formations
      WHERE formation_type = 'family_session'
        AND id != ?
        AND min_age_months <= ? 
        AND max_age_months >= ?
        AND tiered_expectations IS NOT NULL
        AND is_active = 1
        AND (is_archived = 0 OR is_archived IS NULL)
        AND (content_status != 'blacklisted' OR content_status IS NULL)
      ORDER BY uses_core_kit DESC, RANDOM()
      LIMIT 5
    `).bind(activityId, youngestAge, oldestAge).all();

    if (alternatives.length === 0) {
      return c.json({ error: 'No alternative activities available' }, 404);
    }

    // Score by material match and pick best
    const scored = alternatives.map((activity: any) => {
      const materials = JSON.parse(activity.materials || '[]');
      const matchCount = materials.filter((m: string) => haveMaterials.has(m.toLowerCase())).length;
      const matchRatio = materials.length > 0 ? matchCount / materials.length : 1;
      return { activity, score: matchRatio };
    }).sort((a, b) => b.score - a.score);

    const selectedActivity = scored[0].activity;

    // Build session response same as /api/family/today format
    const tiers = JSON.parse(selectedActivity.tiered_expectations || '[]');
    const childTiers = children.map((child: any) => {
      const age = child.age_in_months;
      let tier = tiers.find((t: any) => age >= t.age_min && age <= t.age_max);
      if (!tier) {
        if (age < tiers[0]?.age_min) tier = tiers[0];
        else if (age > tiers[tiers.length - 1]?.age_max) tier = tiers[tiers.length - 1];
      }
      return {
        childId: child.id,
        childName: child.name,
        tier: tier?.tier || 'Standard',
        expectation: tier?.expectation || 'Participate with support',
        childAge: age
      };
    });

    const domainLabels: Record<string, string> = {
      'motor': 'Stewardship & Dominion',
      'language': 'Word & Truth',
      'cognitive': 'Wisdom & Order',
      'social-emotional': 'Virtue & Sanctification',
      'pre-academic': 'Foundations & Patterns'
    };
    const domainName = domainLabels[selectedActivity.domain] || selectedActivity.domain;

    return c.json({
      session: {
        activity: {
          ...selectedActivity,
          materials: JSON.parse(selectedActivity.materials || '[]'),
          instructions: JSON.parse(selectedActivity.instructions || '[]'),
          learning_outcomes: JSON.parse(selectedActivity.learning_outcomes || '[]'),
        },
        childTiers,
        messLevel: selectedActivity.mess_level,
        prepMinutes: selectedActivity.prep_time_minutes,
        materialsAvailable: true,
        reasoning: `Swapped to '${selectedActivity.title}' - great for developing ${domainName}.`
      }
    });
  } catch (error: any) {
    console.error('Swap activity error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// ============ FAMILY COMPOSER (NEW) ============

// Compose a custom family session plan
app.post('/family-sessions/compose', async (c) => {
  try {
    // Optional auth (can be public or authenticated)
    // If auth, we can pull defaults. simple validation for now.
    const body = await c.req.json();
    const { children, materials, preferred_domain } = body;
    // children: array of { age_months: number, name?: string }
    // materials: array of strings (available materials)
    // preferred_domain: optional string (biblical domain or standard domain)

    if (!children || !Array.isArray(children) || children.length === 0) {
      return c.json({ error: 'Children array required' }, 400);
    }

    const ages = children.map((c: any) => c.age_months);
    const minAge = Math.min(...ages);
    const maxAge = Math.max(...ages);

    let query = `
      SELECT *, primary_virtue as domain FROM formations
      WHERE formation_type = 'family_session'
        AND min_age_months <= ? 
        AND max_age_months >= ?
        AND tiered_expectations IS NOT NULL
        AND is_active = 1
        AND (is_archived = 0 OR is_archived IS NULL)
        AND (content_status != 'blacklisted' OR content_status IS NULL)
    `;

    const params: any[] = [minAge, maxAge];

    // Domain filter (mapped to biblical or standard)
    if (preferred_domain) {
      // Check if mapped to new virtues or legacy biblical domains
      // For now, assume primary_virtue is the target column
      query += ' AND primary_virtue = ?';
      params.push(preferred_domain);
    }

    // Material matching logic could be added here similar to getFamilyDailyRecommendations
    // For now, simpler ordering
    query += ` ORDER BY uses_core_kit DESC, RANDOM() LIMIT 1`;

    const activity = await c.env.DB.prepare(query).bind(...params).first();

    if (!activity) {
      return c.json({ error: 'No suitable family session found for this combination.' }, 404);
    }

    // Process tiers
    const tiers = JSON.parse((activity as any).tiered_expectations || '[]');
    const childInstructions = children.map((child: any) => {
      const age = child.age_months;
      let tier = tiers.find((t: any) => age >= t.age_min && age <= t.age_max);
      if (!tier) {
        if (age < tiers[0]?.age_min) tier = tiers[0];
        else if (age > tiers[tiers.length - 1]?.age_max) tier = tiers[tiers.length - 1];
      }
      return {
        childName: child.name || 'Child',
        ageMonths: age,
        tier: tier?.tier || 'Standard',
        instruction: tier?.expectation || 'Participate with support',
        adultSupport: tier?.adult_support // New field if we added it to tiered_expectations json
      };
    });

    return c.json({
      activity: {
        ...activity,
        materials: JSON.parse((activity as any).materials || '[]'),
        instructions: JSON.parse((activity as any).instructions || '[]'),
        learning_outcomes: JSON.parse((activity as any).learning_outcomes || '[]'),
      },
      familyPrompt: (activity as any).parent_script || "Guide your family through this activity together.",
      safetyNote: (activity as any).safety_note,
      successCue: (activity as any).success_cue,
      childInstructions
    });

  } catch (error: any) {
    console.error('Composer error:', error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});


// ============ ADMIN / EXPORT ROUTES ============

// Export activities
app.get('/api/activities/export', async (c) => {
  // optionally protect with secret or admin role
  try {
    // For now allow any auth user or public if needed? Let's require auth at least.
    const user = requireAuth(c);

    const { results } = await c.env.DB.prepare(
      'SELECT *, primary_virtue as domain FROM formations ORDER BY id'
    ).all();

    const activities = results.map((a: any) => ({
      ...a,
      materials: JSON.parse(a.materials || '[]'),
      instructions: JSON.parse(a.instructions || '[]'),
      learning_outcomes: JSON.parse(a.learning_outcomes || '[]'),
      tiered_expectations: JSON.parse(a.tiered_expectations || 'null')
    }));

    return c.json(activities);
  } catch (error: any) {
    return c.json({ error: error.message }, 401);
  }
});


// ============ OBSERVATIONS ROUTES ============

// Record an observation
app.post('/api/observations', async (c) => {
  try {
    const user = requireAuth(c);
    const body = await c.req.json();
    const { studentId, activityId, masteryLevel, parentNotes, tier } = body;

    // Verify student ownership
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND parent_id = ?'
    ).bind(studentId, user.id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    // Verify activity exists
    const activity = await c.env.DB.prepare(
      'SELECT * FROM formations WHERE id = ?'
    ).bind(activityId).first();

    if (!activity) {
      return c.json({ error: 'Activity not found' }, 404);
    }

    // Daily practices check (optional, depending on if assessment_prohibited is in formations)
    // Assuming formations has formation_type, we can check that.
    if ((activity as any).formation_type === 'daily_practice' && (activity as any).assessment_prohibited === 1) {
      return c.json({ error: 'Observations cannot be recorded for daily practices' }, 400);
    }

    const observationId = generateId('ev'); // Use 'ev' for evidence

    // Map masteryLevel to habit_stage
    // habit_stage CHECK constraint: 'Seeding', 'Rooting', 'Fruiting'
    // Input masteryLevel might be arbitrary string.
    let habitStage = 'Seeding';
    if (masteryLevel) {
      const lower = masteryLevel.toLowerCase();
      if (lower.includes('fruit') || lower.includes('mastered')) habitStage = 'Fruiting';
      else if (lower.includes('root') || lower.includes('growing')) habitStage = 'Rooting';
      else if (lower.includes('seed') || lower.includes('started')) habitStage = 'Seeding';
      // Fallback: if masteryLevel is one of the valid ones, use it (case insensitive)
      const valid = ['Seeding', 'Rooting', 'Fruiting'];
      const exact = valid.find(v => v.toLowerCase() === lower);
      if (exact) habitStage = exact;
    }

    await c.env.DB.prepare(
      'INSERT INTO evidences (id, student_id, parent_id, formation_id, habit_stage, notes) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(observationId, studentId, user.id, activityId, habitStage, parentNotes || null).run();

    // No need to update daily_recommendations as it is deprecated

    const observation = await c.env.DB.prepare(
      'SELECT * FROM evidences WHERE id = ?'
    ).bind(observationId).first();

    return c.json(observation, 201);
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to record observation' }, 400);
  }
});

// Get observations for a student
app.get('/api/students/:studentId/observations', async (c) => {
  try {
    const user = requireAuth(c);
    const studentId = c.req.param('studentId');
    const domain = c.req.query('domain');
    const limit = c.req.query('limit') || '50';

    // Verify ownership
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND parent_id = ?'
    ).bind(studentId, user.id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    let query = `
      SELECT e.id, e.student_id, e.formation_id as activity_id, e.stage as mastery_level, e.note as parent_notes, e.created_at as completed_at,
             f.title, f.primary_virtue as domain, f.description
      FROM evidences e
      JOIN formations f ON e.formation_id = f.id
      WHERE e.student_id = ?
    `;
    const params: any[] = [studentId];

    if (domain) {
      query += ' AND f.primary_virtue = ?';
      params.push(domain);
    }

    query += ' ORDER BY e.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    return c.json(results);
  } catch (error: any) {
    return c.json({ error: error.message || 'Unauthorized' }, 401);
  }
});

// Get progress summary for a student
app.get('/api/students/:studentId/progress', async (c) => {
  try {
    const user = requireAuth(c);
    const studentId = c.req.param('studentId');

    // Verify ownership
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND parent_id = ?'
    ).bind(studentId, user.id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    // Get formation preferences to know which streams are enabled
    const prefs = await c.env.DB.prepare(
      'SELECT * FROM family_preferences WHERE parent_id = ?'
    ).bind(user.id).first() as any;

    const enabledStreams: string[] = [];
    if (!prefs || prefs.activities_enabled) enabledStreams.push('activity');
    if (!prefs || prefs.reading_enabled) enabledStreams.push('reading');
    if (!prefs || prefs.liturgy_enabled) enabledStreams.push('liturgy');

    // ACTIVITY PROGRESS: Get counts by virtue (domain) and stage (mastery)
    const { results: byDomain } = await c.env.DB.prepare(`
      SELECT f.primary_virtue as domain, e.stage as mastery_level, COUNT(*) as count
      FROM evidences e
      JOIN formations f ON e.formation_id = f.id
      WHERE e.student_id = ?
      GROUP BY f.primary_virtue, e.stage
    `).bind(studentId).all();

    // Get recent activity (last 7 days)
    const { results: recentActivity } = await c.env.DB.prepare(`
      SELECT DATE(e.created_at) as date, COUNT(*) as count
      FROM evidences e
      WHERE e.student_id = ? AND e.created_at > datetime('now', '-7 days')
      GROUP BY DATE(e.created_at)
      ORDER BY date
    `).bind(studentId).all();

    // Get total completed formations
    const totalResult = await c.env.DB.prepare(`
      SELECT COUNT(DISTINCT formation_id) as total FROM evidences WHERE student_id = ?
    `).bind(studentId).first();

    const activityProgress = {
      totalCompleted: (totalResult as any)?.total || 0,
      byDomain,
      recentActivity
    };

    // READING PROGRESS: Count reading sessions where this child was present
    const readingStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as sessions_count,
        COUNT(DISTINCT book_id) as distinct_books
      FROM reading_sessions 
      WHERE parent_id = ? 
        AND (children_present IS NULL OR children_present LIKE ?)
    `).bind(user.id, `%${studentId}%`).first() as any;

    const readingProgress = {
      sessionsCount: readingStats?.sessions_count || 0,
      distinctBooks: readingStats?.distinct_books || 0
    };

    // LITURGY PROGRESS: Count days practiced and calculate streak
    const liturgyDaysResult = await c.env.DB.prepare(`
      SELECT COUNT(DISTINCT completed_date) as days_practiced
      FROM liturgy_completions
      WHERE parent_id = ?
    `).bind(user.id).first() as any;

    // Calculate current streak (consecutive days ending today or yesterday)
    const { results: recentDays } = await c.env.DB.prepare(`
      SELECT DISTINCT completed_date
      FROM liturgy_completions
      WHERE parent_id = ?
      ORDER BY completed_date DESC
      LIMIT 30
    `).bind(user.id).all();

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (recentDays.some((d: any) => d.completed_date === dateStr)) {
        currentStreak++;
      } else if (i > 0) {
        // Allow missing today (streak still counts if yesterday was completed)
        break;
      }
    }

    const liturgyProgress = {
      daysPracticed: liturgyDaysResult?.days_practiced || 0,
      currentStreak
    };

    return c.json({
      student,
      enabledStreams,
      // Legacy fields for backward compatibility
      totalCompleted: activityProgress.totalCompleted,
      byDomain: activityProgress.byDomain,
      recentActivity: activityProgress.recentActivity,
      // New unified progress
      activityProgress,
      readingProgress,
      liturgyProgress
    });
  } catch (error: any) {
    return c.json({ error: error.message || 'Unauthorized' }, 401);
  }
});

// Delete a child
app.delete('/api/students/:id', async (c) => {
  try {
    const user = requireAuth(c);
    const studentId = c.req.param('id');

    // Verify ownership
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND parent_id = ?'
    ).bind(studentId, user.id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    // Delete related records first (cascade)
    await c.env.DB.prepare(
      'DELETE FROM observations WHERE student_id = ?'
    ).bind(studentId).run();

    await c.env.DB.prepare(
      'DELETE FROM daily_recommendations WHERE student_id = ?'
    ).bind(studentId).run();

    // Delete the student
    await c.env.DB.prepare(
      'DELETE FROM students WHERE id = ?'
    ).bind(studentId).run();

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to delete child' }, 400);
  }
});

// ============ BOOKS & READING ROUTES ============

// Helper: Parse age range string to months
function parseAgeRange(ageRange: string): { min: number; max: number } {
  // Examples: "1-4 years", "3-5 years", "6-9"
  const match = ageRange.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return { min: 24, max: 60 };

  let [, minStr, maxStr] = match;
  let min = parseInt(minStr);
  let max = parseInt(maxStr);

  // If values are small (likely years), convert to months
  if (max <= 12) {
    min = min * 12;
    max = max * 12;
  }

  return { min, max };
}

// Helper: Get book metadata from R2
// Helper: Get book metadata from R2
async function getBookMetadata(bucket: R2Bucket, series: string, bookId: string): Promise<BookMetadata | null> {
  // STRICT: Always expected at books/series/book/metadata.json
  // series and bookId here are FOLDER NAMES, not human-readable values
  const key = `books/${series}/${bookId}/metadata.json`;
  const object = await bucket.get(key);

  if (!object) return null;

  const data = await object.json() as any;

  // Normalize metadata format
  const ageRange = parseAgeRange(data.ageRange || '2-5 years');

  // CRITICAL: Use folder names (series, bookId params) for URL construction
  // Store human-readable title separately for display purposes
  return {
    id: bookId,  // Always use folder name
    series: series,  // Always use folder name
    title: data.title || bookId,
    author: data.author,
    illustrator: data.illustrator,
    description: data.description || '',
    minAgeMonths: data.minAgeMonths || ageRange.min,
    maxAgeMonths: data.maxAgeMonths || ageRange.max,
    pageCount: data.pageCount || data.pages?.filter((p: any) => p.pageNumber)?.length || 10,
    domain: data.domain || 'language',
    learningStage: data.learningStage || 'early-years',
    readingPrompts: data.readingPrompts,
    coverUrl: `/api/books/${encodeURIComponent(series)}/${encodeURIComponent(bookId)}/cover`
  };
}

// Helper: List all delimited prefixes with pagination
async function listAllPrefixes(bucket: R2Bucket, options: R2ListOptions): Promise<string[]> {
  let prefixes: string[] = [];
  let truncated = true;
  let cursor: string | undefined;

  while (truncated) {
    const result = await bucket.list({ ...options, cursor });
    prefixes = prefixes.concat(result.delimitedPrefixes || []);
    truncated = result.truncated;
    if (result.truncated) {
      cursor = result.cursor;
    }
  }
  return prefixes;
}

// Helper: Find metadata file in a book directory (case-insensitive)
async function findMetadataFile(bucket: R2Bucket, bookPrefix: string): Promise<R2ObjectBody | null> {
  // List files in the book directory to find metadata.json regardless of case
  const result = await bucket.list({ prefix: bookPrefix });

  const metadataKey = result.objects.find(obj =>
    obj.key.toLowerCase().endsWith('/metadata.json') ||
    obj.key.toLowerCase() === 'metadata.json'
  )?.key;

  if (metadataKey) {
    return bucket.get(metadataKey);
  }
  return null;
}

// List all books
app.get('/api/books', async (c) => {
  try {
    // Optimization: Allow caching for this heavy static endpoint
    c.header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');

    const stage = c.req.query('stage');
    const ageMonths = c.req.query('ageMonths');
    const bucket = c.env.BOOKS_BUCKET;
    const books: BookMetadata[] = [];

    console.log('Starting robust book listing...');

    // Step 1: Detect Root
    // Check if 'books/' exists at the root level
    const rootList = await bucket.list({ delimiter: '/' });
    const rootPrefixes = rootList.delimitedPrefixes || [];

    let rootPath = '';
    if (rootPrefixes.includes('books/')) {
      rootPath = 'books/';
    }
    console.log(`Detected root path: '${rootPath}'`);

    // Step 2: List Series (handling pagination)
    const seriesPrefixes = await listAllPrefixes(bucket, {
      prefix: rootPath,
      delimiter: '/'
    });
    console.log(`Found ${seriesPrefixes.length} series prefixes`);

    // Step 3: List Books in ALL Series concurrently
    const seriesBookLists = await Promise.all(seriesPrefixes.map(async (seriesPrefix) => {
      const seriesName = seriesPrefix.replace(rootPath, '').replace(/\/$/, '');
      const bookPrefixes = await listAllPrefixes(bucket, {
        prefix: seriesPrefix,
        delimiter: '/'
      });
      return { seriesName, seriesPrefix, bookPrefixes };
    }));

    // Flatten to get all book tasks
    const allBookTasks = seriesBookLists.flatMap(({ seriesName, seriesPrefix, bookPrefixes }) =>
      bookPrefixes.map(bookPrefix => ({ seriesName, seriesPrefix, bookPrefix }))
    );

    // Step 4: Process Books Concurrently
    const bookResults = await Promise.all(allBookTasks.map(async ({ seriesName, seriesPrefix, bookPrefix }) => {
      // bookPath is the relative path from the series, e.g., "Book Title/"
      const bookId = bookPrefix.replace(seriesPrefix, '').replace(/\/$/, '');

      try {
        // Find and load metadata
        const object = await findMetadataFile(bucket, bookPrefix);

        if (object) {
          const data = await object.json() as any;
          const ageRange = parseAgeRange(data.ageRange || '2-5 years');

          // CRITICAL: Use folder names (seriesName, bookId) for URL construction
          // The frontend uses book.series and book.id to build cover/page URLs
          // These MUST match the actual R2 folder structure, not human-readable names
          return {
            id: bookId,  // Always use folder name, not metadata id
            series: seriesName,  // Always use folder name, not metadata series
            seriesTitle: data.series || seriesName,  // Human-readable for display
            title: data.title || bookId,
            author: data.author,
            illustrator: data.illustrator,
            description: data.description || '',
            minAgeMonths: data.minAgeMonths || ageRange.min,
            maxAgeMonths: data.maxAgeMonths || ageRange.max,
            pageCount: data.pageCount || data.pages?.filter((p: any) => p.pageNumber)?.length || 10,
            domain: data.domain || 'language',
            learningStage: data.learningStage || 'early-years',
            readingPrompts: data.readingPrompts,
            coverUrl: `/api/books/${encodeURIComponent(seriesName)}/${encodeURIComponent(bookId)}/cover`
          } as BookMetadata;
        }
      } catch (e) {
        console.warn(`Failed to load book ${bookId}:`, e);
      }
      return null;
    }));

    books.push(...bookResults.filter((b): b is BookMetadata => b !== null));

    console.log(`Total books loaded: ${books.length}`);

    // Apply filters matching the original logic
    let filtered = books;
    if (stage) {
      filtered = filtered.filter(b => b.learningStage === stage);
    }
    if (ageMonths) {
      const age = parseInt(ageMonths);
      filtered = filtered.filter(b => b.minAgeMonths <= age && b.maxAgeMonths >= age);
    }

    return c.json(filtered);
  } catch (error: any) {
    console.error('Books list error:', error);
    return c.json({ error: error.message || 'Failed to list books' }, 500);
  }
});

// List all books (Legacy - keep for now if needed, or update frontend to use series)
// ... keeping as is, but also adding Series endpoints

// ============ SERIES ROUTES ============

// List all series
app.get('/api/series', async (c) => {
  try {
    const bucket = c.env.BOOKS_BUCKET;
    const seriesList: any[] = [];

    // List 'books/' prefix with '/' delimiter to get series folders
    const rootList = await bucket.list({ prefix: 'books/', delimiter: '/' });
    const seriesPrefixes = rootList.delimitedPrefixes || [];

    for (const prefix of seriesPrefixes) {
      const seriesId = prefix.replace('books/', '').replace('/', '');

      // Try to get metadata
      const metaKey = `${prefix}metadata.json`;
      const metaObj = await bucket.get(metaKey);

      let metadata: any = { id: seriesId, title: seriesId, description: '' };

      if (metaObj) {
        try {
          metadata = await metaObj.json();
        } catch (e) { console.warn(`Invalid metadata for series ${seriesId}`); }
      }

      seriesList.push({
        ...metadata,
        id: seriesId, // Ensure ID matches folder
        coverUrl: `/api/series/${encodeURIComponent(seriesId)}/cover`
      });
    }

    return c.json(seriesList);

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get series details
app.get('/api/series/:seriesId', async (c) => {
  try {
    const seriesId = c.req.param('seriesId');
    const bucket = c.env.BOOKS_BUCKET;
    const prefix = `books/${seriesId}`;

    // Get Metadata
    const metaKey = `${prefix}/metadata.json`;
    const metaObj = await bucket.get(metaKey);

    if (!metaObj) {
      return c.json({ error: 'Series not found' }, 404);
    }

    const metadata = await metaObj.json() as any;

    // List Books in Series
    const booksList = await bucket.list({ prefix: `${prefix}/`, delimiter: '/' });
    const bookPrefixes = booksList.delimitedPrefixes || [];
    const books: BookMetadata[] = [];

    for (const bookPrefix of bookPrefixes) {
      const bookId = bookPrefix.replace(`${prefix}/`, '').replace('/', '');
      const bookMeta = await getBookMetadata(bucket, seriesId, bookId);
      if (bookMeta) {
        books.push(bookMeta);
      }
    }

    return c.json({
      ...metadata,
      id: seriesId,
      coverUrl: `/api/series/${encodeURIComponent(seriesId)}/cover`,
      books
    });

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get series cover
app.get('/api/series/:seriesId/cover', async (c) => {
  try {
    const seriesId = c.req.param('seriesId');
    const bucket = c.env.BOOKS_BUCKET;

    // STRICT: books/{series}/cover.png
    const key = `books/${seriesId}/cover.png`;
    const object = await bucket.get(key);

    if (object) {
      const headers = new Headers();
      headers.set('Content-Type', object.httpMetadata?.contentType || 'image/png');
      headers.set('Cache-Control', 'public, max-age=86400');
      return new Response(object.body, { headers });
    }

    return c.json({ error: 'Series cover not found' }, 404);

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get single book metadata
app.get('/api/books/:series/:bookId', async (c) => {
  try {
    const series = decodeURIComponent(c.req.param('series'));
    const bookId = decodeURIComponent(c.req.param('bookId'));

    if (!isValidPathSegment(series) || !isValidPathSegment(bookId)) {
      return c.json({ error: 'Invalid path segment' }, 400);
    }

    const metadata = await getBookMetadata(c.env.BOOKS_BUCKET, series, bookId);

    if (!metadata) {
      return c.json({ error: 'Book not found' }, 404);
    }

    return c.json(metadata);
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to get book' }, 500);
  }
});

// Get book cover image (with CORS for cross-origin requests)
app.get('/api/books/:series/:bookId/cover', async (c) => {
  try {
    const series = decodeURIComponent(c.req.param('series'));
    const bookId = decodeURIComponent(c.req.param('bookId'));

    if (!isValidPathSegment(series) || !isValidPathSegment(bookId)) {
      return c.json({ error: 'Invalid path segment' }, 400);
    }

    const bucket = c.env.BOOKS_BUCKET;

    // Try multiple path patterns for resilience (PNG, JPG, and page-01 fallback)
    // Covers can be at: book folder level, images/ subfolder, or shared series images/ folder
    // IMPORTANT: Your R2 structure is primarily: books/{series}/{bookId}/images/cover.png
    // But African Men of Faith uses Title Case folders and "Cover Photo.png" filename.
    
    // Helper to convert snake_case to Title Case With Spaces
    const toTitleCase = (str: string) => str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    const seriesTitleCase = toTitleCase(series);
    const bookIdTitleCase = toTitleCase(bookId);
    
    const pathsToTry = [
      // Primary (per-book) cover location - picture books (snake_case)
      `books/${series}/${bookId}/images/cover.png`,
      `books/${series}/${bookId}/images/cover.jpg`,
      `books/${series}/${bookId}/images/cover.jpeg`,
      
      // Title Case folders (African Men of Faith pattern)
      `books/${seriesTitleCase}/${bookIdTitleCase}/images/cover.png`,
      `books/${seriesTitleCase}/${bookIdTitleCase}/Cover Photo.png`,
      `books/${seriesTitleCase}/${bookIdTitleCase}/cover.png`,
      
      // Mixed: Title Case series, lowercase book
      `books/${seriesTitleCase}/${bookId}/images/cover.png`,
      `books/${seriesTitleCase}/${bookId}/Cover Photo.png`,
      
      // Series-level images folder with bookId as filename (Pastor Curtis pattern)
      `books/${series}/images/${bookId}.png`,
      `books/${series}/images/${bookId}.jpg`,
      `books/${series}/images/${bookId}.jpeg`,

      // Secondary (older) book folder level
      `books/${series}/${bookId}/cover.png`,
      `books/${series}/${bookId}/cover.jpg`,
      `books/${series}/${bookId}/cover.jpeg`,
      `books/${seriesTitleCase}/${bookIdTitleCase}/cover.png`,
      `books/${seriesTitleCase}/${bookIdTitleCase}/cover.jpg`,

      // Shared series-level cover (some collections)
      `books/${series}/images/cover.png`,
      `books/${series}/images/cover.jpg`,
      `books/${series}/images/cover.jpeg`,

      // Fallback: page-01 as cover (snake_case)
      `books/${series}/${bookId}/images/page-01.png`,
      `books/${series}/${bookId}/images/page-01.jpg`,
      `books/${series}/${bookId}/images/page_01.png`,
      `books/${series}/${bookId}/images/page_01.jpg`,
      
      // Fallback: Page 1.png (Title Case with spaces - African Men of Faith)
      `books/${seriesTitleCase}/${bookIdTitleCase}/images/Page 1.png`,
      `books/${seriesTitleCase}/${bookIdTitleCase}/Page 1.png`,
      
      `books/${series}/${bookId}/page-01.png`,
      `books/${series}/${bookId}/page-01.jpg`,
      `books/${series}/${bookId}/page_01.png`,
      `books/${series}/${bookId}/page_01.jpg`,

      // Without books/ prefix (legacy)
      `${series}/${bookId}/images/cover.png`,
      `${series}/${bookId}/images/cover.jpg`,
      `${series}/${bookId}/images/cover.jpeg`,
      `${seriesTitleCase}/${bookIdTitleCase}/images/cover.png`,
      `${seriesTitleCase}/${bookIdTitleCase}/Cover Photo.png`,
      `${series}/images/${bookId}.png`,
      `${series}/images/${bookId}.jpg`,
      `${series}/images/${bookId}.jpeg`,
      `${series}/${bookId}/cover.png`,
      `${series}/${bookId}/cover.jpg`,
      `${series}/${bookId}/cover.jpeg`,
      `${series}/images/cover.png`,
      `${series}/images/cover.jpg`,
      `${series}/images/cover.jpeg`,
      `${series}/${bookId}/images/page-01.png`,
      `${series}/${bookId}/images/page_01.png`,
      `${series}/${bookId}/page-01.png`,
      `${series}/${bookId}/page_01.png`,
    ];

    for (const key of pathsToTry) {
      const object = await bucket.get(key);
      if (object) {
        const headers = new Headers();
        // Detect content type from key extension or use R2 metadata
        const ext = key.split('.').pop()?.toLowerCase();
        const contentType = object.httpMetadata?.contentType || 
          (ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png');
        headers.set('Content-Type', contentType);
        headers.set('Cache-Control', 'public, max-age=86400');
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        return new Response(object.body, { headers });
      }
    }

    return c.json({
      error: 'Cover not found',
      tried: pathsToTry,
      help: 'Ensure cover.png, cover.jpg, or images/page-01.png exists in the book folder'
    }, 404);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Debug endpoint for cover URL probing
app.get('/api/books/:series/:bookId/cover/debug', async (c) => {
  try {
    const series = decodeURIComponent(c.req.param('series'));
    const bookId = decodeURIComponent(c.req.param('bookId'));
    const bucket = c.env.BOOKS_BUCKET;

    const toTitleCase = (str: string) => str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    const seriesTitleCase = toTitleCase(series);
    const bookIdTitleCase = toTitleCase(bookId);
    
    const pathsToTry = [
      `books/${series}/${bookId}/images/cover.png`,
      `books/${series}/${bookId}/images/cover.jpg`,
      `books/${series}/images/${bookId}.png`,
      `books/${series}/images/${bookId}.jpg`,
      `books/${seriesTitleCase}/${bookIdTitleCase}/images/cover.png`,
      `books/${seriesTitleCase}/${bookIdTitleCase}/Cover Photo.png`,
      `books/${series}/${bookId}/images/page-01.png`,
      `books/${series}/${bookId}/images/page_01.png`,
      `books/${seriesTitleCase}/${bookIdTitleCase}/images/Page 1.png`,
    ];

    const results = [];
    let foundPath = null;
    
    for (const key of pathsToTry) {
      const object = await bucket.head(key);
      const found = !!object;
      results.push({ 
        path: key, 
        found,
        size: object?.size,
        contentType: object?.httpMetadata?.contentType
      });
      if (found && !foundPath) foundPath = key;
    }

    return c.json({
      requestedSeries: series,
      requestedBookId: bookId,
      seriesTitleCase,
      bookIdTitleCase,
      foundPath,
      pathsChecked: results
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get book page image (with CORS for cross-origin requests)
app.get('/api/books/:series/:bookId/pages/:pageNum', async (c) => {
  try {
    const series = decodeURIComponent(c.req.param('series'));
    const bookId = decodeURIComponent(c.req.param('bookId'));
    const pageNum = c.req.param('pageNum');

    if (!isValidPathSegment(series) || !isValidPathSegment(bookId) || !isValidPathSegment(pageNum)) {
      return c.json({ error: 'Invalid path segment' }, 400);
    }

    const bucket = c.env.BOOKS_BUCKET;

    const paddedNum = pageNum.padStart(2, '0');
    
    // Try multiple path patterns for resilience (PNG and JPG)
    const pathsToTry = [
      // With books/ prefix
      `books/${series}/${bookId}/images/page-${paddedNum}.png`,
      `books/${series}/${bookId}/images/page-${paddedNum}.jpg`,
      `books/${series}/${bookId}/images/page_${paddedNum}.png`,
      `books/${series}/${bookId}/images/page_${paddedNum}.jpg`,
      `books/${series}/${bookId}/page-${paddedNum}.png`,
      `books/${series}/${bookId}/page-${paddedNum}.jpg`,
      `books/${series}/${bookId}/page_${paddedNum}.png`,
      `books/${series}/${bookId}/page_${paddedNum}.jpg`,
      // Without books/ prefix
      `${series}/${bookId}/images/page-${paddedNum}.png`,
      `${series}/${bookId}/images/page-${paddedNum}.jpg`,
      `${series}/${bookId}/images/page_${paddedNum}.png`,
      `${series}/${bookId}/images/page_${paddedNum}.jpg`,
      `${series}/${bookId}/page-${paddedNum}.png`,
      `${series}/${bookId}/page-${paddedNum}.jpg`,
      `${series}/${bookId}/page_${paddedNum}.png`,
      `${series}/${bookId}/page_${paddedNum}.jpg`,
    ];

    for (const key of pathsToTry) {
      const object = await bucket.get(key);
      if (object) {
        const headers = new Headers();
        const ext = key.split('.').pop()?.toLowerCase();
        const contentType = object.httpMetadata?.contentType || 
          (ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png');
        headers.set('Content-Type', contentType);
        headers.set('Cache-Control', 'public, max-age=86400');
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        return new Response(object.body, { headers });
      }
    }

    return c.json({
      error: 'Page not found',
      tried: pathsToTry,
      help: 'Ensure images/page-XX.png or page-XX.jpg exists in the book folder'
    }, 404);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get book PDF (for larger books with many pages)
app.get('/api/books/:series/:bookId/pdf', async (c) => {
  try {
    const series = decodeURIComponent(c.req.param('series'));
    const bookId = decodeURIComponent(c.req.param('bookId'));

    if (!isValidPathSegment(series) || !isValidPathSegment(bookId)) {
      return c.json({ error: 'Invalid path segment' }, 400);
    }

    const bucket = c.env.BOOKS_BUCKET;

    // Try multiple path patterns for PDF files
    // PDFs can be: at series level (pastor_curtis_knapp/book.pdf), or in book subfolder
    const pathsToTry = [
      // PDF directly in series folder (e.g., pastor_curtis_knapp/before_you_tie_the_knot.pdf)
      `books/${series}/${bookId}.pdf`,
      `${series}/${bookId}.pdf`,
      // PDF in book subfolder with same name
      `books/${series}/${bookId}/${bookId}.pdf`,
      `${series}/${bookId}/${bookId}.pdf`,
      // Generic book.pdf in book subfolder
      `books/${series}/${bookId}/book.pdf`,
      `${series}/${bookId}/book.pdf`,
    ];

    for (const key of pathsToTry) {
      const object = await bucket.get(key);
      if (object) {
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Cache-Control', 'public, max-age=86400');
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        // Allow inline viewing, not forced download
        headers.set('Content-Disposition', `inline; filename="${bookId}.pdf"`);
        return new Response(object.body, { headers });
      }
    }

    return c.json({
      error: 'PDF not found',
      tried: pathsToTry,
      help: 'Upload PDF to R2 at books/{series}/{bookId}/book.pdf'
    }, 404);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get any book asset (generic fallback for markdown, manifests, etc.)
app.get('/api/books/:series/:bookId/asset/*', async (c) => {
  try {
    const series = decodeURIComponent(c.req.param('series'));
    const bookId = decodeURIComponent(c.req.param('bookId'));
    const assetPath = c.req.path.split('/asset/')[1] || '';
    const bucket = c.env.BOOKS_BUCKET;

    if (!assetPath || assetPath.includes('..') || !isValidPathSegment(series) || !isValidPathSegment(bookId)) {
      return c.json({ error: 'Invalid path segment' }, 400);
    }

    const pathsToTry = [
      `books/${series}/${bookId}/${assetPath}`,
      `${series}/${bookId}/${assetPath}`,
    ];

    for (const key of pathsToTry) {
      const object = await bucket.get(key);
      if (object) {
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('Cache-Control', 'public, max-age=3600');
        headers.set('Access-Control-Allow-Origin', '*');
        return new Response(object.body, { headers });
      }
    }

    return c.json({ error: 'Asset not found', tried: pathsToTry }, 404);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Log reading session completion
app.post('/api/reading/complete', async (c) => {
  try {
    const user = requireAuth(c);
    const body = await c.req.json();
    const { series, bookId, childrenPresent, notes } = body;

    if (!series || !bookId) {
      return c.json({ error: 'Series and bookId are required' }, 400);
    }

    // Try to find the book with either simple bookId or series/bookId format
    const book = await c.env.DB.prepare(
      "SELECT id FROM formations WHERE (id = ? OR id = ?) AND formation_type = 'reading'"
    ).bind(bookId, `${series}/${bookId}`).first<{ id: string }>();

    if (!book) {
      return c.json({
        error: 'Book not found',
        tried: [bookId, `${series}/${bookId}`],
        help: 'Ensure the book is seeded in the formations table with a matching id'
      }, 404);
    }

    const sessionId = generateId('read');
    const childrenJson = childrenPresent ? JSON.stringify(childrenPresent) : null;

    await c.env.DB.prepare(`
      INSERT INTO reading_sessions (id, parent_id, book_id, children_present, notes, completed_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(sessionId, user.id, book.id, childrenJson, notes || null).run();

    const session = await c.env.DB.prepare(
      'SELECT * FROM reading_sessions WHERE id = ?'
    ).bind(sessionId).first();

    return c.json(session, 201);
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to log reading session' }, 400);
  }
});

// Get reading history
app.get('/api/reading/history', async (c) => {
  try {
    const user = requireAuth(c);
    const limit = c.req.query('limit') || '20';

    const { results } = await c.env.DB.prepare(`
      SELECT * FROM reading_sessions 
      WHERE parent_id = ? 
      ORDER BY completed_at DESC 
      LIMIT ?
    `).bind(user.id, parseInt(limit)).all();

    // Parse children_present JSON
    const sessions = results.map((session: any) => ({
      ...session,
      childrenPresent: session.children_present ? JSON.parse(session.children_present) : [],
    }));

    return c.json(sessions);
  } catch (error: any) {
    return c.json({ error: error.message || 'Unauthorized' }, 401);
  }
});

// Upload book image (Admin only)
app.put('/api/books/upload', async (c) => {
  const key = c.req.query('key');
  const secret = c.env.ADMIN_SECRET;

  if (!secret || !(await safeCompare(key, secret))) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const path = c.req.query('path'); // e.g., "books/sanyus_growing_heart/left_out/images/cover.png"
  if (!path) return c.json({ error: 'Path required' }, 400);

  try {
    const body = await c.req.arrayBuffer();
    await c.env.BOOKS_BUCKET.put(path, body);
    return c.json({ success: true, path });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Debug R2 endpoint
app.get('/api/debug/r2', async (c) => {
  const key = c.req.query('key');
  const secret = c.env.ADMIN_SECRET;

  if (!secret || !(await safeCompare(key, secret))) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const bucket = c.env.BOOKS_BUCKET;
    const prefix = c.req.query('prefix');
    const delimiter = c.req.query('delimiter'); // optional override

    const listNoDelimiter = await bucket.list({ prefix });
    const listWithDelimiter = await bucket.list({ prefix, delimiter: delimiter || '/' });

    return c.json({
      prefix,
      delimiter: delimiter || '/',
      listNoDelimiter,
      listWithDelimiter
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Debug Book Audit
app.get('/api/debug/books/audit', async (c) => {
  // Protect
  const key = c.req.query('key');
  const secret = c.env.ADMIN_SECRET;

  if (!secret || !(await safeCompare(key, secret))) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const bucket = c.env.BOOKS_BUCKET;
  const violations: any[] = [];
  let totalBooks = 0;
  let compliant = 0;

  try {
    // 1. List Series
    const roots = await bucket.list({ prefix: 'books/', delimiter: '/' });
    const seriesPrefixes = roots.delimitedPrefixes || [];

    for (const seriesPrefix of seriesPrefixes) {
      const seriesName = seriesPrefix.replace('books/', '').replace('/', '');
      if (!/^[a-z0-9_]+$/.test(seriesName)) {
        violations.push({ series: seriesName, issue: 'Series folder must be snake_case' });
      }

      // 2. List Books
      const books = await bucket.list({ prefix: seriesPrefix, delimiter: '/' });
      const bookPrefixes = books.delimitedPrefixes || [];

      for (const bookPrefix of bookPrefixes) {
        totalBooks++;
        const bookId = bookPrefix.replace(seriesPrefix, '').replace('/', '');
        const bookIssues: string[] = [];

        if (!/^[a-z0-9_]+$/.test(bookId)) {
          bookIssues.push('Book folder must be snake_case');
        }

        // 3. Check specific files
        const cover = await bucket.head(bookPrefix + 'images/cover.png');
        if (!cover) bookIssues.push('Missing images/cover.png');

        const metadata = await bucket.get(bookPrefix + 'metadata.json');
        if (!metadata) {
          bookIssues.push('Missing metadata.json');
        } else {
          const m = await metadata.json() as any;
          if (m.id !== bookId) bookIssues.push(`Metadata ID mismatch: ${m.id} != ${bookId}`);
        }

        if (bookIssues.length > 0) {
          violations.push({ series: seriesName, bookId, issues: bookIssues });
        } else {
          compliant++;
        }
      }
    }

    return c.json({
      totalBooks,
      compliant,
      nonCompliant: totalBooks - compliant,
      violations
    });

  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});


// ============ LITURGY ENDPOINTS ============

// GET /api/liturgy/today - Get today's liturgy items + completion status
app.get('/api/liturgy/today', async (c) => {
  const user = requireAuth(c);
  const today = new Date().toISOString().split('T')[0];

  // 1. Get preferences (for enabled flag)
  const prefs = await c.env.DB.prepare(
    'SELECT * FROM family_preferences WHERE parent_id = ?'
  ).bind(user.id).first();

  const liturgyEnabled = prefs ? !!(prefs as any).liturgy_enabled : true;

  if (!liturgyEnabled) {
    return c.json({ date: today, items: [], completedIds: [], settings: { liturgy_enabled: false } });
  }

  // 2. Get progress
  const progress = await getOrCreateLiturgyProgress(c.env.DB, user.id);

  const settings = {
    catechism_source: progress.catechism_source,
    hymnal_source: 'classic_hymns',
    bible_translation: 'esv',
    current_catechism_week: progress.catechism_position,
    current_hymn_week: progress.hymn_position,
    current_scripture_week: progress.scripture_position,
    liturgy_enabled: liturgyEnabled
  };

  // 3. Fetch items from `formations`
  const items: any[] = [];

  // Catechism
  const catechism = await c.env.DB.prepare(`
    SELECT * FROM formations 
    WHERE formation_type = 'liturgy' AND cluster_tag = 'catechism' 
    AND source = ? AND sequence_number = ? AND is_active = 1
  `).bind(progress.catechism_source, progress.catechism_position).first();
  if (catechism) items.push({ ...catechism, itemType: 'catechism' });

  // Hymn
  const hymn = await c.env.DB.prepare(`
    SELECT * FROM formations 
    WHERE formation_type = 'liturgy' AND cluster_tag = 'hymn'
    AND sequence_number = ? AND is_active = 1
  `).bind(progress.hymn_position).first();
  if (hymn) items.push({ ...hymn, itemType: 'hymn' });

  // Scripture
  const scripture = await c.env.DB.prepare(`
    SELECT * FROM formations 
    WHERE formation_type = 'liturgy' AND cluster_tag = 'scripture'
    AND sequence_number = ? AND is_active = 1
  `).bind(progress.scripture_position).first();
  if (scripture) items.push({ ...scripture, itemType: 'scripture' });

  // 3. Completions from `evidences`
  let completedIds: string[] = [];
  const itemIds = items.map((i: any) => i.id);

  if (itemIds.length > 0) {
    const placeholders = itemIds.map(() => '?').join(',');
    const completions = await c.env.DB.prepare(`
      SELECT formation_id FROM evidences
      WHERE parent_id = ? AND formation_id IN (${placeholders}) AND date(captured_at) = ?
    `).bind(user.id, ...itemIds, today).all();

    completedIds = completions.results.map((r: any) => r.formation_id as string);
  }

  // Pass parsed JSON fields
  const parsedItems = items.map((i: any) => ({
    ...i,
    materials: JSON.parse(i.materials || '[]'),
    guide_steps: JSON.parse(i.guide_steps || '[]'),
    tips: JSON.parse(i.tips || '[]'),
    completedToday: completedIds.includes(i.id)
  }));

  return c.json({
    date: today,
    items: parsedItems,
    completedIds,
    settings
  });
});
// POST /api/liturgy/complete - Mark item as completed for today
app.post('/api/liturgy/complete', async (c) => {
  const user = requireAuth(c);
  const { itemId } = await c.req.json();
  const today = new Date().toISOString().split('T')[0];

  const completionId = generateId('ev'); // Evidence ID

  try {
    // Insert into evidences (unified tracking)
    // Providing parent_id and formation_id. student_id is NULL for family items.
    await c.env.DB.prepare(`
      INSERT INTO evidences (id, parent_id, formation_id, captured_at, student_id)
      VALUES (?, ?, ?, datetime('now'), NULL)
    `).bind(completionId, user.id, itemId).run();

    return c.json({ success: true, completionId });
  } catch (e: any) {
    if (e.message?.includes('UNIQUE constraint')) {
      return c.json({ success: true, alreadyCompleted: true });
    }
    throw e;
  }
});

// POST /api/liturgy/uncomplete - Remove today's completion
app.post('/api/liturgy/uncomplete', async (c) => {
  const user = requireAuth(c);
  const { itemId } = await c.req.json();
  const today = new Date().toISOString().split('T')[0];

  await c.env.DB.prepare(`
    DELETE FROM evidences
    WHERE parent_id = ? AND formation_id = ? AND date(captured_at) = ?
  `).bind(user.id, itemId, today).run();

  return c.json({ success: true });
});

// POST /api/liturgy/advance - Move to next week for a type
app.post('/api/liturgy/advance', async (c) => {
  const user = requireAuth(c);
  const { type } = await c.req.json(); // 'catechism' | 'hymn' | 'scripture'

  const columnMap: Record<string, string> = {
    catechism: 'catechism_position',
    hymn: 'hymn_position',
    scripture: 'scripture_position'
  };

  const column = columnMap[type];
  if (!column) {
    return c.json({ error: 'Invalid type' }, 400);
  }

  // Ensure record exists
  await getOrCreateLiturgyProgress(c.env.DB, user.id);

  // Update family_liturgy_progress
  await c.env.DB.prepare(`
    UPDATE family_liturgy_progress
    SET ${column} = ${column} + 1, updated_at = datetime('now')
    WHERE parent_id = ?
  `).bind(user.id).run();

  return c.json({ success: true });
});

// GET /api/liturgy/progress - Get progress for badges
app.get('/api/liturgy/progress', async (c) => {
  const user = requireAuth(c);
  const progress = await getOrCreateLiturgyProgress(c.env.DB, user.id);

  // Get totals
  const catechismTotal = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM formations WHERE cluster_tag = 'catechism' AND source = ? AND is_active = 1"
  ).bind(progress.catechism_source).first();

  const hymnTotal = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM formations WHERE cluster_tag = 'hymn' AND is_active = 1"
  ).first();

  const scriptureTotal = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM formations WHERE cluster_tag = 'scripture' AND is_active = 1"
  ).first();

  return c.json({
    catechism: {
      position: progress.catechism_position,
      total: (catechismTotal as any)?.count || 0,
      source: progress.catechism_source
    },
    hymn: {
      position: progress.hymn_position,
      total: (hymnTotal as any)?.count || 0
    },
    scripture: {
      position: progress.scripture_position,
      total: (scriptureTotal as any)?.count || 0
    }
  });
});

// GET /api/liturgy/settings - Get family liturgy settings
app.get('/api/liturgy/settings', async (c) => {
  const user = requireAuth(c);

  const settings = await c.env.DB.prepare(
    'SELECT * FROM family_liturgy_settings WHERE parent_id = ?'
  ).bind(user.id).first();

  if (!settings) return c.json(null);

  // Convert integers to booleans
  const safeSettings = {
    ...settings,
    catechism_enabled: !!(settings as any).catechism_enabled,
    hymnal_enabled: !!(settings as any).hymnal_enabled,
    scripture_enabled: !!(settings as any).scripture_enabled,
  };

  return c.json(safeSettings);
});

// PUT /api/liturgy/settings - Update family preferences (V2)
app.put('/api/liturgy/settings', async (c) => {
  const user = requireAuth(c);
  const updates: any = await c.req.json();

  const allowedFields = [
    'liturgy_enabled',
    'current_catechism_week', 'current_hymn_week', 'current_scripture_week'
  ];

  // Map legacy fields to V2 fields if necessary
  const v2Updates: any = {};
  if (updates.catechism_enabled !== undefined) v2Updates.liturgy_enabled = updates.catechism_enabled; // Simplified mapping
  // Add other mappings if strictly needed, but V2 unifies this.

  // Also allow direct V2 updates
  for (const k of allowedFields) {
    if (updates[k] !== undefined) v2Updates[k] = updates[k];
  }

  const keys = Object.keys(v2Updates);
  if (keys.length === 0) {
    return c.json({ success: true }); // No-op
  }

  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => {
    const val = v2Updates[k];
    return typeof val === 'boolean' ? (val ? 1 : 0) : val;
  });

  await c.env.DB.prepare(`
    UPDATE family_preferences
    SET ${setClause}, updated_at = datetime('now')
    WHERE parent_id = ?
  `).bind(...values, user.id).run();

  return c.json({ success: true });
});

// ============ FEEDBACK ROUTES ============

// 1. Toggle Upvote
app.post('/api/upvotes', async (c) => {
  try {
    const user = requireAuth(c);
    const { contentType, contentId } = await c.req.json() as { contentType: 'activity' | 'book'; contentId: string };

    if (!['activity', 'book'].includes(contentType)) {
      return c.json({ error: 'Invalid content type' }, 400);
    }

    // Check if already upvoted
    const existing = await c.env.DB.prepare(
      'SELECT id FROM content_upvotes WHERE user_id = ? AND content_type = ? AND content_id = ?'
    ).bind(user.id, contentType, contentId).first();

    let upvoted = false;

    if (existing) {
      // Remove upvote
      await c.env.DB.prepare(
        'DELETE FROM content_upvotes WHERE id = ?'
      ).bind(existing.id).run();
      upvoted = false;
    } else {
      // Add upvote
      const id = generateId('vote');
      await c.env.DB.prepare(
        'INSERT INTO content_upvotes (id, user_id, content_type, content_id) VALUES (?, ?, ?, ?)'
      ).bind(id, user.id, contentType, contentId).run();
      upvoted = true;
    }

    // Update aggregated count
    // Note: This is a simple counter update. For high scale, we'd use a queue or periodically recalculate.
    const countResult = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM content_upvotes WHERE content_type = ? AND content_id = ?`
    ).bind(contentType, contentId).first<{ count: number }>();

    const newCount = countResult?.count || 0;

    // Skipping update to source table as 'upvote_count' column is not available in new 'formations' schema.
    // Ideally we would update a stats table or rely on the join count.

    return c.json({ upvoted, newCount });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 2. Check Upvote Status
app.get('/api/upvotes/check', async (c) => {
  try {
    const user = requireAuth(c);
    const contentType = c.req.query('contentType');
    const contentId = c.req.query('contentId');

    if (!contentType || !contentId) return c.json({ error: 'Missing params' }, 400);

    const existing = await c.env.DB.prepare(
      'SELECT 1 FROM content_upvotes WHERE user_id = ? AND content_type = ? AND content_id = ?'
    ).bind(user.id, contentType, contentId).first();

    return c.json({ upvoted: !!existing });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 3. List Comments
app.get('/api/comments', async (c) => {
  try {
    const contentType = c.req.query('contentType');
    const contentId = c.req.query('contentId');

    if (!contentType || !contentId) return c.json({ error: 'Missing params' }, 400);

    const { results } = await c.env.DB.prepare(`
      SELECT 
        c.id, c.user_id as userId, c.content_type, c.content_id, 
        c.comment_text as commentText, c.is_success_story as isSuccessStory, 
        c.created_at as createdAt,
        u.name as userName, u.avatar_url as userAvatar
      FROM parent_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.content_type = ? AND c.content_id = ?
      ORDER BY c.created_at DESC
    `).bind(contentType, contentId).all();

    return c.json({ comments: results, count: results.length });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 4. Add Comment
app.post('/api/comments', async (c) => {
  try {
    const user = requireAuth(c);
    const { contentType, contentId, text, isSuccessStory } = await c.req.json() as any;

    if (!text || !text.trim()) return c.json({ error: 'Comment required' }, 400);

    const id = generateId('comment');
    const now = new Date().toISOString();

    await c.env.DB.prepare(`
      INSERT INTO parent_comments (id, user_id, content_type, content_id, comment_text, is_success_story, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, user.id, contentType, contentId, text.trim(), isSuccessStory ? 1 : 0, now, now).run();

    // Update count
    // Skipping table update as comment_count doesn't exist on formations

    const newComment = {
      id,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar_url,
      contentType,
      contentId,
      commentText: text.trim(),
      isSuccessStory: !!isSuccessStory,
      createdAt: now
    };

    return c.json({ comment: newComment });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 5. Delete Comment
app.delete('/api/comments/:id', async (c) => {
  try {
    const user = requireAuth(c);
    const commentId = c.req.param('id');

    // Verify ownership
    const comment = await c.env.DB.prepare(
      'SELECT * FROM parent_comments WHERE id = ?'
    ).bind(commentId).first<{ user_id: string, content_type: string, content_id: string }>();

    if (!comment) return c.json({ error: 'Not found' }, 404);
    if (comment.user_id !== user.id) return c.json({ error: 'Unauthorized' }, 403);

    await c.env.DB.prepare('DELETE FROM parent_comments WHERE id = ?').bind(commentId).run();

    // Update count skipped

    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// ============================================
// PHASE 2: PARENT OVERRIDES API
// ============================================

// Get all overrides for current user
app.get('/api/overrides', async (c) => {
  try {
    const user = requireAuth(c);
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM parent_overrides WHERE parent_id = ? AND is_active = 1 ORDER BY created_at DESC'
    ).bind(user.id).all();

    const overrides = results.map((r: any) => ({
      ...r,
      constraints: JSON.parse(r.constraints_json || '{}')
    }));

    return c.json(overrides);
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// Create a new override
app.post('/api/overrides', async (c) => {
  try {
    const user = requireAuth(c);
    const { studentId, overrideType, description, constraints } = await c.req.json();

    if (!overrideType || !description || !constraints) {
      return c.json({ error: 'overrideType, description, and constraints are required' }, 400);
    }

    const id = generateId('override');
    await c.env.DB.prepare(`
      INSERT INTO parent_overrides (id, parent_id, student_id, override_type, description, constraints_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(id, user.id, studentId || null, overrideType, description, JSON.stringify(constraints)).run();

    const override = await c.env.DB.prepare(
      'SELECT * FROM parent_overrides WHERE id = ?'
    ).bind(id).first();

    return c.json({
      ...override,
      constraints: JSON.parse((override as any)?.constraints_json || '{}')
    }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Update an override
app.put('/api/overrides/:id', async (c) => {
  try {
    const user = requireAuth(c);
    const overrideId = c.req.param('id');
    const { isActive, constraints } = await c.req.json();

    // Verify ownership
    const existing = await c.env.DB.prepare(
      'SELECT * FROM parent_overrides WHERE id = ? AND parent_id = ?'
    ).bind(overrideId, user.id).first();

    if (!existing) return c.json({ error: 'Override not found' }, 404);

    await c.env.DB.prepare(`
      UPDATE parent_overrides 
      SET is_active = COALESCE(?, is_active),
          constraints_json = COALESCE(?, constraints_json),
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      isActive !== undefined ? (isActive ? 1 : 0) : null,
      constraints ? JSON.stringify(constraints) : null,
      overrideId
    ).run();

    const updated = await c.env.DB.prepare(
      'SELECT * FROM parent_overrides WHERE id = ?'
    ).bind(overrideId).first();

    return c.json({
      ...updated,
      constraints: JSON.parse((updated as any)?.constraints_json || '{}')
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Delete an override
app.delete('/api/overrides/:id', async (c) => {
  try {
    const user = requireAuth(c);
    const overrideId = c.req.param('id');

    const existing = await c.env.DB.prepare(
      'SELECT * FROM parent_overrides WHERE id = ? AND parent_id = ?'
    ).bind(overrideId, user.id).first();

    if (!existing) return c.json({ error: 'Override not found' }, 404);

    await c.env.DB.prepare('DELETE FROM parent_overrides WHERE id = ?').bind(overrideId).run();

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// WEEKLY TIME MODEL API
// ============================================

// Get time model for current user
app.get('/api/time-model', async (c) => {
  try {
    const user = requireAuth(c);
    let model = await c.env.DB.prepare(
      'SELECT * FROM weekly_time_model WHERE parent_id = ?'
    ).bind(user.id).first();

    if (!model) {
      // Return defaults if not set
      model = {
        available_days: '["Mon","Tue","Wed","Thu","Fri"]',
        minutes_per_day: 45,
        preferred_times: '["morning"]',
        max_sessions_per_day: 2,
        field_trip_days: '[]'
      };
    }

    return c.json({
      ...model,
      availableDays: JSON.parse((model as any).available_days),
      preferredTimes: JSON.parse((model as any).preferred_times),
      fieldTripDays: JSON.parse((model as any).field_trip_days || '[]')
    });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// Update time model
app.put('/api/time-model', async (c) => {
  try {
    const user = requireAuth(c);
    // No-op for now as weekly_time_model is deprecated/migrating
    // Returning success with defaults
    const defaultModel = {
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      minutesPerDay: 45,
      preferredTimes: ['morning'],
      maxSessionsPerDay: 2,
      fieldTripDays: []
    };

    return c.json({
      id: 'default',
      ...defaultModel,
      available_days: JSON.stringify(defaultModel.availableDays),
      preferred_times: JSON.stringify(defaultModel.preferredTimes),
      field_trip_days: JSON.stringify(defaultModel.fieldTripDays)
    });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// ============================================
// PHASE 5: DETERMINISTIC WEEKLY PLANNER
// ============================================

// Import moved to top of file

// Get or generate weekly plan
app.get('/api/family/weekly-plan', async (c) => {
  try {
    const user = requireAuth(c);
    const weekStart = c.req.query('weekStart') || getSmartWeekStart();

    // Get children
    const { results: rawChildren } = await c.env.DB.prepare(
      'SELECT id, name, date_of_birth FROM students WHERE household_id = ? ORDER BY date_of_birth DESC'
    ).bind(user.household_id).all();

    const children = rawChildren.map((child: any) => {
      const dob = new Date(child.date_of_birth);
      const now = new Date();
      const months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
      return { ...child, age_in_months: months };
    });

    if (children.length === 0) {
      return c.json({ error: 'No children found. Add a child first.' }, 400);
    }

    // Fetch completions for this week
    const weekEndDate = new Date(weekStart);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    const weekEnd = weekEndDate.toISOString().split('T')[0];

    // Fetch completions for this week (unified evidences)
    const completionsResult = await c.env.DB.prepare(`
        SELECT formation_id as activity_id, captured_at as completed_at, 'evidence' as type 
        FROM evidences
        WHERE parent_id = ? AND date(captured_at) >= ? AND date(captured_at) <= ?
    `).bind(user.id, weekStart, weekEnd).all();

    const completions: Record<string, any> = {};
    if (completionsResult.results) {
      completionsResult.results.forEach((r: any) => {
        completions[r.activity_id] = {
          completedAt: r.completed_at,
          type: r.type
        };
      });
    }

    // Check for cached plan
    const cachedPlan = await c.env.DB.prepare(
      'SELECT * FROM weekly_plans WHERE parent_id = ? AND week_start = ?'
    ).bind(user.id, weekStart).first();

    if (cachedPlan) {
      return c.json({
        ...cachedPlan,
        plan: JSON.parse((cachedPlan as any).plan_json),
        cached: true,
        completions
      });
    }

    // Get time model (using defaults as weekly_time_model is deprecated)
    const timeModel = {
      available_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      minutes_per_day: 45,
      preferred_times: ['morning'],
      max_sessions_per_day: 2,
      field_trip_days: []
    };

    // Get overrides
    // Get overrides (parent_overrides deprecated)
    const overrideRows: any[] = [];

    // Get activities
    const ages = children.map((c: any) => c.age_in_months);
    const youngestAge = Math.min(...ages);
    const oldestAge = Math.max(...ages);

    const { results: activities } = await c.env.DB.prepare(`
      SELECT id, title, primary_virtue as domain, min_age_months, max_age_months, duration_minutes,
             materials, context_anchor as cluster_tag, mess_level, formation_type as activity_type, primary_tier
      FROM formations
      WHERE min_age_months <= ? AND max_age_months >= ?
        AND is_active = 1
        AND (is_archived = 0 OR is_archived IS NULL)
        AND (content_status != 'blacklisted' OR content_status IS NULL)
    `).bind(oldestAge, youngestAge).all();

    // Parse materials
    const parsedActivities = activities.map((a: any) => ({
      ...a,
      materials: JSON.parse(a.materials || '[]')
    }));

    // Get recent activity IDs (last 14 days) - NOT needed for Unified Planner if using scoreActivity which checks DB
    // But we still pass it for compatibility or maybe optimization?
    // Actually, unified planner uses scoreActivity which queries history directly.
    // So we can pass empty list or update planner to not need it.
    // Let's pass empty list as we updated scoreActivity.
    const recentActivityIds: string[] = [];

    // Generate plan
    const plan = await generateWeeklyPlan(
      children as any,
      parsedActivities as any,
      timeModel,
      overrideRows as any,
      c.env.DB,
      user.id,
      'mixed' // Default for new plans
    );

    // Cache the plan
    const planId = generateId('plan');
    await c.env.DB.prepare(`
      -- NOTE: keep this insert compatible across schema variants.
      -- Some environments have legacy columns (override_version, generated_at, tier_distribution)
      -- while V2 minimal schema only has (id, parent_id, week_start, plan_json, balance_preference, created_at).
      INSERT INTO weekly_plans (id, parent_id, week_start, plan_json)
      VALUES (?, ?, ?, ?)
    `).bind(planId, user.id, weekStart, JSON.stringify(plan)).run();

    return c.json({
      id: planId,
      weekStart,
      plan,
      cached: false,
      completions
    });
  } catch (error: any) {
    console.error('Weekly plan error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// Regenerate weekly plan (clears cache)
app.post('/api/family/weekly-plan/regenerate', async (c) => {
  try {
    const user = requireAuth(c);
    const { balancePreference = 'mixed', weekStart } = await c.req.json();

    // Validate weekStart (must be a Monday, cannot be in the past unless same week)
    const targetWeek = weekStart || getSmartWeekStart();

    // Note: To properly support balancePreference, we would need to pass it to generateWeeklyPlan
    // For now, we are just storing it.

    // Delete cached plan
    await c.env.DB.prepare(
      'DELETE FROM weekly_plans WHERE parent_id = ? AND week_start = ?'
    ).bind(user.id, targetWeek).run();

    // We can't redirect with POST body params easily if the GET doesn't take them.
    // The previous implementation redirected to GET.
    // But now we want to apply balancePreference which implies we should generate it here.

    // Let's replicate generation logic here OR update the GET endpoint to accept preferences (but GET shouldn't have side effects usually, though this one does generate/cache).

    // Ideally, we just delete the old plan and call the generation logic directly.

    // Get children
    const { results: rawChildren } = await c.env.DB.prepare(
      'SELECT id, name, date_of_birth FROM students WHERE household_id = ? ORDER BY date_of_birth DESC'
    ).bind(user.household_id).all();

    const children = rawChildren.map((child: any) => {
      const dob = new Date(child.date_of_birth);
      const now = new Date();
      const months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
      return { ...child, age_in_months: months };
    });

    if (children.length === 0) {
      return c.json({ error: 'No children found. Add a child first.' }, 400);
    }

    // Get time model
    const timeModelRow = await c.env.DB.prepare(
      'SELECT * FROM weekly_time_model WHERE parent_id = ?'
    ).bind(user.id).first();

    const timeModel = timeModelRow ? {
      available_days: JSON.parse((timeModelRow as any).available_days),
      minutes_per_day: (timeModelRow as any).minutes_per_day,
      preferred_times: JSON.parse((timeModelRow as any).preferred_times),
      max_sessions_per_day: (timeModelRow as any).max_sessions_per_day,
      field_trip_days: JSON.parse((timeModelRow as any).field_trip_days || '[]')
    } : {
      available_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      minutes_per_day: 45,
      preferred_times: ['morning'],
      max_sessions_per_day: 2,
      field_trip_days: []
    };

    // Get overrides
    const { results: overrideRows } = await c.env.DB.prepare(
      'SELECT * FROM parent_overrides WHERE parent_id = ? AND is_active = 1'
    ).bind(user.id).all();

    // Get activities
    const ages = children.map((c: any) => c.age_in_months);
    const youngestAge = Math.min(...ages);
    const oldestAge = Math.max(...ages);

    const { results: activities } = await c.env.DB.prepare(`
      SELECT id, title, primary_virtue as domain, min_age_months, max_age_months, duration_minutes,
             materials, context_anchor as cluster_tag, mess_level, formation_type as activity_type, primary_tier
      FROM formations
      WHERE min_age_months <= ? AND max_age_months >= ?
        AND is_active = 1
        AND (is_archived = 0 OR is_archived IS NULL)
        AND (content_status != 'blacklisted' OR content_status IS NULL)
    `).bind(oldestAge, youngestAge).all();

    // Parse materials
    const parsedActivities = activities.map((a: any) => ({
      ...a,
      materials: JSON.parse(a.materials || '[]')
    }));

    // Generate plan
    const plan = await generateWeeklyPlan(
      children as any,
      parsedActivities as any,
      timeModel,
      overrideRows as any,
      c.env.DB,
      user.id,
      balancePreference
    );

    const planId = generateId('plan');

    // Keep regenerate write-path compatible with both legacy + V2 schemas.
    // We already deleted cached plan above; do a simple insert without ON CONFLICT.
    await c.env.DB.prepare(`
      INSERT INTO weekly_plans (id, parent_id, week_start, plan_json)
      VALUES (?, ?, ?, ?)
    `).bind(planId, user.id, targetWeek, JSON.stringify(plan)).run();

    // Fetch completions for this week
    const weekEndDate = new Date(targetWeek);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    const weekEnd = weekEndDate.toISOString().split('T')[0];

    const completionsResult = await c.env.DB.prepare(`
        SELECT formation_id as activity_id, captured_at as completed_at, 'completion' as type FROM evidences
        WHERE parent_id = ? AND date(captured_at) >= ? AND date(captured_at) <= ?
    `).bind(user.id, targetWeek, weekEnd).all();

    const completions: Record<string, any> = {};
    if (completionsResult.results) {
      completionsResult.results.forEach((r: any) => {
        completions[r.activity_id] = {
          completedAt: r.completed_at,
          type: r.type
        };
      });
    }

    return c.json({
      id: planId,
      weekStart: targetWeek,
      plan,
      cached: false,
      completions
    });


  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});


// Phase 5 rhythm/readjust endpoint moved to line 4496 (uses AiCoach for better reliability)


// ============================================
// PHASE 3: AI INPUT NORMALIZATION
// ============================================

// Parse free-text parent input into structured override
app.post('/api/overrides/parse', async (c) => {
  try {
    const user = requireAuth(c);
    const { freeText, studentId } = await c.req.json();

    if (!freeText || typeof freeText !== 'string') {
      return c.json({ error: 'freeText is required' }, 400);
    }

    const systemPrompt = `You are a helper that converts parent descriptions of their child's needs into a structured JSON format.

You may ONLY output valid JSON matching this schema:
{
  "overrideType": "sensory" | "motor" | "schedule" | "content" | "pacing",
  "constraints": {
    "exclude_tags": ["list of activity types to avoid"],
    "exclude_materials": ["specific materials to avoid"],
    "prefer_tags": ["activity types to prioritize"],
    "prefer_domains": ["domains to emphasize"],
    "reduce_duration": boolean,
    "require_quiet": boolean,
    "require_low_mess": boolean,
    "require_outdoor": boolean,
    "require_seated": boolean,
    "custom_note": "any additional context"
  },
  "confidence": 0.0-1.0,
  "clarification_needed": "question to ask if unclear" or null
}

Common mappings:
- "loud sounds" / "noise sensitive" → require_quiet: true
- "struggles with sitting still" / "high energy" → exclude_tags: ["seated"], prefer_tags: ["outdoor", "movement"]
- "gets overwhelmed easily" → require_quiet: true, reduce_duration: true
- "messy activities are hard" / "hates mess" → require_low_mess: true
- "loves being outside" → require_outdoor: true
- "needs movement breaks" → reduce_duration: true
- "sensory issues with textures" → exclude_materials: ["playdough", "slime", "paint"]
- "speech delay" → prefer_domains: ["language"]
- "very active" → prefer_tags: ["movement", "outdoor"], exclude_tags: ["seated"]

Be conservative. Only include constraints you are confident about.
If unsure, set confidence < 0.7 and provide a clarifying question.
Do NOT invent constraints not supported by the input.`;

    try {
      const response = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: freeText }
        ],
        max_tokens: 500
      });

      // Extract JSON from response (may have markdown code blocks)
      let jsonStr = response.response;
      const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/) ||
        jsonStr.match(/```\s*([\s\S]*?)\s*```/) ||
        [null, jsonStr];
      jsonStr = jsonMatch[1] || jsonStr;

      const parsed = JSON.parse(jsonStr.trim());

      return c.json({
        success: true,
        originalText: freeText,
        parsed,
        requiresConfirmation: parsed.confidence < 0.7 || !!parsed.clarification_needed
      });
    } catch (parseError) {
      console.error('AI parse error:', parseError);
      // Fallback: return a generic response asking for more details
      return c.json({
        success: false,
        originalText: freeText,
        parsed: null,
        requiresConfirmation: true,
        fallbackMessage: "I couldn't fully understand that. Could you describe your child's needs in simpler terms? For example: 'My child is sensitive to loud sounds' or 'She needs lots of movement.'"
      });
    }
  } catch (error: any) {
    console.error('Override parse error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// ============================================
// PHASE 4: VECTORIZE CURRICULUM EXPLANATIONS
// ============================================

// Explain curriculum decisions using RAG
app.post('/api/explain', async (c) => {
  try {
    const user = requireAuth(c);
    const { question, context } = await c.req.json();

    if (!question || typeof question !== 'string') {
      return c.json({ error: 'question is required' }, 400);
    }

    // Generate embedding for the question
    let contextDocs = '';
    let sources: string[] = [];

    try {
      const embeddingResult = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', {
        text: question
      });

      // Query Vectorize for relevant curriculum docs
      const matches = await c.env.CURRICULUM_INDEX.query(embeddingResult.data[0], {
        topK: 3,
        returnMetadata: true
      });

      sources = matches.matches?.map((m: any) => m.id) || [];
      contextDocs = matches.matches
        ?.map((m: any) => m.metadata?.content || '')
        .filter(Boolean)
        .join('\n\n') || '';
    } catch (vectorError) {
      console.log('Vectorize query failed (index may be empty):', vectorError);
      // Continue without vector context - will use fallback
    }

    // Build system prompt
    const systemPrompt = `You are SchoolOS, a Christian homeschool planning assistant built on Reformed principles.
You answer questions about why certain activities are recommended for children.

${contextDocs ? `Use the following curriculum context to inform your answer:
---
${contextDocs}
---` : ''}

Guidelines:
- Speak with warmth and encouragement to parents
- Reference biblical principles when relevant (stewardship, dominion, wisdom)
- Be practical and specific
- If you don't have information about something, say so honestly
- Never invent curriculum content or developmental claims
- Keep answers concise (2-3 paragraphs max)

${context?.activityId ? `The parent is asking about activity ID: ${context.activityId}` : ''}
${context?.domain ? `Context domain: ${context.domain}` : ''}
${context?.childAge ? `Child's age: ${context.childAge} months` : ''}`;

    const response = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      max_tokens: 600
    });

    // Log for transparency
    const logId = generateId('explainlog');
    await c.env.DB.prepare(`
      INSERT INTO explanation_logs (id, parent_id, question, answer, sources_json)
      VALUES (?, ?, ?, ?, ?)
    `).bind(logId, user.id, question, response.response, JSON.stringify(sources)).run();

    return c.json({
      answer: response.response,
      sources,
      confidence: sources.length > 0 ? 0.8 : 0.5
    });
  } catch (error: any) {
    console.error('Explain error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// Narrate a weekly plan in human-friendly language
app.post('/api/plan/narrate', async (c) => {
  try {
    const user = requireAuth(c);
    const { plan, tone = 'encouraging' } = await c.req.json();

    if (!plan) {
      return c.json({ error: 'plan is required' }, 400);
    }

    const toneInstructions: Record<string, string> = {
      'encouraging': 'Be warm, positive, and motivating. Celebrate what the family will accomplish.',
      'calm': 'Be gentle and reassuring. Emphasize that flexibility is okay.',
      'concise': 'Be brief and practical. Focus on actionable steps only.'
    };

    const systemPrompt = `You are SchoolOS, helping a homeschooling parent understand their weekly learning plan.
Convert this structured plan into a warm, encouraging narrative.

Tone: ${toneInstructions[tone] || toneInstructions['encouraging']}

Rules:
- Do NOT invent activities or change the plan
- Do NOT add activities not in the plan
- Focus on practical tips for implementation
- Reference the specific days and activities
- Keep it to 2-3 short paragraphs
- End with an encouraging note`;

    const response = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(plan, null, 2) }
      ],
      max_tokens: 500
    });

    return c.json({
      narrative: response.response,
      originalPlan: plan
    });
  } catch (error: any) {
    console.error('Narrate error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// ============================================
// PHASE 2: AI WEEKLY SUMMARIES & FEEDBACK
// ============================================

// Generate weekly summary with patterns (Phase 2)
app.post('/api/ai/weekly-summary', async (c) => {
  try {
    const user = requireAuth(c);
    const { weekStart } = await c.req.json();

    if (!weekStart) {
      return c.json({ error: 'weekStart is required' }, 400);
    }

    // Calculate week end
    const weekEndDate = new Date(weekStart);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    const weekEnd = weekEndDate.toISOString().split('T')[0];

    // Get children
    const { results: children } = await c.env.DB.prepare(
      'SELECT id, name, age_in_months FROM students WHERE parent_id = ?'
    ).bind(user.id).all();

    // Get all evidences for the week (unified completions and observations)
    const { results: evidences } = await c.env.DB.prepare(`
      SELECT e.formation_id, e.captured_at, e.notes, e.habit_stage, e.student_id,
             f.title, f.primary_virtue as domain,
             s.name as child_name
      FROM evidences e
      LEFT JOIN formations f ON e.formation_id = f.id
      LEFT JOIN students s ON e.student_id = s.id
      WHERE e.parent_id = ? AND date(e.captured_at) >= ? AND date(e.captured_at) <= ?
    `).bind(user.id, weekStart, weekEnd).all();

    if (evidences.length === 0) {
      return c.json({
        summary: "This week hasn't had any recorded activities yet. That's perfectly okay – rest and family time are valuable too!",
        patterns: [],
        suggestedQuestions: []
      });
    }

    // Build context for AI
    const evidenceContext = evidences.map((e: any) => {
      const who = e.child_name || 'Family';
      const what = e.title || 'Activity';
      const when = e.captured_at;
      const details = [];
      if (e.habit_stage) details.push(`Stage: ${e.habit_stage}`);
      if (e.notes) details.push(`Notes: ${e.notes}`);
      return `- ${who} completed "${what}" (${e.domain}) on ${when}. ${details.join('. ')}`;
    }).join('\n');

    const systemPrompt = `You are SchoolOS, a Christian homeschool assistant. Generate a warm, encouraging weekly summary for parents.

IMPORTANT: Your language must be ADVISORY, never AUTHORITATIVE. Use phrases like:
- "I noticed..." instead of "Your child should..."
- "You might consider..." instead of "You need to..."
- "It seems like..." instead of "Your child is..."

Children: ${children.map((c: any) => `${c.name} (${Math.floor(c.age_in_months / 12)} years)`).join(', ')}

Activities completed this week:
${evidenceContext || 'No activities recorded'}

Generate:
1. A 2-3 paragraph summary of what happened this week (celebratory, not evaluative)
2. 2-3 patterns you noticed (phrased as observations, not judgments)
3. 2-3 discussion questions the parent could use

Output as JSON:
{
  "summary": "string",
  "patterns": ["string", "string"],
  "suggestedQuestions": ["string", "string"]
}`;

    const response = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate the weekly summary.' }
      ],
      max_tokens: 800
    });

    // Parse response
    let parsed;
    try {
      const jsonStr = response.response.match(/\{[\s\S]*\}/)?.[0] || response.response;
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = {
        summary: response.response,
        patterns: [],
        suggestedQuestions: []
      };
    }

    return c.json({
      weekStart,
      weekEnd,
      completionCount: evidences.length,
      observationCount: 0, // Deprecated count
      ...parsed
    });
  } catch (error: any) {
    console.error('Weekly summary error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// Get AI interaction logs for parent visibility (Phase 3)
app.get('/api/ai/interactions', async (c) => {
  try {
    const user = requireParent(c);
    const studentId = c.req.query('studentId');

    // Query ai_interaction_logs (or ai_logs depending on which table exists)
    // Try ai_interaction_logs first (legacy), fall back to ai_logs (V2)
    let logs: any[] = [];
    
    try {
      // Try legacy table first
      let query = `
        SELECT l.id, l.parent_id, l.student_id, l.interaction_type, l.question, l.answer, l.context_json, l.created_at,
               s.name as student_name
        FROM ai_interaction_logs l
        LEFT JOIN students s ON l.student_id = s.id
        WHERE l.parent_id = ?
      `;
      const params: any[] = [user.id];
      
      if (studentId) {
        query += ' AND l.student_id = ?';
        params.push(studentId);
      }
      
      query += ' ORDER BY l.created_at DESC LIMIT 50';
      
      const result = await c.env.DB.prepare(query).bind(...params).all();
      logs = result.results || [];
    } catch (legacyErr) {
      // Fall back to V2 ai_logs table
      console.log('Falling back to ai_logs table:', legacyErr);
      let query = `
        SELECT l.id, l.parent_id, l.student_id, l.interaction_type, l.question, l.answer, l.context_json, l.created_at,
               s.name as student_name
        FROM ai_logs l
        LEFT JOIN students s ON l.student_id = s.id
        WHERE l.parent_id = ?
      `;
      const params: any[] = [user.id];
      
      if (studentId) {
        query += ' AND l.student_id = ?';
        params.push(studentId);
      }
      
      query += ' ORDER BY l.created_at DESC LIMIT 50';
      
      const result = await c.env.DB.prepare(query).bind(...params).all();
      logs = result.results || [];
    }

    // Transform to frontend format
    const formattedLogs = logs.map((log: any) => ({
      id: log.id,
      studentId: log.student_id,
      studentName: log.student_name,
      interactionType: log.interaction_type,
      question: log.question,
      answer: log.answer,
      context: log.context_json ? JSON.parse(log.context_json) : null,
      createdAt: log.created_at
    }));

    return c.json(formattedLogs);
  } catch (error: any) {
    console.error('AI interactions error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// Generate streaming chat response (Phase 3)
app.post('/api/ai/chat', async (c) => {
  try {
    const user = requireAuth(c);
    const { message, context, mode } = await c.req.json();

    // Initialize coach with full context
    const coach = new AiCoach(c.env);

    // Fetch active settings to inject into context
    const { results: overrides } = await c.env.DB.prepare(
      'SELECT * FROM parent_overrides WHERE parent_id = ? AND is_active = 1'
    ).bind(user.id).all();

    const liturgySettings = await c.env.DB.prepare(
      'SELECT * FROM family_liturgy_settings WHERE parent_id = ?'
    ).bind(user.id).first();

    // Add user to context, include studentId for student mode logging
    const fullContext = {
      ...context,
      user: { id: user.id, name: user.name },
      activeOverrides: overrides,
      liturgySettings: liturgySettings,
      studentId: user.role === 'student' ? user.student_id : context?.studentId
    };

    // Determine mode: explicit param or inferred from user role
    const chatMode = mode || (user.role === 'student' ? 'student' : 'parent');

    const stream = await coach.chat(message, fullContext, chatMode);

    return new Response(stream as any, {
      headers: {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        'connection': 'keep-alive'
      }
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// Get strategic insights for weekly plan
app.post('/api/family/weekly-plan/strategic-insight', async (c) => {
  try {
    const user = requireAuth(c);
    const { plan, children } = await c.req.json();

    if (!plan || !children) {
      return c.json({ error: 'Plan and children data required' }, 400);
    }

    const coach = new AiCoach(c.env);
    const insights = await coach.generateStrategicInsights(plan, children);

    return c.json(insights);
  } catch (error: any) {
    console.error('Strategic insight error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Generate draft feedback text for parents to edit (Phase 2)
app.post('/api/ai/feedback-draft', async (c) => {
  try {
    const user = requireAuth(c);
    const { studentId, weekStart, context } = await c.req.json();

    if (!studentId) {
      return c.json({ error: 'studentId is required' }, 400);
    }

    // Get student info
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND parent_id = ?'
    ).bind(studentId, user.id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    // Get recent observations
    const { results: observations } = await c.env.DB.prepare(`
      SELECT o.mastery_level, o.parent_notes, o.completed_at, f.title, f.primary_virtue as domain
      FROM observations o
      LEFT JOIN formations f ON o.activity_id = f.id
      WHERE o.student_id = ?
      ORDER BY o.completed_at DESC
      LIMIT 10
    `).bind(studentId).all();

    const observationContext = observations.map((o: any) =>
      `- ${o.title} (${o.domain}): ${o.mastery_level}${o.parent_notes ? ' – ' + o.parent_notes : ''}`
    ).join('\n');

    const systemPrompt = `You are helping a homeschooling parent draft observational notes about their child.

Child: ${(student as any).name}, age ${Math.floor((student as any).age_in_months / 12)} years

Recent observations:
${observationContext || 'No recent observations'}

${context ? `Additional context from parent: ${context}` : ''}

Write a warm, narrative draft (2-3 paragraphs) that:
- Uses "I" perspective (parent voice)
- Focuses on GROWTH and CHARACTER, not metrics
- Celebrates specific moments
- Avoids comparisons or grade-level language
- Can be edited by the parent before saving

The parent will edit this before using it. Make it personal and warm.`;

    const response = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate the feedback draft.' }
      ],
      max_tokens: 500
    });

    return c.json({
      draft: response.response,
      studentName: (student as any).name,
      isEditable: true,
      note: "This is a draft. Please review and edit before saving to the portfolio."
    });
  } catch (error: any) {
    console.error('Feedback draft error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// ============================================
// PHASE 1: PORTFOLIO STORAGE
// ============================================

// Get upload URL for portfolio item
app.post('/api/portfolio/upload', async (c) => {
  try {
    const user = requireAuth(c);
    const { filename, contentType } = await c.req.json();

    if (!filename || !contentType) {
      return c.json({ error: 'filename and contentType required' }, 400);
    }

    const key = `${user.id}/${Date.now()}-${filename}`;

    // In a real R2 setup, we would generate a presigned URL here.
    // Since we are using R2 bindings directly in the worker for now,
    // we might need a different approach for direct uploads from frontend.
    // For MVP, we can proxy the upload or use a PUT endpoint.

    // However, the standard R2 way is presigned URLs.
    // Cloudflare Workers with R2 bindings don't support `getSignedUrl` directly on the binding object easily without AWS SDK.
    // For simplicity in this environment, we will use a PUT endpoint on the worker itself to handle the upload.

    // Use current worker origin for upload handler
    const baseUrl = new URL(c.req.url).origin;

    return c.json({
      uploadUrl: `${baseUrl}/api/portfolio/upload-handler?key=${encodeURIComponent(key)}`,
      key,
      publicUrl: `/api/portfolio/file/${encodeURIComponent(key)}`
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Handle direct upload (MVP alternative to presigned URLs)
app.put('/api/portfolio/upload-handler', async (c) => {
  try {
    const user = requireAuth(c);
    const key = c.req.query('key');

    // Security: Strict path validation
    // Ensure key starts with "{user.id}/" to prevent uploading to other users' directories
    if (!key || !key.startsWith(`${user.id}/`)) {
      return c.json({ error: 'Invalid key or unauthorized' }, 403);
    }

    const body = await c.req.arrayBuffer();

    // We reuse the BOOKS_BUCKET for now or should add a separate bucket binding
    // Ideally we add PORTFOLIO_BUCKET to Env
    // For now, let's assume BOOKS_BUCKET or we need to add it to wrangler.toml
    // Using BOOKS_BUCKET for now as "storage" bucket
    await c.env.BOOKS_BUCKET.put(`portfolio/${key}`, body);

    return c.json({ success: true, key: `portfolio/${key}` });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Create portfolio item record
app.post('/api/portfolio/items', async (c) => {
  try {
    const user = requireAuth(c);
    const body = await c.req.json();
    const { studentId, title, description, itemType, r2Key, domain, relatedActivityId, milestoneTag } = body;

    if (!studentId || !title || !itemType) {
      return c.json({ error: 'studentId, title, and itemType are required' }, 400);
    }

    // Security: Validate that r2Key belongs to this user
    // This prevents IDOR where users claim ownership of others' files
    if (r2Key && !r2Key.startsWith(`${user.id}/`)) {
      return c.json({ error: 'Invalid file key' }, 403);
    }

    const id = generateId('port');
    await c.env.DB.prepare(`
      INSERT INTO portfolio_items (id, student_id, parent_id, title, description, item_type, r2_key, domain, related_activity_id, milestone_tag)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, studentId, user.id, title, description, itemType, r2Key, domain, relatedActivityId, milestoneTag || null).run();

    return c.json({ id, success: true }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// List portfolio items with filtering
app.get('/api/portfolio/:studentId', async (c) => {
  try {
    const user = requireAuth(c);
    const studentId = c.req.param('studentId');
    const domain = c.req.query('domain');
    const itemType = c.req.query('itemType');
    const timePeriod = c.req.query('timePeriod'); // 'week', 'month', 'year', 'all'
    const milestoneOnly = c.req.query('milestoneOnly') === 'true';

    let query = 'SELECT * FROM portfolio_items WHERE student_id = ? AND parent_id = ?';
    const params: any[] = [studentId, user.id];

    if (domain) {
      query += ' AND domain = ?';
      params.push(domain);
    }

    if (itemType) {
      query += ' AND item_type = ?';
      params.push(itemType);
    }

    if (milestoneOnly) {
      query += ' AND milestone_tag IS NOT NULL';
    }

    // Time period filtering
    if (timePeriod && timePeriod !== 'all') {
      const now = new Date();
      let startDate: string;

      switch (timePeriod) {
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          startDate = weekAgo.toISOString().split('T')[0];
          break;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          startDate = monthAgo.toISOString().split('T')[0];
          break;
        case 'year':
          const yearAgo = new Date(now);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          startDate = yearAgo.toISOString().split('T')[0];
          break;
        default:
          startDate = '';
      }

      if (startDate) {
        query += ' AND date(created_at) >= ?';
        params.push(startDate);
      }
    }

    query += ' ORDER BY created_at DESC';

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    // Map results to include public URLs and camelCase fields
    const items = results.map((item: any) => ({
      id: item.id,
      studentId: item.student_id,
      parentId: item.parent_id,
      title: item.title,
      description: item.description,
      itemType: item.item_type,
      domain: item.domain,
      relatedActivityId: item.related_activity_id,
      milestoneTag: item.milestone_tag,
      createdAt: item.created_at,
      publicUrl: item.r2_key ? `/api/portfolio/file/${encodeURIComponent(item.r2_key)}` : null
    }));

    return c.json(items);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Serve portfolio file
app.get('/api/portfolio/file/:key', async (c) => {
  try {
    const user = requireAuth(c);
    const key = c.req.param('key'); // Should include 'portfolio/' prefix if we added it

    // Security: Strict path validation
    // 1. Owner Access (Fast Path): Check if user is the uploader
    const validPrefix1 = `${user.id}/`;
    const validPrefix2 = `portfolio/${user.id}/`;
    const isOwner = key.startsWith(validPrefix1) || key.startsWith(validPrefix2);

    let isAuthorized = isOwner;

    // 2. Household Access (Slow Path): Check if file belongs to household student
    if (!isAuthorized && user.household_id) {
       const authorized = await c.env.DB.prepare(`
         SELECT 1
         FROM portfolio_items p
         JOIN students s ON p.student_id = s.id
         WHERE p.r2_key = ? AND s.household_id = ?
       `).bind(key, user.household_id).first();

       if (authorized) {
         isAuthorized = true;
       }
    }

    if (!isAuthorized) {
      return c.json({ error: 'Unauthorized access to file' }, 403);
    }

    // Try finding the file (handle potential missing 'portfolio/' prefix in stored key)
    let object = await c.env.BOOKS_BUCKET.get(key);

    if (!object) {
      // Fallback: Try with portfolio/ prefix if not found directly
      object = await c.env.BOOKS_BUCKET.get(`portfolio/${key}`);
    }

    if (!object) {
      return c.json({ error: 'File not found' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    // Security: Prevent execution of uploaded HTML/JS by forcing download
    // Sanitize filename to prevent header injection
    const filename = key.split('/').pop()?.replace(/"/g, '') || 'download';
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('X-Content-Type-Options', 'nosniff');

    return new Response(object.body, {
      headers,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Delete portfolio item

// Get student independence settings
app.get('/api/independence-settings/:studentId', async (c) => {
  try {
    const user = requireHouseholdMember(c);
    const studentId = c.req.param('studentId');

    // Verify ownership
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND household_id = ?'
    ).bind(studentId, user.household_id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    // Try to parse settings from student record if column exists
    // Default to parent-led if missing or error
    let settings = {
      mode: 'parent_led',
      canMarkComplete: false,
      canEditPlan: false,
      checklistMode: 'simple'
    };

    try {
      if ((student as any).independence_settings) {
        const parsed = JSON.parse((student as any).independence_settings);
        settings = { ...settings, ...parsed };
      }
    } catch (e) {
      // Ignore parsing errors or missing column
    }

    return c.json(settings);
  } catch (error: any) {
    // If column doesn't exist, it might throw, but we caught it above?
    // Actually SELECT * won't throw if column missing?
    // Wait, SELECT * will only return columns that exist.
    // So (student as any).independence_settings will just be undefined.
    // Safe.
    return c.json({ error: error.message }, 500);
  }
});

// Update independence settings
app.put('/api/independence-settings/:studentId', async (c) => {
  try {
    const user = requireParent(c); // Only parents can change this
    const studentId = c.req.param('studentId');
    const updates = await c.req.json();

    // Check if column exists by trying to update it.
    // If it fails, we might need to store in family_preferences overrides as fallback?
    // For now, assume migration v2_0002 will be run.

    await c.env.DB.prepare(
      'UPDATE students SET independence_settings = ? WHERE id = ? AND household_id = ?'
    ).bind(JSON.stringify(updates), studentId, user.household_id).run();

    return c.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update independence settings", error);
    // Fallback: If column missing, maybe just succeed silently so UI doesn't crash?
    // Or return 500.
    return c.json({ error: 'Failed to update settings. Migration pending?' }, 500);
  }
});

// ============ LEARNING PATHS API ============

// List all active learning paths (public)
app.get('/api/paths', async (c) => {
  try {
    const result = await c.env.DB.prepare(
      'SELECT * FROM learning_paths WHERE is_active = 1 ORDER BY sort_order ASC'
    ).all();

    return c.json(result.results || []);
  } catch (error: any) {
    console.error('Error fetching learning paths:', error);
    // Return empty array if table doesn't exist yet
    return c.json([]);
  }
});

// Get user's path subscriptions (authenticated)
app.get('/api/paths/subscriptions', async (c) => {
  try {
    const user = requireAuth(c);

    const result = await c.env.DB.prepare(`
      SELECT 
        fps.*,
        lp.title as path_title,
        lp.path_type,
        lp.total_items
      FROM family_path_subscriptions fps
      JOIN learning_paths lp ON fps.path_id = lp.id
      WHERE fps.parent_id = ?
      ORDER BY fps.started_at DESC
    `).bind(user.id).all();

    return c.json(result.results || []);
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    return c.json([]);
  }
});

// Subscribe to a path
app.post('/api/paths/:pathId/subscribe', async (c) => {
  try {
    const user = requireAuth(c);
    const pathId = c.req.param('pathId');

    // Check if path exists
    const path = await c.env.DB.prepare(
      'SELECT * FROM learning_paths WHERE id = ? AND is_active = 1'
    ).bind(pathId).first();

    if (!path) {
      return c.json({ error: 'Path not found' }, 404);
    }

    // Check if already subscribed
    const existing = await c.env.DB.prepare(
      'SELECT * FROM family_path_subscriptions WHERE parent_id = ? AND path_id = ?'
    ).bind(user.id, pathId).first();

    if (existing) {
      return c.json({ error: 'Already subscribed to this path' }, 400);
    }

    const subscriptionId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO family_path_subscriptions (id, parent_id, path_id, started_at, current_position, is_paused)
      VALUES (?, ?, ?, datetime('now'), 1, 0)
    `).bind(subscriptionId, user.id, pathId).run();

    const subscription = await c.env.DB.prepare(
      'SELECT * FROM family_path_subscriptions WHERE id = ?'
    ).bind(subscriptionId).first();

    return c.json({ success: true, subscription });
  } catch (error: any) {
    console.error('Error subscribing to path:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Pause a path subscription
app.post('/api/paths/:pathId/pause', async (c) => {
  try {
    const user = requireAuth(c);
    const pathId = c.req.param('pathId');

    await c.env.DB.prepare(`
      UPDATE family_path_subscriptions 
      SET is_paused = 1 
      WHERE parent_id = ? AND path_id = ?
    `).bind(user.id, pathId).run();

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Resume a path subscription
app.post('/api/paths/:pathId/resume', async (c) => {
  try {
    const user = requireAuth(c);
    const pathId = c.req.param('pathId');

    await c.env.DB.prepare(`
      UPDATE family_path_subscriptions 
      SET is_paused = 0 
      WHERE parent_id = ? AND path_id = ?
    `).bind(user.id, pathId).run();

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Unsubscribe from a path
app.delete('/api/paths/:pathId/unsubscribe', async (c) => {
  try {
    const user = requireAuth(c);
    const pathId = c.req.param('pathId');

    await c.env.DB.prepare(`
      DELETE FROM family_path_subscriptions 
      WHERE parent_id = ? AND path_id = ?
    `).bind(user.id, pathId).run();

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Advance position in a path subscription
app.post('/api/paths/:pathId/advance', async (c) => {
  try {
    const user = requireAuth(c);
    const pathId = c.req.param('pathId');

    // Get current subscription
    const subscription = await c.env.DB.prepare(`
      SELECT fps.*, lp.total_items 
      FROM family_path_subscriptions fps
      JOIN learning_paths lp ON fps.path_id = lp.id
      WHERE fps.parent_id = ? AND fps.path_id = ?
    `).bind(user.id, pathId).first() as any;

    if (!subscription) {
      return c.json({ error: 'Subscription not found' }, 404);
    }

    const newPosition = (subscription.current_position || 1) + 1;
    const isCompleted = subscription.total_items && newPosition > subscription.total_items;

    if (isCompleted) {
      // Mark path as completed
      await c.env.DB.prepare(`
        UPDATE family_path_subscriptions 
        SET current_position = ?, completed_at = datetime('now')
        WHERE parent_id = ? AND path_id = ?
      `).bind(newPosition, user.id, pathId).run();
    } else {
      // Just advance position
      await c.env.DB.prepare(`
        UPDATE family_path_subscriptions 
        SET current_position = ?
        WHERE parent_id = ? AND path_id = ?
      `).bind(newPosition, user.id, pathId).run();
    }

    return c.json({ 
      success: true, 
      new_position: newPosition,
      total_items: subscription.total_items,
      is_completed: isCompleted
    });
  } catch (error: any) {
    console.error('Error advancing path:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get today's content from all active paths
app.get('/api/paths/today', async (c) => {
  try {
    const user = requireAuth(c);

    // Get all active subscriptions
    const subscriptionsResult = await c.env.DB.prepare(`
      SELECT 
        fps.*,
        lp.id as path_id,
        lp.title as path_title,
        lp.path_type,
        lp.content_filter,
        lp.pace,
        lp.total_items
      FROM family_path_subscriptions fps
      JOIN learning_paths lp ON fps.path_id = lp.id
      WHERE fps.parent_id = ? AND fps.is_paused = 0 AND fps.completed_at IS NULL
    `).bind(user.id).all();

    const subscriptions = subscriptionsResult.results || [];
    const items: any[] = [];

    // For each active subscription, get today's item
    for (const sub of subscriptions) {
      const pathType = (sub as any).path_type;
      const position = (sub as any).current_position || 1;
      const total = (sub as any).total_items;

      let item = null;

      // Fetch content based on path type
      if (pathType === 'hymn_journey') {
        // Get hymn at current position
        const hymn = await c.env.DB.prepare(
          'SELECT * FROM formations WHERE cluster_tag = ? ORDER BY ROWID LIMIT 1 OFFSET ?'
        ).bind('hymn', position - 1).first();
        if (hymn) {
          item = {
            path_id: (sub as any).path_id,
            path_title: (sub as any).path_title,
            path_type: pathType,
            item_type: 'hymn',
            item_id: (hymn as any).id,
            item_title: (hymn as any).title,
            item_data: hymn,
            position,
            total,
          };
        }
      } else if (pathType === 'catechism') {
        // Get catechism at current position
        const catechism = await c.env.DB.prepare(
          'SELECT * FROM formations WHERE cluster_tag = ? ORDER BY ROWID LIMIT 1 OFFSET ?'
        ).bind('catechism', position - 1).first();
        if (catechism) {
          item = {
            path_id: (sub as any).path_id,
            path_title: (sub as any).path_title,
            path_type: pathType,
            item_type: 'catechism',
            item_id: (catechism as any).id,
            item_title: (catechism as any).title,
            item_data: catechism,
            position,
            total,
          };
        }
      } else if (pathType === 'toddler_dev') {
        // Get toddler formation at current position
        const formation = await c.env.DB.prepare(
          'SELECT * FROM formations WHERE cluster_tag = ? ORDER BY ROWID LIMIT 1 OFFSET ?'
        ).bind('toddler', position - 1).first();
        if (formation) {
          item = {
            path_id: (sub as any).path_id,
            path_title: (sub as any).path_title,
            path_type: pathType,
            item_type: 'activity',
            item_id: (formation as any).id,
            item_title: (formation as any).title,
            item_data: formation,
            position,
            total,
          };
        }
      } else if (pathType === 'early_reading') {
        // Get reading formation at current position
        const formation = await c.env.DB.prepare(
          'SELECT * FROM formations WHERE cluster_tag = ? ORDER BY ROWID LIMIT 1 OFFSET ?'
        ).bind('reading', position - 1).first();
        if (formation) {
          item = {
            path_id: (sub as any).path_id,
            path_title: (sub as any).path_title,
            path_type: pathType,
            item_type: 'activity',
            item_id: (formation as any).id,
            item_title: (formation as any).title,
            item_data: formation,
            position,
            total,
          };
        }
      } else if (pathType === 'history_young') {
        // Get young history story at current position
        const story = await c.env.DB.prepare(
          'SELECT * FROM formations WHERE cluster_tag = ? AND formation_type = ? ORDER BY ROWID LIMIT 1 OFFSET ?'
        ).bind('african_history_young', 'story', position - 1).first();
        if (story) {
          item = {
            path_id: (sub as any).path_id,
            path_title: (sub as any).path_title,
            path_type: pathType,
            item_type: 'story',
            item_id: (story as any).id,
            item_title: (story as any).title,
            item_data: story,
            position,
            total,
          };
        }
      } else if (pathType === 'history_full') {
        // Get full history story at current position
        const story = await c.env.DB.prepare(
          'SELECT * FROM formations WHERE cluster_tag = ? ORDER BY ROWID LIMIT 1 OFFSET ?'
        ).bind('african_history', position - 1).first();
        if (story) {
          item = {
            path_id: (sub as any).path_id,
            path_title: (sub as any).path_title,
            path_type: pathType,
            item_type: 'story',
            item_id: (story as any).id,
            item_title: (story as any).title,
            item_data: story,
            position,
            total,
          };
        }
      } else if (pathType === 'pastor_curtis') {
        // Get Pastor Curtis book at current position
        const book = await c.env.DB.prepare(
          'SELECT * FROM books WHERE series = ? ORDER BY ROWID LIMIT 1 OFFSET ?'
        ).bind('pastor_curtis_knapp', position - 1).first();
        if (book) {
          item = {
            path_id: (sub as any).path_id,
            path_title: (sub as any).path_title,
            path_type: pathType,
            item_type: 'book',
            item_id: (book as any).id,
            item_title: (book as any).title,
            item_data: book,
            position,
            total,
          };
        }
      } else if (pathType === 'liturgy') {
        // Combine weekly liturgy items
        item = {
          path_id: (sub as any).path_id,
          path_title: (sub as any).path_title,
          path_type: pathType,
          item_type: 'liturgy',
          item_id: `liturgy-week-${position}`,
          item_title: `Week ${position} Liturgy`,
          item_data: { week: position },
          position,
          total,
        };
      }

      if (item) {
        items.push(item);
      }
    }

    // Build active_paths response
    const active_paths = subscriptions.map((sub: any) => ({
      id: sub.path_id,
      title: sub.path_title || sub.path_type || 'Untitled Path',
      path_type: sub.path_type,
      total_items: sub.total_items,
      subscription: {
        id: sub.id,
        parent_id: sub.parent_id,
        path_id: sub.path_id,
        started_at: sub.started_at,
        current_position: sub.current_position,
        is_paused: Boolean(sub.is_paused),
        completed_at: sub.completed_at,
      },
      progress_percent: sub.total_items 
        ? Math.round((sub.current_position / sub.total_items) * 100) 
        : 0,
    }));

    return c.json({ items, active_paths });
  } catch (error: any) {
    console.error('Error getting today\'s paths:', error);
    return c.json({ items: [], active_paths: [] });
  }
});

// GET /api/library/stats - Get library completion stats for the authenticated family
app.get('/api/library/stats', async (c) => {
  try {
    const user = requireAuth(c);

    // Get total counts from formations
    const hymnCount = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM formations WHERE cluster_tag = 'hymn'"
    ).first() as any;
    
    const catechismCount = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM formations WHERE cluster_tag = 'catechism'"
    ).first() as any;
    
    const bookCount = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM formations WHERE cluster_tag = 'book' OR formation_type = 'story'"
    ).first() as any;

    // Get current positions from active subscriptions
    const subscriptions = await c.env.DB.prepare(`
      SELECT 
        lp.path_type,
        fps.current_position,
        lp.total_items,
        fps.completed_at
      FROM family_path_subscriptions fps
      JOIN learning_paths lp ON fps.path_id = lp.id
      WHERE fps.parent_id = ?
    `).bind(user.id).all();

    const subs = subscriptions.results || [];

    // Calculate completed counts based on position or completed_at
    const hymnSub = subs.find((s: any) => s.path_type === 'hymn_journey') as any;
    const catechismSub = subs.find((s: any) => s.path_type === 'catechism') as any;

    const stats = {
      hymns: {
        completed: hymnSub ? (hymnSub.completed_at ? hymnSub.total_items : hymnSub.current_position - 1) : 0,
        total: hymnCount?.count || 100,
      },
      catechism: {
        completed: catechismSub ? (catechismSub.completed_at ? catechismSub.total_items : catechismSub.current_position - 1) : 0,
        total: catechismCount?.count || 107,
      },
      books: {
        completed: 0, // TODO: Track from evidences or reading table
        total: bookCount?.count || 100,
      },
    };

    return c.json(stats);
  } catch (error: any) {
    console.error('Error getting library stats:', error);
    return c.json({ 
      hymns: { completed: 0, total: 100 },
      catechism: { completed: 0, total: 107 },
      books: { completed: 0, total: 100 },
    });
  }
});

export default app;
