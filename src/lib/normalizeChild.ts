import { Student } from '@/types';

export function normalizeChild(raw: any): Student {
    return {
        id: raw.id || `temp-${Date.now()}`,
        householdId: raw.household_id || raw.householdId || 'unknown-household',
        name: raw.name || 'Unnamed Child',
        // @ts-ignore - dateOfBirth is defined as string in types but can be null at runtime
        dateOfBirth: raw.date_of_birth || raw.dateOfBirth || null,
        ageInMonths: raw.age_in_months ?? raw.ageInMonths ?? 0,
        currentStage: raw.current_stage || raw.currentStage || 'early-years',
        avatarUrl: raw.avatar_url || raw.avatarUrl || undefined,
        pendingLoginEmail: raw.pending_login_email || raw.pendingLoginEmail || undefined,
        independence_settings: raw.independence_settings || undefined,
        pace_overrides: raw.pace_overrides || undefined,
        is_graduated: raw.is_graduated || raw.isGraduated || false,
        graduation_date: raw.graduation_date || raw.graduationDate || undefined,
        createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
        updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
    } as Student;
}
