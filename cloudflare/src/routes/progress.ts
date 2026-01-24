import { Hono } from 'hono';
import { Env, User } from '../types';
import { requireHouseholdMember } from '../lib/middleware';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

app.post('/api/progress/start', async (c) => {
    try {
        const user = requireHouseholdMember(c);
        const { activityId, type, date } = await c.req.json();

        await c.env.DB.prepare(`
            INSERT INTO activity_progress (id, family_id, activity_type, content_id, scheduled_date, status, started_at)
            VALUES (?, ?, ?, ?, ?, 'in_progress', datetime('now'))
        `).bind(
            crypto.randomUUID(), user.household_id, type || 'unknown', activityId, date || new Date().toISOString().split('T')[0]
        ).run();
        return c.json({ success: true });
    } catch (e: any) { return c.json({ error: e.message }, 500); }
});

app.post('/api/progress/complete', async (c) => {
    try {
        const user = requireHouseholdMember(c);
        const { activityId, type, date, source } = await c.req.json();

        await c.env.DB.prepare(`
            INSERT INTO activity_progress (id, family_id, activity_type, content_id, scheduled_date, status, completed_at, completion_source)
            VALUES (?, ?, ?, ?, ?, 'completed', datetime('now'), ?)
        `).bind(
            crypto.randomUUID(), user.household_id, type || 'unknown', activityId, date || new Date().toISOString().split('T')[0], source || 'manual'
        ).run();

        // Sync to legacy evidences for dashboard compatibility
        const students = await c.env.DB.prepare('SELECT id FROM students WHERE household_id = ?').bind(user.household_id).all<any>();
        if (students.results && students.results.length > 0) {
            const stmt = c.env.DB.prepare(`INSERT INTO evidences (id, student_id, formation_id, captured_at, habit_stage) VALUES (?, ?, ?, datetime('now'), 'rooting')`);
            const batch = students.results.map((s: any) => stmt.bind(crypto.randomUUID(), s.id, activityId));
            await c.env.DB.batch(batch);
        }

        return c.json({ success: true });
    } catch (e: any) { return c.json({ error: e.message }, 500); }
});

app.post('/api/progress/skip', async (c) => {
    try {
        const user = requireHouseholdMember(c);
        const { activityId, type, date } = await c.req.json();
        await c.env.DB.prepare(`
            INSERT INTO activity_progress (id, family_id, activity_type, content_id, scheduled_date, status)
            VALUES (?, ?, ?, ?, ?, 'skipped')
        `).bind(
            crypto.randomUUID(), user.household_id, type || 'unknown', activityId, date || new Date().toISOString().split('T')[0]
        ).run();
        return c.json({ success: true });
    } catch (e: any) { return c.json({ error: e.message }, 500); }
});

app.post('/api/progress/transfer', async (c) => {
    try {
        const user = requireHouseholdMember(c);
        const { activityId, type, fromDate, toDate } = await c.req.json();
        await c.env.DB.prepare(`
            INSERT INTO activity_progress (id, family_id, activity_type, content_id, scheduled_date, status, transferred_to)
            VALUES (?, ?, ?, ?, ?, 'transferred', ?)
        `).bind(
            crypto.randomUUID(), user.household_id, type || 'unknown', activityId, fromDate, toDate
        ).run();
        return c.json({ success: true });
    } catch (e: any) { return c.json({ error: e.message }, 500); }
});

app.post('/api/progress/save', async (c) => {
    try {
        const user = requireHouseholdMember(c);
        const { activityId, type, date, progressData } = await c.req.json();

        // Check if there's an existing in_progress record for today to update, or just insert new log?
        // Log approach: Insert new state.
        await c.env.DB.prepare(`
            INSERT INTO activity_progress (id, family_id, activity_type, content_id, scheduled_date, status, updated_at, progress_data)
            VALUES (?, ?, ?, ?, ?, 'in_progress', datetime('now'), ?)
        `).bind(
            crypto.randomUUID(), user.household_id, type || 'unknown', activityId, date || new Date().toISOString().split('T')[0], JSON.stringify(progressData)
        ).run();
        return c.json({ success: true });
    } catch (e: any) { return c.json({ error: e.message }, 500); }
});

app.get('/api/progress/:contentId', async (c) => {
    try {
        const user = requireHouseholdMember(c);
        const contentId = c.req.param('contentId');
        // Get latest progress
        const result = await c.env.DB.prepare(`
       SELECT * FROM activity_progress 
       WHERE family_id = ? AND content_id = ? 
       ORDER BY updated_at DESC, created_at DESC LIMIT 1
    `).bind(user.household_id, contentId).first<any>();

        if (!result) return c.json({ progress: null });

        return c.json({
            progress: {
                status: result.status,
                data: result.progress_data ? JSON.parse(result.progress_data) : null,
                updatedAt: result.updated_at || result.created_at
            }
        });
    } catch (e: any) { return c.json({ error: e.message }, 500); }
});

export default app;
