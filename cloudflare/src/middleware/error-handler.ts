import { Context } from 'hono';
import { Env, User } from '../types';

export const errorHandler = (err: Error, c: Context<{ Bindings: Env; Variables: { user: User | null; nonce: string } }>) => {
    console.error('[Global Error]', err);
    const frontendUrl = c.env.FRONTEND_URL || 'https://stage-builder-9hh.pages.dev';

    // Determine status code
    let status = 500;
    if (err.message === 'Unauthorized') status = 401;
    else if (err.message === 'Not Found') status = 404;
    else if (err.message.includes('Forbidden')) status = 403;

    // Security: Prevent information leakage in production for 500 errors
    const isProduction = c.env.ENVIRONMENT === 'production';
    const message = (status === 500 && isProduction)
        ? 'Internal Server Error'
        : (err.message || 'Internal Server Error');

    const response = c.json({ error: message }, status as any);

    // Force CORS headers on error responses
    response.headers.set('Access-Control-Allow-Origin', frontendUrl);
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    return response;
};
