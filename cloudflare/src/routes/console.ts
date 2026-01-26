import { Hono } from 'hono';
import { Env, User } from '../types';
import { safeCompare, escapeHtml } from '../lib/security';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null; nonce: string } }>();

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

export default app;
