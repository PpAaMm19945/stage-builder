import { Hono } from 'hono';
import { Env } from '../types';
import { SpineGenerator } from '../ai/spine-generator';
import { safeQuery } from '../lib/db';

/**
 * Admin routes for curriculum spine management
 * Simplified: Generate → Review → Approve
 */
export const spineRoutes = new Hono<{ Bindings: Env }>();

/**
 * POST /api/admin/spine/generate
 * Single-call spine generation for a subject/stage/year
 */
spineRoutes.post('/api/admin/spine/generate', async (c) => {
    try {
        const body = await c.req.json();
        const { subject, startWeek, endWeek, stage } = body;

        if (!subject || !startWeek || !endWeek || !stage) {
            return c.json({ error: 'Missing required fields: subject, startWeek, endWeek, stage' }, 400);
        }

        const validSubjects = ['literacy', 'numeracy', 'formation', 'motor'];
        if (!validSubjects.includes(subject)) {
            return c.json({ error: `Invalid subject. Must be one of: ${validSubjects.join(', ')}` }, 400);
        }

        const generator = new SpineGenerator(c.env);
        const result = await generator.generateSpine(
            subject,
            startWeek,
            endWeek,
            stage,
            c.executionCtx.waitUntil.bind(c.executionCtx)
        );

        return c.json({
            success: true,
            version: result.version,
            entriesGenerated: result.entries.length,
            message: `Generated ${result.entries.length}-week ${subject} sequence for ${stage} stage`
        });
    } catch (error) {
        console.error('[SpineRoutes] Generation error:', error);
        return c.json({ error: 'Spine generation failed', details: String(error) }, 500);
    }
});

/**
 * POST /api/admin/spine/approve
 * Approve and freeze a spine version
 */
spineRoutes.post('/api/admin/spine/approve', async (c) => {
    const body = await c.req.json();
    const { version, approvedBy } = body;

    if (!version) {
        return c.json({ error: 'Missing version' }, 400);
    }

    const generator = new SpineGenerator(c.env);
    await generator.approveSpine(version, approvedBy || 'admin');

    return c.json({ success: true, message: `Spine ${version} approved and frozen` });
});

/**
 * GET /api/admin/spine/list
 * List all spine versions and their status
 */
spineRoutes.get('/api/admin/spine/list', async (c) => {
    const result = await safeQuery<any>(c.env.DB, `
        SELECT spine_version, status, total_weeks, subjects, approved_by, approved_at, created_at
        FROM spine_metadata
        ORDER BY created_at DESC
    `, []);

    return c.json({
        versions: (result.results || []).map((row: any) => ({
            version: row.spine_version,
            status: row.status,
            totalWeeks: row.total_weeks,
            subjects: JSON.parse(row.subjects || '[]'),
            approvedBy: row.approved_by,
            approvedAt: row.approved_at,
            createdAt: row.created_at
        }))
    });
});

/**
 * GET /api/admin/spine/entries
 * Get entries for a specific spine version
 */
spineRoutes.get('/api/admin/spine/entries', async (c) => {
    const version = c.req.query('version');
    const subject = c.req.query('subject');

    if (!version) {
        return c.json({ error: 'Missing version parameter' }, 400);
    }

    let query = `SELECT * FROM curriculum_spine WHERE spine_version = ?`;
    const params: any[] = [version];

    if (subject) {
        query += ` AND subject = ?`;
        params.push(subject);
    }

    query += ` ORDER BY week_number`;

    const result = await safeQuery<any>(c.env.DB, query, params);

    return c.json({
        version,
        entries: (result.results || []).map((row: any) => ({
            id: row.id,
            subject: row.subject,
            weekNumber: row.week_number,
            stage: row.stage,
            focusArea: row.focus_area,
            skillTargets: JSON.parse(row.skill_targets || '[]'),
            faithFraming: row.faith_framing,
            approvedBy: row.approved_by
        }))
    });
});

export default spineRoutes;
