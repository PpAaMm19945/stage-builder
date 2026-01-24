import { Hono } from 'hono';
import { Env, User } from '../types';
import { requireHouseholdMember } from '../lib/middleware';
import { FrontdeskOfficer } from '../ai/frontdesk';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

app.post('/api/chat', async (c) => {
    try {
        const user = requireHouseholdMember(c);
        const { messages, context } = await c.req.json();

        const officer = new FrontdeskOfficer(c.env);
        const stream = await officer.chat(messages, { ...context, userId: user.id });

        return new Response(stream, {
            headers: { 'Content-Type': 'text/event-stream' }
        });
    } catch (e: any) {
        console.error("Chat error", e);
        return c.json({ error: e.message }, 500);
    }
});

app.get('/api/chat/actions', async (c) => {
    try {
        const user = requireHouseholdMember(c);
        const { results } = await c.env.DB.prepare(
            'SELECT * FROM ai_action_log WHERE family_id = ? ORDER BY created_at DESC LIMIT 50'
        ).bind(user.household_id).all();
        return c.json(results);
    } catch (e: any) { return c.json({ error: e.message }, 500); }
});

app.post('/api/chat/confirm', async (c) => {
    try {
        const user = requireHouseholdMember(c);
        const { actionId } = await c.req.json();

        // Retrieve action
        const action = await c.env.DB.prepare('SELECT * FROM ai_action_log WHERE id = ?').bind(actionId).first<any>();
        if (!action) return c.json({ error: 'Action not found' }, 404);

        // Execute action logic (simplified switching)
        const data = JSON.parse(action.action_data);

        if (action.action_type === 'schedule_change') {
            // Apply changes to weekly plan
            // TODO: Load plan, modify, save
        } else if (action.action_type === 'skip_activity') {
            await c.env.DB.prepare(`
                INSERT INTO activity_progress (id, family_id, activity_type, content_id, scheduled_date, status)
                VALUES (?, ?, 'unknown', ?, ?, 'skipped')
            `).bind(crypto.randomUUID(), user.household_id, data.activity_id, new Date().toISOString().split('T')[0]).run();
        }

        // Update log status
        await c.env.DB.prepare(
            'UPDATE ai_action_log SET status = "confirmed", confirmed_at = datetime("now"), confirmed_by = ? WHERE id = ?'
        ).bind(user.id, actionId).run();

        return c.json({ success: true });
    } catch (e: any) { return c.json({ error: e.message }, 500); }
});

app.post('/api/chat/reject', async (c) => {
    try {
        const user = requireHouseholdMember(c);
        const { actionId } = await c.req.json();
        await c.env.DB.prepare(
            'UPDATE ai_action_log SET status = "rejected", confirmed_at = datetime("now") WHERE id = ?'
        ).bind(actionId).run();
        return c.json({ success: true });
    } catch (e: any) { return c.json({ error: e.message }, 500); }
});

export default app;
