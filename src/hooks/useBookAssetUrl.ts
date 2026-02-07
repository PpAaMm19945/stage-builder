import { useQuery } from '@tanstack/react-query';
import { bookManifest } from '@/lib/book-manifest';
import { books } from '@/lib/api';

type AssetType = 'cover' | 'pdf' | 'manifest' | 'asset' | 'page';

export function useBookAssetUrl(
    series: string,
    bookId: string,
    type: AssetType,
    options?: { pageNum?: number; assetPath?: string; enabled?: boolean }
) {
    return useQuery({
        queryKey: ['book-asset', series, bookId, type, options?.pageNum, options?.assetPath],
        queryFn: async () => {
            let key = '';

            // Map request to manifest key structure
            if (type === 'cover') {
                // Try extensionless first, manifest usually handles it
                // Keys are usually "series/bookId/cover"
                key = `${series}/${bookId}/cover`;
            } else if (type === 'pdf') {
                key = `${series}/${bookId}/pdf`;
            } else if (type === 'page' && options?.pageNum !== undefined) {
                const padded = String(options.pageNum).padStart(2, '0');
                key = `${series}/${bookId}/pages/${padded}`;
            } else if (type === 'asset' && options?.assetPath) {
                key = `${series}/${bookId}/${options.assetPath}`;
            }

            // Try resolving via manifest
            if (key) {
                const resolved = await bookManifest.resolve(key);
                if (resolved) return resolved;
            }

            // Fallback to API Proxy if manifest lookup fails
            // This ensures backward compatibility if manifest is stale or missing entry
            if (type === 'cover') return books.getCoverUrl(series, bookId);
            if (type === 'pdf') return books.getPdfUrl(series, bookId);
            if (type === 'page' && options?.pageNum !== undefined) return books.getPageUrl(series, bookId, options.pageNum);
            if (type === 'asset' && options?.assetPath) return books.getAssetUrl(series, bookId, options.assetPath);

            return '';
        },
        staleTime: 1000 * 60 * 60, // 1 hour
        enabled: !!series && !!bookId && (options?.enabled ?? true),
    });
}

import { API_URL } from '@/lib/api';

interface BookPage {
    index: number;
    url: string;
    filename: string;
}

interface BookPageResponse {
    count: number;
    pages: BookPage[];
    [key: string]: unknown;
}

export function useBookPageUrls(series: string, bookId: string, pageCount: number) {
    return useQuery({
        queryKey: ['book-pages', series, bookId], // Removed pageCount dependency as source of truth is now API
        queryFn: async () => {
            // New Dynamic Endpoint
            try {
                const res = await fetch(`${API_URL}/api/books/${encodeURIComponent(series)}/${encodeURIComponent(bookId)}/pages`);
                if (!res.ok) throw new Error('Failed to fetch pages url');
                const data = await res.json() as BookPageResponse;

                if (data.pages && Array.isArray(data.pages) && data.pages.length > 0) {
                    return data.pages.map((p) => p.url);
                }

                // If API returned empty array but we expect pages, throw to trigger fallback
                if (pageCount > 0 && (!data.pages || data.pages.length === 0)) {
                    throw new Error('API returned no pages for book with known page count');
                }
            } catch (e) {
                console.warn("Failed to fetch dynamic pages, falling back to legacy generation", e);
            }

            // Fallback: Legacy Logic (if API fails or not deployed yet during dev)
            const urls: string[] = [];
            // Wait for manifest first to avoid N requests
            await bookManifest.getManifest();

            // Try Page 0 (Copyright/Intro) first - common in some new books
            const zeroKey = `${series}/${bookId}/pages/00`;
            const zeroUrl = await bookManifest.resolve(zeroKey);
            if (zeroUrl) urls.push(zeroUrl);
            else {
                // Try loose 0
                const looseKey = `${series}/${bookId}/pages/0`;
                const looseUrl = await bookManifest.resolve(looseKey);
                if (looseUrl) urls.push(looseUrl);
            }

            for (let i = 1; i <= pageCount; i++) {
                const padded = String(i).padStart(2, '0');
                const key = `${series}/${bookId}/pages/${padded}`;
                let url = await bookManifest.resolve(key);

                if (!url) {
                    // Fallback to API
                    url = books.getPageUrl(series, bookId, i);
                }
                urls.push(url);
            }
            return urls;
        },
        staleTime: 1000 * 60 * 60,
        enabled: !!series && !!bookId,
    });
}
