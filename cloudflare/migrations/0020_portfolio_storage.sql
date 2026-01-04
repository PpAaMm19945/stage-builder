-- Migration number: 0020 	 2024-05-23T00:00:00.000Z
-- Portfolio Storage

CREATE TABLE IF NOT EXISTS portfolio_items (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    parent_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    item_type TEXT NOT NULL, -- 'image', 'audio', 'document', 'text'
    r2_key TEXT, -- Path in R2 storage
    domain TEXT, -- 'wisdom', 'stature', etc.
    related_activity_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_portfolio_student ON portfolio_items(student_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_created ON portfolio_items(created_at);
