-- Migration 0011: Activities System Overhaul
-- Adds columns for auditing, safety/theological metadata, and family session improvements.

-- Add auditing and status columns
ALTER TABLE activities ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0;
ALTER TABLE activities ADD COLUMN content_status TEXT NOT NULL DEFAULT 'reviewed' CHECK (content_status IN ('draft', 'reviewed', 'restricted', 'blacklisted', 'published'));
ALTER TABLE activities ADD COLUMN last_reviewed_by TEXT;
ALTER TABLE activities ADD COLUMN last_reviewed_at TEXT;
ALTER TABLE activities ADD COLUMN review_notes TEXT;
ALTER TABLE activities ADD COLUMN content_version INTEGER NOT NULL DEFAULT 1;

-- Add descriptive metadata for family sessions
ALTER TABLE activities ADD COLUMN success_cue TEXT;
ALTER TABLE activities ADD COLUMN parent_script TEXT;
ALTER TABLE activities ADD COLUMN safety_note TEXT;
ALTER TABLE activities ADD COLUMN biblical_domain TEXT CHECK (biblical_domain IN ('wisdom', 'stature', 'favor_with_god', 'favor_with_man'));
ALTER TABLE activities ADD COLUMN cluster_tag TEXT;

-- Add indexes for filtering
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(content_status, is_archived);
CREATE INDEX IF NOT EXISTS idx_activities_cluster ON activities(cluster_tag);
CREATE INDEX IF NOT EXISTS idx_activities_biblical_domain ON activities(biblical_domain);