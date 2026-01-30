-- Migration: Seed Living Education Content
-- Description: Backfills metadata for existing activities and adds new "Basket" items for missing subjects.

-- 1. UPDATE EXISTING (Backfill Metadata)
-- Add hidden academic value to existing "Skills"

-- Tummy Time -> PE
UPDATE formations 
SET learning_outcomes = '["PE:Gross Motor", "Health:Development"]', mess_level = 'zero'
WHERE id = 'ey_motor_001';

-- Weather Watching -> Science
UPDATE formations
SET learning_outcomes = '["Science:Meteorology", "Science:Observation"]', mess_level = 'zero'
WHERE id = 'ey_wonder_006';

-- Pouring Practice -> Physics/Motor
UPDATE formations
SET learning_outcomes = '["Science:Physics (Fluids)", "PE:Fine Motor"]', mess_level = 'low'
WHERE id = 'ey_motor_014';

-- First Adding -> Math
UPDATE formations
SET learning_outcomes = '["Math:Arithmetic", "Math:Logic"]', mess_level = 'zero'
WHERE id = 'ey_order_016';

-- Nature Collection -> Biology
UPDATE formations
SET learning_outcomes = '["Science:Biology", "Science:Taxonomy"]', mess_level = 'low'
WHERE id = 'ey_wonder_003';


-- 2. INSERT NEW "BASKET" ITEMS (Filling the History/Science Gap)

INSERT OR REPLACE INTO formations (
  id, title, formation_type, primary_virtue, description, guide_steps,
  parent_posture, materials, duration_minutes, context_anchor, cluster_tag,
  min_age_months, max_age_months, is_active, content_source,
  learning_outcomes, mess_level
) VALUES

-- HISTORY (Disguised as Love/Connection)
('liv_hist_001', 'Grandparent Interview', 'skill', 'Love',
 'History begins with our own family. Asking questions about the past builds connection and historical thinking.',
 '["Prepare 3 simple questions (e.g., favorite toy as a child)", "Call or visit grandparent", "Listen and record answers", "Draw a picture of their story"]',
 'Listen alongside them. Bridge the generations.',
 '["Phone or visit", "Paper and crayons"]', 30, 'Anytime', 'history',
 36, 96, 1, 'living_education',
 '["History:Oral Tradition", "Language:Interviewing", "Social:Family"]', 'zero'),

-- GEOGRAPHY (Disguised as Order/Spatial)
('liv_geo_001', 'Map Your Room', 'skill', 'Order',
 'Geography starts at our feet. Drawing a map of a familiar space teaches scale, symbols, and perspective.',
 '["Walk around the room together", "Notice big furniture", "Draw the shape of the room", "Add the bed and door", "Mark a star where you are standing"]',
 'Focus on relative position (next to, across from).',
 '["Paper", "Pencil", "Measuring tape (optional)"]', 20, 'Anytime', 'geography',
 48, 96, 1, 'living_education',
 '["Geography:Mapping", "Math:Spatial Reasoning"]', 'low'),

-- SCIENCE (Disguised as Stewardship/Cooking)
('liv_sci_001', 'Baking Bread', 'skill', 'Stewardship',
 'Baking is edible chemistry. Watching yeast come alive teaches biology and chemical change.',
 '["Mix warm water and yeast", "Watch it bubble (that is life!)", "Measure flour carefully", "Knead the dough (motor work)", "Watch it rise, then bake"]',
 'Wonder at the transformation. Smells are memories.',
 '["Flour", "Yeast", "Water", "Bowl", "Oven"]', 120, 'Anytime', 'science',
 36, 96, 1, 'living_education',
 '["Science:Chemistry", "Science:Biology (Yeast)", "Math:Measurement"]', 'high');
