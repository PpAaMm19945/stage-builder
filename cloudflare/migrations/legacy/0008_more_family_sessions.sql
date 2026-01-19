-- Migration 0008: Add More Family Session Activities (Corrected)
-- Expands family activities library with 15 new activities
-- Mapped to standard domains: pre-academic, motor, language, cognitive
-- IDs shifted to 030+ range where collisions occurred with 0004

-- ART/CREATIVE ACTIVITIES (Mapped to 'pre-academic')
INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'creative-001',
  'Drawing Together',
  'Free drawing, coloring, and creative expression with various drawing tools.',
  'pre-academic',
  18, 72, 20,
  '["Crayons", "Paper", "Markers (optional)"]',
  '["Gather drawing materials", "Give each child paper", "Draw alongside your children", "Talk about colors", "Display artwork"]',
  '["Fine motor development", "Creative expression", "Color recognition"]',
  'beginner',
  'family_session',
  1,
  '[{"age_min":18,"age_max":30,"tier":"Tier 1","expectation":"Make marks on paper"},{"age_min":31,"age_max":48,"tier":"Tier 2","expectation":"Draw simple shapes"},{"age_min":49,"age_max":72,"tier":"Tier 3","expectation":"Draw recognizable objects"}]'
);

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'creative-002',
  'Painting Fun',
  'Explore painting with fingers, brushes, or sponges.',
  'pre-academic',
  24, 72, 25,
  '["Paint", "Paper", "Brushes"]',
  '["Cover work area", "Set out paint", "Show how to dip brush", "Encourage mixing", "Let dry"]',
  '["Color mixing", "Sensory exploration", "Creative expression"]',
  'beginner',
  'family_session',
  0,
  '[{"age_min":24,"age_max":36,"tier":"Tier 1","expectation":"Finger paint"},{"age_min":37,"age_max":54,"tier":"Tier 2","expectation":"Use brush"},{"age_min":55,"age_max":72,"tier":"Tier 3","expectation":"Paint intentional designs"}]'
);

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'creative-003',
  'Playdough Sculpture',
  'Creative play with playdough—rolling, shaping, cutting.',
  'pre-academic',
  18, 72, 20,
  '["Playdough", "Rolling pin"]',
  '["Give playdough portion", "Demonstrate rolling", "Introduce tools", "Create together", "Clean up"]',
  '["Hand strength", "Fine motor control", "Creativity"]',
  'beginner',
  'family_session',
  1,
  '[{"age_min":18,"age_max":30,"tier":"Tier 1","expectation":"Poke and squeeze"},{"age_min":31,"age_max":48,"tier":"Tier 2","expectation":"Roll balls and snakes"},{"age_min":49,"age_max":72,"tier":"Tier 3","expectation":"Create objects"}]'
);

-- MOVEMENT ACTIVITIES (Mapped to 'motor', IDs shifted to 030+)
INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'motor-031',
  'Dance Party',
  'Movement and dancing to music—freestyle, freeze dance.',
  'motor',
  12, 72, 15,
  '["Music player", "Open space"]',
  '["Clear space", "Play upbeat music", "Dance together", "Try freeze dance", "Take turns leading"]',
  '["Gross motor", "Rhythm", "Body awareness"]',
  'beginner',
  'family_session',
  0,
  '[{"age_min":12,"age_max":24,"tier":"Tier 1","expectation":"Bounce to music"},{"age_min":25,"age_max":42,"tier":"Tier 2","expectation":"Freeze dance"},{"age_min":43,"age_max":72,"tier":"Tier 3","expectation":"Create dance moves"}]'
);

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'motor-032',
  'Obstacle Course',
  'Create a simple obstacle course with household items.',
  'motor',
  24, 72, 20,
  '["Pillows", "Furniture", "Tape"]',
  '["Set up stations", "Walk through first", "Demonstrate", "Cheer them on", "Adjust difficulty"]',
  '["Gross motor", "Balance", "Problem solving"]',
  'beginner',
  'family_session',
  0,
  '[{"age_min":24,"age_max":36,"tier":"Tier 1","expectation":"Crawl through tunnel"},{"age_min":37,"age_max":54,"tier":"Tier 2","expectation":"Jump over obstacles"},{"age_min":55,"age_max":72,"tier":"Tier 3","expectation":"Multi-step course"}]'
);

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'motor-033',
  'Yoga Poses',
  'Simple yoga poses and breathing exercises.',
  'motor',
  24, 72, 15,
  '["Open space", "Mat (optional)"]',
  '["Find quiet space", "Deep breaths", "Introduce animal poses", "Hold poses", "Relax"]',
  '["Body control", "Flexibility", "Mindfulness"]',
  'beginner',
  'family_session',
  0,
  '[{"age_min":24,"age_max":36,"tier":"Tier 1","expectation":"Simple stretches"},{"age_min":37,"age_max":54,"tier":"Tier 2","expectation":"Hold animal poses"},{"age_min":55,"age_max":72,"tier":"Tier 3","expectation":"Hold 10+ seconds"}]'
);

-- MUSIC ACTIVITIES (Mapped to 'pre-academic' or 'motor')
INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'music-001',
  'Sing-Along',
  'Singing nursery rhymes and action songs together.',
  'pre-academic',
  6, 72, 15,
  '["Song lyrics", "Props"]',
  '["Choose familiar songs", "Sing clearly", "Add motions", "Pause for words", "Repeat favorites"]',
  '["Language", "Memory", "Rhythm"]',
  'beginner',
  'family_session',
  0,
  '[{"age_min":6,"age_max":24,"tier":"Tier 1","expectation":"Do hand motions"},{"age_min":25,"age_max":42,"tier":"Tier 2","expectation":"Sing familiar words"},{"age_min":43,"age_max":72,"tier":"Tier 3","expectation":"Sing whole songs"}]'
);

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'music-002',
  'Rhythm Instruments',
  'Playing with shakers, drums, or homemade instruments.',
  'pre-academic',
  12, 72, 15,
  '["Instruments", "Rice shakers"]',
  '["Give instrument", "Explore sounds", "Play to music", "Lead rhythm", "Copy patterns"]',
  '["Rhythm", "Listening", "Turn-taking"]',
  'beginner',
  'family_session',
  1,
  '[{"age_min":12,"age_max":30,"tier":"Tier 1","expectation":"Make sounds"},{"age_min":31,"age_max":48,"tier":"Tier 2","expectation":"Tap to rhythm"},{"age_min":49,"age_max":72,"tier":"Tier 3","expectation":"Copy patterns"}]'
);

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'music-003',
  'Musical Movement',
  'Moving to different types of music based on tempo.',
  'motor',
  12, 72, 15,
  '["Music player", "Open space"]',
  '["Play different music", "Suggest movements", "Let children choose", "Change music", "End with calm"]',
  '["Body awareness", "Listening", "Expression"]',
  'beginner',
  'family_session',
  0,
  '[{"age_min":12,"age_max":24,"tier":"Tier 1","expectation":"Move to music"},{"age_min":25,"age_max":42,"tier":"Tier 2","expectation":"March/tiptoe"},{"age_min":43,"age_max":72,"tier":"Tier 3","expectation":"Match mood"}]'
);

-- NATURE ACTIVITIES (Mapped to 'pre-academic')
INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'science-011',
  'Leaf Collecting',
  'Collect leaves outdoors and sort them.',
  'pre-academic',
  24, 72, 25,
  '["Outdoor space", "Bag"]',
  '["Go outside", "Collect leaves", "Spread out", "Sort by color/size", "Discuss"]',
  '["Observation", "Classification", "Nature"]',
  'beginner',
  'family_session',
  0,
  '[{"age_min":24,"age_max":36,"tier":"Tier 1","expectation":"Pick up leaves"},{"age_min":37,"age_max":54,"tier":"Tier 2","expectation":"Sort into 2 groups"},{"age_min":55,"age_max":72,"tier":"Tier 3","expectation":"Sort multiple ways"}]'
);

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'science-012',
  'Nature Walk',
  'Take a walk to observe nature sounds and sights.',
  'pre-academic',
  12, 72, 30,
  '["Outdoor space"]',
  '["Walk slowly", "Observe together", "Point out items", "Examine up close", "Collect treasures"]',
  '["Observation", "Vocabulary", "Curiosity"]',
  'beginner',
  'family_session',
  0,
  '[{"age_min":12,"age_max":30,"tier":"Tier 1","expectation":"Touch objects"},{"age_min":31,"age_max":48,"tier":"Tier 2","expectation":"Name observations"},{"age_min":49,"age_max":72,"tier":"Tier 3","expectation":"Describe in detail"}]'
);

-- LITERACY ACTIVITIES (Mapped to 'language')
INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'literacy-011',
  'Story Retelling',
  'Retell a story using pictures or props.',
  'language',
  24, 72, 20,
  '["Books", "Props"]',
  '["Read story", "Ask what happened", "Use props", "Act out", "Tell in own words"]',
  '["Sequencing", "Memory", "Narrative"]',
  'beginner',
  'family_session',
  1,
  '[{"age_min":24,"age_max":36,"tier":"Tier 1","expectation":"Point to pictures"},{"age_min":37,"age_max":54,"tier":"Tier 2","expectation":"Beginning/Middle/End"},{"age_min":55,"age_max":72,"tier":"Tier 3","expectation":"Full retelling"}]'
);

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'literacy-012',
  'Rhyming Games',
  'Play with rhyming words and songs.',
  'language',
  30, 72, 15,
  '["Rhyming cards (optional)"]',
  '["Sing rhyming song", "Ask for rhymes", "Make silly rhymes", "Read rhyming books", "Matching game"]',
  '["Phonological awareness", "Vocabulary", "Pre-reading"]',
  'beginner',
  'family_session',
  0,
  '[{"age_min":30,"age_max":42,"tier":"Tier 1","expectation":"Recognize rhymes"},{"age_min":43,"age_max":60,"tier":"Tier 2","expectation":"Generate rhymes"},{"age_min":61,"age_max":72,"tier":"Tier 3","expectation":"Silly rhymes"}]'
);

-- MATH ACTIVITIES (Mapped to 'cognitive', IDs shifted to 030+)
INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'cognitive-031',
  'Counting Games',
  'Practice counting with everyday objects.',
  'cognitive',
  18, 72, 15,
  '["Countable objects"]',
  '["Gather objects", "Count touching each", "How many?", "Count daily items", "Count fingers"]',
  '["Number sense", "One-to-one", "Cardinality"]',
  'beginner',
  'family_session',
  1,
  '[{"age_min":18,"age_max":30,"tier":"Tier 1","expectation":"Touch while counting"},{"age_min":31,"age_max":48,"tier":"Tier 2","expectation":"Count to 5"},{"age_min":49,"age_max":72,"tier":"Tier 3","expectation":"Count to 10+"}]'
);

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'cognitive-032',
  'Shape Hunt',
  'Find shapes around the house.',
  'cognitive',
  24, 72, 20,
  '["Household objects"]',
  '["Name a shape", "Look for it", "Point it out", "Try different shapes", "Sort objects"]',
  '["Shape recognition", "Spatial awareness", "Observation"]',
  'beginner',
  'family_session',
  0,
  '[{"age_min":24,"age_max":36,"tier":"Tier 1","expectation":"Find one shape"},{"age_min":37,"age_max":54,"tier":"Tier 2","expectation":"Find circles/squares"},{"age_min":55,"age_max":72,"tier":"Tier 3","expectation":"Describe properties"}]'
);