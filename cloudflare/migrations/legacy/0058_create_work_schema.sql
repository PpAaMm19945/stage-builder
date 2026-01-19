-- Migration 0058: Create Work Schema (Apprenticeships & Work Logs)
-- Phase 5: Earning While Learning

-- ============================================================================
-- 1. APPRENTICESHIPS
-- Tracks high-level engagements: Jobs, Service Projects, Apprenticeships
-- ============================================================================
CREATE TABLE apprenticeships (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  
  -- Core Classification
  type TEXT NOT NULL CHECK (type IN ('apprenticeship', 'service', 'job')),
  title TEXT NOT NULL,           -- e.g., "Junior Web Developer", "Community Garden Volunteer"
  organization_name TEXT,        -- e.g., "Acme Corp", "Local Church"
  mentor_name TEXT,              -- Person overseeing the work
  
  -- Details
  description TEXT,
  start_date TEXT,               -- ISO8601 YYYY-MM-DD
  end_date TEXT,
  
  -- Progress Tracking
  total_hours_required REAL,     -- Goal hours (optional)
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  
  -- Metadata
  skills_learned TEXT,           -- JSON array of strings
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
  date TEXT NOT NULL,            -- ISO8601 YYYY-MM-DD
  hours REAL NOT NULL,           -- Duration in hours
  description TEXT NOT NULL,     -- What happened today?
  photo_url TEXT,                -- Proof/Documentation
  
  -- Skill Validations (Optional)
  skills_applied TEXT,           -- JSON array of skills used in this specific session
  
  -- Approval Workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  supervisor_note TEXT,          -- Parent/Mentor feedback
  
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (apprenticeship_id) REFERENCES apprenticeships(id) ON DELETE CASCADE
);

CREATE INDEX idx_work_entries_apprenticeship ON work_entries(apprenticeship_id);
CREATE INDEX idx_work_entries_date ON work_entries(date);


-- ============================================================================
-- 3. LINK TO PORTFOLIO
-- Treat completed apprenticeships as portfolio items
-- ============================================================================
-- We need to check if column exists first or just add it. 
-- Since SQLite ALTER TABLE is limited, and we might run this repeatedly in dev, 
-- we'll use a safe column addition pattern if possible, or just the standard ALTER.
-- D1 supports standard ALTER TABLE ADD COLUMN.

ALTER TABLE portfolio_items ADD COLUMN apprenticeship_id TEXT REFERENCES apprenticeships(id) ON DELETE SET NULL;
