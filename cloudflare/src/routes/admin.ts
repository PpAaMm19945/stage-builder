import { Hono } from 'hono';
import { Env, User } from '../types';
import { safeCompare } from '../lib/security';

const app = new Hono<{ Bindings: Env; Variables: { user: User | null } }>();

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

// Reindex R2 bucket to generate manifest.json
app.get('/api/admin/reindex', async (c) => {
  const secret = c.env.ADMIN_SECRET;
  const authHeader = c.req.header('Authorization');
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  // Security: Only accept secrets via Authorization header to prevent leakage in logs
  const isAuthorized = await safeCompare(headerToken, secret);

  if (!isAuthorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const bucket = c.env.BOOKS_BUCKET;
  let cursor: string | undefined;
  let truncated = true;
  const allObjects: any[] = [];

  try {
    while (truncated) {
      const list = await bucket.list({
        prefix: 'books/',
        cursor,
      });
      allObjects.push(...list.objects);
      truncated = list.truncated;
      cursor = list.truncated ? list.cursor : undefined;
    }
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
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
          manifest[normalizedKey] = key;
          indexedCount++;
        }
        break;
      }
    }
  }

  // Save Manifest
  await bucket.put('manifest.json', JSON.stringify(manifest));

  return c.json({ success: true, count: indexedCount, totalFiles: allObjects.length });
});

export default app;
