import { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from '@/components/ui/carousel';
import { X, BookOpenText } from '@phosphor-icons/react';

import { useQuery } from '@tanstack/react-query';
import { hymns as hymnsApi } from '@/lib/api';
import { useHymnContent } from '@/hooks/useHymnContent';

interface HymnalReaderProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function HymnPage({ hymn }: { hymn: any }) {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isVisible) return; // Already visible, no need to observe

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                root: null, // viewport
                rootMargin: '200px', // Load when within 200px of viewport (e.g. next/prev slide)
                threshold: 0.01
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [isVisible]);

    const { data: richContent, isLoading } = useHymnContent(hymn.title, isVisible);

    // Fallback if rich content fails or is loading
    const content = richContent || hymn.content.replace(/\\n/g, '\n');

    return (
        <div
            ref={containerRef}
            className="w-full max-w-md h-full max-h-[80dvh] aspect-[148/210] bg-[#fbfaf8] text-slate-900 p-8 sm:p-12 shadow-xl rounded-sm flex flex-col relative overflow-hidden"
        >
            {/* Paper texture/corner */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-gray-200/50 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-start mb-6 border-b border-double border-slate-300 pb-4">
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Hymn {hymn.sequence_number}</div>
                <div className="text-xs text-slate-400 font-serif italic max-w-[50%] text-right">{hymn.reference}</div>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-center text-slate-900 mb-8 leading-tight">
                {hymn.title}
            </h2>

            {/* Lyrics - Static (overflow hidden with scrollbar hidden but scrollable if absolutely necessary, but prefer fitting) */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-none">
                {richContent ? (
                    <div
                        className="hymn-static prose prose-slate max-w-none text-center"
                        dangerouslySetInnerHTML={{ __html: richContent }}
                    />
                ) : (
                    <div className="whitespace-pre-wrap font-serif text-lg leading-loose text-slate-800 text-center">
                        {content}
                    </div>
                )}
            </div>

            {/* Styles for the injected HTML to match the book aesthetic */}
            <style>{`
                .hymn-static p {
                     margin-bottom: 1.5em;
                     font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
                     font-size: 1.125rem; /* text-lg */
                     line-height: 2; /* leading-loose */
                     color: #1e293b; /* slate-800 */
                }
                .hymn-static .hymn-chorus {
                    margin-left: 1.5em;
                    padding-left: 1em;
                    border-left: 2px solid #cbd5e1; /* slate-300 */
                    font-style: italic;
                    color: #475569; /* slate-600 */
                }
                .hymn-static .hymn-author {
                    display: none; /* We show it in header already */
                }
             `}</style>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-200 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Soli Deo Gloria</p>
            </div>
        </div>
    );
}

export function HymnalReader({ open, onOpenChange }: HymnalReaderProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCurrentCount] = useState(0);

    const { data: hymns = [] } = useQuery({
        queryKey: ['hymns', 'all'],
        queryFn: () => hymnsApi.list(),
    });

    useEffect(() => {
        if (!api) return;

        setCurrentCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full h-[100dvh] sm:h-[90vh] sm:max-w-[95vw] max-w-none p-0 flex flex-col bg-slate-950 border-none sm:rounded-lg rounded-none" hideCloseButton>
                {/* Header */}
                <div className="flex items-center justify-between p-2 sm:p-4 text-white z-10 bg-gradient-to-b from-black/80 to-transparent">
                    <div>
                        <DialogTitle className="text-lg font-medium font-serif">The SchoolOS Hymnal</DialogTitle>
                        <DialogDescription className="text-gray-400 text-xs">
                            Hymn {current - 1 > 0 ? current - 1 : 'Cover'} of {hymns.length}
                        </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2">

                        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/20 rounded-full" aria-label="Close hymnal reader">
                            <X className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                {/* Reader Area */}
                <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-slate-900/50">
                    <Carousel setApi={setApi} className="w-full max-w-2xl h-full flex items-center">
                        <CarouselContent>
                            {/* Cover Slide */}
                            <CarouselItem className="flex items-center justify-center h-full">
                                <div className="relative w-full h-full max-h-[80dvh] aspect-[148/210] max-w-md bg-[#5e2129] flex flex-col items-center justify-center p-8 rounded-r-lg shadow-2xl border-l-[12px] border-l-[#2a0e12] border-t border-t-white/10">
                                    <div className="border border-[#eecfa1]/30 p-8 w-full h-full flex flex-col items-center justify-center text-center space-y-8">
                                        <BookOpenText className="h-24 w-24 text-[#eecfa1]" weight="duotone" />
                                        <div className="space-y-4">
                                            <h1 className="text-4xl sm:text-5xl font-serif text-[#eecfa1] font-bold tracking-wide">HYMNS</h1>
                                            <p className="text-[#eecfa1]/80 font-serif italic text-lg">of Grace & Glory</p>
                                        </div>
                                        <div className="mt-8 pt-8 border-t border-[#eecfa1]/20 w-32 mx-auto">
                                            <p className="text-[#eecfa1]/60 text-xs uppercase tracking-widest">SchoolOS Edition</p>
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>

                            {/* Hymn Pages */}
                            {hymns.map((hymn: any) => (
                                <CarouselItem key={hymn.id} className="flex items-center justify-center h-full">
                                    <HymnPage hymn={hymn} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        <CarouselPrevious className="left-2 sm:-left-12 h-12 w-12 bg-white/10 hover:bg-white/20 border-none text-white z-20" />
                        <CarouselNext className="right-2 sm:-right-12 h-12 w-12 bg-white/10 hover:bg-white/20 border-none text-white z-20" />
                    </Carousel>
                </div>
            </DialogContent>
        </Dialog>
    );
}
