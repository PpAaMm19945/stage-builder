-- SchoolOS D1 Database Schema
-- Run with: npx wrangler d1 migrations apply DB --local (or --remote for prod)

-- Users table (parents)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  provider TEXT NOT NULL DEFAULT 'google',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Students table (children, up to 5 per parent)
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  age_in_months INTEGER NOT NULL,
  current_stage TEXT NOT NULL DEFAULT 'early-years',
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for parent lookups
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON students(parent_id);

-- Activities table (curriculum content)
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  domain TEXT NOT NULL, -- cognitive, motor, language, social, sensory
  min_age_months INTEGER NOT NULL,
  max_age_months INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  materials TEXT, -- JSON array of materials
  instructions TEXT NOT NULL, -- JSON array of steps
  learning_outcomes TEXT, -- JSON array of outcomes
  difficulty TEXT NOT NULL DEFAULT 'beginner', -- beginner, intermediate, advanced
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for age-appropriate activity lookups
CREATE INDEX IF NOT EXISTS idx_activities_age_range ON activities(min_age_months, max_age_months);
CREATE INDEX IF NOT EXISTS idx_activities_domain ON activities(domain);

-- Observations table (parent-recorded progress)
CREATE TABLE IF NOT EXISTS observations (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  activity_id TEXT NOT NULL,
  mastery_level TEXT NOT NULL, -- emerging, developing, secure, mastered
  parent_notes TEXT,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

-- Index for student progress lookups
CREATE INDEX IF NOT EXISTS idx_observations_student_id ON observations(student_id);
CREATE INDEX IF NOT EXISTS idx_observations_activity_id ON observations(activity_id);
CREATE INDEX IF NOT EXISTS idx_observations_student_activity ON observations(student_id, activity_id);

-- Sessions table (for auth)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Daily recommendations table (cached daily activity suggestions)
CREATE TABLE IF NOT EXISTS daily_recommendations (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  activity_id TEXT NOT NULL,
  recommended_date TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_daily_recs_student_date ON daily_recommendations(student_id, recommended_date);
