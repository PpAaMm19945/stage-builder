import { D1Database } from '@cloudflare/workers-types';
import { safeQuery, safeQueryFirst, safeRun } from '../lib/db';
import { GeminiService } from './gemini';
import { Env } from '../types';
import { ArcGenerator, DailyPlan, FormationArc } from './arc-generator';
import { CATECHISM_DATA } from './data';
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
        title: string;
        author?: string;
        cover_image?: string;
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
                title: plan.book.title,
                author: plan.book.author,
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

        const systemPrompt = `You are a creative Christian homeschooling assistant generating a Daily Anchor.

${AGE_SAFETY_RULES}

MATERIAL CONSTRAINTS:
Only suggest materials from this list: ${MATERIAL_WHITELIST.slice(0, 30).join(', ')}

${basePlan ? `BASE PLAN (enhance this):\n${JSON.stringify(basePlan, null, 2)}` : 'Create a fresh plan.'}

${contextStr}

Output ONLY valid JSON matching this schema:
{
  "theme": "string - short, inspiring title",
  "liturgy": {
    "hymn": "string",
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
    "title": "string",
    "discussion_prompt": "string"
  },
  "reasoning": "string - brief explanation for parent"
}`;

        const userPrompt = `Generate Daily Anchor for Day ${dayInArc} of 14.
Date: ${date}
${context?.adjustments ? `Parent Adjustment Request: ${context.adjustments}` : ''}`;

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
            book_nook: anchor.book_nook,
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
     * Validate materials against whitelist
     */
    private validateMaterials(materials: string[]): { materials: string[]; violations: string[] } {
        const violations: string[] = [];
        const filtered = materials.filter(m => {
            const normalized = m.toLowerCase().trim();
            const allowed = MATERIAL_WHITELIST.some(allowedItem =>
                normalized.includes(allowedItem) || allowedItem.includes(normalized)
            );
            if (!allowed) {
                violations.push(normalized);
            }
            return allowed;
        });
        return { materials: filtered, violations };
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
     * Store anchor in database
     */
    private async storeAnchor(householdId: string, arcId: string, date: string, anchor: DailyAnchor): Promise<void> {
        await safeRun(this.db, `
            INSERT INTO daily_anchors (id, household_id, arc_id, anchor_date, anchor_data, generation_reasoning, status, regeneration_count)
            VALUES (?, ?, ?, ?, ?, ?, 'active', 0)
            ON CONFLICT(household_id, anchor_date, status) 
            DO UPDATE SET anchor_data = excluded.anchor_data, generation_reasoning = excluded.generation_reasoning, regeneration_count = regeneration_count + 1
        `, [
            anchor.id,
            householdId,
            arcId,
            date,
            JSON.stringify(anchor),
            anchor.reasoning
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
            "SELECT anchor_data FROM daily_anchors WHERE id = ? AND household_id = ?",
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

        // Record progress for each child if we have anchor data
        if (anchorRow?.anchor_data) {
            try {
                const anchor: DailyAnchor = JSON.parse(anchorRow.anchor_data);
                const activity = anchor.family_activity;

                if (activity?.levels && activity.targets_covered?.length) {
                    // Parse targets into subject:skill pairs
                    const skillsPracticed = activity.targets_covered
                        .map(target => {
                            const [subject, skill_target] = target.split(':');
                            return subject && skill_target ? { subject, skill_target } : null;
                        })
                        .filter((s): s is { subject: string; skill_target: string } => s !== null);

                    // Record progress for each child
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
}
