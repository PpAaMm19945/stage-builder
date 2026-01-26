import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Book } from '@/types';
import { books as booksApi } from '@/lib/api';
import { BookReader } from './BookReader';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { Book as BookIcon } from '@phosphor-icons/react';
import { PAPERBACK_BIBLE_BOOKS } from '@/data/bible-books';
import { CURTIS_KNAPP_BOOKS } from '@/data/curtis-knapp-books';
import { GuestBanner, useGuestViewTracker } from '@/components/library/GuestBanner';
import { BookSeriesRow } from './BookSeriesRow';
import { getSeriesDisplayName } from './book-utils';

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
        let books = [...allBooks, ...PAPERBACK_BIBLE_BOOKS, ...CURTIS_KNAPP_BOOKS];
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

    // Sort series with priority ordering
    const seriesNames = useMemo(() => {
        const keys = Object.keys(booksBySeries);
        const priorityOrder = [
            'The Paperback Bible',
            'the_paperback_bible',
            'My First Books',
            'my_first_books',
            'African Men of Faith',
            'african_men_of_faith',
        ];
        
        return keys.sort((a, b) => {
            const aIndex = priorityOrder.findIndex(p => a.toLowerCase().includes(p.toLowerCase()));
            const bIndex = priorityOrder.findIndex(p => b.toLowerCase().includes(p.toLowerCase()));
            
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            
            return getSeriesDisplayName(a).localeCompare(getSeriesDisplayName(b));
        });
    }, [booksBySeries]);

    const { trackView } = useGuestViewTracker();

    const handleBookClick = useCallback((book: Book) => {
        trackView();
        setSelectedBook(book);
    }, [trackView]);

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Unable to load books. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-12 w-full max-w-full overflow-x-hidden">
            {/* Loading State */}
            {isLoading && (
                <div className="space-y-8">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-7 w-48" />
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {Array.from({ length: 6 }).map((_, j) => (
                                    <div key={j} className="space-y-2">
                                        <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && displayBooks.length === 0 && (
                <div className="text-center py-16">
                    <BookIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" weight="duotone" />
                    <h3 className="text-lg font-semibold mb-2">No Books Found</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        Books are being added to the library. Check back soon!
                    </p>
                </div>
            )}

            {/* Books by Series */}
            {!isLoading && seriesNames.map(series => (
                <BookSeriesRow
                    key={series}
                    series={series}
                    books={booksBySeries[series]}
                    onBookClick={handleBookClick}
                />
            ))}

            {/* Book Reader Modal */}
            {/* ⚡ Performance: Conditionally render BookReader to avoid hook overhead when closed */}
            {selectedBook && (
                <BookReader
                    book={selectedBook}
                    open={!!selectedBook}
                    onOpenChange={(open) => !open && setSelectedBook(null)}
                    childrenIds={children.map(c => c.id)}
                />
            )}

            <GuestBanner />
        </div>
    );
}
