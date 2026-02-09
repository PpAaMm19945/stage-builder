/**
 * Shared types for AI modules
 * 
 * This file provides typed interfaces to replace `any` usage
 * throughout the AI module codebase.
 */

// ============================================
// Chat & Message Types
// ============================================

export interface ChatHistoryMessage {
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
    children?: ChildRecord[];
}

export interface ChatPayload {
    type: 'complete' | 'skip' | 'regenerate' | 'feedback' | 'adjust';
    value?: string;
    notes?: string;
}

// ============================================
// Database Record Types
// ============================================

export interface ChildRecord {
    id: string;
    name: string;
    date_of_birth: string;
    age_months?: number;
    household_id?: string;
    description?: string;
}

export interface StudentDbRecord {
    id: string;
    name: string;
    date_of_birth: string;
    household_id: string;
    pending_login_email?: string;
    avatar_url?: string;
    independence_settings?: string;  // JSON string
    pace_overrides?: string;         // JSON string
    is_graduated?: number;
    graduation_date?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ProfileDbRecord {
    id: string;
    parent_id: string;
    morning_minutes?: number;
    evening_minutes?: number;
    available_days?: string;  // JSON array string
    goals?: string;           // JSON array string
    preferences?: string;     // JSON object string
    catechism_position?: number;
    hymn_position?: number;
    created_at?: string;
    updated_at?: string;
}

export interface FamilyPreferencesRecord {
    id?: string;
    parent_id: string;
    overrides_json?: string;  // JSON object string
}

export interface ParentOverrideRecord {
    id: string;
    parent_id: string;
    description: string;
    constraints?: string;     // JSON object string
    is_active: number;
    created_at?: string;
}

export interface AnchorDbRecord {
    id: string;
    household_id: string;
    arc_id?: string;
    anchor_date: string;
    anchor_data: string;      // JSON string containing DailyAnchor
    generation_reasoning?: string;
    status: 'active' | 'completed' | 'skipped';
    completion_feedback?: string;
    completed_at?: string;
    skipped_at?: string;
    skip_reason?: string;
    regeneration_count?: number;
}

export interface ArcDbRecord {
    id: string;
    household_id: string;
    arc_start_date: string;
    arc_end_date?: string;
    arc_data: string;         // JSON string containing FormationArc
    generation_reasoning?: string;
    status: 'active' | 'completed' | 'draft';
    spine_version?: string;
}

export interface WeeklyPlanRecord {
    id: string;
    family_id: string;
    week_start: string;
    days?: string;            // JSON array string
    theme?: string;
    generated_at?: string;
    frozen_through?: string;
}

export interface ActivityProgressRecord {
    id: string;
    student_id?: string;
    family_id?: string;
    formation_id?: string;
    activity_type?: string;
    status: 'upcoming' | 'current' | 'completed' | 'skipped' | 'transferred';
    scheduled_date?: string;
    completed_at?: string;
    duration_minutes?: number;
    notes?: string;
}

export interface FormationRecord {
    id: string;
    title: string;
    description?: string;
    formation_type?: string;
    type?: string;
    primary_virtue?: string;
    duration_minutes?: number;
    min_age_months?: number;
    max_age_months?: number;
    is_active?: number;
    cluster_tag?: string;
    cover_image_url?: string;
    materials?: string;       // JSON array string
}

export interface PortfolioItemRecord {
    id: string;
    student_id: string;
    parent_id: string;
    title: string;
    description?: string;
    item_type: string;
    r2_key?: string;
    formation_id?: string;
    milestone_tag?: string;
    created_at?: string;
}

export interface ApprenticeshipRecord {
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
    skills_learned?: string;  // JSON array string
    created_at?: string;
    updated_at?: string;
}

export interface WorkEntryRecord {
    id: string;
    apprenticeship_id: string;
    date: string;
    hours: number;
    description: string;
    photo_url?: string;
    skills_applied?: string;  // JSON array string
    status: string;
    supervisor_note?: string;
    created_at?: string;
}

// ============================================
// Progress & Skills Types
// ============================================

export interface SkillProgressRecord {
    id: string;
    child_id: string;
    subject: string;
    skill_target: string;
    mastery_level: 'introduced' | 'practicing' | 'mastered';
    practice_count: number;
    evidence_anchor_id?: string;
    parent_notes?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CurriculumPositionRecord {
    id: string;
    household_id: string;
    subject: string;
    current_week: number;
    spine_version?: string;
    created_at?: string;
    updated_at?: string;
}

export interface SpineRecord {
    id: string;
    spine_version: string;
    subject: string;
    week_number: number;
    stage: string;
    focus_area: string;
    skill_targets: string;    // JSON array string
    faith_framing?: string;
    resources?: string;       // JSON array string
    confidence: string;
    source_citations?: string; // JSON array string
    approved_by?: string;
    approved_at?: string;
    catechism_q?: number;
    hymn_number?: number;
    scripture_ref?: string;
}

// ============================================
// Gemini API Types
// ============================================

export interface GeminiRequestBody {
    contents: GeminiContent[];
    systemInstruction?: {
        parts: { text: string }[];
    };
    generationConfig?: {
        responseMimeType?: string;
        responseSchema?: object;
    };
    tools?: GeminiTool[];
}

export interface GeminiContent {
    role: 'user' | 'model';
    parts: GeminiPart[];
}

export interface GeminiPart {
    text?: string;
    functionCall?: {
        name: string;
        args: Record<string, unknown>;
    };
    functionResponse?: {
        name: string;
        response: Record<string, unknown>;
    };
}

export interface GeminiTool {
    functionDeclarations: {
        name: string;
        description: string;
        parameters?: object;
    }[];
}

export interface GeminiResponse {
    candidates?: {
        content?: {
            parts?: { text?: string }[];
        };
    }[];
    usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
    };
}

export interface StreamChunk {
    text?: string;
    toolCall?: {
        name: string;
        args: Record<string, unknown>;
    };
}

// ============================================
// Search & Tools Types
// ============================================

export interface SearchMetadata {
    ageRange?: string;
    domain?: string;
    coverUrl?: string;
    materials?: string;
    period?: 'morning' | 'evening';
    duration?: number;
    contentType?: string;
    status?: string;
}

export interface RhythmDayItem {
    id?: string;
    type: 'catechism' | 'hymn' | 'book' | 'scripture' | 'activity';
    title: string;
    duration?: number;
    duration_minutes?: number;
    for_children?: string[];
    rationale?: string;
    status?: string;
    content_id?: string;
    pathId?: string;
}

export interface ParsedDailyRhythm {
    day: string;
    morning: RhythmDayItem[];
    evening: RhythmDayItem[];
}

// ============================================
// Path & Subscription Types
// ============================================

export interface PathItemData {
    id: string;
    title: string;
    description?: string;
    type?: string;
    [key: string]: unknown;  // Allow additional fields
}

export interface LearningPathRecord {
    id: string;
    path_type: string;
    content_filter?: string;  // JSON object string
    total_items?: number;
}

export interface PathSubscriptionRecord {
    id: string;
    parent_id: string;
    path_id: string;
    current_position: number;
}
