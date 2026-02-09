
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import api from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";

interface SpineGenerationFormProps {
    onSuccess: (version: string) => void;
}

const SpineGenerationForm: React.FC<SpineGenerationFormProps> = ({ onSuccess }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [subject, setSubject] = useState<string>('literacy');
    const [stage, setStage] = useState<string>('sprout');
    const [startWeek, setStartWeek] = useState<number>(1);
    const [endWeek, setEndWeek] = useState<number>(52);

    const handleGenerate = async () => {
        try {
            setLoading(true);
            const res = await api.adminAi.generateSpine({
                subject,
                stage,
                startWeek,
                endWeek
            });

            if (res.success) {
                toast({
                    title: "Sequence generated",
                    description: res.message,
                });
                onSuccess(res.version);
            }
        } catch (error: any) {
            toast({
                title: "Generation failed",
                description: error.message || "Unknown error",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    Generate Standard Sequence
                </CardTitle>
                <CardDescription>
                    Generate a research-backed scope & sequence for a subject and stage. One AI call retrieves standard developmental milestones.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Subject</Label>
                        <Select value={subject} onValueChange={setSubject}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="literacy">Literacy</SelectItem>
                                <SelectItem value="numeracy">Numeracy</SelectItem>
                                <SelectItem value="formation">Formation</SelectItem>
                                <SelectItem value="motor">Motor Skills</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Stage</Label>
                        <Select value={stage} onValueChange={setStage}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="seedling">Seedling (0-2)</SelectItem>
                                <SelectItem value="sprout">Sprout (2-4)</SelectItem>
                                <SelectItem value="sapling">Sapling (4-7)</SelectItem>
                                <SelectItem value="tree">Tree (7+)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Start Week</Label>
                        <Input
                            type="number"
                            min={1}
                            value={startWeek}
                            onChange={(e) => setStartWeek(parseInt(e.target.value))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>End Week</Label>
                        <Input
                            type="number"
                            min={startWeek}
                            max={52}
                            value={endWeek}
                            onChange={(e) => setEndWeek(parseInt(e.target.value))}
                        />
                    </div>
                </div>

                <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleGenerate}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating sequence...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Sequence
                        </>
                    )}
                </Button>

                {loading && (
                    <p className="text-xs text-center text-muted-foreground animate-pulse">
                        Retrieving standard developmental milestones...
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default SpineGenerationForm;
