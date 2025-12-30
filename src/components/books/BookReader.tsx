import { useState, useCallback, useEffect } from 'react';
import { Book } from '@/types';
import { books, reading } from '@/lib/api';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, BookOpen, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useEmblaCarousel from 'embla-carousel-react';
import { Skeleton } from '@/components/ui/skeleton';

// Individual page slide with lazy loading
function PageSlide({ 
    pageNum, 
    series, 
    bookId, 
    isVisible 
}: { 
    pageNum: number; 
    series: string; 
    bookId: string; 
    isVisible: boolean;
}) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className="embla__slide flex-[0_0_100%] min-w-0 h-full flex items-center justify-center p-4">
            {/* Only load images that are visible or adjacent */}
            {isVisible ? (
                <>
                    {!loaded && !error && (
                        <div className="absolute inset-4 flex items-center justify-center">
                            <Skeleton className="w-full h-full max-w-md rounded-lg" />
                        </div>
                    )}
                    {error && (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <span className="text-4xl mb-2">📄</span>
                            <span className="text-sm">Page {pageNum} not found</span>
                        </div>
                    )}
                    <img
                        src={books.getPageUrl(series, bookId, pageNum)}
                        alt={`Page ${pageNum}`}
                        loading="lazy"
                        className={`max-h-full max-w-full object-contain rounded-lg shadow-lg transition-opacity duration-300 ${
                            loaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setLoaded(true)}
                        onError={() => {
                            setError(true);
                            setLoaded(true);
                        }}
                    />
                </>
            ) : (
                <Skeleton className="w-full h-full max-w-md rounded-lg" />
            )}
        </div>
    );
}

interface BookReaderProps {
    book: Book | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    childrenIds?: string[];
}

export function BookReader({ book, open, onOpenChange, childrenIds }: BookReaderProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [isCompleting, setIsCompleting] = useState(false);
    const { toast } = useToast();

    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        dragFree: false,
    });

    // Reset to page 1 when book changes
    useEffect(() => {
        if (book) {
            setCurrentPage(1);
            emblaApi?.scrollTo(0);
        }
    }, [book, emblaApi]);

    // Sync carousel with currentPage
    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCurrentPage(emblaApi.selectedScrollSnap() + 1);
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', onSelect);
        return () => { emblaApi.off('select', onSelect); };
    }, [emblaApi, onSelect]);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    // Get current page prompt
    const getCurrentPrompt = () => {
        if (!book?.readingPrompts) return null;
        return book.readingPrompts.find(p => p.page === currentPage)?.prompt;
    };

    // Handle completion
    const handleComplete = async () => {
        if (!book) return;

        setIsCompleting(true);
        try {
            await reading.complete({
                series: book.series,
                bookId: book.id,
                childrenPresent: childrenIds,
            });

            toast({
                title: '📚 Great Job!',
                description: `You finished reading "${book.title}"!`,
            });

            onOpenChange(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save reading session',
                variant: 'destructive',
            });
        } finally {
            setIsCompleting(false);
        }
    };

    if (!book) return null;

    const isLastPage = currentPage >= book.pageCount;
    const prompt = getCurrentPrompt();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden">
                <DialogTitle className="sr-only">{book.title}</DialogTitle>

                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <span className="font-medium truncate max-w-[200px]">{book.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {book.pageCount}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                            className="h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Page Carousel */}
                <div className="flex-1 overflow-hidden relative bg-muted/30">
                    <div className="embla h-full" ref={emblaRef}>
                        <div className="embla__container flex h-full">
                            {Array.from({ length: book.pageCount }, (_, i) => (
                                <PageSlide
                                    key={i + 1}
                                    pageNum={i + 1}
                                    series={book.series}
                                    bookId={book.id}
                                    isVisible={Math.abs(currentPage - (i + 1)) <= 1}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/80 hover:bg-background shadow-lg"
                        onClick={scrollPrev}
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/80 hover:bg-background shadow-lg"
                        onClick={scrollNext}
                        disabled={isLastPage}
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>
                </div>

                {/* Footer with prompt and completion */}
                <div className="p-4 border-t bg-background/95 backdrop-blur space-y-3">
                    {prompt && (
                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                            <p className="text-sm font-medium text-primary">
                                💬 {prompt}
                            </p>
                        </div>
                    )}

                    {isLastPage && (
                        <Button
                            onClick={handleComplete}
                            disabled={isCompleting}
                            className="w-full gap-2"
                            size="lg"
                        >
                            <CheckCircle className="h-5 w-5" />
                            {isCompleting ? 'Saving...' : 'We Finished Reading! 🎉'}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
