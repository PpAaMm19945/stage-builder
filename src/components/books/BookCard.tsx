import { useState, memo } from 'react';
import { Book } from '@/types';
import { books } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Books as BooksIcon, Heart } from '@phosphor-icons/react';

interface BookCardProps {
    book: Book;
    onClick?: (book: Book) => void;
}

export const BookCard = memo(function BookCard({ book, onClick }: BookCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Prefer external cover URL if present, otherwise construct from series/id
    const coverUrl = (book.coverUrl && (book.coverUrl.startsWith('http') || book.coverUrl.startsWith('/')))
        ? book.coverUrl
        : books.getCoverUrl(book.series, book.id);

    // Format age range for display
    const formatAgeRange = (minMonths: number, maxMonths: number) => {
        const minYears = Math.floor(minMonths / 12);
        const maxYears = Math.ceil(maxMonths / 12);
        if (minYears === maxYears) return `${minYears} yrs`;
        return `${minYears}-${maxYears} yrs`;
    };

    // Use seriesTitle for display, fallback to series (folder name) formatted nicely
    const displaySeries = book.seriesTitle || book.series
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    // Shorten series names for badge display
    const shortenedSeries = displaySeries
        .replace('My First Books', 'First')
        .replace('African Men of Faith', 'Faith')
        .replace('The Gospel Series', 'Gospel');

    // Generate a consistent color based on the book series string
    const getSeriesColor = (series: string) => {
        let hash = 0;
        for (let i = 0; i < series.length; i++) {
            hash = series.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return '#' + '00000'.substring(0, 6 - c.length) + c;
    };
    const seriesColor = getSeriesColor(book.series);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick(book);
        }
    };

    return (
        <div
            className="group relative cursor-pointer flex flex-col gap-2 transition-all duration-300 hover:scale-[1.05] focus-visible:outline-none"
            onClick={() => onClick?.(book)}
            role="button"
            tabIndex={0}
            aria-label={`Open ${book.title}`}
            onKeyDown={handleKeyDown}
        >
            {/* Main Image Container - Aspect 2:3 for standard book feel */}
            <div className="aspect-[2/3] w-full relative overflow-hidden rounded-md shadow-sm border border-border/40 bg-muted group-hover:shadow-xl transition-shadow">
                {/* Skeleton loader */}
                {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 animate-pulse">
                        <Skeleton className="h-full w-full" />
                    </div>
                )}

                {/* Fallback for error state */}
                {imageError && (
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center text-center p-4"
                        style={{ backgroundColor: seriesColor }}
                    >
                        <BooksIcon className="h-8 w-8 text-white/80 mb-2" weight="duotone" />
                        <span className="text-white font-bold text-xs leading-tight line-clamp-3">
                            {book.title}
                        </span>
                    </div>
                )}

                {/* Image - Object Cover for slick uniform look */}
                <img
                    src={coverUrl}
                    alt={book.title}
                    loading="lazy"
                    className={`h-full w-full object-cover transition-opacity duration-300 ${imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
                        }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                        setImageError(true);
                        setImageLoaded(true);
                    }}
                />

                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <p className="text-white text-xs font-medium line-clamp-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        {book.seriesTitle || book.series}
                    </p>
                </div>
            </div>

            {/* Minimal Content Below */}
            <div>
                <h3 className="font-medium text-sm leading-tight line-clamp-1 text-foreground/90 group-hover:text-primary transition-colors">
                    {book.title}
                </h3>
            </div>
        </div>
    );
});
