import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Book } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
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

const RENDER_WINDOW = 3;

interface BookReaderProps {
    book: Book | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    childrenIds?: string[];
    onComplete?: () => void;
    activityId?: string;
}

export function BookReader({ book, open, onOpenChange, childrenIds, onComplete, activityId }: BookReaderProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);
    const [showPrompts, setShowPrompts] = useState(false);
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
    const [showChildSelection, setShowChildSelection] = useState(false);
    const [showFinishDialog, setShowFinishDialog] = useState(false);
    const [initialProgressChecked, setInitialProgressChecked] = useState(false);
    const [restoredPage, setRestoredPage] = useState<number | null>(null);
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


    // Fetch progress
    useQuery({
        queryKey: ['book-progress', book?.id],
        queryFn: async () => {
            if (!book) return null;
            const res = await progress.get(book.id);
            if (res.progress && res.progress.status === 'in_progress' && res.progress.data?.current_page) {
                setRestoredPage(res.progress.data.current_page);
            }
            setInitialProgressChecked(true);
            return res.progress;
        },
        enabled: !!book && open && !initialProgressChecked
    });

    // Restore page effect
    useEffect(() => {
        if (restoredPage && api && restoredPage > 1 && open) {
            toast.info(`You were on page ${restoredPage}`, {
                action: {
                    label: 'Jump there',
                    onClick: () => api.scrollTo(restoredPage - 1)
                },
                duration: 8000
            });
            setRestoredPage(null);
        }
    }, [restoredPage, api, open]);

    // Save progress mutation
    const saveProgressMutation = useMutation({
        mutationFn: async () => {
            if (!book) return;
            await progress.save(book.id, {
                current_page: current,
                total_pages: count || 0
            }, 'book');
        },
        onSuccess: () => {
            toast.success("Progress saved");
            handleCloseComplete();
        }
    });

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
        onError: (err: any) => {
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
    const { data: pageUrls } = useBookPageUrls(book?.series || '', book?.id || '', book?.pageCount || 0);
    const { data: resolvedCover } = useBookAssetUrl(book?.series || '', book?.id || '', 'cover');
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

    const handleCloseRequest = async () => {
        if (current === count || current === totalPages) {
            handleCloseStandard();
            return;
        }

        if (current > 1 && current < (count || totalPages)) {
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
        setRestoredPage(null);
        setInitialProgressChecked(false);
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
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
                    {/* Header - Overlaid and toggleable in fullscreen */}
                    <div
                        className={cn(
                            "flex items-center justify-between p-2 sm:p-4 text-white z-50 bg-gradient-to-b from-black/80 to-transparent transition-all duration-300",
                            isFullscreen ? "absolute top-0 left-0 right-0" : "",
                            isFullscreen && !showControls ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
                        )}
                    >
                        <div>
                            <DialogTitle className="text-lg font-medium">{book.title}</DialogTitle>
                            {!isPdf && (
                                <DialogDescription className="text-gray-400 text-xs">
                                    Page {current} of {count || (validImagePages.length > 0 ? validImagePages.length + 2 : totalPages + 2)}
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
                                            aria-label="Download PDF"
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
                                        aria-label="Close reader"
                                    >
                                        <X className="w-6 h-6" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="z-[60]">
                                    <p>Close reader</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Reader Area */}
                    <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black">
                        {isPdf ? (
                            <div className="w-full h-full flex flex-col items-center justify-center relative bg-background/95 p-8">
                                <div className="text-center max-w-md space-y-6">
                                    <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <BookOpenText className="w-10 h-10 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-foreground mb-2">{book.title}</h3>
                                        <p className="text-muted-foreground">
                                            This book is available as a PDF document. Click below to open it in a new tab.
                                        </p>
                                    </div>
                                    <Button
                                        size="lg"
                                        onClick={() => window.open(pdfUrl, '_blank')}
                                        className="gap-2"
                                    >
                                        <ArrowsOutSimple className="w-5 h-5" />
                                        Open PDF in New Tab
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
                                    {!isMarkdown && imagePages.map((pageUrl, index) => {
                                        if (failedImages.has(index)) return null;

                                        const isNearby = Math.abs(index + 1 - current) <= RENDER_WINDOW;
                                        const prompt = showPrompts && book.readingPrompts?.find(p =>
                                            typeof p === 'object' && 'page' in p && p.page === index + 1
                                        ) as { page: number; prompt: string } | undefined;

                                        return (
                                            <CarouselItem key={index} className="flex items-center justify-center h-full">
                                                {isNearby ? (
                                                    <div
                                                        className="w-full h-full flex items-center justify-center"
                                                        onClick={() => isFullscreen && setShowControls(!showControls)}
                                                    >
                                                        <BookPageImage
                                                            src={pageUrl}
                                                            alt={`Page ${index + 1}`}
                                                            index={index}
                                                            onImageError={handleImageError}
                                                            prompt={prompt?.prompt}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full" />
                                                )}
                                            </CarouselItem>
                                        );
                                    })}

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

                                {/* Tap zones for navigation - Hidden in fullscreen if controls hidden? Or always active? */}
                                {/* In fullscreen, tap center to toggle controls. Left/Right to nav. */}
                                <div
                                    className="absolute left-0 top-0 bottom-0 w-[20%] z-10 cursor-pointer"
                                    onClick={() => api?.scrollPrev()}
                                    aria-hidden="true"
                                />
                                <div
                                    className="absolute right-0 top-0 bottom-0 w-[20%] z-10 cursor-pointer"
                                    onClick={() => api?.scrollNext()}
                                    aria-hidden="true"
                                />
                                {/* Center tap zone for controls */}
                                <div
                                    className="absolute left-[20%] right-[20%] top-0 bottom-0 z-10 cursor-pointer"
                                    onClick={() => isFullscreen && setShowControls(prev => !prev)}
                                    aria-hidden="true"
                                />

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CarouselPrevious className={cn(
                                            "left-2 sm:left-4 h-12 w-12 bg-white/20 border-none hover:bg-white/30 text-white z-20 transition-opacity duration-300",
                                            isFullscreen && !showControls ? "opacity-0 pointer-events-none" : "opacity-100"
                                        )} />
                                    </TooltipTrigger>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CarouselNext className={cn(
                                            "right-2 sm:right-4 h-12 w-12 bg-white/20 border-none hover:bg-white/30 text-white z-20 transition-opacity duration-300",
                                            isFullscreen && !showControls ? "opacity-0 pointer-events-none" : "opacity-100"
                                        )} />
                                    </TooltipTrigger>
                                </Tooltip>
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
                            You're on page {current} of {count}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 mt-4">
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
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => saveProgressMutation.mutate()}
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
        </>
    );
}
