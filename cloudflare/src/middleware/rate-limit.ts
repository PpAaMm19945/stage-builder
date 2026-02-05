import { Context, Next } from 'hono';

// Simple in-memory rate limiting middleware
// Note: In a multi-worker environment, consider using Durable Objects for accurate limits

const rateLimits = new Map<string, { count: number; resetAt: number }>();

// Clean up old entries periodically to prevent memory leaks
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

function cleanupOldEntries() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;

    lastCleanup = now;
    for (const [key, limit] of rateLimits.entries()) {
        if (now > limit.resetAt) {
            rateLimits.delete(key);
        }
    }
}

export function checkRateLimit(
    key: string,
    maxRequests: number = 20,
    windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
    cleanupOldEntries();

    const now = Date.now();
    const limit = rateLimits.get(key);

    if (!limit || now > limit.resetAt) {
        const resetAt = now + windowMs;
        rateLimits.set(key, { count: 1, resetAt });
        return { allowed: true, remaining: maxRequests - 1, resetAt };
    }

    if (limit.count >= maxRequests) {
        return { allowed: false, remaining: 0, resetAt: limit.resetAt };
    }

    limit.count++;
    return { allowed: true, remaining: maxRequests - limit.count, resetAt: limit.resetAt };
}

export function createRateLimiter(maxRequests: number, windowMs: number, namespace: string) {
    return async (c: Context, next: Next) => {
        const ip = c.req.header('CF-Connecting-IP') || 'unknown';
        const key = `${namespace}:${ip}`;

        const result = checkRateLimit(key, maxRequests, windowMs);

        c.header('X-RateLimit-Limit', maxRequests.toString());
        c.header('X-RateLimit-Remaining', result.remaining.toString());
        c.header('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000).toString());

        if (!result.allowed) {
            return c.json({
                error: 'Too many requests',
                retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000)
            }, 429);
        }

        await next();
    };
}
