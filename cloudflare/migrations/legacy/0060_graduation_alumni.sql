-- Migration number: 0060 	 2026-01-18T20:34:00.000Z
-- Add Graduation Details to Students

ALTER TABLE students ADD COLUMN is_graduated INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN graduation_date TEXT;
