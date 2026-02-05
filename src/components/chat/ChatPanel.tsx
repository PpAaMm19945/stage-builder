import { useState, useRef, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ai, auth, anchor } from '@/lib/api';
import { sanitizeMessage, validateMessage } from '@/lib/chat-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaperPlaneRight, Robot, User, X, Trash } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { useChatState } from './hooks';
import { chatStorage } from '@/lib/chat-storage';
import { useChatStream } from './hooks/useChatStream';
import { useKeyboardHeight } from './hooks/useKeyboardHeight';
import {
    TextMessage,
    ThinkingMessage,
    BotActivityLog,
    BookCardMessage,
    ActivityCardMessage,
    ActionConfirmCard,
    ScheduleCardMessage,
    AnchorBriefingMessage
} from './messages';
import { Message } from '@/types/ChatTypes';

import { BookReader } from '@/components/books/BookReader';
import { Book } from '@/types';

interface ChatPanelProps {
    className?: string;
    onClose?: () => void;
}

/**
 * Main chat panel component with rich message support and BookReader integration.
 * Uses ephemeral state (no persistence) with action logging.
 */
export function ChatPanel({ className, onClose }: ChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
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

            // Persist to local storage if we have a user
            if (userId) {
                chatStorage.saveSession(userId, newMessages);
            }

            return newMessages;
        });
    }, [userId]);

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

    // Load history on mount + Check for Daily Anchor
    useEffect(() => {
        const initializeChat = async () => {
            try {
                // 1. Get User ID
                const { user } = await auth.getMe();
                if (!user?.id) return;
                setUserId(user.id);

                // 2. Check for Daily Anchor (First load of day)
                const today = new Date().toISOString().split('T')[0];
                const lastFetch = localStorage.getItem(`anchor_fetch_${user.id}`);

                let anchorMessage: Message | null = null;

                if (lastFetch !== today) {
                    try {
                        console.log('[Chat] Fetching Daily Anchor...');
                        const anchorData = await anchor.getToday();
                        if (anchorData) {
                            anchorMessage = {
                                role: 'assistant',
                                content: '', // Content is in the payload
                                anchorPayload: anchorData
                            };
                            localStorage.setItem(`anchor_fetch_${user.id}`, today);
                            console.log('[Chat] Received Anchor:', anchorData);
                        }
                    } catch (err) {
                        console.error('[Chat] Failed to fetch daily anchor:', err);
                    }
                }

                // 3. Try loading local session
                const localSession = await chatStorage.loadSession(user.id);
                if (localSession && localSession.length > 0) {
                    // If we have a new anchor, append it to the session if not already there
                    // (Simple check: is the last message an anchor from today? Logic can be refined)
                    if (anchorMessage) {
                        setMessages([...localSession, anchorMessage]);
                        chatStorage.saveSession(user.id, [...localSession, anchorMessage]);
                    } else {
                        setMessages(localSession);
                    }
                    return;
                }

                // 4. Fallback: Load from server logs
                const logs = await ai.getInteractionLog();

                let historyMessages: Message[] = [];
                if (logs.length > 0) {
                    historyMessages = logs.flatMap(log => {
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
                }

                // Inject anchor if we have one and no history or just loaded history
                if (anchorMessage) {
                    historyMessages.push(anchorMessage);
                }

                if (historyMessages.length > 0) {
                    setMessages(historyMessages);
                }

            } catch (e) {
                console.warn('Failed to initialize chat', e);
            }
        };
        initializeChat();
    }, []);

    const handleClearChat = async () => {
        if (userId) {
            await chatStorage.clearSession(userId);
            setMessages([]);
            toast.success('Chat cleared');
        }
    };

    const handleSend = async () => {
        const trimmedInput = sanitizeMessage(input);
        const validationError = validateMessage(trimmedInput);
        if (validationError) {
            toast.error(validationError);
            return;
        }

        const userMessage: Message = { role: 'user', content: trimmedInput };
        const assistantPlaceholder: Message = { role: 'assistant', content: '' };

        setMessages(prev => {
            const updated = [...prev, userMessage, assistantPlaceholder];
            // Persist immediately
            if (userId) {
                chatStorage.saveSession(userId, updated);
            }
            return updated;
        });

        setInput('');

        // Check for anchor adjustment
        const isRegen = trimmedInput.toLowerCase().includes("adjust") || trimmedInput.toLowerCase().includes("regenerate");

        if (isRegen && trimmedInput.length < 200) { // Safety check to not trap long unrelated queries
            try {
                chatState.startThinking();
                const newAnchor = await anchor.regenerate(trimmedInput);

                const resultMsg: Message = {
                    role: 'assistant',
                    content: "I've updated the plan based on your request.",
                    anchorPayload: newAnchor
                };

                handleMessageUpdate(resultMsg);
                chatState.goIdle();
                return;
            } catch (e) {
                console.error("Failed to regenerate, falling back to chat", e);
                // Fall through to normal chat
            }
        }

        await sendMessage([...messages, userMessage], { page: 'dashboard' });
    };

    const handleConfirmAction = async () => {
        if (!chatState.pendingAction) {
            toast.error('No action to confirm');
            return;
        }

        chatState.startExecuting();

        try {
            // Use direct execution with payload instead of ID
            if (chatState.pendingAction.data) {
                await ai.executeAction(chatState.pendingAction.data);
            } else if (chatState.pendingAction.id) {
                // Fallback for legacy ID-based actions
                await ai.confirmAction(chatState.pendingAction.id);
            }

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
                <CardHeader className="h-14 flex flex-row items-center justify-between p-0 px-4 border-b border-border/50 space-y-0 shrink-0">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Robot className="w-5 h-5 text-primary" />
                        Frontdesk Officer
                    </CardTitle>
                    <div className="flex items-center gap-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClearChat}
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        aria-label="Clear chat"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Clear chat history</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {onClose && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                aria-label="Close chat"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
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
                                        <div aria-hidden="true" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 self-start mt-1">
                                            <Robot className="w-5 h-5 text-primary" />
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-1 min-w-0 max-w-[85%]">
                                        {/* Activity Log (Thinking Steps) - Above Message */}
                                        {msg.role === 'assistant' && msg.steps && msg.steps.length > 0 && (
                                            <BotActivityLog steps={msg.steps} className="mb-0" />
                                        )}

                                        {msg.content && (
                                            <TextMessage content={msg.content} role={msg.role === 'system' ? 'assistant' : msg.role} />
                                        )}
                                    </div>

                                    {msg.role === 'user' && (
                                        <div aria-hidden="true" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-primary-foreground">
                                            <User className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>

                                {/* Custom Payload Messages (Anchor, etc) */}
                                {msg.anchorPayload && (
                                    <div className="mt-3 pl-11">
                                        <AnchorBriefingMessage
                                            data={msg.anchorPayload}
                                            onAdjust={() => {
                                                if (inputRef.current) {
                                                    inputRef.current.focus();
                                                    setInput("I'd like to adjust the plan: ");
                                                }
                                            }}
                                            onLooksGood={() => {
                                                // Optimistic update or just a toast
                                                toast.success("Great! Have a blessed day.");
                                            }}
                                        />
                                    </div>
                                )}



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

                        {/* Thinking indicator - REMOVED: Steps are now attached to messages */}
                        {/* {chatState.mode === 'THINKING' && chatState.thinkingText && (
                            <ThinkingMessage
                                text={chatState.thinkingText}
                                steps={chatState.streamingSteps}
                            />
                        )} */}

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
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={chatState.isInputDisabled || !input.trim()}
                                        aria-label="Send message"
                                    >
                                        <PaperPlaneRight className="w-5 h-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Send message</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </form>
                </div>
            </Card >

            {/* BookReader lightbox */}
            {
                selectedBook && (
                    <BookReader
                        book={selectedBook}
                        open={!!selectedBook}
                        onOpenChange={(open) => !open && setSelectedBook(null)}
                    />
                )
            }
        </>
    );
}
