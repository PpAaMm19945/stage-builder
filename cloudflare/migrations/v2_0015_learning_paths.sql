-- Migration v2_0015: Learning Paths System
-- Creates tables for learning paths and family subscriptions

-- ============================================
-- TABLE 1: learning_paths
-- Defines all available learning journeys
-- ============================================
CREATE TABLE IF NOT EXISTS learning_paths (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  path_type TEXT NOT NULL CHECK (path_type IN (
    'hymn_journey', 
    'catechism', 
    'liturgy', 
    'history_young', 
    'history_full', 
    'pastor_curtis', 
    'toddler_dev', 
    'early_reading',
    'custom'
  )),
  content_filter TEXT,           -- JSON for filtering formations (e.g., {"cluster_tag": "hymn"})
  pace TEXT NOT NULL DEFAULT 'weekly' CHECK (pace IN ('daily', 'weekly', 'self_paced')),
  total_items INTEGER,           -- Total items in path (for % calculation)
  min_age_months INTEGER DEFAULT 0,
  max_age_months INTEGER DEFAULT 216,
  cover_image_url TEXT,
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 100,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- TABLE 2: family_path_subscriptions
-- Tracks which paths each family has activated
-- ============================================
CREATE TABLE IF NOT EXISTS family_path_subscriptions (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  path_id TEXT NOT NULL,
  started_at TEXT DEFAULT (datetime('now')),
  current_position INTEGER DEFAULT 1,   -- Where they are in the sequence
  is_paused INTEGER DEFAULT 0,
  completed_at TEXT,                     -- NULL until finished
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
  UNIQUE(parent_id, path_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_family_subscriptions_parent ON family_path_subscriptions(parent_id);
CREATE INDEX IF NOT EXISTS idx_family_subscriptions_path ON family_path_subscriptions(path_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_active ON learning_paths(is_active);

-- ============================================
-- SEED DATA: Core Learning Paths
-- ============================================

INSERT INTO learning_paths (id, title, description, path_type, content_filter, pace, total_items, min_age_months, max_age_months, sort_order) VALUES
  (
    'hymn-journey',
    'Hymn Memorization Journey',
    'Learn and sing one classic hymn per week. Build a treasury of songs that will stay with your family for generations.',
    'hymn_journey',
    '{"cluster_tag": "hymn"}',
    'weekly',
    100,
    0,
    216,
    10
  ),
  (
    'westminster-catechism',
    'Westminster Catechism',
    'Work through the Westminster Shorter Catechism together, one question per week. Deep theological formation for the whole family.',
    'catechism',
    '{"cluster_tag": "catechism"}',
    'weekly',
    107,
    36,
    216,
    20
  ),
  (
    'daily-liturgy',
    'Family Liturgy (Daily)',
    'Establish a daily rhythm of prayer, scripture, and song. A gentle structure for beginning and ending each day together.',
    'liturgy',
    '{"cluster_tag": "liturgy"}',
    'daily',
    NULL,
    0,
    216,
    5
  ),
  (
    'african-history-young',
    'African History (Picture Books)',
    'Discover the rich history of Africa through beautiful picture books. Perfect for young children ages 3-8.',
    'history_young',
    '{"domain": "history", "format": "picture_book"}',
    'weekly',
    20,
    36,
    96,
    30
  ),
  (
    'african-history-full',
    'African History Course',
    'A comprehensive journey through African history with Uganda as a special focus. For older students ready for deeper study.',
    'history_full',
    '{"domain": "history", "format": "textbook"}',
    'weekly',
    30,
    132,
    216,
    40
  ),
  (
    'toddler-development',
    'Toddler Formation',
    'Daily activities designed for little ones 0-5. Simple, meaningful moments that nurture growth in every area.',
    'toddler_dev',
    '{"age_tier": "infant"}',
    'daily',
    100,
    0,
    60,
    15
  ),
  (
    'early-reading',
    'Early Reading Path',
    'Build reading readiness through phonics, letter recognition, and read-alouds. A gentle introduction to literacy.',
    'early_reading',
    '{"skill": "reading"}',
    'daily',
    50,
    36,
    84,
    25
  );

SELECT 'Learning Paths migration complete: ' || COUNT(*) || ' paths created' FROM learning_paths;
