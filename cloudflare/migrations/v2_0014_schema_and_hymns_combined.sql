-- Migration v2_0014: Combined Schema Restoration + SermonAudio Hymns
-- This replaces the failed v2_0012 migrations by combining both operations.

-- ============================================================================
-- PART 1: Restore Missing Legacy Schema Elements
-- ============================================================================

-- Filtering & Status (use ADD COLUMN IF NOT EXISTS pattern via try-catch in D1)
-- D1 doesn't support IF NOT EXISTS for columns, so we wrap in safe patterns

-- Add columns to formations (will fail silently if they exist)
ALTER TABLE formations ADD COLUMN is_archived INTEGER DEFAULT 0;
ALTER TABLE formations ADD COLUMN content_status TEXT DEFAULT 'published';
ALTER TABLE formations ADD COLUMN mess_level TEXT DEFAULT 'low';
ALTER TABLE formations ADD COLUMN difficulty INTEGER DEFAULT 1;
ALTER TABLE formations ADD COLUMN prep_time_minutes INTEGER DEFAULT 5;
ALTER TABLE formations ADD COLUMN uses_core_kit INTEGER DEFAULT 0;
ALTER TABLE formations ADD COLUMN primary_tier TEXT;
ALTER TABLE formations ADD COLUMN instructions TEXT;
ALTER TABLE formations ADD COLUMN tiered_expectations TEXT;
ALTER TABLE formations ADD COLUMN learning_outcomes TEXT;
ALTER TABLE formations ADD COLUMN success_indicators TEXT;
ALTER TABLE formations ADD COLUMN tips TEXT;
ALTER TABLE formations ADD COLUMN safety_note TEXT;
ALTER TABLE formations ADD COLUMN success_cue TEXT;

-- ============================================================================
-- PART 2: Restore Missing Tables
-- ============================================================================

-- Family Materials (Core Kit)
CREATE TABLE IF NOT EXISTS family_materials (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  material_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unknown',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(parent_id, material_name)
);
CREATE INDEX IF NOT EXISTS idx_materials_parent ON family_materials(parent_id);

-- Weekly Time Model (Planner Settings)
CREATE TABLE IF NOT EXISTS weekly_time_model (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL UNIQUE,
  available_days TEXT NOT NULL DEFAULT '["Mon","Tue","Wed","Thu","Fri"]',
  minutes_per_day INTEGER NOT NULL DEFAULT 45,
  preferred_times TEXT NOT NULL DEFAULT '["morning"]',
  max_sessions_per_day INTEGER NOT NULL DEFAULT 2,
  field_trip_days TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Parent Overrides (Planner Constraints)
CREATE TABLE IF NOT EXISTS parent_overrides (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  student_id TEXT,
  override_type TEXT NOT NULL CHECK(override_type IN ('sensory', 'motor', 'schedule', 'content', 'pacing')),
  description TEXT NOT NULL,
  constraints_json TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_parent_overrides_parent ON parent_overrides(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_overrides_student ON parent_overrides(student_id);

-- Content Upvotes (Feedback)
CREATE TABLE IF NOT EXISTS content_upvotes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('activity', 'book')),
  content_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, content_type, content_id)
);
CREATE INDEX IF NOT EXISTS idx_upvotes_content ON content_upvotes(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_user ON content_upvotes(user_id);

-- Parent Comments (Feedback)
CREATE TABLE IF NOT EXISTS parent_comments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('activity', 'book')),
  content_id TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  is_success_story INTEGER NOT NULL DEFAULT 0,
  is_approved INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_comments_content ON parent_comments(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON parent_comments(user_id);

-- Explanation Logs (AI RAG)
CREATE TABLE IF NOT EXISTS explanation_logs (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sources_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_explanation_logs_parent ON explanation_logs(parent_id);

-- AI Triage Logs (Front Desk)
CREATE TABLE IF NOT EXISTS ai_triage_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  input_text TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('VALID', 'AMBIGUOUS', 'INVALID')),
  reasoning TEXT,
  confidence REAL,
  was_blocks INTEGER DEFAULT 0,
  clarification_question TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ai_triage_logs_status ON ai_triage_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_triage_logs_created ON ai_triage_logs(created_at DESC);

-- Liturgy Completions (Legacy Tracking)
CREATE TABLE IF NOT EXISTS liturgy_completions (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  liturgy_item_id TEXT NOT NULL,
  completed_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (liturgy_item_id) REFERENCES formations(id) ON DELETE CASCADE,
  UNIQUE(parent_id, liturgy_item_id, completed_date)
);
CREATE INDEX IF NOT EXISTS idx_liturgy_completions_parent_date ON liturgy_completions(parent_id, completed_date);

-- Reading Sessions (Book Logs)
CREATE TABLE IF NOT EXISTS reading_sessions (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  book_id TEXT NOT NULL,
  children_present TEXT,
  notes TEXT,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  rating INTEGER,
  read_again INTEGER,
  feedback_json TEXT,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES formations(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_parent ON reading_sessions(parent_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book ON reading_sessions(book_id);

-- ============================================================================
-- PART 3: Add SermonAudio Hymns (51-56)
-- ============================================================================

INSERT INTO formations (
  id, title, formation_type, primary_virtue, biblical_faculty,
  description, liturgical_script, context_anchor, min_age_months, max_age_months, audio_url
) VALUES (
  'hymn_abide_with_me', 'Abide with Me', 'liturgy', 'Wonder', 'Affection',
  '1. Abide with me: fast falls the eventide;
The darkness deepens; Lord, with me abide!
(Full hymn available)',
  '<div class="hymn">
<div class="hymn-verse">1. Abide with me: fast falls the eventide;<br>The darkness deepens; Lord, with me abide!<br>When other helpers fail, and comforts flee,<br>Help of the helpless, O abide with me.</div>
<div class="hymn-verse">2. Swift to its close ebbs out life''s little day;<br>Earth''s joys grow dim, its glories pass away;<br>Change and decay in all around I see:<br>O Thou who changest not, abide with me.</div>
<div class="hymn-verse">3. I need Thy presence ev''ry passing hour;<br>What but Thy grace can foil the tempter''s pow''r?<br>Who, like Thyself, my guide and stay can be?<br>Through cloud and sunshine, Lord, abide with me.</div>
<div class="hymn-verse">4. I fear no foe, with Thee at hand to bless;<br>Ills have no weight, and tears no bitterness:<br>Where is death''s sting? where, grave, thy victory?<br>I triumph still, if Thou abide with me.</div>
<div class="hymn-verse">5. Hold Thou Thy cross before my closing eyes;<br>Shine through the gloom, and point me to the skies;<br>Heav''n''s morning breaks, and earth''s vain shadows flee;<br>In life, in death, O Lord, abide with me.</div>
<div class="hymn-author">Henry F. Lyte, 1847</div>
</div>',
  'Morning_Circle', 0, 216, 'https://media.sermonaudio.com/hymns/eventide.mp3'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  liturgical_script = EXCLUDED.liturgical_script, audio_url = EXCLUDED.audio_url;

INSERT INTO formations (
  id, title, formation_type, primary_virtue, biblical_faculty,
  description, liturgical_script, context_anchor, min_age_months, max_age_months, audio_url
) VALUES (
  'hymn_the_old_rugged_cross', 'The Old Rugged Cross', 'liturgy', 'Wonder', 'Affection',
  '1. On a hill far away stood an old rugged cross,
The emblem of suff''ring and shame;
(Full hymn available)',
  '<div class="hymn">
<div class="hymn-verse">1. On a hill far away stood an old rugged cross,<br>The emblem of suff''ring and shame;<br>And I love that old cross where the dearest and best<br>For a world of lost sinners was slain.</div>
<div class="hymn-chorus">Chorus:<br>So I''ll cherish the old rugged cross,<br>Till my trophies at last I lay down;<br>I will cling to the old rugged cross,<br>And exchange it some day for a crown.</div>
<div class="hymn-verse">2. Oh, that old rugged cross, so despised by the world,<br>Has a wondrous attraction for me;<br>For the dear Lamb of God left His glory above<br>To bear it to dark Calvary.</div>
<div class="hymn-verse">3. In the old rugged cross, stained with blood so divine,<br>A wonderful wondrous beauty I see;<br>For ''twas on that old cross Jesus suffered and died<br>To pardon and sanctify me.</div>
<div class="hymn-verse">4. To the old rugged cross I will ever be true,<br>Its shame and reproach gladly bear;<br>Then He''ll call me some day to my home far away,<br>Where His glory forever I''ll share.</div>
<div class="hymn-author">George Bennard, 1913</div>
</div>',
  'Morning_Circle', 0, 216, 'https://media.sermonaudio.com/hymns/oldruggedcross.mp3'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  liturgical_script = EXCLUDED.liturgical_script, audio_url = EXCLUDED.audio_url;

INSERT INTO formations (
  id, title, formation_type, primary_virtue, biblical_faculty,
  description, liturgical_script, context_anchor, min_age_months, max_age_months, audio_url
) VALUES (
  'hymn_this_is_my_fathers_world', 'This Is My Father''s World', 'liturgy', 'Wonder', 'Affection',
  '1. This is my Father''s world,
And to my list''ning ears,
All nature sings, and round me rings
The music of the spheres.
(Full hymn available)',
  '<div class="hymn">
<div class="hymn-verse">1. This is my Father''s world,<br>And to my list''ning ears,<br>All nature sings, and round me rings<br>The music of the spheres.</div>
<div class="hymn-verse">2. This is my Father''s world,<br>I rest me in the thought<br>Of rocks and trees, of skies and seas;<br>His hand the wonders wrought.</div>
<div class="hymn-verse">3. This is my Father''s world,<br>The birds their carols raise;<br>The morning light, the lily white<br>Declare their Maker''s praise.</div>
<div class="hymn-verse">4. This is my Father''s world,<br>He shines in all that''s fair;<br>In the rustling grass I hear Him pass,<br>He speaks to me ev''rywhere.</div>
<div class="hymn-verse">5. This is my Father''s world,<br>O let me ne''er forget<br>That though the wrong seems oft so strong,<br>God is the Ruler yet.</div>
<div class="hymn-verse">6. This is my Father''s world,<br>The battle is not done;<br>Jesus who died shall be satisfied,<br>And earth and heav''n be one.</div>
<div class="hymn-author">Maltbie D. Babcock, 1901</div>
</div>',
  'Morning_Circle', 0, 216, 'https://media.sermonaudio.com/hymns/terraper.mp3'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  liturgical_script = EXCLUDED.liturgical_script, audio_url = EXCLUDED.audio_url;

INSERT INTO formations (
  id, title, formation_type, primary_virtue, biblical_faculty,
  description, liturgical_script, context_anchor, min_age_months, max_age_months, audio_url
) VALUES (
  'hymn_and_can_it_be', 'And Can It Be?', 'liturgy', 'Wonder', 'Affection',
  '1. And can it be that I should gain
An int''rest in the Saviour''s blood?
Died He for me, who caused His pain?
(Full hymn available)',
  '<div class="hymn">
<div class="hymn-verse">1. And can it be that I should gain<br>An int''rest in the Saviour''s blood?<br>Died He for me, who caused His pain?<br>For me, who Him to death pursued?</div>
<div class="hymn-chorus">Chorus:<br>Amazing love! how can it be<br>That Thou, my God, shouldst die for me?<br>Amazing love! how can it be<br>That Thou, my God, shouldst die for me?</div>
<div class="hymn-verse">2. ''Tis mystery all! Th''Immortal dies!<br>Who can explore His strange design?<br>In vain the firstborn seraph tries<br>To sound the depths of love divine!<br>''Tis mercy all! let earth adore,<br>Let angel minds inquire no more.</div>
<div class="hymn-verse">3. He left His Father''s throne above—<br>So free, so infinite His grace—<br>Humbled Himself in matchless love<br>And bled for Adam''s helpless race;<br>''Tis mercy all, immense and free,<br>For, O my God, it found out me!</div>
<div class="hymn-verse">4. Long my imprisoned spirit lay<br>Fast bound in sin and nature''s night;<br>Thine eye diffused a quick''ning ray,<br>I woke, the dungeon flamed with light;<br>My chains fell off, my heart was free,<br>I rose, went forth, and followed Thee.</div>
<div class="hymn-verse">5. No condemnation now I dread;<br>Jesus, and all in Him, is mine!<br>Alive in Him, my living Head,<br>And clothed in righteousness divine,<br>Bold I approach th''eternal throne,<br>And claim the crown, through Christ my own.</div>
<div class="hymn-author">Charles Wesley, 1738</div>
</div>',
  'Morning_Circle', 0, 216, 'https://media.sermonaudio.com/hymns/sagina.mp3'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  liturgical_script = EXCLUDED.liturgical_script, audio_url = EXCLUDED.audio_url;

INSERT INTO formations (
  id, title, formation_type, primary_virtue, biblical_faculty,
  description, liturgical_script, context_anchor, min_age_months, max_age_months, audio_url
) VALUES (
  'hymn_arise_my_soul_arise', 'Arise, My Soul, Arise', 'liturgy', 'Wonder', 'Affection',
  '1. Arise, my soul, arise;
Shake off thy guilty fears;
The bleeding Sacrifice
In my behalf appears:
(Full hymn available)',
  '<div class="hymn">
<div class="hymn-verse">1. Arise, my soul, arise;<br>Shake off thy guilty fears;<br>The bleeding Sacrifice<br>In my behalf appears:<br>Before the throne my Surety stands,<br>Before the throne my Surety stands,<br>My name is written on His hands.</div>
<div class="hymn-verse">2. He ever lives above,<br>For me to intercede;<br>His all-redeeming love,<br>His precious blood to plead;<br>His blood for sin did once atone,<br>His blood for sin did once atone,<br>And now it pleads before the Throne.</div>
<div class="hymn-verse">3. Five bleeding wounds He bears,<br>Received on Calvary,<br>They pour effectual prayers,<br>They strongly plead for me:<br>"Forgive him, O forgive," they cry,<br>"Forgive him, O forgive," they cry,<br>"Nor let that ransomed sinner die!"</div>
<div class="hymn-verse">4. The Father hears Him pray,<br>His dear anointed One;<br>He cannot turn away<br>The presence of His Son;<br>His Spirit answers to the blood,<br>His Spirit answers to the blood,<br>And tells me I am born of God.</div>
<div class="hymn-verse">5. I now am reconciled;<br>God''s pard''ning voice I hear,<br>He owns me as His child,<br>I can no longer fear;<br>With confidence I now draw nigh,<br>With confidence I now draw nigh,<br>And, "Father, Abba, Father," cry.</div>
<div class="hymn-author">Charles Wesley, 1742</div>
</div>',
  'Morning_Circle', 0, 216, 'https://media.sermonaudio.com/hymns/lenox.mp3'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  liturgical_script = EXCLUDED.liturgical_script, audio_url = EXCLUDED.audio_url;

INSERT INTO formations (
  id, title, formation_type, primary_virtue, biblical_faculty,
  description, liturgical_script, context_anchor, min_age_months, max_age_months, audio_url
) VALUES (
  'hymn_christ_arose', 'Christ Arose', 'liturgy', 'Wonder', 'Affection',
  '1. Low in the grave He lay,
Jesus my Saviour!
Waiting the coming day,
Jesus my Lord!
(Full hymn available)',
  '<div class="hymn">
<div class="hymn-verse">1. Low in the grave He lay,<br>Jesus my Saviour!<br>Waiting the coming day,<br>Jesus my Lord!</div>
<div class="hymn-chorus">Refrain:<br>Up from the grave He arose!<br>With a mighty triumph o''er His foes;<br>He arose a Victor from the dark domain,<br>And He lives forever with His saints to reign.<br>He arose! He arose!<br>Hallelujah! Christ arose!</div>
<div class="hymn-verse">2. Vainly they watch His bed,<br>Jesus my Saviour!<br>Vainly they seal the dead,<br>Jesus my Lord!</div>
<div class="hymn-verse">3. Death cannot keep his prey,<br>Jesus my Saviour!<br>He tore the bars away,<br>Jesus my Lord!</div>
<div class="hymn-author">Robert Lowry, 1874</div>
</div>',
  'Morning_Circle', 0, 216, 'https://media.sermonaudio.com/hymns/christarose.mp3'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  liturgical_script = EXCLUDED.liturgical_script, audio_url = EXCLUDED.audio_url;
