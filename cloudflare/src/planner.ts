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

// Domain weights for balanced coverage
const DOMAIN_WEIGHTS: Record<string, number> = {
    'motor': 0.25,
    'language': 0.20,
    'cognitive': 0.20,
    'social-emotional': 0.20,
    'pre-academic': 0.15,
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

// Unified History Query helper
async function getActivityHistory(db: D1Database, parentId: string, activityId: string): Promise<{
    lastCompleted: string | null;
    masteryLevel: string | null;
    completionCount: number;
}> {
    // Query both tables with UNION
    const result = await db.prepare(`
    SELECT completed_at, mastery_level, 'observation' as source
    FROM observations o
    JOIN students s ON o.student_id = s.id
    WHERE s.parent_id = ? AND o.activity_id = ?

    UNION ALL

    SELECT completed_at, NULL as mastery_level, 'completion' as source
    FROM activity_completions
    WHERE parent_id = ? AND activity_id = ?

    ORDER BY completed_at DESC
    LIMIT 10
  `).bind(parentId, activityId, parentId, activityId).all();

    const records = result.results || [];
    return {
        lastCompleted: (records[0] as any)?.completed_at || null,
        masteryLevel: (records.find((r: any) => r.mastery_level) as any)?.mastery_level || null,
        completionCount: records.length
    };
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
async function scoreActivity(
    activity: Activity,
    domainCounts: Record<string, number>,
    overrides: Override[],
    db: D1Database,
    parentId: string,
    balancePreference: string = 'mixed'
): Promise<number> {
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

    // Get unified history
    const history = await getActivityHistory(db, parentId, activity.id);

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

    // For each available day
    for (const day of planningDays) {
        let dayMinutesRemaining = timeModel.minutes_per_day;
        let daySessions = 0;
        const timeSlot = timeModel.preferred_times[0] || 'morning';

        while (dayMinutesRemaining > 0 && daySessions < timeModel.max_sessions_per_day) {
            // Score all remaining activities
            // We do this inside the loop because scores might change (e.g. domain balance)
            // Note: History check is constant for the run, but scoreActivity is async now.

            const candidates = [];

            for (const a of suitableActivities) {
                 if (usedActivityIds.has(a.id)) continue;
                 if (a.duration_minutes > dayMinutesRemaining) continue;

                 const score = await scoreActivity(a, domainCounts, overrides, db, parentId, balancePreference);
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
