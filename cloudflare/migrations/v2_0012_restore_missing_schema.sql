-- Migration v2_0012: Restore Missing Legacy Schema Elements
-- Adds columns and tables required by the application code that were missing in v2_0001.

-- ============================================================================
-- 1. Restore Missing Columns to Formations
-- ============================================================================

-- Filtering & Status
ALTER TABLE formations ADD COLUMN is_archived INTEGER DEFAULT 0;
ALTER TABLE formations ADD COLUMN content_status TEXT DEFAULT 'published';

-- Metadata used by Planner & UI
ALTER TABLE formations ADD COLUMN mess_level TEXT DEFAULT 'low';
ALTER TABLE formations ADD COLUMN difficulty INTEGER DEFAULT 1; -- 1=New, 2=Practicing, 3=Mastering
ALTER TABLE formations ADD COLUMN prep_time_minutes INTEGER DEFAULT 5;
ALTER TABLE formations ADD COLUMN uses_core_kit INTEGER DEFAULT 0;
ALTER TABLE formations ADD COLUMN primary_tier TEXT; -- 'observer', 'participant', 'leader'

-- JSON Content Fields (Legacy compatibility)
-- Even though guide_steps exists, code sometimes looks for 'instructions' or 'tiered_expectations' blob
ALTER TABLE formations ADD COLUMN instructions TEXT;
ALTER TABLE formations ADD COLUMN tiered_expectations TEXT;
ALTER TABLE formations ADD COLUMN learning_outcomes TEXT;
ALTER TABLE formations ADD COLUMN success_indicators TEXT;
ALTER TABLE formations ADD COLUMN tips TEXT;
ALTER TABLE formations ADD COLUMN safety_note TEXT;
ALTER TABLE formations ADD COLUMN success_cue TEXT;

-- ============================================================================
-- 2. Restore Missing Tables
-- ============================================================================

-- Family Materials (Core Kit)
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
CREATE INDEX IF NOT EXISTS idx_materials_parent ON family_materials(parent_id);

-- Weekly Time Model (Planner Settings)
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

-- Parent Overrides (Planner Constraints)
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

-- Content Upvotes (Feedback)
CREATE TABLE IF NOT EXISTS content_upvotes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('activity', 'book')),
  content_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, content_type, content_id)
);
CREATE INDEX IF NOT EXISTS idx_upvotes_content ON content_upvotes(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_user ON content_upvotes(user_id);

-- Parent Comments (Feedback)
CREATE TABLE IF NOT EXISTS parent_comments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('activity', 'book')),
  content_id TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  is_success_story INTEGER NOT NULL DEFAULT 0,
  is_approved INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_comments_content ON parent_comments(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON parent_comments(user_id);

-- Explanation Logs (AI RAG)
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

-- AI Triage Logs (Front Desk)
CREATE TABLE IF NOT EXISTS ai_triage_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    input_text TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('VALID', 'AMBIGUOUS', 'INVALID')),
    reasoning TEXT,
    confidence REAL,
    was_blocks INTEGER DEFAULT 0,
    clarification_question TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ai_triage_logs_status ON ai_triage_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_triage_logs_created ON ai_triage_logs(created_at DESC);

-- Liturgy Completions (Legacy Tracking - Dashboard reads this)
CREATE TABLE IF NOT EXISTS liturgy_completions (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  liturgy_item_id TEXT NOT NULL,
  completed_date TEXT NOT NULL, -- YYYY-MM-DD
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  -- Note: We can't strictly enforce FK to liturgy_items if that table was renamed/removed,
  -- but since items are now in 'formations', we link to formations.
  FOREIGN KEY (liturgy_item_id) REFERENCES formations(id) ON DELETE CASCADE,
  UNIQUE(parent_id, liturgy_item_id, completed_date)
);
CREATE INDEX IF NOT EXISTS idx_liturgy_completions_parent_date ON liturgy_completions(parent_id, completed_date);

-- Reading Sessions (Book Logs)
CREATE TABLE IF NOT EXISTS reading_sessions (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  book_id TEXT NOT NULL,
  children_present TEXT, -- JSON array
  notes TEXT,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  rating INTEGER,
  read_again INTEGER,
  feedback_json TEXT,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  -- Link to formations since books are now formations with type='reading'
  FOREIGN KEY (book_id) REFERENCES formations(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_parent ON reading_sessions(parent_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book ON reading_sessions(book_id);
