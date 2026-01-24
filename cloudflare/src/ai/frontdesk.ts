
import { Env } from '../index';
import { RhythmGenerator } from './rhythm-generator';

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

        const tools = [
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
        ];

        const gatewayUrl = `https://${this.env.AI_GATEWAY_HOST}/v1/chat/completions`;

        // We can't stream directly from `fetch` if we want to handle tool calls first.
        // However, for streaming chat UI, we usually want text tokens.
        // But if a tool is called, we need to intercept it.
        // Lovable Gateway supports streaming.
        // If tool calls are present, the stream will contain tool call chunks.

        // For simplicity in this implementation, we will use non-streaming for tool decisions, 
        // but streaming for the final text response if no tool is called.
        // OR we relay the stream and parse chunks on the frontend?
        // The plan says: "Streaming support - Uses the Lovable Gateway's streaming endpoint".
        // "Response: Server-Sent Events stream with: Text chunks... [ACTION] markers..."

        // So the backend (this class) should handle the stream and inject [ACTION] markers if a tool is called.

        const response = await fetch(gatewayUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.env.LOVABLE_API_KEY}`,
                "cf-aig-account-id": this.env.AI_GATEWAY_ACCOUNT_ID,
                "cf-aig-gateway-name": this.env.AI_GATEWAY_NAME
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-exp",
                messages: [{ role: "system", content: systemPrompt }, ...messages],
                tools: tools,
                stream: true
            })
        });

        // Transform stream to handle tool calls
        // If we detect tool calls, we shouldn't execute them autonomously if they require confirmation (all of them do except get_todays_rhythm).
        // The plan says: "AI proposes action -> Logged to ai_action_log with status: 'pending'".
        // "Frontend shows action card".

        // So if the AI calls `propose_schedule_change`, we should NOT execute it.
        // We should log it as pending and return an [ACTION] marker to the frontend.

        // Handling streaming tool calls in a Cloudflare Worker `ReadableStream` is tricky.
        // We'll need a transformer.

        const originalStream = response.body;
        if (!originalStream) throw new Error("No stream from AI Gateway");

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        let buffer = "";
        let isToolCalling = false;
        let toolCallBuffer = "";

        // This is a simplified transformer. Valid JSON parsing from stream chunks is hard.
        // Assuming Gemini format or OpenAI format.

        return new ReadableStream({
            async start(controller) {
                const reader = originalStream.getReader();

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        // SSE parsing
                        const lines = chunk.split('\n');
                        for (const line of lines) {
                            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                                try {
                                    const data = JSON.parse(line.slice(6));
                                    // OpenAI/Gemini format difference. Assuming OpenAI compatibility mode from Gateway.
                                    const delta = data.choices?.[0]?.delta;

                                    if (delta?.content) {
                                        controller.enqueue(encoder.encode(delta.content));
                                    }

                                    if (delta?.tool_calls) {
                                        const toolCall = delta.tool_calls[0];
                                        if (toolCall.function) {
                                            // Accumulate arguments
                                            if (toolCall.function.name) {
                                                // New tool call start
                                                // We might want to send a marker that "AI is thinking..." or "AI is proposing..."
                                            }
                                            if (toolCall.function.arguments) {
                                                toolCallBuffer += toolCall.function.arguments;
                                            }
                                            // We need the name too. Assuming single tool call for now.
                                            // Ideally we'd buffer the whole tool call object.
                                        }
                                    }

                                    // If finish_reason is 'tool_calls', we process the buffered tool call
                                    if (data.choices?.[0]?.finish_reason === 'tool_calls' || data.choices?.[0]?.finish_reason === 'function_call') {
                                        // Process tool call
                                        // We need the full function name and args. 
                                        // This naive buffering assumes we got the name earlier.
                                        // In a real robust impl, we'd need to track index.

                                        // For now, let's output a special marker.
                                        // Ideally we'd persist the pending action here.
                                        // But we are in a stream. We can't await DB easily without delaying the stream close?
                                        // We can start a background task or just send the marker and let frontend confirm?
                                        // "Parent clicks Confirm -> POST /api/chat/confirm". 
                                        // This implies the action is ALREADY in the DB?
                                        // Yes "Logged to ai_action_log with status: 'pending'".

                                        // So we MUST save to DB.
                                        // We can do `ctx.waitUntil` if we had access to `ctx`. 
                                        // We passed `env` but not `executionCtx`.

                                        // Workaround: We'll construct the action object and send it to frontend as [ACTION] JSON.
                                        // The frontend will treat it as a proposal card.
                                        // When user clicks Confirm, it calls `/api/chat/confirm` with the action payload?
                                        // Or simply the Action ID?
                                        // If ID, we must save it first.

                                        // Let's assume we send the FULL payload to frontend signed or just raw, and `confirm` endpoint saves and executes it?
                                        // Actually, spec said: "AI proposes action -> Logged to ai_action_log with status: 'pending'".
                                        // So backend must save it.

                                        // I'll emit a [ACTION_PENDING] marker with the JSON.
                                        // But currently I can't easily save to DB from inside the stream transformer without `await`.
                                        // `start` IS async, so I can await!
                                        // I need to parse the tool call properly first.
                                    }
                                } catch (e) {
                                    // ignore parse errors for partial chunks
                                }
                            }
                        }
                    }
                } finally {
                    controller.close();
                }
            }
        });
    }

    // NOTE: For robustness in this prototype phase, I will implement a non-streaming fallback for Tool calls 
    // if I can't robustly stream them. 
    // Or I can offer a separate `handleToolCall` method.

    // Given the complexity of streaming tool calls + side-effect (DB insert), 
    // I'll adopt a strategy:
    // 1. If response has `tool_calls`, we pause streaming, aggregate, save to DB, then send [ACTION] marker.
    // 2. If content, stream it.
}
