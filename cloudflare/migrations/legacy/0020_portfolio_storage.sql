-- Migration 0020: Portfolio Storage
-- Stores metadata for user-uploaded artifacts (photos, audio, etc.)
-- Actual files are stored in R2, mapped via r2_key

CREATE TABLE IF NOT EXISTS portfolio_items (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  parent_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('image', 'audio', 'document', 'text')),
  r2_key TEXT, -- Path in R2 bucket (e.g., '{parent_id}/{student_id}/2024/{item_id}.jpg')
  domain TEXT, -- Maps to biblical_domain ('wisdom', 'stature', etc.) or standard domain
  related_activity_id TEXT, -- Optional link to the activity they were doing
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_activity_id) REFERENCES activities(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_portfolio_student ON portfolio_items(student_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_parent ON portfolio_items(parent_id);