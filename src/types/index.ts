// ============================================
// SchoolOS Core Data Models
// ============================================

// Learning Stages
export type LearningStage =
  | 'early-years'      // Ages 2-5
  | 'lower-primary'    // Grades 1-5
  | 'middle-school'    // Grades 6-8
  | 'upper-school';    // Grades 9-12

// User & Authentication
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'google';
  createdAt: string;
  updatedAt: string;
}

// Student Profile
export interface Student {
  id: string;
  parentId: string;
  name: string;
  dateOfBirth: string;
  ageInMonths: number;
  avatarUrl?: string;
  currentStage: LearningStage;
  createdAt: string;
  updatedAt: string;
}

// Learning Domains for Early Years
export type EarlyYearsDomain =
  | 'motor'           // Gross & fine motor skills
  | 'language'        // Speech, vocabulary, listening
  | 'cognitive'       // Problem-solving, memory
  | 'social-emotional' // Sharing, emotions, cooperation
  | 'pre-academic';   // Sorting, patterns, sequencing

export const DOMAIN_LABELS: Record<EarlyYearsDomain, string> = {
  'motor': 'Stewardship & Dominion',
  'language': 'Word & Truth',
  'cognitive': 'Wisdom & Order',
  'social-emotional': 'Virtue & Sanctification',
  'pre-academic': 'Foundations & Patterns'
};

export const DOMAIN_DESCRIPTIONS: Record<EarlyYearsDomain, string> = {
  'motor': 'Physical skills & body care',
  'language': 'Speech, listening & communication',
  'cognitive': 'Thinking, problem-solving & memory',
  'social-emotional': 'Character, emotions & relationships',
  'pre-academic': 'Sorting, counting & readiness'
};

// Mastery Levels
export type MasteryLevel = 'emerging' | 'developing' | 'secure';

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  'emerging': 'Emerging',
  'developing': 'Developing',
  'secure': 'Secure'
};

export const MASTERY_DESCRIPTIONS: Record<MasteryLevel, string> = {
  'emerging': 'Just starting to explore this skill',
  'developing': 'Making good progress, needs more practice',
  'secure': 'Confident and consistent with this skill'
};

// Child Role Labels (for tiered expectations)
export type ChildRole = 'Observer' | 'Participant' | 'Leader';

export function getChildRole(ageInMonths: number): ChildRole {
  if (ageInMonths <= 12) return 'Observer';
  if (ageInMonths <= 36) return 'Participant';
  return 'Leader';
}

// Activity Definition
export interface Activity {
  id: string;
  title: string;
  description: string;
  domain: EarlyYearsDomain;
  minAgeMonths: number;
  maxAgeMonths: number;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  estimatedMinutes: number;
  materials: string[];
  instructions: string[];
  successIndicators: string[];
  easierVariation?: string;
  harderVariation?: string;
  tips?: string[];
  imageUrl?: string;
}

// Activity Result (Observation)
export interface ActivityResult {
  id: string;
  studentId: string;
  activityId: string;
  completedAt: string;
  masteryLevel: MasteryLevel;
  parentNotes?: string;
  duration?: number; // in minutes
}

// Competency State (Aggregated Progress)
export interface CompetencyState {
  studentId: string;
  domain: EarlyYearsDomain;
  currentLevel: MasteryLevel;
  activitiesCompleted: number;
  lastActivityAt?: string;
  updatedAt: string;
}

// Progress Summary
export interface ProgressSummary {
  studentId: string;
  domains: {
    domain: EarlyYearsDomain;
    level: MasteryLevel;
    activitiesCompleted: number;
    percentComplete: number;
  }[];
  totalActivitiesCompleted: number;
  lastActivityAt?: string;
}

// Daily Recommendation
export interface DailyRecommendation {
  primary: Activity;
  alternatives: Activity[];
  reasoning?: string;
}

// Raw API Activity (as returned from Cloudflare Worker - snake_case)
export interface ApiActivity {
  id: string;
  title: string;
  description: string;
  domain: EarlyYearsDomain;
  min_age_months: number;
  max_age_months: number;
  difficulty: number;
  duration_minutes: number;
  materials: string[];
  instructions: string[];
  learning_outcomes?: string[];
  // New fields
  activity_type?: 'family_session' | 'individual' | 'daily_practice';
  assessment_prohibited?: number;
  context_embedding?: 'feeding' | 'diapering' | 'holding' | 'sleep' | 'outdoor' | null;
  tiered_expectations?: any[];
  uses_core_kit?: number;
  mess_level?: string | number;
  prep_time_minutes?: number;
  // Overhaul fields
  content_status?: 'draft' | 'reviewed' | 'restricted' | 'blacklisted' | 'published';
  is_archived?: number; // 0 or 1
  biblical_domain?: 'wisdom' | 'stature' | 'favor_with_god' | 'favor_with_man';
  parent_script?: string;
  safety_note?: string;
  success_cue?: string;
  cluster_tag?: string;
  // Feedback
  upvote_count?: number;
  comment_count?: number;
}

// Family Activity (for sibling-aware recommendations - legacy)
export interface FamilyActivity {
  activity: ApiActivity;
  suitableFor: string[];
  variations: Record<string, 'easier' | 'standard' | 'harder'>;
}

// Today's Learning Response (extended for family activities)
export interface TodaysLearningResponse {
  student: Student;
  activities: ApiActivity[];
  familyActivities?: FamilyActivity[];
}

export interface MaterialItem {
  name: string;
  status: 'have' | 'willing_to_buy' | 'not_interested' | 'unknown';
}

export interface FamilySession {
  activity: ApiActivity;
  childTiers: {
    childId: string;
    childName: string;
    tier: string;
    expectation: string;
    childAge: number;
  }[];
  messLevel: string | number;
  prepMinutes: number;
  materialsAvailable: boolean;
  reasoning?: string;
}

// Family Dashboard Response
export interface FamilyTodayResponse {
  date: string;
  children: Student[];
  familySessions: FamilySession[];
  materials: MaterialItem[];
  totalDuration: number;
  coreKitCoverage: number;
  // Unified Plan System additions (optional states)
  restDay?: boolean;
  needsPlan?: boolean;
  message?: string;
  dailyPractices?: ApiActivity[];
}

// ============================================
// Books & Reading System
// ============================================

export interface Book {
  id: string;  // Folder name (snake_case) - use for API URLs
  series: string;  // Folder name (snake_case) - use for API URLs
  seriesTitle?: string;  // Human-readable series name for display
  title: string;
  author?: string;
  illustrator?: string;
  description: string;
  minAgeMonths: number;
  maxAgeMonths: number;
  pageCount: number;
  domain: string;
  learningStage: string;
  readingPrompts?: { page: number; prompt: string }[];
  coverUrl?: string;
  upvoteCount?: number;
  commentCount?: number;
  renderFormat?: 'image' | 'markdown' | 'hybrid' | 'pdf' | 'hymnal' | 'catechism' | 'json-embedded';
  pdfUrl?: string; // External URL for PDF content
  contentPath?: string;  // Path to content.md if markdown/hybrid
  styleProfile?: string; // CSS class for styling (e.g., "hymn-book")
  topics?: string[];
  protagonistGender?: 'male' | 'female' | 'mixed' | 'animal';
  energyLevel?: 'high' | 'moderate' | 'low';
}

export interface ReadingSession {
  id: string;
  parentId: string;
  bookId: string;
  series: string;
  childrenPresent?: string[];
  notes?: string;
  completedAt: string;
}

// ============================================
// Daily Liturgy System
// ============================================

export type LiturgyType = 'catechism' | 'hymn' | 'scripture';

export interface LiturgyItem {
  id: string;
  type: LiturgyType;
  source: string;
  sequence_number: number;
  title: string;
  content: string;
  reference?: string;
  audio_url?: string;
  min_age_months: number;
  max_age_months: number;
  completedToday?: boolean;
}

export interface FamilyLiturgySettings {
  id: string;
  parent_id: string;
  catechism_enabled: boolean;
  catechism_source: string;
  hymnal_enabled: boolean;
  hymnal_source: string;
  scripture_enabled: boolean;
  bible_translation: string;
  current_catechism_week: number;
  current_hymn_week: number;
  current_scripture_week: number;
}

export interface LiturgyTodayResponse {
  date: string;
  settings: FamilyLiturgySettings;
  items: LiturgyItem[];
}

export const LITURGY_TYPE_LABELS: Record<LiturgyType, string> = {
  catechism: 'Catechism',
  hymn: 'Hymn of the Week',
  scripture: 'Memory Verse'
};

export const LITURGY_TYPE_ICONS: Record<LiturgyType, string> = {
  catechism: 'BookBookmark',
  hymn: 'MusicNotes',
  scripture: 'Scroll'
};

// ============================================
// Feedback & Community
// ============================================

export interface ContentUpvote {
  id: string;
  userId: string;
  contentType: 'activity' | 'book';
  contentId: string;
  createdAt: string;
}

export interface ParentComment {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  contentType: 'activity' | 'book';
  contentId: string;
  commentText: string;
  isSuccessStory: boolean;
  createdAt: string;
}

// ============================================
// Portfolio System
// ============================================

export type PortfolioItemType = 'image' | 'audio' | 'document' | 'text';

// Milestone tags for Phase 2 (narrative achievements, not scores)
export const MILESTONE_TAGS = [
  'First Steps',
  'First Words',
  'Counting to 10',
  'Recognizing Letters',
  'Writing Name',
  'Reading First Book',
  'Completed Project',
  'Artistic Achievement',
  'Musical Achievement',
  'Scientific Discovery',
  'Acts of Service',
  'Biblical Memorization',
  'Physical Milestone',
  'Social Achievement',
  'Other Milestone'
] as const;

export type MilestoneTag = typeof MILESTONE_TAGS[number];

export interface PortfolioItem {
  id: string;
  studentId: string;
  parentId: string;
  title: string;
  description?: string;
  itemType: PortfolioItemType;
  r2Key?: string;
  publicUrl?: string; // Generated signed URL
  domain?: EarlyYearsDomain | string;
  relatedActivityId?: string;
  milestoneTag?: MilestoneTag | string;
  createdAt: string;
}

export * from './overrides';


// ============================================
// Unified Weekly Planner
// ============================================

export interface ActivityCompletion {
  completedAt: string;
  type: 'completion' | 'observation';
}

export interface WeeklyPlanResponse {
  id: string;
  weekStart: string;
  plan: any; // We can refine this later if needed
  cached: boolean;
  completions?: Record<string, ActivityCompletion>;
}

// ============================================
// Phase 3: Graduated Independence
// ============================================

export type IndependenceLevel = 'parent_led' | 'guided' | 'independent';

export type IndependenceSubject =
  | 'all'
  | 'bible'
  | 'history'
  | 'math'
  | 'reading'
  | 'motor'
  | 'language'
  | 'cognitive'
  | 'social-emotional'
  | 'pre-academic';

export interface IndependenceSettings {
  id: string;
  parentId: string;
  studentId: string;
  subject: IndependenceSubject;
  level: IndependenceLevel;
  canMarkComplete: boolean;
  canAskAi: boolean;
  canViewPortfolio: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AIInteractionType = 'explain' | 'socratic' | 'feedback';

export interface AIInteractionLog {
  id: string;
  parentId: string;
  studentId?: string;
  studentName?: string;  // Joined for display
  interactionType: AIInteractionType;
  question: string;
  answer: string;
  context?: {
    activityId?: string;
    activityTitle?: string;
    domain?: string;
  };
  createdAt: string;
}

export const INDEPENDENCE_LEVEL_LABELS: Record<IndependenceLevel, string> = {
  'parent_led': 'Parent-Led',
  'guided': 'Guided',
  'independent': 'Independent'
};

export const INDEPENDENCE_LEVEL_DESCRIPTIONS: Record<IndependenceLevel, string> = {
  'parent_led': 'Parent leads all activities and discussions',
  'guided': 'Child works with parent oversight and regular check-ins',
  'independent': 'Child works independently, parent reviews completion'
};

export const SUBJECT_LABELS: Record<IndependenceSubject, string> = {
  'all': 'All Subjects',
  'bible': 'Bible & Faith',
  'history': 'History',
  'math': 'Math',
  'reading': 'Reading',
  'motor': 'Physical Skills',
  'language': 'Language',
  'cognitive': 'Thinking Skills',
  'social-emotional': 'Character & Emotions',
  'pre-academic': 'Pre-Academic'
};

// Student View Data (returned from /api/student-view/:studentId)
export interface StudentViewData {
  student: Student;
  independenceSettings: IndependenceSettings[];
  tasks: ApiActivity[];
  portfolioItems: PortfolioItem[];
  permissions: {
    canMarkComplete: boolean;
    canAskAi: boolean;
    canViewPortfolio: boolean;
  };
}

// ============================================
// Formation System (Unified Rhythm & Progress)
// ============================================

export type FormationStream = 'activity' | 'reading' | 'liturgy';

export interface FormationPreferences {
  activitiesEnabled: boolean;
  readingEnabled: boolean;
  liturgyEnabled: boolean;
}

export interface DailyRhythmItem {
  id: string;
  timeSlot: string;
  title: string;
  description?: string;
  type: 'liturgy' | 'activity' | 'book' | 'meal' | 'outdoor' | 'rest' | 'learning';
  status: 'upcoming' | 'current' | 'completed';
  data?: any;
}

export interface DailyRhythmResponse {
  date: string;
  items: DailyRhythmItem[];
  completions: Record<string, boolean>;
  preferences: FormationPreferences;
}

export interface FormationProgress {
  enabledStreams: FormationStream[];
  activityProgress: {
    totalCompleted: number;
    byDomain: { domain: string; mastery_level: string; count: number }[];
    recentActivity: { date: string; count: number }[];
  };
  readingProgress: {
    sessionsCount: number;
    distinctBooks: number;
  };
  liturgyProgress: {
    daysPracticed: number;
    currentStreak: number;
  };
}

