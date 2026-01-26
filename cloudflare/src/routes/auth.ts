import { Hono } from 'hono';
import { Env, User, JWTPayload } from '../types';
import { signJWT, verifyJWT } from '../lib/auth';
import { generateId, generateInviteCode } from '../lib/utils';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { withD1Retry } from '../lib/d1-retry';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// Redirect to Google OAuth
app.get('/auth/google', (c) => {
    const clientId = c.env.GOOGLE_CLIENT_ID;
    const redirectUri = c.env.GOOGLE_REDIRECT_URI;

    // Scopes: email, profile
    const scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
    const state = crypto.randomUUID(); // Recommended for security

    // Security: Store state in HttpOnly cookie to prevent CSRF
    setCookie(c, 'oauth_state', state, {
        httpOnly: true,
        path: '/',
        maxAge: 600, // 10 minutes
        sameSite: 'Lax',
        secure: c.env.ENVIRONMENT === 'production',
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}&access_type=offline&prompt=consent`;

    return c.redirect(url);
});

// Google Callback
app.get('/auth/google/callback', async (c) => {
    const code = c.req.query('code');
    const state = c.req.query('state');

    // Security: Verify state parameter to prevent CSRF
    const storedState = getCookie(c, 'oauth_state');
    if (!state || !storedState || state !== storedState) {
        return c.text('Invalid state parameter (CSRF check failed)', 400);
    }

    // Clean up state cookie
    deleteCookie(c, 'oauth_state', { path: '/', secure: c.env.ENVIRONMENT === 'production' });

    if (!code) {
        return c.text('Missing code', 400);
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

        // Find or Create User
        // Note: DB is D1
        let user = await withD1Retry(() =>
            c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<User>()
        );

        if (!user) {
            // New user - Create User & Household
            const userId = generateId('user');
            const householdId = generateId('house');
            const inviteCode = generateInviteCode();

            // Transaction? No D1 transaction support in simple mode, do sequential
            await withD1Retry(() =>
                c.env.DB.prepare('INSERT INTO households (id, name, invite_code) VALUES (?, ?, ?)')
                    .bind(householdId, `${name}'s Family`, inviteCode)
                    .run()
            );

            await withD1Retry(() =>
                c.env.DB.prepare('INSERT INTO users (id, email, name, role, household_id, provider, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)')
                    .bind(userId, email, name, 'parent', householdId, 'google', avatarUrl)
                    .run()
            );

            user = await withD1Retry(() =>
                c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<User>()
            );
        } else {
            // Update avatar/name logic if needed
            await withD1Retry(() =>
                c.env.DB.prepare('UPDATE users SET avatar_url = ?, name = ?, updated_at = datetime("now") WHERE id = ?')
                    .bind(avatarUrl, name, user!.id)
                    .run()
            );
        }

        if (!user) throw new Error('User creation failed');

        // Check if this is a student login (if we support students logging in via Google later)
        // For now, assume Google login is mostly parents or hybrid. 
        // The table schema supports students.

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

        // Redirect to Frontend
        const frontendUrl = c.env.FRONTEND_URL || 'https://stage-builder-9hh.pages.dev';
        return c.redirect(`${frontendUrl}/auth/callback?token=${token}`);

    } catch (error: any) {
        console.error('Auth Error:', error);

        // Check for D1-specific errors and provide retry guidance
        if (error.message?.includes('D1_ERROR') || error.message?.includes('Network')) {
            const frontendUrl = c.env.FRONTEND_URL || 'https://stage-builder-9hh.pages.dev';
            return c.redirect(`${frontendUrl}/login?error=temporary&message=Database temporarily unavailable. Please try again.`);
        }

        return c.text(`Authentication Failed: ${error.message}`, 500);
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
        children = await withD1Retry(async () => {
            const { results } = await c.env.DB.prepare(
                'SELECT * FROM students WHERE household_id = ? ORDER BY created_at'
            ).bind(user.household_id).all();
            return results || [];
        });
    }

    return c.json({ user, children });
});
// DEBUG ENDPOINT
app.get('/api/debug/auth', async (c) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '') || c.req.query('token') as string;

    const secret = c.env.JWT_SECRET;
    const secretStatus = {
        exists: !!secret,
        length: secret?.length,
        preview: secret ? secret.substring(0, 3) + '...' : 'null'
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
                    userLookup = await withD1Retry(() =>
                        c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(verificationLibResult!.sub).first()
                    );
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

export default app;
