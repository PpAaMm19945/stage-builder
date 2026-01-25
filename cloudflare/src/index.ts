// FamilyPath Cloudflare Worker API
// Uses Hono for routing, D1 for database, JWT for auth

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

import { PdfService } from './services/pdf-service';
import { handleArchiveExport, handleSignedDownload } from './export';
import { Env, User, BookMetadata, JWTPayload } from './types';
import { escapeHtml, isValidPathSegment, safeCompare } from './lib/security';
import { signJWT, verifyJWT } from './lib/auth';
import { requireAuth, requireParent, requireHouseholdMember } from './lib/middleware';
import { generateId, generateInviteCode } from './lib/utils';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import familyRoutes from './routes/family';
import curriculumRoutes from './routes/curriculum';
import workRoutes from './routes/work';
import analyticsRoutes from './routes/analytics';
import exportRoutes from './routes/export';
import reportsRoutes from './routes/reports';
import adminRoutes from './routes/admin';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null; nonce: string } }>();

// Security Headers
app.use('*', async (c, next) => {
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
});



app.get('/', async (c) => {
  return c.text('FamilyPath API');
});

// CORS middleware - allows Cloudflare Pages and Lovable preview
app.use('*', cors({
  origin: (origin, c) => {
    const frontendUrl = c.env.FRONTEND_URL || 'https://stage-builder-9hh.pages.dev';
    const allowedOrigins = [
      frontendUrl,
      'https://stage-builder-9hh.pages.dev',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8080',
    ];
    // Also allow any lovable.app or lovableproject.com subdomain
    if (origin && (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.lovable.app') ||
      origin.endsWith('.lovableproject.com')
    )) {
      return origin;
    }
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));




// Mount Auth Routes
app.route('/', authRoutes);
app.route('/', profileRoutes);
app.route('/', familyRoutes);
app.route('/', curriculumRoutes);

app.route('/', workRoutes);
app.route('/', analyticsRoutes);
app.route('/', exportRoutes);
app.route('/', reportsRoutes);
app.route('/', adminRoutes);

// Auth middleware
app.use('/api/*', async (c, next) => {
  // Prevent caching of sensitive API responses
  c.header('Cache-Control', 'no-store, max-age=0');

  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '') || c.req.query('token');

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


// ============ FORMATION PREFERENCES ROUTES ============

// Get formation preferences (defaults to all enabled if not set)
app.get('/api/family/preferences', async (c) => {
  try {
    const user = requireAuth(c);

    let prefs = await c.env.DB.prepare(
      'SELECT * FROM family_preferences WHERE parent_id = ?'
    ).bind(user.id).first();

    if (!prefs) {
      // Return defaults if no preferences set
      return c.json({
        activitiesEnabled: true,
        readingEnabled: true,
        liturgyEnabled: true,
        learningFocus: 'balanced',
        focusDomains: []
      });
    }

    return c.json({
      activitiesEnabled: !!(prefs as any).activities_enabled,
      readingEnabled: !!(prefs as any).reading_enabled,
      liturgyEnabled: !!(prefs as any).liturgy_enabled,
      learningFocus: (prefs as any).learning_focus || 'balanced',
      focusDomains: JSON.parse((prefs as any).focus_domains || '[]')
    });
  } catch (error: any) {
    console.error('Formation preferences get error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
  }
});

// Update formation preferences
app.post('/api/family/preferences', async (c) => {
  try {
    const user = requireAuth(c);
    const body = await c.req.json();

    const { activitiesEnabled, readingEnabled, liturgyEnabled, learningFocus, focusDomains } = body;

    // Upsert preferences
    // For upsert to work correctly with COALESCE on partial updates, we must pass NULL for undefined fields
    // Defaulting to 1 in the bind params overwrites existing preferences during partial updates.

    // Check if record exists first to determine defaults for NEW records
    const existing = await c.env.DB.prepare('SELECT 1 FROM family_preferences WHERE parent_id = ?').bind(user.id).first();
    const isNew = !existing;

    // Defaults only apply if it's a NEW record and the field is missing
    const getVal = (val: any) => {
      if (val !== undefined) return val ? 1 : 0;
      return isNew ? 1 : null; // Default to 1 for new, null (preserve) for existing
    };

    await c.env.DB.prepare(`
      INSERT INTO family_preferences (id, parent_id, activities_enabled, reading_enabled, liturgy_enabled, learning_focus, focus_domains, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(parent_id) DO UPDATE SET 
        activities_enabled = COALESCE(excluded.activities_enabled, activities_enabled),
        reading_enabled = COALESCE(excluded.reading_enabled, reading_enabled),
        liturgy_enabled = COALESCE(excluded.liturgy_enabled, liturgy_enabled),
        learning_focus = COALESCE(excluded.learning_focus, learning_focus),
        focus_domains = COALESCE(excluded.focus_domains, focus_domains),
        updated_at = datetime('now')
    `).bind(
      generateId('fpref'),
      user.id,
      getVal(activitiesEnabled),
      getVal(readingEnabled),
      getVal(liturgyEnabled),
      learningFocus || (isNew ? 'balanced' : null),
      focusDomains ? JSON.stringify(focusDomains) : null
    ).run();

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Formation preferences update error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message || 'Internal Server Error' }, status);
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
      'SELECT * FROM formations WHERE id = ?'
    ).bind(activityId).first();

    if (!activity) {
      return c.json({ error: 'Activity not found' }, 404);
    }

    // Daily practices check (optional, depending on if assessment_prohibited is in formations)
    // Assuming formations has formation_type, we can check that.
    if ((activity as any).formation_type === 'daily_practice' && (activity as any).assessment_prohibited === 1) {
      return c.json({ error: 'Observations cannot be recorded for daily practices' }, 400);
    }

    const observationId = generateId('ev'); // Use 'ev' for evidence

    // Map masteryLevel to habit_stage
    // habit_stage CHECK constraint: 'Seeding', 'Rooting', 'Fruiting'
    // Input masteryLevel might be arbitrary string.
    let habitStage = 'Seeding';
    if (masteryLevel) {
      const lower = masteryLevel.toLowerCase();
      if (lower.includes('fruit') || lower.includes('mastered')) habitStage = 'Fruiting';
      else if (lower.includes('root') || lower.includes('growing')) habitStage = 'Rooting';
      else if (lower.includes('seed') || lower.includes('started')) habitStage = 'Seeding';
      // Fallback: if masteryLevel is one of the valid ones, use it (case insensitive)
      const valid = ['Seeding', 'Rooting', 'Fruiting'];
      const exact = valid.find(v => v.toLowerCase() === lower);
      if (exact) habitStage = exact;
    }

    await c.env.DB.prepare(
      'INSERT INTO evidences (id, student_id, parent_id, formation_id, habit_stage, notes) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(observationId, studentId, user.id, activityId, habitStage, parentNotes || null).run();

    // No need to update daily_recommendations as it is deprecated

    const observation = await c.env.DB.prepare(
      'SELECT * FROM evidences WHERE id = ?'
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
      SELECT e.id, e.student_id, e.formation_id as activity_id, e.stage as mastery_level, e.note as parent_notes, e.created_at as completed_at,
             f.title, f.primary_virtue as domain, f.description
      FROM evidences e
      JOIN formations f ON e.formation_id = f.id
      WHERE e.student_id = ?
    `;
    const params: any[] = [studentId];

    if (domain) {
      query += ' AND f.primary_virtue = ?';
      params.push(domain);
    }

    query += ' ORDER BY e.created_at DESC LIMIT ?';
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

    // Get formation preferences to know which streams are enabled
    const prefs = await c.env.DB.prepare(
      'SELECT * FROM family_preferences WHERE parent_id = ?'
    ).bind(user.id).first() as any;

    const enabledStreams: string[] = [];
    if (!prefs || prefs.activities_enabled) enabledStreams.push('activity');
    if (!prefs || prefs.reading_enabled) enabledStreams.push('reading');
    if (!prefs || prefs.liturgy_enabled) enabledStreams.push('liturgy');

    // ACTIVITY PROGRESS: Get counts by virtue (domain) and stage (mastery)
    const { results: byDomain } = await c.env.DB.prepare(`
      SELECT f.primary_virtue as domain, e.stage as mastery_level, COUNT(*) as count
      FROM evidences e
      JOIN formations f ON e.formation_id = f.id
      WHERE e.student_id = ?
      GROUP BY f.primary_virtue, e.stage
    `).bind(studentId).all();

    // Get recent activity (last 7 days)
    const { results: recentActivity } = await c.env.DB.prepare(`
      SELECT DATE(e.created_at) as date, COUNT(*) as count
      FROM evidences e
      WHERE e.student_id = ? AND e.created_at > datetime('now', '-7 days')
      GROUP BY DATE(e.created_at)
      ORDER BY date
    `).bind(studentId).all();

    // Get total completed formations
    const totalResult = await c.env.DB.prepare(`
      SELECT COUNT(DISTINCT formation_id) as total FROM evidences WHERE student_id = ?
    `).bind(studentId).first();

    const activityProgress = {
      totalCompleted: (totalResult as any)?.total || 0,
      byDomain,
      recentActivity
    };

    // READING PROGRESS: Count reading sessions where this child was present
    const readingStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as sessions_count,
        COUNT(DISTINCT book_id) as distinct_books
      FROM reading_sessions 
      WHERE parent_id = ? 
        AND (children_present IS NULL OR children_present LIKE ?)
    `).bind(user.id, `%${studentId}%`).first() as any;

    const readingProgress = {
      sessionsCount: readingStats?.sessions_count || 0,
      distinctBooks: readingStats?.distinct_books || 0
    };

    // LITURGY PROGRESS: Count days practiced and calculate streak
    const liturgyDaysResult = await c.env.DB.prepare(`
      SELECT COUNT(DISTINCT completed_date) as days_practiced
      FROM liturgy_completions
      WHERE parent_id = ?
    `).bind(user.id).first() as any;

    // Calculate current streak (consecutive days ending today or yesterday)
    const { results: recentDays } = await c.env.DB.prepare(`
      SELECT DISTINCT completed_date
      FROM liturgy_completions
      WHERE parent_id = ?
      ORDER BY completed_date DESC
      LIMIT 30
    `).bind(user.id).all();

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (recentDays.some((d: any) => d.completed_date === dateStr)) {
        currentStreak++;
      } else if (i > 0) {
        // Allow missing today (streak still counts if yesterday was completed)
        break;
      }
    }

    const liturgyProgress = {
      daysPracticed: liturgyDaysResult?.days_practiced || 0,
      currentStreak
    };

    return c.json({
      student,
      enabledStreams,
      // Legacy fields for backward compatibility
      totalCompleted: activityProgress.totalCompleted,
      byDomain: activityProgress.byDomain,
      recentActivity: activityProgress.recentActivity,
      // New unified progress
      activityProgress,
      readingProgress,
      liturgyProgress
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
    // Optimization: Allow caching for this heavy static endpoint
    c.header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');

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

    // Step 3: List Books in ALL Series concurrently
    const seriesBookLists = await Promise.all(seriesPrefixes.map(async (seriesPrefix) => {
      const seriesName = seriesPrefix.replace(rootPath, '').replace(/\/$/, '');
      const bookPrefixes = await listAllPrefixes(bucket, {
        prefix: seriesPrefix,
        delimiter: '/'
      });
      return { seriesName, seriesPrefix, bookPrefixes };
    }));

    // Flatten to get all book tasks
    const allBookTasks = seriesBookLists.flatMap(({ seriesName, seriesPrefix, bookPrefixes }) =>
      bookPrefixes.map(bookPrefix => ({ seriesName, seriesPrefix, bookPrefix }))
    );

    // Step 4: Process Books Concurrently
    const bookResults = await Promise.all(allBookTasks.map(async ({ seriesName, seriesPrefix, bookPrefix }) => {
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
          return {
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
          } as BookMetadata;
        }
      } catch (e) {
        console.warn(`Failed to load book ${bookId}:`, e);
      }
      return null;
    }));

    books.push(...bookResults.filter((b): b is BookMetadata => b !== null));

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
    const series = decodeURIComponent(c.req.param('series'));
    const bookId = decodeURIComponent(c.req.param('bookId'));

    if (!isValidPathSegment(series) || !isValidPathSegment(bookId)) {
      return c.json({ error: 'Invalid path segment' }, 400);
    }

    const metadata = await getBookMetadata(c.env.BOOKS_BUCKET, series, bookId);

    if (!metadata) {
      return c.json({ error: 'Book not found' }, 404);
    }

    return c.json(metadata);
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to get book' }, 500);
  }
});

// Get book cover image (with CORS for cross-origin requests)
app.get('/api/books/:series/:bookId/cover', async (c) => {
  try {
    const series = decodeURIComponent(c.req.param('series'));
    const bookId = decodeURIComponent(c.req.param('bookId'));

    if (!isValidPathSegment(series) || !isValidPathSegment(bookId)) {
      return c.json({ error: 'Invalid path segment' }, 400);
    }

    const bucket = c.env.BOOKS_BUCKET;

    // Try multiple path patterns for resilience (PNG, JPG, and page-01 fallback)
    // Covers can be at: book folder level, images/ subfolder, or shared series images/ folder
    // IMPORTANT: Your R2 structure is primarily: books/{series}/{bookId}/images/cover.png
    // But African Men of Faith uses Title Case folders and "Cover Photo.png" filename.

    // Helper to convert snake_case to Title Case With Spaces
    const toTitleCase = (str: string) => str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const seriesTitleCase = toTitleCase(series);
    const bookIdTitleCase = toTitleCase(bookId);

    const pathsToTry = [
      // Primary (per-book) cover location - picture books (snake_case)
      `books/${series}/${bookId}/images/cover.png`,
      `books/${series}/${bookId}/images/cover.jpg`,
      `books/${series}/${bookId}/images/cover.jpeg`,

      // Title Case folders (African Men of Faith pattern)
      `books/${seriesTitleCase}/${bookIdTitleCase}/images/cover.png`,
      `books/${seriesTitleCase}/${bookIdTitleCase}/Cover Photo.png`,
      `books/${seriesTitleCase}/${bookIdTitleCase}/cover.png`,

      // Mixed: Title Case series, lowercase book
      `books/${seriesTitleCase}/${bookId}/images/cover.png`,
      `books/${seriesTitleCase}/${bookId}/Cover Photo.png`,

      // Series-level images folder with bookId as filename (Pastor Curtis pattern)
      `books/${series}/images/${bookId}.png`,
      `books/${series}/images/${bookId}.jpg`,
      `books/${series}/images/${bookId}.jpeg`,

      // Secondary (older) book folder level
      `books/${series}/${bookId}/cover.png`,
      `books/${series}/${bookId}/cover.jpg`,
      `books/${series}/${bookId}/cover.jpeg`,
      `books/${seriesTitleCase}/${bookIdTitleCase}/cover.png`,
      `books/${seriesTitleCase}/${bookIdTitleCase}/cover.jpg`,

      // Shared series-level cover (some collections)
      `books/${series}/images/cover.png`,
      `books/${series}/images/cover.jpg`,
      `books/${series}/images/cover.jpeg`,

      // Fallback: page-01 as cover (snake_case)
      `books/${series}/${bookId}/images/page-01.png`,
      `books/${series}/${bookId}/images/page-01.jpg`,
      `books/${series}/${bookId}/images/page_01.png`,
      `books/${series}/${bookId}/images/page_01.jpg`,

      // Fallback: Page 1.png (Title Case with spaces - African Men of Faith)
      `books/${seriesTitleCase}/${bookIdTitleCase}/images/Page 1.png`,
      `books/${seriesTitleCase}/${bookIdTitleCase}/Page 1.png`,

      `books/${series}/${bookId}/page-01.png`,
      `books/${series}/${bookId}/page-01.jpg`,
      `books/${series}/${bookId}/page_01.png`,
      `books/${series}/${bookId}/page_01.jpg`,

      // Without books/ prefix (legacy)
      `${series}/${bookId}/images/cover.png`,
      `${series}/${bookId}/images/cover.jpg`,
      `${series}/${bookId}/images/cover.jpeg`,
      `${seriesTitleCase}/${bookIdTitleCase}/images/cover.png`,
      `${seriesTitleCase}/${bookIdTitleCase}/Cover Photo.png`,
      `${series}/images/${bookId}.png`,
      `${series}/images/${bookId}.jpg`,
      `${series}/images/${bookId}.jpeg`,
      `${series}/${bookId}/cover.png`,
      `${series}/${bookId}/cover.jpg`,
      `${series}/${bookId}/cover.jpeg`,
      `${series}/images/cover.png`,
      `${series}/images/cover.jpg`,
      `${series}/images/cover.jpeg`,
      `${series}/${bookId}/images/page-01.png`,
      `${series}/${bookId}/images/page_01.png`,
      `${series}/${bookId}/page-01.png`,
      `${series}/${bookId}/page_01.png`,
    ];

    for (const key of pathsToTry) {
      const object = await bucket.get(key);
      if (object) {
        const headers = new Headers();
        // Detect content type from key extension or use R2 metadata
        const ext = key.split('.').pop()?.toLowerCase();
        const contentType = object.httpMetadata?.contentType ||
          (ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png');
        headers.set('Content-Type', contentType);
        headers.set('Cache-Control', 'public, max-age=86400');
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        return new Response(object.body, { headers });
      }
    }

    return c.json({
      error: 'Cover not found',
      tried: pathsToTry,
      help: 'Ensure cover.png, cover.jpg, or images/page-01.png exists in the book folder'
    }, 404);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Debug endpoint for cover URL probing
app.get('/api/books/:series/:bookId/cover/debug', async (c) => {
  try {
    const series = decodeURIComponent(c.req.param('series'));
    const bookId = decodeURIComponent(c.req.param('bookId'));
    const bucket = c.env.BOOKS_BUCKET;

    const toTitleCase = (str: string) => str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const seriesTitleCase = toTitleCase(series);
    const bookIdTitleCase = toTitleCase(bookId);

    const pathsToTry = [
      `books/${series}/${bookId}/images/cover.png`,
      `books/${series}/${bookId}/images/cover.jpg`,
      `books/${series}/images/${bookId}.png`,
      `books/${series}/images/${bookId}.jpg`,
      `books/${seriesTitleCase}/${bookIdTitleCase}/images/cover.png`,
      `books/${seriesTitleCase}/${bookIdTitleCase}/Cover Photo.png`,
      `books/${series}/${bookId}/images/page-01.png`,
      `books/${series}/${bookId}/images/page_01.png`,
      `books/${seriesTitleCase}/${bookIdTitleCase}/images/Page 1.png`,
    ];

    const results = [];
    let foundPath = null;

    for (const key of pathsToTry) {
      const object = await bucket.head(key);
      const found = !!object;
      results.push({
        path: key,
        found,
        size: object?.size,
        contentType: object?.httpMetadata?.contentType
      });
      if (found && !foundPath) foundPath = key;
    }

    return c.json({
      requestedSeries: series,
      requestedBookId: bookId,
      seriesTitleCase,
      bookIdTitleCase,
      foundPath,
      pathsChecked: results
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get book page image (with CORS for cross-origin requests)
app.get('/api/books/:series/:bookId/pages/:pageNum', async (c) => {
  try {
    const series = decodeURIComponent(c.req.param('series'));
    const bookId = decodeURIComponent(c.req.param('bookId'));
    const pageNum = c.req.param('pageNum');

    if (!isValidPathSegment(series) || !isValidPathSegment(bookId) || !isValidPathSegment(pageNum)) {
      return c.json({ error: 'Invalid path segment' }, 400);
    }

    const bucket = c.env.BOOKS_BUCKET;

    const paddedNum = pageNum.padStart(2, '0');

    // Try multiple path patterns for resilience (PNG and JPG)
    const pathsToTry = [
      // With books/ prefix
      `books/${series}/${bookId}/images/page-${paddedNum}.png`,
      `books/${series}/${bookId}/images/page-${paddedNum}.jpg`,
      `books/${series}/${bookId}/images/page_${paddedNum}.png`,
      `books/${series}/${bookId}/images/page_${paddedNum}.jpg`,
      `books/${series}/${bookId}/page-${paddedNum}.png`,
      `books/${series}/${bookId}/page-${paddedNum}.jpg`,
      `books/${series}/${bookId}/page_${paddedNum}.png`,
      `books/${series}/${bookId}/page_${paddedNum}.jpg`,
      // Without books/ prefix
      `${series}/${bookId}/images/page-${paddedNum}.png`,
      `${series}/${bookId}/images/page-${paddedNum}.jpg`,
      `${series}/${bookId}/images/page_${paddedNum}.png`,
      `${series}/${bookId}/images/page_${paddedNum}.jpg`,
      `${series}/${bookId}/page-${paddedNum}.png`,
      `${series}/${bookId}/page-${paddedNum}.jpg`,
      `${series}/${bookId}/page_${paddedNum}.png`,
      `${series}/${bookId}/page_${paddedNum}.jpg`,
    ];

    for (const key of pathsToTry) {
      const object = await bucket.get(key);
      if (object) {
        const headers = new Headers();
        const ext = key.split('.').pop()?.toLowerCase();
        const contentType = object.httpMetadata?.contentType ||
          (ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png');
        headers.set('Content-Type', contentType);
        headers.set('Cache-Control', 'public, max-age=86400');
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        return new Response(object.body, { headers });
      }
    }

    return c.json({
      error: 'Page not found',
      tried: pathsToTry,
      help: 'Ensure images/page-XX.png or page-XX.jpg exists in the book folder'
    }, 404);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get book PDF (for larger books with many pages)
app.get('/api/books/:series/:bookId/pdf', async (c) => {
  try {
    const series = decodeURIComponent(c.req.param('series'));
    const bookId = decodeURIComponent(c.req.param('bookId'));

    if (!isValidPathSegment(series) || !isValidPathSegment(bookId)) {
      return c.json({ error: 'Invalid path segment' }, 400);
    }

    const bucket = c.env.BOOKS_BUCKET;

    // Try multiple path patterns for PDF files
    // PDFs can be: at series level (pastor_curtis_knapp/book.pdf), or in book subfolder
    const pathsToTry = [
      // PDF directly in series folder (e.g., pastor_curtis_knapp/before_you_tie_the_knot.pdf)
      `books/${series}/${bookId}.pdf`,
      `${series}/${bookId}.pdf`,
      // PDF in book subfolder with same name
      `books/${series}/${bookId}/${bookId}.pdf`,
      `${series}/${bookId}/${bookId}.pdf`,
      // Generic book.pdf in book subfolder
      `books/${series}/${bookId}/book.pdf`,
      `${series}/${bookId}/book.pdf`,
    ];

    for (const key of pathsToTry) {
      const object = await bucket.get(key);
      if (object) {
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Cache-Control', 'public, max-age=86400');
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        // Allow inline viewing, not forced download
        headers.set('Content-Disposition', `inline; filename="${bookId}.pdf"`);
        return new Response(object.body, { headers });
      }
    }

    return c.json({
      error: 'PDF not found',
      tried: pathsToTry,
      help: 'Upload PDF to R2 at books/{series}/{bookId}/book.pdf'
    }, 404);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get any book asset (generic fallback for markdown, manifests, etc.)
app.get('/api/books/:series/:bookId/asset/*', async (c) => {
  try {
    const series = decodeURIComponent(c.req.param('series'));
    const bookId = decodeURIComponent(c.req.param('bookId'));
    const assetPath = c.req.path.split('/asset/')[1] || '';
    const bucket = c.env.BOOKS_BUCKET;

    if (!assetPath || assetPath.includes('..') || !isValidPathSegment(series) || !isValidPathSegment(bookId)) {
      return c.json({ error: 'Invalid path segment' }, 400);
    }

    const pathsToTry = [
      `books/${series}/${bookId}/${assetPath}`,
      `${series}/${bookId}/${assetPath}`,
    ];

    for (const key of pathsToTry) {
      const object = await bucket.get(key);
      if (object) {
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('Cache-Control', 'public, max-age=3600');
        headers.set('Access-Control-Allow-Origin', '*');
        return new Response(object.body, { headers });
      }
    }

    return c.json({ error: 'Asset not found', tried: pathsToTry }, 404);
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
      "SELECT id FROM formations WHERE (id = ? OR id = ?) AND formation_type = 'reading'"
    ).bind(bookId, `${series}/${bookId}`).first<{ id: string }>();

    if (!book) {
      return c.json({
        error: 'Book not found',
        tried: [bookId, `${series}/${bookId}`],
        help: 'Ensure the book is seeded in the formations table with a matching id'
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

// Upload book image (Admin only)
app.put('/api/books/upload', async (c) => {
  const key = c.req.query('key');
  const secret = c.env.ADMIN_SECRET;

  if (!secret || !(await safeCompare(key, secret))) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const path = c.req.query('path'); // e.g., "books/sanyus_growing_heart/left_out/images/cover.png"
  if (!path) return c.json({ error: 'Path required' }, 400);

  try {
    const body = await c.req.arrayBuffer();
    await c.env.BOOKS_BUCKET.put(path, body);
    return c.json({ success: true, path });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Debug R2 endpoint
app.get('/api/debug/r2', async (c) => {
  const key = c.req.query('key');
  const secret = c.env.ADMIN_SECRET;

  if (!secret || !(await safeCompare(key, secret))) {
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
  const key = c.req.query('key');
  const secret = c.env.ADMIN_SECRET;

  if (!secret || !(await safeCompare(key, secret))) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

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
    const countResult = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM content_upvotes WHERE content_type = ? AND content_id = ?`
    ).bind(contentType, contentId).first<{ count: number }>();

    const newCount = countResult?.count || 0;

    // Skipping update to source table as 'upvote_count' column is not available in new 'formations' schema.
    // Ideally we would update a stats table or rely on the join count.

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
    // Skipping table update as comment_count doesn't exist on formations

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

    // Update count skipped

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
    // No-op for now as weekly_time_model is deprecated/migrating
    // Returning success with defaults
    const defaultModel = {
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      minutesPerDay: 45,
      preferredTimes: ['morning'],
      maxSessionsPerDay: 2,
      fieldTripDays: []
    };

    return c.json({
      id: 'default',
      ...defaultModel,
      available_days: JSON.stringify(defaultModel.availableDays),
      preferred_times: JSON.stringify(defaultModel.preferredTimes),
      field_trip_days: JSON.stringify(defaultModel.fieldTripDays)
    });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});

// ============================================
// PORTFOLIO STORAGE
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

    // Security: Strict path validation
    // Ensure key starts with "{user.id}/" to prevent uploading to other users' directories
    if (!key || !key.startsWith(`${user.id}/`)) {
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
    const { studentId, title, description, itemType, r2Key, domain, relatedActivityId, milestoneTag } = body;

    if (!studentId || !title || !itemType) {
      return c.json({ error: 'studentId, title, and itemType are required' }, 400);
    }

    // Security: Validate that r2Key belongs to this user
    // This prevents IDOR where users claim ownership of others' files
    if (r2Key && !r2Key.startsWith(`${user.id}/`)) {
      return c.json({ error: 'Invalid file key' }, 403);
    }

    const id = generateId('port');
    await c.env.DB.prepare(`
      INSERT INTO portfolio_items (id, student_id, parent_id, title, description, item_type, r2_key, domain, related_activity_id, milestone_tag)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, studentId, user.id, title, description, itemType, r2Key, domain, relatedActivityId, milestoneTag || null).run();

    return c.json({ id, success: true }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// List portfolio items with filtering
app.get('/api/portfolio/:studentId', async (c) => {
  try {
    const user = requireAuth(c);
    const studentId = c.req.param('studentId');
    const domain = c.req.query('domain');
    const itemType = c.req.query('itemType');
    const timePeriod = c.req.query('timePeriod'); // 'week', 'month', 'year', 'all'
    const milestoneOnly = c.req.query('milestoneOnly') === 'true';

    let query = 'SELECT * FROM portfolio_items WHERE student_id = ? AND parent_id = ?';
    const params: any[] = [studentId, user.id];

    if (domain) {
      query += ' AND domain = ?';
      params.push(domain);
    }

    if (itemType) {
      query += ' AND item_type = ?';
      params.push(itemType);
    }

    if (milestoneOnly) {
      query += ' AND milestone_tag IS NOT NULL';
    }

    // Time period filtering
    if (timePeriod && timePeriod !== 'all') {
      const now = new Date();
      let startDate: string;

      switch (timePeriod) {
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          startDate = weekAgo.toISOString().split('T')[0];
          break;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          startDate = monthAgo.toISOString().split('T')[0];
          break;
        case 'year':
          const yearAgo = new Date(now);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          startDate = yearAgo.toISOString().split('T')[0];
          break;
        default:
          startDate = '';
      }

      if (startDate) {
        query += ' AND date(created_at) >= ?';
        params.push(startDate);
      }
    }

    query += ' ORDER BY created_at DESC';

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    // Map results to include public URLs and camelCase fields
    const items = results.map((item: any) => ({
      id: item.id,
      studentId: item.student_id,
      parentId: item.parent_id,
      title: item.title,
      description: item.description,
      itemType: item.item_type,
      domain: item.domain,
      relatedActivityId: item.related_activity_id,
      milestoneTag: item.milestone_tag,
      createdAt: item.created_at,
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

    // Security: Strict path validation
    // 1. Owner Access (Fast Path): Check if user is the uploader
    const validPrefix1 = `${user.id}/`;
    const validPrefix2 = `portfolio/${user.id}/`;
    const isOwner = key.startsWith(validPrefix1) || key.startsWith(validPrefix2);

    let isAuthorized = isOwner;

    // 2. Household Access (Slow Path): Check if file belongs to household student
    if (!isAuthorized && user.household_id) {
      const authorized = await c.env.DB.prepare(`
         SELECT 1
         FROM portfolio_items p
         JOIN students s ON p.student_id = s.id
         WHERE p.r2_key = ? AND s.household_id = ?
       `).bind(key, user.household_id).first();

      if (authorized) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return c.json({ error: 'Unauthorized access to file' }, 403);
    }

    // Try finding the file (handle potential missing 'portfolio/' prefix in stored key)
    let object = await c.env.BOOKS_BUCKET.get(key);

    if (!object) {
      // Fallback: Try with portfolio/ prefix if not found directly
      object = await c.env.BOOKS_BUCKET.get(`portfolio/${key}`);
    }

    if (!object) {
      return c.json({ error: 'File not found' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    // Security: Prevent execution of uploaded HTML/JS by forcing download
    // Sanitize filename to prevent header injection
    const filename = key.split('/').pop()?.replace(/"/g, '') || 'download';
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('X-Content-Type-Options', 'nosniff');

    return new Response(object.body, {
      headers,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Delete portfolio item

// Get student independence settings
app.get('/api/independence-settings/:studentId', async (c) => {
  try {
    const user = requireHouseholdMember(c);
    const studentId = c.req.param('studentId');

    // Verify ownership
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND household_id = ?'
    ).bind(studentId, user.household_id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    // Try to parse settings from student record if column exists
    // Default to parent-led if missing or error
    let settings = {
      mode: 'parent_led',
      canMarkComplete: false,
      canEditPlan: false,
      checklistMode: 'simple'
    };

    try {
      if ((student as any).independence_settings) {
        const parsed = JSON.parse((student as any).independence_settings);
        settings = { ...settings, ...parsed };
      }
    } catch (e) {
      // Ignore parsing errors or missing column
    }

    return c.json(settings);
  } catch (error: any) {
    // If column doesn't exist, it might throw, but we caught it above?
    // Actually SELECT * won't throw if column missing?
    // Wait, SELECT * will only return columns that exist.
    // So (student as any).independence_settings will just be undefined.
    // Safe.
    return c.json({ error: error.message }, 500);
  }
});

// Update independence settings
app.put('/api/independence-settings/:studentId', async (c) => {
  try {
    const user = requireParent(c); // Only parents can change this
    const studentId = c.req.param('studentId');
    const updates = await c.req.json();

    // Check if column exists by trying to update it.
    // If it fails, we might need to store in family_preferences overrides as fallback?
    // For now, assume migration v2_0002 will be run.

    await c.env.DB.prepare(
      'UPDATE students SET independence_settings = ? WHERE id = ? AND household_id = ?'
    ).bind(JSON.stringify(updates), studentId, user.household_id).run();

    return c.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update independence settings", error);
    // Fallback: If column missing, maybe just succeed silently so UI doesn't crash?
    // Or return 500.
    return c.json({ error: 'Failed to update settings. Migration pending?' }, 500);
  }
});

// ============ LEARNING PATHS API ============

// List all active learning paths (public)
app.get('/api/paths', async (c) => {
  try {
    const result = await c.env.DB.prepare(
      'SELECT * FROM learning_paths WHERE is_active = 1 ORDER BY sort_order ASC'
    ).all();

    return c.json(result.results || []);
  } catch (error: any) {
    console.error('Error fetching learning paths:', error);
    // Return empty array if table doesn't exist yet
    return c.json([]);
  }
});

// Get user's path subscriptions (authenticated)
app.get('/api/paths/subscriptions', async (c) => {
  try {
    const user = requireAuth(c);

    const result = await c.env.DB.prepare(`
      SELECT 
        fps.*,
        lp.title as path_title,
        lp.path_type,
        lp.total_items
      FROM family_path_subscriptions fps
      JOIN learning_paths lp ON fps.path_id = lp.id
      WHERE fps.parent_id = ?
      ORDER BY fps.started_at DESC
    `).bind(user.id).all();

    return c.json(result.results || []);
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    return c.json([]);
  }
});

// Subscribe to a path
app.post('/api/paths/:pathId/subscribe', async (c) => {
  try {
    const user = requireAuth(c);
    const pathId = c.req.param('pathId');

    // Check if path exists
    const path = await c.env.DB.prepare(
      'SELECT * FROM learning_paths WHERE id = ? AND is_active = 1'
    ).bind(pathId).first();

    if (!path) {
      return c.json({ error: 'Path not found' }, 404);
    }

    // Check if already subscribed
    const existing = await c.env.DB.prepare(
      'SELECT * FROM family_path_subscriptions WHERE parent_id = ? AND path_id = ?'
    ).bind(user.id, pathId).first();

    if (existing) {
      return c.json({ error: 'Already subscribed to this path' }, 400);
    }

    const subscriptionId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO family_path_subscriptions (id, parent_id, path_id, started_at, current_position, is_paused)
      VALUES (?, ?, ?, datetime('now'), 1, 0)
    `).bind(subscriptionId, user.id, pathId).run();

    const subscription = await c.env.DB.prepare(
      'SELECT * FROM family_path_subscriptions WHERE id = ?'
    ).bind(subscriptionId).first();

    return c.json({ success: true, subscription });
  } catch (error: any) {
    console.error('Error subscribing to path:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Pause a path subscription
app.post('/api/paths/:pathId/pause', async (c) => {
  try {
    const user = requireAuth(c);
    const pathId = c.req.param('pathId');

    await c.env.DB.prepare(`
      UPDATE family_path_subscriptions 
      SET is_paused = 1 
      WHERE parent_id = ? AND path_id = ?
    `).bind(user.id, pathId).run();

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Resume a path subscription
app.post('/api/paths/:pathId/resume', async (c) => {
  try {
    const user = requireAuth(c);
    const pathId = c.req.param('pathId');

    await c.env.DB.prepare(`
      UPDATE family_path_subscriptions 
      SET is_paused = 0 
      WHERE parent_id = ? AND path_id = ?
    `).bind(user.id, pathId).run();

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Unsubscribe from a path
app.delete('/api/paths/:pathId/unsubscribe', async (c) => {
  try {
    const user = requireAuth(c);
    const pathId = c.req.param('pathId');

    await c.env.DB.prepare(`
      DELETE FROM family_path_subscriptions 
      WHERE parent_id = ? AND path_id = ?
    `).bind(user.id, pathId).run();

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Advance position in a path subscription
app.post('/api/paths/:pathId/advance', async (c) => {
  try {
    const user = requireAuth(c);
    const pathId = c.req.param('pathId');

    // Get current subscription
    const subscription = await c.env.DB.prepare(`
      SELECT fps.*, lp.total_items 
      FROM family_path_subscriptions fps
      JOIN learning_paths lp ON fps.path_id = lp.id
      WHERE fps.parent_id = ? AND fps.path_id = ?
    `).bind(user.id, pathId).first() as any;

    if (!subscription) {
      return c.json({ error: 'Subscription not found' }, 404);
    }

    const newPosition = (subscription.current_position || 1) + 1;
    const isCompleted = subscription.total_items && newPosition > subscription.total_items;

    if (isCompleted) {
      // Mark path as completed
      await c.env.DB.prepare(`
        UPDATE family_path_subscriptions 
        SET current_position = ?, completed_at = datetime('now')
        WHERE parent_id = ? AND path_id = ?
      `).bind(newPosition, user.id, pathId).run();
    } else {
      // Just advance position
      await c.env.DB.prepare(`
        UPDATE family_path_subscriptions 
        SET current_position = ?
        WHERE parent_id = ? AND path_id = ?
      `).bind(newPosition, user.id, pathId).run();
    }

    return c.json({
      success: true,
      new_position: newPosition,
      total_items: subscription.total_items,
      is_completed: isCompleted
    });
  } catch (error: any) {
    console.error('Error advancing path:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get today's content from all active paths
app.get('/api/paths/today', async (c) => {
  try {
    const user = requireAuth(c);

    // Get all active subscriptions
    const subscriptionsResult = await c.env.DB.prepare(`
      SELECT 
        fps.*,
        lp.id as path_id,
        lp.title as path_title,
        lp.path_type,
        lp.content_filter,
        lp.pace,
        lp.total_items
      FROM family_path_subscriptions fps
      JOIN learning_paths lp ON fps.path_id = lp.id
      WHERE fps.parent_id = ? AND fps.is_paused = 0 AND fps.completed_at IS NULL
    `).bind(user.id).all();

    const subscriptions = subscriptionsResult.results || [];
    const items: any[] = [];

    // For each active subscription, get today's item
    for (const sub of subscriptions) {
      const pathType = (sub as any).path_type;
      const position = (sub as any).current_position || 1;
      const total = (sub as any).total_items;

      let item = null;

      // Fetch content based on path type
      if (pathType === 'hymn_journey') {
        // Get hymn at current position
        const hymn = await c.env.DB.prepare(
          'SELECT * FROM formations WHERE cluster_tag = ? ORDER BY ROWID LIMIT 1 OFFSET ?'
        ).bind('hymn', position - 1).first();
        if (hymn) {
          item = {
            path_id: (sub as any).path_id,
            path_title: (sub as any).path_title,
            path_type: pathType,
            item_type: 'hymn',
            item_id: (hymn as any).id,
            item_title: (hymn as any).title,
            item_data: hymn,
            position,
            total,
          };
        }
      } else if (pathType === 'catechism') {
        // Get catechism at current position
        const catechism = await c.env.DB.prepare(
          'SELECT * FROM formations WHERE cluster_tag = ? ORDER BY ROWID LIMIT 1 OFFSET ?'
        ).bind('catechism', position - 1).first();
        if (catechism) {
          item = {
            path_id: (sub as any).path_id,
            path_title: (sub as any).path_title,
            path_type: pathType,
            item_type: 'catechism',
            item_id: (catechism as any).id,
            item_title: (catechism as any).title,
            item_data: catechism,
            position,
            total,
          };
        }
      } else if (pathType === 'toddler_dev') {
        // Get toddler formation at current position
        const formation = await c.env.DB.prepare(
          'SELECT * FROM formations WHERE cluster_tag = ? ORDER BY ROWID LIMIT 1 OFFSET ?'
        ).bind('toddler', position - 1).first();
        if (formation) {
          item = {
            path_id: (sub as any).path_id,
            path_title: (sub as any).path_title,
            path_type: pathType,
            item_type: 'activity',
            item_id: (formation as any).id,
            item_title: (formation as any).title,
            item_data: formation,
            position,
            total,
          };
        }
      } else if (pathType === 'early_reading') {
        // Get reading formation at current position
        const formation = await c.env.DB.prepare(
          'SELECT * FROM formations WHERE cluster_tag = ? ORDER BY ROWID LIMIT 1 OFFSET ?'
        ).bind('reading', position - 1).first();
        if (formation) {
          item = {
            path_id: (sub as any).path_id,
            path_title: (sub as any).path_title,
            path_type: pathType,
            item_type: 'activity',
            item_id: (formation as any).id,
            item_title: (formation as any).title,
            item_data: formation,
            position,
            total,
          };
        }
      } else if (pathType === 'history_young') {
        // Get young history story at current position
        const story = await c.env.DB.prepare(
          'SELECT * FROM formations WHERE cluster_tag = ? AND formation_type = ? ORDER BY ROWID LIMIT 1 OFFSET ?'
        ).bind('african_history_young', 'story', position - 1).first();
        if (story) {
          item = {
            path_id: (sub as any).path_id,
            path_title: (sub as any).path_title,
            path_type: pathType,
            item_type: 'story',
            item_id: (story as any).id,
            item_title: (story as any).title,
            item_data: story,
            position,
            total,
          };
        }
      } else if (pathType === 'history_full') {
        // Get full history story at current position
        const story = await c.env.DB.prepare(
          'SELECT * FROM formations WHERE cluster_tag = ? ORDER BY ROWID LIMIT 1 OFFSET ?'
        ).bind('african_history', position - 1).first();
        if (story) {
          item = {
            path_id: (sub as any).path_id,
            path_title: (sub as any).path_title,
            path_type: pathType,
            item_type: 'story',
            item_id: (story as any).id,
            item_title: (story as any).title,
            item_data: story,
            position,
            total,
          };
        }
      } else if (pathType === 'pastor_curtis') {
        // Get Pastor Curtis book at current position
        const book = await c.env.DB.prepare(
          'SELECT * FROM books WHERE series = ? ORDER BY ROWID LIMIT 1 OFFSET ?'
        ).bind('pastor_curtis_knapp', position - 1).first();
        if (book) {
          item = {
            path_id: (sub as any).path_id,
            path_title: (sub as any).path_title,
            path_type: pathType,
            item_type: 'book',
            item_id: (book as any).id,
            item_title: (book as any).title,
            item_data: book,
            position,
            total,
          };
        }
      } else if (pathType === 'liturgy') {
        // Combine weekly liturgy items
        item = {
          path_id: (sub as any).path_id,
          path_title: (sub as any).path_title,
          path_type: pathType,
          item_type: 'liturgy',
          item_id: `liturgy-week-${position}`,
          item_title: `Week ${position} Liturgy`,
          item_data: { week: position },
          position,
          total,
        };
      }

      if (item) {
        items.push(item);
      }
    }

    // Build active_paths response
    const active_paths = subscriptions.map((sub: any) => ({
      id: sub.path_id,
      title: sub.path_title || sub.path_type || 'Untitled Path',
      path_type: sub.path_type,
      total_items: sub.total_items,
      subscription: {
        id: sub.id,
        parent_id: sub.parent_id,
        path_id: sub.path_id,
        started_at: sub.started_at,
        current_position: sub.current_position,
        is_paused: Boolean(sub.is_paused),
        completed_at: sub.completed_at,
      },
      progress_percent: sub.total_items
        ? Math.round((sub.current_position / sub.total_items) * 100)
        : 0,
    }));

    return c.json({ items, active_paths });
  } catch (error: any) {
    console.error('Error getting today\'s paths:', error);
    return c.json({ items: [], active_paths: [] });
  }
});

// GET /api/library/stats - Get library completion stats for the authenticated family
app.get('/api/library/stats', async (c) => {
  try {
    const user = requireAuth(c);

    // Get total counts from formations
    const hymnCount = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM formations WHERE cluster_tag = 'hymn'"
    ).first() as any;

    const catechismCount = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM formations WHERE cluster_tag = 'catechism'"
    ).first() as any;

    const bookCount = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM formations WHERE cluster_tag = 'book' OR formation_type = 'story'"
    ).first() as any;

    // Get current positions from active subscriptions
    const subscriptions = await c.env.DB.prepare(`
      SELECT 
        lp.path_type,
        fps.current_position,
        lp.total_items,
        fps.completed_at
      FROM family_path_subscriptions fps
      JOIN learning_paths lp ON fps.path_id = lp.id
      WHERE fps.parent_id = ?
    `).bind(user.id).all();

    const subs = subscriptions.results || [];

    // Calculate completed counts based on position or completed_at
    const hymnSub = subs.find((s: any) => s.path_type === 'hymn_journey') as any;
    const catechismSub = subs.find((s: any) => s.path_type === 'catechism') as any;

    const stats = {
      hymns: {
        completed: hymnSub ? (hymnSub.completed_at ? hymnSub.total_items : hymnSub.current_position - 1) : 0,
        total: hymnCount?.count || 100,
      },
      catechism: {
        completed: catechismSub ? (catechismSub.completed_at ? catechismSub.total_items : catechismSub.current_position - 1) : 0,
        total: catechismCount?.count || 107,
      },
      books: {
        completed: 0, // TODO: Track from evidences or reading table
        total: bookCount?.count || 100,
      },
    };

    return c.json(stats);
  } catch (error: any) {
    console.error('Error getting library stats:', error);
    return c.json({
      hymns: { completed: 0, total: 100 },
      catechism: { completed: 0, total: 107 },
      books: { completed: 0, total: 100 },
    });
  }
});



export default app;
