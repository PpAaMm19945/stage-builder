import { useState, memo } from 'react';
import { Book } from '@/types';
import { useBookAssetUrl } from '@/hooks/useBookAssetUrl';
import { Skeleton } from '@/components/ui/skeleton';
import { Books as BooksIcon } from '@phosphor-icons/react';
import { toTitleCase } from './book-utils';

interface BookCardProps {
    book: Book;
    onClick?: (book: Book) => void;
    /** Use landscape aspect ratio for picture books */
    landscape?: boolean;
}

export const BookCard = memo(function BookCard({ book, onClick, landscape }: BookCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Prefer external cover URL if present, and verify it's not the API proxy unless we have no other choice
    const isApiProxy = book.coverUrl?.includes('/api/books/');
    const externalCover = (book.coverUrl && !isApiProxy && (book.coverUrl.startsWith('http') || book.coverUrl.startsWith('/')))
        ? book.coverUrl
        : null;

    // Use hook to resolve cover URL (manifest -> R2 -> API fallback)
    // ⚡ Performance: Skip if we already have a valid external cover URL (prevents N queries)
    const { data: resolvedCover } = useBookAssetUrl(book.series, book.id, 'cover', { enabled: !externalCover });

    // If external is explicit, use it. Otherwise use resolved.
    const coverUrl = externalCover || resolvedCover;

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
    // FORCE "The Paperback Bible" and "Pr. Curtis Knapp" to be Portrait (2:3)
    // and use object-contain to show the full image without cropping.
    const seriesLower = book.series?.toLowerCase() || '';
    const isStrictPortrait = seriesLower.includes('paperback') || seriesLower === 'pastor_curtis_knapp';

    const isLandscape = !isStrictPortrait && (landscape ||
        book.renderFormat === 'image' ||
        book.renderFormat === 'images' ||
        seriesLower.includes('picture') ||
        seriesLower.includes('first'));

    const aspectClass = isLandscape ? 'aspect-[4/3]' : 'aspect-[2/3]';

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick(book);
        }
    };

    // Netflix-style fixed-height rows with variable width cards
    // Height is fixed per row type; width derives naturally from aspect ratio
    // This prevents horizontal overflow issues while maintaining clean alignment
    const heightClass = isLandscape
        ? 'h-[120px] sm:h-[150px] md:h-[180px]'  // Picture books: shorter on mobile
        : 'h-[150px] sm:h-[190px] md:h-[240px]'; // Portrait books: taller for visibility

    // Visual styles logic:
    // For "Strict Portrait" books (Paperback Bible, Curtis Knapp), we want a "floating" look:
    // - No container border/background/shadow
    // - No overflow hidden (so shadow can bleed)
    // - Shadow applied to the image itself
    // - Gradient overlay removed to avoid artifacts
    const containerBaseClasses = `${aspectClass} ${heightClass} w-auto relative rounded-lg transition-all duration-300`;
    const containerClasses = isStrictPortrait
        ? `${containerBaseClasses} bg-transparent`
        : `${containerBaseClasses} overflow-hidden shadow-md border border-border/30 bg-muted group-hover:shadow-xl`;

    const imgBaseClasses = `h-full w-full transition-all duration-300 group-hover:brightness-105 ${imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'}`;
    const imgClasses = isStrictPortrait
        ? `${imgBaseClasses} object-contain drop-shadow-md rounded-lg`
        : `${imgBaseClasses} object-cover`;

    return (
        <div
            className="group relative cursor-pointer flex flex-col gap-2 transition-all duration-300 hover:scale-[1.05] md:hover:scale-[1.1] hover:z-10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg w-fit"
            onClick={() => onClick?.(book)}
            role="button"
            tabIndex={0}
            aria-label={`Open ${displayTitle}`}
            onKeyDown={handleKeyDown}
        >
            {/* Cover Image Container - Fixed height, width derives from aspect ratio */}
            <div className={containerClasses}>
                {/* Skeleton loader */}
                {(!imageLoaded || !coverUrl) && !imageError && (
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
                {coverUrl && (
                    <img
                        src={coverUrl}
                        alt={`Cover of ${displayTitle}`}
                        loading="lazy"
                        className={imgClasses}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => {
                            setImageError(true);
                            setImageLoaded(true);
                        }}
                    />
                )}

                {/* Subtle gradient overlay for depth - only for standard cards */}
                {!isStrictPortrait && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                )}
            </div>

            {/* Book Info */}
            <div className="space-y-0.5 px-0.5">
                <h3
                    className="font-semibold text-sm leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors"
                    title={displayTitle}
                >
                    {displayTitle}
                </h3>
                {book.author && (
                    <p
                        className="text-xs text-muted-foreground line-clamp-1"
                        title={book.author}
                    >
                        {book.author}
                    </p>
                )}
                {!book.author && displaySeries && (
                    <p
                        className="text-xs text-muted-foreground/70 line-clamp-1"
                        title={displaySeries}
                    >
                        {displaySeries}
                    </p>
                )}

            </div>

            {/* Why Today Rationale (Phase 3H) */}
            {(book as any).rationale && (
                <div className="bg-primary/5 rounded-md p-2 mt-1 border border-primary/10">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">
                        Why Today
                    </p>
                    <p className="text-xs text-muted-foreground leading-snug line-clamp-3">
                        {(book as any).rationale}
                    </p>
                </div>
            )}
        </div>
    );
});
