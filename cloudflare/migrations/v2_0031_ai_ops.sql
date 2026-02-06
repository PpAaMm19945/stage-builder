-- Migration for AI Operations Dashboard

CREATE TABLE ai_telemetry (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    feature TEXT NOT NULL, -- "spine", "anchor", "report"
    model TEXT,
    request_tokens INTEGER,
    response_tokens INTEGER,
    latency_ms INTEGER,
    status TEXT NOT NULL, -- "success", "error"
    error_type TEXT,
    metadata_json TEXT -- Safe non-PII metadata
);

CREATE TABLE ai_content_audit (
    id TEXT PRIMARY KEY,
    feature TEXT NOT NULL,
    content_id TEXT, -- Reference to spine/anchor ID
    content_excerpt TEXT, -- Sanitized excerpt
    created_at TEXT NOT NULL
);
