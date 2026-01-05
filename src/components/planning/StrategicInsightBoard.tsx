import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { weeklyPlan } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, UsersThree, ForkKnife, Baby, Info } from '@phosphor-icons/react';

interface StrategicInsightBoardProps {
    plan: any;
    children: any[];
}

export function StrategicInsightBoard({ plan, children }: StrategicInsightBoardProps) {
    // Only fetch if we have a plan
    const { data: insights, isLoading } = useQuery({
        queryKey: ['strategic-insights', plan?.id],
        queryFn: () => weeklyPlan.getStrategicInsights(plan, children),
        enabled: !!plan && children.length > 0,
        staleTime: 1000 * 60 * 60, // Cache for 1 hour
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
        );
    }

    if (!insights) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Child Insights */}
            <Card className="bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                        <Baby className="w-5 h-5" weight="duotone" />
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Per-Child Focus</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                    {insights.childInsights?.map((insight: any, i: number) => (
                        <div key={i} className="flex gap-2 items-start">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                            <p className="leading-snug text-muted-foreground">{insight.insight}</p>
                        </div>
                    ))}
                    {!insights.childInsights?.length && <p className="text-xs text-muted-foreground italic">No specific alerts this week.</p>}
                </CardContent>
            </Card>

            {/* Family Balance */}
            <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <UsersThree className="w-5 h-5" weight="duotone" />
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Family Balance</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                    {insights.familyBalanceTips?.map((tip: string, i: number) => (
                        <div key={i} className="flex gap-2 items-start">
                            <Lightbulb className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" weight="fill" />
                            <p className="leading-snug text-muted-foreground">{tip}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Prep Ahead */}
            <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <ForkKnife className="w-5 h-5" weight="duotone" />
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Prep Ahead</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                    {insights.prepNotes?.map((note: string, i: number) => (
                        <div key={i} className="flex gap-2 items-start">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            <p className="leading-snug text-muted-foreground">{note}</p>
                        </div>
                    ))}
                    {!insights.prepNotes?.length && <p className="text-xs text-muted-foreground italic">No special prep needed.</p>}
                </CardContent>
            </Card>
        </div>
    );
}
