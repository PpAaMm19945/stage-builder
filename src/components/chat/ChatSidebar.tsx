import { useState } from 'react';
import { ChatPlus, X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useIsMobile } from './hooks/useKeyboardHeight';
import { ChatPanel } from './ChatPanel';

interface ChatSidebarProps {
    className?: string;
}

/**
 * Responsive chat sidebar wrapper.
 * - Desktop (>1024px): Fixed right sidebar
 * - Tablet/Mobile: Bottom sheet overlay with floating toggle button
 */
export function ChatSidebar({ className }: ChatSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useIsMobile(1024); // Use tablet/mobile below 1024px

    // Desktop: Fixed sidebar
    if (!isMobile) {
        return (
            <aside className={cn(
                "w-[400px] h-full border-l bg-background shrink-0",
                className
            )}>
                <ChatPanel className="h-full" />
            </aside>
        );
    }

    // Mobile/Tablet: Sheet overlay with floating button
    return (
        <>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button
                        size="lg"
                        className={cn(
                            "fixed bottom-6 right-6 z-50 rounded-full shadow-xl",
                            "w-14 h-14 p-0",
                            "bg-primary hover:bg-primary/90",
                            isOpen && "hidden"
                        )}
                        aria-label="Open chat"
                    >
                        <ChatPlus className="w-6 h-6" weight="fill" />
                    </Button>
                </SheetTrigger>
                <SheetContent
                    side="bottom"
                    className="h-[85vh] p-0 rounded-t-2xl"
                    hideCloseButton
                >
                    {/* Handle bar for bottom sheet */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
                    </div>

                    {/* Close button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </Button>

                    <ChatPanel className="h-full" />
                </SheetContent>
            </Sheet>
        </>
    );
}
