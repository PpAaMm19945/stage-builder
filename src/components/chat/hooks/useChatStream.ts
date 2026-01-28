import { useCallback, useRef } from 'react';
import { ai } from '@/lib/api';
import { UseChatStateReturn, PendingAction } from './useChatState';

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    actionCard?: {
        type: string;
        data: any;
    };
}

export interface UseChatStreamOptions {
    chatState: UseChatStateReturn;
    onMessageUpdate: (message: Message) => void;
    onError?: (error: Error) => void;
}

/**
 * Hook to handle SSE streaming from the chat API with proper parsing
 * of thoughts, data blocks, and action pending events.
 */
export function useChatStream({ chatState, onMessageUpdate, onError }: UseChatStreamOptions) {
    const abortControllerRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(async (
        messages: Message[],
        context: Record<string, any> = {}
    ) => {
        // Cancel any existing stream
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        chatState.startThinking();

        try {
            const stream = await ai.chat(messages, context);
            if (!stream) throw new Error('No stream returned');

            const reader = stream.getReader();
            const decoder = new TextDecoder();

            const aiMessage: Message = { role: 'assistant', content: '' };
            let hasStartedStreaming = false;
            let isInThoughtMode = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    // Handle thought events
                    if (line.startsWith('event: thought')) {
                        isInThoughtMode = true;
                        continue;
                    }

                    if (line.startsWith('event: step')) {
                        // Execution step update
                        continue;
                    }

                    if (line.startsWith('event: done')) {
                        chatState.showFeedback();
                        continue;
                    }

                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        // Handle thought data
                        if (isInThoughtMode && data.startsWith('"') && data.endsWith('"')) {
                            try {
                                const thoughtText = JSON.parse(data);
                                chatState.updateThinking(thoughtText);
                            } catch {
                                // Not valid JSON, ignore
                            }
                            isInThoughtMode = false;
                            continue;
                        }
                        isInThoughtMode = false;

                        // Handle DATA_BLOCK (search results)
                        if (data.includes('[DATA_BLOCK]')) {
                            const parts = data.split('[DATA_BLOCK]');
                            if (parts[1]) {
                                try {
                                    const resultData = JSON.parse(parts[1]);
                                    aiMessage.actionCard = {
                                        type: resultData.type,
                                        data: resultData.data,
                                    };
                                    aiMessage.content += resultData.reason || '';

                                    if (!hasStartedStreaming) {
                                        hasStartedStreaming = true;
                                        chatState.startStreaming();
                                    }
                                    onMessageUpdate({ ...aiMessage });
                                } catch (e) {
                                    console.error('[ChatStream] DATA_BLOCK parse error:', e);
                                }
                            }
                            continue;
                        }

                        // Handle ACTION_PENDING (requires user confirmation)
                        if (data.includes('[ACTION_PENDING]')) {
                            const parts = data.split('[ACTION_PENDING]');
                            if (parts[1]) {
                                try {
                                    const actionData: PendingAction = JSON.parse(parts[1]);
                                    chatState.showAction(actionData);
                                } catch (e) {
                                    console.error('[ChatStream] ACTION_PENDING parse error:', e);
                                }
                            }
                            continue;
                        }

                        // Standard content streaming
                        if (!hasStartedStreaming) {
                            hasStartedStreaming = true;
                            chatState.startStreaming();
                        }

                        try {
                            // Backend may send JSON like {"response": "text"} or raw text
                            let text = data;
                            if (data.startsWith('{')) {
                                const parsed = JSON.parse(data);
                                if (typeof parsed.response === 'string') {
                                    text = parsed.response;
                                }
                            }
                            aiMessage.content += text;
                            onMessageUpdate({ ...aiMessage });
                        } catch {
                            // Raw text append
                            aiMessage.content += data;
                            onMessageUpdate({ ...aiMessage });
                        }
                    }
                }
            }

            // Stream finished, go idle
            chatState.goIdle();
        } catch (error) {
            console.error('[ChatStream] Stream error:', error);
            chatState.reset();
            onError?.(error instanceof Error ? error : new Error(String(error)));
        }
    }, [chatState, onMessageUpdate, onError]);

    const cancelStream = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        chatState.reset();
    }, [chatState]);

    return {
        sendMessage,
        cancelStream,
    };
}

export type UseChatStreamReturn = ReturnType<typeof useChatStream>;
