-- Migration 0022: Independence Settings & AI Interaction Logs

-- Independence Settings Table
CREATE TABLE IF NOT EXISTS independence_settings (
    id TEXT PRIMARY KEY,
    parent_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    subject TEXT NOT NULL CHECK(subject IN (
        'all', 'bible', 'history', 'math', 'reading', 
        'motor', 'language', 'cognitive', 'social-emotional', 'pre-academic'
    )),
    level TEXT NOT NULL CHECK(level IN ('parent_led', 'guided', 'independent')),
    can_mark_complete INTEGER DEFAULT 0,
    can_ask_ai INTEGER DEFAULT 0,
    can_view_portfolio INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(student_id, subject),
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_independence_settings_student ON independence_settings(student_id);
CREATE INDEX IF NOT EXISTS idx_independence_settings_parent ON independence_settings(parent_id);

-- AI Interaction Logs Table
CREATE TABLE IF NOT EXISTS ai_interaction_logs (
    id TEXT PRIMARY KEY,
    parent_id TEXT NOT NULL,
    student_id TEXT,  -- NULL = parent's own interaction
    interaction_type TEXT NOT NULL CHECK(interaction_type IN ('explain', 'socratic', 'feedback')),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    context_json TEXT,  -- JSON: { activityId, activityTitle, domain, etc. }
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_interaction_logs_parent ON ai_interaction_logs(parent_id);
CREATE INDEX IF NOT EXISTS idx_ai_interaction_logs_student ON ai_interaction_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_interaction_logs_created ON ai_interaction_logs(created_at DESC);