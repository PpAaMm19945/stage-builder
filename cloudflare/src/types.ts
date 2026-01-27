
// Transcript Types
export interface TranscriptCourse {
    subject: string;
    title: string;
    year: string; // e.g., "2024-2025"
    credits: number;
    grade: string; // "P" for Pass, or calculated
}

export interface TranscriptActivity {
    role: string;
    organization: string;
    hours: number;
    description: string;
}

export interface TranscriptData {
    studentName: string;
    dateOfBirth: string;
    graduationDate?: string;
    courses: TranscriptCourse[];
    activities: TranscriptActivity[];
    totalCredits: number;
    gpa?: string; // Optional if we calculate it
}

// Core Worker Types
export interface Env {
    // Core bindings
    DB: D1Database;
    BOOKS_BUCKET: R2Bucket;

    // AI bindings
    AI: any;  // Workers AI binding
    CURRICULUM_INDEX: VectorizeIndex;  // Vectorize for curriculum RAG

    // AI Gateway config
    AI_GATEWAY_HOST: string;
    AI_GATEWAY_ACCOUNT_ID: string;
    AI_GATEWAY_NAME: string;

    // Auth & Config
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_REDIRECT_URI: string;
    JWT_SECRET: string;
    FRONTEND_URL: string;
    ENVIRONMENT: string;
    ADMIN_SECRET?: string;
    GOOGLE_API_KEY: string;
    LOVABLE_API_KEY?: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
    provider: string;
    household_id?: string;
    role?: 'parent' | 'student';
    student_id?: string;
}

export interface Student {
    id: string;
    household_id: string;
    name: string;
    date_of_birth: string;
    avatar_url?: string;
}

// Unified Formation Type
export interface Formation {
    id: string;
    title: string;
    description: string;
    formation_type: 'skill' | 'habit' | 'liturgy' | 'reading' | 'service' | 'rest';
    primary_virtue: string;
    min_age_months: number;
    max_age_months: number;
    guide_steps?: string; // JSON
    materials?: string; // JSON
    duration_minutes: number;
    render_format?: string;
    content_path?: string;
    audio_url?: string;
}

// V2 Foundation Tables
export interface FamilyProfile {
    id: string;
    parent_id: string;
    morning_minutes: number;
    evening_minutes: number;
    available_days: string; // JSON string ["Mon", "Tue"]
    goals: string; // JSON
    preferences: string; // JSON
    catechism_position: number;
    hymn_position: number;
    scripture_chapter: number;
}

export interface WeeklyPlanV2 {
    id: string;
    family_id: string;
    week_start: string;
    plan_data: string; // JSON
    generated_at: string;
    frozen_through?: string;
}

export interface ActivityProgress {
    id: string;
    family_id: string;
    activity_type: string;
    content_id: string;
    scheduled_date: string;
    status: 'upcoming' | 'completed' | 'skipped' | 'rescheduled';
    transferred_to?: string;
}

export interface AiActionLog {
    id: string;
    family_id: string;
    action_type: string;
    action_data: string; // JSON
    reason?: string;
    status: 'pending' | 'confirmed' | 'rejected';
}

export interface JWTPayload {
    sub: string;
    email: string;
    name: string;
    household_id?: string;
    role?: 'parent' | 'student';
    student_id?: string;
    exp: number;
    iat: number;
}
