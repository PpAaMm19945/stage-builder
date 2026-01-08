import { useQuery } from '@tanstack/react-query';
import { fetchAllHymns } from '@/lib/book-content';

// Reusing the logic from book-content.ts but optimizing for single search if possible,
// or just fetching all and finding.
// Since we want to reuse code, we can use fetchAllHymns and find the one we need.
// Ideally, we'd have a specific "findHymn" function in book-content.ts if performance matters (to stop early).
// But for client-side caching, fetching all once might be okay if the book isn't huge.
// However, the original implementation fetched chapter by chapter.
// Let's refactor fetchHymnContent to use the generic helpers but keep the "stop early" logic if we want.
// But to strictly follow "Refactor useHymnContent Logic" plan step:

async function fetchHymnContent(title: string): Promise<string | null> {
    try {
        // We'll use the 'reformed-hymns' series as hardcoded in the original hook
        // but now utilizing the new helper structure conceptually.
        // Actually, let's just use fetchAllHymns and find it for simplicity and code reuse,
        // unless performance is critical. The hymnal is not massive.
        // But wait, the original implementation streamed chapters.
        // Let's stick to the original "search" approach but make it use the helpers if possible?
        // Or just implement the search using the same helpers.

        // Let's import the specific helpers we need.
        const { fetchBookMetadata, fetchChapterContent } = await import('@/lib/book-content');

        const metadata = await fetchBookMetadata('reformed-hymns', 'ignored');
        if (!metadata) return null;

        const normalizedTargetTitle = title.toLowerCase().replace(/[^\w\s]/g, '');

        for (const chapter of metadata.chapters) {
            const text = await fetchChapterContent('reformed-hymns', chapter.filepath);
            if (!text) continue;

            const sections = text.split(/^##\s+/m);
            for (const section of sections) {
                if (!section.trim()) continue;
                const firstLineEnd = section.indexOf('\n');
                const headerLine = section.substring(0, firstLineEnd).trim();
                const dotIndex = headerLine.indexOf('.');
                if (dotIndex === -1) continue;

                const sectionTitle = headerLine.substring(dotIndex + 1).trim();
                const normalizedSectionTitle = sectionTitle.toLowerCase().replace(/[^\w\s]/g, '');

                if (normalizedSectionTitle === normalizedTargetTitle) {
                    return section.substring(firstLineEnd).trim();
                }
            }
        }
        return null;
    } catch (err) {
        console.error('Error fetching hymn content:', err);
        return null;
    }
}

export function useHymnContent(title: string) {
    return useQuery({
        queryKey: ['hymn-content', title],
        queryFn: () => fetchHymnContent(title),
        staleTime: 1000 * 60 * 60, // 1 hour
        retry: 1,
        enabled: !!title
    });
}
