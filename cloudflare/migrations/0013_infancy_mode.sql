-- Extend activities for Daily Practices
ALTER TABLE activities ADD COLUMN activity_type TEXT NOT NULL DEFAULT 'activity';
-- Values: 'daily_practice' | 'activity' | 'family_session'

ALTER TABLE activities ADD COLUMN assessment_prohibited INTEGER NOT NULL DEFAULT 0;
-- 1 = No observations can be recorded

ALTER TABLE activities ADD COLUMN context_embedding TEXT;
-- Values: 'feeding' | 'diapering' | 'holding' | 'sleep' | 'outdoor' | NULL

CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
