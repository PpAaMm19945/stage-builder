
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import api from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";
import { SpineConflict } from '@/types/admin-ai';

interface ConflictResolverProps {
    version: string;
    onComplete: () => void;
}

const ConflictResolver: React.FC<ConflictResolverProps> = ({ version, onComplete }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [conflicts, setConflicts] = useState<SpineConflict[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedId, setSelectedId] = useState<string>('');

    useEffect(() => {
        loadConflicts();
    }, [version]);

    const loadConflicts = async () => {
        try {
            setLoading(true);
            const res = await api.adminAi.getSpineConflicts(version);
            setConflicts(res.conflicts || []);
            if ((res.conflicts || []).length === 0) {
                onComplete();
            }
        } catch (error) {
            toast({ title: "Failed to load conflicts", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!selectedId) return;

        const currentConflict = conflicts[currentIndex];
        try {
            setLoading(true);
            await api.adminAi.resolveSpineConflict({
                version,
                weekNumber: currentConflict.week,
                selectedDraftId: selectedId
            });

            toast({ title: "Conflict resolved" });

            if (currentIndex < conflicts.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setSelectedId('');
            } else {
                toast({ title: "All conflicts resolved!", description: "You can now approve this version." });
                onComplete();
            }
        } catch (error) {
            toast({ title: "Failed to resolve", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (loading && conflicts.length === 0) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    if (conflicts.length === 0) return (
        <Card className="text-center p-8">
            <CardContent className="flex flex-col items-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-xl font-bold">No Conflicts Found</h3>
                <p className="text-muted-foreground">This spine version has full consensus.</p>
                <Button className="mt-4" onClick={onComplete}>Back to List</Button>
            </CardContent>
        </Card>
    );

    const conflict = conflicts[currentIndex];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Reviewing Conflicts ({currentIndex + 1} / {conflicts.length})</h2>
                <Button variant="outline" onClick={onComplete}>Exit Review</Button>
            </div>

            <Card className="border-red-200 bg-red-50/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        Week {conflict.week}
                    </CardTitle>
                    <CardDescription>
                        {conflict.description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                        <Badge variant={conflict.severity === 'high' ? 'destructive' : conflict.severity === 'medium' ? 'default' : 'secondary'}>
                            {conflict.severity} severity
                        </Badge>
                        {conflict.resolved && <Badge variant="outline">Resolved</Badge>}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 pt-6">
                    <Button variant="ghost" onClick={() => setSelectedId('')}>Reset</Button>
                    <Button
                        onClick={handleResolve}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                        Resolve & Next
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ConflictResolver;
