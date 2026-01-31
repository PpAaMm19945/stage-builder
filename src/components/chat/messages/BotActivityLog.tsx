import { CircleNotch, Check, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { ExecutionStep } from '../hooks/useChatState';

interface BotActivityLogProps {
    steps: ExecutionStep[];
    className?: string;
}

export function BotActivityLog({ steps, className }: BotActivityLogProps) {
    if (!steps || steps.length === 0) return null;

    return (
        <div className={cn("space-y-2 mt-2 pl-1", className)}>
            {steps.map((step) => (
                <div key={step.id} className="flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-300">
                    {step.status === 'pending' && (
                        <div className="w-3 h-3 rounded-full border border-muted-foreground/30" />
                    )}
                    {step.status === 'active' && (
                        <CircleNotch className="w-3 h-3 animate-spin text-primary" />
                    )}
                    {step.status === 'complete' && (
                        <Check className="w-3 h-3 text-green-500" />
                    )}
                    {step.status === 'error' && (
                        <X className="w-3 h-3 text-red-500" />
                    )}
                    <span className={cn(
                        step.status === 'active' && "text-foreground font-medium",
                        step.status === 'error' && "text-red-500"
                    )}>
                        {step.label}
                    </span>
                </div>
            ))}
        </div>
    );
}
