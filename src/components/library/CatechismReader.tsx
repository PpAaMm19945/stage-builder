import { useState, useEffect } from 'react';
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
import { X, BookBookmark } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { catechism as catechismApi } from '@/lib/api';

interface CatechismReaderProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CatechismReader({ open, onOpenChange }: CatechismReaderProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    const { data: items = [] } = useQuery({
        queryKey: ['catechism', 'all'],
        queryFn: () => catechismApi.list(),
    });

    useEffect(() => {
        if (!api) return;
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
                        <DialogTitle className="text-lg font-medium font-serif">Westminster Shorter Catechism</DialogTitle>
                        <DialogDescription className="text-gray-400 text-xs">
                            Question {current - 1 > 0 ? current - 1 : 'Cover'} of {items.length}
                        </DialogDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/20 rounded-full">
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {/* Reader Area */}
                <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-slate-900/50">
                    <Carousel setApi={setApi} className="w-full max-w-2xl h-full flex items-center">
                        <CarouselContent>
                            {/* Cover Slide */}
                            <CarouselItem className="flex items-center justify-center h-full">
                                <div className="relative w-full h-full max-h-[80dvh] aspect-[148/210] max-w-md bg-[#1e293b] flex flex-col items-center justify-center p-8 rounded-r-lg shadow-2xl border-l-[12px] border-l-[#0f172a] border-t border-t-white/10">
                                    <div className="border border-slate-400/30 p-8 w-full h-full flex flex-col items-center justify-center text-center space-y-8">
                                        <BookBookmark className="h-24 w-24 text-slate-300" weight="duotone" />
                                        <div className="space-y-4">
                                            <h1 className="text-3xl sm:text-4xl font-serif text-slate-100 font-bold tracking-wide leading-tight">
                                                WESTMINSTER<br />SHORTER<br />CATECHISM
                                            </h1>
                                            <p className="text-slate-400 font-serif italic text-lg">For Family Instruction</p>
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>

                            {/* Question Pages */}
                            {items.map((item: any) => {
                                // Parse Q&A
                                // Expected format: "Q: ... \n\n A: ..."
                                const parts = item.content.split('\nA: ');
                                const question = parts[0]?.replace('Q: ', '').trim();
                                const answer = parts[1]?.trim();

                                return (
                                    <CarouselItem key={item.id} className="flex items-center justify-center h-full">
                                        <div className="w-full max-w-md h-full max-h-[80dvh] aspect-[148/210] bg-[#fbfaf8] text-slate-900 p-8 sm:p-12 shadow-xl rounded-sm flex flex-col relative overflow-hidden">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-8 border-b border-double border-slate-300 pb-4">
                                                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Question {item.sequence_number}</div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 flex flex-col justify-center space-y-8">
                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Question</h3>
                                                    <p className="text-xl sm:text-2xl font-serif font-bold text-slate-900 text-center leading-relaxed">
                                                        {question}
                                                    </p>
                                                </div>

                                                <div className="w-12 h-px bg-slate-300 mx-auto" />

                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Answer</h3>
                                                    <p className="text-lg sm:text-xl font-serif text-slate-800 text-center leading-loose italic">
                                                        {answer}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="mt-8 pt-4 border-t border-slate-200 text-center">
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Sola Scriptura</p>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                );
                            })}
                        </CarouselContent>

                        <CarouselPrevious className="left-2 sm:-left-12 h-12 w-12 bg-white/10 hover:bg-white/20 border-none text-white z-20" />
                        <CarouselNext className="right-2 sm:-right-12 h-12 w-12 bg-white/10 hover:bg-white/20 border-none text-white z-20" />
                    </Carousel>
                </div>
            </DialogContent>
        </Dialog>
    );
}
