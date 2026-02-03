import { Hono } from 'hono';
import { Env } from '../types';
import { Cortex } from '../ai/cortex';
import { extractUser } from '../middleware/auth';
import { ContextBuilder } from '../ai/context';

const anchor = new Hono<{ Bindings: Env }>();

// GET /api/anchor/today
anchor.get('/today', extractUser, async (c) => {
    const user = c.get('user');
    const cortex = new Cortex(c.env);

    // Build context
    const contextBuilder = new ContextBuilder(c.env);
    const context = await contextBuilder.build(user.id);

    // Generate (or fetch cached)
    const anchor = await cortex.generateFamilyAnchor(context);

    return c.json(anchor);
});

export default anchor;
