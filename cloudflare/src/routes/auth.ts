import { Hono } from 'hono';
import { Env, User, JWTPayload } from '../types';
import { signJWT, verifyJWT } from '../lib/auth';
import { generateId, generateInviteCode } from '../lib/utils';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { safeQuery, safeQueryFirst, safeRun } from '../lib/db';
import { checkRateLimit } from '../middleware/rate-limit';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// Redirect to Google OAuth
// Redirect to Google OAuth
app.get('/auth/google', (c) => {
    // 1. Capture return capability (optional, defaults to env FRONTEND_URL)
    const returnTo = c.req.query('return_to');

    // Security: Rate limit login attempts to prevent abuse
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    const rateLimit = checkRateLimit(ip, 5, 60000); // 5 attempts per minute

    if (!rateLimit.allowed) {
        // Even for rate limits, try to redirect back if possible, or show simple HTML
        const frontendUrl = c.env.FRONTEND_URL || 'https://stage-builder-9hh.pages.dev';
        return c.redirect(`${frontendUrl}/login?error=too_many_attempts`);
    }

    const clientId = c.env.GOOGLE_CLIENT_ID;
    const redirectUri = c.env.GOOGLE_REDIRECT_URI;

    // Scopes: email, profile
    const scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
    const state = crypto.randomUUID(); // Recommended for security

    // Debug logging
    console.log(`[Auth] Starting OAuth flow. IP: ${ip}, State generated: ${state}`);

    // Security: Store state in HttpOnly cookie to prevent CSRF
    // IMPORTANT: SameSite=Lax is crucial for the callback to read the cookie after redirect
    setCookie(c, 'oauth_state', state, {
        httpOnly: true,
        path: '/',
        maxAge: 600, // 10 minutes
        sameSite: 'Lax',
        secure: c.env.ENVIRONMENT === 'production',
    });

    // Also store return_to if present
    if (returnTo) {
        setCookie(c, 'return_to', returnTo, {
            httpOnly: true,
            path: '/',
            maxAge: 600,
            sameSite: 'Lax',
            secure: c.env.ENVIRONMENT === 'production',
        });
    }

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}&access_type=offline&prompt=consent`;

    return c.redirect(url);
});

// Google Callback
app.get('/auth/google/callback', async (c) => {
    const code = c.req.query('code');
    const state = c.req.query('state');
    const storedState = getCookie(c, 'oauth_state');
    const returnTo = getCookie(c, 'return_to');

    // Ensure we always have a place to send the user back to
    const frontendUrl = returnTo || c.env.FRONTEND_URL || 'https://stage-builder-9hh.pages.dev';

    console.log(`[Auth] Callback received. Code: ${!!code}, State: ${state}, StoredState: ${storedState}`);

    // Security: Verify state parameter to prevent CSRF
    if (!state || !storedState || state !== storedState) {
        console.error(`[Auth] CSRF Mismatch! Received: ${state}, Stored: ${storedState}`);
        // Redirect with error instead of blocking user on backend
        return c.redirect(`${frontendUrl}/login?error=csrf_mismatch&message=Security check failed. Please try again.`);
    }

    // Clean up cookies
    deleteCookie(c, 'oauth_state', { path: '/', secure: c.env.ENVIRONMENT === 'production' });
    deleteCookie(c, 'return_to', { path: '/', secure: c.env.ENVIRONMENT === 'production' });

    if (!code) {
        return c.redirect(`${frontendUrl}/login?error=missing_code`);
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: c.env.GOOGLE_CLIENT_ID,
                client_secret: c.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: c.env.GOOGLE_REDIRECT_URI,
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenResponse.json() as any;
        if (tokenData.error) throw new Error(tokenData.error);

        const accessToken = tokenData.access_token;

        // Get User Info
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userData = await userResponse.json() as any;

        const email = userData.email;
        const name = userData.name;
        const avatarUrl = userData.picture;

        if (!email) throw new Error('No email provided by Google');

        console.log(`[Auth] Authenticated email: ${email}`);

        // All authenticated Google users can sign in
        console.log(`[Auth] User authenticated: ${email}`);

        // Find or Create User
        let user = await safeQueryFirst<User>(c.env.DB, 'SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
            console.log(`[Auth] Creating new user for: ${email}`);
            // New user - Create User & Household
            const userId = generateId('user');
            const householdId = generateId('house');
            const inviteCode = generateInviteCode();

            await safeRun(c.env.DB,
                'INSERT INTO households (id, name, invite_code) VALUES (?, ?, ?)',
                [householdId, `${name}'s Family`, inviteCode]
            );

            await safeRun(c.env.DB,
                'INSERT INTO users (id, email, name, role, household_id, provider, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userId, email, name, 'parent', householdId, 'google', avatarUrl]
            );

            user = await safeQueryFirst<User>(c.env.DB, 'SELECT * FROM users WHERE id = ?', [userId]);
        } else {
            // Update avatar/name logic if needed
            await safeRun(c.env.DB,
                'UPDATE users SET avatar_url = ?, name = ?, updated_at = datetime("now") WHERE id = ?',
                [avatarUrl, name, user.id]
            );
        }

        if (!user) throw new Error('User creation failed');

        // Create JWT
        const payload: Omit<JWTPayload, 'iat'> = {
            sub: user.id,
            email: user.email,
            name: user.name,
            household_id: user.household_id,
            role: user.role,
            student_id: user.student_id,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), // 30 days
        };

        const token = await signJWT(payload, c.env.JWT_SECRET);

        // Security: Pass token in hash fragment to prevent leakage in server logs
        return c.redirect(`${frontendUrl}/auth/callback#token=${token}`);

    } catch (error: any) {
        console.error('Auth Error:', error);

        // Check for D1-specific errors and provide retry guidance
        if (error.message?.includes('D1_ERROR') || error.message?.includes('Network')) {
            return c.redirect(`${frontendUrl}/login?error=temporary&message=Database temporarily unavailable. Please try again.`);
        }

        const errorMessage = c.env.ENVIRONMENT === 'production'
            ? 'Authentication failed. Please try again.'
            : error.message;

        return c.redirect(`${frontendUrl}/login?error=server_error&message=${encodeURIComponent(errorMessage)}`);
    }
});

// Get Current User
app.get('/api/auth/me', async (c) => {
    // Middleware in index.ts populates c.get('user')
    const user = c.get('user');

    if (!user) {
        return c.json({ user: null }, 401);
    }

    // Fetch children for the household
    let children: any[] = [];
    if (user.household_id) {
        const query = await safeQuery(c.env.DB,
            'SELECT * FROM students WHERE household_id = ? ORDER BY created_at',
            [user.household_id]
        );
        children = query.results || [];
    }

    return c.json({ user, children });
});

// DEBUG ENDPOINT
app.get('/api/debug/auth', async (c) => {
    // Security: Disable debug endpoint in production
    if (c.env.ENVIRONMENT === 'production') {
        return c.json({ error: 'Endpoint disabled in production' }, 404);
    }

    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '') || c.req.query('token') as string;

    const secret = c.env.JWT_SECRET;
    const secretStatus = {
        exists: !!secret,
        // Security: Do not expose length or preview in production
    };

    let verificationLibResult = null;
    let userLookup = null;
    let manualVerify = 'Not attempted';

    if (token) {
        try {
            // 1. Try library verification
            verificationLibResult = await verifyJWT(token, secret);

            if (verificationLibResult) {
                // 2. Try DB lookup
                try {
                    userLookup = await safeQueryFirst(c.env.DB, 'SELECT * FROM users WHERE id = ?', [verificationLibResult.sub]);
                } catch (e: any) { userLookup = { error: e.message } }
            } else {
                manualVerify = 'Library returned null';
            }

        } catch (e: any) {
            manualVerify = `Error: ${e.message}`;
        }
    }

    return c.json({
        secretStatus,
        tokenReceived: !!token,
        tokenPreview: token ? token.substring(0, 10) + '...' : null,
        verificationLibResult,
        userLookup,
        manualVerify
    });
});

// MOCK LOGIN FOR TESTING
app.get('/auth/mock-login', async (c) => {
    try {
        // 1. Create/Get Test User
        const email = 'test_parent@example.com';
        const name = 'Test Parent';

        // Check if user exists
        let user = await safeQueryFirst<User>(c.env.DB, 'SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
            const userId = 'user_test_mock';
            const householdId = 'house_test_mock';

            // Create household
            await safeRun(c.env.DB,
                'INSERT OR IGNORE INTO households (id, name, invite_code) VALUES (?, ?, ?)',
                [householdId, 'Test Family', 'TEST-CODE']
            );

            // Create user
            await safeRun(c.env.DB,
                'INSERT INTO users (id, email, name, role, household_id, provider, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userId, email, name, 'parent', householdId, 'mock', 'https://ui-avatars.com/api/?name=Test+Parent']
            );

            user = await safeQueryFirst<User>(c.env.DB, 'SELECT * FROM users WHERE id = ?', [userId]);
        }

        if (!user) throw new Error('Failed to create mock user');

        // 2. Generate Token
        const payload: Omit<JWTPayload, 'iat'> = {
            sub: user.id,
            email: user.email,
            name: user.name,
            household_id: user.household_id,
            role: user.role,
            student_id: user.student_id,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), // 30 days
        };

        const token = await signJWT(payload, c.env.JWT_SECRET);

        // 3. Redirect to Frontend
        const frontendUrl = c.env.FRONTEND_URL || 'https://stage-builder-9hh.pages.dev';
        return c.redirect(`${frontendUrl}/auth/callback#token=${token}`);

    } catch (e: any) {
        return c.text(`Mock Login Failed: ${e.message}`, 500);
    }
});

export default app;
