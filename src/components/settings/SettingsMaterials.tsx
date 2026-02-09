import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
    PaintBrush,
    MagnifyingGlass,
    CircleNotch,
    Check,
} from '@phosphor-icons/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { family } from '@/lib/api';
import { toast } from 'sonner';
import { MaterialItem } from '@/types';

// Default materials list — common items start as "have", specialty as "not_interested"
const DEFAULT_MATERIALS: { name: string; category: string; common: boolean }[] = [
    // Basics (common — default to "have")
    { name: 'Paper', category: 'Art & Craft', common: true },
    { name: 'Crayons', category: 'Art & Craft', common: true },
    { name: 'Colored Pencils', category: 'Art & Craft', common: true },
    { name: 'Markers', category: 'Art & Craft', common: true },
    { name: 'Glue Stick', category: 'Art & Craft', common: true },
    { name: 'Child-Safe Scissors', category: 'Art & Craft', common: true },
    { name: 'Construction Paper', category: 'Art & Craft', common: true },
    { name: 'Pencils', category: 'Art & Craft', common: true },
    // Learning
    { name: 'Books', category: 'Learning', common: true },
    { name: 'Bible', category: 'Learning', common: true },
    { name: 'Chalk', category: 'Learning', common: true },
    // Kitchen
    { name: 'Mixing Bowl', category: 'Kitchen', common: true },
    { name: 'Wooden Spoon', category: 'Kitchen', common: true },
    { name: 'Measuring Cups', category: 'Kitchen', common: true },
    // Specialty (uncommon — default to "not_interested")
    { name: 'Watercolors', category: 'Art & Craft', common: false },
    { name: 'Paintbrush', category: 'Art & Craft', common: false },
    { name: 'Play Dough', category: 'Art & Craft', common: false },
    { name: 'Clay', category: 'Art & Craft', common: false },
    { name: 'Yarn', category: 'Art & Craft', common: false },
    { name: 'Fabric Scraps', category: 'Art & Craft', common: false },
    { name: 'Blocks', category: 'Learning', common: false },
    { name: 'Counting Bears', category: 'Learning', common: false },
    { name: 'Alphabet Cards', category: 'Learning', common: false },
    { name: 'Number Cards', category: 'Learning', common: false },
    { name: 'Magnetic Letters', category: 'Learning', common: false },
    { name: 'Dry Erase Board', category: 'Learning', common: false },
    { name: 'Chalkboard', category: 'Learning', common: false },
    { name: 'Puzzles', category: 'Learning', common: false },
    { name: 'Magnifying Glass', category: 'Nature', common: false },
    { name: 'Watering Can', category: 'Nature', common: false },
    { name: 'Nature Journal', category: 'Nature', common: false },
    { name: 'Seeds', category: 'Nature', common: false },
    { name: 'Rolling Pin', category: 'Kitchen', common: false },
    { name: 'Cookie Cutters', category: 'Kitchen', common: false },
    { name: 'Muffin Tin', category: 'Kitchen', common: false },
    { name: 'Apron', category: 'Kitchen', common: false },
    { name: 'Baking Sheet', category: 'Kitchen', common: false },
];

function buildDefaultMaterials(): MaterialItem[] {
    return DEFAULT_MATERIALS.map(m => ({
        name: m.name,
        status: m.common ? 'have' : 'not_interested',
    }));
}

export function SettingsMaterials() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [localMaterials, setLocalMaterials] = useState<MaterialItem[]>([]);
    const [hasChanges, setHasChanges] = useState(false);

    const { data: serverMaterials, isLoading } = useQuery({
        queryKey: ['materials'],
        queryFn: async () => {
            try {
                const data = await family.getMaterials();
                return data;
            } catch {
                return [];
            }
        }
    });

    // Merge server data with defaults
    useEffect(() => {
        const defaults = buildDefaultMaterials();
        if (serverMaterials && serverMaterials.length > 0) {
            // Merge: server values override defaults
            const serverMap = new Map(serverMaterials.map(m => [m.name.toLowerCase(), m]));
            const merged = defaults.map(d => {
                const match = serverMap.get(d.name.toLowerCase());
                return match ? { ...d, status: match.status } : d;
            });
            // Add any server items not in defaults
            serverMaterials.forEach(s => {
                if (!defaults.find(d => d.name.toLowerCase() === s.name.toLowerCase())) {
                    merged.push(s);
                }
            });
            setLocalMaterials(merged);
        } else {
            setLocalMaterials(defaults);
        }
        setHasChanges(false);
    }, [serverMaterials]);

    const updateMaterialsMutation = useMutation({
        mutationFn: family.updateMaterials,
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
            return { ...m, status: checked ? 'have' : 'not_interested' };
        }));
        setHasChanges(true);
    };

    const handleSave = () => {
        updateMaterialsMutation.mutate(localMaterials);
    };

    // Group by category
    const categories = useMemo(() => {
        const categoryMap = new Map<string, MaterialItem[]>();
        const categoryLookup = new Map(DEFAULT_MATERIALS.map(m => [m.name.toLowerCase(), m.category]));

        const filtered = localMaterials
            .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

        filtered.forEach(m => {
            const cat = categoryLookup.get(m.name.toLowerCase()) || 'Other';
            if (!categoryMap.has(cat)) categoryMap.set(cat, []);
            categoryMap.get(cat)!.push(m);
        });

        return Array.from(categoryMap.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, [localMaterials, searchQuery]);

    const haveCount = localMaterials.filter(m => m.status === 'have').length;

    if (isLoading) {
        return (
            <Card className="min-h-[200px] flex items-center justify-center">
                <CircleNotch className="h-8 w-8 animate-spin text-muted-foreground" />
            </Card>
        );
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
                            Mark what you have at home. Activities will be matched to your supplies.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{haveCount}</span>/{localMaterials.length} items
                        </span>
                        {hasChanges && (
                            <Button onClick={handleSave} disabled={updateMaterialsMutation.isPending} size="sm" className="animate-in fade-in slide-in-from-right-5">
                                {updateMaterialsMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        )}
                    </div>
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

                {/* Categorized List */}
                {categories.map(([category, items]) => (
                    <div key={category} className="space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{category}</h3>
                        <div className="space-y-1">
                            {items.map(m => (
                                <div key={m.name} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        {m.status === 'have' && (
                                            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400 shrink-0" weight="bold" />
                                        )}
                                        <span className="text-sm font-medium">{m.name}</span>
                                    </div>
                                    <Switch
                                        checked={m.status === 'have'}
                                        onCheckedChange={(checked) => handleToggle(m.name, checked)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {categories.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No materials found matching "{searchQuery}"
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
