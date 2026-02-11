import { Hono } from 'hono';
import { Env, User } from '../types';
import { safeCompare } from '../lib/security';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// Security Middleware
app.use('*', async (c, next) => {
    // 1. Check API Key Strategy (Service Accounts / Tests)
    const apiKey = c.req.header('X-Admin-Api-Key');
    const validApiKey = c.env.ADMIN_TEST_API_KEY;

    if (apiKey && validApiKey) {
        if (await safeCompare(apiKey, validApiKey)) {
            return next();
        }
    }

    // 2. Check Email Allowlist Strategy (Human Admins)
    const user = c.get('user');
    if (user?.email) {
        const allowlist = (c.env.ADMIN_EMAIL_ALLOWLIST || '').split(',').map(e => e.trim());
        if (allowlist.includes(user.email)) {
            return next();
        }
    }

    return c.json({ error: 'Unauthorized Admin Access' }, 403);
});

/**
 * GET /api/admin/ai/overview
 * Aggregate AI ops stats (default last 30 days).
 */
app.get('/overview', async (c) => {
    try {
        const days = Math.min(Number(c.req.query('days')) || 30, 90);
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

        const overview = await c.env.DB.prepare(`
            SELECT 
                COUNT(*) as total_calls,
                AVG(latency_ms) as avg_latency,
                SUM(request_tokens) as total_request_tokens,
                SUM(response_tokens) as total_response_tokens,
                SUM(case when status = 'error' then 1 else 0 end) as error_count
            FROM ai_telemetry
            WHERE timestamp >= ?
        `).bind(startDate).first();

        const { results: topFeatures } = await c.env.DB.prepare(`
            SELECT feature, COUNT(*) as count
            FROM ai_telemetry
            WHERE timestamp >= ?
            GROUP BY feature
            ORDER BY count DESC
            LIMIT 5
        `).bind(startDate).all();

        return c.json({ overview, topFeatures, startDate, days });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

/**
 * GET /api/admin/ai/telemetry
 * Filter by feature, date range.
 */
app.get('/telemetry', async (c) => {
    try {
        const feature = c.req.query('feature');
        const startDate = c.req.query('startDate');
        const endDate = c.req.query('endDate');
        const limit = Math.min(Number(c.req.query('limit')) || 50, 100);

        let query = 'SELECT * FROM ai_telemetry WHERE 1=1';
        const params: any[] = [];

        if (feature) {
            query += ' AND feature = ?';
            params.push(feature);
        }

        if (startDate) {
            query += ' AND timestamp >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND timestamp <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY timestamp DESC LIMIT ?';
        params.push(limit);

        const { results } = await c.env.DB.prepare(query).bind(...params).all();

        // Parse metadata_json
        const telemetry = results.map((row: any) => ({
            ...row,
            metadata: row.metadata_json ? JSON.parse(row.metadata_json) : {}
        }));

        return c.json({ telemetry });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

/**
 * GET /api/admin/ai/anchors
 * Return recent anchors (sanitized).
 */
app.get('/anchors', async (c) => {
    try {
        const limit = Math.min(Number(c.req.query('limit')) || 20, 50);

        const { results } = await c.env.DB.prepare(`
            SELECT anchor_date, anchor_data, status, generation_reasoning 
            FROM daily_anchors 
            ORDER BY anchor_date DESC 
            LIMIT ?
        `).bind(limit).all();

        const anchors = results.map((row: any) => {
            let data: any = {};
            try {
                const parsed = JSON.parse(row.anchor_data);
                data = {
                    theme: parsed.theme,
                    liturgy: parsed.liturgy ? {
                        hymn: parsed.liturgy.hymn,
                        catechism_q: parsed.liturgy.catechism_q,
                        scripture: parsed.liturgy.scripture
                    } : null,
                    family_activity: parsed.family_activity ? {
                        title: parsed.family_activity.title,
                        description: parsed.family_activity.description,
                        skill_domain: parsed.family_activity.skill_domain,
                        targets_covered: parsed.family_activity.targets_covered,
                        formation_lens: parsed.family_activity.formation_lens,
                        materials: parsed.family_activity.materials,
                        duration_minutes: parsed.family_activity.duration_minutes,
                        location: parsed.family_activity.location
                    } : null,
                    book_nook: parsed.book_nook ? {
                        title: parsed.book_nook.title,
                        discussion_prompt: parsed.book_nook.discussion_prompt
                    } : null
                };
            } catch (e) {
                data = { error: 'Failed to parse anchor data' };
            }

            return {
                date: row.anchor_date,
                status: row.status,
                reasoning: row.generation_reasoning,
                data
            };
        });

        return c.json({ anchors });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

/**
 * GET /api/admin/ai/spine/telemetry
 * Summary stats and conflicts for spine generation.
 */
app.get('/spine/telemetry', async (c) => {
    try {
        // 1. Get Telemetry Stats for Spine
        const stats = await c.env.DB.prepare(`
            SELECT 
                COUNT(*) as total_generations,
                AVG(latency_ms) as avg_latency,
                SUM(request_tokens) as total_input_tokens,
                SUM(response_tokens) as total_output_tokens,
                SUM(case when status = 'error' then 1 else 0 end) as error_count
            FROM ai_telemetry 
            WHERE feature = 'spine_generation'
        `).first();

        // 2. Get Recent Conflicts
        const { results: conflicts } = await c.env.DB.prepare(`
            SELECT spine_version, generation_log 
            FROM spine_metadata 
            WHERE status = 'draft' 
            ORDER BY created_at DESC 
            LIMIT 5
        `).all();

        const pendingConflicts = conflicts.map((row: any) => {
            try {
                const log = JSON.parse(row.generation_log);
                return {
                    version: row.spine_version,
                    conflictCount: log.conflicts?.length || 0,
                    conflicts: log.conflicts?.slice(0, 3) // Preview top 3
                };
            } catch {
                return { version: row.spine_version, error: 'Parse Error' };
            }
        });

        return c.json({
            stats,
            pendingConflicts
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

/**
 * GET /api/admin/ai/activities
 * Activity monitoring stats (domain coverage, types).
 */
app.get('/activities', async (c) => {
    try {
        const limit = 100; // Analyze last 100 anchors
        const { results } = await c.env.DB.prepare(`
            SELECT anchor_data FROM daily_anchors 
            ORDER BY anchor_date DESC 
            LIMIT ?
        `).bind(limit).all();

        const data = results.map((r: any) => {
            try {
                return JSON.parse(r.anchor_data);
            } catch {
                return null;
            }
        }).filter(Boolean);

        // Calculate Stats
        const domainCounts: Record<string, number> = {};
        const materialCounts: Record<string, number> = {};
        let totalActivities = 0;

        data.forEach((anchor: any) => {
            if (anchor.family_activity) {
                totalActivities++;
                const domain = anchor.family_activity.skill_domain || 'unknown';
                domainCounts[domain] = (domainCounts[domain] || 0) + 1;

                if (anchor.family_activity.materials) {
                    anchor.family_activity.materials.forEach((m: string) => {
                        materialCounts[m] = (materialCounts[m] || 0) + 1;
                    });
                }
            }
        });

        return c.json({
            totalAnalyzed: data.length,
            totalActivities,
            domainCounts,
            topMaterials: Object.entries(materialCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([name, count]) => ({ name, count }))
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

/**
 * GET /api/admin/ai/costs
 * Daily cost breakdown.
 */
app.get('/costs', async (c) => {
    try {
        const days = Math.min(Number(c.req.query('days')) || 30, 90);
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

        // Group by Date
        const { results } = await c.env.DB.prepare(`
            SELECT 
                DATE(timestamp) as date,
                SUM(request_tokens) as total_input_tokens,
                SUM(response_tokens) as total_output_tokens
            FROM ai_telemetry 
            WHERE timestamp >= ?
            GROUP BY DATE(timestamp)
            ORDER BY date ASC
        `).bind(startDate).all();

        // Gemini Flash Pricing (Check official docs, assuming $0.10/1M In, $0.40/1M Out)
        // Adjust these constants as needed or move to Env/DB
        const COST_PER_1M_INPUT = 0.10;
        const COST_PER_1M_OUTPUT = 0.40;

        let totalCost = 0;
        const dailyCosts = results.map((row: any) => {
            // Check for nulls
            const input = row.total_input_tokens || 0;
            const output = row.total_output_tokens || 0;

            const cost = (input / 1_000_000 * COST_PER_1M_INPUT) +
                (output / 1_000_000 * COST_PER_1M_OUTPUT);

            totalCost += cost;

            return {
                date: row.date,
                inputTokens: input,
                outputTokens: output,
                cost: Number(cost.toFixed(4)) // Round to 4 decimals
            };
        });

        return c.json({
            days,
            totalCost: Number(totalCost.toFixed(4)),
            dailyCosts
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

/**
 * GET /api/admin/ai/usage/users
 * Top users by usage.
 */
app.get('/usage/users', async (c) => {
    try {
        const days = Math.min(Number(c.req.query('days')) || 7, 30);
        // We only have daily snapshots in user_daily_chat_usage.
        // To get "last 7 days", we sum them up.

        // SQLite date modifier: date('now', '-7 days')
        const { results } = await c.env.DB.prepare(`
            SELECT 
                user_id,
                SUM(message_count) as total_messages,
                SUM(token_count) as total_tokens,
                COUNT(DISTINCT usage_date) as active_days
            FROM user_daily_chat_usage
            WHERE usage_date >= date('now', '-' || ? || ' days')
            GROUP BY user_id
            ORDER BY total_messages DESC
            LIMIT 20
        `).bind(days).all();

        // Fetch User Names (Optional: Join with users table if it exists or fetch from Auth provider)
        // Assuming we might have a users table or just returning IDs for now.
        // If 'users' table exists in D1, we could JOIN.
        // Based on types.ts, User comes from middleware, maybe not a D1 table we can join easily if it's external (Supabase/Auth0).
        // But the middleware uses `c.env.DB`, so there probably IS a users table or we rely on the ID.
        // wait, `requireHouseholdMember` checks `user` from request context, populated by `verifyUser` middleware.
        // Usually auth is handled by an external provider, but we might store profiles.
        // Let's just return IDs and usage for now.

        return c.json({ results });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

/**
 * GET /api/admin/ai/usage/summary
 * KPI Cards.
 */
app.get('/usage/summary', async (c) => {
    try {
        // Today
        const today = new Date().toISOString().split('T')[0];
        const { results: todayStats } = await c.env.DB.prepare(`
            SELECT 
                SUM(message_count) as messages,
                COUNT(DISTINCT user_id) as active_users
            FROM user_daily_chat_usage
            WHERE usage_date = ?
        `).bind(today).all();

        const todayMessages = todayStats[0].messages || 0;
        const todayUsers = todayStats[0].active_users || 0;

        // Cost Today (Estimated from Telemetry)
        const { results: costStats } = await c.env.DB.prepare(`
             SELECT 
                SUM(request_tokens) as total_input,
                SUM(response_tokens) as total_output
            FROM ai_telemetry 
            WHERE DATE(timestamp) = ?
        `).bind(today).all();

        const input = costStats[0].total_input || 0;
        const output = costStats[0].total_output || 0;
        const todayCost = (input / 1_000_000 * 0.10) + (output / 1_000_000 * 0.40);

        return c.json({
            today: {
                messages: todayMessages,
                activeUsers: todayUsers,
                cost: Number(todayCost.toFixed(4))
            }
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

export default app;
