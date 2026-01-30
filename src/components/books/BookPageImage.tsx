import { useState, memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface BookPageImageProps {
    src: string;
    alt: string;
    index: number;
    onImageError?: (index: number) => void;
    prompt?: string;
    className?: string;
}

// ⚡ Bolt: Memoized to prevent re-renders on parent state changes (e.g. current page updates)
export const BookPageImage = memo(function BookPageImage({ src, alt, index, onImageError, prompt, className }: BookPageImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Loading skeleton */}
            {!isLoaded && (
                <div className="absolute inset-4 flex items-center justify-center">
                    <Skeleton className="w-full max-w-2xl aspect-[4/3] rounded-lg bg-white/10" />
                </div>
            )}

            <img
                src={src}
                alt={alt}
                className={cn(
                    "max-w-full max-h-[80dvh] sm:max-h-[75vh] object-contain shadow-lg rounded-sm transition-opacity duration-300",
                    !isLoaded && "opacity-0",
                    className
                )}
                loading={index < 3 ? "eager" : "lazy"}
                onLoad={() => setIsLoaded(true)}
                onError={() => onImageError?.(index)}
            />

            {/* Overlay Prompt */}
            {prompt && (
                <div className="absolute bottom-8 left-0 right-0 mx-auto max-w-xl bg-black/80 backdrop-blur-sm text-white p-4 rounded-xl border border-white/10 animate-in slide-in-from-bottom-4">
                    <p className="text-sm font-medium leading-relaxed">
                        💡 {prompt}
                    </p>
                </div>
            )}
        </div>
    );
});
