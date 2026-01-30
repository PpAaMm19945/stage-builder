-- Migration: Living Education Schema Update
-- Description: Adds "invisible registrar" metadata columns and cleans up types.
-- Note: 'service' and 'rest' types are soft-deprecated (allowed in DB for safety, removed in code).

-- 1. Add 'learning_outcomes' to FORMATIONS
-- Allows tagging activities with hidden academic subjects (e.g., '["Science:Chemistry", "Math:Fractions"]')
-- ALTER TABLE formations ADD COLUMN learning_outcomes TEXT; -- ALREADY EXISTS

-- 2. Add 'mess_level' to FORMATIONS
-- Helps parents filter based on available energy (e.g., 'zero', 'low', 'high')
-- ALTER TABLE formations ADD COLUMN mess_level TEXT DEFAULT 'low'; -- ALREADY EXISTS

-- 3. Add 'learning_outcomes' to BOOKS
-- Allows books to credit broad subject areas (e.g., '["History:Ancient", "Theology"]')
-- ALTER TABLE books ADD COLUMN learning_outcomes TEXT; -- ALREADY ON FORMATIONS

-- 4. Add 'themes' to BOOKS (Now Formations)
-- For thematic searching overlap (e.g., '["Perseverance", "Nature"]')
ALTER TABLE formations ADD COLUMN themes TEXT;

-- 5. Add 'related_activities' to BOOKS (Now Formations)
-- The physical link between a Book and its Basket of activities
ALTER TABLE formations ADD COLUMN related_activities TEXT;
