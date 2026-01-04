import { useEffect, useState } from 'react';
import { portfolio } from '@/lib/api';
import { SpinnerGap, Trash, FileText, FileAudio, Image as ImageIcon, Star, FunnelSimple, Calendar, Folder, Files } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { PortfolioItem, DOMAIN_LABELS, EarlyYearsDomain } from '@/types';

interface PortfolioFilters {
    domain?: string;
    itemType?: 'image' | 'audio' | 'document' | 'text';
    timePeriod?: 'week' | 'month' | 'year' | 'all';
    milestoneOnly?: boolean;
}

interface PortfolioGalleryProps {
    studentId: string;
    refreshTrigger: number;
}

export function PortfolioGallery({ studentId, refreshTrigger }: PortfolioGalleryProps) {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<PortfolioFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadItems();
    }, [studentId, refreshTrigger, filters]);

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await portfolio.listItems(studentId, filters);
            setItems(data);
        } catch (error) {
            console.error('Failed to load portfolio items', error);
            toast({
                title: 'Error',
                description: 'Failed to load portfolio items',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await portfolio.deleteItem(id);
            setItems(items.filter(item => item.id !== id));
            toast({
                title: 'Success',
                description: 'Item deleted',
            });
        } catch (error) {
            console.error('Failed to delete item', error);
            toast({
                title: 'Error',
                description: 'Failed to delete item',
                variant: 'destructive',
            });
        }
    };

    const updateFilter = <K extends keyof PortfolioFilters>(key: K, value: PortfolioFilters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({});
    };

    const hasActiveFilters = Object.values(filters).some(v => v);

    return (
        <div className="space-y-4">
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant={showFilters ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <FunnelSimple className="h-4 w-4 mr-2" />
                    Filters
                    {hasActiveFilters && <Badge variant="default" className="ml-2 h-5 px-1.5">Active</Badge>}
                </Button>

                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear filters
                    </Button>
                )}

                <Button
                    variant={filters.milestoneOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter('milestoneOnly', !filters.milestoneOnly)}
                >
                    <Star className="h-4 w-4 mr-2" weight={filters.milestoneOnly ? "fill" : "regular"} />
                    Milestones Only
                </Button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
                <Card className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Domain Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Folder className="h-4 w-4" /> Subject
                            </label>
                            <Select
                                value={filters.domain || 'all'}
                                onValueChange={(v) => updateFilter('domain', v === 'all' ? undefined : v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All subjects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subjects</SelectItem>
                                    <SelectItem value="wisdom">Wisdom (Cognitive)</SelectItem>
                                    <SelectItem value="stature">Stature (Physical)</SelectItem>
                                    <SelectItem value="favor_with_god">Favor with God</SelectItem>
                                    <SelectItem value="favor_with_man">Favor with Man</SelectItem>
                                    <SelectItem value="foundations">Foundations</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Item Type Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Files className="h-4 w-4" /> Type
                            </label>
                            <Select
                                value={filters.itemType || 'all'}
                                onValueChange={(v) => updateFilter('itemType', v === 'all' ? undefined : v as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="image">Images</SelectItem>
                                    <SelectItem value="audio">Audio</SelectItem>
                                    <SelectItem value="document">Documents</SelectItem>
                                    <SelectItem value="text">Text</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Time Period Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Time
                            </label>
                            <Select
                                value={filters.timePeriod || 'all'}
                                onValueChange={(v) => updateFilter('timePeriod', v === 'all' ? undefined : v as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="week">This Week</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                    <SelectItem value="year">This Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center p-8">
                    <SpinnerGap className="h-8 w-8 animate-spin" />
                </div>
            )}

            {/* Empty State */}
            {!loading && items.length === 0 && (
                <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    {hasActiveFilters
                        ? "No items match your filters. Try adjusting or clearing them."
                        : "No items in portfolio yet. Add your first item to start documenting growth."
                    }
                </div>
            )}

            {/* Gallery Grid */}
            {!loading && items.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                        <Card key={item.id} className="overflow-hidden group">
                            <CardHeader className="p-4">
                                <CardTitle className="text-lg flex justify-between items-start gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        {item.milestoneTag && (
                                            <Star className="h-4 w-4 text-amber-500 flex-shrink-0" weight="fill" />
                                        )}
                                        <span className="truncate">{item.title}</span>
                                    </div>
                                    <span className="text-xs font-normal text-muted-foreground whitespace-nowrap">
                                        {format(new Date(item.createdAt), 'MMM d, yyyy')}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4 overflow-hidden relative">
                                    {item.itemType === 'image' && item.publicUrl ? (
                                        <img src={item.publicUrl} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-muted-foreground">
                                            {item.itemType === 'audio' && <FileAudio className="h-12 w-12 mb-2" />}
                                            {item.itemType === 'document' && <FileText className="h-12 w-12 mb-2" />}
                                            {item.itemType === 'text' && <FileText className="h-12 w-12 mb-2" />}
                                            {item.itemType === 'image' && !item.publicUrl && <ImageIcon className="h-12 w-12 mb-2" />}
                                            <span className="text-xs uppercase">{item.itemType}</span>
                                        </div>
                                    )}
                                    {item.publicUrl && item.itemType !== 'image' && (
                                        <a href={item.publicUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/5 hover:bg-black/10 transition-colors">
                                            <span className="sr-only">Open</span>
                                        </a>
                                    )}
                                </div>
                                {item.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{item.description}</p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    {item.domain && (
                                        <Badge variant="secondary" className="text-xs capitalize">
                                            {item.domain.replace(/_/g, ' ')}
                                        </Badge>
                                    )}
                                    {item.milestoneTag && (
                                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                                            {item.milestoneTag}
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash className="h-4 w-4 mr-1" /> Delete
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
