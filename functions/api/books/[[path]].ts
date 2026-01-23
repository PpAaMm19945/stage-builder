
interface Env {
  APP_ASSETS: R2Bucket;
  ADMIN_SECRET?: string;
}

interface R2Bucket {
  get(key: string): Promise<R2Object | null>;
  head(key: string): Promise<R2Object | null>;
  put(key: string, value: ArrayBuffer | ReadableStream | string): Promise<R2Object>;
}

interface R2Object {
  body: ReadableStream;
  httpMetadata?: R2HTTPMetadata;
  size: number;
  httpEtag: string;
  writeHttpMetadata(headers: Headers): void;
}

interface R2HTTPMetadata {
  contentType?: string;
  cacheControl?: string;
}

// Security helper: Constant-time comparison
async function safeCompare(a: string | undefined | null, b: string | undefined | null): Promise<boolean> {
  if (!a || !b) {
    return false;
  }

  const encoder = new TextEncoder();
  const aBuf = encoder.encode(a);
  const bBuf = encoder.encode(b);

  const aHash = await crypto.subtle.digest('SHA-256', aBuf);
  const bHash = await crypto.subtle.digest('SHA-256', bBuf);

  const aLen = aHash.byteLength;
  const bLen = bHash.byteLength;

  if (aLen !== bLen) return false;

  const aView = new DataView(aHash);
  const bView = new DataView(bHash);
  let result = 0;

  for (let i = 0; i < aLen; i++) {
    result |= aView.getUint8(i) ^ bView.getUint8(i);
  }

  return result === 0;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const pathSegments = Array.isArray(params.path) ? params.path : [params.path];

  // Handle Upload (PUT /api/books/upload)
  if (pathSegments.length === 1 && pathSegments[0] === 'upload' && request.method === 'PUT') {
    const key = url.searchParams.get('key');
    const secret = env.ADMIN_SECRET;

    if (!secret || !(await safeCompare(key, secret))) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const path = url.searchParams.get('path');
    if (!path) return new Response(JSON.stringify({ error: 'Path required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    try {
      const body = await request.arrayBuffer();
      await env.APP_ASSETS.put(path, body);
      return new Response(JSON.stringify({ success: true, path }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  // Handle Fetching
  if (request.method !== 'GET' && request.method !== 'HEAD') {
     return new Response('Method not allowed', { status: 405 });
  }

  // Path structure: [series, bookId, type?, ...args?]
  if (pathSegments.length < 2) {
      return new Response('Not found', { status: 404 });
  }

  const series = decodeURIComponent(pathSegments[0] as string);
  const bookId = decodeURIComponent(pathSegments[1] as string);

  // Case 1: Metadata (e.g., /api/books/my_series/my_book)
  if (pathSegments.length === 2) {
     return await serveAsset(env.APP_ASSETS, `books/${series}/${bookId}/metadata.json`);
  }

  const type = pathSegments[2] as string;

  // Case 2: Cover
  if (type === 'cover') {
    const directPath = `books/${series}/${bookId}/images/cover.png`;
    // Probing logic adapted from worker
    const toTitleCase = (str: string) => str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const seriesTitleCase = toTitleCase(series);
    const bookIdTitleCase = toTitleCase(bookId);

    const pathsToTry = [
      directPath, // Direct
      `books/${series}/${bookId}/images/cover.jpg`,
      `books/${series}/${bookId}/images/cover.jpeg`,
      // Common legacy patterns
      `books/${seriesTitleCase}/${bookIdTitleCase}/images/cover.png`,
      `books/${seriesTitleCase}/${bookIdTitleCase}/Cover Photo.png`,
      `books/${series}/images/${bookId}.png`, // Series-level images
      `books/${series}/images/${bookId}.jpg`,
      // Fallback to page 1
      `books/${series}/${bookId}/images/page-01.png`,
      `books/${series}/${bookId}/images/page-01.jpg`,
      `books/${series}/${bookId}/page-01.png`,
    ];

    return await probeAndServe(env.APP_ASSETS, pathsToTry);
  }

  // Case 3: Pages
  if (type === 'pages' && pathSegments[3]) {
    const pageNum = pathSegments[3] as string;
    const paddedNum = pageNum.padStart(2, '0');

    const pathsToTry = [
      `books/${series}/${bookId}/images/page-${paddedNum}.png`,
      `books/${series}/${bookId}/images/page-${paddedNum}.jpg`,
      `books/${series}/${bookId}/images/page_${paddedNum}.png`,
      `books/${series}/${bookId}/images/page_${paddedNum}.jpg`,
      `books/${series}/${bookId}/page-${paddedNum}.png`,
      `books/${series}/${bookId}/page_${paddedNum}.png`,
      // Without books/ prefix (legacy fallback, though less likely in R2 structure if migrated)
      `${series}/${bookId}/images/page-${paddedNum}.png`,
    ];

    return await probeAndServe(env.APP_ASSETS, pathsToTry);
  }

  // Case 4: PDF
  if (type === 'pdf') {
     const pathsToTry = [
       `books/${series}/${bookId}.pdf`,
       `books/${series}/${bookId}/${bookId}.pdf`,
       `books/${series}/${bookId}/book.pdf`,
       // Series level
       `${series}/${bookId}.pdf`
     ];

     // PDF requires specific headers sometimes, but serveAsset handles content-type from R2 metadata
     return await probeAndServe(env.APP_ASSETS, pathsToTry, 'application/pdf');
  }

  // Case 5: Generic Asset
  if (type === 'asset' && pathSegments.length > 3) {
      const assetPath = pathSegments.slice(3).join('/');
      // Prevent directory traversal if needed, though R2 paths are just keys.
      // .. is treated as part of the key usually, but good to be careful if interpreting.
      if (assetPath.includes('..')) return new Response('Invalid path', { status: 400 });

      const pathsToTry = [
        `books/${series}/${bookId}/${assetPath}`,
        `${series}/${bookId}/${assetPath}`
      ];
      return await probeAndServe(env.APP_ASSETS, pathsToTry);
  }

  return new Response('Not found', { status: 404 });
};

async function serveAsset(bucket: R2Bucket, key: string, forceContentType?: string): Promise<Response> {
  const object = await bucket.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);

  if (forceContentType) {
    headers.set('Content-Type', forceContentType);
  }

  // Standard caching
  if (!headers.has('Cache-Control')) {
      headers.set('Cache-Control', 'public, max-age=86400');
  }

  // CORS
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

  return new Response(object.body, { headers });
}

async function probeAndServe(bucket: R2Bucket, paths: string[], forceContentType?: string): Promise<Response> {
  for (const path of paths) {
    const object = await bucket.get(path);
    if (object) {
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);

      if (forceContentType) {
        headers.set('Content-Type', forceContentType);
      } else if (!headers.has('Content-Type')) {
        // Fallback content type inference
        const ext = path.split('.').pop()?.toLowerCase();
        if (ext === 'png') headers.set('Content-Type', 'image/png');
        else if (ext === 'jpg' || ext === 'jpeg') headers.set('Content-Type', 'image/jpeg');
        else if (ext === 'pdf') headers.set('Content-Type', 'application/pdf');
        else if (ext === 'json') headers.set('Content-Type', 'application/json');
      }

      if (!headers.has('Cache-Control')) {
          headers.set('Cache-Control', 'public, max-age=86400');
      }

      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

      return new Response(object.body, { headers });
    }
  }

  return new Response('Not found', { status: 404 });
}
