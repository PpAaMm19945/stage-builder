
export function generateId(prefix: string): string {
    // Use crypto.randomUUID for secure randomness
    // UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // We take the last segment (12 hex chars) to replace the 9 base36 chars
    // This increases entropy from ~46 bits to 48 bits and is cryptographically secure.
    const randomPart = crypto.randomUUID().substring(24);
    return `${prefix}-${Date.now()}-${randomPart}`;
}

// Security helper: Generate cryptographically secure invite code
export function generateInviteCode(): string {
    // Format: XXXX-XXXX (Base36ish)
    // We want uppercase alphanumeric.
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const values = new Uint8Array(8);
    crypto.getRandomValues(values);

    for (let i = 0; i < 8; i++) {
        // Rejection sampling to avoid bias
        // 36 (charset length) * 7 = 252.
        // Bytes are 0-255.
        // If we get 252, 253, 254, 255, we retry.
        let val = values[i];
        while (val >= 252) {
            const replacement = new Uint8Array(1);
            crypto.getRandomValues(replacement);
            val = replacement[0];
        }

        result += charset[val % 36];
        if (i === 3) result += '-';
    }
    return result;
}
