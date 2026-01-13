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
// Virtues (Replaces Domains)
export type PrimaryVirtue =
  | 'Wisdom'
  | 'Stewardship'
  | 'Love'
  | 'Order'
  | 'Wonder';

export const VIRTUE_LABELS: Record<PrimaryVirtue, string> = {
  'Wisdom': 'Wisdom',
  'Stewardship': 'Stewardship',
  'Love': 'Love',
  'Order': 'Order',
  'Wonder': 'Wonder'
};

export const VIRTUE_DESCRIPTIONS: Record<PrimaryVirtue, string> = {
  'Wisdom': 'Discernment and understanding',
  'Stewardship': 'Care for body and world',
  'Love': 'Kindness and service',
  'Order': 'Structure and diligence',
  'Wonder': 'Awe and creativity'
};

// Legacy Domain Support (for backward compatibility)
export type LegacyDomain = 'motor' | 'language' | 'cognitive' | 'social-emotional' | 'pre-academic';

export const DOMAIN_TO_VIRTUE: Record<LegacyDomain | string, PrimaryVirtue> = {
  'motor': 'Stewardship',
  'language': 'Wisdom',
  'cognitive': 'Wisdom',
  'social-emotional': 'Love',
  'pre-academic': 'Order',
  'Wisdom': 'Wisdom',
  'Stewardship': 'Stewardship',
  'Love': 'Love',
  'Order': 'Order',
  'Wonder': 'Wonder'
};

// Legacy compatibility: EarlyYearsDomain now points to PrimaryVirtue but we allow string for legacy
export type EarlyYearsDomain = PrimaryVirtue | LegacyDomain | string;
export const DOMAIN_LABELS = VIRTUE_LABELS;


// Formation Stages (Replaces Mastery)
export type FormationStage = 'seeding' | 'rooting' | 'fruiting';

export const STAGE_LABELS: Record<FormationStage, string> = {
  'seeding': 'Seeding',
  'rooting': 'Rooting',
  'fruiting': 'Fruiting'
};

export const STAGE_DESCRIPTIONS: Record<FormationStage, string> = {
  'seeding': 'Just introduced (Hearing)',
  'rooting': 'Practicing with help (Doing)',
  'fruiting': 'Second nature (Being)'
};

// Legacy Mastery Support
export type MasteryLevel = FormationStage | string;
export const MASTERY_LABELS = STAGE_LABELS;


// Child Role Labels (for tiered expectations)
export type ChildRole = 'Observer' | 'Participant' | 'Leader';

export function getChildRole(ageInMonths: number): ChildRole {
  if (ageInMonths <= 12) return 'Observer';
  if (ageInMonths <= 36) return 'Participant';
  return 'Leader';
}

// Formation Definition (Replaces Activity)
export type FormationType = 'liturgy' | 'habit' | 'skill' | 'service' | 'rest';

export interface Formation {
  id: string;
  title: string;
  description: string;
  primary_virtue: PrimaryVirtue;
  formation_type: FormationType;
  context_anchor: string; // e.g., 'Meal_Table', 'Walk_By_The_Way'
  parent_posture: string; // CRITICAL: Parent's spirit
  liturgical_script?: string;
  min_age_months: number;
  max_age_months: number;
  guide_steps: string[]; // Replaces instructions

  // Optional / Legacy compatible
  materials: string[];
  duration_minutes: number;
  imageUrl?: string;

  // Legacy aliases
  domain?: EarlyYearsDomain;
  instructions?: string[];
  parent_script?: string;
  estimatedMinutes?: number;
  difficultyLevel?: number;
  successIndicators?: string[];
  easierVariation?: string;
  harderVariation?: string;
  tips?: string[];
}

// Evidence (Replaces ActivityResult/Observation)
export interface Evidence {
  id: string;
  studentId: string;
  formationId: string; // was activityId
  completedAt: string;
  stage: FormationStage; // was masteryLevel
  note?: string; // was parentNotes
  duration?: number;
}

// Competency State (Aggregated Progress)
export interface CompetencyState {
  studentId: string;
  virtue: PrimaryVirtue;
  currentStage: FormationStage;
  formationsCompleted: number;
  lastFormationAt?: string;
  updatedAt: string;
}

// Progress Summary
export interface ProgressSummary {
  studentId: string;
  virtues: {
    virtue: PrimaryVirtue;
    stage: FormationStage;
    formationsCompleted: number;
    percentComplete: number;
  }[];
  totalFormationsCompleted: number;
  lastFormationAt?: string;
}

// Daily Recommendation -> Family Rhythm
export interface FamilyRhythm {
  primary: Formation;
  alternatives: Formation[];
  reasoning?: string;
}

// Raw API Formation (from DB)
export interface ApiFormation {
  id: string;
  title: string;
  description: string;
  primary_virtue: PrimaryVirtue;
  formation_type: FormationType;
  context_anchor: string;
  parent_posture: string;
  liturgical_script?: string;
  guide_steps: string[];
  min_age_months: number;
  max_age_months: number;
  duration_minutes: number;
  materials: string[];

  // Legacy / Optional
  domain?: EarlyYearsDomain;
  instructions?: string[];
  parent_script?: string;
  activity_type?: string;
  difficulty?: number;
  learning_outcomes?: string[];
  content_status?: string;
  is_archived?: number;
  biblical_domain?: string;
  safety_note?: string;
  success_cue?: string;
  cluster_tag?: string;
  upvote_count?: number;
  comment_count?: number;

  // Static data compatibility
  estimatedMinutes?: number;
  difficultyLevel?: number;
  successIndicators?: string[];
  easierVariation?: string;
  harderVariation?: string;
  tips?: string[];
  imageUrl?: string;
}

export type ApiActivity = ApiFormation; // Alias for legacy code

// Legacy Static Data Interface (camelCase) - used in src/data/activities.ts
export interface LegacyStaticActivity {
  id: string;
  title: string;
  description: string;
  domain: EarlyYearsDomain | string;
  minAgeMonths: number;
  maxAgeMonths: number;
  difficultyLevel: number;
  estimatedMinutes: number;
  materials: string[];
  instructions: string[];
  successIndicators?: string[];
  easierVariation?: string;
  harderVariation?: string;
  tips?: string[];
  imageUrl?: string;
}

// Re-export Formation as Activity for legacy code,
// but ensure it covers legacy fields (which Formation does now)
export type Activity = Formation | ApiFormation | LegacyStaticActivity;

// Family Formation (for sibling-aware recommendations)
export interface FamilyFormation {
  formation: ApiFormation;
  suitableFor: string[];
  variations: Record<string, 'easier' | 'standard' | 'harder'>;
}

export type FamilyActivity = FamilyFormation; // Alias

// Today's Learning Response
export interface TodaysLearningResponse {
  student: Student;
  formations: ApiFormation[];
  familyFormations?: FamilyFormation[];

  // Legacy aliases
  activities?: ApiFormation[];
  familyActivities?: FamilyFormation[];
}

export interface MaterialItem {
  name: string;
  status: 'have' | 'willing_to_buy' | 'not_interested' | 'unknown';
}

export interface FamilySession {
  activity: ApiFormation; // Keeps 'activity' key for now to avoid breaking everything instantly
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
  duration?: number;
}

// ============================================
// Daily Liturgy System
// ============================================

export type LiturgyType = 'catechism' | 'hymn' | 'scripture' | 'history';

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
  scripture: 'Memory Verse',
  history: 'History Story'
};

export const LITURGY_TYPE_ICONS: Record<LiturgyType, string> = {
  catechism: 'BookBookmark',
  hymn: 'MusicNotes',
  scripture: 'Scroll',
  history: 'Hourglass'
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
  balance_preference?: string;
  tier_distribution?: any;
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
  type: 'liturgy' | 'activity' | 'book' | 'meal' | 'outdoor' | 'rest' | 'learning' | 'section_header';
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
