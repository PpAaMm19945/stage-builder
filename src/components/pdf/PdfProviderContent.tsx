import { BlobProvider } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { DownloadSimple, CircleNotch } from '@phosphor-icons/react';

interface PdfProviderContentProps {
    document: React.ReactElement;
    filename: string;
    className?: string;
}

/**
 * Internal component that actually uses @react-pdf/renderer.
 * This is loaded lazily by LazyPdfProvider to keep it out of the main bundle.
 */
export default function PdfProviderContent({ document, filename, className }: PdfProviderContentProps) {
    return (
        <BlobProvider document={document}>
            {({ blob, url, loading, error }) => {
                if (loading) {
                    return (
                        <Button variant="outline" size="sm" disabled className={className}>
                            <CircleNotch className="mr-2 w-4 h-4 animate-spin" />
                            Generating...
                        </Button>
                    );
                }

                if (error) {
                    return (
                        <Button variant="destructive" size="sm" disabled className={className}>
                            Error generating PDF
                        </Button>
                    );
                }

                return (
                    <Button
                        variant="outline"
                        size="sm"
                        className={className}
                        asChild
                    >
                        <a href={url || '#'} download={filename}>
                            <DownloadSimple className="mr-2 w-4 h-4" />
                            Download PDF
                        </a>
                    </Button>
                );
            }}
        </BlobProvider>
    );
}
