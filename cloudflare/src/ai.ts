import type { Env } from './index';
import { AiTriage } from './ai/triage';
import { AiRouter } from './ai/router';
import { searchBooks, searchActivities } from './ai/tools';

export class AiCoach {
    constructor(private env: Env) { }

    async chat(message: string, context: any) {
        // Step 0: Triage & Guardrails
        const triage = new AiTriage(this.env);
        const triageResult = await triage.evaluateInput(message, context);

        console.log('Triage Result:', triageResult);

        // Handle INVALID (Block immediately)
        if (triageResult.status === 'INVALID') {
            const blockedResponse = `I couldn't process that request. ${triageResult.reasoning || "It seems unclear."} Could you rephrase?`;
            // Return as a stream-like format effectively
            return triageResult.reasoning || "Request rejected by triage.";
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

            return `${question} ${actionBlock}`;
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
        const systemPrompt = `You are SchoolOS Assistant. Help parents organize homeschooling efficiently.

CONTEXT:
Children: ${JSON.stringify(context.children || [])}
Page: ${context.currentPage || 'Unknown'}

${searchContextString ? `
DATA RETRIEVAL RESULTS:
${searchContextString}

CRITICAL INSTRUCTIONS FOR DATA:
1. You MUST ONLY recommend items from the 'DATA RETRIEVAL RESULTS' list.
2. If the list is empty, say: "I couldn't find any specific resources for that in our library."
3. Do NOT invent books or activities.
` : ''}

ACTIONS:
To trigger an action, output a JSON block wrapped EXACTLY like this (including the < and > characters):
<ACTION_BLOCK>{"type":"rhythm","payload":{"instruction":"Start at 9am"}}</ACTION_BLOCK>

CRITICAL: You MUST include the angle brackets < and > around ACTION_BLOCK. Do NOT write ACTION_BLOCK{ without < >.

SUPPORTED ACTIONS:
1. type: "accommodation" -> payload: { overrideType: "sensory"|"physical"|"cognitive", description: string, constraints: { require_quiet?: boolean, require_low_mess?: boolean } }
2. type: "liturgy" -> payload: { setting: string, value: string, label: string }
3. type: "rhythm" -> payload: { instruction: string, description: string } (e.g. "Start at 9am")
4. type: "regenerate" -> payload: { balancePreference: "baby_focused"|"mixed"|"older_focused" }
5. type: "chat_options" -> payload: { options: string[] } (Use this to suggest quick replies like "Regenerate Plan", "Adjust Schedule")
6. type: "plan_feedback" -> payload: {} (Analyze the current week's plan)
7. type: "clarify" -> payload: { question: string, options: [{ label: string, value: string }, ...] } (Use when user intent is unclear. Present 2-4 options.)

CLARIFYING BEHAVIOR:
- When user intent is ambiguous or vague, use the "clarify" action
- Present 2-4 options that represent different interpretations of what they want
- Always include a final "Something else" option
- Example: User says "I need to make changes"
  -> Output: <ACTION_BLOCK>{"type":"clarify","payload":{"question":"What would you like to change?","options":[{"label":"Change what time school starts","value":"I want to change the start time for school"},{"label":"Change which days we do school","value":"I want to change which days we homeschool"},{"label":"Swap or replace some activities","value":"I want to swap some activities in the plan"},{"label":"Something else (I'll describe)","value":"Let me describe what I need"}]}}</ACTION_BLOCK>

PROACTIVE BEHAVIORS:
- After a plan is generated/regenerated, ask if parent wants plan analysis
- When parent asks "Why this activity?", respond conversationally (no separate UI needed)
- When parent asks about schedule, offer rhythm adjustment

RULES:
1. If user asks to change schedule, start time, or rhythm with SPECIFIC details: output a rhythm action.
2. If user request is vague or could mean multiple things: output a clarify action.
3. If providing search results, summarize them briefly and ask if the user wants to schedule one.
4. Your text BEFORE the action block must be under 15 words.
5. Example response for "Start school at 9am":
   "Adjusting your schedule. <ACTION_BLOCK>{"type":"rhythm","payload":{"instruction":"Start at 9am","description":"Change school start time to 9:00 AM"}}</ACTION_BLOCK>"
6. If user says "Hi": respond "How can I help with your schedule today?"
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
