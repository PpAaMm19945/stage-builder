import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { RhythmItemRow } from './RhythmItemRow';

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
    onSelectItem?: (item: RhythmItem | null) => void;
    onComplete?: (item: RhythmItem, duration?: number) => void;
    onSwap?: (item: RhythmItem) => void;
}

export const DailyRhythm = memo(function DailyRhythm({
    items = [],
    onSelectItem,
    onComplete,
    onSwap
}: DailyRhythmProps) {
    const timelineItems = items.length > 0 ? items : [];

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
                    onSelect={(item) => onSelectItem && onSelectItem(item)}
                    onComplete={onComplete}
                    onSwap={onSwap}
                />
            ))}
        </div>
    );
});
