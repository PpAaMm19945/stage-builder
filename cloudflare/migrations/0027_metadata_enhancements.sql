-- Migration 0027: Metadata Enhancements (Phase 6)

-- Add cultural_notes column
ALTER TABLE activities ADD COLUMN cultural_notes TEXT;

-- Add Ugandan context notes
UPDATE activities
SET cultural_notes = 'Ugandan context: Use local calabashes or gourds instead of commercial nesting cups. Natural materials work perfectly.'
WHERE id = 'cognitive-009';

UPDATE activities
SET cultural_notes = 'Ugandan context: Draw with charcoal on large paper or smooth ground outdoors. No need for commercial crayons.'
WHERE id = 'motor-006';

UPDATE activities
SET cultural_notes = 'Ugandan context: Use rice, beans, or maize for pouring practice. Water is ideal. No need for commercial toys.'
WHERE id = 'motor-010';

UPDATE activities
SET cultural_notes = 'Ugandan advantage: Year-round outdoor learning possible! Leverage consistent climate for daily nature study.'
WHERE domain = 'motor' AND description LIKE '%outdoor%';
