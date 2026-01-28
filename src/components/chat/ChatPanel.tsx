import { useState, useRef, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ai } from '@/lib/api';
import { sanitizeMessage, validateMessage } from '@/lib/chat-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaperPlaneRight, Robot, User } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { useChatState, Message } from './hooks';
import { useChatStream } from './hooks/useChatStream';
import { useKeyboardHeight } from './hooks/useKeyboardHeight';
import {
    TextMessage,
    ThinkingMessage,
    BookCardMessage,
    ActivityCardMessage,
    ActionConfirmCard,
    ScheduleCardMessage
} from './messages';

import { BookReader } from '@/components/books/BookReader';
import { Book } from '@/types';

interface ChatPanelProps {
    className?: string;
}

/**
 * Main chat panel component with rich message support and BookReader integration.
 * Uses ephemeral state (no persistence) with action logging.
 */
export function ChatPanel({ className }: ChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const keyboardHeight = useKeyboardHeight();

    const chatState = useChatState();

    const handleMessageUpdate = useCallback((message: Message) => {
        setMessages(prev => {
            const newMessages = [...prev];
            // Update or add the last assistant message
            if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
                newMessages[newMessages.length - 1] = message;
            } else {
                newMessages.push(message);
            }
            return newMessages;
        });
    }, []);

    const handleError = useCallback((error: Error) => {
        toast.error('Chat error', { description: error.message });
    }, []);

    const { sendMessage } = useChatStream({
        chatState,
        onMessageUpdate: handleMessageUpdate,
        onError: handleError,
    });

    // Auto-scroll on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, chatState.mode, chatState.thinkingText]);

    // Load history on mount
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const logs = await ai.getInteractionLog();
                if (logs.length === 0) return;

                const historyMessages: Message[] = logs.flatMap(log => {
                    const userMsg: Message = { role: 'user', content: log.question };

                    // Parse context for action cards
                    let actionCard = undefined;
                    if (log.context && log.context.intent) {
                        actionCard = {
                            type: log.context.intent,
                            data: { results: log.context.results }
                        };
                    }

                    const aiMsg: Message = {
                        role: 'assistant',
                        content: log.answer,
                        actionCard
                    };

                    return [userMsg, aiMsg];
                }).reverse();

                setMessages(historyMessages);
            } catch (e) {
                console.warn('Failed to load chat history', e);
            }
        };
        loadHistory();
    }, []);

    const handleSend = async () => {
        const trimmedInput = sanitizeMessage(input);
        const validationError = validateMessage(trimmedInput);
        if (validationError) {
            toast.error(validationError);
            return;
        }

        const userMessage: Message = { role: 'user', content: trimmedInput };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Add empty assistant message that will be updated by stream
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        await sendMessage([...messages, userMessage], { page: 'dashboard' });
    };

    const handleConfirmAction = async () => {
        if (!chatState.pendingAction?.id) {
            toast.error('No action to confirm');
            return;
        }

        chatState.startExecuting();

        try {
            await ai.confirmAction(chatState.pendingAction.id);
            chatState.showFeedback();

            // Refresh relevant data
            queryClient.invalidateQueries({ queryKey: ['family-day'] });
            queryClient.invalidateQueries({ queryKey: ['family-week-summary'] });

            toast.success('Action confirmed');

            // Return to idle after brief delay
            setTimeout(() => chatState.goIdle(), 2000);
        } catch (error) {
            toast.error('Failed to confirm action');
            chatState.cancelAction();
        }
    };

    const handleRejectAction = async () => {
        if (chatState.pendingAction?.id) {
            try {
                await ai.rejectAction(chatState.pendingAction.id);
                toast.info('Action cancelled');
            } catch {
                // Ignore errors on rejection
            }
        }
        chatState.cancelAction();
    };

    const handleOpenBook = useCallback((book: any) => {
        // Convert search result to Book type for BookReader
        const bookData: Book = {
            id: book.id,
            title: book.title,
            description: book.description,
            coverUrl: book.metadata?.coverUrl,
            series: book.metadata?.series || 'unknown',
            pageCount: book.metadata?.pageCount || 10,
            renderFormat: book.metadata?.renderFormat || 'image',
            minAgeMonths: book.metadata?.minAgeMonths || 0,
            maxAgeMonths: book.metadata?.maxAgeMonths || 144,
        };
        setSelectedBook(bookData);
    }, []);

    return (
        <>
            <Card className={cn("h-full flex flex-col border-0 shadow-none bg-transparent", className)}>
                <CardHeader className="pb-3 border-b shrink-0">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Robot className="w-5 h-5 text-primary" />
                        Frontdesk Officer
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 p-0 overflow-hidden relative">
                    <div
                        ref={scrollRef}
                        className="h-full overflow-y-auto p-4 space-y-4"
                    >
                        {/* Welcome message if no messages */}
                        {messages.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Robot className="w-12 h-12 mx-auto mb-3 text-primary/30" />
                                <p className="text-sm">Hi! I'm your Frontdesk Officer.</p>
                                <p className="text-xs mt-1">Ask me to find books, activities, or help with your schedule.</p>
                            </div>
                        )}

                        {/* Message list */}
                        {messages.map((msg, i) => (
                            <div key={i}>
                                {/* Message bubble */}
                                <div className={cn(
                                    "flex gap-3",
                                    msg.role === 'user' ? "justify-end" : "justify-start"
                                )}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Robot className="w-5 h-5 text-primary" />
                                        </div>
                                    )}

                                    {msg.content && (
                                        <TextMessage content={msg.content} role={msg.role === 'system' ? 'assistant' : msg.role} />
                                    )}

                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-primary-foreground">
                                            <User className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>

                                {/* Action card for search results */}
                                {msg.actionCard && (
                                    <div className="mt-3 pl-11">
                                        {msg.actionCard.type === 'SEARCH_BOOKS' && msg.actionCard.data?.results && (
                                            <BookCardMessage
                                                books={msg.actionCard.data.results}
                                                onOpenBook={handleOpenBook}
                                            />
                                        )}
                                        {msg.actionCard.type === 'SEARCH_ACTIVITIES' && msg.actionCard.data?.results && (
                                            <ActivityCardMessage
                                                activities={msg.actionCard.data.results}
                                            />
                                        )}
                                        {msg.actionCard.type === 'GET_TODAY_SCHEDULE' && msg.actionCard.data?.results && (
                                            <ScheduleCardMessage
                                                items={msg.actionCard.data.results}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Thinking indicator */}
                        {chatState.mode === 'THINKING' && chatState.thinkingText && (
                            <ThinkingMessage
                                text={chatState.thinkingText}
                                steps={chatState.streamingSteps}
                            />
                        )}

                        {/* Pending action card */}
                        {chatState.mode === 'ACTION' && chatState.pendingAction && (
                            <ActionConfirmCard
                                type={chatState.pendingAction.type}
                                reason={chatState.pendingAction.reason}
                                onConfirm={handleConfirmAction}
                                onReject={handleRejectAction}
                            />
                        )}

                        {/* Executing action */}
                        {chatState.mode === 'EXECUTING' && (
                            <ActionConfirmCard
                                type={chatState.pendingAction?.type || ''}
                                reason=""
                                isExecuting
                                executionSteps={chatState.executionSteps}
                                onConfirm={() => { }}
                                onReject={() => { }}
                            />
                        )}
                    </div>
                </CardContent>

                {/* Input area */}
                <div
                    className="p-4 border-t bg-background shrink-0"
                    style={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight + 16 : undefined }}
                >
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex gap-2"
                    >
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="How can I help you today?"
                            disabled={chatState.isInputDisabled}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={chatState.isInputDisabled || !input.trim()}
                        >
                            <PaperPlaneRight className="w-5 h-5" />
                        </Button>
                    </form>
                </div>
            </Card>

            {/* BookReader lightbox */}
            {selectedBook && (
                <BookReader
                    book={selectedBook}
                    open={!!selectedBook}
                    onOpenChange={(open) => !open && setSelectedBook(null)}
                />
            )}
        </>
    );
}
