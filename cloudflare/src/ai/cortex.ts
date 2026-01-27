
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

        // If Action, return a structured Action Card immediately
        // We wrap this in a stream to match the interface
        return new ReadableStream({
            start(controller) {
                const actionPayload = {
                    type: route.intent, // e.g., SEARCH_BOOKS
                    data: { query: route.searchQuery, filters: route.filters },
                    reason: "I can help you find that."
                };

                // Send "Thinking" event first (UI support)
                controller.enqueue(encoder.encode(`event: thought\ndata: "Identifying intent: ${route.intent}"\n\n`));

                // Send Action Payload
                const jsonBlock = `[ACTION_PENDING]${JSON.stringify(actionPayload)}[ACTION_PENDING]`;
                controller.enqueue(encoder.encode(`data: ${jsonBlock}\n\n`));
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
