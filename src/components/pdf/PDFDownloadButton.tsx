import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FilePdf, Spinner } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { DownloadPrintButton } from '@/components/ui/DownloadPrintButton';
import { BookDocument } from './BookDocument';
import { Book } from '@/types';
import { books } from '@/lib/api';
import { fetchAllHymns, fetchCatechism, HymnData, CatechismData } from '@/lib/book-content';
import { useBookAssetUrl, useBookPageUrls } from '@/hooks/useBookAssetUrl';
import { bookManifest } from '@/lib/book-manifest';

interface BookMetadataPage {
    text?: string | string[];
    type?: string;
}

interface PDFDownloadButtonProps {
    book: Book;
    pages?: string[]; // Markdown pages
    catechismData?: CatechismData[]; // Pre-fetched catechism data (avoids R2 fetch)
}

export function PDFDownloadButton({ book, pages, catechismData: prefetchedCatechism }: PDFDownloadButtonProps) {
    const [hymns, setHymns] = useState<HymnData[]>([]);
    const [catechismData, setCatechismData] = useState<CatechismData[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [coverImage, setCoverImage] = useState<string>('');
    const [loadingData, setLoadingData] = useState(false);
    const [ready, setReady] = useState(false);
    const [parsedPages, setParsedPages] = useState<string[]>(pages || []);

    // Use hooks to resolve URLs proactively
    const { data: manifestPageUrls } = useBookPageUrls(book.series, book.id, book.pageCount);
    const { data: resolvedCover } = useBookAssetUrl(book.series, book.id, 'cover');

    // Helper to convert URL to base64
    const imageUrlToBase64 = async (url: string): Promise<string> => {
        try {
            console.log('[PDF] Fetching image:', url);
            let response = await fetch(url);

            // If primary fetch fails, try fallbacks
            if (!response.ok) {
                console.warn(`[PDF] Image fetch failed for ${url} (Status: ${response.status}). Trying fallbacks...`);

                // If API proxy URL failed, try manifest resolution first
                if (url.includes('/api/books/')) {
                    const match = url.match(/\/api\/books\/([^\/]+)\/([^\/]+)\/pages\/(\d+)/);
                    if (match) {
                        const [_, series, bookId, pageNum] = match;
                        const pageNumInt = parseInt(pageNum);

                        // Try manifest resolution
                        const padded = String(pageNumInt).padStart(2, '0');
                        const manifestKey = `${series}/${bookId}/pages/${padded}`;
                        const manifestUrl = await bookManifest.resolve(manifestKey);

                        if (manifestUrl) {
                            console.log('[PDF] Trying manifest URL:', manifestUrl);
                            const mRes = await fetch(manifestUrl);
                            if (mRes.ok) {
                                response = mRes;
                            }
                        }

                        // If still failing, try common R2 patterns
                        if (!response.ok) {
                            const r2Url = import.meta.env.VITE_R2_PUBLIC_URL || 'https://pub-ca8030f7c94b40f68be9f17bfd8977c0.r2.dev';
                            const fallbackPatterns = [
                                `${r2Url}/books/${series}/${bookId}/images/page-${pageNum}.png`,
                                `${r2Url}/books/${series}/${bookId}/images/page-${pageNumInt}.png`,
                                `${r2Url}/books/${series}/${bookId}/page-${pageNum}.png`,
                                `${r2Url}/${series}/${bookId}/pages/${padded}`, // Manifest Key direct
                            ];

                            for (const fallbackUrl of fallbackPatterns) {
                                try {
                                    const fbResponse = await fetch(fallbackUrl);
                                    if (fbResponse.ok) {
                                        console.log('[PDF] Fallback success:', fallbackUrl);
                                        response = fbResponse;
                                        break;
                                    }
                                } catch (e) {
                                    // Ignore errors in fallback chain
                                }
                            }
                        }
                    }
                }
            }

            if (!response.ok) {
                console.error('[PDF] All attempts failed for image:', url);
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
                if (prefetchedCatechism && prefetchedCatechism.length > 0) {
                    setCatechismData(prefetchedCatechism);
                    contentLoaded = true;
                } else {
                    const series = book.series || 'catechism';
                    const data = await fetchCatechism(series);
                    if (data.length > 0) {
                        setCatechismData(data);
                        contentLoaded = true;
                    }
                }
            }
            // 3. Image-based books (try first if pageCount > 0)
            else if (book.pageCount > 0) {
                // Use manifest URLs if available, otherwise fallback to API construction
                const urls = (manifestPageUrls && manifestPageUrls.length === book.pageCount)
                    ? manifestPageUrls
                    : Array.from({ length: book.pageCount }, (_, i) =>
                        books.getPageUrl(book.series, book.id, i + 1)
                    );

                // Try to load cover with fallback
                let coverBase64 = '';
                const coverUrlToUse = resolvedCover || book.coverUrl;

                if (coverUrlToUse) {
                    coverBase64 = await imageUrlToBase64(coverUrlToUse);
                }

                if (!coverBase64 && !coverUrlToUse) {
                    // Try API cover URL fallback
                    const apiCoverUrl = books.getCoverUrl(book.series, book.id);
                    coverBase64 = await imageUrlToBase64(apiCoverUrl);
                }

                if (coverBase64) setCoverImage(coverBase64);

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
                            .filter((p: BookMetadataPage) => p.text || p.type === 'content')
                            .map((p: BookMetadataPage) => Array.isArray(p.text) ? p.text.join('\n\n') : (p.text || ''))
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
    if (book.downloadUrl || (book.renderFormat === 'pdf' && book.pdfUrl)) {
        const url = book.downloadUrl || book.pdfUrl;
        return (
            <Button
                variant="ghost"
                size="default" // Changed from 'icon' to 'default' to allow text
                onClick={() => window.open(url, '_blank')}
                className="text-white hover:bg-white/20 rounded-full px-4"
                title="Open PDF"
            >
                <FilePdf className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
            </Button>
        );
    }

    // If data is not ready, show a button that triggers preparation
    if (!ready) {
        return (
            <Button
                variant="ghost"
                size="default" // Changed to default for text
                onClick={prepareData}
                disabled={loadingData}
                className="text-white hover:bg-white/20 rounded-full px-4"
                title="Prepare PDF Download"
            >
                {loadingData ? <Spinner className="w-5 h-5 animate-spin mr-2" /> : <FilePdf className="w-5 h-5 mr-2" />}
                <span className="hidden sm:inline">{loadingData ? "Preparing..." : "Download PDF"}</span>
                <span className="sm:hidden">{loadingData ? "..." : "PDF"}</span>
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
            label="Download PDF"
            size="sm" // Changed to sm (which has text padding) instead of icon
            variant="ghost"
            className="text-white hover:bg-white/20 rounded-full"
        />
    );
}
