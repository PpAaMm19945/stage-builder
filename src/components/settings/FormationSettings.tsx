import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formation } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { BookOpen, PersonSimpleRun, HandsPraying } from '@phosphor-icons/react';

export function FormationSettings() {
    const queryClient = useQueryClient();

    const { data: preferences, isLoading } = useQuery({
        queryKey: ['formation-preferences'],
        queryFn: formation.getPreferences,
    });

    const mutation = useMutation({
        mutationFn: formation.updatePreferences,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['formation-preferences'] });
            queryClient.invalidateQueries({ queryKey: ['daily-rhythm'] });
            toast.success('Formation preferences updated');
        },
        onError: () => {
            toast.error('Failed to update preferences');
        },
    });

    const handleToggle = (key: 'activitiesEnabled' | 'readingEnabled' | 'liturgyEnabled', value: boolean) => {
        mutation.mutate({ [key]: value });
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Formation Preferences</CardTitle>
                <CardDescription>
                    Choose which formation streams your family practices. Disabled streams won't appear in your daily rhythm.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Activities Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <PersonSimpleRun className="h-5 w-5" weight="duotone" />
                        </div>
                        <div>
                            <Label htmlFor="activities-toggle" className="text-base font-medium">
                                Activities
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Domain-based learning activities from your weekly plan
                            </p>
                        </div>
                    </div>
                    <Switch
                        id="activities-toggle"
                        checked={preferences?.activitiesEnabled ?? true}
                        onCheckedChange={(checked) => handleToggle('activitiesEnabled', checked)}
                        disabled={mutation.isPending}
                    />
                </div>

                {/* Reading Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                            <BookOpen className="h-5 w-5" weight="duotone" />
                        </div>
                        <div>
                            <Label htmlFor="reading-toggle" className="text-base font-medium">
                                Read Aloud
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Daily family reading from curated books
                            </p>
                        </div>
                    </div>
                    <Switch
                        id="reading-toggle"
                        checked={preferences?.readingEnabled ?? true}
                        onCheckedChange={(checked) => handleToggle('readingEnabled', checked)}
                        disabled={mutation.isPending}
                    />
                </div>

                {/* Liturgy Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                            <HandsPraying className="h-5 w-5" weight="duotone" />
                        </div>
                        <div>
                            <Label htmlFor="liturgy-toggle" className="text-base font-medium">
                                Daily Liturgy
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Catechism, hymn, and scripture memory
                            </p>
                        </div>
                    </div>
                    <Switch
                        id="liturgy-toggle"
                        checked={preferences?.liturgyEnabled ?? true}
                        onCheckedChange={(checked) => handleToggle('liturgyEnabled', checked)}
                        disabled={mutation.isPending}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
