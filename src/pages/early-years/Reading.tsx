import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Book } from '@/types';
import { books as booksApi } from '@/lib/api';
import { BookLibrary } from '@/components/books/BookLibrary';
import { BookCard } from '@/components/books/BookCard';
import { BookReader } from '@/components/books/BookReader';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Sparkles } from 'lucide-react';

export default function Reading() {
    const { children } = useAuth();
    const [recommendedBook, setRecommendedBook] = useState<Book | null>(null);

    // Get youngest child's age for recommendations
    const youngestAge = children.length > 0
        ? Math.min(...children.map(c => c.ageInMonths || (c as any).age_in_months || 36))
        : 36;

    // Fetch a recommended book based on age
    const { data: recommendedBooks = [], isLoading: loadingRecommended } = useQuery({
        queryKey: ['books-recommended', youngestAge],
        queryFn: () => booksApi.list({ ageMonths: youngestAge }),
        select: (books) => books.slice(0, 3), // Get top 3 for variety
    });

    // Pick a "today's book" (could be randomized or based on history)
    const todaysBook = recommendedBooks[Math.floor(Math.random() * recommendedBooks.length)] || null;

    return (
        <div className="container max-w-6xl py-6 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <BookOpen className="h-7 w-7 text-primary" />
                    Family Reading
                </h1>
                <p className="text-muted-foreground mt-1">
                    Explore books together and build a love of reading!
                </p>
            </div>

            {/* Today's Recommended Book */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Today's Pick
                </h2>

                {loadingRecommended ? (
                    <div className="flex gap-4">
                        <Skeleton className="w-32 aspect-[3/4] rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                ) : todaysBook ? (
                    <div
                        className="flex gap-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setRecommendedBook(todaysBook)}
                    >
                        <div className="w-28 shrink-0">
                            <img
                                src={booksApi.getCoverUrl(todaysBook.series, todaysBook.id)}
                                alt={todaysBook.title}
                                className="w-full aspect-[3/4] object-cover rounded-lg shadow-md"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg">{todaysBook.title}</h3>
                            {todaysBook.author && (
                                <p className="text-sm text-muted-foreground">by {todaysBook.author}</p>
                            )}
                            <p className="text-sm mt-2 line-clamp-2">{todaysBook.description}</p>
                            <button className="mt-3 text-sm font-medium text-primary hover:underline">
                                Read Together →
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground">No books available for recommendations yet.</p>
                )}
            </section>

            {/* Full Library */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold">📚 Library</h2>
                <BookLibrary initialStage="early-years" />
            </section>

            {/* Reader Modal for Today's Pick */}
            <BookReader
                book={recommendedBook}
                open={!!recommendedBook}
                onOpenChange={(open) => !open && setRecommendedBook(null)}
                childrenIds={children.map(c => c.id)}
            />
        </div>
    );
}
