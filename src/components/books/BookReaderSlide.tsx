import { memo } from 'react';
import { CarouselItem } from '@/components/ui/carousel';
import { BookPageImage } from './BookPageImage';

const RENDER_WINDOW = 3;

interface BookReaderSlideProps {
    index: number;
    url: string;
    current: number;
    isFailed: boolean;
    prompt?: string;
    onToggleControls: () => void;
    onImageError: (index: number) => void;
}

export const BookReaderSlide = memo(function BookReaderSlide({
    index,
    url,
    current,
    isFailed,
    prompt,
    onToggleControls,
    onImageError
}: BookReaderSlideProps) {
    if (isFailed) return null;

    const isNearby = Math.abs(index + 1 - current) <= RENDER_WINDOW;

    // Priority logic: Load eager if it's the current page or the immediate next page
    // Carousel 'current' is 1-based index (1 = Cover, 2 = Page 1)
    // So Page Index 0 is Current when current=2. Next when current=1.
    const priority = (index + 2 === current) || (index + 1 === current);

    return (
        <CarouselItem className="flex items-center justify-center h-full">
            {isNearby ? (
                <div
                    className="w-full h-full flex items-center justify-center"
                    onClick={onToggleControls}
                >
                    <BookPageImage
                        src={url}
                        alt={`Page ${index + 1}`}
                        index={index}
                        onImageError={onImageError}
                        prompt={prompt}
                        priority={priority}
                    />
                </div>
            ) : (
                <div className="w-full h-full" />
            )}
        </CarouselItem>
    );
}, (prev, next) => {
    // Custom comparison to avoid re-renders when current changes but derived state doesn't

    // Check stable props first
    if (prev.url !== next.url) return false;
    if (prev.index !== next.index) return false;
    if (prev.isFailed !== next.isFailed) return false;
    if (prev.prompt !== next.prompt) return false;
    if (prev.onToggleControls !== next.onToggleControls) return false;
    if (prev.onImageError !== next.onImageError) return false;

    // Check derived state dependency (current)
    const prevNearby = Math.abs(prev.index + 1 - prev.current) <= RENDER_WINDOW;
    const nextNearby = Math.abs(next.index + 1 - next.current) <= RENDER_WINDOW;
    if (prevNearby !== nextNearby) return false;

    const prevPriority = (prev.index + 2 === prev.current) || (prev.index + 1 === prev.current);
    const nextPriority = (next.index + 2 === next.current) || (next.index + 1 === next.current);
    if (prevPriority !== nextPriority) return false;

    return true;
});
