import { Hono } from 'hono';
import { Env, User } from '../types';
import { requireParent } from '../lib/middleware';
import { AnchorGenerator } from '../ai/anchor-generator';
import { ArcGenerator } from '../ai/arc-generator';

/**
 * Debug routes for testing and troubleshooting
 * Should be disabled in production
 */
const debug = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// GET /api/debug/status - Overall system status
debug.get('/status', async (c) => {
    try {
        const user = requireParent(c);
        const householdId = user.household_id || user.id;

        console.log('[Debug] 🔍 Status check for household:', householdId);

        // Check database connectivity
        const dbCheck = await c.env.DB.prepare('SELECT 1 as ok').first();
        console.log('[Debug] Database check:', dbCheck);

        // Check for active arc
        const arcResult = await c.env.DB.prepare(`
            SELECT id, arc_start_date, status 
            FROM formation_arcs 
            WHERE household_id = ? AND status = 'active'
        `).bind(householdId).all();

        // Check for today's anchor
        const today = new Date().toISOString().split('T')[0];
        const anchorResult = await c.env.DB.prepare(`
            SELECT id, anchor_date, status, created_at 
            FROM daily_anchors 
            WHERE household_id = ? AND anchor_date = ?
        `).bind(householdId, today).all();

        // Check children
        const childrenResult = await c.env.DB.prepare(`
            SELECT id, name, date_of_birth 
            FROM students 
            WHERE household_id = ?
        `).bind(householdId).all();

        // Check curriculum positions
        const positionsResult = await c.env.DB.prepare(`
            SELECT subject_id, current_week 
            FROM family_curriculum_position 
            WHERE household_id = ?
        `).bind(householdId).all();

        const status = {
            timestamp: new Date().toISOString(),
            householdId,
            database: dbCheck?.ok === 1 ? 'connected' : 'error',
            activeArc: arcResult.results.length > 0 ? arcResult.results[0] : null,
            todayAnchor: anchorResult.results.length > 0 ? anchorResult.results[0] : null,
            children: childrenResult.results.map((c: any) => ({
                name: c.name,
                dob: c.date_of_birth
            })),
            curriculumPositions: positionsResult.results
        };

        console.log('[Debug] ✅ Status:', JSON.stringify(status, null, 2));
        return c.json(status);

    } catch (e: any) {
        console.error('[Debug] ❌ Status error:', e);
        return c.json({ error: e.message, stack: e.stack }, 500);
    }
});

// GET /api/debug/arc - Get raw arc data
debug.get('/arc', async (c) => {
    try {
        const user = requireParent(c);
        const householdId = user.household_id || user.id;

        console.log('[Debug] 🎯 Fetching arc for:', householdId);

        const arcsResult = await c.env.DB.prepare(`
            SELECT * FROM formation_arcs 
            WHERE household_id = ? 
            ORDER BY created_at DESC 
            LIMIT 3
        `).bind(householdId).all();

        const result = arcsResult.results.map((arc: any) => ({
            ...arc,
            arc_data: arc.arc_data ? JSON.parse(arc.arc_data) : null
        }));

        console.log('[Debug] ✅ Found', result.length, 'arcs');
        return c.json(result);

    } catch (e: any) {
        console.error('[Debug] ❌ Arc error:', e);
        return c.json({ error: e.message }, 500);
    }
});

// GET /api/debug/anchors - Get recent anchors
debug.get('/anchors', async (c) => {
    try {
        const user = requireParent(c);
        const householdId = user.household_id || user.id;

        console.log('[Debug] 📅 Fetching anchors for:', householdId);

        const anchorsResult = await c.env.DB.prepare(`
            SELECT id, anchor_date, status, completion_feedback, 
                   skipped_at, skip_reason, created_at
            FROM daily_anchors 
            WHERE household_id = ? 
            ORDER BY anchor_date DESC 
            LIMIT 14
        `).bind(householdId).all();

        console.log('[Debug] ✅ Found', anchorsResult.results.length, 'anchors');
        return c.json(anchorsResult.results);

    } catch (e: any) {
        console.error('[Debug] ❌ Anchors error:', e);
        return c.json({ error: e.message }, 500);
    }
});

// POST /api/debug/force-arc - Force regenerate arc
debug.post('/force-arc', async (c) => {
    try {
        const user = requireParent(c);
        const householdId = user.household_id || user.id;

        console.log('[Debug] 🔄 Force regenerating arc for:', householdId);

        // Mark existing arcs as superseded
        await c.env.DB.prepare(`
            UPDATE formation_arcs 
            SET status = 'superseded' 
            WHERE household_id = ? AND status = 'active'
        `).bind(householdId).run();

        // Generate new arc
        const arcGenerator = new ArcGenerator(c.env);
        const result = await arcGenerator.generateArc(householdId, 'Debug-forced regeneration');

        console.log('[Debug] ✅ New arc generated:', result.arc.id);
        return c.json({
            success: true,
            arcId: result.arc.id,
            startDate: result.arc.arc_start_date,
            dailyPlansCount: result.arc.daily_plans?.length || 0
        });

    } catch (e: any) {
        console.error('[Debug] ❌ Force arc error:', e);
        return c.json({ error: e.message, stack: e.stack }, 500);
    }
});

// POST /api/debug/force-anchor - Force regenerate today's anchor
debug.post('/force-anchor', async (c) => {
    try {
        const user = requireParent(c);
        const householdId = user.household_id || user.id;
        const today = new Date().toISOString().split('T')[0];

        console.log('[Debug] 🔄 Force regenerating anchor for:', householdId, today);

        // Mark existing anchor as superseded
        await c.env.DB.prepare(`
            UPDATE daily_anchors 
            SET status = 'superseded' 
            WHERE household_id = ? AND anchor_date = ? AND status = 'active'
        `).bind(householdId, today).run();

        // Generate new anchor
        const anchorGenerator = new AnchorGenerator(c.env);
        const anchor = await anchorGenerator.generateAnchor(householdId, today, {
            adjustments: 'Debug-forced regeneration'
        });

        console.log('[Debug] ✅ New anchor generated:', anchor.id);
        return c.json({
            success: true,
            anchor
        });

    } catch (e: any) {
        console.error('[Debug] ❌ Force anchor error:', e);
        return c.json({ error: e.message, stack: e.stack }, 500);
    }
});

// GET /api/debug/progress - Get child progress data
debug.get('/progress', async (c) => {
    try {
        const user = requireParent(c);
        const householdId = user.household_id || user.id;

        console.log('[Debug] 📊 Fetching progress for:', householdId);

        // Get children first
        const childrenResult = await c.env.DB.prepare(`
            SELECT id, name FROM students WHERE household_id = ?
        `).bind(householdId).all();

        // Get progress for each child
        const childProgress = await Promise.all(childrenResult.results.map(async (child: any) => {
            const progressResult = await c.env.DB.prepare(`
                SELECT subject_id, skill_code, mastery_level, practice_count
                FROM child_progress 
                WHERE child_id = ?
                ORDER BY updated_at DESC
                LIMIT 20
            `).bind(child.id).all();

            return {
                childId: child.id,
                childName: child.name,
                skills: progressResult.results
            };
        }));

        console.log('[Debug] ✅ Progress data fetched');
        return c.json(childProgress);

    } catch (e: any) {
        console.error('[Debug] ❌ Progress error:', e);
        return c.json({ error: e.message }, 500);
    }
});

// GET /api/debug/logs - Get recent AI interaction logs
debug.get('/logs', async (c) => {
    try {
        const user = requireParent(c);

        // This returns what we can from interaction logs
        const logsResult = await c.env.DB.prepare(`
            SELECT * FROM ai_interaction_logs 
            WHERE parent_id = ?
            ORDER BY created_at DESC 
            LIMIT 50
        `).bind(user.id).all();

        return c.json(logsResult.results);

    } catch (e: any) {
        console.error('[Debug] ❌ Logs error:', e);
        return c.json({ error: e.message }, 500);
    }
});

export default debug;

