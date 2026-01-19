-- SchoolOS Reading System Schema
-- Adds support for books and family reading sessions
-- Family-first philosophy: one reading session = one book read by the whole family

-- ============================================================================
-- Books table: Stores metadata about each book
-- The actual page content lives in Markdown files (not in the database)
-- ============================================================================
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,                              -- Unique book ID, e.g., "colors-around-me"
  title TEXT NOT NULL,                              -- Display title, e.g., "Colors Around Me"
  description TEXT NOT NULL,                        -- Short description for parents
  min_age_months INTEGER NOT NULL,                  -- Minimum recommended age in months
  max_age_months INTEGER NOT NULL,                  -- Maximum recommended age in months
  cover_image_url TEXT NOT NULL,                    -- Path to cover image, e.g., "/books/colors-around-me/cover.png"
  content_path TEXT NOT NULL,                       -- Path to Markdown file, e.g., "/books/colors-around-me/content.md"
  learning_stage TEXT NOT NULL DEFAULT 'early-years', -- Matches stages used elsewhere in SchoolOS
  domain TEXT NOT NULL DEFAULT 'language',          -- cognitive, motor, language, social-emotional, pre-academic
  is_active INTEGER NOT NULL DEFAULT 1,             -- 1 = active, 0 = hidden
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for finding age-appropriate books
CREATE INDEX IF NOT EXISTS idx_books_age ON books(min_age_months, max_age_months);

-- Index for filtering books by learning stage
CREATE INDEX IF NOT EXISTS idx_books_stage ON books(learning_stage);

-- ============================================================================
-- Reading Sessions table: Records when a family reads a book together
-- IMPORTANT: This is FAMILY-FIRST, not per-child
-- One reading session = one book read by the whole family
-- ============================================================================
CREATE TABLE IF NOT EXISTS reading_sessions (
  id TEXT PRIMARY KEY,                              -- Unique session ID
  parent_id TEXT NOT NULL,                          -- The parent who logged the session
  book_id TEXT NOT NULL,                            -- The book that was read
  children_present TEXT,                            -- Optional JSON array of student IDs present, e.g., '["child-1", "child-2"]'
  notes TEXT,                                       -- Optional parent notes about the reading session
  completed_at TEXT NOT NULL DEFAULT (datetime('now')), -- When the reading occurred
  created_at TEXT NOT NULL DEFAULT (datetime('now')),   -- When the record was created
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Index for finding all reading sessions by a parent
CREATE INDEX IF NOT EXISTS idx_reading_sessions_parent ON reading_sessions(parent_id);

-- Index for finding all reading sessions for a specific book
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book ON reading_sessions(book_id);
