import { useState, useCallback, useEffect, useRef } from 'react';
import { Book } from '@/types';
import { books, reading } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, BookOpen, CheckCircle, RotateCcw, MessageCircle } from 'lucide-react';
import { UpvoteButton } from '@/components/feedback/UpvoteButton';
import { CommentSection } from '@/components/feedback/CommentSection';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import useEmblaCarousel from 'embla-carousel-react';
import { Skeleton } from '@/components/ui/skeleton';

// Slide types for the carousel
type SlideType = 'cover' | 'copyright' | 'content';

interface SlideInfo {
    type: SlideType;
    pageNum?: number; // Only for content pages
}

// Individual slide with lazy loading
function BookSlide({
    slideInfo,
    series,
    bookId,
    isVisible,
    bookTitle
}: {
    slideInfo: SlideInfo;
    series: string;
    bookId: string;
    isVisible: boolean;
    bookTitle: string;
}) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    const getImageUrl = () => {
        if (slideInfo.type === 'cover') {
            return books.getCoverUrl(series, bookId);
        }
        if (slideInfo.type === 'copyright') {
            return books.getPageUrl(series, bookId, 0);
        }
        return books.getPageUrl(series, bookId, slideInfo.pageNum!);
    };

    const getAltText = () => {
        if (slideInfo.type === 'cover') return `${bookTitle} - Cover`;
        if (slideInfo.type === 'copyright') return `${bookTitle} - Copyright`;
        return `${bookTitle} - Page ${slideInfo.pageNum}`;
    };

    const getErrorText = () => {
        if (slideInfo.type === 'cover') return 'Cover not found';
        if (slideInfo.type === 'copyright') return 'Copyright page not found';
        return `Page ${slideInfo.pageNum} not found`;
    };

    return (
        <div className="embla__slide flex-[0_0_100%] min-w-0 h-full flex items-center justify-center p-1 sm:p-2">
            {isVisible ? (
                <>
                    {!loaded && !error && (
                        <div className="absolute inset-2 flex items-center justify-center">
                            <Skeleton className="w-full h-full max-w-2xl aspect-[4/3] rounded-lg" />
                        </div>
                    )}
                    {error && (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <span className="text-4xl mb-2">📄</span>
                            <span className="text-sm">{getErrorText()}</span>
                        </div>
                    )}
                    <img
                        src={getImageUrl()}
                        alt={getAltText()}
                        loading="lazy"
                        className={`max-h-full max-w-full w-auto h-auto object-contain rounded-lg shadow-lg transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'
                            }`}
                        onLoad={() => setLoaded(true)}
                        onError={() => {
                            setError(true);
                            setLoaded(true);
                        }}
                    />
                </>
            ) : (
                <Skeleton className="w-full h-full max-w-2xl aspect-[4/3] rounded-lg" />
            )}
        </div>
    );
}

// Progress dots component
function ProgressDots({
    total,
    current,
    onDotClick
}: {
    total: number;
    current: number;
    onDotClick: (index: number) => void;
}) {
    // For books with many pages, show condensed dots
    const maxDots = 12;
    const showCondensed = total > maxDots;

    if (showCondensed) {
        // Show progress bar instead
        const progress = ((current + 1) / total) * 100;
        return (
            <div className="w-full max-w-xs mx-auto">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center gap-1.5">
            {Array.from({ length: total }, (_, i) => (
                <button
                    key={i}
                    onClick={() => onDotClick(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${i === current
                        ? 'bg-primary w-4'
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        }`}
                    aria-label={`Go to slide ${i + 1}`}
                />
            ))}
        </div>
    );
}

// Landscape orientation hint
function LandscapeHint({ onDismiss }: { onDismiss: () => void }) {
    return (
        <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <RotateCcw className="h-16 w-16 text-primary mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">Rotate for Best Experience</h3>
            <p className="text-muted-foreground mb-6 max-w-xs">
                Turn your phone sideways to see the full page in landscape mode
            </p>
            <Button onClick={onDismiss} variant="outline">
                Continue Anyway
            </Button>
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
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isCompleting, setIsCompleting] = useState(false);
    const [showLandscapeHint, setShowLandscapeHint] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();

    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        dragFree: false,
    });

    // Build slide array: cover + copyright + content pages
    const slides: SlideInfo[] = book ? [
        { type: 'cover' },
        { type: 'copyright' },
        ...Array.from({ length: book.pageCount }, (_, i) => ({
            type: 'content' as SlideType,
            pageNum: i + 1
        }))
    ] : [];

    const totalSlides = slides.length;
    const isLastSlide = currentSlide >= totalSlides - 1;

    // Check if mobile and portrait on open
    useEffect(() => {
        if (open && book) {
            const isMobile = window.innerWidth < 768;
            const isPortrait = window.innerHeight > window.innerWidth;

            // Only show hint on mobile in portrait mode, and only once per session
            const hintShown = sessionStorage.getItem('landscapeHintShown');
            if (isMobile && isPortrait && !hintShown) {
                setShowLandscapeHint(true);
            }
        }
    }, [open, book]);

    const dismissLandscapeHint = () => {
        setShowLandscapeHint(false);
        sessionStorage.setItem('landscapeHintShown', 'true');
    };

    // Reset to cover when book changes
    useEffect(() => {
        if (book) {
            setCurrentSlide(0);
            emblaApi?.scrollTo(0);
            setControlsVisible(true);
        }
    }, [book, emblaApi]);

    // Sync carousel with currentSlide
    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCurrentSlide(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', onSelect);
        return () => { emblaApi.off('select', onSelect); };
    }, [emblaApi, onSelect]);

    // Keyboard navigation
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                emblaApi?.scrollPrev();
            } else if (e.key === 'ArrowRight') {
                emblaApi?.scrollNext();
            } else if (e.key === 'Escape') {
                onOpenChange(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, emblaApi, onOpenChange]);

    // Auto-hide controls after inactivity
    const resetControlsTimeout = useCallback(() => {
        setControlsVisible(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            setControlsVisible(false);
        }, 3000);
    }, []);

    useEffect(() => {
        if (open) {
            resetControlsTimeout();
        }
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [open, resetControlsTimeout]);

    const handleInteraction = () => {
        resetControlsTimeout();
    };

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
        handleInteraction();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
        handleInteraction();
    }, [emblaApi]);

    const scrollTo = useCallback((index: number) => {
        if (emblaApi) emblaApi.scrollTo(index);
        handleInteraction();
    }, [emblaApi]);

    // Get current page prompt (only for content pages)
    const getCurrentPrompt = () => {
        if (!book?.readingPrompts) return null;
        const slide = slides[currentSlide];
        if (slide?.type !== 'content') return null;
        return book.readingPrompts.find(p => p.page === slide.pageNum)?.prompt;
    };

    // Get display text for current slide
    const getSlideLabel = () => {
        const slide = slides[currentSlide];
        if (!slide) return '';
        if (slide.type === 'cover') return 'Cover';
        if (slide.type === 'copyright') return 'Copyright';
        return `Page ${slide.pageNum} of ${book?.pageCount}`;
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

    const prompt = getCurrentPrompt();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-[98vw] w-[98vw] h-[98vh] sm:h-[95vh] p-0 gap-0 overflow-hidden border-0 sm:border sm:rounded-lg"
                onPointerMove={handleInteraction}
                onTouchStart={handleInteraction}
            >
                <DialogTitle className="sr-only">{book.title}</DialogTitle>

                {/* Landscape hint for mobile portrait */}
                {showLandscapeHint && (
                    <LandscapeHint onDismiss={dismissLandscapeHint} />
                )}

                {/* Header - auto-hide */}
                <div
                    className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-2 bg-background/90 backdrop-blur transition-all duration-300 ${controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
                        }`}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="font-medium truncate text-sm">{book.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {getSlideLabel()}
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

                {/* Page Carousel - Full height */}
                <div className="h-full overflow-hidden relative bg-muted/30">
                    <div className="embla h-full" ref={emblaRef}>
                        <div className="embla__container flex h-full">
                            {slides.map((slideInfo, i) => (
                                <BookSlide
                                    key={`${slideInfo.type}-${slideInfo.pageNum || 0}`}
                                    slideInfo={slideInfo}
                                    series={book.series}
                                    bookId={book.id}
                                    isVisible={Math.abs(currentSlide - i) <= 2}
                                    bookTitle={book.title}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Navigation Arrows - larger touch targets */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`absolute left-1 top-1/2 -translate-y-1/2 h-14 w-14 sm:h-12 sm:w-12 rounded-full bg-background/70 hover:bg-background shadow-lg transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}
                        onClick={scrollPrev}
                        disabled={currentSlide <= 0}
                    >
                        <ChevronLeft className="h-7 w-7 sm:h-6 sm:w-6" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className={`absolute right-1 top-1/2 -translate-y-1/2 h-14 w-14 sm:h-12 sm:w-12 rounded-full bg-background/70 hover:bg-background shadow-lg transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}
                        onClick={scrollNext}
                        disabled={isLastSlide}
                    >
                        <ChevronRight className="h-7 w-7 sm:h-6 sm:w-6" />
                    </Button>

                    {/* Tap zones for touch navigation */}
                    <div
                        className="absolute left-0 top-0 bottom-0 w-1/4 sm:hidden"
                        onClick={scrollPrev}
                        aria-hidden="true"
                    />
                    <div
                        className="absolute right-0 top-0 bottom-0 w-1/4 sm:hidden"
                        onClick={scrollNext}
                        aria-hidden="true"
                    />
                </div>

                {/* Footer - auto-hide, shows progress and completion */}
                <div
                    className={`absolute bottom-0 left-0 right-0 z-20 p-2 bg-background/90 backdrop-blur transition-all duration-300 space-y-2 ${controlsVisible || prompt || isLastSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
                        }`}
                >
                    {/* Progress indicator */}
                    <ProgressDots
                        total={totalSlides}
                        current={currentSlide}
                        onDotClick={scrollTo}
                    />

                    {prompt && (
                        <div className="p-2 bg-primary/5 border border-primary/20 rounded-lg">
                            <p className="text-sm font-medium text-primary">
                                💬 {prompt}
                            </p>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                            <UpvoteButton contentType="book" contentId={book.id} variant="minimal" />
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground">
                                        <MessageCircle className="h-4 w-4" />
                                        Comments
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                                    <DialogTitle>Reader Comments</DialogTitle>
                                    <CommentSection contentType="book" contentId={book.id} />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {isLastSlide && (
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
