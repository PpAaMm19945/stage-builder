-- Migration 0019: Unified Plan System
-- Consolidates planning logic and adds simple completion tracking

-- 1. Add Planner Metadata
-- Tracks how the parent wants to balance the week and the resulting spread
ALTER TABLE weekly_plans ADD COLUMN balance_preference TEXT DEFAULT 'mixed'; -- 'baby_focused', 'mixed', 'older_focused'
ALTER TABLE weekly_plans ADD COLUMN tier_distribution TEXT; -- JSON: { observer: 4, participant: 5, leader: 2 }

-- 2. Add Unique Constraint for UPSERT operations (Phase 5 fix)
-- Ensures a parent only has one plan per week_start date
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_plans_unique_parent_week
ON weekly_plans(parent_id, week_start);

-- 3. Create Simple Completions Table
-- For Daily Practices or activities where "Mastery" doesn't apply (just "Done")
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
-- categorizes activities for the balancing algorithm
ALTER TABLE activities ADD COLUMN primary_tier TEXT DEFAULT 'participant';
-- Values: 'observer' (0-18m), 'participant' (12-48m), 'leader' (48m+), 'family' (all ages)

-- 5. SMART BACKFILL: Assign tiers to existing data

-- Step A: Daily Practices are always 'observer' (Infancy focus)
UPDATE activities
SET primary_tier = 'observer'
WHERE activity_type = 'daily_practice';

-- Step B: Family Sessions are 'family' (unless specified otherwise)
UPDATE activities
SET primary_tier = 'family'
WHERE activity_type = 'family_session';

-- Step C: Age-based Heuristics for remaining individual activities
-- Observer: Max age is roughly 18 months or younger
-- Note: We use primary_tier='participant' check to ensure we don't overwrite the ones we just set
UPDATE activities
SET primary_tier = 'observer'
WHERE primary_tier = 'participant'
  AND max_age_months <= 18;

-- Leader: Geared toward older children (min age 48m+)
UPDATE activities
SET primary_tier = 'leader'
WHERE primary_tier = 'participant'
  AND min_age_months >= 48;

-- 6. Add Index for the new Planner Algorithm
CREATE INDEX IF NOT EXISTS idx_activities_tier ON activities(primary_tier, is_active);
