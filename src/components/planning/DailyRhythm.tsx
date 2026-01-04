import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Sun, Moon, Cloud, CalendarBlank } from '@phosphor-icons/react';
import { format } from 'date-fns';

interface TimeBlock {
    label: string;
    startTime: string;
    endTime: string;
    type: 'learning' | 'family' | 'rest' | 'outdoor' | 'individual';
    activities?: string[];
}

// Default daily rhythm for a homeschool family
const DEFAULT_RHYTHM: TimeBlock[] = [
    { label: 'Morning Gathering', startTime: '8:00', endTime: '8:30', type: 'family', activities: ['Devotions', 'Calendar', 'Memory Work'] },
    { label: 'Focused Learning', startTime: '8:30', endTime: '10:00', type: 'learning', activities: ['Core subjects'] },
    { label: 'Outdoor/Active Play', startTime: '10:00', endTime: '10:30', type: 'outdoor', activities: ['Free play', 'Nature walk'] },
    { label: 'Creative Time', startTime: '10:30', endTime: '11:30', type: 'individual', activities: ['Art', 'Music', 'Projects'] },
    { label: 'Read-Aloud', startTime: '11:30', endTime: '12:00', type: 'family', activities: ['Family reading'] },
    { label: 'Lunch & Rest', startTime: '12:00', endTime: '14:00', type: 'rest', activities: ['Lunch', 'Quiet time', 'Naps'] },
    { label: 'Afternoon Activities', startTime: '14:00', endTime: '15:00', type: 'learning', activities: ['Hands-on learning'] },
];

const typeColors: Record<TimeBlock['type'], { bg: string; text: string; border: string }> = {
    learning: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    family: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    rest: { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
    outdoor: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
    individual: { bg: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800' },
};

const typeLabels: Record<TimeBlock['type'], string> = {
    learning: 'Focused Learning',
    family: 'Family Time',
    rest: 'Rest',
    outdoor: 'Outdoor',
    individual: 'Individual',
};

const typeIcons: Record<TimeBlock['type'], React.ElementType> = {
    learning: Clock,
    family: Sun,
    rest: Moon,
    outdoor: Cloud,
    individual: CalendarBlank,
};

function getCurrentTimeBlock(rhythm: TimeBlock[]): TimeBlock | null {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const block of rhythm) {
        const [startH, startM] = block.startTime.split(':').map(Number);
        const [endH, endM] = block.endTime.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
            return block;
        }
    }
    return null;
}

interface DailyRhythmProps {
    compact?: boolean;
}

export function DailyRhythm({ compact = false }: DailyRhythmProps) {
    const currentBlock = getCurrentTimeBlock(DEFAULT_RHYTHM);
    const today = new Date();

    if (compact) {
        // Compact version for dashboard sidebar
        return (
            <Card className="border-primary/10">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" weight="duotone" />
                        Today's Rhythm
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                    {currentBlock ? (
                        <div className={`p-3 rounded-lg ${typeColors[currentBlock.type].bg} ${typeColors[currentBlock.type].border} border`}>
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-medium ${typeColors[currentBlock.type].text}`}>
                                    NOW
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {currentBlock.startTime} - {currentBlock.endTime}
                                </span>
                            </div>
                            <p className={`font-medium ${typeColors[currentBlock.type].text}`}>
                                {currentBlock.label}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Outside scheduled time</p>
                    )}

                    {/* Next up */}
                    {DEFAULT_RHYTHM.slice(0, 3).map((block, i) => {
                        const isCurrent = currentBlock?.label === block.label;
                        if (isCurrent) return null;
                        return (
                            <div key={i} className="flex items-center gap-3 text-sm">
                                <span className="text-muted-foreground w-12">{block.startTime}</span>
                                <span className="text-foreground">{block.label}</span>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        );
    }

    // Full version with visual timeline
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" weight="duotone" />
                    Daily Rhythm
                </CardTitle>
                <CardDescription>
                    {format(today, 'EEEE, MMMM d')} • A gentle flow for your day
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Legend */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {Object.entries(typeLabels).map(([type, label]) => {
                        const colors = typeColors[type as TimeBlock['type']];
                        return (
                            <Badge key={type} variant="outline" className={`${colors.bg} ${colors.text} ${colors.border}`}>
                                {label}
                            </Badge>
                        );
                    })}
                </div>

                {/* Timeline */}
                <div className="relative space-y-1">
                    {DEFAULT_RHYTHM.map((block, index) => {
                        const colors = typeColors[block.type];
                        const isCurrent = currentBlock?.label === block.label;
                        const Icon = typeIcons[block.type];

                        return (
                            <div
                                key={index}
                                className={`relative flex items-stretch gap-4 p-3 rounded-lg transition-all ${isCurrent
                                        ? `${colors.bg} ${colors.border} border-2 shadow-sm`
                                        : 'hover:bg-muted/30'
                                    }`}
                            >
                                {/* Time column */}
                                <div className="flex flex-col items-end w-16 shrink-0">
                                    <span className={`text-sm font-medium ${isCurrent ? colors.text : 'text-foreground'}`}>
                                        {block.startTime}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {block.endTime}
                                    </span>
                                </div>

                                {/* Indicator */}
                                <div className="flex flex-col items-center">
                                    <div className={`w-3 h-3 rounded-full ${isCurrent ? colors.text.replace('text-', 'bg-') : 'bg-muted'}`} />
                                    {index < DEFAULT_RHYTHM.length - 1 && (
                                        <div className="w-0.5 flex-1 bg-muted mt-1" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Icon className={`h-4 w-4 ${colors.text}`} weight="duotone" />
                                        <span className={`font-medium ${isCurrent ? colors.text : 'text-foreground'}`}>
                                            {block.label}
                                        </span>
                                        {isCurrent && (
                                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                                NOW
                                            </Badge>
                                        )}
                                    </div>
                                    {block.activities && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {block.activities.join(' • ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Note */}
                <p className="text-xs text-muted-foreground text-center mt-6 italic">
                    This is a suggested rhythm. Flexibility is part of the journey! 🌱
                </p>
            </CardContent>
        </Card>
    );
}
