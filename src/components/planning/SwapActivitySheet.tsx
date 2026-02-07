import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowsClockwise, Check, Clock, Sparkle } from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SwapActivitySheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activityId: string | null;
    activityTitle?: string;
    day: string; // Day of week (e.g., "Thu")
    weekStart: string; // ISO date of week start
    onSwapComplete?: (newActivity: any) => void;
}

const DOMAIN_COLORS: Record<string, string> = {
    // Legacy domain support
    motor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    language: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    cognitive: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'social-emotional': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'pre-academic': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    // New virtue-based keys
    'Wisdom': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'Stewardship': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Love': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    'Order': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'Wonder': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
};

export function SwapActivitySheet({
    open,
    onOpenChange,
    activityId,
    activityTitle,
    day,
    weekStart,
    onSwapComplete,
}: SwapActivitySheetProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Fetch alternatives
    const { data, isLoading, error } = useQuery({
        queryKey: ['swap-alternatives', activityId],
        queryFn: async () => {
            // First get alternatives (this endpoint returns one, but we'll call it multiple times or modify backend)
            // For now, simulate multiple alternatives by calling swap endpoint
            if (!activityId) throw new Error('Activity ID is required');
            const res = await api.family.swapActivity({ activityId });
            return res;
        },
        enabled: open && !!activityId,
        staleTime: 30000, // 30 seconds
    });

    // Mutation to persist the swap
    const swapMutation = useMutation({
        mutationFn: async (newActivityId: string) => {
            // Call the swap endpoint with persistence
            return api.family.swapAndPersist({
                oldActivityId: activityId,
                newActivityId,
                day,
                weekStart,
            });
        },
        onSuccess: (data) => {
            toast.success('Activity swapped!', {
                description: `Changed to "${data.newActivity?.title || 'new activity'}"`,
            });
            queryClient.invalidateQueries({ queryKey: ['family-today'] });
            queryClient.invalidateQueries({ queryKey: ['family-day'] });
            queryClient.invalidateQueries({ queryKey: ['weekly-plan'] });
            onSwapComplete?.(data.newActivity);
            onOpenChange(false);
            setSelectedId(null);
        },
        onError: (err: any) => {
            toast.error('Failed to swap activity', { description: err.message });
        },
    });

    const handleConfirmSwap = () => {
        if (selectedId) {
            swapMutation.mutate(selectedId);
        }
    };

    // Get the alternative from the API response
    const alternative = data?.session;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-2xl">
                <SheetHeader className="text-left pb-4">
                    <SheetTitle className="flex items-center gap-2">
                        <ArrowsClockwise className="w-5 h-5 text-primary" />
                        Swap Activity
                    </SheetTitle>
                    <SheetDescription>
                        {activityTitle
                            ? `Choose an alternative to "${activityTitle}"`
                            : 'Choose an alternative activity'}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-3 pb-6">
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-24 w-full rounded-lg" />
                            <Skeleton className="h-24 w-full rounded-lg" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>Couldn't find alternatives. Try again later.</p>
                        </div>
                    ) : alternative ? (
                        <>
                            {/* Alternative Card */}
                            <button
                                onClick={() => setSelectedId(alternative.activity.id)}
                                className={cn(
                                    'w-full text-left p-4 rounded-xl border-2 transition-all',
                                    'hover:border-primary/50 hover:bg-primary/5',
                                    selectedId === alternative.activity.id
                                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                        : 'border-border bg-card'
                                )}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-sm truncate">
                                                {alternative.activity.title}
                                            </h4>
                                            {selectedId === alternative.activity.id && (
                                                <Check
                                                    weight="bold"
                                                    className="w-4 h-4 text-primary flex-shrink-0"
                                                />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                            {alternative.activity.description}
                                        </p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    'text-[10px] px-1.5 h-5',
                                                    DOMAIN_COLORS[alternative.activity.domain || 'Wonder'] || ''
                                                )}
                                            >
                                                {alternative.activity.domain}
                                            </Badge>
                                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                {alternative.activity.duration_minutes || 15}m
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* AI reasoning */}
                                {alternative.reasoning && (
                                    <div className="mt-3 p-2 rounded-md bg-primary/5 border border-primary/10">
                                        <div className="flex items-start gap-1.5">
                                            <Sparkle className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                {alternative.reasoning}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </button>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        onOpenChange(false);
                                        setSelectedId(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    disabled={!selectedId || swapMutation.isPending}
                                    onClick={handleConfirmSwap}
                                >
                                    {swapMutation.isPending ? 'Swapping...' : 'Confirm Swap'}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No alternative activities available for this time slot.</p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
