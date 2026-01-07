import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

interface HymnContentProps {
  title: string;
  fallbackContent: string;
}

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

export function HymnContent({ title, fallbackContent }: HymnContentProps) {
  const { data: richContent, isLoading, isError } = useQuery({
    queryKey: ['hymn-content', title],
    queryFn: () => fetchHymnContent(title),
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1
  });

  if (isLoading) {
    return <div className="space-y-4 p-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>;
  }

  // Use rich content if found, otherwise fallback
  const contentToRender = richContent || fallbackContent;

  // If we're using fallback content (plain text), wrap it simply
  if (!richContent) {
    return (
        <div className="text-sm whitespace-pre-wrap bg-amber-50/50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-100 dark:border-amber-800/30 font-serif leading-relaxed text-amber-900 dark:text-amber-100">
            {contentToRender}
        </div>
    );
  }

  // If rich content, render HTML with our custom styles
  return (
    <div
      className="hymn-container bg-amber-50/50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-100 dark:border-amber-800/30"
    >
      <style>{`
        .hymn {
          font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
          color: var(--tw-prose-body);
        }
        .hymn-verse {
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        .hymn-chorus {
          margin-bottom: 1.5rem;
          padding-left: 1rem;
          border-left: 3px solid #fcd34d; /* amber-300 */
          font-style: italic;
          color: #78350f; /* amber-900 */
        }
        .dark .hymn-chorus {
          border-color: #d97706; /* amber-600 */
          color: #fef3c7; /* amber-100 */
        }
        .hymn-author {
          text-align: right;
          font-size: 0.875rem;
          color: #78716c; /* stone-500 */
          font-style: italic;
          margin-top: 2rem;
        }
        .dark .hymn-author {
          color: #a8a29e; /* stone-400 */
        }
      `}</style>
      <div
        className="hymn prose dark:prose-invert max-w-none text-amber-900 dark:text-amber-100"
        dangerouslySetInnerHTML={{ __html: richContent }}
      />
    </div>
  );
}
