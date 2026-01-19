-- Expanded Activities Database for Early Years (0-60 months)
-- Research sources: CDC Developmental Milestones, AAP Guidelines, Zero to Three, Harvard Center on Developing Child
-- Domain: cognitive, motor, language, social-emotional, pre-academic

-- ============================================================================
-- COGNITIVE ACTIVITIES (25 additional)
-- Focus: Problem-solving, memory, reasoning, attention, cause-effect
-- ============================================================================

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty) VALUES

-- 0-12 months (cognitive foundations)
('cognitive-011', 'Mirror Discovery', 'Explore reflections to develop self-awareness', 'cognitive', 3, 12, 10, '["Unbreakable mirror", "Colorful toys"]', '["Hold baby in front of mirror", "Point to baby reflection", "Make faces together", "Wave and watch reflection", "Touch the mirror gently"]', '["Self-recognition", "Visual tracking", "Cause and effect"]', 'beginner'),
('cognitive-012', 'Treasure Basket', 'Explore a collection of safe household objects', 'cognitive', 6, 12, 15, '["Basket", "Wooden spoon", "Metal cup", "Fabric scraps", "Natural sponge"]', '["Fill basket with safe objects", "Let baby explore freely", "Name objects as they touch", "Rotate items weekly", "Supervise closely"]', '["Sensory exploration", "Object properties", "Curiosity"]', 'beginner'),

-- 12-24 months (emerging problem-solving)
('cognitive-013', 'Container Fill and Dump', 'Practice putting objects in and taking them out', 'cognitive', 12, 24, 15, '["Large container", "Soft blocks", "Small toys"]', '["Show putting toys in container", "Dump them out together", "Count as you fill", "Try different containers", "Let child lead"]', '["Spatial concepts", "In/out understanding", "Motor planning"]', 'beginner'),
('cognitive-014', 'Simple Shape Matching', 'Match basic shapes like circles and squares', 'cognitive', 12, 24, 10, '["Shape puzzle board", "Shape cutouts"]', '["Present two shapes first", "Point to matching holes", "Guide hand if needed", "Celebrate matches", "Add more shapes gradually"]', '["Shape recognition", "Visual discrimination", "Problem-solving"]', 'beginner'),
('cognitive-015', 'Hidden Sound Game', 'Find where sounds are coming from', 'cognitive', 12, 24, 10, '["Musical toy", "Blanket or box to hide under"]', '["Hide musical toy nearby", "Activate the sound", "Ask where is it?", "Celebrate when found", "Increase difficulty gradually"]', '["Sound localization", "Problem-solving", "Persistence"]', 'intermediate'),

-- 24-36 months (growing logic)
('cognitive-016', 'Matching Pairs Game', 'Find objects that go together', 'cognitive', 24, 36, 15, '["Paired objects: sock pairs, shoe pairs", "Sorting mat"]', '["Show how items match", "Mix items up", "Ask child to find pairs", "Name matches together", "Add more pairs over time"]', '["Pairing concepts", "Memory", "Classification"]', 'intermediate'),
('cognitive-017', 'Simple Sequencing', 'Put picture cards in order', 'cognitive', 24, 36, 15, '["3-step sequence cards", "Flat surface"]', '["Show completed sequence first", "Mix up cards", "What happens first?", "Build story together", "Try new sequences"]', '["Sequential thinking", "Narrative skills", "Logic"]', 'intermediate'),
('cognitive-018', 'Building Instructions', 'Follow simple steps to build something', 'cognitive', 24, 36, 20, '["Large blocks", "Picture guide", "Model to copy"]', '["Show finished structure", "Build step by step together", "Let child try independently", "Celebrate completion", "Try variations"]', '["Following directions", "Spatial reasoning", "Persistence"]', 'intermediate'),

-- 36-48 months (complex thinking)
('cognitive-019', 'Treasure Map Hunt', 'Follow simple map directions to find hidden items', 'cognitive', 36, 48, 20, '["Simple hand-drawn map", "Hidden treasure", "Landmarks"]', '["Draw simple room map", "Mark treasure spot with X", "Guide map reading", "Celebrate discovery", "Let child make maps"]', '["Spatial reasoning", "Symbol understanding", "Problem-solving"]', 'advanced'),
('cognitive-020', 'What Comes Next?', 'Predict what happens next in stories or activities', 'cognitive', 36, 48, 15, '["Familiar storybooks", "Sequence pictures"]', '["Pause during familiar stories", "What do you think happens?", "Accept all predictions", "Discuss actual outcomes", "Apply to real life"]', '["Prediction skills", "Critical thinking", "Story comprehension"]', 'advanced'),
('cognitive-021', 'Problem-Solving Play', 'Think through solutions to simple challenges', 'cognitive', 36, 48, 20, '["Blocks", "Toy cars", "Ramps and obstacles"]', '["Set up a challenge: get car across", "Ask how can we do it?", "Try child solutions", "Discuss what worked", "Create new challenges"]', '["Critical thinking", "Trial and error", "Persistence"]', 'advanced'),

-- 48-60 months (school readiness)
('cognitive-022', 'Classification Games', 'Sort objects by multiple attributes', 'cognitive', 48, 60, 20, '["Various small objects", "Sorting containers", "Attribute cards"]', '["Sort by color first", "Try sorting by size", "Sort by both attributes", "Explain sorting choices", "Create own categories"]', '["Multiple classification", "Logical reasoning", "Verbal explanation"]', 'advanced'),
('cognitive-023', 'Memory Challenge', 'Remember and recall increasing information', 'cognitive', 48, 60, 15, '["Memory card sets", "Objects to memorize"]', '["Start with 4-6 cards", "Take turns finding pairs", "Increase difficulty", "Discuss memory strategies", "Celebrate improvements"]', '["Working memory", "Concentration", "Strategy development"]', 'advanced'),
('cognitive-024', 'Simple Experiments', 'Make predictions and test them', 'cognitive', 48, 60, 25, '["Safe experiment materials", "Recording paper"]', '["What do you think will happen?", "Let child test prediction", "Observe together", "Was prediction correct?", "Try new experiments"]', '["Scientific thinking", "Observation", "Hypothesis testing"]', 'advanced'),
('cognitive-025', 'Story Problems', 'Solve simple word problems together', 'cognitive', 48, 60, 15, '["Small toys for counting", "Story prompts"]', '["Tell simple story problem", "Use toys to act it out", "Find the answer together", "Explain thinking", "Create own problems"]', '["Mathematical reasoning", "Problem representation", "Verbal math"]', 'advanced');


-- ============================================================================
-- MOTOR ACTIVITIES (25 additional)
-- Focus: Gross motor, fine motor, coordination, balance, strength
-- ============================================================================

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty) VALUES

-- 0-12 months (foundational movement)
('motor-011', 'Side-Lying Play', 'Practice movements while lying on side', 'motor', 0, 6, 10, '["Rolled blanket for support", "Interesting toys"]', '["Position baby on side with support", "Place toys within reach", "Encourage swipes and reaches", "Switch sides regularly", "Keep sessions short"]', '["Side muscle development", "Reaching skills", "Body awareness"]', 'beginner'),
('motor-012', 'Supported Sitting', 'Practice sitting with assistance', 'motor', 4, 9, 10, '["Boppy or support pillow", "Toys for lap"]', '["Provide support around hips", "Offer toys to hold", "Gradually reduce support", "Catch when tipping", "Build sitting time slowly"]', '["Core strength", "Balance", "Trunk control"]', 'beginner'),
('motor-013', 'Cruising Practice', 'Move along furniture while standing', 'motor', 8, 14, 15, '["Stable furniture at right height", "Motivating toys"]', '["Place toys along furniture", "Encourage stepping sideways", "Stay nearby for safety", "Celebrate progress", "Clear obstacles"]', '["Leg strength", "Balance", "Pre-walking skills"]', 'intermediate'),

-- 12-24 months (mobile toddler)
('motor-014', 'Push and Pull Toys', 'Walk while pushing or pulling toys', 'motor', 12, 24, 15, '["Push cart", "Pull-along toy on string"]', '["Start with push toys", "Progress to pull toys", "Encourage varied routes", "Add obstacles to navigate", "Race together sometimes"]', '["Walking stability", "Motor planning", "Coordination"]', 'beginner'),
('motor-015', 'Outdoor Exploration Walk', 'Navigate uneven outdoor surfaces', 'motor', 12, 24, 20, '["Safe outdoor space", "Comfortable shoes"]', '["Walk on grass", "Try walking on slight slopes", "Step over small objects", "Navigate around obstacles", "Go at child pace"]', '["Balance", "Varied surface navigation", "Gross motor"]', 'intermediate'),
('motor-016', 'Crayon Grip Practice', 'Develop proper writing grip through drawing', 'motor', 18, 24, 15, '["Thick crayons or triangular crayons", "Large paper", "Tape"]', '["Offer thick crayons", "Model proper grip gently", "Let child explore", "Focus on process not product", "Praise attempts"]', '["Grip development", "Pre-writing skills", "Hand strength"]', 'beginner'),

-- 24-36 months (coordination development)
('motor-017', 'Obstacle Course', 'Navigate through a simple course', 'motor', 24, 36, 20, '["Cushions", "Tunnel", "Stepping stones", "Hoop"]', '["Create simple course", "Demonstrate each section", "Guide through first time", "Add challenges gradually", "Celebrate completion"]', '["Motor planning", "Gross motor integration", "Body awareness"]', 'intermediate'),
('motor-018', 'Scissors Introduction', 'Learn to snip with safety scissors', 'motor', 24, 36, 15, '["Safety scissors", "Paper strips", "Playdough"]', '["Start with playdough cutting", "Progress to paper strips", "Focus on hand position", "Short sessions only", "Celebrate snips"]', '["Fine motor precision", "Hand strength", "Coordination"]', 'intermediate'),
('motor-019', 'Kicking Practice', 'Kick large balls toward targets', 'motor', 24, 36, 15, '["Large soft ball", "Cones or targets"]', '["Start with stationary ball", "Demonstrate kicking motion", "Set up easy targets", "Celebrate all attempts", "Vary distances"]', '["Leg coordination", "Balance", "Force control"]', 'intermediate'),

-- 36-48 months (refined skills)
('motor-020', 'Tricycle Riding', 'Pedal and steer a tricycle', 'motor', 36, 48, 20, '["Appropriately sized tricycle", "Safe riding area", "Helmet"]', '["Start on flat surface", "Practice pedaling motion", "Add steering gradually", "Set simple courses", "Always use helmet"]', '["Pedaling coordination", "Steering", "Spatial awareness"]', 'intermediate'),
('motor-021', 'Ball Throwing and Catching', 'Practice throwing and catching skills', 'motor', 36, 48, 15, '["Soft balls of various sizes", "Bucket for targets"]', '["Start with underhand throws", "Practice catching large balls", "Use bean bags first", "Gradually increase distance", "Make it a game"]', '["Hand-eye coordination", "Timing", "Motor planning"]', 'intermediate'),
('motor-022', 'Buttoning Practice', 'Button and unbutton large buttons', 'motor', 36, 48, 15, '["Busy board with buttons", "Large button clothing", "Button snake toy"]', '["Start with unbuttoning", "Use large buttons first", "Work on flat surface first", "Progress to own clothes", "Celebrate independence"]', '["Fine motor precision", "Self-care skills", "Independence"]', 'intermediate'),

-- 48-60 months (school readiness skills)
('motor-023', 'Skipping and Hopping', 'Master skipping and single-foot hopping', 'motor', 48, 60, 15, '["Open space", "Music optional", "Chalk for markers"]', '["Practice hopping on one foot", "Try galloping first", "Progress to skipping", "Use music for rhythm", "Practice both feet"]', '["Balance", "Coordination", "Rhythm"]', 'advanced'),
('motor-024', 'Cutting Shapes', 'Cut along curved and straight lines', 'motor', 48, 60, 15, '["Child scissors", "Paper with lines and shapes", "Templates"]', '["Start with straight lines", "Progress to curves", "Try simple shapes", "Focus on control not speed", "Display finished work"]', '["Precision cutting", "Hand control", "Visual tracking"]', 'advanced'),
('motor-025', 'Letter Formation', 'Practice forming letters and numbers', 'motor', 48, 60, 20, '["Sand tray", "Finger paint", "Large paper", "Markers"]', '["Start with finger tracing", "Form in sand or paint", "Progress to paper", "Focus on important letters first", "Keep it playful"]', '["Letter formation", "Pre-writing skills", "Visual-motor integration"]', 'advanced');


-- ============================================================================
-- LANGUAGE ACTIVITIES (25 additional)
-- Focus: Vocabulary, comprehension, expressive language, phonological awareness
-- ============================================================================

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty) VALUES

-- 0-12 months (foundation)
('language-011', 'Responsive Cooing', 'Have back-and-forth vocal exchanges', 'language', 0, 6, 10, '["No materials needed"]', '["Wait for baby sounds", "Respond with similar sounds", "Add varied tones", "Pause and wait for reply", "Smile and engage"]', '["Turn-taking", "Vocal practice", "Social communication"]', 'beginner'),
('language-012', 'Sound Effects Play', 'Make sounds for objects and actions', 'language', 6, 12, 10, '["Toy vehicles", "Animal toys", "Action books"]', '["Make sounds for actions: vroom, splash", "Repeat consistently", "Encourage imitation", "Pair with actions", "Use during daily routines"]', '["Sound-object association", "Imitation", "Vocabulary exposure"]', 'beginner'),

-- 12-24 months (first words explosion)
('language-013', 'First Words Books', 'Point and name simple pictures', 'language', 12, 24, 15, '["Simple picture books", "Word cards"]', '["Point to pictures", "Name clearly", "Wait for attempts", "Expand on child words", "Revisit favorites often"]', '["Vocabulary building", "Word-object connection", "Pointing skills"]', 'beginner'),
('language-014', 'Action Word Games', 'Learn verbs through movement', 'language', 12, 24, 15, '["Open space", "Action picture cards"]', '["Say and do: jump, clap, spin", "Invite child to copy", "Name actions child does", "Use in songs", "Practice throughout day"]', '["Action vocabulary", "Word-action connection", "Comprehension"]', 'beginner'),
('language-015', 'What Sound Does It Make?', 'Learn animal and vehicle sounds', 'language', 12, 24, 10, '["Animal toys", "Sound books", "Vehicle toys"]', '["Present one animal", "Make its sound", "Ask what does cow say?", "Accept approximations", "Use in songs and stories"]', '["Sound vocabulary", "Question answering", "Imitation"]', 'beginner'),

-- 24-36 months (sentence building)
('language-016', 'Expanding Sentences', 'Build on single words to phrases', 'language', 24, 36, 15, '["Toys for play", "Daily activities"]', '["Listen for child words", "Repeat and add words: Ball becomes Big red ball", "Model complete sentences", "Avoid correcting directly", "Celebrate communication"]', '["Sentence length", "Grammar exposure", "Vocabulary"]', 'intermediate'),
('language-017', 'Puppet Conversations', 'Practice dialogue with puppets', 'language', 24, 36, 15, '["Puppets or sock puppets", "Props for scenarios"]', '["Give puppet a voice", "Have puppet ask questions", "Let child respond", "Create simple dialogues", "Act out daily situations"]', '["Dialogue skills", "Creativity", "Social language"]', 'intermediate'),
('language-018', 'Category Naming', 'Name items within categories', 'language', 24, 36, 15, '["Category sorting items", "Picture cards"]', '["Name a category: foods", "List items together", "Take turns adding items", "Try new categories", "Make a game of it"]', '["Category vocabulary", "Word retrieval", "Classification"]', 'intermediate'),

-- 36-48 months (narrative skills)
('language-019', 'Story Retelling', 'Retell familiar stories', 'language', 36, 48, 20, '["Favorite storybooks", "Story props"]', '["Read familiar story", "Ask child to tell it back", "Use props as prompts", "Accept child version", "Fill in missing parts together"]', '["Narrative skills", "Sequencing", "Memory"]', 'intermediate'),
('language-020', 'Rhyming Games', 'Find and make rhyming words', 'language', 36, 48, 15, '["Rhyming word cards", "Rhyming books"]', '["Say word pairs: cat-hat", "Ask if they rhyme", "Play rhyme matching", "Make up silly rhymes", "Read rhyming books"]', '["Phonological awareness", "Sound patterns", "Literacy foundation"]', 'intermediate'),
('language-021', 'Question Practice', 'Ask and answer who/what/where/when/why', 'language', 36, 48, 15, '["Picture books", "Story scenes"]', '["Look at pictures together", "Ask WH questions", "Model complete answers", "Let child ask questions too", "Discuss throughout day"]', '["Question comprehension", "Complete answers", "Conversation skills"]', 'intermediate'),

-- 48-60 months (literacy foundation)
('language-022', 'First Sound Identification', 'Identify beginning sounds in words', 'language', 48, 60, 15, '["Picture cards", "Sound sorting mats"]', '["Say word emphasizing first sound: BBBall", "Ask what sound starts ball?", "Sort pictures by first sound", "Make it a game", "Connect to letter names"]', '["Phonemic awareness", "Sound isolation", "Literacy readiness"]', 'advanced'),
('language-023', 'Making Up Stories', 'Create original stories', 'language', 48, 60, 20, '["Story starter cards", "Character toys", "Drawing materials"]', '["Offer story starter", "Ask what happens next?", "Add to child ideas", "Encourage creativity", "Write down or record stories"]', '["Narrative creation", "Imagination", "Language structure"]', 'advanced'),
('language-024', 'Following Multi-Step Directions', 'Complete 3-4 step instructions', 'language', 48, 60, 15, '["Varied objects", "Activity supplies"]', '["Give clear multi-step directions", "Start with 2 steps, build up", "Avoid repeating", "Praise completion", "Make it a helpful game"]', '["Auditory memory", "Following directions", "Sequential processing"]', 'advanced'),
('language-025', 'Print Awareness Activities', 'Notice letters and words everywhere', 'language', 48, 60, 15, '["Environmental print", "Signs", "Labels", "Books"]', '["Point out words on signs", "Find letters in names", "Read labels together", "Play I Spy with letters", "Connect to child experience"]', '["Print concepts", "Letter recognition", "Reading readiness"]', 'advanced');


-- ============================================================================
-- SOCIAL-EMOTIONAL ACTIVITIES (25 additional)
-- Focus: Self-regulation, empathy, relationships, self-awareness, coping
-- ============================================================================

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty) VALUES

-- 0-12 months (attachment foundation)
('social-011', 'Calm Down Together', 'Model calming strategies for baby', 'social-emotional', 0, 12, 10, '["Soft blanket", "Gentle music", "Dim lighting"]', '["Hold baby close when fussy", "Use soft voice", "Gentle rocking", "Deep breaths together", "Create calm environment"]', '["Co-regulation", "Attachment", "Calming strategies"]', 'beginner'),
('social-012', 'Interactive Games', 'Play simple social games', 'social-emotional', 6, 12, 10, '["No materials needed"]', '["Play patty-cake", "Do where are your toes games", "Play simple finger games", "Sing interactive songs", "Follow baby lead"]', '["Social interaction", "Anticipation", "Joy in connection"]', 'beginner'),

-- 12-24 months (emerging autonomy)
('social-013', 'Big Feelings Naming', 'Name emotions as child experiences them', 'social-emotional', 12, 24, 10, '["Emotion picture cards optional"]', '["Name feelings: You look frustrated", "Validate all emotions", "Stay calm yourself", "Offer comfort", "Keep language simple"]', '["Emotion vocabulary", "Feeling validated", "Co-regulation"]', 'beginner'),
('social-014', 'Parallel Play Practice', 'Play alongside without pressure to share', 'social-emotional', 12, 24, 15, '["Duplicate toys if possible", "Same activity materials"]', '["Sit near child", "Do same activity nearby", "Comment on both play", "Later start brief interactions", "Follow child comfort level"]', '["Play alongside others", "Social comfort", "Early peer skills"]', 'beginner'),
('social-015', 'Daily Routine Practice', 'Participate in predictable daily routines', 'social-emotional', 12, 24, 15, '["Visual schedule cards optional", "Routine items"]', '["Keep routines consistent", "Narrate what comes next", "Give small jobs in routine", "Celebrate participation", "Use transition songs"]', '["Security", "Predictability", "Participation"]', 'beginner'),

-- 24-36 months (developing self-control)
('social-016', 'Calm Corner Setup', 'Create a cozy spot for calming', 'social-emotional', 24, 36, 15, '["Soft pillows or beanbag", "Calm toys", "Books about feelings"]', '["Set up cozy space together", "Stock with calming items", "Practice using when calm", "Guide there when upset", "Model using it yourself"]', '["Self-calming space", "Emotion regulation", "Independence"]', 'intermediate'),
('social-017', 'Feelings Faces', 'Match expressions to emotions', 'social-emotional', 24, 36, 15, '["Emotion face cards", "Mirror", "Play dough faces"]', '["Show emotion faces", "Name the feeling", "Make faces in mirror", "Create with playdough", "Connect to experiences"]', '["Emotion recognition", "Facial expressions", "Self-awareness"]', 'intermediate'),
('social-018', 'Waiting Practice Games', 'Practice short waits in fun ways', 'social-emotional', 24, 36, 10, '["Timer or song", "Surprise to wait for"]', '["Use short waits first", "Make waiting a game", "Use timer or song", "Celebrate successful waits", "Gradually increase time"]', '["Impulse control", "Patience", "Delayed gratification"]', 'intermediate'),

-- 36-48 months (perspective taking)
('social-019', 'How Would They Feel?', 'Guess how others might feel', 'social-emotional', 36, 48, 15, '["Picture books", "Story scenarios", "Puppets"]', '["Read story together", "Ask how character feels", "Discuss why they might feel that way", "Connect to child experiences", "Praise empathy attempts"]', '["Empathy", "Perspective taking", "Theory of mind"]', 'intermediate'),
('social-020', 'Friendly Behavior Practice', 'Role-play being a good friend', 'social-emotional', 36, 48, 20, '["Puppets or dolls", "Friendship scenario cards"]', '["Act out friendship scenarios", "Practice nice words", "Show caring actions", "Discuss kind choices", "Apply to real situations"]', '["Friendship skills", "Kind behavior", "Social problem-solving"]', 'intermediate'),
('social-021', 'Breathing Exercises', 'Learn simple calming breaths', 'social-emotional', 36, 48, 10, '["Pinwheel", "Bubble wand", "Feather"]', '["Blow pinwheels slowly", "Pretend to smell flower, blow candle", "Practice when calm", "Use during upset times", "Model yourself"]', '["Self-regulation", "Calming strategy", "Body awareness"]', 'intermediate'),

-- 48-60 months (complex social skills)
('social-022', 'Conflict Resolution Practice', 'Work through disagreements peacefully', 'social-emotional', 48, 60, 20, '["Problem-solving steps poster", "Feelings cards", "Puppet scenarios"]', '["Teach stop, think, act", "Use visual reminder", "Practice with puppets first", "Guide real conflicts", "Celebrate peaceful solutions"]', '["Conflict resolution", "Problem-solving", "Self-advocacy"]', 'advanced'),
('social-023', 'Kindness Missions', 'Do kind deeds for others', 'social-emotional', 48, 60, 20, '["Kindness cards", "Materials for kind acts"]', '["Plan a kind act together", "Help child prepare", "Do the kind deed", "Discuss how it felt", "Notice kindness from others"]', '["Kindness", "Empathy in action", "Community"]', 'advanced'),
('social-024', 'Managing Disappointment', 'Cope when things do not go as planned', 'social-emotional', 48, 60, 15, '["Calm down strategies cards", "Comfort items"]', '["Acknowledge the disappointment", "Validate feelings", "Offer coping strategies", "Problem-solve if possible", "Practice with small disappointments"]', '["Coping skills", "Resilience", "Emotional regulation"]', 'advanced'),
('social-025', 'Group Game Skills', 'Practice taking turns and following rules', 'social-emotional', 48, 60, 20, '["Simple board games", "Card games", "Group activity supplies"]', '["Start with simple games", "Model good sportsmanship", "Practice waiting for turn", "Handle winning and losing", "Emphasize fun together"]', '["Turn-taking", "Rule following", "Sportsmanship"]', 'advanced');


-- ============================================================================
-- PRE-ACADEMIC ACTIVITIES (25 additional)
-- Focus: Pre-math, pre-literacy, patterns, sorting, scientific thinking
-- ============================================================================

INSERT INTO activities (id, title, description, domain, min_age_months, max_age_months, duration_minutes, materials, instructions, learning_outcomes, difficulty) VALUES

-- 0-12 months (sensory foundations)
('preacademic-001', 'High Contrast Cards', 'Develop visual focus with black and white patterns', 'pre-academic', 0, 6, 10, '["Black and white pattern cards", "Card holder optional"]', '["Show cards 8-12 inches away", "Move slowly side to side", "Talk about what baby sees", "Switch cards when interested", "Use during tummy time too"]', '["Visual development", "Focus", "Pattern recognition beginnings"]', 'beginner'),
('preacademic-002', 'Cause Effect Exploration', 'Discover that actions make things happen', 'pre-academic', 6, 12, 15, '["Light-up toys", "Music makers", "Rattles"]', '["Show button press makes sound", "Encourage baby to try", "Celebrate when they do it", "Offer variety of cause-effect toys", "Narrate what happens"]', '["Cause and effect", "Agency", "Exploration"]', 'beginner'),

-- 12-24 months (early concepts)
('preacademic-003', 'Big and Little', 'Sort objects by size', 'pre-academic', 12, 24, 15, '["Objects in two sizes", "Containers in two sizes"]', '["Present big and little versions", "Name big and little", "Sort into containers", "Find big and little around room", "Use in daily life"]', '["Size concepts", "Comparison", "Vocabulary"]', 'beginner'),
('preacademic-004', 'One and Two', 'Understand quantities of one and two', 'pre-academic', 18, 24, 10, '["Small toys", "Snacks for counting"]', '["Start with one: here is one ball", "Add another: now two balls", "Practice with snacks", "Use in daily routines", "Reinforce often"]', '["Number concepts", "One-to-one correspondence beginnings", "Quantity"]', 'beginner'),
('preacademic-005', 'Simple Matching', 'Match identical objects', 'pre-academic', 12, 24, 15, '["Pairs of identical objects", "Matching cards"]', '["Show two identical items", "Find the match", "Start with 2-3 pairs", "Increase as mastered", "Use real objects first"]', '["Matching skills", "Visual discrimination", "Attention"]', 'beginner'),

-- 24-36 months (growing concepts)
('preacademic-006', 'AB Pattern Making', 'Create and extend simple patterns', 'pre-academic', 24, 36, 15, '["Colored blocks", "Pattern strips", "Beads"]', '["Start pattern: red blue red blue", "Say pattern aloud", "What comes next?", "Let child continue", "Create own patterns"]', '["Pattern recognition", "Prediction", "Sequencing"]', 'intermediate'),
('preacademic-007', 'Counting to Five', 'Count objects up to five', 'pre-academic', 24, 36, 15, '["Small countable objects", "Number cards"]', '["Count slowly touching each object", "Start with 3, build to 5", "Count everyday things", "Make it playful", "Correct gently if skipping"]', '["Counting", "Number sequence", "One-to-one correspondence"]', 'intermediate'),
('preacademic-008', 'Shape Hunt', 'Find shapes in the environment', 'pre-academic', 24, 36, 15, '["Shape cards for reference", "Environment to explore"]', '["Review target shape", "Hunt for shapes inside or outside", "Point and name found shapes", "Check guesses with card", "Try different shapes"]', '["Shape recognition", "Observation", "Vocabulary"]', 'intermediate'),

-- 36-48 months (pre-math and literacy)
('preacademic-009', 'Graphing Activities', 'Sort and display data visually', 'pre-academic', 36, 48, 20, '["Objects to sort", "Grid paper", "Colored stickers"]', '["Decide what to sort", "Make columns for each type", "Place objects or stickers", "Count each column", "Compare: which has more?"]', '["Data representation", "Comparison", "Counting"]', 'intermediate'),
('preacademic-010', 'Name Writing Practice', 'Work toward writing own name', 'pre-academic', 36, 48, 15, '["Name cards", "Sand tray", "Large markers", "Paper"]', '["Practice letters in name", "Start with first letter", "Use multi-sensory approaches", "Keep it fun not pressured", "Write name often for child to see"]', '["Name recognition", "Letter formation", "Personal identity"]', 'intermediate'),
('preacademic-011', 'Simple Measuring', 'Use non-standard units to measure', 'pre-academic', 36, 48, 20, '["Paper clips", "Blocks", "String", "Things to measure"]', '["Choose unit: blocks", "Measure objects together", "Record number of blocks", "Compare measurements", "Try different units"]', '["Measurement concepts", "Comparison", "Number use"]', 'intermediate'),

-- 48-60 months (school readiness)
('preacademic-012', 'Number Recognition Games', 'Recognize numerals 1-10', 'pre-academic', 48, 60, 15, '["Number cards", "Number puzzles", "Numeral dice"]', '["Match numeral to quantity", "Play number bingo", "Find numbers in environment", "Write numerals in sand", "Use dice for games"]', '["Numeral recognition", "Number-quantity connection", "Math readiness"]', 'advanced'),
('preacademic-013', 'Beginning Addition', 'Combine small groups', 'pre-academic', 48, 60, 15, '["Small toys for counting", "Story problems"]', '["Start with stories: 2 cars and 1 more", "Use objects to demonstrate", "Count all together", "Use fingers sometimes", "Keep numbers small 1-5"]', '["Addition concepts", "Number operations", "Problem representation"]', 'advanced'),
('preacademic-014', 'Letter of the Week', 'Focus on one letter at a time', 'pre-academic', 48, 60, 20, '["Letter cards", "Objects starting with letter", "Craft supplies"]', '["Introduce letter name and sound", "Find objects starting with it", "Create letter with materials", "Point out in books", "Avoid drilling"]', '["Letter-sound connection", "Phonics foundations", "Letter recognition"]', 'advanced'),
('preacademic-015', 'Science Exploration', 'Observe and describe natural phenomena', 'pre-academic', 48, 60, 25, '["Magnifying glass", "Natural objects", "Recording materials"]', '["Collect safe natural items", "Observe closely together", "Describe what you notice", "Draw or photograph findings", "Wonder together about nature"]', '["Scientific observation", "Descriptive language", "Nature awareness"]', 'advanced');
