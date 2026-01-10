import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FilePdf, Spinner } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { DownloadPrintButton } from '@/components/ui/DownloadPrintButton';
import { BookDocument } from './BookDocument';
import { Book } from '@/types';
import { books } from '@/lib/api';
import { fetchAllHymns, fetchCatechism, HymnData, CatechismData } from '@/lib/book-content';

interface PDFDownloadButtonProps {
    book: Book;
    pages?: string[]; // Markdown pages
}

export function PDFDownloadButton({ book, pages }: PDFDownloadButtonProps) {
    const [hymns, setHymns] = useState<HymnData[]>([]);
    const [catechismData, setCatechismData] = useState<CatechismData[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [coverImage, setCoverImage] = useState<string>('');
    const [loadingData, setLoadingData] = useState(false);
    const [ready, setReady] = useState(false);
    const [parsedPages, setParsedPages] = useState<string[]>(pages || []);

    // Helper to convert URL to base64
    const imageUrlToBase64 = async (url: string): Promise<string> => {
        try {
            console.log('[PDF] Fetching image:', url);
            const response = await fetch(url);
            if (!response.ok) {
                console.error('[PDF] Image fetch failed:', url, response.status);
                return '';
            }
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('[PDF] Error converting image to base64:', url, error);
            return '';
        }
    };

    // Prepare data function
    const prepareData = async () => {
        setLoadingData(true);
        let contentLoaded = false;

        try {
            // 1. Hymnal
            if (book.renderFormat === 'hymnal' || book.series === 'reformed-hymns' || book.styleProfile === 'hymn-book') {
                const series = book.series || 'reformed-hymns';
                const data = await fetchAllHymns(series);
                if (data.length > 0) {
                    setHymns(data);
                    contentLoaded = true;
                }
            }
            // 2. Catechism
            else if (book.renderFormat === 'catechism' || book.series === 'catechism') {
                const series = book.series || 'catechism';
                const data = await fetchCatechism(series);
                if (data.length > 0) {
                    setCatechismData(data);
                    contentLoaded = true;
                }
            }
            // 3. Image-based books (try first if pageCount > 0)
            else if (book.pageCount > 0) {
                const urls = Array.from({ length: book.pageCount }, (_, i) =>
                    books.getPageUrl(book.series, book.id, i + 1)
                );

                // Try to load cover
                if (book.coverUrl) {
                    const coverBase64 = await imageUrlToBase64(book.coverUrl);
                    if (coverBase64) setCoverImage(coverBase64);
                } else {
                    // Try API cover URL
                    const apiCoverUrl = books.getCoverUrl(book.series, book.id);
                    const coverBase64 = await imageUrlToBase64(apiCoverUrl);
                    if (coverBase64) setCoverImage(coverBase64);
                }

                const base64Images = await Promise.all(urls.map(imageUrlToBase64));
                const validImages = base64Images.filter(img => !!img);

                if (validImages.length > 0) {
                    setImageUrls(validImages);
                    contentLoaded = true;
                } else {
                    console.warn('[PDF] No images loaded successfully, trying JSON-embedded fallback');
                }
            }

            // 4. JSON-embedded fallback (if nothing loaded yet)
            if (!contentLoaded) {
                const cleanMetadataUrl = `https://r2.schoolos.io/books/${book.series}/${book.id}/metadata.json`;
                const res = await fetch(cleanMetadataUrl);
                if (res.ok) {
                    const metadata = await res.json();
                    if (metadata.pages && Array.isArray(metadata.pages)) {
                        const extractedPages = metadata.pages
                            .filter((p: any) => p.text || p.type === 'content')
                            .map((p: any) => Array.isArray(p.text) ? p.text.join('\n\n') : (p.text || ''))
                            .filter((text: string) => text.trim().length > 0);

                        if (extractedPages.length > 0) {
                            setParsedPages(extractedPages);
                            contentLoaded = true;
                        }
                    }
                }
            }

            // 5. Check if pages were passed as props
            if (!contentLoaded && parsedPages.length > 0) {
                contentLoaded = true;
            }

            // 6. Show error if nothing loaded
            if (!contentLoaded) {
                toast.error("No printable content found for this book.");
            }

            setReady(true);
        } catch (e) {
            console.error("Failed to prepare PDF data", e);
            toast.error("Couldn't prepare PDF. Please try again.");
        } finally {
            setLoadingData(false);
        }
    };

    // Direct PDF download support
    if (book.renderFormat === 'pdf' && book.pdfUrl) {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open(book.pdfUrl, '_blank')}
                className="text-white hover:bg-white/20 rounded-full"
                title="Open PDF"
            >
                <FilePdf className="w-6 h-6" />
            </Button>
        );
    }

    // If data is not ready, show a button that triggers preparation
    if (!ready) {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={prepareData}
                disabled={loadingData}
                className="text-white hover:bg-white/20 rounded-full"
                title="Prepare PDF Download"
            >
                {loadingData ? <Spinner className="w-6 h-6 animate-spin" /> : <FilePdf className="w-6 h-6" />}
            </Button>
        );
    }

    return (
        <DownloadPrintButton
            document={
                <BookDocument
                    book={book}
                    hymns={hymns}
                    catechism={catechismData}
                    imageUrls={imageUrls}
                    coverImage={coverImage}
                    pages={parsedPages}
                />
            }
            fileName={`${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`}
            label="Download"
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20 rounded-full"
        />
    );
}
