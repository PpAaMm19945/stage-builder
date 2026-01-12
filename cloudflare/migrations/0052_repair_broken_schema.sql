-- Migration 0052: Repair broken schema from Migration 0038
-- Fixes tables that might not have been renamed and adds missing columns to formations.

-- 1. Rename tables if they haven't been renamed (fixing commented-out 0038)
-- Note: If 0038 already renamed them, this will fail. BUT this is a corrective migration.
-- We assume the user is in the "broken" state where 0038 ran but did nothing.
ALTER TABLE activities RENAME TO legacy_activities;
ALTER TABLE observations RENAME TO legacy_observations;
ALTER TABLE liturgy_items RENAME TO legacy_liturgy_items;
ALTER TABLE daily_recommendations RENAME TO legacy_daily_recommendations;
ALTER TABLE family_liturgy_settings RENAME TO legacy_family_liturgy_settings;

-- 2. Add missing columns to formations (that were missed in 0038)
ALTER TABLE formations ADD COLUMN duration_minutes INTEGER DEFAULT 15;
ALTER TABLE formations ADD COLUMN materials TEXT;
ALTER TABLE formations ADD COLUMN mess_level TEXT;
ALTER TABLE formations ADD COLUMN uses_core_kit INTEGER DEFAULT 0;
ALTER TABLE formations ADD COLUMN tiered_expectations TEXT;
ALTER TABLE formations ADD COLUMN activity_type TEXT;
ALTER TABLE formations ADD COLUMN learning_outcomes TEXT;
ALTER TABLE formations ADD COLUMN success_indicators TEXT;
ALTER TABLE formations ADD COLUMN tips TEXT;
ALTER TABLE formations ADD COLUMN safety_note TEXT;
ALTER TABLE formations ADD COLUMN success_cue TEXT;
ALTER TABLE formations ADD COLUMN content_status TEXT;
ALTER TABLE formations ADD COLUMN is_archived INTEGER DEFAULT 0;
ALTER TABLE formations ADD COLUMN cluster_tag TEXT;
ALTER TABLE formations ADD COLUMN primary_tier TEXT;

-- 3. Populate existing rows (Backfill)
-- This covers rows that might have been inserted by a partial 0038 run but are missing the new columns.
UPDATE formations
SET
  duration_minutes = (SELECT duration_minutes FROM legacy_activities WHERE legacy_activities.id = formations.id),
  materials = (SELECT materials FROM legacy_activities WHERE legacy_activities.id = formations.id),
  mess_level = (SELECT mess_level FROM legacy_activities WHERE legacy_activities.id = formations.id),
  uses_core_kit = (SELECT uses_core_kit FROM legacy_activities WHERE legacy_activities.id = formations.id),
  tiered_expectations = (SELECT tiered_expectations FROM legacy_activities WHERE legacy_activities.id = formations.id),
  activity_type = (SELECT activity_type FROM legacy_activities WHERE legacy_activities.id = formations.id),
  learning_outcomes = (SELECT learning_outcomes FROM legacy_activities WHERE legacy_activities.id = formations.id),
  success_indicators = (SELECT success_indicators FROM legacy_activities WHERE legacy_activities.id = formations.id),
  tips = (SELECT tips FROM legacy_activities WHERE legacy_activities.id = formations.id),
  safety_note = (SELECT safety_note FROM legacy_activities WHERE legacy_activities.id = formations.id),
  success_cue = (SELECT success_cue FROM legacy_activities WHERE legacy_activities.id = formations.id),
  content_status = (SELECT content_status FROM legacy_activities WHERE legacy_activities.id = formations.id),
  is_archived = (SELECT is_archived FROM legacy_activities WHERE legacy_activities.id = formations.id),
  cluster_tag = (SELECT cluster_tag FROM legacy_activities WHERE legacy_activities.id = formations.id),
  primary_tier = (SELECT primary_tier FROM legacy_activities WHERE legacy_activities.id = formations.id)
WHERE EXISTS (SELECT 1 FROM legacy_activities WHERE legacy_activities.id = formations.id);

-- 4. Apply Defaults to existing rows
UPDATE formations SET mess_level = 'low' WHERE mess_level IS NULL;
UPDATE formations SET uses_core_kit = 0 WHERE uses_core_kit IS NULL;
UPDATE formations SET duration_minutes = 15 WHERE duration_minutes IS NULL;
UPDATE formations SET primary_tier = 'observer' WHERE primary_tier IS NULL AND min_age_months <= 12;
UPDATE formations SET primary_tier = 'participant' WHERE primary_tier IS NULL AND min_age_months > 12 AND min_age_months <= 36;
UPDATE formations SET primary_tier = 'leader' WHERE primary_tier IS NULL AND min_age_months > 36;

-- 5. Insert missing rows (with full data)
-- This covers rows that 0038 failed to insert. We include ALL columns here to ensure they are fully populated.

-- Cognitive/Pre-academic -> Wisdom / Reason
INSERT OR IGNORE INTO formations (
  id, title, formation_type, primary_virtue, biblical_faculty, description, guide_steps, parent_posture, context_anchor, min_age_months, max_age_months, cultural_notes,
  duration_minutes, materials, mess_level, uses_core_kit, tiered_expectations, activity_type, learning_outcomes, success_indicators, tips, safety_note, success_cue, content_status, is_archived, cluster_tag, primary_tier
)
SELECT
  id, title, 'skill', 'Wisdom', 'Reason',
  description, instructions,
  'Approach this not as a test, but as a discovery of God''s world. Wonder with them.',
  'Anytime', min_age_months, max_age_months, cultural_notes,
  duration_minutes, materials, mess_level, uses_core_kit, tiered_expectations, activity_type, learning_outcomes, success_indicators, tips, safety_note, success_cue, content_status, is_archived, cluster_tag, primary_tier
FROM legacy_activities WHERE domain IN ('cognitive', 'pre-academic');

-- Motor -> Stewardship / Will
INSERT OR IGNORE INTO formations (
  id, title, formation_type, primary_virtue, biblical_faculty, description, guide_steps, parent_posture, context_anchor, min_age_months, max_age_months, cultural_notes,
  duration_minutes, materials, mess_level, uses_core_kit, tiered_expectations, activity_type, learning_outcomes, success_indicators, tips, safety_note, success_cue, content_status, is_archived, cluster_tag, primary_tier
)
SELECT
  id, title, 'skill', 'Stewardship', 'Will',
  description, instructions,
  'Celebrate the strength and ability God has given them. Encourage effort over perfection.',
  'Anytime', min_age_months, max_age_months, cultural_notes,
  duration_minutes, materials, mess_level, uses_core_kit, tiered_expectations, activity_type, learning_outcomes, success_indicators, tips, safety_note, success_cue, content_status, is_archived, cluster_tag, primary_tier
FROM legacy_activities WHERE domain = 'motor';

-- Social-Emotional -> Love / Conscience
INSERT OR IGNORE INTO formations (
  id, title, formation_type, primary_virtue, biblical_faculty, description, guide_steps, parent_posture, context_anchor, min_age_months, max_age_months, cultural_notes,
  duration_minutes, materials, mess_level, uses_core_kit, tiered_expectations, activity_type, learning_outcomes, success_indicators, tips, safety_note, success_cue, content_status, is_archived, cluster_tag, primary_tier
)
SELECT
  id, title, 'habit', 'Love', 'Conscience',
  description, instructions,
  'Model the gentleness you wish to see. Connection before correction.',
  'Anytime', min_age_months, max_age_months, cultural_notes,
  duration_minutes, materials, mess_level, uses_core_kit, tiered_expectations, activity_type, learning_outcomes, success_indicators, tips, safety_note, success_cue, content_status, is_archived, cluster_tag, primary_tier
FROM legacy_activities WHERE domain = 'social-emotional';

-- Spiritual/Language -> Wisdom / Affection
INSERT OR IGNORE INTO formations (
  id, title, formation_type, primary_virtue, biblical_faculty, description, guide_steps, parent_posture, context_anchor, min_age_months, max_age_months, cultural_notes,
  duration_minutes, materials, mess_level, uses_core_kit, tiered_expectations, activity_type, learning_outcomes, success_indicators, tips, safety_note, success_cue, content_status, is_archived, cluster_tag, primary_tier
)
SELECT
  id, title, 'liturgy', 'Wisdom', 'Affection',
  description, instructions,
  'Let the words dwell richly. Do not rush the silence.',
  'Morning_Circle', min_age_months, max_age_months, cultural_notes,
  duration_minutes, materials, mess_level, uses_core_kit, tiered_expectations, activity_type, learning_outcomes, success_indicators, tips, safety_note, success_cue, content_status, is_archived, cluster_tag, primary_tier
FROM legacy_activities WHERE domain IN ('spiritual', 'language');

-- Liturgy Items
INSERT OR IGNORE INTO formations (
  id, title, formation_type, primary_virtue, biblical_faculty, description, guide_steps, parent_posture, context_anchor, min_age_months, max_age_months
)
SELECT
  id,
  title,
  'liturgy',
  'Wisdom',
  'Memory',
  content,
  '["Recite/Sing together", "Discuss one word or phrase", "Pray"]',
  'Lead with joy. Do not drill. Let the beauty of the words do the work.',
  CASE
    WHEN type = 'hymn' THEN 'Morning_Circle'
    WHEN type = 'catechism' THEN 'Meal_Table'
    ELSE 'Bedside'
  END,
  min_age_months,
  max_age_months
FROM legacy_liturgy_items;
