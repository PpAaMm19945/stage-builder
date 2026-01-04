// SchoolOS Cloudflare Worker API
// Uses Hono for routing, D1 for database, JWT for auth

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { generateWeeklyPlan, getSmartWeekStart } from './planner';

// Types
interface Env {
  // Core bindings
  DB: D1Database;
  BOOKS_BUCKET: R2Bucket;

  // AI bindings
  AI: any;  // Workers AI binding
  CURRICULUM_INDEX: VectorizeIndex;  // Vectorize for curriculum RAG

  // AI Gateway config
  AI_GATEWAY_HOST: string;
  AI_GATEWAY_ACCOUNT_ID: string;
  AI_GATEWAY_NAME: string;

  // Auth & Config
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  ENVIRONMENT: string;
}

interface BookMetadata {
  id: string;
  series: string;
  seriesTitle?: string;
  title: string;
  author?: string;
  illustrator?: string;
  description: string;
  minAgeMonths: number;
  maxAgeMonths: number;
  pageCount: number;
  domain: string;
  learningStage: string;
  readingPrompts?: { page: number; prompt: string }[];
  coverUrl?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  provider: string;
}

interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  exp: number;
  iat: number;
}

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// CORS middleware - allows Cloudflare Pages and Lovable preview
app.use('*', cors({
  origin: (origin, c) => {
    const frontendUrl = c.env.FRONTEND_URL || 'https://stage-builder-9hh.pages.dev';
    const allowedOrigins = [
      frontendUrl,
      'https://stage-builder-9hh.pages.dev',
      'http://localhost:5173',
      'http://localhost:3000',
    ];
    // Also allow any lovable.app subdomain
    if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.lovable.app'))) {
      return origin;
    }
    return frontendUrl;
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// JWT utilities using Web Crypto
async function signJWT(payload: Omit<JWTPayload, 'iat'>, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat };

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(fullPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !encodedSignature) return null;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureData = Uint8Array.from(
      atob(encodedSignature.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureData,
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    );

    if (!valid) return null;

    const payload: JWTPayload = JSON.parse(
      atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'))
    );

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// Auth middleware
app.use('/api/*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');

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
});

// Require auth helper
function requireAuth(c: any): User {
  const user = c.get('user');
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

// Generate unique ID
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============ DEV BYPASS AUTH (Development Only) ============
// Access: GET /auth/dev-bypass?email=test@example.com&name=Test%20User
// This creates or finds a user and returns a JWT token
app.get('/auth/dev-bypass', async (c) => {
  // Only allow in development
  if (c.env.ENVIRONMENT === 'production') {
    return c.json({ error: 'Dev bypass not available in production' }, 403);
  }

  const email = c.req.query('email') || 'test.family@schoolos.dev';
  const name = c.req.query('name') || 'Test Family';

  try {
    // Find or create user
    let user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first<User>();

    if (!user) {
      const userId = generateId('user');
      await c.env.DB.prepare(
        'INSERT INTO users (id, email, name, avatar_url, provider) VALUES (?, ?, ?, NULL, ?)'
      ).bind(userId, email, name, 'dev-bypass').run();

      user = { id: userId, email, name, avatar_url: null, provider: 'dev-bypass' };
    }

    // Generate JWT
    const jwt = await signJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days for dev
    }, c.env.JWT_SECRET);

    // Return token (frontend can store and use)
    return c.json({
      token: jwt,
      user: { id: user.id, email: user.email, name: user.name },
      message: 'Dev bypass successful. Store this token in localStorage as "schoolos_token"'
    });
  } catch (error) {
    console.error('Dev bypass error:', error);
    return c.json({ error: 'Dev bypass failed' }, 500);
  }
});

// ============ AUTH ROUTES ============

// Start Google OAuth flow
app.get('/auth/google', (c) => {
  const scope = encodeURIComponent('openid email profile');
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(c.env.GOOGLE_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(c.env.GOOGLE_REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&access_type=offline`;

  return c.redirect(authUrl);
});

// Google OAuth callback
app.get('/auth/google/callback', async (c) => {
  const code = c.req.query('code');
  if (!code) {
    return c.redirect(`${c.env.FRONTEND_URL}/login?error=no_code`);
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

    const tokens: any = await tokenResponse.json();
    if (!tokens.access_token) {
      return c.redirect(`${c.env.FRONTEND_URL}/login?error=token_failed`);
    }

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser: any = await userInfoResponse.json();

    // Upsert user in database
    const userId = generateId('user');
    const existingUser = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(googleUser.email).first<User>();

    let user: User;
    if (existingUser) {
      await c.env.DB.prepare(
        'UPDATE users SET name = ?, avatar_url = ?, updated_at = datetime("now") WHERE id = ?'
      ).bind(googleUser.name, googleUser.picture, existingUser.id).run();
      user = { ...existingUser, name: googleUser.name, avatar_url: googleUser.picture };
    } else {
      await c.env.DB.prepare(
        'INSERT INTO users (id, email, name, avatar_url, provider) VALUES (?, ?, ?, ?, ?)'
      ).bind(userId, googleUser.email, googleUser.name, googleUser.picture, 'google').run();
      user = { id: userId, email: googleUser.email, name: googleUser.name, avatar_url: googleUser.picture, provider: 'google' };
    }

    // Create JWT
    const jwt = await signJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    }, c.env.JWT_SECRET);

    // Redirect to frontend with token
    return c.redirect(`${c.env.FRONTEND_URL}/auth/callback?token=${jwt}`);
  } catch (error) {
    console.error('OAuth error:', error);
    return c.redirect(`${c.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

// Get current user
app.get('/api/auth/me', async (c) => {
  try {
    const user = requireAuth(c);

    // Get user's children
    const { results: children } = await c.env.DB.prepare(
      'SELECT * FROM students WHERE parent_id = ? ORDER BY created_at'
    ).bind(user.id).all();

    return c.json({ user, children });
  } catch (error: any) {
    console.error('Auth error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ user: null, children: [] }, status);
  }
});

// Logout (client-side token removal, but we can invalidate sessions if needed)
app.post('/api/auth/logout', (c) => {
  return c.json({ success: true });
});

// ============ STUDENTS (CHILDREN) ROUTES ============

// Get all children for current user
app.get('/api/students', async (c) => {
  try {
    const user = requireAuth(c);
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM students WHERE parent_id = ? ORDER BY created_at'
    ).bind(user.id).all();
    return c.json(results);
  } catch (error: any) {
    console.error('Students list error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// Get tomorrow's preview
app.get('/api/family/tomorrow-preview', async (c) => {
  try {
    const user = requireAuth(c);

    // Calculate tomorrow's date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][tomorrow.getDay()];

    // Check available days
    const timeModel = await c.env.DB.prepare('SELECT available_days FROM weekly_time_model WHERE parent_id = ?')
      .bind(user.id).first();
    const availableDays = JSON.parse((timeModel as any)?.available_days || '["Mon","Tue","Wed","Thu","Fri"]');

    if (!availableDays.includes(dayOfWeek)) {
        return c.json({
            date: tomorrow.toISOString().split('T')[0],
            restDay: true,
            summary: "Tomorrow is a rest day. Enjoy time together!"
        });
    }

    // Get plan
    const weekStart = getSmartWeekStart(); // Assuming same week, handling week crossover is trickier but this is MVP
    // If tomorrow is Monday, it might be a new week.
    // Simplified logic: Just fetch current plan. If tomorrow is in current plan, return it.

    const plan = await c.env.DB.prepare('SELECT plan_json FROM weekly_plans WHERE parent_id = ? AND week_start = ?')
      .bind(user.id, weekStart).first();

    if (!plan) {
         return c.json({
            date: tomorrow.toISOString().split('T')[0],
            needsPlan: true,
            summary: "You don't have a plan for tomorrow yet."
        });
    }

    const planData = JSON.parse((plan as any).plan_json);
    const tomorrowSlots = planData.slots.filter((s: any) => s.day === dayOfWeek);

    // Fetch details
    const activityIds = tomorrowSlots.map((s: any) => s.activityId);
    let activities: any[] = [];

    if (activityIds.length > 0) {
        const placeholders = activityIds.map(() => '?').join(',');
        const { results } = await c.env.DB.prepare(`
            SELECT id, title, description, domain FROM activities WHERE id IN (${placeholders})
        `).bind(...activityIds).all();
        activities = results;
    }

    // Generate AI Summary (lightweight)
    let summary = `You have ${activities.length} activities planned for tomorrow.`;
    if (activities.length > 0) {
        const domains = [...new Set(activities.map((a: any) => a.domain))];
        summary += ` Focus areas include ${domains.join(', ')}.`;
    }

    return c.json({
        date: tomorrow.toISOString().split('T')[0],
        activities,
        summary
    });

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Add a child (max 5)
app.post('/api/students', async (c) => {
  try {
    const user = requireAuth(c);

    // Check limit
    const { results: existing } = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM students WHERE parent_id = ?'
    ).bind(user.id).all();

    if ((existing[0] as any).count >= 5) {
      return c.json({ error: 'Maximum 5 children allowed. Contact support for more.' }, 400);
    }

    const body = await c.req.json();
    const { name, dateOfBirth } = body;

    // Calculate age in months
    const birthDate = new Date(dateOfBirth);
    const now = new Date();
    const ageInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 +
      (now.getMonth() - birthDate.getMonth());

    const studentId = generateId('student');

    await c.env.DB.prepare(
      'INSERT INTO students (id, parent_id, name, date_of_birth, age_in_months, current_stage) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(studentId, user.id, name, dateOfBirth, ageInMonths, 'early-years').run();

    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ?'
    ).bind(studentId).first();

    return c.json(student, 201);
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to add child' }, 400);
  }
});

// Update a child
app.put('/api/students/:id', async (c) => {
  try {
    const user = requireAuth(c);
    const studentId = c.req.param('id');
    const body = await c.req.json();

    // Verify ownership
    const existing = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND parent_id = ?'
    ).bind(studentId, user.id).first();

    if (!existing) {
      return c.json({ error: 'Child not found' }, 404);
    }

    const { name, dateOfBirth, avatarUrl } = body;

    await c.env.DB.prepare(
      'UPDATE students SET name = COALESCE(?, name), date_of_birth = COALESCE(?, date_of_birth), avatar_url = COALESCE(?, avatar_url), updated_at = datetime("now") WHERE id = ?'
    ).bind(name || null, dateOfBirth || null, avatarUrl || null, studentId).run();

    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ?'
    ).bind(studentId).first();

    return c.json(student);
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to update child' }, 400);
  }
});

// ============ ACTIVITIES ROUTES ============

// Get activities (filtered by age and domain)
app.get('/api/activities', async (c) => {
  const domain = c.req.query('domain');
  const ageMonths = c.req.query('ageMonths');
  const activityType = c.req.query('activityType');
  const context = c.req.query('context');
  const limit = c.req.query('limit') || '50';

  let query = "SELECT * FROM activities WHERE is_active = 1 AND (is_archived = 0 OR is_archived IS NULL) AND (content_status != 'blacklisted' OR content_status IS NULL)";
  const params: any[] = [];

  if (domain) {
    query += ' AND domain = ?';
    params.push(domain);
  }

  if (ageMonths) {
    const age = parseInt(ageMonths);
    query += ' AND min_age_months <= ? AND max_age_months >= ?';
    params.push(age, age);
  }

  if (activityType) {
    query += ' AND activity_type = ?';
    params.push(activityType);
  }

  if (context) {
    query += ' AND context_embedding = ?';
    params.push(context);
  }

  query += ' ORDER BY domain, min_age_months LIMIT ?';
  params.push(parseInt(limit));

  const stmt = c.env.DB.prepare(query);
  const { results } = await stmt.bind(...params).all();

  // Parse JSON fields
  const activities = results.map((a: any) => ({
    ...a,
    materials: JSON.parse(a.materials || '[]'),
    instructions: JSON.parse(a.instructions || '[]'),
    learning_outcomes: JSON.parse(a.learning_outcomes || '[]'),
  }));

  return c.json(activities);
});

// Get single activity
app.get('/api/activities/:id', async (c) => {
  const id = c.req.param('id');
  const activity = await c.env.DB.prepare(
    'SELECT * FROM activities WHERE id = ?'
  ).bind(id).first();

  if (!activity) {
    return c.json({ error: 'Activity not found' }, 404);
  }

  return c.json({
    ...activity,
    materials: JSON.parse((activity as any).materials || '[]'),
    instructions: JSON.parse((activity as any).instructions || '[]'),
    learning_outcomes: JSON.parse((activity as any).learning_outcomes || '[]'),
  });
});

// Simple Activity Completion
app.post('/api/activity-completions', async (c) => {
    try {
        const user = requireAuth(c);
        const { activityId, notes } = await c.req.json();

        const id = crypto.randomUUID();
        await c.env.DB.prepare(`
            INSERT INTO activity_completions (id, parent_id, activity_id, notes)
            VALUES (?, ?, ?, ?)
        `).bind(id, user.id, activityId, notes || null).run();

        return c.json({ success: true, id });
    } catch (error: any) {
        return c.json({ error: error.message || 'Failed to record completion' }, 400);
    }
});

// Get today's recommended activities for a student (LEGACY/FALLBACK)
// Helper: Get or generate daily recommendations for a student
async function getStudentDailyRecommendations(db: D1Database, student: any) {
  const today = new Date().toISOString().split('T')[0];
  const studentId = student.id;

  // Check for existing recommendations
  let { results: recommendations } = await db.prepare(`
    SELECT dr.*, a.* FROM daily_recommendations dr
    JOIN activities a ON dr.activity_id = a.id
    WHERE dr.student_id = ? AND dr.recommended_date = ?
    ORDER BY dr.position
  `).bind(studentId, today).all();

  // Generate recommendations if none exist
  if (recommendations.length === 0) {
    const ageMonths = (student as any).age_in_months;

    // Get one activity from each domain that hasn't been completed recently
    const domains = ['cognitive', 'motor', 'language', 'social-emotional', 'pre-academic'];

    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i];
      const activity = await db.prepare(`
        SELECT * FROM activities 
        WHERE domain = ? AND min_age_months <= ? AND max_age_months >= ? AND is_active = 1
        AND id NOT IN (
          SELECT activity_id FROM observations WHERE student_id = ? 
          AND completed_at > datetime('now', '-7 days')
        )
        ORDER BY RANDOM() LIMIT 1
      `).bind(domain, ageMonths, ageMonths, studentId).first();

      if (activity) {
        const recId = generateId('rec');
        await db.prepare(
          'INSERT INTO daily_recommendations (id, student_id, activity_id, recommended_date, position) VALUES (?, ?, ?, ?, ?)'
        ).bind(recId, studentId, (activity as any).id, today, i).run();
      }
    }

    // Fetch the newly created recommendations
    const result = await db.prepare(`
      SELECT dr.*, a.* FROM daily_recommendations dr
      JOIN activities a ON dr.activity_id = a.id
      WHERE dr.student_id = ? AND dr.recommended_date = ?
      ORDER BY dr.position
    `).bind(studentId, today).all();
    recommendations = result.results;
  }

  return recommendations;
}

// Get today's recommended activities for a student
app.get('/api/students/:studentId/today', async (c) => {
  try {
    const user = requireAuth(c);
    const studentId = c.req.param('studentId');

    // Verify ownership
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND parent_id = ?'
    ).bind(studentId, user.id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    const recommendations = await getStudentDailyRecommendations(c.env.DB, student);

    // Parse JSON fields
    const activities = recommendations.map((r: any) => ({
      ...r,
      materials: JSON.parse(r.materials || '[]'),
      instructions: JSON.parse(r.instructions || '[]'),
      learning_outcomes: JSON.parse(r.learning_outcomes || '[]'),
    }));

    // ========== SIBLING-AWARE RECOMMENDATIONS ==========
    // Get all siblings for this parent
    const { results: allChildren } = await c.env.DB.prepare(
      'SELECT * FROM students WHERE parent_id = ? ORDER BY age_in_months DESC'
    ).bind(user.id).all();

    let familyActivities: any[] = [];

    // Only compute family activities if there are multiple children
    if (allChildren.length > 1) {
      // Find age range that covers all children
      const ages = allChildren.map((c: any) => c.age_in_months);
      const oldestAge = Math.max(...ages);
      const youngestAge = Math.min(...ages);

      // Find activities where the age range overlaps with ALL children
      // An activity is suitable for family if its range encompasses all children
      const { results: sharedActivities } = await c.env.DB.prepare(`
        SELECT * FROM activities 
        WHERE min_age_months <= ? AND max_age_months >= ? AND is_active = 1
        ORDER BY RANDOM() LIMIT 3
      `).bind(youngestAge, oldestAge).all();

      // Build family activity recommendations with variations
      familyActivities = sharedActivities.map((activity: any) => {
        const variations: Record<string, string> = {};

        allChildren.forEach((child: any) => {
          const childAge = child.age_in_months;
          const activityMidpoint = (activity.min_age_months + activity.max_age_months) / 2;

          if (childAge < activityMidpoint - 6) {
            variations[child.id] = 'easier';
          } else if (childAge > activityMidpoint + 6) {
            variations[child.id] = 'harder';
          } else {
            variations[child.id] = 'standard';
          }
        });

        return {
          activity: {
            ...activity,
            materials: JSON.parse(activity.materials || '[]'),
            instructions: JSON.parse(activity.instructions || '[]'),
            learning_outcomes: JSON.parse(activity.learning_outcomes || '[]'),
          },
          suitableFor: allChildren.map((c: any) => c.id),
          variations,
        };
      });
    }

    return c.json({ student, activities, familyActivities });
  } catch (error: any) {
    console.error('Student today error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// Helper function to fetch daily practices
async function getDailyPractices(db: D1Database) {
  const { results: dailyPractices } = await db.prepare(`
    SELECT * FROM activities 
    WHERE activity_type = 'daily_practice' AND is_active = 1
    ORDER BY RANDOM() LIMIT 3
  `).all();

  return dailyPractices.map((activity: any) => ({
      ...activity,
      materials: JSON.parse(activity.materials || '[]'),
      instructions: JSON.parse(activity.instructions || '[]'),
      learning_outcomes: JSON.parse(activity.learning_outcomes || '[]'),
  }));
}

// Get family dashboard data - UNIFIED PLANNER VERSION
app.get('/api/family/today', async (c) => {
  try {
    const user = requireAuth(c);

    // Get all children
    const { results: children } = await c.env.DB.prepare(
      'SELECT * FROM students WHERE parent_id = ? ORDER BY age_in_months DESC'
    ).bind(user.id).all();

    if (children.length === 0) {
      return c.json({
        date: new Date().toISOString().split('T')[0],
        children: [],
        familySessions: [],
        materials: [],
        totalDuration: 0,
        coreKitCoverage: 0
      });
    }

    // 1. Get today's day of week
    const today = new Date();
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()];

    // 2. Check if today is an available day
    const timeModel = await c.env.DB.prepare('SELECT available_days FROM weekly_time_model WHERE parent_id = ?')
      .bind(user.id).first();
    const availableDays = JSON.parse((timeModel as any)?.available_days || '["Mon","Tue","Wed","Thu","Fri"]');

    // 3. If not an available day, return REST DAY response
    if (!availableDays.includes(dayOfWeek)) {
        const dailyPractices = await getDailyPractices(c.env.DB);

        return c.json({
            date: new Date().toISOString().split('T')[0],
            children,
            restDay: true,
            message: "Today is a rest day! Here are some gentle practices you can do if you'd like.",
            familySessions: [],
            dailyPractices,
            materials: [],
            totalDuration: 0,
            coreKitCoverage: 0
        });
    }

    // 4. Get this week's plan
    const weekStart = getSmartWeekStart();
    const plan = await c.env.DB.prepare('SELECT plan_json FROM weekly_plans WHERE parent_id = ? AND week_start = ?')
      .bind(user.id, weekStart).first();

    // 5. If no plan exists, prompt to generate
    if (!plan) {
      const dailyPractices = await getDailyPractices(c.env.DB);

      return c.json({
        date: new Date().toISOString().split('T')[0],
        children,
        needsPlan: true,
        message: "Let's plan your week! Generate a schedule to get personalized activities.",
        familySessions: [],
        dailyPractices,
        materials: [],
        totalDuration: 0,
        coreKitCoverage: 0
      });
    }

    // 6. Return today's activities from the plan
    const planData = JSON.parse((plan as any).plan_json);
    const todaysSlots = planData.slots.filter((s: any) => s.day === dayOfWeek);

    // Hydrate activities
    const activityIds = todaysSlots.map((s: any) => s.activityId);
    let familySessions: any[] = [];
    let materialsList: any[] = [];

    if (activityIds.length > 0) {
        const placeholders = activityIds.map(() => '?').join(',');
        const { results: activities } = await c.env.DB.prepare(`
            SELECT * FROM activities WHERE id IN (${placeholders})
        `).bind(...activityIds).all();

        const activityMap = new Map(activities.map((a: any) => [a.id, a]));

        familySessions = todaysSlots.map((slot: any) => {
            const activity: any = activityMap.get(slot.activityId);
            if (!activity) return null;

             const tiers = JSON.parse(activity.tiered_expectations || '[]');
             const childTiers = children.map((child: any) => {
                const age = child.age_in_months;
                let tier = tiers.find((t: any) => age >= t.age_min && age <= t.age_max);
                if (!tier) {
                    if (age < tiers[0]?.age_min) tier = tiers[0];
                    else if (age > tiers[tiers.length - 1]?.age_max) tier = tiers[tiers.length - 1];
                }
                return {
                    childId: child.id,
                    childName: child.name,
                    tier: tier?.tier || 'Standard',
                    expectation: tier?.expectation || 'Participate with support',
                    childAge: age
                };
            });

            const domainLabels: Record<string, string> = {
                'motor': 'Stewardship & Dominion',
                'language': 'Word & Truth',
                'cognitive': 'Wisdom & Order',
                'social-emotional': 'Virtue & Sanctification',
                'pre-academic': 'Foundations & Patterns'
            };
            const domainName = domainLabels[activity.domain] || activity.domain;

            return {
                activity: {
                    ...activity,
                    materials: JSON.parse(activity.materials || '[]'),
                    instructions: JSON.parse(activity.instructions || '[]'),
                    learning_outcomes: JSON.parse(activity.learning_outcomes || '[]'),
                },
                childTiers,
                messLevel: activity.mess_level,
                prepMinutes: activity.prep_time_minutes,
                materialsAvailable: true, // simplified for now
                reasoning: slot.reasoning || `Planned for ${slot.timeSlot}`
            };
        }).filter(Boolean);

         // Collect materials
         const neededMaterials = new Set<string>();
         familySessions.forEach((session: any) => {
           session.activity.materials.forEach((m: string) => neededMaterials.add(m));
         });

         if (neededMaterials.size > 0) {
           const marks = Array(neededMaterials.size).fill('?').join(',');
           const { results: existing } = await c.env.DB.prepare(`
                 SELECT material_name, status FROM family_materials
                 WHERE parent_id = ? AND material_name IN (${Array.from(neededMaterials).map(() => '?').join(',')})
             `).bind(user.id, ...Array.from(neededMaterials)).all();

           const statusMap = new Map();
           existing.forEach((r: any) => statusMap.set(r.material_name, r.status));

           neededMaterials.forEach(m => {
             materialsList.push({
               name: m,
               status: statusMap.get(m) || 'unknown'
             });
           });
         }
    }

    // Compute metrics
    const totalDuration = familySessions.reduce((acc: number, s: any) => acc + (s.activity.duration_minutes || 15), 0);
    const coreKitCount = familySessions.filter((s: any) => s.activity.uses_core_kit).length;
    const coreKitCoverage = familySessions.length > 0 ? (coreKitCount / familySessions.length) * 100 : 0;

    return c.json({
      date: new Date().toISOString().split('T')[0],
      children,
      familySessions,
      materials: materialsList,
      totalDuration,
      coreKitCoverage
    });
  } catch (error: any) {
    console.error('Family today error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// ============ FAMILY MATERIALS ROUTES ============

// Get family materials
app.get('/api/family/materials', async (c) => {
  try {
    const user = requireAuth(c);
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM family_materials WHERE parent_id = ? ORDER BY material_name'
    ).bind(user.id).all();

    // Normalize field names: material_name → name for frontend consistency
    const normalized = results.map((row: any) => ({
      name: row.material_name,
      status: row.status
    }));

    return c.json(normalized);
  } catch (error: any) {
    console.error('Family materials error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// Update family materials
app.put('/api/family/materials', async (c) => {
  try {
    const user = requireAuth(c);
    const body = await c.req.json();
    const { materials } = body; // Array of { name, status }

    if (!Array.isArray(materials)) {
      return c.json({ error: 'Materials must be an array' }, 400);
    }

    // Validate each material entry
    const validStatuses = ['have', 'willing_to_buy', 'not_interested', 'unknown'];
    const invalidEntries = materials.filter((m: any) =>
      !m.name || typeof m.name !== 'string' || !validStatuses.includes(m.status)
    );

    if (invalidEntries.length > 0) {
      return c.json({
        error: 'Invalid material entries found. Each must have a valid name and status.',
        details: `Found ${invalidEntries.length} invalid entries`
      }, 400);
    }

    const stmt = c.env.DB.prepare(`
      INSERT INTO family_materials (id, parent_id, material_name, status, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(parent_id, material_name) 
      DO UPDATE SET status = excluded.status, updated_at = datetime('now')
    `);

    const batch = materials.map((m: any) =>
      stmt.bind(generateId('mat'), user.id, m.name, m.status)
    );

    await c.env.DB.batch(batch);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Materials update error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// Swap activity - get an alternative activity
app.post('/api/family/swap', async (c) => {
  try {
    const user = requireAuth(c);
    const body = await c.req.json();
    const { activityId } = body;

    if (!activityId) {
      return c.json({ error: 'activityId is required' }, 400);
    }

    // Get the current activity to understand criteria
    const currentActivity = await c.env.DB.prepare(
      'SELECT * FROM activities WHERE id = ?'
    ).bind(activityId).first();

    if (!currentActivity) {
      return c.json({ error: 'Activity not found' }, 404);
    }

    // Get children for age range
    const { results: children } = await c.env.DB.prepare(
      'SELECT * FROM students WHERE parent_id = ? ORDER BY age_in_months DESC'
    ).bind(user.id).all();

    if (children.length === 0) {
      return c.json({ error: 'No children registered' }, 400);
    }

    const ages = children.map((c: any) => c.age_in_months);
    const youngestAge = Math.min(...ages);
    const oldestAge = Math.max(...ages);

    // Get parent's materials
    const { results: materialPrefs } = await c.env.DB.prepare(
      'SELECT material_name, status FROM family_materials WHERE parent_id = ?'
    ).bind(user.id).all();

    const haveMaterials = new Set(
      materialPrefs
        .filter((m: any) => m.status === 'have' || m.status === 'willing_to_buy')
        .map((m: any) => m.material_name.toLowerCase())
    );

    // Find alternative activity with same criteria but different ID
    const { results: alternatives } = await c.env.DB.prepare(`
      SELECT * FROM activities 
      WHERE activity_type = 'family_session'
        AND id != ?
        AND min_age_months <= ? 
        AND max_age_months >= ?
        AND tiered_expectations IS NOT NULL
        AND is_active = 1
        AND (is_archived = 0 OR is_archived IS NULL)
        AND (content_status != 'blacklisted' OR content_status IS NULL)
      ORDER BY uses_core_kit DESC, RANDOM()
      LIMIT 5
    `).bind(activityId, youngestAge, oldestAge).all();

    if (alternatives.length === 0) {
      return c.json({ error: 'No alternative activities available' }, 404);
    }

    // Score by material match and pick best
    const scored = alternatives.map((activity: any) => {
      const materials = JSON.parse(activity.materials || '[]');
      const matchCount = materials.filter((m: string) => haveMaterials.has(m.toLowerCase())).length;
      const matchRatio = materials.length > 0 ? matchCount / materials.length : 1;
      return { activity, score: matchRatio };
    }).sort((a, b) => b.score - a.score);

    const selectedActivity = scored[0].activity;

    // Build session response same as /api/family/today format
    const tiers = JSON.parse(selectedActivity.tiered_expectations || '[]');
    const childTiers = children.map((child: any) => {
      const age = child.age_in_months;
      let tier = tiers.find((t: any) => age >= t.age_min && age <= t.age_max);
      if (!tier) {
        if (age < tiers[0]?.age_min) tier = tiers[0];
        else if (age > tiers[tiers.length - 1]?.age_max) tier = tiers[tiers.length - 1];
      }
      return {
        childId: child.id,
        childName: child.name,
        tier: tier?.tier || 'Standard',
        expectation: tier?.expectation || 'Participate with support',
        childAge: age
      };
    });

    const domainLabels: Record<string, string> = {
      'motor': 'Stewardship & Dominion',
      'language': 'Word & Truth',
      'cognitive': 'Wisdom & Order',
      'social-emotional': 'Virtue & Sanctification',
      'pre-academic': 'Foundations & Patterns'
    };
    const domainName = domainLabels[selectedActivity.domain] || selectedActivity.domain;

    return c.json({
      session: {
        activity: {
          ...selectedActivity,
          materials: JSON.parse(selectedActivity.materials || '[]'),
          instructions: JSON.parse(selectedActivity.instructions || '[]'),
          learning_outcomes: JSON.parse(selectedActivity.learning_outcomes || '[]'),
        },
        childTiers,
        messLevel: selectedActivity.mess_level,
        prepMinutes: selectedActivity.prep_time_minutes,
        materialsAvailable: true,
        reasoning: `Swapped to '${selectedActivity.title}' - great for developing ${domainName}.`
      }
    });
  } catch (error: any) {
    console.error('Swap activity error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// ============ FAMILY COMPOSER (NEW) ============

// Compose a custom family session plan
app.post('/family-sessions/compose', async (c) => {
  try {
    // Optional auth (can be public or authenticated)
    // If auth, we can pull defaults. simple validation for now.
    const body = await c.req.json();
    const { children, materials, preferred_domain } = body;
    // children: array of { age_months: number, name?: string }
    // materials: array of strings (available materials)
    // preferred_domain: optional string (biblical domain or standard domain)

    if (!children || !Array.isArray(children) || children.length === 0) {
      return c.json({ error: 'Children array required' }, 400);
    }

    const ages = children.map((c: any) => c.age_months);
    const minAge = Math.min(...ages);
    const maxAge = Math.max(...ages);

    let query = `
      SELECT * FROM activities 
      WHERE activity_type = 'family_session'
        AND min_age_months <= ? 
        AND max_age_months >= ?
        AND tiered_expectations IS NOT NULL
        AND is_active = 1
        AND (is_archived = 0 OR is_archived IS NULL)
        AND (content_status != 'blacklisted' OR content_status IS NULL)
    `;

    const params: any[] = [minAge, maxAge];

    // Domain filter (mapped to biblical or standard)
    if (preferred_domain) {
      if (['wisdom', 'stature', 'favor_with_god', 'favor_with_man'].includes(preferred_domain)) {
        query += ' AND biblical_domain = ?';
        params.push(preferred_domain);
      } else {
        query += ' AND domain = ?';
        params.push(preferred_domain);
      }
    }

    // Material matching logic could be added here similar to getFamilyDailyRecommendations
    // For now, simpler ordering
    query += ` ORDER BY uses_core_kit DESC, RANDOM() LIMIT 1`;

    const activity = await c.env.DB.prepare(query).bind(...params).first();

    if (!activity) {
      return c.json({ error: 'No suitable family session found for this combination.' }, 404);
    }

    // Process tiers
    const tiers = JSON.parse((activity as any).tiered_expectations || '[]');
    const childInstructions = children.map((child: any) => {
      const age = child.age_months;
      let tier = tiers.find((t: any) => age >= t.age_min && age <= t.age_max);
      if (!tier) {
        if (age < tiers[0]?.age_min) tier = tiers[0];
        else if (age > tiers[tiers.length - 1]?.age_max) tier = tiers[tiers.length - 1];
      }
      return {
        childName: child.name || 'Child',
        ageMonths: age,
        tier: tier?.tier || 'Standard',
        instruction: tier?.expectation || 'Participate with support',
        adultSupport: tier?.adult_support // New field if we added it to tiered_expectations json
      };
    });

    return c.json({
      activity: {
        ...activity,
        materials: JSON.parse((activity as any).materials || '[]'),
        instructions: JSON.parse((activity as any).instructions || '[]'),
        learning_outcomes: JSON.parse((activity as any).learning_outcomes || '[]'),
      },
      familyPrompt: (activity as any).parent_script || "Guide your family through this activity together.",
      safetyNote: (activity as any).safety_note,
      successCue: (activity as any).success_cue,
      childInstructions
    });

  } catch (error: any) {
    console.error('Composer error:', error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});


// ============ ADMIN / EXPORT ROUTES ============

// Export activities
app.get('/api/activities/export', async (c) => {
  // optionally protect with secret or admin role
  try {
    // For now allow any auth user or public if needed? Let's require auth at least.
    const user = requireAuth(c);

    const { results } = await c.env.DB.prepare(
      'SELECT * FROM activities ORDER BY id'
    ).all();

    const activities = results.map((a: any) => ({
      ...a,
      materials: JSON.parse(a.materials || '[]'),
      instructions: JSON.parse(a.instructions || '[]'),
      learning_outcomes: JSON.parse(a.learning_outcomes || '[]'),
      tiered_expectations: JSON.parse(a.tiered_expectations || 'null')
    }));

    return c.json(activities);
  } catch (error: any) {
    return c.json({ error: error.message }, 401);
  }
});


// ============ OBSERVATIONS ROUTES ============

// Record an observation
app.post('/api/observations', async (c) => {
  try {
    const user = requireAuth(c);
    const body = await c.req.json();
    const { studentId, activityId, masteryLevel, parentNotes, tier } = body;

    // Verify student ownership
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND parent_id = ?'
    ).bind(studentId, user.id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    // Verify activity exists
    const activity = await c.env.DB.prepare(
      'SELECT * FROM activities WHERE id = ?'
    ).bind(activityId).first();

    if (!activity) {
      return c.json({ error: 'Activity not found' }, 404);
    }

    if ((activity as any).assessment_prohibited === 1) {
      return c.json({ error: 'Observations cannot be recorded for daily practices' }, 400);
    }

    const observationId = generateId('obs');

    // Include tier if provided (for family sessions)
    await c.env.DB.prepare(
      'INSERT INTO observations (id, student_id, activity_id, mastery_level, parent_notes, tier) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(observationId, studentId, activityId, masteryLevel, parentNotes || null, tier || null).run();

    // Mark daily recommendation as completed if exists
    const today = new Date().toISOString().split('T')[0];
    await c.env.DB.prepare(
      'UPDATE daily_recommendations SET is_completed = 1 WHERE student_id = ? AND activity_id = ? AND recommended_date = ?'
    ).bind(studentId, activityId, today).run();

    const observation = await c.env.DB.prepare(
      'SELECT * FROM observations WHERE id = ?'
    ).bind(observationId).first();

    return c.json(observation, 201);
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to record observation' }, 400);
  }
});

// Get observations for a student
app.get('/api/students/:studentId/observations', async (c) => {
  try {
    const user = requireAuth(c);
    const studentId = c.req.param('studentId');
    const domain = c.req.query('domain');
    const limit = c.req.query('limit') || '50';

    // Verify ownership
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND parent_id = ?'
    ).bind(studentId, user.id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    let query = `
      SELECT o.*, a.title, a.domain, a.description 
      FROM observations o
      JOIN activities a ON o.activity_id = a.id
      WHERE o.student_id = ?
    `;
    const params: any[] = [studentId];

    if (domain) {
      query += ' AND a.domain = ?';
      params.push(domain);
    }

    query += ' ORDER BY o.completed_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    return c.json(results);
  } catch (error: any) {
    return c.json({ error: error.message || 'Unauthorized' }, 401);
  }
});

// Get progress summary for a student
app.get('/api/students/:studentId/progress', async (c) => {
  try {
    const user = requireAuth(c);
    const studentId = c.req.param('studentId');

    // Verify ownership
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND parent_id = ?'
    ).bind(studentId, user.id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    // Get counts by domain and mastery level
    const { results: byDomain } = await c.env.DB.prepare(`
      SELECT a.domain, o.mastery_level, COUNT(*) as count
      FROM observations o
      JOIN activities a ON o.activity_id = a.id
      WHERE o.student_id = ?
      GROUP BY a.domain, o.mastery_level
    `).bind(studentId).all();

    // Get recent activity (last 7 days)
    const { results: recentActivity } = await c.env.DB.prepare(`
      SELECT DATE(o.completed_at) as date, COUNT(*) as count
      FROM observations o
      WHERE o.student_id = ? AND o.completed_at > datetime('now', '-7 days')
      GROUP BY DATE(o.completed_at)
      ORDER BY date
    `).bind(studentId).all();

    // Get total completed activities
    const totalResult = await c.env.DB.prepare(`
      SELECT COUNT(DISTINCT activity_id) as total FROM observations WHERE student_id = ?
    `).bind(studentId).first();

    return c.json({
      student,
      totalCompleted: (totalResult as any)?.total || 0,
      byDomain,
      recentActivity,
    });
  } catch (error: any) {
    return c.json({ error: error.message || 'Unauthorized' }, 401);
  }
});

// Delete a child
app.delete('/api/students/:id', async (c) => {
  try {
    const user = requireAuth(c);
    const studentId = c.req.param('id');

    // Verify ownership
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND parent_id = ?'
    ).bind(studentId, user.id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    // Delete related records first (cascade)
    await c.env.DB.prepare(
      'DELETE FROM observations WHERE student_id = ?'
    ).bind(studentId).run();

    await c.env.DB.prepare(
      'DELETE FROM daily_recommendations WHERE student_id = ?'
    ).bind(studentId).run();

    // Delete the student
    await c.env.DB.prepare(
      'DELETE FROM students WHERE id = ?'
    ).bind(studentId).run();

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to delete child' }, 400);
  }
});

// ============ BOOKS & READING ROUTES ============

// Helper: Parse age range string to months
function parseAgeRange(ageRange: string): { min: number; max: number } {
  // Examples: "1-4 years", "3-5 years", "6-9"
  const match = ageRange.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return { min: 24, max: 60 };

  let [, minStr, maxStr] = match;
  let min = parseInt(minStr);
  let max = parseInt(maxStr);

  // If values are small (likely years), convert to months
  if (max <= 12) {
    min = min * 12;
    max = max * 12;
  }

  return { min, max };
}

// Helper: Get book metadata from R2
// Helper: Get book metadata from R2
async function getBookMetadata(bucket: R2Bucket, series: string, bookId: string): Promise<BookMetadata | null> {
  // STRICT: Always expected at books/series/book/metadata.json
  // series and bookId here are FOLDER NAMES, not human-readable values
  const key = `books/${series}/${bookId}/metadata.json`;
  const object = await bucket.get(key);

  if (!object) return null;

  const data = await object.json() as any;

  // Normalize metadata format
  const ageRange = parseAgeRange(data.ageRange || '2-5 years');

  // CRITICAL: Use folder names (series, bookId params) for URL construction
  // Store human-readable title separately for display purposes
  return {
    id: bookId,  // Always use folder name
    series: series,  // Always use folder name
    title: data.title || bookId,
    author: data.author,
    illustrator: data.illustrator,
    description: data.description || '',
    minAgeMonths: data.minAgeMonths || ageRange.min,
    maxAgeMonths: data.maxAgeMonths || ageRange.max,
    pageCount: data.pageCount || data.pages?.filter((p: any) => p.pageNumber)?.length || 10,
    domain: data.domain || 'language',
    learningStage: data.learningStage || 'early-years',
    readingPrompts: data.readingPrompts,
    coverUrl: `/api/books/${encodeURIComponent(series)}/${encodeURIComponent(bookId)}/cover`
  };
}

// Helper: List all delimited prefixes with pagination
async function listAllPrefixes(bucket: R2Bucket, options: R2ListOptions): Promise<string[]> {
  let prefixes: string[] = [];
  let truncated = true;
  let cursor: string | undefined;

  while (truncated) {
    const result = await bucket.list({ ...options, cursor });
    prefixes = prefixes.concat(result.delimitedPrefixes || []);
    truncated = result.truncated;
    if (result.truncated) {
      cursor = result.cursor;
    }
  }
  return prefixes;
}

// Helper: Find metadata file in a book directory (case-insensitive)
async function findMetadataFile(bucket: R2Bucket, bookPrefix: string): Promise<R2ObjectBody | null> {
  // List files in the book directory to find metadata.json regardless of case
  const result = await bucket.list({ prefix: bookPrefix });

  const metadataKey = result.objects.find(obj =>
    obj.key.toLowerCase().endsWith('/metadata.json') ||
    obj.key.toLowerCase() === 'metadata.json'
  )?.key;

  if (metadataKey) {
    return bucket.get(metadataKey);
  }
  return null;
}

// List all books
app.get('/api/books', async (c) => {
  try {
    const stage = c.req.query('stage');
    const ageMonths = c.req.query('ageMonths');
    const bucket = c.env.BOOKS_BUCKET;
    const books: BookMetadata[] = [];

    console.log('Starting robust book listing...');

    // Step 1: Detect Root
    // Check if 'books/' exists at the root level
    const rootList = await bucket.list({ delimiter: '/' });
    const rootPrefixes = rootList.delimitedPrefixes || [];

    let rootPath = '';
    if (rootPrefixes.includes('books/')) {
      rootPath = 'books/';
    }
    console.log(`Detected root path: '${rootPath}'`);

    // Step 2: List Series (handling pagination)
    const seriesPrefixes = await listAllPrefixes(bucket, {
      prefix: rootPath,
      delimiter: '/'
    });
    console.log(`Found ${seriesPrefixes.length} series prefixes`);

    // Step 3: Iterate Series
    for (const seriesPrefix of seriesPrefixes) {
      const seriesName = seriesPrefix.replace(rootPath, '').replace(/\/$/, '');

      // Step 4: List Books in Series (handling pagination)
      const bookPrefixes = await listAllPrefixes(bucket, {
        prefix: seriesPrefix,
        delimiter: '/'
      });

      // Step 5: Process Books
      for (const bookPrefix of bookPrefixes) {
        // bookPath is the relative path from the series, e.g., "Book Title/"
        const bookId = bookPrefix.replace(seriesPrefix, '').replace(/\/$/, '');

        try {
          // Find and load metadata
          const object = await findMetadataFile(bucket, bookPrefix);

          if (object) {
            const data = await object.json() as any;
            const ageRange = parseAgeRange(data.ageRange || '2-5 years');

            // CRITICAL: Use folder names (seriesName, bookId) for URL construction
            // The frontend uses book.series and book.id to build cover/page URLs
            // These MUST match the actual R2 folder structure, not human-readable names
            books.push({
              id: bookId,  // Always use folder name, not metadata id
              series: seriesName,  // Always use folder name, not metadata series
              seriesTitle: data.series || seriesName,  // Human-readable for display
              title: data.title || bookId,
              author: data.author,
              illustrator: data.illustrator,
              description: data.description || '',
              minAgeMonths: data.minAgeMonths || ageRange.min,
              maxAgeMonths: data.maxAgeMonths || ageRange.max,
              pageCount: data.pageCount || data.pages?.filter((p: any) => p.pageNumber)?.length || 10,
              domain: data.domain || 'language',
              learningStage: data.learningStage || 'early-years',
              readingPrompts: data.readingPrompts,
              coverUrl: `/api/books/${encodeURIComponent(seriesName)}/${encodeURIComponent(bookId)}/cover`
            });
          }
        } catch (e) {
          console.warn(`Failed to load book ${bookId}:`, e);
        }
      }
    }

    console.log(`Total books loaded: ${books.length}`);

    // Apply filters matching the original logic
    let filtered = books;
    if (stage) {
      filtered = filtered.filter(b => b.learningStage === stage);
    }
    if (ageMonths) {
      const age = parseInt(ageMonths);
      filtered = filtered.filter(b => b.minAgeMonths <= age && b.maxAgeMonths >= age);
    }

    return c.json(filtered);
  } catch (error: any) {
    console.error('Books list error:', error);
    return c.json({ error: error.message || 'Failed to list books' }, 500);
  }
});

// List all books (Legacy - keep for now if needed, or update frontend to use series)
// ... keeping as is, but also adding Series endpoints

// ============ SERIES ROUTES ============

// List all series
app.get('/api/series', async (c) => {
  try {
    const bucket = c.env.BOOKS_BUCKET;
    const seriesList: any[] = [];

    // List 'books/' prefix with '/' delimiter to get series folders
    const rootList = await bucket.list({ prefix: 'books/', delimiter: '/' });
    const seriesPrefixes = rootList.delimitedPrefixes || [];

    for (const prefix of seriesPrefixes) {
      const seriesId = prefix.replace('books/', '').replace('/', '');

      // Try to get metadata
      const metaKey = `${prefix}metadata.json`;
      const metaObj = await bucket.get(metaKey);

      let metadata: any = { id: seriesId, title: seriesId, description: '' };

      if (metaObj) {
        try {
          metadata = await metaObj.json();
        } catch (e) { console.warn(`Invalid metadata for series ${seriesId}`); }
      }

      seriesList.push({
        ...metadata,
        id: seriesId, // Ensure ID matches folder
        coverUrl: `/api/series/${encodeURIComponent(seriesId)}/cover`
      });
    }

    return c.json(seriesList);

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get series details
app.get('/api/series/:seriesId', async (c) => {
  try {
    const seriesId = c.req.param('seriesId');
    const bucket = c.env.BOOKS_BUCKET;
    const prefix = `books/${seriesId}`;

    // Get Metadata
    const metaKey = `${prefix}/metadata.json`;
    const metaObj = await bucket.get(metaKey);

    if (!metaObj) {
      return c.json({ error: 'Series not found' }, 404);
    }

    const metadata = await metaObj.json() as any;

    // List Books in Series
    const booksList = await bucket.list({ prefix: `${prefix}/`, delimiter: '/' });
    const bookPrefixes = booksList.delimitedPrefixes || [];
    const books: BookMetadata[] = [];

    for (const bookPrefix of bookPrefixes) {
      const bookId = bookPrefix.replace(`${prefix}/`, '').replace('/', '');
      const bookMeta = await getBookMetadata(bucket, seriesId, bookId);
      if (bookMeta) {
        books.push(bookMeta);
      }
    }

    return c.json({
      ...metadata,
      id: seriesId,
      coverUrl: `/api/series/${encodeURIComponent(seriesId)}/cover`,
      books
    });

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get series cover
app.get('/api/series/:seriesId/cover', async (c) => {
  try {
    const seriesId = c.req.param('seriesId');
    const bucket = c.env.BOOKS_BUCKET;

    // STRICT: books/{series}/cover.png
    const key = `books/${seriesId}/cover.png`;
    const object = await bucket.get(key);

    if (object) {
      const headers = new Headers();
      headers.set('Content-Type', object.httpMetadata?.contentType || 'image/png');
      headers.set('Cache-Control', 'public, max-age=86400');
      return new Response(object.body, { headers });
    }

    return c.json({ error: 'Series cover not found' }, 404);

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get single book metadata
app.get('/api/books/:series/:bookId', async (c) => {
  try {
    const series = c.req.param('series');
    const bookId = c.req.param('bookId');

    const metadata = await getBookMetadata(c.env.BOOKS_BUCKET, series, bookId);

    if (!metadata) {
      return c.json({ error: 'Book not found' }, 404);
    }

    return c.json(metadata);
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to get book' }, 500);
  }
});

// Get book cover image
// Get book cover image
app.get('/api/books/:series/:bookId/cover', async (c) => {
  try {
    const series = c.req.param('series');
    const bookId = c.req.param('bookId');
    const bucket = c.env.BOOKS_BUCKET;

    // STRICT: Always books/{series}/{bookId}/images/cover.png
    const key = `books/${series}/${bookId}/images/cover.png`;
    const object = await bucket.get(key);

    if (object) {
      const headers = new Headers();
      headers.set('Content-Type', object.httpMetadata?.contentType || 'image/png');
      headers.set('Cache-Control', 'public, max-age=86400');
      return new Response(object.body, { headers });
    }

    return c.json({
      error: 'Cover not found',
      expected: key,
      help: 'See docs/BOOKS_CONFORMITY_STANDARD.md'
    }, 404);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get book page image
// Get book page image
app.get('/api/books/:series/:bookId/pages/:pageNum', async (c) => {
  try {
    const series = c.req.param('series');
    const bookId = c.req.param('bookId');
    const pageNum = c.req.param('pageNum');
    const bucket = c.env.BOOKS_BUCKET;

    const paddedNum = pageNum.padStart(2, '0');
    // STRICT: Always books/{series}/{bookId}/images/page-XX.png
    const key = `books/${series}/${bookId}/images/page-${paddedNum}.png`;
    const object = await bucket.get(key);

    if (object) {
      const headers = new Headers();
      headers.set('Content-Type', object.httpMetadata?.contentType || 'image/png');
      headers.set('Cache-Control', 'public, max-age=86400');
      return new Response(object.body, { headers });
    }

    return c.json({
      error: 'Page not found',
      expected: key,
      help: 'See docs/BOOKS_CONFORMITY_STANDARD.md'
    }, 404);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Log reading session completion
app.post('/api/reading/complete', async (c) => {
  try {
    const user = requireAuth(c);
    const body = await c.req.json();
    const { series, bookId, childrenPresent, notes } = body;

    if (!series || !bookId) {
      return c.json({ error: 'Series and bookId are required' }, 400);
    }

    // Try to find the book with either simple bookId or series/bookId format
    const book = await c.env.DB.prepare(
      'SELECT id FROM books WHERE id = ? OR id = ?'
    ).bind(bookId, `${series}/${bookId}`).first<{ id: string }>();

    if (!book) {
      return c.json({
        error: 'Book not found',
        tried: [bookId, `${series}/${bookId}`],
        help: 'Ensure the book is seeded in the books table with a matching id'
      }, 404);
    }

    const sessionId = generateId('read');
    const childrenJson = childrenPresent ? JSON.stringify(childrenPresent) : null;

    await c.env.DB.prepare(`
      INSERT INTO reading_sessions (id, parent_id, book_id, children_present, notes, completed_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(sessionId, user.id, book.id, childrenJson, notes || null).run();

    const session = await c.env.DB.prepare(
      'SELECT * FROM reading_sessions WHERE id = ?'
    ).bind(sessionId).first();

    return c.json(session, 201);
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to log reading session' }, 400);
  }
});

// Get reading history
app.get('/api/reading/history', async (c) => {
  try {
    const user = requireAuth(c);
    const limit = c.req.query('limit') || '20';

    const { results } = await c.env.DB.prepare(`
      SELECT * FROM reading_sessions 
      WHERE parent_id = ? 
      ORDER BY completed_at DESC 
      LIMIT ?
    `).bind(user.id, parseInt(limit)).all();

    // Parse children_present JSON
    const sessions = results.map((session: any) => ({
      ...session,
      childrenPresent: session.children_present ? JSON.parse(session.children_present) : [],
    }));

    return c.json(sessions);
  } catch (error: any) {
    return c.json({ error: error.message || 'Unauthorized' }, 401);
  }
});

// Debug R2 endpoint
app.get('/api/debug/r2', async (c) => {
  const secret = c.req.query('key');
  if (secret !== 'DEBUG_SECRET') {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const bucket = c.env.BOOKS_BUCKET;
    const prefix = c.req.query('prefix');
    const delimiter = c.req.query('delimiter'); // optional override

    const listNoDelimiter = await bucket.list({ prefix });
    const listWithDelimiter = await bucket.list({ prefix, delimiter: delimiter || '/' });

    return c.json({
      prefix,
      delimiter: delimiter || '/',
      listNoDelimiter,
      listWithDelimiter
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Debug Book Audit
app.get('/api/debug/books/audit', async (c) => {
  // Protect
  const secret = c.req.query('key');
  if (secret !== 'DEBUG_SECRET') return c.json({ error: 'Unauthorized' }, 401);

  const bucket = c.env.BOOKS_BUCKET;
  const violations: any[] = [];
  let totalBooks = 0;
  let compliant = 0;

  try {
    // 1. List Series
    const roots = await bucket.list({ prefix: 'books/', delimiter: '/' });
    const seriesPrefixes = roots.delimitedPrefixes || [];

    for (const seriesPrefix of seriesPrefixes) {
      const seriesName = seriesPrefix.replace('books/', '').replace('/', '');
      if (!/^[a-z0-9_]+$/.test(seriesName)) {
        violations.push({ series: seriesName, issue: 'Series folder must be snake_case' });
      }

      // 2. List Books
      const books = await bucket.list({ prefix: seriesPrefix, delimiter: '/' });
      const bookPrefixes = books.delimitedPrefixes || [];

      for (const bookPrefix of bookPrefixes) {
        totalBooks++;
        const bookId = bookPrefix.replace(seriesPrefix, '').replace('/', '');
        const bookIssues: string[] = [];

        if (!/^[a-z0-9_]+$/.test(bookId)) {
          bookIssues.push('Book folder must be snake_case');
        }

        // 3. Check specific files
        const cover = await bucket.head(bookPrefix + 'images/cover.png');
        if (!cover) bookIssues.push('Missing images/cover.png');

        const metadata = await bucket.get(bookPrefix + 'metadata.json');
        if (!metadata) {
          bookIssues.push('Missing metadata.json');
        } else {
          const m = await metadata.json() as any;
          if (m.id !== bookId) bookIssues.push(`Metadata ID mismatch: ${m.id} != ${bookId}`);
        }

        if (bookIssues.length > 0) {
          violations.push({ series: seriesName, bookId, issues: bookIssues });
        } else {
          compliant++;
        }
      }
    }

    return c.json({
      totalBooks,
      compliant,
      nonCompliant: totalBooks - compliant,
      violations
    });

  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});


// ============ LITURGY ENDPOINTS ============

// GET /api/liturgy/today - Get today's liturgy items + completion status
app.get('/api/liturgy/today', async (c) => {
  const user = requireAuth(c);
  const today = new Date().toISOString().split('T')[0];

  // Get or create family settings
  let settings = await c.env.DB.prepare(
    'SELECT * FROM family_liturgy_settings WHERE parent_id = ?'
  ).bind(user.id).first();

  if (!settings) {
    const settingsId = generateId('fls');
    await c.env.DB.prepare(`
      INSERT INTO family_liturgy_settings (id, parent_id) VALUES (?, ?)
    `).bind(settingsId, user.id).run();
    settings = {
      id: settingsId,
      parent_id: user.id,
      catechism_enabled: 1,
      catechism_source: 'westminster_shorter',
      hymnal_enabled: 1,
      hymnal_source: 'classic_hymns',
      scripture_enabled: 1,
      bible_translation: 'esv',
      current_catechism_week: 1,
      current_hymn_week: 1,
      current_scripture_week: 1
    };
  }

  // Fetch current items based on week positions
  const items = [];

  if ((settings as any).catechism_enabled) {
    const catechism = await c.env.DB.prepare(`
      SELECT * FROM liturgy_items
      WHERE type = 'catechism' AND source = ? AND sequence_number = ? AND is_active = 1
    `).bind((settings as any).catechism_source, (settings as any).current_catechism_week).first();
    if (catechism) items.push({ ...catechism, itemType: 'catechism' });
  }

  if ((settings as any).hymnal_enabled) {
    const hymn = await c.env.DB.prepare(`
      SELECT * FROM liturgy_items
      WHERE type = 'hymn' AND source = ? AND sequence_number = ? AND is_active = 1
    `).bind((settings as any).hymnal_source, (settings as any).current_hymn_week).first();
    if (hymn) items.push({ ...hymn, itemType: 'hymn' });
  }

  if ((settings as any).scripture_enabled) {
    const scripture = await c.env.DB.prepare(`
      SELECT * FROM liturgy_items
      WHERE type = 'scripture' AND source = ? AND sequence_number = ? AND is_active = 1
    `).bind((settings as any).bible_translation, (settings as any).current_scripture_week).first();
    if (scripture) items.push({ ...scripture, itemType: 'scripture' });
  }

  // Get today's completions
  const completions = await c.env.DB.prepare(`
    SELECT liturgy_item_id FROM liturgy_completions
    WHERE parent_id = ? AND completed_date = ?
  `).bind(user.id, today).all();

  const completedIds = new Set(completions.results?.map((r: any) => r.liturgy_item_id) || []);

  // Convert settings integers to booleans
  let safeSettings = null;
  if (settings) {
    safeSettings = {
      ...settings,
      catechism_enabled: !!(settings as any).catechism_enabled,
      hymnal_enabled: !!(settings as any).hymnal_enabled,
      scripture_enabled: !!(settings as any).scripture_enabled,
    };
  }

  return c.json({
    date: today,
    settings: safeSettings,
    items: items.map((item: any) => ({
      ...item,
      completedToday: completedIds.has(item.id)
    }))
  });
});

// POST /api/liturgy/complete - Mark item as completed for today
app.post('/api/liturgy/complete', async (c) => {
  const user = requireAuth(c);
  const { itemId } = await c.req.json();
  const today = new Date().toISOString().split('T')[0];

  const completionId = generateId('lc');

  try {
    await c.env.DB.prepare(`
      INSERT INTO liturgy_completions (id, parent_id, liturgy_item_id, completed_date)
      VALUES (?, ?, ?, ?)
    `).bind(completionId, user.id, itemId, today).run();

    return c.json({ success: true, completionId });
  } catch (e: any) {
    // Already completed today (unique constraint)
    if (e.message?.includes('UNIQUE constraint')) {
      return c.json({ success: true, alreadyCompleted: true });
    }
    throw e;
  }
});

// POST /api/liturgy/uncomplete - Remove today's completion
app.post('/api/liturgy/uncomplete', async (c) => {
  const user = requireAuth(c);
  const { itemId } = await c.req.json();
  const today = new Date().toISOString().split('T')[0];

  await c.env.DB.prepare(`
    DELETE FROM liturgy_completions
    WHERE parent_id = ? AND liturgy_item_id = ? AND completed_date = ?
  `).bind(user.id, itemId, today).run();

  return c.json({ success: true });
});

// POST /api/liturgy/advance - Move to next week for a type
app.post('/api/liturgy/advance', async (c) => {
  const user = requireAuth(c);
  const { type } = await c.req.json(); // 'catechism' | 'hymn' | 'scripture'

  const columnMap: Record<string, string> = {
    catechism: 'current_catechism_week',
    hymn: 'current_hymn_week',
    scripture: 'current_scripture_week'
  };

  const column = columnMap[type];
  if (!column) {
    return c.json({ error: 'Invalid type' }, 400);
  }

  await c.env.DB.prepare(`
    UPDATE family_liturgy_settings
    SET ${column} = ${column} + 1, updated_at = datetime('now')
    WHERE parent_id = ?
  `).bind(user.id).run();

  return c.json({ success: true });
});

// GET /api/liturgy/settings - Get family liturgy settings
app.get('/api/liturgy/settings', async (c) => {
  const user = requireAuth(c);

  const settings = await c.env.DB.prepare(
    'SELECT * FROM family_liturgy_settings WHERE parent_id = ?'
  ).bind(user.id).first();

  if (!settings) return c.json(null);

  // Convert integers to booleans
  const safeSettings = {
    ...settings,
    catechism_enabled: !!(settings as any).catechism_enabled,
    hymnal_enabled: !!(settings as any).hymnal_enabled,
    scripture_enabled: !!(settings as any).scripture_enabled,
  };

  return c.json(safeSettings);
});

// PUT /api/liturgy/settings - Update family liturgy settings
app.put('/api/liturgy/settings', async (c) => {
  const user = requireAuth(c);
  const updates: any = await c.req.json();

  const allowedFields = [
    'catechism_enabled', 'catechism_source',
    'hymnal_enabled', 'hymnal_source',
    'scripture_enabled', 'bible_translation',
    'current_catechism_week', 'current_hymn_week', 'current_scripture_week'
  ];

  const validUpdates = Object.keys(updates).filter(k => allowedFields.includes(k));

  const setClause = validUpdates
    .map(k => `${k} = ?`)
    .join(', ');

  if (!setClause) {
    return c.json({ error: 'No valid fields to update' }, 400);
  }

  const values = validUpdates.map(k => {
    const val = updates[k];
    // Convert booleans to integers for SQLite
    if (typeof val === 'boolean') {
      return val ? 1 : 0;
    }
    return val;
  });

  await c.env.DB.prepare(`
    UPDATE family_liturgy_settings
    SET ${setClause}, updated_at = datetime('now')
    WHERE parent_id = ?
  `).bind(...values, user.id).run();

  return c.json({ success: true });
});

// ============ FEEDBACK ROUTES ============

// 1. Toggle Upvote
app.post('/api/upvotes', async (c) => {
  try {
    const user = requireAuth(c);
    const { contentType, contentId } = await c.req.json() as { contentType: 'activity' | 'book'; contentId: string };

    if (!['activity', 'book'].includes(contentType)) {
      return c.json({ error: 'Invalid content type' }, 400);
    }

    // Check if already upvoted
    const existing = await c.env.DB.prepare(
      'SELECT id FROM content_upvotes WHERE user_id = ? AND content_type = ? AND content_id = ?'
    ).bind(user.id, contentType, contentId).first();

    let upvoted = false;

    if (existing) {
      // Remove upvote
      await c.env.DB.prepare(
        'DELETE FROM content_upvotes WHERE id = ?'
      ).bind(existing.id).run();
      upvoted = false;
    } else {
      // Add upvote
      const id = generateId('vote');
      await c.env.DB.prepare(
        'INSERT INTO content_upvotes (id, user_id, content_type, content_id) VALUES (?, ?, ?, ?)'
      ).bind(id, user.id, contentType, contentId).run();
      upvoted = true;
    }

    // Update aggregated count
    // Note: This is a simple counter update. For high scale, we'd use a queue or periodically recalculate.
    const table = contentType === 'activity' ? 'activities' : 'books';
    const countResult = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM content_upvotes WHERE content_type = ? AND content_id = ?`
    ).bind(contentType, contentId).first<{ count: number }>();

    const newCount = countResult?.count || 0;

    await c.env.DB.prepare(
      `UPDATE ${table} SET upvote_count = ? WHERE id = ?`
    ).bind(newCount, contentId).run();

    return c.json({ upvoted, newCount });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 2. Check Upvote Status
app.get('/api/upvotes/check', async (c) => {
  try {
    const user = requireAuth(c);
    const contentType = c.req.query('contentType');
    const contentId = c.req.query('contentId');

    if (!contentType || !contentId) return c.json({ error: 'Missing params' }, 400);

    const existing = await c.env.DB.prepare(
      'SELECT 1 FROM content_upvotes WHERE user_id = ? AND content_type = ? AND content_id = ?'
    ).bind(user.id, contentType, contentId).first();

    return c.json({ upvoted: !!existing });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 3. List Comments
app.get('/api/comments', async (c) => {
  try {
    const contentType = c.req.query('contentType');
    const contentId = c.req.query('contentId');

    if (!contentType || !contentId) return c.json({ error: 'Missing params' }, 400);

    const { results } = await c.env.DB.prepare(`
      SELECT 
        c.id, c.user_id as userId, c.content_type, c.content_id, 
        c.comment_text as commentText, c.is_success_story as isSuccessStory, 
        c.created_at as createdAt,
        u.name as userName, u.avatar_url as userAvatar
      FROM parent_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.content_type = ? AND c.content_id = ?
      ORDER BY c.created_at DESC
    `).bind(contentType, contentId).all();

    return c.json({ comments: results, count: results.length });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 4. Add Comment
app.post('/api/comments', async (c) => {
  try {
    const user = requireAuth(c);
    const { contentType, contentId, text, isSuccessStory } = await c.req.json() as any;

    if (!text || !text.trim()) return c.json({ error: 'Comment required' }, 400);

    const id = generateId('comment');
    const now = new Date().toISOString();

    await c.env.DB.prepare(`
      INSERT INTO parent_comments (id, user_id, content_type, content_id, comment_text, is_success_story, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, user.id, contentType, contentId, text.trim(), isSuccessStory ? 1 : 0, now, now).run();

    // Update count
    const table = contentType === 'activity' ? 'activities' : 'books';
    const countResult = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM parent_comments WHERE content_type = ? AND content_id = ?`
    ).bind(contentType, contentId).first<{ count: number }>();

    const newCount = countResult?.count || 0;

    await c.env.DB.prepare(
      `UPDATE ${table} SET comment_count = ? WHERE id = ?`
    ).bind(newCount, contentId).run();

    const newComment = {
      id,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar_url,
      contentType,
      contentId,
      commentText: text.trim(),
      isSuccessStory: !!isSuccessStory,
      createdAt: now
    };

    return c.json({ comment: newComment });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 5. Delete Comment
app.delete('/api/comments/:id', async (c) => {
  try {
    const user = requireAuth(c);
    const commentId = c.req.param('id');

    // Verify ownership
    const comment = await c.env.DB.prepare(
      'SELECT * FROM parent_comments WHERE id = ?'
    ).bind(commentId).first<{ user_id: string, content_type: string, content_id: string }>();

    if (!comment) return c.json({ error: 'Not found' }, 404);
    if (comment.user_id !== user.id) return c.json({ error: 'Unauthorized' }, 403);

    await c.env.DB.prepare('DELETE FROM parent_comments WHERE id = ?').bind(commentId).run();

    // Update count
    const table = comment.content_type === 'activity' ? 'activities' : 'books';
    await c.env.DB.prepare(
      `UPDATE ${table} SET comment_count = (SELECT COUNT(*) FROM parent_comments WHERE content_type = ? AND content_id = ?) WHERE id = ?`
    ).bind(comment.content_type, comment.content_id, comment.content_id).run();

    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// ============================================
// PHASE 2: PARENT OVERRIDES API
// ============================================

// Get all overrides for current user
app.get('/api/overrides', async (c) => {
  try {
    const user = requireAuth(c);
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM parent_overrides WHERE parent_id = ? AND is_active = 1 ORDER BY created_at DESC'
    ).bind(user.id).all();

    const overrides = results.map((r: any) => ({
      ...r,
      constraints: JSON.parse(r.constraints_json || '{}')
    }));

    return c.json(overrides);
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// Create a new override
app.post('/api/overrides', async (c) => {
  try {
    const user = requireAuth(c);
    const { studentId, overrideType, description, constraints } = await c.req.json();

    if (!overrideType || !description || !constraints) {
      return c.json({ error: 'overrideType, description, and constraints are required' }, 400);
    }

    const id = generateId('override');
    await c.env.DB.prepare(`
      INSERT INTO parent_overrides (id, parent_id, student_id, override_type, description, constraints_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(id, user.id, studentId || null, overrideType, description, JSON.stringify(constraints)).run();

    const override = await c.env.DB.prepare(
      'SELECT * FROM parent_overrides WHERE id = ?'
    ).bind(id).first();

    return c.json({
      ...override,
      constraints: JSON.parse((override as any)?.constraints_json || '{}')
    }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Update an override
app.put('/api/overrides/:id', async (c) => {
  try {
    const user = requireAuth(c);
    const overrideId = c.req.param('id');
    const { isActive, constraints } = await c.req.json();

    // Verify ownership
    const existing = await c.env.DB.prepare(
      'SELECT * FROM parent_overrides WHERE id = ? AND parent_id = ?'
    ).bind(overrideId, user.id).first();

    if (!existing) return c.json({ error: 'Override not found' }, 404);

    await c.env.DB.prepare(`
      UPDATE parent_overrides 
      SET is_active = COALESCE(?, is_active),
          constraints_json = COALESCE(?, constraints_json),
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      isActive !== undefined ? (isActive ? 1 : 0) : null,
      constraints ? JSON.stringify(constraints) : null,
      overrideId
    ).run();

    const updated = await c.env.DB.prepare(
      'SELECT * FROM parent_overrides WHERE id = ?'
    ).bind(overrideId).first();

    return c.json({
      ...updated,
      constraints: JSON.parse((updated as any)?.constraints_json || '{}')
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Delete an override
app.delete('/api/overrides/:id', async (c) => {
  try {
    const user = requireAuth(c);
    const overrideId = c.req.param('id');

    const existing = await c.env.DB.prepare(
      'SELECT * FROM parent_overrides WHERE id = ? AND parent_id = ?'
    ).bind(overrideId, user.id).first();

    if (!existing) return c.json({ error: 'Override not found' }, 404);

    await c.env.DB.prepare('DELETE FROM parent_overrides WHERE id = ?').bind(overrideId).run();

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// WEEKLY TIME MODEL API
// ============================================

// Get time model for current user
app.get('/api/time-model', async (c) => {
  try {
    const user = requireAuth(c);
    let model = await c.env.DB.prepare(
      'SELECT * FROM weekly_time_model WHERE parent_id = ?'
    ).bind(user.id).first();

    if (!model) {
      // Return defaults if not set
      model = {
        available_days: '["Mon","Tue","Wed","Thu","Fri"]',
        minutes_per_day: 45,
        preferred_times: '["morning"]',
        max_sessions_per_day: 2,
        field_trip_days: '[]'
      };
    }

    return c.json({
      ...model,
      availableDays: JSON.parse((model as any).available_days),
      preferredTimes: JSON.parse((model as any).preferred_times),
      fieldTripDays: JSON.parse((model as any).field_trip_days || '[]')
    });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// Update time model
app.put('/api/time-model', async (c) => {
  try {
    const user = requireAuth(c);
    const { availableDays, minutesPerDay, preferredTimes, maxSessionsPerDay, fieldTripDays } = await c.req.json();

    // Upsert
    const existing = await c.env.DB.prepare(
      'SELECT id FROM weekly_time_model WHERE parent_id = ?'
    ).bind(user.id).first();

    if (existing) {
      await c.env.DB.prepare(`
        UPDATE weekly_time_model SET
          available_days = COALESCE(?, available_days),
          minutes_per_day = COALESCE(?, minutes_per_day),
          preferred_times = COALESCE(?, preferred_times),
          max_sessions_per_day = COALESCE(?, max_sessions_per_day),
          field_trip_days = COALESCE(?, field_trip_days),
          updated_at = datetime('now')
        WHERE parent_id = ?
      `).bind(
        availableDays ? JSON.stringify(availableDays) : null,
        minutesPerDay || null,
        preferredTimes ? JSON.stringify(preferredTimes) : null,
        maxSessionsPerDay || null,
        fieldTripDays ? JSON.stringify(fieldTripDays) : null,
        user.id
      ).run();
    } else {
      const id = generateId('tm');
      await c.env.DB.prepare(`
        INSERT INTO weekly_time_model (id, parent_id, available_days, minutes_per_day, preferred_times, max_sessions_per_day, field_trip_days)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        user.id,
        JSON.stringify(availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
        minutesPerDay || 45,
        JSON.stringify(preferredTimes || ['morning']),
        maxSessionsPerDay || 2,
        JSON.stringify(fieldTripDays || [])
      ).run();
    }

    const model = await c.env.DB.prepare(
      'SELECT * FROM weekly_time_model WHERE parent_id = ?'
    ).bind(user.id).first();

    return c.json({
      ...model,
      availableDays: JSON.parse((model as any).available_days),
      preferredTimes: JSON.parse((model as any).preferred_times),
      fieldTripDays: JSON.parse((model as any).field_trip_days || '[]')
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// PHASE 5: DETERMINISTIC WEEKLY PLANNER
// ============================================

// Import moved to top of file

// Get or generate weekly plan
app.get('/api/family/weekly-plan', async (c) => {
  try {
    const user = requireAuth(c);
    const weekStart = c.req.query('weekStart') || getSmartWeekStart();

    // Get children
    const { results: children } = await c.env.DB.prepare(
      'SELECT id, name, age_in_months FROM students WHERE parent_id = ? ORDER BY age_in_months DESC'
    ).bind(user.id).all();

    if (children.length === 0) {
      return c.json({ error: 'No children found. Add a child first.' }, 400);
    }

    // Fetch completions for this week
    const weekEndDate = new Date(weekStart);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    const weekEnd = weekEndDate.toISOString().split('T')[0];

    const completionsResult = await c.env.DB.prepare(`
        SELECT activity_id, completed_at, 'completion' as type FROM activity_completions
        WHERE parent_id = ? AND date(completed_at) >= ? AND date(completed_at) <= ?
        UNION
        SELECT activity_id, completed_at, 'observation' as type FROM observations
        WHERE student_id IN (SELECT id FROM students WHERE parent_id = ?) AND date(completed_at) >= ? AND date(completed_at) <= ?
    `).bind(user.id, weekStart, weekEnd, user.id, weekStart, weekEnd).all();

    const completions: Record<string, any> = {};
    if (completionsResult.results) {
        completionsResult.results.forEach((r: any) => {
            completions[r.activity_id] = {
                completedAt: r.completed_at,
                type: r.type
            };
        });
    }

    // Check for cached plan
    const cachedPlan = await c.env.DB.prepare(
      'SELECT * FROM weekly_plans WHERE parent_id = ? AND week_start = ?'
    ).bind(user.id, weekStart).first();

    if (cachedPlan) {
      return c.json({
        ...cachedPlan,
        plan: JSON.parse((cachedPlan as any).plan_json),
        cached: true,
        completions
      });
    }

    // Get time model
    const timeModelRow = await c.env.DB.prepare(
      'SELECT * FROM weekly_time_model WHERE parent_id = ?'
    ).bind(user.id).first();

    const timeModel = timeModelRow ? {
      available_days: JSON.parse((timeModelRow as any).available_days),
      minutes_per_day: (timeModelRow as any).minutes_per_day,
      preferred_times: JSON.parse((timeModelRow as any).preferred_times),
      max_sessions_per_day: (timeModelRow as any).max_sessions_per_day,
      field_trip_days: JSON.parse((timeModelRow as any).field_trip_days || '[]')
    } : {
      available_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      minutes_per_day: 45,
      preferred_times: ['morning'],
      max_sessions_per_day: 2,
      field_trip_days: []
    };

    // Get overrides
    const { results: overrideRows } = await c.env.DB.prepare(
      'SELECT * FROM parent_overrides WHERE parent_id = ? AND is_active = 1'
    ).bind(user.id).all();

    // Get activities
    const ages = children.map((c: any) => c.age_in_months);
    const youngestAge = Math.min(...ages);
    const oldestAge = Math.max(...ages);

    const { results: activities } = await c.env.DB.prepare(`
      SELECT id, title, domain, min_age_months, max_age_months, duration_minutes, 
             materials, cluster_tag, mess_level, activity_type, primary_tier
      FROM activities 
      WHERE min_age_months <= ? AND max_age_months >= ?
        AND is_active = 1
        AND (is_archived = 0 OR is_archived IS NULL)
        AND (content_status != 'blacklisted' OR content_status IS NULL)
    `).bind(oldestAge, youngestAge).all();

    // Parse materials
    const parsedActivities = activities.map((a: any) => ({
      ...a,
      materials: JSON.parse(a.materials || '[]')
    }));

    // Get recent activity IDs (last 14 days) - NOT needed for Unified Planner if using scoreActivity which checks DB
    // But we still pass it for compatibility or maybe optimization?
    // Actually, unified planner uses scoreActivity which queries history directly.
    // So we can pass empty list or update planner to not need it.
    // Let's pass empty list as we updated scoreActivity.
    const recentActivityIds: string[] = [];

    // Generate plan
    const plan = await generateWeeklyPlan(
      children as any,
      parsedActivities as any,
      timeModel,
      overrideRows as any,
      c.env.DB,
      user.id
    );

    // Cache the plan
    const planId = generateId('plan');
    await c.env.DB.prepare(`
      INSERT INTO weekly_plans (id, parent_id, week_start, plan_json, override_version)
      VALUES (?, ?, ?, ?, 1)
    `).bind(planId, user.id, weekStart, JSON.stringify(plan)).run();

    return c.json({
      id: planId,
      weekStart,
      plan,
      cached: false,
      completions
    });
  } catch (error: any) {
    console.error('Weekly plan error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// Regenerate weekly plan (clears cache)
app.post('/api/family/weekly-plan/regenerate', async (c) => {
  try {
    const user = requireAuth(c);
    const { balancePreference = 'mixed', weekStart } = await c.req.json();

    // Validate weekStart (must be a Monday, cannot be in the past unless same week)
    const targetWeek = weekStart || getSmartWeekStart();

    // Note: To properly support balancePreference, we would need to pass it to generateWeeklyPlan
    // For now, we are just storing it.
    // TODO: Update generateWeeklyPlan to accept balancePreference and use it in scoring

    // Delete cached plan
    await c.env.DB.prepare(
      'DELETE FROM weekly_plans WHERE parent_id = ? AND week_start = ?'
    ).bind(user.id, targetWeek).run();

    // We can't redirect with POST body params easily if the GET doesn't take them.
    // The previous implementation redirected to GET.
    // But now we want to apply balancePreference which implies we should generate it here.

    // Let's replicate generation logic here OR update the GET endpoint to accept preferences (but GET shouldn't have side effects usually, though this one does generate/cache).

    // Ideally, we just delete the old plan and call the generation logic directly.

    // Get children
    const { results: children } = await c.env.DB.prepare(
      'SELECT id, name, age_in_months FROM students WHERE parent_id = ? ORDER BY age_in_months DESC'
    ).bind(user.id).all();

    if (children.length === 0) {
      return c.json({ error: 'No children found. Add a child first.' }, 400);
    }

    // Get time model
    const timeModelRow = await c.env.DB.prepare(
      'SELECT * FROM weekly_time_model WHERE parent_id = ?'
    ).bind(user.id).first();

    const timeModel = timeModelRow ? {
      available_days: JSON.parse((timeModelRow as any).available_days),
      minutes_per_day: (timeModelRow as any).minutes_per_day,
      preferred_times: JSON.parse((timeModelRow as any).preferred_times),
      max_sessions_per_day: (timeModelRow as any).max_sessions_per_day,
      field_trip_days: JSON.parse((timeModelRow as any).field_trip_days || '[]')
    } : {
      available_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      minutes_per_day: 45,
      preferred_times: ['morning'],
      max_sessions_per_day: 2,
      field_trip_days: []
    };

    // Get overrides
    const { results: overrideRows } = await c.env.DB.prepare(
      'SELECT * FROM parent_overrides WHERE parent_id = ? AND is_active = 1'
    ).bind(user.id).all();

    // Get activities
    const ages = children.map((c: any) => c.age_in_months);
    const youngestAge = Math.min(...ages);
    const oldestAge = Math.max(...ages);

    const { results: activities } = await c.env.DB.prepare(`
      SELECT id, title, domain, min_age_months, max_age_months, duration_minutes,
             materials, cluster_tag, mess_level, activity_type, primary_tier
      FROM activities
      WHERE min_age_months <= ? AND max_age_months >= ?
        AND is_active = 1
        AND (is_archived = 0 OR is_archived IS NULL)
        AND (content_status != 'blacklisted' OR content_status IS NULL)
    `).bind(oldestAge, youngestAge).all();

    // Parse materials
    const parsedActivities = activities.map((a: any) => ({
      ...a,
      materials: JSON.parse(a.materials || '[]')
    }));

    // Generate plan
    const plan = await generateWeeklyPlan(
      children as any,
      parsedActivities as any,
      timeModel,
      overrideRows as any,
      c.env.DB,
      user.id
    );

    const planId = generateId('plan');
    const tierDistJson = '{}'; // Placeholder, actual distribution calculation logic needed if we want to store it

    await c.env.DB.prepare(`
      INSERT INTO weekly_plans (id, parent_id, week_start, plan_json, balance_preference, tier_distribution)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(parent_id, week_start) DO UPDATE SET
        plan_json = excluded.plan_json,
        balance_preference = excluded.balance_preference,
        tier_distribution = excluded.tier_distribution,
        generated_at = datetime('now')
    `).bind(planId, user.id, targetWeek, JSON.stringify(plan), balancePreference, tierDistJson).run();

    // Fetch completions for this week
    const weekEndDate = new Date(targetWeek);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    const weekEnd = weekEndDate.toISOString().split('T')[0];

    const completionsResult = await c.env.DB.prepare(`
        SELECT activity_id, completed_at, 'completion' as type FROM activity_completions
        WHERE parent_id = ? AND date(completed_at) >= ? AND date(completed_at) <= ?
        UNION
        SELECT activity_id, completed_at, 'observation' as type FROM observations
        WHERE student_id IN (SELECT id FROM students WHERE parent_id = ?) AND date(completed_at) >= ? AND date(completed_at) <= ?
    `).bind(user.id, targetWeek, weekEnd, user.id, targetWeek, weekEnd).all();

    const completions: Record<string, any> = {};
    if (completionsResult.results) {
        completionsResult.results.forEach((r: any) => {
            completions[r.activity_id] = {
                completedAt: r.completed_at,
                type: r.type
            };
        });
    }

    return c.json({
        id: planId,
        weekStart: targetWeek,
        plan,
        cached: false,
        completions
    });

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// PHASE 3: AI INPUT NORMALIZATION
// ============================================

// Parse free-text parent input into structured override
app.post('/api/overrides/parse', async (c) => {
  try {
    const user = requireAuth(c);
    const { freeText, studentId } = await c.req.json();

    if (!freeText || typeof freeText !== 'string') {
      return c.json({ error: 'freeText is required' }, 400);
    }

    const systemPrompt = `You are a helper that converts parent descriptions of their child's needs into a structured JSON format.

You may ONLY output valid JSON matching this schema:
{
  "overrideType": "sensory" | "motor" | "schedule" | "content" | "pacing",
  "constraints": {
    "exclude_tags": ["list of activity types to avoid"],
    "exclude_materials": ["specific materials to avoid"],
    "prefer_tags": ["activity types to prioritize"],
    "prefer_domains": ["domains to emphasize"],
    "reduce_duration": boolean,
    "require_quiet": boolean,
    "require_low_mess": boolean,
    "require_outdoor": boolean,
    "require_seated": boolean,
    "custom_note": "any additional context"
  },
  "confidence": 0.0-1.0,
  "clarification_needed": "question to ask if unclear" or null
}

Common mappings:
- "loud sounds" / "noise sensitive" → require_quiet: true
- "struggles with sitting still" / "high energy" → exclude_tags: ["seated"], prefer_tags: ["outdoor", "movement"]
- "gets overwhelmed easily" → require_quiet: true, reduce_duration: true
- "messy activities are hard" / "hates mess" → require_low_mess: true
- "loves being outside" → require_outdoor: true
- "needs movement breaks" → reduce_duration: true
- "sensory issues with textures" → exclude_materials: ["playdough", "slime", "paint"]
- "speech delay" → prefer_domains: ["language"]
- "very active" → prefer_tags: ["movement", "outdoor"], exclude_tags: ["seated"]

Be conservative. Only include constraints you are confident about.
If unsure, set confidence < 0.7 and provide a clarifying question.
Do NOT invent constraints not supported by the input.`;

    try {
      const response = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: freeText }
        ],
        max_tokens: 500
      });

      // Extract JSON from response (may have markdown code blocks)
      let jsonStr = response.response;
      const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/) ||
        jsonStr.match(/```\s*([\s\S]*?)\s*```/) ||
        [null, jsonStr];
      jsonStr = jsonMatch[1] || jsonStr;

      const parsed = JSON.parse(jsonStr.trim());

      return c.json({
        success: true,
        originalText: freeText,
        parsed,
        requiresConfirmation: parsed.confidence < 0.7 || !!parsed.clarification_needed
      });
    } catch (parseError) {
      console.error('AI parse error:', parseError);
      // Fallback: return a generic response asking for more details
      return c.json({
        success: false,
        originalText: freeText,
        parsed: null,
        requiresConfirmation: true,
        fallbackMessage: "I couldn't fully understand that. Could you describe your child's needs in simpler terms? For example: 'My child is sensitive to loud sounds' or 'She needs lots of movement.'"
      });
    }
  } catch (error: any) {
    console.error('Override parse error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// ============================================
// PHASE 4: VECTORIZE CURRICULUM EXPLANATIONS
// ============================================

// Explain curriculum decisions using RAG
app.post('/api/explain', async (c) => {
  try {
    const user = requireAuth(c);
    const { question, context } = await c.req.json();

    if (!question || typeof question !== 'string') {
      return c.json({ error: 'question is required' }, 400);
    }

    // Generate embedding for the question
    let contextDocs = '';
    let sources: string[] = [];

    try {
      const embeddingResult = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', {
        text: question
      });

      // Query Vectorize for relevant curriculum docs
      const matches = await c.env.CURRICULUM_INDEX.query(embeddingResult.data[0], {
        topK: 3,
        returnMetadata: true
      });

      sources = matches.matches?.map((m: any) => m.id) || [];
      contextDocs = matches.matches
        ?.map((m: any) => m.metadata?.content || '')
        .filter(Boolean)
        .join('\n\n') || '';
    } catch (vectorError) {
      console.log('Vectorize query failed (index may be empty):', vectorError);
      // Continue without vector context - will use fallback
    }

    // Build system prompt
    const systemPrompt = `You are SchoolOS, a Christian homeschool planning assistant built on Reformed principles.
You answer questions about why certain activities are recommended for children.

${contextDocs ? `Use the following curriculum context to inform your answer:
---
${contextDocs}
---` : ''}

Guidelines:
- Speak with warmth and encouragement to parents
- Reference biblical principles when relevant (stewardship, dominion, wisdom)
- Be practical and specific
- If you don't have information about something, say so honestly
- Never invent curriculum content or developmental claims
- Keep answers concise (2-3 paragraphs max)

${context?.activityId ? `The parent is asking about activity ID: ${context.activityId}` : ''}
${context?.domain ? `Context domain: ${context.domain}` : ''}
${context?.childAge ? `Child's age: ${context.childAge} months` : ''}`;

    const response = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      max_tokens: 600
    });

    // Log for transparency
    const logId = generateId('explainlog');
    await c.env.DB.prepare(`
      INSERT INTO explanation_logs (id, parent_id, question, answer, sources_json)
      VALUES (?, ?, ?, ?, ?)
    `).bind(logId, user.id, question, response.response, JSON.stringify(sources)).run();

    return c.json({
      answer: response.response,
      sources,
      confidence: sources.length > 0 ? 0.8 : 0.5
    });
  } catch (error: any) {
    console.error('Explain error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// Narrate a weekly plan in human-friendly language
app.post('/api/plan/narrate', async (c) => {
  try {
    const user = requireAuth(c);
    const { plan, tone = 'encouraging' } = await c.req.json();

    if (!plan) {
      return c.json({ error: 'plan is required' }, 400);
    }

    const toneInstructions: Record<string, string> = {
      'encouraging': 'Be warm, positive, and motivating. Celebrate what the family will accomplish.',
      'calm': 'Be gentle and reassuring. Emphasize that flexibility is okay.',
      'concise': 'Be brief and practical. Focus on actionable steps only.'
    };

    const systemPrompt = `You are SchoolOS, helping a homeschooling parent understand their weekly learning plan.
Convert this structured plan into a warm, encouraging narrative.

Tone: ${toneInstructions[tone] || toneInstructions['encouraging']}

Rules:
- Do NOT invent activities or change the plan
- Do NOT add activities not in the plan
- Focus on practical tips for implementation
- Reference the specific days and activities
- Keep it to 2-3 short paragraphs
- End with an encouraging note`;

    const response = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(plan, null, 2) }
      ],
      max_tokens: 500
    });

    return c.json({
      narrative: response.response,
      originalPlan: plan
    });
  } catch (error: any) {
    console.error('Narrate error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// ============================================
// PHASE 1: PORTFOLIO STORAGE
// ============================================

// Get upload URL for portfolio item
app.post('/api/portfolio/upload', async (c) => {
  try {
    const user = requireAuth(c);
    const { filename, contentType } = await c.req.json();

    if (!filename || !contentType) {
      return c.json({ error: 'filename and contentType required' }, 400);
    }

    const key = `${user.id}/${Date.now()}-${filename}`;

    // In a real R2 setup, we would generate a presigned URL here.
    // Since we are using R2 bindings directly in the worker for now,
    // we might need a different approach for direct uploads from frontend.
    // For MVP, we can proxy the upload or use a PUT endpoint.

    // However, the standard R2 way is presigned URLs.
    // Cloudflare Workers with R2 bindings don't support `getSignedUrl` directly on the binding object easily without AWS SDK.
    // For simplicity in this environment, we will use a PUT endpoint on the worker itself to handle the upload.

    // Use current worker origin for upload handler
    const baseUrl = new URL(c.req.url).origin;

    return c.json({
      uploadUrl: `${baseUrl}/api/portfolio/upload-handler?key=${encodeURIComponent(key)}`,
      key,
      publicUrl: `/api/portfolio/file/${encodeURIComponent(key)}`
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Handle direct upload (MVP alternative to presigned URLs)
app.put('/api/portfolio/upload-handler', async (c) => {
  try {
    const user = requireAuth(c);
    const key = c.req.query('key');

    if (!key || !key.startsWith(user.id)) {
      return c.json({ error: 'Invalid key or unauthorized' }, 403);
    }

    const body = await c.req.arrayBuffer();

    // We reuse the BOOKS_BUCKET for now or should add a separate bucket binding
    // Ideally we add PORTFOLIO_BUCKET to Env
    // For now, let's assume BOOKS_BUCKET or we need to add it to wrangler.toml
    // Using BOOKS_BUCKET for now as "storage" bucket
    await c.env.BOOKS_BUCKET.put(`portfolio/${key}`, body);

    return c.json({ success: true, key: `portfolio/${key}` });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Create portfolio item record
app.post('/api/portfolio/items', async (c) => {
  try {
    const user = requireAuth(c);
    const body = await c.req.json();
    const { studentId, title, description, itemType, r2Key, domain, relatedActivityId } = body;

    if (!studentId || !title || !itemType) {
      return c.json({ error: 'studentId, title, and itemType are required' }, 400);
    }

    const id = generateId('port');
    await c.env.DB.prepare(`
      INSERT INTO portfolio_items (id, student_id, parent_id, title, description, item_type, r2_key, domain, related_activity_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, studentId, user.id, title, description, itemType, r2Key, domain, relatedActivityId).run();

    return c.json({ id, success: true }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// List portfolio items
app.get('/api/portfolio/:studentId', async (c) => {
  try {
    const user = requireAuth(c);
    const studentId = c.req.param('studentId');
    const domain = c.req.query('domain');

    let query = 'SELECT * FROM portfolio_items WHERE student_id = ? AND parent_id = ?';
    const params: any[] = [studentId, user.id];

    if (domain) {
      query += ' AND domain = ?';
      params.push(domain);
    }

    query += ' ORDER BY created_at DESC';

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    // Map results to include public URLs
    const items = results.map((item: any) => ({
      ...item,
      // If r2_key exists, generate a view URL (this would be a proxied endpoint)
      publicUrl: item.r2_key ? `/api/portfolio/file/${encodeURIComponent(item.r2_key)}` : null
    }));

    return c.json(items);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Serve portfolio file
app.get('/api/portfolio/file/:key', async (c) => {
  try {
    const user = requireAuth(c);
    const key = c.req.param('key'); // Should include 'portfolio/' prefix if we added it

    // Check ownership by ensuring the key contains the user ID (part of the path strategy)
    // The key structure we defined is `portfolio/USER_ID/filename`
    // So we check if key contains user.id
    if (!key.includes(user.id)) {
       return c.json({ error: 'Unauthorized access to file' }, 403);
    }

    const object = await c.env.BOOKS_BUCKET.get(key);

    if (!object) {
      return c.json({ error: 'File not found' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    return new Response(object.body, {
      headers,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Delete portfolio item
app.delete('/api/portfolio/:itemId', async (c) => {
  try {
    const user = requireAuth(c);
    const itemId = c.req.param('itemId');

    const item = await c.env.DB.prepare(
      'SELECT * FROM portfolio_items WHERE id = ? AND parent_id = ?'
    ).bind(itemId, user.id).first();

    if (!item) return c.json({ error: 'Item not found' }, 404);

    // Delete from R2 if key exists
    if ((item as any).r2_key) {
      await c.env.BOOKS_BUCKET.delete((item as any).r2_key);
    }

    // Delete from DB
    await c.env.DB.prepare('DELETE FROM portfolio_items WHERE id = ?').bind(itemId).run();

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default app;
