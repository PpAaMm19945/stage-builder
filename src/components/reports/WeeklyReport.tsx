import React from 'react';
import { WeeklyReport as WeeklyReportType } from '@/lib/api';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Brain, Calendar } from 'lucide-react';

interface WeeklyReportProps {
    report: WeeklyReportType;
}

export function WeeklyReport({ report }: WeeklyReportProps) {
    const startDate = new Date(report.week_start);
    const endDate = new Date(report.week_end);
    const dateRange = `${format(startDate, 'MMMM d')} - ${format(endDate, 'MMMM d, yyyy')}`;

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-4">
            {/* Header */}
            <div className="bg-slate-900 text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Calendar size={120} />
                </div>
                <h1 className="text-3xl font-bold mb-2 tracking-tight">FAMILY FORMATION REPORT</h1>
                <p className="text-slate-300 text-lg">Week of {dateRange}</p>

                <div className="mt-8 flex gap-6">
                    <div className="bg-slate-800/50 p-4 rounded-lg backdrop-blur-sm">
                        <div className="text-3xl font-bold text-emerald-400">{report.summary.completion_rate}%</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Completion Rate</div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg backdrop-blur-sm">
                        <div className="text-3xl font-bold text-blue-400">{report.summary.completed}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Activities Done</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Formation Completed */}
                <Card className="border-t-4 border-t-emerald-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CheckCircle className="text-emerald-500" size={20} />
                            FORMATION COMPLETED
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 mt-2">
                            {report.by_type.catechism > 0 && (
                                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                                    <span className="text-slate-700">Catechism Questions</span>
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">✓ {report.by_type.catechism}</Badge>
                                </div>
                            )}
                            {report.by_type.hymns > 0 && (
                                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                                    <span className="text-slate-700">Hymns Sung</span>
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">✓ {report.by_type.hymns}</Badge>
                                </div>
                            )}
                            {report.by_type.books > 0 && (
                                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                                    <span className="text-slate-700">Books Read</span>
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">✓ {report.by_type.books}</Badge>
                                </div>
                            )}
                            {report.by_type.scripture > 0 && (
                                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                                    <span className="text-slate-700">Scripture Verses</span>
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">✓ {report.by_type.scripture}</Badge>
                                </div>
                            )}
                            {report.by_type.skill > 0 && (
                                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                                    <span className="text-slate-700">Skill Activities</span>
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">✓ {report.by_type.skill}</Badge>
                                </div>
                            )}
                            {report.by_type.habit > 0 && (
                                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                                    <span className="text-slate-700">Habit Formation</span>
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">✓ {report.by_type.habit}</Badge>
                                </div>
                            )}
                            {report.by_type.service > 0 && (
                                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                                    <span className="text-slate-700">Service Projects</span>
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">✓ {report.by_type.service}</Badge>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Time Invested */}
                <Card className="border-t-4 border-t-blue-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Clock className="text-blue-500" size={20} />
                            TIME INVESTED
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center h-48">
                            <div className="text-5xl font-bold text-slate-800 mb-2">
                                {Math.floor(report.time_invested.total_minutes / 60)}h {report.time_invested.total_minutes % 60}m
                            </div>
                            <div className="text-slate-500 text-sm font-medium uppercase tracking-wide">Total Time</div>

                            <div className="mt-6 pt-6 border-t w-full flex justify-between px-4">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-slate-700">{report.time_invested.daily_average}m</div>
                                    <div className="text-xs text-slate-400">Daily Avg</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-slate-700">{report.summary.skipped}</div>
                                    <div className="text-xs text-slate-400">Skipped</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Insights */}
            <Card className="border-t-4 border-t-purple-500 shadow-sm bg-gradient-to-br from-purple-50 to-white">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Brain className="text-purple-500" size={20} />
                        EFFICIENCY INSIGHTS
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 mt-2">
                        {report.insights.map((insight, idx) => (
                            <div key={idx} className="flex gap-4 items-start">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                                    {idx + 1}
                                </div>
                                <p className="text-slate-700 leading-relaxed pt-1">
                                    {insight}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Next Week */}
            <Card className="border-t-4 border-t-amber-500 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="text-amber-500" size={20} />
                        NEXT WEEK PREVIEW
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {report.next_week_preview.theme && (
                        <div className="mb-4">
                            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Theme</span>
                            <p className="text-lg font-medium text-slate-800">{report.next_week_preview.theme}</p>
                        </div>
                    )}
                    <ul className="list-disc pl-5 text-slate-600 space-y-1">
                        {report.next_week_preview.highlights.length > 0 ? (
                            report.next_week_preview.highlights.map((h, i) => <li key={i}>{h}</li>)
                        ) : (
                            <li>Upcoming catechism and hymn practice</li>
                        )}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
