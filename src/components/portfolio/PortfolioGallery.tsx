import { useEffect, useState } from 'react';
import { portfolio } from '@/lib/api';
import { SpinnerGap, Trash, FileText, FileAudio, Image as ImageIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { PortfolioItem } from '@/types';

interface PortfolioGalleryProps {
    studentId: string;
    refreshTrigger: number;
}

export function PortfolioGallery({ studentId, refreshTrigger }: PortfolioGalleryProps) {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadItems();
    }, [studentId, refreshTrigger]);

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await portfolio.listItems(studentId);
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

    if (loading) {
        return <div className="flex justify-center p-8"><SpinnerGap className="h-8 w-8 animate-spin" /></div>;
    }

    if (items.length === 0) {
        return <div className="text-center p-8 text-muted-foreground">No items in portfolio yet.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                        <CardTitle className="text-lg flex justify-between items-start gap-2">
                            <span className="truncate">{item.title}</span>
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
                            <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                        )}
                        {item.domain && (
                            <div className="mt-2">
                                <span className="text-xs bg-secondary px-2 py-1 rounded-full capitalize">{item.domain.replace(/_/g, ' ')}</span>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash className="h-4 w-4 mr-1" /> Delete
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
