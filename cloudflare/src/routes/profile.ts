import { Hono } from 'hono';
import { Env, User } from '../types';
import { requireHouseholdMember } from '../lib/middleware';
import { generateId } from '../lib/utils';
import { ReportGenerator } from '../ai/report-generator';
import { getSmartWeekStart } from '../planner';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// GET /api/profile — Get current family profile
app.get('/api/profile', async (c) => {
    const user = requireHouseholdMember(c);
    const db = c.env.DB;

    // Use parent_id to lookup profile (one per household/parent for now)
    // Ideally linked to household_id but spec says parent_id. 
    // We'll stick to parent_id as the anchor for the family profile data.
    const profile = await db.prepare(
        'SELECT * FROM family_profiles WHERE parent_id = ?'
    ).bind(user.id).first<any>();

    if (!profile) {
        // Return defaults for new users
        return c.json({
            morning_minutes: 15,
            evening_minutes: 0,
            available_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            goals: [],
            preferences: {},
            catechism_position: 1,
            hymn_position: 1,
            onboarding_completed: false
        });
    }

    // Parse JSON fields
    return c.json({
        ...profile,
        available_days: JSON.parse(profile.available_days || '[]'),
        goals: JSON.parse(profile.goals || '[]'),
        preferences: JSON.parse(profile.preferences || '{}'),
    });
});

// PUT /api/profile — Update profile
app.put('/api/profile', async (c) => {
    const user = requireHouseholdMember(c);
    const body = await c.req.json();
    const db = c.env.DB;

    const existing = await db.prepare(
        'SELECT id FROM family_profiles WHERE parent_id = ?'
    ).bind(user.id).first<any>();

    // Helper to stringify if needed
    // Use NULL for undefined fields to support partial updates via COALESCE
    const available_days = body.available_days !== undefined ? JSON.stringify(body.available_days) : null;
    const goals = body.goals !== undefined ? JSON.stringify(body.goals) : null;
    const preferences = body.preferences !== undefined ? JSON.stringify(body.preferences) : null;

    if (existing) {
        await db.prepare(`
      UPDATE family_profiles SET 
        morning_minutes = COALESCE(?, morning_minutes),
        evening_minutes = COALESCE(?, evening_minutes),
        available_days = COALESCE(?, available_days),
        goals = COALESCE(?, goals),
        preferences = COALESCE(?, preferences),
        catechism_position = COALESCE(?, catechism_position),
        hymn_position = COALESCE(?, hymn_position),
        updated_at = datetime('now')
      WHERE parent_id = ?
    `).bind(
            body.morning_minutes ?? null,
            body.evening_minutes ?? null,
            available_days,
            goals,
            preferences,
            body.catechism_position ?? null,
            body.hymn_position ?? null,
            user.id
        ).run();
    } else {
        // For new records, ensure we have defaults for required fields
        const defaultDays = JSON.stringify(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
        const defaultGoals = '[]';
        const defaultPrefs = '{}';
        // Determine Onboarding Mode
        // If not set, can infer from preferences or set default
        const id = generateId('profile');
        await db.prepare(`
      INSERT INTO family_profiles (
        id, parent_id, morning_minutes, evening_minutes, available_days, 
        goals, preferences, catechism_position, hymn_position, 
        catechism_source, scripture_book, onboarding_mode, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'wsc', 'psalms', 'standard', datetime('now'), datetime('now'))
    `).bind(
            id,
            user.id,
            body.morning_minutes,
            body.evening_minutes,
            available_days ?? defaultDays,
            goals ?? defaultGoals,
            preferences ?? defaultPrefs,
            body.catechism_position,
            body.hymn_position
        ).run();
    }

    return c.json({ success: true });
});

// POST /api/profile/goals — Update goals specifically
app.post('/api/profile/goals', async (c) => {
    const user = requireHouseholdMember(c);
    const { goals } = await c.req.json();
    const db = c.env.DB;

    const goalsJson = JSON.stringify(goals || []);

    // Update existing or do nothing if no profile (should create profile first usually)
    // But we can upsert if strict. For now, assume profile mostly exists or we create it.
    const existing = await db.prepare('SELECT id FROM family_profiles WHERE parent_id = ?').bind(user.id).first();

    if (existing) {
        await db.prepare(
            'UPDATE family_profiles SET goals = ?, updated_at = datetime("now") WHERE parent_id = ?'
        ).bind(goalsJson, user.id).run();
    } else {
        // Create minimal profile
        const id = generateId('profile');
        await db.prepare(`
       INSERT INTO family_profiles (id, parent_id, goals) VALUES (?, ?, ?)
     `).bind(id, user.id, goalsJson).run();
    }

    return c.json({ success: true, goals });
});

export default app;
