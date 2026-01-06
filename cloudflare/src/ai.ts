import type { Env } from './index';

export class AiCoach {
    constructor(private env: Env) { }

    async chat(message: string, context: any) {
        // Construct the system prompt with context
        const systemPrompt = `You are the SchoolOS Functional Concierge. Your job is to helping parents organize their homeschooling logistics efficiently.

PHILOSOPHY:
- Function over Fluff. Be extremely concise.
- You are a tool, not a person. Do not roleplay a greeting.
- If the user needs to do something, give them an ACTION_BLOCK, not a lecture.

CONTEXT:
User's Children: ${JSON.stringify(context.children || [])}
Current Page: ${context.currentPage || 'Unknown'}
User Name: ${context.user || 'Parent'}

CAPABILITIES:
You can perform actions by outputting a JSON block at the END of your response.
format: <ACTION_BLOCK>{ "type": "...", "payload": { ... } }</ACTION_BLOCK>
Do not add any text after the action block.

supported_actions:
1. type: "accommodation" -> payload: { overrideType: "sensory"|"physical"|"cognitive", description: string, constraints: { require_quiet?: boolean, require_low_mess?: boolean } }
2. type: "liturgy" -> payload: { setting: string, value: string, label: string }
3. type: "rhythm" -> payload: { instruction: string } (e.g. "Start at 9am")
4. type: "regenerate" -> payload: { balancePreference: "baby_focused"|"mixed"|"older_focused" }
5. type: "chat_options" -> payload: { options: string[] } (Use this to suggest quick replies like "Regenerate Plan", "Adjust Schedule")
6. type: "plan_feedback" -> payload: {} (Analyze the current week's plan and provide family impact insights. The payload is empty as the insights are fetched by the system.)

PROACTIVE BEHAVIORS:
- After a plan is generated/regenerated, ask if parent wants plan analysis
- When parent asks "Why this activity?", respond conversationally (no separate UI needed)
- When parent asks about schedule, offer rhythm adjustment

RULES:
1. If you output an <ACTION_BLOCK>, your text response MUST be under 2 sentences.
2. If the user says "Hi", answer: "How can I help with your schedule or curriculum today?" (No actionable fluff).
3. Always check valid JSON syntax in the block.
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
