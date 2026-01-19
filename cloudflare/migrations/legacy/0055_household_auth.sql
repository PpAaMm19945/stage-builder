-- 0055_household_auth.sql
-- Create households table and update users/students for multi-parent/student auth

-- 1. Create households table
CREATE TABLE IF NOT EXISTS households (
  id TEXT PRIMARY KEY,
  name TEXT,
  invite_code TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_households_invite ON households(invite_code);

-- 2. Add columns to users (We can't use ALTER TABLE for multiple columns or constrains easily in SQLite sometimes, but D1 supports basic ALTER)
-- However, since D1/SQLite has limited ALTER support, we'll try to add columns individually. 
-- If strict schema migration is needed, we would recreate the table, but for this task we assume we can add columns.

-- We'll use a transaction to ensure atomicity if possible, but D1 migrations are usually single statements or checked.
-- Assuming D1 supports `ALTER TABLE ADD COLUMN`

ALTER TABLE users ADD COLUMN household_id TEXT REFERENCES households(id);
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'student'));
ALTER TABLE users ADD COLUMN student_id TEXT REFERENCES students(id);

CREATE INDEX IF NOT EXISTS idx_users_household ON users(household_id);

-- 3. Add columns to students
ALTER TABLE students ADD COLUMN household_id TEXT REFERENCES households(id) ON DELETE CASCADE;
ALTER TABLE students ADD COLUMN pending_login_email TEXT;

CREATE INDEX IF NOT EXISTS idx_students_household ON students(household_id);
CREATE INDEX IF NOT EXISTS idx_students_pending_email ON students(pending_login_email);

-- 4. Create sessions table (Optional based on architecture doc, but good for tracking)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
