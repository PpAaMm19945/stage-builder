import { Hono } from 'hono';
import { Env, BookMetadata, User } from '../types';
import { isValidPathSegment, safeCompare, sanitizeFilename, isAllowedFile, getContentType } from '../lib/security';
import { requireAuth } from '../lib/middleware';
import { generateId } from '../lib/utils';
import { safeQuery, safeQueryFirst, safeRun } from '../lib/db';
import { safeError } from '../lib/safe-response';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// ============ HELPERS ============

// Manifest Cache
let MANIFEST_CACHE: {
    data: Record<string, string>;
    timestamp: number;
} | null = null;
let MANIFEST_FETCH_PROMISE: Promise<Record<string, string>> | null = null;
const MANIFEST_TTL = 300 * 1000; // 5 minutes

// Book List Cache
let BOOKS_CACHE: {
    data: BookMetadata[];
    timestamp: number;
} | null = null;
let BOOKS_FETCH_PROMISE: Promise<BookMetadata[]> | null = null;
const BOOKS_CACHE_TTL = 300 * 1000; // 5 minutes

// Pages Cache
const PAGES_CACHE = new Map<string, {
    data: { count: number; pages: { index: number; url: string; filename: string }[] };
    timestamp: number;
}>();
const PAGES_CACHE_TTL = 3600 * 1000; // 1 hour

// Manifest Books Cache (Long-lived, invalidated by manifest change)
let MANIFEST_BOOKS_CACHE: {
    data: BookMetadata[];
    manifest: Record<string, string>;
} | null = null;

// Helper: Check if two manifests are equal
function areManifestsEqual(a: Record<string, string>, b: Record<string, string>): boolean {
    if (a === b) return true;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
        if (a[key] !== b[key]) return false;
    }
    return true;
}

// Helper: Get Manifest
async function getManifest(bucket: R2Bucket): Promise<Record<string, string>> {
    const now = Date.now();
    if (MANIFEST_CACHE && (now - MANIFEST_CACHE.timestamp < MANIFEST_TTL)) {
        return MANIFEST_CACHE.data;
    }

    if (MANIFEST_FETCH_PROMISE) {
        return MANIFEST_FETCH_PROMISE;
    }

    MANIFEST_FETCH_PROMISE = (async () => {
        try {
            const object = await bucket.get('manifest.json');
            if (object) {
                const data = await object.json() as Record<string, string>;
                MANIFEST_CACHE = { data, timestamp: Date.now() };
                return data;
            }
        } catch (e) {
            console.warn('Failed to fetch manifest.json:', e);
        } finally {
            MANIFEST_FETCH_PROMISE = null;
        }

        return {};
    })();

    return MANIFEST_FETCH_PROMISE;
}

// Helper: Parse age range string to months
function parseAgeRange(ageRange: string): { min: number; max: number } {
    const match = ageRange.match(/(\d+)\s*-\s*(\d+)/);
    if (!match) return { min: 24, max: 60 };

    const [, minStr, maxStr] = match;
    let min = parseInt(minStr);
    let max = parseInt(maxStr);

    if (max <= 12) {
        min = min * 12;
        max = max * 12;
    }

    return { min, max };
}

// Helper: Get book metadata from R2
async function getBookMetadata(bucket: R2Bucket, series: string, bookId: string, r2PublicUrl?: string): Promise<BookMetadata | null> {
    const manifest = await getManifest(bucket);

    // Try manifest first
    let key = manifest[`${series}/${bookId}/metadata.json`];

    // Fallback to standard path if not in manifest
    if (!key) {
        key = `books/${series}/${bookId}/metadata.json`;
    }

    const object = await bucket.get(key);

    if (!object) return null;

    const data = await object.json() as any;
    const ageRange = parseAgeRange(data.ageRange || '2-5 years');

    let coverUrl = `/api/books/${encodeURIComponent(series)}/${encodeURIComponent(bookId)}/cover`;
    const coverKey = manifest[`${series}/${bookId}/cover`];
    if (r2PublicUrl && coverKey) {
        coverUrl = `${r2PublicUrl}/${coverKey}`;
    }

    return {
        id: bookId,
        series: series,
        title: data.title || bookId,
        author: data.author,
        illustrator: data.illustrator,
        description: data.description || '',
        minAgeMonths: data.minAgeMonths || ageRange.min,
        maxAgeMonths: data.maxAgeMonths || ageRange.max,
        pageCount: data.pageCount || data.pages?.filter((p: any) => p.pageNumber)?.length || 10,
        domain: data.domain || 'language',
        learningStage: data.learningStage || 'early-years',
        readingPrompts: data.readingPrompts,
        coverUrl
    };
}

// Helper: List all delimited prefixes with pagination
async function listAllPrefixes(bucket: R2Bucket, options: R2ListOptions): Promise<string[]> {
    let prefixes: string[] = [];
    let truncated = true;
    let cursor: string | undefined;

    while (truncated) {
        const result = await bucket.list({ ...options, cursor });
        prefixes = prefixes.concat(result.delimitedPrefixes || []);
        truncated = result.truncated;
        if (result.truncated) {
            cursor = result.cursor;
        }
    }
    return prefixes;
}

// Helper: Find metadata file in a book directory (case-insensitive)
async function findMetadataFile(bucket: R2Bucket, bookPrefix: string): Promise<R2ObjectBody | null> {
    const result = await bucket.list({ prefix: bookPrefix });

    const metadataKey = result.objects.find(obj =>
        obj.key.toLowerCase().endsWith('/metadata.json') ||
        obj.key.toLowerCase() === 'metadata.json'
    )?.key;

    if (metadataKey) {
        return bucket.get(metadataKey);
    }
    return null;
}

// Helper: Fetch All Books
async function fetchAllBooks(bucket: R2Bucket, r2PublicUrl?: string): Promise<BookMetadata[]> {
    const now = Date.now();
    if (BOOKS_CACHE && (now - BOOKS_CACHE.timestamp < BOOKS_CACHE_TTL)) {
        return BOOKS_CACHE.data;
    }

    if (BOOKS_FETCH_PROMISE) {
        return BOOKS_FETCH_PROMISE;
    }

    BOOKS_FETCH_PROMISE = (async () => {
        try {
            const books: BookMetadata[] = [];
            console.log('Starting robust book listing...');

            // 1. Manifest-based Listing
            const manifest = await getManifest(bucket);

            // Check if we can use cached manifest books (avoiding N+1 R2 reads)
            if (MANIFEST_BOOKS_CACHE && areManifestsEqual(MANIFEST_BOOKS_CACHE.manifest, manifest)) {
                console.log('Using cached manifest books');
                books.push(...MANIFEST_BOOKS_CACHE.data);
            } else {
                const manifestEntries = Object.keys(manifest).filter(k => k.endsWith('/metadata.json'));

                // Incremental Loading Optimization: Reuse cached books if physical key matches
                const oldBookMap = new Map<string, BookMetadata>();
                if (MANIFEST_BOOKS_CACHE) {
                    for (const book of MANIFEST_BOOKS_CACHE.data) {
                        const key = `${book.series}/${book.id}/metadata.json`;
                        oldBookMap.set(key, book);
                    }
                }

                const manifestBooks = await Promise.all(manifestEntries.map(async (entryKey) => {
                    const parts = entryKey.split('/');
                    // Expect series/bookId/metadata.json
                    if (parts.length < 3) return null;
                    const series = parts[0];
                    const bookId = parts[1];

                    try {
                        const physicalKey = manifest[entryKey];

                        // Check if we can reuse cached book
                        if (MANIFEST_BOOKS_CACHE) {
                            const oldPhysicalKey = MANIFEST_BOOKS_CACHE.manifest[entryKey];
                            if (oldPhysicalKey === physicalKey) {
                                const cachedBook = oldBookMap.get(entryKey);
                                if (cachedBook) {
                                    return cachedBook;
                                }
                            }
                        }

                        const object = await bucket.get(physicalKey);
                        if (object) {
                            const data = await object.json() as any;
                            const ageRange = parseAgeRange(data.ageRange || '2-5 years');

                            let coverUrl = `/api/books/${encodeURIComponent(series)}/${encodeURIComponent(bookId)}/cover`;
                            const coverKey = manifest[`${series}/${bookId}/cover`];
                            if (r2PublicUrl && coverKey) {
                                coverUrl = `${r2PublicUrl}/${coverKey}`;
                            }

                            return {
                                id: bookId,
                                series: series,
                                seriesTitle: data.series || series,
                                title: data.title || bookId,
                                author: data.author,
                                illustrator: data.illustrator,
                                description: data.description || '',
                                minAgeMonths: data.minAgeMonths || ageRange.min,
                                maxAgeMonths: data.maxAgeMonths || ageRange.max,
                                pageCount: data.pageCount || data.pages?.filter((p: any) => p.pageNumber)?.length || 10,
                                domain: data.domain || 'language',
                                learningStage: data.learningStage || 'early-years',
                                readingPrompts: data.readingPrompts,
                                coverUrl
                            } as BookMetadata;
                        }
                    } catch (e) { console.warn(`Failed to load manifest book ${series}/${bookId}`, e); }
                    return null;
                }));

                const validManifestBooks = manifestBooks.filter((b): b is BookMetadata => b !== null);
                books.push(...validManifestBooks);

                // Update Manifest Cache
                MANIFEST_BOOKS_CACHE = {
                    data: validManifestBooks,
                    manifest: manifest
                };
            }

            const loadedIds = new Set(books.map(b => `${b.series}/${b.id}`));

            // 2. Legacy Listing (fallback for non-manifest items)
            const rootList = await bucket.list({ delimiter: '/' });
            const rootPrefixes = rootList.delimitedPrefixes || [];

            let rootPath = '';
            if (rootPrefixes.includes('books/')) {
                rootPath = 'books/';
            }
            console.log(`Detected root path: '${rootPath}'`);

            const seriesPrefixes = await listAllPrefixes(bucket, {
                prefix: rootPath,
                delimiter: '/'
            });

            const seriesBookLists = await Promise.all(seriesPrefixes.map(async (seriesPrefix) => {
                const seriesName = seriesPrefix.replace(rootPath, '').replace(/\/$/, '');
                const bookPrefixes = await listAllPrefixes(bucket, {
                    prefix: seriesPrefix,
                    delimiter: '/'
                });
                return { seriesName, seriesPrefix, bookPrefixes };
            }));

            const allBookTasks = seriesBookLists.flatMap(({ seriesName, seriesPrefix, bookPrefixes }) =>
                bookPrefixes.map(bookPrefix => ({ seriesName, seriesPrefix, bookPrefix }))
            );

            const bookResults = await Promise.all(allBookTasks.map(async ({ seriesName, seriesPrefix, bookPrefix }) => {
                const bookId = bookPrefix.replace(seriesPrefix, '').replace(/\/$/, '');

                // Skip if already loaded from manifest
                if (loadedIds.has(`${seriesName}/${bookId}`)) return null;

                try {
                    const object = await findMetadataFile(bucket, bookPrefix);

                    if (object) {
                        const data = await object.json() as any;
                        const ageRange = parseAgeRange(data.ageRange || '2-5 years');

                        let coverUrl = `/api/books/${encodeURIComponent(seriesName)}/${encodeURIComponent(bookId)}/cover`;
                        const coverKey = manifest[`${seriesName}/${bookId}/cover`];
                        if (r2PublicUrl && coverKey) {
                            coverUrl = `${r2PublicUrl}/${coverKey}`;
                        }

                        return {
                            id: bookId,
                            series: seriesName,
                            seriesTitle: data.series || seriesName,
                            title: data.title || bookId,
                            author: data.author,
                            illustrator: data.illustrator,
                            description: data.description || '',
                            minAgeMonths: data.minAgeMonths || ageRange.min,
                            maxAgeMonths: data.maxAgeMonths || ageRange.max,
                            pageCount: data.pageCount || data.pages?.filter((p: any) => p.pageNumber)?.length || 10,
                            domain: data.domain || 'language',
                            learningStage: data.learningStage || 'early-years',
                            readingPrompts: data.readingPrompts,
                            coverUrl
                        } as BookMetadata;
                    }
                } catch (e) {
                    console.warn(`Failed to load book ${bookId}:`, e);
                }
                return null;
            }));

            books.push(...bookResults.filter((b): b is BookMetadata => b !== null));

            // Update Cache
            BOOKS_CACHE = { data: books, timestamp: Date.now() };

            return books;
        } catch (error: any) {
            console.error('Books list error:', error);
            throw error;
        } finally {
            BOOKS_FETCH_PROMISE = null;
        }
    })();

    return BOOKS_FETCH_PROMISE;
}

// ============ BOOKS & SERIES ROUTES ============

// List all books
app.get('/api/books', async (c) => {
    try {
        c.header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');

        const stage = c.req.query('stage');
        const ageMonths = c.req.query('ageMonths');

        // fetchAllBooks handles caching internally
        const books = await fetchAllBooks(c.env.BOOKS_BUCKET, c.env.R2_PUBLIC_URL);

        let filtered = books;
        if (stage) {
            filtered = filtered.filter(b => b.learningStage === stage);
        }
        if (ageMonths) {
            const age = parseInt(ageMonths);
            filtered = filtered.filter(b => b.minAgeMonths <= age && b.maxAgeMonths >= age);
        }

        return c.json(filtered);
    } catch (error: any) {
        console.error('Books list error:', error);
        return safeError(c, error);
    }
});

// List all series
app.get('/api/series', async (c) => {
    try {
        const bucket = c.env.BOOKS_BUCKET;
        const seriesList: any[] = [];
        const seenSeries = new Set<string>();

        // 1. Manifest Discovery
        const manifest = await getManifest(bucket);
        Object.keys(manifest).forEach(k => {
            const parts = k.split('/');
            if (parts.length > 0) seenSeries.add(parts[0]);
        });

        // 2. Legacy Discovery
        const rootList = await bucket.list({ prefix: 'books/', delimiter: '/' });
        const seriesPrefixes = rootList.delimitedPrefixes || [];
        seriesPrefixes.forEach(prefix => {
            const s = prefix.replace('books/', '').replace('/', '');
            if (s) seenSeries.add(s);
        });

        const seriesData = await Promise.all(Array.from(seenSeries).map(async (seriesId) => {
            // Check manifest for series metadata
            let metaKey = manifest[`${seriesId}/metadata.json`];
            // Fallback
            if (!metaKey) metaKey = `books/${seriesId}/metadata.json`;

            const metaObj = await bucket.get(metaKey);

            let metadata: any = { id: seriesId, title: seriesId, description: '' };

            if (metaObj) {
                try {
                    metadata = await metaObj.json();
                } catch (e) { console.warn(`Invalid metadata for series ${seriesId}`); }
            }

            return {
                ...metadata,
                id: seriesId,
                coverUrl: `/api/series/${encodeURIComponent(seriesId)}/cover`
            };
        }));

        seriesList.push(...seriesData);

        return c.json(seriesList);

    } catch (error: any) {
        return safeError(c, error);
    }
});

// Get series details
app.get('/api/series/:seriesId', async (c) => {
    try {
        const seriesId = c.req.param('seriesId');

        if (!isValidPathSegment(seriesId)) {
            return c.json({ error: 'Invalid path segment' }, 400);
        }

        const bucket = c.env.BOOKS_BUCKET;
        const manifest = await getManifest(bucket);

        // Series Metadata
        let metaKey = manifest[`${seriesId}/metadata.json`];
        if (!metaKey) metaKey = `books/${seriesId}/metadata.json`;

        const metaObj = await bucket.get(metaKey);

        if (!metaObj) {
            return c.json({ error: 'Series not found' }, 404);
        }

        const metadata = await metaObj.json() as any;
        const books: BookMetadata[] = [];
        const seenBooks = new Set<string>();

        // 1. Manifest Books
        const manifestEntries = Object.keys(manifest).filter(k => k.startsWith(`${seriesId}/`) && k.endsWith('/metadata.json'));
        const manifestBooks = await Promise.all(manifestEntries.map(async (entryKey) => {
            const parts = entryKey.split('/');
            if (parts.length < 3) return null;
            const bookId = parts[1];
            if (seenBooks.has(bookId)) return null;
            seenBooks.add(bookId);

            return getBookMetadata(bucket, seriesId, bookId, c.env.R2_PUBLIC_URL);
        }));
        books.push(...manifestBooks.filter((b): b is BookMetadata => b !== null));

        // 2. Legacy Books
        const prefix = `books/${seriesId}`;
        const booksList = await bucket.list({ prefix: `${prefix}/`, delimiter: '/' });
        const bookPrefixes = booksList.delimitedPrefixes || [];

        const legacyBooks = await Promise.all(bookPrefixes.map(async (bookPrefix) => {
            const bookId = bookPrefix.replace(`${prefix}/`, '').replace('/', '');
            if (seenBooks.has(bookId)) return null;
            return getBookMetadata(bucket, seriesId, bookId, c.env.R2_PUBLIC_URL);
        }));

        books.push(...legacyBooks.filter((b): b is BookMetadata => b !== null));

        return c.json({
            ...metadata,
            id: seriesId,
            coverUrl: `/api/series/${encodeURIComponent(seriesId)}/cover`,
            books
        });

    } catch (error: any) {
        return safeError(c, error);
    }
});

// Get series cover
app.get('/api/series/:seriesId/cover', async (c) => {
    try {
        const seriesId = c.req.param('seriesId');

        if (!isValidPathSegment(seriesId)) {
            return c.json({ error: 'Invalid path segment' }, 400);
        }

        const bucket = c.env.BOOKS_BUCKET;

        const key = `books/${seriesId}/cover.png`;
        const object = await bucket.get(key);

        if (object) {
            const headers = new Headers();
            headers.set('Content-Type', object.httpMetadata?.contentType || 'image/png');
            headers.set('Cache-Control', 'public, max-age=86400');
            return new Response(object.body, { headers });
        }

        return c.json({ error: 'Series cover not found' }, 404);

    } catch (error: any) {
        return safeError(c, error);
    }
});

// Get single book metadata
app.get('/api/books/:series/:bookId', async (c) => {
    try {
        const series = decodeURIComponent(c.req.param('series'));
        const bookId = decodeURIComponent(c.req.param('bookId'));

        if (!isValidPathSegment(series) || !isValidPathSegment(bookId)) {
            return c.json({ error: 'Invalid path segment' }, 400);
        }

        const metadata = await getBookMetadata(c.env.BOOKS_BUCKET, series, bookId, c.env.R2_PUBLIC_URL);

        if (!metadata) {
            return c.json({ error: 'Book not found' }, 404);
        }

        return c.json(metadata);
    } catch (error: any) {
        return safeError(c, error);
    }
});

// Get book cover image (Robust) - DEPRECATED: Use direct R2 access via manifest
app.get('/api/books/:series/:bookId/cover', async (c) => {
    try {
        const series = decodeURIComponent(c.req.param('series'));
        const bookId = decodeURIComponent(c.req.param('bookId'));

        if (!isValidPathSegment(series) || !isValidPathSegment(bookId)) {
            return c.json({ error: 'Invalid path segment' }, 400);
        }

        const bucket = c.env.BOOKS_BUCKET;

        // 0. Manifest Lookup
        const manifest = await getManifest(bucket);
        const coverKeys = [
            `${series}/${bookId}/cover`,
            `${series}/${bookId}/cover.png`,
            `${series}/${bookId}/cover.jpg`,
            `${series}/${bookId}/cover.jpeg`
        ];

        for (const key of coverKeys) {
            const manifestKey = manifest[key];
            if (manifestKey) {
                const object = await bucket.get(manifestKey);
                if (object) {
                    const headers = new Headers();
                    const ext = manifestKey.split('.').pop()?.toLowerCase();
                    const contentType = object.httpMetadata?.contentType ||
                        (ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png');
                    headers.set('Content-Type', contentType);
                    headers.set('Cache-Control', 'public, max-age=86400');
                    headers.set('Access-Control-Allow-Origin', '*');
                    headers.set('X-Source', 'manifest');
                    return new Response(object.body, { headers });
                }
            }
        }

        // 1. Check Index File first
        try {
            const indexObj = await bucket.get('books/index.json');
            if (indexObj) {
                const index = await indexObj.json() as Record<string, Record<string, string>>;
                if (index[series] && index[series][bookId]) {
                    const indexedPath = index[series][bookId];
                    const object = await bucket.get(indexedPath);
                    if (object) {
                        const headers = new Headers();
                        const ext = indexedPath.split('.').pop()?.toLowerCase();
                        const contentType = object.httpMetadata?.contentType ||
                            (ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png');
                        headers.set('Content-Type', contentType);
                        headers.set('Cache-Control', 'public, max-age=86400');
                        headers.set('Access-Control-Allow-Origin', '*');
                        headers.set('X-Source', 'index');
                        return new Response(object.body, { headers });
                    }
                }
            }
        } catch (e) {
            console.warn('Index lookup failed:', e);
        }

        // 2. Fallback to Strict Structure Rules
        // Priority 1: Picture Books (books/<Series>/<Book>/cover.png)
        // Priority 2: PDF Bundles (books/<Series>/images/<Book>.png)
        const pathsToTry = [
            `books/${series}/${bookId}/cover.png`,
            `books/${series}/${bookId}/cover.jpg`,
            `books/${series}/images/${bookId}.png`,
            `books/${series}/images/${bookId}.jpg`,
            // Low priority legacy fallbacks
            `books/${series}/${bookId}/images/cover.png`,
            `books/${series}/${bookId}/images/cover.jpg`,
        ];

        for (const key of pathsToTry) {
            const object = await bucket.get(key);
            if (object) {
                const headers = new Headers();
                const ext = key.split('.').pop()?.toLowerCase();
                const contentType = object.httpMetadata?.contentType ||
                    (ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png');
                headers.set('Content-Type', contentType);
                headers.set('Cache-Control', 'public, max-age=86400');
                headers.set('Access-Control-Allow-Origin', '*');
                headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
                return new Response(object.body, { headers });
            }
        }

        return c.json({
            error: 'Cover not found',
            tried: pathsToTry,
            help: 'Create books/index.json or ensure cover exists at books/{series}/{bookId}/cover.png or books/{series}/images/{bookId}.png'
        }, 404);
    } catch (error: any) {
        return safeError(c, error);
    }
});

// Debug endpoint for cover URL probing
app.get('/api/books/:series/:bookId/cover/debug', async (c) => {
    try {
        // Security: Admin access only
        const authHeader = c.req.header('Authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
        const secret = c.env.ADMIN_SECRET;

        if (!secret || !(await safeCompare(token, secret))) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const series = decodeURIComponent(c.req.param('series'));
        const bookId = decodeURIComponent(c.req.param('bookId'));

        if (!isValidPathSegment(series) || !isValidPathSegment(bookId)) {
            return c.json({ error: 'Invalid path segment' }, 400);
        }

        const bucket = c.env.BOOKS_BUCKET;

        const results: any[] = [];
        let foundPath = null;
        let indexEntry = null;

        // Check index
        try {
            const indexObj = await bucket.get('books/index.json');
            if (indexObj) {
                const index = await indexObj.json() as Record<string, Record<string, string>>;
                if (index[series] && index[series][bookId]) {
                    indexEntry = index[series][bookId];
                    const object = await bucket.head(indexEntry);
                    results.push({
                        path: indexEntry,
                        source: 'index',
                        found: !!object
                    });
                    if (object) foundPath = indexEntry;
                }
            }
        } catch (e: any) {
            results.push({ error: 'Index check failed', details: e.message });
        }

        const pathsToTry = [
            `books/${series}/${bookId}/cover.png`,
            `books/${series}/${bookId}/cover.jpg`,
            `books/${series}/images/${bookId}.png`,
            `books/${series}/images/${bookId}.jpg`,
            `books/${series}/${bookId}/images/cover.png`,
        ];

        for (const key of pathsToTry) {
            const object = await bucket.head(key);
            const found = !!object;
            results.push({
                path: key,
                source: 'heuristic',
                found,
                size: object?.size,
                contentType: object?.httpMetadata?.contentType
            });
            if (found && !foundPath) foundPath = key;
        }

        return c.json({
            requestedSeries: series,
            requestedBookId: bookId,
            foundPath,
            indexEntry,
            pathsChecked: results
        });
    } catch (error: any) {
        return safeError(c, error);
    }
});

// Get book page image (with CORS for cross-origin requests) - DEPRECATED
app.get('/api/books/:series/:bookId/pages/:pageNum', async (c) => {
    try {
        const series = decodeURIComponent(c.req.param('series'));
        const bookId = decodeURIComponent(c.req.param('bookId'));
        const pageNum = c.req.param('pageNum');

        if (!isValidPathSegment(series) || !isValidPathSegment(bookId) || !isValidPathSegment(pageNum)) {
            return c.json({ error: 'Invalid path segment' }, 400);
        }

        const bucket = c.env.BOOKS_BUCKET;
        const paddedNum = pageNum.padStart(2, '0');

        // 0. Manifest Lookup
        const manifest = await getManifest(bucket);
        const manifestKey = manifest[`${series}/${bookId}/pages/${paddedNum}`];
        if (manifestKey) {
            const object = await bucket.get(manifestKey);
            if (object) {
                const headers = new Headers();
                const ext = manifestKey.split('.').pop()?.toLowerCase();
                const contentType = object.httpMetadata?.contentType ||
                    (ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png');
                headers.set('Content-Type', contentType);
                headers.set('Cache-Control', 'public, max-age=86400');
                headers.set('Access-Control-Allow-Origin', '*');
                headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
                headers.set('X-Source', 'manifest');
                return new Response(object.body, { headers });
            }
        }

        const pathsToTry = [
            `books/${series}/${bookId}/images/page-${paddedNum}.png`,
            `books/${series}/${bookId}/images/page-${paddedNum}.jpg`,
            `books/${series}/${bookId}/images/page_${paddedNum}.png`,
            `books/${series}/${bookId}/images/page_${paddedNum}.jpg`,
            `books/${series}/${bookId}/page-${paddedNum}.png`,
            `books/${series}/${bookId}/page-${paddedNum}.jpg`,
            `books/${series}/${bookId}/page_${paddedNum}.png`,
            `books/${series}/${bookId}/page_${paddedNum}.jpg`,
            `${series}/${bookId}/images/page-${paddedNum}.png`,
            `${series}/${bookId}/images/page-${paddedNum}.jpg`,
            `${series}/${bookId}/images/page_${paddedNum}.png`,
            `${series}/${bookId}/images/page_${paddedNum}.jpg`,
            `${series}/${bookId}/page-${paddedNum}.png`,
            `${series}/${bookId}/page-${paddedNum}.jpg`,
            `${series}/${bookId}/page_${paddedNum}.png`,
            `${series}/${bookId}/page_${paddedNum}.jpg`,
        ];

        for (const key of pathsToTry) {
            const object = await bucket.get(key);
            if (object) {
                const headers = new Headers();
                const ext = key.split('.').pop()?.toLowerCase();
                const contentType = object.httpMetadata?.contentType ||
                    (ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png');
                headers.set('Content-Type', contentType);
                headers.set('Cache-Control', 'public, max-age=86400');
                headers.set('Access-Control-Allow-Origin', '*');
                headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
                return new Response(object.body, { headers });
            }
        }

        return c.json({
            error: 'Page not found',
            tried: pathsToTry,
            help: 'Ensure images/page-XX.png or page-XX.jpg exists in the book folder'
        }, 404);
    } catch (error: any) {
        return safeError(c, error);
    }
});

// Get book PDF - DEPRECATED
app.get('/api/books/:series/:bookId/pdf', async (c) => {
    try {
        const series = decodeURIComponent(c.req.param('series'));
        const bookId = decodeURIComponent(c.req.param('bookId'));

        if (!isValidPathSegment(series) || !isValidPathSegment(bookId)) {
            return c.json({ error: 'Invalid path segment' }, 400);
        }

        const bucket = c.env.BOOKS_BUCKET;

        const sanitizedBookId = sanitizeFilename(bookId);

        // 0. Manifest Lookup (Inferred)
        const manifest = await getManifest(bucket);

        // Check for explicit PDF entries
        const pdfKeys = [
            `${series}/${bookId}/pdf`,
            `${series}/${bookId}/book.pdf`,
            `${series}/${bookId}.pdf`
        ];

        for (const key of pdfKeys) {
            const manifestKey = manifest[key];
            if (manifestKey) {
                const object = await bucket.get(manifestKey);
                if (object) {
                    const headers = new Headers();
                    headers.set('Content-Type', 'application/pdf');
                    headers.set('Cache-Control', 'public, max-age=86400');
                    headers.set('Access-Control-Allow-Origin', '*');
                    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
                    headers.set('Content-Disposition', `inline; filename="${sanitizedBookId}.pdf"`);
                    headers.set('X-Source', 'manifest-explicit');
                    return new Response(object.body, { headers });
                }
            }
        }

        const metaKey = manifest[`${series}/${bookId}/metadata.json`];
        if (metaKey) {
            // Infer PDF path from metadata location
            const dir = metaKey.substring(0, metaKey.lastIndexOf('/'));
            const potentialPdfPaths = [
                `${dir}/book.pdf`,
                `${dir}/${bookId}.pdf`
            ];

            for (const key of potentialPdfPaths) {
                const object = await bucket.get(key);
                if (object) {
                    const headers = new Headers();
                    headers.set('Content-Type', 'application/pdf');
                    headers.set('Cache-Control', 'public, max-age=86400');
                    headers.set('Access-Control-Allow-Origin', '*');
                    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
                    headers.set('Content-Disposition', `inline; filename="${sanitizedBookId}.pdf"`);
                    headers.set('X-Source', 'manifest-inferred');
                    return new Response(object.body, { headers });
                }
            }
        }

        const pathsToTry = [
            `books/${series}/${bookId}.pdf`,
            `${series}/${bookId}.pdf`,
            `books/${series}/${bookId}/${bookId}.pdf`,
            `${series}/${bookId}/${bookId}.pdf`,
            `books/${series}/${bookId}/book.pdf`,
            `${series}/${bookId}/book.pdf`,
        ];

        for (const key of pathsToTry) {
            const object = await bucket.get(key);
            if (object) {
                const headers = new Headers();
                headers.set('Content-Type', 'application/pdf');
                headers.set('Cache-Control', 'public, max-age=86400');
                headers.set('Access-Control-Allow-Origin', '*');
                headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
                headers.set('Content-Disposition', `inline; filename="${sanitizedBookId}.pdf"`);
                return new Response(object.body, { headers });
            }
        }

        return c.json({
            error: 'PDF not found',
            tried: pathsToTry,
            help: 'Upload PDF to R2 at books/{series}/{bookId}/book.pdf'
        }, 404);
    } catch (error: any) {
        return safeError(c, error);
    }
});

// Get book pages list (New dynamic endpoint)
app.get('/api/books/:series/:bookId/pages', async (c) => {
    try {
        const series = decodeURIComponent(c.req.param('series'));
        const bookId = decodeURIComponent(c.req.param('bookId'));

        if (!isValidPathSegment(series) || !isValidPathSegment(bookId)) {
            return c.json({ error: 'Invalid path segment' }, 400);
        }

        // Cache Check
        const cacheKey = `${series}/${bookId}`;
        const now = Date.now();
        const cached = PAGES_CACHE.get(cacheKey);

        if (cached && (now - cached.timestamp < PAGES_CACHE_TTL)) {
            c.header('Cache-Control', 'public, max-age=86400');
            return c.json(cached.data);
        }

        const bucket = c.env.BOOKS_BUCKET;
        const r2PublicUrl = c.env.R2_PUBLIC_URL;

        const prefixesToScan = [
            `books/${series}/${bookId}/`,
            `${series}/${bookId}/` // Manifest root
        ];

        const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const imageFiles: { key: string; filename: string }[] = [];
        const seenKeys = new Set<string>();

        // Helper to extract numeric part for sorting
        const extractPageNumber = (filename: string): number => {
            const match = filename.match(/(\d+)/);
            return match ? parseInt(match[0], 10) : 999999;
        };

        for (const prefix of prefixesToScan) {
            let truncated = true;
            let cursor: string | undefined;

            while (truncated) {
                const result = await bucket.list({ prefix, cursor });
                truncated = result.truncated;
                if (result.truncated) {
                    cursor = result.cursor;
                } else {
                    cursor = undefined;
                }

                for (const obj of result.objects) {
                    if (seenKeys.has(obj.key)) continue;

                    const lowerKey = obj.key.toLowerCase();
                    if (validExtensions.some(ext => lowerKey.endsWith(ext))) {
                        if (lowerKey.includes('cover')) continue;

                        const filename = obj.key.split('/').pop() || '';
                        const lowerFilename = filename.toLowerCase();

                        if (
                            lowerFilename.includes('page') ||
                            /^\d+\.(jpg|jpeg|png|webp)$/.test(lowerFilename) ||
                            (lowerKey.includes('/images/') && !lowerFilename.includes('cover'))
                        ) {
                            imageFiles.push({ key: obj.key, filename });
                            seenKeys.add(obj.key);
                        }
                    }
                }
            }
        }

        imageFiles.sort((a, b) => {
            const numA = extractPageNumber(a.filename);
            const numB = extractPageNumber(b.filename);
            return numA - numB;
        });

        const pages = imageFiles.map((file, index) => {
            let url = `/api/books/${encodeURIComponent(series)}/${encodeURIComponent(bookId)}/pages/${index + 1}`;

            if (r2PublicUrl) {
                url = `${r2PublicUrl}/${file.key}`;
            }

            return {
                index: index + 1,
                url,
                filename: file.filename
            };
        });

        const responseData = {
            count: pages.length,
            pages
        };

        // Update Cache
        if (PAGES_CACHE.size > 1000) {
            // Evict oldest instead of clearing all to prevent cache stampedes
            const oldest = PAGES_CACHE.keys().next().value;
            if (oldest) PAGES_CACHE.delete(oldest);
        }
        PAGES_CACHE.set(cacheKey, { data: responseData, timestamp: now });

        c.header('Cache-Control', 'public, max-age=86400');
        return c.json(responseData);

    } catch (error: any) {
        return safeError(c, error);
    }
});

// Get any book asset - DEPRECATED
app.get('/api/books/:series/:bookId/asset/*', async (c) => {
    try {
        const series = decodeURIComponent(c.req.param('series'));
        const bookId = decodeURIComponent(c.req.param('bookId'));
        const assetPath = c.req.path.split('/asset/')[1] || '';
        const bucket = c.env.BOOKS_BUCKET;

        if (!assetPath || !isValidPathSegment(assetPath) || !isValidPathSegment(series) || !isValidPathSegment(bookId)) {
            return c.json({ error: 'Invalid path segment' }, 400);
        }

        const pathsToTry = [
            `books/${series}/${bookId}/${assetPath}`,
            `${series}/${bookId}/${assetPath}`,
        ];

        for (const key of pathsToTry) {
            const object = await bucket.get(key);
            if (object) {
                const headers = new Headers();
                object.writeHttpMetadata(headers);
                headers.set('Cache-Control', 'public, max-age=3600');
                headers.set('Access-Control-Allow-Origin', '*');
                return new Response(object.body, { headers });
            }
        }

        return c.json({ error: 'Asset not found', tried: pathsToTry }, 404);
    } catch (error: any) {
        return safeError(c, error);
    }
});

// Log reading session completion
app.post('/api/reading/complete', async (c) => {
    try {
        const user = requireAuth(c);
        const body = await c.req.json();
        const { series, bookId, childrenPresent, notes } = body;

        if (!series || !bookId) {
            return c.json({ error: 'Series and bookId are required' }, 400);
        }

        const book = await safeQueryFirst<{ id: string }>(c.env.DB,
            "SELECT id FROM formations WHERE (id = ? OR id = ?) AND formation_type = 'reading'",
            [bookId, `${series}/${bookId}`]
        );

        if (!book) {
            return c.json({
                error: 'Book not found',
                tried: [bookId, `${series}/${bookId}`],
                help: 'Ensure the book is seeded in the formations table with a matching id'
            }, 404);
        }

        const sessionId = generateId('read');
        const childrenJson = childrenPresent ? JSON.stringify(childrenPresent) : null;

        await safeRun(c.env.DB, `
      INSERT INTO reading_sessions (id, parent_id, book_id, children_present, notes, completed_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `, [sessionId, user.id, book.id, childrenJson, notes || null]);

        const session = await safeQueryFirst(c.env.DB, 'SELECT * FROM reading_sessions WHERE id = ?', [sessionId]);

        return c.json(session, 201);
    } catch (error: any) {
        return safeError(c, error, 400);
    }
});

// Get reading history
app.get('/api/reading/history', async (c) => {
    try {
        const user = requireAuth(c);
        const limit = c.req.query('limit') || '20';

        const { results } = await safeQuery(c.env.DB, `
      SELECT * FROM reading_sessions 
      WHERE parent_id = ? 
      ORDER BY completed_at DESC 
      LIMIT ?
    `, [user.id, parseInt(limit)]);

        const sessions = results.map((session: any) => ({
            ...session,
            childrenPresent: session.children_present ? JSON.parse(session.children_present) : [],
        }));

        return c.json(sessions);
    } catch (error: any) {
        return safeError(c, error);
    }
});

// Upload book image (Admin only)
app.put('/api/books/upload', async (c) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const secret = c.env.ADMIN_SECRET;

    if (!secret || !(await safeCompare(token, secret))) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const path = c.req.query('path');
    if (!path) return c.json({ error: 'Path required' }, 400);

    // Security: Prevent arbitrary file writes and directory traversal
    if (!path.startsWith('books/') || !isValidPathSegment(path)) {
        return c.json({ error: 'Invalid path. Must start with books/ and not contain traversal characters.' }, 403);
    }

    // Security: Enforce allowed file types
    const isJson = path.toLowerCase().endsWith('.json');
    if (!isAllowedFile(path) && !isJson) {
        return c.json({ error: 'Invalid file type. Allowed: jpg, png, webp, pdf, json' }, 400);
    }

    try {
        const body = await c.req.arrayBuffer();

        let contentType = getContentType(path);
        if (isJson) contentType = 'application/json';

        await c.env.BOOKS_BUCKET.put(path, body, {
            httpMetadata: { contentType }
        });
        return c.json({ success: true, path });
    } catch (error: any) {
        return safeError(c, error);
    }
});

// Debug R2 endpoint
app.get('/api/debug/r2', async (c) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const secret = c.env.ADMIN_SECRET;

    if (!secret || !(await safeCompare(token, secret))) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
        const bucket = c.env.BOOKS_BUCKET;
        const prefix = c.req.query('prefix');
        const delimiter = c.req.query('delimiter');

        const listNoDelimiter = await bucket.list({ prefix });
        const listWithDelimiter = await bucket.list({ prefix, delimiter: delimiter || '/' });

        return c.json({
            prefix,
            delimiter: delimiter || '/',
            listNoDelimiter,
            listWithDelimiter
        });
    } catch (error: any) {
        return safeError(c, error);
    }
});

// Debug Book Audit
app.get('/api/debug/books/audit', async (c) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const secret = c.env.ADMIN_SECRET;

    if (!secret || !(await safeCompare(token, secret))) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const bucket = c.env.BOOKS_BUCKET;
    const violations: any[] = [];
    let totalBooks = 0;
    let compliant = 0;

    try {
        const roots = await bucket.list({ prefix: 'books/', delimiter: '/' });
        const seriesPrefixes = roots.delimitedPrefixes || [];

        for (const seriesPrefix of seriesPrefixes) {
            const seriesName = seriesPrefix.replace('books/', '').replace('/', '');
            if (!/^[a-z0-9_]+$/.test(seriesName)) {
                violations.push({ series: seriesName, issue: 'Series folder must be snake_case' });
            }

            const books = await bucket.list({ prefix: seriesPrefix, delimiter: '/' });
            const bookPrefixes = books.delimitedPrefixes || [];

            for (const bookPrefix of bookPrefixes) {
                totalBooks++;
                const bookId = bookPrefix.replace(seriesPrefix, '').replace('/', '');
                const bookIssues: string[] = [];

                if (!/^[a-z0-9_]+$/.test(bookId)) {
                    bookIssues.push('Book folder must be snake_case');
                }

                const cover = await bucket.head(bookPrefix + 'images/cover.png');
                if (!cover) bookIssues.push('Missing images/cover.png');

                const metadata = await bucket.get(bookPrefix + 'metadata.json');
                if (!metadata) {
                    bookIssues.push('Missing metadata.json');
                } else {
                    const m = await metadata.json() as any;
                    if (m.id !== bookId) bookIssues.push(`Metadata ID mismatch: ${m.id} != ${bookId}`);
                }

                if (bookIssues.length > 0) {
                    violations.push({ series: seriesName, bookId, issues: bookIssues });
                } else {
                    compliant++;
                }
            }
        }

        return c.json({
            totalBooks,
            compliant,
            nonCompliant: totalBooks - compliant,
            violations
        });

    } catch (e: any) {
        return safeError(c, e);
    }
});

export default app;
