import type { Env } from './index';
import { AiTriage } from './ai/triage';
import { AiRouter } from './ai/router';
import { searchBooks, searchActivities } from './ai/tools';

export class AiCoach {
    constructor(private env: Env) { }

    // Helper to create stream-compatible response from plain text
    private createTextStream(text: string): ReadableStream {
        const encoder = new TextEncoder();
        return new ReadableStream({
            start(controller) {
                // SSE format: data: {text}\n\n
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: text })}\n\n`));
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
            }
        });
    }

    async chat(message: string, context: any, mode: 'parent' | 'student' = 'parent') {
        // STUDENT MODE: Use Socratic approach - skip triage/routing for simplicity
        if (mode === 'student') {
            return this.studentChat(message, context);
        }

        // PARENT MODE (Default): Full pipeline with triage, routing, tool execution
        // Step 0: Triage & Guardrails
        const triage = new AiTriage(this.env);
        const triageResult = await triage.evaluateInput(message, context);

        console.log('Triage Result:', triageResult);

        // Handle INVALID (Block immediately)
        if (triageResult.status === 'INVALID') {
            const blockedResponse = `I couldn't process that request. ${triageResult.reasoning || "It seems unclear."} Could you rephrase?`;
            return this.createTextStream(blockedResponse);
        }

        // Handle AMBIGUOUS (Ask for clarification)
        if (triageResult.status === 'AMBIGUOUS' || (triageResult.confidence < 0.8 && triageResult.clarificationQuestion)) {
            const question = triageResult.clarificationQuestion || "I'm not exactly sure what you mean.";
            const options = triageResult.suggestedOptions || [
                { label: "Clarify Rephrase", value: "Let me rephrase that" },
                { label: "Start Over", value: "Never mind" }
            ];

            // Return structured CLARIFY action without invoking main LLM
            const actionBlock = `<ACTION_BLOCK>${JSON.stringify({
                type: "clarify",
                payload: {
                    question: question,
                    options: [...options, { label: "Something else", value: "Something else" }]
                }
            })}</ACTION_BLOCK>`;

            return this.createTextStream(`${question} ${actionBlock}`);
        }

        // Step 1: Routing (Intent Classification)
        const router = new AiRouter(this.env);
        const route = await router.routeRequest(message, context);
        console.log('Route:', route);

        // Step 2: Tool Execution (Data Retrieval)
        let searchResults: any[] = [];
        let searchContextString = "";

        if (route.intent === 'SEARCH_BOOKS' && route.searchQuery) {
            searchResults = await searchBooks(this.env.DB, route.searchQuery, route.filters?.age);
            searchContextString = `FOUND BOOKS (Strictly recommend FROM THIS LIST ONLY):\n${JSON.stringify(searchResults, null, 2)}`;
        } else if (route.intent === 'SEARCH_ACTIVITIES' && route.searchQuery) {
            searchResults = await searchActivities(this.env.DB, route.searchQuery);
            searchContextString = `FOUND ACTIVITIES (Strictly recommend FROM THIS LIST ONLY):\n${JSON.stringify(searchResults, null, 2)}`;
        }

        // Step 3: Generative Response (Grounded)
        // Construct the system prompt with context
        const hasSearchResults = searchResults.length > 0;

        const systemPrompt = `You are HomeLine Academy Assistant. You help parents homeschool their children (ages 0-18).

CONTEXT:
Children: ${JSON.stringify(context.children || [])}
Page: ${context.currentPage || 'Unknown'}

FORMATION TYPES (our unified curriculum model):
All learning content is stored as "formations" with these 6 types:
- skill: Active learning activities (crafts, projects, experiments). Has materials, duration, guide_steps.
- habit: Daily practices to build character (chores, routines). Simple checkbox-style.
- liturgy: Catechism, hymns, memory verses, history stories. Has liturgical_script, reference.
- reading: Books and stories. Has cover_url, page_count, content preview.
- service: Acts of service and kindness. Community-focused activities.
- rest: Sabbath, play, outdoor time. Minimal structure.

${searchContextString ? `
DATA RETRIEVAL RESULTS:
${searchContextString}

INSTRUCTIONS FOR DATA:
1. You HAVE found relevant formations. Recommend them confidently!
2. Briefly describe 1-2 of the TOP results. Mention the title AND a hook ("a story about..." or "helps with...").
3. Do NOT ask clarifying questions if results exist. Present what we have.
4. If the user asks for more detail, show more from the list.
` : hasSearchResults ? '' : `
NO SEARCH RESULTS FOUND:
The data search returned no matching formations for this request.
Say: "I couldn't find anything specific for that in our library, but here's what we can help with..."
Then briefly explain what HomeLine Academy offers (formations across 6 types, daily rhythms).
`}

PERSONALITY:
- Be warm, helpful, and confident.
- HomeLine Academy is a Christian homeschooling planner for ages 0-18.
- We have curated formations: skills (crafts/projects), habits (routines), liturgy (catechism/hymns/verses/history), reading (African stories, Bible stories), service, and rest.
- For Saplings (6+), History formations are 'skill' type (project-based). For younger children (0-6), History formations are 'liturgy' type (story-based).
- Always show the user what we CAN do. Don't just ask questions endlessly.

ACTIONS (Use sparingly):
<ACTION_BLOCK>{"type":"clarify","payload":{...}}</ACTION_BLOCK>
<ACTION_BLOCK>{"type":"rhythm","payload":{...}}</ACTION_BLOCK>

RULES:
1. For greetings ("Hi"): Respond warmly, briefly explain what you can help with. No action block.
2. If DATA EXISTS: Present it. Do NOT clarify.
3. If DATA IS EMPTY and user wants something specific: Use clarify action to narrow down.
4. Keep text before any action block under 20 words.
`;


        try {
            const response = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                stream: true // Enable streaming
            });

            return response;
        } catch (error) {
            console.error('AI Error:', error);
            throw new Error('Failed to generate coaching response');
        }
    }

    /**
     * Student Chat Mode: Socratic approach for learning
     * - Never gives direct answers
     * - Asks guiding questions
     * - Keeps replies short (under 3 sentences)
     * - All interactions logged for parent visibility
     */
    private async studentChat(message: string, context: any): Promise<ReadableStream> {
        const studentId = context.studentId;
        const currentSubject = context.currentSubject || 'general';

        const socraticPrompt = `You are a wise, encouraging tutor helping a homeschool student learn.

YOUR CORE RULES (NEVER BREAK THESE):
1. NEVER give the direct answer to a question.
2. ALWAYS ask guiding questions to help them think through it.
3. Keep ALL replies to 3 sentences or less.
4. Be warm and encouraging, never condescending.
5. If they're stuck, break the problem into smaller steps.

EXAMPLES:
Student: "What is 7 x 8?"
WRONG: "The answer is 56."
RIGHT: "Great question! Can you think of it as 7 groups of 8? How many would that be?"

Student: "Who was Martin Luther?"
WRONG: "Martin Luther was a German theologian..."
RIGHT: "What do you already know about the Reformation? Let's start there and build on it."

Student: "I don't understand fractions."
WRONG: "A fraction represents a part of a whole..."
RIGHT: "What if you had a pizza cut into 4 slices? If you ate 1 slice, what fraction of the pizza is left?"

CONTEXT:
Subject: ${currentSubject}
Student's question: ${message}

Remember: Guide them TO the answer, never GIVE them the answer.`;

        try {
            const response = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
                messages: [
                    { role: 'system', content: socraticPrompt },
                    { role: 'user', content: message }
                ],
                stream: true
            });

            // Log interaction for parent visibility (async, don't await)
            if (studentId) {
                this.logStudentInteraction(studentId, message, currentSubject).catch(err =>
                    console.error('Failed to log student interaction:', err)
                );
            }

            return response;
        } catch (error) {
            console.error('Student AI Error:', error);
            return this.createTextStream("I'm having trouble thinking right now. Could you try asking again?");
        }
    }

    /**
     * Log student AI interactions for parent visibility
     */
    private async logStudentInteraction(studentId: string, question: string, subject: string): Promise<void> {
        const logId = `slog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        try {
            await this.env.DB.prepare(`
                INSERT INTO ai_interaction_logs (id, student_id, interaction_type, question, context_json, created_at)
                VALUES (?, ?, 'student_chat', ?, ?, datetime('now'))
            `).bind(logId, studentId, question, JSON.stringify({ subject })).run();
        } catch (e) {
            console.error('Failed to log student interaction:', e);
        }
    }

    async explainPlan(slot: any, child: any) {
        const prompt = `Explain why the activity "${slot.activityTitle}" (Domain: ${slot.domain}) is developmentally appropriate for ${child.name} (Age: ${child.age_in_months} months).
        Connect it to the domain goal.
        Keep it brief (2 sentences).`;

        const response = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: "You are an expert early childhood educator." },
                { role: 'user', content: prompt }
            ]
        });

        // Non-streaming for this one
        return response;
    }

    async generateStrategicInsights(plan: any, children: any[]) {
        const systemPrompt = `Analyze the following weekly plan for a homeschooling family and provide strategic insights.

        Children: ${JSON.stringify(children)}
        Plan: ${JSON.stringify(plan)}

        Output strictly valid JSON with this structure:
        {
            "childInsights": [
                { "childId": "string", "insight": "Specific tip for this child's week (e.g. 'Heavy cognitive load on Tuesday, watch for fatigue')" }
            ],
            "familyBalanceTips": [
                "General tip for the whole family (e.g. 'Wednesday is very active, great for rainy days')"
            ],
            "prepNotes": [
                "Material prep tip (e.g. 'Freeze ice cubes on Monday night for Tuesday's sensory bin')"
            ]
        }

        Keep insights brief, actionable, and encouraging. Focus on logistics, energy management, and developmental needs.`;

        const response = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: "You are a strategic homeschooling consultant." },
                { role: 'user', content: "Analyze this week." }
            ],
            response_format: { type: 'json_object' } // Force JSON if supported, otherwise reliance on prompt
        });

        // Parse JSON safely
        let result;
        try {
            result = JSON.parse(response.response);
        } catch (e) {
            // Fallback if raw text
            const match = response.response.match(/\{[\s\S]*\}/);
            result = match ? JSON.parse(match[0]) : { childInsights: [], familyBalanceTips: [], prepNotes: [] };
        }
        return result;
    }
    async parseRhythmAdjustment(instruction: string, currentModel: any) {
        const systemPrompt = `You are a scheduling assistant. Update the following schedule model based on the user's instruction.

        Current Model: ${JSON.stringify(currentModel)}

        User Instruction: "${instruction}"

        Output ONLY JSON with the updated fields. 
        Fields available:
        - available_days: string[] (e.g. ["Mon", "Tue"])
        - minutes_per_day: number
        - preferred_times: string[] (e.g. ["morning", "afternoon"])
        - max_sessions_per_day: number
        `;

        const response = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: "Update the model." }
            ]
        });

        let result;
        try {
            result = JSON.parse(response.response || response);
        } catch (e) {
            const match = (response.response || response).match(/\{[\s\S]*\}/);
            result = match ? JSON.parse(match[0]) : {};
        }
        return result;
    }
}
