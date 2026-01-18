// ============================================
// SchoolOS Core Data Models (Unified v2 Schema)
// ============================================

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

// Legacy Book Interface
export interface Book {
  id: string;
  series: string;
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

// Legacy Liturgy Items
// These are often just Formations with type='liturgy' now
export interface LiturgyItem {
  id: string;
  type: string;
  title: string;
  content: string; // mapped from liturgical_script
  reference?: string;
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
