// SchoolOS Cloudflare Worker API
// Uses Hono for routing, D1 for database, JWT for auth

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { generateWeeklyPlan, getSmartWeekStart } from './planner';
import { AiCoach } from './ai';

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
}

interface JWTPayload {
  sub: string;
  email: string;
  name: string;
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

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// Monitor Dashboard
app.get('/', async (c) => {
  const key = c.req.query('key');
  const secret = c.env.ADMIN_SECRET;

  if (!secret) {
    return c.text('Admin secret not configured', 500);
  }

  if (key !== secret) {
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
        "SELECT COUNT(*) as count FROM ai_interaction_logs WHERE date(created_at) = ?"
      ).bind(today).first<any>();

      aiMonth = await c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM ai_interaction_logs WHERE strftime('%Y-%m', created_at) = ?"
      ).bind(currentMonth).first<any>();

      // 3. Recent Activity (Expanded)
      const logsResult = await c.env.DB.prepare(
        'SELECT id, interaction_type, question, answer, context_json, created_at FROM ai_interaction_logs ORDER BY created_at DESC LIMIT 20'
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
             <button class="action-btn" onclick="togglePause()" id="pauseBtn">Pause</button>
             <button class="action-btn" onclick="window.location.reload()">Refresh Now</button>
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

      return `
                <tr class="log-row" onclick="toggleRow('${log.id}')">
                  <td class="log-meta">
                    <div>${new Date(log.created_at).toLocaleTimeString()}</div>
                    <div style="font-size:0.75rem; opacity:0.6">${new Date(log.created_at).toLocaleDateString()}</div>
                  </td>
                  <td width="100"><span class="badge ${log.interaction_type}">${log.interaction_type}</span></td>
                  <td>
                    <div style="font-weight:600;margin-bottom:4px;color:#fff">${safeQuestion ? safeQuestionShort : '(No Query)'}</div>
                    <div style="color:var(--muted);font-size:0.8rem;font-style:italic">ID: ${log.id}</div>
                  </td>
                  <td style="text-align:right" onclick="event.stopPropagation()">
                     <button class="action-btn" onclick="copyDebug('${log.id}')">Copy Debug Object</button>
                     <textarea id="debug-${log.id}" style="display:none">${safeDebugObj}</textarea>
                  </td>
                </tr>
                <tr class="log-details" id="row-${log.id}">
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

        <script>
          let paused = false;
          let timeLeft = 60;

          window.toggleRow = function(id) {
            const row = document.getElementById('row-' + id);
            if (row) row.classList.toggle('open');
          };

          window.copyDebug = function(id) {
            const content = document.getElementById('debug-' + id).value;
            const txt = document.createElement('textarea');
            txt.innerHTML = content;
            navigator.clipboard.writeText(txt.value).then(() => {
              alert('Debug JSON copied to clipboard!');
            });
          };

          window.togglePause = function() {
            paused = !paused;
            const btn = document.getElementById('pauseBtn');
            if (btn) {
              btn.innerText = paused ? "Resume" : "Pause";
              btn.style.borderColor = paused ? "#fcd34d" : "var(--border)";
              btn.style.color = paused ? "#fcd34d" : "var(--muted)";
            }
          };

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
    ];
    // Also allow any lovable.app subdomain
    if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.lovable.app'))) {
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
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');

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

// Require auth helper
function requireAuth(c: any): User {
  const user = c.get('user');
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

// Generate unique ID
function generateId(prefix: string): string {
  return `${prefix} - ${Date.now()} - ${Math.random().toString(36).substr(2, 9)}`;
}

// ============ DEV BYPASS AUTH (Development Only) ============
// Access: GET /auth/dev-bypass?email=test@example.com&name=Test%20User
// This creates or finds a user and returns a JWT token
app.get('/auth/dev-bypass', async (c) => {
  // Only allow in development
  if (c.env.ENVIRONMENT === 'production') {
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
      await c.env.DB.prepare(
        'INSERT INTO users (id, email, name, avatar_url, provider) VALUES (?, ?, ?, NULL, ?)'
      ).bind(userId, email, name, 'dev-bypass').run();

      user = { id: userId, email, name, avatar_url: null, provider: 'dev-bypass' };
    }

    // Generate JWT
    const jwt = await signJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days for dev
    }, c.env.JWT_SECRET);

    // Return token (frontend can store and use)
    return c.json({
      token: jwt,
      user: { id: user.id, email: user.email, name: user.name },
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
  const scope = encodeURIComponent('openid email profile');
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(c.env.GOOGLE_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(c.env.GOOGLE_REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&access_type=offline`;

  return c.redirect(authUrl);
});

// Google OAuth callback
app.get('/auth/google/callback', async (c) => {
  const code = c.req.query('code');
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

    // Upsert user in database
    const userId = generateId('user');
    const existingUser = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(googleUser.email).first<User>();

    let user: User;
    if (existingUser) {
      await c.env.DB.prepare(
        'UPDATE users SET name = ?, avatar_url = ?, updated_at = datetime("now") WHERE id = ?'
      ).bind(googleUser.name, googleUser.picture, existingUser.id).run();
      user = { ...existingUser, name: googleUser.name, avatar_url: googleUser.picture };
    } else {
      await c.env.DB.prepare(
        'INSERT INTO users (id, email, name, avatar_url, provider) VALUES (?, ?, ?, ?, ?)'
      ).bind(userId, googleUser.email, googleUser.name, googleUser.picture, 'google').run();
      user = { id: userId, email: googleUser.email, name: googleUser.name, avatar_url: googleUser.picture, provider: 'google' };
    }

    // Create JWT
    const jwt = await signJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    }, c.env.JWT_SECRET);

    // Redirect to frontend with token
    return c.redirect(`${c.env.FRONTEND_URL}/auth/callback?token=${jwt}`);
  } catch (error) {
    console.error('OAuth error:', error);
    return c.redirect(`${c.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

// Get current user
app.get('/api/auth/me', async (c) => {
  try {
    const user = requireAuth(c);

    // Get user's children
    const { results: children } = await c.env.DB.prepare(
      'SELECT * FROM students WHERE parent_id = ? ORDER BY created_at'
    ).bind(user.id).all();

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
    const user = requireAuth(c);
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM students WHERE parent_id = ? ORDER BY created_at'
    ).bind(user.id).all();
    return c.json(results);
  } catch (error: any) {
    console.error('Students list error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// Get notifications
app.get('/api/notifications', async (c) => {
  try {
    const user = requireAuth(c);
    const notifications = [];
    const today = new Date().toISOString().split('T')[0];

    // 1. Milestone Triggers (Simplified: Count completions per domain)
    const { results: domainCounts } = await c.env.DB.prepare(`
      SELECT a.domain, COUNT(*) as count
      FROM observations o
      JOIN activities a ON o.activity_id = a.id
      WHERE o.student_id IN (SELECT id FROM students WHERE parent_id = ?)
      GROUP BY a.domain
      HAVING count >= 5
    `).bind(user.id).all();

    domainCounts.forEach((d: any) => {
      // Logic to determine if this is a "new" milestone could be complex
      // For now, we just show "Milestone" if count is a multiple of 10
      if (d.count % 10 === 0 && d.count > 0) {
        notifications.push({
          id: `milestone-${d.domain}-${d.count}`,
          type: 'milestone',
          title: `Milestone Unlocked!`,
          message: `Your family has completed ${d.count} activities in ${d.domain}!`,
          date: today
        });
      }
    });

    // 2. Coverage Alerts (2+ weeks without domain)
    // Simplified: Check distinct domains in last 14 days
    const { results: recentDomains } = await c.env.DB.prepare(`
      SELECT DISTINCT a.domain
      FROM observations o
      JOIN activities a ON o.activity_id = a.id
      WHERE o.student_id IN (SELECT id FROM students WHERE parent_id = ?)
      AND o.completed_at > datetime('now', '-14 days')
    `).bind(user.id).all();

    const recentDomainSet = new Set(recentDomains.map((r: any) => r.domain));
    const allDomains = ['motor', 'language', 'cognitive', 'social-emotional', 'pre-academic'];

    // Only alert if we have SOME activity but missing a domain (avoid alerting new users with 0 activity)
    if (recentDomains.length > 0) {
      const missing = allDomains.find(d => !recentDomainSet.has(d));
      if (missing) {
        notifications.push({
          id: `alert-missing-${missing}`,
          type: 'alert',
          title: 'Coverage Alert',
          message: `You haven't done any ${missing} activities recently.`,
          date: today
        });
      }
    }

    // 3. Encouragement (Weekly Balance)
    // If > 3 domains covered this week
    if (recentDomains.length >= 3) {
      notifications.push({
        id: `enc-balance-${today}`,
        type: 'encouragement',
        title: 'Great Balance!',
        message: 'You are covering a wide range of developmental areas this week.',
        date: today
      });
    }

    // Limit to 2 for the UI stack
    return c.json(notifications.slice(0, 2));

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get tomorrow's preview
app.get('/api/family/tomorrow-preview', async (c) => {
  try {
    const user = requireAuth(c);

    // Calculate tomorrow's date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][tomorrow.getDay()];

    // Check available days
    const timeModel = await c.env.DB.prepare('SELECT available_days FROM weekly_time_model WHERE parent_id = ?')
      .bind(user.id).first();
    const availableDays = JSON.parse((timeModel as any)?.available_days || '["Mon","Tue","Wed","Thu","Fri"]');

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
            SELECT id, title, description, domain FROM activities WHERE id IN (${placeholders})
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
app.post('/api/students', async (c) => {
  try {
    const user = requireAuth(c);

    // Check limit
    const { results: existing } = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM students WHERE parent_id = ?'
    ).bind(user.id).all();

    if ((existing[0] as any).count >= 5) {
      return c.json({ error: 'Maximum 5 children allowed. Contact support for more.' }, 400);
    }

    const body = await c.req.json();
    const { name, dateOfBirth } = body;

    // Calculate age in months
    const birthDate = new Date(dateOfBirth);
    const now = new Date();
    const ageInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 +
      (now.getMonth() - birthDate.getMonth());

    const studentId = generateId('student');

    await c.env.DB.prepare(
      'INSERT INTO students (id, parent_id, name, date_of_birth, age_in_months, current_stage) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(studentId, user.id, name, dateOfBirth, ageInMonths, 'early-years').run();

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
    const user = requireAuth(c);
    const studentId = c.req.param('id');
    const body = await c.req.json();

    // Verify ownership
    const existing = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND parent_id = ?'
    ).bind(studentId, user.id).first();

    if (!existing) {
      return c.json({ error: 'Child not found' }, 404);
    }

    const { name, dateOfBirth, avatarUrl } = body;

    await c.env.DB.prepare(
      'UPDATE students SET name = COALESCE(?, name), date_of_birth = COALESCE(?, date_of_birth), avatar_url = COALESCE(?, avatar_url), updated_at = datetime("now") WHERE id = ?'
    ).bind(name || null, dateOfBirth || null, avatarUrl || null, studentId).run();

    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ?'
    ).bind(studentId).first();

    return c.json(student);
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to update child' }, 400);
  }
});

// ============ ACTIVITIES ROUTES ============

// Get activities (filtered by age and domain)
app.get('/api/activities', async (c) => {
  const domain = c.req.query('domain');
  const ageMonths = c.req.query('ageMonths');
  const activityType = c.req.query('activityType');
  const context = c.req.query('context');
  const limit = c.req.query('limit') || '50';

  let query = "SELECT * FROM activities WHERE is_active = 1 AND (is_archived = 0 OR is_archived IS NULL) AND (archived = 0 OR archived IS NULL) AND (content_status != 'blacklisted' OR content_status IS NULL) AND (deprecated = 0 OR deprecated IS NULL)";
  const params: any[] = [];

  if (domain) {
    query += ' AND domain = ?';
    params.push(domain);
  }

  if (ageMonths) {
    const age = parseInt(ageMonths);
    query += ' AND min_age_months <= ? AND max_age_months >= ?';
    params.push(age, age);
  }

  if (activityType) {
    query += ' AND activity_type = ?';
    params.push(activityType);
  }

  if (context) {
    query += ' AND context_embedding = ?';
    params.push(context);
  }

  query += ' ORDER BY domain, min_age_months LIMIT ?';
  params.push(parseInt(limit));

  const stmt = c.env.DB.prepare(query);
  const { results } = await stmt.bind(...params).all();

  // Parse JSON fields
  const activities = results.map((a: any) => ({
    ...a,
    materials: JSON.parse(a.materials || '[]'),
    instructions: JSON.parse(a.instructions || '[]'),
    learning_outcomes: JSON.parse(a.learning_outcomes || '[]'),
  }));

  return c.json(activities);
});

// Get single activity
app.get('/api/activities/:id', async (c) => {
  const id = c.req.param('id');
  const activity = await c.env.DB.prepare(
    'SELECT * FROM activities WHERE id = ?'
  ).bind(id).first();

  if (!activity) {
    return c.json({ error: 'Activity not found' }, 404);
  }

  return c.json({
    ...activity,
    materials: JSON.parse((activity as any).materials || '[]'),
    instructions: JSON.parse((activity as any).instructions || '[]'),
    learning_outcomes: JSON.parse((activity as any).learning_outcomes || '[]'),
  });
});

// Simple Activity Completion
app.post('/api/activity-completions', async (c) => {
  try {
    const user = requireAuth(c);
    const { activityId, notes } = await c.req.json();

    const id = crypto.randomUUID();
    await c.env.DB.prepare(`
            INSERT INTO activity_completions (id, parent_id, activity_id, notes)
            VALUES (?, ?, ?, ?)
        `).bind(id, user.id, activityId, notes || null).run();

    return c.json({ success: true, id });
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to record completion' }, 400);
  }
});

// Get today's recommended activities for a student (LEGACY/FALLBACK)
// Helper: Get or generate daily recommendations for a student
async function getStudentDailyRecommendations(db: D1Database, student: any) {
  const today = new Date().toISOString().split('T')[0];
  const studentId = student.id;

  // Check for existing recommendations
  let { results: recommendations } = await db.prepare(`
    SELECT dr.*, a.* FROM daily_recommendations dr
    JOIN activities a ON dr.activity_id = a.id
    WHERE dr.student_id = ? AND dr.recommended_date = ?
    ORDER BY dr.position
  `).bind(studentId, today).all();

  // Generate recommendations if none exist
  if (recommendations.length === 0) {
    const ageMonths = (student as any).age_in_months;

    // Get one activity from each domain that hasn't been completed recently
    const domains = ['cognitive', 'motor', 'language', 'social-emotional', 'pre-academic'];

    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i];
      const activity = await db.prepare(`
        SELECT * FROM activities 
        WHERE domain = ? AND min_age_months <= ? AND max_age_months >= ? AND is_active = 1
        AND id NOT IN (
          SELECT activity_id FROM observations WHERE student_id = ? 
          AND completed_at > datetime('now', '-7 days')
        )
        ORDER BY RANDOM() LIMIT 1
      `).bind(domain, ageMonths, ageMonths, studentId).first();

      if (activity) {
        const recId = generateId('rec');
        await db.prepare(
          'INSERT INTO daily_recommendations (id, student_id, activity_id, recommended_date, position) VALUES (?, ?, ?, ?, ?)'
        ).bind(recId, studentId, (activity as any).id, today, i).run();
      }
    }

    // Fetch the newly created recommendations
    const result = await db.prepare(`
      SELECT dr.*, a.* FROM daily_recommendations dr
      JOIN activities a ON dr.activity_id = a.id
      WHERE dr.student_id = ? AND dr.recommended_date = ?
      ORDER BY dr.position
    `).bind(studentId, today).all();
    recommendations = result.results;
  }

  return recommendations;
}

// Get today's recommended activities for a student
app.get('/api/students/:studentId/today', async (c) => {
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

    const recommendations = await getStudentDailyRecommendations(c.env.DB, student);

    // Parse JSON fields
    const activities = recommendations.map((r: any) => ({
      ...r,
      materials: JSON.parse(r.materials || '[]'),
      instructions: JSON.parse(r.instructions || '[]'),
      learning_outcomes: JSON.parse(r.learning_outcomes || '[]'),
    }));

    // ========== SIBLING-AWARE RECOMMENDATIONS ==========
    // Get all siblings for this parent
    const { results: allChildren } = await c.env.DB.prepare(
      'SELECT * FROM students WHERE parent_id = ? ORDER BY age_in_months DESC'
    ).bind(user.id).all();

    let familyActivities: any[] = [];

    // Only compute family activities if there are multiple children
    if (allChildren.length > 1) {
      // Find age range that covers all children
      const ages = allChildren.map((c: any) => c.age_in_months);
      const oldestAge = Math.max(...ages);
      const youngestAge = Math.min(...ages);

      // Find activities where the age range overlaps with ALL children
      // An activity is suitable for family if its range encompasses all children
      const { results: sharedActivities } = await c.env.DB.prepare(`
        SELECT * FROM activities 
        WHERE min_age_months <= ? AND max_age_months >= ? AND is_active = 1
        ORDER BY RANDOM() LIMIT 3
      `).bind(youngestAge, oldestAge).all();

      // Build family activity recommendations with variations
      familyActivities = sharedActivities.map((activity: any) => {
        const variations: Record<string, string> = {};

        allChildren.forEach((child: any) => {
          const childAge = child.age_in_months;
          const activityMidpoint = (activity.min_age_months + activity.max_age_months) / 2;

          if (childAge < activityMidpoint - 6) {
            variations[child.id] = 'easier';
          } else if (childAge > activityMidpoint + 6) {
            variations[child.id] = 'harder';
          } else {
            variations[child.id] = 'standard';
          }
        });

        return {
          activity: {
            ...activity,
            materials: JSON.parse(activity.materials || '[]'),
            instructions: JSON.parse(activity.instructions || '[]'),
            learning_outcomes: JSON.parse(activity.learning_outcomes || '[]'),
          },
          suitableFor: allChildren.map((c: any) => c.id),
          variations,
        };
      });
    }

    return c.json({ student, activities, familyActivities });
  } catch (error: any) {
    console.error('Student today error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// Helper function to fetch daily practices
async function getDailyPractices(db: D1Database) {
  const { results: dailyPractices } = await db.prepare(`
    SELECT * FROM activities 
    WHERE activity_type = 'daily_practice' AND is_active = 1
    ORDER BY RANDOM() LIMIT 3
  `).all();

  return dailyPractices.map((activity: any) => ({
    ...activity,
    materials: JSON.parse(activity.materials || '[]'),
    instructions: JSON.parse(activity.instructions || '[]'),
    learning_outcomes: JSON.parse(activity.learning_outcomes || '[]'),
  }));
}

// Get family dashboard data - UNIFIED PLANNER VERSION
app.get('/api/family/today', async (c) => {
  try {
    const user = requireAuth(c);

    // Get all children
    const { results: children } = await c.env.DB.prepare(
      'SELECT * FROM students WHERE parent_id = ? ORDER BY age_in_months DESC'
    ).bind(user.id).all();

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
    const timeModel = await c.env.DB.prepare('SELECT available_days FROM weekly_time_model WHERE parent_id = ?')
      .bind(user.id).first();
    const availableDays = JSON.parse((timeModel as any)?.available_days || '["Mon","Tue","Wed","Thu","Fri"]');

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

    // Hydrate activities
    const activityIds = todaysSlots.map((s: any) => s.activityId);
    let familySessions: any[] = [];
    let materialsList: any[] = [];

    if (activityIds.length > 0) {
      const placeholders = activityIds.map(() => '?').join(',');
      const { results: activities } = await c.env.DB.prepare(`
            SELECT * FROM activities WHERE id IN (${placeholders})
        `).bind(...activityIds).all();

      const activityMap = new Map(activities.map((a: any) => [a.id, a]));

      familySessions = todaysSlots.map((slot: any) => {
        const activity: any = activityMap.get(slot.activityId);
        if (!activity) return null;

        const tiers = JSON.parse(activity.tiered_expectations || '[]');
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
        const domainName = domainLabels[activity.domain] || activity.domain;

        return {
          activity: {
            ...activity,
            materials: JSON.parse(activity.materials || '[]'),
            instructions: JSON.parse(activity.instructions || '[]'),
            learning_outcomes: JSON.parse(activity.learning_outcomes || '[]'),
          },
          childTiers,
          messLevel: activity.mess_level,
          prepMinutes: activity.prep_time_minutes,
          materialsAvailable: true, // simplified for now
          reasoning: slot.reasoning || `Planned for ${slot.timeSlot}`,
          timeSlot: slot.timeSlot,
          day: slot.day
        };
      }).filter(Boolean);

      // Collect materials
      const neededMaterials = new Set<string>();
      familySessions.forEach((session: any) => {
        session.activity.materials.forEach((m: string) => neededMaterials.add(m));
      });

      if (neededMaterials.size > 0) {
        const marks = Array(neededMaterials.size).fill('?').join(',');
        const { results: existing } = await c.env.DB.prepare(`
                 SELECT material_name, status FROM family_materials
                 WHERE parent_id = ? AND material_name IN (${Array.from(neededMaterials).map(() => '?').join(',')})
             `).bind(user.id, ...Array.from(neededMaterials)).all();

        const statusMap = new Map();
        existing.forEach((r: any) => statusMap.set(r.material_name, r.status));

        neededMaterials.forEach(m => {
          materialsList.push({
            name: m,
            status: statusMap.get(m) || 'unknown'
          });
        });
      }
    }

    // Compute metrics
    const totalDuration = familySessions.reduce((acc: number, s: any) => acc + (s.activity.duration_minutes || 15), 0);
    const coreKitCount = familySessions.filter((s: any) => s.activity.uses_core_kit).length;
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

// ============ FORMATION PREFERENCES ROUTES ============

// Get formation preferences (defaults to all enabled if not set)
app.get('/api/family/preferences', async (c) => {
  try {
    const user = requireAuth(c);

    let prefs = await c.env.DB.prepare(
      'SELECT * FROM formation_preferences WHERE parent_id = ?'
    ).bind(user.id).first();

    if (!prefs) {
      // Return defaults if no preferences set
      return c.json({
        activitiesEnabled: true,
        readingEnabled: true,
        liturgyEnabled: true
      });
    }

    return c.json({
      activitiesEnabled: !!(prefs as any).activities_enabled,
      readingEnabled: !!(prefs as any).reading_enabled,
      liturgyEnabled: !!(prefs as any).liturgy_enabled
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

    const { activitiesEnabled, readingEnabled, liturgyEnabled } = body;

    // Upsert preferences
    await c.env.DB.prepare(`
      INSERT INTO formation_preferences (id, parent_id, activities_enabled, reading_enabled, liturgy_enabled, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(parent_id) DO UPDATE SET 
        activities_enabled = COALESCE(excluded.activities_enabled, activities_enabled),
        reading_enabled = COALESCE(excluded.reading_enabled, reading_enabled),
        liturgy_enabled = COALESCE(excluded.liturgy_enabled, liturgy_enabled),
        updated_at = datetime('now')
    `).bind(
      generateId('fpref'),
      user.id,
      activitiesEnabled !== undefined ? (activitiesEnabled ? 1 : 0) : 1,
      readingEnabled !== undefined ? (readingEnabled ? 1 : 0) : 1,
      liturgyEnabled !== undefined ? (liturgyEnabled ? 1 : 0) : 1
    ).run();

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Formation preferences update error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// Get unified daily rhythm - composes activities, books, and liturgy
app.get('/api/family/daily-rhythm', async (c) => {
  try {
    const user = requireAuth(c);
    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];

    // Get formation preferences
    let prefs = await c.env.DB.prepare(
      'SELECT * FROM formation_preferences WHERE parent_id = ?'
    ).bind(user.id).first() as any;

    const activitiesEnabled = prefs ? !!prefs.activities_enabled : true;
    const readingEnabled = prefs ? !!prefs.reading_enabled : true;
    const liturgyEnabled = prefs ? !!prefs.liturgy_enabled : true;

    // Get children
    const { results: children } = await c.env.DB.prepare(
      'SELECT * FROM students WHERE parent_id = ? ORDER BY age_in_months DESC'
    ).bind(user.id).all();

    const items: any[] = [];
    const completions: Record<string, boolean> = {};

    // 1. LITURGY (if enabled)
    if (liturgyEnabled) {
      // Get liturgy settings
      let settings = await c.env.DB.prepare(
        'SELECT * FROM family_liturgy_settings WHERE parent_id = ?'
      ).bind(user.id).first() as any;

      if (settings) {
        // Check liturgy completions for today
        const { results: liturgyCompletions } = await c.env.DB.prepare(
          'SELECT liturgy_item_id FROM liturgy_completions WHERE parent_id = ? AND completed_date = ?'
        ).bind(user.id, today).all();

        const completedLiturgyIds = new Set(liturgyCompletions.map((lc: any) => lc.liturgy_item_id));

        // Get today's liturgy items based on current weeks
        const { results: liturgyItems } = await c.env.DB.prepare(`
          SELECT * FROM liturgy_items 
          WHERE (
            (type = 'catechism' AND source = ? AND sequence_number = ?) OR
            (type = 'hymn' AND source = ? AND sequence_number = ?) OR
            (type = 'scripture' AND sequence_number = ?)
          ) AND is_active = 1
        `).bind(
          settings.catechism_source || 'westminster_shorter',
          settings.current_catechism_week || 1,
          settings.hymnal_source || 'classic_hymns',
          settings.current_hymn_week || 1,
          settings.current_scripture_week || 1
        ).all();

        const liturgyCompleted = liturgyItems.length > 0 &&
          liturgyItems.every((item: any) => completedLiturgyIds.has(item.id));

        items.push({
          id: 'liturgy-morning',
          timeSlot: '08:00',
          title: 'Morning Liturgy',
          description: 'Scripture, hymnal, and catechism.',
          type: 'liturgy',
          status: liturgyCompleted ? 'completed' : 'upcoming',
          data: { items: liturgyItems }
        });

        completions['liturgy-morning'] = liturgyCompleted;
      } else {
        // No settings yet, still show liturgy as an option
        items.push({
          id: 'liturgy-morning',
          timeSlot: '08:00',
          title: 'Morning Liturgy',
          description: 'Scripture, hymnal, and catechism.',
          type: 'liturgy',
          status: 'upcoming',
          data: {}
        });
      }
    }

    // 2. ACTIVITIES (if enabled)
    if (activitiesEnabled && children.length > 0) {
      // Check time model for rest days
      const timeModel = await c.env.DB.prepare('SELECT available_days FROM weekly_time_model WHERE parent_id = ?')
        .bind(user.id).first();
      const availableDays = JSON.parse((timeModel as any)?.available_days || '["Mon","Tue","Wed","Thu","Fri"]');

      if (availableDays.includes(dayOfWeek)) {
        // Get weekly plan
        const weekStart = getSmartWeekStart();
        const plan = await c.env.DB.prepare('SELECT plan_json FROM weekly_plans WHERE parent_id = ? AND week_start = ?')
          .bind(user.id, weekStart).first();

        if (plan) {
          const planData = JSON.parse((plan as any).plan_json);
          const todaysSlots = planData.slots.filter((s: any) => s.day === dayOfWeek);

          // Get activity completions for today
          const { results: activityCompletions } = await c.env.DB.prepare(`
            SELECT activity_id FROM activity_completions 
            WHERE parent_id = ? AND date(completed_at) = ?
          `).bind(user.id, today).all();

          const completedActivityIds = new Set(activityCompletions.map((ac: any) => ac.activity_id));

          // Hydrate activities
          const activityIds = todaysSlots.map((s: any) => s.activityId);
          if (activityIds.length > 0) {
            const placeholders = activityIds.map(() => '?').join(',');
            const { results: activities } = await c.env.DB.prepare(`
              SELECT * FROM activities WHERE id IN (${placeholders})
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
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM family_materials WHERE parent_id = ? ORDER BY material_name'
    ).bind(user.id).all();

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
      'SELECT * FROM activities WHERE id = ?'
    ).bind(activityId).first();

    if (!currentActivity) {
      return c.json({ error: 'Activity not found' }, 404);
    }

    // Get children for age range
    const { results: children } = await c.env.DB.prepare(
      'SELECT * FROM students WHERE parent_id = ? ORDER BY age_in_months DESC'
    ).bind(user.id).all();

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
      SELECT * FROM activities 
      WHERE activity_type = 'family_session'
        AND id != ?
        AND min_age_months <= ? 
        AND max_age_months >= ?
        AND tiered_expectations IS NOT NULL
        AND is_active = 1
        AND (is_archived = 0 OR is_archived IS NULL)
        AND (archived = 0 OR archived IS NULL)
        AND (content_status != 'blacklisted' OR content_status IS NULL)
        AND (deprecated = 0 OR deprecated IS NULL)
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
      SELECT * FROM activities 
      WHERE activity_type = 'family_session'
        AND min_age_months <= ? 
        AND max_age_months >= ?
        AND tiered_expectations IS NOT NULL
        AND is_active = 1
        AND (is_archived = 0 OR is_archived IS NULL)
        AND (archived = 0 OR archived IS NULL)
        AND (content_status != 'blacklisted' OR content_status IS NULL)
        AND (deprecated = 0 OR deprecated IS NULL)
    `;

    const params: any[] = [minAge, maxAge];

    // Domain filter (mapped to biblical or standard)
    if (preferred_domain) {
      if (['wisdom', 'stature', 'favor_with_god', 'favor_with_man'].includes(preferred_domain)) {
        query += ' AND biblical_domain = ?';
        params.push(preferred_domain);
      } else {
        query += ' AND domain = ?';
        params.push(preferred_domain);
      }
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
      'SELECT * FROM activities ORDER BY id'
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
      'SELECT * FROM activities WHERE id = ?'
    ).bind(activityId).first();

    if (!activity) {
      return c.json({ error: 'Activity not found' }, 404);
    }

    if ((activity as any).assessment_prohibited === 1) {
      return c.json({ error: 'Observations cannot be recorded for daily practices' }, 400);
    }

    const observationId = generateId('obs');

    // Include tier if provided (for family sessions)
    await c.env.DB.prepare(
      'INSERT INTO observations (id, student_id, activity_id, mastery_level, parent_notes, tier) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(observationId, studentId, activityId, masteryLevel, parentNotes || null, tier || null).run();

    // Mark daily recommendation as completed if exists
    const today = new Date().toISOString().split('T')[0];
    await c.env.DB.prepare(
      'UPDATE daily_recommendations SET is_completed = 1 WHERE student_id = ? AND activity_id = ? AND recommended_date = ?'
    ).bind(studentId, activityId, today).run();

    const observation = await c.env.DB.prepare(
      'SELECT * FROM observations WHERE id = ?'
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
      SELECT o.*, a.title, a.domain, a.description 
      FROM observations o
      JOIN activities a ON o.activity_id = a.id
      WHERE o.student_id = ?
    `;
    const params: any[] = [studentId];

    if (domain) {
      query += ' AND a.domain = ?';
      params.push(domain);
    }

    query += ' ORDER BY o.completed_at DESC LIMIT ?';
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
      'SELECT * FROM formation_preferences WHERE parent_id = ?'
    ).bind(user.id).first() as any;

    const enabledStreams: string[] = [];
    if (!prefs || prefs.activities_enabled) enabledStreams.push('activity');
    if (!prefs || prefs.reading_enabled) enabledStreams.push('reading');
    if (!prefs || prefs.liturgy_enabled) enabledStreams.push('liturgy');

    // ACTIVITY PROGRESS: Get counts by domain and mastery level
    const { results: byDomain } = await c.env.DB.prepare(`
      SELECT a.domain, o.mastery_level, COUNT(*) as count
      FROM observations o
      JOIN activities a ON o.activity_id = a.id
      WHERE o.student_id = ?
      GROUP BY a.domain, o.mastery_level
    `).bind(studentId).all();

    // Get recent activity (last 7 days)
    const { results: recentActivity } = await c.env.DB.prepare(`
      SELECT DATE(o.completed_at) as date, COUNT(*) as count
      FROM observations o
      WHERE o.student_id = ? AND o.completed_at > datetime('now', '-7 days')
      GROUP BY DATE(o.completed_at)
      ORDER BY date
    `).bind(studentId).all();

    // Get total completed activities
    const totalResult = await c.env.DB.prepare(`
      SELECT COUNT(DISTINCT activity_id) as total FROM observations WHERE student_id = ?
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

    // Step 3: Iterate Series
    for (const seriesPrefix of seriesPrefixes) {
      const seriesName = seriesPrefix.replace(rootPath, '').replace(/\/$/, '');

      // Step 4: List Books in Series (handling pagination)
      const bookPrefixes = await listAllPrefixes(bucket, {
        prefix: seriesPrefix,
        delimiter: '/'
      });

      // Step 5: Process Books
      for (const bookPrefix of bookPrefixes) {
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
            books.push({
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
            });
          }
        } catch (e) {
          console.warn(`Failed to load book ${bookId}:`, e);
        }
      }
    }

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
    const series = c.req.param('series');
    const bookId = c.req.param('bookId');

    const metadata = await getBookMetadata(c.env.BOOKS_BUCKET, series, bookId);

    if (!metadata) {
      return c.json({ error: 'Book not found' }, 404);
    }

    return c.json(metadata);
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to get book' }, 500);
  }
});

// Get book cover image
// Get book cover image
app.get('/api/books/:series/:bookId/cover', async (c) => {
  try {
    const series = c.req.param('series');
    const bookId = c.req.param('bookId');
    const bucket = c.env.BOOKS_BUCKET;

    // STRICT: Always books/{series}/{bookId}/images/cover.png
    const key = `books/${series}/${bookId}/images/cover.png`;
    const object = await bucket.get(key);

    if (object) {
      const headers = new Headers();
      headers.set('Content-Type', object.httpMetadata?.contentType || 'image/png');
      headers.set('Cache-Control', 'public, max-age=86400');
      return new Response(object.body, { headers });
    }

    return c.json({
      error: 'Cover not found',
      expected: key,
      help: 'See docs/BOOKS_CONFORMITY_STANDARD.md'
    }, 404);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get book page image
// Get book page image
app.get('/api/books/:series/:bookId/pages/:pageNum', async (c) => {
  try {
    const series = c.req.param('series');
    const bookId = c.req.param('bookId');
    const pageNum = c.req.param('pageNum');
    const bucket = c.env.BOOKS_BUCKET;

    const paddedNum = pageNum.padStart(2, '0');
    // STRICT: Always books/{series}/{bookId}/images/page-XX.png
    const key = `books/${series}/${bookId}/images/page-${paddedNum}.png`;
    const object = await bucket.get(key);

    if (object) {
      const headers = new Headers();
      headers.set('Content-Type', object.httpMetadata?.contentType || 'image/png');
      headers.set('Cache-Control', 'public, max-age=86400');
      return new Response(object.body, { headers });
    }

    return c.json({
      error: 'Page not found',
      expected: key,
      help: 'See docs/BOOKS_CONFORMITY_STANDARD.md'
    }, 404);
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
      'SELECT id FROM books WHERE id = ? OR id = ?'
    ).bind(bookId, `${series}/${bookId}`).first<{ id: string }>();

    if (!book) {
      return c.json({
        error: 'Book not found',
        tried: [bookId, `${series}/${bookId}`],
        help: 'Ensure the book is seeded in the books table with a matching id'
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
  const secret = c.req.query('key');
  if (!c.env.ADMIN_SECRET || secret !== c.env.ADMIN_SECRET) {
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
  const secret = c.req.query('key');
  if (!c.env.ADMIN_SECRET || secret !== c.env.ADMIN_SECRET) {
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
  const secret = c.req.query('key');
  if (!c.env.ADMIN_SECRET || secret !== c.env.ADMIN_SECRET) return c.json({ error: 'Unauthorized' }, 401);

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

  // Get or create family settings
  let settings = await c.env.DB.prepare(
    'SELECT * FROM family_liturgy_settings WHERE parent_id = ?'
  ).bind(user.id).first();

  if (!settings) {
    const settingsId = generateId('fls');
    await c.env.DB.prepare(`
      INSERT INTO family_liturgy_settings (id, parent_id) VALUES (?, ?)
    `).bind(settingsId, user.id).run();
    settings = {
      id: settingsId,
      parent_id: user.id,
      catechism_enabled: 1,
      catechism_source: 'westminster_shorter',
      hymnal_enabled: 1,
      hymnal_source: 'classic_hymns',
      scripture_enabled: 1,
      bible_translation: 'esv',
      current_catechism_week: 1,
      current_hymn_week: 1,
      current_scripture_week: 1
    };
  }

  // Fetch current items based on week positions
  const items = [];

  if ((settings as any).catechism_enabled) {
    const catechism = await c.env.DB.prepare(`
      SELECT * FROM liturgy_items
      WHERE type = 'catechism' AND source = ? AND sequence_number = ? AND is_active = 1
    `).bind((settings as any).catechism_source, (settings as any).current_catechism_week).first();
    if (catechism) items.push({ ...catechism, itemType: 'catechism' });
  }

  if ((settings as any).hymnal_enabled) {
    const hymn = await c.env.DB.prepare(`
      SELECT * FROM liturgy_items
      WHERE type = 'hymn' AND source = ? AND sequence_number = ? AND is_active = 1
    `).bind((settings as any).hymnal_source, (settings as any).current_hymn_week).first();
    if (hymn) items.push({ ...hymn, itemType: 'hymn' });
  }

  if ((settings as any).scripture_enabled) {
    const scripture = await c.env.DB.prepare(`
      SELECT * FROM liturgy_items
      WHERE type = 'scripture' AND source = ? AND sequence_number = ? AND is_active = 1
    `).bind((settings as any).bible_translation, (settings as any).current_scripture_week).first();
    if (scripture) items.push({ ...scripture, itemType: 'scripture' });
  }

  // Get today's completions
  const completions = await c.env.DB.prepare(`
    SELECT liturgy_item_id FROM liturgy_completions
    WHERE parent_id = ? AND completed_date = ?
  `).bind(user.id, today).all();

  const completedIds = new Set(completions.results?.map((r: any) => r.liturgy_item_id) || []);

  // Convert settings integers to booleans
  let safeSettings = null;
  if (settings) {
    safeSettings = {
      ...settings,
      catechism_enabled: !!(settings as any).catechism_enabled,
      hymnal_enabled: !!(settings as any).hymnal_enabled,
      scripture_enabled: !!(settings as any).scripture_enabled,
    };
  }

  return c.json({
    date: today,
    settings: safeSettings,
    items: items.map((item: any) => ({
      ...item,
      completedToday: completedIds.has(item.id)
    }))
  });
});

// POST /api/liturgy/complete - Mark item as completed for today
app.post('/api/liturgy/complete', async (c) => {
  const user = requireAuth(c);
  const { itemId } = await c.req.json();
  const today = new Date().toISOString().split('T')[0];

  const completionId = generateId('lc');

  try {
    await c.env.DB.prepare(`
      INSERT INTO liturgy_completions (id, parent_id, liturgy_item_id, completed_date)
      VALUES (?, ?, ?, ?)
    `).bind(completionId, user.id, itemId, today).run();

    return c.json({ success: true, completionId });
  } catch (e: any) {
    // Already completed today (unique constraint)
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
    DELETE FROM liturgy_completions
    WHERE parent_id = ? AND liturgy_item_id = ? AND completed_date = ?
  `).bind(user.id, itemId, today).run();

  return c.json({ success: true });
});

// POST /api/liturgy/advance - Move to next week for a type
app.post('/api/liturgy/advance', async (c) => {
  const user = requireAuth(c);
  const { type } = await c.req.json(); // 'catechism' | 'hymn' | 'scripture'

  const columnMap: Record<string, string> = {
    catechism: 'current_catechism_week',
    hymn: 'current_hymn_week',
    scripture: 'current_scripture_week'
  };

  const column = columnMap[type];
  if (!column) {
    return c.json({ error: 'Invalid type' }, 400);
  }

  await c.env.DB.prepare(`
    UPDATE family_liturgy_settings
    SET ${column} = ${column} + 1, updated_at = datetime('now')
    WHERE parent_id = ?
  `).bind(user.id).run();

  return c.json({ success: true });
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

// PUT /api/liturgy/settings - Update family liturgy settings
app.put('/api/liturgy/settings', async (c) => {
  const user = requireAuth(c);
  const updates: any = await c.req.json();

  const allowedFields = [
    'catechism_enabled', 'catechism_source',
    'hymnal_enabled', 'hymnal_source',
    'scripture_enabled', 'bible_translation',
    'current_catechism_week', 'current_hymn_week', 'current_scripture_week'
  ];

  const validUpdates = Object.keys(updates).filter(k => allowedFields.includes(k));

  const setClause = validUpdates
    .map(k => `${k} = ?`)
    .join(', ');

  if (!setClause) {
    return c.json({ error: 'No valid fields to update' }, 400);
  }

  const values = validUpdates.map(k => {
    const val = updates[k];
    // Convert booleans to integers for SQLite
    if (typeof val === 'boolean') {
      return val ? 1 : 0;
    }
    return val;
  });

  await c.env.DB.prepare(`
    UPDATE family_liturgy_settings
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
    const table = contentType === 'activity' ? 'activities' : 'books';
    const countResult = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM content_upvotes WHERE content_type = ? AND content_id = ?`
    ).bind(contentType, contentId).first<{ count: number }>();

    const newCount = countResult?.count || 0;

    await c.env.DB.prepare(
      `UPDATE ${table} SET upvote_count = ? WHERE id = ?`
    ).bind(newCount, contentId).run();

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
    const table = contentType === 'activity' ? 'activities' : 'books';
    const countResult = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM parent_comments WHERE content_type = ? AND content_id = ?`
    ).bind(contentType, contentId).first<{ count: number }>();

    const newCount = countResult?.count || 0;

    await c.env.DB.prepare(
      `UPDATE ${table} SET comment_count = ? WHERE id = ?`
    ).bind(newCount, contentId).run();

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

    // Update count
    const table = comment.content_type === 'activity' ? 'activities' : 'books';
    await c.env.DB.prepare(
      `UPDATE ${table} SET comment_count = (SELECT COUNT(*) FROM parent_comments WHERE content_type = ? AND content_id = ?) WHERE id = ?`
    ).bind(comment.content_type, comment.content_id, comment.content_id).run();

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
    const { availableDays, minutesPerDay, preferredTimes, maxSessionsPerDay, fieldTripDays } = await c.req.json();

    // Upsert
    const existing = await c.env.DB.prepare(
      'SELECT id FROM weekly_time_model WHERE parent_id = ?'
    ).bind(user.id).first();

    if (existing) {
      await c.env.DB.prepare(`
        UPDATE weekly_time_model SET
          available_days = COALESCE(?, available_days),
          minutes_per_day = COALESCE(?, minutes_per_day),
          preferred_times = COALESCE(?, preferred_times),
          max_sessions_per_day = COALESCE(?, max_sessions_per_day),
          field_trip_days = COALESCE(?, field_trip_days),
          updated_at = datetime('now')
        WHERE parent_id = ?
      `).bind(
        availableDays ? JSON.stringify(availableDays) : null,
        minutesPerDay || null,
        preferredTimes ? JSON.stringify(preferredTimes) : null,
        maxSessionsPerDay || null,
        fieldTripDays ? JSON.stringify(fieldTripDays) : null,
        user.id
      ).run();
    } else {
      const id = generateId('tm');
      await c.env.DB.prepare(`
        INSERT INTO weekly_time_model (id, parent_id, available_days, minutes_per_day, preferred_times, max_sessions_per_day, field_trip_days)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        user.id,
        JSON.stringify(availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
        minutesPerDay || 45,
        JSON.stringify(preferredTimes || ['morning']),
        maxSessionsPerDay || 2,
        JSON.stringify(fieldTripDays || [])
      ).run();
    }

    const model = await c.env.DB.prepare(
      'SELECT * FROM weekly_time_model WHERE parent_id = ?'
    ).bind(user.id).first();

    return c.json({
      ...model,
      availableDays: JSON.parse((model as any).available_days),
      preferredTimes: JSON.parse((model as any).preferred_times),
      fieldTripDays: JSON.parse((model as any).field_trip_days || '[]')
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
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
    const { results: children } = await c.env.DB.prepare(
      'SELECT id, name, age_in_months FROM students WHERE parent_id = ? ORDER BY age_in_months DESC'
    ).bind(user.id).all();

    if (children.length === 0) {
      return c.json({ error: 'No children found. Add a child first.' }, 400);
    }

    // Fetch completions for this week
    const weekEndDate = new Date(weekStart);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    const weekEnd = weekEndDate.toISOString().split('T')[0];

    const completionsResult = await c.env.DB.prepare(`
        SELECT activity_id, completed_at, 'completion' as type FROM activity_completions
        WHERE parent_id = ? AND date(completed_at) >= ? AND date(completed_at) <= ?
        UNION
        SELECT activity_id, completed_at, 'observation' as type FROM observations
        WHERE student_id IN (SELECT id FROM students WHERE parent_id = ?) AND date(completed_at) >= ? AND date(completed_at) <= ?
    `).bind(user.id, weekStart, weekEnd, user.id, weekStart, weekEnd).all();

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
      SELECT id, title, domain, min_age_months, max_age_months, duration_minutes, 
             materials, cluster_tag, mess_level, activity_type, primary_tier
      FROM activities 
      WHERE min_age_months <= ? AND max_age_months >= ?
        AND is_active = 1
        AND (is_archived = 0 OR is_archived IS NULL)
        AND (archived = 0 OR archived IS NULL)
        AND (content_status != 'blacklisted' OR content_status IS NULL)
        AND (deprecated = 0 OR deprecated IS NULL)
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
      INSERT INTO weekly_plans (id, parent_id, week_start, plan_json, override_version)
      VALUES (?, ?, ?, ?, 1)
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
    const { results: children } = await c.env.DB.prepare(
      'SELECT id, name, age_in_months FROM students WHERE parent_id = ? ORDER BY age_in_months DESC'
    ).bind(user.id).all();

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
      SELECT id, title, domain, min_age_months, max_age_months, duration_minutes,
             materials, cluster_tag, mess_level, activity_type, primary_tier
      FROM activities
      WHERE min_age_months <= ? AND max_age_months >= ?
        AND is_active = 1
        AND (is_archived = 0 OR is_archived IS NULL)
        AND (archived = 0 OR archived IS NULL)
        AND (content_status != 'blacklisted' OR content_status IS NULL)
        AND (deprecated = 0 OR deprecated IS NULL)
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
    const tierDistJson = '{}'; // Placeholder, actual distribution calculation logic needed if we want to store it

    await c.env.DB.prepare(`
      INSERT INTO weekly_plans (id, parent_id, week_start, plan_json, balance_preference, tier_distribution)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(parent_id, week_start) DO UPDATE SET
        plan_json = excluded.plan_json,
        balance_preference = excluded.balance_preference,
        tier_distribution = excluded.tier_distribution,
        generated_at = datetime('now')
    `).bind(planId, user.id, targetWeek, JSON.stringify(plan), balancePreference, tierDistJson).run();

    // Fetch completions for this week
    const weekEndDate = new Date(targetWeek);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    const weekEnd = weekEndDate.toISOString().split('T')[0];

    const completionsResult = await c.env.DB.prepare(`
        SELECT activity_id, completed_at, 'completion' as type FROM activity_completions
        WHERE parent_id = ? AND date(completed_at) >= ? AND date(completed_at) <= ?
        UNION
        SELECT activity_id, completed_at, 'observation' as type FROM observations
        WHERE student_id IN (SELECT id FROM students WHERE parent_id = ?) AND date(completed_at) >= ? AND date(completed_at) <= ?
    `).bind(user.id, targetWeek, weekEnd, user.id, targetWeek, weekEnd).all();

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

    // Get completions for the week
    const { results: completions } = await c.env.DB.prepare(`
      SELECT ac.activity_id, ac.completed_at, ac.notes, a.title, a.domain
      FROM activity_completions ac
      JOIN activities a ON ac.activity_id = a.id
      WHERE ac.parent_id = ? AND date(ac.completed_at) >= ? AND date(ac.completed_at) <= ?
    `).bind(user.id, weekStart, weekEnd).all();

    // Get observations for the week
    const { results: observations } = await c.env.DB.prepare(`
      SELECT o.activity_id, o.mastery_level, o.parent_notes, o.completed_at, 
             a.title, a.domain, s.name as child_name
      FROM observations o
      JOIN activities a ON o.activity_id = a.id
      JOIN students s ON o.student_id = s.id
      WHERE s.parent_id = ? AND date(o.completed_at) >= ? AND date(o.completed_at) <= ?
    `).bind(user.id, weekStart, weekEnd).all();

    if (completions.length === 0 && observations.length === 0) {
      return c.json({
        summary: "This week hasn't had any recorded activities yet. That's perfectly okay – rest and family time are valuable too!",
        patterns: [],
        suggestedQuestions: []
      });
    }

    // Build context for AI
    const completionContext = completions.map((c: any) =>
      `- ${c.title} (${c.domain}) completed on ${c.completed_at}${c.notes ? ': ' + c.notes : ''}`
    ).join('\n');

    const observationContext = observations.map((o: any) =>
      `- ${o.child_name} on "${o.title}" (${o.domain}): ${o.mastery_level}${o.parent_notes ? ' - ' + o.parent_notes : ''}`
    ).join('\n');

    const systemPrompt = `You are SchoolOS, a Christian homeschool assistant. Generate a warm, encouraging weekly summary for parents.

IMPORTANT: Your language must be ADVISORY, never AUTHORITATIVE. Use phrases like:
- "I noticed..." instead of "Your child should..."
- "You might consider..." instead of "You need to..."
- "It seems like..." instead of "Your child is..."

Children: ${children.map((c: any) => `${c.name} (${Math.floor(c.age_in_months / 12)} years)`).join(', ')}

Activities completed this week:
${completionContext || 'No activities recorded'}

Observations recorded:
${observationContext || 'No observations recorded'}

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
      completionCount: completions.length,
      observationCount: observations.length,
      ...parsed
    });
  } catch (error: any) {
    console.error('Weekly summary error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// Generate streaming chat response (Phase 3)
app.post('/api/ai/chat', async (c) => {
  try {
    const user = requireAuth(c);
    const { message, context } = await c.req.json();

    // Initialize coach with full context
    const coach = new AiCoach(c.env);

    // Fetch active settings to inject into context
    const { results: overrides } = await c.env.DB.prepare(
      'SELECT * FROM parent_overrides WHERE parent_id = ? AND is_active = 1'
    ).bind(user.id).all();

    const liturgySettings = await c.env.DB.prepare(
      'SELECT * FROM family_liturgy_settings WHERE parent_id = ?'
    ).bind(user.id).first();

    // Add user to context
    const fullContext = {
      ...context,
      user: { id: user.id, name: user.name },
      activeOverrides: overrides,
      liturgySettings: liturgySettings
    };

    const stream = await coach.chat(message, fullContext);

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
      SELECT o.mastery_level, o.parent_notes, o.completed_at, a.title, a.domain
      FROM observations o
      JOIN activities a ON o.activity_id = a.id
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

    if (!key || !key.startsWith(user.id)) {
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

    // Check ownership by ensuring the key contains the user ID (part of the path strategy)
    // The key structure we defined is `portfolio/USER_ID/filename`
    // So we check if key contains user.id
    if (!key.includes(user.id)) {
      return c.json({ error: 'Unauthorized access to file' }, 403);
    }

    const object = await c.env.BOOKS_BUCKET.get(key);

    if (!object) {
      return c.json({ error: 'File not found' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    return new Response(object.body, {
      headers,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Delete portfolio item
app.delete('/api/portfolio/:itemId', async (c) => {
  try {
    const user = requireAuth(c);
    const itemId = c.req.param('itemId');

    const item = await c.env.DB.prepare(
      'SELECT * FROM portfolio_items WHERE id = ? AND parent_id = ?'
    ).bind(itemId, user.id).first();

    if (!item) return c.json({ error: 'Item not found' }, 404);

    // Delete from R2 if key exists
    if ((item as any).r2_key) {
      await c.env.BOOKS_BUCKET.delete((item as any).r2_key);
    }

    // Delete from DB
    await c.env.DB.prepare('DELETE FROM portfolio_items WHERE id = ?').bind(itemId).run();

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============ PHASE 3: GRADUATED INDEPENDENCE ============

// Child AI System Prompt - Follows AI_GOVERNANCE_AND_ETHICS.md
const CHILD_AI_SYSTEM_PROMPT = `You are helping a young student understand their schoolwork in a Christian homeschool environment.

RULES:
- Use simple, age-appropriate language
- Never tell the child they are "wrong" or "not smart"
- Guide with questions, don't give direct answers (Socratic method)
- If asked about grades, levels, or readiness, say: "Your parent decides that"
- If asked to do their work for them, say: "Let's think about it together"
- Always be encouraging and patient
- Never assess their character or abilities
- Never make moral judgments
- Stick to helping understand the content, not evaluating the child

You are a servant tool helping the child learn, not a teacher or authority figure.`;

// Get independence settings for a student
app.get('/api/independence-settings/:studentId', async (c) => {
  try {
    const user = requireAuth(c);
    const studentId = c.req.param('studentId');

    // Verify student belongs to parent
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND parent_id = ?'
    ).bind(studentId, user.id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    const { results } = await c.env.DB.prepare(
      'SELECT * FROM independence_settings WHERE student_id = ?'
    ).bind(studentId).all();

    // Transform snake_case to camelCase
    const settings = results.map((s: any) => ({
      id: s.id,
      parentId: s.parent_id,
      studentId: s.student_id,
      subject: s.subject,
      level: s.level,
      canMarkComplete: !!s.can_mark_complete,
      canAskAi: !!s.can_ask_ai,
      canViewPortfolio: !!s.can_view_portfolio,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }));

    return c.json(settings);
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// Update or create independence settings for a student/subject pair
app.put('/api/independence-settings/:studentId', async (c) => {
  try {
    const user = requireAuth(c);
    const studentId = c.req.param('studentId');
    const body = await c.req.json();
    const { subject, level, canMarkComplete, canAskAi, canViewPortfolio } = body;

    // Verify student belongs to parent
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND parent_id = ?'
    ).bind(studentId, user.id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    // Validate subject
    const validSubjects = ['all', 'bible', 'history', 'math', 'reading', 'motor', 'language', 'cognitive', 'social-emotional', 'pre-academic'];
    if (!validSubjects.includes(subject)) {
      return c.json({ error: 'Invalid subject' }, 400);
    }

    // Validate level
    if (!['parent_led', 'guided', 'independent'].includes(level)) {
      return c.json({ error: 'Invalid independence level' }, 400);
    }

    // Upsert setting
    const id = generateId('indep');
    await c.env.DB.prepare(`
        INSERT INTO independence_settings (id, parent_id, student_id, subject, level, can_mark_complete, can_ask_ai, can_view_portfolio, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(student_id, subject) DO UPDATE SET
          level = excluded.level,
          can_mark_complete = excluded.can_mark_complete,
          can_ask_ai = excluded.can_ask_ai,
          can_view_portfolio = excluded.can_view_portfolio,
          updated_at = datetime('now')
      `).bind(
      id,
      user.id,
      studentId,
      subject,
      level,
      canMarkComplete ? 1 : 0,
      canAskAi ? 1 : 0,
      canViewPortfolio !== false ? 1 : 0
    ).run();

    // Return updated setting
    const setting = await c.env.DB.prepare(
      'SELECT * FROM independence_settings WHERE student_id = ? AND subject = ?'
    ).bind(studentId, subject).first();

    return c.json({
      id: (setting as any).id,
      parentId: (setting as any).parent_id,
      studentId: (setting as any).student_id,
      subject: (setting as any).subject,
      level: (setting as any).level,
      canMarkComplete: !!(setting as any).can_mark_complete,
      canAskAi: !!(setting as any).can_ask_ai,
      canViewPortfolio: !!(setting as any).can_view_portfolio,
      updatedAt: (setting as any).updated_at,
    });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// Child-facing AI explain (with full logging for parent visibility)
app.post('/api/ai/child-explain', async (c) => {
  try {
    const user = requireAuth(c);
    const { studentId, question, context } = await c.req.json();

    if (!studentId || !question) {
      return c.json({ error: 'studentId and question are required' }, 400);
    }

    // Verify student belongs to parent
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND parent_id = ?'
    ).bind(studentId, user.id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    // Check if child has AI permission
    const setting = await c.env.DB.prepare(
      'SELECT can_ask_ai FROM independence_settings WHERE student_id = ? AND (subject = ? OR subject = ?) ORDER BY CASE WHEN subject = ? THEN 1 ELSE 2 END LIMIT 1'
    ).bind(studentId, context?.domain || 'all', 'all', context?.domain || 'all').first();

    // Default to parent_led (no AI access) if no settings exist
    if (!setting || !(setting as any).can_ask_ai) {
      return c.json({ error: 'AI access not permitted for this child' }, 403);
    }

    // Call AI with child-appropriate system prompt
    let answer = '';
    try {
      const messages = [
        { role: 'system', content: CHILD_AI_SYSTEM_PROMPT },
        { role: 'user', content: `Context: ${context?.activityTitle || 'General schoolwork'}\n\nQuestion: ${question}` }
      ];

      const response = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages });
      answer = response.response || 'I\'m sorry, I couldn\'t generate a response. Please ask your parent for help!';
    } catch (aiError) {
      console.error('AI error:', aiError);
      answer = 'I\'m having trouble right now. Please ask your parent for help!';
    }

    // Log the interaction for parent visibility
    const logId = generateId('ailog');
    await c.env.DB.prepare(`
        INSERT INTO ai_interaction_logs (id, parent_id, student_id, interaction_type, question, answer, context_json, created_at)
        VALUES (?, ?, ?, 'explain', ?, ?, ?, datetime('now'))
      `).bind(
      logId,
      user.id,
      studentId,
      question,
      answer,
      context ? JSON.stringify(context) : null
    ).run();

    return c.json({ answer, sources: [] });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// Get AI interaction logs (parent visibility of child AI usage)
app.get('/api/ai/interactions', async (c) => {
  try {
    const user = requireAuth(c);
    const studentId = c.req.query('studentId');

    let query = `
        SELECT l.*, s.name as student_name 
        FROM ai_interaction_logs l
        LEFT JOIN students s ON l.student_id = s.id
        WHERE l.parent_id = ?
      `;
    const params: any[] = [user.id];

    if (studentId) {
      query += ' AND l.student_id = ?';
      params.push(studentId);
    }

    query += ' ORDER BY l.created_at DESC LIMIT 100';

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    // Transform to camelCase
    const logs = results.map((log: any) => ({
      id: log.id,
      parentId: log.parent_id,
      studentId: log.student_id,
      studentName: log.student_name,
      interactionType: log.interaction_type,
      question: log.question,
      answer: log.answer,
      context: log.context_json ? JSON.parse(log.context_json) : null,
      createdAt: log.created_at,
    }));

    return c.json(logs);
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// Get student view data (for child-facing simplified view)
app.get('/api/student-view/:studentId', async (c) => {
  try {
    const user = requireAuth(c);
    const studentId = c.req.param('studentId');

    // Verify student belongs to parent
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND parent_id = ?'
    ).bind(studentId, user.id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    // Get independence settings
    const { results: settingsRaw } = await c.env.DB.prepare(
      'SELECT * FROM independence_settings WHERE student_id = ?'
    ).bind(studentId).all();

    const independenceSettings = settingsRaw.map((s: any) => ({
      id: s.id,
      parentId: s.parent_id,
      studentId: s.student_id,
      subject: s.subject,
      level: s.level,
      canMarkComplete: !!s.can_mark_complete,
      canAskAi: !!s.can_ask_ai,
      canViewPortfolio: !!s.can_view_portfolio,
    }));

    // Aggregate permissions (any setting with permission grants it)
    const permissions = {
      canMarkComplete: independenceSettings.some((s: any) => s.canMarkComplete),
      canAskAi: independenceSettings.some((s: any) => s.canAskAi),
      canViewPortfolio: independenceSettings.length === 0 || independenceSettings.some((s: any) => s.canViewPortfolio),
    };

    // Get today's tasks based on weekly plan
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
    const weekStart = getSmartWeekStart();
    const plan = await c.env.DB.prepare('SELECT plan_json FROM weekly_plans WHERE parent_id = ? AND week_start = ?')
      .bind(user.id, weekStart).first();

    let tasks: any[] = [];
    if (plan) {
      const planData = JSON.parse((plan as any).plan_json);
      const todaySlots = planData.slots?.filter((s: any) => s.day === dayOfWeek) || [];
      const activityIds = todaySlots.map((s: any) => s.activityId);

      if (activityIds.length > 0) {
        const placeholders = activityIds.map(() => '?').join(',');
        const { results } = await c.env.DB.prepare(`
            SELECT * FROM activities WHERE id IN (${placeholders})
          `).bind(...activityIds).all();

        tasks = results.map((a: any) => ({
          ...a,
          materials: JSON.parse(a.materials || '[]'),
          instructions: JSON.parse(a.instructions || '[]'),
        }));
      }
    }

    // Get portfolio items if permitted
    let portfolioItems: any[] = [];
    if (permissions.canViewPortfolio) {
      const { results: portfolioRaw } = await c.env.DB.prepare(
        'SELECT * FROM portfolio_items WHERE student_id = ? ORDER BY created_at DESC LIMIT 20'
      ).bind(studentId).all();

      portfolioItems = portfolioRaw.map((p: any) => ({
        id: p.id,
        studentId: p.student_id,
        parentId: p.parent_id,
        title: p.title,
        description: p.description,
        itemType: p.item_type,
        domain: p.domain,
        milestoneTag: p.milestone_tag,
        createdAt: p.created_at,
        publicUrl: p.r2_key ? `/api/portfolio/file/${encodeURIComponent(p.r2_key)}` : null
      }));
    }

    return c.json({
      student: {
        id: (student as any).id,
        parentId: (student as any).parent_id,
        name: (student as any).name,
        dateOfBirth: (student as any).date_of_birth,
        ageInMonths: (student as any).age_in_months,
        currentStage: (student as any).current_stage,
      },
      independenceSettings,
      tasks,
      portfolioItems,
      permissions,
    });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// Student mark complete (only if permitted)
app.post('/api/student-view/:studentId/complete', async (c) => {
  try {
    const user = requireAuth(c);
    const studentId = c.req.param('studentId');
    const { activityId, notes } = await c.req.json();

    // Verify student belongs to parent
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND parent_id = ?'
    ).bind(studentId, user.id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    // Check permission
    const { results: settings } = await c.env.DB.prepare(
      'SELECT can_mark_complete FROM independence_settings WHERE student_id = ?'
    ).bind(studentId).all();

    const hasPermission = settings.some((s: any) => s.can_mark_complete);
    if (!hasPermission) {
      return c.json({ error: 'Permission denied: cannot mark complete' }, 403);
    }

    // Record completion
    const id = generateId('comp');
    await c.env.DB.prepare(`
        INSERT INTO activity_completions (id, parent_id, activity_id, notes)
        VALUES (?, ?, ?, ?)
      `).bind(id, user.id, activityId, notes || `Completed by ${(student as any).name}`).run();

    return c.json({ success: true });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});
// ============ AI COACH ROUTES ============



app.post('/api/ai/explain-plan', async (c) => {
  try {
    const user = requireAuth(c);
    const { slot, childId } = await c.req.json();

    const child = await c.env.DB.prepare('SELECT * FROM students WHERE id = ?').bind(childId).first();

    if (!child) return c.json({ error: 'Child not found' }, 404);

    const coach = new AiCoach(c.env);
    const response = await coach.explainPlan(slot, child);

    // Response might be a ReadableStream or a string depending on default behavior
    // For explainPlan we used invoke (non-streaming in ai.ts? wait, ai.ts explainPlan uses run without stream:true)
    // So it returns a result object { response: string } usually

    return c.json(response);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============ STRATEGIC INSIGHTS & PLANNING ============

app.post('/api/family/weekly-plan/strategic-insight', async (c) => {
  try {
    const user = requireAuth(c);
    const { plan, children } = await c.req.json();
    const coach = new AiCoach(c.env);
    const insights = await coach.generateStrategicInsights(plan, children);
    return c.json(insights);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/api/family/weekly-plan/regenerate', async (c) => {
  try {
    const user = requireAuth(c);
    const { balancePreference, weekStart } = await c.req.json();

    // 1. Fetch dependencies
    const { results: children } = await c.env.DB.prepare('SELECT * FROM students WHERE parent_id = ?').bind(user.id).all();
    const timeModel = await c.env.DB.prepare('SELECT * FROM weekly_time_model WHERE parent_id = ?').bind(user.id).first();
    const { results: overrides } = await c.env.DB.prepare('SELECT * FROM overrides WHERE parent_id = ? AND is_active = 1').bind(user.id).all();

    // Activities (fetch relevant ones)
    // We assume is_active=1. Also handle archived flags if present
    const { results: activities } = await c.env.DB.prepare(
      "SELECT * FROM activities WHERE is_active = 1 AND (is_archived = 0 OR is_archived IS NULL)"
    ).bind().all();

    // Parse timeModel
    const parsedTimeModel = timeModel ? {
      ...timeModel,
      available_days: JSON.parse((timeModel as any).available_days),
      preferred_times: JSON.parse((timeModel as any).preferred_times),
      field_trip_days: JSON.parse((timeModel as any).field_trip_days || '[]')
    } : { available_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], minutes_per_day: 120, preferred_times: ['morning'], max_sessions_per_day: 3, field_trip_days: [] };

    // 2. Generate Plan
    const activitiesMapped = activities.map((a: any) => ({
      ...a,
      materials: JSON.parse(a.materials || '[]'),
      // Ensure other fields match Activity interface
    }));

    const planResult = await generateWeeklyPlan(
      children as any,
      activitiesMapped as any,
      parsedTimeModel as any,
      overrides as any,
      c.env.DB,
      user.id,
      balancePreference
    );

    // 3. Save Plan
    const actualWeekStart = weekStart || getSmartWeekStart();
    const id = generateId('plan');

    await c.env.DB.prepare(`
            INSERT INTO weekly_plans (id, parent_id, week_start, plan_json, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))
            ON CONFLICT(parent_id, week_start) DO UPDATE SET
            plan_json = excluded.plan_json,
            created_at = datetime('now')
        `).bind(id, user.id, actualWeekStart, JSON.stringify(planResult)).run();

    return c.json({ success: true, plan: planResult });
  } catch (error: any) {
    console.error('Regenerate Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/api/rhythm/readjust', async (c) => {
  try {
    const user = requireAuth(c);
    const { prompt, weekStart } = await c.req.json();

    // 1. Get current model
    const currentModel = await c.env.DB.prepare('SELECT * FROM weekly_time_model WHERE parent_id = ?').bind(user.id).first();
    const parsedModel = currentModel ? {
      ...currentModel,
      available_days: JSON.parse((currentModel as any).available_days),
      preferred_times: JSON.parse((currentModel as any).preferred_times),
      field_trip_days: JSON.parse((currentModel as any).field_trip_days || '[]')
    } : { available_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], minutes_per_day: 120, preferred_times: ['morning'], max_sessions_per_day: 3, field_trip_days: [] };

    // 2. AI Update
    const coach = new AiCoach(c.env);
    const updates = await coach.parseRhythmAdjustment(prompt, parsedModel);

    // 3. Merge updates
    const newModel = { ...parsedModel, ...updates };

    // 4. Save
    const id = (currentModel as any)?.id || generateId('tm');
    await c.env.DB.prepare(`
            INSERT INTO weekly_time_model (id, parent_id, available_days, minutes_per_day, preferred_times, max_sessions_per_day, field_trip_days, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(parent_id) DO UPDATE SET
            available_days = excluded.available_days,
            minutes_per_day = excluded.minutes_per_day,
            preferred_times = excluded.preferred_times,
            max_sessions_per_day = excluded.max_sessions_per_day,
            field_trip_days = excluded.field_trip_days,
            updated_at = datetime('now')
        `).bind(
      id,
      user.id,
      JSON.stringify(newModel.available_days),
      newModel.minutes_per_day,
      JSON.stringify(newModel.preferred_times),
      newModel.max_sessions_per_day,
      JSON.stringify(newModel.field_trip_days)
    ).run();

    // 5. Trigger Regeneration (Implicitly required for user to see change immediately)
    // We reuse the regeneration logic briefly or just return success and let FE regenerate separate call?
    // CoachChat calls rhythm.readjust THEN invalidateQueries(['weekly-plan']).
    // The FE will fetch GET logic. 
    // IF the GET logic doesn't auto-regenerate on stale, user sees old plan.
    // BUT generateWeeklyPlan is deterministic based on model.
    // So if model changes, we SHOULD regenerate the plan row in DB, because GET reads the DB row.
    // YES, we must regenerate.

    // ... Fetch data again for regeneration (can be optimized but safe way)
    const { results: children } = await c.env.DB.prepare('SELECT * FROM students WHERE parent_id = ?').bind(user.id).all();
    const { results: overrides } = await c.env.DB.prepare('SELECT * FROM overrides WHERE parent_id = ? AND is_active = 1').bind(user.id).all();
    const { results: activities } = await c.env.DB.prepare("SELECT * FROM activities WHERE is_active = 1 AND (is_archived = 0 OR is_archived IS NULL)").bind().all();
    const activitiesMapped = activities.map((a: any) => ({
      ...a,
      materials: JSON.parse(a.materials || '[]'),
    }));

    const planResult = await generateWeeklyPlan(
      children as any,
      activitiesMapped as any,
      newModel as any, // Use NEW model
      overrides as any,
      c.env.DB,
      user.id,
      'mixed' // Default balance on readjust
    );

    const actualWeekStart = weekStart || getSmartWeekStart();
    const planId = generateId('plan');
    await c.env.DB.prepare(`
            INSERT INTO weekly_plans (id, parent_id, week_start, plan_json, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))
            ON CONFLICT(parent_id, week_start) DO UPDATE SET
            plan_json = excluded.plan_json,
            created_at = datetime('now')
        `).bind(planId, user.id, actualWeekStart, JSON.stringify(planResult)).run();

    return c.json({ success: true, plan: planResult });

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});


app.post('/api/support/log-click', async (c) => {
  try {
    const user = requireAuth(c);
    const { source } = await c.req.json();

    if (!source) return c.json({ error: 'Source required' }, 400);

    const id = generateId('click');
    await c.env.DB.prepare(
      'INSERT INTO support_clicks (id, user_id, source) VALUES (?, ?, ?)'
    ).bind(id, user.id, source).run();

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Support log error:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;

