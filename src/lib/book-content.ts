import { Book } from '@/types';

export interface HymnData {
    number?: string;
    title: string;
    content: string; // HTML or Markdown
    author?: string;
}

export interface CatechismData {
    question: string;
    answer: string;
    week?: number;
    reference?: string;
}

interface ChapterMetadata {
    filepath: string;
    chapterNumber: number;
    title: string;
}

interface BookMetadata {
    chapters: ChapterMetadata[];
}

export async function fetchBookMetadata(series: string, bookId: string): Promise<BookMetadata | null> {
    try {
        // Construct path. Assuming standard path /books/{series}/{bookId}/metadata.json
        // But specifically for 'reformed-hymns', it seems to be at /books/reformed-hymns/metadata.json
        // which matches /books/{series}/metadata.json if bookId is implicit or if series IS the folder.
        // Let's assume /books/{series}/metadata.json based on useHymnContent hardcoding.
        // If series is 'reformed-hymns', path is /books/reformed-hymns/metadata.json.

        const url = `/books/${series}/metadata.json`;
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch metadata", e);
        return null;
    }
}

export async function fetchChapterContent(series: string, filepath: string): Promise<string | null> {
    try {
        const url = `/books/${series}/${filepath}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.text();
    } catch (e) {
        console.error("Failed to fetch chapter", e);
        return null;
    }
}

export async function fetchAllHymns(series: string): Promise<HymnData[]> {
    const metadata = await fetchBookMetadata(series, 'ignored');
    if (!metadata) return [];

    const hymns: HymnData[] = [];

    // Parallel fetch could be faster but might overwhelm. Sequential for safety first.
    // Or batching.
    for (const chapter of metadata.chapters) {
        const text = await fetchChapterContent(series, chapter.filepath);
        if (!text) continue;

        // Parse hymns from chapter (assuming same format as useHymnContent: Markdown with ## headers)
        const sections = text.split(/^##\s+/m);
        for (const section of sections) {
            if (!section.trim()) continue;
            const firstLineEnd = section.indexOf('\n');
            const headerLine = section.substring(0, firstLineEnd).trim();

            // "3. Amazing Grace"
            const match = headerLine.match(/^(\d+)\.\s+(.+)$/);
            if (match) {
                const number = match[1];
                const title = match[2];
                // Content is the rest
                const content = section.substring(firstLineEnd).trim();

                // Content might be markdown or HTML.
                // useHymnContent suggests it renders HTML via dangerouslySetInnerHTML eventually,
                // but the source seems to be markdown that gets converted?
                // Or maybe the source IS html inside markdown files?
                // The prompt says "You will need a parser to convert the HTML from HymnContent into Text".
                // But here we are fetching raw source.
                // Let's assume raw source is Markdown-ish or HTML-ish.

                hymns.push({ number, title, content });
            }
        }
    }
    return hymns;
}

export async function fetchCatechism(series: string): Promise<CatechismData[]> {
    // Assuming similar structure: metadata.json pointing to chapters
    const metadata = await fetchBookMetadata(series, 'ignored');
    if (!metadata) return [];

    const qaList: CatechismData[] = [];

    for (const chapter of metadata.chapters) {
        const text = await fetchChapterContent(series, chapter.filepath);
        if (!text) continue;

        // Parse Q&A. Format unknown but likely:
        // ## Week 1
        // **Q. 1. What is the chief end of man?**
        // *A. Man's chief end is to glorify God, and to enjoy him forever.*

        // Let's look for patterns.
        // Simple regex for Q. and A.

        const lines = text.split('\n');
        let currentQ = '';
        let currentA = '';
        let currentWeek = undefined;

        for (const line of lines) {
            const trimLine = line.trim();
            if (trimLine.startsWith('## Week')) {
                 const match = trimLine.match(/Week\s+(\d+)/);
                 if (match) currentWeek = parseInt(match[1]);
                 continue;
            }

            // Check for Question
            // Typically **Q. ...** or Q. ...
            if (trimLine.match(/^\**Q\./)) {
                if (currentQ && currentA) {
                    qaList.push({ question: currentQ, answer: currentA, week: currentWeek });
                    currentA = '';
                }
                currentQ = trimLine.replace(/^\**Q\.\s*\d*\.*\s*/, '').replace(/\**$/, '');
            } else if (trimLine.match(/^\**A\./)) {
                currentA = trimLine.replace(/^\**A\.\s*/, '').replace(/\**$/, '');
            } else if (currentA && trimLine) {
                 // Append to answer if multi-line
                 currentA += ' ' + trimLine;
            }
        }
        if (currentQ && currentA) {
            qaList.push({ question: currentQ, answer: currentA, week: currentWeek });
        }
    }
    return qaList;
}
