import { useState, useEffect } from 'react';
import { CircleNotch, Check, X, CaretDown, CaretRight, Sparkle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { ExecutionStep } from '../hooks/useChatState';
import { Button } from '@/components/ui/button';

interface BotActivityLogProps {
    steps: ExecutionStep[];
    className?: string;
}

export function BotActivityLog({ steps, className }: BotActivityLogProps) {
    const [isOpen, setIsOpen] = useState(true);
    const hasActive = steps.some(s => s.status === 'active' || s.status === 'pending');
    const hasError = steps.some(s => s.status === 'error');

    // Auto-collapse when done, auto-expand on error or active
    useEffect(() => {
        if (hasActive) setIsOpen(true);
        else if (hasError) setIsOpen(true);
        else setIsOpen(false); // Collapse when complete
    }, [hasActive, hasError, steps.length]);

    if (!steps || steps.length === 0) return null;

    return (
        <div className={cn("w-full max-w-xl mb-2", className)}>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-transparent p-0 flex items-center gap-1.5 mb-1"
            >
                {isOpen ? <CaretDown className="w-3 h-3" /> : <CaretRight className="w-3 h-3" />}
                {hasActive ? (
                    <span className="flex items-center gap-1.5 animate-pulse text-primary">
                        <Sparkle className="w-3 h-3" />
                        Thinking Process...
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-green-500" />
                        Processed {steps.length} steps
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="pl-2 border-l border-border/50 ml-1.5 space-y-2 py-1">
                    {steps.map((step) => (
                        <div key={step.id} className="flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-300">
                            {step.status === 'pending' && (
                                <div className="w-2.5 h-2.5 rounded-full border border-muted-foreground/30 shrink-0" />
                            )}
                            {step.status === 'active' && (
                                <CircleNotch className="w-2.5 h-2.5 animate-spin text-primary shrink-0" />
                            )}
                            {step.status === 'complete' && (
                                <Check className="w-2.5 h-2.5 text-green-500 shrink-0" />
                            )}
                            {step.status === 'error' && (
                                <X className="w-2.5 h-2.5 text-red-500 shrink-0" />
                            )}
                            <span className={cn(
                                "truncate",
                                step.status === 'active' && "text-foreground font-medium",
                                step.status === 'error' && "text-red-500"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
