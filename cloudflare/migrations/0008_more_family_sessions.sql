-- Migration 0008: Add More Family Session Activities
-- Expanding the family activities library with 15 new activities across multiple domains

-- ART/CREATIVE ACTIVITIES

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'creative-001',
  'Drawing Together',
  'Free drawing, coloring, and creative expression with various drawing tools. Children explore colors, shapes, and mark-making while developing fine motor skills and creativity.',
  'Creative Arts',
  18, 72, 20,
  '["Crayons", "Paper", "Markers (optional)"]',
  '["Gather drawing materials and set up at a table", "Give each child paper and crayons", "Draw alongside your children", "Talk about colors and shapes as you draw", "Display finished artwork together"]',
  '["Fine motor development", "Creative expression", "Color recognition", "Hand-eye coordination"]',
  'beginner',
  'family_session',
  1,
  '[
    {"age_min":18,"age_max":30,"tier":"Tier 1","expectation":"Make marks on paper, hold crayon with whole hand"},
    {"age_min":31,"age_max":48,"tier":"Tier 2","expectation":"Draw simple shapes and lines, choose colors intentionally"},
    {"age_min":49,"age_max":72,"tier":"Tier 3","expectation":"Draw recognizable objects, use multiple colors in one picture"}
  ]'
);

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'creative-002',
  'Painting Fun',
  'Explore painting with fingers, brushes, or sponges. Children experiment with color mixing, texture, and creative expression through paint.',
  'Creative Arts',
  24, 72, 25,
  '["Paint", "Paper", "Brushes or sponges"]',
  '["Cover work area with newspaper or plastic", "Set out paint colors and paper", "Show children how to dip brush or finger in paint", "Encourage mixing colors and exploring textures", "Let paintings dry and discuss what they created"]',
  '["Color mixing awareness", "Sensory exploration", "Creative expression", "Fine motor skills"]',
  'beginner',
  'family_session',
  0,
  '[
    {"age_min":24,"age_max":36,"tier":"Tier 1","expectation":"Touch paint and make prints with hands or fingers"},
    {"age_min":37,"age_max":54,"tier":"Tier 2","expectation":"Use brush or sponge to apply paint, cover most of paper"},
    {"age_min":55,"age_max":72,"tier":"Tier 3","expectation":"Paint intentional designs, mix colors, stay within boundaries"}
  ]'
);

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'creative-003',
  'Playdough Sculpture',
  'Creative play with playdough—rolling, shaping, cutting, and building. Develops hand strength, creativity, and fine motor control.',
  'Creative Arts',
  18, 72, 20,
  '["Playdough", "Rolling pin or jar", "Cookie cutters (optional)"]',
  '["Give each child a portion of playdough", "Demonstrate rolling, squeezing, and shaping", "Introduce tools like rolling pin or cutters", "Create together and describe what you make", "Clean up together when finished"]',
  '["Hand strength development", "Fine motor control", "Creativity and imagination", "Shape recognition"]',
  'beginner',
  'family_session',
  1,
  '[
    {"age_min":18,"age_max":30,"tier":"Tier 1","expectation":"Poke, squeeze, and pull apart playdough"},
    {"age_min":31,"age_max":48,"tier":"Tier 2","expectation":"Roll playdough into balls and snakes, flatten with hands"},
    {"age_min":49,"age_max":72,"tier":"Tier 3","expectation":"Create simple objects (snake, snowman), use tools to cut shapes"}
  ]'
);

-- MOVEMENT ACTIVITIES

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'motor-011',
  'Dance Party',
  'Movement and dancing to music—freestyle, freeze dance, follow the leader. Develops gross motor skills, rhythm, and body awareness.',
  'Physical Development',
  12, 72, 15,
  '["Music player", "Open space"]',
  '["Clear a safe open space for dancing", "Put on upbeat music children enjoy", "Dance together and model different movements", "Try freeze dance: dance when music plays, freeze when it stops", "Take turns being the dance leader"]',
  '["Gross motor development", "Rhythm and timing", "Body awareness", "Social interaction"]',
  'beginner',
  'family_session',
  0,
  '[
    {"age_min":12,"age_max":24,"tier":"Tier 1","expectation":"Bounce or sway to music, clap hands"},
    {"age_min":25,"age_max":42,"tier":"Tier 2","expectation":"Dance with whole body, freeze when music stops"},
    {"age_min":43,"age_max":72,"tier":"Tier 3","expectation":"Copy dance moves, create own moves, move to rhythm"}
  ]'
);

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'motor-012',
  'Obstacle Course',
  'Create a simple obstacle course with household items—crawling under tables, jumping over pillows, balancing on tape lines.',
  'Physical Development',
  24, 72, 20,
  '["Pillows", "Furniture", "Tape", "Cushions"]',
  '["Set up stations: crawl-under, jump-over, balance-on", "Walk through the course with children first", "Demonstrate each station", "Cheer children on as they try each obstacle", "Make it easier or harder based on ability"]',
  '["Gross motor skills", "Balance and coordination", "Problem solving", "Following directions"]',
  'beginner',
  'family_session',
  0,
  '[
    {"age_min":24,"age_max":36,"tier":"Tier 1","expectation":"Crawl through tunnel, step over low obstacles"},
    {"age_min":37,"age_max":54,"tier":"Tier 2","expectation":"Jump over obstacles, balance on wide tape line"},
    {"age_min":55,"age_max":72,"tier":"Tier 3","expectation":"Complete multi-step course, hop on one foot, walk narrow line"}
  ]'
);

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'motor-013',
  'Yoga Poses',
  'Simple yoga poses and breathing exercises—animal poses, stretching, relaxation. Develops body control, flexibility, and mindfulness.',
  'Physical Development',
  24, 72, 15,
  '["Open space", "Mat or towel (optional)"]',
  '["Find a quiet space with room to stretch", "Start with deep breaths together", "Introduce animal poses: cat, dog, tree, butterfly", "Hold poses and count together", "End with relaxation lying down"]',
  '["Body awareness and control", "Flexibility", "Mindfulness and calm", "Balance"]',
  'beginner',
  'family_session',
  0,
  '[
    {"age_min":24,"age_max":36,"tier":"Tier 1","expectation":"Copy simple stretches, reach arms up and down"},
    {"age_min":37,"age_max":54,"tier":"Tier 2","expectation":"Hold animal poses (cat, dog, tree) for a few seconds"},
    {"age_min":55,"age_max":72,"tier":"Tier 3","expectation":"Hold poses for 10+ seconds, balance on one foot, follow sequence"}
  ]'
);

-- MUSIC ACTIVITIES

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'music-001',
  'Sing-Along',
  'Singing nursery rhymes and action songs together—songs with hand motions, repetitive phrases, and simple melodies.',
  'Creative Arts',
  6, 72, 15,
  '["Song lyrics or music", "Optional: pictures or props"]',
  '["Choose familiar songs children enjoy", "Sing slowly and clearly", "Add hand motions to songs", "Pause to let children fill in words", "Repeat favorite songs multiple times"]',
  '["Language development", "Memory skills", "Rhythm awareness", "Social bonding"]',
  'beginner',
  'family_session',
  0,
  '[
    {"age_min":6,"age_max":24,"tier":"Tier 1","expectation":"Listen and respond with sounds, do simple hand motions"},
    {"age_min":25,"age_max":42,"tier":"Tier 2","expectation":"Sing familiar words, complete phrases, do actions"},
    {"age_min":43,"age_max":72,"tier":"Tier 3","expectation":"Sing whole songs, remember multiple verses, suggest songs"}
  ]'
);

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'music-002',
  'Rhythm Instruments',
  'Playing with shakers, drums, or homemade instruments—exploring sounds, keeping rhythm, creating patterns.',
  'Creative Arts',
  12, 72, 15,
  '["Musical Instruments", "Or homemade: rice in containers, wooden spoons, pots"]',
  '["Give each child an instrument", "Explore sounds together: loud, soft, fast, slow", "Play along with music", "Take turns leading the rhythm", "Try copying simple patterns"]',
  '["Rhythm and timing", "Listening skills", "Turn-taking", "Sound exploration"]',
  'beginner',
  'family_session',
  1,
  '[
    {"age_min":12,"age_max":30,"tier":"Tier 1","expectation":"Shake or bang instruments, make sounds"},
    {"age_min":31,"age_max":48,"tier":"Tier 2","expectation":"Tap to music rhythm, fast and slow sounds"},
    {"age_min":49,"age_max":72,"tier":"Tier 3","expectation":"Copy rhythm patterns, create own patterns, play with others"}
  ]'
);

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'music-003',
  'Musical Movement',
  'Moving to different types of music—marching, tip-toeing, swaying, moving fast and slow based on tempo and mood.',
  'Physical Development',
  12, 72, 15,
  '["Music player", "Various types of music", "Open space"]',
  '["Play different types of music", "Suggest movements: march to fast music, sway to slow", "Let children choose how to move", "Change music and see how movement changes", "End with calm, slow music"]',
  '["Body awareness", "Listening skills", "Self-expression", "Tempo recognition"]',
  'beginner',
  'family_session',
  0,
  '[
    {"age_min":12,"age_max":24,"tier":"Tier 1","expectation":"Move body to music, stop and start with music"},
    {"age_min":25,"age_max":42,"tier":"Tier 2","expectation":"March, tiptoe, move fast/slow with music tempo"},
    {"age_min":43,"age_max":72,"tier":"Tier 3","expectation":"Match movement to music mood, suggest movement ideas"}
  ]'
);

-- NATURE ACTIVITIES

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'science-011',
  'Leaf Collecting',
  'Collect leaves outdoors and sort them by color, shape, or size. Explore nature, practice observation skills, and categorize natural objects.',
  'Science & Nature',
  24, 72, 25,
  '["Outdoor space", "Container or bag", "Leaves"]',
  '["Go outside where leaves are available", "Collect leaves together in a bag", "Spread leaves out and observe them", "Sort leaves: by color, size, or shape", "Talk about similarities and differences"]',
  '["Observation skills", "Classification and sorting", "Nature awareness", "Vocabulary development"]',
  'beginner',
  'family_session',
  0,
  '[
    {"age_min":24,"age_max":36,"tier":"Tier 1","expectation":"Pick up leaves, put them in container"},
    {"age_min":37,"age_max":54,"tier":"Tier 2","expectation":"Sort leaves into two groups (big/small or color)"},
    {"age_min":55,"age_max":72,"tier":"Tier 3","expectation":"Sort by multiple attributes, count leaves, describe differences"}
  ]'
);

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'science-012',
  'Nature Walk',
  'Take a walk outside to observe nature—listen to sounds, look for animals, collect natural treasures, notice weather and seasons.',
  'Science & Nature',
  12, 72, 30,
  '["Outdoor space", "Optional: collection bag, magnifying glass"]',
  '["Head outside to a safe walking area", "Walk slowly and observe together", "Point out interesting things: birds, flowers, clouds", "Stop to examine discoveries up close", "Collect small treasures if appropriate"]',
  '["Observation skills", "Vocabulary development", "Curiosity and wonder", "Physical activity"]',
  'beginner',
  'family_session',
  0,
  '[
    {"age_min":12,"age_max":30,"tier":"Tier 1","expectation":"Walk outdoors, point to things of interest, touch natural objects"},
    {"age_min":31,"age_max":48,"tier":"Tier 2","expectation":"Name things observed (tree, bird, rock), collect treasures"},
    {"age_min":49,"age_max":72,"tier":"Tier 3","expectation":"Describe observations in detail, ask questions about nature, make comparisons"}
  ]'
);

-- LITERACY ACTIVITIES

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'literacy-011',
  'Story Retelling',
  'After reading a story together, retell it using pictures, props, or acting it out. Develops sequencing, memory, and narrative skills.',
  'Language & Literacy',
  24, 72, 20,
  '["Books", "Optional: puppets, toys, or pictures from story"]',
  '["Read a familiar story together", "Ask what happened at the beginning", "Use props or pictures to retell", "Act out parts of the story", "Encourage children to tell it in their own words"]',
  '["Sequencing skills", "Memory development", "Narrative skills", "Comprehension"]',
  'beginner',
  'family_session',
  1,
  '[
    {"age_min":24,"age_max":36,"tier":"Tier 1","expectation":"Point to pictures from story, act out one action"},
    {"age_min":37,"age_max":54,"tier":"Tier 2","expectation":"Tell beginning, middle, end, name main character"},
    {"age_min":55,"age_max":72,"tier":"Tier 3","expectation":"Retell story in sequence, use story language, act out with detail"}
  ]'
);

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'literacy-012',
  'Rhyming Games',
  'Play with rhyming words—matching rhyming pairs, making up silly rhymes, singing rhyming songs. Builds phonological awareness.',
  'Language & Literacy',
  30, 72, 15,
  '["No materials needed", "Optional: rhyming picture cards or books"]',
  '["Start with a familiar rhyming song", "Say a word and ask what rhymes with it", "Make silly rhymes together", "Read books with rhyming words", "Play rhyming matching games"]',
  '["Phonological awareness", "Language play", "Vocabulary expansion", "Pre-reading skills"]',
  'beginner',
  'family_session',
  0,
  '[
    {"age_min":30,"age_max":42,"tier":"Tier 1","expectation":"Recognize when words rhyme, fill in rhyming word in familiar song"},
    {"age_min":43,"age_max":60,"tier":"Tier 2","expectation":"Generate rhyming words (cat/hat), identify which words rhyme"},
    {"age_min":61,"age_max":72,"tier":"Tier 3","expectation":"Make up silly rhymes, rhyme multiple words in sequence"}
  ]'
);

-- MATH ACTIVITIES

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'cognitive-021',
  'Counting Games',
  'Practice counting with everyday objects—count toys, steps, snacks. Develops number sense, one-to-one correspondence, and cardinality.',
  'Cognitive Development',
  18, 72, 15,
  '["Any countable objects: blocks, toys, snacks, buttons"]',
  '["Gather small objects to count", "Count together, touching each object", "Ask: How many are there?", "Practice counting during daily activities", "Count fingers, toes, steps, snacks"]',
  '["Number sense", "One-to-one correspondence", "Cardinality understanding", "Math vocabulary"]',
  'beginner',
  'family_session',
  1,
  '[
    {"age_min":18,"age_max":30,"tier":"Tier 1","expectation":"Touch objects while adult counts, say some number words"},
    {"age_min":31,"age_max":48,"tier":"Tier 2","expectation":"Count to 5 with one-to-one correspondence, say how many"},
    {"age_min":49,"age_max":72,"tier":"Tier 3","expectation":"Count to 10+, recognize written numerals, count out requested amount"}
  ]'
);

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations)
VALUES (
  'cognitive-022',
  'Shape Hunt',
  'Find shapes around the house—circles, squares, triangles, rectangles. Develops shape recognition and spatial awareness.',
  'Cognitive Development',
  24, 72, 20,
  '["No materials needed", "Just household objects"]',
  '["Name a shape to find: circle", "Walk around looking for that shape", "Point out shapes together: clock is a circle", "Try different shapes: square, triangle", "Sort found objects by shape"]',
  '["Shape recognition", "Spatial awareness", "Vocabulary development", "Observation skills"]',
  'beginner',
  'family_session',
  0,
  '[
    {"age_min":24,"age_max":36,"tier":"Tier 1","expectation":"Point to circles when named, find one shape"},
    {"age_min":37,"age_max":54,"tier":"Tier 2","expectation":"Find and name circles and squares, identify 2-3 shapes"},
    {"age_min":55,"age_max":72,"tier":"Tier 3","expectation":"Find all basic shapes, describe shape properties, sort objects by shape"}
  ]'
);
