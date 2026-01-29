import { useState, useCallback, memo } from 'react';
import { Card } from '@/components/ui/card';
import { RhythmItemRow } from './RhythmItemRow';
import { RhythmDetailsSheet } from './RhythmDetailsSheet';

export interface RhythmItem {
    id: string;
    timeSlot: string; // "08:00", "Morning", etc.
    title: string;
    description?: string;
    type: 'liturgy' | 'activity' | 'book' | 'meal' | 'outdoor' | 'rest' | 'learning' | 'section_header' | 'path_item';
    status: 'upcoming' | 'current' | 'completed' | 'skipped' | 'transferred';
    data?: any; // The full object (Activity, Book, etc.)
    transferred_from?: string; // Date string if transferred
}

interface DailyRhythmProps {
    items?: RhythmItem[];
    activeItem?: RhythmItem | null;
    onSelectItem?: (item: RhythmItem | null) => void;
    onComplete?: (item: RhythmItem, duration?: number) => void;
    onBookClick?: () => void;
    onSwap?: (item: RhythmItem) => void;
    onLiturgyToggle?: (id: string, completed: boolean) => void;
    onLiturgyAdvance?: (type: string) => void;
}

export const DailyRhythm = memo(function DailyRhythm({
    items = [],
    activeItem: propActiveItem,
    onSelectItem: propOnSelectItem,
    onComplete,
    onBookClick,
    onSwap,
    onLiturgyToggle,
    onLiturgyAdvance
}: DailyRhythmProps) {
    // Internal state if not controlled
    const [internalActiveItem, setInternalActiveItem] = useState<RhythmItem | null>(null);

    // Derived state
    const activeItem = propActiveItem !== undefined ? propActiveItem : internalActiveItem;
    const setActiveItem = propOnSelectItem || setInternalActiveItem;

    const timelineItems = items.length > 0 ? items : [];

    const handleSelect = useCallback((item: RhythmItem) => {
        if (item.type !== 'section_header') {
            setActiveItem(item);
        }
    }, [setActiveItem]);

    const handleClose = useCallback(() => {
        setActiveItem(null);
    }, [setActiveItem]);

    if (timelineItems.length === 0) {
        return (
            <Card className="p-6 text-center text-muted-foreground border-dashed">
                <p>No rhythm items scheduled for today.</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4 relative">
            {timelineItems.map((item) => (
                <RhythmItemRow
                    key={item.id}
                    item={item}
                    onSelect={handleSelect}
                    onComplete={onComplete}
                    onSwap={onSwap}
                />
            ))}

            <RhythmDetailsSheet
                activeItem={activeItem}
                onClose={handleClose}
                onComplete={onComplete}
                onBookClick={onBookClick}
                onLiturgyToggle={onLiturgyToggle}
                onLiturgyAdvance={onLiturgyAdvance}
            />
        </div>
    );
});
