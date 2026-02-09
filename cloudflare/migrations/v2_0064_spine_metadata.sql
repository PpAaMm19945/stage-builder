-- v2_0064_spine_metadata.sql
DELETE FROM spine_metadata WHERE spine_version = 'v1.0';
INSERT INTO spine_metadata (id, spine_version, status, total_weeks, subjects, approved_by, approved_at)
VALUES ('spine_v1_meta', 'v1.0', 'approved', 832, '["literacy","numeracy","formation","motor"]', 'admin', '2026-02-09T00:00:00Z');
