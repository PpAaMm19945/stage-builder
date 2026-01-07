import { useState, useEffect } from 'react';
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
import { X, CaretLeft, CaretRight, BookOpenText } from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { books, reading } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MarkdownBookSlide } from './MarkdownBookSlide';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ChildSelectionModal } from './ChildSelectionModal';

interface BookReaderProps {
    book: Book | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    childrenIds?: string[];
    onComplete?: () => void;
}

export function BookReader({ book, open, onOpenChange, childrenIds, onComplete }: BookReaderProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);
    const [showPrompts, setShowPrompts] = useState(false);
    const [parsedPages, setParsedPages] = useState<string[]>([]);
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
    const [showChildSelection, setShowChildSelection] = useState(false);
    const { user, children: authChildren } = useAuth();
    const queryClient = useQueryClient();

    // Determine if we need to prompt for child selection
    // If childrenIds provided (from daily suggestions), use those
    // If opened from sidebar (no childrenIds), need to prompt if multiple children
    const needsChildSelection = !childrenIds && authChildren.length > 1;

    // Fetch markdown content if needed
    const { data: markdownContent } = useQuery({
        queryKey: ['book-content', book?.id],
        queryFn: async () => {
            if (!book?.contentPath) return null;
            // Use existing helper if possible, or construct consistently
            // Since getPageUrl generates {series}/{book_id}/images/page_1.webp or similar
            // We need a reliable way to get the content.md URL.
            // Ideally we'd add books.getContentUrl() to api.ts, but for now we can infer from coverUrl which is more standard.
            // Cover URL: {series}/{book_id}/images/cover.png
            // Content URL: {series}/{book_id}/content.md

            // NOTE: The previous replace logic was brittle.
            // Let's rely on constructing it cleanly if book.series and book.id are available.

            const baseUrl = `https://r2.schoolos.io/books/${book.series}/${book.id}`;
            const url = `${baseUrl}/content.md`;

            // Fallback: If we must use the API helper to respect some changing base URL
            // const cover = books.getCoverUrl(book.series, book.id);
            // const url = cover.replace('/images/cover.png', '/content.md');

            const res = await fetch(url);
            if (!res.ok) {
                // Try fallback location (root vs images folder?)
                const urlFallback = `${baseUrl}/images/content.md`;
                const res2 = await fetch(urlFallback);
                if (!res2.ok) throw new Error('Failed to load book content');
                return res2.text();
            }
            return res.text();
        },
        enabled: !!book && (book.renderFormat === 'markdown' || book.renderFormat === 'hybrid')
    });

    // Completion mutation - now accepts optional override for childrenIds
    const completeMutation = useMutation({
        mutationFn: async (selectedChildrenIds?: string[]) => {
            if (!book) return;
            // Use passed selectedChildrenIds, or fallback to prop childrenIds, or all children
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
            handleClose();
        },
        onError: (err: any) => {
            toast.error("Failed to log session", { description: err.message });
        }
    });

    useEffect(() => {
        if (markdownContent) {
            // Split by "---" for pages
            const pages = markdownContent.split(/\n---\n/);
            setParsedPages(pages);
        }
    }, [markdownContent]);

    useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    // Generate page URLs based on folder convention (for Image books)
    const imagePages = (book && (!book.renderFormat || book.renderFormat === 'image')) ? Array.from({ length: book.pageCount }, (_, i) => {
        return books.getPageUrl(book.series, book.id, i + 1);
    }) : [];

    // Filter out failed images from display
    const validImagePages = imagePages.filter((_, i) => !failedImages.has(i));

    const handleImageLoad = (index: number) => {
        setLoadedImages(prev => new Set([...prev, index]));
    };

    const handleImageError = (index: number) => {
        setFailedImages(prev => new Set([...prev, index]));
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset state
        setShowPrompts(false);
        setLoadedImages(new Set());
        setFailedImages(new Set());
    };

    if (!book) return null;

    const isMarkdown = book.renderFormat === 'markdown' || book.renderFormat === 'hybrid';
    const totalPages = isMarkdown ? parsedPages.length : imagePages.length;

    // If markdown loaded but no pages parsed yet, show nothing or loading
    // But we might want to render the Carousel with 0 items initially?
    // Carousel might break with 0 items.

    return (
        <>
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="max-w-[95vw] h-[90vh] p-0 flex flex-col bg-black/95 border-none" hideCloseButton>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 text-white z-10 bg-gradient-to-b from-black/80 to-transparent">
                        <div>
                            <DialogTitle className="text-lg font-medium">{book.title}</DialogTitle>
                            <DialogDescription className="text-gray-400 text-xs">
                                Page {current} of {count || (validImagePages.length > 0 ? validImagePages.length + 2 : totalPages + 2)}
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {book.readingPrompts && book.readingPrompts.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowPrompts(!showPrompts)}
                                    className={showPrompts ? "text-primary bg-white/10" : "text-gray-400"}
                                >
                                    <BookOpenText className="w-6 h-6" />
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={handleClose} className="text-white hover:bg-white/20 rounded-full">
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>

                    {/* Reader Area */}
                    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                        <Carousel setApi={setApi} className="w-full max-w-5xl h-full flex items-center">
                            <CarouselContent>
                                {/* Cover Slide (Always Show Image Cover) */}
                                <CarouselItem className="flex items-center justify-center h-full">
                                    <div className="relative w-full h-[70vh] max-w-3xl">
                                        <img
                                            src={books.getCoverUrl(book.series, book.id)}
                                            alt="Cover"
                                            className="w-full h-full object-contain drop-shadow-2xl"
                                            onError={(e) => {
                                                // Fallback to placeholder service if R2 missing
                                                e.currentTarget.src = `https://placehold.co/600x800/1e1e1e/FFF?text=${encodeURIComponent(book.title)}`;
                                            }}
                                        />
                                    </div>
                                </CarouselItem>

                                {/* Pages - Markdown Mode */}
                                {isMarkdown && parsedPages.map((content, index) => (
                                    <CarouselItem key={index} className="flex items-center justify-center h-full">
                                        <div className="w-full h-full p-4 md:p-8 flex items-center justify-center bg-background rounded-lg overflow-hidden">
                                            <MarkdownBookSlide
                                                content={content}
                                                styleProfile={book.styleProfile}
                                                pageIndex={index}
                                                book={book}
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}

                                {/* Pages - Image Mode */}
                                {!isMarkdown && imagePages.map((pageUrl, index) => {
                                    // Skip failed images entirely
                                    if (failedImages.has(index)) return null;

                                    const isLoaded = loadedImages.has(index);

                                    return (
                                        <CarouselItem key={index} className="flex items-center justify-center h-full">
                                            <div className="relative w-full h-full flex items-center justify-center p-4">
                                                {/* Loading skeleton */}
                                                {!isLoaded && (
                                                    <div className="absolute inset-4 flex items-center justify-center">
                                                        <Skeleton className="w-full max-w-2xl aspect-[4/3] rounded-lg bg-white/10" />
                                                    </div>
                                                )}

                                                <img
                                                    src={pageUrl}
                                                    alt={`Page ${index + 1}`}
                                                    className={cn(
                                                        "max-w-full max-h-[75vh] object-contain shadow-lg rounded-sm transition-opacity duration-300",
                                                        !isLoaded && "opacity-0"
                                                    )}
                                                    loading={index < 3 ? "eager" : "lazy"}
                                                    onLoad={() => handleImageLoad(index)}
                                                    onError={() => handleImageError(index)}
                                                />

                                                {/* Overlay Prompt */}
                                                {showPrompts && book.readingPrompts?.find(p => p.page === index + 1) && (
                                                    <div className="absolute bottom-8 left-0 right-0 mx-auto max-w-xl bg-black/80 backdrop-blur-sm text-white p-4 rounded-xl border border-white/10 animate-in slide-in-from-bottom-4">
                                                        <p className="text-sm font-medium leading-relaxed">
                                                            💡 {book.readingPrompts.find(p => p.page === index + 1)?.prompt}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </CarouselItem>
                                    );
                                })}

                                {/* End Slide */}
                                <CarouselItem className="flex items-center justify-center h-full">
                                    <div className="text-center text-white space-y-6">
                                        <h3 className="text-3xl font-serif italic">The End</h3>
                                        <p className="text-gray-400">Great reading!</p>
                                        <Button
                                            size="lg"
                                            onClick={() => {
                                                if (needsChildSelection) {
                                                    setShowChildSelection(true);
                                                } else {
                                                    completeMutation.mutate();
                                                }
                                            }}
                                            disabled={completeMutation.isPending}
                                        >
                                            {completeMutation.isPending ? "Saving..." : "Finish & Log Book"}
                                        </Button>
                                    </div>
                                </CarouselItem>
                            </CarouselContent>
                            <CarouselPrevious className="left-4 bg-white/10 border-none hover:bg-white/20 text-white" />
                            <CarouselNext className="right-4 bg-white/10 border-none hover:bg-white/20 text-white" />
                        </Carousel>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Child Selection Modal - shown when completing book opened from sidebar with multiple children */}
            <ChildSelectionModal
                open={showChildSelection}
                onOpenChange={setShowChildSelection}
                children={authChildren}
                onConfirm={(selectedIds) => completeMutation.mutate(selectedIds)}
                isPending={completeMutation.isPending}
            />
        </>
    );
}

