
import { Env } from '../index';

export interface FamilyContext {
    children: Array<{
        id: string;
        name: string;
        age_months: number;
        age_stage: string; // 'baby', 'toddler', 'preschool', 'school_age'
    }>;
    morning_minutes: number;
    evening_minutes: number;
    available_days: string[];
    goals: string[];
    preferences: any;
    progress: {
        catechism_position: number;
        hymn_position: number;
        current_book_id: string | null;
    };
}

export interface RhythmItem {
    id: string;
    type: "catechism" | "hymn" | "book" | "scripture" | "activity";
    content_id: string;
    title: string;
    duration_minutes: number;
    for_children: string[]; // Child IDs
    rationale: string;
    status: "upcoming" | "current" | "completed" | "skipped" | "transferred";
}

export interface DailyRhythm {
    day: string; // "Mon", "Tue", etc.
    morning: RhythmItem[];
    evening: RhythmItem[];
}

export interface WeeklyPlan {
    id: string;
    family_id: string;
    week_start: string;
    days: DailyRhythm[];
    theme: string;
    generated_at: string;
    frozen_through: string | null;
}

export class RhythmGenerator {
    constructor(private env: Env) { }

    async loadFamilyContext(userId: string): Promise<FamilyContext> {
        const db = this.env.DB;

        // 1. Get User & Household
        const user = await db.prepare('SELECT household_id FROM users WHERE id = ?').bind(userId).first<any>();
        if (!user?.household_id) throw new Error('User not in household');
        const householdId = user.household_id;

        // 2. Get Profile Settings
        const profile = await db.prepare('SELECT * FROM family_profiles WHERE parent_id = ?').bind(userId).first<any>();

        // 3. Get Children
        const studentsResult = await db.prepare('SELECT id, name, date_of_birth FROM students WHERE household_id = ?').bind(householdId).all<any>();
        const students = studentsResult.results || [];

        const children = students.map((s: any) => {
            const birth = new Date(s.date_of_birth);
            const now = new Date();
            const ageMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());

            let stage = 'school_age';
            if (ageMonths < 12) stage = 'baby';
            else if (ageMonths < 36) stage = 'toddler';
            else if (ageMonths < 72) stage = 'preschool'; // up to 6yo

            return {
                id: s.id,
                name: s.name,
                age_months: ageMonths,
                age_stage: stage
            };
        });

        return {
            children,
            morning_minutes: profile?.morning_minutes || 15,
            evening_minutes: profile?.evening_minutes || 0,
            available_days: JSON.parse(profile?.available_days || '["Mon","Tue","Wed","Thu","Fri"]'),
            goals: JSON.parse(profile?.goals || '[]'),
            preferences: JSON.parse(profile?.preferences || '{}'),
            progress: {
                catechism_position: profile?.catechism_position || 1,
                hymn_position: profile?.hymn_position || 1,
                current_book_id: null // TODO: Implement reading progress lookup
            }
        };
    }

    async generateWeeklyRhythm(context: FamilyContext, weekStart: string, frozenDays: string[] = []): Promise<WeeklyPlan> {
        const systemPrompt = `You are the FamilyPath Rhythm Generator. Your goal is to create a personalized weekly formation plan for a family.
    
    FAMILY CONTEXT:
    Children: ${JSON.stringify(context.children)}
    Time: Morning ${context.morning_minutes}m, Evening ${context.evening_minutes}m
    Days: ${JSON.stringify(context.available_days)}
    Goals: ${JSON.stringify(context.goals)}
    Progress: Catechism Q${context.progress.catechism_position}, Hymn #${context.progress.hymn_position}
    
    LIBRARY CONTENT:
    - Catechism: Westminster Shorter Catechism (use Q${context.progress.catechism_position} onwards)
    - Hymn: Hymn #${context.progress.hymn_position} (Focus on one hymn per week)
    - Scripture: Psalms (start with Psalm 23 or 100)
    - History: Early Church Fathers (focus on Augustine, Athanasius, Polycarp) for this week
    
    INSTRUCTIONS:
    1. Plan for the available days ONLY.
    2. Respect the time limits strictly.
    3. Ensure variety but continuity (progressive formation).
    4. Provide a rationale for every item.
    5. Assign activities to specific children or "all".
    6. Return a STRUCTURED JSON response using the 'generate_weekly_rhythm' tool.
    `;

        const tools = [
            {
                name: "generate_weekly_rhythm",
                description: "Generate the structured weekly rhythm plan",
                parameters: {
                    type: "object",
                    properties: {
                        days: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    day: { type: "string" },
                                    morning: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                type: { type: "string", enum: ["catechism", "hymn", "book", "scripture", "activity"] },
                                                title: { type: "string" },
                                                duration: { type: "number" },
                                                for_children: { type: "array", items: { type: "string" } },
                                                rationale: { type: "string" }
                                            },
                                            required: ["type", "title", "duration", "for_children", "rationale"]
                                        }
                                    },
                                    evening: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                type: { type: "string", enum: ["catechism", "hymn", "book", "scripture", "activity"] },
                                                title: { type: "string" },
                                                duration: { type: "number" },
                                                for_children: { type: "array", items: { type: "string" } },
                                                rationale: { type: "string" }
                                            },
                                            required: ["type", "title", "duration", "for_children", "rationale"]
                                        }
                                    }
                                },
                                required: ["day", "morning", "evening"]
                            }
                        },
                        weekly_theme: { type: "string" },
                        parent_notes: { type: "array", items: { type: "string" } }
                    },
                    required: ["days", "weekly_theme", "parent_notes"]
                }
            }
        ];

        try {
            // Direct call to Lovable AI Gateway
            // NOTE: Using generic fetch here as we might not have a dedicated SDK bound yet, 
            // or we use the 'AI' binding if it supports gateway routing. 
            // Assuming 'AI' binding for now, but if that fails we'd use fetch.
            // Given the 'AI' binding in 'index.ts' is likely Workers AI, checking spec again.
            // Spec says: "Call Lovable AI Gateway". Usually this is an external HTTP endpoint.

            const gatewayUrl = `https://${this.env.AI_GATEWAY_HOST}/v1/chat/completions`;

            const response = await fetch(gatewayUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.env.LOVABLE_API_KEY}`, // Using API Key if available, or Gateway params
                    "cf-aig-account-id": this.env.AI_GATEWAY_ACCOUNT_ID,
                    "cf-aig-gateway-name": this.env.AI_GATEWAY_NAME
                },
                body: JSON.stringify({
                    model: "google/gemini-2.0-flash-exp", // Or "gemini-1.5-flash"
                    messages: [{ role: "system", content: systemPrompt }],
                    tools: tools,
                    tool_choice: { type: "function", function: { name: "generate_weekly_rhythm" } }
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error("AI Gateway Error:", errText);
                throw new Error(`AI Generation Failed: ${response.status}`);
            }

            const result: any = await response.json();
            const toolCall = result.choices[0]?.message?.tool_calls?.[0];

            if (!toolCall || toolCall.function.name !== 'generate_weekly_rhythm') {
                throw new Error("AI did not generate a valid rhythm plan");
            }

            const generatedData = JSON.parse(toolCall.function.arguments);

            // Enhance with IDs and status
            const days = generatedData.days.map((d: any) => ({
                day: d.day,
                morning: d.morning.map((item: any) => ({
                    ...item,
                    id: crypto.randomUUID(),
                    content_id: "placeholder", // In a real impl, we'd lookup content IDs
                    status: "upcoming"
                })),
                evening: d.evening.map((item: any) => ({
                    ...item,
                    id: crypto.randomUUID(),
                    content_id: "placeholder",
                    status: "upcoming"
                }))
            }));

            return {
                id: crypto.randomUUID(),
                family_id: "pending_save", // Will be set by caller
                week_start: weekStart,
                days,
                theme: generatedData.weekly_theme,
                generated_at: new Date().toISOString(),
                frozen_through: frozenDays.length > 0 ? frozenDays[frozenDays.length - 1] : null
            };

        } catch (error) {
            console.error("Rhythm Generation Error:", error);
            throw error;
        }
    }
}
