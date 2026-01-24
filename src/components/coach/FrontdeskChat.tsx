
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

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
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

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const stream = await ai.chat([...messages, userMsg], { page: 'dashboard' });
            const reader = stream.getReader();
            const decoder = new TextDecoder();

            let aiMsg: Message = { role: 'assistant', content: '' };
            setMessages(prev => [...prev, aiMsg]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                // Handle [ACTION] markers or text
                // If chunk contains [ACTION_PENDING], parse the JSON
                if (chunk.includes('[ACTION_PENDING]')) {
                    const parts = chunk.split('[ACTION_PENDING]');
                    if (parts[0]) {
                        aiMsg.content += parts[0];
                        setMessages(prev => {
                            const newMsgs = [...prev];
                            newMsgs[newMsgs.length - 1] = { ...aiMsg };
                            return newMsgs;
                        });
                    }
                    if (parts[1]) {
                        try {
                            const actionData = JSON.parse(parts[1]);
                            setPendingAction(actionData);
                        } catch (e) {
                            console.error("Failed to parse action", e);
                        }
                    }
                } else {
                    aiMsg.content += chunk;
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1] = { ...aiMsg };
                        return newMsgs;
                    });
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to send message");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="h-[600px] flex flex-col">
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

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-muted rounded-2xl px-4 py-2 flex items-center gap-2">
                                <CircleNotch className="w-4 h-4 animate-spin" />
                                <span className="text-xs text-muted-foreground">Thinking...</span>
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
