
import { Env } from '../types';
import { GeminiService } from './gemini';

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
    basket_items: {
        hymn?: PathItem;
        catechism?: PathItem;
        history?: PathItem;
        habit?: PathItem;
    };
    family_id: string; // Added for plan lookup
    accommodations?: any[]; // Added for Phase 4
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

export interface PathItem {
    id: string;
    title: string;
    type: string;
    data: any;
    position: number;
    total: number;
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
    slots?: any[];
}

export class RhythmGenerator {
    private gemini: GeminiService;

    constructor(private env: Env) {
        this.gemini = new GeminiService(env.GOOGLE_API_KEY, 'gemini-2.0-flash-exp');
    }

    // Helper to get next item for a path
    private async getNextPathItem(db: D1Database, userId: string, pathId: string): Promise<PathItem | undefined> {
        // 1. Get Subscription (or default to pos 1)
        const sub = await db.prepare('SELECT * FROM family_path_subscriptions WHERE parent_id = ? AND path_id = ?').bind(userId, pathId).first<any>();
        const position = sub?.current_position || 1;

        // 2. Get Path Definition
        const path = await db.prepare('SELECT * FROM learning_paths WHERE id = ?').bind(pathId).first<any>();
        if (!path) return undefined;

        // 3. Build Query
        const filter = JSON.parse(path.content_filter || '{}');
        let query = "SELECT * FROM formations WHERE is_active = 1";
        const params: any[] = [];

        if (filter.cluster_tag) {
            query += " AND cluster_tag = ?";
            params.push(filter.cluster_tag);
        }
        if (filter.domain === 'history') query += " AND cluster_tag LIKE '%history%'";
        if (filter.skill === 'reading') query += " AND cluster_tag = 'reading'";
        if (filter.age_tier === 'infant') query += " AND cluster_tag = 'toddler'";

        query += " ORDER BY COALESCE(sequence_number, 999999), title LIMIT 1 OFFSET ?";
        params.push(position - 1);

        const item = await db.prepare(query).bind(...params).first<any>();

        if (!item) return undefined;

        return {
            id: item.id,
            title: item.title,
            type: path.path_type,
            data: item,
            position,
            total: path.total_items || 100
        };
    }

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

        const preferences = JSON.parse(profile?.preferences || '{}');

        // [PHASE 4] BRAIN TRANSPLANT: Fetch new preferences (Time Model) and Overrides (Accommodations)
        // 1. Get Family Preferences (Schedule)
        const familyPrefs = await db.prepare('SELECT overrides_json FROM family_preferences WHERE parent_id = ?').bind(userId).first<any>();
        let scheduleOverrides: any = {};
        if (familyPrefs?.overrides_json) {
            try { scheduleOverrides = JSON.parse(familyPrefs.overrides_json); } catch (e) { }
        }

        // 2. Get Parent Overrides (Accommodations)
        const accommodationResults = await db.prepare('SELECT * FROM parent_overrides WHERE parent_id = ? AND is_active = 1').bind(userId).all<any>();
        const accommodations = accommodationResults.results || [];

        // 3. Merge Schedule (New Preferences take precedence over Legacy Profile)
        const morningMinutes = scheduleOverrides.morning_minutes ?? profile?.morning_minutes ?? 15;
        const eveningMinutes = scheduleOverrides.evening_minutes ?? profile?.evening_minutes ?? 0;
        const availableDays = scheduleOverrides.available_days ?? (profile?.available_days ? JSON.parse(profile.available_days) : ["Mon", "Tue", "Wed", "Thu", "Fri"]);


        // 4. Fetch Basket Items (The Ingredients)
        const basketItems: any = {};

        // Hymns (Default: ON)
        if (preferences.includeHymns !== false) {
            basketItems.hymn = await this.getNextPathItem(db, userId, 'hymn-journey');
        }
        // Catechism (Default: ON)
        if (preferences.includeCatechism !== false) {
            basketItems.catechism = await this.getNextPathItem(db, userId, 'westminster-catechism');
        }
        // History (Default: ON - inferred) - Using 'african-history-young' as default for now
        // In future, select based on age.
        basketItems.history = await this.getNextPathItem(db, userId, 'african-history-young');


        return {
            children,
            morning_minutes: morningMinutes,
            evening_minutes: eveningMinutes,
            available_days: availableDays,
            goals: JSON.parse(profile?.goals || '[]'),
            preferences,
            progress: {
                catechism_position: profile?.catechism_position || 1,
                hymn_position: profile?.hymn_position || 1,
                current_book_id: null
            },
            basket_items: basketItems,
            family_id: householdId,
            accommodations: accommodations // Added for prompt injection
        };
    }

    async generateWeeklyRhythm(context: FamilyContext, weekStart: string, frozenDays: string[] = [], additionalContext?: string): Promise<WeeklyPlan> {
        // 1. Handle Frozen Days - Load existing if needed
        let existingDays: DailyRhythm[] = [];
        if (frozenDays.length > 0) {
            const existingPlan = await this.env.DB.prepare(
                'SELECT days FROM weekly_plans WHERE family_id = ? AND week_start = ?'
            ).bind(context.family_id, weekStart).first<any>();

            if (existingPlan?.days) {
                const parsed = typeof existingPlan.days === 'string' ? JSON.parse(existingPlan.days) : existingPlan.days;
                existingDays = parsed.filter((d: any) => frozenDays.includes(d.day));
            }

            // Filter context.available_days so AI only plans for remaining days
            context.available_days = context.available_days.filter(d => !frozenDays.includes(d));
        }

        const systemPrompt = `You are the FamilyPath Rhythm Generator. Your goal is to create a personalized weekly formation plan.
    
    FAMILY CONTEXT:
    Children: ${JSON.stringify(context.children)}
    Time: Morning ${context.morning_minutes}m, Evening ${context.evening_minutes}m
    Days: ${JSON.stringify(context.available_days)}
    Goals: ${JSON.stringify(context.goals)}
    
    CRITICAL ACCOMMODATIONS (You MUST respect these):
    ${context.accommodations && context.accommodations.length > 0
                ? context.accommodations.map((a: any) => `- ${a.description} (${JSON.stringify(a.constraints)})`).join('\n')
                : 'None'}

    WEEKLY BASKET INGREDIENTS (Use these specifically):
    ${context.basket_items.catechism ? `- Catechism: ${context.basket_items.catechism.title} (ID: ${context.basket_items.catechism.id})` : '- Catechism: [Skipped by preference]'}
    ${context.basket_items.hymn ? `- Hymn: ${context.basket_items.hymn.title} (ID: ${context.basket_items.hymn.id}) - Practice this all week` : '- Hymn: [Skipped by preference]'}
    ${context.basket_items.history ? `- History: ${context.basket_items.history.title} (ID: ${context.basket_items.history.id})` : ''}
    
    INSTRUCTIONS:
    1. Plan for the available days ONLY.
    2. Respect the time limits.
    3. Use the Basket Ingredients as the core anchor items for the week.
       - The Hymn should appear multiple times (repetition).
       - The Catechism should appear multiple times.
    4. Fill remaining space with age-appropriate activities (e.g., "Nature Walk", "Drawing", "Free Play").
    5. Return a STRUCTURED JSON response.
    `;

        const responseSchema = {
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
        };

        try {
            const responseText = await this.gemini.generateContent(
                [{ role: 'user', parts: [{ text: "Generate the weekly rhythm plan." }] }],
                systemPrompt,
                responseSchema,
                'application/json'
            );

            const generatedData = JSON.parse(responseText);

            // Enhance with IDs and status
            const days = generatedData.days.map((d: any) => ({
                day: d.day,
                morning: d.morning.map((item: any) => {
                    let pathId = undefined;
                    if (item.type === 'hymn') pathId = 'hymn-journey';
                    if (item.type === 'catechism') pathId = 'westminster-catechism';
                    // History path ID might vary, but for now defaulting if we know it came from the basket
                    if (item.title === context.basket_items.history?.title) pathId = 'african-history-young';

                    return {
                        ...item,
                        id: crypto.randomUUID(),
                        content_id: "placeholder",
                        status: "upcoming",
                        pathId: pathId
                    };
                }),
                evening: d.evening.map((item: any) => {
                    let pathId = undefined;
                    if (item.type === 'hymn') pathId = 'hymn-journey';
                    if (item.type === 'catechism') pathId = 'westminster-catechism';

                    return {
                        ...item,
                        id: crypto.randomUUID(),
                        content_id: "placeholder",
                        status: "upcoming",
                        pathId: pathId
                    };
                })
            }));

            // Merge with frozen days and sort
            const allDays = [...existingDays, ...days].sort((a, b) => {
                const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
            });

            // Convert to flat 'slots' format for family.ts compatibility
            const slots: any[] = [];

            allDays.forEach(d => {
                // Morning Items
                d.morning.forEach((item: any) => {
                    let activityId = null;

                    // Resolve ID from Basket Context
                    if (item.type === 'hymn' && context.basket_items.hymn) activityId = context.basket_items.hymn.id;
                    if (item.type === 'catechism' && context.basket_items.catechism) activityId = context.basket_items.catechism.id;
                    if (item.title === context.basket_items.history?.title && context.basket_items.history) activityId = context.basket_items.history.id;

                    // If we have a valid ID, add to slots
                    if (activityId) {
                        slots.push({
                            day: d.day,
                            timeSlot: "Morning",
                            activityId: activityId,
                            reasoning: item.rationale,
                            pathId: (item as any).pathId // Pass pathId for advancement
                        });
                    }
                });

                // Evening Items
                d.evening.forEach((item: any) => {
                    let activityId = null;
                    if (item.type === 'hymn' && context.basket_items.hymn) activityId = context.basket_items.hymn.id;
                    if (item.type === 'catechism' && context.basket_items.catechism) activityId = context.basket_items.catechism.id;

                    if (activityId) {
                        slots.push({
                            day: d.day,
                            timeSlot: "Evening",
                            activityId: activityId,
                            reasoning: item.rationale,
                            pathId: (item as any).pathId
                        });
                    }
                });
            });

            return {
                id: crypto.randomUUID(),
                family_id: "pending_save",
                week_start: weekStart,
                days: allDays,
                slots: slots, // Added for family.ts compatibility
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
