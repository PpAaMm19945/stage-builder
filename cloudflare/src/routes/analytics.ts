import { Hono } from 'hono';
import { Env, User } from '../types';
import { requireParent } from '../lib/middleware';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// Get time spent this week aggregated by student
app.get('/api/analytics/time-spent', async (c) => {
    try {
        const user = requireParent(c);

        // Get all students for this household/parent
        let studentIds: string[] = [];
        if (user.household_id) {
            const { results } = await c.env.DB.prepare(
                'SELECT id FROM students WHERE household_id = ?'
            ).bind(user.household_id).all();
            studentIds = results.map((s: any) => s.id);
        }

        if (studentIds.length === 0) {
            return c.json({ students: [], totalMinutes: 0 });
        }

        // Get time spent per student in the last 7 days
        const placeholders = studentIds.map(() => '?').join(',');
        const { results: timeData } = await c.env.DB.prepare(`
      SELECT 
        e.student_id,
        s.name as student_name,
        COALESCE(SUM(e.duration_minutes), 0) as total_minutes,
        COUNT(*) as formations_completed
      FROM evidences e
      JOIN students s ON e.student_id = s.id
      WHERE e.student_id IN (${placeholders})
        AND e.captured_at > datetime('now', '-7 days')
        AND e.duration_minutes IS NOT NULL
      GROUP BY e.student_id
    `).bind(...studentIds).all();

        const totalMinutes = timeData.reduce((acc: number, row: any) => acc + (row.total_minutes || 0), 0);

        return c.json({
            students: timeData,
            totalMinutes,
            weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
    } catch (error: any) {
        console.error("Time Spent Analytics Error:", error);
        return c.json({ error: error.message || 'Failed to get analytics' }, 500);
    }
});

export default app;
