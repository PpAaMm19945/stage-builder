
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

export interface BookMetadata {
    id: string;
    series: string;
    seriesTitle?: string;
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
    page?: number;
    prompt?: string;
    coverUrl?: string;
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
