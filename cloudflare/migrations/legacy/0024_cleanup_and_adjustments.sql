-- Migration 0024: Deletions, Archives, and Age Adjustments (Phases 2 & 4)

-- 1. DELETIONS / REPLACEMENTS
-- Remove/Replace Yoga with Biblical alternative
UPDATE activities
SET title = 'Stretching and Balance Exercises',
    description = 'Simple stretching and balance exercises to develop body control and flexibility. These movements help children learn to control their bodies with strength and grace.',
    -- Note: biblical_domain column added in next migration, so we skip setting it here
    instructions = '["Find quiet space", "Deep breaths together", "Try animal stretches: cat stretch, dog stretch, tree balance", "Hold positions for a few seconds", "Relax and rest"]',
    materials = '["Open space", "Mat (optional)"]'
WHERE id = 'motor-033';

-- 2. ARCHIVING
-- Note: 'is_archived' exists in 0011. 'archived' is redundant but user requested it.
ALTER TABLE activities ADD COLUMN archived BOOLEAN DEFAULT 0;
ALTER TABLE activities ADD COLUMN deprecated BOOLEAN DEFAULT 0;

-- Archive redundant activities
UPDATE activities SET archived = 1 WHERE id IN ('cognitive-016', 'preacademic-005', 'cognitive-018');

-- 3. AGE ADJUSTMENTS
-- Extend ranges for books and songs (Charlotte Mason)
UPDATE activities SET max_age_months = 72, description = 'Explore simple picture books together. Living books are central to Charlotte Mason method and continue through all early years.' WHERE id = 'language-002';
UPDATE activities SET max_age_months = 72, title = 'Hymns, Rhymes, and Songs', description = 'Sing hymns, nursery rhymes, and action songs together. Prioritize Scripture-based songs and classic hymns for character formation.' WHERE id = 'language-003';
UPDATE activities SET max_age_months = 72, description = 'Read age-appropriate stories with expression. Include narration: ask child to retell story in own words (Charlotte Mason method).' WHERE id = 'language-006';

-- Delay formal academics (Letter Intro)
UPDATE activities
SET min_age_months = 42,
    max_age_months = 72,
    title = 'Playful Letter Discovery',
    description = 'If child shows interest, gently introduce letters through environmental print and play. Charlotte Mason: NO formal lessons before age 6. This is exploration only, never drill.',
    difficulty = 'beginner',
    instructions = '["Wait for child to ask about letters", "Point out letters on signs during walks", "Sing alphabet song playfully", "Use magnetic letters for play", "NEVER pressure or test", "Stop immediately if child loses interest"]'
WHERE id = 'language-010';
