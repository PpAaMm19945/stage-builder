import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Book } from '@/types';
import { books as booksApi } from '@/lib/api';
import { BookCard } from './BookCard';
import { BookReader } from './BookReader';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

interface BookLibraryProps {
    initialStage?: string;
}

export function BookLibrary({ initialStage }: BookLibraryProps) {
    const { children } = useAuth();
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [stageFilter, setStageFilter] = useState<string>(initialStage || 'all');

    // Get youngest child's age for filtering
    const youngestAge = children.length > 0
        ? Math.min(...children.map(c => c.ageInMonths || 36))
        : undefined;

    const { data: allBooks = [], isLoading, error } = useQuery({
        queryKey: ['books', stageFilter, youngestAge],
        queryFn: () => booksApi.list({
            stage: stageFilter !== 'all' ? stageFilter : undefined,
            ageMonths: youngestAge,
        }),
    });

    // Group books by series
    const booksBySeries = allBooks.reduce((acc, book) => {
        const series = book.series || 'Other';
        if (!acc[series]) acc[series] = [];
        acc[series].push(book);
        return acc;
    }, {} as Record<string, Book[]>);

    const seriesNames = Object.keys(booksBySeries).sort();

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Unable to load books. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex items-center gap-4">
                <Select value={stageFilter} onValueChange={setStageFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by stage" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Stages</SelectItem>
                        <SelectItem value="early-years">Early Years</SelectItem>
                        <SelectItem value="lower-primary">Lower Primary</SelectItem>
                    </SelectContent>
                </Select>

                {youngestAge && (
                    <span className="text-sm text-muted-foreground">
                        Showing books for ages {Math.floor(youngestAge / 12)}+ years
                    </span>
                )}
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="aspect-[3/4] rounded-lg" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && allBooks.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-4xl mb-4">📚</p>
                    <h3 className="text-lg font-medium mb-2">No Books Found</h3>
                    <p className="text-muted-foreground">
                        {stageFilter !== 'all'
                            ? 'Try removing the filter to see all available books.'
                            : 'Books are being added. Check back soon!'}
                    </p>
                </div>
            )}

            {/* Book Grid by Series */}
            {!isLoading && seriesNames.map(series => (
                <section key={series} className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <span className="text-primary">📖</span>
                        {series}
                        <span className="text-sm font-normal text-muted-foreground">
                            ({booksBySeries[series].length} {booksBySeries[series].length === 1 ? 'book' : 'books'})
                        </span>
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {booksBySeries[series].map(book => (
                            <BookCard
                                key={`${book.series}-${book.id}`}
                                book={book}
                                onClick={() => setSelectedBook(book)}
                            />
                        ))}
                    </div>
                </section>
            ))}

            {/* Book Reader Modal */}
            <BookReader
                book={selectedBook}
                open={!!selectedBook}
                onOpenChange={(open) => !open && setSelectedBook(null)}
                childrenIds={children.map(c => c.id)}
            />
        </div>
    );
}
