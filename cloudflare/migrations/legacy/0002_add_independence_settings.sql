-- Add independence_settings column to students table
-- Stores JSON configuration for student permissions

ALTER TABLE students ADD COLUMN independence_settings TEXT DEFAULT '{}';
