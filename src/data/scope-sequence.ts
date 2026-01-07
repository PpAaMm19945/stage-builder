import { EarlyYearsDomain } from '@/types';

export interface AgeBand {
  id: string;
  label: string;
  metaphor: string;
  ageRangeMonths: [number, number];
  summary: string;
  domains: {
    domain: EarlyYearsDomain;
    focus: string;
    description?: string;
  }[];
}

export const AGE_BANDS: AgeBand[] = [
  {
    id: 'observer',
    label: '0-1 Years',
    metaphor: 'The Observer',
    ageRangeMonths: [0, 12],
    summary: 'A time of bonding, sensory discovery, and building the foundations of trust and attachment.',
    domains: [
      {
        domain: 'motor',
        focus: 'Core strength & first movements',
        description: 'Lifts head during tummy time, learns to sit independently, and begins to crawl.'
      },
      {
        domain: 'language',
        focus: 'Listening & first sounds',
        description: 'Attends to voices, coos, babbles, and may say first meaningful words like "mama".'
      },
      {
        domain: 'cognitive',
        focus: 'Observing faces & objects',
        description: 'Follows objects with eyes, recognizes familiar faces, and learns that unseen objects still exist.'
      },
      {
        domain: 'social-emotional',
        focus: 'Bonding & trust',
        description: 'Forms deep attachments with caregivers and begins to smile and engage socially.'
      },
      {
        domain: 'pre-academic',
        focus: 'Sensory exploration',
        description: 'Learns through touch, sight, sound, and mouthing objects to understand the world.'
      }
    ]
  },
  {
    id: 'explorer',
    label: '1-2 Years',
    metaphor: 'The Explorer',
    ageRangeMonths: [12, 24],
    summary: 'Driven by curiosity to move, touch, and name everything in their expanding world.',
    domains: [
      {
        domain: 'motor',
        focus: 'Walking & exploring',
        description: ' Takes first steps, walks with confidence, and begins to run and climb.'
      },
      {
        domain: 'language',
        focus: 'Naming the world',
        description: 'Vocabulary explodes from single words to simple phrases as they label their world.'
      },
      {
        domain: 'cognitive',
        focus: 'Cause & effect',
        description: 'Solves simple problems, stacks blocks, and explores how things work.'
      },
      {
        domain: 'social-emotional',
        focus: 'Noticing others',
        description: 'Plays alongside other children (parallel play) and begins to assert independence.'
      },
      {
        domain: 'pre-academic',
        focus: 'Helping & book handling',
        description: 'Enjoys turning pages in board books and mimicking simple household tasks.'
      }
    ]
  },
  {
    id: 'imitator',
    label: '2-3 Years',
    metaphor: 'The Imitator',
    ageRangeMonths: [24, 36],
    summary: 'Copying the words, actions, and routines of those they love to learn how to be.',
    domains: [
      {
        domain: 'motor',
        focus: 'Running & jumping',
        description: 'Jumps with two feet, runs well, and begins to use utensils and crayons.'
      },
      {
        domain: 'language',
        focus: 'Speaking in sentences',
        description: 'Combines words to express thoughts, asks "what\'s that?", and follows simple directions.'
      },
      {
        domain: 'cognitive',
        focus: 'Sorting & matching',
        description: 'Sorts objects by color or shape and begins to understand simple categories.'
      },
      {
        domain: 'social-emotional',
        focus: 'Playing alongside friends',
        description: 'Shows more interest in other children and begins to understand ownership ("mine!").'
      },
      {
        domain: 'pre-academic',
        focus: 'Simple chores',
        description: 'Can help put away toys, wipe spills, and follow simple routines.'
      }
    ]
  },
  {
    id: 'helper',
    label: '3-4 Years',
    metaphor: 'The Helper',
    ageRangeMonths: [36, 48],
    summary: 'Eager to contribute, cooperate, and use their growing skills to participate in family life.',
    domains: [
      {
        domain: 'motor',
        focus: 'Using hands & tools',
        description: 'Refines fine motor skills for drawing, buttoning, and using scissors with help.'
      },
      {
        domain: 'language',
        focus: 'Telling stories',
        description: 'Retells simple events, uses complex sentences, and asks "why?" frequently.'
      },
      {
        domain: 'cognitive',
        focus: 'Counting 1-10',
        description: 'Understands the concept of counting and quantity up to 10.'
      },
      {
        domain: 'social-emotional',
        focus: 'Playing together',
        description: 'Engages in cooperative play, takes turns with help, and identifies feelings.'
      },
      {
        domain: 'pre-academic',
        focus: 'Drawing & creating',
        description: 'Draws recognizable shapes and figures, and engages in imaginative dramatic play.'
      }
    ]
  },
  {
    id: 'narrator',
    label: '4-5 Years',
    metaphor: 'The Narrator',
    ageRangeMonths: [48, 60],
    summary: 'Weaving facts and imagination into stories as they make sense of relationships and ideas.',
    domains: [
      {
        domain: 'motor',
        focus: 'Balance & coordination',
        description: 'Hops on one foot, catches a ball, and dresses independently.'
      },
      {
        domain: 'language',
        focus: 'Rhymes & letters',
        description: 'Enjoys rhyming games, recognizes some letters, and narrates detailed stories.'
      },
      {
        domain: 'cognitive',
        focus: 'Patterns & sequences',
        description: 'Recognizes patterns, understands time concepts (yesterday/tomorrow), and puzzles.'
      },
      {
        domain: 'social-emotional',
        focus: 'Understanding feelings',
        description: 'Shows empathy for others, plays cooperatively with rules, and manages some emotions.'
      },
      {
        domain: 'pre-academic',
        focus: 'Attention & focus',
        description: 'Sustains attention for longer periods and follows multi-step instructions.'
      }
    ]
  },
  {
    id: 'builder',
    label: '5-6 Years',
    metaphor: 'The Builder',
    ageRangeMonths: [60, 72],
    summary: 'Constructing complex ideas, friendships, and projects as they prepare for formal learning.',
    domains: [
      {
        domain: 'motor',
        focus: 'Active mastery',
        description: 'Moves with coordination, rides a bike, and has good control of pencil and tools.'
      },
      {
        domain: 'language',
        focus: 'Early reading skills',
        description: 'May begin to read simple words, understands sounds-symbol connection, and speaks clearly.'
      },
      {
        domain: 'cognitive',
        focus: 'Reasoning & logic',
        description: 'Uses logical reasoning, understands simple math concepts, and plans ahead.'
      },
      {
        domain: 'social-emotional',
        focus: 'Patience & self-control',
        description: 'Demonstrates greater self-control, resolves conflicts with words, and is a reliable friend.'
      },
      {
        domain: 'pre-academic',
        focus: 'School readiness',
        description: 'Ready for more formal instruction, follows classroom-style rules, and eager to learn.'
      }
    ]
  }
];
