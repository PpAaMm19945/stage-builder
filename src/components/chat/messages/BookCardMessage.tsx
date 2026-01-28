import { Card, CardContent } from '@/components/ui/card';
import { Book } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface BookResult {
    id: string;
    title: string;
    description: string;
    metadata?: {
        coverUrl?: string;
        ageRange?: string;
        domain?: string;
    };
}

interface BookCardMessageProps {
    books: BookResult[];
    onOpenBook: (book: BookResult) => void;
    className?: string;
}

/**
 * Displays search results as clickable book cards.
 * Clicking a card opens the BookReader lightbox.
 */
export function BookCardMessage({ books, onOpenBook, className }: BookCardMessageProps) {
    if (books.length === 0) {
        return (
            <div className={cn("text-sm text-muted-foreground italic", className)}>
                No books found matching your search.
            </div>
        );
    }

    return (
        <div className={cn("grid gap-2", className)}>
            {books.map((book) => (
                <Card
                    key={book.id}
                    onClick={() => onOpenBook(book)}
                    className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group"
                >
                    <CardContent className="p-3 flex gap-3">
                        {book.metadata?.coverUrl ? (
                            <img
                                src={book.metadata.coverUrl}
                                alt=""
                                className="w-12 h-16 object-cover rounded shrink-0"
                            />
                        ) : (
                            <div className="w-12 h-16 bg-muted rounded flex items-center justify-center shrink-0">
                                <Book className="w-6 h-6 text-muted-foreground" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                {book.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {book.description}
                            </p>
                            {book.metadata?.domain && (
                                <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                    {book.metadata.domain}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

interface SingleBookCardProps {
    book: BookResult;
    onOpenBook: (book: BookResult) => void;
    className?: string;
}

/**
 * Single book card for inline display
 */
export function SingleBookCard({ book, onOpenBook, className }: SingleBookCardProps) {
    return (
        <BookCardMessage
            books={[book]}
            onOpenBook={onOpenBook}
            className={className}
        />
    );
}
