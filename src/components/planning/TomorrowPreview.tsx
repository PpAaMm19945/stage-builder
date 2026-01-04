import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CalendarBlank, CaretDown, CaretUp, WarningCircle, ArrowsClockwise, X } from '@phosphor-icons/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';

export function TomorrowPreview() {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch preview data
    const { data: preview, isLoading } = useQuery({
        queryKey: ['tomorrow-preview'],
        queryFn: async () => {
            const res = await api.family.getTomorrowPreview();
            return res;
        },
        enabled: isOpen, // Only fetch when opened
        staleTime: 5 * 60 * 1000 // Cache for 5 minutes
    });

    // Skip activity mutation
    const skipMutation = useMutation({
        mutationFn: async (activityId: string) => {
            // Create a "skip" override for tomorrow
            const tomorrow = addDays(new Date(), 1).toISOString().split('T')[0];
            return api.overrides.create({
                overrideType: 'schedule',
                description: `Skipped activity for ${tomorrow}`,
                constraints: {
                    exclude_activity_id: activityId,
                    date: tomorrow
                }
            });
        },
        onSuccess: () => {
            toast({ title: 'Activity skipped', description: "We've updated tomorrow's plan." });
            queryClient.invalidateQueries({ queryKey: ['tomorrow-preview'] });
        },
        onError: () => {
            toast({ title: 'Failed to skip', variant: 'destructive' });
        }
    });

    if (!isOpen) {
        return (
            <Button
                variant="outline"
                className="w-full justify-between group border-dashed"
                onClick={() => setIsOpen(true)}
            >
                <span className="flex items-center gap-2">
                    <CalendarBlank className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    Peek at Tomorrow
                </span>
                <CaretDown className="h-4 w-4 text-muted-foreground" />
            </Button>
        );
    }

    return (
        <Card className="border-dashed border-2">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 bg-muted/20">
                <div className="flex items-center gap-2">
                    <CalendarBlank className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-medium">Tomorrow's Plan</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                    <CaretUp className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) : preview ? (
                    <>
                        <div className="bg-primary/5 p-3 rounded-md text-sm text-primary-800 dark:text-primary-200">
                             {/* AI Summary would go here */}
                             <p>{preview.summary || "Here is a look at what is planned for tomorrow."}</p>
                        </div>

                        {preview.restDay ? (
                            <div className="text-center py-4 text-muted-foreground">
                                <p>Tomorrow is a rest day! No scheduled activities.</p>
                            </div>
                        ) : preview.activities && preview.activities.length > 0 ? (
                            <div className="space-y-3">
                                {preview.activities.map((activity: any) => (
                                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-card border rounded-lg shadow-sm">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-medium text-sm truncate">{activity.title}</h4>
                                                <Badge variant="secondary" className="text-[10px] h-4 px-1">{activity.domain}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{activity.description}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                            onClick={() => skipMutation.mutate(activity.id)}
                                            disabled={skipMutation.isPending}
                                            title="Skip this activity"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-4 text-muted-foreground">
                                <p>No activities planned yet. Check your schedule settings.</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-4 text-muted-foreground">
                        <WarningCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Could not load preview.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
