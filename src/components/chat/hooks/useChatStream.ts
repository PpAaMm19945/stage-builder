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

                let currentEventType = 'message'; // default

                for (const line of lines) {
                    if (!line.trim()) continue; // Skip empty lines

                    // Handle Event Types
                    if (line.startsWith('event: ')) {
                        const eventType = line.slice(7).trim();
                        if (eventType === 'thought') currentEventType = 'thought';
                        else if (eventType === 'step') currentEventType = 'step';
                        else if (eventType === 'done') currentEventType = 'done';
                        else currentEventType = 'message';

                        if (currentEventType === 'done') {
                            chatState.showFeedback();
                        }
                        continue;
                    }

                    // Handle Data
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        // 1. Handle Steps
                        if (currentEventType === 'step') {
                            try {
                                const stepData = JSON.parse(data);
                                chatState.updateStreamingStep(stepData);
                            } catch (e) { console.warn('Step parse error', e); }
                            continue;
                        }

                        // 2. Handle Thoughts
                        if (currentEventType === 'thought') {
                            try {
                                // Sometimes thought data is quoted string, sometimes raw
                                const thoughtText = data.startsWith('"') ? JSON.parse(data) : data;
                                chatState.updateThinking(thoughtText);
                            } catch {
                                chatState.updateThinking(data);
                            }
                            continue;
                        }

                        // 3. Handle Message Data (Standard, Blocks, Actions)

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

                        // Handle ACTION_PENDING
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

                        // Standard text content
                        if (!hasStartedStreaming) {
                            hasStartedStreaming = true;
                            chatState.startStreaming();
                        }

                        // Helper to extract response text from JSON fragment
                        const extractResponse = (jsonStr: string): string => {
                            try {
                                const parsed = JSON.parse(jsonStr);
                                if (parsed.response && typeof parsed.response === 'string') {
                                    return parsed.response;
                                }
                            } catch { /* ignore */ }
                            return '';
                        };

                        try {
                            let textToAdd = '';

                            // Check for JSON wrapper(s)
                            if (data.startsWith('{')) {
                                try {
                                    // 1. Try parsing as a single JSON object
                                    const parsed = JSON.parse(data);
                                    if (parsed.response && typeof parsed.response === 'string') {
                                        textToAdd = parsed.response;
                                    }
                                } catch {
                                    // 2. Parse failed, might be concatenated JSON objects (e.g. {response:...}{usage:...})
                                    // This happens with Cloudflare Workers AI streaming sometimes
                                    if (data.includes('}{')) {
                                        const parts = data.split('}{');
                                        for (let i = 0; i < parts.length; i++) {
                                            let fragment = parts[i];
                                            // Reconstruct valid JSON objects
                                            if (i > 0) fragment = '{' + fragment;
                                            if (i < parts.length - 1) fragment = fragment + '}';

                                            textToAdd += extractResponse(fragment);
                                        }
                                    } else {
                                        // 3. Just a broken JSON fragment or something else.
                                        // CRITICAL: Do NOT append raw data if it looks like JSON but failed to parse.
                                        // This prevents leaking raw JSON strings like {"response":"","usage":...} to the UI.
                                        console.warn('[ChatStream] Skipping malformed JSON data chunk');
                                    }
                                }
                            } else {
                                // Not JSON, treat as raw text
                                textToAdd = data;
                            }

                            if (textToAdd) {
                                aiMessage.content += textToAdd;
                                onMessageUpdate({ ...aiMessage });
                            }
                        } catch (err) {
                            console.error('[ChatStream] Error processing data chunk:', err);
                            // Do not append raw data on error to be safe
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
