-- Migration v2_0019: Seed Content for Missing Paths
-- Adds dummy content for toddler, reading, and history paths to enable testing.

-- 1. Toddler Development
INSERT INTO formations (id, title, description, formation_type, primary_virtue, context_anchor, cluster_tag, min_age_months, max_age_months, content_status)
VALUES
  ('toddler-1', 'Sensory Bins', 'Explore textures with a simple sensory bin.', 'skill', 'Wonder', 'Anytime', 'toddler', 12, 36, 'published'),
  ('toddler-2', 'Stacking Blocks', 'Build a tower and knock it down.', 'skill', 'Order', 'Anytime', 'toddler', 18, 36, 'published'),
  ('toddler-3', 'Animal Sounds', 'Practice making animal noises together.', 'skill', 'Wisdom', 'Anytime', 'toddler', 12, 36, 'published');

-- 2. Early Reading
INSERT INTO formations (id, title, description, formation_type, primary_virtue, context_anchor, cluster_tag, min_age_months, max_age_months, content_status)
VALUES
  ('reading-1', 'Letter A', 'Introduction to the letter A sound and shape.', 'skill', 'Wisdom', 'Anytime', 'reading', 36, 60, 'published'),
  ('reading-2', 'Rhyming Time', 'Simple rhyming games with cat and hat.', 'skill', 'Wisdom', 'Anytime', 'reading', 36, 60, 'published'),
  ('reading-3', 'Letter B', 'Introduction to the letter B sound and shape.', 'skill', 'Wisdom', 'Anytime', 'reading', 36, 60, 'published');

-- 3. African History Young (Stories)
INSERT INTO formations (id, title, description, formation_type, primary_virtue, context_anchor, cluster_tag, min_age_months, max_age_months, content_status)
VALUES
  ('hist-y-1', 'The Great Kingdom', 'A story about the Kingdom of Mali.', 'reading', 'Wisdom', 'Anytime', 'african_history_young', 36, 96, 'published'),
  ('hist-y-2', 'The River Nile', 'Following the longest river in the world.', 'reading', 'Wonder', 'Anytime', 'african_history_young', 36, 96, 'published'),
  ('hist-y-3', 'Queen Amina', 'The story of the warrior queen.', 'reading', 'Stewardship', 'Anytime', 'african_history_young', 36, 96, 'published');

-- 4. African History Full
INSERT INTO formations (id, title, description, formation_type, primary_virtue, context_anchor, cluster_tag, min_age_months, max_age_months, content_status)
VALUES
  ('hist-f-1', 'Origins of Civilization', 'Understanding early African civilizations.', 'reading', 'Wisdom', 'Anytime', 'african_history', 120, 216, 'published'),
  ('hist-f-2', 'Trade Routes', 'The impact of trade across the continent.', 'reading', 'Stewardship', 'Anytime', 'african_history', 120, 216, 'published'),
  ('hist-f-3', 'Independence Movements', 'The road to modern African nations.', 'reading', 'Love', 'Anytime', 'african_history', 120, 216, 'published');

-- 5. Fix Liturgy Total Items (approximate sum of catechism + hymns + scripture)
UPDATE learning_paths
SET total_items = 300
WHERE path_type = 'liturgy';

SELECT 'Seeded path content successfully.';
