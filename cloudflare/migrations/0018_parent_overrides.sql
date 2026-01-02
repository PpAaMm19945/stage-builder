-- Migration 0018: Parent Overrides & Weekly Planning
-- Stores structured constraints and parent preferences

-- Parent Overrides Table
CREATE TABLE IF NOT EXISTS parent_overrides (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  student_id TEXT,  -- NULL = applies to all children
  override_type TEXT NOT NULL CHECK(override_type IN ('sensory', 'motor', 'schedule', 'content', 'pacing')),
  description TEXT NOT NULL,  -- Original parent free-text input
  constraints_json TEXT NOT NULL,  -- Structured constraints parsed by AI
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_parent_overrides_parent ON parent_overrides(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_overrides_student ON parent_overrides(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_overrides_type ON parent_overrides(override_type);

-- Weekly Time Model
CREATE TABLE IF NOT EXISTS weekly_time_model (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL UNIQUE,
  available_days TEXT NOT NULL DEFAULT '["Mon","Tue","Wed","Thu","Fri"]',  -- JSON array
  minutes_per_day INTEGER NOT NULL DEFAULT 45,
  preferred_times TEXT NOT NULL DEFAULT '["morning"]',  -- JSON array
  max_sessions_per_day INTEGER NOT NULL DEFAULT 2,
  field_trip_days TEXT DEFAULT '[]',  -- JSON array
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Weekly Plans (Generated, Cached)
CREATE TABLE IF NOT EXISTS weekly_plans (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  week_start TEXT NOT NULL,  -- ISO date of Monday
  plan_json TEXT NOT NULL,  -- Full plan structure
  generated_at TEXT NOT NULL DEFAULT (datetime('now')),
  override_version INTEGER NOT NULL DEFAULT 1,  -- Increments when overrides change
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_weekly_plans_parent_week ON weekly_plans(parent_id, week_start);

-- Curriculum Explanations Log
CREATE TABLE IF NOT EXISTS explanation_logs (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sources_json TEXT,  -- Vector IDs used for context
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_explanation_logs_parent ON explanation_logs(parent_id);