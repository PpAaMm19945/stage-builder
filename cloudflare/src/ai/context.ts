
import { D1Database } from '@cloudflare/workers-types';
import { StudentDbRecord, ProfileDbRecord, FamilyPreferencesRecord, ParentOverrideRecord, ActivityProgressRecord } from './types';

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
    preferences: Record<string, unknown>;
    accommodations: ParentOverrideRecord[];
    recentActivity: Record<string, unknown>[];  // Raw activity_progress records
    mood?: string;
}

export class ContextBuilder {
    constructor(private db: D1Database) { }

    async buildUserContext(userId: string, householdId: string): Promise<AiContext> {
        // 1. Fetch Children
        const students = await this.db.prepare(
            'SELECT id, name, date_of_birth FROM students WHERE household_id = ?'
        ).bind(householdId).all<StudentDbRecord>();

        const children: ChildContext[] = (students.results || []).map((s) => ({
            id: s.id,
            name: s.name,
            age_months: this.calculateMonths(s.date_of_birth)
        }));

        // 2. Fetch Preferences (Legacy + Modern Merge)
        const profile = await this.db.prepare(
            'SELECT * FROM family_profiles WHERE parent_id = ?'
        ).bind(userId).first<ProfileDbRecord>();

        const familyPrefs = await this.db.prepare(
            'SELECT overrides_json FROM family_preferences WHERE parent_id = ?'
        ).bind(userId).first<FamilyPreferencesRecord>();

        let sectionOverrides: Record<string, unknown> = {};
        if (familyPrefs?.overrides_json) {
            try { sectionOverrides = JSON.parse(familyPrefs.overrides_json); } catch { /* Empty catch - fallback to empty overrides */ }
        }

        // Merge: New overrides take precedence
        const mergedPrefs: Record<string, unknown> = {
            ...(profile || {}),
            morning_minutes: (sectionOverrides.morning_minutes as number | undefined) ?? profile?.morning_minutes ?? 15,
            evening_minutes: (sectionOverrides.evening_minutes as number | undefined) ?? profile?.evening_minutes ?? 0,
            available_days: (sectionOverrides.available_days as string | undefined) ?? profile?.available_days ?? '[]',
            // ... other fields as needed
        };

        // 3. Fetch Accommodations
        const accommodations = await this.db.prepare(
            'SELECT * FROM parent_overrides WHERE parent_id = ? AND is_active = 1'
        ).bind(userId).all<ParentOverrideRecord>();

        // 4. Fetch Recent Activity (Context for "What did we do yesterday?")
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
            preferences: mergedPrefs,
            accommodations: accommodations.results || [],
            recentActivity: recent.results || [],
        };
    }

    private calculateMonths(dobStr: string): number {
        try {
            const dob = new Date(dobStr);
            const now = new Date();
            const months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
            return Math.max(0, months);
        } catch {
            // Empty catch - return 0 for invalid date formats
            return 0;
        }
    }
}
