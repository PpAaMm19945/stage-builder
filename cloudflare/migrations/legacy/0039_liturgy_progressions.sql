-- Migration 0039: Liturgy Progressions
-- FIX: Added IF NOT EXISTS to table and indexes
-- FIX: Changed INSERT to INSERT OR IGNORE

-- ============================================================================
-- PHASE 1: NEW TABLE - LITURGY PROGRESSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS liturgy_progressions (
  id TEXT PRIMARY KEY,
  base_item_id TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('seedling', 'sprout', 'sapling', 'tree', 'oak')),
  
  -- SIMPLIFIED CONTENT
  simplified_title TEXT,
  simplified_content TEXT NOT NULL,
  memory_portion TEXT,
  
  -- PARENT GUIDANCE
  parent_teaching_note TEXT,
  
  -- METADATA
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (base_item_id) REFERENCES formations(id) ON DELETE CASCADE
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_progressions_base ON liturgy_progressions(base_item_id);
CREATE INDEX IF NOT EXISTS idx_progressions_stage ON liturgy_progressions(stage);
CREATE UNIQUE INDEX IF NOT EXISTS idx_progressions_unique ON liturgy_progressions(base_item_id, stage);

-- ============================================================================
-- PHASE 2: SEED EXAMPLE PROGRESSIONS (WSC Q1-Q4)
-- ============================================================================

-- WSC Q1: What is the chief end of man?
INSERT OR IGNORE INTO liturgy_progressions (id, base_item_id, stage, simplified_title, simplified_content, memory_portion, parent_teaching_note) VALUES
('wsc_q1_seedling', 'wsc_q1', 'seedling', 
  'Why are we here?', 
  'God made us to love Him and be happy with Him forever.', 
  'God made me to love Him.', 
  'Sing this as a simple song. Use hugs and smiles to show what "enjoying God" feels like.'),
  
('wsc_q1_sprout', 'wsc_q1', 'sprout', 
  'Why did God make people?', 
  'Q: Why did God make people?\nA: God made people to give Him glory and to enjoy Him forever.', 
  'God made people to give Him glory and enjoy Him forever.', 
  'Ask: "What makes you really happy?" Lead to: "God wants us to be happy with HIM most of all."'),
  
('wsc_q1_sapling', 'wsc_q1', 'sapling', 
  'Q1: What is man''s chief end?', 
  'Q: What is man''s chief end?\nA: Man''s chief end is to glorify God, and to enjoy him forever.', 
  'Man''s chief end is to glorify God, and to enjoy him forever.', 
  'Introduce the word "glorify" (to show how great someone is). Discuss: How do we show others how great God is?'),
  
('wsc_q1_tree', 'wsc_q1', 'tree', 
  'Q1: What is the chief end of man?', 
  'Q: What is the chief end of man?\nA: Man''s chief end is to glorify God, and to enjoy him forever.\n\nScripture: 1 Corinthians 10:31, Romans 11:36, Psalm 73:24-28', 
  'Man''s chief end is to glorify God, and to enjoy him forever. (1 Cor. 10:31)', 
  'Discuss: What does it mean to do EVERYTHING for God''s glory? How does enjoying God differ from enjoying things?'),
  
('wsc_q1_oak', 'wsc_q1', 'oak', 
  'Q1: What is the chief end of man?', 
  'Q: What is the chief end of man?\nA: Man''s chief end is to glorify God, and to enjoy him forever.\n\nScripture Proofs:\n- 1 Cor 10:31: "So, whether you eat or drink, or whatever you do, do all to the glory of God."\n- Rom 11:36: "For from him and through him and to him are all things."\n- Ps 73:24-28: "You guide me... Whom have I in heaven but you?"\n\nApologetic Note: This answer rejects both hedonism (living for pleasure) and legalism (living for duty). True joy is found IN glorifying God, not separate from it.', 
  'Man''s chief end is to glorify God, and to enjoy him forever.', 
  'Discuss the Westminster divines'' choice of "enjoy" over mere "obey." Compare with Piper''s "Christian Hedonism." How does this answer atheistic claims that Christianity is joyless?');

-- WSC Q4: What is God?
INSERT OR IGNORE INTO liturgy_progressions (id, base_item_id, stage, simplified_title, simplified_content, memory_portion, parent_teaching_note) VALUES
('wsc_q4_seedling', 'wsc_q4', 'seedling', 
  'What is God like?', 
  'God is a Spirit. He has always been here. He never changes. He is very, very good.', 
  'God is a Spirit. He is very good.', 
  'Blow on their hand: "You can''t see air, but it''s there. God is a Spirit—you can''t see Him, but He''s always with you."'),
  
('wsc_q4_sprout', 'wsc_q4', 'sprout', 
  'What is God?', 
  'Q: What is God?\nA: God is a Spirit. He doesn''t have a body like us. He has always been alive, and He is always the same—good, wise, and true.', 
  'God is a Spirit. He has always been alive.', 
  'Draw: things that change (seasons, growing up) vs. God who never changes. Emphasize: we can always trust Him because He stays the same.'),
  
('wsc_q4_sapling', 'wsc_q4', 'sapling', 
  'Q4: What is God?', 
  'Q: What is God?\nA: God is a Spirit, infinite, eternal, and unchangeable, in his being, wisdom, power, holiness, justice, goodness, and truth.', 
  'God is a Spirit, infinite, eternal, and unchangeable, in his being, wisdom, power, holiness, justice, goodness, and truth.', 
  'Break down: Infinite (no limits), Eternal (no beginning or end), Unchangeable (never gets better or worse). List His 7 attributes together.'),
  
('wsc_q4_tree', 'wsc_q4', 'tree', 
  'Q4: What is God?', 
  'Q: What is God?\nA: God is a Spirit, infinite, eternal, and unchangeable, in his being, wisdom, power, holiness, justice, goodness, and truth.\n\nScripture: John 4:24, Psalm 90:2, James 1:17, Exodus 3:14', 
  'God is a Spirit, infinite, eternal, and unchangeable, in his being, wisdom, power, holiness, justice, goodness, and truth.', 
  'Distinguish between God''s incommunicable attributes (only He has them: infinite, eternal, unchangeable) and communicable attributes (we reflect them: wisdom, goodness, justice).'),
  
('wsc_q4_oak', 'wsc_q4', 'oak', 
  'Q4: What is God?', 
  'Q: What is God?\nA: God is a Spirit, infinite, eternal, and unchangeable, in his being, wisdom, power, holiness, justice, goodness, and truth.\n\nScripture Proofs:\n- John 4:24: "God is spirit, and those who worship him must worship in spirit and truth."\n- Ps 90:2: "From everlasting to everlasting you are God."\n- James 1:17: "...no variation or shadow due to change."\n- Ex 3:14: "I AM WHO I AM."\n\nApologetic Note: This definition refutes: (1) Materialism—God is not physical matter, (2) Process Theology—God does not change or grow, (3) Polytheism—there is one infinite being, not many finite gods.', 
  'God is a Spirit, infinite, eternal, and unchangeable, in his being, wisdom, power, holiness, justice, goodness, and truth.', 
  'Essay prompt: "How does God''s unchangeableness (immutability) provide comfort in a world of constant change?" Compare Malachi 3:6 with Hebrews 13:8.');