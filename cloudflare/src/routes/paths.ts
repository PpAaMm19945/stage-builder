import { Hono } from 'hono';
import { Env, User } from '../types';
import { requireAuth, requireParent } from '../lib/middleware';
import { safeQuery, safeQueryFirst, safeRun } from '../lib/db';

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
        const { results } = await safeQuery(c.env.DB,
            'SELECT * FROM learning_paths WHERE is_active = 1 ORDER BY sort_order'
        );
        return c.json(results);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Get subscriptions
app.get('/api/paths/subscriptions', async (c) => {
    try {
        const user = requireAuth(c);
        const { results } = await safeQuery(c.env.DB, `
            SELECT s.*, p.title as path_title, p.path_type, p.total_items
            FROM family_path_subscriptions s
            JOIN learning_paths p ON s.path_id = p.id
            WHERE s.parent_id = ?
        `, [user.id]);

        // Hydrate with full path object if needed
        const paths = await safeQuery(c.env.DB, 'SELECT * FROM learning_paths');
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
        const path = await safeQueryFirst(c.env.DB, 'SELECT * FROM learning_paths WHERE id = ?', [pathId]);
        if (!path) return c.json({ error: 'Path not found' }, 404);

        const id = crypto.randomUUID();

        await safeRun(c.env.DB, `
            INSERT INTO family_path_subscriptions (id, parent_id, path_id, started_at)
            VALUES (?, ?, ?, datetime('now'))
            ON CONFLICT(parent_id, path_id) DO UPDATE SET is_paused = 0, completed_at = NULL
        `, [id, user.id, pathId]);

        const subscription = await safeQueryFirst(c.env.DB,
            'SELECT * FROM family_path_subscriptions WHERE parent_id = ? AND path_id = ?',
            [user.id, pathId]
        );

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
        await safeRun(c.env.DB,
            'DELETE FROM family_path_subscriptions WHERE parent_id = ? AND path_id = ?',
            [user.id, pathId]
        );
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
        await safeRun(c.env.DB,
            'UPDATE family_path_subscriptions SET is_paused = 1 WHERE parent_id = ? AND path_id = ?',
            [user.id, pathId]
        );
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
        await safeRun(c.env.DB,
            'UPDATE family_path_subscriptions SET is_paused = 0 WHERE parent_id = ? AND path_id = ?',
            [user.id, pathId]
        );
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

        const sub = await safeQueryFirst<any>(c.env.DB,
            'SELECT * FROM family_path_subscriptions WHERE parent_id = ? AND path_id = ?',
            [user.id, pathId]
        );

        if (!sub) return c.json({ error: 'Subscription not found' }, 404);

        const newPos = sub.current_position + 1;

        // Check if completed
        const path = await safeQueryFirst<any>(c.env.DB, 'SELECT total_items FROM learning_paths WHERE id = ?', [pathId]);
        const total = path?.total_items || 1000; // fallback

        let completedAt = null;
        if (newPos > total) {
            completedAt = new Date().toISOString();
        }

        await safeRun(c.env.DB,
            'UPDATE family_path_subscriptions SET current_position = ?, completed_at = ? WHERE id = ?',
            [newPos, completedAt, sub.id]
        );

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
        const { results: subscriptions } = await safeQuery(c.env.DB, `
            SELECT s.*, p.content_filter, p.path_type, p.title as path_title, p.total_items
            FROM family_path_subscriptions s
            JOIN learning_paths p ON s.path_id = p.id
            WHERE s.parent_id = ? AND s.is_paused = 0 AND s.completed_at IS NULL
        `, [user.id]);

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
            query += " ORDER BY COALESCE(sequence_number, 999999), title LIMIT 1 OFFSET ?";
            params.push(position - 1);

            const item = await safeQueryFirst(c.env.DB, query, params);

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
        const hymnCount = await safeQueryFirst<any>(c.env.DB, `
            SELECT COUNT(DISTINCT liturgy_item_id) as count 
            FROM liturgy_completions lc
            JOIN formations f ON lc.liturgy_item_id = f.id
            WHERE lc.parent_id = ? AND f.cluster_tag = 'hymn'
        `, [user.id]);

        const catechismCount = await safeQueryFirst<any>(c.env.DB, `
            SELECT COUNT(DISTINCT liturgy_item_id) as count 
            FROM liturgy_completions lc
            JOIN formations f ON lc.liturgy_item_id = f.id
            WHERE lc.parent_id = ? AND f.cluster_tag = 'catechism'
        `, [user.id]);

        const bookCount = await safeQueryFirst<any>(c.env.DB, `
            SELECT COUNT(DISTINCT formation_id) as count
            FROM evidences e
            JOIN formations f ON e.formation_id = f.id
            WHERE e.parent_id = ? AND f.formation_type = 'reading'
        `, [user.id]);


        // Get Totals
        const totalHymns = await safeQueryFirst<any>(c.env.DB, "SELECT COUNT(*) as count FROM formations WHERE cluster_tag = 'hymn' AND is_active=1");
        const totalCatechism = await safeQueryFirst<any>(c.env.DB, "SELECT COUNT(*) as count FROM formations WHERE cluster_tag = 'catechism' AND is_active=1");
        const totalBooks = await safeQueryFirst<any>(c.env.DB, "SELECT COUNT(*) as count FROM formations WHERE formation_type = 'reading' AND is_active=1");

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
