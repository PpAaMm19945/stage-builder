import { useState, useEffect } from 'react';
import { Heart } from '@phosphor-icons/react';
import { feedback } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface UpvoteButtonProps {
    contentType: 'activity' | 'book';
    contentId: string;
    initialCount?: number;
    className?: string;
    variant?: 'minimal' | 'full';
}

export function UpvoteButton({
    contentType,
    contentId,
    initialCount = 0,
    className,
    variant = 'full'
}: UpvoteButtonProps) {
    const [upvoted, setUpvoted] = useState(false);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);

    // Check status on mount
    useEffect(() => {
        let mounted = true;
        feedback.checkUpvote(contentType, contentId)
            .then(res => {
                if (mounted) setUpvoted(res.upvoted);
            })
            .catch(() => { }); // Silent fail

        return () => { mounted = false; };
    }, [contentType, contentId]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (loading) return;

        // Optimistic update
        const previousState = upvoted;
        const previousCount = count;

        setUpvoted(!upvoted);
        setCount(prev => upvoted ? prev - 1 : prev + 1);

        try {
            setLoading(true);
            const res = await feedback.toggleUpvote(contentType, contentId);
            setUpvoted(res.upvoted);
            setCount(res.newCount);
        } catch (error) {
            // Revert on error
            setUpvoted(previousState);
            setCount(previousCount);
            toast.error('Failed to update vote');
        } finally {
            setLoading(false);
        }
    };

    if (variant === 'minimal') {
        return (
            <button
                onClick={handleToggle}
                className={cn(
                    "flex items-center gap-1.5 transition-colors",
                    upvoted ? "text-red-500" : "text-muted-foreground hover:text-red-500/80",
                    className
                )}
            >
                <Heart weight={upvoted ? "fill" : "regular"} className="h-4 w-4" />
                <span className="text-xs font-medium tabular-nums">{count}</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={cn(
                "group flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 border",
                upvoted
                    ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                    : "bg-transparent border-transparent hover:bg-secondary/50 text-muted-foreground",
                className
            )}
        >
            <div className={cn(
                "transition-transform duration-200",
                upvoted ? "scale-110" : "group-hover:scale-110"
            )}>
                <Heart
                    weight={upvoted ? "fill" : "regular"}
                    className={cn("h-5 w-5", upvoted && "animate-pulse-once")}
                />
            </div>
            {(count > 0 || upvoted) && (
                <span className="text-sm font-medium tabular-nums">
                    {count}
                </span>
            )}
        </button>
    );
}
