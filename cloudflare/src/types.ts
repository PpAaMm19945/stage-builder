
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
