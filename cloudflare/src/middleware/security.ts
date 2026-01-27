import { Context, Next } from 'hono';

export const securityHeaders = async (c: Context, next: Next) => {
    // Generate a random nonce for CSP to prevent XSS
    const nonce = crypto.randomUUID();
    c.set('nonce', nonce);

    await next();
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Security: Use nonce for scripts, disallow unsafe-inline
    c.header('Content-Security-Policy', `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';`);
    c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    // Security: Force HTTPS
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
};
