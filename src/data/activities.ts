import { LegacyStaticActivity as Activity, EarlyYearsDomain } from '@/types';

// ============================================
// Early Years Activity Seed Data
// 30-50 activities across 5 domains
// ============================================

export const ACTIVITIES: Activity[] = [
  // ============================================
  // MOTOR DOMAIN (10 activities)
  // ============================================
  {
    id: 'motor-001',
    title: 'Bubble Pop Dance',
    description: 'Pop imaginary bubbles while moving to music, developing gross motor coordination.',
    domain: 'motor',
    minAgeMonths: 24,
    maxAgeMonths: 48,
    difficultyLevel: 1,
    estimatedMinutes: 10,
    materials: ['Music player', 'Open space'],
    instructions: [
      'Play upbeat music and ask your child to imagine bubbles floating around them.',
      'Encourage them to pop bubbles above their head, down low, and all around.',
      'Add challenges like "pop only the blue bubbles" or "pop with your elbow".',
      'End with slow music and gentle movements.'
    ],
    successIndicators: [
      'Moves body in different directions',
      'Follows simple movement instructions',
      'Shows enjoyment and engagement'
    ],
    easierVariation: 'Use real bubbles and let child pop them while sitting.',
    harderVariation: 'Add counting: "Pop 5 bubbles, then freeze!"',
    tips: ['Keep the activity short if child loses interest', 'Join in to model movements']
  },
  {
    id: 'motor-002',
    title: 'Playdough Shapes',
    description: 'Roll, squeeze, and mold playdough to strengthen fine motor muscles.',
    domain: 'motor',
    minAgeMonths: 24,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 15,
    materials: ['Playdough', 'Rolling pin (optional)', 'Cookie cutters (optional)'],
    instructions: [
      'Sit together at a table with playdough.',
      'Show your child how to roll snakes, balls, and flat pancakes.',
      'Let them explore freely, then suggest making a simple shape like a snowman.',
      'Talk about what they\'re creating and praise their efforts.'
    ],
    successIndicators: [
      'Uses both hands to manipulate dough',
      'Creates recognizable shapes',
      'Sustains focus for several minutes'
    ],
    easierVariation: 'Focus just on squeezing and poking the dough.',
    harderVariation: 'Create a scene with multiple elements like a garden with flowers.',
    tips: ['Homemade playdough works great', 'Add texture tools like forks or combs']
  },
  {
    id: 'motor-003',
    title: 'Obstacle Course Adventure',
    description: 'Navigate through a simple indoor obstacle course to develop coordination and balance.',
    domain: 'motor',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 3,
    estimatedMinutes: 15,
    materials: ['Cushions', 'Chairs', 'Tape or string', 'Soft toys for markers'],
    instructions: [
      'Create a simple path using cushions to jump on, chairs to crawl under.',
      'Walk through the course first, explaining each station.',
      'Let your child try it independently, offering encouragement.',
      'Time them on repeat tries if they enjoy the challenge.'
    ],
    successIndicators: [
      'Completes course with minimal assistance',
      'Shows improved coordination over multiple tries',
      'Remembers sequence of obstacles'
    ],
    easierVariation: 'Use only 2-3 simple obstacles, stay close for support.',
    harderVariation: 'Add balancing on one foot or carrying an object through.',
    tips: ['Safety first - ensure soft landing areas', 'Let child help set up the course']
  },
  {
    id: 'motor-004',
    title: 'Threading Beads',
    description: 'Thread large beads onto string to develop hand-eye coordination and pincer grip.',
    domain: 'motor',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Large wooden or plastic beads', 'Thick string or shoelace'],
    instructions: [
      'Demonstrate threading one bead onto the string slowly.',
      'Hand the string and a bead to your child, guiding their hands if needed.',
      'Encourage them to create a pattern or just fill the string.',
      'Celebrate completed necklaces or bracelets.'
    ],
    successIndicators: [
      'Threads beads independently',
      'Uses pincer grip effectively',
      'Shows persistence when facing difficulty'
    ],
    easierVariation: 'Use pipe cleaners instead of string (stiffer, easier to thread).',
    harderVariation: 'Create specific color patterns to follow.',
    tips: ['Tie a bead at the end to prevent beads falling off', 'Supervise for safety with small objects']
  },
  {
    id: 'motor-005',
    title: 'Ball Rolling Games',
    description: 'Roll a ball back and forth to develop arm coordination and tracking skills.',
    domain: 'motor',
    minAgeMonths: 24,
    maxAgeMonths: 42,
    difficultyLevel: 1,
    estimatedMinutes: 10,
    materials: ['Soft medium-sized ball'],
    instructions: [
      'Sit on the floor facing your child, legs spread to create a "goal".',
      'Roll the ball gently to your child, saying "here it comes!"',
      'Encourage them to stop the ball and roll it back.',
      'Gradually increase distance as they improve.'
    ],
    successIndicators: [
      'Tracks ball with eyes',
      'Stops rolling ball with hands',
      'Rolls ball in intended direction'
    ],
    easierVariation: 'Use a larger, slower ball and sit closer.',
    harderVariation: 'Add gentle bouncing or rolling to targets.',
    tips: ['Use encouraging language', 'This is great for turn-taking practice too']
  },
  {
    id: 'motor-006',
    title: 'Scissors Practice',
    description: 'Practice cutting paper with safety scissors to develop hand strength and control.',
    domain: 'motor',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 3,
    estimatedMinutes: 10,
    materials: ['Safety scissors', 'Paper strips', 'Old magazines (optional)'],
    instructions: [
      'Show proper scissor grip (thumb up, "thumbs up" hand position).',
      'Start with snipping edges of paper strips.',
      'Progress to cutting across narrow strips.',
      'Eventually try cutting along a thick drawn line.'
    ],
    successIndicators: [
      'Holds scissors correctly',
      'Opens and closes scissors with control',
      'Cuts across paper (not necessarily on line)'
    ],
    easierVariation: 'Just practice opening and closing scissors, snipping playdough.',
    harderVariation: 'Cut out simple shapes following lines.',
    tips: ['Left-handed children need left-handed scissors', 'Always supervise scissor use']
  },
  {
    id: 'motor-007',
    title: 'Animal Walks',
    description: 'Move like different animals to build strength and body awareness.',
    domain: 'motor',
    minAgeMonths: 24,
    maxAgeMonths: 54,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Open space', 'Animal pictures (optional)'],
    instructions: [
      'Show a picture or name an animal and ask "how does a bear walk?"',
      'Demonstrate bear walking (on hands and feet), then let child try.',
      'Try frog jumps, crab walks, snake slithering, bird flying.',
      'Make it a game - "cross the room like a kangaroo!"'
    ],
    successIndicators: [
      'Attempts different movement patterns',
      'Shows coordination in at least 2-3 animal walks',
      'Enjoys imaginative movement'
    ],
    easierVariation: 'Focus on just 2 simple movements like jumping and crawling.',
    harderVariation: 'Create an obstacle course using different animal walks.',
    tips: ['Join in! Kids love when parents get silly', 'Add animal sounds for extra fun']
  },
  {
    id: 'motor-008',
    title: 'Pouring Practice',
    description: 'Pour water or rice between containers to develop wrist control and focus.',
    domain: 'motor',
    minAgeMonths: 24,
    maxAgeMonths: 48,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Small pitcher', 'Cups or containers', 'Water, rice, or dried beans', 'Tray to contain spills'],
    instructions: [
      'Set up containers on a tray (to catch spills).',
      'Demonstrate slow, careful pouring from pitcher to cup.',
      'Let child practice, narrating: "pour slowly... stop when it\'s full".',
      'Progress to pouring into smaller containers.'
    ],
    successIndicators: [
      'Grasps pitcher with both hands',
      'Pours with some control (some spilling is normal)',
      'Knows when to stop pouring'
    ],
    easierVariation: 'Start with larger containers and dry materials like rice.',
    harderVariation: 'Pour into multiple small cups without spilling.',
    tips: ['Great for independence in self-serving at meals', 'Use food coloring in water for visual interest']
  },
  {
    id: 'motor-009',
    title: 'Sticker Art',
    description: 'Peel and place stickers to develop pincer grip and hand-eye coordination.',
    domain: 'motor',
    minAgeMonths: 24,
    maxAgeMonths: 48,
    difficultyLevel: 1,
    estimatedMinutes: 10,
    materials: ['Various stickers', 'Paper or a simple outline drawing'],
    instructions: [
      'Offer a sheet of stickers and paper.',
      'Show how to peel a sticker (this is the challenging part!).',
      'Let them place stickers freely or on specific spots you\'ve marked.',
      'Celebrate their artwork when complete.'
    ],
    successIndicators: [
      'Attempts to peel stickers independently',
      'Places stickers intentionally',
      'Uses pincer grip to handle stickers'
    ],
    easierVariation: 'Pre-peel sticker corners so they\'re easier to grab.',
    harderVariation: 'Create patterns or place stickers on specific shapes.',
    tips: ['Larger stickers are easier to peel', 'Foam stickers offer more grip']
  },
  {
    id: 'motor-010',
    title: 'Balloon Tap',
    description: 'Keep a balloon in the air by tapping, developing tracking and coordination.',
    domain: 'motor',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Balloon'],
    instructions: [
      'Blow up a balloon and tap it gently in the air.',
      'Encourage child to tap it back before it touches the ground.',
      'Count how many taps you can do together.',
      'Try tapping with different body parts: head, elbow, knee.'
    ],
    successIndicators: [
      'Tracks balloon with eyes',
      'Makes contact with balloon',
      'Keeps balloon up for multiple taps'
    ],
    easierVariation: 'Let balloon land, then tap it back up - no rush.',
    harderVariation: 'Use two balloons or add obstacles to move around.',
    tips: ['Supervise - popped balloons can be a hazard', 'Great indoor activity for rainy days']
  },

  // ============================================
  // LANGUAGE DOMAIN (10 activities)
  // ============================================
  {
    id: 'lang-001',
    title: 'Story Time Talk',
    description: 'Read a picture book together, discussing the story and pictures.',
    domain: 'language',
    minAgeMonths: 24,
    maxAgeMonths: 60,
    difficultyLevel: 1,
    estimatedMinutes: 15,
    materials: ['Age-appropriate picture book'],
    instructions: [
      'Choose a book with clear pictures and simple story.',
      'Before reading, look at the cover and ask "what do you think this is about?"',
      'While reading, pause to ask questions: "what do you see?", "how does he feel?"',
      'After reading, ask which part was their favorite.'
    ],
    successIndicators: [
      'Points to pictures when asked',
      'Attempts to answer questions',
      'Shows engagement with the story'
    ],
    easierVariation: 'Focus on just naming objects in pictures.',
    harderVariation: 'Ask "what might happen next?" before turning pages.',
    tips: ['Re-reading favorite books builds vocabulary', 'Let child hold and turn pages']
  },
  {
    id: 'lang-002',
    title: 'Rhyme Time',
    description: 'Sing nursery rhymes and songs together to develop phonemic awareness.',
    domain: 'language',
    minAgeMonths: 24,
    maxAgeMonths: 48,
    difficultyLevel: 1,
    estimatedMinutes: 10,
    materials: ['None required', 'Optional: instrument or shaker'],
    instructions: [
      'Sing familiar nursery rhymes like "Twinkle Twinkle" or "Wheels on the Bus".',
      'Add hand motions to engage movement.',
      'Pause before rhyming words to let child fill in.',
      'Try silly rhymes: "cat, hat, bat, mat..."'
    ],
    successIndicators: [
      'Joins in with familiar songs',
      'Fills in rhyming words',
      'Claps or moves to rhythm'
    ],
    easierVariation: 'Just listen and do actions together.',
    harderVariation: 'Make up silly rhyming words together.',
    tips: ['Repetition is key for language learning', 'Songs in the car are great practice']
  },
  {
    id: 'lang-003',
    title: 'I Spy',
    description: 'Play I Spy to build vocabulary and descriptive language.',
    domain: 'language',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['None - use your surroundings'],
    instructions: [
      'Say "I spy with my little eye something... red!"',
      'Help child look around and guess what you see.',
      'When they find it, let them try giving a clue.',
      'Expand clues: colors, sizes, starting sounds.'
    ],
    successIndicators: [
      'Understands the game concept',
      'Identifies objects by color/description',
      'Gives own clues'
    ],
    easierVariation: 'Point in the direction of the object, use only colors.',
    harderVariation: 'Use more complex clues: "something soft and brown".',
    tips: ['Great for waiting rooms and car rides', 'Builds observation skills too']
  },
  {
    id: 'lang-004',
    title: 'Tell Me About Your Day',
    description: 'Practice narrative skills by recounting daily events.',
    domain: 'language',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['None'],
    instructions: [
      'At dinner or bedtime, ask "what did you do today?"',
      'Prompt with specific questions: "who did you play with?"',
      'Help sequence events: "first you..., then you..."',
      'Share your day too, modeling storytelling.'
    ],
    successIndicators: [
      'Recalls at least one event',
      'Uses some time words (first, then, after)',
      'Provides details when prompted'
    ],
    easierVariation: 'Use photos from the day to prompt memory.',
    harderVariation: 'Ask them to share the best and hardest parts of the day.',
    tips: ['Make this a daily routine', 'Avoid yes/no questions - use open-ended ones']
  },
  {
    id: 'lang-005',
    title: 'Picture Describing',
    description: 'Describe what\'s happening in detailed pictures to build expressive language.',
    domain: 'language',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Detailed picture scenes (books, magazines, or printed images)'],
    instructions: [
      'Choose a picture with lots of things happening.',
      'Ask "what do you see?" and wait for responses.',
      'Prompt deeper: "what is the boy doing?", "how does she feel?"',
      'Add your own observations to model rich vocabulary.'
    ],
    successIndicators: [
      'Names multiple objects in picture',
      'Describes actions happening',
      'Uses complete sentences'
    ],
    easierVariation: 'Focus on naming objects: "point to the dog".',
    harderVariation: 'Ask them to make up a story about the picture.',
    tips: ['Look-and-find books are great for this', 'Expand on their answers']
  },
  {
    id: 'lang-006',
    title: 'Puppet Conversations',
    description: 'Use puppets or stuffed animals to encourage verbal interaction.',
    domain: 'language',
    minAgeMonths: 24,
    maxAgeMonths: 54,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Puppet, sock puppet, or stuffed animal'],
    instructions: [
      'Make the puppet "talk" in a silly voice.',
      'Have puppet ask child questions: "what\'s your name?", "what do you like to eat?"',
      'Let child respond to puppet (they often talk more to puppets than adults!).',
      'Give child a puppet to create conversations.'
    ],
    successIndicators: [
      'Engages with puppet',
      'Answers puppet\'s questions',
      'May initiate conversation with puppet'
    ],
    easierVariation: 'Just have puppet name objects and child repeats.',
    harderVariation: 'Create a puppet show with a simple story.',
    tips: ['Shy children often open up to puppets', 'Great for practicing social situations']
  },
  {
    id: 'lang-007',
    title: 'Following Directions',
    description: 'Give multi-step directions to follow in a game format.',
    domain: 'language',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 3,
    estimatedMinutes: 10,
    materials: ['Various household objects'],
    instructions: [
      'Start with one-step: "put the ball in the box".',
      'Progress to two-step: "get the spoon AND put it on the table".',
      'Make it a game: "the robot says..." (like Simon Says).',
      'Celebrate success, gently repeat if missed.'
    ],
    successIndicators: [
      'Follows 1-step directions consistently',
      'Follows 2-step directions',
      'Remembers sequence of actions'
    ],
    easierVariation: 'Use gestures along with words.',
    harderVariation: 'Add 3-step directions or positional words (under, behind).',
    tips: ['This is a key school readiness skill', 'Make sure child is paying attention before giving directions']
  },
  {
    id: 'lang-008',
    title: 'Category Sorting',
    description: 'Name and sort objects into categories to build vocabulary organization.',
    domain: 'language',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Various small objects or picture cards'],
    instructions: [
      'Gather objects from 2-3 categories (animals, food, vehicles).',
      'Ask child to name each item as you show it.',
      'Sort together: "this is food, it goes here".',
      'Ask "what else is an animal?" to prompt category thinking.'
    ],
    successIndicators: [
      'Names most common objects',
      'Sorts objects into correct categories',
      'Explains why something belongs in a category'
    ],
    easierVariation: 'Use just 2 clear categories with obvious items.',
    harderVariation: 'Add subcategories (animals that swim vs. fly).',
    tips: ['Use toy bins to make sorting fun', 'Connect to real life: "at the grocery store..."']
  },
  {
    id: 'lang-009',
    title: 'Sound Hunt',
    description: 'Listen for and identify environmental sounds to develop listening skills.',
    domain: 'language',
    minAgeMonths: 24,
    maxAgeMonths: 48,
    difficultyLevel: 1,
    estimatedMinutes: 10,
    materials: ['None - use environmental sounds', 'Optional: sound recording app'],
    instructions: [
      'Sit quietly together and say "let\'s listen... what do you hear?"',
      'Help identify sounds: bird, car, clock ticking.',
      'Go outside for more variety.',
      'Play "what made that sound?" guessing game.'
    ],
    successIndicators: [
      'Stops and listens attentively',
      'Identifies familiar sounds',
      'Describes what they hear'
    ],
    easierVariation: 'Play sound recordings and identify them.',
    harderVariation: 'Close eyes and try to identify where sounds come from.',
    tips: ['Great for calming down an energetic child', 'Builds focus and attention']
  },
  {
    id: 'lang-010',
    title: 'Silly Sentences',
    description: 'Create funny sentences together to explore language playfully.',
    domain: 'language',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['None', 'Optional: picture cards'],
    instructions: [
      'Start a silly sentence: "The purple elephant..."',
      'Let child add to it: "...ate ice cream!"',
      'Take turns adding to create longer silly stories.',
      'Draw the silly scenes you create together.'
    ],
    successIndicators: [
      'Contributes words to sentences',
      'Understands silly vs. real',
      'Laughs and engages with wordplay'
    ],
    easierVariation: 'Give two choices: "did the elephant eat ice cream or spaghetti?"',
    harderVariation: 'Create a whole silly story with beginning, middle, end.',
    tips: ['Humor is great for language learning', 'Write down favorites to read again']
  },

  // ============================================
  // COGNITIVE DOMAIN (10 activities)
  // ============================================
  {
    id: 'cog-001',
    title: 'Simple Puzzles',
    description: 'Complete age-appropriate puzzles to develop problem-solving skills.',
    domain: 'cognitive',
    minAgeMonths: 24,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Age-appropriate puzzles (3-12 pieces for young children)'],
    instructions: [
      'Choose a puzzle with pieces appropriate for child\'s level.',
      'Start with dump-and-fill puzzles for youngest.',
      'Model looking at shape and picture clues.',
      'Offer hints but let child do the placing.'
    ],
    successIndicators: [
      'Attempts to fit pieces',
      'Uses picture clues to guide placement',
      'Completes puzzle with minimal help'
    ],
    easierVariation: 'Use knob puzzles with single pieces.',
    harderVariation: 'Try puzzles with more pieces or no picture guide.',
    tips: ['Start with fewer pieces', 'Puzzles build patience and persistence']
  },
  {
    id: 'cog-002',
    title: 'Color Matching',
    description: 'Match objects by color to develop visual discrimination.',
    domain: 'cognitive',
    minAgeMonths: 24,
    maxAgeMonths: 42,
    difficultyLevel: 1,
    estimatedMinutes: 10,
    materials: ['Colored objects (blocks, pom poms, toys)', 'Colored bowls or paper'],
    instructions: [
      'Set out colored bowls or paper as sorting targets.',
      'Show child how to put red blocks in red bowl.',
      'Mix objects and let child sort independently.',
      'Name colors as you work: "you found another blue one!"'
    ],
    successIndicators: [
      'Matches at least 3-4 colors correctly',
      'Names some colors',
      'Self-corrects mistakes'
    ],
    easierVariation: 'Start with just 2 contrasting colors.',
    harderVariation: 'Add shades (light blue, dark blue) or sort by two attributes.',
    tips: ['Use objects from around the house', 'Great for cleanup time too!']
  },
  {
    id: 'cog-003',
    title: 'Pattern Making',
    description: 'Create and continue simple patterns using objects.',
    domain: 'cognitive',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 3,
    estimatedMinutes: 10,
    materials: ['Colored blocks, beads, or other small objects'],
    instructions: [
      'Create a simple AB pattern: red, blue, red, blue.',
      'Say the pattern aloud: "red, blue, red, blue... what comes next?"',
      'Let child continue the pattern.',
      'Progress to ABB or ABC patterns.'
    ],
    successIndicators: [
      'Recognizes simple patterns',
      'Continues an AB pattern',
      'Creates own simple patterns'
    ],
    easierVariation: 'Use just two colors, keep pattern short.',
    harderVariation: 'Create patterns with shapes or more complex sequences.',
    tips: ['Patterns are everywhere - point them out!', 'Use snacks for edible patterns']
  },
  {
    id: 'cog-004',
    title: 'Memory Match Game',
    description: 'Find matching pairs of cards to develop memory skills.',
    domain: 'cognitive',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 3,
    estimatedMinutes: 10,
    materials: ['Matching card pairs (start with 3-4 pairs)'],
    instructions: [
      'Lay cards face down in a grid.',
      'Take turns flipping two cards, looking for matches.',
      'When you find a match, keep the pair.',
      'Talk through strategy: "I remember the cat is here..."'
    ],
    successIndicators: [
      'Understands turn-taking',
      'Remembers location of some cards',
      'Finds matches independently'
    ],
    easierVariation: 'Play with cards face up first, use fewer pairs.',
    harderVariation: 'Increase number of pairs, speed up the game.',
    tips: ['Let child win sometimes!', 'Make your own cards with family photos']
  },
  {
    id: 'cog-005',
    title: 'Counting Everyday Objects',
    description: 'Count real objects to develop one-to-one correspondence.',
    domain: 'cognitive',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Any countable objects (snacks, toys, buttons)'],
    instructions: [
      'Start with 3-5 objects arranged in a line.',
      'Touch each object as you count: "one, two, three..."',
      'Ask child to count with you, then independently.',
      'Ask "how many?" after counting to reinforce cardinality.'
    ],
    successIndicators: [
      'Counts to at least 5',
      'Touches each object once while counting',
      'Answers "how many?" correctly'
    ],
    easierVariation: 'Count to just 3, use large objects.',
    harderVariation: 'Count higher, count hidden objects, solve simple "how many more?"',
    tips: ['Count everything! Stairs, grapes, cars...', 'Make counting mistakes for child to catch']
  },
  {
    id: 'cog-006',
    title: 'Size Sorting',
    description: 'Arrange objects by size to develop comparison skills.',
    domain: 'cognitive',
    minAgeMonths: 30,
    maxAgeMonths: 54,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Objects of varying sizes (nesting cups, blocks, toys)'],
    instructions: [
      'Gather 3-5 objects of different sizes.',
      'Ask "which is the biggest?" and "which is smallest?"',
      'Help arrange from smallest to biggest.',
      'Use vocabulary: bigger, smaller, tiny, huge, medium.'
    ],
    successIndicators: [
      'Identifies biggest and smallest',
      'Arranges 3+ objects by size',
      'Uses size vocabulary'
    ],
    easierVariation: 'Compare just 2 objects at a time.',
    harderVariation: 'Sort by size with more subtle differences.',
    tips: ['Nesting toys are perfect for this', 'Compare family members\' shoes']
  },
  {
    id: 'cog-007',
    title: 'What\'s Missing?',
    description: 'Identify which object was removed to build memory and attention.',
    domain: 'cognitive',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 3,
    estimatedMinutes: 10,
    materials: ['3-5 small toys or household objects', 'Cloth to cover'],
    instructions: [
      'Show 3 objects, naming each one.',
      'Ask child to close eyes or look away.',
      'Remove one object and cover it.',
      'Ask "what\'s missing?" - give clues if needed.'
    ],
    successIndicators: [
      'Remembers most objects',
      'Identifies missing item',
      'Can play with more objects over time'
    ],
    easierVariation: 'Use just 2-3 very different objects.',
    harderVariation: 'Use more objects, or remove 2 at once.',
    tips: ['Build up number of objects gradually', 'Let child be the "remover" too']
  },
  {
    id: 'cog-008',
    title: 'Shape Hunt',
    description: 'Find shapes in the environment to build shape recognition.',
    domain: 'cognitive',
    minAgeMonths: 30,
    maxAgeMonths: 54,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['None - use your environment', 'Optional: shape cards'],
    instructions: [
      'Choose a shape to hunt: "let\'s find circles!"',
      'Walk around looking for that shape: clock, plate, wheel.',
      'Name shapes as you find them.',
      'Take photos of shapes you find for a "shape book".'
    ],
    successIndicators: [
      'Recognizes basic shapes (circle, square, triangle)',
      'Finds shapes in environment',
      'Names shapes correctly'
    ],
    easierVariation: 'Focus on just circles and squares.',
    harderVariation: 'Add more shapes (rectangle, oval, diamond).',
    tips: ['Great for walks and errands', 'Point out shapes in books too']
  },
  {
    id: 'cog-009',
    title: 'Problem-Solving Play',
    description: 'Figure out how things work through hands-on exploration.',
    domain: 'cognitive',
    minAgeMonths: 24,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 15,
    materials: ['Building blocks', 'Stacking cups', 'Simple construction toys'],
    instructions: [
      'Provide open-ended building materials.',
      'Set a simple challenge: "can you build a tall tower?"',
      'When it falls, ask "what happened? What could we try?"',
      'Celebrate effort and problem-solving, not just success.'
    ],
    successIndicators: [
      'Experiments with different approaches',
      'Doesn\'t give up after first failure',
      'Adjusts strategy based on results'
    ],
    easierVariation: 'Build together, model trying again.',
    harderVariation: 'Add constraints: "use only blue blocks" or "build a bridge".',
    tips: ['Resist fixing it for them', 'Narrate your own problem-solving']
  },
  {
    id: 'cog-010',
    title: 'Cause and Effect Experiments',
    description: 'Explore what happens when we do something - basic science thinking.',
    domain: 'cognitive',
    minAgeMonths: 24,
    maxAgeMonths: 54,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Simple materials like ice, water, ramps, balls'],
    instructions: [
      'Set up a simple experiment: "what happens when we put ice in water?"',
      'Ask "what do you think will happen?" before doing it.',
      'Observe together and discuss what happened.',
      'Try variations: hot water vs. cold water.'
    ],
    successIndicators: [
      'Makes predictions',
      'Observes outcomes',
      'Connects action to result'
    ],
    easierVariation: 'Simple cause-effect: push button, light turns on.',
    harderVariation: 'Record predictions and results, try multiple variables.',
    tips: ['Kitchen science is great!', 'Don\'t worry if predictions are "wrong" - that\'s learning']
  },

  // ============================================
  // SOCIAL-EMOTIONAL DOMAIN (10 activities)
  // ============================================
  {
    id: 'social-001',
    title: 'Feelings Faces',
    description: 'Identify and discuss emotions using pictures and expressions.',
    domain: 'social-emotional',
    minAgeMonths: 24,
    maxAgeMonths: 54,
    difficultyLevel: 1,
    estimatedMinutes: 10,
    materials: ['Emotion pictures or cards', 'Mirror'],
    instructions: [
      'Show pictures of faces showing different emotions.',
      'Name each emotion: "she looks happy! What makes you happy?"',
      'Practice making faces in a mirror together.',
      'Connect to their experiences: "you looked sad when..."'
    ],
    successIndicators: [
      'Identifies happy, sad, angry, scared',
      'Makes corresponding facial expressions',
      'Talks about own feelings'
    ],
    easierVariation: 'Focus on just happy and sad.',
    harderVariation: 'Discuss more nuanced emotions: frustrated, excited, worried.',
    tips: ['Books about feelings are great resources', 'Name emotions throughout the day']
  },
  {
    id: 'social-002',
    title: 'Taking Turns',
    description: 'Practice turn-taking through simple games.',
    domain: 'social-emotional',
    minAgeMonths: 24,
    maxAgeMonths: 48,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Simple game or toy to share'],
    instructions: [
      'Choose an activity that requires turns: rolling ball, stacking blocks.',
      'Clearly say "my turn" then "your turn" each time.',
      'Use a timer if waiting is hard.',
      'Praise waiting: "great waiting for your turn!"'
    ],
    successIndicators: [
      'Waits for turn with prompting',
      'Says "my turn" and "your turn"',
      'Shows less frustration over time'
    ],
    easierVariation: 'Keep turns very short, stay close for support.',
    harderVariation: 'Practice with multiple children, longer waits.',
    tips: ['Turn-taking is hard! Be patient', 'Model waiting gracefully yourself']
  },
  {
    id: 'social-003',
    title: 'Helping Hands',
    description: 'Participate in simple household tasks to build responsibility.',
    domain: 'social-emotional',
    minAgeMonths: 24,
    maxAgeMonths: 60,
    difficultyLevel: 1,
    estimatedMinutes: 10,
    materials: ['Age-appropriate cleaning tools or tasks'],
    instructions: [
      'Invite child to help with a simple task: wiping table, sorting laundry.',
      'Show them exactly what to do, step by step.',
      'Work alongside them, praising effort.',
      'Thank them sincerely for helping.'
    ],
    successIndicators: [
      'Participates willingly',
      'Follows simple task instructions',
      'Shows pride in helping'
    ],
    easierVariation: 'Very simple tasks: putting toys in bin.',
    harderVariation: 'Multi-step tasks: set the table.',
    tips: ['It will take longer than doing it yourself - that\'s okay!', 'Builds sense of contribution']
  },
  {
    id: 'social-004',
    title: 'Calm Down Corner',
    description: 'Learn self-regulation strategies for big feelings.',
    domain: 'social-emotional',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Comfortable space', 'Comfort objects', 'Feeling chart'],
    instructions: [
      'Create a cozy spot with soft items, books, sensory objects.',
      'When child is calm, show them the space and what they can do there.',
      'Practice calming strategies: deep breaths, squeezing a ball.',
      'Use it when emotions run high, not as punishment.'
    ],
    successIndicators: [
      'Knows where calm down spot is',
      'Uses at least one calming strategy',
      'Begins to recognize when they need it'
    ],
    easierVariation: 'Practice calming breaths anytime, not just when upset.',
    harderVariation: 'Child begins to use space independently.',
    tips: ['Go there yourself to model', 'Never use as punishment or timeout']
  },
  {
    id: 'social-005',
    title: 'Role Play',
    description: 'Act out social scenarios to practice skills.',
    domain: 'social-emotional',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 15,
    materials: ['Dress-up clothes or props (optional)'],
    instructions: [
      'Set up a pretend scenario: restaurant, doctor, store.',
      'Assign roles and act it out together.',
      'Practice social scripts: ordering food, saying please/thank you.',
      'Let child lead sometimes, you follow their play.'
    ],
    successIndicators: [
      'Engages in pretend play',
      'Uses appropriate social language',
      'Takes different perspectives'
    ],
    easierVariation: 'Simple scenarios with just 2 roles.',
    harderVariation: 'Practice tricky situations: what to say when someone is mean.',
    tips: ['Great prep for new experiences (first day of school)', 'Dolls/stuffed animals can be characters']
  },
  {
    id: 'social-006',
    title: 'Sharing Practice',
    description: 'Learn to share toys and materials with others.',
    domain: 'social-emotional',
    minAgeMonths: 30,
    maxAgeMonths: 54,
    difficultyLevel: 3,
    estimatedMinutes: 15,
    materials: ['Toys or materials to share'],
    instructions: [
      'Start with trading: "I\'ll give you this one, you give me that one."',
      'Practice with less precious items first.',
      'Use a timer: "you can have it for 2 minutes, then it\'s their turn."',
      'Praise sharing specifically: "you shared your blocks!"'
    ],
    successIndicators: [
      'Trades items willingly',
      'Waits for turn with timer',
      'Offers to share sometimes'
    ],
    easierVariation: 'Have duplicates of favorite toys.',
    harderVariation: 'Share without timer prompts.',
    tips: ['Some special items don\'t need to be shared', 'Model sharing yourself']
  },
  {
    id: 'social-007',
    title: 'Friendship Talk',
    description: 'Discuss what makes a good friend through stories and conversation.',
    domain: 'social-emotional',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Books about friendship (optional)'],
    instructions: [
      'Read a story about friends or talk about their friends.',
      'Ask "what do friends do together?"',
      'Discuss kind vs. unkind behaviors.',
      'Practice kind words: "that was so kind when you..."'
    ],
    successIndicators: [
      'Names at least one friend',
      'Identifies friendly behaviors',
      'Uses kind words'
    ],
    easierVariation: 'Focus on one friendship concept at a time.',
    harderVariation: 'Discuss how to handle friend conflicts.',
    tips: ['Point out their own friendly behaviors', 'Books: "How to Be a Friend" by Laurie Krasny Brown']
  },
  {
    id: 'social-008',
    title: 'Comfort & Care',
    description: 'Practice showing empathy by caring for dolls or stuffed animals.',
    domain: 'social-emotional',
    minAgeMonths: 24,
    maxAgeMonths: 48,
    difficultyLevel: 1,
    estimatedMinutes: 10,
    materials: ['Doll or stuffed animal', 'Pretend care items'],
    instructions: [
      'Pretend the doll is sad, hungry, or hurt.',
      'Ask "how can we help her feel better?"',
      'Model gentle care: patting, feeding, speaking softly.',
      'Let child take over caring for the doll.'
    ],
    successIndicators: [
      'Responds to doll\'s "needs"',
      'Uses gentle touch',
      'Shows nurturing behaviors'
    ],
    easierVariation: 'Focus on simple care: feeding, covering with blanket.',
    harderVariation: 'Create more complex scenarios with emotions.',
    tips: ['Builds empathy for real situations', 'Both boys and girls benefit from nurturing play']
  },
  {
    id: 'social-009',
    title: 'Waiting Practice',
    description: 'Build patience through structured waiting activities.',
    domain: 'social-emotional',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 3,
    estimatedMinutes: 10,
    materials: ['Timer', 'Small reward or activity'],
    instructions: [
      'Set a short timer (start with 1 minute).',
      'Give child something to do while waiting: coloring, looking at book.',
      'When timer goes off, provide the wanted item or activity.',
      'Gradually increase wait times.'
    ],
    successIndicators: [
      'Waits for short periods',
      'Uses coping strategies while waiting',
      'Shows improved patience over time'
    ],
    easierVariation: 'Very short waits (30 seconds), stay close.',
    harderVariation: 'Wait without activities, longer periods.',
    tips: ['Practice when stakes are low', 'Visual timers are very helpful']
  },
  {
    id: 'social-010',
    title: 'Gratitude Circle',
    description: 'Practice expressing thankfulness and appreciation.',
    domain: 'social-emotional',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 5,
    materials: ['None'],
    instructions: [
      'At bedtime or dinner, share something you\'re thankful for.',
      'Help child think of something: "what made you happy today?"',
      'Accept all answers, no matter how small.',
      'Make it a daily routine.'
    ],
    successIndicators: [
      'Participates in routine',
      'Names something they\'re thankful for',
      'Shows understanding of gratitude concept'
    ],
    easierVariation: 'Give choices: "are you thankful for your toy or your snack?"',
    harderVariation: 'Include thankfulness for people, not just things.',
    tips: ['Keep it positive, not forced', 'Model genuine gratitude yourself']
  },

  // ============================================
  // PRE-ACADEMIC DOMAIN (10 activities)
  // ============================================
  {
    id: 'acad-001',
    title: 'Letter Exploration',
    description: 'Explore letters through sensory play and games.',
    domain: 'pre-academic',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Letter magnets, blocks, or cards', 'Sand, shaving cream, or playdough'],
    instructions: [
      'Introduce 2-3 letters at a time, starting with those in child\'s name.',
      'Trace letters in sand or shaving cream.',
      'Find letters in the environment.',
      'Practice the letter sound as well as name.'
    ],
    successIndicators: [
      'Recognizes some letters',
      'Associates letters with their sounds',
      'Shows interest in letters'
    ],
    easierVariation: 'Focus just on letter recognition, not sounds.',
    harderVariation: 'Match uppercase to lowercase, identify letter sounds.',
    tips: ['Start with letters in child\'s name', 'Make it fun, not drill-like']
  },
  {
    id: 'acad-002',
    title: 'Number Recognition',
    description: 'Learn to recognize written numbers through games.',
    domain: 'pre-academic',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Number cards or magnets', 'Small objects for counting'],
    instructions: [
      'Show number cards 1-5, naming each.',
      'Match the number card to that many objects.',
      'Hunt for numbers around the house.',
      'Practice writing numbers in sand or on paper.'
    ],
    successIndicators: [
      'Recognizes numbers 1-5',
      'Matches number to quantity',
      'Attempts to write numbers'
    ],
    easierVariation: 'Focus on just 1-3.',
    harderVariation: 'Extend to 10, order numbers correctly.',
    tips: ['Point out numbers everywhere: house numbers, prices', 'Number songs help!']
  },
  {
    id: 'acad-003',
    title: 'Sorting by Category',
    description: 'Group objects by different attributes.',
    domain: 'pre-academic',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Various small objects with different attributes'],
    instructions: [
      'Gather objects that can be sorted different ways.',
      'First sort by one attribute (color).',
      'Then resort by another (size or shape).',
      'Ask child to explain their sorting.'
    ],
    successIndicators: [
      'Sorts correctly by one attribute',
      'Can resort by different attribute',
      'Explains sorting logic'
    ],
    easierVariation: 'Use obvious categories with clear examples.',
    harderVariation: 'Sort by less obvious attributes, sort by 2 at once.',
    tips: ['Great for cleanup: "put all the blocks here"', 'Develops math and science thinking']
  },
  {
    id: 'acad-004',
    title: 'Sequencing Practice',
    description: 'Arrange pictures or events in order.',
    domain: 'pre-academic',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 3,
    estimatedMinutes: 10,
    materials: ['Sequence cards or pictures', 'Or use daily routine pictures'],
    instructions: [
      'Start with 3 pictures showing a simple sequence (seed → plant → flower).',
      'Mix them up and ask "what happened first?"',
      'Have child arrange in order and tell the story.',
      'Connect to their day: first we wake up, then we eat breakfast.'
    ],
    successIndicators: [
      'Arranges 3 pictures in sequence',
      'Uses sequence words (first, then, last)',
      'Retells sequence as story'
    ],
    easierVariation: 'Use just 2 pictures, give heavy prompts.',
    harderVariation: 'Use 4-5 pictures, create own sequences.',
    tips: ['Great for understanding routines', 'Make sequence cards from photos of their day']
  },
  {
    id: 'acad-005',
    title: 'Same and Different',
    description: 'Identify similarities and differences between objects.',
    domain: 'pre-academic',
    minAgeMonths: 30,
    maxAgeMonths: 54,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Pairs of similar and different objects or pictures'],
    instructions: [
      'Show two objects and ask "are these the same or different?"',
      'Discuss how they\'re same: "both are red".',
      'Discuss differences: "this one is big, this one is small".',
      'Play "odd one out" with 3 objects.'
    ],
    successIndicators: [
      'Correctly identifies same vs different',
      'Names at least one similarity or difference',
      'Finds the odd one out'
    ],
    easierVariation: 'Use very obvious same/different pairs.',
    harderVariation: 'Find multiple similarities AND differences.',
    tips: ['Good for visual discrimination', 'Compare faces in photos']
  },
  {
    id: 'acad-006',
    title: 'Name Writing',
    description: 'Practice writing own name with proper grip.',
    domain: 'pre-academic',
    minAgeMonths: 42,
    maxAgeMonths: 60,
    difficultyLevel: 3,
    estimatedMinutes: 10,
    materials: ['Thick crayons or markers', 'Paper', 'Name card model'],
    instructions: [
      'Write child\'s name in large letters as a model.',
      'Practice proper pencil grip (tripod).',
      'Start with just first letter.',
      'Trace over dots, then try independently.'
    ],
    successIndicators: [
      'Uses appropriate grip',
      'Writes at least first letter',
      'Shows increasing control over time'
    ],
    easierVariation: 'Practice with finger in sand or on tablet.',
    harderVariation: 'Write without model, add last name.',
    tips: ['Uppercase is easier to start with', 'Short names have advantage!']
  },
  {
    id: 'acad-007',
    title: 'More or Less',
    description: 'Compare quantities to build number sense.',
    domain: 'pre-academic',
    minAgeMonths: 30,
    maxAgeMonths: 54,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Small countable objects like buttons or coins'],
    instructions: [
      'Make two groups with different amounts.',
      'Ask "which pile has more?" without counting.',
      'Then count to verify.',
      'Practice with "which has less/fewer?"'
    ],
    successIndicators: [
      'Identifies larger quantity by sight',
      'Uses words more/less correctly',
      'Verifies by counting'
    ],
    easierVariation: 'Use very different amounts (2 vs 8).',
    harderVariation: 'Use closer amounts (5 vs 6), introduce "equal".',
    tips: ['Great at snack time!', 'Use real-life: "do you want more or less milk?"']
  },
  {
    id: 'acad-008',
    title: 'Rhyming Words',
    description: 'Identify and produce rhyming words for phonemic awareness.',
    domain: 'pre-academic',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['None', 'Optional: rhyming picture cards'],
    instructions: [
      'Say two words and ask "do cat and hat rhyme?"',
      'Say a word and ask child to think of rhyme.',
      'Make silly rhyming chains: bat, cat, hat, mat...',
      'Read rhyming books and pause for child to fill in.'
    ],
    successIndicators: [
      'Identifies rhyming pairs',
      'Produces at least one rhyme',
      'Enjoys rhyming games'
    ],
    easierVariation: 'Give choices: "does cat rhyme with hat or dog?"',
    harderVariation: 'Generate multiple rhymes, identify non-rhymes.',
    tips: ['Silly nonsense rhymes count!', 'Dr. Seuss is perfect for this']
  },
  {
    id: 'acad-009',
    title: 'Beginning Sounds',
    description: 'Identify the first sound in words for phonemic awareness.',
    domain: 'pre-academic',
    minAgeMonths: 42,
    maxAgeMonths: 60,
    difficultyLevel: 3,
    estimatedMinutes: 10,
    materials: ['Objects or pictures', 'Letter cards (optional)'],
    instructions: [
      'Emphasize first sound: "ball... b-b-b-ball. What sound do you hear?"',
      'Sort objects by beginning sound.',
      'Play "I spy something that starts with b..."',
      'Connect sound to letter if child is ready.'
    ],
    successIndicators: [
      'Identifies beginning sounds in some words',
      'Matches objects with same beginning sound',
      'Starting to connect sounds to letters'
    ],
    easierVariation: 'Focus on easy sounds like /s/, /m/, /b/.',
    harderVariation: 'Identify ending sounds too.',
    tips: ['Use letter sounds, not names (b as in ball, not "bee")', 'This is a key reading readiness skill']
  },
  {
    id: 'acad-010',
    title: 'Story Retelling',
    description: 'Retell a familiar story to develop comprehension and sequencing.',
    domain: 'pre-academic',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 3,
    estimatedMinutes: 10,
    materials: ['Familiar picture book'],
    instructions: [
      'After reading a book several times, close it.',
      'Ask "can you tell me the story?"',
      'Prompt: "what happened first? Then what?"',
      'Use the pictures as hints if needed.'
    ],
    successIndicators: [
      'Recalls main characters',
      'Retells at least 2-3 events in order',
      'Uses some story language ("once upon a time")'
    ],
    easierVariation: 'Use pictures to prompt, ask specific questions.',
    harderVariation: 'Retell without pictures, add details.',
    tips: ['Simple repetitive stories work best', 'Acting it out helps too']
  }
];

// Helper functions
export function getActivitiesByDomain(domain: EarlyYearsDomain): Activity[] {
  return ACTIVITIES.filter(a => a.domain === domain);
}

export function getActivitiesForAge(ageMonths: number): Activity[] {
  return ACTIVITIES.filter(
    a => ageMonths >= a.minAgeMonths && ageMonths <= a.maxAgeMonths
  );
}

export function getActivityById(id: string): Activity | undefined {
  return ACTIVITIES.find(a => a.id === id);
}

export function getAllActivities(): Activity[] {
  return ACTIVITIES;
}

export function getActivitiesForAgeAndDomain(
  ageMonths: number,
  domain: EarlyYearsDomain
): Activity[] {
  return ACTIVITIES.filter(
    a => a.domain === domain && ageMonths >= a.minAgeMonths && ageMonths <= a.maxAgeMonths
  );
}
