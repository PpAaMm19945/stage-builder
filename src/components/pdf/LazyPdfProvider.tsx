import { lazy, Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CircleNotch, DownloadSimple } from '@phosphor-icons/react';

// Lazy load the actual PDF provider content
const PdfProviderContent = lazy(() => import('./PdfProviderContent'));

interface LazyPdfProviderProps {
    document: React.ReactElement;
    filename: string;
    buttonText?: string;
    buttonVariant?: 'default' | 'outline' | 'ghost' | 'secondary';
    buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
}

/**
 * Lazy-loading wrapper for PDF generation.
 * Only loads the 500KB+ @react-pdf/renderer when user clicks "Prepare PDF".
 * This prevents the heavy library from being part of the initial bundle.
 */
export function LazyPdfProvider({
    document,
    filename,
    buttonText = 'Prepare PDF',
    buttonVariant = 'outline',
    buttonSize = 'sm',
    className,
}: LazyPdfProviderProps) {
    const [shouldLoad, setShouldLoad] = useState(false);

    if (!shouldLoad) {
        return (
            <Button
                onClick={() => setShouldLoad(true)}
                variant={buttonVariant}
                size={buttonSize}
                className={className}
            >
                <DownloadSimple className="mr-2 w-4 h-4" />
                {buttonText}
            </Button>
        );
    }

    return (
        <Suspense fallback={
            <Button variant={buttonVariant} size={buttonSize} disabled className={className}>
                <CircleNotch className="mr-2 w-4 h-4 animate-spin" />
                Generating...
            </Button>
        }>
            <PdfProviderContent document={document} filename={filename} className={className} />
        </Suspense>
    );
}
