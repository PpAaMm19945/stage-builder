import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ai } from '@/lib/api';
import { Question, PaperPlaneRight, CircleNotch, MagicWand, CaretRight, Student } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface ExplainButtonProps {
    activityId?: string;
    domain?: string;
    childAge?: number;
    triggerData?: {
        title?: string;
        description?: string;
    };
    variant?: 'icon' | 'button';
}

export function ExplainButton({ activityId, domain, childAge, triggerData, variant = 'icon' }: ExplainButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [sources, setSources] = useState<string[]>([]);

    // Default suggested questions based on context
    const suggestions = [
        "Why is this activity recommended?",
        "How does this help development?",
        "What if my child isn't interested?",
        "How can I make this easier?",
        "How can I make this harder?"
    ];

    const handleAsk = async (q: string) => {
        if (!q.trim()) return;

        setIsLoading(true);
        setQuestion(q);

        try {
            // In a real implementation, we'd pass the full context
            // leveraging the triggerData to make the prompt better immediately
            const context = {
                activityId,
                domain,
                childAge,
                activityTitle: triggerData?.title
            };

            const result = await ai.explain(q, context);
            setAnswer(result.answer);
            setSources(result.sources || []);
        } catch (err: any) {
            toast.error("Couldn't get explanation", { description: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setAnswer(null);
        setQuestion('');
        setSources([]);
    };

    return (
        <Popover open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) reset(); // Optional: reset on close? Maybe keep state.
        }}>
            <PopoverTrigger asChild>
                {variant === 'icon' ? (
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                        <Question className="w-4 h-4" />
                        <span className="sr-only">Ask AI Why</span>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" className="gap-2">
                        <MagicWand className="w-4 h-4" />
                        <span>Why this?</span>
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-80 md:w-96 p-0 overflow-hidden" align="start">
                <div className="bg-muted/50 p-3 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-full">
                            <MagicWand className="w-4 h-4 text-purple-600 dark:text-purple-400" weight="fill" />
                        </div>
                        <span className="font-semibold text-sm">Learning Intelligence</span>
                    </div>
                    {answer && (
                        <Button variant="ghost" size="sm" onClick={reset} className="h-6 text-xs text-muted-foreground">
                            New Question
                        </Button>
                    )}
                </div>

                <div className="p-4">
                    {!answer ? (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-foreground font-medium mb-2">Ask about this activity:</p>
                                <div className="space-y-2">
                                    {suggestions.map((s) => (
                                        <button
                                            key={s}
                                            className="w-full text-left text-xs p-2 rounded-md hover:bg-muted transition-colors flex items-center justify-between group"
                                            onClick={() => handleAsk(s)}
                                        >
                                            <span>{s}</span>
                                            <CaretRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    className="h-9 text-sm"
                                    placeholder="Or type your own question..."
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAsk(question)}
                                />
                                <Button size="icon" className="h-9 w-9 shrink-0" onClick={() => handleAsk(question)} disabled={isLoading || !question.trim()}>
                                    {isLoading ? <CircleNotch className="w-4 h-4 animate-spin" /> : <PaperPlaneRight className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-muted/30 rounded-lg p-3 text-sm">
                                <p className="font-semibold text-xs text-muted-foreground mb-1">YOU ASKED</p>
                                <p>{question}</p>
                            </div>

                            <ScrollArea className="h-[200px] pr-4">
                                <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                    {answer}
                                </div>
                                {sources.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <p className="text-xs font-semibold text-muted-foreground mb-2">SOURCES</p>
                                        <ul className="space-y-1">
                                            {sources.map((source, i) => (
                                                <li key={i} className="text-xs text-muted-foreground flex items-top gap-1.5">
                                                    <Student className="w-3 h-3 mt-0.5" />
                                                    <span className="truncate">{source}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
