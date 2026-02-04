
import { Context } from 'hono';
import { Env, User } from './types';
import { isValidPathSegment } from './lib/security';

// Helper: Generate a signed URL for a file
// We use HMAC-SHA256 to sign the key and expiration time
async function generateSignedUrl(
    key: string,
    secret: string,
    origin: string,
    expiresInSeconds: number = 7 * 24 * 60 * 60 // 7 days default
): Promise<string> {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    // Security: Key Separation - prefix data to prevent collision with other uses of JWT_SECRET
    const dataToSign = `file-export:${key}:${expiresAt}`;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const data = encoder.encode(dataToSign);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);

    // Convert signature to base64url
    const signatureStr = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

    return `${origin}/api/export/download?key=${encodeURIComponent(key)}&expires=${expiresAt}&sig=${signatureStr}`;
}

// Helper: Verify signed URL
async function verifySignature(
    key: string,
    expiresAt: number,
    signatureStr: string,
    secret: string
): Promise<boolean> {
    // Check expiration first
    if (Date.now() / 1000 > expiresAt) {
        return false;
    }

    // Security: Key Separation must match generation
    const dataToSign = `file-export:${key}:${expiresAt}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const data = encoder.encode(dataToSign);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify'] // Use verify instead of sign
    );

    // Convert base64url signature back to ArrayBuffer
    const signatureBinStr = atob(signatureStr.replace(/-/g, '+').replace(/_/g, '/'));
    const signature = new Uint8Array(signatureBinStr.length);
    for (let i = 0; i < signatureBinStr.length; i++) {
        signature[i] = signatureBinStr.charCodeAt(i);
    }

    return await crypto.subtle.verify('HMAC', cryptoKey, signature, data);
}

// Handler: Generate the full JSON archive
export async function handleArchiveExport(c: Context<{ Bindings: Env; Variables: { user: User | null } }>) {
    try {
        const user = c.get('user');
        if (!user || user.role !== 'parent') {
            return c.json({ error: 'Unauthorized: Parents only' }, 401);
        }

        const start = Date.now();
        const origin = new URL(c.req.url).origin;

        // 1. Fetch Core Family Data
        const family = await c.env.DB.prepare('SELECT * FROM households WHERE id = ?').bind(user.household_id).first();
        const parents = await c.env.DB.prepare('SELECT id, name, email, role, created_at FROM users WHERE household_id = ?').bind(user.household_id).all();
        const students = await c.env.DB.prepare('SELECT * FROM students WHERE household_id = ?').bind(user.household_id).all();
        const preferences = await c.env.DB.prepare('SELECT * FROM family_preferences WHERE parent_id = ?').bind(user.id).first();

        // 2. Fetch Learning Records
        // We want ALL evidences for ALL students in this household
        // (Wait, `evidences` table doesn't have household_id directly, usually linked via parent_id or student_id)
        // We'll query by parent_id since evidences are recorded by parents
        const evidences = await c.env.DB.prepare('SELECT * FROM evidences WHERE parent_id = ?').bind(user.id).all();

        // 3. Fetch Portfolio
        const portfolioItemsRaw = await c.env.DB.prepare('SELECT * FROM portfolio_items WHERE parent_id = ?').bind(user.id).all();

        // 4. Fetch Work Logs (Phase 5)
        // Need to find all apprenticeships for household students first
        const studentIds = students.results.map((s: any) => s.id);
        let apprenticeships: any[] = [];
        let workEntries: any[] = [];

        if (studentIds.length > 0) {
            const placeholders = studentIds.map(() => '?').join(',');
            const apprenticeshipResult = await c.env.DB.prepare(`SELECT * FROM apprenticeships WHERE student_id IN (${placeholders})`).bind(...studentIds).all();
            apprenticeships = apprenticeshipResult.results;

            if (apprenticeships.length > 0) {
                const appIds = apprenticeships.map((a: any) => a.id);
                const appPlaceholders = appIds.map(() => '?').join(',');
                const entriesResult = await c.env.DB.prepare(`SELECT * FROM work_entries WHERE apprenticeship_id IN (${appPlaceholders})`).bind(...appIds).all();
                workEntries = entriesResult.results;
            }
        }

        // 5. Fetch AI Logs (optional but good for history)
        const aiLogs = await c.env.DB.prepare('SELECT * FROM ai_logs WHERE parent_id = ?').bind(user.id).all();

        // 6. Process Portfolio Items to add Signed URLs
        // This is the "Media Packaging" step
        const portfolioItems = await Promise.all(portfolioItemsRaw.results.map(async (item: any) => {
            let downloadUrl = null;
            if (item.r2_key) {
                // Generate valid signed URL for 7 days
                downloadUrl = await generateSignedUrl(item.r2_key, c.env.JWT_SECRET, origin);
            }
            return {
                ...item,
                downloadUrl,
                _note: "downloadUrl is valid for 7 days"
            };
        }));

        // 7. Construct Final Archive
        const archive = {
            meta: {
                generatedAt: new Date().toISOString(),
                family: family || { id: 'unknown', name: 'Unknown' },
                version: "1.0",
                note: "This archive contains all your family's data from SchoolOS."
            },
            people: {
                parents: parents.results,
                students: students.results
            },
            settings: {
                preferences
            },
            records: {
                evidences: evidences.results,
                portfolio: portfolioItems,
                apprenticeships,
                workEntries,
                aiInteractionLogs: aiLogs.results
            }
        };

        // Return as a downloadable JSON file
        const jsonStr = JSON.stringify(archive, null, 2);
        const filename = `schoolos_archive_${new Date().toISOString().split('T')[0]}.json`;

        return new Response(jsonStr, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (e: any) {
        console.error('Export error:', e);
        return c.json({ error: e.message }, 500);
    }
}

// Handler: Serve the file if signature is valid
export async function handleSignedDownload(c: Context<{ Bindings: Env }>) {
    try {
        const key = c.req.query('key');
        const expires = parseInt(c.req.query('expires') || '0');
        const sig = c.req.query('sig');

        if (!key || !expires || !sig) {
            return c.text('Missing signature parameters', 400);
        }

        const isValid = await verifySignature(key, expires, sig, c.env.JWT_SECRET);
        if (!isValid) {
            return c.text('Invalid or expired signature', 403);
        }

        // Security: Explicit Path Traversal Check (Defense in Depth)
        if (!isValidPathSegment(key)) {
            return c.text('Invalid key path', 400);
        }

        // Fetch from R2
        // Start by checking standard key
        let object = await c.env.BOOKS_BUCKET.get(key);

        if (!object) {
            // Try with portfolio prefix just in case
            if (!key.startsWith('portfolio/')) {
                object = await c.env.BOOKS_BUCKET.get(`portfolio/${key}`);
            }
        }

        if (!object) {
            return c.text('File not found', 404);
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        // Security: Prevent MIME sniffing
        headers.set('X-Content-Type-Options', 'nosniff');

        // Force download
        const filename = key.split('/').pop()?.replace(/"/g, '') || 'download';
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);

        return new Response(object.body, {
            headers,
        });

    } catch (e: any) {
        console.error('Download error:', e);
        return c.text('Server error during download', 500);
    }
}
