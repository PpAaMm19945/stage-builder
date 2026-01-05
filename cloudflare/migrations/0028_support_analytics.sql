CREATE TABLE support_clicks (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  source TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
