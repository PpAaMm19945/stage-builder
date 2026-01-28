
import { Env } from '../types';
import { AiRouter } from './router';
import { GeminiPlanner } from './planner';
import { searchBooks, searchActivities, getTodaySchedule } from './tools';
import { ContextBuilder, AiContext } from './context';

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
            return this.runSystem1(message, history, context);
        }
    }

    private isComplexRequest(message: string, history: any[]): boolean {
        const complexKeywords = ['plan', 'schedule', 'week', 'curriculum', 'why', 'explain', 'create'];
        const isLong = message.length > 200;
        const hasKeyword = complexKeywords.some(w => message.toLowerCase().includes(w));

        return isLong || hasKeyword;
    }

    private async runSystem1(message: string, history: any[], context: any): Promise<ReadableStream> {
        const router = new AiRouter(this.env);
        const route = await router.routeRequest(message, context);

        const encoder = new TextEncoder();

        // If simple chat, stream a Llama response with FULL history
        if (route.intent === 'GENERAL_CHAT') {
            return this.streamLlamaResponse(message, history, context);
        }

        // For ADJUST_SCHEDULE, return an action pending for user confirmation
        if (route.intent === 'ADJUST_SCHEDULE') {
            return new ReadableStream({
                start(controller) {
                    controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 1, label: "Understanding schedule request...", status: "active" })}\n\n`));
                    const actionPayload = {
                        type: route.intent,
                        data: { query: route.searchQuery, filters: route.filters },
                        reason: "I can help you adjust your schedule."
                    };
                    controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 1, label: "Understanding schedule request", status: "complete" })}\n\n`));
                    const jsonBlock = `[ACTION_PENDING]${JSON.stringify(actionPayload)}[ACTION_PENDING]`;
                    controller.enqueue(encoder.encode(`data: ${jsonBlock}\n\n`));
                    controller.close();
                }
            });
        }

        // For SEARCH_BOOKS, SEARCH_ACTIVITIES, and GET_TODAY_SCHEDULE, execute tools with streaming steps
        const db = this.env.DB;
        const searchQuery = route.searchQuery || '';
        const ageMonths = context.children?.[0]?.age_months;
        const cortex = this;

        return new ReadableStream({
            async start(controller) {
                // Step 1: Indicate what we're doing
                let actionLabel = 'Processing...';
                if (route.intent === 'SEARCH_BOOKS') actionLabel = 'Searching library...';
                else if (route.intent === 'SEARCH_ACTIVITIES') actionLabel = 'Finding activities...';
                else if (route.intent === 'GET_TODAY_SCHEDULE') actionLabel = 'Checking your schedule...';

                controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 1, label: actionLabel, status: "active" })}\n\n`));

                let results: any[] = [];
                try {
                    if (route.intent === 'SEARCH_BOOKS') {
                        results = await searchBooks(db, searchQuery, ageMonths);
                        await cortex.logInteraction(context.userState.id, 'search', searchQuery, `Found ${results.length} books`, { intent: 'SEARCH_BOOKS', results });
                    } else if (route.intent === 'SEARCH_ACTIVITIES') {
                        results = await searchActivities(db, searchQuery);
                        await cortex.logInteraction(context.userState.id, 'search', searchQuery, `Found ${results.length} activities`, { intent: 'SEARCH_ACTIVITIES', results });
                    } else if (route.intent === 'GET_TODAY_SCHEDULE') {
                        // Use householdId from context for weekly plan lookup
                        results = await getTodaySchedule(db, context.householdId);
                        await cortex.logInteraction(context.userState.id, 'explain', 'Check Schedule', `Found ${results.length} items`, { intent: 'GET_TODAY_SCHEDULE', results });
                    }
                } catch (e) {
                    console.error('[Cortex] Tool execution failed:', e);
                }

                // Step 1: Complete
                let resultLabel = 'Done';
                if (results.length > 0) {
                    if (route.intent === 'GET_TODAY_SCHEDULE') resultLabel = `Found ${results.length} items for today`;
                    else resultLabel = `Found ${results.length} matches`;
                } else {
                    if (route.intent === 'GET_TODAY_SCHEDULE') resultLabel = 'No schedule found for today';
                    else resultLabel = 'No results found';
                }

                controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 1, label: resultLabel, status: "complete" })}\n\n`));

                // Build response payload
                const payload = {
                    type: route.intent,
                    data: {
                        query: searchQuery,
                        results,
                        filters: route.filters
                    },
                    reason: results.length > 0
                        ? `Here is what I found.` // Client can format this better
                        : `I couldn't find anything.`
                };

                // For scheduler, we might want to say "You have 3 items..."
                if (route.intent === 'GET_TODAY_SCHEDULE' && results.length > 0) {
                    payload.reason = `You have ${results.length} items on your rhythm today.`;
                }

                controller.enqueue(encoder.encode(`data: [DATA_BLOCK]${JSON.stringify(payload)}[DATA_BLOCK]\n\n`));
                controller.close();
            }
        });
    }

    /**
     * Log interactions to history
     */
    private async logInteraction(userId: string, type: 'search' | 'explain', question: string, answer: string, contextJson: any) {
        try {
            await this.env.DB.prepare(
                `INSERT INTO ai_logs (id, parent_id, interaction_type, question, answer, context_json)
                 VALUES (?, ?, ?, ?, ?, ?)`
            ).bind(
                crypto.randomUUID(),
                userId,
                type,
                question,
                answer,
                JSON.stringify(contextJson)
            ).run();
        } catch (e) {
            console.error('[Cortex] Failed to log interaction:', e);
        }
    }

    /**
     * Build a rich, contextual system prompt for FamilyPath
     */
    private buildSystemPrompt(context: any): string {
        const user = context.userState || {};
        const children = context.children || [];
        const preferences = context.preferences || {};
        const recentActivity = context.recentActivity || [];

        // Format children list
        const childrenList = children.length > 0
            ? children.map((c: any) => {
                const ageYears = Math.floor((c.age_months || 0) / 12);
                const ageMonths = (c.age_months || 0) % 12;
                const ageStr = ageYears > 0 ? `${ageYears}y${ageMonths > 0 ? ` ${ageMonths}m` : ''}` : `${ageMonths}m`;
                return `  - ${c.name} (${ageStr})`;
            }).join('\n')
            : '  (No children added yet)';

        // Format preferences
        const morningMin = preferences.morning_minutes || 15;
        const eveningMin = preferences.evening_minutes || 0;
        const days = preferences.available_days
            ? (typeof preferences.available_days === 'string'
                ? JSON.parse(preferences.available_days)
                : preferences.available_days).join(', ')
            : 'Mon-Fri';

        // Format recent activity
        const recentList = recentActivity.length > 0
            ? recentActivity.slice(0, 3).map((a: any) =>
                `  - ${a.title || a.activity_type}: ${a.status}`
            ).join('\n')
            : '  (No recent activity)';

        return `You are the Frontdesk Officer for FamilyPath.

FamilyPath is a Catholic family formation app that helps parents guide their children through:
- Liturgical learning: catechism (Westminster Shorter), hymns, scripture, saints
- Developmental activities: fine motor, practical life, language, sensorial, nature study

═══════════════════════════════════════════════════════════════════════════
THIS FAMILY
═══════════════════════════════════════════════════════════════════════════
Parent: ${user.name || 'Parent'}
Children:
${childrenList}

Preferences:
  - Morning time: ${morningMin} minutes
  - Evening time: ${eveningMin} minutes
  - Available days: ${days}

Recent Activity:
${recentList}

═══════════════════════════════════════════════════════════════════════════
YOUR CAPABILITIES
═══════════════════════════════════════════════════════════════════════════
You CAN:
• Answer questions about FamilyPath and how it works
• Help parents understand their daily rhythm
• Provide encouragement and formation guidance
• Search for books or activities (if asked, the system will handle this)
• Explain why activities are recommended
• See today's schedule (if asked, the system will handle this)

You CANNOT:
• Access grades, test scores, or academic records (this is not that kind of app)
• Book appointments or contact teachers
• Make changes to the schedule directly (you can suggest, user confirms)

═══════════════════════════════════════════════════════════════════════════
INSTRUCTIONS
═══════════════════════════════════════════════════════════════════════════
1. Be warm, specific, and grounded in this family's data
2. If you don't have information, say so honestly
3. Never invent features that don't exist
4. Keep responses concise but helpful (2-4 sentences typical)
5. If children are missing, gently suggest adding them
6. Remember the conversation context from previous messages`;
    }

    /**
     * Stream a Llama response with FULL conversation history
     */
    private async streamLlamaResponse(message: string, history: any[], context: any): Promise<ReadableStream> {
        const systemPrompt = this.buildSystemPrompt(context);
        const encoder = new TextEncoder();

        // Build messages array with full history
        const messages: Array<{ role: string; content: string }> = [
            { role: 'system', content: systemPrompt }
        ];

        // Add conversation history (limit to last 10 turns for context window)
        const recentHistory = history.slice(-10);
        for (const msg of recentHistory) {
            messages.push({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
            });
        }

        // Add current message if not already the last in history
        const lastHistoryContent = recentHistory[recentHistory.length - 1]?.content;
        if (lastHistoryContent !== message) {
            messages.push({ role: 'user', content: message });
        }

        try {
            // Send thinking step
            const thinkingStream = new ReadableStream({
                start(controller) {
                    controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 1, label: "Thinking...", status: "active" })}\n\n`));
                }
            });

            const response = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
                messages,
                stream: true
            });

            // Wrap response to add completion step
            const reader = response.getReader();
            let firstChunk = true;

            return new ReadableStream({
                async start(controller) {
                    // Initial thinking indicator
                    controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 1, label: "Thinking...", status: "active" })}\n\n`));
                },
                async pull(controller) {
                    const { done, value } = await reader.read();

                    if (firstChunk && value) {
                        // Mark thinking complete on first content
                        controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 1, label: "Thinking", status: "complete" })}\n\n`));
                        firstChunk = false;
                    }

                    if (done) {
                        controller.close();
                        return;
                    }

                    controller.enqueue(value);
                }
            });
        } catch (e) {
            console.error('[Cortex] Llama error:', e);
            return new ReadableStream({
                start(controller) {
                    controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 1, label: "Connection error", status: "error" })}\n\n`));
                    controller.enqueue(encoder.encode(`data: I'm having trouble connecting right now. Please try again in a moment.\n\n`));
                    controller.close();
                }
            });
        }
    }
}
