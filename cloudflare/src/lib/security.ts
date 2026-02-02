
// Security helper: Escape HTML special characters
export function escapeHtml(str: string): string {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Security helper: Validate path segment to prevent traversal
export function isValidPathSegment(segment: string): boolean {
    if (!segment) return false;

    // Check decoded version for hidden traversal (e.g. %2e%2e)
    try {
        const decoded = decodeURIComponent(segment);
        const decodedParts = decoded.split(/[/\\]/);
        if (decodedParts.includes('..')) return false;
    } catch {
        // Ignore decoding errors, fall back to raw check
    }

    // Disallow ".." components to prevent traversing up the bucket
    const parts = segment.split(/[/\\]/);
    return !parts.includes('..');
}

// Security helper: Constant-time comparison using Web Crypto to prevent timing attacks
export async function safeCompare(a: string | undefined | null, b: string | undefined | null): Promise<boolean> {
    if (!a || !b) {
        return false;
    }

    const encoder = new TextEncoder();
    const aBuf = encoder.encode(a);
    const bBuf = encoder.encode(b);

    // Use SHA-256 to hash inputs to fixed length, preventing length leaks
    const aHash = await crypto.subtle.digest('SHA-256', aBuf);
    const bHash = await crypto.subtle.digest('SHA-256', bBuf);

    // Compare hashes in constant time
    return crypto.subtle.timingSafeEqual(aHash, bHash);
}

// Security helper: Validate URL (http/https only)
export function isValidUrl(url: string): boolean {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

// Security helper: Validate Date string (YYYY-MM-DD or ISO)
export function isValidDate(dateStr: string): boolean {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
}

// Security helper: Validate Name (non-empty, max 100 chars, no control chars)
export function isValidName(name: string): boolean {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed.length > 100) return false;
    // Basic check for control characters
    // eslint-disable-next-line no-control-regex
    if (/[\x00-\x1F\x7F]/.test(trimmed)) return false;
    return true;
}

// Security helper: Sanitize filename for Content-Disposition headers
export function sanitizeFilename(name: string): string {
    if (!name) return 'download';
    // Remove control characters
    // eslint-disable-next-line no-control-regex
    let sanitized = name.replace(/[\x00-\x1F\x7F]/g, '');

    // Replace risky characters with underscore: " / \ : * ? < > | ;
    sanitized = sanitized.replace(/["\/\\:*?<>|;]/g, '_');

    // Prevent traversal
    sanitized = sanitized.replace(/\.\./g, '__');

    // Trim
    sanitized = sanitized.trim();

    if (sanitized.length === 0) return 'download';

    // Max length
    if (sanitized.length > 200) sanitized = sanitized.substring(0, 200);

    return sanitized;
}

// Security helper: File Upload Constraints
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);

export function isAllowedFile(filename: string): boolean {
    if (!filename) return false;
    // Handle query params or URL fragments if present (though unusual in a key)
    const cleanName = filename.split('?')[0].split('#')[0];
    const parts = cleanName.split('.');
    if (parts.length < 2) return false;
    const ext = '.' + parts.pop()?.toLowerCase();
    return ALLOWED_EXTENSIONS.has(ext);
}

export function getContentType(filename: string): string {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.pdf')) return 'application/pdf';
    return 'application/octet-stream';
}
