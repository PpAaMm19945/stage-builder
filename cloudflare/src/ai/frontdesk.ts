
import { Env } from '../index';
import { RhythmGenerator } from './rhythm-generator';
import { GeminiService, GeminiContent, GeminiTool } from './gemini';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface AiAction {
    id: string;
    family_id: string;
    action_type: 'schedule_change' | 'skip_activity' | 'log_observation';
    action_data: any;
    reason: string;
    status: 'pending' | 'confirmed' | 'rejected';
    created_at: string;
}

export class FrontdeskOfficer {
    constructor(private env: Env) { }

    async chat(messages: ChatMessage[], context: any): Promise<ReadableStream> {
        if (!this.env.GOOGLE_API_KEY) {
            throw new Error("Missing GOOGLE_API_KEY");
        }

        const gemini = new GeminiService(this.env.GOOGLE_API_KEY);

        const systemPrompt = `You are the FamilyPath Frontdesk Officer.
    
    YOUR ROLE:
    - First point of contact for families
    - Greet, help, and get things done
    - You have many capabilities but always ask before acting
    
    YOUR RULES:
    1. NEVER act without confirmation for any changes (schedule, skip, etc.)
    2. ALWAYS explain your reasoning briefly
    3. KEEP IT SIMPLE — most parents have 5 minutes
    4. LOG EVERYTHING — every action is recorded
    5. STAY IN YOUR LANE — you suggest, parents decide
    
    YOUR TONE:
    - Warm, not corporate
    - Efficient, not rushed
    - Humble, not preachy
    - Encouraging, not guilt-inducing
    
    CONTEXT:
    Date: ${context.date || new Date().toISOString().split('T')[0]}
    Page: ${context.page || 'dashboard'}
    `;

        const tools: GeminiTool[] = [
            {
                functionDeclarations: [
                    {
                        name: "get_todays_rhythm",
                        description: "Retrieve today's formation activities for the family",
                        parameters: { type: "object", properties: {} }
                    },
                    {
                        name: "propose_schedule_change",
                        description: "Propose a modification to the weekly schedule. Requires confirmation.",
                        parameters: {
                            type: "object",
                            properties: {
                                changes: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            day: { type: "string" },
                                            action: { type: "string", enum: ["add", "remove", "move", "swap"] },
                                            activity_id: { type: "string" },
                                            reason: { type: "string" }
                                        },
                                        required: ["day", "action", "reason"]
                                    }
                                },
                                explanation: { type: "string" }
                            },
                            required: ["changes", "explanation"]
                        }
                    },
                    {
                        name: "propose_skip_activity",
                        description: "Propose skipping a specific activity. Requires confirmation.",
                        parameters: {
                            type: "object",
                            properties: {
                                activity_id: { type: "string" },
                                reason: { type: "string" },
                                transfer_to_date: { type: "string" } // Optional
                            },
                            required: ["activity_id", "reason"]
                        }
                    },
                    {
                        name: "log_observation",
                        description: "Record a parent's observation about a child",
                        parameters: {
                            type: "object",
                            properties: {
                                child_id: { type: "string" },
                                observation_text: { type: "string" },
                                sentiment: { type: "string", enum: ["positive", "neutral", "concern"] }
                            },
                            required: ["child_id", "observation_text", "sentiment"]
                        }
                    }
                ]
            }
        ];

        // Convert messages to Gemini Content
        const geminiContents: GeminiContent[] = messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        // Call Gemini Stream
        const geminiStream = gemini.streamGenerateContent(geminiContents, systemPrompt, tools);

        // Transform into ReadableStream for the frontend
        const encoder = new TextEncoder();

        return new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of geminiStream) {
                        if (chunk.text) {
                            controller.enqueue(encoder.encode(chunk.text));
                        }

                        if (chunk.toolCall) {
                            // Handle Tool Call
                            // For now, in this migration, we will serialize the tool call 
                            // and send it as a special marker if needed, or structured JSON.
                            // The frontend expects some text or action marker.

                            // We'll mimic the "pending action" marker strategy from the plan.
                            // But since we can't easily save to DB here without context,
                            // We'll send a formatted JSON block that the frontend can parse as "Action Proposal".

                            const actionPayload = {
                                type: 'action_proposal',
                                tool: chunk.toolCall.name,
                                args: chunk.toolCall.args
                            };

                            // Send as a special block
                            controller.enqueue(encoder.encode(`\n\n[ACTION]${JSON.stringify(actionPayload)}[/ACTION]\n\n`));
                        }
                    }
                } catch (e) {
                    console.error("Stream error", e);
                    controller.enqueue(encoder.encode("\n[Error: Connection interrupted]\n"));
                } finally {
                    controller.close();
                }
            }
        });
    }
}
// NOTE: For robustness in this prototype phase, I will implement a non-streaming fallback for Tool calls
// if I can't robustly stream them. 

