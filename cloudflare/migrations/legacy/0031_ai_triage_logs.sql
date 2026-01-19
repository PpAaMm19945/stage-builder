-- Migration 0031: AI Triage Logging
-- Tracks the performance of the new "Front Desk" Triage layer

CREATE TABLE IF NOT EXISTS ai_triage_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    input_text TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('VALID', 'AMBIGUOUS', 'INVALID')),
    reasoning TEXT,
    confidence REAL,
    was_blocks INTEGER DEFAULT 0, -- 1 if the request was stopped at Triage
    clarification_question TEXT,  -- If vague, what did we ask?
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_triage_logs_status ON ai_triage_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_triage_logs_created ON ai_triage_logs(created_at DESC);
