// ============================================
// SchoolOS Core Data Models (Unified v2 Schema)
// ============================================

// Re-export from overrides.ts for backward compatibility
export type {
  ParentOverride,
  ParsedOverrideResponse,
  OverrideType,
  OverrideConstraints,
  WeeklyTimeModel,
  WeeklyPlan as OverridesWeeklyPlan,
  PlanSlot,
  DayOfWeek,
  TimeOfDay,
  ExplanationRequest,
  ExplanationResponse
} from './overrides';

// Learning Stages (Legacy Support + Future)
export type LearningStage =
  | 'early-years'      // Ages 2-5
  | 'lower-primary'    // Grades 1-5
  | 'middle-school'    // Grades 6-8
  | 'upper-school';    // Grades 9-12

// ============================================
// 1. USERS & STUDENTS (Auth)
// ============================================

export type UserRole = 'parent' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  householdId: string;
  studentId?: string; // If role is student
  avatarUrl?: string;
  provider: 'google';
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  householdId: string;
  name: string;
  dateOfBirth: string;
  pendingLoginEmail?: string; // For linking to user account
  avatarUrl?: string;

  // Computed
  ageInMonths: number;
  currentStage: LearningStage;

  createdAt: string;
  updatedAt: string;
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 3. FORMATIONS (Unified Content)
// ============================================

export type FormationType =
  | 'skill'
  | 'habit'
  | 'liturgy'
  | 'reading'
  | 'service'
  | 'rest';

export type PrimaryVirtue =
  | 'Wisdom'
  | 'Stewardship'
  | 'Love'
  | 'Order'
  | 'Wonder';

export type ContextAnchor =
  | 'Morning_Circle'
  | 'Meal_Table'
  | 'Walk_By_The_Way'
  | 'Bedside'
  | 'Anytime'
  | 'Transition'
  | 'Sabbath';

export const VIRTUE_LABELS: Record<PrimaryVirtue, string> = {
  'Wisdom': 'Wisdom',
  'Stewardship': 'Stewardship',
  'Love': 'Love',
  'Order': 'Order',
  'Wonder': 'Wonder'
};

export const TYPE_LABELS: Record<FormationType, string> = {
  skill: 'Skill',
  habit: 'Habit',
  liturgy: 'Liturgy',
  reading: 'Reading',
  service: 'Service',
  rest: 'Rest'
};

// Main Formation Interface
export interface Formation {
  id: string;
  title: string;
  description: string;

  // Classification
  formation_type: FormationType;
  primary_virtue: PrimaryVirtue;
  context_anchor: ContextAnchor | string; // Allow string for flexibility but prefer strict
  cluster_tag?: string;

  // Age & Timing
  min_age_months: number;
  max_age_months: number;
  duration_minutes: number;

  // Content - Universal
  guide_steps: string[];      // JSON array in DB
  parent_posture: string;     // The "Spirit" of the activity
  materials: string[];        // JSON array in DB

  // Content - Specific
  liturgical_script?: string; // For liturgy

  // Content - Reading
  content_path?: string;
  cover_image_url?: string;
  page_count?: number;
  render_format?: 'markdown' | 'image' | 'pdf' | 'hymnal' | 'catechism';

  // Content - Legacy/Compat
  imageUrl?: string;

  // Metadata
  is_active: number; // 1 or 0
  content_source: string;
  difficulty?: number;  // 1-5 scale, optional

  // ============================================
  // LEGACY COMPATIBILITY FIELDS
  // These map to new fields for backward compat
  // ============================================
  /** @deprecated Use primary_virtue instead */
  domain?: string;
  /** @deprecated Use formation_type instead */
  activity_type?: string;
  /** @deprecated Use guide_steps instead */
  instructions?: string[];
  /** @deprecated Use parent_posture instead */
  parent_script?: string;
  /** @deprecated Derive from description */
  learning_outcomes?: string[];
}

// ============================================
// 4. PROGRESSIONS (Age Variants)
// ============================================

export type FormationStage = 'seedling' | 'sprout' | 'sapling' | 'tree' | 'oak';

export interface FormationProgression {
  id: string;
  formation_id: string;
  stage: FormationStage;
  simplified_content: string;
  memory_portion?: string;
  parent_teaching_note?: string;
}

// ============================================
// 5. EVIDENCES (Progress)
// ============================================

export type HabitStage = 'Seeding' | 'Rooting' | 'Fruiting';

// Labels for HabitStage (mastery levels)
export const HABIT_STAGE_LABELS: Record<HabitStage, string> = {
  'Seeding': 'Getting Started',
  'Rooting': 'Growing',
  'Fruiting': 'Well Practiced'
};

export const HABIT_STAGE_DESCRIPTIONS: Record<HabitStage, string> = {
  'Seeding': 'Hearing / Being introduced',
  'Rooting': 'Doing / Practicing',
  'Fruiting': 'Being / Second nature'
};

// Alias for components using lowercase (seeding/rooting/fruiting)
// Maps lowercase to proper HabitStage
export const LOWERCASE_TO_HABIT_STAGE: Record<string, HabitStage> = {
  'seeding': 'Seeding',
  'rooting': 'Rooting',
  'fruiting': 'Fruiting'
};

// STAGE_LABELS and STAGE_DESCRIPTIONS for FormationStage (age progression)
export const STAGE_LABELS: Record<FormationStage, string> = {
  'seedling': 'Seedling (0-18m)',
  'sprout': 'Sprout (18m-3y)',
  'sapling': 'Sapling (3-5y)',
  'tree': 'Tree (5-8y)',
  'oak': 'Oak (8+y)'
};

export const STAGE_DESCRIPTIONS: Record<FormationStage, string> = {
  'seedling': 'Observer - watching and absorbing',
  'sprout': 'Participant - joining in with help',
  'sapling': 'Contributor - actively participating',
  'tree': 'Practitioner - doing with guidance',
  'oak': 'Leader - independent mastery'
};

export interface Evidence {
  id: string;
  studentId?: string; // Nullable for family items
  parentId: string;
  formationId: string;

  // Status
  habitStage?: HabitStage;
  notes?: string;
  durationMinutes?: number;
  lovedIt?: boolean;

  capturedAt: string;
}

// ============================================
// 6. PREFERENCES
// ============================================

export interface FamilyPreferences {
  id: string;
  parentId: string;
  pace: 'gentle' | 'standard' | 'accelerated';
  mode: 'baby' | 'standard' | 'independent';
  learningFocus: 'balanced' | 'interests' | 'gaps';

  // Toggles
  activitiesEnabled: boolean;
  readingEnabled: boolean;
  liturgyEnabled: boolean;

  // Rotation State
  currentCatechismWeek: number;
  currentHymnWeek: number;
  currentScriptureWeek: number;
}

// ============================================
// 7. WEEKLY PLANS & RHYTHM
// ============================================

export interface DailyRhythmItem {
  id: string;
  timeSlot: string;
  title: string; // The display title
  description?: string;
  type: FormationType | 'section_header' | 'book'; // 'book' acts as a specific render type sometimes
  status: 'upcoming' | 'current' | 'completed';

  // The underlying data
  data?: Formation;
}

export interface WeeklyPlan {
  id: string;
  weekStart: string;
  plan: any; // JSON blob of the plan structure
  balancePreference: string;
}

// ============================================
// 8. AI LOGS
// ============================================

export interface AIInteractionLog {
  id: string;
  parentId: string;
  studentId?: string;
  interactionType: 'explain' | 'socratic' | 'feedback' | 'search';
  question: string;
  answer: string;
  context?: any;
  createdAt: string;
  // Joined field for display
  studentName?: string;
}

// ============================================
// 9. PORTFOLIO
// ============================================

export interface PortfolioItem {
  id: string;
  studentId: string;
  parentId: string;
  title: string;
  description?: string;
  itemType: 'image' | 'audio' | 'document' | 'text';
  r2Key?: string;
  formationId?: string;
  milestoneTag?: string;
  createdAt: string;
  // Extended fields for display
  publicUrl?: string;
  domain?: string;
}


// ============================================
// LEGACY COMPATIBILITY TYPES
// Used to prevent breaking existing components immediately
// ============================================

// Legacy Domain Support
export type LegacyDomain = 'motor' | 'language' | 'cognitive' | 'social-emotional' | 'pre-academic';
export type EarlyYearsDomain = PrimaryVirtue | LegacyDomain | string;

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

// Legacy Activity Interface - mapped to Formation
export type ApiFormation = Formation;
export type ApiActivity = Formation; // Alias
export type Activity = Formation;    // Alias

// Legacy Book Interface (expanded for component compatibility)
export interface Book {
  id: string;
  series: string;
  seriesTitle?: string;  // Display name for series
  title: string;
  author?: string;
  description: string;
  minAgeMonths: number;
  maxAgeMonths: number;
  pageCount: number;
  coverUrl?: string;
  contentPath?: string;
  // Mapped from Formation if loaded from DB
  formationId?: string;

  // Extended fields for BookReader/BookCard/BookLibrary
  renderFormat?: 'markdown' | 'image' | 'pdf' | 'hymnal' | 'catechism' | 'hybrid';
  readingPrompts?: ReadingPrompt[] | string[];
  styleProfile?: string;
  pdfUrl?: string;
  upvoteCount?: number;
  learningStage?: LearningStage | 'all';
  domain?: string;
  topics?: string[];
  protagonistGender?: 'male' | 'female' | 'neutral' | 'animal' | 'mixed';
}

// Reading prompt structure  
export interface ReadingPrompt {
  page: number;
  prompt: string;
}

// Legacy Material Item
export interface MaterialItem {
  name: string;
  status: 'have' | 'willing_to_buy' | 'not_interested' | 'unknown';
}

// Legacy Family Session (often just wraps a Formation)
export interface FamilySession {
  activity: Formation;
  childTiers: any[];
  reasoning?: string;
}

// Legacy Responses
export interface FamilyTodayResponse {
  date: string;
  children: Student[];
  familySessions: FamilySession[];
  materials: MaterialItem[];
  // New fields
  needsPlan?: boolean;
  restDay?: boolean;
  message?: string;
  dailyPractices?: Formation[];
}

export interface TodaysLearningResponse {
  student: Student;
  formations: Formation[];
  // Legacy maps
  activities?: Formation[];
}

// Liturgy Type for daily liturgy components
export type LiturgyType = 'catechism' | 'hymn' | 'scripture' | 'history';

// Legacy Liturgy Items
// These are often just Formations with type='liturgy' now
export interface LiturgyItem {
  id: string;
  type: LiturgyType | string;
  title: string;
  content: string; // mapped from liturgical_script
  reference?: string;
  // Extended for completion tracking
  completedToday?: boolean;
}

// Legacy Reading
export interface ReadingSession {
  id: string;
  bookId: string;
  completedAt: string;
}

export interface ParentComment {
  id: string;
  userId: string;
  commentText: string;
  createdAt: string;
  // Extended fields for display
  userName?: string;
  userAvatar?: string;
  isSuccessStory?: boolean;
}

export interface StudentViewData {
  student: Student;
  tasks: Formation[];
  portfolioItems: PortfolioItem[];
  permissions: {
    canMarkComplete: boolean;
    canAskAi: boolean;
    canViewPortfolio: boolean;
  };
}

// ============================================
// INDEPENDENCE SETTINGS (Student Portal)
// ============================================

// Extended to support legacy subjects used in components
export type IndependenceLevel = 'parent_led' | 'guided' | 'independent';
export type IndependenceSubject =
  | 'reading' | 'math' | 'science' | 'history' | 'writing' | 'all'
  // Legacy subject names used in existing components
  | 'bible' | 'motor' | 'language' | 'cognitive';

export interface IndependenceSettings {
  studentId: string;
  subject: IndependenceSubject;
  level: IndependenceLevel;
  canMarkComplete: boolean;
  canAskAi: boolean;
  requiresParentApproval: boolean;
  // Extended fields for components
  canViewPortfolio?: boolean;
}

export const INDEPENDENCE_LEVEL_LABELS: Record<IndependenceLevel, string> = {
  'parent_led': 'Parent-Led',
  'guided': 'Guided',
  'independent': 'Independent'
};

export const INDEPENDENCE_LEVEL_DESCRIPTIONS: Record<IndependenceLevel, string> = {
  'parent_led': 'Parent teaches and supervises all work',
  'guided': 'Student works with parent available for help',
  'independent': 'Student works alone, parent reviews later'
};

export const SUBJECT_LABELS: Record<string, string> = {
  'reading': 'Reading',
  'math': 'Mathematics',
  'science': 'Science',
  'history': 'History',
  'writing': 'Writing',
  'all': 'All Subjects',
  // Legacy subjects
  'bible': 'Bible & Faith',
  'motor': 'Physical Skills',
  'language': 'Language',
  'cognitive': 'Thinking Skills'
};

// ============================================
// FAMILY LITURGY SETTINGS
// ============================================

export interface FamilyLiturgySettings {
  id: string;
  parentId: string;
  catechismEnabled: boolean;
  hymnEnabled: boolean;
  scriptureEnabled: boolean;
  historyEnabled: boolean;
  currentCatechismWeek: number;
  currentHymnWeek: number;
  currentScriptureWeek: number;
  currentHistoryWeek: number;
  // Legacy snake_case aliases for API compatibility
  catechism_enabled?: boolean;
  hymnal_enabled?: boolean;
  scripture_enabled?: boolean;
  history_enabled?: boolean;
}

// ============================================
// DOMAIN LABELS (Legacy + Virtue mapping)
// ============================================

export const DOMAIN_LABELS: Record<string, string> = {
  // Legacy domains
  'motor': 'Physical Development',
  'language': 'Language & Communication',
  'cognitive': 'Thinking & Problem Solving',
  'social-emotional': 'Social & Emotional',
  'pre-academic': 'Early Learning',
  // New virtues
  'Wisdom': 'Wisdom',
  'Stewardship': 'Stewardship',
  'Love': 'Love',
  'Order': 'Order',
  'Wonder': 'Wonder'
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the developmental role label based on age in months
 * @param ageMonths - Child's age in months
 * @returns Role label (Observer, Participant, or Leader)
 */
export function getChildRole(ageMonths: number): string {
  if (ageMonths < 18) return 'Observer';
  if (ageMonths < 48) return 'Participant';
  return 'Leader';
}

/**
 * Get FormationStage based on age in months
 * @param ageMonths - Child's age in months
 * @returns FormationStage
 */
export function getFormationStage(ageMonths: number): FormationStage {
  if (ageMonths < 18) return 'seedling';
  if (ageMonths < 36) return 'sprout';
  if (ageMonths < 60) return 'sapling';
  if (ageMonths < 96) return 'tree';
  return 'oak';
}

/**
 * Map legacy domain to primary virtue
 * @param domain - Legacy domain string
 * @returns PrimaryVirtue
 */
export function domainToVirtue(domain: string): PrimaryVirtue {
  return DOMAIN_TO_VIRTUE[domain] || 'Wonder';
}

// ============================================
// ADDITIONAL TYPE EXPORTS FOR COMPATIBILITY
// ============================================

// Portfolio types
export type PortfolioItemType = 'image' | 'audio' | 'document' | 'text';

export const MILESTONE_TAGS = [
  'first-words',
  'first-steps',
  'potty-trained',
  'reading-start',
  'counting-10',
  'writing-name',
  'bike-riding',
  'swimming',
  'tying-shoes',
  'catechism-complete',
  'scripture-memorized',
  'hymn-learned',
  'custom'
] as const;

export type MilestoneTag = typeof MILESTONE_TAGS[number];

// Extended PortfolioItem for components
export interface PortfolioItem {
  id: string;
  studentId: string;
  parentId: string;
  title: string;
  description?: string;
  itemType: PortfolioItemType;
  r2Key?: string;
  formationId?: string;
  milestoneTag?: string;
  createdAt: string;
  // Extended fields for display
  publicUrl?: string;
  domain?: string;
}

// Liturgy response type
export interface LiturgyTodayResponse {
  catechism: LiturgyItem | null;
  hymn: LiturgyItem | null;
  scripture: LiturgyItem | null;
  history?: LiturgyItem | null;
  settings: FamilyLiturgySettings;
  // Extended for component compatibility
  items?: LiturgyItem[];
}

export const LITURGY_TYPE_LABELS: Record<LiturgyType, string> = {
  catechism: 'Catechism',
  hymn: 'Hymn',
  scripture: 'Scripture Memory',
  history: 'History'
};

// Weekly Plan Response
export interface WeeklyPlanResponse {
  id: string;
  weekStart: string;
  plan: any;
  balancePreference: string;
  createdAt?: string;
}

// TodaysLearningResponse extended
export interface TodaysLearningResponse {
  student: Student;
  formations: Formation[];
  activities?: Formation[];
  // Extended for family view
  familyFormations?: Formation[];
  familyActivities?: Formation[];
}

// Legacy Activity type for static data files
export interface LegacyStaticActivity {
  id: string;
  title: string;
  description: string;
  domain: string;
  minAgeMonths: number;
  maxAgeMonths: number;
  difficultyLevel: number;
  estimatedMinutes: number;
  materials: string[];
  instructions: string[];
  successIndicators: string[];
  parentScript?: string;
  variations?: string[];
  learningOutcomes?: string[];
  safetyNotes?: string;
  culturalContext?: string;
  // Extended fields used in actual data
  easierVariation?: string;
  harderVariation?: string;
  godConnection?: string;
  activityType?: string;
  setting?: string;
  messLevel?: number;
  requiresAdultSupervision?: boolean;
  tips?: string[];
  tiers?: {
    tier: number;
    label: string;
    expectations: string;
  }[];
}

// LiturgyItem extended
export interface LiturgyItem {
  id: string;
  type: LiturgyType | string;
  title: string;
  content: string;
  reference?: string;
  completedToday?: boolean;
  audio_url?: string;
}

// Book protagonistGender extended
export type ProtagonistGender = 'male' | 'female' | 'neutral' | 'animal' | 'mixed';

// WeeklyPlanResponse extended
export interface WeeklyPlanResponse {
  id: string;
  weekStart: string;
  plan: any;
  balancePreference: string;
  createdAt?: string;
  completions?: Record<string, boolean>;
}

// Auth context signOut support
export interface AuthContextType {
  user: User | null;
  children: Student[];
  selectedChild: Student | null;
  setSelectedChild: (child: Student) => void;
  isAuthenticated: boolean;
  logout: () => void;
  signOut?: () => void; // Alias for logout
  refreshAuth: () => Promise<void>;
  isLoading: boolean;
}
