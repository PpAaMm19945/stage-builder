import { safeQuery, safeRun } from '../lib/db';
import { GeminiService, GeminiContent } from './gemini';
import { Env } from '../types';
import { AITelemetryService } from '../services/ai-telemetry';

/**
 * SpineGenerator: Multi-call consensus pipeline for AI-first curriculum generation
 * 
 * Flow:
 * 1. Ingest sources (phonics frameworks, catechism, etc.)
 * 2. Parallel drafting: 3 independent AI calls
 * 3. Consensus merge: AI merges drafts, flags disagreements
 * 4. Human review: Only conflicts surface for approval
 * 5. Freeze: Lock as versioned spine
 */

export interface SpineEntry {
    id: string;
    spine_version: string;
    subject: 'literacy' | 'numeracy' | 'formation' | 'african_history';
    week_number: number;
    stage: 'seedling' | 'sprout' | 'sapling' | 'tree';
    focus_area: string;
    skill_targets: string[];  // Measurable skills/knowledge
    faith_framing?: string;   // Theological reflection prompts
    resources?: string[];     // Book/activity IDs
    confidence: 'research' | 'consensus' | 'experimental';
    source_citations?: string[];
}

export interface SpineDraft {
    draft_id: string;
    entries: SpineEntry[];
    reasoning: string;
}

export interface ConflictReport {
    week_number: number;
    subject: string;
    conflicting_entries: {
        draft_id: string;
        focus_area: string;
        skill_targets: string[];
    }[];
    suggested_resolution?: string;
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
     * Generate a curriculum spine for a range of weeks
     * Uses multi-call consensus: 3 independent drafts → merge → conflicts
     */
    async generateSpine(
        subject: SpineEntry['subject'],
        startWeek: number,
        endWeek: number,
        stage: SpineEntry['stage'],
        sources: { name: string; content: string }[],
        waitUntil?: (p: Promise<any>) => void
    ): Promise<{
        version: string;
        drafts: SpineDraft[];
        consensusEntries: SpineEntry[];
        conflicts: ConflictReport[];
    }> {
        const version = `v${Date.now()}`;
        console.log(`[SpineGenerator] Starting generation for ${subject}, weeks ${startWeek}-${endWeek}, stage ${stage}`);

        // 1. Generate 3 independent drafts
        const drafts: SpineDraft[] = [];
        for (let i = 0; i < 3; i++) {
            console.log(`[SpineGenerator] Generating draft ${i + 1}/3...`);
            const draft = await this.generateDraft(subject, startWeek, endWeek, stage, sources, i, waitUntil);
            drafts.push(draft);
        }

        // 2. Merge drafts and identify conflicts
        console.log('[SpineGenerator] Merging drafts...');
        const { consensusEntries, conflicts } = await this.mergeDrafts(drafts, version);

        // 3. Store in database (as draft status)
        await this.storeDraftSpine(version, subject, consensusEntries, drafts, conflicts);

        return { version, drafts, consensusEntries, conflicts };
    }

    /**
     * Generate a single draft using Gemini
     */
    private async generateDraft(
        subject: SpineEntry['subject'],
        startWeek: number,
        endWeek: number,
        stage: SpineEntry['stage'],
        sources: { name: string; content: string }[],
        draftIndex: number,
        waitUntil?: (p: Promise<any>) => void
    ): Promise<SpineDraft> {
        const sourcesSummary = sources.map(s => `[${s.name}]: ${s.content}`).join('\n\n');

        const systemPrompt = `You are a Reformed Christian curriculum specialist creating a ${subject} sequence.
You are generating DRAFT ${draftIndex + 1} - aim for variety while staying research-based.

STAGE DEFINITIONS:
- Seedling (0-24 mos): Sensory exploration, observation, parental modeling
- Sprout (2-4 yrs): Participation, habit formation, simple truths
- Sapling (4-7 yrs): Understanding, memory work, narration
- Tree (7+ yrs): Leadership, theological depth, service

FAITH FRAMING POLICY:
Each entry should include a brief theological reflection that connects the skill to Christian formation.
Example: "Phoneme /m/: God gave us mouths to speak His truth and praise His name."

Output JSON only. Return an array of SpineEntry objects.`;

        const userPrompt = `Generate curriculum entries for:
- Subject: ${subject}
- Weeks: ${startWeek} to ${endWeek}
- Stage: ${stage}

AUTHORITATIVE SOURCES (constrain your recommendations to these):
${sourcesSummary}

Generate one entry per week. Each entry should have:
- focus_area: specific focus for the week
- skill_targets: array of 2-4 measurable skills
- faith_framing: theological connection
- confidence: 'research' if directly from sources, 'consensus' if inferred, 'experimental' if novel
- source_citations: which sources support this entry`;

        const startTime = Date.now();
        let response: string;
        let usage: any;

        try {
            const result = await this.gemini.generateContent(
                [{ role: 'user', parts: [{ text: userPrompt }] }],
                systemPrompt,
                null,
                'application/json'
            );
            response = result.text;
            usage = result.usage;

            this.telemetry.logTelemetry({
                feature: 'spine_generation',
                model: 'gemini-3-flash-preview',
                request_tokens: usage?.promptTokenCount,
                response_tokens: usage?.candidatesTokenCount,
                latency_ms: Date.now() - startTime,
                status: 'success',
                metadata: { subject, stage, week: startWeek, draftIndex }
            }, waitUntil);
        } catch (error) {
            this.telemetry.logTelemetry({
                feature: 'spine_generation',
                model: 'gemini-3-flash-preview',
                latency_ms: Date.now() - startTime,
                status: 'error',
                error_type: error instanceof Error ? error.message : 'Unknown error',
                metadata: { subject, stage, week: startWeek, draftIndex }
            });
            throw error;
        }

        let entries: SpineEntry[] = [];
        try {
            const parsed = JSON.parse(response) as { entries?: SpineEntry[] } | SpineEntry[];
            entries = (Array.isArray(parsed) ? parsed : parsed.entries || []).map((e, idx: number) => ({
                id: crypto.randomUUID(),
                spine_version: '', // Will be set during storage
                subject,
                week_number: startWeek + idx,
                stage,
                focus_area: (e as { focus_area?: string }).focus_area || '',
                skill_targets: (e as { skill_targets?: string[] }).skill_targets || [],
                faith_framing: (e as { faith_framing?: string }).faith_framing || undefined,
                resources: (e as { resources?: string[] }).resources || [],
                confidence: ((e as { confidence?: string }).confidence || 'experimental') as 'research' | 'consensus' | 'experimental',
                source_citations: (e as { source_citations?: string[] }).source_citations || []
            }));
        } catch {
            // Empty catch - AI response parsing failed, continue with empty entries
            console.error('[SpineGenerator] Failed to parse draft');
        }

        return {
            draft_id: `draft_${draftIndex + 1}`,
            entries,
            reasoning: `Draft ${draftIndex + 1} generated for ${subject} stage ${stage}`
        };
    }

    /**
     * Merge drafts using consensus logic
     */
    private async mergeDrafts(
        drafts: SpineDraft[],
        version: string
    ): Promise<{ consensusEntries: SpineEntry[]; conflicts: ConflictReport[] }> {
        const conflicts: ConflictReport[] = [];
        const consensusEntries: SpineEntry[] = [];

        // Group entries by week
        const weekMap = new Map<number, { draft_id: string; entry: SpineEntry }[]>();

        for (const draft of drafts) {
            for (const entry of draft.entries) {
                const week = entry.week_number;
                if (!weekMap.has(week)) {
                    weekMap.set(week, []);
                }
                weekMap.get(week)!.push({ draft_id: draft.draft_id, entry });
            }
        }

        // For each week, check for consensus or conflict
        for (const [week, entries] of weekMap) {
            const focusAreas = new Set(entries.map(e => e.entry.focus_area.toLowerCase().trim()));

            if (focusAreas.size === 1) {
                // Consensus! Merge skill_targets from all drafts
                const mergedEntry: SpineEntry = {
                    ...entries[0].entry,
                    id: crypto.randomUUID(),
                    spine_version: version,
                    skill_targets: [...new Set(entries.flatMap(e => e.entry.skill_targets))],
                    confidence: 'consensus',
                    source_citations: [...new Set(entries.flatMap(e => e.entry.source_citations || []))]
                };
                consensusEntries.push(mergedEntry);
            } else {
                // Conflict! Flag for human review
                conflicts.push({
                    week_number: week,
                    subject: entries[0].entry.subject,
                    conflicting_entries: entries.map(e => ({
                        draft_id: e.draft_id,
                        focus_area: e.entry.focus_area,
                        skill_targets: e.entry.skill_targets
                    })),
                    suggested_resolution: `Multiple focus areas proposed: ${[...focusAreas].join(', ')}`
                });

                // Still add first entry as tentative, marked experimental
                const tentativeEntry: SpineEntry = {
                    ...entries[0].entry,
                    id: crypto.randomUUID(),
                    spine_version: version,
                    confidence: 'experimental'
                };
                consensusEntries.push(tentativeEntry);
            }
        }

        return { consensusEntries, conflicts };
    }

    /**
     * Store draft spine in database
     */
    private async storeDraftSpine(
        version: string,
        subject: string,
        entries: SpineEntry[],
        drafts: SpineDraft[],
        conflicts: ConflictReport[]
    ): Promise<void> {
        // Insert spine metadata
        await safeRun(this.db, `
            INSERT INTO spine_metadata (id, spine_version, status, generation_log, total_weeks, subjects)
            VALUES (?, ?, 'draft', ?, ?, ?)
        `, [
            crypto.randomUUID(),
            version,
            JSON.stringify({ drafts: drafts.map(d => d.draft_id), conflicts }),
            entries.length,
            JSON.stringify([subject])
        ]);

        // Insert each entry
        for (const entry of entries) {
            await safeRun(this.db, `
                INSERT INTO curriculum_spine (
                    id, spine_version, subject, week_number, stage, focus_area,
                    skill_targets, faith_framing, resources, confidence, source_citations
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                entry.id,
                version,
                entry.subject,
                entry.week_number,
                entry.stage,
                entry.focus_area,
                JSON.stringify(entry.skill_targets),
                entry.faith_framing || null,
                JSON.stringify(entry.resources || []),
                entry.confidence,
                JSON.stringify(entry.source_citations || [])
            ]);
        }

        console.log(`[SpineGenerator] Stored ${entries.length} entries as version ${version}`);
    }

    /**
     * Resolve a conflict by selecting the preferred option
     */
    async resolveConflict(
        version: string,
        weekNumber: number,
        selectedDraftId: string,
        resolvedBy: string
    ): Promise<void> {
        // Update the entry for this week with the selected draft's data
        // This would require storing draft data separately, simplified for now
        console.log(`[SpineGenerator] Resolved conflict for week ${weekNumber} using ${selectedDraftId}`);
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
            resources: JSON.parse(row.resources || '[]'),
            confidence: row.confidence,
            source_citations: JSON.parse(row.source_citations || '[]')
        }));
    }

    /**
     * Get pending conflicts for review
     */
    async getPendingConflicts(version: string): Promise<ConflictReport[]> {
        const meta = await safeQuery<any>(this.db,
            `SELECT generation_log FROM spine_metadata WHERE spine_version = ?`,
            [version]
        );

        if (!meta.results?.[0]?.generation_log) return [];

        const log = JSON.parse(meta.results[0].generation_log);
        return log.conflicts || [];
    }
}
