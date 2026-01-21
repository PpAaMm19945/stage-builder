import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Book } from '@/types';
import { books as booksApi } from '@/lib/api';
import { BookCard } from './BookCard';
import { BookReader } from './BookReader';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { Book as BookIcon, ArrowSquareOut } from '@phosphor-icons/react';
import { PAPERBACK_BIBLE_BOOKS } from '@/data/bible-books';
import { Button } from '@/components/ui/button';

interface BookLibraryProps {
    initialStage?: string;
}

export function BookLibrary({ initialStage }: BookLibraryProps) {
    const { children } = useAuth();
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    // Fetch ALL books without age filtering
    const { data: allBooks = [], isLoading, error } = useQuery({
        queryKey: ['books', 'all'],
        queryFn: () => booksApi.list({}),
    });

    // Combine API books and Local Bible books
    const displayBooks = useMemo(() => {
        let books = [...allBooks, ...PAPERBACK_BIBLE_BOOKS];
        books = books.filter(b =>
            b.renderFormat !== 'hymnal' &&
            b.renderFormat !== 'catechism'
        );
        return books;
    }, [allBooks]);

    // Group books by series
    const booksBySeries = useMemo(() => {
        return displayBooks.reduce((acc, book) => {
            const series = book.series || 'Other';
            if (!acc[series]) acc[series] = [];
            acc[series].push(book);
            return acc;
        }, {} as Record<string, Book[]>);
    }, [displayBooks]);

    const seriesNames = useMemo(() => {
        const keys = Object.keys(booksBySeries);
        // Ensure Paperback Bible comes first or has specific order if desired
        // For now, simple sort, but Paperback Bible usually starts with 'The' -> T
        return keys.sort((a, b) => {
            if (a === 'The Paperback Bible') return -1;
            if (b === 'The Paperback Bible') return 1;
            return a.localeCompare(b);
        });
    }, [booksBySeries]);

    const handleBookClick = useCallback((book: Book) => {
        setSelectedBook(book);
    }, []);

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Unable to load books. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-12">
            {/* Loading State */}
            {isLoading && (
                <div className="space-y-8">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-8 w-48" />
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {Array.from({ length: 6 }).map((_, j) => (
                                    <Skeleton key={j} className="aspect-[3/4] w-full" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && displayBooks.length === 0 && (
                <div className="text-center py-12">
                    <BookIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" weight="duotone" />
                    <h3 className="text-lg font-medium mb-2">No Books Found</h3>
                    <p className="text-muted-foreground">
                        Books are being added. Check back soon!
                    </p>
                </div>
            )}

            {/* Books by Series */}
            {!isLoading && seriesNames.map(series => (
                <div key={series} className="space-y-4">
                    <div className="flex items-end justify-between px-1">
                        <div>
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                {series}
                                <span className="text-sm font-normal text-muted-foreground">
                                    ({booksBySeries[series].length})
                                </span>
                            </h2>
                            {series === 'The Paperback Bible' && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    PDFs provided by SermonAudio
                                </p>
                            )}
                        </div>

                        {series === 'The Paperback Bible' && (
                            <Button variant="outline" size="sm" asChild className="gap-2 h-8">
                                <a href="https://www.paperbackbible.com/" target="_blank" rel="noopener noreferrer">
                                    Visit Store
                                    <ArrowSquareOut className="h-4 w-4" />
                                </a>
                            </Button>
                        )}
                    </div>

                    {/* Grid Container */}
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-1">
                        {booksBySeries[series].map(book => (
                            <BookCard
                                key={`${book.series}-${book.id}`}
                                book={book}
                                onClick={handleBookClick}
                            />
                        ))}
                    </div>
                </div>
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
