import { memo } from 'react';
import { CarouselItem } from '@/components/ui/carousel';
import { MarkdownBookSlide } from './MarkdownBookSlide';
import { Book } from '@/types';

const RENDER_WINDOW = 3;

interface MarkdownReaderSlideProps {
    index: number;
    content: string;
    current: number;
    book: Book;
    onToggleControls: () => void;
}

export const MarkdownReaderSlide = memo(function MarkdownReaderSlide({
    index,
    content,
    current,
    book,
    onToggleControls
}: MarkdownReaderSlideProps) {
    const isNearby = Math.abs(index + 1 - current) <= RENDER_WINDOW;

    return (
        <CarouselItem className="flex items-center justify-center h-full">
            {isNearby ? (
                <div
                    className="w-full h-full p-4 md:p-8 flex items-center justify-center bg-background rounded-lg overflow-hidden"
                    onClick={onToggleControls}
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
}, (prev, next) => {
    // Custom comparison to avoid re-renders when current changes but derived state doesn't

    // Check stable props
    if (prev.content !== next.content) return false;
    if (prev.index !== next.index) return false;
    if (prev.book !== next.book) return false;
    if (prev.onToggleControls !== next.onToggleControls) return false;

    // Check derived state dependency (current)
    const prevNearby = Math.abs(prev.index + 1 - prev.current) <= RENDER_WINDOW;
    const nextNearby = Math.abs(next.index + 1 - next.current) <= RENDER_WINDOW;

    return prevNearby === nextNearby;
});
