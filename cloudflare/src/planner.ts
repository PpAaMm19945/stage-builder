// ============================================
// Deterministic Weekly Planner
// ============================================
// This module generates weekly plans WITHOUT using AI.
// It applies matrix logic, parent overrides, and time constraints.
// AI is ONLY used downstream to explain or narrate these plans.

interface Student {
    id: string;
    name: string;
    age_in_months: number;
}

interface Activity {
    id: string;
    title: string;
    domain: string;
    min_age_months: number;
    max_age_months: number;
    duration_minutes: number;
    materials: string[];
    cluster_tag?: string;
    mess_level?: string | number;
    activity_type?: string;
}

interface Override {
    override_type: string;
    constraints_json: string;
    student_id?: string;
}

interface TimeModel {
    available_days: string[];
    minutes_per_day: number;
    preferred_times: string[];
    max_sessions_per_day: number;
    field_trip_days: string[];
}

interface PlanSlot {
    day: string;
    timeSlot: string;
    activityId: string;
    activityTitle: string;
    duration: number;
    domain: string;
    childIds: string[];
    reasoning: string;
}

interface PlanResult {
    slots: PlanSlot[];
    totalMinutes: number;
    domainCoverage: Record<string, number>;
}

// Domain weights for balanced coverage
const DOMAIN_WEIGHTS: Record<string, number> = {
    'motor': 0.25,
    'language': 0.20,
    'cognitive': 0.20,
    'social-emotional': 0.20,
    'pre-academic': 0.15,
};

// Parse constraints from JSON string
function parseConstraints(json: string): any {
    try {
        return JSON.parse(json);
    } catch {
        return {};
    }
}

// Check if activity is suitable for at least one child
// (Changed from every() to some() to support multi-child families with varying ages)
function isSuitableForChildren(activity: Activity, children: Student[]): boolean {
    return children.some(child =>
        child.age_in_months >= activity.min_age_months &&
        child.age_in_months <= activity.max_age_months
    );
}

// Apply override constraints to filter activities
function applyOverrides(
    activities: Activity[],
    overrides: Override[],
    targetStudentId?: string
): Activity[] {
    let filtered = [...activities];

    for (const override of overrides) {
        // Skip if override is for a specific child and we're planning for a different one
        if (override.student_id && targetStudentId && override.student_id !== targetStudentId) {
            continue;
        }

        const constraints = parseConstraints(override.constraints_json);

        // Exclude by tags
        if (constraints.exclude_tags?.length) {
            filtered = filtered.filter(a =>
                !constraints.exclude_tags.includes(a.cluster_tag)
            );
        }

        // Exclude by domains (reduce, not eliminate)
        if (constraints.exclude_domains?.length) {
            // We'll handle this in scoring, not filtering
        }

        // Exclude by materials
        if (constraints.exclude_materials?.length) {
            filtered = filtered.filter(a =>
                !a.materials.some((m: string) =>
                    constraints.exclude_materials.some((ex: string) =>
                        m.toLowerCase().includes(ex.toLowerCase())
                    )
                )
            );
        }

        // Require quiet (exclude loud activities)
        if (constraints.require_quiet) {
            filtered = filtered.filter(a =>
                !a.cluster_tag?.includes('music') &&
                !a.cluster_tag?.includes('loud')
            );
        }

        // Require low mess
        if (constraints.require_low_mess) {
            filtered = filtered.filter(a =>
                a.mess_level === 'none' ||
                a.mess_level === 'low' ||
                a.mess_level === 0 ||
                a.mess_level === 1
            );
        }
    }

    return filtered;
}

// Score an activity based on matrix weights and preferences
function scoreActivity(
    activity: Activity,
    domainCounts: Record<string, number>,
    overrides: Override[],
    recentActivityIds: Set<string>
): number {
    let score = 50; // Base score

    // Domain balance: boost underrepresented domains
    const domainCount = domainCounts[activity.domain] || 0;
    const targetWeight = DOMAIN_WEIGHTS[activity.domain] || 0.2;
    const totalActivities = Object.values(domainCounts).reduce((a, b) => a + b, 0) || 1;
    const currentRatio = domainCount / totalActivities;

    if (currentRatio < targetWeight) {
        score += 20; // Boost underrepresented domain
    } else if (currentRatio > targetWeight * 1.5) {
        score -= 15; // Penalize overrepresented domain
    }

    // Penalize recently done activities
    if (recentActivityIds.has(activity.id)) {
        score -= 30;
    }

    // Apply override preferences (boost)
    for (const override of overrides) {
        const constraints = parseConstraints(override.constraints_json);

        if (constraints.prefer_tags?.includes(activity.cluster_tag)) {
            score += 15;
        }

        if (constraints.prefer_domains?.includes(activity.domain)) {
            score += 10;
        }
    }

    return score;
}

// Generate reasoning text for why an activity was chosen
function generateReasoning(
    activity: Activity,
    domainCounts: Record<string, number>,
    totalPlanned: number
): string {
    const domainLabels: Record<string, string> = {
        'motor': 'Stewardship & Dominion',
        'language': 'Word & Truth',
        'cognitive': 'Wisdom & Order',
        'social-emotional': 'Virtue & Sanctification',
        'pre-academic': 'Foundations & Patterns'
    };

    const domainLabel = domainLabels[activity.domain] || activity.domain;
    const domainCount = domainCounts[activity.domain] || 0;

    if (domainCount === 0) {
        return `First activity for ${domainLabel} this week to ensure balanced development.`;
    }

    if (totalPlanned < 3) {
        return `Building early momentum with a ${activity.duration_minutes}-minute ${domainLabel} activity.`;
    }

    return `Continuing ${domainLabel} development with '${activity.title}'.`;
}

// Main planner function
export function generateWeeklyPlan(
    children: Student[],
    activities: Activity[],
    timeModel: TimeModel,
    overrides: Override[],
    recentActivityIds: string[] = []
): PlanResult {
    const slots: PlanSlot[] = [];
    const domainCounts: Record<string, number> = {};
    const recentSet = new Set(recentActivityIds);
    const usedActivityIds = new Set<string>();

    // Filter activities suitable for all children
    let suitableActivities = activities.filter(a => isSuitableForChildren(a, children));

    // Apply override filters
    suitableActivities = applyOverrides(suitableActivities, overrides);

    // Get available days (excluding field trip days)
    const planningDays = timeModel.available_days.filter(
        day => !timeModel.field_trip_days.includes(day)
    );

    // For each available day
    for (const day of planningDays) {
        let dayMinutesRemaining = timeModel.minutes_per_day;
        let daySessions = 0;
        const timeSlot = timeModel.preferred_times[0] || 'morning';

        while (dayMinutesRemaining > 0 && daySessions < timeModel.max_sessions_per_day) {
            // Score all remaining activities
            const candidates = suitableActivities
                .filter(a => !usedActivityIds.has(a.id))
                .filter(a => a.duration_minutes <= dayMinutesRemaining)
                .map(a => ({
                    activity: a,
                    score: scoreActivity(a, domainCounts, overrides, recentSet)
                }))
                .sort((a, b) => b.score - a.score);

            if (candidates.length === 0) break;

            // Pick the top-scored activity
            const chosen = candidates[0].activity;
            usedActivityIds.add(chosen.id);

            // Update domain counts
            domainCounts[chosen.domain] = (domainCounts[chosen.domain] || 0) + 1;

            // Create slot
            slots.push({
                day,
                timeSlot,
                activityId: chosen.id,
                activityTitle: chosen.title,
                duration: chosen.duration_minutes,
                domain: chosen.domain,
                childIds: children.map(c => c.id),
                reasoning: generateReasoning(chosen, domainCounts, slots.length)
            });

            dayMinutesRemaining -= chosen.duration_minutes;
            daySessions++;
        }
    }

    // Calculate domain coverage percentages
    const totalDomainActivities = Object.values(domainCounts).reduce((a, b) => a + b, 0) || 1;
    const domainCoverage: Record<string, number> = {};
    for (const [domain, count] of Object.entries(domainCounts)) {
        domainCoverage[domain] = Math.round((count / totalDomainActivities) * 100);
    }

    return {
        slots,
        totalMinutes: slots.reduce((sum, s) => sum + s.duration, 0),
        domainCoverage
    };
}

// Get the Monday of the current week
export function getCurrentWeekStart(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
}
