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
import { CURTIS_KNAPP_BOOKS } from '@/data/curtis-knapp-books';
import { Button } from '@/components/ui/button';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

interface BookLibraryProps {
    initialStage?: string;
}

// Utility: Convert snake_case or kebab-case to Title Case
function toTitleCase(str: string): string {
    if (!str) return '';
    return str
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}

// Series display name mapping for known series
const SERIES_DISPLAY_NAMES: Record<string, string> = {
    'my_first_books': 'My First Books',
    'african_men_of_faith': 'African Men of Faith',
    'the_paperback_bible': 'The Paperback Bible',
    'pastor_curtis_knapp': 'Selected Works: Booklets on Doctrine, Family, and the Christian Walk',
    'sanyus_growing_heart': "Sanyu's Growing Heart",
    'reformed-hymns': 'Reformed Hymns',
    'catechism': 'Catechism',
};

function getSeriesDisplayName(series: string): string {
    const lower = series.toLowerCase();
    return SERIES_DISPLAY_NAMES[lower] || SERIES_DISPLAY_NAMES[series] || toTitleCase(series);
}

// Check if a series contains primarily picture books (landscape)
function isLandscapeSeries(series: string): boolean {
    const s = series.toLowerCase();
    // Heuristic keyword match (more robust than enumerating every series)
    return (
        s.includes('my_first_books') ||
        s.includes('my first books') ||
        s.includes('african_men_of_faith') ||
        s.includes('african men of faith') ||
        s.includes('sanyus_growing_heart') ||
        s.includes("sanyu's growing heart") ||
        s.includes('gospel') ||
        s.includes('working_fathers_of_soroti') ||
        s.includes('working fathers')
    );
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
        <div className="space-y-10 pb-12 overflow-x-hidden">
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
            {!isLoading && seriesNames.map(series => {
                const displayName = getSeriesDisplayName(series);
                const isLandscape = isLandscapeSeries(series);
                const isPaperbackBible = series.toLowerCase().includes('paperback');
                
                return (
                    <section key={series} className="space-y-4">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    {displayName}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        ({booksBySeries[series].length})
                                    </span>
                                </h2>
                                {isPaperbackBible && (
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        PDFs provided by SermonAudio
                                    </p>
                                )}
                            </div>

                            {isPaperbackBible && (
                                <Button variant="outline" size="sm" asChild className="gap-2 h-8 shrink-0">
                                    <a href="https://www.paperbackbible.com/" target="_blank" rel="noopener noreferrer">
                                        Visit Store
                                        <ArrowSquareOut className="h-4 w-4" />
                                    </a>
                                </Button>
                            )}
                        </div>

                        {/* Carousel for horizontal scrolling - contained within parent */}
                        <Carousel
                            opts={{
                                align: "start",
                                dragFree: true,
                            }}
                             // overflow hidden is critical so nav buttons (which sit outside) don't create page-wide horizontal scroll
                             className="w-full group relative overflow-hidden"
                        >
                            {/*
                              The base CarouselContent applies `-ml-4` (from the shared UI component).
                              On small screens, that negative margin can easily cause the *entire page* to overflow.
                              We override it to `ml-0` on mobile, then restore the negative margin from sm+.
                            */}
                            <CarouselContent className="ml-0 sm:-ml-4">
                                {booksBySeries[series].map(book => (
                                    <CarouselItem 
                                        key={`${book.series}-${book.id}`} 
                                        className={`pl-0 sm:pl-4 ${
                                            // Mobile: show exactly 1 landscape card at a time (fits within viewport)
                                            // Desktop: progressively show more cards.
                                            isLandscape 
                                                ? 'basis-[92%] sm:basis-[45%] md:basis-1/3 lg:basis-1/4 xl:basis-1/5'
                                                : 'basis-[48%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-[14%]'
                                        }`}
                                    >
                                        <BookCard
                                            book={book}
                                            onClick={handleBookClick}
                                            landscape={isLandscape}
                                        />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-0 z-10 opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-0 shadow-lg" />
                            <CarouselNext className="right-0 z-10 opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-0 shadow-lg" />
                        </Carousel>
                    </section>
                );
            })}

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
