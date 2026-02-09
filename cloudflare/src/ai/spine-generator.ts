import { safeQuery, safeRun } from '../lib/db';
import { GeminiService } from './gemini';
import { Env } from '../types';
import { AITelemetryService } from '../services/ai-telemetry';

/**
 * SpineGenerator: Single-call sequence retriever for standard developmental milestones
 * 
 * Flow:
 * 1. Admin selects subject, stage, and year (52 weeks)
 * 2. One AI call retrieves a standard, research-backed scope & sequence
 * 3. Admin reviews the table
 * 4. Admin approves → spine is frozen as source of truth
 */

export interface SpineEntry {
    id: string;
    spine_version: string;
    subject: 'literacy' | 'numeracy' | 'formation' | 'motor';
    week_number: number;
    stage: 'seedling' | 'sprout' | 'sapling' | 'tree';
    focus_area: string;
    skill_targets: string[];
    faith_framing?: string;
    resources?: string[];
}

export class SpineGenerator {
    private db: D1Database;
    private gemini: GeminiService;
    private telemetry: AITelemetryService;

    constructor(env: Env) {
        this.db = env.DB;
        this.gemini = new GeminiService(env.GOOGLE_API_KEY, 'gemini-3-flash-preview');
        this.telemetry = new AITelemetryService(env.DB);
    }

    /**
     * Generate a standard scope & sequence for a subject/stage/week range.
     * Single AI call — no drafts, no conflicts.
     */
    async generateSpine(
        subject: SpineEntry['subject'],
        startWeek: number,
        endWeek: number,
        stage: SpineEntry['stage'],
        waitUntil?: (p: Promise<any>) => void
    ): Promise<{ version: string; entries: SpineEntry[] }> {
        const version = `v${Date.now()}`;
        const totalWeeks = endWeek - startWeek + 1;
        console.log(`[SpineGenerator] Generating ${subject} sequence, weeks ${startWeek}-${endWeek}, stage ${stage}`);

        const systemPrompt = `You are an expert Early Childhood Curriculum Planner.
Output a standard, research-backed scope and sequence for ${subject} for a child at the ${stage} stage.
Output a linear weekly progression. Do not invent new pedagogies; use standard developmental norms.

STAGE DEFINITIONS:
- Seedling (0-24 months): Sensory exploration, observation, parental modeling
- Sprout (2-4 years): Participation, habit formation, simple truths
- Sapling (4-7 years): Understanding, memory work, narration
- Tree (7+ years): Leadership, theological depth, service

SUBJECT GUIDELINES:
- Literacy: Phonological Awareness → Phonics → Fluency
- Numeracy: Rote counting → 1-to-1 correspondence → Number recognition → Simple operations
- Motor: Gross motor → Fine motor → Pre-writing skills
- Formation: Obedience → Kindness → Self-control → Gratitude

FAITH FRAMING:
Each entry should include a brief theological reflection connecting the skill to Christian formation.
Example: "Counting objects: God made each one with purpose and order."

Output ONLY a JSON array of objects with: week_number, focus_area, skill_targets (array of 2-4 items), faith_framing.`;

        const userPrompt = `Generate a standard scope & sequence:
- Subject: ${subject}
- Stage: ${stage}
- Weeks: ${startWeek} to ${endWeek} (${totalWeeks} weeks total)

Return a JSON array with one entry per week.`;

        const startTime = Date.now();

        try {
            const result = await this.gemini.generateContent(
                [{ role: 'user', parts: [{ text: userPrompt }] }],
                systemPrompt,
                null,
                'application/json'
            );

            this.telemetry.logTelemetry({
                feature: 'spine_generation',
                model: 'gemini-3-flash-preview',
                request_tokens: result.usage?.promptTokenCount,
                response_tokens: result.usage?.candidatesTokenCount,
                latency_ms: Date.now() - startTime,
                status: 'success',
                metadata: { subject, stage, startWeek, endWeek }
            }, waitUntil);

            let rawEntries: any[];
            try {
                const parsed = JSON.parse(result.text);
                rawEntries = Array.isArray(parsed) ? parsed : parsed.entries || parsed.sequence || [];
            } catch {
                console.error('[SpineGenerator] Failed to parse AI response');
                throw new Error('Failed to parse AI response as JSON');
            }

            const entries: SpineEntry[] = rawEntries.map((e: any, idx: number) => ({
                id: crypto.randomUUID(),
                spine_version: version,
                subject,
                week_number: e.week_number || (startWeek + idx),
                stage,
                focus_area: e.focus_area || '',
                skill_targets: e.skill_targets || [],
                faith_framing: e.faith_framing || undefined,
                resources: []
            }));

            // Store as draft
            await this.storeDraftSpine(version, subject, entries);

            await this.telemetry.logContentAudit({
                feature: 'spine',
                content_id: version,
                content_excerpt: this.buildAuditExcerpt(subject, startWeek, endWeek, stage, entries)
            }, waitUntil);

            return { version, entries };
        } catch (error) {
            this.telemetry.logTelemetry({
                feature: 'spine_generation',
                model: 'gemini-3-flash-preview',
                latency_ms: Date.now() - startTime,
                status: 'error',
                error_type: error instanceof Error ? error.message : 'Unknown error',
                metadata: { subject, stage, startWeek, endWeek }
            }, waitUntil);
            throw error;
        }
    }

    /**
     * Store draft spine in database
     */
    private async storeDraftSpine(
        version: string,
        subject: string,
        entries: SpineEntry[]
    ): Promise<void> {
        await safeRun(this.db, `
            INSERT INTO spine_metadata (id, spine_version, status, generation_log, total_weeks, subjects)
            VALUES (?, ?, 'draft', ?, ?, ?)
        `, [
            crypto.randomUUID(),
            version,
            JSON.stringify({ generated_at: new Date().toISOString() }),
            entries.length,
            JSON.stringify([subject])
        ]);

        for (const entry of entries) {
            await safeRun(this.db, `
                INSERT INTO curriculum_spine (
                    id, spine_version, subject, week_number, stage, focus_area,
                    skill_targets, faith_framing, resources, confidence
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'standard')
            `, [
                entry.id,
                version,
                entry.subject,
                entry.week_number,
                entry.stage,
                entry.focus_area,
                JSON.stringify(entry.skill_targets),
                entry.faith_framing || null,
                JSON.stringify(entry.resources || [])
            ]);
        }

        console.log(`[SpineGenerator] Stored ${entries.length} entries as version ${version}`);
    }

    private buildAuditExcerpt(
        subject: SpineEntry['subject'],
        startWeek: number,
        endWeek: number,
        stage: SpineEntry['stage'],
        entries: SpineEntry[]
    ): string {
        const focusAreas = entries.slice(0, 5).map(e => `${e.week_number}: ${e.focus_area}`);
        return [
            `Subject: ${subject}`,
            `Stage: ${stage}`,
            `Weeks: ${startWeek}-${endWeek}`,
            `Focus areas: ${focusAreas.join('; ')}`
        ].join(' | ').slice(0, 1000);
    }

    /**
     * Approve and freeze the spine
     */
    async approveSpine(version: string, approvedBy: string): Promise<void> {
        const now = new Date().toISOString();

        await safeRun(this.db, `
            UPDATE spine_metadata 
            SET status = 'approved', approved_by = ?, approved_at = ?
            WHERE spine_version = ?
        `, [approvedBy, now, version]);

        await safeRun(this.db, `
            UPDATE curriculum_spine 
            SET approved_by = ?, approved_at = ?
            WHERE spine_version = ?
        `, [approvedBy, now, version]);

        console.log(`[SpineGenerator] Spine ${version} approved by ${approvedBy}`);
    }

    /**
     * Get current approved spine for a subject and stage
     */
    async getApprovedSpine(subject: string, stage: string): Promise<SpineEntry[]> {
        const result = await safeQuery<any>(this.db, `
            SELECT cs.* FROM curriculum_spine cs
            JOIN spine_metadata sm ON cs.spine_version = sm.spine_version
            WHERE cs.subject = ? 
              AND cs.stage = ?
              AND sm.status = 'approved'
            ORDER BY cs.week_number
        `, [subject, stage]);

        return (result.results || []).map((row: any) => ({
            id: row.id,
            spine_version: row.spine_version,
            subject: row.subject,
            week_number: row.week_number,
            stage: row.stage,
            focus_area: row.focus_area,
            skill_targets: JSON.parse(row.skill_targets || '[]'),
            faith_framing: row.faith_framing,
            resources: JSON.parse(row.resources || '[]')
        }));
    }
}
