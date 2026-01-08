import { RhythmItem } from '@/components/planning/DailyRhythm';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Play,
    CheckCircle,
    BookOpen,
    HandsPraying,
    PersonSimpleRun,
    Clock,
    CaretRight
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface UpNextCardProps {
    item: RhythmItem | null;
    onAction: (item: RhythmItem) => void;
    onExpand: () => void;
    pendingCount: number;
}

export function UpNextCard({ item, onAction, onExpand, pendingCount }: UpNextCardProps) {
    if (!item) {
        return (
            <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background border-indigo-100 dark:border-indigo-900 shadow-sm">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" weight="fill" />
                    </div>
                    <CardTitle className="text-xl font-display">All Caught Up!</CardTitle>
                    <CardDescription>
                        You've completed everything scheduled for now.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="justify-center pb-6">
                    <Button variant="outline" onClick={onExpand}>
                        View Full Day
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    const getIcon = (type: RhythmItem['type']) => {
        switch (type) {
            case 'liturgy': return <HandsPraying weight="duotone" className="w-8 h-8 text-amber-600 dark:text-amber-400" />;
            case 'activity': return <PersonSimpleRun weight="duotone" className="w-8 h-8 text-blue-600 dark:text-blue-400" />;
            case 'book': return <BookOpen weight="duotone" className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />;
            default: return <Clock weight="duotone" className="w-8 h-8 text-slate-600 dark:text-slate-400" />;
        }
    };

    const getBgColor = (type: RhythmItem['type']) => {
        switch (type) {
            case 'liturgy': return 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50';
            case 'activity': return 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50';
            case 'book': return 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50';
            default: return 'bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800';
        }
    };

    return (
        <Card className={cn("shadow-md relative overflow-hidden transition-all", getBgColor(item.type))}>
            {/* Background Pattern or Decoration */}
            <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                {getIcon(item.type)}
            </div>

            <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                        Up Next • {item.timeSlot}
                    </span>
                </div>
                <CardTitle className="text-2xl font-display leading-tight">
                    {item.title}
                </CardTitle>
                <CardDescription className="text-base line-clamp-2 mt-1 opacity-90">
                    {item.description}
                </CardDescription>
            </CardHeader>

            <CardContent className="pb-4">
                {/* Optional: Add small preview info depending on type */}
                {item.type === 'book' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/50 dark:bg-black/20 p-2 rounded-lg">
                        <BookOpen size={16} />
                        <span>Read Aloud</span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex gap-3 pb-5">
                <Button
                    size="lg"
                    className="flex-1 shadow-sm text-base h-12"
                    onClick={() => onAction(item)}
                >
                    <Play weight="fill" className="mr-2 w-5 h-5" />
                    Start Now
                </Button>

                <Button
                    variant="ghost"
                    size="lg"
                    className="aspect-square h-12 w-12 p-0 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                    onClick={onExpand}
                    title="View Full Schedule"
                >
                    <div className="relative">
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                            {pendingCount}
                        </span>
                        <CaretRight weight="bold" className="w-5 h-5" />
                    </div>
                </Button>
            </CardFooter>
        </Card>
    );
}
