-- ============================================================================
-- Migration: Seed Early Years Activities (Full Set - Suggestive Style)
-- Created: 2026-01-20
-- Description: Migrated ALL legacy activities to formations table with
--              new "suggestive" content philosophy organized by virtue
-- ============================================================================
-- This replaces and expands the initial 33 activities to include the full
-- set from legacy migrations (0002 + 0004 + 0026)
-- ============================================================================

-- ============================================================================
-- STEWARDSHIP (Motor/Physical) - 25 activities
-- ============================================================================

INSERT OR REPLACE INTO formations (
  id, title, formation_type, primary_virtue, description, guide_steps,
  parent_posture, materials, duration_minutes, context_anchor, cluster_tag,
  min_age_months, max_age_months, is_active, content_source
) VALUES

-- Infant Motor (0-12 months)
('ey_motor_001', 'Tummy Time', 'skill', 'Stewardship',
'Tummy time strengthens neck and core muscles essential for crawling and sitting. Short sessions throughout the day build toward longer independent play. Your presence on the floor with them makes it enjoyable.',
'["Place baby on tummy on soft surface", "Get down to their eye level", "Offer interesting toys within reach", "Talk and smile to encourage lifting head", "Take breaks when tired"]',
'Stay close and engaged. Your face is the best motivator.',
'["Soft mat", "Colorful toys"]', 5, 'Anytime', 'motor', 0, 6, 1, 'schoolos_legacy'),

('ey_motor_002', 'Reaching and Grasping', 'skill', 'Stewardship',
'Grasping develops the fine motor control needed for feeding, writing, and countless daily tasks. Each texture explored teaches the brain something new about the world.',
'["Hold toys within baby reach", "Shake gently to attract attention", "Let baby grab and explore", "Offer different textures", "Praise all attempts"]',
'Follow their interest. Let them mouth and explore.',
'["Soft rattles", "Textured toys"]', 10, 'Anytime', 'motor', 3, 9, 1, 'schoolos_legacy'),

('ey_motor_003', 'Supported Sitting', 'skill', 'Stewardship',
'Learning to sit opens a new world of play and interaction. Core strength develops gradually through practice with support.',
'["Provide support around hips", "Offer toys to hold", "Gradually reduce support", "Catch when tipping", "Build sitting time slowly"]',
'Stay close for safety. Celebrate their effort, not just success.',
'["Support pillow", "Interesting toys"]', 10, 'Anytime', 'motor', 4, 9, 1, 'schoolos_legacy'),

('ey_motor_004', 'Cruising Practice', 'skill', 'Stewardship',
'Moving along furniture builds the leg strength and balance needed for walking. This is a major milestone toward independence.',
'["Place motivating toys along furniture", "Encourage stepping sideways", "Stay nearby for safety", "Celebrate each step", "Clear obstacles from path"]',
'Let them set the pace. Some babies cruise for weeks before walking.',
'["Stable furniture", "Motivating toys"]', 15, 'Anytime', 'motor', 8, 14, 1, 'schoolos_legacy'),

-- Toddler Motor (12-24 months)
('ey_motor_005', 'Ball Rolling Together', 'skill', 'Stewardship',
'Rolling a ball back and forth builds tracking, coordination, and the joy of cooperative play. It teaches the rhythm of give and take.',
'["Sit facing each other on floor", "Roll ball gently to child", "Encourage rolling it back", "Celebrate each exchange", "Try different sized balls"]',
'Match their energy. If they throw instead of roll, adapt.',
'["Soft medium ball"]', 15, 'Anytime', 'motor', 9, 24, 1, 'schoolos_legacy'),

('ey_motor_006', 'Push and Pull Toys', 'skill', 'Stewardship',
'Walking with push and pull toys builds stability and motor planning. The toy provides support while encouraging forward movement.',
'["Start with push toys for steadier walking", "Progress to pull toys that require looking back", "Encourage varied routes", "Add simple obstacles to navigate"]',
'Let them lead. The destination matters less than the journey.',
'["Push cart or pull toy"]', 15, 'Anytime', 'motor', 12, 24, 1, 'schoolos_legacy'),

('ey_motor_007', 'Stacking Blocks', 'skill', 'Stewardship',
'Building towers develops hand control, spatial awareness, and persistence. The crash at the end is part of the fun.',
'["Demonstrate stacking two blocks", "Let child try to stack", "Celebrate towers of any height", "Knock down together for fun", "Build again"]',
'Resist building for them. Their wobbly tower is a triumph.',
'["Blocks or boxes"]', 15, 'Anytime', 'motor', 12, 36, 1, 'schoolos_legacy'),

('ey_motor_008', 'First Drawing', 'skill', 'Stewardship',
'Making marks is the beginning of writing. Scribbling builds the grip strength and arm control needed for letters later.',
'["Secure paper to surface", "Demonstrate making marks", "Let child scribble freely", "Describe their marks", "Display their artwork"]',
'Process over product. There is no wrong way to scribble.',
'["Thick crayons", "Large paper"]', 10, 'Anytime', 'motor', 12, 24, 1, 'schoolos_legacy'),

('ey_motor_009', 'Outdoor Walking Adventures', 'skill', 'Stewardship',
'Walking on uneven outdoor surfaces builds balance and spatial awareness far more than flat indoor floors. Nature provides built-in variety.',
'["Walk on grass, slopes, paths", "Step over small objects", "Navigate around obstacles", "Go at child pace", "Stop to explore interesting finds"]',
'There is no hurry. Let them lead.',
'["Safe outdoor space", "Good shoes"]', 20, 'Walk_By_The_Way', 'motor', 12, 24, 1, 'schoolos_legacy'),

('ey_motor_010', 'Playdough Creations', 'skill', 'Stewardship',
'Squeezing, rolling, and pinching dough builds the hand muscles needed for writing. The sensory experience is calming for many children.',
'["Let child explore freely first", "Demonstrate rolling and squishing", "Make shapes together", "Use simple tools to create", "Name what you see"]',
'Sit beside, not across. Resist directing their creation.',
'["Playdough", "Simple tools"]', 20, 'Anytime', 'motor', 18, 48, 1, 'schoolos_legacy'),

-- Preschool Motor (24-48 months)
('ey_motor_011', 'Obstacle Adventures', 'skill', 'Stewardship',
'Climbing, crawling, and navigating builds motor planning, body awareness, and confidence. The challenge is the reward.',
'["Create path with cushions and chairs", "Demonstrate each section", "Guide through first time", "Add challenges gradually", "Let child help design it"]',
'Stay close for safety but let them struggle productively.',
'["Cushions", "Chairs", "Soft items"]', 20, 'Anytime', 'motor', 24, 48, 1, 'schoolos_legacy'),

('ey_motor_012', 'Scissors Introduction', 'skill', 'Stewardship',
'Using scissors develops bilateral coordination and hand strength. The skill takes time to master - expect months of practice.',
'["Start with playdough cutting", "Progress to paper strips", "Focus on grip: thumb up", "Short sessions only", "Celebrate all snips"]',
'Always supervise. Left-handed children need left-handed scissors.',
'["Safety scissors", "Paper strips"]', 15, 'Anytime', 'motor', 24, 36, 1, 'schoolos_legacy'),

('ey_motor_013', 'Ball Kicking', 'skill', 'Stewardship',
'Kicking builds leg coordination, balance, and the ability to control force. Start with a stationary ball.',
'["Start with ball standing still", "Demonstrate kicking motion", "Set up easy targets", "Celebrate all attempts", "Vary distances gradually"]',
'Make it playful. The goal is fun, not perfection.',
'["Large soft ball", "Cones or markers"]', 15, 'Anytime', 'motor', 24, 48, 1, 'schoolos_legacy'),

('ey_motor_014', 'Pouring Practice', 'skill', 'Stewardship',
'Pouring develops wrist control and focus. This practical life skill builds independence and is deeply satisfying for children.',
'["Set up on a tray to catch spills", "Demonstrate slow pouring", "Let child practice", "Narrate: pour slowly, stop when full", "Clean up spills together"]',
'Accept spills gracefully. They are part of learning.',
'["Small pitcher", "Cups", "Rice or water", "Tray"]', 10, 'Anytime', 'motor', 18, 36, 1, 'schoolos_legacy'),

('ey_motor_015', 'Threading and Lacing', 'skill', 'Stewardship',
'Threading builds hand-eye coordination and patience. The concentration required is meditative for many children.',
'["Show how to push lace through", "Start with just a few holes", "Guide hands if needed", "Celebrate progress", "Try patterns when ready"]',
'Patience over perfection. The process matters more than the product.',
'["Large beads or lacing cards", "Thick string"]', 15, 'Anytime', 'motor', 24, 48, 1, 'schoolos_legacy'),

-- Older Preschool Motor (36-60 months)
('ey_motor_016', 'Tricycle Riding', 'skill', 'Stewardship',
'Pedaling and steering develops bilateral coordination and spatial awareness. This is often a milestone of great pride.',
'["Start on flat surface", "Practice pedaling motion first", "Add steering gradually", "Set simple courses", "Always use helmet"]',
'Safety first. Celebrate their growing capability.',
'["Tricycle", "Helmet", "Safe space"]', 20, 'Anytime', 'motor', 36, 48, 1, 'schoolos_legacy'),

('ey_motor_017', 'Throwing and Catching', 'skill', 'Stewardship',
'Catching requires tracking and timing. Start with large soft objects and short distances, building toward smaller balls and greater distances.',
'["Start with underhand throws", "Use soft balls or bean bags", "Practice catching large items first", "Gradually increase distance", "Make it a cooperative game"]',
'This is cooperative, not competitive. You are on the same team.',
'["Soft balls of various sizes"]', 15, 'Anytime', 'motor', 36, 60, 1, 'schoolos_legacy'),

('ey_motor_018', 'Buttoning Practice', 'skill', 'Stewardship',
'Buttoning and unbuttoning builds independence for dressing. Start with large buttons on flat surfaces before own clothing.',
'["Start with unbuttoning (easier)", "Use large buttons first", "Work on flat surface initially", "Progress to own clothes", "Celebrate each success"]',
'Independence is built slowly. Patience now pays off later.',
'["Busy board or large button clothing"]', 15, 'Anytime', 'motor', 36, 60, 1, 'schoolos_legacy'),

('ey_motor_019', 'Hopping and Skipping', 'skill', 'Stewardship',
'Hopping and skipping require balance, coordination, and rhythm. These emerge when the body is ready.',
'["Practice hopping on one foot", "Try galloping first (easier)", "Progress to skipping", "Use music for rhythm", "Practice both sides"]',
'Some children skip early, some later. Both are normal.',
'["Open space", "Music optional"]', 15, 'Anytime', 'motor', 48, 60, 1, 'schoolos_legacy'),

('ey_motor_020', 'Cutting Shapes', 'skill', 'Stewardship',
'Cutting along lines and curves develops precision control. This readies hands for detailed work.',
'["Start with straight lines", "Progress to gentle curves", "Try simple shapes", "Focus on control not speed", "Display finished work"]',
'Speed comes with practice. Celebrate control.',
'["Scissors", "Paper with lines and shapes"]', 15, 'Anytime', 'motor', 48, 60, 1, 'schoolos_legacy');

-- ============================================================================
-- WISDOM (Language/Cognitive) - 30 activities
-- ============================================================================

INSERT OR REPLACE INTO formations (
  id, title, formation_type, primary_virtue, description, guide_steps,
  parent_posture, materials, duration_minutes, context_anchor, cluster_tag,
  min_age_months, max_age_months, is_active, content_source
) VALUES

-- Infant Language (0-12 months)
('ey_lang_001', 'Talking Through the Day', 'skill', 'Wisdom',
'Babies learn language by hearing it constantly. Narrating your day exposes them to thousands of words and the patterns of conversation.',
'["Talk through diaper changes", "Name body parts during bath", "Describe what you see on walks", "Use simple sentences", "Make eye contact"]',
'Narrate your life. Talk about everything as it happens.',
'["No materials needed"]', 10, 'Anytime', 'language', 0, 12, 1, 'schoolos_legacy'),

('ey_lang_002', 'Responsive Talking', 'skill', 'Wisdom',
'When you respond to baby sounds as if they are words, you teach the rhythm of conversation and show that their voice matters.',
'["Wait for baby sounds", "Respond with similar sounds", "Add varied tones", "Pause and wait for reply", "Smile and engage"]',
'Treat their sounds as conversation. They are practicing.',
'["No materials needed"]', 10, 'Anytime', 'language', 0, 6, 1, 'schoolos_legacy'),

('ey_lang_003', 'Picture Books Together', 'skill', 'Wisdom',
'Reading aloud builds vocabulary, comprehension, and love of stories. The closeness of shared reading creates lasting memories.',
'["Choose books with clear pictures", "Point to pictures and name them", "Let child turn pages", "Read at their pace", "Revisit favorites often"]',
'Snuggle close. Your warmth matters as much as the words.',
'["Board books"]', 15, 'Bedside', 'language', 6, 24, 1, 'schoolos_legacy'),

-- Toddler Language (12-24 months)
('ey_lang_004', 'Animal Sounds Game', 'skill', 'Wisdom',
'Matching animals to their sounds builds vocabulary and imitation skills. Young children love making animal noises.',
'["Show an animal toy or picture", "Make its sound: moo!", "Ask what does cow say?", "Accept all attempts", "Make it a guessing game"]',
'Enthusiasm is contagious. Get silly with it.',
'["Animal toys or pictures"]', 10, 'Anytime', 'language', 12, 30, 1, 'schoolos_legacy'),

('ey_lang_005', 'Nursery Rhymes Singing', 'skill', 'Wisdom',
'Rhymes and songs teach phonemic awareness - hearing the sounds in words that is foundational to reading. Repetition builds memory.',
'["Sing favorites regularly", "Add hand motions", "Pause for child to fill in words", "Repeat often - repetition builds learning", "Make up new verses"]',
'Your voice is perfect for them. Enthusiasm matters more than pitch.',
'["No materials needed"]', 10, 'Anytime', 'language', 6, 36, 1, 'schoolos_legacy'),

('ey_lang_006', 'Naming Body Parts', 'skill', 'Wisdom',
'Learning body parts builds vocabulary and body awareness. Songs like "Head, Shoulders, Knees and Toes" make this joyful.',
'["Point to your nose and name it", "Ask: where is your nose?", "Use songs that name body parts", "Practice on dolls too", "Add new parts gradually"]',
'Make it a game. Touch your nose, touch your toes.',
'["Mirror optional", "Doll or stuffed animal"]', 10, 'Anytime', 'language', 12, 24, 1, 'schoolos_legacy'),

('ey_lang_007', 'First Action Words', 'skill', 'Wisdom',
'Verbs are the engine of language. Learning action words through movement connects meaning to experience.',
'["Say and do: jump, clap, spin", "Invite child to copy", "Name actions child does spontaneously", "Use throughout the day", "Play follow the leader"]',
'Move together. Language lives in our bodies.',
'["Open space"]', 15, 'Anytime', 'language', 12, 24, 1, 'schoolos_legacy'),

-- Preschool Language (24-48 months)
('ey_lang_008', 'Simple Directions Game', 'skill', 'Wisdom',
'Following directions builds listening and memory. Make it a game with silly requests and celebrations.',
'["Start with one-step directions", "Make it playful: put teddy on the chair!", "Add two steps when ready", "Celebrate success warmly", "Keep it light and fun"]',
'This is play, not testing. Failure should feel safe.',
'["Toys around the room"]', 10, 'Anytime', 'language', 18, 36, 1, 'schoolos_legacy'),

('ey_lang_009', 'Story Time Conversations', 'skill', 'Wisdom',
'Talking about stories builds comprehension and vocabulary. Questions should invite exploration, not test knowledge.',
'["Read engaging stories", "Use different voices", "Point to illustrations", "Ask open questions: what do you notice?", "Let child retell parts"]',
'Wonder together. There are no wrong answers.',
'["Picture books"]', 20, 'Bedside', 'language', 18, 48, 1, 'schoolos_legacy'),

('ey_lang_010', 'Expanding Words', 'skill', 'Wisdom',
'When you expand their words, you model richer language without correcting. "Ball" becomes "Yes, the big red ball!"',
'["Listen for child words", "Repeat and add words: ball becomes big red ball", "Model complete sentences", "Avoid correcting directly", "Celebrate communication"]',
'Mirror and expand. Never correct pronunciation directly.',
'["Daily conversation"]', 15, 'Anytime', 'language', 24, 36, 1, 'schoolos_legacy'),

('ey_lang_011', 'Puppet Conversations', 'skill', 'Wisdom',
'Puppets create safe distance for practicing conversation. Children often say more to a puppet than directly to adults.',
'["Give puppet a simple voice", "Have puppet ask questions", "Let child respond", "Create simple scenarios", "Follow their lead"]',
'Lower the pressure. The puppet is the one talking.',
'["Puppets or sock puppets"]', 15, 'Anytime', 'language', 24, 48, 1, 'schoolos_legacy'),

('ey_lang_012', 'Story Retelling', 'skill', 'Wisdom',
'Retelling develops comprehension, sequencing, and narrative skills. Accept their version - accuracy matters less than engagement.',
'["Read familiar story", "Close the book and ask: can you tell it?", "Use props as prompts", "Accept their version", "Fill in missing parts together"]',
'Their retelling shows their understanding. Celebrate it.',
'["Familiar books", "Story props"]', 15, 'Anytime', 'language', 36, 48, 1, 'schoolos_legacy'),

('ey_lang_013', 'Rhyming Games', 'skill', 'Wisdom',
'Playing with rhymes develops phonemic awareness - one of the strongest predictors of reading success. Silly rhymes count.',
'["Say word pairs: cat-hat", "Ask: do these rhyme?", "Play rhyme matching games", "Make up silly rhymes together", "Read rhyming books"]',
'Nonsense rhymes are perfect. Bat, cat, zat, glat!',
'["Rhyming books optional"]', 15, 'Anytime', 'language', 36, 48, 1, 'schoolos_legacy'),

('ey_lang_014', 'Question Time', 'skill', 'Wisdom',
'Answering who, what, where, when, why questions builds comprehension and conversation skills.',
'["Look at pictures together", "Ask WH questions: who is this? what happened?", "Model complete answers", "Let child ask questions too", "Keep it conversational"]',
'Curiosity is the goal. Keep it playful.',
'["Picture books", "Photos"]', 15, 'Anytime', 'language', 36, 48, 1, 'schoolos_legacy'),

-- School Readiness Language (48-60 months)
('ey_lang_015', 'First Sound Games', 'skill', 'Wisdom',
'Identifying beginning sounds is a key reading readiness skill. Use sounds (buh), not letter names (bee).',
'["Emphasize first sounds: ball, buh-buh-ball", "Ask: what sound starts ball?", "Sort objects by beginning sound", "Play I Spy with sounds", "Keep it playful"]',
'Sounds before letters. This is ear work, not eye work.',
'["Objects or picture cards"]', 15, 'Anytime', 'language', 48, 60, 1, 'schoolos_legacy'),

('ey_lang_016', 'Making Up Stories', 'skill', 'Wisdom',
'Creating original stories builds imagination, narrative structure, and confidence. Their stories reveal their inner world.',
'["Offer a story starter", "Ask: what happens next?", "Add to their ideas", "Encourage creativity", "Write down or record their stories"]',
'Never correct their story. It is perfect as they tell it.',
'["Story starter cards optional"]', 20, 'Anytime', 'language', 48, 60, 1, 'schoolos_legacy'),

('ey_lang_017', 'Multi-Step Directions', 'skill', 'Wisdom',
'Following 3-4 step directions prepares children for classroom instructions. Build gradually from simpler to more complex.',
'["Give clear multi-step directions", "Start with 2 steps, build to 3-4", "Avoid repeating - encourage listening", "Praise completion", "Make it helpful, not test-like"]',
'Real tasks work best: get your shoes, put on your coat, meet me at the door.',
'["Daily activities"]', 15, 'Anytime', 'language', 48, 60, 1, 'schoolos_legacy'),

-- Cognitive Skills (all ages)
('ey_cog_001', 'Object Permanence Games', 'skill', 'Wisdom',
'Hiding and finding teaches babies that objects exist even when not seen. This fundamental concept underlies all later learning.',
'["Show toy to baby", "Slowly cover it with blanket", "Ask: where did it go?", "Let baby find it or reveal it", "Celebrate discovery"]',
'The delight is in their face when it reappears.',
'["Soft blanket", "Favorite toy"]', 10, 'Anytime', 'cognitive', 6, 12, 1, 'schoolos_legacy'),

('ey_cog_002', 'Cause and Effect Exploration', 'skill', 'Wisdom',
'Every time a button makes sound or a ball rolls, babies learn that their actions matter. This is the foundation of agency.',
'["Show cause-effect toys", "Demonstrate action slowly", "Encourage baby to try", "Celebrate when it works", "Provide variety"]',
'Let them experiment. Their persistence is learning.',
'["Pop-up toys", "Musical toys"]', 15, 'Anytime', 'cognitive', 6, 18, 1, 'schoolos_legacy'),

('ey_cog_003', 'Simple Puzzles', 'skill', 'Wisdom',
'Puzzles build spatial reasoning, persistence, and the satisfaction of solving problems. Start simple.',
'["Begin with pieces removed", "Point to empty spaces", "Let child try to fit pieces", "Offer hints about colors or shapes", "Complete together and celebrate"]',
'Let them struggle. The aha moment is the reward.',
'["2-4 piece wooden puzzle"]', 15, 'Anytime', 'cognitive', 18, 36, 1, 'schoolos_legacy'),

('ey_cog_004', 'Shape Matching', 'skill', 'Wisdom',
'Matching shapes to holes builds spatial reasoning and problem-solving. Expect trial and error.',
'["Present shape sorter", "Demonstrate one shape", "Let child explore freely", "Guide gently if frustrated", "Name shapes as they play"]',
'Resist solving it for them. Their struggle is productive.',
'["Shape sorter"]', 15, 'Anytime', 'cognitive', 12, 24, 1, 'schoolos_legacy'),

('ey_cog_005', 'Color Sorting', 'skill', 'Wisdom',
'Sorting by color builds categorization skills. Colors are often among the first attributes children can identify.',
'["Spread out colored objects", "Place one in each container to start", "Ask: can you find more red?", "Name colors together", "Mix and try again"]',
'Accept approximations. Blue-green is still learning.',
'["Colored blocks or toys", "Sorting containers"]', 15, 'Anytime', 'cognitive', 24, 36, 1, 'schoolos_legacy'),

('ey_cog_006', 'Counting Everyday Things', 'skill', 'Wisdom',
'Counting real objects builds number sense. Touch each item as you count. Count everything: stairs, grapes, toys.',
'["Count steps as you climb", "Count toys during cleanup", "Use fingers to show numbers", "Ask: how many?", "Count for real purposes"]',
'Slow down. Touch each item. Real counting takes time.',
'["Anything countable"]', 10, 'Anytime', 'cognitive', 24, 48, 1, 'schoolos_legacy'),

('ey_cog_007', 'Memory Card Games', 'skill', 'Wisdom',
'Finding matching pairs builds memory and concentration. Start with just a few pairs face up.',
'["Lay cards face down in grid", "Turn over two cards", "Look for matches", "Take turns", "Celebrate all found pairs"]',
'Play cooperatively at first. Winning is not the goal.',
'["Matching picture cards"]', 15, 'Anytime', 'cognitive', 30, 60, 1, 'schoolos_legacy'),

('ey_cog_008', 'Pattern Play', 'skill', 'Wisdom',
'Patterns teach prediction and logical thinking. Start with simple AB patterns: red-blue-red-blue.',
'["Create simple AB pattern", "Say pattern aloud: red, blue, red, blue", "Ask: what comes next?", "Let child continue", "Try new patterns"]',
'Patterns are everywhere. Point them out in daily life.',
'["Colored blocks or beads"]', 15, 'Anytime', 'cognitive', 30, 48, 1, 'schoolos_legacy'),

('ey_cog_009', 'Size Ordering', 'skill', 'Wisdom',
'Arranging by size builds comparison and seriation skills. Use real objects that matter to them.',
'["Present mixed-up sizes", "Find the biggest together", "Find the smallest", "Arrange in order", "Stack or nest if possible"]',
'Use everyday objects: shoes from small to big, cups nested.',
'["Nesting cups or different sized objects"]', 15, 'Anytime', 'cognitive', 24, 36, 1, 'schoolos_legacy'),

('ey_cog_010', 'Treasure Hunt', 'skill', 'Wisdom',
'Following a simple map builds spatial reasoning and symbol understanding. This is geography in miniature.',
'["Draw simple map of room", "Mark treasure with X", "Guide map reading", "Celebrate discovery", "Let child make maps too"]',
'Start simple. One room, clear landmarks.',
'["Simple hand-drawn map", "Hidden treasure"]', 20, 'Anytime', 'cognitive', 36, 48, 1, 'schoolos_legacy');

-- ============================================================================
-- LOVE (Social-Emotional) - 20 activities
-- ============================================================================

INSERT OR REPLACE INTO formations (
  id, title, formation_type, primary_virtue, description, guide_steps,
  parent_posture, materials, duration_minutes, context_anchor, cluster_tag,
  min_age_months, max_age_months, is_active, content_source
) VALUES

-- Infant Social-Emotional (0-12 months)
('ey_social_001', 'Face to Face', 'habit', 'Love',
'Eye contact and facial mirroring build attachment and emotional recognition. Your face is their first teacher of emotions.',
'["Hold baby at face level", "Make exaggerated expressions", "Smile and wait for response", "Mirror their expressions", "Talk softly"]',
'Be fully present. Put the phone down.',
'["No materials needed"]', 5, 'Anytime', 'social-emotional', 0, 6, 1, 'schoolos_legacy'),

('ey_social_002', 'Peek-a-Boo Play', 'skill', 'Love',
'Peek-a-boo builds anticipation, joy in interaction, and the understanding that you always come back.',
'["Cover your face briefly", "Say: peek-a-boo!", "Watch for anticipation", "Let baby try covering", "Add variations"]',
'The joy is in their face. Play as long as they want.',
'["Blanket or hands"]', 10, 'Anytime', 'social-emotional', 4, 18, 1, 'schoolos_legacy'),

('ey_social_003', 'Calming Together', 'habit', 'Love',
'Children learn to calm themselves by first being calmed by us. Co-regulation builds the neural pathways for self-regulation.',
'["Hold close when fussy", "Use soft voice", "Gentle rocking", "Deep breaths together", "Create calm environment"]',
'Stay calm yourself. They borrow your nervous system.',
'["Soft blanket", "Dim lighting"]', 10, 'Anytime', 'social-emotional', 0, 12, 1, 'schoolos_legacy'),

-- Toddler Social-Emotional (12-24 months)
('ey_social_004', 'Gentle Touch Practice', 'habit', 'Love',
'Teaching gentle touch through practice with toys prepares children for kind interactions with others.',
'["Model gentle touch", "Say: gentle hands", "Practice on stuffed toys first", "Praise kind behavior", "Redirect rough touches calmly"]',
'Show more than tell. Touch gently yourself.',
'["Soft toys", "Dolls"]', 15, 'Anytime', 'social-emotional', 12, 36, 1, 'schoolos_legacy'),

('ey_social_005', 'Naming Feelings', 'habit', 'Love',
'Children who can name feelings can better manage them. Emotional vocabulary grows through observation and gentle labeling.',
'["Name feelings as you see them: you look frustrated", "Validate all emotions", "Stay calm yourself", "Offer comfort", "Keep language simple"]',
'All feelings are acceptable. All behaviors are not.',
'["No materials needed"]', 10, 'Anytime', 'social-emotional', 12, 48, 1, 'schoolos_legacy'),

('ey_social_006', 'Saying Hello and Goodbye', 'habit', 'Love',
'Greeting practices build social conventions and smooth transitions. Make arrivals and departures gentle and predictable.',
'["Wave and say words at every transition", "Use puppets to model", "Make it a routine", "Praise attempts", "Keep it brief and warm"]',
'Consistency matters more than perfection.',
'["Puppets optional"]', 10, 'Anytime', 'social-emotional', 12, 30, 1, 'schoolos_legacy'),

-- Preschool Social-Emotional (24-48 months)
('ey_social_007', 'Turn Taking Games', 'habit', 'Love',
'Turn-taking is foundational to all cooperation. It is genuinely difficult for young children. Patient practice builds capacity.',
'["Say my turn, your turn clearly", "Keep turns short at first", "Use timer if helpful", "Celebrate waiting", "Model patience yourself"]',
'Stay close. Your presence helps them wait.',
'["Stacking toys or ball"]', 15, 'Anytime', 'social-emotional', 18, 48, 1, 'schoolos_legacy'),

('ey_social_008', 'Emotion Picture Cards', 'habit', 'Love',
'Matching faces to feelings builds emotional recognition. Understanding others emotions is the beginning of empathy.',
'["Show emotion face cards", "Name each feeling", "Make faces in mirror together", "Connect to their experiences: you felt sad when...", "Discuss book characters feelings"]',
'Wonder about feelings. Never test or quiz.',
'["Emotion cards", "Mirror"]', 15, 'Anytime', 'social-emotional', 24, 48, 1, 'schoolos_legacy'),

('ey_social_009', 'Calming Corner', 'habit', 'Love',
'A cozy space for calming down gives children a tool for managing big feelings. This is never punishment.',
'["Set up cozy space together", "Stock with calming items", "Practice using when calm", "Guide there when upset", "Model using it yourself"]',
'This is a gift, never a punishment.',
'["Soft pillows", "Comfort objects", "Books about feelings"]', 15, 'Anytime', 'social-emotional', 24, 48, 1, 'schoolos_legacy'),

('ey_social_010', 'Pretend Tea Party', 'skill', 'Love',
'Pretend social scenarios practice polite phrases and social scripts in a safe space.',
'["Set up tea party together", "Include stuffed guests", "Model please and thank you", "Take turns serving", "Follow their lead"]',
'Enter their world. Let them be the host.',
'["Tea set", "Stuffed animals"]', 20, 'Anytime', 'social-emotional', 24, 48, 1, 'schoolos_legacy'),

('ey_social_011', 'Helping Tasks', 'habit', 'Love',
'Children want to contribute. Including them in household tasks builds belonging and responsibility.',
'["Choose simple tasks together", "Work side by side", "Praise helping efforts", "Make it enjoyable", "Thank them genuinely"]',
'It will take longer. That is the point.',
'["Child-size tools", "Simple tasks"]', 15, 'Anytime', 'social-emotional', 18, 48, 1, 'schoolos_legacy'),

('ey_social_012', 'Waiting Games', 'habit', 'Love',
'Patience develops with practice. Start with very short waits and celebrate success at each stage.',
'["Start with 30-second waits", "Use visual timer", "Give something to do while waiting", "Celebrate successful waits", "Gradually increase time"]',
'Meet them where they are. Todays failure is tomorrows building block.',
'["Timer or song"]', 10, 'Anytime', 'social-emotional', 24, 48, 1, 'schoolos_legacy'),

-- Older Preschool Social-Emotional (36-60 months)
('ey_social_013', 'How Would They Feel?', 'habit', 'Love',
'Guessing how others might feel builds empathy and perspective-taking. Use stories and real situations.',
'["Read story together", "Ask: how do you think they feel?", "Discuss why they might feel that way", "Connect to child own experiences", "Praise empathy attempts"]',
'Wonder together. There is no wrong answer.',
'["Picture books", "Puppets"]', 15, 'Anytime', 'social-emotional', 36, 60, 1, 'schoolos_legacy'),

('ey_social_014', 'Friendship Practice', 'habit', 'Love',
'Being a good friend is a skill that can be practiced. Role-playing scenarios builds confidence for real situations.',
'["Act out friendship scenarios with puppets", "Practice kind words", "Show caring actions", "Discuss kind choices", "Apply to real situations"]',
'Focus on what to do, not what not to do.',
'["Puppets or dolls"]', 20, 'Anytime', 'social-emotional', 36, 60, 1, 'schoolos_legacy'),

('ey_social_015', 'Calming Breaths', 'habit', 'Love',
'Simple breathing exercises work when practiced regularly when calm. Then they become available when upset.',
'["Pretend to smell a flower, blow out a candle", "Blow pinwheels slowly", "Practice when calm", "Use during upset times", "Model yourself"]',
'Practice daily when calm. This builds the skill.',
'["Pinwheel or bubbles"]', 10, 'Anytime', 'social-emotional', 36, 60, 1, 'schoolos_legacy'),

('ey_social_016', 'Working It Out', 'habit', 'Love',
'Conflict resolution is a skill that develops with guidance. Scaffolding real conflicts builds real capacity.',
'["When conflict arises, stay close and calm", "Ask: what happened?", "Ask each child what they need", "Help them find a solution together", "Celebrate peaceful resolution"]',
'Coach from the side. Do not solve for them.',
'["Calm presence"]', 15, 'Anytime', 'social-emotional', 36, 60, 1, 'schoolos_legacy'),

('ey_social_017', 'Kindness Practice', 'habit', 'Love',
'Doing kind deeds for others builds empathy in action. Plan and do kind acts together.',
'["Think of someone who needs kindness", "Plan a kind act together", "Do it together", "Notice how it felt", "Notice kindness from others too"]',
'Kindness is practiced, not just taught.',
'["Materials for kind acts"]', 20, 'Anytime', 'social-emotional', 48, 60, 1, 'schoolos_legacy'),

('ey_social_018', 'Handling Disappointment', 'habit', 'Love',
'Coping with disappointment is a skill that develops with practice. Start with small disappointments.',
'["Name the feeling: you are disappointed", "Validate: that is hard", "Stay with them in the feeling", "Offer comfort not fixes", "Problem-solve if possible"]',
'Do not rush to fix. Sit in the feeling first.',
'["Calm presence"]', 10, 'Anytime', 'social-emotional', 48, 60, 1, 'schoolos_legacy'),

('ey_social_019', 'Group Game Practice', 'habit', 'Love',
'Playing games with rules builds turn-taking, patience, and gracious winning and losing.',
'["Start with simple games", "Model good sportsmanship", "Practice taking turns", "Handle winning: shake hands", "Handle losing: it is just a game"]',
'How you lose teaches more than how you win.',
'["Simple board or card games"]', 20, 'Anytime', 'social-emotional', 48, 60, 1, 'schoolos_legacy'),

('ey_social_020', 'Daily Gratitude', 'habit', 'Love',
'Naming good things trains our hearts to notice them. Regular practice builds a grateful disposition.',
'["At meals or bedtime, share something thankful", "Accept any answer", "Start with your own thanks", "Keep it warm, never forced", "Notice small things"]',
'Model genuine gratitude. Your practice teaches.',
'["No materials needed"]', 5, 'Meal_Table', 'social-emotional', 36, 60, 1, 'schoolos_legacy');

-- ============================================================================
-- ORDER (Pre-Academic/Foundations) - 20 activities  
-- ============================================================================

INSERT OR REPLACE INTO formations (
  id, title, formation_type, primary_virtue, description, guide_steps,
  parent_posture, materials, duration_minutes, context_anchor, cluster_tag,
  min_age_months, max_age_months, is_active, content_source
) VALUES

-- Sensory Foundations (0-24 months)
('ey_order_001', 'Texture Discovery', 'skill', 'Order',
'Exploring different textures builds tactile awareness and sensory vocabulary. Every texture teaches something new.',
'["Gather variety of textures", "Let baby touch each one", "Name the feeling: soft, bumpy, smooth", "Watch their reactions", "Follow their interest"]',
'Describe what they feel. Your words give them vocabulary.',
'["Various textured objects"]', 10, 'Anytime', 'sensory', 0, 12, 1, 'schoolos_legacy'),

('ey_order_002', 'Water Exploration', 'skill', 'Order',
'Water play teaches properties of liquids, cause and effect, and provides calming sensory input.',
'["Set up water station with containers", "Let child splash freely", "Add pouring toys", "Describe: wet, cold, splashy", "Supervise closely"]',
'Embrace the mess. Joy lives in water play.',
'["Basin", "Cups", "Safe for water space"]', 20, 'Anytime', 'sensory', 6, 48, 1, 'schoolos_legacy'),

('ey_order_003', 'Sound Discovery', 'skill', 'Order',
'Making and finding sounds builds auditory awareness. Babies learn that their actions create sounds.',
'["Shake rattles and bells", "Hide sound-making toy", "Ask: where is it?", "Make sounds together", "Notice sounds in environment"]',
'Listen together. The world is full of sounds.',
'["Rattles", "Musical toys"]', 10, 'Anytime', 'sensory', 3, 18, 1, 'schoolos_legacy'),

('ey_order_004', 'Sensory Bins', 'skill', 'Order',
'Digging and discovering in sensory materials builds tactile tolerance and fine motor skills. Hide treasures to find.',
'["Fill bin with rice, pasta, or beans", "Hide small toys inside", "Let child dig and explore", "Add scooping tools", "Supervise for safety with small items"]',
'Let them explore freely. Discovery is the goal.',
'["Bin with sensory material", "Hidden toys", "Scoops"]', 20, 'Anytime', 'sensory', 12, 48, 1, 'schoolos_legacy'),

-- Pre-Math (12-36 months)
('ey_order_005', 'Big and Little', 'skill', 'Order',
'Understanding size differences is foundational to measurement. Use real objects: big shoe, little shoe.',
'["Present big and little versions of same object", "Name: big, little", "Sort into groups", "Find big and little around the room", "Use in daily life"]',
'Point out size everywhere: big tree, little flower.',
'["Objects in two sizes"]', 15, 'Anytime', 'pre-academic', 12, 24, 1, 'schoolos_legacy'),

('ey_order_006', 'One and Two', 'skill', 'Order',
'Before counting many, children learn one and two. Use real objects they care about.',
'["Start with one: here is one block", "Add: now two blocks", "Practice with snacks: one cracker, two crackers", "Reinforce throughout day"]',
'One and two are concepts before they are numbers.',
'["Small toys or snacks"]', 10, 'Anytime', 'pre-academic', 18, 24, 1, 'schoolos_legacy'),

('ey_order_007', 'Simple Matching', 'skill', 'Order',
'Finding matches builds visual discrimination. Start with identical objects before picture matching.',
'["Show two identical items", "Find the match", "Start with 2-3 pairs", "Increase as mastered", "Use real objects before pictures"]',
'Accept their matches. Same and different are learned gradually.',
'["Pairs of identical objects"]', 15, 'Anytime', 'pre-academic', 12, 24, 1, 'schoolos_legacy'),

-- Pre-Literacy (24-48 months)
('ey_order_008', 'Name Letters', 'skill', 'Order',
'The letters in their name are the most meaningful letters. Start there before the whole alphabet.',
'["Start with their first letter", "Trace it in sand or paint", "Find it in books and signs", "Connect to their name: this is your letter!", "Add more gradually"]',
'Follow their interest. Forced learning backfires.',
'["Letter magnets or cards", "Sand tray"]', 10, 'Anytime', 'pre-academic', 36, 60, 1, 'schoolos_legacy'),

('ey_order_009', 'Simple Patterns', 'skill', 'Order',
'Patterns are foundational to math and reading. Start with AB patterns: red-blue-red-blue.',
'["Start pattern: red, blue, red, blue", "Say it aloud as you build", "Ask: what comes next?", "Let child continue", "Try with sounds: clap-stomp-clap-stomp"]',
'Patterns are everywhere. Find them in nature, music, daily life.',
'["Colored blocks or beads"]', 15, 'Anytime', 'pre-academic', 24, 48, 1, 'schoolos_legacy'),

('ey_order_010', 'Shape Hunt', 'skill', 'Order',
'Shapes live everywhere in our environment. Finding them builds observation and vocabulary.',
'["Learn a shape: circle", "Hunt for circles around the house or outside", "Name them: the wheel is a circle!", "Try new shapes weekly", "Make a shape collection"]',
'The world is full of shapes. Notice them together.',
'["Shape cards for reference"]', 15, 'Walk_By_The_Way', 'pre-academic', 24, 36, 1, 'schoolos_legacy'),

('ey_order_011', 'Counting to Five', 'skill', 'Order',
'Touch-counting up to five builds one-to-one correspondence. Touch each object as you count slowly.',
'["Count slowly, touching each object", "Start with just 3, build to 5", "Count everyday things: stairs, crackers", "Make it playful", "Ask: how many?"]',
'Touch each item. Slow counting is real counting.',
'["Small countable objects"]', 15, 'Anytime', 'pre-academic', 24, 36, 1, 'schoolos_legacy'),

-- School Readiness (36-60 months)
('ey_order_012', 'Name Writing', 'skill', 'Order',
'Writing their name is a major milestone. Start with tracing, build to independent writing over months.',
'["Write name large as model", "Trace together with finger first", "Try with thick crayons", "Start with just first letter", "Display their attempts proudly"]',
'Progress matters more than perfection. Celebrate wobbly letters.',
'["Thick crayons", "Paper", "Name model"]', 15, 'Anytime', 'pre-academic', 36, 60, 1, 'schoolos_legacy'),

('ey_order_013', 'Simple Graphing', 'skill', 'Order',
'Sorting and displaying builds data thinking. What colors are our blocks? Lets find out.',
'["Decide what to sort: colors, types", "Make columns for each category", "Place objects or draw marks", "Count each column", "Compare: which has more?"]',
'Real questions make graphing meaningful.',
'["Objects to sort", "Grid paper or floor space"]', 20, 'Anytime', 'pre-academic', 36, 48, 1, 'schoolos_legacy'),

('ey_order_014', 'Measuring Things', 'skill', 'Order',
'Measuring with non-standard units builds measurement concepts. How many blocks tall is teddy?',
'["Choose a unit: blocks", "Measure objects together", "Record numbers: teddy is 5 blocks tall", "Compare measurements", "Try different units"]',
'Real measuring answers real questions.',
'["Blocks or paper clips", "Things to measure"]', 20, 'Anytime', 'pre-academic', 36, 48, 1, 'schoolos_legacy'),

('ey_order_015', 'Number Recognition', 'skill', 'Order',
'Connecting number symbols to quantities prepares for arithmetic. See the 3, count 3 things.',
'["Match numeral cards to quantity", "Play number bingo", "Find numerals in environment", "Write numerals in sand", "Use dice in simple games"]',
'Numerals are everywhere: house numbers, prices, pages.',
'["Number cards", "Small objects"]', 15, 'Anytime', 'pre-academic', 48, 60, 1, 'schoolos_legacy'),

('ey_order_016', 'First Adding', 'skill', 'Order',
'Combining small groups introduces addition. Two blocks plus one more makes how many?',
'["Use story context: you have 2 cars, I give you 1 more", "Use objects to solve", "Count all together", "Use fingers sometimes", "Keep numbers small: 1-5"]',
'Stories make math real. Solve real problems.',
'["Small toys for counting"]', 15, 'Anytime', 'pre-academic', 48, 60, 1, 'schoolos_legacy'),

('ey_order_017', 'Letter Sounds', 'skill', 'Order',
'Connecting letters to sounds is foundational to reading. Use sounds (buh), not letter names (bee).',
'["Introduce sound first: this letter says buh", "Find objects that start with that sound", "Create letter with materials", "Point out in books", "Keep it playful"]',
'Sounds before names. This is the key.',
'["Letter cards", "Objects starting with letter"]', 20, 'Anytime', 'pre-academic', 48, 60, 1, 'schoolos_legacy'),

('ey_order_018', 'Nature Observation', 'skill', 'Order',
'Careful observation builds scientific thinking. Look closely. What do you notice?',
'["Collect safe natural items together", "Look closely with magnifying glass", "Describe what you notice", "Draw or photograph findings", "Wonder together about nature"]',
'Wonder is the beginning of science.',
'["Magnifying glass", "Nature items"]', 25, 'Walk_By_The_Way', 'pre-academic', 36, 60, 1, 'schoolos_legacy'),

('ey_order_019', 'First and Next', 'skill', 'Order',
'Sequencing builds narrative and time concepts. What happened first? What happened next?',
'["Use daily routines: first we wash hands, then we eat", "Retell simple stories in order", "Use sequence cards with 3 pictures", "Ask: what comes first? next? last?"]',
'Your daily routine is the best teaching material.',
'["Daily routines", "Optional sequence cards"]', 15, 'Anytime', 'pre-academic', 30, 48, 1, 'schoolos_legacy'),

('ey_order_020', 'Retelling Stories', 'skill', 'Order',
'Retelling in their own words shows comprehension and builds narrative skills. Accept their version.',
'["Read familiar story", "Close book and ask: can you tell it?", "Prompt: what happened first? then what?", "Use pictures as hints", "Celebrate their version"]',
'Their retelling reveals their understanding.',
'["Familiar picture book"]', 15, 'Bedside', 'pre-academic', 36, 60, 1, 'schoolos_legacy');

-- ============================================================================
-- WONDER (Spiritual/Charlotte Mason) - 8 activities
-- ============================================================================

INSERT OR REPLACE INTO formations (
  id, title, formation_type, primary_virtue, description, guide_steps,
  parent_posture, materials, duration_minutes, context_anchor, cluster_tag,
  min_age_months, max_age_months, is_active, content_source
) VALUES

('ey_wonder_001', 'Daily Outdoor Time', 'habit', 'Wonder',
'Unstructured outdoor time builds gross motor skills, nature awareness, and wonder at creation. Charlotte Mason called this "the mother of education."',
'["Go outside with no agenda", "Let them explore freely", "Notice what they notice", "Name plants, bugs, clouds together", "Be present, not directing"]',
'Put down your phone. Be with them in nature.',
'["Outdoor space"]', 60, 'Walk_By_The_Way', 'nature', 0, 72, 1, 'schoolos_legacy'),

('ey_wonder_002', 'Oral Narration', 'skill', 'Wonder',
'Telling back in their own words builds comprehension, expression, and the habit of attention. This Charlotte Mason practice is foundational.',
'["Read or tell a living story", "Ask: tell it back to me", "Listen without interrupting", "Accept their version", "Add details only if they ask"]',
'Listen more than you speak. Their words reveal their mind.',
'["Living book or story"]', 15, 'Anytime', 'language', 30, 72, 1, 'schoolos_legacy'),

('ey_wonder_003', 'Nature Collection', 'habit', 'Wonder',
'Collecting natural treasures teaches observation and builds connection to creation. God made both the child and the acorn.',
'["Take a collection bag on walks", "Let them choose what to collect", "Examine treasures together at home", "Wonder about what you found", "Start a nature table or box"]',
'Their treasures matter because they matter to them.',
'["Collection bag", "Place to keep treasures"]', 30, 'Walk_By_The_Way', 'nature', 18, 72, 1, 'schoolos_legacy'),

('ey_wonder_004', 'Picture Study', 'habit', 'Wonder',
'Looking at beautiful art trains the eye and heart. Choose one picture and look at it daily for a week.',
'["Choose one beautiful painting", "Display where child can see it", "Look together: what do you notice?", "Name what you see", "Live with it for a week before changing"]',
'Beauty forms the soul. Give them beautiful things to look at.',
'["Art print or book"]', 10, 'Morning_Circle', 'art', 36, 72, 1, 'schoolos_legacy'),

('ey_wonder_005', 'Music Listening', 'habit', 'Wonder',
'Listening to beautiful music trains the ear and heart. Play one composer or piece repeatedly.',
'["Choose beautiful classical or folk music", "Play during quiet activities", "Name the composer or piece", "Notice instruments together", "Let it become familiar"]',
'The ear is trained by exposure. Play beautiful music.',
'["Music player"]', 15, 'Anytime', 'music', 0, 72, 1, 'schoolos_legacy'),

('ey_wonder_006', 'Weather Watching', 'habit', 'Wonder',
'Noticing the weather builds observation and vocabulary. God sends the rain and sun.',
'["Check the weather together daily", "Name what you see: sunny, cloudy, rainy", "Feel the temperature: warm, cold", "Notice changes throughout day", "Keep simple weather record if interested"]',
'Wonder at the weather. It teaches patience and trust.',
'["Window or outdoor space"]', 5, 'Morning_Circle', 'nature', 18, 72, 1, 'schoolos_legacy'),

('ey_wonder_007', 'Mealtime Thanksgiving', 'habit', 'Wonder',
'Pausing before meals to give thanks builds gratitude and acknowledges God as giver. Even very young children can bow heads and fold hands.',
'["Pause before eating", "Fold hands or hold hands", "Pray simple thanks", "Same prayer is fine every time", "Let child eventually lead"]',
'Routine builds habit. The same prayer said daily forms the heart.',
'["No materials needed"]', 3, 'Meal_Table', 'liturgy', 0, 72, 1, 'schoolos_legacy'),

('ey_wonder_008', 'Bedtime Blessing', 'habit', 'Wonder',
'Ending the day with prayer and blessing gives children security and teaches them they are loved by God and you.',
'["End day with gentle routine", "Read or tell Bible story", "Pray together", "Bless child by name", "Sing a hymn if desired"]',
'The last voice they hear before sleep shapes them.',
'["Bible or story book"]', 15, 'Bedside', 'liturgy', 0, 72, 1, 'schoolos_legacy');

-- ============================================================================
-- Summary:
-- Total activities in this migration: 103
-- 
-- Distribution:
-- - STEWARDSHIP (Motor/Physical): 20 activities
-- - WISDOM (Language/Cognitive): 27 activities  
-- - LOVE (Social-Emotional): 20 activities
-- - ORDER (Pre-Academic): 20 activities
-- - WONDER (Spiritual/Charlotte Mason): 8 activities
-- ============================================================================
