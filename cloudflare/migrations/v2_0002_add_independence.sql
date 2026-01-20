-- Migration v2_0002: Add Independence Settings to Students
ALTER TABLE students ADD COLUMN independence_settings TEXT DEFAULT '{"mode":"parent_led"}';
