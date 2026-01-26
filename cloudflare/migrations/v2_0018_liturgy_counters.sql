-- Migration v2_0018: Add Liturgy Progress Tracking
-- Adds a new table to track separate counters for catechism, hymn, and scripture.

CREATE TABLE IF NOT EXISTS family_liturgy_progress (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL UNIQUE,
  catechism_position INTEGER DEFAULT 1,
  catechism_source TEXT DEFAULT 'prove_it',
  hymn_position INTEGER DEFAULT 1,
  scripture_position INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_liturgy_progress_parent ON family_liturgy_progress(parent_id);
