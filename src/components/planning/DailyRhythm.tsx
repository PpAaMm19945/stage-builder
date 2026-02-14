import { useCallback, memo } from 'react';
import { Card } from '@/components/ui/card';
import { RhythmItemRow } from './RhythmItemRow';
import type { DailyRhythmItem as RhythmItem } from '@/types';

interface DailyRhythmProps {
    items?: RhythmItem[];
    onSelectItem?: (item: RhythmItem) => void;
    onComplete?: (item: RhythmItem, duration?: number) => void;
    onSwap?: (item: RhythmItem) => void;
}

export const DailyRhythm = memo(function DailyRhythm({
    items = [],
    onSelectItem,
    onComplete,
    onSwap,
}: DailyRhythmProps) {
    const timelineItems = items.length > 0 ? items : [];

    const handleSelect = useCallback((item: RhythmItem) => {
        if (item.type !== 'section_header' && onSelectItem) {
            onSelectItem(item);
        }
    }, [onSelectItem]);

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
        </div>
    );
});
