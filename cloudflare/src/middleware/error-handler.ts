import { Context } from 'hono';
import { Env, User } from '../types';
import { safeError } from '../lib/safe-response';

export const errorHandler = (err: Error, c: Context<{ Bindings: Env; Variables: { user: User | null; nonce: string } }>) => {
    const frontendUrl = c.env.FRONTEND_URL || 'https://stage-builder-9hh.pages.dev';

    const response = safeError(c, err);

    // Force CORS headers on error responses
    response.headers.set('Access-Control-Allow-Origin', frontendUrl);
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    return response;
};
