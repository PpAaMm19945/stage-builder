
import { Env } from '../types';
import { AiRouter } from './router';
import { GeminiPlanner } from './planner';
import { searchBooks, searchActivities } from './tools';

export class Cortex {
    constructor(private env: Env) { }

    async chat(message: string, history: any[], context: any): Promise<ReadableStream> {
        // 1. Analyze Complexity (Heuristic)
        const isComplex = this.isComplexRequest(message, history);

        // 2. Route
        if (isComplex) {
            console.log('[Cortex] Routing to System 2 (Gemini)');
            const planner = new GeminiPlanner(this.env);
            return planner.chat(message, history, context);
        } else {
            console.log('[Cortex] Routing to System 1 (Llama)');
            return this.runSystem1(message, context);
        }
    }

    private isComplexRequest(message: string, history: any[]): boolean {
        const complexKeywords = ['plan', 'schedule', 'week', 'curriculum', 'why', 'explain', 'create'];
        const isLong = message.length > 200;
        const hasKeyword = complexKeywords.some(w => message.toLowerCase().includes(w));

        // If the *previous* message was from System 2 (Gemini), we might want to stay in System 2
        // For now, keep it stateless per turn unless forced.

        return isLong || hasKeyword;
    }

    private async runSystem1(message: string, context: any): Promise<ReadableStream> {
        const router = new AiRouter(this.env);
        const route = await router.routeRequest(message, context);

        const encoder = new TextEncoder();

        // If simple chat, just stream a Llama response
        if (route.intent === 'GENERAL_CHAT') {
            return this.streamLlamaResponse(message, context);
        }

        // For ADJUST_SCHEDULE, return an action pending for user confirmation
        if (route.intent === 'ADJUST_SCHEDULE') {
            return new ReadableStream({
                start(controller) {
                    const actionPayload = {
                        type: route.intent,
                        data: { query: route.searchQuery, filters: route.filters },
                        reason: "I can help you adjust your schedule."
                    };
                    controller.enqueue(encoder.encode(`event: thought\ndata: "Understanding schedule request..."\n\n`));
                    const jsonBlock = `[ACTION_PENDING]${JSON.stringify(actionPayload)}[ACTION_PENDING]`;
                    controller.enqueue(encoder.encode(`data: ${jsonBlock}\n\n`));
                    controller.close();
                }
            });
        }

        // For SEARCH_BOOKS and SEARCH_ACTIVITIES, actually execute the tools
        const db = this.env.DB;
        const searchQuery = route.searchQuery || '';
        const ageMonths = context.children?.[0]?.age_in_months;

        return new ReadableStream({
            async start(controller) {
                // Send thinking event
                const intentLabel = route.intent === 'SEARCH_BOOKS' ? 'Searching library...' : 'Finding activities...';
                controller.enqueue(encoder.encode(`event: thought\ndata: "${intentLabel}"\n\n`));

                let results: any[] = [];
                try {
                    if (route.intent === 'SEARCH_BOOKS') {
                        results = await searchBooks(db, searchQuery, ageMonths);
                    } else if (route.intent === 'SEARCH_ACTIVITIES') {
                        results = await searchActivities(db, searchQuery);
                    }
                } catch (e) {
                    console.error('[Cortex] Tool execution failed:', e);
                }

                // Build response payload with actual results
                const payload = {
                    type: route.intent,
                    data: {
                        query: searchQuery,
                        results,
                        filters: route.filters
                    },
                    reason: results.length > 0
                        ? `Found ${results.length} ${route.intent === 'SEARCH_BOOKS' ? 'books' : 'activities'} matching "${searchQuery}"`
                        : `No results found for "${searchQuery}". Try different keywords.`
                };

                // Send as DATA_BLOCK (for display) rather than ACTION_PENDING (which requires confirmation)
                controller.enqueue(encoder.encode(`data: [DATA_BLOCK]${JSON.stringify(payload)}[DATA_BLOCK]\n\n`));
                controller.close();
            }
        });
    }

    private async streamLlamaResponse(message: string, context: any): Promise<ReadableStream> {
        const systemPrompt = `You are the Frontdesk Officer for SchoolOS.
        User: Parent.
        Tone: Brief, helpful, friendly.
        Context: ${JSON.stringify(context.userState || {})}
        
        Keep it under 3 sentences.`;

        try {
            const response = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                stream: true
            });

            return response;
        } catch (e) {
            console.error(e);
            // Fallback stream
            const encoder = new TextEncoder();
            return new ReadableStream({
                start(controller) {
                    controller.enqueue(encoder.encode("data: I'm having trouble connecting to the fast brain. One moment...\n\n"));
                    controller.close();
                }
            });
        }
    }
}
