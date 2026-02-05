-- Formation Arcs: 2-week AI-generated curriculum plans
CREATE TABLE IF NOT EXISTS formation_arcs (
    id TEXT PRIMARY KEY,
    household_id TEXT NOT NULL,
    arc_start_date TEXT NOT NULL,
    arc_end_date TEXT NOT NULL,
    arc_data TEXT NOT NULL,  -- Full JSON structure
    generation_reasoning TEXT,  -- AI's explanation (shown to parent)
    status TEXT DEFAULT 'active',  -- active, completed, replaced
    feedback_notes TEXT,  -- Parent feedback collected
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_arcs_household_active 
ON formation_arcs(household_id, status, arc_start_date DESC);
