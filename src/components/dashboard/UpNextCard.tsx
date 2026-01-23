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
    CaretRight,
    MusicNotes,
    BookBookmark,
    Scroll,
    Compass
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

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

    // Get icon based on item type or path_type for path items
    const getIcon = (type: RhythmItem['type'], pathType?: string) => {
        if (type === 'path_item' && pathType) {
            switch (pathType) {
                case 'hymn_journey': return <MusicNotes weight="duotone" className="w-8 h-8 text-rose-600 dark:text-rose-400" />;
                case 'catechism': return <Scroll weight="duotone" className="w-8 h-8 text-violet-600 dark:text-violet-400" />;
                case 'history_young':
                case 'history_full': return <BookBookmark weight="duotone" className="w-8 h-8 text-amber-600 dark:text-amber-400" />;
                case 'toddler_dev':
                case 'early_reading': return <BookOpen weight="duotone" className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />;
                default: return <Compass weight="duotone" className="w-8 h-8 text-primary" />;
            }
        }
        switch (type) {
            case 'liturgy': return <HandsPraying weight="duotone" className="w-8 h-8 text-amber-600 dark:text-amber-400" />;
            case 'activity': return <PersonSimpleRun weight="duotone" className="w-8 h-8 text-blue-600 dark:text-blue-400" />;
            case 'book': return <BookOpen weight="duotone" className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />;
            case 'path_item': return <Compass weight="duotone" className="w-8 h-8 text-primary" />;
            default: return <Clock weight="duotone" className="w-8 h-8 text-slate-600 dark:text-slate-400" />;
        }
    };

    // Get background color based on item type or path_type for path items
    const getBgColor = (type: RhythmItem['type'], pathType?: string) => {
        if (type === 'path_item' && pathType) {
            switch (pathType) {
                case 'hymn_journey': return 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20 border-rose-200 dark:border-rose-900/50';
                case 'catechism': return 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/20 border-violet-200 dark:border-violet-900/50';
                case 'history_young':
                case 'history_full': return 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border-amber-200 dark:border-amber-900/50';
                case 'toddler_dev':
                case 'early_reading': return 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 border-emerald-200 dark:border-emerald-900/50';
                default: return 'bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border-primary/20';
            }
        }
        switch (type) {
            case 'liturgy': return 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50';
            case 'activity': return 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50';
            case 'book': return 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50';
            case 'path_item': return 'bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border-primary/20';
            default: return 'bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800';
        }
    };

    // Extract path info for path items
    const pathType = item.type === 'path_item' ? item.data?.path_type : undefined;
    const pathName = item.type === 'path_item' ? item.data?.pathName : undefined;
    const position = item.type === 'path_item' ? item.data?.position : undefined;
    const total = item.type === 'path_item' ? item.data?.total : undefined;
    const progressPercent = position && total ? Math.round((position / total) * 100) : 0;

    return (
        <Card className={cn("shadow-md relative overflow-hidden transition-all", getBgColor(item.type, pathType))}>
            {/* Background Pattern or Decoration */}
            <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                {getIcon(item.type, pathType)}
            </div>

            <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                    {/* Path badge for path items */}
                    {item.type === 'path_item' && pathName && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {pathName}
                        </span>
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                        {item.timeSlot ? `Up Next • ${item.timeSlot}` : 'Up Next'}
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
                {/* Progress bar for path items */}
                {item.type === 'path_item' && position && total && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{position}/{total}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                )}
                {/* Book type info */}
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

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="lg"
                                className="aspect-square h-12 w-12 p-0 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                                onClick={onExpand}
                                aria-label={`View Full Schedule, ${pendingCount} pending items`}
                            >
                                <div className="relative">
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                                        <span className="sr-only">
                                            {pendingCount} pending items
                                        </span>
                                        <span aria-hidden="true">
                                            {pendingCount}
                                        </span>
                                    </span>
                                    <CaretRight weight="bold" className="w-5 h-5" />
                                </div>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>View Full Schedule</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </CardFooter>
        </Card>
    );
}
