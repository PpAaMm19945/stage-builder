import { JWTPayload } from '../types';

function arrayBufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlToArrayBuffer(str: string): Uint8Array {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
        str += '=';
    }
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function encodeJSON(data: any): string {
    const str = JSON.stringify(data);
    const encoder = new TextEncoder();
    return arrayBufferToBase64Url(encoder.encode(str));
}

function decodeJSON<T>(str: string): T {
    const bytes = base64UrlToArrayBuffer(str);
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(bytes));
}

// JWT utilities using Web Crypto
export async function signJWT(payload: Omit<JWTPayload, 'iat'>, secret: string): Promise<string> {
    const header = { alg: 'HS256', typ: 'JWT' };
    const iat = Math.floor(Date.now() / 1000);
    const fullPayload = { ...payload, iat };

    const encodedHeader = encodeJSON(header);
    const encodedPayload = encodeJSON(fullPayload);

    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    );

    const encodedSignature = arrayBufferToBase64Url(signature);

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
    try {
        const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
        if (!encodedHeader || !encodedPayload || !encodedSignature) return null;

        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        const signatureData = base64UrlToArrayBuffer(encodedSignature);

        const valid = await crypto.subtle.verify(
            'HMAC',
            key,
            signatureData,
            new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
        );

        if (!valid) return null;

        const payload = decodeJSON<JWTPayload>(encodedPayload);

        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }

        return payload;
    } catch (e) {
        console.error('JWT Verification Error:', e);
        return null;
    }
}
