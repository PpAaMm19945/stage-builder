-- v2_0055_spine_schema_update.sql
-- Add theological anchor columns to curriculum_spine
ALTER TABLE curriculum_spine ADD COLUMN catechism_q INTEGER;
ALTER TABLE curriculum_spine ADD COLUMN hymn_number INTEGER;
ALTER TABLE curriculum_spine ADD COLUMN scripture_ref TEXT;
