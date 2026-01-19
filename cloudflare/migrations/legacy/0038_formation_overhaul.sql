-- Migration 0038: SchoolOS v2 - The Formation Engine
-- "Deconstructing the Factory, Building the Sanctuary"
-- REWRITTEN TO BE "SAFE" (Idempotent)

-- ============================================================================
-- PHASE 1: THE ARCHIVE (Safety First)
-- ============================================================================

-- SAFETY CHECK:
-- If you have ALREADY renamed these tables in the Console, keep these commented out.
-- If you see an error saying "no such table: legacy_activities", UNCOMMENT these lines.

-- ALTER TABLE activities RENAME TO legacy_activities;
-- ALTER TABLE observations RENAME TO legacy_observations;
-- ALTER TABLE liturgy_items RENAME TO legacy_liturgy_items;
-- ALTER TABLE daily_recommendations RENAME TO legacy_daily_recommendations;
-- ALTER TABLE family_liturgy_settings RENAME TO legacy_family_liturgy_settings;

-- Note: 'users' and 'students' tables remain valid. Identity is constant.

-- ============================================================================
-- PHASE 2: THE FORMATION ENGINE (New Schema)
-- ============================================================================

-- 1. FORMATIONS (The Atomic Unit of Discipleship)
-- Added "IF NOT EXISTS" to prevent crashes if table is already there.
CREATE TABLE IF NOT EXISTS formations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  
  -- THEOLOGY OF PRACTICE
  formation_type TEXT NOT NULL CHECK (formation_type IN ('liturgy', 'habit', 'skill', 'service', 'rest')),
  primary_virtue TEXT NOT NULL,
  biblical_faculty TEXT,
  
  -- CONTENT
  description TEXT NOT NULL,
  guide_steps TEXT, 
  
  -- DISCIPLESHIP GUIDE
  parent_posture TEXT,
  liturgical_script TEXT,
  
  -- CONTEXT & RHYTHM
  context_anchor TEXT,
  cultural_notes TEXT,
  
  -- SOFT GUIDES
  min_age_months INTEGER DEFAULT 0,
  max_age_months INTEGER DEFAULT 120,
  
  -- METADATA
  content_source TEXT DEFAULT 'schoolos_core',
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_formations_context ON formations(context_anchor);
CREATE INDEX IF NOT EXISTS idx_formations_virtue ON formations(primary_virtue);

-- 2. FAMILY RHYTHMS (The Liturgy of Life)
CREATE TABLE IF NOT EXISTS family_rhythms (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  rhythm_name TEXT NOT NULL,
  anchor_time TEXT,
  formation_chain TEXT NOT NULL DEFAULT '[]',
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rhythms_parent ON family_rhythms(parent_id);

-- 3. EVIDENCES OF GRACE (The Growth Journal)
CREATE TABLE IF NOT EXISTS evidences (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  formation_id TEXT NOT NULL,
  habit_stage TEXT NOT NULL CHECK (habit_stage IN ('Seeding', 'Rooting', 'Fruiting')),
  evidence_note TEXT,
  captured_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evidences_student ON evidences(student_id);

-- ============================================================================
-- PHASE 3: THE GREAT MIGRATION (Transforming Data)
-- ============================================================================
-- Using INSERT OR IGNORE to prevent duplicate data if run twice.

-- 1. MIGRATE LITURGY
INSERT OR IGNORE INTO formations (id, title, formation_type, primary_virtue, biblical_faculty, description, guide_steps, parent_posture, context_anchor, min_age_months, max_age_months)
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

-- 2. MIGRATE ACTIVITIES (Map Factory Domains to Kingdom Virtues)

-- Cognitive/Pre-academic -> Wisdom / Reason
INSERT OR IGNORE INTO formations (id, title, formation_type, primary_virtue, biblical_faculty, description, guide_steps, parent_posture, context_anchor, min_age_months, max_age_months, cultural_notes)
SELECT 
  id, title, 'skill', 'Wisdom', 'Reason', 
  description, instructions, 
  'Approach this not as a test, but as a discovery of God''s world. Wonder with them.', 
  'Anytime', min_age_months, max_age_months, cultural_notes
FROM legacy_activities WHERE domain IN ('cognitive', 'pre-academic');

-- Motor -> Stewardship / Will (Body control)
INSERT OR IGNORE INTO formations (id, title, formation_type, primary_virtue, biblical_faculty, description, guide_steps, parent_posture, context_anchor, min_age_months, max_age_months, cultural_notes)
SELECT 
  id, title, 'skill', 'Stewardship', 'Will', 
  description, instructions, 
  'Celebrate the strength and ability God has given them. Encourage effort over perfection.', 
  'Anytime', min_age_months, max_age_months, cultural_notes
FROM legacy_activities WHERE domain = 'motor';

-- Social-Emotional -> Love / Conscience
INSERT OR IGNORE INTO formations (id, title, formation_type, primary_virtue, biblical_faculty, description, guide_steps, parent_posture, context_anchor, min_age_months, max_age_months, cultural_notes)
SELECT 
  id, title, 'habit', 'Love', 'Conscience', 
  description, instructions, 
  'Model the gentleness you wish to see. Connection before correction.', 
  'Anytime', min_age_months, max_age_months, cultural_notes
FROM legacy_activities WHERE domain = 'social-emotional';

-- Spiritual/Language -> Wisdom / Affection
INSERT OR IGNORE INTO formations (id, title, formation_type, primary_virtue, biblical_faculty, description, guide_steps, parent_posture, context_anchor, min_age_months, max_age_months, cultural_notes)
SELECT 
  id, title, 'liturgy', 'Wisdom', 'Affection', 
  description, instructions, 
  'Let the words dwell richly. Do not rush the silence.', 
  'Morning_Circle', min_age_months, max_age_months, cultural_notes
FROM legacy_activities WHERE domain IN ('spiritual', 'language');

-- ============================================================================
-- PHASE 4: THE REFINEMENT (Specific overwrites)
-- ============================================================================

-- Reframing Cleanup (cognitive-013) -> Stewardship
UPDATE formations SET 
  title = 'The Stewardship of Things (Cleanup)',
  formation_type = 'habit',
  primary_virtue = 'Order',
  biblical_faculty = 'Will',
  description = 'We learn to return things to their home, restoring order to God''s world.',
  parent_posture = 'Do not rush. Do not scold. Treat the restoration of order as a beautiful, final act of play.',
  liturgical_script = 'Parent: "Everything has a place." Child: "And God loves order."',
  context_anchor = 'Transition'
WHERE id = 'cognitive-013';

-- Reframing Outdoor Play (motor-034) -> Habit of Observation
UPDATE formations SET
  title = 'The Habit of Observation (Nature Walk)',
  primary_virtue = 'Wonder',
  biblical_faculty = 'Affection',
  parent_posture = 'Walk slowly. Let the child lead. Speak less, point more. Let Creation speak.',
  liturgical_script = 'Parent: "The heavens declare..." Child: "...the glory of God!"',
  context_anchor = 'Walk_By_The_Way',
  cultural_notes = 'In Uganda, look for the small things: the ants, the texture of the mango leaf, the color of the soil.'
WHERE id = 'motor-034';