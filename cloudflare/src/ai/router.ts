import { Env } from '../index';

export type IntentType = 'SEARCH_BOOKS' | 'SEARCH_ACTIVITIES' | 'ADJUST_SCHEDULE' | 'GENERAL_CHAT';

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
        const systemPrompt = `You are the "Router" for SchoolOS.
        Your job is to classify the user's intent after they have passed safety triage.
        
        AVAILABLE TOOLS:
        1. SEARCH_BOOKS: strictly when user asks for a book, story, reading resource.
        2. SEARCH_ACTIVITIES: when user asks for a game, activity, lesson, craft, or curriculum.
        3. ADJUST_SCHEDULE: when user wants to change time, days, or rhythm.
        4. GENERAL_CHAT: for greetings, parenting advice, philosophy, or questions about the plan itself.

        CONTEXT:
        Child Ages (Months): ${JSON.stringify(context.children?.map((c: any) => c.age_in_months))}

        OUTPUT JSON:
        {
          "intent": "SEARCH_BOOKS" | "SEARCH_ACTIVITIES" | "ADJUST_SCHEDULE" | "GENERAL_CHAT",
          "searchQuery": "keywords for search (if search intent)",
          "filters": {
            "age": number | null (infer from context or request if applicable),
            "domain": string | null
          }
        }
        
        examples:
        - "I need a story about lions" -> { "intent": "SEARCH_BOOKS", "searchQuery": "lion" }
        - "Activity for fine motor skills" -> { "intent": "SEARCH_ACTIVITIES", "searchQuery": "fine motor" }
        `;

        try {
            const response = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                response_format: { type: 'json_object' }
            });

            const result = JSON.parse(response.response || response);
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
