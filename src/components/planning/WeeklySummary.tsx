import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ai } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ChartLineUp,
    ChatCircleText,
    SpinnerGap,
    Lightbulb,
    Question,
    ArrowsClockwise,
    Info
} from '@phosphor-icons/react';

interface WeeklySummaryProps {
    weekStart: string;
    isPastWeek: boolean;
}

export function WeeklySummary({ weekStart, isPastWeek }: WeeklySummaryProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['weekly-summary', weekStart],
        queryFn: () => ai.generateWeeklySummary(weekStart),
        enabled: isPastWeek && isExpanded,
        staleTime: 1000 * 60 * 30, // 30 minutes
    });

    if (!isPastWeek) {
        return null; // Only show for past weeks
    }

    return (
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <ChartLineUp className="w-5 h-5" weight="duotone" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Weekly Reflection</CardTitle>
                            <CardDescription className="text-xs">
                                AI-generated summary of this week
                            </CardDescription>
                        </div>
                    </div>
                    <Button
                        variant={isExpanded ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? 'Hide' : 'View Summary'}
                    </Button>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <SpinnerGap className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Generating your weekly reflection...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>Couldn't generate summary. Please try again.</p>
                            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                                Retry
                            </Button>
                        </div>
                    ) : data ? (
                        <>
                            {/* Stats */}
                            <div className="flex gap-4 text-sm">
                                <Badge variant="secondary" className="gap-1">
                                    {data.completionCount} activities
                                </Badge>
                                <Badge variant="secondary" className="gap-1">
                                    {data.observationCount} observations
                                </Badge>
                            </div>

                            {/* Summary */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <ChatCircleText className="w-4 h-4 text-primary" />
                                    What Happened This Week
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {data.summary}
                                </p>
                            </div>

                            {/* Patterns */}
                            {data.patterns && data.patterns.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Lightbulb className="w-4 h-4 text-amber-500" />
                                        Patterns I Noticed
                                    </div>
                                    <ul className="space-y-1.5">
                                        {data.patterns.map((pattern, i) => (
                                            <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                                <span className="text-primary">•</span>
                                                {pattern}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Discussion Questions */}
                            {data.suggestedQuestions && data.suggestedQuestions.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Question className="w-4 h-4 text-green-500" />
                                        Questions to Explore Together
                                    </div>
                                    <ul className="space-y-1.5">
                                        {data.suggestedQuestions.map((q, i) => (
                                            <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                                <span className="text-green-500">{i + 1}.</span>
                                                {q}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Advisory Note */}
                            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>
                                    This summary is generated by AI based on recorded activities and observations.
                                    It's meant to spark reflection, not evaluate your family's progress.
                                </span>
                            </div>
                        </>
                    ) : null}
                </CardContent>
            )}

            {isExpanded && data && (
                <CardFooter className="pt-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="ml-auto text-xs"
                    >
                        <ArrowsClockwise className={`w-3 h-3 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
                        Regenerate
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
