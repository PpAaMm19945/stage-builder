import { Env } from '../types';

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
          "searchQuery": "space-separated keywords (stemmed/synonyms)",
          "filters": {
            "age": number | null,
            "domain": string | null
          }
        }
        
        examples:
        - "I need a story about lions" -> { "intent": "SEARCH_BOOKS", "searchQuery": "lion lions big cat" }
        - "Activity for fine motor skills" -> { "intent": "SEARCH_ACTIVITIES", "searchQuery": "fine motor" }
        - "Book about bravery" -> { "intent": "SEARCH_BOOKS", "searchQuery": "brave bravery courage" }
        - "Help me with feelings" -> { "intent": "SEARCH_BOOKS", "searchQuery": "feeling emotion sad happy" }
        `;

        try {
            const response = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ]
                // Don't use response_format as it's not reliably supported
            });

            // Extract JSON from response (may have markdown code blocks or extra text)
            let jsonStr = response.response || '';
            const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/) ||
                jsonStr.match(/```\s*([\s\S]*?)\s*```/) ||
                jsonStr.match(/(\{[\s\S]*\})/);
            jsonStr = jsonMatch?.[1] || jsonStr;

            const result = JSON.parse(jsonStr.trim());
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
