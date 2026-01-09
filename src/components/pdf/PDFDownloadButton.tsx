import React, { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { FilePdf, Spinner } from '@phosphor-icons/react';
import { toast } from 'sonner';
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
            if (book.series === 'reformed-hymns' || book.styleProfile === 'hymn-book' || book.title.toLowerCase().includes('hymnal')) {
                const series = book.series || 'reformed-hymns';
                const data = await fetchAllHymns(series);
                setHymns(data);
            }
            // Check for Catechism
            else if (book.series === 'catechism' || book.title.toLowerCase().includes('catechism')) {
                const series = book.series || 'catechism'; // Assuming series is 'catechism' if not defined
                // Or we might need to look up based on ID.
                // For now, let's use book.series if available, else 'catechism'
                const data = await fetchCatechism(series);
                setCatechismData(data);
            }
            // Check for Image Book
            else if (book.renderFormat === 'image') {
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
                // Filter out any failed conversions if necessary, or keep empty strings (checking in Document)
                setImageUrls(base64Images.filter(img => !!img));
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
        <PDFDownloadLink
            document={
                <BookDocument
                    book={book}
                    hymns={hymns}
                    catechism={catechismData}
                    imageUrls={imageUrls}
                    coverImage={coverImage}
                    pages={pages}
                />
            }
            fileName={`${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`}
        >
            {({ loading }) => (
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" title="Download PDF">
                    {loading ? <Spinner className="w-6 h-6 animate-spin" /> : <FilePdf className="w-6 h-6" />}
                </Button>
            )}
        </PDFDownloadLink>
    );
}
