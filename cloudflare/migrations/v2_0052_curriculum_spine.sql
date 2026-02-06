-- v2_0052_curriculum_spine.sql
-- Multi-subject curriculum spine with Christian framing
-- Created: 2026-02-06

-- Curriculum Spine: Multi-subject sequenced learning
CREATE TABLE IF NOT EXISTS curriculum_spine (
    id TEXT PRIMARY KEY,
    spine_version TEXT NOT NULL,           -- e.g., 'v1.0'
    subject TEXT NOT NULL,                 -- 'literacy', 'numeracy', 'formation', 'african_history'
    week_number INTEGER NOT NULL,          -- 1-312 (6 years)
    stage TEXT NOT NULL,                   -- 'seedling', 'sprout', 'sapling', 'tree'
    focus_area TEXT NOT NULL,              -- e.g., 'phonological_awareness'
    skill_targets TEXT NOT NULL,           -- JSON: measurable skills/knowledge
    faith_framing TEXT,                    -- Theological reflection prompts
    resources TEXT,                        -- JSON: book/activity IDs
    confidence TEXT DEFAULT 'research',    -- 'research', 'consensus', 'experimental'
    source_citations TEXT,                 -- JSON: traceable references
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    approved_by TEXT,                      -- NULL until human-approved
    approved_at TEXT
);

-- Spine Metadata: Tracks generation and approval
CREATE TABLE IF NOT EXISTS spine_metadata (
    id TEXT PRIMARY KEY,
    spine_version TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'draft',           -- 'draft', 'in_review', 'approved', 'superseded'
    generation_log TEXT,                   -- JSON: drafts, conflicts, resolutions
    total_weeks INTEGER,
    subjects TEXT,                         -- JSON: list of subjects in this version
    approved_by TEXT,
    approved_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_spine_version_subject_week 
    ON curriculum_spine(spine_version, subject, week_number);

CREATE INDEX IF NOT EXISTS idx_spine_stage 
    ON curriculum_spine(stage);

-- Add spine_version to formation_arcs for auditability
ALTER TABLE formation_arcs ADD COLUMN spine_version TEXT;
