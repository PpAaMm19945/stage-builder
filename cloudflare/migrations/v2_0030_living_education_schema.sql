-- Migration: Living Education Schema Update
-- Description: Adds "invisible registrar" metadata columns and cleans up types.
-- Note: 'service' and 'rest' types are soft-deprecated (allowed in DB for safety, removed in code).

-- 1. Add 'learning_outcomes' to FORMATIONS
-- Allows tagging activities with hidden academic subjects (e.g., '["Science:Chemistry", "Math:Fractions"]')
ALTER TABLE formations ADD COLUMN learning_outcomes TEXT;

-- 2. Add 'mess_level' to FORMATIONS
-- Helps parents filter based on available energy (e.g., 'zero', 'low', 'high')
ALTER TABLE formations ADD COLUMN mess_level TEXT DEFAULT 'low';

-- 3. Add 'learning_outcomes' to BOOKS
-- Allows books to credit broad subject areas (e.g., '["History:Ancient", "Theology"]')
ALTER TABLE books ADD COLUMN learning_outcomes TEXT;

-- 4. Add 'themes' to BOOKS
-- For thematic searching overlap (e.g., '["Perseverance", "Nature"]')
ALTER TABLE books ADD COLUMN themes TEXT;

-- 5. Add 'related_activities' to BOOKS
-- The physical link between a Book and its Basket of activities
ALTER TABLE books ADD COLUMN related_activities TEXT;
