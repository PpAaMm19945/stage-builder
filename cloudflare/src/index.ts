// SchoolOS Cloudflare Worker API
// Uses Hono for routing, D1 for database, JWT for auth

import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Types
interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  ENVIRONMENT: string;
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
  } catch {
    return c.json({ user: null, children: [] }, 401);
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
  } catch {
    return c.json({ error: 'Unauthorized' }, 401);
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

  let query = 'SELECT * FROM activities WHERE is_active = 1';
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
    return c.json({ error: error.message || 'Unauthorized' }, 401);
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

    // Get Unified Family Sessions
    const recommendedActivities = await getFamilyDailyRecommendations(c.env.DB, children, user.id);

    // Process sessions with child-specific tiers
    const familySessions = recommendedActivities.map((activity: any) => {
      const tiers = JSON.parse(activity.tiered_expectations || '[]');
      const childTiers = children.map((child: any) => {
        // Find appropriate tier for child's age
        const age = child.age_in_months;
        // Find tier where age is within range, or closest
        let tier = tiers.find((t: any) => age >= t.age_min && age <= t.age_max);

        // Fallback to closest if out of specific ranges (capped at min/max tiers)
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

      // Check materials availability
      const materials = JSON.parse(activity.materials || '[]');
      // We would ideally check against DB here again or pass it down, 
      // but for now we'll fetch in frontend or assume partially available based on scoring

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
        materialsAvailable: true // Simplified for now, computed in frontend or detailed query
      };
    });

    // Collect all materials needed today
    const neededMaterials = new Set<string>();
    familySessions.forEach((session: any) => {
      session.activity.materials.forEach((m: string) => neededMaterials.add(m));
    });

    // Get status of these materials
    const materialsList: any[] = [];
    if (neededMaterials.size > 0) {
      // Fetch statuses
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
    return c.json({ error: error.message || 'Unauthorized' }, 401);
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
    return c.json(results);
  } catch (error: any) {
    return c.json({ error: error.message || 'Unauthorized' }, 401);
  }
});

// Update family materials
app.put('/api/family/materials', async (c) => {
  try {
    const user = requireAuth(c);
    const body = await c.req.json();
    const { materials } = body; // Array of { name, status }

    if (!Array.isArray(materials)) {
      return c.json({ error: 'Invalid format' }, 400);
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
    return c.json({ error: error.message || 'Failed to update materials' }, 400);
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
    const { studentId, activityId, masteryLevel, parentNotes } = body;

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

    const observationId = generateId('obs');

    await c.env.DB.prepare(
      'INSERT INTO observations (id, student_id, activity_id, mastery_level, parent_notes) VALUES (?, ?, ?, ?, ?)'
    ).bind(observationId, studentId, activityId, masteryLevel, parentNotes || null).run();

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

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
