
import { D1Database } from '@cloudflare/workers-types';

export interface ChildContext {
    id: string;
    name: string;
    age_months: number;
    description?: string;
}

export interface AiContext {
    userId: string;
    householdId: string;
    userName: string;
    date: string;
    children: ChildContext[];
    preferences: any; // FamilyProfile
    recentActivity: any[]; // Last few completion items
    mood?: string;
}

export class ContextBuilder {
    constructor(private db: D1Database) { }

    async buildUserContext(userId: string, householdId: string): Promise<AiContext> {
        // 1. Fetch Children
        const students = await this.db.prepare(
            'SELECT id, name, date_of_birth FROM students WHERE household_id = ?'
        ).bind(householdId).all();

        const children: ChildContext[] = (students.results || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            age_months: this.calculateMonths(s.date_of_birth)
        }));

        // 2. Fetch Preferences
        const prefs = await this.db.prepare(
            'SELECT * FROM family_profiles WHERE parent_id = ?'
        ).bind(userId).first();

        // 3. Fetch Recent Activity (Context for "What did we do yesterday?")
        // We look at 'evidences' or 'activity_progress' from the last 3 days
        const recent = await this.db.prepare(`
            SELECT ap.activity_type, ap.status, ap.scheduled_date, f.title 
            FROM activity_progress ap
            LEFT JOIN formations f ON ap.content_id = f.id
            WHERE ap.family_id = ? 
            ORDER BY ap.scheduled_date DESC 
            LIMIT 5
        `).bind(householdId).all();

        return {
            userId,
            householdId,
            userName: 'Parent', // TODO: Fetch name from user record if needed, but we have ID
            date: new Date().toISOString().split('T')[0],
            children,
            preferences: prefs || {},
            recentActivity: recent.results || [],
        };
    }

    private calculateMonths(dobStr: string): number {
        try {
            const dob = new Date(dobStr);
            const now = new Date();
            const months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
            return Math.max(0, months);
        } catch (e) {
            return 0;
        }
    }
}
