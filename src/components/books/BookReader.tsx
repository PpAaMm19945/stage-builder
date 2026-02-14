import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Book } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from '@/components/ui/carousel';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { X, CaretLeft, CaretRight, BookOpenText, ArrowsOutSimple, ArrowsInSimple, CircleNotch, DownloadSimple } from '@phosphor-icons/react';
// PDFDownloadButton removed to prevent React #310 error
import { useAuth } from '@/contexts/AuthContext';
import { reading, progress } from '@/lib/api';
import { useBookAssetUrl, useBookPageUrls } from '@/hooks/useBookAssetUrl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MarkdownBookSlide } from './MarkdownBookSlide';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ChildSelectionModal } from './ChildSelectionModal';
import { BookPageImage } from './BookPageImage';
import { BookReaderSlide } from './BookReaderSlide';

const RENDER_WINDOW = 3;

interface BookReaderProps {
    book: Book | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    childrenIds?: string[];
    onComplete?: () => void;
    activityId?: string;
}

export const BookReader = memo(function BookReader({ book, open, onOpenChange, childrenIds, onComplete, activityId }: BookReaderProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);
    const [showPrompts, setShowPrompts] = useState(false);
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
    const [showChildSelection, setShowChildSelection] = useState(false);
    const [showFinishDialog, setShowFinishDialog] = useState(false);
    const [initialProgressChecked, setInitialProgressChecked] = useState(false);
    const [restoredPage, setRestoredPage] = useState<number | null>(null);
    const [showResumeDialog, setShowResumeDialog] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const dialogRef = useRef<HTMLDivElement>(null);
    const { user, children: authChildren } = useAuth();
    const queryClient = useQueryClient();

    // Determine if we need to prompt for child selection
    const needsChildSelection = !childrenIds && authChildren.length > 1;

    // Fetch markdown content if needed
    const { data: markdownUrl } = useBookAssetUrl(book?.series || '', book?.id || '', 'asset', { assetPath: 'content.md' });

    const { data: markdownContent } = useQuery({
        queryKey: ['book-content', book?.id, markdownUrl],
        queryFn: async () => {
            if (!book?.contentPath && !markdownUrl) return null;
            const url = book?.contentPath || markdownUrl;
            if (!url) return null;

            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to load book content');
                return await res.text();
            } catch (e) {
                console.error("Markdown fetch error:", e);
                return null;
            }
        },
        enabled: !!book && (book.renderFormat === 'markdown' || book.renderFormat === 'hybrid')
    });


    // Helper: localStorage progress key
    const localProgressKey = book ? `fp_book_progress_${book.series}_${book.id}` : '';

    // Helper: save progress to localStorage
    const saveLocalProgress = useCallback((currentPage: number, totalPgs: number) => {
        if (!book) return;
        localStorage.setItem(localProgressKey, JSON.stringify({
            current_page: currentPage,
            total_pages: totalPgs,
            timestamp: Date.now()
        }));
    }, [book, localProgressKey]);

    // Helper: get progress from localStorage
    const getLocalProgress = useCallback((): { current_page: number; total_pages: number } | null => {
        try {
            const stored = localStorage.getItem(localProgressKey);
            if (!stored) return null;
            return JSON.parse(stored);
        } catch { return null; }
    }, [localProgressKey]);

    // Fetch progress (API for signed-in, localStorage for guests)
    useQuery({
        queryKey: ['book-progress', book?.id, !!user],
        queryFn: async () => {
            if (!book) return null;

            // Check localStorage first (works for both)
            const localProg = getLocalProgress();

            if (user) {
                // Signed-in: try API
                try {
                    const res = await progress.get(book.id);
                    if (res.progress && res.progress.status === 'in_progress' && res.progress.data?.current_page) {
                        setRestoredPage(res.progress.data.current_page as number);
                        setInitialProgressChecked(true);
                        return res.progress;
                    }
                } catch {
                    // API failed, fall through to localStorage
                }
            }

            // Use localStorage fallback
            if (localProg && localProg.current_page > 1) {
                setRestoredPage(localProg.current_page);
            }

            setInitialProgressChecked(true);
            return localProg;
        },
        enabled: !!book && open && !initialProgressChecked
    });

    // Restore page effect
    useEffect(() => {
        if (restoredPage && api && restoredPage > 1 && open) {
            setShowResumeDialog(true);
        }
    }, [restoredPage, api, open]);

    // Save progress mutation
    const { mutate: saveProgress } = useMutation({
        mutationFn: async ({ current, total }: { current: number, total: number }) => {
            if (!book) return;

            // Always save to localStorage (works for everyone)
            saveLocalProgress(current, total);

            // If signed in, also save to API
            if (user) {
                await progress.save(book.id, {
                    current_page: current,
                    total_pages: total
                }, 'book');
            }
        },
        onSuccess: () => {
            // quiet save, no toast needed for auto-save
        }
    });

    // Auto-save effect
    useEffect(() => {
        if (!book || !open || current <= 1) return;

        const timer = setTimeout(() => {
            saveProgress({ current, total: count || 0 });
        }, 3000); // 3 second debounce

        return () => clearTimeout(timer);
    }, [current, count, book, open, saveProgress]);

    const skipMutation = useMutation({
        mutationFn: async () => {
            if (!book || !activityId) return;
            await progress.skip(activityId, 'book');
        },
        onSuccess: () => {
            toast.info("Book skipped");
            queryClient.invalidateQueries({ queryKey: ['family-day'] });
            handleCloseComplete();
        }
    });

    const completeMutation = useMutation({
        mutationFn: async (selectedChildrenIds?: string[]) => {
            if (!book) return;
            const idsToUse = selectedChildrenIds ?? childrenIds ?? authChildren.map(c => c.id);
            await reading.complete({
                series: book.series,
                bookId: book.id,
                childrenPresent: idsToUse
            });
        },
        onSuccess: () => {
            toast.success("Reading session logged!");
            queryClient.invalidateQueries({ queryKey: ['reading-history'] });
            if (onComplete) onComplete();
            setShowChildSelection(false);
            handleCloseComplete();
        },
        onError: (err: Error) => {
            toast.error("Failed to log session", { description: err.message });
        }
    });

    // Memoize markdown parsing
    const parsedPages = useMemo(() => {
        if (markdownContent) {
            return markdownContent.split(/\n---\n/);
        }
        return [];
    }, [markdownContent]);

    // ⚡ Performance: Memoize prompts lookup to avoid O(N) find in render loop
    const promptsByPage = useMemo(() => {
        const map = new Map<number, string>();
        if (book?.readingPrompts) {
            book.readingPrompts.forEach(p => {
                if (typeof p === 'object' && 'page' in p) {
                    map.set(p.page, p.prompt);
                }
            });
        }
        return map;
    }, [book?.readingPrompts]);

    useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            const page = api.selectedScrollSnap() + 1;
            setCurrent(page);
            setPagesViewed(prev => {
                const next = new Set(prev);
                next.add(page);
                return next;
            });
        });
    }, [api]);

    // Fullscreen listener
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFull = !!document.fullscreenElement;
            setIsFullscreen(isFull);
            if (isFull) {
                setShowControls(false); // Auto-hide controls on enter fullscreen
            } else {
                setShowControls(true);
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Immersive mode timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isFullscreen && showControls) {
            timer = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [isFullscreen, showControls]);

    // Landscape detection
    useEffect(() => {
        if (!open) return;
        const checkOrientation = () => {
            if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
                // Portrait mobile
                if (book?.renderFormat === 'image' || book?.renderFormat === 'images') {
                    // Ideally we'd check aspect ratio of the first image, but simplistic check is fine
                    // toast.info("Rotate for better view", { duration: 2000, position: 'bottom-center' });
                    // Commented out to avoid annoyance, but logic is here
                }
            }
        };
        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        return () => window.removeEventListener('resize', checkOrientation);
    }, [open, book]);

    // Keyboard navigation
    useEffect(() => {
        if (!open || !api || showChildSelection) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.defaultPrevented) return;

            if (e.key === 'ArrowLeft') {
                api.scrollPrev();
            } else if (e.key === 'ArrowRight') {
                api.scrollNext();
            } else if (e.key === ' ') {
                // Toggle controls on space if fullscreen? Or scroll?
                // Standard is scroll/next.
                api.scrollNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, api, showChildSelection]);

    // Use hooks for asset URLs
    const { data: pageUrls, isLoading: isLoadingPages } = useBookPageUrls(book?.series || '', book?.id || '', book?.pageCount || 0);

    const hasExternalCover = !!(book?.coverUrl && !book.coverUrl.includes('/api/books/') && (book.coverUrl.startsWith('http') || book.coverUrl.startsWith('/')));
    const { data: resolvedCover } = useBookAssetUrl(book?.series || '', book?.id || '', 'cover', { enabled: !hasExternalCover });

    const { data: resolvedPdf } = useBookAssetUrl(book?.series || '', book?.id || '', 'pdf');

    const imagePages = useMemo(() => {
        if (book && (book.renderFormat === 'image' || book.renderFormat === 'images' || !book.renderFormat)) {
            return pageUrls || [];
        }
        return [];
    }, [book, pageUrls]);

    // Filter out failed images from display
    const validImagePages = useMemo(() =>
        imagePages.filter((_, i) => !failedImages.has(i)),
        [imagePages, failedImages]
    );

    const [pagesViewed, setPagesViewed] = useState<Set<number>>(new Set());

    const handleImageError = useCallback((index: number) => {
        setFailedImages(prev => new Set([...prev, index]));
    }, []);

    const handleToggleControls = useCallback(() => {
        if (isFullscreen) {
            setShowControls(prev => !prev);
        }
    }, [isFullscreen]);

    const handleCloseRequest = async () => {
        const totalSlides = totalPages + 2;
        if (current >= totalSlides) {
            handleCloseStandard();
            return;
        }

        if (current > 1 && current < totalSlides) {
            setShowFinishDialog(true);
        } else {
            handleCloseStandard();
        }
    };

    const handleCloseStandard = async () => {
        handleCloseComplete();
    };

    const handleCloseComplete = () => {
        setShowPrompts(false);
        setFailedImages(new Set());
        setPagesViewed(new Set());
        setShowFinishDialog(false);
        setShowResumeDialog(false);
        setRestoredPage(null);
        setInitialProgressChecked(false);
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { });
        }
        onOpenChange(false);
    };

    if (!book) return null;

    const isMarkdown = book.renderFormat === 'markdown' || book.renderFormat === 'hybrid';
    const isImages = book.renderFormat === 'image' || book.renderFormat === 'images';
    const isPdf = book.renderFormat === 'pdf';

    const totalPages = isMarkdown ? parsedPages.length : imagePages.length;

    // Cover URL logic
    const coverUrl = (book.coverUrl && !book.coverUrl.includes('/api/books/') && (book.coverUrl.startsWith('http') || book.coverUrl.startsWith('/')))
        ? book.coverUrl
        : (resolvedCover || '');

    // PDF URL logic
    const pdfUrl = book.pdfUrl || resolvedPdf || '';

    const showPdfButton = !!book.downloadUrl || book.renderFormat === 'pdf' ||
        book.renderFormat === 'hymnal' ||
        book.renderFormat === 'catechism' ||
        book.series === 'reformed-hymns' ||
        book.series === 'catechism';

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement && dialogRef.current) {
                await dialogRef.current.requestFullscreen();
            } else if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.log('Fullscreen not supported:', err);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleCloseRequest}>
                <DialogContent
                    ref={dialogRef}
                    className="w-full h-[100dvh] sm:h-[90vh] sm:max-w-[95vw] max-w-none p-0 flex flex-col bg-black/95 border-none sm:rounded-lg rounded-none"
                    hideCloseButton
                >
                    {/* Progress Bar */}
                    {!isPdf && totalPages > 0 && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-[60]">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${((current - 1) / (totalPages + 1)) * 100}%` }}
                            />
                        </div>
                    )}

                    {/* Header - Overlaid and toggleable in fullscreen */}
                    <div
                        className={cn(
                            "flex items-center justify-between p-2 sm:p-4 text-white z-50 bg-gradient-to-b from-black/80 to-transparent transition-all duration-300",
                            "focus-within:translate-y-0 focus-within:opacity-100", // Show on focus
                            isFullscreen ? "absolute top-0 left-0 right-0" : "",
                            isFullscreen && !showControls ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
                        )}
                    >
                        <div>
                            <DialogTitle className="text-lg font-medium">{book.title}</DialogTitle>
                            {!isPdf ? (
                                <DialogDescription className="text-gray-400 text-xs">
                                    {isLoadingPages ? (
                                        <span className="flex items-center gap-2">
                                            <CircleNotch className="w-3 h-3 animate-spin" />
                                            Finding pages...
                                        </span>
                                    ) : (
                                        <>
                                            {current === 1 ? "Cover" : (
                                                current > totalPages + 1 ? "The End" : (
                                                    `Page ${current - 1} of ${totalPages}`
                                                )
                                            )}
                                        </>
                                    )}
                                </DialogDescription>
                            ) : (
                                <DialogDescription className="sr-only">
                                    PDF Reader for {book.title}
                                </DialogDescription>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {book.readingPrompts && book.readingPrompts.length > 0 && !isPdf && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowPrompts(!showPrompts)}
                                            className={showPrompts ? "text-primary bg-white/10" : "text-gray-400"}
                                            aria-label={showPrompts ? "Hide reading prompts" : "Show reading prompts"}
                                        >
                                            <BookOpenText className="w-6 h-6" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="z-[60]">
                                        <p>{showPrompts ? "Hide reading prompts" : "Show reading prompts"}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={toggleFullscreen}
                                        className="text-white hover:bg-white/20 rounded-full sm:hidden"
                                        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                                    >
                                        {isFullscreen ? (
                                            <ArrowsInSimple className="w-6 h-6" />
                                        ) : (
                                            <ArrowsOutSimple className="w-6 h-6" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="z-[60]">
                                    <p>{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</p>
                                </TooltipContent>
                            </Tooltip>

                            {showPdfButton && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => window.open(pdfUrl, '_blank')}
                                            className="text-white hover:bg-white/20 rounded-full"
                                            aria-label="Download PDF (opens in a new tab)"
                                        >
                                            <DownloadSimple className="w-6 h-6" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="z-[60]">
                                        <p>Download PDF</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleCloseRequest}
                                        className="text-white hover:bg-white/20 rounded-full"
                                        aria-label="Close reader (Esc)"
                                    >
                                        <X className="w-6 h-6" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="z-[60]">
                                    <p>Close reader (Esc)</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Reader Area */}
                    <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black">
                        {isPdf ? (
                            <div className="w-full h-full flex flex-col sm:flex-row items-center justify-center relative bg-background/95 p-8 gap-8">
                                {/* PDF Cover Preview */}
                                {coverUrl && (
                                    <div className="w-48 sm:w-64 shadow-2xl rounded-lg overflow-hidden shrink-0 transform hover:scale-105 transition-transform duration-300">
                                        <AspectRatio ratio={3 / 4}>
                                            <img
                                                src={coverUrl}
                                                alt={book.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </AspectRatio>
                                    </div>
                                )}

                                <div className="text-center sm:text-left max-w-md space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-foreground mb-2">{book.title}</h3>
                                        <p className="text-lg text-muted-foreground">{book.author}</p>
                                        {book.description && (
                                            <p className="text-sm text-gray-500 mt-4 leading-relaxed">{book.description}</p>
                                        )}
                                    </div>
                                    <Button
                                        size="lg"
                                        onClick={() => window.open(pdfUrl, '_blank')}
                                        className="gap-2 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <ArrowsOutSimple className="w-5 h-5" />
                                        Read PDF
                                        <span className="sr-only">(opens in a new tab)</span>
                                    </Button>
                                </div>

                                <div className="absolute bottom-6 right-6 z-20">
                                    <Button
                                        size="lg"
                                        className="shadow-xl"
                                        onClick={() => {
                                            if (needsChildSelection) {
                                                setShowChildSelection(true);
                                            } else {
                                                completeMutation.mutate(undefined);
                                            }
                                        }}
                                        disabled={completeMutation.isPending}
                                    >
                                        {completeMutation.isPending ? (
                                            <>
                                                <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Finish Book"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Carousel setApi={setApi} className="w-full max-w-5xl h-full flex items-center">
                                <CarouselContent>
                                    {/* Cover Slide */}
                                    <CarouselItem className="flex items-center justify-center h-full">
                                        <div className="relative w-full h-full max-h-[80dvh] sm:max-h-[70vh] max-w-3xl flex items-center justify-center">
                                            <img
                                                src={coverUrl}
                                                alt="Cover"
                                                className="w-full h-full object-contain drop-shadow-2xl"
                                                loading="eager"
                                                // @ts-expect-error React 18 type definition mismatch
                                                fetchpriority="high"
                                                onError={(e) => {
                                                    e.currentTarget.src = `https://placehold.co/600x800/1e1e1e/FFF?text=${encodeURIComponent(book.title)}`;
                                                }}
                                                onClick={() => isFullscreen && setShowControls(!showControls)}
                                            />
                                        </div>
                                    </CarouselItem>

                                    {/* Pages - Markdown Mode */}
                                    {isMarkdown && parsedPages.map((content, index) => {
                                        const isNearby = Math.abs(index + 1 - current) <= RENDER_WINDOW;
                                        return (
                                            <CarouselItem key={index} className="flex items-center justify-center h-full">
                                                {isNearby ? (
                                                    <div
                                                        className="w-full h-full p-4 md:p-8 flex items-center justify-center bg-background rounded-lg overflow-hidden"
                                                        onClick={() => isFullscreen && setShowControls(!showControls)}
                                                    >
                                                        <MarkdownBookSlide
                                                            content={content}
                                                            styleProfile={book.styleProfile}
                                                            pageIndex={index}
                                                            book={book}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full" />
                                                )}
                                            </CarouselItem>
                                        );
                                    })}

                                    {/* Pages - Image Mode */}
                                    {!isMarkdown && imagePages.map((pageUrl, index) => (
                                        <BookReaderSlide
                                            key={index}
                                            index={index}
                                            url={pageUrl}
                                            current={current}
                                            isFailed={failedImages.has(index)}
                                            prompt={showPrompts ? promptsByPage.get(index + 1) : undefined}
                                            onToggleControls={handleToggleControls}
                                            onImageError={handleImageError}
                                        />
                                    ))}

                                    {/* End Slide */}
                                    <CarouselItem className="flex items-center justify-center h-full">
                                        <div className="w-full h-full flex flex-col items-center justify-center text-center text-white space-y-6">
                                            <h3 className="text-3xl font-serif italic">The End</h3>
                                            <p className="text-gray-400">Great reading!</p>
                                            <Button
                                                size="lg"
                                                onClick={() => {
                                                    if (needsChildSelection) {
                                                        setShowChildSelection(true);
                                                    } else {
                                                        completeMutation.mutate(undefined);
                                                    }
                                                }}
                                                disabled={completeMutation.isPending}
                                            >
                                                {completeMutation.isPending ? (
                                                    <>
                                                        <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    "Finish & Log Book"
                                                )}
                                            </Button>
                                        </div>
                                    </CarouselItem>
                                </CarouselContent>

                                {/* Tap zones for mobile navigation */}
                                <button
                                    className="absolute left-0 top-0 bottom-0 w-[25%] z-30 cursor-pointer bg-transparent border-none outline-none active:bg-white/5 transition-colors"
                                    onClick={() => api?.scrollPrev()}
                                    aria-label="Previous page"
                                    type="button"
                                />
                                <button
                                    className="absolute right-0 top-0 bottom-0 w-[25%] z-30 cursor-pointer bg-transparent border-none outline-none active:bg-white/5 transition-colors"
                                    onClick={() => api?.scrollNext()}
                                    aria-label="Next page"
                                    type="button"
                                />
                                {/* Center tap zone for fullscreen controls toggle */}
                                <div
                                    className="absolute left-[25%] right-[25%] top-0 bottom-0 z-20 cursor-pointer"
                                    onClick={() => isFullscreen && setShowControls(prev => !prev)}
                                    aria-hidden="true"
                                />
                            </Carousel>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <ChildSelectionModal
                open={showChildSelection}
                onOpenChange={setShowChildSelection}
                children={authChildren}
                onConfirm={(selectedIds) => completeMutation.mutate(selectedIds)}
                isPending={completeMutation.isPending}
            />

            <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Finished for now?</DialogTitle>
                        <DialogDescription>
                            You're on page {current - 1} of {totalPages}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 mt-4">
                        {user ? (
                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => {
                                    if (needsChildSelection) {
                                        setShowChildSelection(true);
                                        setShowFinishDialog(false);
                                    } else {
                                        completeMutation.mutate(undefined);
                                    }
                                }}
                                disabled={completeMutation.isPending}
                            >
                                {completeMutation.isPending ? (
                                    <>
                                        <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Yes, mark complete"
                                )}
                            </Button>
                        ) : (
                            <div className="text-center space-y-2 py-2">
                                <p className="text-sm text-muted-foreground">
                                    <a href="/login" className="text-primary font-medium hover:underline">Sign in</a> to save completion and track reading history.
                                </p>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                saveProgress({ current, total: count || 0 });
                                if (!user) {
                                    toast.info("Progress saved on this device", {
                                        description: "Sign in to sync across devices."
                                    });
                                }
                                handleCloseComplete();
                            }}
                        >
                            No, continue later (Save page)
                        </Button>
                        {activityId && (
                            <Button
                                variant="ghost"
                                className="w-full text-slate-500"
                                onClick={() => skipMutation.mutate()}
                            >
                                Skip this book
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showResumeDialog} onOpenChange={(open) => {
                if (!open) {
                    setShowResumeDialog(false);
                    setRestoredPage(null);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Welcome Back!</DialogTitle>
                        <DialogDescription>
                            You were reading <strong>{book.title}</strong> and left off at page {restoredPage}.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:justify-start gap-2">
                        <div className="flex gap-2 w-full">
                            <Button
                                className="flex-1"
                                variant="default"
                                onClick={() => {
                                    if (api && restoredPage) {
                                        api.scrollTo(restoredPage - 1);
                                    }
                                    setShowResumeDialog(false);
                                    setRestoredPage(null);
                                }}
                            >
                                Resume from Page {restoredPage}
                            </Button>
                            <Button
                                className="flex-1"
                                variant="outline"
                                onClick={() => {
                                    setShowResumeDialog(false);
                                    setRestoredPage(null);
                                }}
                            >
                                Start Over
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
});
