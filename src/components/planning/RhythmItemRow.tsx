import React, { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    HandsPraying,
    ArrowsClockwise
} from '@phosphor-icons/react';
import type { RhythmItem } from './DailyRhythm';

interface RhythmItemRowProps {
    item: RhythmItem;
    onSelect: (item: RhythmItem) => void;
    onComplete?: (item: RhythmItem) => void;
    onSwap?: (item: RhythmItem) => void;
}

export const getIcon = (type: RhythmItem['type']) => {
    switch (type) {
        case 'liturgy': return <HandsPraying weight="duotone" />;
        case 'activity': return <PersonSimpleRun weight="duotone" />;
        case 'book': return <BookOpen weight="duotone" />;
        case 'meal': return <ForkKnife weight="duotone" />;
        case 'outdoor': return <Sun weight="duotone" />;
        case 'rest': return <Bed weight="duotone" />;
        case 'section_header': return <Circle weight="duotone" />;
        default: return <Circle weight="duotone" />;
    }
};

export const getTypeColor = (type: RhythmItem['type']) => {
    switch (type) {
        case 'liturgy': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900';
        case 'activity': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900';
        case 'book': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900';
        case 'meal': return 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900';
        default: return 'text-gray-500 bg-gray-50';
    }
};

export const RhythmItemRow = memo(function RhythmItemRow({ item, onSelect, onComplete, onSwap }: RhythmItemRowProps) {
    const handleQuickComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onComplete && item.status !== 'completed') {
            onComplete(item);
        }
    }

    const handleSwap = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onSwap && item.type === 'activity' && item.status !== 'completed') {
            onSwap(item);
        }
    }

    return (
        <div
            className={cn("flex gap-4 group", item.type !== 'section_header' ? "cursor-pointer" : "")}
            onClick={() => item.type !== 'section_header' && onSelect(item)}
        >
            {item.type === 'section_header' ? (
                <div className="w-full py-4 flex items-center gap-4">
                    <div className="w-[54px] flex justify-center shrink-0">
                        <div className="h-2 w-2 rounded-full bg-primary/20" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-primary pt-1">{item.title}</h3>
                </div>
            ) : (
                <>
                    {/* Time Column */}
                    {item.timeSlot && (
                    <div className="w-[54px] flex flex-col items-center pt-1 shrink-0 bg-background z-0">
                        <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors relative",
                            getTypeColor(item.type),
                            item.status === 'completed' && "bg-muted text-muted-foreground border-muted"
                        )}>
                            {item.status === 'completed' ? (
                                <CheckCircle weight="fill" className="h-6 w-6 text-green-600 dark:text-green-500" />
                            ) : (
                                <>
                                    {getIcon(item.type)}
                                    {/* Hover checkmark for quick completion */}
                                    <div
                                        className="absolute inset-0 bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20"
                                        onClick={handleQuickComplete}
                                        title="Mark complete"
                                    >
                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    )}

                    {/* Content Card */}
                    <Card className={cn(
                        "flex-1 p-4 hover:shadow-md transition-all border-l-4",
                        item.status === 'completed' ? 'opacity-60 border-l-muted bg-muted/20' : 'border-l-primary',
                    )}>
                        {item.status === 'completed' && (
                            <div className="absolute top-2 right-2 text-green-600 dark:text-green-500">
                                <CheckCircle weight="fill" className="h-5 w-5" />
                            </div>
                        )}
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    {item.timeSlot && item.timeSlot !== 'Header' && (
                                        <span className="text-xs font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                            {item.timeSlot}
                                        </span>
                                    )}
                                    <h4 className={cn("font-semibold", item.status === 'completed' && "line-through decoration-slate-400")}>
                                        {item.title}
                                    </h4>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                {/* Swap button for activities */}
                                {onSwap && item.type === 'activity' && item.status !== 'completed' && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={handleSwap}
                                        title="Swap activity"
                                    >
                                        <ArrowsClockwise className="h-4 w-4" />
                                    </Button>
                                )}
                                <CaretRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
});
