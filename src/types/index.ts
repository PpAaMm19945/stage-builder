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
  'motor': 'Motor Skills',
  'language': 'Language & Communication',
  'cognitive': 'Cognitive Development',
  'social-emotional': 'Social & Emotional',
  'pre-academic': 'Pre-Academic Skills'
};

export const DOMAIN_DESCRIPTIONS: Record<EarlyYearsDomain, string> = {
  'motor': 'Gross and fine motor skill development',
  'language': 'Speech, vocabulary, and listening comprehension',
  'cognitive': 'Problem-solving, memory, and critical thinking',
  'social-emotional': 'Sharing, emotional regulation, and cooperation',
  'pre-academic': 'Sorting, patterns, sequencing, and early numeracy'
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
}

// Family Dashboard Response
export interface FamilyTodayResponse {
  date: string;
  children: Student[];
  familySessions: FamilySession[];
  materials: MaterialItem[];
  totalDuration: number;
  coreKitCoverage: number;
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
