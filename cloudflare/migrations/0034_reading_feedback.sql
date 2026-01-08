-- Migration: Add ratings and feedback to reading sessions

-- Add feedback columns to reading_sessions
ALTER TABLE reading_sessions ADD COLUMN rating INTEGER; -- 1-5
ALTER TABLE reading_sessions ADD COLUMN read_again INTEGER; -- 0 or 1
ALTER TABLE reading_sessions ADD COLUMN feedback_json TEXT; -- Extra metadata (e.g. "too hard", "loved it")
