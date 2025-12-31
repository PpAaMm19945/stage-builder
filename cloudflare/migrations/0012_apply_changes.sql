-- Migration 0012: Apply Safe Changes (Backfill)
-- This file will be populated with safe UPDATE statements after the audit script runs.
-- For now, it initializes some defaults where safe.

-- Backfill biblical_domain based on existing domain (best-effort mapping)
UPDATE activities SET biblical_domain = 'wisdom' WHERE domain = 'cognitive' AND biblical_domain IS NULL;
UPDATE activities SET biblical_domain = 'stature' WHERE domain = 'motor' AND biblical_domain IS NULL;
UPDATE activities SET biblical_domain = 'favor_with_man' WHERE domain = 'social-emotional' AND biblical_domain IS NULL;
-- 'language' and 'pre-academic' map to multiple, leaving NULL for manual review unless clear mapping exists
UPDATE activities SET biblical_domain = 'wisdom' WHERE domain = 'pre-academic' AND biblical_domain IS NULL;

-- Set default parent script format for family sessions if missing
-- (This is a placeholder, actual scripts should be human-reviewed)
-- UPDATE activities SET parent_script = 'Guide your child through this activity...' WHERE activity_type = 'family_session' AND parent_script IS NULL;
