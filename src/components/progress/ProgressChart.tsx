import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { students } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ChartLineUp, TrendUp, Calendar, Target } from '@phosphor-icons/react';
import { DOMAIN_LABELS, DOMAIN_TO_VIRTUE, type PrimaryVirtue, type EarlyYearsDomain, VIRTUE_LABELS } from '@/types';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
    Legend,
    ReferenceLine
} from 'recharts';
import { format, subMonths, startOfMonth, eachMonthOfInterval } from 'date-fns';

const VIRTUE_COLORS: Record<PrimaryVirtue, string> = {
    'Wisdom': '#8b5cf6',
    'Stewardship': '#10b981',
    'Love': '#ec4899',
    'Order': '#f97316',
    'Wonder': '#3b82f6',
};

interface ProgressChartProps {
    studentId?: string;
    months?: number;
}

export function ProgressChart({ studentId, months = 6 }: ProgressChartProps) {
    const { selectedChild } = useAuth();
    const effectiveStudentId = studentId || selectedChild?.id;

    // Fetch progress data
    const { data: progressData, isLoading } = useQuery({
        queryKey: ['progress', effectiveStudentId],
        queryFn: () => students.getProgress(effectiveStudentId!),
        enabled: !!effectiveStudentId,
    });

    // Fetch observations for historical data
    const { data: observationsData } = useQuery({
        queryKey: ['observations', effectiveStudentId],
        queryFn: () => students.getObservations(effectiveStudentId!),
        enabled: !!effectiveStudentId,
    });

    // Process data for chart
    const chartData = useMemo(() => {
        if (!observationsData) return [];

        const now = new Date();
        const startDate = subMonths(now, months);
        const monthIntervals = eachMonthOfInterval({ start: startDate, end: now });

        // Group observations by month
        const monthlyData = monthIntervals.map(date => {
            const monthKey = format(date, 'MMM yyyy');
            const monthStart = startOfMonth(date);
            const monthEnd = new Date(monthStart);
            monthEnd.setMonth(monthEnd.getMonth() + 1);

            // Count activities per virtue for this month
            const monthObs = observationsData.filter((obs: any) => {
                const obsDate = new Date(obs.created_at);
                return obsDate >= monthStart && obsDate < monthEnd;
            });

            const virtueCounts: Record<string, number> = {
                'Wisdom': 0,
                'Stewardship': 0,
                'Love': 0,
                'Order': 0,
                'Wonder': 0,
            };

            monthObs.forEach((obs: any) => {
                // Map legacy domain to virtue if necessary
                const virtue = obs.primary_virtue || DOMAIN_TO_VIRTUE[obs.domain as string] || 'Wisdom';
                if (virtueCounts[virtue] !== undefined) {
                    virtueCounts[virtue]++;
                }
            });

            return {
                month: format(date, 'MMM'),
                fullMonth: monthKey,
                total: monthObs.length,
                ...virtueCounts,
            };
        });

        return monthlyData;
    }, [observationsData, months]);

    // Calculate growth metrics
    const growthMetrics = useMemo(() => {
        if (chartData.length < 2) return { trend: 0, bestMonth: null, totalActivities: 0 };

        const totals = chartData.map(d => d.total);
        const totalActivities = totals.reduce((a, b) => a + b, 0);
        const lastMonthTotal = totals[totals.length - 1] || 0;
        const prevMonthTotal = totals[totals.length - 2] || 0;
        const trend = prevMonthTotal > 0
            ? Math.round(((lastMonthTotal - prevMonthTotal) / prevMonthTotal) * 100)
            : lastMonthTotal > 0 ? 100 : 0;

        const maxTotal = Math.max(...totals);
        const bestMonth = chartData.find(d => d.total === maxTotal);

        return { trend, bestMonth, totalActivities };
    }, [chartData]);

    if (!effectiveStudentId) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    Please select a child to view progress
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        );
    }

    const hasData = chartData.some(d => d.total > 0);

    return (
        <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <ChartLineUp className="h-6 w-6 text-primary" weight="duotone" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{growthMetrics.totalActivities}</p>
                                <p className="text-sm text-muted-foreground">Activities ({months} months)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl ${growthMetrics.trend >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'} flex items-center justify-center`}>
                                <TrendUp className={`h-6 w-6 ${growthMetrics.trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400 rotate-180'}`} weight="duotone" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${growthMetrics.trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {growthMetrics.trend >= 0 ? '+' : ''}{growthMetrics.trend}%
                                </p>
                                <p className="text-sm text-muted-foreground">Monthly Growth</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Target className="h-6 w-6 text-amber-600 dark:text-amber-400" weight="duotone" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {growthMetrics.bestMonth ? growthMetrics.bestMonth.fullMonth : 'N/A'}
                                </p>
                                <p className="text-sm text-muted-foreground">Best Month</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" weight="duotone" />
                        Activity Trend
                    </CardTitle>
                    <CardDescription>
                        Activities completed over the last {months} months
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {hasData ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="month"
                                        className="text-xs fill-muted-foreground"
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        className="text-xs fill-muted-foreground"
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-popover border rounded-lg shadow-lg p-3">
                                                        <p className="font-medium text-foreground">{label}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {payload[0].value} activities
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        fill="url(#totalGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                            <div className="text-center">
                                <ChartLineUp className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-muted-foreground">No activity data yet</p>
                                <p className="text-sm text-muted-foreground">Complete activities to see your progress chart</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Domain Breakdown Chart */}
            {hasData && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Progress by Virtue</CardTitle>
                        <CardDescription>See how activities are distributed across primary virtues</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {Object.entries(VIRTUE_LABELS).map(([virtue, label]) => (
                                <Badge
                                    key={virtue}
                                    variant="outline"
                                    style={{ borderColor: VIRTUE_COLORS[virtue as PrimaryVirtue], color: VIRTUE_COLORS[virtue as PrimaryVirtue] }}
                                >
                                    <span
                                        className="w-2 h-2 rounded-full mr-1"
                                        style={{ backgroundColor: VIRTUE_COLORS[virtue as PrimaryVirtue] }}
                                    />
                                    {label}
                                </Badge>
                            ))}
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="month"
                                        className="text-xs fill-muted-foreground"
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        className="text-xs fill-muted-foreground"
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-popover border rounded-lg shadow-lg p-3">
                                                        <p className="font-medium text-foreground mb-2">{label}</p>
                                                        {payload.map((entry: any) => (
                                                            <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
                                                                <span
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{ backgroundColor: entry.color }}
                                                                />
                                                                <span className="text-muted-foreground">
                                                                    {DOMAIN_LABELS[entry.dataKey as EarlyYearsDomain] || entry.dataKey}:
                                                                </span>
                                                                <span className="font-medium">{entry.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    {Object.entries(VIRTUE_COLORS).map(([virtue, color]) => (
                                        <Line
                                            key={virtue}
                                            type="monotone"
                                            dataKey={virtue}
                                            stroke={color}
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 5 }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
