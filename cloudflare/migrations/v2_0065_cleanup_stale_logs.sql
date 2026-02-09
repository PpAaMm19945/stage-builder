-- One-time cleanup of stale ai_logs entries older than 7 days
DELETE FROM ai_logs WHERE created_at < date('now', '-7 days');
