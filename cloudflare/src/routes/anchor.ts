import { Hono } from 'hono';
import { Env, User } from '../types';
import { requireHouseholdMember, requireParent } from '../lib/middleware';
import { AnchorGenerator } from '../ai/anchor-generator';

const anchor = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// GET /api/anchor/today
anchor.get('/today', async (c) => {
    const user = requireHouseholdMember(c);
    const householdId = user.household_id || user.id; // Fallback for legacy

    const generator = new AnchorGenerator(c.env);

    try {
        const anchor = await generator.getTodayAnchor(householdId);
        return c.json(anchor);
    } catch (e: any) {
        console.error("Anchor Generation Error:", e);
        return c.json({ error: e.message || "Failed to generate anchor" }, 500);
    }
});

// POST /api/anchor/regenerate
anchor.post('/regenerate', async (c) => {
    const user = requireParent(c); // Only parents can regenerate
    const householdId = user.household_id || user.id;

    const body = await c.req.json().catch(() => ({}));
    const adjustments = body.adjustments || undefined;

    const generator = new AnchorGenerator(c.env);
    const date = new Date().toISOString().split('T')[0];

    try {
        // Force regeneration for today
        const anchor = await generator.generateAnchor(householdId, date, adjustments);
        return c.json(anchor);
    } catch (e: any) {
        console.error("Anchor Regeneration Error:", e);
        return c.json({ error: e.message || "Failed to regenerate anchor" }, 500);
    }
});

// POST /api/anchor/complete
anchor.post('/complete', async (c) => {
    const user = requireParent(c);
    const householdId = user.household_id || user.id;
    const body = await c.req.json().catch(() => ({}));
    const date = body.date || new Date().toISOString().split('T')[0];

    try {
        const { success } = await c.env.DB.prepare(
            `UPDATE daily_anchors 
             SET status = 'completed'
             WHERE household_id = ? AND anchor_date = ?`
        )
            .bind(householdId, date)
            .run();

        if (!success) {
            throw new Error("Failed to update anchor status");
        }

        return c.json({ success: true, date });
    } catch (e: any) {
        console.error("Anchor Completion Error:", e);
        return c.json({ error: e.message || "Failed to complete anchor" }, 500);
    }
});

export default anchor;
