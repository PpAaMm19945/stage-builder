
import { Env } from '../types';
import { GeminiService, GeminiContent } from './gemini';

export class GeminiPlanner {
    constructor(private env: Env) { }

    async chat(message: string, history: any[], context: any): Promise<ReadableStream> {
        if (!this.env.GOOGLE_API_KEY) {
            throw new Error("Missing GOOGLE_API_KEY");
        }

        const gemini = new GeminiService(this.env.GOOGLE_API_KEY);

        const systemPrompt = `You are the Strategic Advisor (System 2) for SchoolOS.
        Your role is to handle complex requests, planning, and deep reasoning.
        
        CONTEXT:
        Family: ${JSON.stringify(context.familyProfile || 'Unknown')}
        
        RULES:
        1. Be thoughtful and comprehensive.
        2. references "Formations" (Skills, Habits, Liturgy, Reading).
        3. If you propose a plan, output it as structured JSON if possible, or clear Markdown.
        `;

        // Convert history to Gemini format
        const contents: GeminiContent[] = history.map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }]
        }));

        // Add current message
        contents.push({ role: 'user', parts: [{ text: message }] });

        // Define tools for Gemini
        const tools = [{
            functionDeclarations: [
                {
                    name: "generate_weekly_plan",
                    description: "Generate a detailed weekly schedule for the family, including activities, materials, and focus areas.",
                    parameters: {
                        type: "object",
                        properties: {
                            week_focus: { type: "string", description: "Thematic focus for the week" },
                            days: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        day_name: { type: "string" },
                                        activities: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    title: { type: "string" },
                                                    type: { type: "string" }, // skill, habit, etc.
                                                    time_of_day: { type: "string" },
                                                    materials_needed: { type: "array", items: { type: "string" } }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            ]
        }];

        // Stream response
        const stream = gemini.streamGenerateContent(contents, systemPrompt, tools);

        const encoder = new TextEncoder();
        return new ReadableStream({
            async start(controller) {
                // Send "Thinking" event
                controller.enqueue(encoder.encode(`event: thought\ndata: "Consulting deep brain..."\n\n`));

                for await (const chunk of stream) {
                    if (chunk.text) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: chunk.text })}\n\n`));
                    }

                    if (chunk.toolCall) {
                        const tool = chunk.toolCall;
                        if (tool.name === 'generate_weekly_plan') {
                            // Infer Materials (Aggregate from all activities)
                            const plan = tool.args;
                            let allMaterials: string[] = [];
                            plan.days?.forEach((day: any) => {
                                day.activities?.forEach((act: any) => {
                                    if (act.materials_needed) allMaterials.push(...act.materials_needed);
                                });
                            });
                            // Deduplicate
                            allMaterials = [...new Set(allMaterials)];

                            const planPayload = {
                                type: 'PLAN_PROPOSAL',
                                data: {
                                    focus: plan.week_focus,
                                    days: plan.days,
                                    materials: allMaterials
                                },
                                reason: `I've drafted a plan for next week focused on "${plan.week_focus}".`
                            };

                            const jsonBlock = `[DATA_BLOCK]${JSON.stringify(planPayload)}[DATA_BLOCK]`;
                            controller.enqueue(encoder.encode(`data: ${jsonBlock}\n\n`));
                        }
                    }
                }
                controller.close();
            }
        });
    }
}
