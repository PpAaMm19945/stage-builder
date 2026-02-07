/**
 * API Response Types
 * 
 * Shared types for API client responses to eliminate `any` usage.
 * Types are copied/adapted from backend where applicable.
 */

// ============================================
// Chat & AI Types (aligned with backend cloudflare/src/ai/types.ts)
// ============================================

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
}

export interface ChatContext {
    householdId?: string;
    userId?: string;
    user?: {
        household_id?: string;
        id?: string;
        name?: string;
    };
    userState?: {
        household_id?: string;
    };
    mode?: string;
    page?: string;
    children?: Array<{
        id: string;
        name: string;
        date_of_birth: string;
        age_months?: number;
    }>;
}

export interface ChatActionPayload {
    type: 'complete' | 'skip' | 'regenerate' | 'feedback' | 'adjust' | string;
    value?: string;
    notes?: string;
    [key: string]: unknown;
}

// ============================================
// Auth Response Types
// ============================================

export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    household_id: string;
    picture?: string;
    avatar_url?: string;
    role?: string;
    created_at?: string;
    updated_at?: string;
}

export interface AuthMeResponse {
    user: AuthUser;
    children: StudentRecord[];
}

export interface StudentRecord {
    id: string;
    name: string;
    date_of_birth: string;
    household_id: string;
    age_months?: number;
    ageInMonths?: number;
    avatar_url?: string;
    independence_settings?: Record<string, unknown>;
    pace_overrides?: Record<string, string>;
    is_graduated?: boolean;
    graduation_date?: string;
}

// ============================================
// Progress & Observation Types
// ============================================

export interface DomainProgress {
    domain: string;
    count: number;
}

export interface StudentProgress {
    totalCompleted: number;
    byDomain: DomainProgress[];
    lastActivityDate?: string;
    streakDays?: number;
}

export interface Observation {
    id: string;
    student_id: string;
    activity_id?: string;
    formation_id?: string;
    title?: string;
    stage?: string;
    domain?: string;
    primary_virtue?: string;
    mastery_level?: string;
    parent_notes?: string;
    created_at: string;
    completed_at: string;
}

// ============================================
// Formation & Activity Types
// ============================================

export interface FormationListItem {
    id: string;
    title: string;
    description?: string;
    formation_type?: string;
    primary_virtue?: string;
    duration_minutes?: number;
    min_age_months?: number;
    max_age_months?: number;
    materials?: string[];
    guide_steps?: string[];
    cluster_tag?: string;
}

// ============================================
// Rhythm & Plan Types
// ============================================

export interface RhythmDayItem {
    id?: string;
    type: 'catechism' | 'hymn' | 'book' | 'scripture' | 'activity' | string;
    title: string;
    duration?: number;
    duration_minutes?: number;
    for_children?: string[];
    status?: string;
    content_id?: string;
}

export interface DailyRhythm {
    day: string;
    morning: RhythmDayItem[];
    evening: RhythmDayItem[];
}

export interface RhythmTodayResponse {
    today: DailyRhythm;
    stats?: {
        completed: number;
        total: number;
    };
}

export interface TomorrowPreviewResponse {
    date: string;
    activities?: FormationListItem[];
    summary: string;
    restDay?: boolean;
    needsPlan?: boolean;
}

export interface RhythmWeekResponse {
    weekStart: string;
    days: DailyRhythm[];
}

export interface RhythmReadjustResponse {
    success: boolean;
    plan: DailyRhythm[];
}

// ============================================
// Profile Types
// ============================================

export interface FamilyProfile {
    id: string;
    parent_id: string;
    morning_minutes?: number;
    evening_minutes?: number;
    available_days?: string[];
    goals?: string[];
    preferences?: Record<string, unknown>;
    catechism_position?: number;
    hymn_position?: number;
}

// ============================================
// AI Interaction Types
// ============================================

export interface PlanSlot {
    day: string;
    timeSlot: string;
    activityId: string;
    activityTitle: string;
    duration: number;
    domain: string;
    childIds?: string[];
    reasoning?: string;
}

export interface StrategicInsightResponse {
    insights: string[];
    recommendations: string[];
}

export interface ExplainResponse {
    answer: string;
    sources?: string[];
}

// ============================================
// Work & Apprenticeship Types
// ============================================

export interface WorkEntry {
    id: string;
    apprenticeship_id: string;
    date: string;
    hours: number;
    description: string;
    photo_url?: string;
    skills_applied?: string[];
    status: 'pending' | 'approved' | 'rejected';
    supervisor_note?: string;
    created_at?: string;
}

export interface Apprenticeship {
    id: string;
    student_id: string;
    type: string;
    title: string;
    organization_name?: string;
    mentor_name?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    total_hours_required?: number;
    status: string;
    skills_learned?: string[];
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
    id: string;
    type: string;
    title: string;
    message?: string;
    data?: Record<string, unknown>;
    read: boolean;
    created_at: string;
}

// ============================================
// Hymn & Catechism Types
// ============================================

export interface Hymn {
    id: string;
    title: string;
    number?: number;
    lyrics?: string;
    audio_url?: string;
    sheet_music_url?: string;
}

export interface CatechismQuestion {
    id: string;
    number: number;
    question: string;
    answer: string;
    scripture_reference?: string;
}

// ============================================
// Portfolio Types
// ============================================

export interface PortfolioItem {
    id: string;
    student_id: string;
    title: string;
    description?: string;
    item_type: 'image' | 'audio' | 'document' | 'text';
    r2_key?: string;
    public_url?: string;
    domain?: string;
    milestone_tag?: string;
    created_at?: string;
}
