import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lightning, ClipboardText, ChatCircle } from '@phosphor-icons/react';

export type OnboardingMode = 'quick' | 'guided' | 'chat';

interface OnboardingModeSelectorProps {
    onSelect: (mode: OnboardingMode) => void;
}

export function OnboardingModeSelector({ onSelect }: OnboardingModeSelectorProps) {
    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <DialogTitle className="text-2xl font-display">
                    Welcome to FamilyPath!
                </DialogTitle>
                <DialogDescription className="text-base">
                    How would you like to get started?
                </DialogDescription>
            </div>

            <div className="grid gap-4">
                <button
                    onClick={() => onSelect('quick')}
                    className="flex items-start gap-4 p-4 rounded-xl border-2 border-transparent hover:border-primary/20 bg-muted/30 hover:bg-muted/50 transition-all text-left group"
                >
                    <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                        <Lightning weight="duotone" className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <div className="font-semibold flex items-center gap-2">
                            Quick Start
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                                1 min
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Just add your children. We'll figure out the rest together.
                        </p>
                    </div>
                </button>

                <button
                    onClick={() => onSelect('guided')}
                    className="flex items-start gap-4 p-4 rounded-xl border-2 border-transparent hover:border-primary/20 bg-muted/30 hover:bg-muted/50 transition-all text-left group"
                >
                    <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                        <ClipboardText weight="duotone" className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <div className="font-semibold flex items-center gap-2">
                            Guided Setup
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                                5 min
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Answer a few questions so we can personalize from day one.
                        </p>
                    </div>
                </button>

                <button
                    onClick={() => onSelect('chat')}
                    className="flex items-start gap-4 p-4 rounded-xl border-2 border-transparent hover:border-primary/20 bg-muted/30 hover:bg-muted/50 transition-all text-left group"
                >
                    <div className="p-3 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                        <ChatCircle weight="duotone" className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <div className="font-semibold flex items-center gap-2">
                            Chat with Us
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                                Conversational
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Tell us about your family in conversation. Natural and easy.
                        </p>
                    </div>
                </button>
            </div>

            <div className="flex justify-center">
                <Button variant="link" className="text-muted-foreground text-xs" onClick={() => onSelect('quick')}>
                    Skip for now
                </Button>
            </div>
        </div>
    );
}
