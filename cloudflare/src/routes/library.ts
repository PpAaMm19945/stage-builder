import { Hono } from 'hono';
import { Env, BookMetadata, User } from '../types';
import { isValidPathSegment, safeCompare } from '../lib/security';
import { requireAuth } from '../lib/middleware';
import { generateId } from '../lib/utils';
import { safeQuery, safeQueryFirst, safeRun } from '../lib/db';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

// ============ HELPERS ============

// Helper: Parse age range string to months
function parseAgeRange(ageRange: string): { min: number; max: number } {
    const match = ageRange.match(/(\d+)\s*-\s*(\d+)/);
    if (!match) return { min: 24, max: 60 };

    let [, minStr, maxStr] = match;
    let min = parseInt(minStr);
    let max = parseInt(maxStr);

    if (max <= 12) {
        min = min * 12;
        max = max * 12;
    }

    return { min, max };
}

// Helper: Get book metadata from R2
async function getBookMetadata(bucket: R2Bucket, series: string, bookId: string): Promise<BookMetadata | null> {
    const key = `books/${series}/${bookId}/metadata.json`;
    const object = await bucket.get(key);

    if (!object) return null;

    const data = await object.json() as any;
    const ageRange = parseAgeRange(data.ageRange || '2-5 years');

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
        coverUrl: `/api/books/${encodeURIComponent(series)}/${encodeURIComponent(bookId)}/cover`
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

// ============ BOOKS & SERIES ROUTES ============

// List all books
app.get('/api/books', async (c) => {
    try {
        c.header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');

        const stage = c.req.query('stage');
        const ageMonths = c.req.query('ageMonths');
        const bucket = c.env.BOOKS_BUCKET;
        const books: BookMetadata[] = [];

        console.log('Starting robust book listing...');

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

            try {
                const object = await findMetadataFile(bucket, bookPrefix);

                if (object) {
                    const data = await object.json() as any;
                    const ageRange = parseAgeRange(data.ageRange || '2-5 years');

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
                        coverUrl: `/api/books/${encodeURIComponent(seriesName)}/${encodeURIComponent(bookId)}/cover`
                    } as BookMetadata;
                }
            } catch (e) {
                console.warn(`Failed to load book ${bookId}:`, e);
            }
            return null;
        }));

        books.push(...bookResults.filter((b): b is BookMetadata => b !== null));

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
        return c.json({ error: error.message || 'Failed to list books' }, 500);
    }
});

// List all series
app.get('/api/series', async (c) => {
    try {
        const bucket = c.env.BOOKS_BUCKET;
        const seriesList: any[] = [];

        const rootList = await bucket.list({ prefix: 'books/', delimiter: '/' });
        const seriesPrefixes = rootList.delimitedPrefixes || [];

        for (const prefix of seriesPrefixes) {
            const seriesId = prefix.replace('books/', '').replace('/', '');

            const metaKey = `${prefix}metadata.json`;
            const metaObj = await bucket.get(metaKey);

            let metadata: any = { id: seriesId, title: seriesId, description: '' };

            if (metaObj) {
                try {
                    metadata = await metaObj.json();
                } catch (e) { console.warn(`Invalid metadata for series ${seriesId}`); }
            }

            seriesList.push({
                ...metadata,
                id: seriesId,
                coverUrl: `/api/series/${encodeURIComponent(seriesId)}/cover`
            });
        }

        return c.json(seriesList);

    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

// Get series details
app.get('/api/series/:seriesId', async (c) => {
    try {
        const seriesId = c.req.param('seriesId');
        const bucket = c.env.BOOKS_BUCKET;
        const prefix = `books/${seriesId}`;

        const metaKey = `${prefix}/metadata.json`;
        const metaObj = await bucket.get(metaKey);

        if (!metaObj) {
            return c.json({ error: 'Series not found' }, 404);
        }

        const metadata = await metaObj.json() as any;

        const booksList = await bucket.list({ prefix: `${prefix}/`, delimiter: '/' });
        const bookPrefixes = booksList.delimitedPrefixes || [];
        const books: BookMetadata[] = [];

        for (const bookPrefix of bookPrefixes) {
            const bookId = bookPrefix.replace(`${prefix}/`, '').replace('/', '');
            const bookMeta = await getBookMetadata(bucket, seriesId, bookId);
            if (bookMeta) {
                books.push(bookMeta);
            }
        }

        return c.json({
            ...metadata,
            id: seriesId,
            coverUrl: `/api/series/${encodeURIComponent(seriesId)}/cover`,
            books
        });

    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

// Get series cover
app.get('/api/series/:seriesId/cover', async (c) => {
    try {
        const seriesId = c.req.param('seriesId');
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
        return c.json({ error: error.message }, 500);
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

        const metadata = await getBookMetadata(c.env.BOOKS_BUCKET, series, bookId);

        if (!metadata) {
            return c.json({ error: 'Book not found' }, 404);
        }

        return c.json(metadata);
    } catch (error: any) {
        return c.json({ error: error.message || 'Failed to get book' }, 500);
    }
});

// Get book cover image (Robust)
app.get('/api/books/:series/:bookId/cover', async (c) => {
    try {
        const series = decodeURIComponent(c.req.param('series'));
        const bookId = decodeURIComponent(c.req.param('bookId'));

        if (!isValidPathSegment(series) || !isValidPathSegment(bookId)) {
            return c.json({ error: 'Invalid path segment' }, 400);
        }

        const bucket = c.env.BOOKS_BUCKET;

        const toTitleCase = (str: string) => str
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        const seriesTitleCase = toTitleCase(series);
        const bookIdTitleCase = toTitleCase(bookId);

        const pathsToTry = [
            `books/${series}/${bookId}/images/cover.png`,
            `books/${series}/${bookId}/images/cover.jpg`,
            `books/${series}/${bookId}/images/cover.jpeg`,
            `books/${seriesTitleCase}/${bookIdTitleCase}/images/cover.png`,
            `books/${seriesTitleCase}/${bookIdTitleCase}/Cover Photo.png`,
            `books/${seriesTitleCase}/${bookIdTitleCase}/cover.png`,
            `books/${seriesTitleCase}/${bookId}/images/cover.png`,
            `books/${seriesTitleCase}/${bookId}/Cover Photo.png`,
            `books/${series}/images/${bookId}.png`,
            `books/${series}/images/${bookId}.jpg`,
            `books/${series}/images/${bookId}.jpeg`,
            `books/${series}/${bookId}/cover.png`,
            `books/${series}/${bookId}/cover.jpg`,
            `books/${series}/${bookId}/cover.jpeg`,
            `books/${seriesTitleCase}/${bookIdTitleCase}/cover.png`,
            `books/${seriesTitleCase}/${bookIdTitleCase}/cover.jpg`,
            `books/${series}/images/cover.png`,
            `books/${series}/images/cover.jpg`,
            `books/${series}/images/cover.jpeg`,
            `books/${series}/${bookId}/images/page-01.png`,
            `books/${series}/${bookId}/images/page-01.jpg`,
            `books/${series}/${bookId}/images/page_01.png`,
            `books/${series}/${bookId}/images/page_01.jpg`,
            `books/${seriesTitleCase}/${bookIdTitleCase}/images/Page 1.png`,
            `books/${seriesTitleCase}/${bookIdTitleCase}/Page 1.png`,
            `books/${series}/${bookId}/page-01.png`,
            `books/${series}/${bookId}/page-01.jpg`,
            `books/${series}/${bookId}/page_01.png`,
            `books/${series}/${bookId}/page_01.jpg`,
            `${series}/${bookId}/images/cover.png`,
            `${series}/${bookId}/images/cover.jpg`,
            `${series}/${bookId}/images/cover.jpeg`,
            `${seriesTitleCase}/${bookIdTitleCase}/images/cover.png`,
            `${seriesTitleCase}/${bookIdTitleCase}/Cover Photo.png`,
            `${series}/images/${bookId}.png`,
            `${series}/images/${bookId}.jpg`,
            `${series}/images/${bookId}.jpeg`,
            `${series}/${bookId}/cover.png`,
            `${series}/${bookId}/cover.jpg`,
            `${series}/${bookId}/cover.jpeg`,
            `${series}/images/cover.png`,
            `${series}/images/cover.jpg`,
            `${series}/images/cover.jpeg`,
            `${series}/${bookId}/images/page-01.png`,
            `${series}/${bookId}/images/page_01.png`,
            `${series}/${bookId}/page-01.png`,
            `${series}/${bookId}/page_01.png`,
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
            help: 'Ensure cover.png, cover.jpg, or images/page-01.png exists in the book folder'
        }, 404);
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

// Debug endpoint for cover URL probing
app.get('/api/books/:series/:bookId/cover/debug', async (c) => {
    try {
        const series = decodeURIComponent(c.req.param('series'));
        const bookId = decodeURIComponent(c.req.param('bookId'));
        const bucket = c.env.BOOKS_BUCKET;

        const toTitleCase = (str: string) => str
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        const seriesTitleCase = toTitleCase(series);
        const bookIdTitleCase = toTitleCase(bookId);

        const pathsToTry = [
            `books/${series}/${bookId}/images/cover.png`,
            `books/${series}/${bookId}/images/cover.jpg`,
            `books/${series}/images/${bookId}.png`,
            `books/${series}/images/${bookId}.jpg`,
            `books/${seriesTitleCase}/${bookIdTitleCase}/images/cover.png`,
            `books/${seriesTitleCase}/${bookIdTitleCase}/Cover Photo.png`,
            `books/${series}/${bookId}/images/page-01.png`,
            `books/${series}/${bookId}/images/page_01.png`,
            `books/${seriesTitleCase}/${bookIdTitleCase}/images/Page 1.png`,
        ];

        const results = [];
        let foundPath = null;

        for (const key of pathsToTry) {
            const object = await bucket.head(key);
            const found = !!object;
            results.push({
                path: key,
                found,
                size: object?.size,
                contentType: object?.httpMetadata?.contentType
            });
            if (found && !foundPath) foundPath = key;
        }

        return c.json({
            requestedSeries: series,
            requestedBookId: bookId,
            seriesTitleCase,
            bookIdTitleCase,
            foundPath,
            pathsChecked: results
        });
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

// Get book page image (with CORS for cross-origin requests)
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
        return c.json({ error: error.message }, 500);
    }
});

// Get book PDF
app.get('/api/books/:series/:bookId/pdf', async (c) => {
    try {
        const series = decodeURIComponent(c.req.param('series'));
        const bookId = decodeURIComponent(c.req.param('bookId'));

        if (!isValidPathSegment(series) || !isValidPathSegment(bookId)) {
            return c.json({ error: 'Invalid path segment' }, 400);
        }

        const bucket = c.env.BOOKS_BUCKET;

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
                headers.set('Content-Disposition', `inline; filename="${bookId}.pdf"`);
                return new Response(object.body, { headers });
            }
        }

        return c.json({
            error: 'PDF not found',
            tried: pathsToTry,
            help: 'Upload PDF to R2 at books/{series}/{bookId}/book.pdf'
        }, 404);
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

// Get any book asset
app.get('/api/books/:series/:bookId/asset/*', async (c) => {
    try {
        const series = decodeURIComponent(c.req.param('series'));
        const bookId = decodeURIComponent(c.req.param('bookId'));
        const assetPath = c.req.path.split('/asset/')[1] || '';
        const bucket = c.env.BOOKS_BUCKET;

        if (!assetPath || assetPath.includes('..') || !isValidPathSegment(series) || !isValidPathSegment(bookId)) {
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
        return c.json({ error: error.message }, 500);
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
        return c.json({ error: error.message || 'Failed to log reading session' }, 400);
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
        return c.json({ error: error.message || 'Unauthorized' }, 401);
    }
});

// Upload book image (Admin only)
app.put('/api/books/upload', async (c) => {
    const key = c.req.query('key');
    const secret = c.env.ADMIN_SECRET;

    if (!secret || !(await safeCompare(key, secret))) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const path = c.req.query('path');
    if (!path) return c.json({ error: 'Path required' }, 400);

    // Security: Prevent arbitrary file writes and directory traversal
    if (!path.startsWith('books/') || !isValidPathSegment(path)) {
        return c.json({ error: 'Invalid path. Must start with books/ and not contain traversal characters.' }, 403);
    }

    try {
        const body = await c.req.arrayBuffer();
        await c.env.BOOKS_BUCKET.put(path, body);
        return c.json({ success: true, path });
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

// Debug R2 endpoint
app.get('/api/debug/r2', async (c) => {
    const key = c.req.query('key');
    const secret = c.env.ADMIN_SECRET;

    if (!secret || !(await safeCompare(key, secret))) {
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
        return c.json({ error: error.message }, 500);
    }
});

// Debug Book Audit
app.get('/api/debug/books/audit', async (c) => {
    const key = c.req.query('key');
    const secret = c.env.ADMIN_SECRET;

    if (!secret || !(await safeCompare(key, secret))) {
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
        return c.json({ error: e.message }, 500);
    }
});

export default app;
