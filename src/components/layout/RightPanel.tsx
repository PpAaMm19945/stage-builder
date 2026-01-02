import { ReactNode } from 'react';
import { X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RightPanelProps {
    title?: string;
    children: ReactNode;
    isOpen?: boolean;
    onClose?: () => void;
    className?: string;
}

/**
 * RightPanel - Google AI Studio style contextual panel
 * 
 * On desktop: Fixed right sidebar (280px wide)
 * On mobile: Slides in from right as overlay
 */
export function RightPanel({
    title,
    children,
    isOpen = true,
    onClose,
    className
}: RightPanelProps) {
    return (
        <>
            {/* Mobile overlay backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Panel */}
            <aside
                className={cn(
                    // Base styles
                    "bg-background border-l border-border/50 flex flex-col",

                    // DESKTOP: Sticky in-flow
                    "lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:w-72 lg:shrink-0 lg:z-0",
                    "lg:translate-x-0 lg:border-l",

                    // MOBILE: Fixed overlay
                    "fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50",
                    "shadow-2xl lg:shadow-none", // Shadow only on mobile overlay

                    // TRANSITIONS (Mobile only effectively)
                    "transform transition-transform duration-300 ease-out",
                    isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",

                    className
                )}
            >
                {/* Header */}
                {(title || onClose) && (
                    <div className="flex items-center justify-between p-4 border-b border-border/50">
                        {title && (
                            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                {title}
                            </h2>
                        )}
                        {onClose && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 lg:hidden"
                                onClick={onClose}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {children}
                </div>
            </aside>
        </>
    );
}

/**
 * RightPanelSection - A section within the right panel
 */
interface RightPanelSectionProps {
    title?: string;
    children: ReactNode;
    className?: string;
}

export function RightPanelSection({ title, children, className }: RightPanelSectionProps) {
    return (
        <div className={cn("space-y-2", className)}>
            {title && (
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {title}
                </h3>
            )}
            {children}
        </div>
    );
}
