
import { Card, CardContent } from '@/components/ui/card';
import { Sun, Moon, Clock, CheckCircle, Circle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { ScheduleItemResult } from '@/types/ChatTypes';

interface ScheduleCardMessageProps {
    items: ScheduleItemResult[];
    className?: string;
}

/**
 * Displays schedule items grouped by period (Morning/Evening).
 */
export function ScheduleCardMessage({ items, className }: ScheduleCardMessageProps) {
    if (items.length === 0) {
        return (
            <div className={cn("text-sm text-muted-foreground italic", className)}>
                No schedule items found for today.
            </div>
        );
    }

    const morningItems = items.filter(i => i.metadata?.period === 'morning');
    const eveningItems = items.filter(i => i.metadata?.period === 'evening');
    const otherItems = items.filter(i => !i.metadata?.period);

    const renderSection = (title: string, sectionItems: ScheduleItemResult[], icon: React.ReactNode) => {
        if (sectionItems.length === 0) return null;
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground p-1">
                    {icon}
                    {title}
                </div>
                {sectionItems.map(item => (
                    <Card key={item.id} className="border-l-4 border-l-primary/50">
                        <CardContent className="p-3">
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <p className="font-medium text-sm">{item.title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{item.description || 'No description available.'}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    {item.metadata?.duration && (
                                        <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {item.metadata.duration}m
                                        </div>
                                    )}
                                    <div className="mt-1">
                                        {item.metadata?.status === 'completed' ? (
                                            <CheckCircle className="w-4 h-4 text-green-500 ml-auto" weight="fill" />
                                        ) : (
                                            <Circle className="w-4 h-4 text-muted-foreground/30 ml-auto" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className={cn("space-y-4", className)}>
            {renderSection('Morning', morningItems, <Sun className="w-4 h-4" />)}
            {renderSection('Evening', eveningItems, <Moon className="w-4 h-4" />)}
            {renderSection('Other', otherItems, <Circle className="w-4 h-4" />)}
        </div>
    );
}
