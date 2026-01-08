import { useState, useRef, useEffect } from 'react';
import { PaperPlaneRight, Sparkle, ChatCircleDots, Lightning, Sliders, CheckCircle, WarningCircle, Funnel, Clock, ArrowsClockwise, Lightbulb, UsersThree, ClipboardText } from '@phosphor-icons/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ai, overrides, liturgy, rhythm, weeklyPlan, family, formation } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    action?: ActionBlock;
}

interface ActionBlock {
    type: 'accommodation' | 'liturgy' | 'rhythm' | 'regenerate' | 'chat_options' | 'plan_feedback' | 'clarify';
    payload: any;
    status?: 'pending' | 'completed' | 'failed';
}

export function SchoolOSChat() {
    const { user, children } = useAuth();
    const queryClient = useQueryClient();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi! I'm your SchoolOS Assistant. How can I help with your family's formation rhythm today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch context for triggers
    const { data: todayData } = useQuery({
        queryKey: ['family-today'],
        queryFn: family.getToday,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    // Fetch formation preferences for conditional triggers
    const { data: formationPrefs } = useQuery({
        queryKey: ['formation-preferences'],
        queryFn: formation.getPreferences,
        staleTime: 1000 * 60 * 5
    });

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Context Triggers: Proactively message the user based on time/state and formation preferences
    useEffect(() => {
        if (!todayData || !formationPrefs) return;

        const now = new Date();
        const hour = now.getHours();
        const hasMessagedKey = `coach-trigger-${now.toDateString()}`;
        if (sessionStorage.getItem(hasMessagedKey)) return;

        // Morning Trigger (6am - 10am): Based on enabled streams
        if (hour >= 6 && hour < 10) {
            let morningMessage = "Good morning! ☀️ ";
            let morningOptions: string[] = [];

            if (formationPrefs.liturgyEnabled) {
                morningMessage += "Ready to start the day with Morning Liturgy?";
                morningOptions = ['Start Liturgy', 'Not yet'];
            } else if (formationPrefs.activitiesEnabled) {
                morningMessage += "Ready to see today's activities?";
                morningOptions = ['Show Today', 'Maybe later'];
            } else if (formationPrefs.readingEnabled) {
                morningMessage += "A great day for reading together!";
                morningOptions = ['Find a Book', 'Maybe later'];
            } else {
                // No streams enabled, skip trigger
                return;
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: morningMessage,
                action: {
                    type: 'chat_options',
                    payload: { options: morningOptions },
                    status: 'pending'
                }
            }]);
            sessionStorage.setItem(hasMessagedKey, 'morning');
        }
        // Evening Trigger (6pm - 9pm): Review based on enabled streams
        else if (hour >= 18 && hour < 21) {
            const eveningOptions: string[] = ['Went great!'];

            if (formationPrefs.readingEnabled) {
                eveningOptions.push('Read something nice');
            }
            if (formationPrefs.activitiesEnabled) {
                eveningOptions.push('Missed some activities');
            }
            eveningOptions.push('Review Plan');

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Winding down for the day? 🌙 How did your formation rhythm go?",
                action: {
                    type: 'chat_options',
                    payload: { options: eveningOptions },
                    status: 'pending'
                }
            }]);
            sessionStorage.setItem(hasMessagedKey, 'evening');
        }
    }, [todayData, formationPrefs]);

    const sendMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: messageText }]);
        setIsLoading(true);

        try {
            const stream = await ai.chat(messageText, {
                children: children?.map((c: any) => ({ name: c.name, age: c.ageInMonths })),
                user: user?.name,
                currentPage: window.location.pathname
            });

            if (!stream) throw new Error("No stream returned");

            const reader = stream.getReader();
            const decoder = new TextDecoder();

            // We'll accumulate the entire raw response here to robustly regex match across chunk boundaries
            let fullResponseBuffer = '';

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
                                fullResponseBuffer += token;

                                // Primary regex: <ACTION_BLOCK>...</ACTION_BLOCK>
                                // Fallback regex: ACTION_BLOCK{...} (LLM sometimes forgets angle brackets)
                                const primaryRegex = /<ACTION_BLOCK>([\s\S]*?)<\/ACTION_BLOCK>/;
                                const fallbackRegex = /ACTION_BLOCK\s*(\{[\s\S]*?\})/;

                                let match = fullResponseBuffer.match(primaryRegex);
                                let matchIndex = match?.index ?? -1;
                                let jsonContent = match?.[1];

                                // Try fallback if primary didn't match
                                if (!match) {
                                    const fallbackMatch = fullResponseBuffer.match(fallbackRegex);
                                    if (fallbackMatch) {
                                        match = fallbackMatch as RegExpMatchArray;
                                        matchIndex = fallbackMatch.index ?? -1;
                                        jsonContent = fallbackMatch[1];
                                    }
                                }

                                let displayText = fullResponseBuffer;
                                let pendingAction: ActionBlock | undefined;

                                if (match && jsonContent) {
                                    // Found a complete block. Text is everything BEFORE the block.
                                    displayText = fullResponseBuffer.substring(0, matchIndex).trim();

                                    try {
                                        const action = JSON.parse(jsonContent);
                                        pendingAction = { ...action, status: 'pending' };
                                    } catch (e) {
                                        console.error("JSON Parse Error in Action Block", e, jsonContent);
                                    }
                                } else {
                                    // Check for partial open tag to hide it from UI
                                    const openTagIndex = fullResponseBuffer.indexOf('<ACTION_BLOCK');
                                    const fallbackTagIndex = fullResponseBuffer.indexOf('ACTION_BLOCK');
                                    const hideIndex = openTagIndex !== -1 ? openTagIndex : fallbackTagIndex;
                                    if (hideIndex !== -1) {
                                        displayText = fullResponseBuffer.substring(0, hideIndex).trim();
                                    }
                                }

                                setMessages(prev => {
                                    const newMsgs = [...prev];
                                    const lastMsg = newMsgs[newMsgs.length - 1];
                                    lastMsg.content = displayText;
                                    if (pendingAction) {
                                        lastMsg.action = pendingAction;
                                        // Once we found an action, we stop updating content based on buffer 
                                        // (assuming action is at the end as per prompt instructions)
                                    }
                                    return newMsgs;
                                });
                            }
                        } catch (e) { }
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

    // Auto-execute plan_feedback
    useEffect(() => {
        const lastMsgIndex = messages.length - 1;
        const lastMsg = messages[lastMsgIndex];
        if (lastMsg?.role === 'assistant' && lastMsg.action?.type === 'plan_feedback' && lastMsg.action.status === 'pending') {
            handleAction(lastMsgIndex, lastMsg.action);
        }
    }, [messages.length, messages[messages.length - 1]?.action?.type]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await sendMessage(input);
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
                const settingKey = action.payload.setting;
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

                // Add follow-up message offering analysis
                setMessages(prev => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: "Plan regenerated! Would you like me to analyze how it will impact your family?",
                        action: {
                            type: 'chat_options',
                            payload: { options: ['Analyze Plan', 'No thanks'] },
                            status: 'pending' // chat_options doesn't really have pending state but consistent
                        }
                    }
                ]);

                toast.success('Plan regenerated!');
            }
            else if (action.type === 'plan_feedback') {
                // Fetch the current plan and children to generate insights

                // Fetch current plan
                const weekStartStr = format(getSmartWeekStart(), 'yyyy-MM-dd');
                const planData = await weeklyPlan.get(weekStartStr);

                // Fetch children
                // Using a hack to get children if not available in context, but they should be.
                // Ideally we use the context `children` but it's not async.
                // We can use the students API directly if needed.

                const studentsData = await import('@/lib/api').then(m => m.students.list());

                if (planData?.plan && studentsData) {
                    const insights = await weeklyPlan.getStrategicInsights(planData.plan, studentsData);

                    // Update the action payload with insights
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        if (newMsgs[msgIndex].action) {
                            newMsgs[msgIndex].action!.payload = insights;
                            newMsgs[msgIndex].action!.status = 'completed';
                        }
                        return newMsgs;
                    });
                    return; // Skip the generic completed set at bottom
                } else {
                    throw new Error("Could not retrieve plan or children data.");
                }
            }
            else if (action.type === 'chat_options') {
                // Handled in renderActionCard mainly
            }

            // Mark completed for non-special cases
            setMessages(prev => {
                const newMsgs = [...prev];
                if (newMsgs[msgIndex].action && action.type !== 'chat_options') {
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

    // Helper for smart week start (duplicated from Planner for now, or imported if moved to utils)
    function getSmartWeekStart(date = new Date()) {
        const day = date.getDay();
        const d = new Date(date);
        // If Saturday (6) or Sunday (0), target NEXT Monday
        if (day === 0 || day === 6) {
            const daysUntilMonday = day === 0 ? 1 : 2;
            d.setDate(d.getDate() + daysUntilMonday);
        } else {
            // Mon-Fri: target THIS Monday
            d.setDate(d.getDate() - (day - 1));
        }
        d.setHours(0, 0, 0, 0);
        return d;
    }

    const renderActionCard = (msg: Message, index: number) => {
        if (!msg.action) return null;

        const { type, payload, status } = msg.action;
        const isCompleted = status === 'completed';
        const isFailed = status === 'failed';

        if (type === 'chat_options') {
            return (
                <div className="mt-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
                    {payload.options?.map((option: string, i: number) => (
                        <Button
                            key={i}
                            variant="secondary"
                            size="sm"
                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-full"
                            onClick={() => sendMessage(option)}
                        >
                            {option}
                        </Button>
                    ))}
                </div>
            );
        }

        // Clarifying questions (Lovable-style)
        if (type === 'clarify') {
            return (
                <div className="mt-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-3">
                        {payload.question || 'I want to make sure I understand. What would you like to do?'}
                    </p>
                    <div className="space-y-2">
                        {payload.options?.map((opt: { label: string; value: string } | string, i: number) => {
                            const label = typeof opt === 'string' ? opt : opt.label;
                            const value = typeof opt === 'string' ? opt : opt.value;
                            return (
                                <Button
                                    key={i}
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start text-left bg-white dark:bg-background hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700"
                                    onClick={() => sendMessage(value)}
                                >
                                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 text-xs flex items-center justify-center mr-2 shrink-0">
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    {label}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            );
        }

        if (type === 'plan_feedback') {
            if (status === 'pending') {
                return (
                    <div className="mt-3 bg-background border rounded-lg p-3 shadow-sm animate-pulse">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Sparkle className="w-4 h-4 animate-spin" />
                            Analyzing your plan...
                        </div>
                    </div>
                );
            }

            if (isFailed) {
                return (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm flex items-center gap-2">
                        <WarningCircle className="w-4 h-4" />
                        Failed to load analysis.
                        <Button variant="link" size="sm" onClick={() => handleAction(index, msg.action!)}>Retry</Button>
                    </div>
                );
            }

            // Render the insights
            return (
                <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-2 w-full">
                    {payload.childInsights?.map((insight: any, i: number) => (
                        <div key={`child-${i}`} className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-3">
                            <h5 className="font-semibold text-xs text-indigo-800 dark:text-indigo-300 mb-1 flex items-center gap-1">
                                <Lightbulb className="w-3 h-3" />
                                {insight.childId || "Child Insight"}
                            </h5>
                            <p className="text-sm text-indigo-900 dark:text-indigo-100">{insight.insight}</p>
                        </div>
                    ))}

                    {payload.familyBalanceTips?.length > 0 && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg p-3">
                            <h5 className="font-semibold text-xs text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1">
                                <UsersThree className="w-3 h-3" />
                                Family Balance
                            </h5>
                            <ul className="space-y-1">
                                {payload.familyBalanceTips.map((tip: string, i: number) => (
                                    <li key={`fam-${i}`} className="text-sm text-emerald-900 dark:text-emerald-100 flex items-start gap-2">
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {payload.prepNotes?.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-3">
                            <h5 className="font-semibold text-xs text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1">
                                <ClipboardText className="w-3 h-3" />
                                Prep Notes
                            </h5>
                            <ul className="space-y-1">
                                {payload.prepNotes.map((note: string, i: number) => (
                                    <li key={`prep-${i}`} className="text-sm text-amber-900 dark:text-amber-100 flex items-start gap-2">
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                                        {note}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            );
        }

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
                            {type === 'accommodation' && (payload.description || 'Apply accommodation')}
                            {type === 'liturgy' && (payload.label || `Update ${payload.setting || 'setting'} to ${payload.value || 'new value'}`)}
                            {type === 'rhythm' && (payload.instruction || payload.description || 'Adjust your schedule')}
                            {type === 'regenerate' && `Switch to ${payload.balancePreference || 'updated'} balance`}
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
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full shadow-sm bg-indigo-50 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950 dark:border-indigo-800"
                                data-testid="coach-chat-trigger"
                                aria-label="Open SchoolOS Assistant"
                            >
                                <Sparkle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" weight="fill" />
                            </Button>
                        </SheetTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>Open Assistant</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <SheetContent className="w-[100vw] sm:w-[540px] flex flex-col p-0 h-[100dvh]">
                <SheetHeader className="p-4 border-b bg-muted/20">
                    <SheetTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                        <Sparkle className="w-5 h-5" weight="fill" />
                        SchoolOS Assistant
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
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading}
                            className="rounded-full shrink-0"
                            aria-label="Send message"
                        >
                            <PaperPlaneRight className="w-4 h-4" weight="fill" />
                        </Button>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
