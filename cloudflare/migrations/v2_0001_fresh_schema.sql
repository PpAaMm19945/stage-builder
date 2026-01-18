-- Migration v2_0001: Fresh Unified Schema
-- Replaces fragmented legacy schema with a clean 11-table Unified Formation System.
-- Based on docs/architecture_comparison.md (Parts 6-9) and specific override requirements.

-- ============================================================================
-- 0. HOUSEHOLDS
-- Family units that group users and students together.
-- ============================================================================
CREATE TABLE households (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL, -- For inviting other parents/guardians
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_households_invite_code ON households(invite_code);

-- ============================================================================
-- 1. USERS (Parents & Students with Accounts)
-- Supports both parents and students who need login access.
-- ============================================================================
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'student')),
  
  -- Links
  household_id TEXT NOT NULL,
  student_id TEXT, -- NULL if role='parent', populated if role='student'
  
  -- Auth
  provider TEXT NOT NULL DEFAULT 'google',
  avatar_url TEXT,
  
  -- Metadata
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  -- We can't FK student_id yet because students table isn't created. 
  -- We will add it conceptually or rely on app logic to avoid circular dependency in creation.
  -- Alternatively, we can let it be a loose reference here or add constraint later if supported.
  -- For now, we will just document it.
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL 
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_household ON users(household_id);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- 2. STUDENTS (Children)
-- The primary subjects of formation.
-- ============================================================================
CREATE TABLE students (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL,
  name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  
  -- Auth Linking
  pending_login_email TEXT, -- Used to claim a student profile for a user account
  
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
);

CREATE INDEX idx_students_household ON students(household_id);

-- ============================================================================
-- 3. FORMATIONS (Everything: Skills, Liturgy, Books, Habits)
-- The single source of truth for all educational content.
-- ============================================================================
CREATE TABLE formations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- TYPE & CLASSIFICATION
  formation_type TEXT NOT NULL CHECK (formation_type IN (
    'skill',      -- Motor, cognitive, history, math, etc.
    'habit',      -- Chores, routines, character habits
    'liturgy',    -- Catechism, hymns, memory verses
    'reading',    -- Books
    'service',    -- Acts of service
    'rest'        -- Sabbath, nap time, quiet activities
  )),
  
  -- VIRTUE & FACULTY (Kingdom-oriented categories)
  primary_virtue TEXT NOT NULL CHECK (primary_virtue IN (
    'Wisdom', 'Stewardship', 'Love', 'Order', 'Wonder'
  )),
  biblical_faculty TEXT,
  
  -- CONTEXT & RHYTHM
  context_anchor TEXT CHECK (context_anchor IN (
    'Morning_Circle', 'Meal_Table', 'Walk_By_The_Way', 
    'Bedside', 'Anytime', 'Transition', 'Sabbath'
  )),
  cluster_tag TEXT,  -- 'catechism', 'hymn', 'history', 'math', 'motor', etc.
  
  -- AGE RANGE
  min_age_months INTEGER NOT NULL DEFAULT 0,
  max_age_months INTEGER NOT NULL DEFAULT 216,
  
  -- CONTENT FIELDS
  guide_steps TEXT,        -- JSON array of steps
  parent_posture TEXT,     -- How parent should approach this
  liturgical_script TEXT,  -- Call-and-response or recitation
  materials TEXT,          -- JSON array of materials needed
  duration_minutes INTEGER DEFAULT 15,
  
  -- READING-SPECIFIC (formation_type = 'reading')
  content_path TEXT,       -- '/books/series/book/content.md'
  cover_image_url TEXT,
  page_count INTEGER,
  render_format TEXT CHECK (render_format IN (
    'markdown', 'image', 'pdf', 'hymnal', 'catechism'
  )),
  
  -- LITURGY-SPECIFIC (formation_type = 'liturgy')
  sequence_number INTEGER, -- Week position for rotation, etc.
  audio_url TEXT,
  source TEXT,             -- 'westminster_shorter', 'trinity_hymnal', 'esv'
  
  -- METADATA
  is_active INTEGER NOT NULL DEFAULT 1,
  content_source TEXT DEFAULT 'schoolos_core',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_formations_type ON formations(formation_type);
CREATE INDEX idx_formations_virtue ON formations(primary_virtue);
CREATE INDEX idx_formations_context ON formations(context_anchor);
CREATE INDEX idx_formations_cluster ON formations(cluster_tag);
CREATE INDEX idx_formations_age ON formations(min_age_months, max_age_months);

-- ============================================================================
-- 4. FORMATION_PROGRESSIONS (Age-appropriate variants)
-- ============================================================================
CREATE TABLE formation_progressions (
  id TEXT PRIMARY KEY,
  formation_id TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN (
    'seedling',  -- 0-24 months
    'sprout',    -- 2-4 years
    'sapling',   -- 5-8 years
    'tree',      -- 9-12 years
    'oak'        -- 13+ years
  )),
  simplified_content TEXT NOT NULL,
  memory_portion TEXT,
  parent_teaching_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
);

CREATE INDEX idx_progressions_formation ON formation_progressions(formation_id);
CREATE INDEX idx_progressions_stage ON formation_progressions(stage);
CREATE UNIQUE INDEX idx_progressions_unique ON formation_progressions(formation_id, stage);

-- ============================================================================
-- 5. EVIDENCES (Unified Completion Tracking)
-- ============================================================================
CREATE TABLE evidences (
  id TEXT PRIMARY KEY,
  student_id TEXT,          -- NULL for family-level items (liturgy, reading)
  parent_id TEXT NOT NULL,  -- The user who recorded it
  formation_id TEXT NOT NULL,
  
  -- Mastery / Progress
  habit_stage TEXT CHECK (habit_stage IN ('Seeding', 'Rooting', 'Fruiting')),
  notes TEXT,
  duration_minutes INTEGER,
  loved_it INTEGER DEFAULT 0,  -- Passion signal
  
  captured_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
);

CREATE INDEX idx_evidences_student ON evidences(student_id);
CREATE INDEX idx_evidences_parent ON evidences(parent_id);
CREATE INDEX idx_evidences_formation ON evidences(formation_id);
CREATE INDEX idx_evidences_date ON evidences(captured_at);

-- ============================================================================
-- 6. FAMILY_PREFERENCES (Settings, pace, overrides)
-- ============================================================================
CREATE TABLE family_preferences (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL UNIQUE, -- Or household_id? Doc says parent_id. Keeping as parent_id for now.
  
  -- Pace & Mode
  pace TEXT DEFAULT 'standard' CHECK (pace IN ('gentle', 'standard', 'accelerated')),
  mode TEXT DEFAULT 'standard' CHECK (mode IN ('baby', 'standard', 'independent')),
  learning_focus TEXT DEFAULT 'balanced' CHECK (learning_focus IN ('balanced', 'interests', 'gaps')),
  
  -- Stream Toggles
  activities_enabled INTEGER DEFAULT 1,
  reading_enabled INTEGER DEFAULT 1,
  liturgy_enabled INTEGER DEFAULT 1,
  
  -- Liturgy Progress (weekly rotation)
  current_catechism_week INTEGER DEFAULT 1,
  current_hymn_week INTEGER DEFAULT 1,
  current_scripture_week INTEGER DEFAULT 1,
  
  -- Overrides (JSON)
  overrides_json TEXT DEFAULT '{}',
  
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_preferences_parent ON family_preferences(parent_id);

-- ============================================================================
-- 7. WEEKLY_PLANS (Cache for generated plans)
-- ============================================================================
CREATE TABLE weekly_plans (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  week_start TEXT NOT NULL,  -- YYYY-MM-DD (Monday)
  plan_json TEXT NOT NULL,   -- Full plan structure
  balance_preference TEXT DEFAULT 'mixed',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_plans_parent_week ON weekly_plans(parent_id, week_start);

-- ============================================================================
-- 8. AI_LOGS (Interaction tracking)
-- ============================================================================
CREATE TABLE ai_logs (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  student_id TEXT,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('explain', 'socratic', 'feedback', 'search')),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  context_json TEXT,  -- Related formation, etc.
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_logs_parent ON ai_logs(parent_id);
CREATE INDEX idx_ai_logs_date ON ai_logs(created_at);

-- ============================================================================
-- 9. PORTFOLIO_ITEMS (Child work samples)
-- ============================================================================
CREATE TABLE portfolio_items (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  parent_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('image', 'audio', 'document', 'text')),
  r2_key TEXT,
  formation_id TEXT,
  milestone_tag TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE SET NULL
);

CREATE INDEX idx_portfolio_student ON portfolio_items(student_id);

-- ============================================================================
-- 10. SESSIONS (Auth Sessions)
-- ============================================================================
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user ON sessions(user_id);
