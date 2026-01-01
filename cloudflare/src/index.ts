// SchoolOS Cloudflare Worker API
// Uses Hono for routing, D1 for database, JWT for auth

import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Types
interface Env {
  DB: D1Database;
  BOOKS_BUCKET: R2Bucket;
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

// Get today's recommended activities for a student
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

// Helper: Get family-first daily recommendations
async function getFamilyDailyRecommendations(db: D1Database, children: any[], parentId: string) {
  const today = new Date().toISOString().split('T')[0];

  if (children.length === 0) return [];

  // Get all children's ages
  const ages = children.map(c => c.age_in_months);
  const youngestAge = Math.min(...ages);
  const oldestAge = Math.max(...ages);

  // Get parent's material preferences
  const { results: materialPrefs } = await db.prepare(`
    SELECT material_name, status FROM family_materials WHERE parent_id = ?
  `).bind(parentId).all();

  const haveMaterials = new Set(
    materialPrefs
      .filter((m: any) => m.status === 'have' || m.status === 'willing_to_buy')
      .map((m: any) => m.material_name.toLowerCase())
  );

  // Find family sessions that:
  // 1. Cover all children's age ranges
  // 2. Have tiered expectations
  // 3. Prioritize core kit activities
  // 4. Prioritize materials parent has/will buy
  // 5. Prefer low mess, quick setup
  const { results: candidates } = await db.prepare(`
    SELECT * FROM activities 
    WHERE activity_type = 'family_session'
      AND min_age_months <= ? 
      AND max_age_months >= ?
      AND tiered_expectations IS NOT NULL
      AND is_active = 1
      AND (is_archived = 0 OR is_archived IS NULL)
      AND (content_status != 'blacklisted' OR content_status IS NULL)
    ORDER BY 
      uses_core_kit DESC,
      mess_level ASC,
      prep_time_minutes ASC,
      RANDOM()
    LIMIT 10
  `).bind(youngestAge, oldestAge).all();

  // Score and select top 2-3 sessions
  // Prioritize activities where parent has materials
  const scored = candidates.map((activity: any) => {
    const materials = JSON.parse(activity.materials || '[]');
    const matchCount = materials.filter((m: string) => haveMaterials.has(m.toLowerCase())).length;
    const matchRatio = materials.length > 0 ? matchCount / materials.length : 1;
    return { activity, score: matchRatio };
  }).sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map(s => s.activity);
}

// Get family dashboard data
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

    // Get ages for Infancy Mode check
    const ages = children.map((c: any) => c.age_in_months);
    const youngestAge = Math.min(...ages);
    const isInfancyMode = youngestAge <= 12;

    let familySessions: any[] = [];
    let materialsList: any[] = [];

    if (isInfancyMode) {
      // Infancy Mode: Return Daily Practices instead of generic family sessions
      const { results: practices } = await c.env.DB.prepare(`
        SELECT * FROM activities 
        WHERE activity_type = 'daily_practice'
        ORDER BY RANDOM() LIMIT 3
      `).all();

      familySessions = practices.map((activity: any) => ({
        activity: {
          ...activity,
          materials: JSON.parse((activity as any).materials || '[]'),
          instructions: JSON.parse((activity as any).instructions || '[]'),
          learning_outcomes: JSON.parse((activity as any).learning_outcomes || '[]'),
        },
        childTiers: children.map((c: any) => ({
          childId: c.id,
          childName: c.name,
          tier: 'Infant',
          expectation: 'Gentle participation',
          childAge: c.age_in_months
        })),
        messLevel: 'none',
        prepMinutes: 0,
        materialsAvailable: true,
        reasoning: "Selected for gentle interaction and bonding."
      }));

      // No complicated materials logic for infancy mode usually

    } else {
      // Standard Family Mode
      const recommendedActivities = await getFamilyDailyRecommendations(c.env.DB, children, user.id);

      familySessions = recommendedActivities.map((activity: any) => {
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

        // Determine domain label for reasoning
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
          materialsAvailable: true,
          reasoning: `Because you have ${activity.duration_minutes} minutes and your children are developing ${domainName}, we selected '${activity.title}' to work on both.`
        };
      });

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

    const sessionId = generateId('read');
    const childrenJson = childrenPresent ? JSON.stringify(childrenPresent) : null;

    await c.env.DB.prepare(`
      INSERT INTO reading_sessions (id, parent_id, book_id, children_present, notes, completed_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(sessionId, user.id, `${series}/${bookId}`, childrenJson, notes || null).run();

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

export default app;
