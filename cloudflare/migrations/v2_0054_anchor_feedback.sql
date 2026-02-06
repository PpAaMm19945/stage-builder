-- v2_0054_anchor_feedback.sql
-- Add feedback fields to daily_anchors for the feedback loop
-- Created: 2026-02-06

-- Add feedback columns to daily_anchors
ALTER TABLE daily_anchors ADD COLUMN completion_feedback TEXT;  -- JSON: {rating, notes, loved_it}
ALTER TABLE daily_anchors ADD COLUMN completed_at TEXT;         -- When marked complete
ALTER TABLE daily_anchors ADD COLUMN skipped_at TEXT;           -- When skipped
ALTER TABLE daily_anchors ADD COLUMN skip_reason TEXT;          -- Why skipped

-- Aggregated feedback for arc improvement
CREATE TABLE IF NOT EXISTS anchor_feedback_summary (
    id TEXT PRIMARY KEY,
    household_id TEXT NOT NULL,
    arc_id TEXT NOT NULL,
    week_number INTEGER,
    total_completed INTEGER DEFAULT 0,
    total_skipped INTEGER DEFAULT 0,
    avg_rating REAL,
    common_feedback TEXT,           -- JSON: array of common themes
    improvement_suggestions TEXT,   -- JSON: AI-generated suggestions
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feedback_summary ON anchor_feedback_summary(household_id, arc_id);
