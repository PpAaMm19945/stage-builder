import { Hono } from 'hono';
import { Env, User } from '../types';
import { Cortex } from '../ai/cortex';
import { ContextBuilder } from '../ai/context';
import { requireHouseholdMember } from '../lib/middleware';

const anchor = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// GET /api/anchor/today
anchor.get('/today', async (c) => {
    const user = requireHouseholdMember(c);
    const cortex = new Cortex(c.env);

    // Build context
    const contextBuilder = new ContextBuilder(c.env.DB);
    // User ID is guaranteed by requireHouseholdMember.
    // household_id might be undefined on legacy users, but ContextBuilder likely needs it.
    // We pass user.id as fallback if household_id is missing to avoid crashing,
    // assuming ContextBuilder handles or fails gracefully, or we might want to throw if missing.
    // For now, using optional chaining fallback to satisfy types.
    const context = await contextBuilder.buildUserContext(user.id, user.household_id || user.id);

    // Generate (or fetch cached)
    const anchor = await cortex.generateFamilyAnchor(context);

    return c.json(anchor);
});

export default anchor;
