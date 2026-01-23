interface Env {
  APP_ASSETS: R2Bucket;
  ADMIN_SECRET?: string;
}

interface R2Bucket {
  list(options?: R2ListOptions): Promise<R2Objects>;
  put(key: string, value: any): Promise<R2Object>;
}

interface R2ListOptions {
  prefix?: string;
  cursor?: string;
  limit?: number;
}

interface R2Objects {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
}

interface R2Object {
  key: string;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Security Check
  const authHeader = request.headers.get('Authorization');
  const secret = env.ADMIN_SECRET;
  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');

  const isAuthorized = (secret && authHeader === `Bearer ${secret}`) || (secret && querySecret === secret);

  if (!isAuthorized) {
    return new Response('Unauthorized', { status: 401 });
  }

  // List all objects
  let cursor: string | undefined;
  let truncated = true;
  const allObjects: R2Object[] = [];

  try {
    while (truncated) {
      const list: R2Objects = await env.APP_ASSETS.list({
        prefix: 'books/',
        cursor,
      });
      allObjects.push(...list.objects);
      truncated = list.truncated;
      cursor = list.cursor;
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }

  // Build Manifest
  const manifest: Record<string, string> = {};
  let indexedCount = 0;

  // Regex Patterns
  const patterns = [
    // Cover
    { regex: /^books\/([^/]+)\/([^/]+)\/images\/cover\.(png|jpg|jpeg)$/i, type: 'cover' },
    { regex: /^books\/([^/]+)\/([^/]+)\/Cover Photo\.(png|jpg|jpeg)$/i, type: 'cover' },
    { regex: /^books\/([^/]+)\/images\/([^/]+)\.(png|jpg|jpeg)$/i, type: 'cover_series' },

    // Pages
    { regex: /^books\/([^/]+)\/([^/]+)\/images\/page[-_](\d+)\.(png|jpg)$/i, type: 'page' },
    { regex: /^books\/([^/]+)\/([^/]+)\/page[-_](\d+)\.(png|jpg)$/i, type: 'page' },

    // PDF
    { regex: /^books\/([^/]+)\/([^/]+)\.pdf$/i, type: 'pdf' },
    { regex: /^books\/([^/]+)\/([^/]+)\/book\.pdf$/i, type: 'pdf' },
    { regex: /^books\/([^/]+)\/([^/]+)\/\2\.pdf$/i, type: 'pdf' },

    // Metadata
    { regex: /^books\/([^/]+)\/([^/]+)\/metadata\.json$/i, type: 'metadata' }
  ];

  for (const obj of allObjects) {
    const key = obj.key;
    if (key === 'manifest.json') continue;

    for (const pattern of patterns) {
      const match = key.match(pattern.regex);
      if (match) {
        let series = '';
        let bookId = '';
        let type = pattern.type;
        let normalizedKey = '';

        if (type === 'cover_series') {
            // books/series/images/bookId.png
            series = slugify(match[1]);
            bookId = slugify(match[2]);
            normalizedKey = `${series}/${bookId}/cover`;
        } else {
            series = slugify(match[1]);
            bookId = slugify(match[2]);

            if (type === 'cover') {
              normalizedKey = `${series}/${bookId}/cover`;
            } else if (type === 'page') {
              const pageNum = match[3];
              const paddedNum = pageNum.padStart(2, '0');
              normalizedKey = `${series}/${bookId}/pages/${paddedNum}`;
            } else if (type === 'pdf') {
              normalizedKey = `${series}/${bookId}/pdf`;
            } else if (type === 'metadata') {
              normalizedKey = `${series}/${bookId}/metadata.json`;
            }
        }

        if (normalizedKey) {
          // If multiple files map to same key, last one wins.
          // Ideally we could prioritize (e.g. prefer .png over .jpg), but simple overwrite is acceptable for now.
          manifest[normalizedKey] = key;
          indexedCount++;
        }
        break;
      }
    }
  }

  // Save Manifest
  await env.APP_ASSETS.put('manifest.json', JSON.stringify(manifest));

  return new Response(JSON.stringify({ success: true, count: indexedCount, totalFiles: allObjects.length }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
