
import { D1Database } from '@cloudflare/workers-types';
import { WeeklyPlanRecord, SearchMetadata, ParsedDailyRhythm, RhythmDayItem } from './types';

export interface SearchResult {
    type: 'book' | 'activity' | 'schedule_item';
    id: string;
    title: string;
    description: string;
    relevance: number;
    metadata?: SearchMetadata;
}

export async function getTodaySchedule(db: D1Database, familyId: string): Promise<SearchResult[]> {
    console.log(`Getting schedule for family: ${familyId}`);

    // 1. Get current date and week start (closest previous Monday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
    const weekStart = new Date(today.setDate(diff)).toISOString().split('T')[0];

    // Day name for lookup (Mon, Tue, Wed...)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayName = days[new Date().getDay()];

    console.log(`Week start: ${weekStart}, Day: ${currentDayName}`);

    // 2. Fetch active plan
    const plan = await db.prepare(
        'SELECT * FROM weekly_plans WHERE family_id = ? AND week_start = ?'
    ).bind(familyId, weekStart).first<WeeklyPlanRecord>();

    if (!plan || !plan.days) return [];

    // 3. Parse and find today's items
    let parsedDays: ParsedDailyRhythm[] = [];
    try {
        parsedDays = typeof plan.days === 'string' ? JSON.parse(plan.days) : plan.days;
    } catch {
        console.error('Error parsing plan days');
        return [];
    }

    const todayRhythm = parsedDays.find((d) => d.day === currentDayName);
    if (!todayRhythm) return [];

    const items: SearchResult[] = [];

    // Helper to map items
    const mapItem = (item: RhythmDayItem, period: 'morning' | 'evening'): SearchResult => ({
        type: 'schedule_item' as const,
        id: item.id || crypto.randomUUID(),
        title: item.title,
        description: item.rationale || `Scheduled for ${period}`,
        relevance: 1,
        metadata: {
            period,
            duration: item.duration_minutes || item.duration,
            contentType: item.type,
            status: item.status || 'upcoming'
        }
    });

    if (todayRhythm.morning) {
        items.push(...todayRhythm.morning.map((i) => mapItem(i, 'morning')));
    }
    if (todayRhythm.evening) {
        items.push(...todayRhythm.evening.map((i) => mapItem(i, 'evening')));
    }

    return items;
}

export async function searchBooks(db: D1Database, query: string, ageMonths?: number): Promise<SearchResult[]> {
    console.log(`Searching books for: "${query}" (Age: ${ageMonths})`);

    // 1. Tokenize query (split by space)
    const keywords = query.split(/\s+/).map(k => k.replace(/[^a-zA-Z0-9]/g, '')).filter(k => k.length > 2);

    if (keywords.length === 0) return []; // No valid keywords

    // 2. Build dynamic SQL for multiple keywords (OR logic)
    // Query formations table with formation_type = 'reading' (unified schema)
    const conditions = keywords.map(() => `(title LIKE ? OR description LIKE ? OR primary_virtue LIKE ?)`).join(' OR ');

    let sql = `
        SELECT id, title, description, min_age_months, max_age_months, primary_virtue as domain, cover_image_url
        FROM formations 
        WHERE is_active = 1 
        AND formation_type = 'reading'
        AND (${conditions})
    `;

    // 3. Prepare params: key1, key1, key1, key2, key2, key2...
    const params: (string | number)[] = [];
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

    return results.map((b) => ({
        type: 'book' as const,
        id: String(b.id),
        title: String(b.title),
        description: String(b.description || ''),
        relevance: 1,
        metadata: {
            ageRange: `${b.min_age_months}-${b.max_age_months}m`,
            domain: String(b.domain || ''),
            coverUrl: b.cover_image_url ? String(b.cover_image_url) : undefined
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
        AND formation_type IN ('skill', 'habit', 'service')
        AND (${conditions})
        LIMIT 7
    `;

    const params: (string | number)[] = [];
    keywords.forEach(k => {
        const like = `%${k}%`;
        params.push(like, like, like);
    });

    const { results } = await db.prepare(sql).bind(...params).all();

    return results.map((a) => ({
        type: 'activity' as const,
        id: String(a.id),
        title: String(a.title),
        description: String(a.description || ''),
        relevance: 1,
        metadata: {
            domain: String(a.domain || ''),
            materials: a.materials ? String(a.materials) : undefined
        }
    }));
}
