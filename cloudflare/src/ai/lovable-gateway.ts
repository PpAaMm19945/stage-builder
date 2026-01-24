// Lovable AI Gateway Client
// Uses google/gemini-3-flash-preview via Lovable's gateway

interface LovableMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface LovableTool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    };
}

interface LovableResponse {
    choices: Array<{
        message: {
            content: string;
            tool_calls?: Array<{
                function: { name: string; arguments: string };
            }>;
        };
    }>;
}

export class LovableGateway {
    private baseUrl = 'https://ai.gateway.lovable.dev/v1';

    constructor(private apiKey: string) { }

    // Non-streaming completion
    async complete(options: {
        messages: LovableMessage[];
        tools?: LovableTool[];
        temperature?: number;
    }): Promise<LovableResponse> {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'google/gemini-3-flash-preview',
                messages: options.messages,
                tools: options.tools,
                temperature: options.temperature || 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`Lovable Gateway Error: ${response.status} ${response.statusText}`);
        }

        return await response.json() as LovableResponse;
    }

    // Streaming completion (for chat)
    async *stream(options: {
        messages: LovableMessage[];
    }): AsyncGenerator<string> {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'google/gemini-3-flash-preview',
                messages: options.messages,
                stream: true
            })
        });

        if (!response.ok || !response.body) {
            throw new Error(`Lovable Gateway Stream Error: ${response.status}`);
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
                if (line.trim() === '') continue;
                if (line.trim() === 'data: [DONE]') return;
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        const content = data.choices[0]?.delta?.content;
                        if (content) yield content;
                    } catch (e) {
                        console.warn('Error parsing stream chunk', e);
                    }
                }
            }
        }
    }
}
