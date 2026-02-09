import { D1Database } from '@cloudflare/workers-types';
import { safeQuery, safeQueryFirst, safeRun } from '../lib/db';
import { GeminiService } from './gemini';
import { Env } from '../types';
import { ArcGenerator, DailyPlan, FormationArc } from './arc-generator';
import { CATECHISM_DATA, BOOKS_DATA } from './data';
import { AnchorDbRecord } from './types';
import { AITelemetryService } from '../services/ai-telemetry';

/**
 * Anchor Generator with Guardrails
 * 
 * Generates daily anchors from the arc's daily_plans.
 * If arc has pre-built plans, enriches them with context.
 * If not, generates fresh with strict guardrails.
 */

// Safety guardrails for AI-generated activities
const MATERIAL_WHITELIST = [
    // Kitchen
    'measuring cups', 'measuring spoons', 'mixing bowl', 'wooden spoon', 'baking sheet',
    'muffin tin', 'rolling pin', 'cookie cutters', 'parchment paper', 'apron',
    // Art
    'crayons', 'colored pencils', 'markers', 'watercolors', 'paintbrush', 'paper',
    'construction paper', 'glue stick', 'child-safe scissors', 'play dough', 'clay',
    // Learning
    'blocks', 'counting bears', 'alphabet cards', 'number cards', 'books', 'puzzles',
    'magnetic letters', 'dry erase board', 'chalk', 'chalkboard',
    // Nature
    'leaves', 'sticks', 'rocks', 'flowers', 'seeds', 'soil', 'watering can', 'magnifying glass',
    // Household
    'socks', 'buttons', 'containers', 'lids', 'fabric scraps', 'yarn', 'string',
    // Food items (for cooking activities)
    'flour', 'sugar', 'eggs', 'butter', 'milk', 'banana', 'apple', 'oats', 'honey'
];

const AGE_SAFETY_RULES = `
SAFETY RULES (STRICT):
- NO sharp objects for children under 6
- NO small items that can be choking hazards for children under 3
- NO hot surfaces without direct parent supervision noted
- NO electrical appliances operated by children
- Activities must be completable indoors OR outdoors (specify which)
`;

export interface AnchorContext {
    weather?: 'sunny' | 'rainy' | 'cloudy' | 'cold';
    timeAvailable?: number;  // minutes
    materialsOnHand?: string[];
    parentMood?: 'energetic' | 'tired' | 'normal';
    adjustments?: string;
}

export interface DailyAnchor {
    id: string;
    date: string;
    arc_id: string;
    day_in_arc: number;
    theme: string;
    liturgy: {
        hymn: string;
        hymn_id?: string;
        hymn_audio_url?: string;
        catechism_q: number;
        catechism_question: string;
        catechism_a: string;
        scripture: string;
    };
    family_activity: {
        id: string;
        title: string;
        description: string;
        skill_domain: string;
        targets_covered: string[];
        formation_lens: string;
        materials: string[];
        duration_minutes: number;
        location: 'indoor' | 'outdoor' | 'either';
        levels: Array<{
            child_id: string;
            child_name: string;
            age_months?: number;
            stage: string;
            role: string;
            instruction: string;
        }>;
    };
    book_nook?: {
        id: string;
        series?: string;
        title: string;
        author?: string;
        cover_image?: string;
        render_format?: string;
        discussion_prompt: string;
    };
    reasoning: string;
    confidence: 'high' | 'medium' | 'experimental';
}

export class AnchorGenerator {
    private db: D1Database;
    private gemini: GeminiService;
    private arcGenerator: ArcGenerator;
    private telemetry: AITelemetryService;

    constructor(env: Env) {
        this.db = env.DB;
        this.gemini = new GeminiService(env.GOOGLE_API_KEY, 'gemini-3-flash-preview');
        this.arcGenerator = new ArcGenerator(env);
        this.telemetry = new AITelemetryService(env.DB);
    }

    /**
     * Get today's anchor (cached or generated)
     */
    async getTodayAnchor(householdId: string, context?: AnchorContext, waitUntil?: (p: Promise<any>) => void): Promise<DailyAnchor | null> {
        const today = new Date().toISOString().split('T')[0];

        // Check cache first
        const cached = await safeQueryFirst<AnchorDbRecord>(
            this.db,
            "SELECT * FROM daily_anchors WHERE household_id = ? AND anchor_date = ? AND status = 'active'",
            [householdId, today]
        );

        if (cached && !context?.adjustments) {
            console.log('[AnchorGenerator] Returning cached anchor');
            // Log cache hit telemetry
            this.telemetry.logTelemetry({
                feature: 'anchor_generation',
                status: 'success',
                latency_ms: 0,
                metadata: { type: 'cache_hit' }
            }, waitUntil);
            return JSON.parse(cached.anchor_data);
        }

        console.log('[AnchorGenerator] Generating new anchor for:', householdId);
        return this.generateAnchor(householdId, today, context, waitUntil);
    }

    /**
     * Generate anchor with guardrails and context awareness
     */
    async generateAnchor(householdId: string, date: string, context?: AnchorContext, waitUntil?: (p: Promise<any>) => void): Promise<DailyAnchor> {
        console.log('[AnchorGenerator] 🚀 START - Household:', householdId, 'Date:', date);

        // 1. Get Active Arc
        let activeArc = await this.arcGenerator.getActiveArc(householdId);

        if (!activeArc) {
            console.log('[AnchorGenerator] No active arc. Generating...');
            await this.arcGenerator.generateArc(householdId);
            activeArc = await this.arcGenerator.getActiveArc(householdId);
        }

        if (!activeArc) throw new Error("Failed to generate formation arc");

        // 2. Calculate day in arc
        const arcStart = new Date(activeArc.arc_start_date);
        const targetDate = new Date(date);
        const diffDays = Math.ceil((targetDate.getTime() - arcStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const dayInArc = Math.max(1, Math.min(diffDays, 14)); // Clamp 1-14

        // 3. Get pre-built plan from arc (if exists)
        const prebuiltPlan = activeArc.daily_plans?.[dayInArc - 1];

        let anchor: DailyAnchor;

        if (prebuiltPlan && !context?.adjustments) {
            // Use pre-built plan directly (more efficient)
            anchor = this.convertPlanToAnchor(prebuiltPlan, activeArc.id, date, dayInArc);
            console.log('[AnchorGenerator] Using pre-built plan for day', dayInArc);
            this.telemetry.logTelemetry({
                feature: 'anchor_generation',
                status: 'success',
                latency_ms: 0,
                metadata: { type: 'prebuilt_plan', dayInArc, hasBasePlan: true }
            }, waitUntil);
        } else {
            // Generate with AI (with guardrails)
            anchor = await this.generateWithAI(householdId, activeArc, dayInArc, date, prebuiltPlan, context, waitUntil);
        }

        // 4. Validate materials against whitelist
        const { materials, violations } = this.validateMaterials(anchor.family_activity.materials);
        anchor.family_activity.materials = materials;
        if (violations.length > 0) {
            this.telemetry.logTelemetry({
                feature: 'anchor_guardrails',
                status: 'error',
                latency_ms: 0,
                error_type: 'invalid_materials',
                metadata: { invalidMaterials: violations.slice(0, 10) }
            }, waitUntil);
        }

        // 4b. Runtime Safety Check
        const safetyCheck = this.validateSafety(anchor);
        if (!safetyCheck.isSafe) {
            this.telemetry.logTelemetry({
                feature: 'anchor_guardrails',
                status: 'error',
                latency_ms: 0,
                error_type: 'safety_violation',
                metadata: { violations: safetyCheck.violations }
            }, waitUntil);

            // In a real scenario, we might retry generation here.
            // For now, we append a warning to the reasoning so the parent sees it.
            anchor.reasoning += ` [SAFETY WARNING: ${safetyCheck.violations.join(', ')}]`;
        }


        // 5. Store anchor
        await this.storeAnchor(householdId, activeArc.id, date, anchor);
        await this.telemetry.logContentAudit({
            feature: 'anchor',
            content_id: anchor.id,
            content_excerpt: this.buildAnchorAuditExcerpt(anchor)
        }, waitUntil);

        return anchor;
    }

    /**
     * Convert pre-built DailyPlan to DailyAnchor format
     */
    private convertPlanToAnchor(plan: DailyPlan, arcId: string, date: string, dayInArc: number): DailyAnchor {
        // Get catechism data
        const catechismEntry = CATECHISM_DATA.find(c => c.number === plan.liturgy?.catechism_q) || CATECHISM_DATA[0];

        return {
            id: crypto.randomUUID(),
            date,
            arc_id: arcId,
            day_in_arc: dayInArc,
            theme: plan.activity?.title || 'Daily Formation',
            liturgy: {
                hymn: plan.liturgy?.hymn_title || 'A Mighty Fortress',
                hymn_id: plan.liturgy?.hymn_id,
                catechism_q: plan.liturgy?.catechism_q || 1,
                catechism_question: catechismEntry.question,
                catechism_a: catechismEntry.answer,
                scripture: plan.liturgy?.verse || 'Psalm 23:1'
            },
            family_activity: {
                id: plan.activity?.id || crypto.randomUUID(),
                title: plan.activity?.title || 'Family Activity',
                description: plan.activity?.description || '',
                skill_domain: plan.activity?.targets_covered?.[0]?.split(':')[0] || 'formation',
                targets_covered: plan.activity?.targets_covered || [],
                formation_lens: 'Growing together in wisdom and love',
                materials: plan.activity?.materials_needed || [],
                duration_minutes: plan.activity?.duration_minutes || 20,
                location: 'either',
                levels: (plan.activity?.child_roles || []).map(role => ({
                    child_id: role.child_id,
                    child_name: role.child_name,
                    age_months: role.age_months,
                    stage: role.stage,
                    role: this.mapStageToRole(role.stage),
                    instruction: role.role
                }))
            },
            book_nook: plan.book ? {
                id: plan.book.id,
                series: plan.book.series || this.extractSeriesFromBook(plan.book),
                title: plan.book.title,
                author: plan.book.author,
                cover_image: plan.book.cover_image,
                render_format: 'images',
                discussion_prompt: 'What did you notice in this story?'
            } : undefined,
            reasoning: 'Generated from pre-built arc plan',
            confidence: 'high'
        };
    }

    /**
     * Generate anchor with AI when no pre-built plan or adjustments needed
     */
    private async generateWithAI(
        householdId: string,
        arc: FormationArc,
        dayInArc: number,
        date: string,
        basePlan: DailyPlan | undefined,
        context?: AnchorContext,
        waitUntil?: (p: Promise<any>) => void
    ): Promise<DailyAnchor> {
        // Build context string
        const contextStr = this.buildContextString(context);

        // Fetch children for this household
        const rawChildren = await safeQuery<{ id: string; name: string; date_of_birth: string }>(
            this.db,
            "SELECT id, name, date_of_birth FROM students WHERE household_id = ?",
            [householdId]
        );
        const children = (rawChildren.results || []).map(c => {
            const ageMonths = this.calculateAgeMonths(c.date_of_birth);
            return { id: c.id, name: c.name, age_months: ageMonths, stage: this.determineStage(ageMonths) };
        });

        // Build children context
        const childrenStr = children.length > 0
            ? children.map(c => `- ${c.name}, ${c.age_months} months old, stage: ${c.stage}`).join('\n')
            : '- No children data available';

        // Build available books (published only, same filter as arc-generator)
        const DRAFT_SERIES = ['working_fathers_of_soroti', 'sanyus_growing_heart', 'young_historians_africa', 'the_a_to_z_picture_books_for_kids', 'african_history'];
        const publishedBooks = BOOKS_DATA.filter(b => {
            const series = b.path.split('/')[2] || '';
            return !DRAFT_SERIES.includes(series);
        });
        const booksStr = publishedBooks.slice(0, 20).map(b => `- "${b.title}" (id: ${b.id}, series: ${b.series || b.path.split('/')[2] || 'library'})`).join('\n');

        // Available hymns (same list as arc-generator)
        const hymnsStr = `- A Mighty Fortress (id: hymn_mighty_fortress)
- Amazing Grace (id: hymn_amazing_grace)
- Great Is Thy Faithfulness (id: hymn_great_is_thy)
- How Great Thou Art (id: hymn_how_great)
- Holy, Holy, Holy (id: hymn_holy_holy)`;

        // Catechism range
        const catechismStr = CATECHISM_DATA.map(q => `Q${q.number}: "${q.question}" / A: "${q.answer}"`).join('\n');

        // If adjusting, get current anchor
        let currentAnchorStr = '';
        if (context?.adjustments) {
            const currentAnchor = await safeQueryFirst<AnchorDbRecord>(
                this.db,
                "SELECT anchor_data FROM daily_anchors WHERE household_id = ? AND anchor_date = ? AND status = 'active'",
                [householdId, date]
            );
            if (currentAnchor?.anchor_data) {
                currentAnchorStr = `\nCURRENT PLAN (the parent wants to change this):\n${currentAnchor.anchor_data}\n\nParent's request: "${context.adjustments}"`;
            }
        }

        const systemPrompt = `You are a creative Christian homeschooling assistant generating a Daily Anchor.

${AGE_SAFETY_RULES}

MATERIAL CONSTRAINTS:
Only suggest materials from this list: ${MATERIAL_WHITELIST.slice(0, 30).join(', ')}

CHILDREN IN THIS FAMILY:
${childrenStr}

AVAILABLE BOOKS (you MUST choose from this list):
${booksStr}

AVAILABLE HYMNS (you MUST choose from this list):
${hymnsStr}

CATECHISM QUESTIONS (use from this range):
${catechismStr}

${basePlan ? `BASE PLAN (enhance this):\n${JSON.stringify(basePlan, null, 2)}` : 'Create a fresh plan.'}

${contextStr}
${currentAnchorStr}

Output ONLY valid JSON matching this schema:
{
  "theme": "string - short, inspiring title",
  "liturgy": {
    "hymn": "string - MUST be from the AVAILABLE HYMNS list",
    "hymn_id": "string - the id from the AVAILABLE HYMNS list",
    "catechism_q": number,
    "catechism_question": "string",
    "catechism_a": "string",
    "scripture": "string (single verse reference)"
  },
  "family_activity": {
    "title": "string",
    "description": "string - 2-3 sentences",
    "skill_domain": "literacy|numeracy|formation|motor|nature",
    "targets_covered": ["subject:skill", ...],
    "formation_lens": "string - theological connection",
    "materials": ["string", ...],
    "duration_minutes": number (10-30),
    "location": "indoor|outdoor|either",
    "levels": [{"child_name": "string", "stage": "string", "role": "Observer|Participant|Helper|Leader", "instruction": "string"}]
  },
  "book_nook": {
    "id": "string - MUST be from the AVAILABLE BOOKS list",
    "series": "string - MUST be the series value from the AVAILABLE BOOKS list",
    "title": "string - MUST be from the AVAILABLE BOOKS list",
    "discussion_prompt": "string"
  },
  "reasoning": "string - brief explanation for parent"
}`;

        const userPrompt = `Generate Daily Anchor for Day ${dayInArc} of 14.
Date: ${date}
${context?.adjustments && !currentAnchorStr ? `Parent Adjustment Request: ${context.adjustments}` : ''}`;

        console.log('[AnchorGenerator] Calling Gemini with guardrails...');
        const startTime = Date.now();
        let responseText: string;
        let usage: any;

        try {
            const result = await this.gemini.generateContent(
                [{ role: 'user', parts: [{ text: userPrompt }] }],
                systemPrompt,
                null,
                'application/json'
            );
            responseText = result.text;
            usage = result.usage;

            this.telemetry.logTelemetry({
                feature: 'anchor_generation',
                model: 'gemini-3-flash-preview',
                request_tokens: usage?.promptTokenCount,
                response_tokens: usage?.candidatesTokenCount,
                latency_ms: Date.now() - startTime,
                status: 'success',
                metadata: { type: 'generation', dayInArc, hasBasePlan: !!basePlan }
            }, waitUntil);
        } catch (error) {
            this.telemetry.logTelemetry({
                feature: 'anchor_generation',
                model: 'gemini-3-flash-preview',
                latency_ms: Date.now() - startTime,
                status: 'error',
                error_type: error instanceof Error ? error.message : 'Unknown error',
                metadata: { type: 'generation', dayInArc }
            }, waitUntil);
            throw error;
        }

        console.log(`[AnchorGenerator] Gemini responded in ${Date.now() - startTime}ms`);

        const responseData = JSON.parse(responseText);
        const anchor = responseData.anchor || responseData;

        return {
            id: crypto.randomUUID(),
            date,
            arc_id: arc.id,
            day_in_arc: dayInArc,
            theme: anchor.theme || 'Daily Formation',
            liturgy: anchor.liturgy || {
                hymn: 'A Mighty Fortress',
                catechism_q: 1,
                catechism_question: CATECHISM_DATA[0].question,
                catechism_a: CATECHISM_DATA[0].answer,
                scripture: 'Psalm 23:1'
            },
            family_activity: {
                id: crypto.randomUUID(),
                title: anchor.family_activity?.title || 'Family Activity',
                description: anchor.family_activity?.description || '',
                skill_domain: anchor.family_activity?.skill_domain || 'formation',
                targets_covered: anchor.family_activity?.targets_covered || [],
                formation_lens: anchor.family_activity?.formation_lens || '',
                materials: anchor.family_activity?.materials || [],
                duration_minutes: anchor.family_activity?.duration_minutes || 20,
                location: anchor.family_activity?.location || 'either',
                levels: anchor.family_activity?.levels || []
            },
            book_nook: anchor.book_nook ? (() => {
                // Enrich AI-generated book_nook with series and cover_image from static data
                const bookMatch = BOOKS_DATA.find(b => b.id === anchor.book_nook?.id);
                return {
                    ...anchor.book_nook,
                    series: anchor.book_nook.series || bookMatch?.series || this.extractSeriesFromBook(bookMatch || { id: anchor.book_nook.id }),
                    cover_image: bookMatch?.cover_image || anchor.book_nook.cover_image,
                    author: anchor.book_nook.author || bookMatch?.author,
                };
            })() : undefined,
            reasoning: anchor.reasoning || 'Generated with AI assistance',
            confidence: basePlan ? 'medium' : 'experimental'
        };
    }

    /**
     * Build context string from context object
     */
    private buildContextString(context?: AnchorContext): string {
        if (!context) return '';

        const parts: string[] = [];

        if (context.weather) {
            parts.push(`Weather: ${context.weather} - suggest ${context.weather === 'rainy' ? 'indoor' : 'weather-appropriate'} activities`);
        }
        if (context.timeAvailable) {
            parts.push(`Time available: ${context.timeAvailable} minutes`);
        }
        if (context.materialsOnHand?.length) {
            parts.push(`Materials on hand: ${context.materialsOnHand.join(', ')}`);
        }
        if (context.parentMood === 'tired') {
            parts.push('Parent mood: Suggest low-prep activities today');
        } else if (context.parentMood === 'energetic') {
            parts.push('Parent mood: Suggest active, outdoor, or hands-on activities today');
        }

        return parts.length ? `\nCONTEXT:\n${parts.join('\n')}` : '';
    }

    /**
     * Validate materials against whitelist with strict token matching
     */
    private validateMaterials(materials: string[]): { materials: string[]; violations: string[] } {
        const violations: string[] = [];
        const DISALLOWED_MODIFIERS = ['sharp', 'hot', 'electric', 'toxic', 'glass', 'knife', 'needle'];

        const filtered = materials.filter(m => {
            const normalized = m.toLowerCase().trim();

            // 1. Check for dangerous modifiers
            if (DISALLOWED_MODIFIERS.some(mod => normalized.includes(mod))) {
                // Exception for "child-safe"
                if (!normalized.includes('child-safe')) {
                    violations.push(normalized);
                    return false;
                }
            }

            // 2. Strict Whitelist Matching
            // We want to ensure the material *is* a whitelisted item, or is substantially just that item.
            // E.g. "red construction paper" is fine because "construction paper" is whitelisted.
            // But "sharp scissors" is NOT fine even if "scissors" is whitelisted (handled by modifier check above).

            const isWhitelisted = MATERIAL_WHITELIST.some(allowedItem => {
                // Exact match
                if (normalized === allowedItem) return true;
                // Ends with match (e.g. "blue construction paper")
                if (normalized.endsWith(allowedItem)) return true;
                // Starts with match (e.g. "construction paper strips")
                if (normalized.startsWith(allowedItem)) return true;

                return false;
            });

            if (!isWhitelisted) {
                violations.push(normalized);
                return false;
            }

            return true;
        });

        return { materials: filtered, violations };
    }

    /**
     * Validate safety based on child age and enforce role constraints
     */
    private validateSafety(anchor: DailyAnchor): { isSafe: boolean; violations: string[] } {
        const violations: string[] = [];
        const activity = anchor.family_activity;

        // Find youngest participant
        const youngestAgeMonths = Math.min(
            ...activity.levels
                .filter(l => l.age_months)
                .map(l => l.age_months!)
        );

        // Rule 1: Choking Hazards (Under 3 years / 36 months)
        if (youngestAgeMonths < 36) {
            const CHOKING_HAZARDS = ['beads', 'buttons', 'marbles', 'coins', 'balloon', 'pen cap', 'batteries'];
            const hasHazard = activity.materials.some(m =>
                CHOKING_HAZARDS.some(h => m.includes(h))
            );
            if (hasHazard) {
                violations.push('Choking hazard detected for child under 3');
            }
        }

        // Rule 2: Sharp Objects (Under 6 years / 72 months) without supervision logic (simplified)
        // Note: 'scissors' is in whitelist, but we enforce 'child-safe' in materials check.
        // This is a double-check for descriptions.
        if (youngestAgeMonths < 72) {
            const SHARP_KEYWORDS = ['knife', 'needle', 'carving', 'whittle'];
            const description = (activity.description + activity.levels.map(l => l.instruction).join(' ')).toLowerCase();

            if (SHARP_KEYWORDS.some(k => description.includes(k))) {
                violations.push('Sharp object/action detected for child under 6');
            }
        }

        // Rule 3: Role Safety Enforcements (Phase 4)
        for (const level of activity.levels) {
            if (!level.age_months) continue;

            // Seedlings (0-24m) must be "Observer"
            if (level.age_months < 24 && level.role !== 'Observer') {
                console.log(`[AnchorGenerator] Downgrading ${level.child_name} from ${level.role} to Observer (Safety)`);
                level.role = 'Observer';
                level.instruction = 'Watch and listen as the family calculates/explores.';
            }

            // Sprouts (2-4y) cannot be "Leader"
            if (level.age_months >= 24 && level.age_months < 48 && level.role === 'Leader') {
                console.log(`[AnchorGenerator] Downgrading ${level.child_name} from Leader to Helper (Safety)`);
                level.role = 'Helper';
            }
        }

        return { isSafe: violations.length === 0, violations };
    }


    private buildAnchorAuditExcerpt(anchor: DailyAnchor): string {
        const lines = [
            `Theme: ${anchor.theme}`,
            `Activity: ${anchor.family_activity.title}`,
            `Domain: ${anchor.family_activity.skill_domain}`,
            `Materials: ${anchor.family_activity.materials.join(', ')}`
        ];
        return lines.join(' | ').slice(0, 1000);
    }

    /**
     * Map developmental stage to activity role
     */
    private mapStageToRole(stage: string): string {
        const roleMap: Record<string, string> = {
            'seedling': 'Observer',
            'sprout': 'Participant',
            'sapling': 'Helper',
            'tree': 'Leader'
        };
        return roleMap[stage] || 'Participant';
    }

    /**
     * Extract series from book data (path format: /books/{series}/{bookId}/content.md)
     */
    private extractSeriesFromBook(book: { id: string; path?: string; [key: string]: any }): string {
        if (book.path) {
            const parts = book.path.split('/');
            if (parts.length >= 3) return parts[2]; // /books/{series}/...
        }
        return 'library';
    }

    /**
     * Store anchor in database
     */
    private async storeAnchor(householdId: string, arcId: string, date: string, anchor: DailyAnchor): Promise<void> {
        const generationReasoning = anchor.reasoning ?? 'Generated anchor';
        const safeArcId = arcId || 'unknown';  // Prevent undefined from reaching D1
        await safeRun(this.db, `
            INSERT INTO daily_anchors (id, household_id, arc_id, anchor_date, anchor_data, generation_reasoning, status, regeneration_count)
            VALUES (?, ?, ?, ?, ?, ?, 'active', 0)
            ON CONFLICT(household_id, anchor_date, status) 
            DO UPDATE SET anchor_data = excluded.anchor_data, generation_reasoning = excluded.generation_reasoning, regeneration_count = regeneration_count + 1
        `, [
            anchor.id,
            householdId,
            safeArcId,
            date,
            JSON.stringify(anchor),
            generationReasoning
        ]);

        console.log('[AnchorGenerator] Stored anchor:', anchor.id);
    }

    /**
     * Mark anchor as complete and record progress
     */
    async completeAnchor(
        householdId: string,
        anchorId: string,
        feedback?: { rating?: number; notes?: string; lovedIt?: boolean }
    ): Promise<void> {
        // Get anchor data to extract skills practiced
        const anchorRow = await safeQueryFirst<any>(
            this.db,
            "SELECT anchor_data, arc_id FROM daily_anchors WHERE id = ? AND household_id = ?",
            [anchorId, householdId]
        );

        // Update anchor status
        await safeRun(this.db, `
            UPDATE daily_anchors 
            SET status = 'completed',
                completion_feedback = ?,
                completed_at = CURRENT_TIMESTAMP
            WHERE id = ? AND household_id = ?
        `, [
            feedback ? JSON.stringify(feedback) : null,
            anchorId,
            householdId
        ]);

        console.log('[AnchorGenerator] Marked anchor complete:', anchorId);

        // Record progress for each child
        if (anchorRow?.anchor_data) {
            try {
                const anchor: DailyAnchor = JSON.parse(anchorRow.anchor_data);
                const activity = anchor.family_activity;

                if (activity?.levels && activity.targets_covered?.length) {
                    const skillsPracticed = activity.targets_covered
                        .map(target => {
                            const [subject, skill_target] = target.split(':');
                            return subject && skill_target ? { subject, skill_target } : null;
                        })
                        .filter((s): s is { subject: string; skill_target: string } => s !== null);

                    for (const level of activity.levels) {
                        if (level.child_id && skillsPracticed.length) {
                            await this.arcGenerator.recordChildProgress(
                                level.child_id,
                                anchorId,
                                skillsPracticed,
                                feedback?.notes
                            );
                            console.log('[AnchorGenerator] Recorded progress for child:', level.child_name);
                        }
                    }
                }
            } catch (e) {
                console.warn('[AnchorGenerator] Could not record child progress:', e);
            }
        }

        // PHASE 2 & 3: Auto-Advance Check
        if (anchorRow?.arc_id) {
            const arcId = anchorRow.arc_id;

            // Count completed anchors for this arc
            const stats = await safeQueryFirst<{ count: number }>(this.db,
                `SELECT COUNT(*) as count FROM daily_anchors WHERE arc_id = ? AND status = 'completed'`,
                [arcId]
            );

            // If 14 completed (2 weeks), close the arc and advance
            if (stats && stats.count >= 14) {
                console.log(`[AnchorGenerator] Arc ${arcId} complete! Advancing curriculum...`);

                // 1. Aggregate Feedback (Phase 3)
                await this.arcGenerator.aggregateFeedback(householdId, arcId);

                // 2. Advance Curriculum Position (Phase 2)
                const subjects = ['literacy', 'numeracy', 'formation', 'motor'];
                for (const subject of subjects) {
                    // Get current spine version to persist it
                    const pos = await safeQueryFirst<{ spine_version: string }>(this.db,
                        `SELECT spine_version FROM family_curriculum_position WHERE household_id = ? AND subject = ?`,
                        [householdId, subject]
                    );

                    if (pos?.spine_version) {
                        await this.arcGenerator.advanceCurriculumPosition(householdId, subject, pos.spine_version);
                    } else {
                        // Fallback: Use arc's spine version if available, or just skip update (prevent corruption)
                        console.warn(`[AnchorGenerator] Could not find current spine version for ${subject}, skipping advance.`);
                    }
                }

                // 3. Close the Arc
                await safeRun(this.db, `UPDATE formation_arcs SET status = 'completed' WHERE id = ?`, [arcId]);
            }
        }
    }

    /**
     * Mark anchor as skipped and record the reason
     */
    async skipAnchor(
        householdId: string,
        anchorId: string,
        reason?: string
    ): Promise<void> {
        await safeRun(this.db, `
            UPDATE daily_anchors 
            SET status = 'skipped',
                skipped_at = CURRENT_TIMESTAMP,
                skip_reason = ?
            WHERE id = ? AND household_id = ?
        `, [
            reason || 'Cortex skip: no reason provided',
            anchorId,
            householdId
        ]);

        console.log('[AnchorGenerator] Marked anchor skipped:', anchorId);
    }

    private calculateAgeMonths(dob: string): number {
        const birth = new Date(dob);
        const now = new Date();
        return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    }

    private determineStage(ageMonths: number): string {
        if (ageMonths < 24) return 'seedling';
        if (ageMonths < 48) return 'sprout';
        if (ageMonths < 96) return 'sapling';
        return 'tree';
    }
}
