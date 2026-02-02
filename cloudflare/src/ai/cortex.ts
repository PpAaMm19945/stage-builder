
// ... existing imports
import { Env } from '../types';
import { AiRouter } from './router';
import { GeminiPlanner } from './planner';
import { GeminiService, GeminiContent } from './gemini';
import { Summarizer } from './summarizer';
import { searchBooks, searchActivities, getTodaySchedule } from './tools';
import { ContextBuilder, AiContext } from './context';

export class Cortex {
    private summarizer: Summarizer;

    constructor(private env: Env) {
        this.summarizer = new Summarizer(env);
    }

    async chat(message: string, history: any[], context: any, actionPayload?: any): Promise<ReadableStream> {
        // 0. Direct Action Bypass
        if (actionPayload) {
            console.log('[Cortex] Direct action execution');
            return this.runSystem1(message, history, context, actionPayload);
        }

        // 1. Route Request (System 1)
        console.log('[Cortex] Analyzing Intent (Router-First)');
        return this.runSystem1(message, history, context);
    }

    private async runSystem1(message: string, history: any[], context: any, actionPayload?: any): Promise<ReadableStream> {
        const router = new AiRouter(this.env);

        let route;
        if (actionPayload) {
            route = { intent: 'EXECUTE_ACTION', actionPayload } as any;
        } else {
            route = await router.routeRequest(message, context);
        }

        // 2. Agent Loop Hand-off (System 2)
        // If it's a complex query, we now prefer the Agent Loop over just GeminiPlanner
        // unless it's specifically planning related which GeminiPlanner handles well.
        if (route.intent === 'COMPLEX_QUERY') {
            console.log('[Cortex] Intent is COMPLEX_QUERY -> Starting Agent Loop');
            return this.runAgentLoop(message, history, context);
        }

        const encoder = new TextEncoder();

        // If simple chat, check if we need to escalate to Gemini based on context size
        if (route.intent === 'GENERAL_CHAT') {
            const model = this.selectModel(message, history);
            console.log(`[Cortex] Selected model: ${model}`);

            if (model === 'gemini-2.0-flash') {
                return this.runGeminiChat(message, history, context);
            }
            return this.streamLlamaResponse(message, history, context);
        }

        // ... existing intent handlers ...
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

        // =================================================================================
        // NEW INTENT HANDLERS (Phase 2)
        // =================================================================================

        if (route.intent === 'UPDATE_PREFERENCES') {
            return new ReadableStream({
                start(controller) {
                    controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 1, label: "Reviewing request...", status: "active" })}\n\n`));

                    const changes = [];
                    if (route.updates?.minutes) changes.push(`set morning time to ${route.updates.minutes} min`);
                    if (route.updates?.days) changes.push(`set days to ${route.updates.days.join(', ')}`);
                    if (route.updates?.period) changes.push(`set period to ${route.updates.period}`);

                    const actionPayload = {
                        type: 'UPDATE_PREFERENCES',
                        data: route.updates,
                        reason: `I can ${changes.join(' and ')}. Should I proceed?`
                    };

                    controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 1, label: "Reviewing request", status: "complete" })}\n\n`));

                    const jsonBlock = `[ACTION_PENDING]${JSON.stringify(actionPayload)}[ACTION_PENDING]`;
                    controller.enqueue(encoder.encode(`data: ${jsonBlock}\n\n`));
                    controller.close();
                }
            });
        }

        if (route.intent === 'TOGGLE_BASKET_ITEM') {
            return new ReadableStream({
                start(controller) {
                    controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 1, label: "Reviewing request...", status: "active" })}\n\n`));

                    const actionPayload = {
                        type: 'TOGGLE_BASKET_ITEM',
                        data: route.updates,
                        reason: `I can ${route.updates?.action === 'disable' ? 'disable' : 'enable'} ${route.updates?.item || 'this item'}. Confirm?`
                    };

                    controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 1, label: "Reviewing request", status: "complete" })}\n\n`));
                    const jsonBlock = `[ACTION_PENDING]${JSON.stringify(actionPayload)}[ACTION_PENDING]`;
                    controller.enqueue(encoder.encode(`data: ${jsonBlock}\n\n`));
                    controller.close();
                }
            });
        }

        if (route.intent === 'REGENERATE_PLAN') {
            return new ReadableStream({
                start(controller) {
                    const actionPayload = { type: "REGENERATE_PLAN", reason: "Regenerating..." };
                    const jsonBlock = `[ACTION_PENDING]${JSON.stringify(actionPayload)}[ACTION_PENDING]`;
                    controller.enqueue(encoder.encode(`data: I can regenerate your plan. ${jsonBlock}\n\n`));
                    controller.close();
                }
            });
        }

        // ========================
        // EXECUTE ACTION HANDLER
        // ========================
        if (route.intent === 'EXECUTE_ACTION') {
            const cortex = this;
            return new ReadableStream({
                async start(controller) {
                    controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 1, label: "Verifying action...", status: "active" })}\n\n`));

                    // 1. Find payload
                    let payload = route.actionPayload;
                    if (!payload) {
                        // Scan history for last [ACTION_PENDING]
                        for (let i = history.length - 1; i >= 0; i--) {
                            if (history[i].role === 'assistant') {
                                const content = history[i].content;
                                const match = content.match(/\[ACTION_PENDING\](.*?)\[ACTION_PENDING\]/);
                                if (match && match[1]) {
                                    try {
                                        payload = JSON.parse(match[1]);
                                        break;
                                    } catch (e) { console.error("Failed to parse pending action", e); }
                                }
                            }
                        }
                    }

                    if (!payload) {
                        controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 1, label: "No pending action found", status: "error" })}\n\n`));
                        controller.enqueue(encoder.encode(`data: I'm not sure what you want me to confirm. Can you restate your request?`));
                        controller.close();
                        return;
                    }

                    controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 1, label: "Action verified", status: "complete" })}\n\n`));

                    // 2. Execute
                    try {
                        if (payload.type === 'UPDATE_PREFERENCES') {
                            controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 2, label: "Saving preferences...", status: "active" })}\n\n`));
                            await cortex.executeUpdatePreferences(context.userState.id, payload.data);
                            controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 2, label: "Preferences saved", status: "complete" })}\n\n`));
                            controller.enqueue(encoder.encode(`data: Done! Your settings have been updated.`));
                        }
                        else if (payload.type === 'TOGGLE_BASKET_ITEM') {
                            controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 2, label: "Updating basket...", status: "active" })}\n\n`));
                            await cortex.executeToggleBasket(context.userState.id, payload.data);
                            controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 2, label: "Basket updated", status: "complete" })}\n\n`));
                            controller.enqueue(encoder.encode(`data: Done! Item updated.`));
                        }
                        else {
                            controller.enqueue(encoder.encode(`data: I don't know how to execute that action type.`));
                        }
                    } catch (e) {
                        console.error("Exec Error", e);
                        controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 2, label: "Execution failed", status: "error" })}\n\n`));
                        controller.enqueue(encoder.encode(`data: Something went wrong while saving.`));
                    }
                    controller.close();
                }
            });
        }

        // =================================================================================
        // END NEW HANDLERS
        // =================================================================================
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

    // [Refactored to separate method for clarity]
    // ... selectModel, logInteraction, buildSystemPrompt, streamLlamaResponse ...

    // ... executeUpdatePreferences, executeToggleBasket ...

    // NEW: Agent Loop Implementation
    private async runAgentLoop(message: string, history: any[], context: any): Promise<ReadableStream> {
        const encoder = new TextEncoder();
        const cortex = this;
        const db = this.env.DB;

        return new ReadableStream({
            async start(controller) {
                let iterations = 0;
                const maxIterations = 5;
                const toolResults: any[] = [];
                let currentMessage = message;

                // Initial Thinking
                controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 0, label: "Thinking about plan...", status: "active" })}\n\n`));

                while (iterations < maxIterations) {
                    iterations++;
                    const stepId = iterations;

                    // 1. Construct messages with history + tool results
                    const systemPrompt = cortex.buildSystemPrompt(context) +
                        `\n\nYOU ARE IN AN AGENT LOOP.
                        You must output JSON to either call a tool or provide a final response.
                        
                        TOOLS:
                        - "search_books": { query: string, age_months?: number }
                        - "search_activities": { query: string }
                        - "get_today_schedule": {}
                        - "check_time": {}

                        OUTPUT FORMAT (choose one):
                        1. { "tool": "TOOL_NAME", "args": { ... }, "thought": "Reasoning..." }
                        2. { "response": "Final answer to user..." }
                        
                        Be direct. If you need info, call the tool. If you have info, give response.
                        `;

                    const loopMessages = [
                        { role: 'system', content: systemPrompt },
                        ...history.slice(-5).map(m => ({ role: m.role, content: m.content })), // Limit history
                        ...toolResults.map(r => ({ role: 'user', content: `Tool Result (${r.tool}): ${JSON.stringify(r.result)}` })),
                        { role: 'user', content: currentMessage }
                    ];

                    try {
                        controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: stepId, label: "Planning next step...", status: "active" })}\n\n`));

                        // Force JSON mode if possible, or just robust parsing
                        const response = await cortex.env.AI.run('@cf/meta/llama-3-8b-instruct', {
                            messages: loopMessages,
                            // response_format: { type: 'json_object' } // Not all models support this clean yet on CF, use prompt eng
                        });

                        // Parse Decision
                        let decision: any = {};
                        try {
                            const raw = (response as any).response || '';
                            const jsonMatch = raw.match(/\{[\s\S]*\}/);
                            if (jsonMatch) {
                                decision = JSON.parse(jsonMatch[0]);
                            } else {
                                // Fallback if model just chats
                                decision = { response: raw };
                            }
                        } catch (e) {
                            decision = { response: "I'm having trouble thinking clearly. Let me just answer directly." };
                        }

                        // Stream thought if present
                        if (decision.thought) {
                            controller.enqueue(encoder.encode(`event: thought\ndata: "${decision.thought}"\n\n`));
                        }

                        // CASE A: Tool Call
                        if (decision.tool) {
                            controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: stepId, label: `Running ${decision.tool}...`, status: "active" })}\n\n`));

                            let result: any = {};
                            if (decision.tool === 'search_books') {
                                result = await searchBooks(db, decision.args?.query || message, decision.args?.age_months);
                            } else if (decision.tool === 'search_activities') {
                                result = await searchActivities(db, decision.args?.query || message);
                            } else if (decision.tool === 'get_today_schedule') {
                                result = await getTodaySchedule(db, context.householdId);
                            } else if (decision.tool === 'check_time') {
                                result = { time: new Date().toISOString() };
                            } else {
                                result = { error: "Unknown tool" };
                            }

                            toolResults.push({ tool: decision.tool, result });

                            controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: stepId, label: `Finished ${decision.tool}`, status: "complete" })}\n\n`));

                            // Continue loop
                        }
                        // CASE B: Final Response
                        else {
                            controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: stepId, label: "Finished thinking", status: "complete" })}\n\n`));

                            controller.enqueue(encoder.encode(`data: ${decision.response || "I couldn't figure that out."}\n\n`));
                            break; // Exit loop
                        }

                    } catch (e) {
                        console.error("Agent Loop Error", e);
                        controller.enqueue(encoder.encode(`data: I encountered an error while thinking.\n\n`));
                        break;
                    }
                }

                controller.close();
            }
        });
    }

    // ... existing selectModel, logInteraction, buildSystemPrompt, streamLlamaResponse, runGeminiChat ...


    /**
     * Determine best model based on context length and complexity
     */
    private selectModel(message: string, history: any[]): 'llama-3-8b-instruct' | 'gemini-2.0-flash' {
        // 1. Estimate token count (rough: 4 chars = 1 token)
        const totalChars = history.reduce((acc, m) => acc + (m.content?.length || 0), 0) + message.length;
        const estimatedTokens = totalChars / 4;

        // 2. Check complexity signals
        const isComplex = message.length > 300 ||
            ['plan', 'schedule', 'why', 'explain', 'create', 'strategy'].some(k => message.toLowerCase().includes(k));

        // 3. Select model
        if (estimatedTokens > 6000) {
            return 'gemini-2.0-flash'; // Context too large for Llama
        } else if (isComplex) {
            return 'gemini-2.0-flash'; // Complex reasoning needed
        } else {
            return 'llama-3-8b-instruct'; // Fast and efficient
        }
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
     * Stream a Llama response with FULL conversation history (compressed if needed)
     */
    private async streamLlamaResponse(message: string, history: any[], context: any): Promise<ReadableStream> {
        const systemPrompt = this.buildSystemPrompt(context);
        const encoder = new TextEncoder();

        // Compress history if too long to fit in Llama's context
        const processedHistory = await this.summarizer.compressIfNeeded(history);

        // Build messages array
        const messages: Array<{ role: string; content: string }> = [
            { role: 'system', content: systemPrompt }
        ];

        // Add history
        const recentHistory = processedHistory.slice(-15); // Llama limit
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

    /**
     * Run Gemini for long-context chat
     */
    private async runGeminiChat(message: string, history: any[], context: any): Promise<ReadableStream> {
        if (!this.env.GOOGLE_API_KEY) {
            // Fallback to Llama if key is missing
            return this.streamLlamaResponse(message, history, context);
        }

        const systemPrompt = this.buildSystemPrompt(context);
        const gemini = new GeminiService(this.env.GOOGLE_API_KEY, 'gemini-2.0-flash-exp');
        const encoder = new TextEncoder();

        // Convert history to Gemini format (Gemini has huge context, no need to compress usually)
        const contents: GeminiContent[] = history.map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }]
        }));

        // Add current message
        contents.push({ role: 'user', parts: [{ text: message }] });

        // Stream from Gemini
        const stream = gemini.streamGenerateContent(contents, systemPrompt);

        return new ReadableStream({
            async start(controller) {
                controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 1, label: "Thinking (Deep Brain)...", status: "active" })}\n\n`));
                let firstChunk = true;

                try {
                    for await (const chunk of stream) {
                        if (firstChunk) {
                            controller.enqueue(encoder.encode(`event: step\ndata: ${JSON.stringify({ id: 1, label: "Thinking", status: "complete" })}\n\n`));
                            firstChunk = false;
                        }

                        if (chunk.text) {
                            controller.enqueue(encoder.encode(`data: ${chunk.text}`)); // Chunked text
                        }
                    }
                } catch (e) {
                    console.error('[Cortex] Gemini Error', e);
                    // Fallback or error message
                }
                controller.close();
            }
        });
    }

    // ==========================================
    // EXECUTION HELPERS
    // ==========================================

    public async executeUpdatePreferences(userId: string, updates: any) {
        // 1. Get current
        const existing = await this.env.DB.prepare(
            'SELECT * FROM family_preferences WHERE parent_id = ?'
        ).bind(userId).first();

        let overrides: any = {};
        if (existing && existing.overrides_json) {
            overrides = JSON.parse(existing.overrides_json as string);
        }

        // 2. Apply
        if (updates.minutes) overrides.morning_minutes = updates.minutes;
        if (updates.days) overrides.available_days = updates.days;
        if (updates.period) { /* handle if needed */ }

        // 3. Save
        const jsonStr = JSON.stringify(overrides);
        const now = new Date().toISOString();

        if (existing) {
            await this.env.DB.prepare(
                'UPDATE family_preferences SET overrides_json = ?, updated_at = ? WHERE parent_id = ?'
            ).bind(jsonStr, now, userId).run();
        } else {
            const newId = crypto.randomUUID();
            await this.env.DB.prepare(`
                  INSERT INTO family_preferences (id, parent_id, overrides_json, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?)
              `).bind(newId, userId, jsonStr, now, now).run();
        }
    }

    public async executeToggleBasket(userId: string, updates: any) {
        const itemMap: any = { 'hymns': 'liturgy_enabled', 'catechism': 'liturgy_enabled', 'scripture': 'liturgy_enabled' };
        const col = itemMap[updates?.item || ''] || 'activities_enabled';
        const val = updates?.action === 'disable' ? 0 : 1;

        await this.env.DB.prepare(
            `UPDATE family_preferences SET ${col} = ?, updated_at = datetime('now') WHERE parent_id = ?`
        ).bind(val, userId).run();
    }
}
