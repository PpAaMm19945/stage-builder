import { memo } from 'react';
import { Book } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowSquareOut } from '@phosphor-icons/react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { BookCard } from './BookCard';
import { getSeriesDisplayName, isLandscapeSeries } from './book-utils';

interface BookSeriesRowProps {
    series: string;
    books: Book[];
    onBookClick: (book: Book) => void;
    allowCoverResolution?: boolean;
}

export const BookSeriesRow = memo(function BookSeriesRow({ series, books, onBookClick, allowCoverResolution = true }: BookSeriesRowProps) {
    const displayName = getSeriesDisplayName(series);
    const isLandscape = isLandscapeSeries(series);
    const isPaperbackBible = series.toLowerCase().includes('paperback');

    return (
        <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        {displayName}
                        <span className="text-sm font-normal text-muted-foreground">
                            ({books.length})
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
                            <span className="sr-only">(opens in a new tab)</span>
                        </a>
                    </Button>
                )}
            </div>

            {/* Carousel wrapper with overflow clip */}
            <div className="w-full overflow-hidden -mx-4 px-4">
                <Carousel
                    opts={{
                        align: "start",
                        dragFree: false, // Snap scrolling for Netflix feel
                        containScroll: "trimSnaps", // Prevent overscroll
                    }}
                    className="w-full group relative"
                >
                    <CarouselContent className="-ml-3 md:-ml-4">
                        {books.map(book => (
                            <CarouselItem
                                key={`${book.series}-${book.id}`}
                                className="pl-3 md:pl-4 shrink-0 grow-0 w-auto basis-auto"
                            >
                                <BookCard
                                    book={book}
                                    onClick={onBookClick}
                                    landscape={isLandscape}
                                    allowCoverResolution={allowCoverResolution}
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {/* Nav buttons - hidden on mobile, positioned inside on larger screens */}
                    <CarouselPrevious className="hidden sm:flex left-1 z-10 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 disabled:opacity-0 shadow-lg bg-background/90 backdrop-blur-sm" />
                    <CarouselNext className="hidden sm:flex right-1 z-10 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 disabled:opacity-0 shadow-lg bg-background/90 backdrop-blur-sm" />
                </Carousel>
            </div>
        </section>
    );
});
