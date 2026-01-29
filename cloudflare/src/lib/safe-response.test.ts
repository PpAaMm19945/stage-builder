import { describe, it, expect, vi } from 'vitest';
import { safeError } from './safe-response';

describe('safeError', () => {
    const mockContext = (env: string) => ({
        env: { ENVIRONMENT: env },
        json: vi.fn((data, status) => ({ data, status })),
    });

    it('should return internal server error in production for 500s', () => {
        const c = mockContext('production') as any;
        const err = new Error('Sensitive Database Info');

        const res = safeError(c, err, 500);

        expect(res.status).toBe(500);
        expect(res.data).toEqual({ error: 'Internal Server Error' });
    });

    it('should return actual error in development for 500s', () => {
        const c = mockContext('development') as any;
        const err = new Error('Sensitive Database Info');

        const res = safeError(c, err, 500);

        expect(res.status).toBe(500);
        expect(res.data).toEqual({ error: 'Sensitive Database Info' });
    });

    it('should convert Unauthorized to 401 even if 500 passed', () => {
        const c = mockContext('production') as any;
        const err = new Error('Unauthorized');

        const res = safeError(c, err, 500);

        expect(res.status).toBe(401);
        expect(res.data).toEqual({ error: 'Unauthorized' });
    });

    it('should convert Not Found to 404 even if 500 passed', () => {
        const c = mockContext('production') as any;
        const err = new Error('Not Found');

        const res = safeError(c, err, 500);

        expect(res.status).toBe(404);
        expect(res.data).toEqual({ error: 'Not Found' });
    });

    it('should respect explicit status code if not 500', () => {
        const c = mockContext('production') as any;
        const err = new Error('Bad Request');

        const res = safeError(c, err, 400);

        expect(res.status).toBe(400);
        expect(res.data).toEqual({ error: 'Bad Request' });
    });
});
