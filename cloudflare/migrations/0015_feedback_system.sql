-- Activity/Book Upvotes
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

-- Parent Comments
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

-- Aggregated counts (denormalized for performance)
-- COLUMN ALREADY EXISTS ERROR FIX:
-- The lines below are commented out because these columns already exist in the live DB.
-- If you need to re-add them, uncomment these lines.

-- ALTER TABLE activities ADD COLUMN upvote_count INTEGER NOT NULL DEFAULT 0;
-- ALTER TABLE activities ADD COLUMN comment_count INTEGER NOT NULL DEFAULT 0;

-- ALTER TABLE books ADD COLUMN upvote_count INTEGER NOT NULL DEFAULT 0;
-- ALTER TABLE books ADD COLUMN comment_count INTEGER NOT NULL DEFAULT 0;