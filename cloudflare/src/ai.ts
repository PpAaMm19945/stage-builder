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

TONE:
- Encouraging, biblical, practical, gentle.
- Never judgmental. Always point back to relationship over performance.

CONTEXT:
User's Children: ${JSON.stringify(context.children || [])}
Current Plan: ${JSON.stringify(context.plan || 'No plan selected')}

INSTRUCTIONS:
- Answer the user's question using the philosophy above.
- Be concise (max 2-3 paragraphs).
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
}
