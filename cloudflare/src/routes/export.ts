import { Hono } from 'hono';
import { Env, User } from '../types';
import { requireHouseholdMember } from '../lib/middleware';
import { PdfService } from '../services/pdf-service';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

app.get('/api/export/transcript/:studentId', async (c) => {
    const studentId = c.req.param('studentId');
    const user = requireHouseholdMember(c); // Ensure user has access

    // 1. Get Student
    const student = await c.env.DB.prepare('SELECT * FROM students WHERE id = ?').bind(studentId).first<any>();
    if (!student) return c.text('Student not found', 404);

    // Security check: User must be in same household as student
    if (user.household_id !== student.household_id) return c.text('Unauthorized', 403);

    // 2. Fetch Evidences (Formations)
    const evidences = await c.env.DB.prepare(`
    SELECT e.duration_minutes, f.title, f.primary_virtue, f.cluster_tag, f.formation_type, strftime('%Y', e.captured_at) as year
    FROM evidences e
    JOIN formations f ON e.formation_id = f.id
    WHERE e.student_id = ?
  `).bind(studentId).all<any>();

    // 3. Fetch Apprenticeships (Work)
    const workEntries = await c.env.DB.prepare(`
    SELECT a.title, a.organization_name, a.type, SUM(w.hours) as total_hours
    FROM apprenticeships a
    JOIN work_entries w ON w.apprenticeship_id = a.id
    WHERE a.student_id = ? AND w.status = 'approved'
    GROUP BY a.id
  `).bind(studentId).all<any>();

    // 4. Aggregate Data
    const courseMap = new Map<string, { title: string, year: string, minutes: number }>();

    for (const ev of evidences.results) {
        if (!ev.duration_minutes) continue;

        // Grouping Strategy: Subject (Cluster) + Year
        const subject = ev.cluster_tag || ev.primary_virtue || 'General';
        const year = ev.year || 'Unknown';
        const key = `${subject}-${year}`;

        if (!courseMap.has(key)) {
            courseMap.set(key, { title: subject, year, minutes: 0 });
        }
        const entry = courseMap.get(key)!;
        entry.minutes += ev.duration_minutes;
    }

    const courses: any[] = [];
    let totalCredits = 0;

    for (const [key, data] of courseMap.entries()) {
        const hours = data.minutes / 60;
        const credits = hours / 120; // Carnegie Unit
        if (credits < 0.1) continue; // Filter out tiny entries

        totalCredits += credits;
        courses.push({
            subject: data.title,
            title: `${data.title} Studies`, // Can refine this name
            year: data.year,
            credits: credits,
            grade: 'Pass', // Defaulting to Pass for now
        });
    }

    // Work to Activities
    const activities = workEntries.results.map((w: any) => ({
        role: w.title,
        organization: w.organization_name || 'Self-Directed',
        hours: w.total_hours,
        description: `Type: ${w.type}`
    }));

    // 5. Generate PDF
    const pdfBytes = await PdfService.generateTranscript({
        studentName: student.name,
        dateOfBirth: student.date_of_birth,
        graduationDate: undefined, // Could add this to student schema later
        courses,
        activities,
        totalCredits
    });

    return new Response(pdfBytes, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${student.name}_Transcript.pdf"`
        }
    });
});

app.get('/api/export/diploma/:studentId', async (c) => {
    const studentId = c.req.param('studentId');
    const user = requireHouseholdMember(c);

    const student = await c.env.DB.prepare('SELECT * FROM students WHERE id = ?').bind(studentId).first<any>();
    if (!student) return c.text('Student not found', 404);

    if (user.household_id !== student.household_id) return c.text('Unauthorized', 403);

    const pdfBytes = await PdfService.generateDiploma(student.name, new Date().toLocaleDateString());

    return new Response(pdfBytes, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${student.name}_Diploma.pdf"`
        }
    });
});

export default app;
