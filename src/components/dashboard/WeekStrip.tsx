import { useMemo, memo } from 'react';
import { format, addDays, isSameDay, isPast, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowsClockwise, Check } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface WeekStripProps {
    weekStart: Date;
    selectedDay: Date;
    onDaySelect: (date: Date) => void;
    onRegenerate: () => void;
    isRegenerating?: boolean;
    /** Map of ISO date string -> { completed: number, total: number, domains: string[] } */
    dayData?: Record<string, { completed: number; total: number; domains: string[] }>;
}

const DOMAIN_COLORS: Record<string, string> = {
    // Legacy domain support
    motor: 'bg-blue-500',
    language: 'bg-green-500',
    cognitive: 'bg-purple-500',
    'social-emotional': 'bg-amber-500',
    'pre-academic': 'bg-red-500',
    // New virtue-based keys
    'Wisdom': 'bg-purple-500',
    'Stewardship': 'bg-blue-500',
    'Love': 'bg-pink-500',
    'Order': 'bg-amber-500',
    'Wonder': 'bg-cyan-500',
};

const EMPTY_DATA = {};

// Get Monday of the current week
function getWeekStart(date = new Date()): Date {
    const day = date.getDay();
    const d = new Date(date);
    if (day === 0 || day === 6) {
        const daysUntilMonday = day === 0 ? 1 : 2;
        d.setDate(d.getDate() + daysUntilMonday);
    } else {
        d.setDate(d.getDate() - (day - 1));
    }
    return startOfDay(d);
}

function arePropsEqual(prev: WeekStripProps, next: WeekStripProps) {
    const datesEqual =
        prev.weekStart.valueOf() === next.weekStart.valueOf() &&
        prev.selectedDay.valueOf() === next.selectedDay.valueOf();

    if (!datesEqual) return false;

    if (prev.isRegenerating !== next.isRegenerating) return false;
    if (prev.onDaySelect !== next.onDaySelect) return false;
    if (prev.onRegenerate !== next.onRegenerate) return false;

    const prevData = prev.dayData || EMPTY_DATA;
    const nextData = next.dayData || EMPTY_DATA;

    if (prevData === nextData) return true;

    // Treat two empty objects as equal to handle unstable references (e.g. from "|| {}")
    const prevKeys = Object.keys(prevData);
    const nextKeys = Object.keys(nextData);
    if (prevKeys.length === 0 && nextKeys.length === 0) return true;

    return false;
}

export const WeekStrip = memo(function WeekStrip({
    weekStart,
    selectedDay,
    onDaySelect,
    onRegenerate,
    isRegenerating = false,
    dayData = EMPTY_DATA,
}: WeekStripProps) {
    // Use primitive timestamp for today to ensure stability in useMemo
    // startOfDay(new Date()) creates a new object every render, breaking memoization
    const todayTs = new Date().setHours(0, 0, 0, 0);
    const weekStartMs = weekStart.valueOf();
    const selectedDayMs = selectedDay.valueOf();

    // Generate the 5 weekdays
    const days = useMemo(() => {
        const today = new Date(todayTs);
        const weekStartObj = new Date(weekStartMs);
        const selectedDayObj = new Date(selectedDayMs);

        return [0, 1, 2, 3, 4].map((offset) => {
            const date = addDays(weekStartObj, offset);
            const dateStr = format(date, 'yyyy-MM-dd');
            const data = dayData[dateStr] || { completed: 0, total: 0, domains: [] };
            const isToday = isSameDay(date, today);
            const isSelected = isSameDay(date, selectedDayObj);
            const isPastDay = isPast(date) && !isToday;

            let status: 'future' | 'today' | 'completed' | 'partial' | 'none' = 'future';
            if (isToday) {
                status = 'today';
            } else if (isPastDay) {
                if (data.total === 0) {
                    status = 'none';
                } else if (data.completed === data.total) {
                    status = 'completed';
                } else if (data.completed > 0) {
                    status = 'partial';
                } else {
                    status = 'none';
                }
            }

            // Construct accessible label
            let statusText = '';
            if (isToday) statusText = 'Today';
            else if (status === 'completed') statusText = 'All completed';
            else if (status === 'partial') statusText = 'Partially completed';

            const activityText = data.total === 1 ? '1 activity' : `${data.total || 0} activities`;
            const label = `${format(date, 'EEEE, MMMM do')}. ${statusText ? statusText + '. ' : ''}${activityText}`;

            return {
                date,
                dateStr,
                dayName: format(date, 'EEE'),
                dayNumber: format(date, 'd'),
                isToday,
                isSelected,
                isPastDay,
                status,
                data,
                ariaLabel: label,
            };
        });
    }, [weekStartMs, selectedDayMs, todayTs, dayData]);

    const weekLabel = `Week of ${format(weekStart, 'MMM d')} - ${format(addDays(weekStart, 4), 'd')}`;

    return (
        <div className="bg-card border rounded-xl p-4 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">{weekLabel}</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRegenerate}
                    disabled={isRegenerating}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                    <ArrowsClockwise
                        className={cn('w-3.5 h-3.5 mr-1', isRegenerating && 'animate-spin')}
                    />
                    Regenerate
                </Button>
            </div>

            {/* Day Circles */}
            <div className="flex justify-between gap-1">
                {days.map((day) => (
                    <button
                        key={day.dateStr}
                        onClick={() => onDaySelect(day.date)}
                        aria-label={day.ariaLabel}
                        aria-current={day.isSelected ? 'date' : undefined}
                        className={cn(
                            'flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition-all cursor-pointer',
                            'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30',
                            day.isSelected && 'bg-primary/10 ring-1 ring-primary/20',
                            day.isPastDay && 'opacity-80'
                        )}
                    >
                        {/* Day name */}
                        <span
                            className={cn(
                                'text-[10px] font-medium uppercase tracking-wide',
                                day.isToday ? 'text-primary' : 'text-muted-foreground'
                            )}
                        >
                            {day.dayName}
                        </span>

                        {/* Status circle */}
                        <div className="relative my-1.5">
                            <div
                                className={cn(
                                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                                    day.status === 'today' &&
                                    'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background',
                                    day.status === 'completed' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                    day.status === 'partial' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                                    day.status === 'none' && day.isPastDay && 'bg-muted text-muted-foreground',
                                    day.status === 'future' && 'bg-muted/50 text-muted-foreground'
                                )}
                            >
                                {day.status === 'completed' ? (
                                    <Check weight="bold" className="w-4 h-4" />
                                ) : (
                                    day.dayNumber
                                )}
                            </div>
                            {/* Pulsing ring for today */}
                            {day.isToday && (
                                <span className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
                            )}
                        </div>

                        {/* Activity count */}
                        <span
                            className={cn(
                                'text-[10px] tabular-nums',
                                day.data.total > 0 ? 'text-foreground' : 'text-muted-foreground/50'
                            )}
                        >
                            {day.data.total > 0 ? day.data.total : '—'}
                        </span>

                        {/* Domain color bar */}
                        {day.data.domains.length > 0 && (
                            <div className="flex gap-0.5 mt-1 h-1 w-full max-w-[32px]">
                                {day.data.domains.slice(0, 4).map((domain, i) => (
                                    <div
                                        key={`${domain}-${i}`}
                                        className={cn(
                                            'flex-1 rounded-full',
                                            DOMAIN_COLORS[domain] || 'bg-gray-400'
                                        )}
                                    />
                                ))}
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}, arePropsEqual);

export { getWeekStart };
