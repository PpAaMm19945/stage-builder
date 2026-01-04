import { useState } from 'react';
import { Book } from '@/types';
import { books } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Books as BooksIcon, Heart } from '@phosphor-icons/react';

interface BookCardProps {
    book: Book;
    onClick?: () => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const coverUrl = books.getCoverUrl(book.series, book.id);

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

    return (
        <Card
            className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            onClick={onClick}
        >
            {/* Landscape aspect ratio for picture book covers */}
            <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                {/* Skeleton loader shown while image is loading */}
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
                        <BooksIcon className="h-12 w-12 text-white/80 mb-2" weight="duotone" />
                        <span className="text-white font-bold text-sm leading-tight line-clamp-3">
                            {book.title}
                        </span>
                    </div>
                )}

                <img
                    src={coverUrl}
                    alt={book.title}
                    loading="lazy"
                    className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
                        }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                        setImageError(true);
                        setImageLoaded(true);
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <CardContent className="p-3">
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                    {book.title}
                </h3>

                <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="secondary" className="text-[10px] px-1.5">
                        {formatAgeRange(book.minAgeMonths, book.maxAgeMonths)}
                    </Badge>
                    {book.series && (
                        <Badge variant="outline" className="text-[10px] px-1.5 truncate max-w-[100px]">
                            {shortenedSeries}
                        </Badge>
                    )}
                    {(book.upvoteCount || 0) > 0 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 gap-1 bg-red-50 text-red-600 border-red-100">
                            <Heart weight="fill" className="h-3 w-3" />
                            {book.upvoteCount}
                        </Badge>
                    )}
                </div>

                {book.author && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                        by {book.author}
                    </p>
                )}
            </CardContent>
        </Card >
    );
}
