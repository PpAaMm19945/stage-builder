import { Skeleton } from '@/components/ui/skeleton';
import { useHymnContent } from '@/hooks/useHymnContent';

interface HymnContentProps {
  title: string;
  fallbackContent: string;
}

export function HymnContent({ title, fallbackContent }: HymnContentProps) {
  const { data: richContent, isLoading } = useHymnContent(title);

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
