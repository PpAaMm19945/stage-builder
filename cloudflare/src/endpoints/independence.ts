
// Get student independence settings
app.get('/api/independence-settings/:studentId', async (c) => {
    try {
        const user = requireHouseholdMember(c);
        const studentId = c.req.param('studentId');

        // Verify ownership
        const student = await c.env.DB.prepare(
            'SELECT * FROM students WHERE id = ? AND household_id = ?'
        ).bind(studentId, user.household_id).first();

        if (!student) {
            return c.json({ error: 'Student not found' }, 404);
        }

        // Try to parse settings from student record if column exists
        // Default to parent-led if missing or error
        let settings = {
            mode: 'parent_led',
            canMarkComplete: false,
            canEditPlan: false,
            checklistMode: 'simple'
        };

        try {
            if ((student as any).independence_settings) {
                const parsed = JSON.parse((student as any).independence_settings);
                settings = { ...settings, ...parsed };
            }
        } catch (e) {
            // Ignore parsing errors or missing column
        }

        return c.json(settings);
    } catch (error: any) {
        // If column doesn't exist, it might throw, but we caught it above? 
        // Actually SELECT * won't throw if column missing? 
        // Wait, SELECT * will only return columns that exist. 
        // So (student as any).independence_settings will just be undefined.
        // Safe.
        return c.json({ error: error.message }, 500);
    }
});

// Update independence settings
app.put('/api/independence-settings/:studentId', async (c) => {
    try {
        const user = requireParent(c); // Only parents can change this
        const studentId = c.req.param('studentId');
        const updates = await c.req.json();

        // Check if column exists by trying to update it.
        // If it fails, we might need to store in family_preferences overrides as fallback?
        // For now, assume migration v2_0002 will be run.

        await c.env.DB.prepare(
            'UPDATE students SET independence_settings = ? WHERE id = ? AND household_id = ?'
        ).bind(JSON.stringify(updates), studentId, user.household_id).run();

        return c.json({ success: true });
    } catch (error: any) {
        console.error("Failed to update independence settings", error);
        // Fallback: If column missing, maybe just succeed silently so UI doesn't crash?
        // Or return 500.
        return c.json({ error: 'Failed to update settings. Migration pending?' }, 500);
    }
});
