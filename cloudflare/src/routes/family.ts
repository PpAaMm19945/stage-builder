import { Hono } from 'hono';
import { Env, User } from '../types';
import { requireHouseholdMember, requireParent, requireAuth } from '../lib/middleware';
import { generateId } from '../lib/utils';
import { getSmartWeekStart } from '../planner';
import { RhythmGenerator } from '../ai/rhythm-generator';
import { safeQuery, safeQueryFirst, safeRun } from '../lib/db';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// Student Routes - MOVED to routes/students.ts

// Get notifications
app.get('/api/notifications', async (c) => {
    try {
        const user = requireParent(c);
        const notifications: any[] = [];
        const today = new Date().toISOString().split('T')[0];

        // 1. Milestone Triggers
        try {
            const { results: virtueCounts } = await safeQuery(c.env.DB, `
        SELECT f.primary_virtue as virtue, COUNT(*) as count
        FROM evidences e
        JOIN formations f ON e.formation_id = f.id
        WHERE e.student_id IN(SELECT id FROM students WHERE household_id = ?)
        GROUP BY f.primary_virtue
        HAVING count >= 5
    `, [user.household_id]);

            virtueCounts.forEach((v: any) => {
                if (v.count % 10 === 0 && v.count > 0) {
                    notifications.push({
                        id: `milestone - ${v.virtue} -${v.count} `,
                        type: 'milestone',
                        title: `Milestone Unlocked!`,
                        message: `Your family has completed ${v.count} formations in the virtue of ${v.virtue} !`,
                        date: today
                    });
                }
            });
        } catch (e: any) {
            console.error('Milestone notification error:', e);
        }

        // 2. Coverage Alerts & Encouragement
        try {
            const { results: recentVirtues } = await safeQuery(c.env.DB, `
        SELECT DISTINCT f.primary_virtue as virtue
        FROM evidences e
        JOIN formations f ON e.formation_id = f.id
        WHERE e.student_id IN(SELECT id FROM students WHERE household_id = ?)
        AND e.created_at > datetime('now', '-14 days')
    `, [user.household_id]);

            const recentVirtueSet = new Set(recentVirtues.map((r: any) => r.virtue));
            const allVirtues = ['Wisdom', 'Stewardship', 'Love', 'Order', 'Wonder'];

            if (recentVirtues.length > 0) {
                const missing = allVirtues.find(v => !recentVirtueSet.has(v));
                if (missing) {
                    notifications.push({
                        id: `alert - missing - ${missing} `,
                        type: 'alert',
                        title: 'Coverage Alert',
                        message: `You haven't focused on the virtue of ${missing} recently.`,
                        date: today
                    });
                }
            }

            // Encouragement
            if (recentVirtues.length >= 3) {
                notifications.push({
                    id: `enc-balance-${today}`,
                    type: 'encouragement',
                    title: 'Great Balance!',
                    message: 'You are cultivating a wide range of virtues this week.',
                    date: today
                });
            }
        } catch (e: any) {
            console.error('Coverage/Balance notification error:', e);
        }

        // Limit to 2 for the UI stack
        return c.json(notifications.slice(0, 2));

    } catch (error: any) {
        console.error('Notifications API error:', error);
        return c.json({ error: error.message }, 500);
    }
});

// Get tomorrow's preview
app.get('/api/family/tomorrow-preview', async (c) => {
    try {
        const user = requireParent(c);

        // Calculate tomorrow's date
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][tomorrow.getDay()];

        const availableDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']; // Default

        if (!availableDays.includes(dayOfWeek)) {
            return c.json({
                date: tomorrow.toISOString().split('T')[0],
                restDay: true,
                summary: "Tomorrow is a rest day. Enjoy time together!"
            });
        }

        // Get plan
        const weekStart = getSmartWeekStart();

        // Check V2 only
        const plan = await safeQueryFirst<any>(c.env.DB,
            'SELECT plan_data as plan_json FROM weekly_plans_v2 WHERE family_id = ? AND week_start = ?',
            [user.household_id, weekStart]
        );

        if (!plan) {
            return c.json({
                date: tomorrow.toISOString().split('T')[0],
                needsPlan: true,
                summary: "You don't have a plan for tomorrow yet."
            });
        }

        const planData = JSON.parse(plan.plan_json);
        const tomorrowSlots = planData.slots.filter((s: any) => s.day === dayOfWeek);

        // Fetch details
        const activityIds = tomorrowSlots.map((s: any) => s.activityId);
        let activities: any[] = [];

        if (activityIds.length > 0) {
            const placeholders = activityIds.map(() => '?').join(',');
            const { results } = await safeQuery(c.env.DB, `
            SELECT id, title, description, primary_virtue as domain FROM formations WHERE id IN (${placeholders})
        `, activityIds);
            activities = results;
        }

        // Generate AI Summary (lightweight)
        let summary = `You have ${activities.length} activities planned for tomorrow.`;
        if (activities.length > 0) {
            const domains = [...new Set(activities.map((a: any) => a.domain))];
            summary += ` Focus areas include ${domains.join(', ')}.`;
        }

        return c.json({
            date: tomorrow.toISOString().split('T')[0],
            activities,
            summary
        });

    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

// Helper function to fetch daily practices
async function getDailyPractices(db: any) {
    const { results: dailyPractices } = await safeQuery(db, `
    SELECT * FROM formations 
    WHERE formation_type = 'daily_practice' AND is_active = 1
    ORDER BY RANDOM() LIMIT 3
  `);

    return dailyPractices.map((formation: any) => ({
        ...formation,
        materials: JSON.parse(formation.materials || '[]'),
        guide_steps: JSON.parse(formation.guide_steps || '[]'),
        success_indicators: JSON.parse(formation.success_indicators || '[]'),
        tips: JSON.parse(formation.tips || '[]'),
    }));
}

// Shared helper for getting today's family dashboard data
async function getFamilyToday(c: any) {
    try {
        const user = requireHouseholdMember(c);

        // Get all children for the household
        let children: any[] = [];
        if (user.household_id) {
            children = (await safeQuery(c.env.DB,
                'SELECT * FROM students WHERE household_id = ? ORDER BY date_of_birth DESC',
                [user.household_id]
            )).results || [];
        }

        if (children.length === 0) {
            return c.json({
                date: new Date().toISOString().split('T')[0],
                children: [],
                familySessions: [],
                materials: [],
                totalDuration: 0,
                coreKitCoverage: 0
            });
        }

        // 1. Get today's day of week
        const today = new Date();
        const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()];

        // 2. Check if today is an available day
        const prefs = await safeQueryFirst<any>(c.env.DB,
            'SELECT overrides_json FROM family_preferences WHERE parent_id = ?',
            [user.id]
        );
        const overrides = prefs ? JSON.parse(prefs.overrides_json || '{}') : {};
        const availableDays = overrides.available_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

        // 3. If not an available day, return REST DAY response
        if (!availableDays.includes(dayOfWeek)) {
            const dailyPractices = await getDailyPractices(c.env.DB);

            return c.json({
                date: new Date().toISOString().split('T')[0],
                children,
                restDay: true,
                message: "Today is a rest day! Here are some gentle practices you can do if you'd like.",
                familySessions: [],
                dailyPractices,
                materials: [],
                totalDuration: 0,
                coreKitCoverage: 0
            });
        }

        // 4. Get this week's plan from V2 (Unified Schema)
        const weekStart = getSmartWeekStart();
        const plan = await safeQueryFirst<any>(c.env.DB,
            'SELECT plan_data as plan_json FROM weekly_plans_v2 WHERE family_id = ? AND week_start = ?',
            [user.household_id, weekStart]
        );

        // 5. If no plan exists, prompt to generate
        if (!plan) {
            const dailyPractices = await getDailyPractices(c.env.DB);

            return c.json({
                date: new Date().toISOString().split('T')[0],
                children,
                needsPlan: true,
                message: "Let's plan your week! Generate a schedule to get personalized activities.",
                familySessions: [],
                dailyPractices,
                materials: [],
                totalDuration: 0,
                coreKitCoverage: 0
            });
        }

        // 6. Return today's activities from the plan
        const planData = JSON.parse(plan.plan_json);
        // Safely access slots, default to empty if undefined
        const todaysSlots = (planData.slots || []).filter((s: any) => s.day === dayOfWeek);

        // Hydrate formations
        const activityIds = todaysSlots.map((s: any) => s.activityId); // Retain 'activityId' in slots for back-compat
        let familySessions: any[] = [];
        let materialsList: any[] = [];

        if (activityIds.length > 0) {
            const placeholders = activityIds.map(() => '?').join(',');
            const { results: formations } = await safeQuery(c.env.DB, `
            SELECT * FROM formations WHERE id IN (${placeholders})
        `, activityIds);

            const formationMap = new Map(formations.map((f: any) => [f.id, f]));

            familySessions = todaysSlots.map((slot: any) => {
                const formation: any = formationMap.get(slot.activityId);
                if (!formation) return null;

                const tiers = JSON.parse(formation.tiered_expectations || '[]');
                const childTiers = children.map((child: any) => {
                    const age = child.age_in_months;
                    let tier = tiers.find((t: any) => age >= t.age_min && age <= t.age_max);
                    if (!tier) {
                        if (age < tiers[0]?.age_min) tier = tiers[0];
                        else if (age > tiers[tiers.length - 1]?.age_max) tier = tiers[tiers.length - 1];
                    }
                    return {
                        childId: child.id,
                        childName: child.name,
                        tier: tier?.tier || 'Standard',
                        expectation: tier?.expectation || 'Participate with support',
                        childAge: age
                    };
                });

                return {
                    formation: {
                        ...formation,
                        materials: JSON.parse(formation.materials || '[]'),
                        guide_steps: JSON.parse(formation.guide_steps || '[]'),
                        success_indicators: JSON.parse(formation.success_indicators || '[]'),
                        tips: JSON.parse(formation.tips || '[]'),
                    },
                    childTiers,
                    messLevel: formation.mess_level,
                    prepMinutes: 5, // Default or add to schema if needed
                    materialsAvailable: true,
                    reasoning: slot.reasoning || `Planned for ${slot.timeSlot}`,
                    timeSlot: slot.timeSlot,
                    day: slot.day
                };
            }).filter(Boolean);

            // Collect materials
            const neededMaterials = new Set<string>();
            familySessions.forEach((session: any) => {
                session.formation.materials.forEach((m: string) => neededMaterials.add(m));
            });

            if (neededMaterials.size > 0) {
                neededMaterials.forEach(m => {
                    materialsList.push({
                        name: m,
                        status: 'unknown'
                    });
                });
            }
        }

        // Compute metrics
        const totalDuration = familySessions.reduce((acc: number, s: any) => acc + (s.formation.duration_minutes || 15), 0);
        const coreKitCount = familySessions.filter((s: any) => s.formation.uses_core_kit).length;
        const coreKitCoverage = familySessions.length > 0 ? (coreKitCount / familySessions.length) * 100 : 0;

        return c.json({
            date: new Date().toISOString().split('T')[0],
            children,
            familySessions,
            materials: materialsList,
            totalDuration,
            coreKitCoverage
        });
    } catch (error: any) {
        console.error('Family today error:', error);
        const status = error.message === 'Unauthorized' ? 401 : 500;
        return c.json({ error: error.message || 'Internal Server Error' }, status);
    }
}

// Get family dashboard data - UNIFIED PLANNER VERSION
app.get('/api/family/today', async (c) => {
    return getFamilyToday(c);
});

// Get activities for a specific date (for day navigation on dashboard)
app.get('/api/family/day/:date', async (c) => {
    try {
        const user = requireAuth(c);
        const dateParam = c.req.param('date'); // yyyy-MM-dd format

        // Validate date format
        const targetDate = new Date(dateParam);
        if (isNaN(targetDate.getTime())) {
            return c.json({ error: 'Invalid date format. Use yyyy-MM-dd' }, 400);
        }

        // Get all children
        const { results: children } = await safeQuery(c.env.DB,
            'SELECT * FROM students WHERE household_id = ? ORDER BY date_of_birth DESC',
            [user.household_id]
        );

        if (children.length === 0) {
            return c.json({
                date: dateParam,
                children: [],
                familySessions: [],
                materials: [],
                totalDuration: 0,
                coreKitCoverage: 0
            });
        }

        // Get day of week for the target date
        const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][targetDate.getDay()];

        // Check if this is an available day using family_preferences
        const prefs = await safeQueryFirst<any>(c.env.DB,
            'SELECT overrides_json FROM family_preferences WHERE parent_id = ?',
            [user.id]
        );
        const overrides = prefs ? JSON.parse(prefs.overrides_json || '{}') : {};
        const availableDays = overrides.available_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

        if (!availableDays.includes(dayOfWeek)) {
            return c.json({
                date: dateParam,
                children,
                restDay: true,
                message: "This is a rest day!",
                familySessions: [],
                materials: [],
                totalDuration: 0,
                coreKitCoverage: 0
            });
        }

        // Get the week start for the target date
        const weekStart = getSmartWeekStart(dateParam);

        // Try V2 plan first
        const plan = await safeQueryFirst<any>(c.env.DB,
            'SELECT plan_data as plan_json FROM weekly_plans_v2 WHERE family_id = ? AND week_start = ?',
            [user.household_id, weekStart]
        );

        if (!plan) {
            return c.json({
                date: dateParam,
                children,
                restDay: true,
                message: "No plan exists for this week.",
                familySessions: [],
                materials: [],
                totalDuration: 0,
                coreKitCoverage: 0
            });
        }

        // Get activities for the target day
        const planData = JSON.parse(plan.plan_json);
        const daySlots = planData.slots.filter((s: any) => s.day === dayOfWeek);

        const activityIds = daySlots.map((s: any) => s.activityId);
        let familySessions: any[] = [];

        if (activityIds.length > 0) {
            const placeholders = activityIds.map(() => '?').join(',');
            const { results: formations } = await safeQuery(c.env.DB, `
        SELECT * FROM formations WHERE id IN (${placeholders})
      `, activityIds);

            const formationMap = new Map(formations.map((f: any) => [f.id, f]));

            familySessions = daySlots.map((slot: any) => {
                const formation: any = formationMap.get(slot.activityId);
                if (!formation) return null;

                const tiers = JSON.parse(formation.tiered_expectations || '[]');
                const childTiers = children.map((child: any) => {
                    const age = child.age_in_months;
                    let tier = tiers.find((t: any) => age >= t.age_min && age <= t.age_max);
                    if (!tier) {
                        if (age < tiers[0]?.age_min) tier = tiers[0];
                        else if (age > tiers[tiers.length - 1]?.age_max) tier = tiers[tiers.length - 1];
                    }
                    return {
                        childId: child.id,
                        childName: child.name,
                        tier: tier?.tier || 'Standard',
                        expectation: tier?.expectation || 'Participate with support',
                        childAge: age
                    };
                });

                return {
                    formation: {
                        ...formation,
                        materials: JSON.parse(formation.materials || '[]'),
                        guide_steps: JSON.parse(formation.guide_steps || '[]'),
                        success_indicators: JSON.parse(formation.success_indicators || '[]'),
                        tips: JSON.parse(formation.tips || '[]'),
                    },
                    childTiers,
                    messLevel: formation.mess_level,
                    prepMinutes: 5, // Default or add to schema if needed
                    materialsAvailable: true,
                    reasoning: slot.reasoning || `Planned for ${slot.timeSlot}`,
                    timeSlot: slot.timeSlot,
                    day: slot.day
                };
            }).filter(Boolean);
        }

        // Compute metrics
        const totalDuration = familySessions.reduce((acc: number, s: any) => acc + (s.formation.duration_minutes || 15), 0);
        const coreKitCount = familySessions.filter((s: any) => s.formation.uses_core_kit).length;
        const coreKitCoverage = familySessions.length > 0 ? (coreKitCount / familySessions.length) * 100 : 0;

        return c.json({
            date: dateParam,
            children,
            familySessions,
            materials: [],
            totalDuration,
            coreKitCoverage
        });
    } catch (error: any) {
        console.error('Day detail error:', error);
        const status = error.message === 'Unauthorized' ? 401 : 500;
        return c.json({ error: error.message || 'Internal Server Error' }, status);
    }
});

// Persist an activity swap to the weekly plan
app.post('/api/family/swap-persist', async (c) => {
    try {
        const user = requireAuth(c);
        const { oldActivityId, newActivityId, day, weekStart } = await c.req.json();

        if (!newActivityId || !day || !weekStart) {
            return c.json({ error: 'newActivityId, day, and weekStart are required' }, 400);
        }

        // Get the current plan (Check V2 only)
        const plan = await safeQueryFirst<any>(c.env.DB,
            'SELECT id, plan_data as plan_json FROM weekly_plans_v2 WHERE family_id = ? AND week_start = ?',
            [user.household_id, weekStart]
        );

        if (!plan) {
            return c.json({ error: 'No plan found for this week' }, 404);
        }

        const planData = JSON.parse(plan.plan_json);

        // Find and update the slot
        let updated = false;
        for (const slot of planData.slots) {
            if (slot.day === day && slot.activityId === oldActivityId) {
                // Fetch new formation details
                const newFormation = await safeQueryFirst<any>(c.env.DB, 'SELECT * FROM formations WHERE id = ?', [newActivityId]);

                if (!newFormation) {
                    return c.json({ error: 'New formation not found' }, 404);
                }

                slot.activityId = newActivityId;
                slot.activityTitle = newFormation.title;
                slot.virtue = newFormation.primary_virtue;
                slot.duration = newFormation.duration_minutes;
                slot.reasoning = `Manually swapped by parent.`;
                updated = true;
                break;
            }
        }

        if (!updated) {
            return c.json({ error: 'Could not find the activity to swap' }, 404);
        }

        // Save the updated plan
        await safeRun(c.env.DB,
            'UPDATE weekly_plans_v2 SET plan_data = ?, regenerated_at = datetime("now") WHERE id = ?',
            [JSON.stringify(planData), plan.id]
        );

        // Get the new formation for response
        const newFormation = await safeQueryFirst<any>(c.env.DB, 'SELECT * FROM formations WHERE id = ?', [newActivityId]);

        return c.json({
            success: true,
            newFormation: {
                ...newFormation,
                materials: JSON.parse(newFormation?.materials || '[]'),
                guide_steps: JSON.parse(newFormation?.guide_steps || '[]'),
                success_indicators: JSON.parse(newFormation?.success_indicators || '[]'),
                tips: JSON.parse(newFormation?.tips || '[]'),
            }
        });
    } catch (error: any) {
        console.error('Swap persist error:', error);
        const status = error.message === 'Unauthorized' ? 401 : 500;
        return c.json({ error: error.message || 'Internal Server Error' }, status);
    }
});

// Get weekly rhythm plan
app.get('/api/rhythm/week', async (c) => {
    try {
        const user = requireHouseholdMember(c);
        const weekStart = getSmartWeekStart();
        const plan = await safeQueryFirst<any>(c.env.DB,
            'SELECT * FROM weekly_plans_v2 WHERE family_id = ? AND week_start = ?',
            [user.household_id, weekStart]
        );

        if (!plan) return c.json({ needsPlan: true });

        return c.json({
            ...plan,
            plan_data: JSON.parse(plan.plan_data)
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

app.post('/api/rhythm/regenerate', async (c) => {
    try {
        const user = requireHouseholdMember(c);
        const body = await c.req.json(); // { frozenDays: string[] } optionally
        const weekStart = getSmartWeekStart(); // Ensure consistent week start

        const generator = new RhythmGenerator(c.env);
        const context = await generator.loadFamilyContext(user.id);

        // Generate Plan
        const plan = await generator.generateWeeklyRhythm(context, weekStart, body.frozenDays || []);

        // Save to DB (weekly_plans_v2)
        await safeRun(c.env.DB, `
                INSERT INTO weekly_plans_v2 (id, family_id, week_start, plan_data, generated_at, generated_by)
                VALUES (?, ?, ?, ?, datetime('now'), 'ai')
                ON CONFLICT(family_id, week_start) DO UPDATE SET
                plan_data = excluded.plan_data,
                generated_at = excluded.generated_at,
                regenerated_at = datetime('now')
             `, [
            plan.id,
            user.household_id,
            weekStart,
            JSON.stringify(plan),
        ]);

        return c.json({ success: true, plan });

    } catch (e: any) {
        console.error("Regeneration failed", e);
        return c.json({ error: e.message }, 500);
    }
});

// ============ LEGACY / COMPATIBILITY ROUTES ============

// Alias for rhythm/today -> family/today
app.get('/api/rhythm/today', async (c) => {
    // Direct call to helper instead of app.request context switch
    return getFamilyToday(c);
});

// Alias for weekly-plan -> rhythm/week
app.get('/api/family/weekly-plan', async (c) => {
    try {
        const user = requireHouseholdMember(c);
        const weekStart = getSmartWeekStart();

        // Try V2 schema first
        const planV2 = await safeQueryFirst<any>(c.env.DB,
            'SELECT * FROM weekly_plans_v2 WHERE family_id = ? AND week_start = ?',
            [user.household_id, weekStart]
        );

        if (planV2) {
            return c.json({
                ...planV2,
                plan_data: JSON.parse(planV2.plan_data)
            });
        }

        // NO Fallback to V1 schema
        return c.json({ needsPlan: true });
    } catch (error: any) {
        console.error('Weekly plan error:', error);
        const status = error.message === 'Unauthorized' ? 401 : 500;
        return c.json({ error: error.message || 'Internal Server Error' }, status);
    }
});

// Implement week-summary (missing)
app.get('/api/family/week-summary', async (c) => {
    try {
        const user = requireHouseholdMember(c);
        const weekStart = c.req.query('weekStart') || getSmartWeekStart();

        // Try getting from weekly_plans_v2 first (newest)
        const plan = await safeQueryFirst<any>(c.env.DB,
            'SELECT * FROM weekly_plans_v2 WHERE family_id = ? AND week_start = ?',
            [user.household_id, weekStart]
        );

        if (plan) {
            const planData = JSON.parse(plan.plan_data);
            // summarize
            return c.json({
                weekStart,
                focus: planData.focus || 'General',
                totalActivities: planData.schedule?.length || 0,
                // Add other summary fields as needed by frontend
            });
        }

        return c.json({ weekStart, empty: true });

    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

export default app;
