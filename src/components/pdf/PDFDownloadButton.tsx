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
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error converting image to base64:', error);
            return '';
        }
    };

    // Prepare data function
    const prepareData = async () => {
        setLoadingData(true);
        try {
            // Check for Hymnal
            if (book.renderFormat === 'hymnal' || book.series === 'reformed-hymns' || book.styleProfile === 'hymn-book') {
                const series = book.series || 'reformed-hymns';
                const data = await fetchAllHymns(series);
                setHymns(data);
            }
            // Check for Catechism
            else if (book.renderFormat === 'catechism' || book.series === 'catechism') {
                const series = book.series || 'catechism';
                const data = await fetchCatechism(series);
                setCatechismData(data);
            }
            // Check for Image Book
            else if (book.renderFormat === 'image' || (!book.renderFormat && book.pageCount > 0)) {
                const urls = Array.from({ length: book.pageCount }, (_, i) => {
                    return books.getPageUrl(book.series, book.id, i + 1);
                });

                // Convert cover if exists
                if (book.coverUrl) {
                    const coverBase64 = await imageUrlToBase64(book.coverUrl);
                    setCoverImage(coverBase64);
                }

                // Convert to base64
                const base64Images = await Promise.all(urls.map(imageUrlToBase64));
                setImageUrls(base64Images.filter(img => !!img));
            }
            // Check for JSON-embedded content (like African Men of Faith series)
            else if (book.renderFormat === 'json-embedded' || !book.renderFormat) {
                try {
                    // Fetch the book's metadata which contains embedded pages
                    const metadataUrl = books.getPageUrl(book.series, book.id, 0).replace('/pages/0.', '/metadata.json').replace(/\.[^.]+$/, '');
                    // Actually, let's use a cleaner URL pattern
                    const cleanMetadataUrl = `https://r2.schoolos.io/books/${book.series}/${book.id}/metadata.json`;
                    const res = await fetch(cleanMetadataUrl);
                    if (res.ok) {
                        const metadata = await res.json();
                        if (metadata.pages && Array.isArray(metadata.pages)) {
                            // Extract text content from each page
                            const extractedPages = metadata.pages
                                .filter((p: any) => p.text || p.type === 'content')
                                .map((p: any) => {
                                    if (Array.isArray(p.text)) return p.text.join('\n\n');
                                    return p.text || '';
                                })
                                .filter((text: string) => text.trim().length > 0);

                            setParsedPages(extractedPages);
                        }
                    }
                } catch (e) {
                    console.error('Failed to load embedded book content', e);
                }
            }
            // Markdown pages are passed via props if available.

            setReady(true);
        } catch (e) {
            console.error("Failed to prepare PDF data", e);
            toast.error("Couldn't prepare PDF. Please try again.");
        } finally {
            setLoadingData(false);
        }
    };

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
