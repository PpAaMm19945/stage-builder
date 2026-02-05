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
    userId: string,
    maxRequests: number = 20,
    windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
    cleanupOldEntries();

    const now = Date.now();
    const limit = rateLimits.get(userId);

    if (!limit || now > limit.resetAt) {
        const resetAt = now + windowMs;
        rateLimits.set(userId, { count: 1, resetAt });
        return { allowed: true, remaining: maxRequests - 1, resetAt };
    }

    if (limit.count >= maxRequests) {
        return { allowed: false, remaining: 0, resetAt: limit.resetAt };
    }

    limit.count++;
    return { allowed: true, remaining: maxRequests - limit.count, resetAt: limit.resetAt };
}

export function createRateLimiter(maxRequests: number, windowMs: number) {
    return async (c: Context, next: Next) => {
        const ip = c.req.header('CF-Connecting-IP') || 'unknown';
        const rateLimit = checkRateLimit(ip, maxRequests, windowMs);

        if (!rateLimit.allowed) {
            c.header('Retry-After', Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString());
            return c.json({ error: 'Too many requests' }, 429);
        }

        await next();
    };
}
