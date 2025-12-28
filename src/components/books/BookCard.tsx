import { Book } from '@/types';
import { books } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BookCardProps {
    book: Book;
    onClick?: () => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
    const coverUrl = books.getCoverUrl(book.series, book.id);

    // Format age range for display
    const formatAgeRange = (minMonths: number, maxMonths: number) => {
        const minYears = Math.floor(minMonths / 12);
        const maxYears = Math.ceil(maxMonths / 12);
        if (minYears === maxYears) return `${minYears} yrs`;
        return `${minYears}-${maxYears} yrs`;
    };

    return (
        <Card
            className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            onClick={onClick}
        >
            <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                <img
                    src={coverUrl}
                    alt={book.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                        // Fallback to a placeholder if image fails
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 133" fill="%23e2e8f0"><rect width="100" height="133"/><text x="50" y="70" text-anchor="middle" fill="%2394a3b8" font-size="12">📚</text></svg>';
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
                            {book.series.replace('My First Books', 'First').replace('African Men of Faith', 'Faith')}
                        </Badge>
                    )}
                </div>

                {book.author && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                        by {book.author}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
