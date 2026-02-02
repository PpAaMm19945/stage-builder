import { useState, memo, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowCounterClockwise } from '@phosphor-icons/react';

interface BookPageImageProps {
    src: string;
    alt: string;
    index: number;
    onError?: () => void;
    onImageError?: (index: number) => void;
    prompt?: string;
    className?: string;
    priority?: boolean;
}

export const BookPageImage = memo(function BookPageImage({ src, alt, index, onError, onImageError, prompt, className, priority }: BookPageImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [retries, setRetries] = useState(0);

    useEffect(() => {
        // Reset state when src changes
        setIsLoaded(false);
        setError(false);
        setRetries(0);
    }, [src]);

    const handleLoad = () => {
        setIsLoaded(true);
        setError(false);
    };

    const handleError = () => {
        if (retries < 3) {
            console.log(`Retrying image ${index} (attempt ${retries + 1})...`);
            // Simple timeout to trigger re-render with new URL
            setTimeout(() => {
                setRetries(r => r + 1);
            }, 1000 * (retries + 1));
        } else {
            setError(true);
            setIsLoaded(true);
            onError?.();
            onImageError?.(index);
        }
    };

    // Construct src with retry param if retrying to bypass browser cache for failed requests
    // Only append if it's a URL (not data URI)
    const activeSrc = retries > 0 && !src.startsWith('data:')
        ? `${src}${src.includes('?') ? '&' : '?'}retry=${retries}`
        : src;

    return (
        <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Loading skeleton */}
            {!isLoaded && !error && (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <Skeleton className="w-full max-w-2xl aspect-[3/4] sm:aspect-[4/3] rounded-sm bg-white/5 animate-pulse" />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center text-white/50 gap-4 cursor-pointer hover:text-white transition-colors z-20"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent toggling controls
                        setError(false);
                        setIsLoaded(false);
                        setRetries(0);
                    }}
                >
                    <div className="bg-white/10 p-4 rounded-full hover:bg-white/20 transition-colors">
                        <ArrowCounterClockwise className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium">Failed to load page {index + 1}</p>
                        <p className="text-xs opacity-70 mt-1">Tap to retry</p>
                    </div>
                </div>
            )}

            {!error && (
                <img
                    src={activeSrc}
                    alt={alt}
                    className={cn(
                        "max-w-full max-h-[80dvh] sm:max-h-[75vh] object-contain shadow-lg rounded-sm transition-opacity duration-300",
                        !isLoaded && "opacity-0",
                        className
                    )}
                    loading={priority ? "eager" : "lazy"}
                    fetchPriority={priority ? "high" : "low"}
                    onLoad={handleLoad}
                    onError={handleError}
                />
            )}

            {/* Overlay Prompt */}
            {prompt && isLoaded && !error && (
                <div className="absolute bottom-8 left-0 right-0 mx-auto max-w-xl bg-black/80 backdrop-blur-sm text-white p-4 rounded-xl border border-white/10 animate-in slide-in-from-bottom-4 z-10">
                    <p className="text-sm font-medium leading-relaxed">
                        💡 {prompt}
                    </p>
                </div>
            )}
        </div>
    );
});
