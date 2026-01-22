import { useState, memo } from 'react';
import { Book } from '@/types';
import { books } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Books as BooksIcon } from '@phosphor-icons/react';

interface BookCardProps {
    book: Book;
    onClick?: (book: Book) => void;
    /** Use landscape aspect ratio for picture books */
    landscape?: boolean;
}

// Utility: Convert snake_case or kebab-case to Title Case
function toTitleCase(str: string): string {
    if (!str) return '';
    return str
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}

export const BookCard = memo(function BookCard({ book, onClick, landscape }: BookCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Prefer external cover URL if present, otherwise construct from series/id
    const coverUrl = (book.coverUrl && (book.coverUrl.startsWith('http') || book.coverUrl.startsWith('/')))
        ? book.coverUrl
        : books.getCoverUrl(book.series, book.id);

    // Format title: use book.title, but clean it if it looks like a folder name
    const displayTitle = book.title.includes('_') || book.title.includes('-')
        ? toTitleCase(book.title)
        : book.title;

    // Format series: use seriesTitle if available, otherwise clean the folder name
    const displaySeries = book.seriesTitle || toTitleCase(book.series);

    // Generate a consistent color based on the book series string for fallback
    const getSeriesColor = (series: string) => {
        let hash = 0;
        for (let i = 0; i < series.length; i++) {
            hash = series.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 45%, 45%)`;
    };
    const seriesColor = getSeriesColor(book.series);

    // Determine aspect ratio based on book type
    // Picture books (landscape) use 4:3, standard books use 2:3 (portrait)
    const isLandscape = landscape || 
        book.renderFormat === 'image' || 
        book.renderFormat === 'images' ||
        book.series?.toLowerCase().includes('picture') ||
        book.series?.toLowerCase().includes('first');
    
    const aspectClass = isLandscape ? 'aspect-[4/3]' : 'aspect-[2/3]';

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick(book);
        }
    };

    return (
        <div
            className="group relative cursor-pointer flex flex-col gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg"
            onClick={() => onClick?.(book)}
            role="button"
            tabIndex={0}
            aria-label={`Open ${displayTitle}`}
            onKeyDown={handleKeyDown}
        >
            {/* Cover Image Container */}
            <div className={`${aspectClass} w-full relative overflow-hidden rounded-lg shadow-md border border-border/30 bg-muted group-hover:shadow-xl transition-all duration-300`}>
                {/* Skeleton loader */}
                {!imageLoaded && !imageError && (
                    <div className="absolute inset-0">
                        <Skeleton className="h-full w-full rounded-lg" />
                    </div>
                )}

                {/* Fallback for error state - styled placeholder */}
                {imageError && (
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 rounded-lg"
                        style={{ backgroundColor: seriesColor }}
                    >
                        <BooksIcon className="h-10 w-10 text-white/70 mb-2" weight="duotone" />
                        <span className="text-white font-semibold text-sm leading-tight line-clamp-3 drop-shadow-sm">
                            {displayTitle}
                        </span>
                        {book.author && (
                            <span className="text-white/70 text-xs mt-1">
                                {book.author}
                            </span>
                        )}
                    </div>
                )}

                {/* Cover Image */}
                <img
                    src={coverUrl}
                    alt={`Cover of ${displayTitle}`}
                    loading="lazy"
                    className={`h-full w-full object-cover transition-all duration-300 group-hover:brightness-105 ${
                        imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                        setImageError(true);
                        setImageLoaded(true);
                    }}
                />

                {/* Subtle gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Book Info */}
            <div className="space-y-0.5 px-0.5">
                <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                    {displayTitle}
                </h3>
                {book.author && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                        {book.author}
                    </p>
                )}
                {!book.author && displaySeries && (
                    <p className="text-xs text-muted-foreground/70 line-clamp-1">
                        {displaySeries}
                    </p>
                )}
            </div>
        </div>
    );
});
