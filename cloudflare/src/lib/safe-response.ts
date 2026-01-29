import { Context } from 'hono';
import { Env } from '../types';

/**
 * Returns a JSON error response that masks internal errors in production.
 * @param c The Hono context
 * @param error The error object (any)
 * @param status Optional status code (default 500)
 */
export const safeError = (c: Context, error: any, status: number = 500) => {
    // Log the full error internally
    console.error('[API Error]', error);

    // Cast environment to expected type
    const env = c.env as Env;
    const isProduction = env.ENVIRONMENT === 'production';

    const message = error?.message || 'Unknown Error';

    // Determine effective status
    let effectiveStatus = status;
    if (effectiveStatus === 500) {
         if (message === 'Unauthorized') effectiveStatus = 401;
         else if (message === 'Not Found') effectiveStatus = 404;
         else if (message.includes('Forbidden')) effectiveStatus = 403;
    }

    // Security: Mask 500 errors in production
    const safeMessage = (effectiveStatus === 500 && isProduction)
        ? 'Internal Server Error'
        : message;

    return c.json({ error: safeMessage }, effectiveStatus as any);
};
