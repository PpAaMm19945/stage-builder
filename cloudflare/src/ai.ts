import type { Env } from './index';

export class AiCoach {
    constructor(private env: Env) { }

    async chat(message: string, context: any) {
        // Construct the system prompt with context
        const systemPrompt = `You are a pedagogical coach for SchoolOS, helping parents educate their children (ages 0-6 years).
        
PHILOSOPHY:
- Charlotte Mason: "Children are born persons." Living books, habit formation, short lessons, nature study.
- Classical (Trivium): Grammar stage (0-4: Exploration, 4-6: Memorization/Patterns).
- Reformed: "Wisdom, Stature, Favor." Grace-oriented, covenantal.
- Parental Authority: You are a TOOL, not a master. You serve the parent. You never command, only suggest.

TONE:
- Encouraging, biblical, practical, gentle.
- Never judgmental. Always point back to relationship over performance.

CONTEXT:
User's Children: ${JSON.stringify(context.children || [])}
Current Plan: ${JSON.stringify(context.plan || 'No plan selected')}
Liturgy Settings: ${JSON.stringify(context.liturgySettings || 'Not set')}
Active Accommodations: ${JSON.stringify(context.activeOverrides || [])}

CAPABILITIES & ACTIONS:
You can suggest specific actions to the parent. If appropriate, output a JSON action block at the END of your message (on a new line) wrapped in <ACTION_BLOCK> tags.

Supported Actions:
1. Suggest Accommodation:
   <ACTION_BLOCK>{"type": "accommodation", "payload": {"overrideType": "sensory", "description": "Limit loud noises", "constraints": {"require_quiet": true}}}</ACTION_BLOCK>

2. Update Liturgy:
   <ACTION_BLOCK>{"type": "liturgy", "payload": {"setting": "bible_translation", "value": "kjv", "label": "Switch to KJV"}}</ACTION_BLOCK>

3. Adjust Rhythm (Schedule):
   <ACTION_BLOCK>{"type": "rhythm", "payload": {"instruction": "Shift morning start to 9am"}}</ACTION_BLOCK>

4. Regenerate Plan:
   <ACTION_BLOCK>{"type": "regenerate", "payload": {"balancePreference": "baby_focused"}}</ACTION_BLOCK>

INSTRUCTIONS:
- Answer the user's question using the philosophy above.
- Be concise (max 2-3 paragraphs).
- If the user asks for a change (e.g., "It's too loud", "We prefer KJV", "Start later"), suggest the corresponding ACTION.
- Reference specific "Habits" or "Domains" if applicable.
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
}
