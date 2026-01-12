import { D1Database } from '@cloudflare/workers-types';

export interface SearchResult {
    type: 'book' | 'activity';
    id: string;
    title: string;
    description: string;
    relevance: number;
    metadata?: any;
}

export async function searchBooks(db: D1Database, query: string, ageMonths?: number): Promise<SearchResult[]> {
    console.log(`Searching books for: "${query}" (Age: ${ageMonths})`);

    // 1. Tokenize query (split by space)
    const keywords = query.split(/\s+/).map(k => k.replace(/[^a-zA-Z0-9]/g, '')).filter(k => k.length > 2);

    if (keywords.length === 0) return []; // No valid keywords

    // 2. Build dynamic SQL for multiple keywords (OR logic)
    // We want to find books that match ANY of the keywords
    const conditions = keywords.map(() => `(title LIKE ? OR description LIKE ? OR domain LIKE ?)`).join(' OR ');

    let sql = `
        SELECT id, title, description, min_age_months, max_age_months, domain 
        FROM books 
        WHERE is_active = 1 
        AND (${conditions})
    `;

    // 3. Prepare params: key1, key1, key1, key2, key2, key2...
    const params: any[] = [];
    keywords.forEach(k => {
        const like = `%${k}%`;
        params.push(like, like, like);
    });

    if (ageMonths) {
        sql += ` AND ? >= min_age_months AND ? <= max_age_months`;
        params.push(ageMonths, ageMonths);
    }

    sql += ` LIMIT 7`; // Increased limit slightly since we're fuzzy matching

    const { results } = await db.prepare(sql).bind(...params).all();

    return results.map((b: any) => ({
        type: 'book',
        id: b.id,
        title: b.title,
        description: b.description,
        relevance: 1,
        metadata: {
            ageRange: `${b.min_age_months}-${b.max_age_months}m`,
            domain: b.domain
        }
    }));
}

export async function searchActivities(db: D1Database, query: string): Promise<SearchResult[]> {
    console.log(`Searching activities for: "${query}"`);

    const keywords = query.split(/\s+/).map(k => k.replace(/[^a-zA-Z0-9]/g, '')).filter(k => k.length > 2);
    if (keywords.length === 0) return [];

    const conditions = keywords.map(() => `(title LIKE ? OR description LIKE ? OR primary_virtue LIKE ?)`).join(' OR ');

    const sql = `
        SELECT id, title, description, primary_virtue as domain, materials
        FROM formations
        WHERE is_active = 1 
        AND (${conditions})
        LIMIT 7
    `;

    const params: any[] = [];
    keywords.forEach(k => {
        const like = `%${k}%`;
        params.push(like, like, like);
    });

    const { results } = await db.prepare(sql).bind(...params).all();

    return results.map((a: any) => ({
        type: 'activity',
        id: a.id,
        title: a.title,
        description: a.description,
        relevance: 1,
        metadata: {
            domain: a.domain,
            materials: a.materials
        }
    }));
}


