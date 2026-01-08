-- Migration 0032: Formation Preferences
-- Allows families to opt-in/out of formation streams (activities, reading, liturgy)

CREATE TABLE IF NOT EXISTS formation_preferences (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL UNIQUE,
  activities_enabled INTEGER NOT NULL DEFAULT 1,
  reading_enabled INTEGER NOT NULL DEFAULT 1,
  liturgy_enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_formation_preferences_parent ON formation_preferences(parent_id);
