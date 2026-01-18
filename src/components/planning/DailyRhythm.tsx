import { useState, useCallback } from 'react';
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
import { BookOpen } from '@phosphor-icons/react';
import { DailyLiturgy } from '@/components/liturgy/DailyLiturgy';
import { ActivityDetails } from '@/components/early-years/ActivityDetails';
import { RhythmItemRow, getIcon, getTypeColor } from './RhythmItemRow';

export interface RhythmItem {
    id: string;
    timeSlot: string; // "08:00", "Morning", etc.
    title: string;
    description?: string;
    type: 'liturgy' | 'activity' | 'book' | 'meal' | 'outdoor' | 'rest' | 'learning' | 'section_header';
    status: 'upcoming' | 'current' | 'completed';
    data?: any; // The full object (Activity, Book, etc.)
}

interface DailyRhythmProps {
    items?: RhythmItem[];
    onComplete?: (item: RhythmItem) => void;
    onBookClick?: () => void;
    onSwap?: (item: RhythmItem) => void;
}

export function DailyRhythm({ items = [], onComplete, onBookClick, onSwap }: DailyRhythmProps) {
    const [activeItem, setActiveItem] = useState<RhythmItem | null>(null);

    const timelineItems = items.length > 0 ? items : [];

    if (timelineItems.length === 0) {
        return (
            <Card className="p-6 text-center text-muted-foreground border-dashed">
                <p>No rhythm items scheduled for today.</p>
            </Card>
        );
    }

    const handleSelect = useCallback((item: RhythmItem) => {
        if (item.type !== 'section_header') {
            setActiveItem(item);
        }
    }, []);

    const handleSheetComplete = () => {
        if (activeItem && onComplete) {
            onComplete(activeItem);
            setActiveItem(null);
        }
    };

    return (
        <div className="space-y-4 relative">
            <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-border/50 -z-10" />

            {timelineItems.map((item) => (
                <RhythmItemRow
                    key={item.id}
                    item={item}
                    onSelect={handleSelect}
                    onComplete={onComplete}
                    onSwap={onSwap}
                />
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
                            {/* Section Header (should usually not be clickable to open sheet, but handled safely) */}
                            {activeItem?.type === 'section_header' && (
                                <div className="py-4 text-center">
                                    <h3 className="font-display text-lg font-bold">{activeItem.title}</h3>
                                </div>
                            )}

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
                                    <Button onClick={handleSheetComplete}>Mark Complete</Button>
                                </div>
                            )}

                            {activeItem?.type === 'book' && activeItem.data && (
                                <div className="space-y-4 text-center py-8">
                                    <div className="mx-auto w-32 h-44 bg-muted rounded shadow-sm flex items-center justify-center">
                                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-display">{activeItem.data.title}</h3>
                                    <p className="text-muted-foreground">Grab the book and read together!</p>
                                    <div className="flex flex-col gap-2">
                                        {onBookClick && (
                                            <Button onClick={() => {
                                                setActiveItem(null);
                                                onBookClick();
                                            }} size="lg" className="w-full">
                                                Read Now
                                            </Button>
                                        )}
                                        <Button onClick={handleSheetComplete} variant={onBookClick ? "outline" : "default"} size="lg" className="w-full">
                                            Mark as Read (Manual)
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Fallback */}
                            {!['liturgy', 'activity', 'book'].includes(activeItem?.type || '') && (
                                <div className="py-12 text-center space-y-4">
                                    <p>Details for this item are simple.</p>
                                    <Button onClick={handleSheetComplete}>Mark Complete</Button>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </div>
    );
}
