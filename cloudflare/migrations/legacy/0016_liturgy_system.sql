-- Migration 0016: Liturgy System Schema
-- Adds support for family worship: Catechisms, Hymns, and Scripture

-- Liturgy Items: Catechism questions, hymns, and scripture passages
CREATE TABLE IF NOT EXISTS liturgy_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('catechism', 'hymn', 'scripture')),
  source TEXT NOT NULL, -- e.g., 'westminster_shorter', 'trinity_hymnal', 'esv'
  sequence_number INTEGER NOT NULL, -- Week/position in sequence
  title TEXT NOT NULL, -- e.g., "Q1: What is the chief end of man?"
  content TEXT NOT NULL, -- Full text (question + answer, hymn lyrics, verse)
  reference TEXT, -- Scripture reference or hymnal number
  audio_url TEXT, -- Optional audio file in R2
  min_age_months INTEGER NOT NULL DEFAULT 0,
  max_age_months INTEGER NOT NULL DEFAULT 72,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_liturgy_items_type ON liturgy_items(type);
CREATE INDEX IF NOT EXISTS idx_liturgy_items_source_seq ON liturgy_items(source, sequence_number);

-- Family Liturgy Settings: What sources the family uses + current position
CREATE TABLE IF NOT EXISTS family_liturgy_settings (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL UNIQUE,
  -- Sources
  catechism_enabled INTEGER NOT NULL DEFAULT 1,
  catechism_source TEXT NOT NULL DEFAULT 'westminster_shorter',
  hymnal_enabled INTEGER NOT NULL DEFAULT 1,
  hymnal_source TEXT NOT NULL DEFAULT 'classic_hymns',
  scripture_enabled INTEGER NOT NULL DEFAULT 1,
  bible_translation TEXT NOT NULL DEFAULT 'esv',
  -- Weekly progress (which week they're on)
  current_catechism_week INTEGER NOT NULL DEFAULT 1,
  current_hymn_week INTEGER NOT NULL DEFAULT 1,
  current_scripture_week INTEGER NOT NULL DEFAULT 1,
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_family_liturgy_parent ON family_liturgy_settings(parent_id);

-- Liturgy Completions: Daily tracking
CREATE TABLE IF NOT EXISTS liturgy_completions (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  liturgy_item_id TEXT NOT NULL,
  completed_date TEXT NOT NULL, -- YYYY-MM-DD
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (liturgy_item_id) REFERENCES liturgy_items(id) ON DELETE CASCADE,
  UNIQUE(parent_id, liturgy_item_id, completed_date)
);

CREATE INDEX IF NOT EXISTS idx_liturgy_completions_parent_date ON liturgy_completions(parent_id, completed_date);