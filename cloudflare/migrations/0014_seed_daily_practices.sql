-- Seed 12 curated daily practices
INSERT INTO activities (
  id, 
  title, 
  description, 
  domain_id, 
  min_age_months, 
  max_age_months, 
  duration_minutes, 
  difficulty,
  activity_type,
  assessment_prohibited,
  context_embedding
) VALUES 
-- Holding
('dp_attentive_holding', 'Attentive Holding', 'Hold your baby close, making eye contact. No goals, just presence.', 'social-emotional', 0, 12, 5, 'beginner', 'daily_practice', 1, 'holding'),
('dp_gentle_touch', 'Gentle Touch', 'Stroke baby''s arms and legs slowly. Just connection.', 'social-emotional', 0, 12, 5, 'beginner', 'daily_practice', 1, 'holding'),
('dp_speaking_scripture', 'Speaking Scripture', 'Speak a short phrase: "You are fearfully and wonderfully made."', 'spiritual', 0, 12, 5, 'beginner', 'daily_practice', 1, 'holding'),

-- Feeding
('dp_calm_feeding', 'Calm Feeding Presence', 'During feeding, speak softly or hum. Let this be unhurried.', 'social-emotional', 0, 12, 15, 'beginner', 'daily_practice', 1, 'feeding'),

-- Diapering
('dp_respectful_body', 'Respectful Body Naming', 'During diaper changes, gently name body parts.', 'physical', 0, 12, 3, 'beginner', 'daily_practice', 1, 'diapering'),

-- Sleep
('dp_bedtime_words', 'Predictable Bedtime Words', 'Use the same phrase each night: "The Lord bless you."', 'spiritual', 0, 12, 2, 'beginner', 'daily_practice', 1, 'sleep'),

-- Outdoor
('dp_outdoor_stillness', 'Outdoor Stillness', 'Step outside. Let baby feel the air, hear the sounds.', 'cognitive', 0, 12, 5, 'beginner', 'daily_practice', 1, 'outdoor'),

-- Any Context / Play
('dp_singing_hymns', 'Singing Hymns', 'Sing a familiar hymn quietly. Repetition is comforting.', 'spiritual', 0, 12, 5, 'beginner', 'daily_practice', 1, NULL),
('dp_responsive_cooing', 'Responsive Cooing', 'When baby makes sounds, respond with similar sounds.', 'language', 0, 12, 5, 'beginner', 'daily_practice', 1, NULL),
('dp_naming_light', 'Naming Light and Sound', 'Point to light sources, name sounds: "That''s the wind."', 'cognitive', 0, 12, 5, 'beginner', 'daily_practice', 1, NULL),
('dp_watching_movement', 'Watching Movement Together', 'Watch leaves, shadows, or a mobile. Point and describe.', 'cognitive', 0, 12, 5, 'beginner', 'daily_practice', 1, NULL),
('dp_prayer_over_baby', 'Prayer Over Baby', 'Pray aloud over your baby. Simple words.', 'spiritual', 0, 12, 2, 'beginner', 'daily_practice', 1, NULL);
