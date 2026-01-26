import { Hono } from 'hono';
import { Env, User } from '../types';
import { requireHouseholdMember } from '../lib/middleware';
import { ReportGenerator } from '../ai/report-generator';
import { getSmartWeekStart } from '../planner';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// GET /api/reports/weekly — Get weekly report
app.get('/api/reports/weekly', async (c) => {
    const user = requireHouseholdMember(c);
    // @ts-ignore - ReportGenerator constructor matching
    const generator = new ReportGenerator(c.env);
    const start = getSmartWeekStart();
    try {
        const report = await generator.generateReport(user.id, start);
        return c.json(report);
    } catch (e: any) {
        return c.text(`Error generating report: ${e.message}`, 500);
    }
});

// GET /api/reports/weekly/:date — Get historical report
app.get('/api/reports/weekly/:date', async (c) => {
    const user = requireHouseholdMember(c);
    const date = c.req.param('date');
    // @ts-ignore
    const generator = new ReportGenerator(c.env);
    // Ensure date is a valid Monday or adjust it
    const start = getSmartWeekStart(date);
    try {
        const report = await generator.generateReport(user.id, start);
        return c.json(report);
    } catch (e: any) {
        return c.text(`Error generating report: ${e.message}`, 500);
    }
});

export default app;
