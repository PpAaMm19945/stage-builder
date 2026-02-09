import { useState, useEffect } from 'react';
import { CircleNotch } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface ThinkingMessageProps {
    text: string;
    steps?: Array<{
        id: number;
        label: string;
        status: 'pending' | 'active' | 'complete' | 'error';
    }>;
    className?: string;
}

/**
 * Displays a thinking/loading indicator with stage text, elapsed timer, and optional steps.
 */
export function ThinkingMessage({ text, steps, className }: ThinkingMessageProps) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const start = Date.now();
        const interval = setInterval(() => {
            setElapsed((Date.now() - start) / 1000);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    if (steps && steps.length > 0) {
        return (
            <div
                className={cn("flex justify-start", className)}
                role="status"
                aria-live="polite"
            >
                <div className="bg-muted/50 rounded-2xl px-4 py-3 max-w-[80%]">
                    <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                        <CircleNotch className="w-3 h-3 animate-spin text-primary" />
                        <span>{elapsed.toFixed(1)}s</span>
                    </div>
                    <ExecutionSteps steps={steps} />
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex justify-start",
                className
            )}
            role="status"
            aria-live="polite"
        >
            <div className="bg-muted rounded-2xl px-4 py-2 flex items-center gap-2 max-w-[80%]">
                <CircleNotch className="w-4 h-4 animate-spin text-primary shrink-0" />
                <span className="text-sm text-muted-foreground animate-pulse">
                    {text}
                </span>
                <span className="text-xs text-muted-foreground/60 tabular-nums">
                    {elapsed.toFixed(1)}s
                </span>
            </div>
        </div>
    );
}

interface ExecutionStepsProps {
    steps: Array<{
        id: number;
        label: string;
        status: 'pending' | 'active' | 'complete' | 'error';
    }>;
    className?: string;
}

/**
 * Displays action execution steps with status indicators.
 */
export function ExecutionSteps({ steps, className }: ExecutionStepsProps) {
    return (
        <div className={cn("space-y-2", className)}>
            {steps.map((step) => (
                <div key={step.id} className="flex items-center gap-2 text-sm">
                    {step.status === 'pending' && (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                    )}
                    {step.status === 'active' && (
                        <CircleNotch className="w-4 h-4 animate-spin text-primary" />
                    )}
                    {step.status === 'complete' && (
                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                    {step.status === 'error' && (
                        <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    )}
                    <span className={cn(
                        step.status === 'complete' && "text-muted-foreground",
                        step.status === 'error' && "text-red-500",
                        step.status === 'active' && "font-medium"
                    )}>
                        {step.label}
                    </span>
                </div>
            ))}
        </div>
    );
}
