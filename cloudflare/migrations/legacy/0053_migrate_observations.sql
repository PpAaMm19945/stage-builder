-- Migration 0053: Migrate Legacy Observations to Evidences
-- Populates the Progress page with historical data

INSERT INTO evidences (id, student_id, formation_id, habit_stage, evidence_note, captured_at)
SELECT
  id,
  student_id,
  activity_id,
  CASE
    WHEN mastery_level = 'emerging' THEN 'Seeding'
    WHEN mastery_level = 'developing' THEN 'Rooting'
    WHEN mastery_level = 'secure' THEN 'Fruiting'
    WHEN mastery_level = 'mastered' THEN 'Fruiting'
    ELSE 'Seeding'
  END,
  parent_notes,
  completed_at
FROM legacy_observations
WHERE id NOT IN (SELECT id FROM evidences);
