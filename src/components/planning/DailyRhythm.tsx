import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
    Sun,
    BookOpen,
    PersonSimpleRun,
    ForkKnife,
    Bed,
    CheckCircle,
    Circle,
    CaretRight,
    HandsPraying
} from '@phosphor-icons/react';
import { DailyLiturgy } from '@/components/liturgy/DailyLiturgy';
import { ActivityDetails } from '@/components/early-years/ActivityDetails';

export interface RhythmItem {
    id: string;
    timeSlot: string; // "08:00", "Morning", etc.
    title: string;
    description?: string;
    type: 'liturgy' | 'activity' | 'book' | 'meal' | 'outdoor' | 'rest' | 'learning';
    status: 'upcoming' | 'current' | 'completed';
    data?: any; // The full object (Activity, Book, etc.)
}

interface DailyRhythmProps {
    items?: RhythmItem[];
    onComplete?: (item: RhythmItem) => void;
}

export function DailyRhythm({ items = [], onComplete }: DailyRhythmProps) {
    const [activeItem, setActiveItem] = useState<RhythmItem | null>(null);

    const timelineItems = items.length > 0 ? items : [];

    if (timelineItems.length === 0) {
        return (
            <Card className="p-6 text-center text-muted-foreground border-dashed">
                <p>No rhythm items scheduled for today.</p>
            </Card>
        );
    }

    const getIcon = (type: RhythmItem['type']) => {
        switch (type) {
            case 'liturgy': return <HandsPraying weight="duotone" />;
            case 'activity': return <PersonSimpleRun weight="duotone" />;
            case 'book': return <BookOpen weight="duotone" />;
            case 'meal': return <ForkKnife weight="duotone" />;
            case 'outdoor': return <Sun weight="duotone" />;
            case 'rest': return <Bed weight="duotone" />;
            default: return <Circle weight="duotone" />;
        }
    };

    const getTypeColor = (type: RhythmItem['type']) => {
        switch (type) {
            case 'liturgy': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900';
            case 'activity': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900';
            case 'book': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900';
            case 'meal': return 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    const handleComplete = () => {
        if (activeItem && onComplete) {
            onComplete(activeItem);
            setActiveItem(null);
        }
    };

    return (
        <div className="space-y-4 relative">
            <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-border/50 -z-10" />

            {timelineItems.map((item, index) => (
                <div
                    key={item.id}
                    className="flex gap-4 group cursor-pointer"
                    onClick={() => setActiveItem(item)}
                >
                    {/* Time Column */}
                    <div className="w-[54px] flex flex-col items-center pt-1 shrink-0 bg-background z-0">
                        <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors",
                            getTypeColor(item.type),
                            item.status === 'completed' && "bg-muted text-muted-foreground border-muted"
                        )}>
                            {item.status === 'completed' ? <CheckCircle weight="fill" className="h-6 w-6" /> : getIcon(item.type)}
                        </div>
                    </div>

                    {/* Content Card */}
                    <Card className={cn(
                        "flex-1 p-4 hover:shadow-md transition-all border-l-4",
                        item.status === 'completed' ? 'opacity-60 border-l-muted' : 'border-l-primary',
                    )}>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                        {item.timeSlot}
                                    </span>
                                    <h4 className={cn("font-semibold", item.status === 'completed' && "line-through decoration-slate-400")}>
                                        {item.title}
                                    </h4>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                            </div>
                            <CaretRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Card>
                </div>
            ))}

            <Sheet open={!!activeItem} onOpenChange={(open) => !open && setActiveItem(null)}>
                <SheetContent side="bottom" className="h-[95dvh] sm:h-[85vh] rounded-t-[20px] p-0 flex flex-col">
                    <SheetHeader className="px-6 pt-6 pb-2 shrink-0 text-left">
                        <SheetTitle className="flex items-center gap-2">
                            <div className={cn("p-1.5 rounded-full bg-muted/20", getTypeColor(activeItem?.type || 'activity'))}>
                                {activeItem && getIcon(activeItem.type)}
                            </div>
                            {activeItem?.title}
                        </SheetTitle>
                        <SheetDescription>{activeItem?.timeSlot} • {activeItem?.description}</SheetDescription>
                    </SheetHeader>

                    <ScrollArea className="flex-1 px-6">
                        <div className="pb-8 pt-2">
                            {/* Render Content Based on Type */}
                            {activeItem?.type === 'liturgy' && (
                                <DailyLiturgy embedded />
                            )}

                            {activeItem?.type === 'activity' && activeItem.data && (
                                <ActivityDetails
                                    activity={activeItem.data}
                                    onComplete={() => {
                                        if (onComplete) onComplete(activeItem);
                                        setActiveItem(null);
                                    }}
                                    hideActions={false}
                                />
                            )}

                            {activeItem?.type === 'activity' && !activeItem.data && (
                                <div className="py-12 text-center space-y-4">
                                    <p>Details not available.</p>
                                    <Button onClick={handleComplete}>Mark Complete</Button>
                                </div>
                            )}

                            {activeItem?.type === 'book' && activeItem.data && (
                                // Placeholder or BookReader logic
                                <div className="space-y-4 text-center py-8">
                                    <div className="mx-auto w-32 h-44 bg-muted rounded shadow-sm flex items-center justify-center">
                                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-display">{activeItem.data.title}</h3>
                                    <p className="text-muted-foreground">Grab the book and read together!</p>
                                    <Button onClick={handleComplete} size="lg" className="w-full">
                                        Mark as Read
                                    </Button>
                                    <Button variant="ghost" onClick={() => setActiveItem(null)}>Close</Button>
                                </div>
                            )}

                            {/* Fallback */}
                            {!['liturgy', 'activity', 'book'].includes(activeItem?.type || '') && (
                                <div className="py-12 text-center space-y-4">
                                    <p>Details for this item are simple.</p>
                                    <Button onClick={handleComplete}>Mark Complete</Button>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </div>
    );
}
