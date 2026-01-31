import { Heart, TrendUp, Info } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface FundingWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
    raised?: number;
    goal?: number;
    className?: string;
    variant?: 'compact' | 'full';
}

/**
 * FundingWidget - Transparent funding progress display
 * 
 * Shows community funding progress toward monthly goal
 * Designed to be non-intrusive but visible
 */
export function FundingWidget({
    raised = 0,
    goal = 500,
    className,
    variant = 'compact',
    ...props
}: FundingWidgetProps) {
    const navigate = useNavigate();
    const percentage = Math.min((raised / goal) * 100, 100);
    const remaining = Math.max(goal - raised, 0);

    if (variant === 'compact') {
        return (
            <div
                className={cn(
                    "rounded-lg border border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800 p-3 space-y-2",
                    className
                )}
                {...props}
            >
                <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-green-700 dark:text-green-300 font-medium">
                        <Heart className="h-3.5 w-3.5" weight="fill" />
                        Community Fund
                    </span>
                    <span className="text-muted-foreground">${raised} / ${goal}</span>
                </div>
                <Progress
                    value={percentage}
                    className="h-1.5 bg-green-100 dark:bg-green-900/30"
                    aria-label="Community fundraising progress"
                />
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 text-xs text-green-700 hover:text-green-800 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-900/30"
                    onClick={() => navigate('/support')}
                    aria-label="Contribute to SchoolOS"
                >
                    Contribute
                </Button>
            </div>
        );
    }

    // Full variant for dedicated support page
    return (
        <div
            className={cn(
                "rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/50",
                "dark:bg-gradient-to-br dark:from-green-900/20 dark:to-green-800/10 dark:border-green-800",
                "p-6 space-y-4",
                className
            )}
            {...props}
        >
            <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-green-600 dark:text-green-400" weight="fill" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg text-green-900 dark:text-green-100">
                        Help Keep SchoolOS Running
                    </h3>
                    <p className="text-sm text-green-700/70 dark:text-green-300/70">
                        Free for everyone, funded by families like yours
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-800 dark:text-green-200">
                        ${raised}
                    </span>
                    <span className="text-muted-foreground">of ${goal}/month</span>
                </div>
                <Progress
                    value={percentage}
                    className="h-3 bg-green-200 dark:bg-green-900/50"
                    aria-label="Community fundraising progress"
                />
                <p className="text-xs text-muted-foreground text-center">
                    {remaining > 0
                        ? `$${remaining} more needed this month`
                        : '🎉 Goal reached! Thank you!'
                    }
                </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
                <TooltipProvider>
                    {[1, 5, 10, 'Other'].map((amount) => (
                        <Tooltip key={amount}>
                            <TooltipTrigger asChild>
                                <div className="w-full">
                                    <Button
                                        variant="outline"
                                        disabled
                                        className="w-full bg-white dark:bg-green-900/20 border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/40 cursor-not-allowed opacity-50"
                                    >
                                        {typeof amount === 'number' ? `$${amount}` : amount}
                                    </Button>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Payment integration coming soon</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-white/50 dark:bg-black/20 rounded-lg p-3">
                <Info className="h-4 w-4 shrink-0 mt-0.5" weight="duotone" />
                <p>
                    $500/month covers storage for 10,000 families and 1,000+ books.
                    Every contribution helps keep learning free for African families.
                </p>
            </div>
        </div>
    );
}
