
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Eye, History, Loader2, Play } from "lucide-react";
import api from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";

interface SpineListProps {
    onReviewConflicts: (version: string) => void;
    onViewEntries: (version: string, subject: string) => void;
}

const SpineList: React.FC<SpineListProps> = ({ onReviewConflicts, onViewEntries }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [versions, setVersions] = useState<any[]>([]);

    useEffect(() => {
        loadVersions();
    }, []);

    const loadVersions = async () => {
        try {
            setLoading(true);
            const res = await api.adminAi.getSpineVersions();
            setVersions(res.versions);
        } catch (error) {
            console.error(error);
            toast({
                title: "Failed to load history",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (version: string) => {
        try {
            await api.adminAi.approveSpine({ version });
            toast({ title: "Spine Approved", description: `${version} is now live.` });
            loadVersions();
        } catch (error) {
            toast({ title: "Approval failed", variant: "destructive" });
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Generation History
                </CardTitle>
                <CardDescription>
                    Manage past generations, review conflicts, and publish content.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Version</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Weeks</TableHead>
                            <TableHead>Conflicts</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {versions.map((v) => {
                            // Parse subject if it's an array string
                            const subject = Array.isArray(v.subjects) ? v.subjects[0] : (typeof v.subjects === 'string' ? JSON.parse(v.subjects)[0] : 'Unknown');

                            // Check for conflict count logic - if not returned directly we might need to verify stats
                            // The API `safeQuery` select might need adjustment if we want conflict count here?
                            // `spineRoutes.get('/api/admin/spine/list')` returns mostly metadata.
                            // See `spineGenerator.ts` `storeDraftSpine` stores `generation_log`.

                            // Just showing what we have:
                            const hasConflicts = v.status === 'draft'; // Simplified assumption if we don't have exact count here without parsing JSON log

                            return (
                                <TableRow key={v.version}>
                                    <TableCell className="font-mono text-xs">{v.version}</TableCell>
                                    <TableCell className="capitalize">{subject}</TableCell>
                                    <TableCell>
                                        <Badge variant={v.status === 'approved' ? 'default' : 'secondary'}>
                                            {v.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{v.totalWeeks}</TableCell>
                                    <TableCell>
                                        {/* Ideally we'd show exact count, but let's assume if it's draft it might have issues */}
                                        {v.status === 'draft' ? (
                                            <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                                                Review Needed
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                Resolved
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {v.status === 'draft' && (
                                            <Button size="sm" variant="outline" onClick={() => onReviewConflicts(v.version)}>
                                                <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                                                Review
                                            </Button>
                                        )}
                                        <Button size="sm" variant="outline" onClick={() => onViewEntries(v.version, subject)}>
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </Button>
                                        {v.status === 'draft' && (
                                            <Button size="sm" onClick={() => handleApprove(v.version)}>
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Approve
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default SpineList;
