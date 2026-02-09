
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import api from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";

interface SpineViewerProps {
    version: string;
    subject: string;
    onBack: () => void;
}

const SpineViewer: React.FC<SpineViewerProps> = ({ version, subject, onBack }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [entries, setEntries] = useState<any[]>([]);

    useEffect(() => {
        loadEntries();
    }, [version, subject]);

    const loadEntries = async () => {
        try {
            setLoading(true);
            const res = await api.adminAi.getSpineEntries(version, subject);
            setEntries(res.entries || []);
        } catch (error) {
            toast({ title: "Failed to load entries", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div className="flex flex-col">
                        <CardTitle className="text-xl capitalize">{subject} Curriculum</CardTitle>
                        <CardDescription>Version: {version}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Week</TableHead>
                            <TableHead className="w-[200px]">Focus Area</TableHead>
                            <TableHead>Skill Targets</TableHead>
                            <TableHead>Faith Framing</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries.map((entry) => (
                            <TableRow key={entry.id}>
                                <TableCell className="font-medium text-center bg-muted/50">{entry.weekNumber}</TableCell>
                                <TableCell className="font-semibold text-primary">{entry.focusArea}</TableCell>
                                <TableCell>
                                    <ul className="list-disc list-outside ml-4 text-xs text-muted-foreground space-y-1">
                                        {entry.skillTargets.map((skill: string, i: number) => (
                                            <li key={i}>{skill}</li>
                                        ))}
                                    </ul>
                                </TableCell>
                                <TableCell className="italic text-muted-foreground text-xs border-l pl-4">
                                    "{entry.faithFraming}"
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default SpineViewer;
