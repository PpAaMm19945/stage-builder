import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface TextMessageProps {
    content: string;
    role: 'user' | 'assistant';
    className?: string;
}

/**
 * Renders a chat message with Markdown support for assistant messages.
 * User messages are rendered as plain text.
 */
export function TextMessage({ content, role, className }: TextMessageProps) {
    if (role === 'user') {
        return (
            <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                "bg-primary text-primary-foreground rounded-tr-sm",
                className
            )}>
                {content}
            </div>
        );
    }

    return (
        <div className={cn(
            "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
            "bg-muted text-foreground rounded-tl-sm",
            "prose prose-sm dark:prose-invert max-w-none",
            "[&>p]:mb-2 [&>p:last-child]:mb-0",
            "[&>ul]:my-2 [&>ol]:my-2",
            "[&>code]:bg-muted-foreground/10 [&>code]:px-1 [&>code]:rounded",
            className
        )}>
            <ReactMarkdown>
                {content}
            </ReactMarkdown>
        </div>
    );
}
