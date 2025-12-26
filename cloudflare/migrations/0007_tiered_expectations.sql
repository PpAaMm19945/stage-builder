-- Update cognitive-013 Container Fill and Dump
UPDATE activities SET 
  activity_type = 'family_session',
  uses_core_kit = 1,
  tiered_expectations = '[
    {"age_min":18,"age_max":30,"tier":"Tier 1","expectation":"Stack 2-3 blocks, knock them down"},
    {"age_min":31,"age_max":48,"tier":"Tier 2","expectation":"Build a tower of 5+, count blocks 1-6"},
    {"age_min":49,"age_max":72,"tier":"Tier 3","expectation":"Create patterns, describe shapes, follow building instructions"}
  ]'
WHERE id = 'cognitive-013';

-- Update cognitive-010 Sorting Colors
UPDATE activities SET 
  activity_type = 'family_session',
  uses_core_kit = 1,
  tiered_expectations = '[
    {"age_min":18,"age_max":30,"tier":"Tier 1","expectation":"Sort red vs blue into two piles"},
    {"age_min":31,"age_max":48,"tier":"Tier 2","expectation":"Sort 4+ colors into separate piles"},
    {"age_min":49,"age_max":72,"tier":"Tier 3","expectation":"Sort by multiple attributes (color then size)"}
  ]'
WHERE id = 'cognitive-010';

-- Update motor-005 Ball Roll
UPDATE activities SET 
  activity_type = 'family_session',
  uses_core_kit = 1,
  tiered_expectations = '[
    {"age_min":12,"age_max":24,"tier":"Tier 1","expectation":"Roll ball back and forth sitting close"},
    {"age_min":25,"age_max":36,"tier":"Tier 2","expectation":"Roll ball to hit a target (like a bottle)"},
    {"age_min":37,"age_max":60,"tier":"Tier 3","expectation":"Catch bounced ball with two hands"}
  ]'
WHERE id = 'motor-005';

-- Update social-002 Peek-a-boo (renaming/repurposing for family fun)
UPDATE activities SET 
  activity_type = 'family_session',
  uses_core_kit = 0,
  tiered_expectations = '[
    {"age_min":6,"age_max":18,"tier":"Tier 1","expectation":"Reacts to peek-a-boo with smiles/laughter"},
    {"age_min":19,"age_max":30,"tier":"Tier 2","expectation":"Initiates peek-a-boo/hiding games"},
    {"age_min":31,"age_max":48,"tier":"Tier 3","expectation":"Plays hide and seek (hiding simple objects)"}
  ]'
WHERE id = 'social-002';

-- Update literacy-008 Reading Together (Generic book reading)
UPDATE activities SET 
  activity_type = 'family_session',
  uses_core_kit = 1,
  tiered_expectations = '[
    {"age_min":12,"age_max":24,"tier":"Tier 1","expectation":"Points to pictures when named"},
    {"age_min":25,"age_max":40,"tier":"Tier 2","expectation":"Names objects in pictures, turns pages"},
    {"age_min":41,"age_max":60,"tier":"Tier 3","expectation":"Retells simple parts of the story"}
  ]'
WHERE id = 'literacy-008';
