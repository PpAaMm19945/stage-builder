import { Hono } from 'hono';
import { Env, User } from '../types';
import { requireHouseholdMember } from '../lib/middleware';
import { Cortex } from '../ai/cortex';
import { ContextBuilder } from '../ai/context';
import { checkRateLimit } from '../middleware/rate-limit';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

app.post('/api/chat', async (c) => {
    try {
        const user = requireHouseholdMember(c);
        const today = new Date().toISOString().split('T')[0];
        const dailyLimit = parseInt(c.env.DAILY_CHAT_LIMIT || '30', 10);

        // 1. Check Daily Usage from D1
        const usage = await c.env.DB.prepare(
            'SELECT * FROM user_daily_chat_usage WHERE user_id = ? AND usage_date = ?'
        ).bind(user.id, today).first();

        const currentUsage = (usage?.message_count as number) || 0;
        const remaining = dailyLimit - currentUsage;

        if (currentUsage >= dailyLimit) {
            const resetsAt = new Date();
            resetsAt.setUTCHours(24, 0, 0, 0); // Midnight UTC next day

            return c.json({
                error: 'Daily chat limit reached. Please try again tomorrow.',
                limit: dailyLimit,
                remaining: 0,
                resetsAt: resetsAt.toISOString()
            }, 429);
        }

        // 2. Rate limiting (Speed): 20 messages per minute per user
        const rateCheck = checkRateLimit(user.id, 20, 60000);
        if (!rateCheck.allowed) {
            return c.json({
                error: 'You are sending messages too fast. Please wait a moment.',
                retryAfter: Math.ceil((rateCheck.resetAt - Date.now()) / 1000)
            }, 429);
        }

        const { messages, context: clientContext } = await c.req.json();

        // Build Rich Server Context
        const contextBuilder = new ContextBuilder(c.env.DB);
        const serverContext = await contextBuilder.buildUserContext(user.id, user.household_id || 'unknown');

        // Merge client context (e.g. current page) with server context
        const fullContext = {
            ...clientContext,
            ...serverContext,
            userState: user
        };

        // Use Cortex Orchestrator
        const cortex = new Cortex(c.env);
        const lastMessage = messages[messages.length - 1].content;

        // 3. Increment usage count (Optimistic or before stream)
        // We do this before streaming to ensure we count it. 
        // In a perfect world we'd do it after success, but with streaming it's complex.
        await c.env.DB.prepare(`
            INSERT INTO user_daily_chat_usage (user_id, usage_date, message_count, token_count)
            VALUES (?, ?, 1, 0)
            ON CONFLICT(user_id, usage_date) DO UPDATE SET
            message_count = message_count + 1,
            updated_at = unixepoch()
        `).bind(user.id, today).run();

        const stream = await cortex.chat(lastMessage, messages, fullContext);

        // Calculate Reset Time (Midnight UTC)
        const resetsAt = new Date();
        resetsAt.setUTCHours(24, 0, 0, 0);

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-RateLimit-Remaining': String(rateCheck.remaining),
                'X-RateLimit-Reset': String(Math.ceil(rateCheck.resetAt / 1000)),
                // Custom headers for daily quota
                'X-Chat-Limit': String(dailyLimit),
                'X-Chat-Remaining': String(Math.max(0, remaining - 1)), // Subtract 1 for current message
                'X-Chat-Resets-At': resetsAt.toISOString()
            }
        });
    } catch (e: any) {
        console.error("Chat error", e);
        return c.json({ error: e.message }, 500);
    }
});

app.post('/api/chat/execute', async (c) => {
    try {
        const user = requireHouseholdMember(c);

        // Rate limiting: 20 actions per minute per user
        const rateCheck = checkRateLimit(user.id, 20, 60000);
        if (!rateCheck.allowed) {
            return c.json({
                error: 'Rate limit exceeded. Please wait a moment before executing more actions.',
                retryAfter: Math.ceil((rateCheck.resetAt - Date.now()) / 1000)
            }, 429);
        }

        const { actionPayload, context: clientContext } = await c.req.json();

        if (!actionPayload) {
            return c.json({ error: 'Missing actionPayload' }, 400);
        }

        // Build Rich Server Context
        const contextBuilder = new ContextBuilder(c.env.DB);
        const serverContext = await contextBuilder.buildUserContext(user.id, user.household_id || 'unknown');

        // Merge client context
        const fullContext = {
            ...clientContext,
            ...serverContext,
            userState: user
        };

        // Use Cortex for action execution
        const cortex = new Cortex(c.env);
        // Pass action type as message for Cortex to handle
        const stream = await cortex.chat(`[ACTION:${actionPayload.type}] ${JSON.stringify(actionPayload)}`, [], fullContext);

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            }
        });
    } catch (e: any) {
        console.error("Execute action error", e);
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
    return c.json({ error: 'Endpoint deprecated. Use Cortex chat instead.' }, 410);
});

app.post('/api/chat/reject', async (c) => {
    return c.json({ error: 'Endpoint deprecated. Use Cortex chat instead.' }, 410);
});



app.get('/api/ai/interactions', async (c) => {
    try {
        const user = requireHouseholdMember(c);
        const { results } = await c.env.DB.prepare(
            "SELECT * FROM ai_logs WHERE parent_id = ? AND created_at >= date('now', '-1 day') ORDER BY created_at DESC LIMIT 20"
        ).bind(user.id).all();

        // Map to camelCase
        const logs = results.map((log: any) => ({
            id: log.id,
            parentId: log.parent_id,
            studentId: log.student_id,
            interactionType: log.interaction_type,
            question: log.question,
            answer: log.answer,
            context: log.context_json ? JSON.parse(log.context_json) : undefined,
            createdAt: log.created_at
        }));

        return c.json(logs);
    } catch (e: any) {
        console.error("Error fetching AI logs", e);
        return c.json({ error: e.message }, 500);
    }
});

export default app;
