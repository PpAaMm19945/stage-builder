
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import api from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";

interface ConflictResolverProps {
    version: string;
    onComplete: () => void;
}

interface Conflict {
    week_number: number;
    subject: string;
    conflicting_entries: {
        draft_id: string;
        focus_area: string;
        skill_targets: string[];
    }[];
    suggested_resolution?: string;
}

const ConflictResolver: React.FC<ConflictResolverProps> = ({ version, onComplete }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [conflicts, setConflicts] = useState<Conflict[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedDraft, setSelectedDraft] = useState<string>('');

    useEffect(() => {
        loadConflicts();
    }, [version]);

    const loadConflicts = async () => {
        try {
            setLoading(true);
            const res = await api.adminAi.getSpineConflicts(version);
            setConflicts(res.conflicts || []);
            if (res.conflicts.length === 0) {
                onComplete();
            }
        } catch (error) {
            toast({ title: "Failed to load conflicts", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!selectedDraft) return;

        const currentConflict = conflicts[currentIndex];
        try {
            setLoading(true);
            await api.adminAi.resolveSpineConflict({
                version,
                weekNumber: currentConflict.week_number,
                selectedDraftId: selectedDraft
            });

            toast({ title: "Conflict resolved" });

            if (currentIndex < conflicts.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setSelectedDraft('');
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
                        Week {conflict.week_number}: {conflict.subject}
                    </CardTitle>
                    <CardDescription>
                        The AI generated distinct drafts for this week. Please select the best fit for our curriculum.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={selectedDraft} onValueChange={setSelectedDraft} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {conflict.conflicting_entries.map((entry) => (
                            <div key={entry.draft_id} className={`
                                border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors
                                ${selectedDraft === entry.draft_id ? 'border-primary ring-2 ring-primary bg-accent/50' : 'bg-card'}
                            `}>
                                <RadioGroupItem value={entry.draft_id} id={entry.draft_id} className="sr-only" />
                                <Label htmlFor={entry.draft_id} className="cursor-pointer space-y-3 block">
                                    <div className="flex justify-between items-center">
                                        <Badge variant="outline">{entry.draft_id}</Badge>
                                        {selectedDraft === entry.draft_id && <CheckCircle className="h-4 w-4 text-primary" />}
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Focus Area</span>
                                        <p className="font-medium text-lg leading-tight mt-1">{entry.focus_area}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skill Targets</span>
                                        <ul className="list-disc list-outside ml-4 text-sm mt-1 space-y-1 text-muted-foreground">
                                            {entry.skill_targets.map((skill, i) => (
                                                <li key={i}>{skill}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 pt-6">
                    <Button variant="ghost" onClick={() => setSelectedDraft('')}>Reset</Button>
                    <Button
                        onClick={handleResolve}
                        disabled={!selectedDraft || loading}
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
