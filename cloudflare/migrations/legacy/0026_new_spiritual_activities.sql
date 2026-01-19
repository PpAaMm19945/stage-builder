-- Migration 0026: New Spiritual Activities (Phase 5)
-- Adds 6 spiritual formation activities + 2 Charlotte Mason essentials

-- NEW-001: Morning Prayer
INSERT INTO activities (id, title, description, domain, biblical_domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations) VALUES (
  'spiritual-001', 'Morning Prayer and Blessing', 'Begin each day with prayer and Scripture.', 'pre-academic', 'favor_with_god', 0, 72, 10,
  '["Bible", "Prayer book"]',
  '["Read Psalm/Gospel", "Pray aloud", "Bless child"]',
  '["Prayer rhythm", "Scripture exposure"]',
  'beginner', 'family_session', 0,
  '[{"age_min":0,"age_max":12,"tier":"Observer","expectation":"Held during prayer"},{"age_min":12,"age_max":72,"tier":"Participant","expectation":"Joins in prayer"}]'
);

-- NEW-002: Evening Liturgy
INSERT INTO activities (id, title, description, domain, biblical_domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations) VALUES (
  'spiritual-002', 'Evening Prayer and Bedtime Liturgy', 'End day with prayer and song.', 'pre-academic', 'favor_with_god', 0, 72, 15,
  '["Bible", "Hymnal"]',
  '["Sing hymn", "Read Scripture", "Pray", "Bless"]',
  '["Security", "Worship"]',
  'beginner', 'family_session', 0,
  '[{"age_min":0,"age_max":12,"tier":"Observer","expectation":"Calms to routine"},{"age_min":12,"age_max":72,"tier":"Participant","expectation":"Sings/Prays"}]'
);

-- NEW-003: Scripture Memory
INSERT INTO activities (id, title, description, domain, biblical_domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations) VALUES (
  'spiritual-003', 'Scripture Memory', 'Hide God''s Word in your heart.', 'language', 'favor_with_god', 36, 72, 10,
  '["Bible"]',
  '["Say verse 3-5 times", "Add motions", "Review weekly"]',
  '["Memorization", "Biblical literacy"]',
  'intermediate', 'family_session', 0,
  '[{"age_min":36,"age_max":72,"tier":"Participant","expectation":"Recites verses"}]'
);

-- NEW-004: Hymn Singing
INSERT INTO activities (id, title, description, domain, biblical_domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations) VALUES (
  'spiritual-004', 'Daily Hymn Singing', 'Worship the Lord through singing.', 'pre-academic', 'favor_with_god', 0, 72, 10,
  '["Hymnal"]',
  '["Sing 1-2 hymns", "Repeat weekly"]',
  '["Worship", "Theology"]',
  'beginner', 'family_session', 0,
  '[{"age_min":0,"age_max":72,"tier":"Participant","expectation":"Sings along"}]'
);

-- NEW-005: Catechism
INSERT INTO activities (id, title, description, domain, biblical_domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations) VALUES (
  'spiritual-005', 'Catechism Questions and Answers', 'Learn basic Christian theology.', 'language', 'favor_with_god', 48, 72, 10,
  '["Catechism"]',
  '["Ask Q, Child answers A", "Repeat"]',
  '["Systematic theology", "Memory"]',
  'intermediate', 'family_session', 0,
  '[{"age_min":48,"age_max":72,"tier":"Participant","expectation":"Answers questions"}]'
);

-- NEW-006: Mealtime Thanksgiving
INSERT INTO activities (id, title, description, domain, biblical_domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations) VALUES (
  'spiritual-006', 'Mealtime Thanksgiving', 'Pray before each meal.', 'pre-academic', 'favor_with_god', 0, 72, 3,
  '["None"]',
  '["Pause before eating", "Pray thanks"]',
  '["Gratitude", "Prayer habit"]',
  'beginner', 'family_session', 0,
  '[{"age_min":0,"age_max":72,"tier":"Participant","expectation":"Joins in prayer"}]'
);

-- NEW-007: Oral Narration
INSERT INTO activities (id, title, description, domain, biblical_domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations) VALUES (
  'language-026', 'Oral Narration Practice', 'Tell back the story in own words.', 'language', 'wisdom', 30, 72, 10,
  '["Storybook"]',
  '["Read story", "Ask child to tell it back", "Listen without interrupting"]',
  '["Comprehension", "Expression"]',
  'intermediate', 'family_session', 0,
  '[{"age_min":30,"age_max":72,"tier":"Participant","expectation":"Retells story"}]'
);

-- NEW-008: Outdoor Free Play
INSERT INTO activities (id, title, description, domain, biblical_domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty, activity_type, uses_core_kit, tiered_expectations) VALUES (
  'motor-034', 'Daily Outdoor Free Play', 'Unstructured outdoor time.', 'motor', 'stature', 0, 72, 60,
  '["Outdoor space"]',
  '["Go outside", "Explore freely", "Observe nature"]',
  '["Gross motor", "Nature observation"]',
  'beginner', 'family_session', 0,
  '[{"age_min":0,"age_max":72,"tier":"Participant","expectation":"Plays outdoors"}]'
);
