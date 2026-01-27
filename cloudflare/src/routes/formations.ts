import { Hono } from 'hono';
import { Env, User } from '../types';
import { requireAuth } from '../lib/middleware';
import { generateId } from '../lib/utils';
import { safeQueryFirst, safeRun } from '../lib/db';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// ============ FORMATION PREFERENCES ROUTES ============

// Get formation preferences (defaults to all enabled if not set)
app.get('/api/family/preferences', async (c) => {
    try {
        const user = requireAuth(c);

        let prefs = await safeQueryFirst(c.env.DB,
            'SELECT * FROM family_preferences WHERE parent_id = ?',
            [user.id]
        );

        if (!prefs) {
            // Return defaults if no preferences set
            return c.json({
                activitiesEnabled: true,
                readingEnabled: true,
                liturgyEnabled: true,
                learningFocus: 'balanced',
                focusDomains: []
            });
        }

        return c.json({
            activitiesEnabled: !!(prefs as any).activities_enabled,
            readingEnabled: !!(prefs as any).reading_enabled,
            liturgyEnabled: !!(prefs as any).liturgy_enabled,
            learningFocus: (prefs as any).learning_focus || 'balanced',
            focusDomains: JSON.parse((prefs as any).focus_domains || '[]')
        });
    } catch (error: any) {
        console.error('Formation preferences get error:', error);
        const status = error.message === 'Unauthorized' ? 401 : 500;
        return c.json({ error: error.message || 'Internal Server Error' }, status);
    }
});

// Update formation preferences
app.post('/api/family/preferences', async (c) => {
    try {
        const user = requireAuth(c);
        const body = await c.req.json();

        const { activitiesEnabled, readingEnabled, liturgyEnabled, learningFocus, focusDomains } = body;

        // Upsert preferences
        // For upsert to work correctly with COALESCE on partial updates, we must pass NULL for undefined fields
        // Defaulting to 1 in the bind params overwrites existing preferences during partial updates.

        // Check if record exists first to determine defaults for NEW records
        const existing = await safeQueryFirst(c.env.DB, 'SELECT 1 FROM family_preferences WHERE parent_id = ?', [user.id]);
        const isNew = !existing;

        // Defaults only apply if it's a NEW record and the field is missing
        const getVal = (val: any) => {
            if (val !== undefined) return val ? 1 : 0;
            return isNew ? 1 : null; // Default to 1 for new, null (preserve) for existing
        };

        await safeRun(c.env.DB, `
      INSERT INTO family_preferences (id, parent_id, activities_enabled, reading_enabled, liturgy_enabled, learning_focus, focus_domains, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(parent_id) DO UPDATE SET 
        activities_enabled = COALESCE(excluded.activities_enabled, activities_enabled),
        reading_enabled = COALESCE(excluded.reading_enabled, reading_enabled),
        liturgy_enabled = COALESCE(excluded.liturgy_enabled, liturgy_enabled),
        learning_focus = COALESCE(excluded.learning_focus, learning_focus),
        focus_domains = COALESCE(excluded.focus_domains, focus_domains),
        updated_at = datetime('now')
    `, [
            generateId('fpref'),
            user.id,
            getVal(activitiesEnabled),
            getVal(readingEnabled),
            getVal(liturgyEnabled),
            learningFocus || (isNew ? 'balanced' : null),
            focusDomains ? JSON.stringify(focusDomains) : null
        ]);

        return c.json({ success: true });
    } catch (error: any) {
        console.error('Formation preferences update error:', error);
        const status = error.message === 'Unauthorized' ? 401 : 500;
        return c.json({ error: error.message || 'Internal Server Error' }, status);
    }
});

export default app;
