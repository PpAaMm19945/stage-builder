import { useState, useRef, useEffect } from 'react';
import { PaperPlaneRight, Sparkle, ChatCircleDots, Lightning, Sliders, CheckCircle, WarningCircle, Funnel, Clock, ArrowsClockwise } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ai, overrides, liturgy, rhythm, weeklyPlan } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    action?: ActionBlock;
}

interface ActionBlock {
    type: 'accommodation' | 'liturgy' | 'rhythm' | 'regenerate';
    payload: any;
    status?: 'pending' | 'completed' | 'failed';
}

export function SchoolOSChat() {
    const { user, children } = useAuth();
    const queryClient = useQueryClient();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I'm your SchoolOS Pedagogical Coach. I can help you with curriculum ideas, habit training, or adapting lessons for your children." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const stream = await ai.chat(userMessage, {
                children: children?.map((c: any) => ({ name: c.name, age: c.ageInMonths })),
                user: user?.name
            });

            if (!stream) throw new Error("No stream returned");

            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';
            let actionBlockBuffer = '';
            let isParsingAction = false;

            // Add placeholder assistant message
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim().startsWith('data: ')) {
                        const data = line.trim().slice(6);
                        if (data === '[DONE]') continue;
                        try {
                            const parsed = JSON.parse(data);
                            const token = parsed.response;
                            if (token) {
                                // Simple state machine for parsing action block
                                if (token.includes('<ACTION_BLOCK>')) {
                                    isParsingAction = true;
                                    const parts = token.split('<ACTION_BLOCK>');
                                    assistantMessage += parts[0];
                                    actionBlockBuffer += parts[1] || '';
                                } else if (token.includes('</ACTION_BLOCK>')) {
                                    isParsingAction = false;
                                    const parts = token.split('</ACTION_BLOCK>');
                                    actionBlockBuffer += parts[0];

                                    // Parse complete action
                                    try {
                                        const action = JSON.parse(actionBlockBuffer);
                                        setMessages(prev => {
                                            const newMsgs = [...prev];
                                            const lastMsg = newMsgs[newMsgs.length - 1];
                                            lastMsg.content = assistantMessage; // content before action
                                            lastMsg.action = { ...action, status: 'pending' };
                                            return newMsgs;
                                        });
                                    } catch (e) {
                                        console.error('Failed to parse action JSON', e);
                                    }

                                    assistantMessage += parts[1] || '';
                                    actionBlockBuffer = '';
                                } else if (isParsingAction) {
                                    actionBlockBuffer += token;
                                } else {
                                    assistantMessage += token;
                                }

                                // Update UI for text content (actions update at the end or on tag close)
                                if (!isParsingAction) {
                                    setMessages(prev => {
                                        const newMsgs = [...prev];
                                        newMsgs[newMsgs.length - 1].content = assistantMessage;
                                        return newMsgs;
                                    });
                                }
                            }
                        } catch (e) {
                            // Ignore parse errors
                        }
                    }
                }
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (msgIndex: number, action: ActionBlock) => {
        try {
            if (action.type === 'accommodation') {
                await overrides.create({
                    overrideType: action.payload.overrideType,
                    description: action.payload.description,
                    constraints: action.payload.constraints
                });
                queryClient.invalidateQueries({ queryKey: ['overrides'] });
                toast.success('Accommodation applied!');
            }
            else if (action.type === 'liturgy') {
                const settingKey = action.payload.setting; // e.g., 'catechism_source'
                await liturgy.updateSettings({
                    [settingKey]: action.payload.value
                });
                queryClient.invalidateQueries({ queryKey: ['liturgy'] });
                toast.success('Liturgy updated!');
            }
            else if (action.type === 'rhythm') {
                await rhythm.readjust(action.payload.instruction);
                queryClient.invalidateQueries({ queryKey: ['weekly-plan'] });
                queryClient.invalidateQueries({ queryKey: ['family-today'] });
                toast.success('Schedule adjusted!');
            }
            else if (action.type === 'regenerate') {
                await weeklyPlan.regenerate(action.payload);
                queryClient.invalidateQueries({ queryKey: ['weekly-plan'] });
                queryClient.invalidateQueries({ queryKey: ['family-today'] });
                toast.success('Plan regenerated!');
            }

            // Mark completed
            setMessages(prev => {
                const newMsgs = [...prev];
                if (newMsgs[msgIndex].action) {
                    newMsgs[msgIndex].action!.status = 'completed';
                }
                return newMsgs;
            });

        } catch (e: any) {
            toast.error('Action failed', { description: e.message });
            setMessages(prev => {
                const newMsgs = [...prev];
                if (newMsgs[msgIndex].action) {
                    newMsgs[msgIndex].action!.status = 'failed';
                }
                return newMsgs;
            });
        }
    };

    const renderActionCard = (msg: Message, index: number) => {
        if (!msg.action) return null;

        const { type, payload, status } = msg.action;
        const isCompleted = status === 'completed';
        const isFailed = status === 'failed';

        return (
            <div className="mt-3 bg-background border rounded-lg p-3 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-full bg-muted",
                        type === 'accommodation' && "bg-purple-100 text-purple-600",
                        type === 'liturgy' && "bg-amber-100 text-amber-600",
                        type === 'rhythm' && "bg-blue-100 text-blue-600",
                        type === 'regenerate' && "bg-green-100 text-green-600",
                    )}>
                        {type === 'accommodation' && <Funnel weight="duotone" className="w-5 h-5" />}
                        {type === 'liturgy' && <Sparkle weight="duotone" className="w-5 h-5" />}
                        {type === 'rhythm' && <Clock weight="duotone" className="w-5 h-5" />}
                        {type === 'regenerate' && <ArrowsClockwise weight="duotone" className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold mb-1">
                            {type === 'accommodation' && "Suggested Accommodation"}
                            {type === 'liturgy' && "Update Liturgy"}
                            {type === 'rhythm' && "Adjust Schedule"}
                            {type === 'regenerate' && "Regenerate Plan"}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-3">
                            {type === 'accommodation' && payload.description}
                            {type === 'liturgy' && payload.label || `Set ${payload.setting} to ${payload.value}`}
                            {type === 'rhythm' && payload.instruction}
                            {type === 'regenerate' && `Switch to ${payload.balancePreference} balance`}
                        </p>

                        {isCompleted ? (
                            <Button size="sm" variant="outline" className="w-full text-green-600 border-green-200 bg-green-50" disabled>
                                <CheckCircle className="w-4 h-4 mr-2" weight="fill" />
                                Applied
                            </Button>
                        ) : isFailed ? (
                            <Button size="sm" variant="outline" className="w-full text-red-600 border-red-200 bg-red-50" onClick={() => handleAction(index, msg.action!)}>
                                <WarningCircle className="w-4 h-4 mr-2" weight="fill" />
                                Retry
                            </Button>
                        ) : (
                            <Button size="sm" className="w-full" onClick={() => handleAction(index, msg.action!)}>
                                <Lightning className="w-4 h-4 mr-2" weight="fill" />
                                {type === 'accommodation' && "Apply Accommodation"}
                                {type === 'liturgy' && "Update Setting"}
                                {type === 'rhythm' && "Adjust Now"}
                                {type === 'regenerate' && "Generate New Plan"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full shadow-sm bg-indigo-50 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950 dark:border-indigo-800">
                    <Sparkle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" weight="fill" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[100vw] sm:w-[540px] flex flex-col p-0 h-[100dvh]">
                <SheetHeader className="p-4 border-b bg-muted/20">
                    <SheetTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                        <Sparkle className="w-5 h-5" weight="fill" />
                        Pedagogical Coach
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50" ref={scrollRef}>
                    {messages.map((m, i) => (
                        <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={cn(
                                "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                                m.role === 'user'
                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                    : "bg-white dark:bg-muted border rounded-bl-none"
                            )}>
                                {m.content}
                            </div>
                            {renderActionCard(m, i)}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-muted px-4 py-2 rounded-full text-xs text-muted-foreground animate-pulse flex items-center gap-2">
                                <ChatCircleDots className="w-4 h-4 animate-bounce" /> Thinking...
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t mt-auto bg-background">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask about lessons, habits, or routine..."
                            disabled={isLoading}
                            className="rounded-full"
                        />
                        <Button type="submit" size="icon" disabled={isLoading} className="rounded-full shrink-0">
                            <PaperPlaneRight className="w-4 h-4" weight="fill" />
                        </Button>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
