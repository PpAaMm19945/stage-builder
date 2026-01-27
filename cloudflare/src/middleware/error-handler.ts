import { Context } from 'hono';
import { Env } from '../types';

export const errorHandler = (err: Error, c: Context<{ Bindings: Env }>) => {
    console.error('[Global Error]', err);
    const frontendUrl = c.env.FRONTEND_URL || 'https://stage-builder-9hh.pages.dev';

    // Determine status code
    let status = 500;
    if (err.message === 'Unauthorized') status = 401;
    else if (err.message === 'Not Found') status = 404;
    else if (err.message.includes('Forbidden')) status = 403;

    const response = c.json({ error: err.message || 'Internal Server Error' }, status as any);

    // Force CORS headers on error responses
    response.headers.set('Access-Control-Allow-Origin', frontendUrl);
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    return response;
};
