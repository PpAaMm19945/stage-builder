-- v2_0053_child_progress.sql
-- Individual child progress tracking (per-child, per-skill mastery)
-- Created: 2026-02-06

-- Child-specific progress tracking
CREATE TABLE IF NOT EXISTS child_progress (
    id TEXT PRIMARY KEY,
    child_id TEXT NOT NULL,
    subject TEXT NOT NULL,                  -- 'literacy', 'numeracy', 'formation', 'african_history'
    skill_target TEXT NOT NULL,             -- e.g., 'rhyme_production', 'counting_to_10'
    evidence_anchor_id TEXT,                -- Which anchor demonstrated this skill
    mastery_level TEXT DEFAULT 'introduced', -- 'introduced', 'practicing', 'mastered'
    practice_count INTEGER DEFAULT 1,       -- How many times practiced
    parent_notes TEXT,                      -- Parent observations
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES students(id)
);

CREATE INDEX IF NOT EXISTS idx_child_progress_child ON child_progress(child_id);
CREATE INDEX IF NOT EXISTS idx_child_progress_skill ON child_progress(child_id, subject, skill_target);

-- Family curriculum position (tracks which week each family is on per subject)
CREATE TABLE IF NOT EXISTS family_curriculum_position (
    id TEXT PRIMARY KEY,
    household_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    current_week INTEGER DEFAULT 1,
    spine_version TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(household_id, subject)
);
