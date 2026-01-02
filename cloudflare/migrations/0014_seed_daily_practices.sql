-- Seed 12 curated daily practices
-- Corrected: Mapped domains to standard set and added minimal instructions
INSERT INTO activities (
  id, 
  title, 
  description, 
  domain, 
  min_age_months, 
  max_age_months, 
  duration_minutes, 
  difficulty,
  activity_type,
  assessment_prohibited,
  context_embedding,
  instructions
) VALUES 
-- Holding
('dp_attentive_holding', 'Attentive Holding', 'Hold your baby close, making eye contact. No goals, just presence.', 'social-emotional', 0, 12, 5, 'beginner', 'daily_practice', 1, 'holding', '["Find a quiet moment to hold baby close and maintain eye contact for a few minutes."]'),
('dp_gentle_touch', 'Gentle Touch', 'Stroke baby''s arms and legs slowly. Just connection.', 'social-emotional', 0, 12, 5, 'beginner', 'daily_practice', 1, 'holding', '["Lay baby on a soft surface and gently stroke their arms and legs."]'),
('dp_speaking_scripture', 'Speaking Scripture', 'Speak a short phrase: "You are fearfully and wonderfully made."', 'spiritual', 0, 12, 5, 'beginner', 'daily_practice', 1, 'holding', '["While holding baby, softly speak the scripture verse over them."]'),

-- Feeding
('dp_calm_feeding', 'Calm Feeding Presence', 'During feeding, speak softly or hum. Let this be unhurried.', 'social-emotional', 0, 12, 15, 'beginner', 'daily_practice', 1, 'feeding', '["Minimize distractions during feeding and hum or speak softly."]'),

-- Diapering
('dp_respectful_body', 'Respectful Body Naming', 'During diaper changes, gently name body parts.', 'motor', 0, 12, 3, 'beginner', 'daily_practice', 1, 'diapering', '["As you wipe or dress baby, gently touch and name their body parts."]'),

-- Sleep
('dp_bedtime_words', 'Predictable Bedtime Words', 'Use the same phrase each night: "The Lord bless you."', 'spiritual', 0, 12, 2, 'beginner', 'daily_practice', 1, 'sleep', '["As the final step of bedtime, say the same blessing phrase."]'),

-- Outdoor
('dp_outdoor_stillness', 'Outdoor Stillness', 'Step outside. Let baby feel the air, hear the sounds.', 'cognitive', 0, 12, 5, 'beginner', 'daily_practice', 1, 'outdoor', '["Step outdoors and simply stand still, letting baby feel the breeze."]'),

-- Any Context / Play
('dp_singing_hymns', 'Singing Hymns', 'Sing a familiar hymn quietly. Repetition is comforting.', 'spiritual', 0, 12, 5, 'beginner', 'daily_practice', 1, NULL, '["Sing a favorite hymn quietly to baby while rocking or sitting."]'),
('dp_responsive_cooing', 'Responsive Cooing', 'When baby makes sounds, respond with similar sounds.', 'language', 0, 12, 5, 'beginner', 'daily_practice', 1, NULL, '["Wait for baby to make a sound, then make the same sound back."]'),
('dp_naming_light', 'Naming Light and Sound', 'Point to light sources, name sounds: "That''s the wind."', 'cognitive', 0, 12, 5, 'beginner', 'daily_practice', 1, NULL, '["Point out a light or window and name it for baby."]'),
('dp_watching_movement', 'Watching Movement Together', 'Watch leaves, shadows, or a mobile. Point and describe.', 'cognitive', 0, 12, 5, 'beginner', 'daily_practice', 1, NULL, '["Find moving leaves or shadows and point them out to baby."]'),
('dp_prayer_over_baby', 'Prayer Over Baby', 'Pray aloud over your baby. Simple words.', 'spiritual', 0, 12, 2, 'beginner', 'daily_practice', 1, NULL, '["Place your hand gently on baby and pray a simple blessing."]');