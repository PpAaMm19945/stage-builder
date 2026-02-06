import { D1Database } from '@cloudflare/workers-types';
import { safeQuery, safeQueryFirst, safeRun } from '../lib/db';
import { GeminiService, GeminiContent } from './gemini';
import { BOOKS_DATA, SKILLS_DATA, CATECHISM_DATA } from './data';
import { Env } from '../types';

export interface FormationArc {
    id: string;
    theme: string;
    duration_weeks: 2;
    children: Array<{
        child_id: string;
        child_name: string;
        age_months: number;
        stage: 'seedling' | 'sprout' | 'sapling' | 'tree';
        focus_areas: string[];
        weekly_goals: Array<{ week: number; goal: string }>;
    }>;
    catechism_range: { start: number; end: number };
    book_sequence: string[];  // Book IDs from BOOKS_DATA
    hymn_focus: string;
    adaptations: string[];  // Family-specific notes
}

export class ArcGenerator {
    private db: D1Database;
    private gemini: GeminiService;

    constructor(env: Env) {
        this.db = env.DB;
        this.gemini = new GeminiService(env.AI_GATEWAY_HOST ? 'unused' : env.GOOGLE_API_KEY, 'gemini-2.0-flash-exp');
        // Note: Using gemini-2.0-flash-exp as per existing code, though prompt asked for 3-flash-preview. 
        // I will stick to the prompt's request for Gemini 3 if possible, but 2.0 is in the codebase.
        // Prompt said: "Gemini Model to Use: gemini-3-flash-preview"
        // I'll override the model in the constructor call if the service supports it.
        // The existing GeminiService takes (apiKey, model).
        this.gemini = new GeminiService(env.GOOGLE_API_KEY, 'gemini-3-flash-preview'); // Using Gemini 3 Preview
    }

    async generateArc(householdId: string, feedback?: string): Promise<{ arc: FormationArc; reasoning: string }> {
        console.log('[ArcGenerator] Generating arc for household:', householdId);

        // 1. Fetch Context
        const children = await safeQuery<any>(this.db, 'SELECT * FROM students WHERE household_id = ?', [householdId]);
        // Default to some children if none found (for testing/dev) or handle error
        if (!children.results || children.results.length === 0) {
            console.warn('[ArcGenerator] No children found for household.');
        }

        const childData = children.results || [];
        console.log('[ArcGenerator] Children:', childData.map(c => ({ name: c.name, age: this.calculateAgeMonths(c.date_of_birth) })));

        const familyProfile = await safeQueryFirst<any>(this.db, 'SELECT * FROM family_profiles WHERE id = ?', [householdId]); // Assuming id is household_id or similar mapping
        // The prompt implies household_id link.

        // 2. Build Prompt
        const systemPrompt = `
You are a Reformed Christian homeschool curriculum planner. Create a 2-week "Formation Arc" for this family.
The arc should weave together Catechism, a Hymn, and Books into a cohesive theme.
Consider the developmental stage of EACH child.

AVAILABLE RESOURCES:
Books: ${JSON.stringify(BOOKS_DATA.map(b => ({ id: b.id, title: b.title, theme: b.theme, age: b.age_range })))}
Skills: ${JSON.stringify(SKILLS_DATA.map(s => ({ id: s.id, title: s.title, domain: s.domain })))}
Catechism: Westminster Shorter Catechism (Questions 1-107)

STAGES:
- Seedling (0-24 mos): Sensory, observation, love.
- Sprout (2-4 yrs): Participation, habits, simple truths.
- Sapling (4-7 yrs): Understanding, memory work, narration.
- Tree (7+ yrs): Leadership, theological depth, service.

Output JSON only matching the FormationArc interface.
Add a "reasoning" field at the root level explaining your choices.
`;

        const userPrompt = `
Family Context:
Children: ${JSON.stringify(childData.map(c => ({
            id: c.id,
            name: c.name,
            age_months: this.calculateAgeMonths(c.date_of_birth)
        })))}
Previous Feedback: ${feedback || 'None'}
Current Catechism Question: ${familyProfile?.catechism_position || 1}

Generate a 2-week Formation Arc.
`;

        console.log('[ArcGenerator] Prompt constructed. Length:', userPrompt.length);
        console.log('[ArcGenerator] System Prompt Length:', systemPrompt.length);

        // 3. Call Gemini
        console.log('[ArcGenerator] Calling Gemini...');
        const StartTime = Date.now();

        try {
            const responseText = await this.gemini.generateContent(
                [{ role: 'user', parts: [{ text: userPrompt }] }],
                systemPrompt,
                null, // schema
                'application/json'
            );

            console.log(`[ArcGenerator] Gemini responed in ${Date.now() - StartTime}ms`);
            console.log('[ArcGenerator] Gemini Response Preview:', responseText.substring(0, 200) + '...');

            // 4. Parse & Validate
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                console.error('[ArcGenerator] JSON Parse Error:', e);
                console.error('[ArcGenerator] Raw Response:', responseText);
                throw new Error("Failed to parse Gemini response");
            }

            const arc = responseData.arc || responseData; // Handle if wrapped
            const reasoning = responseData.reasoning || "Generated by Gemini";

            // Clean up reasoning from the arc object if it was merged
            if (arc.reasoning) delete arc.reasoning;

            // 5. Store
            await safeRun(this.db, `
            INSERT INTO formation_arcs (id, household_id, arc_start_date, arc_end_date, arc_data, generation_reasoning, status)
            VALUES (?, ?, DATE('now'), DATE('now', '+14 days'), ?, ?, 'active')
            ON CONFLICT(id) DO UPDATE SET arc_data = excluded.arc_data, status = 'active'
        `, [
                crypto.randomUUID(),
                householdId,
                JSON.stringify(arc),
                reasoning
            ]);

            console.log('[ArcGenerator] Arc Generated:', arc.id, arc.theme);

            return { arc, reasoning };
        } catch (error) {
            console.error("Generate Arc Error", error);
            throw error;
        }
    }

    async getActiveArc(householdId: string) {
            return await safeQueryFirst<any>(
                this.db,
                "SELECT * FROM formation_arcs WHERE household_id = ? AND status = 'active' ORDER BY arc_start_date DESC",
                [householdId]
            );
        }

    private calculateAgeMonths(dob: string): number {
        const birthDate = new Date(dob);
        const today = new Date();
        const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
        return months;
    }
}
