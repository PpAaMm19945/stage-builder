import React, { useState, useEffect } from 'react';
import { api, WeeklyReport as WeeklyReportType } from '@/lib/api';
import { WeeklyReport } from '@/components/reports/WeeklyReport';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { format, subWeeks, addWeeks, startOfWeek } from 'date-fns';
import { PageLoader } from '@/components/ui/PageLoader';
import { Separator } from '@/components/ui/separator';

export default function Reports() {
    const [report, setReport] = useState<WeeklyReportType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
        startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday start
    );

    const fetchReport = async (date: Date) => {
        setLoading(true);
        setError(null);
        try {
            const dateString = format(date, 'yyyy-MM-dd');
            const data = await api.reports.getWeekly(dateString);
            setReport(data);
        } catch (err: any) {
            console.error('Failed to fetch report:', err);
            setError(err.message || 'Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport(currentWeekStart);
    }, [currentWeekStart]);

    const handlePreviousWeek = () => {
        setCurrentWeekStart(prev => subWeeks(prev, 1));
    };

    const handleNextWeek = () => {
        const next = addWeeks(currentWeekStart, 1);
        if (next <= new Date()) {
            setCurrentWeekStart(next);
        }
    };

    const isCurrentWeek = addWeeks(currentWeekStart, 1) > new Date();

    return (
        <div className="container py-8 max-w-5xl mx-auto min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Weekly Reports</h1>
                    <p className="text-slate-500">Track your family's formation progress and insights</p>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border shadow-sm">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePreviousWeek}
                        title="Previous Week"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="px-4 py-1 text-sm font-medium w-32 text-center">
                        {format(currentWeekStart, 'MMM d, yyyy')}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNextWeek}
                        disabled={isCurrentWeek}
                        title="Next Week"
                    >
                        <ChevronRight className={`h-4 w-4 ${isCurrentWeek ? 'text-slate-300' : ''}`} />
                    </Button>
                </div>
            </div>

            <Separator className="mb-8" />

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 text-slate-400 animate-spin mb-4" />
                    <p className="text-slate-500">Generating report insights...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-8 rounded-lg text-center border border-red-100">
                    <p className="font-semibold mb-2">Could not load report</p>
                    <p className="text-sm">{error}</p>
                    <Button variant="outline" className="mt-4 border-red-200 text-red-600 hover:bg-red-100" onClick={() => fetchReport(currentWeekStart)}>
                        Try Again
                    </Button>
                </div>
            ) : report ? (
                <WeeklyReport report={report} />
            ) : (
                <div className="text-center py-20 text-slate-500">
                    No report available for this week.
                </div>
            )}
        </div>
    );
}
