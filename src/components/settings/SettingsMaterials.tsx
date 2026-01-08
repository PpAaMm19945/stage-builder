import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    PaintBrush,
    MagnifyingGlass,
    CaretDown,
    CaretUp,
    CircleNotch
} from '@phosphor-icons/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materials } from '@/lib/api';
import { toast } from 'sonner';
import { MaterialItem } from '@/types';
import { cn } from '@/lib/utils';

export function SettingsMaterials() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');

    // Local state for optimistic updates
    const [localMaterials, setLocalMaterials] = useState<MaterialItem[]>([]);
    const [hasChanges, setHasChanges] = useState(false);

    const { data: serverMaterials, isLoading } = useQuery({
        queryKey: ['materials'],
        queryFn: async () => {
            const data = await materials.list();
            setLocalMaterials(data);
            setHasChanges(false);
            return data;
        }
    });

    const updateMaterialsMutation = useMutation({
        mutationFn: materials.updateBatch,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['materials'] });
            toast.success('Material settings updated');
            setHasChanges(false);
        },
        onError: () => {
            toast.error('Failed to update materials');
        }
    });

    const handleToggle = (name: string, checked: boolean) => {
        setLocalMaterials(prev => prev.map(m => {
            if (m.name !== name) return m;
            // Simple logic: true -> 'have', false -> 'not_interested'
            return { ...m, status: checked ? 'have' : 'not_interested' };
        }));
        setHasChanges(true);
    };

    const handleSave = () => {
        updateMaterialsMutation.mutate(localMaterials);
    };

    // Group materials by category (simplified logic if category field existed, else alphabetical chunks)
    // Since we don't have explicit categories in MaterialItem, we'll try to guess or just list them.
    // Actually, looking at the previous file, there was no category logic.
    // Let's implement a simple "Common" vs "Other" if possible, or just alphabetical with search.
    // We'll stick to alphabetical with search for now, but maybe add a "Core Kit" section if we knew what was core.

    const filteredMaterials = useMemo(() => {
        if (!localMaterials) return [];
        return localMaterials
            .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [localMaterials, searchQuery]);

    // Pagination / Show More logic
    const [showAll, setShowAll] = useState(false);
    const INITIAL_COUNT = 10;
    const visibleMaterials = showAll ? filteredMaterials : filteredMaterials.slice(0, INITIAL_COUNT);

    if (isLoading) {
        return (
            <Card className="min-h-[200px] flex items-center justify-center">
                <CircleNotch className="h-8 w-8 animate-spin text-muted-foreground" />
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <PaintBrush className="h-5 w-5" />
                            Materials
                        </CardTitle>
                        <CardDescription>
                            Tell us what you have so we can recommend activities you can actually do.
                        </CardDescription>
                    </div>
                    {hasChanges && (
                        <Button onClick={handleSave} disabled={updateMaterialsMutation.isPending} size="sm" className="shrink-0 animate-in fade-in slide-in-from-right-5">
                            {updateMaterialsMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Search */}
                <div className="relative">
                    <MagnifyingGlass className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search materials..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* List */}
                <div className="space-y-2">
                    {visibleMaterials.map(m => (
                        <div key={m.name} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                            <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {m.name}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "text-xs font-medium transition-colors",
                                    m.status === 'have' ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                                )}>
                                    {m.status === 'have' ? 'Have' : 'Missing'}
                                </span>
                                <Switch
                                    checked={m.status === 'have'}
                                    onCheckedChange={(checked) => handleToggle(m.name, checked)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Show More */}
                {filteredMaterials.length > INITIAL_COUNT && (
                    <div className="flex justify-center pt-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)} className="gap-2">
                            {showAll ? (
                                <>
                                    Show Less <CaretUp />
                                </>
                            ) : (
                                <>
                                    Show All ({filteredMaterials.length - INITIAL_COUNT} more) <CaretDown />
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {/* Empty State */}
                {filteredMaterials.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No materials found matching "{searchQuery}"
                    </div>
                )}

            </CardContent>
        </Card>
    );
}
