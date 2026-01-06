import React from 'react';
import Markdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Book } from '@/types';

interface MarkdownBookSlideProps {
    content: string;
    styleProfile?: string;
    pageIndex: number; // 0-based index of the current page
    totalChars?: number;
    book: Book;
}

export function MarkdownBookSlide({ content, styleProfile, pageIndex, book }: MarkdownBookSlideProps) {
    // Basic splitting logic: If the markdown has "---" separators, use them as pages.
    // Otherwise, just show the whole thing (scrolling).
    // The parent component (BookReader) might handle pagination if we split the content there.
    // But BookReader expects "slides".
    // Let's assume content passed here IS the content for the current slide.

    // Styling profiles based on book type
    const isHymn = styleProfile === 'hymn-book';
    const isScripture = styleProfile === 'scripture';
    const isStory = styleProfile === 'storybook';

    return (
        <div className={cn(
            "w-full h-full flex flex-col items-center justify-center p-8 md:p-12 overflow-y-auto",
            "bg-orange-50/50 dark:bg-stone-900/50", // Paper-like background tint
            styleProfile
        )}>
            <div className={cn(
                "prose prose-lg dark:prose-invert max-w-none text-center",
                // Hymn Styling
                isHymn && "prose-p:font-serif prose-p:italic prose-headings:font-serif prose-headings:text-amber-900 dark:prose-headings:text-amber-100 prose-p:text-stone-700 dark:prose-p:text-stone-300 leading-loose",
                // Scripture Styling
                isScripture && "prose-p:font-serif prose-p:text-lg prose-blockquote:border-l-amber-500",
                // Storybook Styling
                isStory && "font-sans text-xl leading-relaxed"
            )}>
                <Markdown
                    components={{
                        // Custom image renderer for hybrid books
                        img: (props) => (
                            <div className="my-4 flex justify-center">
                                <img
                                    {...props}
                                    className="rounded-lg shadow-md max-h-[40vh] object-contain"
                                    alt={props.alt || 'Book illustration'}
                                />
                            </div>
                        ),
                        // Typography enhancements
                        h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-6 text-primary" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mb-4 text-primary/80" {...props} />,
                        p: ({node, ...props}) => <p className="mb-4" {...props} />,
                    }}
                >
                    {content}
                </Markdown>
            </div>

            <div className="mt-auto pt-4 text-xs text-muted-foreground font-mono">
                {pageIndex + 1}
            </div>
        </div>
    );
}
