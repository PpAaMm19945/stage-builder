import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { DailyRhythmItem as RhythmItem } from '@/types';
import { format } from 'date-fns';
import { CheckCircle, XCircle, ArrowRight, Hourglass } from '@phosphor-icons/react';

interface EndOfDaySummaryProps {
    date: Date;
    items: RhythmItem[];
    open: boolean;
    onClose: () => void;
}

export function EndOfDaySummary({ date, items, open, onClose }: EndOfDaySummaryProps) {
    const completed = items.filter(i => i.status === 'completed');
    const missed = items.filter(i => i.status === 'upcoming' || i.status === 'skipped');
    // Assuming 'in_progress' might be a status in V2 or inferred
    const inProgress = items.filter(i => i.status === 'current');

    return (
        <Dialog open={open} onOpenChange={(o) => {
            if (!o) onClose();
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{format(date, 'EEEE').toUpperCase()} SUMMARY</DialogTitle>
                    <DialogDescription>Here's a look at what was accomplished.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                    {/* Completed */}
                    {completed.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-green-600 flex items-center gap-2">
                                <CheckCircle weight="fill" className="w-5 h-5" />
                                Completed ({completed.length})
                            </h4>
                            <ul className="text-sm space-y-2 pl-7">
                                {completed.map(i => (
                                    <li key={i.id} className="text-foreground/90">{i.title}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* In Progress */}
                    {inProgress.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-blue-600 flex items-center gap-2">
                                <Hourglass weight="fill" className="w-5 h-5" />
                                In Progress ({inProgress.length})
                            </h4>
                            <ul className="text-sm space-y-2 pl-7">
                                {inProgress.map(i => (
                                    <li key={i.id} className="text-foreground/90">
                                        {i.title}
                                        {i.type === 'book' && <span className="text-muted-foreground text-xs ml-2">(Continuing tomorrow)</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Missed / Transferred */}
                    {missed.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-amber-600 flex items-center gap-2">
                                <ArrowRight weight="bold" className="w-5 h-5" />
                                For Tomorrow ({missed.length})
                            </h4>
                            <ul className="text-sm space-y-2 pl-7 text-muted-foreground">
                                {missed.map(i => (
                                    <li key={i.id}>{i.title}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {items.length === 0 && (
                        <p className="text-center text-muted-foreground">No activities planned for this day.</p>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={onClose} className="w-full">Got it</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
