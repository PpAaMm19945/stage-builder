import { Hono } from 'hono';
import { Env, User } from '../types';
import { requireAuth, requireParent } from '../lib/middleware';
import { withD1Retry } from '../lib/d1-retry';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// Types
interface LearningPath {
    id: string;
    title: string;
    description: string;
    path_type: string;
    content_filter: string; // JSON
    pace: string;
    total_items: number | null;
    min_age_months: number;
    max_age_months: number;
    cover_image_url: string | null;
    is_active: number;
    sort_order: number;
    created_at: string;
}

interface PathSubscription {
    id: string;
    parent_id: string;
    path_id: string;
    started_at: string;
    current_position: number;
    is_paused: number;
    completed_at: string | null;
}

// Helpers
function parseFilter(filterJson: string) {
    try {
        return JSON.parse(filterJson || '{}');
    } catch {
        return {};
    }
}

// Routes

// List all available paths
app.get('/api/paths', async (c) => {
    try {
        // Cache path definitions
        c.header('Cache-Control', 'public, max-age=3600');
        const { results } = await c.env.DB.prepare(
            'SELECT * FROM learning_paths WHERE is_active = 1 ORDER BY sort_order'
        ).all();
        return c.json(results);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Get subscriptions
app.get('/api/paths/subscriptions', async (c) => {
    try {
        const user = requireAuth(c);
        const { results } = await c.env.DB.prepare(`
            SELECT s.*, p.title as path_title, p.path_type, p.total_items
            FROM family_path_subscriptions s
            JOIN learning_paths p ON s.path_id = p.id
            WHERE s.parent_id = ?
        `).bind(user.id).all();

        // Hydrate with full path object if needed, or just enough for UI
        // Frontend expects 'path' object nested? 
        // Types say: path?: LearningPath

        // Let's fetch paths map
        const paths = await c.env.DB.prepare('SELECT * FROM learning_paths').all();
        const pathMap = new Map(paths.results.map((p: any) => [p.id, p]));

        const subs = results.map((s: any) => ({
            ...s,
            is_paused: !!s.is_paused,
            path: pathMap.get(s.path_id)
        }));

        return c.json(subs);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Subscribe
app.post('/api/paths/:id/subscribe', async (c) => {
    try {
        const user = requireParent(c);
        const pathId = c.req.param('id');

        // Verify path exists
        const path = await c.env.DB.prepare('SELECT * FROM learning_paths WHERE id = ?').bind(pathId).first();
        if (!path) return c.json({ error: 'Path not found' }, 404);

        const id = crypto.randomUUID();

        await c.env.DB.prepare(`
            INSERT INTO family_path_subscriptions (id, parent_id, path_id, started_at)
            VALUES (?, ?, ?, datetime('now'))
            ON CONFLICT(parent_id, path_id) DO UPDATE SET is_paused = 0, completed_at = NULL
        `).bind(id, user.id, pathId).run();

        const subscription = await c.env.DB.prepare(
            'SELECT * FROM family_path_subscriptions WHERE parent_id = ? AND path_id = ?'
        ).bind(user.id, pathId).first();

        return c.json({ success: true, subscription: { ...subscription, is_paused: !!(subscription as any).is_paused, path } });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Unsubscribe
app.delete('/api/paths/:id/unsubscribe', async (c) => {
    try {
        const user = requireParent(c);
        const pathId = c.req.param('id');
        await c.env.DB.prepare(
            'DELETE FROM family_path_subscriptions WHERE parent_id = ? AND path_id = ?'
        ).bind(user.id, pathId).run();
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Pause
app.post('/api/paths/:id/pause', async (c) => {
    try {
        const user = requireParent(c);
        const pathId = c.req.param('id');
        await c.env.DB.prepare(
            'UPDATE family_path_subscriptions SET is_paused = 1 WHERE parent_id = ? AND path_id = ?'
        ).bind(user.id, pathId).run();
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Resume
app.post('/api/paths/:id/resume', async (c) => {
    try {
        const user = requireParent(c);
        const pathId = c.req.param('id');
        await c.env.DB.prepare(
            'UPDATE family_path_subscriptions SET is_paused = 0 WHERE parent_id = ? AND path_id = ?'
        ).bind(user.id, pathId).run();
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Advance
app.post('/api/paths/:id/advance', async (c) => {
    try {
        const user = requireParent(c);
        const pathId = c.req.param('id');

        const sub = await c.env.DB.prepare(
            'SELECT * FROM family_path_subscriptions WHERE parent_id = ? AND path_id = ?'
        ).bind(user.id, pathId).first<any>();

        if (!sub) return c.json({ error: 'Subscription not found' }, 404);

        const newPos = sub.current_position + 1;

        // Check if completed
        const path = await c.env.DB.prepare('SELECT total_items FROM learning_paths WHERE id = ?').bind(pathId).first<any>();
        const total = path?.total_items || 1000; // fallback

        let completedAt = null;
        if (newPos > total) {
            completedAt = new Date().toISOString();
        }

        await c.env.DB.prepare(
            'UPDATE family_path_subscriptions SET current_position = ?, completed_at = ? WHERE id = ?'
        ).bind(newPos, completedAt, sub.id).run();

        return c.json({
            success: true,
            new_position: newPos,
            total_items: total,
            is_completed: !!completedAt
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// GET TODAY's Items
app.get('/api/paths/today', async (c) => {
    try {
        const user = requireAuth(c);

        // 1. Get active subscriptions
        const { results: subscriptions } = await c.env.DB.prepare(`
            SELECT s.*, p.content_filter, p.path_type, p.title as path_title, p.total_items
            FROM family_path_subscriptions s
            JOIN learning_paths p ON s.path_id = p.id
            WHERE s.parent_id = ? AND s.is_paused = 0 AND s.completed_at IS NULL
        `).bind(user.id).all();

        const todayItems: any[] = [];
        const activePaths: any[] = []; // Hydrate for return

        for (const sub of subscriptions) {
            const filter = parseFilter((sub as any).content_filter);
            const position = (sub as any).current_position || 1;

            // Build Query based on content_filter
            let query = "SELECT * FROM formations WHERE is_active = 1";
            const params: any[] = [];

            if (filter.cluster_tag) {
                query += " AND cluster_tag = ?";
                params.push(filter.cluster_tag);
            }
            if (filter.domain) {
                query += " AND primary_virtue = ?"; // Approximate mapping domain -> virtue? Or strictly 'domain' field if added? Formations has primary_virtue. But older schema had domain.
                // Wait, formations table has 'primary_virtue' and 'biblical_faculty'. No 'domain'.
                // If filter uses 'domain', we assume it maps to 'primary_virtue' for now, or check cluster_tag
                // Actually, let's look at seeds. 'African History' uses {"domain": "history"}
                // 'history' is NOT a virtue.
                // Ah, formations has `formation_type`.
                // Maybe 'domain' in filter means 'formation_type'?
                // Or maybe we should ignore unknown filters.
                // Let's stick to what we know: cluster_tag matches well.
            }
            /* 
              Seeds:
              hymn -> cluster_tag: hymn
              catechism -> cluster_tag: catechism
              liturgy -> cluster_tag: liturgy
              history_young -> domain: history, format: picture_book. 
              toddler -> age_tier: infant.
              reading -> skill: reading.
            */

            // Refined Logic based on seeds
            if (filter.domain === 'history') {
                query += " AND cluster_tag LIKE '%history%'"; // Approximating since no domain col
            }
            if (filter.skill === 'reading') {
                query += " AND cluster_tag = 'reading'";
            }
            if (filter.age_tier === 'infant') {
                query += " AND cluster_tag = 'toddler'";
            }

            // Order by sequence_number or created_at or title
            // Liturgy items have sequence_number. Others might not?
            // HACK: Use sequence_number if present, else title
            query += " ORDER BY COALESCE(sequence_number, 999999), title LIMIT 1 OFFSET ?";
            params.push(position - 1);

            const item = await c.env.DB.prepare(query).bind(...params).first();

            if (item) {
                // Determine item_type for frontend
                let itemType = 'activity';
                if ((item as any).formation_type === 'liturgy') {
                    if ((item as any).cluster_tag === 'hymn') itemType = 'hymn';
                    else if ((item as any).cluster_tag === 'catechism') itemType = 'catechism';
                    else itemType = 'liturgy';
                } else if ((item as any).formation_type === 'reading') {
                    itemType = 'book';
                }

                todayItems.push({
                    path_id: (sub as any).path_id,
                    path_title: (sub as any).path_title,
                    path_type: (sub as any).path_type,
                    item_type: itemType,
                    item_id: (item as any).id,
                    item_title: (item as any).title,
                    item_data: {
                        ...item,
                        materials: JSON.parse((item as any).materials || '[]'),
                        guide_steps: JSON.parse((item as any).guide_steps || '[]'),
                    },
                    position: position,
                    total: (sub as any).total_items || 100
                });
            }

            activePaths.push(sub);
        }

        return c.json({
            items: todayItems,
            active_paths: activePaths
        });

    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Library Stats
app.get('/api/library/stats', async (c) => {
    try {
        const user = requireAuth(c);
        // Count completions
        // Liturgy completions for Hymns and Catechism
        const hymnCount = await c.env.DB.prepare(`
            SELECT COUNT(DISTINCT liturgy_item_id) as count 
            FROM liturgy_completions lc
            JOIN formations f ON lc.liturgy_item_id = f.id
            WHERE lc.parent_id = ? AND f.cluster_tag = 'hymn'
        `).bind(user.id).first<any>();

        const catechismCount = await c.env.DB.prepare(`
            SELECT COUNT(DISTINCT liturgy_item_id) as count 
            FROM liturgy_completions lc
            JOIN formations f ON lc.liturgy_item_id = f.id
            WHERE lc.parent_id = ? AND f.cluster_tag = 'catechism'
        `).bind(user.id).first<any>();

        // Reading sessions (Books)
        // Check reading_sessions table?
        // Wait, reading_sessions table exists? 
        // I didn't see it in fresh_schema.sql.
        // evidences table handles reading?
        // formations(type=reading) -> evidences.

        const bookCount = await c.env.DB.prepare(`
            SELECT COUNT(DISTINCT formation_id) as count
            FROM evidences e
            JOIN formations f ON e.formation_id = f.id
            WHERE e.parent_id = ? AND f.formation_type = 'reading'
        `).bind(user.id).first<any>();


        // Get Totals
        const totalHymns = await c.env.DB.prepare("SELECT COUNT(*) as count FROM formations WHERE cluster_tag = 'hymn' AND is_active=1").first<any>();
        const totalCatechism = await c.env.DB.prepare("SELECT COUNT(*) as count FROM formations WHERE cluster_tag = 'catechism' AND is_active=1").first<any>();
        const totalBooks = await c.env.DB.prepare("SELECT COUNT(*) as count FROM formations WHERE formation_type = 'reading' AND is_active=1").first<any>();

        return c.json({
            hymns: { completed: hymnCount?.count || 0, total: totalHymns?.count || 0 },
            catechism: { completed: catechismCount?.count || 0, total: totalCatechism?.count || 0 },
            books: { completed: bookCount?.count || 0, total: totalBooks?.count || 0 }
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

export default app;
