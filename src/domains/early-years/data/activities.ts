import { Activity, EarlyYearsDomain } from '../types';

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
    description: 'Sort objects into categories while naming and discussing them.',
    domain: 'language',
    minAgeMonths: 30,
    maxAgeMonths: 54,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Various small objects or pictures', 'Bowls or containers for sorting'],
    instructions: [
      'Gather items that fit categories (animals, foods, vehicles).',
      'Ask child to sort items: "put all the animals together".',
      'Discuss each item: "yes, a cow is an animal!"',
      'Try different categories: big/small, colors, etc.'
    ],
    successIndicators: [
      'Sorts items into correct categories',
      'Names items while sorting',
      'Can explain why item belongs in category'
    ],
    easierVariation: 'Use only 2 very different categories (animals vs. vehicles).',
    harderVariation: 'Use subcategories (farm animals vs. zoo animals).',
    tips: ['Use toys from around the house', 'Picture cards work great too']
  },
  {
    id: 'lang-009',
    title: 'Feeling Faces',
    description: 'Identify and discuss emotions using pictures and expressions.',
    domain: 'language',
    minAgeMonths: 24,
    maxAgeMonths: 48,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Pictures of faces showing emotions', 'Mirror (optional)'],
    instructions: [
      'Show pictures of faces with different emotions.',
      'Ask "how does this person feel?" and name the emotion.',
      'Make the faces together: "let\'s make a happy face!"',
      'Connect to real life: "when do you feel sad?"'
    ],
    successIndicators: [
      'Identifies happy, sad, angry',
      'Makes facial expressions on request',
      'Connects emotions to experiences'
    ],
    easierVariation: 'Start with just happy and sad.',
    harderVariation: 'Add complex emotions: frustrated, excited, worried.',
    tips: ['Books with expressive characters work well', 'Model naming your own feelings']
  },
  {
    id: 'lang-010',
    title: 'What\'s Missing?',
    description: 'Memory and vocabulary game using familiar objects.',
    domain: 'language',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['3-5 familiar objects', 'Cloth or box to hide objects'],
    instructions: [
      'Place 3 objects on table and name each one together.',
      'Have child close eyes while you hide one object.',
      'Ask "what\'s missing?" and celebrate when they identify it.',
      'Gradually increase number of objects.'
    ],
    successIndicators: [
      'Names all objects at start',
      'Identifies missing object',
      'Remembers with 4-5 objects'
    ],
    easierVariation: 'Use only 2 objects.',
    harderVariation: 'Remove 2 objects or add more items.',
    tips: ['Use favorite toys for motivation', 'Let child be the one to hide objects too']
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
    estimatedMinutes: 15,
    materials: ['Age-appropriate puzzle (4-12 pieces for young children)'],
    instructions: [
      'Start with puzzle pieces mixed up nearby.',
      'Point out edge pieces and corners as starting points.',
      'Encourage trying different pieces: "let\'s see if this fits".',
      'Celebrate completion and discuss the picture.'
    ],
    successIndicators: [
      'Attempts to fit pieces',
      'Recognizes when pieces fit correctly',
      'Completes puzzle with minimal help'
    ],
    easierVariation: 'Use chunky knob puzzles or shape sorters.',
    harderVariation: 'Increase piece count or remove picture reference.',
    tips: ['Rotate puzzles to maintain interest', 'Floor puzzles are great for larger movements']
  },
  {
    id: 'cog-002',
    title: 'Pattern Blocks',
    description: 'Create and continue simple patterns using colored blocks.',
    domain: 'cognitive',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Colored blocks, LEGO, or pattern cards'],
    instructions: [
      'Start a simple AB pattern: red, blue, red, blue...',
      'Ask "what comes next?" and help child place the next block.',
      'Try ABC patterns: red, blue, yellow, red, blue, yellow...',
      'Let child create their own patterns.'
    ],
    successIndicators: [
      'Continues a simple AB pattern',
      'Creates own simple patterns',
      'Recognizes pattern errors'
    ],
    easierVariation: 'Use only 2 colors in a simple AB pattern.',
    harderVariation: 'Create AABB or ABC patterns.',
    tips: ['Patterns can be sounds too: clap, stomp, clap, stomp', 'Use everyday objects like fruits or toys']
  },
  {
    id: 'cog-003',
    title: 'Matching Games',
    description: 'Find matching pairs to develop memory and visual discrimination.',
    domain: 'cognitive',
    minAgeMonths: 24,
    maxAgeMonths: 54,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Matching cards or pairs of objects'],
    instructions: [
      'Lay out 4-6 cards face up (2-3 pairs).',
      'Point to one card and ask "can you find the same one?"',
      'Gradually turn cards face down for memory challenge.',
      'Take turns finding pairs.'
    ],
    successIndicators: [
      'Finds matching pairs when visible',
      'Remembers location of some cards',
      'Understands turn-taking in game'
    ],
    easierVariation: 'Keep all cards face up, just match pairs.',
    harderVariation: 'Add more pairs and keep all face down.',
    tips: ['Make your own cards with family photos', 'Start with very different images']
  },
  {
    id: 'cog-004',
    title: 'Building Towers',
    description: 'Stack blocks to explore balance, height, and cause-effect.',
    domain: 'cognitive',
    minAgeMonths: 18,
    maxAgeMonths: 48,
    difficultyLevel: 1,
    estimatedMinutes: 10,
    materials: ['Blocks of various sizes'],
    instructions: [
      'Demonstrate stacking blocks into a tower.',
      'Encourage child to stack as high as possible.',
      'Discuss why towers fall: "that block was wobbly!"',
      'Experiment: what makes a stable tower?'
    ],
    successIndicators: [
      'Stacks 4+ blocks',
      'Adjusts placement for balance',
      'Shows cause-effect understanding when towers fall'
    ],
    easierVariation: 'Use larger, more stable blocks.',
    harderVariation: 'Build specific structures or use different sized blocks.',
    tips: ['Knocking down is part of learning!', 'Count blocks as you stack']
  },
  {
    id: 'cog-005',
    title: 'Size Sorting',
    description: 'Sort objects by size to understand relative concepts.',
    domain: 'cognitive',
    minAgeMonths: 24,
    maxAgeMonths: 48,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Objects of different sizes (nesting cups, spoons, balls)'],
    instructions: [
      'Present 3 objects of clearly different sizes.',
      'Ask "which is the biggest?" and "which is smallest?"',
      'Line them up from smallest to biggest.',
      'Use comparison words: bigger than, smaller than.'
    ],
    successIndicators: [
      'Identifies biggest and smallest',
      'Orders 3 objects by size',
      'Uses size vocabulary'
    ],
    easierVariation: 'Compare only 2 objects (big vs. small).',
    harderVariation: 'Order 5+ objects or use less obvious size differences.',
    tips: ['Nesting cups are perfect for this', 'Compare child\'s shoe to parent\'s shoe']
  },
  {
    id: 'cog-006',
    title: 'Cause and Effect Toys',
    description: 'Explore toys that respond to actions to understand cause-effect.',
    domain: 'cognitive',
    minAgeMonths: 18,
    maxAgeMonths: 36,
    difficultyLevel: 1,
    estimatedMinutes: 10,
    materials: ['Pop-up toys', 'Musical instruments', 'Light-up toys'],
    instructions: [
      'Present a cause-effect toy (push button → something happens).',
      'Let child explore freely, observing their discoveries.',
      'Narrate: "You pushed the button and the dog popped up!"',
      'Encourage them to repeat actions.'
    ],
    successIndicators: [
      'Repeats actions to see effects',
      'Shows anticipation of what will happen',
      'Tries variations'
    ],
    easierVariation: 'Use toys with very obvious cause-effect.',
    harderVariation: 'Use toys with multiple steps or sequences.',
    tips: ['Household items work too: light switches, doors', 'Water play has great cause-effect learning']
  },
  {
    id: 'cog-007',
    title: 'Shape Hunt',
    description: 'Find shapes in the environment to build shape recognition.',
    domain: 'cognitive',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['None - use your environment'],
    instructions: [
      'Name a shape: "Let\'s find circles!"',
      'Walk around the house or outside finding that shape.',
      'Point out shapes: "The clock is a circle!"',
      'Move on to another shape.'
    ],
    successIndicators: [
      'Identifies basic shapes (circle, square, triangle)',
      'Finds shapes in environment',
      'Names shapes independently'
    ],
    easierVariation: 'Focus on just circles, which are easiest.',
    harderVariation: 'Find rectangles, ovals, diamonds.',
    tips: ['Make it a scavenger hunt with a list', 'Take photos of shapes found']
  },
  {
    id: 'cog-008',
    title: 'Simple Counting',
    description: 'Count objects using one-to-one correspondence.',
    domain: 'cognitive',
    minAgeMonths: 24,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Small countable objects (buttons, crackers, blocks)'],
    instructions: [
      'Place a few objects in front of child.',
      'Touch and count each object: "One, two, three!"',
      'Have child count with you, touching each object.',
      'Ask "how many?" after counting.'
    ],
    successIndicators: [
      'Counts to 5 with objects',
      'Touches one object per number',
      'Answers "how many?" question'
    ],
    easierVariation: 'Count just 2-3 objects.',
    harderVariation: 'Count to 10 or count objects that move (like jumps).',
    tips: ['Count during daily routines: stairs, snacks', 'Use fingers for built-in counting']
  },
  {
    id: 'cog-009',
    title: 'Sorting Colors',
    description: 'Sort objects by color to develop classification skills.',
    domain: 'cognitive',
    minAgeMonths: 24,
    maxAgeMonths: 48,
    difficultyLevel: 1,
    estimatedMinutes: 10,
    materials: ['Colorful objects', 'Bowls or containers'],
    instructions: [
      'Set out containers, one for each color you\'ll sort.',
      'Show an object: "This block is red. Let\'s put it in the red bowl."',
      'Let child sort remaining objects by color.',
      'Name colors as you go.'
    ],
    successIndicators: [
      'Sorts by at least 3 colors correctly',
      'Names some colors',
      'Self-corrects mistakes'
    ],
    easierVariation: 'Use only 2 very different colors.',
    harderVariation: 'Add more colors or similar shades.',
    tips: ['Pom poms and cups work great', 'Sort crayons or LEGO by color']
  },
  {
    id: 'cog-010',
    title: 'What Comes Next?',
    description: 'Predict what happens next in familiar routines or stories.',
    domain: 'cognitive',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Familiar storybook or routine cards'],
    instructions: [
      'During a familiar story, pause before the predictable part.',
      'Ask "what do you think happens next?"',
      'Do the same with routines: "We brushed teeth, what\'s next?"',
      'Celebrate correct predictions.'
    ],
    successIndicators: [
      'Predicts familiar story events',
      'Understands sequence in routines',
      'Makes logical predictions'
    ],
    easierVariation: 'Use very predictable books with repetition.',
    harderVariation: 'Predict in new stories or create new endings.',
    tips: ['This builds narrative understanding', 'Use transition times: "After snack, then...?"']
  },

  // ============================================
  // SOCIAL-EMOTIONAL DOMAIN (10 activities)
  // ============================================
  {
    id: 'social-001',
    title: 'Emotion Mirror',
    description: 'Practice recognizing and expressing emotions using a mirror.',
    domain: 'social-emotional',
    minAgeMonths: 24,
    maxAgeMonths: 48,
    difficultyLevel: 1,
    estimatedMinutes: 10,
    materials: ['Mirror', 'Emotion cards or pictures (optional)'],
    instructions: [
      'Sit with child in front of a mirror.',
      'Make faces together: "Let\'s make a happy face!"',
      'Name emotions as you make them.',
      'Ask: "When do you feel happy/sad/angry?"'
    ],
    successIndicators: [
      'Makes facial expressions on request',
      'Names basic emotions',
      'Connects emotions to experiences'
    ],
    easierVariation: 'Focus on just happy and sad.',
    harderVariation: 'Act out scenarios: "Show me how you feel when..."',
    tips: ['Make it silly - exaggerated faces are fun!', 'Connect to child\'s recent experiences']
  },
  {
    id: 'social-002',
    title: 'Turn-Taking Games',
    description: 'Practice taking turns through simple games.',
    domain: 'social-emotional',
    minAgeMonths: 24,
    maxAgeMonths: 54,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Any game or activity that can be done in turns'],
    instructions: [
      'Explain: "We\'ll take turns. First me, then you."',
      'Start with rolling a ball back and forth.',
      'Progress to board games or building together.',
      'Praise waiting: "Great job waiting for your turn!"'
    ],
    successIndicators: [
      'Understands turn-taking concept',
      'Waits for own turn with prompting',
      'Says "my turn" and "your turn"'
    ],
    easierVariation: 'Very short turns, adult models patience.',
    harderVariation: 'Games with longer waits between turns.',
    tips: ['Use a visual turn indicator (special hat or toy)', 'Keep early turns very short']
  },
  {
    id: 'social-003',
    title: 'Helping Hands',
    description: 'Participate in helpful tasks to build responsibility and connection.',
    domain: 'social-emotional',
    minAgeMonths: 24,
    maxAgeMonths: 60,
    difficultyLevel: 1,
    estimatedMinutes: 10,
    materials: ['Simple household tasks appropriate for age'],
    instructions: [
      'Invite child to help with a task: "Can you help me set the table?"',
      'Give simple, specific instructions.',
      'Work alongside them, not just directing.',
      'Thank them sincerely for their help.'
    ],
    successIndicators: [
      'Willingly participates in helping',
      'Follows simple task instructions',
      'Shows pride in contribution'
    ],
    easierVariation: 'Very simple tasks like putting napkins on table.',
    harderVariation: 'Multi-step tasks or regular chores.',
    tips: ['Focus on effort, not perfection', 'Make it feel like teamwork, not a chore']
  },
  {
    id: 'social-004',
    title: 'Calm Down Corner',
    description: 'Create and practice using a calm-down space and strategies.',
    domain: 'social-emotional',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 15,
    materials: ['Cozy corner with pillows', 'Calm-down tools (stuffed animal, stress ball, books)'],
    instructions: [
      'Create a cozy, quiet space together.',
      'Explain: "This is our calm-down corner for big feelings."',
      'Practice going there when NOT upset.',
      'Role-play: "Let\'s pretend you\'re frustrated. What can we do?"'
    ],
    successIndicators: [
      'Knows calm-down strategies',
      'Goes to corner with prompting when upset',
      'Uses tools to self-soothe'
    ],
    easierVariation: 'Adult accompanies child to corner.',
    harderVariation: 'Child independently chooses to use the space.',
    tips: ['Practice when calm, not during meltdowns', 'Include child\'s choices in the corner']
  },
  {
    id: 'social-005',
    title: 'Sharing Practice',
    description: 'Practice sharing through structured play scenarios.',
    domain: 'social-emotional',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 3,
    estimatedMinutes: 10,
    materials: ['Toys or snacks to share', 'Timer (optional)'],
    instructions: [
      'With a desirable toy, model sharing: "I\'ll play, then you can have a turn."',
      'Use a timer for turn-taking if helpful.',
      'Praise sharing: "You shared the truck! That was kind."',
      'Discuss how sharing makes others feel.'
    ],
    successIndicators: [
      'Shares with prompting',
      'Begins to share independently',
      'Expresses pride in sharing'
    ],
    easierVariation: 'Share easily-dividable items like playdough.',
    harderVariation: 'Share favorite toys without timer support.',
    tips: ['Sharing is developmentally hard for toddlers - be patient', 'Praise attempts, not just success']
  },
  {
    id: 'social-006',
    title: 'Friendship Role Play',
    description: 'Act out social scenarios to practice friendship skills.',
    domain: 'social-emotional',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Dolls, puppets, or stuffed animals'],
    instructions: [
      'Use toys to act out a social scenario.',
      '"Bunny wants to play. What should Teddy say?"',
      'Practice greetings, asking to play, dealing with conflicts.',
      'Let child lead scenarios too.'
    ],
    successIndicators: [
      'Engages in pretend social scenarios',
      'Suggests appropriate responses',
      'Applies learning to real situations'
    ],
    easierVariation: 'Simple scenarios like saying hello.',
    harderVariation: 'Complex scenarios like resolving disagreements.',
    tips: ['Use scenarios from child\'s real life', 'Great for preparing for new social situations']
  },
  {
    id: 'social-007',
    title: 'Feeling Thermometer',
    description: 'Use a visual scale to communicate intensity of feelings.',
    domain: 'social-emotional',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Paper', 'Markers', 'Feelings thermometer visual'],
    instructions: [
      'Draw a thermometer with colors: green (calm), yellow (getting upset), red (very upset).',
      'Explain each zone and what it feels like in your body.',
      'Practice: "Where are you on the thermometer right now?"',
      'Connect zones to coping strategies.'
    ],
    successIndicators: [
      'Understands the thermometer zones',
      'Can identify own feeling level',
      'Connects zones to coping strategies'
    ],
    easierVariation: 'Use just 2 levels: calm and upset.',
    harderVariation: 'Add more nuanced levels and strategies.',
    tips: ['Reference the thermometer throughout the day', 'Model using it yourself']
  },
  {
    id: 'social-008',
    title: 'Kindness Jar',
    description: 'Notice and celebrate acts of kindness.',
    domain: 'social-emotional',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 1,
    estimatedMinutes: 5,
    materials: ['Jar', 'Pom poms or small objects', 'Optional: stickers'],
    instructions: [
      'Explain: "When we do something kind, we add a pom pom."',
      'Catch child being kind and celebrate: "You helped your brother! Pom pom!"',
      'Review kindnesses at end of day.',
      'Set a goal to fill the jar for a family celebration.'
    ],
    successIndicators: [
      'Understands kindness concept',
      'Points out own kind acts',
      'Notices kindness in others'
    ],
    easierVariation: 'Parent notices and adds pom poms.',
    harderVariation: 'Child notices kindness in siblings/friends.',
    tips: ['Focus on effort, not perfection', 'Include many types of kindness']
  },
  {
    id: 'social-009',
    title: 'Breathing Buddies',
    description: 'Learn deep breathing with a stuffed animal.',
    domain: 'social-emotional',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 1,
    estimatedMinutes: 5,
    materials: ['Small stuffed animal'],
    instructions: [
      'Lie down and place stuffed animal on tummy.',
      '"Watch your buddy go up and down as you breathe."',
      'Practice slow, deep breaths making buddy rise and fall.',
      'Connect to calming: "This is how we calm our bodies."'
    ],
    successIndicators: [
      'Demonstrates deep breathing',
      'Makes stuffed animal move with breath',
      'Uses breathing to calm when prompted'
    ],
    easierVariation: 'Just watch parent demonstrate.',
    harderVariation: 'Use breathing independently when upset.',
    tips: ['Practice daily, not just when upset', 'Make it fun, not a chore']
  },
  {
    id: 'social-010',
    title: 'Compliment Circle',
    description: 'Give and receive compliments to build positive self-image.',
    domain: 'social-emotional',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['None'],
    instructions: [
      'Sit in a circle with family members.',
      'Model giving a specific compliment: "I like how you helped with dishes."',
      'Go around circle, each person gives and receives a compliment.',
      'Discuss how compliments make us feel.'
    ],
    successIndicators: [
      'Gives simple compliments',
      'Receives compliments gracefully',
      'Understands impact of kind words'
    ],
    easierVariation: 'Parent prompts: "Tell daddy one thing you like about him."',
    harderVariation: 'Specific compliments about character, not just appearance.',
    tips: ['Model specific compliments about effort and character', 'Make this a regular family practice']
  },

  // ============================================
  // PRE-ACADEMIC DOMAIN (10 activities)
  // ============================================
  {
    id: 'acad-001',
    title: 'Letter Hunt',
    description: 'Find letters in the environment to build letter recognition.',
    domain: 'pre-academic',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['None - use your environment'],
    instructions: [
      'Choose a letter to find (start with first letter of child\'s name).',
      'Hunt around house or outside for that letter on signs, books, packages.',
      'Say the letter name each time you find it.',
      'Make a game: "Who can find 5 letter A\'s first?"'
    ],
    successIndicators: [
      'Recognizes target letters',
      'Points out letters independently',
      'Names some letters'
    ],
    easierVariation: 'Focus on just 2-3 familiar letters.',
    harderVariation: 'Find multiple different letters.',
    tips: ['Start with letters in child\'s name', 'Magnetic letters are great for learning']
  },
  {
    id: 'acad-002',
    title: 'Number Walk',
    description: 'Find and identify numbers in the environment.',
    domain: 'pre-academic',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['None - use your environment'],
    instructions: [
      'Go for a walk looking for numbers.',
      'Point out house numbers, speed limits, store signs.',
      'Ask "what number is that?" and help name them.',
      'Count objects you see along the way.'
    ],
    successIndicators: [
      'Recognizes some numbers',
      'Points out numbers independently',
      'Connects numbers to quantities'
    ],
    easierVariation: 'Focus on numbers 1-5.',
    harderVariation: 'Find numbers in order or recognize double digits.',
    tips: ['Take photos of numbers found', 'Connect to house numbers of friends']
  },
  {
    id: 'acad-003',
    title: 'Name Writing Practice',
    description: 'Practice writing own name with various materials.',
    domain: 'pre-academic',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 3,
    estimatedMinutes: 10,
    materials: ['Paper and crayons', 'Alternative: sand, shaving cream, finger paint'],
    instructions: [
      'Write child\'s name and point to each letter.',
      'Have child trace over your writing.',
      'Try writing in sand, shaving cream, or with finger paint.',
      'Focus on first letter initially, add more gradually.'
    ],
    successIndicators: [
      'Attempts to write first letter',
      'Writes some letters of name',
      'Recognizes own name in print'
    ],
    easierVariation: 'Focus on just the first letter.',
    harderVariation: 'Write name independently.',
    tips: ['Large motor practice (writing in sand) comes before small motor', 'Use a highlighted guide to trace']
  },
  {
    id: 'acad-004',
    title: 'Counting Collections',
    description: 'Count collections of interesting objects.',
    domain: 'pre-academic',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Collections: buttons, shells, small toys, snacks'],
    instructions: [
      'Gather a collection of interesting objects (10-20 items).',
      'Count them together using one-to-one correspondence.',
      'Sort into groups and count each group.',
      'Compare: "Which group has more?"'
    ],
    successIndicators: [
      'Counts objects accurately',
      'Compares quantities (more/less)',
      'Counts to 10 or beyond'
    ],
    easierVariation: 'Count just 5 objects.',
    harderVariation: 'Count to 20, add simple addition.',
    tips: ['Use snacks for built-in reward!', 'Create counting bags for on-the-go']
  },
  {
    id: 'acad-005',
    title: 'Rhyming Words',
    description: 'Identify and create rhyming words to build phonemic awareness.',
    domain: 'pre-academic',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Rhyming books or word cards (optional)'],
    instructions: [
      'Read a rhyming book, emphasizing the rhymes.',
      'Ask: "Cat and hat - do they rhyme? They sound the same at the end!"',
      'Play "do these rhyme?": cat/dog (no), cat/bat (yes).',
      'Make silly rhymes: "What rhymes with your name?"'
    ],
    successIndicators: [
      'Identifies rhyming pairs',
      'Generates rhyming words',
      'Notices rhymes in books and songs'
    ],
    easierVariation: 'Focus on identifying rhymes, not generating.',
    harderVariation: 'Create chains of rhyming words.',
    tips: ['Silly nonsense rhymes count!', 'Dr. Seuss books are perfect for rhyming']
  },
  {
    id: 'acad-006',
    title: 'Shape Drawing',
    description: 'Draw basic shapes to develop pre-writing skills.',
    domain: 'pre-academic',
    minAgeMonths: 30,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Paper', 'Crayons or markers'],
    instructions: [
      'Draw a shape and name it while drawing.',
      'Have child trace over your shape.',
      'Encourage child to draw their own.',
      'Progress: circle → cross → square → triangle.'
    ],
    successIndicators: [
      'Draws recognizable circles',
      'Attempts squares and triangles',
      'Names shapes while drawing'
    ],
    easierVariation: 'Focus on circles and lines.',
    harderVariation: 'Draw shapes to create pictures (house, face).',
    tips: ['Circles come first developmentally', 'Drawing in sand or shaving cream is great practice']
  },
  {
    id: 'acad-007',
    title: 'Sorting by Attribute',
    description: 'Sort objects by different attributes to build classification skills.',
    domain: 'pre-academic',
    minAgeMonths: 30,
    maxAgeMonths: 54,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['Collection of objects with various attributes'],
    instructions: [
      'Gather objects that can be sorted multiple ways.',
      'First sort by color, then re-sort by size.',
      'Ask: "What other way could we sort these?"',
      'Introduce: "These are the same because... these are different because..."'
    ],
    successIndicators: [
      'Sorts by one attribute',
      'Re-sorts by different attribute',
      'Explains sorting reasoning'
    ],
    easierVariation: 'Sort by just one obvious attribute.',
    harderVariation: 'Sort by two attributes at once.',
    tips: ['Buttons are perfect for multi-attribute sorting', 'Use compare language: same, different, alike']
  },
  {
    id: 'acad-008',
    title: 'Clapping Syllables',
    description: 'Clap out syllables in words to develop phonemic awareness.',
    domain: 'pre-academic',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 2,
    estimatedMinutes: 10,
    materials: ['None'],
    instructions: [
      'Explain: "Words have parts. Let\'s clap each part."',
      'Model: "Ba-na-na" (clap clap clap) "3 parts!"',
      'Do familiar words: child\'s name, family names, animals.',
      'Ask: "How many claps in \'elephant\'?"'
    ],
    successIndicators: [
      'Claps along with syllables',
      'Counts syllables in simple words',
      'Identifies words with more/fewer syllables'
    ],
    easierVariation: 'Clap together, don\'t count yet.',
    harderVariation: 'Clap syllables in longer, unfamiliar words.',
    tips: ['Start with 2-syllable words', 'Clapping names is engaging']
  },
  {
    id: 'acad-009',
    title: 'First Sound Games',
    description: 'Identify the first sound in words to build phonemic awareness.',
    domain: 'pre-academic',
    minAgeMonths: 42,
    maxAgeMonths: 60,
    difficultyLevel: 3,
    estimatedMinutes: 10,
    materials: ['Objects or pictures starting with various letters'],
    instructions: [
      'Pick a letter sound: "What starts with sss?"',
      'Find objects: "Sun starts with sss!"',
      'Ask: "What sound does \'dog\' start with?"',
      'Connect to letter names over time.'
    ],
    successIndicators: [
      'Identifies beginning sounds',
      'Finds objects starting with a sound',
      'Connects some sounds to letters'
    ],
    easierVariation: 'Focus on very different sounds (s vs m).',
    harderVariation: 'Find words ending with sounds.',
    tips: ['Use letter sounds, not names at first', 'Stretch out beginning sounds: "ssssnake"']
  },
  {
    id: 'acad-010',
    title: 'Story Sequencing',
    description: 'Put story events in order to develop narrative understanding.',
    domain: 'pre-academic',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    difficultyLevel: 3,
    estimatedMinutes: 10,
    materials: ['Simple sequence cards or pictures from familiar story'],
    instructions: [
      'Show 3 pictures from a familiar story in wrong order.',
      'Ask: "What happened first? Next? Last?"',
      'Help arrange in correct order.',
      'Retell the story using the pictures.'
    ],
    successIndicators: [
      'Sequences 3 events correctly',
      'Uses sequence words (first, then, last)',
      'Retells simple stories'
    ],
    easierVariation: 'Use just 2 pictures, very familiar story.',
    harderVariation: 'Sequence 4-5 events, retell without pictures.',
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
