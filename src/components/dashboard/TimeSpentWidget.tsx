import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, TrendUp, User } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface TimeSpentData {
    students: Array<{
        student_id: string;
        student_name: string;
        total_minutes: number;
        formations_completed: number;
    }>;
    totalMinutes: number;
    weekStart: string;
}

async function fetchTimeSpent(): Promise<TimeSpentData> {
    const response = await fetch('/api/analytics/time-spent', {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch time data');
    return response.json();
}

function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

interface TimeSpentWidgetProps {
    className?: string;
}

export function TimeSpentWidget({ className }: TimeSpentWidgetProps) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['analytics', 'time-spent'],
        queryFn: fetchTimeSpent,
        refetchInterval: 60000, // Refresh every minute
        staleTime: 30000
    });

    if (isLoading) {
        return (
            <Card className={cn("animate-pulse", className)}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Clock weight="duotone" className="w-4 h-4" />
                        Time Spent This Week
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded w-20" />
                </CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return null; // Silently fail - don't show widget if no data
    }

    const hasData = (data.totalMinutes || 0) > 0;
    const students = data.students || [];

    return (
        <Card className={cn(
            "border-amber-100 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10",
            className
        )}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock weight="duotone" className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Time Spent This Week
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Total Time */}
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                        {hasData ? formatDuration(data.totalMinutes || 0) : '—'}
                    </span>
                    {hasData && (
                        <span className="text-xs text-muted-foreground">
                            total learning time
                        </span>
                    )}
                </div>

                {/* Per-child breakdown */}
                {students.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-amber-100 dark:border-amber-900/50">
                        {students.map((student) => (
                            <div
                                key={student.student_id}
                                className="flex items-center justify-between text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <User weight="duotone" className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-slate-700 dark:text-slate-300">
                                        {student.student_name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <span className="font-medium text-slate-600 dark:text-slate-400">
                                        {formatDuration(student.total_minutes)}
                                    </span>
                                    <span className="text-xs">
                                        {student.formations_completed} activities
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!hasData && (
                    <p className="text-xs text-muted-foreground">
                        Complete some activities to see your time tracking here.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
