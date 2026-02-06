
export interface GeminiMessage {
    role: 'user' | 'model' | 'system';
    parts: { text: string }[];
}

export interface GeminiContent {
    role: 'user' | 'model';
    parts: {
        text?: string;
        functionCall?: {
            name: string;
            args: object;
        };
        functionResponse?: {
            name: string;
            response: object;
        };
    }[];
}

export interface GeminiTool {
    functionDeclarations: {
        name: string;
        description: string;
        parameters?: object;
    }[];
}

export class GeminiService {
    private apiKey: string;
    private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    private model = 'gemini-3-flash-preview'; // Unified model for all AI calls

    constructor(apiKey: string, model?: string) {
        this.apiKey = apiKey;
        if (model) this.model = model;
        console.log(`[GeminiService] Initialized with model: ${this.model}`);
    }

    /**
     * Non-streaming generation (e.g. for reports)
     * Supports JSON mode
     */
    async generateContent(
        contents: GeminiContent[],
        systemInstruction?: string,
        responseSchema?: any, // For constrained decoding
        responseMimeType: 'text/plain' | 'application/json' = 'text/plain'
    ) {
        const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

        const removeSystemRoles = contents; // GeminiContent role is only user|model, system is separate prompt

        const body: any = {
            contents: removeSystemRoles,
            generationConfig: {
                responseMimeType: responseMimeType
            }
        };

        if (systemInstruction) {
            body.systemInstruction = {
                parts: [{ text: systemInstruction }]
            };
        }

        if (responseSchema) {
            body.generationConfig.responseSchema = responseSchema;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json() as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('Gemini returned empty response');
        }

        return text;
    }

    /**
     * Streaming generation (e.g. for chat)
     */
    async *streamGenerateContent(
        contents: GeminiContent[],
        systemInstruction?: string,
        tools?: GeminiTool[]
    ): AsyncGenerator<any> { // Yields chunks or tool call objects
        const url = `${this.baseUrl}/${this.model}:streamGenerateContent?alt=sse&key=${this.apiKey}`;

        const body: any = {
            contents: contents
        };

        if (systemInstruction) {
            body.systemInstruction = {
                parts: [{ text: systemInstruction }]
            };
        }

        if (tools) {
            body.tools = tools;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok || !response.body) {
            throw new Error(`Gemini Stream Error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonStr = line.slice(6);
                    if (jsonStr === '[DONE]') return;

                    try {
                        const chunk = JSON.parse(jsonStr);
                        const candidate = chunk.candidates?.[0];

                        if (candidate) {
                            const part = candidate.content?.parts?.[0];

                            // Yield text
                            if (part?.text) {
                                yield { text: part.text };
                            }

                            // Yield function call (usually comes in one chunk for Flash)
                            if (part?.functionCall) {
                                yield { toolCall: part.functionCall };
                            }
                        }
                    } catch (e) {
                        // Ignore parse errors on stream chunks
                    }
                }
            }
        }
    }

    /**
     * Stream content and return a ReadableStream (for SSE endpoints)
     */
    async streamContent(
        contents: GeminiContent[],
        systemInstruction?: string
    ): Promise<ReadableStream> {
        const self = this;
        const encoder = new TextEncoder();

        return new ReadableStream({
            async start(controller) {
                try {
                    const generator = self.streamGenerateContent(contents, systemInstruction);

                    for await (const chunk of generator) {
                        if (chunk.text) {
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk.text })}\n\n`));
                        }
                    }

                    controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                    controller.close();
                } catch (error) {
                    console.error('[GeminiService] Stream error:', error);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: 'Error generating response.' })}\n\n`));
                    controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                    controller.close();
                }
            }
        });
    }
}
