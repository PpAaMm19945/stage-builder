// ============================================
// Deterministic Weekly Planner
// ============================================
// This module generates weekly plans WITHOUT using AI.
// It applies matrix logic, parent overrides, and time constraints.
// AI is ONLY used downstream to explain or narrate these plans.

import type { D1Database } from '@cloudflare/workers-types';

interface Student {
    id: string;
    name: string;
    age_in_months: number;
    pace_overrides?: Record<string, string>; // Per-subject pace: { subject: pace_level }
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
    primary_tier?: string;
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

interface ActivityHistorySummary {
    lastCompleted: string | null;
    masteryLevel: string | null;
    completionCount: number;
}

// Domain weights for balanced coverage
const VIRTUE_WEIGHTS: Record<string, number> = {
    'Wisdom': 0.25,
    'Stewardship': 0.25,
    'Love': 0.20,
    'Order': 0.15,
    'Wonder': 0.15,
};

// Balance preference modifiers (added to base score)
const BALANCE_WEIGHTS: Record<string, Record<string, number>> = {
    'baby_focused': {
        'observer': 20,
        'participant': -10,
        'leader': -15
    },
    'older_focused': {
        'observer': -10,
        'participant': 15,
        'leader': 20
    },
    'mixed': {
        'observer': 0,
        'participant': 0,
        'leader': 0
    }
};

// PHASE 4: Pace modifiers for scoring
// Affects content selection based on subject-specific pace
const PACE_MODIFIERS: Record<string, { complexityBoost: number; repetitionBoost: number }> = {
    'gentle': { complexityBoost: -15, repetitionBoost: 10 },    // Prefer simpler, more repetition
    'standard': { complexityBoost: 0, repetitionBoost: 0 },      // No change
    'accelerated': { complexityBoost: 15, repetitionBoost: -10 } // Prefer harder, less repetition
};

// Get subject-specific pace from children's pace overrides
function getSubjectPace(children: Student[], clusterTag?: string): string {
    if (!clusterTag) return 'standard';

    // Collect pace preferences for this subject from all children
    const paces = children
        .map(c => c.pace_overrides?.[clusterTag])
        .filter(Boolean) as string[];

    if (paces.length === 0) return 'standard';

    // Use the most conservative pace when multiple children
    if (paces.includes('gentle')) return 'gentle';
    if (paces.includes('standard')) return 'standard';
    return 'accelerated';
}

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

// Optimized History Prefetcher (Replaces N+1 Query)
async function prefetchActivityHistory(db: D1Database, parentId: string): Promise<Map<string, ActivityHistorySummary>> {
    const historyMap = new Map<string, ActivityHistorySummary>();

    // 1. Fetch Evidences (Unified Table)
    let evidences: any[] = [];
    try {
        const result = await db.prepare(`
            SELECT formation_id as activity_id, captured_at as completed_at, habit_stage as mastery_level
            FROM evidences
            WHERE parent_id = ?
            ORDER BY captured_at DESC
        `).bind(parentId).all();
        evidences = result.results || [];
    } catch (e) {
        console.warn('Failed to fetch evidences', e);
    }

    // 2. Process Events
    // We want a list of events per activity, sorted by date DESC
    const eventsByActivity = new Map<string, Array<{ date: string, mastery?: string }>>();

    const addEvent = (activityId: string, date: string, mastery?: string) => {
        if (!eventsByActivity.has(activityId)) {
            eventsByActivity.set(activityId, []);
        }
        eventsByActivity.get(activityId)!.push({ date, mastery });
    };

    if (evidences) {
        evidences.forEach((e: any) => addEvent(e.activity_id, e.completed_at, e.mastery_level));
    }

    // 3. Compute Summary for each activity
    for (const [activityId, events] of eventsByActivity.entries()) {
        // Sort DESC
        events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Take top 10 like original logic
        const recentEvents = events.slice(0, 10);

        historyMap.set(activityId, {
            lastCompleted: recentEvents[0]?.date || null,
            masteryLevel: recentEvents.find(e => e.mastery)?.mastery || null,
            completionCount: recentEvents.length
        });
    }

    return historyMap;
}

function daysBetween(d1: string | Date, d2: string | Date): number {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
    history: ActivityHistorySummary,
    balancePreference: string = 'mixed',
    passionDomains: Set<string> = new Set(),
    learningFocus: string = 'balanced',
    subjectPace: string = 'standard' // PHASE 4: Per-subject pace
): number {
    let score = 50; // Base score

    // PHASE 4: Apply pace modifier
    const paceMod = PACE_MODIFIERS[subjectPace] || PACE_MODIFIERS['standard'];
    score += paceMod.complexityBoost;

    // Domain balance: boost underrepresented domains
    const domainCount = domainCounts[activity.domain] || 0;
    const targetWeight = VIRTUE_WEIGHTS[activity.domain] || 0.2;
    const totalActivities = Object.values(domainCounts).reduce((a, b) => a + b, 0) || 1;
    const currentRatio = domainCount / totalActivities;

    if (currentRatio < targetWeight) {
        score += 20; // Boost underrepresented domain
    } else if (currentRatio > targetWeight * 1.5) {
        score -= 15; // Penalize overrepresented domain
    }

    // PHASE 4: Passion signal boost
    // If child has shown interest in this domain, boost the score
    if (passionDomains.has(activity.domain)) {
        // Boost based on learning focus setting
        const passionBoost = learningFocus === 'interests' ? 30 : 15;
        score += passionBoost;
    }

    // Unified history check
    if (history.lastCompleted) {
        const daysSince = daysBetween(history.lastCompleted, new Date());

        // For babies (observer tier): repetition is GOOD
        if (activity.primary_tier === 'observer') {
            if (daysSince >= 3) score += 15;  // Boost repeats for babies
        } else {
            // For older children: mastery-based repetition
            if (history.masteryLevel === 'emerging' && daysSince >= 3) {
                score += 25;  // Needs more practice
            } else if (history.masteryLevel === 'secure' && daysSince < 30) {
                score -= 40;  // Recently mastered, skip for now
            } else if (daysSince < 7) {
                // General penalty for recent activities if not mastering
                score -= 30;
            }
        }
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

    // Apply balance preference
    if (activity.primary_tier && BALANCE_WEIGHTS[balancePreference]) {
        score += BALANCE_WEIGHTS[balancePreference][activity.primary_tier] || 0;
    }

    return score;
}

// Generate reasoning text for why an activity was chosen
function generateReasoning(
    activity: Activity,
    domainCounts: Record<string, number>,
    totalPlanned: number
): string {
    const virtueLabels: Record<string, string> = {
        'Wisdom': 'Wisdom & Discernment',
        'Stewardship': 'Stewardship & Dominion',
        'Love': 'Love & Service',
        'Order': 'Order & Diligence',
        'Wonder': 'Wonder & Awe'
    };

    const domainLabel = virtueLabels[activity.domain] || activity.domain;
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
export async function generateWeeklyPlan(
    children: Student[],
    activities: Activity[],
    timeModel: TimeModel,
    overrides: Override[],
    db: D1Database,
    parentId: string,
    balancePreference: string = 'mixed'
): Promise<PlanResult> {
    const slots: PlanSlot[] = [];
    const domainCounts: Record<string, number> = {};
    const usedActivityIds = new Set<string>();

    // Filter activities suitable for all children
    let suitableActivities = activities.filter(a => isSuitableForChildren(a, children));

    // Apply override filters
    suitableActivities = applyOverrides(suitableActivities, overrides);

    // Get available days (excluding field trip days)
    const planningDays = timeModel.available_days.filter(
        day => !timeModel.field_trip_days.includes(day)
    );

    // Prefetch all history at once to avoid N+1 queries
    const historyMap = await prefetchActivityHistory(db, parentId);

    // PHASE 4: Fetch passion signals for all children
    const childIds = children.map(c => c.id);
    const passionDomains = new Set<string>();
    if (childIds.length > 0) {
        try {
            const placeholders = childIds.map(() => '?').join(',');
            const { results: passionSignals } = await db.prepare(`
                SELECT DISTINCT domain FROM passion_signals
                WHERE student_id IN (${placeholders})
                AND created_at > datetime('now', '-30 days')
            `).bind(...childIds).all();

            passionSignals.forEach((ps: any) => passionDomains.add(ps.domain));
        } catch (e) {
            console.warn('Failed to fetch passion_signals', e);
        }
    }

    // PHASE 4: Get learning focus preference
    // NOTE: schema has evolved; some deployments may not have learning_focus column.
    // Planner should not hard-fail (500) if preferences table/column is missing.
    let learningFocus = 'balanced';
    try {
        const prefs = await db.prepare(
            'SELECT learning_focus FROM family_preferences WHERE parent_id = ?'
        ).bind(parentId).first() as any;
        learningFocus = prefs?.learning_focus || 'balanced';
    } catch (e) {
        console.warn('Failed to fetch family_preferences.learning_focus; using default', e);
        learningFocus = 'balanced';
    }

    // For each available day
    for (const day of planningDays) {
        let dayMinutesRemaining = timeModel.minutes_per_day;
        let daySessions = 0;
        const timeSlot = timeModel.preferred_times[0] || 'morning';

        while (dayMinutesRemaining > 0 && daySessions < timeModel.max_sessions_per_day) {
            // Score all remaining activities
            // We do this inside the loop because scores might change (e.g. domain balance)

            const candidates = [];

            for (const a of suitableActivities) {
                if (usedActivityIds.has(a.id)) continue;
                if (a.duration_minutes > dayMinutesRemaining) continue;

                // Get pre-calculated history
                const history = historyMap.get(a.id) || { lastCompleted: null, masteryLevel: null, completionCount: 0 };

                // PHASE 4: Get subject-specific pace for this activity's cluster_tag
                const subjectPace = getSubjectPace(children, a.cluster_tag);

                // Sync call now - include passion domains, learning focus, and subject pace
                const score = scoreActivity(a, domainCounts, overrides, history, balancePreference, passionDomains, learningFocus, subjectPace);
                candidates.push({ activity: a, score });
            }

            candidates.sort((a, b) => b.score - a.score);

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

// Get the Monday of the current week (Smart Week Start)
export function getSmartWeekStart(targetDate?: string): string {
    const date = targetDate ? new Date(targetDate) : new Date();
    const day = date.getDay();

    // If Saturday (6) or Sunday (0), target NEXT Monday
    if (day === 0 || day === 6) {
        const daysUntilMonday = day === 0 ? 1 : 2;
        date.setDate(date.getDate() + daysUntilMonday);
    } else {
        // Mon-Fri: target THIS Monday
        date.setDate(date.getDate() - (day - 1));
    }

    return date.toISOString().split('T')[0];
}

// Backward compatibility wrapper for imports that might expect getCurrentWeekStart
export const getCurrentWeekStart = getSmartWeekStart;
