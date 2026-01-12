-- Migration 0019: Unified Plan System

-- 1. Add Planner Metadata
-- ALREADY EXISTS (Keep commented out):
-- ALTER TABLE weekly_plans ADD COLUMN balance_preference TEXT DEFAULT 'mixed'; 
-- ALTER TABLE weekly_plans ADD COLUMN tier_distribution TEXT; 

-- 2. Add Unique Constraint for UPSERT operations
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_plans_unique_parent_week
ON weekly_plans(parent_id, week_start);

-- 3. Create Simple Completions Table
CREATE TABLE IF NOT EXISTS activity_completions (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  activity_id TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activity_completions_parent ON activity_completions(parent_id);
CREATE INDEX IF NOT EXISTS idx_activity_completions_activity ON activity_completions(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_completions_date ON activity_completions(completed_at);

-- 4. Add Tiering to Activities
-- FIX: Uncomment this line because the live DB is missing it!
ALTER TABLE activities ADD COLUMN primary_tier TEXT DEFAULT 'participant';

-- 5. SMART BACKFILL: Assign tiers to existing data
UPDATE activities SET primary_tier = 'observer' WHERE activity_type = 'daily_practice';
UPDATE activities SET primary_tier = 'family' WHERE activity_type = 'family_session';

UPDATE activities
SET primary_tier = 'observer'
WHERE primary_tier = 'participant' AND max_age_months <= 18;

UPDATE activities
SET primary_tier = 'leader'
WHERE primary_tier = 'participant' AND min_age_months >= 48;

-- 6. Add Index
CREATE INDEX IF NOT EXISTS idx_activities_tier ON activities(primary_tier, is_active);