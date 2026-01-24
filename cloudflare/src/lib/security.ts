
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
