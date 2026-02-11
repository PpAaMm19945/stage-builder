-- Migration: v2_0066_chat_quotas.sql
-- Description: Add user chat usage tracking for quotas

CREATE TABLE IF NOT EXISTS user_daily_chat_usage (
    user_id TEXT NOT NULL,
    usage_date TEXT NOT NULL, -- YYYY-MM-DD
    message_count INTEGER DEFAULT 0,
    token_count INTEGER DEFAULT 0,
    updated_at INTEGER DEFAULT (unixepoch()),
    PRIMARY KEY (user_id, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_chat_usage_date ON user_daily_chat_usage(usage_date);
