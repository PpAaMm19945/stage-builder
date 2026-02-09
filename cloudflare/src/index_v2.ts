// FamilyPath Cloudflare Worker API
// Uses Hono for routing, D1 for database, JWT for auth

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { corsMiddleware } from './middleware/cors';
import { securityHeaders } from './middleware/security';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';

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
import studentsRoutes from './routes/students';     // [NEW]
import formationsRoutes from './routes/formations'; // [NEW]
import libraryRoutes from './routes/library';       // [NEW]
import { progressRoutes } from './routes/reading_progress';     // [NEW]
import curriculumRoutes from './routes/curriculum';
import workRoutes from './routes/work';
import analyticsRoutes from './routes/analytics';
import exportRoutes from './routes/export';
import reportsRoutes from './routes/reports';
import adminRoutes from './routes/admin';
import pathsRoutes from './routes/paths';
import aiRoutes from './routes/ai';                 // [NEW]
import anchorRoutes from './routes/anchor';         // [NEW]
import spineRoutes from './routes/spine';           // [NEW] Curriculum spine admin
import debugRoutes from './routes/debug';           // [NEW] Debug routes
import adminAIRoutes from './routes/admin-ai';      // [NEW] AI Admin routes

const app = new Hono<{ Bindings: Env; Variables: { user: User | null; nonce: string } }>();

// Security Headers
// Security Headers
app.use('*', securityHeaders);



app.get('/', async (c) => {
  return c.text('FamilyPath API');
});

// CORS middleware - allows Cloudflare Pages and Lovable preview
app.use('*', corsMiddleware);




// Auth middleware
app.use('/api/*', authMiddleware);

// Mount Auth Routes
app.route('/', authRoutes);
app.route('/', profileRoutes);
app.route('/', familyRoutes);
app.route('/', studentsRoutes);     // [NEW]
app.route('/', formationsRoutes);   // [NEW]
app.route('/', libraryRoutes);      // [NEW]
app.route('/', progressRoutes);     // [NEW]
app.route('/', curriculumRoutes);
app.route('/', workRoutes);
app.route('/', analyticsRoutes);
app.route('/', exportRoutes);
app.route('/', reportsRoutes);
app.route('/api/admin', adminRoutes);
app.route('/', pathsRoutes);
app.route('/', aiRoutes);           // [NEW]
app.route('/api/anchor', anchorRoutes); // [NEW]
app.route('/', spineRoutes);        // [NEW] Curriculum spine admin (mounted at root for full path support)
app.route('/api/debug', debugRoutes);       // [NEW] Debug routes
app.route('/api/admin/ai', adminAIRoutes);  // [NEW] Admin AI Dashboard

// Global error handler with CORS
app.onError(errorHandler);




// ============ FORMATION PREFERENCES ROUTES ============

// Formation Preferences Routes - MOVED to routes/formations.ts






// ============ OBSERVATIONS ROUTES ============

// Observations & Progress Routes - MOVED to routes/progress.ts

// Students Routes - MOVED to routes/students.ts

// Books & Reading Routes - MOVED to routes/library.ts

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

// Parse natural language override
app.post('/api/overrides/parse', async (c) => {
  try {
    const user = requireAuth(c);
    const { freeText, studentId } = await c.req.json();

    if (!freeText) return c.json({ error: 'freeText is required' }, 400);

    const systemPrompt = `You are a scheduling assistant for a homeschooling app.
    Your job is to parse a parent's natural language request into a JSON structure for an "Override".
    
    Output JSON Schema:
    {
      "overrideType": "block_time" | "prioritize_subject" | "limit_subject" | "preferred_time",
      "description": "Short summary of the rule",
      "constraints": {
        "day": "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | null,
        "timeOfDay": "morning" | "afternoon" | "evening" | null,
        "subject": "math" | "reading" | "history" | null,
        "action": "block" | "boost" | "limit"
      },
      "confidence": number (0-1),
      "requiresConfirmation": boolean
    }
    
    Examples:
    "No math on Fridays" -> { "overrideType": "block_time", "description": "No Math on Fridays", "constraints": {"day": "Fri", "subject": "math", "action": "block"}, "confidence": 0.9, "requiresConfirmation": false }
    "We do history in the evenings" -> { "overrideType": "preferred_time", "description": "History in Evening", "constraints": {"timeOfDay": "evening", "subject": "history", "action": "boost"}, "confidence": 0.8, "requiresConfirmation": false }
    `;

    const response = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: freeText }
      ]
    });

    // Extract JSON
    let jsonStr = (response as any).response || '';
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const parsed = JSON.parse(jsonStr);

    return c.json({
      parsed,
      original: freeText
    });

  } catch (error: any) {
    console.error('Override parsing error:', error);
    return c.json({ error: error.message || 'Failed to parse request' }, 500);
  }
});

// ============================================
// WEEKLY TIME MODEL API
// ============================================

// Get time model for current user
// Get time model for current user
app.get('/api/time-model', async (c) => {
  try {
    const user = requireAuth(c);

    // 1. Try to get from family_preferences first (New System)
    const prefs = await c.env.DB.prepare(
      'SELECT overrides_json FROM family_preferences WHERE parent_id = ?'
    ).bind(user.id).first();

    let overrides: any = {};
    if (prefs && prefs.overrides_json) {
      try {
        overrides = JSON.parse(prefs.overrides_json as string);
      } catch (e) {
        overrides = {};
      }
    }

    // Default model
    const defaultModel = {
      availableDays: overrides.available_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      minutesPerDay: overrides.morning_minutes || 45, // Use morning_minutes as primary "time per day"
      eveningMinutes: overrides.evening_minutes || 0,
      preferredTimes: overrides.preferred_times || ['morning'],
      maxSessionsPerDay: overrides.max_sessions || 4,
      fieldTripDays: overrides.field_trip_days || []
    };

    return c.json({
      id: 'default',
      ...defaultModel,
      // Helper fields for legacy components if needed
      available_days: JSON.stringify(defaultModel.availableDays),
      preferred_times: JSON.stringify(defaultModel.preferredTimes),
      field_trip_days: JSON.stringify(defaultModel.fieldTripDays)
    });

  } catch (error: any) {
    console.error('Time model fetch error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return c.json({ error: error.message }, status);
  }
});


// Update time model
app.put('/api/time-model', async (c) => {
  try {
    const user = requireAuth(c);
    const body = await c.req.json();

    // Map legacy frontend fields to our schema
    // Frontend sends: { availableDays, minutesPerDay, preferredTimes, maxSessionsPerDay, fieldTripDays }
    // We store in family_preferences.overrides_json

    // 1. Get existing preferences
    const existing = await c.env.DB.prepare(
      'SELECT * FROM family_preferences WHERE parent_id = ?'
    ).bind(user.id).first();

    let overrides: any = {};
    if (existing && existing.overrides_json) {
      try {
        overrides = JSON.parse(existing.overrides_json as string);
      } catch (e) {
        overrides = {};
      }
    }

    // 2. Merge updates
    if (body.minutesPerDay !== undefined) overrides.morning_minutes = body.minutesPerDay;
    if (body.eveningMinutes !== undefined) overrides.evening_minutes = body.eveningMinutes;

    if (body.availableDays) overrides.available_days = body.availableDays;
    if (body.maxSessionsPerDay) overrides.max_sessions = body.maxSessionsPerDay;
    if (body.preferredTimes) overrides.preferred_times = body.preferredTimes;
    if (body.fieldTripDays) overrides.field_trip_days = body.fieldTripDays;

    const jsonStr = JSON.stringify(overrides);
    const now = new Date().toISOString();

    // 3. Upsert
    if (existing) {
      await c.env.DB.prepare(
        'UPDATE family_preferences SET overrides_json = ?, updated_at = ? WHERE parent_id = ?'
      ).bind(jsonStr, now, user.id).run();
    } else {
      const newId = generateId('fpref');
      await c.env.DB.prepare(`
         INSERT INTO family_preferences (id, parent_id, overrides_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)
       `).bind(newId, user.id, jsonStr, now, now).run();
    }

    // 4. Return compatible response
    // Frontend expects: { id: 'default', ...body }
    return c.json({
      id: existing?.id || 'new',
      ...body,
      // Echo back what we saved
      available_days: JSON.stringify(overrides.available_days || []),
      preferred_times: JSON.stringify(overrides.preferred_times || []),
      field_trip_days: JSON.stringify(overrides.field_trip_days || [])
    });

  } catch (error: any) {
    console.error('Time model update error:', error);
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
    // AND check for path traversal characters
    if (!key || !key.startsWith(`${user.id}/`) || !isValidPathSegment(key)) {
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
    if (r2Key && (!r2Key.startsWith(`${user.id}/`) || !isValidPathSegment(r2Key))) {
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
    // 1. Check for path traversal first
    if (!isValidPathSegment(key)) {
      return c.json({ error: 'Invalid key' }, 400);
    }

    // 2. Owner Access (Fast Path): Check if user is the uploader
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
// Duplicate /api/paths/today handler removed. It is handled in routes/paths.ts

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



// ============================================
// CRON JOBS & SCHEDULED TASKS
// ============================================

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log('[Cron] Scheduled event triggered at', new Date().toISOString());

    // Check if it's Sunday (0) and around 6 PM (18)
    // Note: Use cron string "0 18 * * 0" in wrangler.toml
    const now = new Date();
    // Use UTC check or loose check if triggering strictly via cron

    // For now, we assume the cron trigger is "Sunday Prep"
    // We will generate a notification for all families
    // In a real app, we batch this. 
    // Here, we'll pick the first 5 active families as a demo.

    try {
      const { results } = await env.DB.prepare(
        'SELECT id, head_of_household FROM family_profiles LIMIT 5' // simplistic
      ).all();

      for (const family of results) {
        const id = crypto.randomUUID();
        const message = "Ready to plan the week ahead? I can draft a schedule tailored to your focus.";

        // Insert into ai_action_log as a 'system_notification' or 'initiated_chat'
        // We'll use a special action type that the frontend recognizes as a "Toast" or "Chat Bubble"
        await env.DB.prepare(`
                INSERT INTO ai_action_log (id, family_id, action_type, action_data, reason, status, created_at)
                VALUES (?, ?, 'proactive_notification', ?, ?, 'pending', datetime('now'))
             `).bind(
          id,
          family.id,
          JSON.stringify({ message, title: "Sunday Prep" }),
          "Sunday Weekly Planning Routine"
        ).run();
      }
    } catch (e) {
      console.error('[Cron] Error running Sunday Prep:', e);
    }
  }
};
