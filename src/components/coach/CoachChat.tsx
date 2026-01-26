import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Sparkle } from '@phosphor-icons/react';
import { FrontdeskChat } from './FrontdeskChat';

export function SchoolOSChat() {
    return (
        <Sheet>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full shadow-sm bg-indigo-50 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950 dark:border-indigo-800"
                                data-testid="coach-chat-trigger"
                                aria-label="Open SchoolOS Assistant"
                            >
                                <Sparkle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" weight="fill" />
                            </Button>
                        </SheetTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>Open Assistant</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <SheetContent className="w-[100vw] sm:w-[540px] flex flex-col p-0 h-[100dvh]">
                <div className="flex-1 h-full">
                    <FrontdeskChat />
                </div>
            </SheetContent>
        </Sheet>
    );
}
