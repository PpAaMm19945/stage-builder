-- Migration 0037: Learning Focus
-- Adds preferences for planning strategy (Balanced vs Interest-led)

-- FIX: Columns already exist in live DB. Commenting out to skip.
-- ALTER TABLE formation_preferences ADD COLUMN learning_focus TEXT DEFAULT 'balanced'; -- 'balanced' or 'interests'
-- ALTER TABLE formation_preferences ADD COLUMN focus_domains TEXT; -- JSON array of domain IDs to prioritize