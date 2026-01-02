// ============================================
// Parent Override Types
// ============================================
// These types define the structured constraints that AI parses from free-text input.
// AI NEVER invents these - it only maps parent language to predefined structures.

export type OverrideType =
    | 'sensory'   // Sound, light, texture sensitivities
    | 'motor'     // Physical limitations or preferences
    | 'schedule'  // Time constraints, energy patterns
    | 'content'   // Topics to avoid or emphasize
    | 'pacing';   // Speed/duration preferences

export interface OverrideConstraints {
    // Exclusion rules
    exclude_tags?: string[];        // Activity cluster_tags to skip
    exclude_domains?: string[];     // Domains to reduce (never fully skip)
    exclude_materials?: string[];   // Specific materials to avoid

    // Preference rules
    prefer_tags?: string[];         // Tags to prioritize
    prefer_domains?: string[];      // Domains to emphasize
    prefer_time_of_day?: ('morning' | 'afternoon' | 'evening')[];

    // Modification rules
    reduce_duration?: boolean;      // Cut session times
    require_quiet?: boolean;        // Exclude loud activities
    require_low_mess?: boolean;     // Prioritize clean activities
    require_outdoor?: boolean;      // Prefer outdoor activities
    require_seated?: boolean;       // Prefer stationary activities

    // Custom notes (passed through, not interpreted)
    custom_note?: string;
}

export interface ParentOverride {
    id: string;
    parentId: string;
    studentId?: string;             // null = applies to all children
    overrideType: OverrideType;
    description: string;            // Original free-text from parent
    constraints: OverrideConstraints;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// API response when AI parses parent input
export interface ParsedOverrideResponse {
    success: boolean;
    originalText: string;
    parsed: {
        overrideType: OverrideType;
        constraints: OverrideConstraints;
        confidence: number;           // 0.0 - 1.0
        clarification_needed?: string; // Question to ask if unclear
    };
    requiresConfirmation: boolean;  // True if confidence < 0.7 or needs clarification
}

// ============================================
// Weekly Time Model Types
// ============================================

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export interface WeeklyTimeModel {
    id: string;
    parentId: string;
    availableDays: DayOfWeek[];
    minutesPerDay: number;
    preferredTimes: TimeOfDay[];
    maxSessionsPerDay: number;
    fieldTripDays: DayOfWeek[];     // Days reserved for outings (no activities)
    createdAt: string;
    updatedAt: string;
}

// ============================================
// Weekly Plan Types
// ============================================

export interface PlanSlot {
    day: DayOfWeek;
    timeSlot: TimeOfDay;
    activityId: string;
    activityTitle: string;
    duration: number;
    domain: string;
    childIds: string[];             // Which children this activity is for
    reasoning: string;              // Why this activity was chosen
}

export interface WeeklyPlan {
    id: string;
    parentId: string;
    weekStart: string;              // ISO date of Monday
    slots: PlanSlot[];
    totalMinutes: number;
    domainCoverage: Record<string, number>;  // Domain -> percentage
    generatedAt: string;
    overrideVersion: number;
}

// ============================================
// Explanation/Q&A Types
// ============================================

export interface ExplanationRequest {
    question: string;
    context?: {
        activityId?: string;
        domain?: string;
        childAge?: number;
    };
}

export interface ExplanationResponse {
    answer: string;
    sources: string[];              // Vector document IDs used
    confidence: number;
}
