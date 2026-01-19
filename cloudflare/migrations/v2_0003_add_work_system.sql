-- Migration v2_0003: Add Work System (Apprenticeships & Logs)
-- Recovered from legacy/0058_create_work_schema.sql

-- ============================================================================
-- 1. APPRENTICESHIPS
-- Tracks high-level engagements: Jobs, Service Projects, Apprenticeships
-- ============================================================================
CREATE TABLE apprenticeships (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  
  -- Core Classification
  type TEXT NOT NULL CHECK (type IN ('apprenticeship', 'service', 'job')),
  title TEXT NOT NULL,
  organization_name TEXT,
  mentor_name TEXT,
  
  -- Details
  description TEXT,
  start_date TEXT,
  end_date TEXT,
  
  -- Progress Tracking
  total_hours_required REAL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  
  -- Metadata
  skills_learned TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX idx_apprenticeships_student ON apprenticeships(student_id);
CREATE INDEX idx_apprenticeships_type ON apprenticeships(type);
CREATE INDEX idx_apprenticeships_status ON apprenticeships(status);

-- ============================================================================
-- 2. WORK ENTRIES (Logs)
-- Individual sessions of work/service
-- ============================================================================
CREATE TABLE work_entries (
  id TEXT PRIMARY KEY,
  apprenticeship_id TEXT NOT NULL,
  
  -- Log Details
  date TEXT NOT NULL,
  hours REAL NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  
  -- Skill Validations
  skills_applied TEXT,
  
  -- Approval Workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  supervisor_note TEXT,
  
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (apprenticeship_id) REFERENCES apprenticeships(id) ON DELETE CASCADE
);

CREATE INDEX idx_work_entries_apprenticeship ON work_entries(apprenticeship_id);
CREATE INDEX idx_work_entries_date ON work_entries(date);

-- ============================================================================
-- 3. LINK TO PORTFOLIO
-- ============================================================================
ALTER TABLE portfolio_items ADD COLUMN apprenticeship_id TEXT REFERENCES apprenticeships(id) ON DELETE SET NULL;
