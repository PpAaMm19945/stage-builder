import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Book } from '@/types';
import { books as booksApi } from '@/lib/api';
import { BookCard } from './BookCard';
import { BookReader } from './BookReader';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from '@/contexts/AuthContext';
import { Book as BookIcon } from '@phosphor-icons/react';
import { PAPERBACK_BIBLE_BOOKS } from '@/data/bible-books';

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
        // We only want Paperback Bible books for now based on the prompt "For the entire library, let's keep the accordian thing... no wait... take out the book filters. Let's show books but this way."
        // Actually the prompt implies refactoring the whole library view.
        // "For the entire library... show books but this way."
        // So we keep all books, but group them.

        // Filter out hymnals/catechisms if they are in 'allBooks' but typically they are separate.
        // The previous code filtered: !b.renderFormat !== 'hymnal' ...

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

    // Define a custom sort order for known series
    const seriesOrder = [
        // Bible Categories
        'Bible - Pentateuch',
        'Bible - Historical Books',
        'Bible - Poetry',
        'Bible - Major Prophets',
        'Bible - Minor Prophets',
        'Bible - Gospels',
        'Bible - History (NT)',
        'Bible - Pauline Epistles',
        'Bible - General Epistles',
        'Bible - Prophecy',
        // Other potential series could go here or fallback to alphabetical
    ];

    const seriesNames = useMemo(() => {
        const keys = Object.keys(booksBySeries);
        return keys.sort((a, b) => {
            const indexA = seriesOrder.indexOf(a);
            const indexB = seriesOrder.indexOf(b);

            // If both are in the known list, sort by index
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            // If only A is in list, A comes first
            if (indexA !== -1) return -1;
            // If only B is in list, B comes first
            if (indexB !== -1) return 1;

            // Otherwise alphabetical
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
        <div className="space-y-8 pb-12">
            {/* Loading State */}
            {isLoading && (
                <div className="space-y-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-8 w-48" />
                            <div className="flex gap-4 overflow-x-hidden">
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <Skeleton key={j} className="h-64 w-48 flex-shrink-0" />
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
            {!isLoading && (
                <Accordion type="multiple" defaultValue={seriesNames} className="space-y-4">
                    {seriesNames.map(series => (
                        <AccordionItem key={series} value={series} className="border-none">
                            <AccordionTrigger className="hover:no-underline py-2">
                                <div className="flex flex-col items-start gap-1">
                                    <span className="text-xl font-semibold flex items-center gap-2">
                                        {series}
                                        <span className="text-sm font-normal text-muted-foreground">
                                            ({booksBySeries[series].length})
                                        </span>
                                    </span>
                                    {series.startsWith('Bible') && (
                                        <span className="text-xs text-muted-foreground font-normal">
                                            Audio provided by SermonAudio
                                        </span>
                                    )}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                {/* Horizontal Scroll Container */}
                                <div className="flex overflow-x-auto gap-4 pb-4 px-1 snap-x scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                                    {booksBySeries[series].map(book => (
                                        <div key={`${book.series}-${book.id}`} className="flex-shrink-0 w-[200px] snap-start">
                                            <BookCard
                                                book={book}
                                                onClick={handleBookClick}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}

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
