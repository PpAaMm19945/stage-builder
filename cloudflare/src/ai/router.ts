
import { Env } from '../types';

export type IntentType = 'SEARCH_BOOKS' | 'SEARCH_ACTIVITIES' | 'ADJUST_SCHEDULE' | 'GET_TODAY_SCHEDULE' | 'GENERAL_CHAT' | 'UPDATE_PREFERENCES' | 'TOGGLE_BASKET_ITEM' | 'REGENERATE_PLAN';

export interface RouteResult {
    intent: IntentType;
    searchQuery?: string;
    filters?: {
        age?: number;
        domain?: string;
    };
    updates?: {
        minutes?: number;
        days?: string[];
        period?: 'morning' | 'evening';
        item?: string; // for toggle
        action?: 'enable' | 'disable';
    }
}

export class AiRouter {
    constructor(private env: Env) { }

    async routeRequest(message: string, context: any): Promise<RouteResult> {
        // Build readable context for prompt
        const childrenAges = context.children?.map((c: any) => c.age_in_months) || [];

        const systemPrompt = `You are the "Router" for FamilyPath.
        Your job is to classify the user's intent after they have passed safety triage.
        
        AVAILABLE TOOLS:
        1. SEARCH_BOOKS: strictly when user asks for a book, story, reading resource.
        2. SEARCH_ACTIVITIES: when user asks for a game, activity, lesson, craft, or curriculum.
        3. ADJUST_SCHEDULE: when user wants to change time, days, remove/add specific items.
        4. GET_TODAY_SCHEDULE: when user asks "what is my schedule?", "what's for today?", "today's plan".
        5. UPDATE_PREFERENCES: when user wants to change global settings (morning/evening time, school days).
        6. TOGGLE_BASKET_ITEM: when user wants to enable/disable specific basket items (hymns, catechism, scripture).
        7. REGENERATE_PLAN: when user wants to create a new weekly plan or "redo" the schedule.
        8. GENERAL_CHAT: for greetings, parenting advice, philosophy, or questions about the plan ITSELF.

        CONTEXT:
        Child Ages (Months): ${JSON.stringify(childrenAges)}

        OUTPUT JSON:
        {
          "reasoning": "brief explanation",
          "intent": "INTENT_NAME",
          "searchQuery": "keywords if applicable",
          "updates": {
            "minutes": number (e.g. 40),
            "period": "morning" | "evening" | null,
            "days": ["Mon", "Tue"] | null,
            "item": "hymns" | "catechism" | "scripture" | null,
            "action": "enable" | "disable" | null
          }
        }
        
        examples:
        - "I need a story about lions" -> { "intent": "SEARCH_BOOKS", "searchQuery": "lion" }
        - "Change morning time to 40 minutes" -> { "intent": "UPDATE_PREFERENCES", "updates": { "minutes": 40, "period": "morning" } }
        - "Turn off hymns" -> { "intent": "TOGGLE_BASKET_ITEM", "updates": { "item": "hymns", "action": "disable" } }
        - "Make me a new schedule" -> { "intent": "REGENERATE_PLAN" }
        `;

        try {
            const response = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ]
            });

            // Extract JSON from response (may have markdown code blocks or extra text)
            let jsonStr = response.response || '';
            const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/) ||
                jsonStr.match(/```\s*([\s\S]*?)\s*```/) ||
                jsonStr.match(/(\{[\s\S]*\})/);
            jsonStr = jsonMatch?.[1] || jsonStr;

            const result = JSON.parse(jsonStr.trim());
            console.log('[Router] Decision:', JSON.stringify(result));

            return {
                intent: result.intent || 'GENERAL_CHAT',
                searchQuery: result.searchQuery,
                filters: result.filters,
                updates: result.updates
            };
        } catch (error) {
            console.error('Router Error:', error);
            return { intent: 'GENERAL_CHAT' };
        }
    }
}
