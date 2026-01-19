-- Family Session support
ALTER TABLE activities ADD COLUMN activity_type TEXT DEFAULT 'family_session';
-- Values: 'family_session' (default), 'individual'

ALTER TABLE activities ADD COLUMN tiered_expectations TEXT;
-- JSON: [{"age_min":18,"age_max":30,"tier":"Tier 1","expectation":"Stack 2-3 blocks"}, ...]

ALTER TABLE activities ADD COLUMN uses_core_kit INTEGER DEFAULT 0;
-- 1 = uses only common household items

-- Family Core Kit preferences table
CREATE TABLE IF NOT EXISTS family_materials (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  material_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unknown',  -- 'have', 'willing_to_buy', 'not_interested', 'unknown'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(parent_id, material_name)
);

-- Index for efficient family session queries
CREATE INDEX IF NOT EXISTS idx_activities_family ON activities(activity_type, min_age_months, max_age_months);
CREATE INDEX IF NOT EXISTS idx_materials_parent ON family_materials(parent_id);

-- Observation table enhancement - Add tier tracking to observations
ALTER TABLE observations ADD COLUMN tier TEXT;
-- Records which tier/expectation the child was assessed against
