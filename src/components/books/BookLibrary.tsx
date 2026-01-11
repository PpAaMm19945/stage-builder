import { useState, useMemo, useCallback } from 'react';
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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuth } from '@/contexts/AuthContext';
import { Books as BooksIcon, Book as BookIcon } from '@phosphor-icons/react';
import { PAPERBACK_BIBLE_BOOKS } from '@/data/bible-books';

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
    renderFormat: 'hymnal',
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
    renderFormat: 'catechism',
    coverUrl: 'https://placehold.co/600x800/1e293b/e2e8f0?text=CATECHISM',
    description: 'The standard catechism for family instruction in the reformed faith.',
    topics: ['theology', 'catechism'],
    readingPrompts: []
};

const BOOK_CATEGORIES = [
    { value: 'all', label: 'All Books' },
    { value: 'picture-books', label: 'Picture Books' },
    { value: 'bible', label: 'The Paperback Bible' },
    { value: 'worship', label: 'Worship Resources' },
];

export function BookLibrary({ initialStage }: BookLibraryProps) {
    const { children } = useAuth();
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [showHymnal, setShowHymnal] = useState(false);
    const [showCatechism, setShowCatechism] = useState(false);
    const [stageFilter, setStageFilter] = useState<string>(initialStage || 'all');
    const [categoryFilter, setCategoryFilter] = useState('picture-books');

    // Fetch ALL books without age filtering (user chose "Show all by default")
    const { data: allBooks = [], isLoading, error } = useQuery({
        queryKey: ['books', stageFilter],
        queryFn: () => booksApi.list({
            stage: stageFilter !== 'all' ? stageFilter : undefined,
            // No ageMonths filter - show all books
        }),
    });

    // Inject Hymnal and Catechism and Filter
    const displayBooks = useMemo(() => {
        let books = [...allBooks, HYMNAL_BOOK, CATECHISM_BOOK, ...PAPERBACK_BIBLE_BOOKS];

        if (categoryFilter === 'picture-books') {
             // Exclude Bible and Worship
             books = books.filter(b => !b.series?.startsWith('Bible') &&
                                  b.renderFormat !== 'hymnal' &&
                                  b.renderFormat !== 'catechism');
        } else if (categoryFilter === 'bible') {
             books = books.filter(b => b.series?.startsWith('Bible'));
        } else if (categoryFilter === 'worship') {
             books = books.filter(b => b.renderFormat === 'hymnal' || b.renderFormat === 'catechism');
        }

        return books;
    }, [allBooks, categoryFilter]);

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

    // Compute default open series (everything except Bible to prevent flood)
    const defaultOpenSeries = useMemo(() => {
        return seriesNames.filter(s => !s.startsWith('Bible'));
    }, [seriesNames]);

    const handleBookClick = useCallback((book: Book) => {
        if (book.id === 'schoolos-hymnal') {
            setShowHymnal(true);
        } else if (book.id === 'schoolos-catechism') {
            setShowCatechism(true);
        } else {
            setSelectedBook(book);
        }
    }, []);

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
            <div className="flex flex-wrap items-center gap-4">
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

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {BOOK_CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Loading State */}
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
            {!isLoading && displayBooks.length === 0 && (
                <div className="text-center py-12">
                    <BooksIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" weight="duotone" />
                    <h3 className="text-lg font-medium mb-2">No Books Found</h3>
                    <p className="text-muted-foreground">
                        {stageFilter !== 'all' || categoryFilter !== 'all'
                            ? 'Try changing the filters to see available books.'
                            : 'Books are being added. Check back soon!'}
                    </p>
                </div>
            )}

            {/* Book Grid by Series - Using Accordion */}
            {!isLoading && (
                <Accordion type="multiple" defaultValue={defaultOpenSeries} className="space-y-4">
                    {seriesNames.map(series => (
                        <AccordionItem key={series} value={series} className="border-none">
                            <AccordionTrigger className="hover:no-underline py-2">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <BookIcon className="h-5 w-5 text-primary" weight="duotone" />
                                    {series}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        ({booksBySeries[series].length} {booksBySeries[series].length === 1 ? 'book' : 'books'})
                                    </span>
                                </h2>
                            </AccordionTrigger>
                            <AccordionContent>
                                {series.startsWith('Bible') && (
                                    <p className="text-sm text-muted-foreground mb-4 ml-1">
                                        Audio kindly provided by <a href="https://www.sermonaudio.com" target="_blank" rel="noreferrer" className="underline decoration-dotted hover:text-primary">SermonAudio</a>
                                    </p>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
                                    {booksBySeries[series].map(book => (
                                        <BookCard
                                            key={`${book.series}-${book.id}`}
                                            book={book}
                                            onClick={handleBookClick}
                                        />
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}

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
