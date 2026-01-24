-- 1. Family Profiles (replaces rigid path subscriptions)
CREATE TABLE IF NOT EXISTS family_profiles (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL UNIQUE,
  
  -- Time availability
  morning_minutes INTEGER DEFAULT 15,
  evening_minutes INTEGER DEFAULT 0,
  available_days TEXT DEFAULT '["Mon","Tue","Wed","Thu","Fri"]',
  
  -- Goals and preferences (JSON arrays/objects)
  goals TEXT DEFAULT '[]',
  preferences TEXT DEFAULT '{}',
  
  -- Current progress positions (portable from old system)
  catechism_position INTEGER DEFAULT 1,
  catechism_source TEXT DEFAULT 'wsc',
  hymn_position INTEGER DEFAULT 1,
  scripture_book TEXT DEFAULT 'psalms',
  scripture_chapter INTEGER DEFAULT 1,
  
  -- Onboarding tracking
  onboarding_mode TEXT,
  onboarding_completed_at TEXT,
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Weekly Plans V2 (supports frozen days)
CREATE TABLE IF NOT EXISTS weekly_plans_v2 (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  week_start TEXT NOT NULL,
  
  plan_data TEXT NOT NULL,
  
  generated_at TEXT NOT NULL,
  generated_by TEXT DEFAULT 'ai',
  regenerated_at TEXT,
  frozen_through TEXT,
  
  UNIQUE(family_id, week_start),
  FOREIGN KEY (family_id) REFERENCES households(id) ON DELETE CASCADE
);

-- 3. Activity Progress (granular tracking)
CREATE TABLE IF NOT EXISTS activity_progress (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  
  activity_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  scheduled_date TEXT NOT NULL,
  
  status TEXT DEFAULT 'upcoming',
  started_at TEXT,
  completed_at TEXT,
  
  progress_data TEXT,
  completion_source TEXT,
  
  transferred_to TEXT,
  transferred_from TEXT,
  
  created_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (family_id) REFERENCES households(id) ON DELETE CASCADE
);

-- 4. AI Action Log (accountability)
CREATE TABLE IF NOT EXISTS ai_action_log (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  
  action_type TEXT NOT NULL,
  action_data TEXT NOT NULL,
  reason TEXT,
  
  status TEXT DEFAULT 'pending',
  confirmed_at TEXT,
  confirmed_by TEXT,
  
  reversed_at TEXT,
  reversal_reason TEXT,
  
  created_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (family_id) REFERENCES households(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_family_profiles_parent ON family_profiles(parent_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_v2_family_week ON weekly_plans_v2(family_id, week_start);
CREATE INDEX IF NOT EXISTS idx_activity_progress_family_date ON activity_progress(family_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_ai_action_log_family ON ai_action_log(family_id);
