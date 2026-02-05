-- Daily Anchors: Cached daily formation within an arc
CREATE TABLE IF NOT EXISTS daily_anchors (
    id TEXT PRIMARY KEY,
    household_id TEXT NOT NULL,
    arc_id TEXT,  -- Links to formation_arcs.id
    anchor_date TEXT NOT NULL,
    anchor_data TEXT NOT NULL,  -- Full anchor JSON
    generation_reasoning TEXT,  -- AI's explanation
    regeneration_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(household_id, anchor_date, status)
);

CREATE INDEX idx_anchors_lookup 
ON daily_anchors(household_id, anchor_date, status);
