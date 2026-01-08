import { useQuery } from '@tanstack/react-query';

interface HymnMetadata {
    chapters: {
        filepath: string;
        chapterNumber: number;
        title: string;
    }[];
}

async function fetchHymnContent(title: string): Promise<string | null> {
    try {
        // 1. Fetch metadata to get file list
        const metaResponse = await fetch('/books/reformed-hymns/metadata.json');
        if (!metaResponse.ok) throw new Error('Failed to load metadata');
        const metadata: HymnMetadata = await metaResponse.json();

        // 2. Normalize title for search (remove punctuation, lower case)
        const normalizedTargetTitle = title.toLowerCase().replace(/[^\w\s]/g, '');

        // 3. Search through chapters
        for (const chapter of metadata.chapters) {
            const fileResponse = await fetch(`/books/reformed-hymns/${chapter.filepath}`);
            if (!fileResponse.ok) continue;

            const text = await fileResponse.text();

            // Regex to find the hymn header: ## N. Title
            // We look for "## [digits]. [Title]"
            // We need to be careful with regex escaping the title

            // Simple parse: Split by "## "
            const sections = text.split(/^##\s+/m);

            for (const section of sections) {
                if (!section.trim()) continue;

                // Extract title line
                const firstLineEnd = section.indexOf('\n');
                const headerLine = section.substring(0, firstLineEnd).trim();

                // Header line format: "3. Amazing Grace"
                // We want to match "Amazing Grace"
                const dotIndex = headerLine.indexOf('.');
                if (dotIndex === -1) continue;

                const sectionTitle = headerLine.substring(dotIndex + 1).trim();
                const normalizedSectionTitle = sectionTitle.toLowerCase().replace(/[^\w\s]/g, '');

                if (normalizedSectionTitle === normalizedTargetTitle) {
                    // Found it! Return the content (everything after the header line)
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
