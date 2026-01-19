-- Migration 0025: Biblical Reframing (Phase 3)

-- Add theological metadata columns
-- Note: biblical_domain exists from Migration 0011.
-- Since SQLite ALTER COLUMN is limited, we just try adding virtue_focus
ALTER TABLE activities ADD COLUMN virtue_focus TEXT;

-- Reframing specific activities
UPDATE activities
SET title = 'Color Sorting - God''s Creation',
    description = 'Sort objects by color to reinforce color recognition and celebrate God''s creative design. "God made many beautiful colors for us to enjoy!"',
    biblical_domain = 'wisdom',
    instructions = '["Gather colored objects from nature and home", "Name colors together", "Sort into containers saying: God made red things!", "Count each group", "Thank God for colors"]'
WHERE id = 'cognitive-004';

UPDATE activities
SET description = 'Sort objects into groups based on type. God created different kinds of animals, plants, and things - we can organize them to understand His world better.',
    biblical_domain = 'wisdom',
    instructions = '["Mix different types of toys (animals, vehicles, etc)", "Discuss: God made animals different from things people make", "Sort into containers", "Count each group", "Thank God for variety in creation"]'
WHERE id = 'cognitive-010';

UPDATE activities
SET title = 'God Made My Body',
    description = 'Learn and point to body parts while celebrating that God designed our bodies. "You are fearfully and wonderfully made!" (Psalm 139:14)',
    biblical_domain = 'stature', -- Simplified from 'wisdom,stature' to fit constraints if any
    instructions = '["Point to your nose and say: God gave you a nose!", "Ask: Where is YOUR nose?", "Use songs like Head, Shoulders, Knees and Toes", "Practice on dolls", "Thank God for each body part"]'
WHERE id = 'language-007';

UPDATE activities
SET title = 'Gentle Hands - Loving Others',
    description = 'Practice kind touch with peers or toys. Jesus was gentle and kind - we can be too! (Matthew 11:29)',
    biblical_domain = 'favor_with_man',
    virtue_focus = 'gentleness, kindness',
    instructions = '["Model gentle touch on stuffed animal", "Say: Jesus was gentle. We can be gentle too.", "Practice gentle petting", "Praise: That was loving and kind!", "Redirect rough play to gentleness"]'
WHERE id = 'social-003';

UPDATE activities
SET title = 'Patience and Sharing',
    description = 'Share toys and take turns in simple games. "Love is patient" (1 Corinthians 13:4). Learning to wait and share shows love.',
    biblical_domain = 'favor_with_man',
    virtue_focus = 'patience, kindness, love',
    instructions = '["Say: My turn, your turn - we take turns because we love each other", "Keep turns very short at first", "Celebrate waiting: You were so patient!", "Model patience yourself", "Praise sharing"]'
WHERE id = 'social-004';

UPDATE activities
SET title = 'Obedience and Listening',
    description = 'Follow one and two-step directions. "Children, obey your parents in the Lord" (Ephesians 6:1). Obedience is a gift we give God and our parents.',
    biblical_domain = 'wisdom',
    virtue_focus = 'obedience',
    instructions = '["Give clear, simple command: Please bring me the ball", "Wait patiently", "Celebrate: Thank you for obeying!", "Try two steps when ready", "Connect to honoring God: When you obey, you honor God!"]'
WHERE id = 'language-005';

-- Backfill remaining NULL domains
UPDATE activities SET biblical_domain = 'stature' WHERE domain = 'motor' AND biblical_domain IS NULL;
UPDATE activities SET biblical_domain = 'wisdom' WHERE domain IN ('cognitive', 'language', 'pre-academic') AND biblical_domain IS NULL;
UPDATE activities SET biblical_domain = 'favor_with_man' WHERE domain = 'social-emotional' AND biblical_domain IS NULL;
