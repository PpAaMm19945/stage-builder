import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle, BarChart3, Database, Key } from "lucide-react";
import api from '@/lib/api';

const AIDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [telemetry, setTelemetry] = useState<any[]>([]);
    const [anchors, setAnchors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [spineRes, telRes, anchorRes, activityRes] = await Promise.all([
                api.adminAi.getSpineStats(),
                api.adminAi.getTelemetry({ limit: 50 }),
                api.adminAi.getAnchors(20),
                api.adminAi.getActivities()
            ]);

            setStats({ ...spineRes, activities: activityRes });
            setTelemetry(telRes.telemetry);
            setAnchors(anchorRes.anchors);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError("Failed to load dashboard data. Ensure you are authorized.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>;
    if (error) return <Alert variant="destructive" className="m-4"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Operations</h1>
                    <p className="text-muted-foreground">Monitor curriculum generation and telemetry.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="gap-1"><Key className="h-3 w-3" /> Admin Access</Badge>
                    <Badge variant="outline" className="gap-1"><Database className="h-3 w-3" /> D1</Badge>
                </div>
            </header>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Spine Gens</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.stats?.total_generations || 0}</div>
                        <p className="text-xs text-muted-foreground">Lifetime generations</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(stats?.stats?.avg_latency || 0)}ms</div>
                        <p className="text-xs text-muted-foreground">Per request</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.stats?.total_generations ? Math.round(((stats.stats.error_count || 0) / stats.stats.total_generations) * 100) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">Failure rate</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="telemetry">
                <TabsList>
                    <TabsTrigger value="telemetry">Telemetry Log</TabsTrigger>
                    <TabsTrigger value="anchors">Anchor Monitor</TabsTrigger>
                    <TabsTrigger value="spine">Spine Conflicts</TabsTrigger>
                    <TabsTrigger value="activities">Activity Monitoring</TabsTrigger>
                </TabsList>

                <TabsContent value="telemetry" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Recent Telemetry</CardTitle><CardDescription>Real-time AI usage logs</CardDescription></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>Feature</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Latency</TableHead>
                                        <TableHead>Tokens</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {telemetry.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                            <TableCell>{log.feature}</TableCell>
                                            <TableCell>
                                                <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                                                    {log.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{log.latency_ms}ms</TableCell>
                                            <TableCell>
                                                {log.request_tokens} / {log.response_tokens}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="anchors" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Generated Anchors</CardTitle><CardDescription>Daily anchor snapshots (Sanitized)</CardDescription></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Theme</TableHead>
                                        <TableHead>Reasoning</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {anchors.map((anchor) => (
                                        <TableRow key={anchor.id}>
                                            <TableCell>{anchor.date}</TableCell>
                                            <TableCell>{anchor.data?.theme || 'N/A'}</TableCell>
                                            <TableCell className="max-w-xs truncate" title={anchor.reasoning}>{anchor.reasoning}</TableCell>
                                            <TableCell><Badge variant="outline">{anchor.status}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="spine" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Draft Conflicts</CardTitle><CardDescription>Spine generations pending review</CardDescription></CardHeader>
                        <CardContent>
                            {stats?.pendingConflicts?.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                                    <CheckCircle className="h-8 w-8 mb-2 text-green-500" />
                                    No conflicts found. All systems nominal.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Version</TableHead>
                                            <TableHead>Conflict Count</TableHead>
                                            <TableHead>Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stats?.pendingConflicts?.map((c: any, i: number) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-mono">{c.version}</TableCell>
                                                <TableCell>{c.conflictCount}</TableCell>
                                                <TableCell>{JSON.stringify(c.conflicts)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activities" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Activity Monitoring</CardTitle><CardDescription>Analysis of recent 100 generated activities</CardDescription></CardHeader>
                        <CardContent>
                            {stats?.activities ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold">Domain Coverage</h3>
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Domain</TableHead><TableHead>Count</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {Object.entries(stats.activities.domainCounts || {}).map(([domain, count]) => (
                                                    <TableRow key={domain}>
                                                        <TableCell className="capitalize">{domain}</TableCell>
                                                        <TableCell>{Number(count)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-semibold">Top Materials</h3>
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Material</TableHead><TableHead>Count</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {(stats.activities.topMaterials || []).map((m: any) => (
                                                    <TableRow key={m.name}>
                                                        <TableCell className="capitalize">{m.name}</TableCell>
                                                        <TableCell>{m.count}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AIDashboard;
