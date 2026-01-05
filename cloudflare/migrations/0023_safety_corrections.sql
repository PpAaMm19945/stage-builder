-- Migration 0023: Safety Corrections (Phase 1)
-- Adds safety warnings and restrictions for choking hazards

-- Add safety_note column
-- NOTE: safety_note already exists in 0011_activities_overhaul.sql
-- Commenting out to prevent duplicate column error if running via Wrangler.
-- ALTER TABLE activities ADD COLUMN safety_note TEXT;

-- cognitive-007: Pattern Play
UPDATE activities 
SET min_age_months = 36,
    safety_note = 'WARNING: Contains small beads. Strict adult supervision required. Choking hazard for children under 3 years. Alternative: Use large blocks for ages 24-36mo.',
    materials = '["Large colored blocks (for 24-36mo)", "Beads (36mo+ only)", "Pattern cards"]'
WHERE id = 'cognitive-007';

-- cognitive-008: Cause and Effect Toys (Buttons)
UPDATE activities
SET safety_note = 'WARNING: Contains buttons. Use only large, child-safe buttons or alternative cause-effect toys. Strict adult supervision required at all times.'
WHERE id = 'cognitive-008';

-- motor-007: Threading and Lacing
UPDATE activities
SET min_age_months = 36,
    safety_note = 'WARNING: Contains small beads. For ages 24-36mo, use large pasta tubes or wooden spools instead. Strict adult supervision required.',
    materials = '["Large pasta tubes (24-36mo)", "Large beads (36mo+)", "Thick lace or string", "Lacing cards"]'
WHERE id = 'motor-007';

-- preacademic-006: AB Pattern Making
UPDATE activities
SET min_age_months = 36,
    safety_note = 'WARNING: Small beads are choking hazard. For younger children, use large blocks only.',
    materials = '["Large colored blocks (safer alternative)", "Beads (36mo+ with supervision)", "Pattern strips"]'
WHERE id = 'preacademic-006';

-- sensory-010: Messy Play (Shaving Cream)
UPDATE activities
SET safety_note = 'WARNING: Shaving cream/foam can be irritating if ingested. For children under 36 months, use whipped soap as safer alternative. Never leave unattended. Monitor for putting in mouth.'
WHERE id = 'sensory-010';
