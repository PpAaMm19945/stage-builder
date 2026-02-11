import { useCallback, useRef } from 'react';
import { ai } from '@/lib/api';
import { UseChatStateReturn, PendingAction, ExecutionStep } from './useChatState';

import { Message } from '@/types/ChatTypes';
import { ChatContext } from '@/types/api-responses';

const STREAM_TIMEOUT = 30000;

export interface UseChatStreamOptions {
    chatState: UseChatStateReturn;
    onMessageUpdate: (message: Message) => void;
    onError?: (error: Error) => void;
    onQuotaUpdate?: (quota: { limit: number; remaining: number; resetsAt: string }) => void;
}

/**
 * Hook to handle SSE streaming from the chat API with proper parsing
 * of thoughts, data blocks, and action pending events.
 */
export function useChatStream({ chatState, onMessageUpdate, onError, onQuotaUpdate }: UseChatStreamOptions) {
    const abortControllerRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(async (
        messages: Message[],
        context: ChatContext = {}
    ) => {
        // Cancel any existing stream
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        chatState.startThinking();

        try {
            // Using ai.chat directly for now but we need to access headers.
            // ai.chat in api.ts returns response.body directly.
            // We need to fetch ourselves or modify api.ts.
            // Let's implement fetch here to get headers, similar to api.ts but with header access.
            const token = localStorage.getItem('schoolos_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://stage-builder.antmwes104-1.workers.dev'}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ messages, context }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                // Check if it's a quota error
                if (response.status === 429) {
                    const resetsAt = errorData.resetsAt || new Date(Date.now() + 86400000).toISOString();
                    onQuotaUpdate?.({
                        limit: 30, // Default or from header if available? Header might be on 429 too?
                        remaining: 0,
                        resetsAt
                    });
                    throw new Error(errorData.error || 'Rate limit exceeded');
                }
                throw new Error(errorData.error || 'Chat failed');
            }

            // Extract Quota Headers
            const limit = response.headers.get('X-Chat-Limit');
            const remaining = response.headers.get('X-Chat-Remaining');
            const resetsAt = response.headers.get('X-Chat-Resets-At');

            if (limit && remaining && onQuotaUpdate) {
                onQuotaUpdate({
                    limit: parseInt(limit, 10),
                    remaining: parseInt(remaining, 10),
                    resetsAt: resetsAt || ''
                });
            }

            const stream = response.body;
            if (!stream) throw new Error('No stream returned');

            const reader = stream.getReader();
            const decoder = new TextDecoder();

            const aiMessage: Message = { role: 'assistant', content: '' };
            let hasStartedStreaming = false;

            const readWithTimeout = async () => {
                const timeoutPromise = new Promise<ReadableStreamReadResult<Uint8Array>>((_, reject) =>
                    setTimeout(() => reject(new Error('Connection timed out')), STREAM_TIMEOUT)
                );
                return Promise.race([reader.read(), timeoutPromise]);
            };

            while (true) {
                const { done, value } = await readWithTimeout();
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
                        else if (eventType === 'anchor') currentEventType = 'anchor';
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

                        // 1. Handle Anchor payload
                        if (currentEventType === 'anchor') {
                            try {
                                const anchorData = JSON.parse(data);
                                aiMessage.anchorPayload = anchorData;
                                if (!hasStartedStreaming) {
                                    hasStartedStreaming = true;
                                    chatState.startStreaming();
                                }
                                onMessageUpdate({ ...aiMessage });
                            } catch (e) { console.warn('[ChatStream] Anchor parse error', e); }
                            continue;
                        }

                        // 2. Handle Steps
                        if (currentEventType === 'step') {
                            try {
                                const stepData = JSON.parse(data);
                                chatState.updateStreamingStep(stepData);

                                // Update local message steps
                                if (!aiMessage.steps) aiMessage.steps = [];
                                const existingIndex = aiMessage.steps.findIndex(s => s.id === stepData.id);
                                if (existingIndex >= 0) {
                                    aiMessage.steps[existingIndex] = { ...aiMessage.steps[existingIndex], ...stepData };
                                } else {
                                    aiMessage.steps.push(stepData);
                                }
                                onMessageUpdate({ ...aiMessage });
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
                        // Note: Defined inside loop or hook scope

                        let textToAdd = '';
                        try {
                            // Check for JSON wrapper(s)
                            if (data.startsWith('{')) {
                                try {
                                    const parsed = JSON.parse(data);
                                    if (parsed.response && typeof parsed.response === 'string') textToAdd = parsed.response;
                                    else if (parsed.content && typeof parsed.content === 'string') textToAdd = parsed.content;
                                } catch {
                                    if (data.includes('}{')) {
                                        const parts = data.split('}{');
                                        parts.forEach((fragment, i) => {
                                            if (i > 0) fragment = '{' + fragment;
                                            if (i < parts.length - 1) fragment = fragment + '}';
                                            try {
                                                const p = JSON.parse(fragment);
                                                if (p.response) textToAdd += p.response;
                                                else if (p.content) textToAdd += p.content;
                                            } catch { }
                                        });
                                    }
                                }
                            } else {
                                textToAdd = data;
                            }

                            if (textToAdd) {
                                // Simple append
                                aiMessage.content += textToAdd;
                                onMessageUpdate({ ...aiMessage });
                            }
                        } catch (e) {
                            // console.warn('Chunk processing error', e); 
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
    }, [chatState, onMessageUpdate, onError, onQuotaUpdate]);

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
