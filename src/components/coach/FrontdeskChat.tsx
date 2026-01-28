
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ai } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PaperPlaneRight, CircleNotch, Robot, User, Check, X } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { ActionCard } from './ActionCard';
import { PlanProposalCard } from './PlanProposalCard';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    actionCard?: {
        type: string;
        data: any;
    };
}

interface ActionPayload {
    id: string;
    type: string;
    data: any;
    reason: string;
}

export function FrontdeskChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pendingAction, setPendingAction] = useState<ActionPayload | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, pendingAction]);

    const confirmActionMutation = useMutation({
        mutationFn: (actionId: string) => ai.confirmAction(actionId),
        onSuccess: () => {
            toast.success("Action confirmed");
            setPendingAction(null);
            // Refresh relevant data
            queryClient.invalidateQueries({ queryKey: ['family-day'] });
            queryClient.invalidateQueries({ queryKey: ['family-week-summary'] });
        }
    });

    const rejectActionMutation = useMutation({
        mutationFn: (actionId: string) => ai.rejectAction(actionId),
        onSuccess: () => {
            toast.info("Action cancelled");
            setPendingAction(null);
        }
    });

    const [thinkingText, setThinkingText] = useState<string | null>(null);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        setThinkingText("Connecting to Cortex...");

        try {
            const stream = await ai.chat([...messages, userMsg], { page: 'dashboard' });
            if (!stream) throw new Error("No stream returned");

            const reader = stream.getReader();
            const decoder = new TextDecoder();

            let aiMsg: Message = { role: 'assistant', content: '' };
            // Don't add empty message yet, wait for first real content
            let messageAdded = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('event: thought')) {
                        // Next line(s) will be data: "Thought text"
                        continue;
                    }

                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        // 1. Handle Thoughts
                        // If the previous event was thought, or if it looks like a thought string
                        // The backend sends: event: thought \n data: "thinking..."
                        // But our simple splitter might separate them. 
                        // Let's assume standard SSE: data lines follow events.
                        // Actually, our backend sends: `event: thought\ndata: "..."` in one flush usually
                        // We need to check if we are in "thought mode" or regex match.

                        // Heuristic: If it's a quoted string that looks like a thought
                        if (data.startsWith('"') && data.endsWith('"') && (input.includes('plan') || thinkingText)) {
                            // It's likely a thought line if we haven't started shedding content
                            // Update thinking text
                            setThinkingText(JSON.parse(data));
                            continue;
                        }

                        // 2. Clear Thinking on first content
                        if (!messageAdded && (data.startsWith('{') || data.length > 0)) {
                            setThinkingText(null);
                            setMessages(prev => [...prev, aiMsg]);
                            messageAdded = true;
                        }

                        // 3. Handle [DATA_BLOCK] (Search Results)
                        if (data.includes('[DATA_BLOCK]')) {
                            const parts = data.split('[DATA_BLOCK]');
                            if (parts[1]) {
                                try {
                                    const resultData = JSON.parse(parts[1]);
                                    // Determine type from payload (e.g. SEARCH_BOOKS)
                                    aiMsg.actionCard = {
                                        type: resultData.type,
                                        data: resultData.data
                                    };

                                    // Also append a text summary for history/fallback
                                    aiMsg.content += resultData.reason || "";

                                    setMessages(prev => {
                                        const newMsgs = [...prev];
                                        newMsgs[newMsgs.length - 1] = { ...aiMsg };
                                        return newMsgs;
                                    });
                                } catch (e) { console.error("Data block parse error", e); }
                            }
                            continue;
                        }

                        // 4. Handle [ACTION_PENDING]
                        if (data.includes('[ACTION_PENDING]')) {
                            const parts = data.split('[ACTION_PENDING]');
                            if (parts[1]) {
                                const actionData = JSON.parse(parts[1]);
                                setPendingAction(actionData);
                            }
                            continue;
                        }

                        // 5. Standard Content
                        try {
                            // Backend sends `data: {"response": "text"}` for Gemini
                            // OR `data: text` for Llama sometimes?
                            // Cortex normalizes to: `data: {"response": "..."}` for Gemini
                            // But Llama might send raw text.

                            let text = data;
                            if (data.startsWith('{')) {
                                const parsed = JSON.parse(data);
                                if (typeof parsed.response === 'string') text = parsed.response;
                            }

                            aiMsg.content += text;
                            setMessages(prev => {
                                const newMsgs = [...prev];
                                newMsgs[newMsgs.length - 1] = { ...aiMsg };
                                return newMsgs;
                            });
                        } catch (e) {
                            // raw text append
                            aiMsg.content += data;
                            setMessages(prev => {
                                const newMsgs = [...prev];
                                newMsgs[newMsgs.length - 1] = { ...aiMsg };
                                return newMsgs;
                            });
                        }
                    }
                }
            }
        } catch (err) {
            console.error('[Chat] Stream error:', err);
            toast.error("Failed to send message: " + (err instanceof Error ? err.message : String(err)));
        } finally {
            setIsLoading(false);
            setThinkingText(null);
        }
    };

    return (
        <Card className="h-full flex flex-col border-0 shadow-none bg-transparent">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Robot className="w-5 h-5 text-primary" />
                    Frontdesk Officer
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative">
                <div ref={scrollRef} className="h-full overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Robot className="w-5 h-5 text-primary" />
                                </div>
                            )}
                            <div className={cn(
                                "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                                msg.role === 'user'
                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                    : "bg-muted text-foreground rounded-tl-sm"
                            )}>
                                {msg.content}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-primary-foreground">
                                    <User className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Render Action Card separately if it belongs to the last message (or any message) */}
                    {messages.map((msg, i) => msg.actionCard && (
                        <div key={`action-${i}`} className="flex justify-start mb-4 pl-11">
                            {msg.actionCard.type === 'PLAN_PROPOSAL' ? (
                                <PlanProposalCard type={msg.actionCard.type} data={msg.actionCard.data} />
                            ) : (
                                <ActionCard type={msg.actionCard.type} data={msg.actionCard.data} />
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-muted rounded-2xl px-4 py-2 flex items-center gap-2">
                                <CircleNotch className="w-4 h-4 animate-spin text-primary" />
                                <span className="text-xs text-muted-foreground animate-pulse">
                                    {thinkingText || "Thinking..."}
                                </span>
                            </div>
                        </div>
                    )}

                    {pendingAction && (
                        <Card className="bg-background border-primary/20 shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-primary">Proposed Action</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm pb-2">
                                <p className="font-medium">{pendingAction.type.replace(/_/g, ' ')}</p>
                                <p className="text-muted-foreground mt-1">{pendingAction.reason}</p>
                            </CardContent>
                            <CardFooter className="flex gap-2 pt-2">
                                <Button
                                    size="sm"
                                    onClick={() => confirmActionMutation.mutate(pendingAction.id)}
                                    disabled={confirmActionMutation.isPending}
                                >
                                    {confirmActionMutation.isPending ? "Confirming..." : <><Check className="mr-1 w-4 h-4" /> Confirm</>}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => rejectActionMutation.mutate(pendingAction.id)}
                                    disabled={rejectActionMutation.isPending}
                                >
                                    <X className="mr-1 w-4 h-4" /> Reject
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>
            </CardContent>

            <div className="p-4 border-t bg-background">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                >
                    <Input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="How can I help you today?"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        <PaperPlaneRight className="w-5 h-5" />
                    </Button>
                </form>
            </div>
        </Card>
    );
}
