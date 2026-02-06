import { Hono } from 'hono';
import { Env } from '../types';
import { SpineGenerator } from '../ai/spine-generator';
import { safeQuery, safeQueryFirst } from '../lib/db';

/**
 * Admin routes for curriculum spine management
 * These endpoints require admin authentication (to be implemented)
 */
export const spineRoutes = new Hono<{ Bindings: Env }>();

// Default source frameworks (can be expanded)
const DEFAULT_SOURCES = {
    literacy: [
        {
            name: 'Phonological Awareness Scope',
            content: `
                Week 1-4: Rhyme recognition and production
                Week 5-8: Syllable awareness (clapping, counting)
                Week 9-12: Onset-rime awareness
                Week 13-16: Initial phoneme isolation
                Week 17-20: Final phoneme isolation
                Week 21-24: Phoneme blending
                Week 25-28: Phoneme segmentation
                Week 29-32: Phoneme manipulation
            `
        },
        {
            name: 'Print Concepts',
            content: `
                - Book orientation (cover, pages, left-to-right)
                - Letter recognition (uppercase first, then lowercase)
                - Word vs letter distinction
                - Environmental print awareness
            `
        }
    ],
    numeracy: [
        {
            name: 'Early Number Sense',
            content: `
                Week 1-4: Counting to 5 (rote and with objects)
                Week 5-8: Counting to 10
                Week 9-12: One-to-one correspondence
                Week 13-16: Comparing quantities (more/less/same)
                Week 17-20: Counting to 20
                Week 21-24: Number recognition 1-10
                Week 25-28: Simple patterns (AB, ABC)
                Week 29-32: Shapes (circle, square, triangle)
            `
        }
    ],
    formation: [
        {
            name: 'Westminster Shorter Catechism',
            content: `
                Q1-10: God and His glory
                Q11-20: Creation and providence
                Q21-30: The fall and sin
                Q31-40: Christ the redeemer
                Q41-50: Application of redemption
            `
        },
        {
            name: 'Virtue Formation',
            content: `
                - Obedience to parents
                - Truthfulness
                - Kindness and gentleness
                - Self-control
                - Gratitude
            `
        }
    ],
    african_history: [
        {
            name: 'African Heritage (Age-Appropriate)',
            content: `
                - Creation stories from African traditions (aligned with biblical truth)
                - Famous African Christians (Augustine, Ethiopian church history)
                - African kingdoms and civilizations (Axum, Great Zimbabwe, Mali)
                - African proverbs and wisdom literature
                - Contemporary African leaders of faith
            `
        }
    ]
};

/**
 * POST /api/admin/spine/generate
 * Trigger multi-call spine generation for a subject
 */
spineRoutes.post('/api/admin/spine/generate', async (c) => {
    try {
        const body = await c.req.json();
        const { subject, startWeek, endWeek, stage } = body;

        if (!subject || !startWeek || !endWeek || !stage) {
            return c.json({ error: 'Missing required fields: subject, startWeek, endWeek, stage' }, 400);
        }

        const sources = DEFAULT_SOURCES[subject as keyof typeof DEFAULT_SOURCES] || [];
        if (sources.length === 0) {
            return c.json({ error: `No sources defined for subject: ${subject}` }, 400);
        }

        const generator = new SpineGenerator(c.env);
        const result = await generator.generateSpine(
            subject,
            startWeek,
            endWeek,
            stage,
            sources,
            c.executionCtx.waitUntil.bind(c.executionCtx)
        );

        return c.json({
            success: true,
            version: result.version,
            entriesGenerated: result.consensusEntries.length,
            conflictsFound: result.conflicts.length,
            conflicts: result.conflicts,
            message: result.conflicts.length > 0
                ? `Generated spine with ${result.conflicts.length} conflicts requiring review`
                : 'Spine generated with full consensus'
        });
    } catch (error) {
        console.error('[SpineRoutes] Generation error:', error);
        return c.json({ error: 'Spine generation failed', details: String(error) }, 500);
    }
});

/**
 * GET /api/admin/spine/conflicts
 * Get pending conflicts for a spine version
 */
spineRoutes.get('/api/admin/spine/conflicts', async (c) => {
    const version = c.req.query('version');
    if (!version) {
        return c.json({ error: 'Missing version parameter' }, 400);
    }

    const generator = new SpineGenerator(c.env);
    const conflicts = await generator.getPendingConflicts(version);

    return c.json({ version, conflicts });
});

/**
 * POST /api/admin/spine/resolve
 * Resolve a conflict by selecting preferred draft
 */
spineRoutes.post('/api/admin/spine/resolve', async (c) => {
    const body = await c.req.json();
    const { version, weekNumber, selectedDraftId, resolvedBy } = body;

    if (!version || !weekNumber || !selectedDraftId) {
        return c.json({ error: 'Missing required fields' }, 400);
    }

    const generator = new SpineGenerator(c.env);
    await generator.resolveConflict(version, weekNumber, selectedDraftId, resolvedBy || 'admin');

    return c.json({ success: true, message: `Conflict for week ${weekNumber} resolved` });
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
            confidence: row.confidence,
            approvedBy: row.approved_by
        }))
    });
});

export default spineRoutes;
