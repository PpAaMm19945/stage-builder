import { Context, Next } from 'hono';
import { Env, User } from '../types';
import { verifyJWT } from '../lib/auth';

export const authMiddleware = async (c: Context<{ Bindings: Env, Variables: { user: User | null } }>, next: Next) => {
    // Prevent caching of sensitive API responses
    c.header('Cache-Control', 'no-store, max-age=0');

    const authHeader = c.req.header('Authorization');
    // Security: Only accept tokens via Authorization header to prevent leakage in logs/history
    const token = authHeader?.replace('Bearer ', '');

    if (!c.env.JWT_SECRET) {
        console.error('[CRITICAL] JWT_SECRET is not set!');
    }

    if (token) {
        const payload = await verifyJWT(token, c.env.JWT_SECRET);

        if (payload) {
            const user = await c.env.DB.prepare(
                'SELECT * FROM users WHERE id = ?'
            ).bind(payload.sub).first<User>();

            c.set('user', user);
        }
    }

    await next();
};
