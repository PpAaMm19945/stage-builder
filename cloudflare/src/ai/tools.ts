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

    // MVP: Simple SQL LIKE search
    // In future: Use Vectorize for semantic search
    const sanitizedQuery = `%${query.replace(/[^a-zA-Z0-9 ]/g, '')}%`;

    let sql = `
        SELECT id, title, description, min_age_months, max_age_months, domain 
        FROM books 
        WHERE is_active = 1 
        AND (title LIKE ? OR description LIKE ? OR domain LIKE ?)
    `;
    const params: any[] = [sanitizedQuery, sanitizedQuery, sanitizedQuery];

    if (ageMonths) {
        sql += ` AND ? >= min_age_months AND ? <= max_age_months`;
        params.push(ageMonths, ageMonths);
    }

    sql += ` LIMIT 5`;

    const { results } = await db.prepare(sql).bind(...params).all();

    return results.map((b: any) => ({
        type: 'book',
        id: b.id,
        title: b.title,
        description: b.description,
        relevance: 1, // Placeholder for SQL
        metadata: {
            ageRange: `${b.min_age_months}-${b.max_age_months}m`,
            domain: b.domain
        }
    }));
}

export async function searchActivities(db: D1Database, query: string): Promise<SearchResult[]> {
    console.log(`Searching activities for: "${query}"`);

    const sanitizedQuery = `%${query.replace(/[^a-zA-Z0-9 ]/g, '')}%`;

    const sql = `
        SELECT id, title, description, domain, materials 
        FROM activities 
        WHERE is_active = 1 
        AND (title LIKE ? OR description LIKE ? OR domain LIKE ?)
        LIMIT 5
    `;

    const { results } = await db.prepare(sql).bind(sanitizedQuery, sanitizedQuery, sanitizedQuery).all();

    return results.map((a: any) => ({
        type: 'activity',
        id: a.id,
        title: a.title,
        description: a.description,
        relevance: 1,
        metadata: {
            domain: a.domain,
            materials: a.materials // Provide materials context
        }
    }));
}
