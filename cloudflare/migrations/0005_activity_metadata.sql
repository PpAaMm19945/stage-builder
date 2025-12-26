-- Migration: Add enhanced metadata columns to activities table
-- These enable better filtering and parent decision-making

-- Setting: Where can this activity be done?
ALTER TABLE activities ADD COLUMN setting TEXT DEFAULT 'indoor';
-- Values: 'indoor', 'outdoor', 'anywhere'

-- Season: Is this activity seasonal?
ALTER TABLE activities ADD COLUMN season TEXT DEFAULT 'any';
-- Values: 'spring', 'summer', 'fall', 'winter', 'any'

-- Prep Time: How long to set up?
ALTER TABLE activities ADD COLUMN prep_time_minutes INTEGER DEFAULT 0;

-- Supervision Required: Can child do independently?
ALTER TABLE activities ADD COLUMN requires_supervision INTEGER DEFAULT 1;
-- Values: 0 = independent play possible, 1 = supervision required

-- Mess Level: How messy is this activity?
ALTER TABLE activities ADD COLUMN mess_level TEXT DEFAULT 'low';
-- Values: 'none', 'low', 'medium', 'high'

-- Update existing activities with sensible defaults based on their content
-- Water play, finger painting, messy play get 'high' mess level
UPDATE activities SET mess_level = 'high' 
WHERE id IN ('sensory-002', 'sensory-005', 'sensory-010', 'motor-010');

-- Outdoor activities get 'outdoor' setting
UPDATE activities SET setting = 'outdoor' 
WHERE id IN ('sensory-006', 'sensory-007', 'motor-009');

-- Activities good for anywhere
UPDATE activities SET setting = 'anywhere' 
WHERE id IN ('language-001', 'language-003', 'social-001', 'social-002', 'cognitive-005');

-- Activities with minimal prep
UPDATE activities SET prep_time_minutes = 0 
WHERE id IN ('language-001', 'social-001', 'social-002', 'language-003');

-- Activities requiring more prep
UPDATE activities SET prep_time_minutes = 5 
WHERE id IN ('sensory-003', 'motor-008', 'sensory-005', 'motor-010');

UPDATE activities SET prep_time_minutes = 10 
WHERE id IN ('sensory-002', 'sensory-010');
