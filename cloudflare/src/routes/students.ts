import { Hono } from 'hono';
import { Env, User } from '../types';
import { requireParent, requireHouseholdMember, requireAuth } from '../lib/middleware';
import { generateId } from '../lib/utils';
import { safeQuery, safeQueryFirst, safeRun } from '../lib/db';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// ============ STUDENTS (CHILDREN) ROUTES ============

// Get all children for current user
app.get('/api/students', async (c) => {
    try {
        const user = requireHouseholdMember(c); // Students can verify list of siblings? Or just parents? Assuming members.

        let results: any[] = [];
        if (user.household_id) {
            const query = await safeQuery(c.env.DB,
                'SELECT * FROM students WHERE household_id = ? ORDER BY created_at',
                [user.household_id]
            );
            results = query.results;
        }

        // Parse JSON fields
        const parsedResults = results.map((student: any) => ({
            ...student,
            independence_settings: JSON.parse(student.independence_settings || '{}'),
            pace_overrides: JSON.parse(student.pace_overrides || 'null')
        }));

        return c.json(parsedResults);
    } catch (error: any) {
        console.error('Students list error:', error);
        const status = error.message === 'Unauthorized' ? 401 : 500;
        return c.json({ error: error.message || 'Internal Server Error' }, status);
    }
});

// Add a child (max 5)
app.post('/api/students', async (c) => {
    try {
        const user = requireParent(c);

        if (!user.household_id) {
            return c.json({ error: 'Household not set up' }, 400);
        }

        // Check limit
        const { results: existing } = await safeQuery(c.env.DB,
            'SELECT COUNT(*) as count FROM students WHERE household_id = ?',
            [user.household_id]
        );

        if ((existing[0] as any).count >= 5) {
            return c.json({ error: 'Maximum 5 children allowed. Contact support for more.' }, 400);
        }

        const body = await c.req.json();
        const { name, dateOfBirth } = body;

        const studentId = generateId('student');

        // V2 Schema: no age_in_months, no current_stage, use household_id
        await safeRun(c.env.DB,
            'INSERT INTO students (id, household_id, name, date_of_birth) VALUES (?, ?, ?, ?)',
            [studentId, user.household_id, name, dateOfBirth]
        );

        const student = await safeQueryFirst(c.env.DB,
            'SELECT * FROM students WHERE id = ?',
            [studentId]
        );

        return c.json(student, 201);
    } catch (error: any) {
        return c.json({ error: error.message || 'Failed to add child' }, 400);
    }
});

// Update a child
app.put('/api/students/:id', async (c) => {
    try {
        const user = requireParent(c);
        const studentId = c.req.param('id');
        const body = await c.req.json();

        // Verify ownership
        const existing = await safeQueryFirst(c.env.DB,
            'SELECT * FROM students WHERE id = ? AND household_id = ?',
            [studentId, user.household_id]
        );

        if (!existing) {
            return c.json({ error: 'Child not found' }, 404);
        }

        const { name, dateOfBirth, avatarUrl, independence_settings, pace_overrides } = body;

        await safeRun(c.env.DB,
            'UPDATE students SET name = COALESCE(?, name), date_of_birth = COALESCE(?, date_of_birth), avatar_url = COALESCE(?, avatar_url), independence_settings = COALESCE(?, independence_settings), pace_overrides = COALESCE(?, pace_overrides), updated_at = datetime("now") WHERE id = ?',
            [name || null, dateOfBirth || null, avatarUrl || null, independence_settings ? JSON.stringify(independence_settings) : null, pace_overrides ? JSON.stringify(pace_overrides) : null, studentId]
        );

        const student = await safeQueryFirst(c.env.DB,
            'SELECT * FROM students WHERE id = ?',
            [studentId]
        );

        // Parse for response
        if (student) {
            (student as any).independence_settings = JSON.parse((student as any).independence_settings || '{}');
            (student as any).pace_overrides = JSON.parse((student as any).pace_overrides || 'null');
        }

        return c.json(student);
    } catch (error: any) {
        return c.json({ error: error.message || 'Failed to update child' }, 400);
    }
});

// Delete a child
app.delete('/api/students/:id', async (c) => {
    try {
        const user = requireParent(c); // Strict: only parent can delete
        const studentId = c.req.param('id');

        // Verify ownership (Use household_id, not parent_id)
        const student = await safeQueryFirst(c.env.DB,
            'SELECT * FROM students WHERE id = ? AND household_id = ?',
            [studentId, user.household_id]
        );

        if (!student) {
            return c.json({ error: 'Student not found' }, 404);
        }

        // Delete related records first (cascade)
        // Note: Using safeRun individually.
        await safeRun(c.env.DB, 'DELETE FROM observations WHERE student_id = ?', [studentId]);

        // daily_recommendations is legacy, but safe to try to delete if it exists. 
        // If table is gone, safeRun might throw.
        // We wrap in try/catch or just ignore. 
        // Ideally should check if table exists but that's expensive.
        // I will attempt simple delete.
        try {
            await safeRun(c.env.DB, 'DELETE FROM daily_recommendations WHERE student_id = ?', [studentId]);
        } catch (e) { /* ignore */ }

        // Delete the student
        await safeRun(c.env.DB, 'DELETE FROM students WHERE id = ?', [studentId]);

        return c.json({ success: true });
    } catch (error: any) {
        return c.json({ error: error.message || 'Failed to delete child' }, 400);
    }
});

export default app;
