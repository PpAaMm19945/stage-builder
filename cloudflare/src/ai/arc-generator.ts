import { D1Database } from '@cloudflare/workers-types';
import { safeQuery, safeQueryFirst, safeRun } from '../lib/db';
import { GeminiService } from './gemini';
import { BOOKS_DATA, CATECHISM_DATA } from './data';
import { Env } from '../types';
import { StudentDbRecord, ProfileDbRecord, FamilyPreferencesRecord, SkillProgressRecord, CurriculumPositionRecord, SpineRecord } from './types';

/**
 * Unified Anchor Model
 * 
 * One anchor per FAMILY per day:
 * - Liturgy: Hymn + Verse + Catechism (same for all children)
 * - Activity: Cross-curricular, each child has a role based on stage
 * - Book: Shared family reading
 * 
 * Progress is tracked per-child, per-skill.
 */

export interface ChildRole {
    child_id: string;
    child_name: string;
    age_months: number;
    stage: 'seedling' | 'sprout' | 'sapling' | 'tree';
    role: string;                   // "Measures ingredients", "Stirs batter"
    skills_practiced: string[];     // ['numeracy:counting', 'motor:fine']
}

export interface DailyPlan {
    day: number;                    // 1-14
    liturgy: {
        hymn_id: string;
        hymn_title: string;
        verse: string;
        catechism_q: number;
        catechism_text: string;
    };
    activity: {
        id: string;
        title: string;
        description: string;
        targets_covered: string[];  // ['literacy:rhyme', 'numeracy:counting']
        materials_needed: string[];
        duration_minutes: number;
        child_roles: ChildRole[];
    };
    book: {
        id: string;
        title: string;
        author?: string;
    };
}

export interface FormationArc {
    id: string;
    household_id: string;
    spine_version: string;
    duration_weeks: 2;
    arc_start_date: string;
    daily_plans: DailyPlan[];
    generation_reasoning: string;
}

interface ChildData {
    id: string;
    name: string;
    date_of_birth: string;
    age_months: number;
    stage: 'seedling' | 'sprout' | 'sapling' | 'tree';
}

interface WeeklyTargets {
    subject: string;
    week: number;
    focus_area: string;
    skill_targets: string[];
    faith_framing?: string;
    spineVersion?: string;
}

export class ArcGenerator {
    private db: D1Database;
    private gemini: GeminiService;

    constructor(env: Env) {
        this.db = env.DB;
        this.gemini = new GeminiService(env.GOOGLE_API_KEY, 'gemini-3-flash-preview');
    }

    /**
     * Generate a 2-week formation arc with unified daily anchors
     */
    async generateArc(householdId: string, feedback?: string): Promise<{ arc: FormationArc; reasoning: string }> {
        console.log('[ArcGenerator] Generating unified arc for household:', householdId);

        // 1. Get eligible children (0-6 years only)
        const children = await this.getEligibleChildren(householdId);
        if (children.length === 0) {
            throw new Error('No eligible children (0-6 years) found in household');
        }
        console.log('[ArcGenerator] Eligible children:', children.map(c => c.name));

        // 2. Get child progress map (what has each child mastered?)
        const progressMap = await this.getChildProgressMap(children);

        // 3. Get weekly targets from all subject spines
        const weeklyTargets = await this.getWeeklyTargets(householdId);

        // 4. Get current liturgy position
        const liturgyPosition = await this.getLiturgyPosition(householdId);

        // 5. Generate unified arc with AI
        const arc = await this.createUnifiedArc(
            householdId,
            children,
            weeklyTargets,
            progressMap,
            liturgyPosition,
            feedback
        );

        // 6. Store arc
        await this.storeArc(arc);

        return { arc, reasoning: arc.generation_reasoning };
    }

    /**
     * Get children aged 0-6 years
     */
    private async getEligibleChildren(householdId: string): Promise<ChildData[]> {
        const result = await safeQuery<StudentDbRecord>(this.db,
            'SELECT * FROM students WHERE household_id = ?',
            [householdId]
        );

        return (result.results || [])
            .map((c) => {
                const ageMonths = this.calculateAgeMonths(c.date_of_birth);
                return {
                    id: c.id,
                    name: c.name,
                    date_of_birth: c.date_of_birth,
                    age_months: ageMonths,
                    stage: this.determineStage(ageMonths)
                };
            })
            .filter((c: ChildData) => c.age_months <= 84); // 0-7 years (84 months), slight buffer
    }

    /**
     * Get progress for each child
     */
    private async getChildProgressMap(children: ChildData[]): Promise<Map<string, SkillProgressRecord[]>> {
        const progressMap = new Map<string, SkillProgressRecord[]>();

        for (const child of children) {
            const result = await safeQuery<SkillProgressRecord>(this.db,
                `SELECT subject, skill_target, mastery_level, practice_count 
                 FROM child_progress WHERE child_id = ?`,
                [child.id]
            );
            progressMap.set(child.id, result.results || []);
        }

        return progressMap;
    }

    /**
     * Get current week targets from all subject spines
     */
    private async getWeeklyTargets(householdId: string): Promise<WeeklyTargets[]> {
        const subjects = ['literacy', 'numeracy', 'formation', 'motor'];
        const targets: WeeklyTargets[] = [];

        for (const subject of subjects) {
            // Get family's current position for this subject
            const position = await safeQueryFirst<CurriculumPositionRecord>(this.db,
                `SELECT current_week, spine_version FROM family_curriculum_position 
                 WHERE household_id = ? AND subject = ?`,
                [householdId, subject]
            );

            let currentWeek = position?.current_week || 1;
            let spineVersion = position?.spine_version;

            // 1C. Auto-detect latest approved spine if not set
            if (!spineVersion) {
                const latestSpine = await safeQueryFirst<{ spine_version: string }>(this.db,
                    `SELECT spine_version FROM spine_metadata 
                     WHERE status = 'approved' AND subjects LIKE ? 
                     ORDER BY approved_at DESC LIMIT 1`,
                    [`%${subject}%`]
                );

                if (latestSpine) {
                    spineVersion = latestSpine.spine_version;
                    // Self-heal: persist so auto-advance works for first-cycle families
                    await safeRun(this.db, `
                        INSERT INTO family_curriculum_position (id, household_id, subject, current_week, spine_version)
                        VALUES (?, ?, ?, 1, ?)
                        ON CONFLICT(household_id, subject) DO NOTHING
                    `, [crypto.randomUUID(), householdId, subject, spineVersion]);
                }
            }

            // Get spine entry for this week
            let spineEntry: SpineRecord | null = null;
            if (spineVersion) {
                spineEntry = await safeQueryFirst<SpineRecord>(this.db,
                    `SELECT * FROM curriculum_spine 
                     WHERE spine_version = ? AND subject = ? AND week_number = ?`,
                    [spineVersion, subject, currentWeek]
                );
            }

            // If we have a spine entry, use it; otherwise use defaults
            if (spineEntry) {
                targets.push({
                    subject,
                    week: currentWeek,
                    focus_area: spineEntry.focus_area,
                    skill_targets: JSON.parse(spineEntry.skill_targets || '[]'),
                    faith_framing: spineEntry.faith_framing,
                    spineVersion: spineVersion || undefined
                });
            } else {
                // Default targets when no spine is available
                targets.push(this.getDefaultTargets(subject, currentWeek));
            }
        }

        return targets;
    }

    /**
     * Get current liturgy position (hymn, catechism question)
     */
    private async getLiturgyPosition(householdId: string): Promise<{ hymn_index: number; catechism_q: number }> {
        const profile = await safeQueryFirst<ProfileDbRecord>(this.db,
            'SELECT catechism_position FROM family_profiles WHERE id = ?',
            [householdId]
        );

        // Try getting from family_preferences too
        const prefs = await safeQueryFirst<FamilyPreferencesRecord>(this.db,
            'SELECT overrides_json FROM family_preferences WHERE parent_id IN (SELECT parent_id FROM households WHERE id = ?)',
            [householdId]
        );

        let hymnIndex = 0;
        if (prefs?.overrides_json) {
            try {
                const overrides = JSON.parse(prefs.overrides_json) as Record<string, unknown>;
                hymnIndex = (overrides.hymn_index as number) || 0;
            } catch { /* Empty catch - fallback to default hymn index */ }
        }

        return {
            hymn_index: hymnIndex,
            catechism_q: profile?.catechism_position || 1
        };
    }

    /**
     * Create the unified arc using AI
     */
    private async createUnifiedArc(
        householdId: string,
        children: ChildData[],
        targets: WeeklyTargets[],
        progressMap: Map<string, SkillProgressRecord[]>,
        liturgyPosition: { hymn_index: number; catechism_q: number },
        feedback?: string
    ): Promise<FormationArc> {
        const systemPrompt = `You are a Reformed Christian homeschool curriculum planner.
Create a 2-week "Formation Arc" with 14 daily unified anchors for this family.

CRITICAL: Each day has EXACTLY:
1. LITURGY: One hymn, one verse, one catechism question (same for all children)
2. ONE ACTIVITY: Cross-curricular, hitting multiple skill targets at once
   - Each child gets a ROLE appropriate to their stage
   - Activity should be practical: baking, gardening, crafts, games, outdoor play
3. ONE BOOK: Shared family read-aloud

STAGES (assign roles based on these):
- Seedling (0-24 mos): Observes, touches materials, hears words
- Sprout (2-4 yrs): Participates with help, simple tasks, imitation
- Sapling (4-7 yrs): Follows instructions, counts, traces letters, narrates
- Tree (7+ yrs): Leads, teaches younger siblings, writes

SUBJECT WEIGHTING (activities should implicitly cover):
- Literacy: 5x/week (rhyme, phonics, letters, vocabulary)
- Formation: daily (woven into liturgy + character during activity)
- Numeracy: 3-4x/week (counting, patterns, shapes)
- African History: 1-2x/week (stories, heritage connections)

Output ONLY valid JSON matching the FormationArc interface.`;

        const childrenSummary = children.map(c => ({
            id: c.id,
            name: c.name,
            age_months: c.age_months,
            stage: c.stage,
            mastered_skills: (progressMap.get(c.id) || [])
                .filter((p) => p.mastery_level === 'mastered')
                .map((p) => p.skill_target)
        }));

        const targetsSummary = targets.map(t => ({
            subject: t.subject,
            week: t.week,
            focus: t.focus_area,
            skills: t.skill_targets.slice(0, 3)
        }));

        // Get available books and hymns (filter out draft series)
        const DRAFT_SERIES = ['working_fathers_of_soroti', 'sanyus_growing_heart', 'young_historians_africa', 'the_a_to_z_picture_books_for_kids', 'african_history'];
        const publishedBooks = BOOKS_DATA.filter(b => {
            const series = b.path.split('/')[2] || ''; // path: /books/{series}/{bookId}/content.md
            return !DRAFT_SERIES.includes(series);
        });
        const availableBooks = publishedBooks.slice(0, 20).map(b => ({ id: b.id, title: b.title, theme: b.theme }));
        const availableHymns = [
            { id: 'hymn_mighty_fortress', title: 'A Mighty Fortress' },
            { id: 'hymn_amazing_grace', title: 'Amazing Grace' },
            { id: 'hymn_great_is_thy', title: 'Great Is Thy Faithfulness' },
            { id: 'hymn_how_great', title: 'How Great Thou Art' },
            { id: 'hymn_holy_holy', title: 'Holy, Holy, Holy' }
        ];

        const catechismRange = CATECHISM_DATA.slice(
            liturgyPosition.catechism_q - 1,
            liturgyPosition.catechism_q + 13
        ).map(q => ({ number: q.number, question: q.question }));

        const userPrompt = `Generate a 2-week Formation Arc:

FAMILY:
${JSON.stringify(childrenSummary, null, 2)}

CURRENT WEEK TARGETS:
${JSON.stringify(targetsSummary, null, 2)}

AVAILABLE RESOURCES:
- Books: ${JSON.stringify(availableBooks)}
- Hymns: ${JSON.stringify(availableHymns)}
- Catechism Questions: ${JSON.stringify(catechismRange)}

${feedback ? `PARENT FEEDBACK: ${feedback}` : ''}

Generate 14 daily plans. Each activity should hit 2-3 skill targets from different subjects.
Materials should be common household items only.`;

        console.log('[ArcGenerator] Calling Gemini for unified arc...');
        const startTime = Date.now();

        try {
            const result = await this.gemini.generateContent(
                [{ role: 'user', parts: [{ text: userPrompt }] }],
                systemPrompt,
                null,
                'application/json'
            );
            const responseText = result.text;

            console.log(`[ArcGenerator] Gemini responded in ${Date.now() - startTime}ms`);

            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                console.error('[ArcGenerator] JSON Parse Error. Raw:', responseText.substring(0, 500));
                throw new Error('Failed to parse Gemini response');
            }

            const arc: FormationArc = {
                id: crypto.randomUUID(),
                household_id: householdId,
                spine_version: targets.find(t => t.spineVersion)?.spineVersion || 'default',
                duration_weeks: 2,
                arc_start_date: new Date().toISOString().split('T')[0],
                daily_plans: responseData.daily_plans || responseData.dailyPlans || [],
                generation_reasoning: responseData.reasoning || 'Generated unified arc with cross-curricular activities'
            };

            // Validate we have 14 days
            if (arc.daily_plans.length < 10) {
                console.warn('[ArcGenerator] Only got', arc.daily_plans.length, 'days, expected 14');
            }

            return arc;
        } catch (error) {
            console.error('[ArcGenerator] Error:', error);
            throw error;
        }
    }

    /**
     * Store the arc in the database
     */
    private async storeArc(arc: FormationArc): Promise<void> {
        await safeRun(this.db, `
            INSERT INTO formation_arcs (id, household_id, arc_start_date, arc_end_date, arc_data, generation_reasoning, status, spine_version)
            VALUES (?, ?, ?, DATE(?, '+14 days'), ?, ?, 'active', ?)
            ON CONFLICT(id) DO UPDATE SET arc_data = excluded.arc_data, status = 'active'
        `, [
            arc.id,
            arc.household_id,
            arc.arc_start_date,
            arc.arc_start_date,
            JSON.stringify(arc),
            arc.generation_reasoning,
            arc.spine_version
        ]);

        console.log('[ArcGenerator] Stored arc:', arc.id);
    }

    /**
     * Record skill progress for a child after completing an anchor
     */
    async recordChildProgress(
        childId: string,
        anchorId: string,
        skillsPracticed: { subject: string; skill_target: string }[],
        parentNotes?: string
    ): Promise<void> {
        for (const skill of skillsPracticed) {
            // Check if skill already exists
            const existing = await safeQueryFirst<SkillProgressRecord & { id: string }>(this.db,
                `SELECT id, practice_count, mastery_level FROM child_progress 
                 WHERE child_id = ? AND subject = ? AND skill_target = ?`,
                [childId, skill.subject, skill.skill_target]
            );

            if (existing) {
                // Update existing: increment practice count, maybe upgrade mastery
                const newCount = (existing.practice_count || 0) + 1;
                let newLevel = existing.mastery_level;

                // Simple mastery progression: 3 practices = practicing, 6 = mastered
                if (newCount >= 6) newLevel = 'mastered';
                else if (newCount >= 3) newLevel = 'practicing';

                await safeRun(this.db, `
                    UPDATE child_progress 
                    SET practice_count = ?, mastery_level = ?, evidence_anchor_id = ?, 
                        parent_notes = COALESCE(?, parent_notes), updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [newCount, newLevel, anchorId, parentNotes, existing.id]);
            } else {
                // Insert new skill record
                await safeRun(this.db, `
                    INSERT INTO child_progress (id, child_id, subject, skill_target, evidence_anchor_id, parent_notes)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [crypto.randomUUID(), childId, skill.subject, skill.skill_target, anchorId, parentNotes]);
            }
        }
    }

    /**
     * Advance curriculum position after completing a week
     */
    /**
     * Advance curriculum position after completing a week
     * Now tracks spine_version to ensure continuity
     */
    async advanceCurriculumPosition(householdId: string, subject: string, spineVersion: string): Promise<void> {
        await safeRun(this.db, `
            INSERT INTO family_curriculum_position (id, household_id, subject, current_week, spine_version)
            VALUES (?, ?, ?, 1, ?)
            ON CONFLICT(household_id, subject) DO UPDATE SET 
                current_week = current_week + 1,
                spine_version = excluded.spine_version,
                updated_at = CURRENT_TIMESTAMP
        `, [crypto.randomUUID(), householdId, subject, spineVersion]);
    }

    /**
     * Aggregate feedback for a completed arc
     */
    async aggregateFeedback(householdId: string, arcId: string): Promise<void> {
        // 1. Get all anchors for this arc
        const anchors = await safeQuery<any>(this.db,
            `SELECT status, completion_feedback FROM daily_anchors WHERE arc_id = ?`,
            [arcId]
        );

        const total = anchors.results.length;
        const completed = anchors.results.filter((a: any) => a.status === 'completed').length;
        const skipped = anchors.results.filter((a: any) => a.status === 'skipped').length;

        // Calculate average rating
        let ratingSum = 0;
        let ratingCount = 0;

        anchors.results.forEach((a: any) => {
            if (a.completion_feedback) {
                try {
                    const fb = JSON.parse(a.completion_feedback);
                    if (fb.rating) {
                        ratingSum += Number(fb.rating);
                        ratingCount++;
                    }
                } catch { /* ignore */ }
            }
        });

        const avgRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(2) : null;

        // 2. Write to summary table
        try {
            await safeRun(this.db, `
                INSERT INTO anchor_feedback_summary (
                    id, household_id, arc_id, total_completed, 
                    total_skipped, avg_rating, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, [
                crypto.randomUUID(),
                householdId,
                arcId,
                completed,
                skipped,
                avgRating
            ]);
            console.log(`[ArcGenerator] Aggregated feedback for arc ${arcId}`);
        } catch (e: any) {
            console.warn('[ArcGenerator] Failed to write feedback summary (table might be missing):', e.message);
        }
    }

    /**
     * Get active arc for a household
     */
    async getActiveArc(householdId: string): Promise<FormationArc | null> {
        const result = await safeQueryFirst<any>(
            this.db,
            "SELECT * FROM formation_arcs WHERE household_id = ? AND status = 'active' ORDER BY arc_start_date DESC",
            [householdId]
        );

        if (!result) return null;

        try {
            return JSON.parse(result.arc_data);
        } catch {
            console.error('[ArcGenerator] Failed to parse stored arc');
            return null;
        }
    }

    // ========== Helper Methods ==========

    private calculateAgeMonths(dob: string): number {
        const birthDate = new Date(dob);
        const today = new Date();
        return (today.getFullYear() - birthDate.getFullYear()) * 12 +
            (today.getMonth() - birthDate.getMonth());
    }

    private determineStage(ageMonths: number): 'seedling' | 'sprout' | 'sapling' | 'tree' {
        if (ageMonths < 24) return 'seedling';
        if (ageMonths < 48) return 'sprout';
        if (ageMonths < 84) return 'sapling';
        return 'tree';
    }

    private getDefaultTargets(subject: string, week: number): WeeklyTargets {
        const defaults: Record<string, WeeklyTargets> = {
            literacy: {
                subject: 'literacy',
                week,
                focus_area: 'phonological_awareness',
                skill_targets: ['rhyme_recognition', 'syllable_clapping', 'letter_sounds']
            },
            numeracy: {
                subject: 'numeracy',
                week,
                focus_area: 'early_number_sense',
                skill_targets: ['counting_objects', 'number_recognition', 'simple_patterns']
            },
            formation: {
                subject: 'formation',
                week,
                focus_area: 'character_development',
                skill_targets: ['obedience', 'kindness', 'gratitude']
            },
            african_history: {
                subject: 'african_history',
                week,
                focus_area: 'heritage_stories',
                skill_targets: ['african_proverbs', 'historical_figures', 'cultural_traditions']
            }
        };

        return defaults[subject] || defaults.literacy;
    }
}
