import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { overrides } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
    Funnel,
    Trash,
    Plus,
    MagicWand,
    CheckCircle,
    WarningCircle,
    X,
    CaretRight,
    CaretDown
} from '@phosphor-icons/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ParentOverride, ParsedOverrideResponse, OverrideType } from '@/types';

export function OverrideManager() {
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [parsedResult, setParsedResult] = useState<ParsedOverrideResponse | null>(null);
    const [isParsing, setIsParsing] = useState(false);

    // Fetch Overrides
    const { data: activeOverrides, isLoading } = useQuery({
        queryKey: ['overrides'],
        queryFn: overrides.list,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: overrides.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['overrides'] });
            toast.success('Accommodation added successfully');
            setIsAddOpen(false);
            setDescription('');
            setParsedResult(null);
        },
        onError: (err: any) => {
            toast.error('Failed to create override', { description: err.message });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => overrides.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['overrides'] });
            toast.success('Updated successfully');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: overrides.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['overrides'] });
            toast.success('Removed accommodation');
        }
    });

    const handleParse = async () => {
        if (!description.trim()) return;
        setIsParsing(true);
        try {
            const result = await overrides.parse(description);
            setParsedResult(result);
        } catch (err: any) {
            toast.error('Failed to analyze text', { description: err.message });
        } finally {
            setIsParsing(false);
        }
    };

    const handleSaveParsed = () => {
        if (!parsedResult) return;
        createMutation.mutate({
            overrideType: parsedResult.parsed.overrideType,
            description: parsedResult.originalText,
            constraints: parsedResult.parsed.constraints
        });
    };

    const getTypeColor = (type: OverrideType) => {
        switch (type) {
            case 'sensory': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
            case 'motor': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'schedule': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800';
            case 'content': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
            case 'pacing': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Active Accommodations</h3>
                    <p className="text-sm text-muted-foreground">Adjust the curriculum to fit your child's needs.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add New
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add Accommodation</DialogTitle>
                            <DialogDescription>
                                Describe your child's needs in plain English. AI will configure the settings for you.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Textarea
                                    placeholder="e.g. 'My child gets overwhelmed by loud noises' or 'Limit sessions to 10 minutes'"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>

                            {parsedResult && (
                                <div className="bg-muted/50 rounded-lg p-3 space-y-3 border">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <MagicWand className="w-4 h-4 text-purple-500" />
                                        <span>AI Analysis</span>
                                        <Badge variant="outline" className="ml-auto text-xs">
                                            {Math.round(parsedResult.parsed.confidence * 100)}% Confidence
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex gap-2">
                                            <span className="text-muted-foreground w-16">Type:</span>
                                            <Badge variant="secondary" className="capitalize">{parsedResult.parsed.overrideType}</Badge>
                                        </div>

                                        {Object.entries(parsedResult.parsed.constraints).map(([key, value]) => (
                                            value && (
                                                <div key={key} className="flex gap-2">
                                                    <span className="text-muted-foreground w-16 truncate" title={key}>{key.replace('exclude_', 'No ').replace('require_', 'Must ')}:</span>
                                                    <span className="font-mono text-xs">{JSON.stringify(value)}</span>
                                                </div>
                                            )
                                        ))}
                                    </div>

                                    {parsedResult.requiresConfirmation && (
                                        <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-2 rounded text-xs">
                                            <WarningCircle className="w-4 h-4 mt-0.5" />
                                            <div>
                                                <p className="font-medium">Please confirm this is correct.</p>
                                                {parsedResult.parsed.clarification_needed && (
                                                    <p className="mt-1 opacity-90">{parsedResult.parsed.clarification_needed}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="flex-col sm:justify-between sm:flex-row gap-2">
                            {!parsedResult ? (
                                <Button onClick={handleParse} disabled={!description.trim() || isParsing} className="w-full">
                                    {isParsing ? 'Analyzing...' : 'Analyze with AI'}
                                    {!isParsing && <MagicWand className="w-4 h-4 ml-2" />}
                                </Button>
                            ) : (
                                <div className="flex gap-2 w-full">
                                    <Button variant="outline" onClick={() => setParsedResult(null)} className="flex-1">Back</Button>
                                    <Button onClick={handleSaveParsed} className="flex-1">Confirm & Save</Button>
                                </div>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-3">
                {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading accommodations...</div>
                ) : activeOverrides?.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Funnel className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium">No accommodations set</p>
                        <p className="text-sm text-muted-foreground mb-4">Standard curriculum applies.</p>
                        <Button variant="outline" onClick={() => setIsAddOpen(true)}>Create First Override</Button>
                    </div>
                ) : (
                    activeOverrides?.map((override: ParentOverride) => (
                        <Card key={override.id} className={`overflow-hidden transition-all ${!override.isActive ? 'opacity-60 grayscale' : ''}`}>
                            <div className="p-4 flex items-start gap-4">
                                <div className={`mt-1 p-2 rounded-lg border ${getTypeColor(override.overrideType)}`}>
                                    <Funnel className="w-5 h-5" weight="duotone" />
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium line-clamp-1">{override.description}</h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-semibold tracking-wider ${getTypeColor(override.overrideType)}`}>
                                                {override.overrideType}
                                            </span>
                                        </div>
                                        <Switch
                                            checked={override.isActive}
                                            onCheckedChange={(checked) => updateMutation.mutate({ id: override.id, data: { isActive: checked } })}
                                        />
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        Created {new Date(override.createdAt).toLocaleDateString()}
                                        {override.studentId && <span> • Specific Child Only</span>}
                                    </div>

                                    <Collapsible className="mt-2">
                                        <CollapsibleTrigger className="fle x items-center gap-1 text-xs text-primary hover:underline">
                                            View Technical Constraints <CaretDown className="w-3 h-3" />
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="mt-2 text-xs font-mono bg-muted/50 p-2 rounded">
                                            {JSON.stringify(override.constraints, null, 2)}
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:bg-destructive/10 -mr-2"
                                    onClick={() => deleteMutation.mutate(override.id)}
                                >
                                    <Trash className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
