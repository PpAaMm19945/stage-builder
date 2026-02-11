import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, Users, MessageSquare, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '@/lib/api';

const AICostDashboard = () => {
    const [summary, setSummary] = useState<any>(null);
    const [costs, setCosts] = useState<any>(null);
    const [topUsers, setTopUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [summaryRes, costsRes, usersRes] = await Promise.all([
                api.adminAi.getUsageSummary(),
                api.adminAi.getCosts(30),
                api.adminAi.getUsageUsers(7)
            ]);

            setSummary(summaryRes.today);
            setCosts(costsRes);
            setTopUsers(usersRes.results || []);
        } catch (err) {
            console.error("Failed to load cost data", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(val);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">AI Costs & Usage</h1>
                <p className="text-muted-foreground">Monitor daily spend and top active users.</p>
            </header>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Cost Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary?.cost || 0)}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> Estimated Gemini Flash
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Messages Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.messages || 0}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> Total chat turns
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.activeUsers || 0}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" /> Engaging today
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">30-Day Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(costs?.totalCost || 0)}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> Rolling 30 days
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Cost Chart */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Daily Cost Trend</CardTitle>
                        <CardDescription>Last 30 days spend</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={costs?.dailyCosts || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                                    fontSize={12}
                                />
                                <YAxis
                                    tickFormatter={(val) => `$${val}`}
                                    fontSize={12}
                                />
                                <Tooltip
                                    formatter={(value: number) => [formatCurrency(value), 'Cost']}
                                    labelFormatter={(label) => new Date(label).toDateString()}
                                />
                                <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Token Usage Chart */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Token Usage</CardTitle>
                        <CardDescription>Input vs Output Volume</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={costs?.dailyCosts || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                                    fontSize={12}
                                />
                                <YAxis fontSize={12} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    labelFormatter={(label) => new Date(label).toDateString()}
                                />
                                <Line type="monotone" dataKey="inputTokens" stroke="#8884d8" name="Input" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="outputTokens" stroke="#82ca9d" name="Output" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Top Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Users (Last 7 Days)</CardTitle>
                    <CardDescription>Most active users by message volume.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead className="text-right">Messages</TableHead>
                                <TableHead className="text-right">Tokens</TableHead>
                                <TableHead className="text-right">Active Days</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topUsers.map((user) => (
                                <TableRow key={user.user_id}>
                                    <TableCell className="font-mono text-xs">{user.user_id}</TableCell>
                                    <TableCell className="text-right font-medium">{user.total_messages}</TableCell>
                                    <TableCell className="text-right">{user.total_tokens.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{user.active_days}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AICostDashboard;
