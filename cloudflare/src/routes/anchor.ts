import { Hono } from 'hono';
import { Env, User } from '../types';
import { requireHouseholdMember, requireParent } from '../lib/middleware';
import { AnchorGenerator } from '../ai/anchor-generator';

const anchor = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// GET /api/anchor/today
anchor.get('/today', async (c) => {
    console.log('[API] GET /api/anchor/today called');
    const user = requireHouseholdMember(c);
    console.log('[API] User authenticated:', user.id, 'Household:', user.household_id);
    const householdId = user.household_id || user.id; // Fallback for legacy
    if (!householdId) {
        return c.json({ error: 'Missing household id' }, 400);
    }

    const generator = new AnchorGenerator(c.env);

    try {
        const anchor = await generator.getTodayAnchor(householdId, undefined, c.executionCtx.waitUntil.bind(c.executionCtx));
        console.log('[API] Anchor retrieved:', anchor ? anchor.id : 'null');
        return c.json(anchor);
    } catch (e: any) {
        console.error("[API] Anchor Generation Error:", e);
        return c.json({ error: e.message || "Failed to generate anchor" }, 500);
    }
});

// POST /api/anchor/regenerate
anchor.post('/regenerate', async (c) => {
    console.log('[API] POST /api/anchor/regenerate called');
    const user = requireParent(c); // Only parents can regenerate
    const householdId = user.household_id || user.id;
    if (!householdId) {
        return c.json({ error: 'Missing household id' }, 400);
    }

    const body = await c.req.json().catch(() => ({}));
    const adjustments = body.adjustments || undefined;
    const context = adjustments ? { adjustments } : undefined;

    const generator = new AnchorGenerator(c.env);
    const date = new Date().toISOString().split('T')[0];

    try {
        // Force regeneration for today
        const anchor = await generator.generateAnchor(householdId, date, context, c.executionCtx.waitUntil.bind(c.executionCtx));
        return c.json(anchor);
    } catch (e: any) {
        console.error("Anchor Regeneration Error:", e);
        return c.json({ error: e.message || "Failed to regenerate anchor" }, 500);
    }
});

// POST /api/anchor/complete
anchor.post('/complete', async (c) => {
    console.log('[API] POST /api/anchor/complete called');
    try {
        const user = requireParent(c);
        const householdId = user.household_id || user.id;
        console.log('[API] Completing anchor for user:', user.id);
        if (!householdId) {
            return c.json({ error: 'Missing household id' }, 400);
        }

        const body = await c.req.json().catch(() => ({}));
        const { anchorId, rating, notes, lovedIt } = body;

        if (!anchorId) {
            return c.json({ error: 'anchorId required' }, 400);
        }

        const generator = new AnchorGenerator(c.env);
        await generator.completeAnchor(householdId, anchorId, {
            rating,
            notes,
            lovedIt
        });

        console.log('[API] Anchor completed with feedback:', anchorId);
        return c.json({ success: true, anchorId });
    } catch (e: any) {
        console.error("[API] Anchor Completion Error:", e);
        return c.json({ error: e.message || "Failed to complete anchor" }, 500);
    }
});

// POST /api/anchor/skip
anchor.post('/skip', async (c) => {
    console.log('[API] POST /api/anchor/skip called');
    try {
        const user = requireParent(c);
        const householdId = user.household_id || user.id;
        if (!householdId) {
            return c.json({ error: 'Missing household id' }, 400);
        }

        const body = await c.req.json().catch(() => ({}));
        const { anchorId, reason } = body;

        if (!anchorId) {
            return c.json({ error: 'anchorId required' }, 400);
        }

        // Use the generator method instead of inline SQL for consistency
        const generator = new AnchorGenerator(c.env);
        await generator.skipAnchor(householdId, anchorId, reason);

        console.log('[API] Anchor skipped:', anchorId);
        return c.json({ success: true, anchorId });
    } catch (e: any) {
        console.error("[API] Anchor Skip Error:", e);
        return c.json({ error: e.message || "Failed to skip anchor" }, 500);
    }
});

// GET /api/anchor/history - Get completed/skipped anchors for feedback analysis
anchor.get('/history', async (c) => {
    try {
        const user = requireHouseholdMember(c);
        const householdId = user.household_id || user.id;
        if (!householdId) {
            return c.json({ error: 'Missing household id' }, 400);
        }

        const { results } = await c.env.DB.prepare(`
            SELECT id, anchor_date, anchor_data, status, completion_feedback, 
                   completed_at, skipped_at, skip_reason
            FROM daily_anchors 
            WHERE household_id = ? AND status IN ('completed', 'skipped')
            ORDER BY anchor_date DESC LIMIT 14
        `).bind(householdId).all();

        const history = results.map((r: any) => ({
            id: r.id,
            date: r.anchor_date,
            theme: JSON.parse(r.anchor_data)?.theme,
            status: r.status,
            feedback: r.completion_feedback ? JSON.parse(r.completion_feedback) : null,
            completedAt: r.completed_at,
            skippedAt: r.skipped_at,
            skipReason: r.skip_reason
        }));

        return c.json(history);
    } catch (e: any) {
        console.error("[API] Anchor History Error:", e);
        return c.json({ error: e.message }, 500);
    }
});

export default anchor;
