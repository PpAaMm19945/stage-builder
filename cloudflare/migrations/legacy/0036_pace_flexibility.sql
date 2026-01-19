-- Migration: Pace Flexibility (Phase 4)

-- Table for parent-defined pace settings per child/subject
CREATE TABLE IF NOT EXISTS pace_settings (
    id TEXT PRIMARY KEY,
    parent_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    domain TEXT NOT NULL, -- e.g., 'math', 'language' (mapped to internal domains)
    stage_override TEXT, -- 'early-years', 'lower-primary', etc.
    tier_override TEXT, -- 'observer', 'participant', 'leader'
    reason TEXT, -- Why the parent granted this access
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, domain)
);

-- Table for tracking passion signals
CREATE TABLE IF NOT EXISTS passion_signals (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    parent_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    signal_type TEXT NOT NULL, -- 'time_spent', 'voluntary_engagement', 'verbal_interest', 'observation'
    intensity INTEGER CHECK (intensity BETWEEN 1 AND 5),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient lookup during planning
CREATE INDEX IF NOT EXISTS idx_pace_student_domain ON pace_settings(student_id, domain);
CREATE INDEX IF NOT EXISTS idx_passion_student ON passion_signals(student_id);