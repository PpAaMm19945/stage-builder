import { Card, CardContent } from '@/components/ui/card';
import { GameController } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { ActivitySearchResult } from '@/types/ChatTypes';

interface ActivityCardMessageProps {
    activities: ActivitySearchResult[];
    onSelectActivity?: (activity: ActivitySearchResult) => void;
    className?: string;
}

/**
 * Displays search results as activity cards.
 */
export function ActivityCardMessage({ activities, onSelectActivity, className }: ActivityCardMessageProps) {
    if (activities.length === 0) {
        return (
            <div className={cn("text-sm text-muted-foreground italic", className)}>
                No activities found matching your search.
            </div>
        );
    }

    return (
        <div className={cn("grid gap-2", className)}>
            {activities.map((activity) => (
                <Card
                    key={activity.id}
                    onClick={() => onSelectActivity?.(activity)}
                    className={cn(
                        "transition-all",
                        onSelectActivity && "cursor-pointer hover:shadow-md hover:border-primary/50 group"
                    )}
                >
                    <CardContent className="p-3 flex gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                            <GameController className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={cn(
                                "font-medium text-sm line-clamp-1",
                                onSelectActivity && "group-hover:text-primary transition-colors"
                            )}>
                                {activity.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {activity.description || 'No description available.'}
                            </p>
                            <div className="flex gap-1 mt-1 flex-wrap">
                                {activity.metadata?.domain && (
                                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                        {activity.metadata.domain}
                                    </span>
                                )}
                                {activity.metadata?.materials && (
                                    <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                                        {activity.metadata.materials}
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
