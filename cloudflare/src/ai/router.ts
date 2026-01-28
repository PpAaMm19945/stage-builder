
import { Env } from '../types';

export type IntentType = 'SEARCH_BOOKS' | 'SEARCH_ACTIVITIES' | 'ADJUST_SCHEDULE' | 'GET_TODAY_SCHEDULE' | 'GENERAL_CHAT';

export interface RouteResult {
    intent: IntentType;
    searchQuery?: string;
    filters?: {
        age?: number;
        domain?: string;
    };
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
        5. GENERAL_CHAT: for greetings, parenting advice, philosophy, "how does this app work", or questions about the plan ITSELF (e.g. "why did you choose this?").

        CONTEXT:
        Child Ages (Months): ${JSON.stringify(childrenAges)}

        OUTPUT JSON:
        {
          "reasoning": "brief explanation of why this intent matches",
          "intent": "SEARCH_BOOKS" | "SEARCH_ACTIVITIES" | "ADJUST_SCHEDULE" | "GET_TODAY_SCHEDULE" | "GENERAL_CHAT",
          "searchQuery": "space-separated keywords (stemmed/synonyms) if applicable",
          "filters": {
            "age": number | null,
            "domain": string | null
          }
        }
        
        examples:
        - "I need a story about lions" -> { "reasoning": "User asked for a story", "intent": "SEARCH_BOOKS", "searchQuery": "lion lions big cat" }
        - "Activity for fine motor skills" -> { "reasoning": "User asked for activity", "intent": "SEARCH_ACTIVITIES", "searchQuery": "fine motor" }
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
                filters: result.filters
            };
        } catch (error) {
            console.error('Router Error:', error);
            return { intent: 'GENERAL_CHAT' };
        }
    }
}
