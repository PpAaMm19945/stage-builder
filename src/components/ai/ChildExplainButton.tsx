import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ai } from '@/lib/api';
import { Question, PaperPlaneRight, CircleNotch, Lightbulb, CaretRight } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface ChildExplainButtonProps {
    studentId: string;
    activityId?: string;
    activityTitle?: string;
    domain?: string;
    canAskAi: boolean;
}

/**
 * Child-facing AI explain button
 * - Simpler UI with larger touch targets
 * - Age-appropriate question suggestions
 * - All interactions are logged for parent visibility
 * - Only visible when canAskAi permission is enabled
 */
export function ChildExplainButton({
    studentId,
    activityId,
    activityTitle,
    domain,
    canAskAi,
}: ChildExplainButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Child-friendly question suggestions
    const suggestions = [
        "Can you help me understand this?",
        "Why do I need to learn this?",
        "Can you give me a hint?",
        "What should I do first?",
        "Can you explain it simpler?",
    ];

    const handleAsk = async (q: string) => {
        if (!q.trim()) return;

        setIsLoading(true);
        setQuestion(q);

        try {
            const context = {
                activityId,
                activityTitle,
                domain,
            };

            const result = await ai.childExplain(studentId, q, context);
            setAnswer(result.answer);
        } catch (err: any) {
            if (err.message?.includes('not permitted')) {
                toast.error("You can't use AI help right now", {
                    description: "Ask your parent for permission",
                });
            } else {
                toast.error("Something went wrong", {
                    description: "Ask your parent for help!",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setAnswer(null);
        setQuestion('');
    };

    // Don't render if AI access is not permitted
    if (!canAskAi) {
        return null;
    }

    return (
        <Popover open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) reset();
        }}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 h-12 px-6 text-base"
                >
                    <Lightbulb className="w-5 h-5 text-yellow-500" weight="fill" />
                    <span>Need Help?</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 md:w-96 p-0 overflow-hidden" align="center">
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 p-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm">
                            <Lightbulb className="w-6 h-6 text-yellow-500" weight="fill" />
                        </div>
                        <div>
                            <p className="font-semibold">Learning Helper</p>
                            <p className="text-xs text-muted-foreground">I'm here to help you understand!</p>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    {!answer ? (
                        <div className="space-y-4">
                            <p className="text-sm font-medium">What do you want to know?</p>

                            {/* Suggestion buttons - larger for children */}
                            <div className="space-y-2">
                                {suggestions.map((s) => (
                                    <button
                                        key={s}
                                        className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors flex items-center justify-between group"
                                        onClick={() => handleAsk(s)}
                                        disabled={isLoading}
                                    >
                                        <span className="text-sm">{s}</span>
                                        <CaretRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                    </button>
                                ))}
                            </div>

                            {/* Custom question input */}
                            <div className="flex gap-2">
                                <Input
                                    className="h-11"
                                    placeholder="Or ask your own question..."
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAsk(question)}
                                />
                                <Button
                                    size="icon"
                                    className="h-11 w-11 shrink-0"
                                    onClick={() => handleAsk(question)}
                                    disabled={isLoading || !question.trim()}
                                >
                                    {isLoading ? (
                                        <CircleNotch className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <PaperPlaneRight className="w-5 h-5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Question recap */}
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-xs font-semibold text-muted-foreground mb-1">You asked:</p>
                                <p className="text-sm">{question}</p>
                            </div>

                            {/* Answer */}
                            <ScrollArea className="h-[200px]">
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {answer}
                                </div>
                            </ScrollArea>

                            {/* Ask another question */}
                            <Button variant="outline" onClick={reset} className="w-full">
                                Ask Another Question
                            </Button>
                        </div>
                    )}

                    {/* Parent visibility notice */}
                    <p className="text-xs text-center text-muted-foreground mt-4">
                        💡 Your parent can see these conversations
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    );
}
