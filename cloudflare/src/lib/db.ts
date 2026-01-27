import { withD1Retry } from './d1-retry';

/**
 * Executes a D1 query with retry logic for transient errors.
 * Returns the full D1Result object (results, success, meta).
 */
export async function safeQuery<T = any>(
    db: D1Database,
    sql: string,
    params: any[] = []
): Promise<D1Result<T>> {
    return withD1Retry(async () => {
        return await db.prepare(sql).bind(...params).all<T>();
    });
}

/**
 * Executes a D1 query with retry logic and returns the FIRST result or null.
 * Useful for SELECT * FROM ... WHERE id = ?
 */
export async function safeQueryFirst<T = any>(
    db: D1Database,
    sql: string,
    params: any[] = []
): Promise<T | null> {
    return withD1Retry(async () => {
        return await db.prepare(sql).bind(...params).first<T>();
    });
}

/**
 * Executes a D1 write operation (INSERT/UPDATE/DELETE) with retry logic.
 * Returns the D1Result (useful for checks like rows affected or last ID).
 * Note: D1 .run() returns D1Result, similar to .all(), but without 'results' array usually.
 */
export async function safeRun(
    db: D1Database,
    sql: string,
    params: any[] = []
): Promise<D1Result> {
    return withD1Retry(async () => {
        return await db.prepare(sql).bind(...params).run();
    });
}
