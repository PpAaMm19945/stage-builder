import { Hono } from 'hono';
import { Env, User } from '../types';
import { requireAuth, requireParent } from '../lib/middleware';
import { generateId } from '../lib/utils';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// Log Work Entry
app.post('/api/work/log', async (c) => {
    try {
        const user = requireAuth(c);
        // User can be student or parent logging on behalf
        const body = await c.req.json();
        const { apprenticeshipId, date, hours, description, photoUrl, skillsApplied } = body;

        if (!apprenticeshipId || !date || !hours || !description) {
            return c.json({ error: 'Missing required fields' }, 400);
        }

        const id = generateId('work');
        const now = new Date().toISOString();

        // Verify apprenticeship exists and belongs to student (or student in household)
        const apprenticeship = await c.env.DB.prepare(
            'SELECT * FROM apprenticeships WHERE id = ?'
        ).bind(apprenticeshipId).first<{ student_id: string }>();

        if (!apprenticeship) {
            return c.json({ error: 'Apprenticeship not found' }, 404);
        }

        // Security: Verify ownership/permission
        if (user.role === 'student') {
            if (apprenticeship.student_id !== user.student_id) {
                return c.json({ error: 'Unauthorized: You can only log work for your own apprenticeships' }, 403);
            }
        } else {
            // Parent: Check if student belongs to household
            const student = await c.env.DB.prepare(
                'SELECT * FROM students WHERE id = ? AND household_id = ?'
            ).bind(apprenticeship.student_id, user.household_id).first();

            if (!student) {
                return c.json({ error: 'Unauthorized: Student not in household' }, 403);
            }
        }

        await c.env.DB.prepare(`
      INSERT INTO work_entries (id, apprenticeship_id, date, hours, description, photo_url, skills_applied, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).bind(
            id,
            apprenticeshipId,
            date,
            hours,
            description,
            photoUrl || null,
            skillsApplied ? JSON.stringify(skillsApplied) : '[]',
            now,
            now
        ).run();

        return c.json({ success: true, id });
    } catch (e: any) {
        return c.json({ error: e.message || 'Failed to log work' }, 500);
    }
});

// Get Active Apprenticeships (for Dropdown)
app.get('/api/apprenticeships', async (c) => {
    try {
        const user = requireAuth(c);
        let studentId = user.student_id;

        let query = '';
        let params: any[] = [];

        if (user.role === 'student' && studentId) {
            query = `SELECT * FROM apprenticeships WHERE student_id = ? AND status = 'active'`;
            params = [studentId];
        } else if (user.role === 'parent' && user.household_id) {
            query = `
                SELECT a.*, s.name as student_name 
                FROM apprenticeships a
                JOIN students s ON a.student_id = s.id
                WHERE s.household_id = ? AND a.status = 'active'
             `;
            params = [user.household_id];
        } else {
            return c.json([]);
        }

        const { results } = await c.env.DB.prepare(query).bind(...params).all();

        const parsed = results.map((r: any) => ({
            ...r,
            skills_learned: JSON.parse(r.skills_learned || '[]')
        }));

        return c.json(parsed);

    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Get Pending Work Entries (For Parents)
app.get('/api/work/pending', async (c) => {
    try {
        const user = requireParent(c);

        // Get entries for all students in household
        const query = `
      SELECT 
        w.*,
        a.title as apprenticeship_title,
        s.name as student_name,
        s.avatar_url as student_avatar
      FROM work_entries w
      JOIN apprenticeships a ON w.apprenticeship_id = a.id
      JOIN students s ON a.student_id = s.id
      WHERE s.household_id = ? AND w.status = 'pending'
      ORDER BY w.date DESC
    `;

        const { results } = await c.env.DB.prepare(query)
            .bind(user.household_id)
            .all();

        const parsed = results.map((r: any) => ({
            ...r,
            skills_applied: JSON.parse(r.skills_applied || '[]')
        }));

        return c.json(parsed);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Approve/Reject Work Entry
app.put('/api/work/approve/:id', async (c) => {
    try {
        const user = requireParent(c);
        const id = c.req.param('id');
        const { status, supervisorNote } = await c.req.json();

        if (!['approved', 'rejected'].includes(status)) {
            return c.json({ error: 'Invalid status' }, 400);
        }

        // Verify entry belongs to household
        const entry = await c.env.DB.prepare(`
      SELECT w.id 
      FROM work_entries w
      JOIN apprenticeships a ON w.apprenticeship_id = a.id
      JOIN students s ON a.student_id = s.id
      WHERE w.id = ? AND s.household_id = ?
    `).bind(id, user.household_id).first();

        if (!entry) {
            return c.json({ error: 'Entry not found or unauthorized' }, 404);
        }

        await c.env.DB.prepare(`
      UPDATE work_entries 
      SET status = ?, supervisor_note = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(status, supervisorNote || null, id).run();

        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

export default app;
