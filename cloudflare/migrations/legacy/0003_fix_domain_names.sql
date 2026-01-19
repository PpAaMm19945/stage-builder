-- Migration: Fix domain names to match frontend expectations
-- The frontend uses 'social-emotional' and 'pre-academic'
-- The database currently has 'social' and 'sensory'

-- Update 'social' to 'social-emotional'
UPDATE activities SET domain = 'social-emotional' WHERE domain = 'social';

-- Update 'sensory' to 'pre-academic' 
-- Sensory activities (texture exploration, water play, music movement, etc.) 
-- align with pre-academic skills (patterns, cause-effect, sensory discrimination)
UPDATE activities SET domain = 'pre-academic' WHERE domain = 'sensory';
