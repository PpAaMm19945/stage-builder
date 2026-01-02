import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { weeklyPlan, ai } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ArrowLeft,
    ArrowRight,
    ArrowsClockwise,
    Calendar,
    MicrophoneStage,
    WarningCircle,
    CheckCircle,
    ChatCircleText,
    Baby
} from '@phosphor-icons/react';
import { format, addWeeks, subWeeks, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { ExplainButton } from '@/components/ai/ExplainButton';
import { WeeklyPlan, PlanSlot, DOMAIN_LABELS } from '@/types';
import { toast } from 'sonner';

export default function Planner() {
    const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [viewMode, setViewMode] = useState<'grid' | 'narrative'>('grid');
    const [narrative, setNarrative] = useState<string | null>(null);
    const [narrativeTone, setNarrativeTone] = useState<'encouraging' | 'concise'>('encouraging');

    const queryClient = useQueryClient();
    const weekStartStr = format(currentWeek, 'yyyy-MM-dd');

    // Fetch Plan
    const { data: planData, isLoading, error, refetch } = useQuery({
        queryKey: ['weekly-plan', weekStartStr],
        queryFn: () => weeklyPlan.get(weekStartStr),
    });

    // Regenerate Mutation
    const regenerateMutation = useMutation({
        mutationFn: weeklyPlan.regenerate,
        onSuccess: (data) => {
            queryClient.setQueryData(['weekly-plan', weekStartStr], data);
            toast.success('Plan regenerated!');
            setNarrative(null); // Clear old narrative
        },
        onError: (err: any) => {
            toast.error('Failed to regenerate', { description: err.message });
        }
    });

    // Narrate Mutation
    const narrateMutation = useMutation({
        mutationFn: ai.narrate,
        onSuccess: (data) => {
            setNarrative(data.narrative);
        },
        onError: (err: any) => {
            toast.error('Failed to narrate plan', { description: err.message });
        }
    });

    const handleNarrate = () => {
        if (!planData?.plan) return;
        setViewMode('narrative');
        if (!narrative) {
            narrateMutation.mutate({ plan: planData.plan, tone: narrativeTone });
        }
    };

    const getDaySlots = (date: Date) => {
        if (!planData?.plan?.slots) return [];
        const dayName = format(date, 'EEE'); // Mon, Tue... matching DayOfWeek type
        return planData.plan.slots.filter(s => s.day === dayName);
    };

    const domainColors: Record<string, string> = {
        'motor': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        'language': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        'cognitive': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        'social-emotional': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        'pre-academic': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Weekly Planner</h1>
                    <p className="text-muted-foreground">AI-curated curriculum for your family</p>
                </div>

                <div className="flex items-center gap-2 bg-card border rounded-lg p-1 shadow-sm">
                    <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-2 px-2 font-medium min-w-[140px] justify-center">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {format(currentWeek, 'MMM d')} - {format(addWeeks(currentWeek, 1), 'MMM d, yyyy')}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Control Bar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-muted/50 p-1 rounded-lg">
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="text-xs"
                    >
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule View
                    </Button>
                    <Button
                        variant={viewMode === 'narrative' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={handleNarrate}
                        className="text-xs"
                    >
                        <MicrophoneStage className="w-4 h-4 mr-2" />
                        Narrative View
                    </Button>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => regenerateMutation.mutate()}
                        disabled={regenerateMutation.isPending || isLoading}
                        className="text-xs"
                    >
                        <ArrowsClockwise className={`w-4 h-4 mr-2 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
                        Regenerate Plan
                    </Button>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
                </div>
            ) : error ? (
                <Card className="border-destructive/20 bg-destructive/5">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <WarningCircle className="w-12 h-12 text-destructive mb-4" />
                        <h3 className="font-semibold text-lg text-foreground">Couldn't load plan</h3>
                        <p className="text-muted-foreground mb-4">We encountered an error loading your weekly plan.</p>
                        <Button onClick={() => refetch()}>Try Again</Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((dayStr, index) => {
                                const date = addWeeks(currentWeek, 0); // Need actual date logic if dates matched, but slots use 'Mon'
                                // We'll iterate days based on index from currentWeek
                                const dayDate = new Date(currentWeek);
                                dayDate.setDate(currentWeek.getDate() + index);

                                const slots = planData?.plan?.slots.filter(s => s.day === dayStr) || [];
                                const isToday = isSameDay(new Date(), dayDate);

                                return (
                                    <Card key={dayStr} className={`flex flex-col h-full border-t-4 ${isToday ? 'border-t-primary shadow-md' : 'border-t-transparent'}`}>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-base font-semibold">
                                                    {format(dayDate, 'EEEE')}
                                                </CardTitle>
                                                <span className="text-xs text-muted-foreground">{format(dayDate, 'MMM d')}</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 space-y-3 p-3 pt-0">
                                            {slots.length === 0 ? (
                                                <div className="h-24 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                                                    <p className="text-xs font-medium">No activities</p>
                                                </div>
                                            ) : (
                                                slots.map((slot, i) => (
                                                    <div key={i} className="group relative bg-card hover:bg-muted/30 border rounded-lg p-3 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <Badge
                                                                variant="secondary"
                                                                className={`text-[10px] px-1.5 py-0 h-5 font-medium border-0 ${slot.timeSlot === 'morning' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}
                                                            >
                                                                {slot.timeSlot}
                                                            </Badge>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[10px] text-muted-foreground">{slot.duration}m</span>
                                                                <ExplainButton activityId={slot.activityId} domain={slot.domain} triggerData={{ title: slot.activityTitle }} />
                                                            </div>
                                                        </div>

                                                        <h4 className="font-medium text-sm leading-tight mb-1 line-clamp-2">{slot.activityTitle}</h4>

                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 border-0 ${domainColors[slot.domain] || 'bg-gray-100'}`}>
                                                                {slot.domain}
                                                            </Badge>
                                                        </div>

                                                        {slot.reasoning && (
                                                            <p className="mt-2 text-[10px] text-muted-foreground italic line-clamp-2 leading-relaxed">
                                                                "{slot.reasoning}"
                                                            </p>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {viewMode === 'narrative' && (
                        <Card className="max-w-3xl mx-auto border-primary/20 bg-gradient-to-br from-card to-primary/5">
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                                        <ChatCircleText className="w-6 h-6" weight="duotone" />
                                    </div>
                                    <div>
                                        <CardTitle>This Week's Story</CardTitle>
                                        <CardDescription>A narrative overview of your learning journey</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {narrateMutation.isPending ? (
                                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                                            <Baby className="w-12 h-12 text-primary relative z-10 animate-bounce" />
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground animate-pulse">
                                            Weaving your weekly story...
                                        </p>
                                    </div>
                                ) : narrative ? (
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <div className="whitespace-pre-wrap leading-relaxed font-serif text-base">
                                            {narrative}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <p>Click "Narrative View" to generate a story.</p>
                                    </div>
                                )}
                            </CardContent>
                            {narrative && (
                                <CardFooter className="bg-muted/30 pt-4 flex justify-between">
                                    <div className="text-xs text-muted-foreground">
                                        Generated by SchoolOS AI
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => narrateMutation.mutate({ plan: planData.plan, tone: 'concise' })}>
                                            Make Concise
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => narrateMutation.mutate({ plan: planData.plan, tone: 'encouraging' })}>
                                            Make Encouraging
                                        </Button>
                                    </div>
                                </CardFooter>
                            )}
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
