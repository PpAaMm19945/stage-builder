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
ALTER TABLE activities ADD COLUMN success_cue TEXT; -- "What to look for" (one-line observer cue)
ALTER TABLE activities ADD COLUMN parent_script TEXT; -- "Say this" (1-3 sentences)
ALTER TABLE activities ADD COLUMN safety_note TEXT; -- Required for restricted items
ALTER TABLE activities ADD COLUMN biblical_domain TEXT CHECK (biblical_domain IN ('wisdom', 'stature', 'favor_with_god', 'favor_with_man'));
ALTER TABLE activities ADD COLUMN cluster_tag TEXT; -- Skill family for grouping

-- Add indexes for filtering
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(content_status, is_archived);
CREATE INDEX IF NOT EXISTS idx_activities_cluster ON activities(cluster_tag);
CREATE INDEX IF NOT EXISTS idx_activities_biblical_domain ON activities(biblical_domain);

-- Add check constraint for tiered expectations json structure (basic validation)
-- Note: SQLite ALTER TABLE doesn't support adding CHECK constraints to existing columns easily unless re-creating table.
-- We will rely on application layer validation for now or use a trigger if strictly necessary.
-- Adding a trigger to ensure tiered_expectations is a JSON array if not null.
CREATE TRIGGER IF NOT EXISTS validate_tiered_expectations_insert
BEFORE INSERT ON activities
FOR EACH ROW
WHEN NEW.tiered_expectations IS NOT NULL AND json_valid(NEW.tiered_expectations) = 0
BEGIN
    SELECT RAISE(ABORT, 'tiered_expectations must be valid JSON');
END;

CREATE TRIGGER IF NOT EXISTS validate_tiered_expectations_update
BEFORE UPDATE ON activities
FOR EACH ROW
WHEN NEW.tiered_expectations IS NOT NULL AND json_valid(NEW.tiered_expectations) = 0
BEGIN
    SELECT RAISE(ABORT, 'tiered_expectations must be valid JSON');
END;
