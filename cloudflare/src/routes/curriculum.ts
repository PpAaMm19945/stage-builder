import { Hono } from 'hono';
import { Env, User, BookMetadata } from '../types';
import { requireParent } from '../lib/middleware';
import { safeCompare } from '../lib/security';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null; nonce: string } }>();

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

// ============ HYMNS ROUTE ============

app.get('/api/hymns', async (c) => {
    try {
        // Disable cache to ensure new audio_url field is fetched
        c.header('Cache-Control', 'no-store, max-age=0');
        const { results } = await c.env.DB.prepare(
            "SELECT * FROM formations WHERE cluster_tag = 'hymn' AND formation_type = 'liturgy' AND is_active = 1 ORDER BY sequence_number"
        ).all();

        return c.json(results || []);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
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

// ============ R2 ASSET ROUTES ============

// Debug R2 contents
app.get('/api/r2-debug', async (c) => {
    try {
        const prefix = c.req.query('prefix') || '';
        const list = await c.env.BOOKS_BUCKET.list({ limit: 100, prefix });
        return c.json(list);
    } catch (e: any) {
        // Assuming BOOKS_BUCKET binding exists on Env
        return c.text(`Error listing bucket: ${e.message}`, 500);
    }
});

export default app;
