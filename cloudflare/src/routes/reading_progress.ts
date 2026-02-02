import { Hono } from 'hono';
import { Env, User } from '../types';
import { requireAuth } from '../lib/middleware';
import { generateId } from '../lib/utils';
import { safeQuery, safeQueryFirst, safeRun } from '../lib/db';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// ============ OBSERVATIONS & PROGRESS ROUTES ============

// Record an observation
app.post('/api/observations', async (c) => {
    try {
        const user = requireAuth(c);
        const body = await c.req.json();
        const { studentId, activityId, masteryLevel, parentNotes, tier } = body;

        // Verify student ownership (Use household_id)
        const student = await safeQueryFirst(c.env.DB,
            'SELECT * FROM students WHERE id = ? AND household_id = ?',
            [studentId, user.household_id]
        );

        if (!student) {
            return c.json({ error: 'Student not found' }, 404);
        }

        // Verify activity exists
        const activity = await safeQueryFirst<any>(c.env.DB, 'SELECT * FROM formations WHERE id = ?', [activityId]);

        if (!activity) {
            return c.json({ error: 'Activity not found' }, 404);
        }

        // Daily practices check
        if (activity.formation_type === 'daily_practice' && activity.assessment_prohibited === 1) {
            return c.json({ error: 'Observations cannot be recorded for daily practices' }, 400);
        }

        const observationId = generateId('ev'); // Use 'ev' for evidence

        // Map masteryLevel to habit_stage
        let habitStage = 'Seeding';
        if (masteryLevel) {
            const lower = masteryLevel.toLowerCase();
            if (lower.includes('fruit') || lower.includes('mastered')) habitStage = 'Fruiting';
            else if (lower.includes('root') || lower.includes('growing')) habitStage = 'Rooting';
            else if (lower.includes('seed') || lower.includes('started')) habitStage = 'Seeding';
            const valid = ['Seeding', 'Rooting', 'Fruiting'];
            const exact = valid.find(v => v.toLowerCase() === lower);
            if (exact) habitStage = exact;
        }

        await safeRun(c.env.DB,
            'INSERT INTO evidences (id, student_id, parent_id, formation_id, habit_stage, notes) VALUES (?, ?, ?, ?, ?, ?)',
            [observationId, studentId, user.id, activityId, habitStage, parentNotes || null]
        );

        const observation = await safeQueryFirst(c.env.DB, 'SELECT * FROM evidences WHERE id = ?', [observationId]);

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

        // Verify student ownership (Use household_id)
        const student = await safeQueryFirst(c.env.DB,
            'SELECT * FROM students WHERE id = ? AND household_id = ?',
            [studentId, user.household_id]
        );

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

        const { results } = await safeQuery(c.env.DB, query, params);

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

        // Verify student ownership (Use household_id)
        const student = await safeQueryFirst(c.env.DB,
            'SELECT * FROM students WHERE id = ? AND household_id = ?',
            [studentId, user.household_id]
        );

        if (!student) {
            return c.json({ error: 'Student not found' }, 404);
        }

        // Get formation preferences
        const prefs = await safeQueryFirst<any>(c.env.DB,
            'SELECT * FROM family_preferences WHERE parent_id = ?',
            [user.id]
        );

        const enabledStreams: string[] = [];
        if (!prefs || prefs.activities_enabled) enabledStreams.push('activity');
        if (!prefs || prefs.reading_enabled) enabledStreams.push('reading');
        if (!prefs || prefs.liturgy_enabled) enabledStreams.push('liturgy');

        // ACTIVITY PROGRESS
        const { results: byDomain } = await safeQuery(c.env.DB, `
      SELECT f.primary_virtue as domain, e.stage as mastery_level, COUNT(*) as count
      FROM evidences e
      JOIN formations f ON e.formation_id = f.id
      WHERE e.student_id = ?
      GROUP BY f.primary_virtue, e.stage
    `, [studentId]);

        // Recent activity
        const { results: recentActivity } = await safeQuery(c.env.DB, `
      SELECT DATE(e.created_at) as date, COUNT(*) as count
      FROM evidences e
      WHERE e.student_id = ? AND e.created_at > datetime('now', '-7 days')
      GROUP BY DATE(e.created_at)
      ORDER BY date
    `, [studentId]);

        // Total
        const totalResult = await safeQueryFirst<any>(c.env.DB, `
      SELECT COUNT(DISTINCT formation_id) as total FROM evidences WHERE student_id = ?
    `, [studentId]);

        const activityProgress = {
            totalCompleted: totalResult?.total || 0,
            byDomain,
            recentActivity
        };

        // READING PROGRESS
        const readingStats = await safeQueryFirst<any>(c.env.DB, `
      SELECT 
        COUNT(*) as sessions_count,
        COUNT(DISTINCT book_id) as distinct_books
      FROM reading_sessions 
      WHERE parent_id = ? 
        AND (children_present IS NULL OR children_present LIKE ?)
    `, [user.id, `%${studentId}%`]);

        const readingProgress = {
            sessionsCount: readingStats?.sessions_count || 0,
            distinctBooks: readingStats?.distinct_books || 0
        };

        // LITURGY PROGRESS
        const liturgyDaysResult = await safeQueryFirst<any>(c.env.DB, `
      SELECT COUNT(DISTINCT completed_date) as days_practiced
      FROM liturgy_completions
      WHERE parent_id = ?
    `, [user.id]);

        // Streak
        const { results: recentDays } = await safeQuery(c.env.DB, `
      SELECT DISTINCT completed_date
      FROM liturgy_completions
      WHERE parent_id = ?
      ORDER BY completed_date DESC
      LIMIT 30
    `, [user.id]);

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
            totalCompleted: activityProgress.totalCompleted,
            byDomain: activityProgress.byDomain,
            recentActivity: activityProgress.recentActivity,
            activityProgress,
            readingProgress,
            liturgyProgress
        });
    } catch (error: any) {
        return c.json({ error: error.message || 'Unauthorized' }, 401);
    }
});

// Get content progress (Book bookmark) - supports :contentId or :activityId
app.get('/api/progress/:contentId', async (c) => {
    try {
        const user = requireAuth(c);
        const contentId = c.req.param('contentId');

        // Check for existing progress
        const progress = await safeQueryFirst<{ data: string, updated_at: string }>(c.env.DB,
            'SELECT data, updated_at FROM content_progress WHERE user_id = ? AND content_id = ?',
            [user.id, contentId]
        );

        if (!progress) {
            return c.json({ progress: null });
        }

        return c.json({
            progress: {
                status: 'in_progress',
                data: JSON.parse(progress.data),
                updatedAt: progress.updated_at
            }
        });

    } catch (error: any) {
        // If table doesn't exist, return null
        return c.json({ progress: null });
    }
});

// Save content progress
app.post('/api/progress/save', async (c) => {
    try {
        const user = requireAuth(c);
        const body = await c.req.json();

        // Handle aliases from frontend api.ts
        const contentId = body.contentId || body.activityId;
        const data = body.data || body.progressData;
        const contentType = body.contentType || body.type;

        if (!contentId || !data) {
            return c.json({ error: 'Missing contentId or data' }, 400);
        }

        const id = generateId('prog');
        const now = new Date().toISOString();
        const dataJson = JSON.stringify(data);

        // Upsert
        // We use a safe upsert pattern compatible with SQLite
        const existing = await safeQueryFirst<{ id: string }>(c.env.DB,
            'SELECT id FROM content_progress WHERE user_id = ? AND content_id = ?',
            [user.id, contentId]
        );

        if (existing) {
            await safeRun(c.env.DB,
                'UPDATE content_progress SET data = ?, updated_at = ? WHERE id = ?',
                [dataJson, now, existing.id]
            );
        } else {
            // Create table if needed (lazy init) - unlikely to work here without permissions, 
            // but we assume table exists. If not, this throws and we catch.
            await safeRun(c.env.DB,
                'INSERT INTO content_progress (id, user_id, content_type, content_id, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, user.id, contentType || 'book', contentId, dataJson, now, now]
            );
        }

        return c.json({ success: true });

    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

// Export the app
export const progressRoutes = app;
