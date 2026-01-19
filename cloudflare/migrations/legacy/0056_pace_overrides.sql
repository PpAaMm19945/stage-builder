-- Migration 0056: Add per-subject pace overrides to students table
-- Part of Phase 4: Pace Flexibility

-- Add pace_overrides JSON column to students table
-- Structure: { "history": "accelerated", "math": "gentle", "catechism": "standard" }
-- NULL means: use global family pace from family_preferences
ALTER TABLE students ADD COLUMN pace_overrides TEXT DEFAULT NULL;

-- Example valid values for pace:
-- 'gentle'      - Slower pace, more repetition, simpler content
-- 'standard'    - Default pace from family_preferences
-- 'accelerated' - Faster pace, more challenging content

-- Example usage:
-- UPDATE students SET pace_overrides = '{"history": "accelerated", "math": "gentle"}' WHERE id = 'student_123';
