-- Migration 0033: Activity Book Recommendations
-- Allows activities to suggest related books for reading-enabled families

ALTER TABLE activities ADD COLUMN recommended_books TEXT DEFAULT '[]';
