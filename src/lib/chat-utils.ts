/**
 * Chat utility functions for input sanitization and message handling.
 */

/**
 * Sanitizes user input before sending to AI.
 * - Trims whitespace
 * - Limits length to prevent abuse
 * - Strips potentially dangerous HTML
 */
export function sanitizeMessage(input: string, maxLength: number = 2000): string {
    return input
        .trim()
        .slice(0, maxLength)
        .replace(/<[^>]*>/g, '') // Strip HTML tags
        .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Validates that a message is suitable for sending to the AI.
 * Returns null if valid, or an error message if invalid.
 */
export function validateMessage(input: string): string | null {
    const trimmed = input.trim();

    if (!trimmed) {
        return 'Please enter a message';
    }

    if (trimmed.length < 2) {
        return 'Message too short';
    }

    if (trimmed.length > 2000) {
        return 'Message too long (max 2000 characters)';
    }

    return null;
}

/**
 * Formats a date for display in chat messages.
 */
export function formatChatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString();
}

/**
 * Truncates a string to a maximum length with ellipsis.
 */
export function truncateText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}
