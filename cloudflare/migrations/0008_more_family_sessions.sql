-- Migration 0008: Add More Family Session Activities
-- Expanding the family activities library with 15 new activities across multiple domains

-- ART/CREATIVE ACTIVITIES

INSERT INTO activities (id, title, description, domain, age_min, age_max, duration_estimate, materials, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'creative-001',
  'Drawing Together',
  'Free drawing, coloring, and creative expression with various drawing tools. Children explore colors, shapes, and mark-making while developing fine motor skills and creativity.',
  'Creative Arts',
  18, 72, 20,
  '["Crayons", "Paper", "Markers (optional)"]',
  'family_session',
  1,
  '[
    {"age_min":18,"age_max":30,"tier":"Tier 1","expectation":"Make marks on paper, hold crayon with whole hand"},
    {"age_min":31,"age_max":48,"tier":"Tier 2","expectation":"Draw simple shapes and lines, choose colors intentionally"},
    {"age_min":49,"age_max":72,"tier":"Tier 3","expectation":"Draw recognizable objects, use multiple colors in one picture"}
  ]'
);

INSERT INTO activities (id, title, description, domain, age_min, age_max, duration_estimate, materials, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'creative-002',
  'Painting Fun',
  'Explore painting with fingers, brushes, or sponges. Children experiment with color mixing, texture, and creative expression through paint.',
  'Creative Arts',
  24, 72, 25,
  '["Paint", "Paper", "Brushes or sponges"]',
  'family_session',
  0,
  '[
    {"age_min":24,"age_max":36,"tier":"Tier 1","expectation":"Touch paint and make prints with hands or fingers"},
    {"age_min":37,"age_max":54,"tier":"Tier 2","expectation":"Use brush or sponge to apply paint, cover most of paper"},
    {"age_min":55,"age_max":72,"tier":"Tier 3","expectation":"Paint intentional designs, mix colors, stay within boundaries"}
  ]'
);

INSERT INTO activities (id, title, description, domain, age_min, age_max, duration_estimate, materials, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'creative-003',
  'Playdough Sculpture',
  'Creative play with playdough—rolling, shaping, cutting, and building. Develops hand strength, creativity, and fine motor control.',
  'Creative Arts',
  18, 72, 20,
  '["Playdough", "Rolling pin or jar", "Cookie cutters (optional)"]',
  'family_session',
  1,
  '[
    {"age_min":18,"age_max":30,"tier":"Tier 1","expectation":"Poke, squeeze, and pull apart playdough"},
    {"age_min":31,"age_max":48,"tier":"Tier 2","expectation":"Roll playdough into balls and snakes, flatten with hands"},
    {"age_min":49,"age_max":72,"tier":"Tier 3","expectation":"Create simple objects (snake, snowman), use tools to cut shapes"}
  ]'
);

-- MOVEMENT ACTIVITIES

INSERT INTO activities (id, title, description, domain, age_min, age_max, duration_estimate, materials, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'motor-011',
  'Dance Party',
  'Movement and dancing to music—freestyle, freeze dance, follow the leader. Develops gross motor skills, rhythm, and body awareness.',
  'Physical Development',
  12, 72, 15,
  '["Music player", "Open space"]',
  'family_session',
  0,
  '[
    {"age_min":12,"age_max":24,"tier":"Tier 1","expectation":"Bounce or sway to music, clap hands"},
    {"age_min":25,"age_max":42,"tier":"Tier 2","expectation":"Dance with whole body, freeze when music stops"},
    {"age_min":43,"age_max":72,"tier":"Tier 3","expectation":"Copy dance moves, create own moves, move to rhythm"}
  ]'
);

INSERT INTO activities (id, title, description, domain, age_min, age_max, duration_estimate, materials, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'motor-012',
  'Obstacle Course',
  'Create a simple obstacle course with household items—crawling under tables, jumping over pillows, balancing on tape lines.',
  'Physical Development',
  24, 72, 20,
  '["Pillows", "Furniture", "Tape", "Cushions"]',
  'family_session',
  0,
  '[
    {"age_min":24,"age_max":36,"tier":"Tier 1","expectation":"Crawl through tunnel, step over low obstacles"},
    {"age_min":37,"age_max":54,"tier":"Tier 2","expectation":"Jump over obstacles, balance on wide tape line"},
    {"age_min":55,"age_max":72,"tier":"Tier 3","expectation":"Complete multi-step course, hop on one foot, walk narrow line"}
  ]'
);

INSERT INTO activities (id, title, description, domain, age_min, age_max, duration_estimate, materials, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'motor-013',
  'Yoga Poses',
  'Simple yoga poses and breathing exercises—animal poses, stretching, relaxation. Develops body control, flexibility, and mindfulness.',
  'Physical Development',
  24, 72, 15,
  '["Open space", "Mat or towel (optional)"]',
  'family_session',
  0,
  '[
    {"age_min":24,"age_max":36,"tier":"Tier 1","expectation":"Copy simple stretches, reach arms up and down"},
    {"age_min":37,"age_max":54,"tier":"Tier 2","expectation":"Hold animal poses (cat, dog, tree) for a few seconds"},
    {"age_min":55,"age_max":72,"tier":"Tier 3","expectation":"Hold poses for 10+ seconds, balance on one foot, follow sequence"}
  ]'
);

-- MUSIC ACTIVITIES

INSERT INTO activities (id, title, description, domain, age_min, age_max, duration_estimate, materials, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'music-001',
  'Sing-Along',
  'Singing nursery rhymes and action songs together—songs with hand motions, repetitive phrases, and simple melodies.',
  'Creative Arts',
  6, 72, 15,
  '["Song lyrics or music", "Optional: pictures or props"]',
  'family_session',
  0,
  '[
    {"age_min":6,"age_max":24,"tier":"Tier 1","expectation":"Listen and respond with sounds, do simple hand motions"},
    {"age_min":25,"age_max":42,"tier":"Tier 2","expectation":"Sing familiar words, complete phrases, do actions"},
    {"age_min":43,"age_max":72,"tier":"Tier 3","expectation":"Sing whole songs, remember multiple verses, suggest songs"}
  ]'
);

INSERT INTO activities (id, title, description, domain, age_min, age_max, duration_estimate, materials, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'music-002',
  'Rhythm Instruments',
  'Playing with shakers, drums, or homemade instruments—exploring sounds, keeping rhythm, creating patterns.',
  'Creative Arts',
  12, 72, 15,
  '["Musical Instruments", "Or homemade: rice in containers, wooden spoons, pots"]',
  'family_session',
  1,
  '[
    {"age_min":12,"age_max":30,"tier":"Tier 1","expectation":"Shake or bang instruments, make sounds"},
    {"age_min":31,"age_max":48,"tier":"Tier 2","expectation":"Tap to music rhythm, fast and slow sounds"},
    {"age_min":49,"age_max":72,"tier":"Tier 3","expectation":"Copy rhythm patterns, create own patterns, play with others"}
  ]'
);

INSERT INTO activities (id, title, description, domain, age_min, age_max, duration_estimate, materials, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'music-003',
  'Musical Movement',
  'Moving to different types of music—marching, tip-toeing, swaying, moving fast and slow based on tempo and mood.',
  'Physical Development',
  12, 72, 15,
  '["Music player", "Various types of music", "Open space"]',
  'family_session',
  0,
  '[
    {"age_min":12,"age_max":24,"tier":"Tier 1","expectation":"Move body to music, stop and start with music"},
    {"age_min":25,"age_max":42,"tier":"Tier 2","expectation":"March, tiptoe, move fast/slow with music tempo"},
    {"age_min":43,"age_max":72,"tier":"Tier 3","expectation":"Match movement to music mood, suggest movement ideas"}
  ]'
);

-- NATURE ACTIVITIES

INSERT INTO activities (id, title, description, domain, age_min, age_max, duration_estimate, materials, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'science-011',
  'Leaf Collecting',
  'Collect leaves outdoors and sort them by color, shape, or size. Explore nature, practice observation skills, and categorize natural objects.',
  'Science & Nature',
  24, 72, 25,
  '["Outdoor space", "Container or bag", "Leaves"]',
  'family_session',
  0,
  '[
    {"age_min":24,"age_max":36,"tier":"Tier 1","expectation":"Pick up leaves, put them in container"},
    {"age_min":37,"age_max":54,"tier":"Tier 2","expectation":"Sort leaves into two groups (big/small or color)"},
    {"age_min":55,"age_max":72,"tier":"Tier 3","expectation":"Sort by multiple attributes, count leaves, describe differences"}
  ]'
);

INSERT INTO activities (id, title, description, domain, age_min, age_max, duration_estimate, materials, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'science-012',
  'Nature Walk',
  'Take a walk outside to observe nature—listen to sounds, look for animals, collect natural treasures, notice weather and seasons.',
  'Science & Nature',
  12, 72, 30,
  '["Outdoor space", "Optional: collection bag, magnifying glass"]',
  'family_session',
  0,
  '[
    {"age_min":12,"age_max":30,"tier":"Tier 1","expectation":"Walk outdoors, point to things of interest, touch natural objects"},
    {"age_min":31,"age_max":48,"tier":"Tier 2","expectation":"Name things observed (tree, bird, rock), collect treasures"},
    {"age_min":49,"age_max":72,"tier":"Tier 3","expectation":"Describe observations in detail, ask questions about nature, make comparisons"}
  ]'
);

-- LITERACY ACTIVITIES

INSERT INTO activities (id, title, description, domain, age_min, age_max, duration_estimate, materials, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'literacy-011',
  'Story Retelling',
  'After reading a story together, retell it using pictures, props, or acting it out. Develops sequencing, memory, and narrative skills.',
  'Language & Literacy',
  24, 72, 20,
  '["Books", "Optional: puppets, toys, or pictures from story"]',
  'family_session',
  1,
  '[
    {"age_min":24,"age_max":36,"tier":"Tier 1","expectation":"Point to pictures from story, act out one action"},
    {"age_min":37,"age_max":54,"tier":"Tier 2","expectation":"Tell beginning, middle, end, name main character"},
    {"age_min":55,"age_max":72,"tier":"Tier 3","expectation":"Retell story in sequence, use story language, act out with detail"}
  ]'
);

INSERT INTO activities (id, title, description, domain, age_min, age_max, duration_estimate, materials, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'literacy-012',
  'Rhyming Games',
  'Play with rhyming words—matching rhyming pairs, making up silly rhymes, singing rhyming songs. Builds phonological awareness.',
  'Language & Literacy',
  30, 72, 15,
  '["No materials needed", "Optional: rhyming picture cards or books"]',
  'family_session',
  0,
  '[
    {"age_min":30,"age_max":42,"tier":"Tier 1","expectation":"Recognize when words rhyme, fill in rhyming word in familiar song"},
    {"age_min":43,"age_max":60,"tier":"Tier 2","expectation":"Generate rhyming words (cat/hat), identify which words rhyme"},
    {"age_min":61,"age_max":72,"tier":"Tier 3","expectation":"Make up silly rhymes, rhyme multiple words in sequence"}
  ]'
);

-- MATH ACTIVITIES

INSERT INTO activities (id, title, description, domain, age_min, age_max, duration_estimate, materials, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'cognitive-021',
  'Counting Games',
  'Practice counting with everyday objects—count toys, steps, snacks. Develops number sense, one-to-one correspondence, and cardinality.',
  'Cognitive Development',
  18, 72, 15,
  '["Any countable objects: blocks, toys, snacks, buttons"]',
  'family_session',
  1,
  '[
    {"age_min":18,"age_max":30,"tier":"Tier 1","expectation":"Touch objects while adult counts, say some number words"},
    {"age_min":31,"age_max":48,"tier":"Tier 2","expectation":"Count to 5 with one-to-one correspondence, say how many"},
    {"age_min":49,"age_max":72,"tier":"Tier 3","expectation":"Count to 10+, recognize written numerals, count out requested amount"}
  ]'
);

INSERT INTO activities (id, title, description, domain, age_min, age_max, duration_estimate, materials, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'cognitive-022',
  'Shape Hunt',
  'Find shapes around the house—circles, squares, triangles, rectangles. Develops shape recognition and spatial awareness.',
  'Cognitive Development',
  24, 72, 20,
  '["No materials needed", "Just household objects"]',
  'family_session',
  0,
  '[
    {"age_min":24,"age_max":36,"tier":"Tier 1","expectation":"Point to circles when named, find one shape"},
    {"age_min":37,"age_max":54,"tier":"Tier 2","expectation":"Find and name circles and squares, identify 2-3 shapes"},
    {"age_min":55,"age_max":72,"tier":"Tier 3","expectation":"Find all basic shapes, describe shape properties, sort objects by shape"}
  ]'
);
