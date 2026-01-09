import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Book } from '@/types';
import { books as booksApi } from '@/lib/api';
import { BookCard } from './BookCard';
import { BookReader } from './BookReader';
import { HymnalReader } from '../library/HymnalReader';
import { CatechismReader } from '../library/CatechismReader';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Books as BooksIcon, Book as BookIcon } from '@phosphor-icons/react';

interface BookLibraryProps {
    initialStage?: string;
}

const HYMNAL_BOOK: Book = {
    id: 'schoolos-hymnal',
    title: 'Hymns of Grace & Glory',
    author: 'Various Authors',
    series: 'Reformed Hymns',
    minAgeMonths: 0,
    maxAgeMonths: 120,
    learningStage: 'early-years',
    domain: 'language',
    pageCount: 50,
    renderFormat: 'image', // Not actually used by HymnalReader
    coverUrl: 'https://placehold.co/600x800/5e2129/eecfa1?text=HYMNS', // Fallback
    description: 'A collection of classic hymns for family worship.',
    topics: ['hymn', 'music', 'worship'],
    readingPrompts: []
};

const CATECHISM_BOOK: Book = {
    id: 'schoolos-catechism',
    title: 'Westminster Shorter Catechism',
    author: 'Westminster Assembly',
    series: 'Theology',
    minAgeMonths: 48,
    maxAgeMonths: 120,
    learningStage: 'early-years',
    domain: 'language',
    pageCount: 107,
    renderFormat: 'image',
    coverUrl: 'https://placehold.co/600x800/1e293b/e2e8f0?text=CATECHISM',
    description: 'The standard catechism for family instruction in the reformed faith.',
    topics: ['theology', 'catechism'],
    readingPrompts: []
};

const PAPERBACK_BIBLE_BOOK: Book = {
    id: 'paperback-bible-sample',
    title: 'The Paperback Bible',
    author: 'Sermon Audio',
    series: 'Bible',
    minAgeMonths: 0,
    maxAgeMonths: 120,
    learningStage: 'all',
    domain: 'wisdom',
    pageCount: 1,
    renderFormat: 'pdf',
    // Using a placeholder PDF URL since the exact URL is behind a cart/download
    // This allows the feature to be tested/used if a valid URL is provided later.
    // For now, using a sample PDF to demonstrate functionality.
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverUrl: 'https://www.sermonaudio.com/news/paperback-bible-fragments/@@images/image-1600-0e1136b9076f62b7245842817293a525.png', // Logo from search result snippet or similar
    description: 'The Paperback Bible presents the Bible by the Book and is designed to be portable, readable, and truly personal.',
    topics: ['bible', 'scripture'],
    readingPrompts: []
};

export function BookLibrary({ initialStage }: BookLibraryProps) {
    const { children } = useAuth();
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [showHymnal, setShowHymnal] = useState(false);
    const [showCatechism, setShowCatechism] = useState(false);
    const [stageFilter, setStageFilter] = useState<string>(initialStage || 'all');

    // Fetch ALL books without age filtering (user chose "Show all by default")
    const { data: allBooks = [], isLoading, error } = useQuery({
        queryKey: ['books', stageFilter],
        queryFn: () => booksApi.list({
            stage: stageFilter !== 'all' ? stageFilter : undefined,
            // No ageMonths filter - show all books
        }),
    });

    // Inject Hymnal and Catechism
    const displayBooks = useMemo(
        () => [...allBooks, HYMNAL_BOOK, CATECHISM_BOOK, PAPERBACK_BIBLE_BOOK],
        [allBooks]
    );

    // Group books by series
    const booksBySeries = useMemo(() => {
        return displayBooks.reduce((acc, book) => {
            const series = book.series || 'Other';
            if (!acc[series]) acc[series] = [];
            acc[series].push(book);
            return acc;
        }, {} as Record<string, Book[]>);
    }, [displayBooks]);

    const seriesNames = useMemo(
        () => Object.keys(booksBySeries).sort(),
        [booksBySeries]
    );

    const handleBookClick = (book: Book) => {
        if (book.id === 'schoolos-hymnal') {
            setShowHymnal(true);
        } else if (book.id === 'schoolos-catechism') {
            setShowCatechism(true);
        } else {
            setSelectedBook(book);
        }
    };

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Unable to load books. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex items-center gap-4">
                <Select value={stageFilter} onValueChange={setStageFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by stage" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Stages</SelectItem>
                        <SelectItem value="early-years">Early Years</SelectItem>
                        <SelectItem value="lower-primary">Lower Primary</SelectItem>
                    </SelectContent>
                </Select>

                <span className="text-sm text-muted-foreground">
                    Showing all books
                </span>
            </div>

            {/* Loading State - Updated for landscape cards */}
            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="aspect-[4/3] rounded-lg" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && allBooks.length === 0 && (
                <div className="text-center py-12">
                    <BooksIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" weight="duotone" />
                    <h3 className="text-lg font-medium mb-2">No Books Found</h3>
                    <p className="text-muted-foreground">
                        {stageFilter !== 'all'
                            ? 'Try removing the filter to see all available books.'
                            : 'Books are being added. Check back soon!'}
                    </p>
                </div>
            )}

            {/* Book Grid by Series - Updated for landscape cards */}
            {!isLoading && seriesNames.map(series => (
                <section key={series} className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <BookIcon className="h-5 w-5 text-primary" weight="duotone" />
                        {series}
                        <span className="text-sm font-normal text-muted-foreground">
                            ({booksBySeries[series].length} {booksBySeries[series].length === 1 ? 'book' : 'books'})
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {booksBySeries[series].map(book => (
                            <BookCard
                                key={`${book.series}-${book.id}`}
                                book={book}
                                onClick={() => handleBookClick(book)}
                            />
                        ))}
                    </div>
                </section>
            ))}

            {/* Book Reader Modal */}
            <BookReader
                book={selectedBook}
                open={!!selectedBook}
                onOpenChange={(open) => !open && setSelectedBook(null)}
                childrenIds={children.map(c => c.id)}
            />

            {/* Hymnal Reader Modal */}
            <HymnalReader
                open={showHymnal}
                onOpenChange={setShowHymnal}
            />

            {/* Catechism Reader Modal */}
            <CatechismReader
                open={showCatechism}
                onOpenChange={setShowCatechism}
            />
        </div>
    );
}
