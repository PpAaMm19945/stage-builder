import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { observations } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { FamilySession, MasteryLevel } from '@/types';

interface FamilyCompletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: FamilySession | null;
    onSuccess: () => void;
}

const MASTERY_OPTIONS: { value: MasteryLevel; label: string; color: string }[] = [
    { value: 'emerging', label: 'Emerging', color: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200' },
    { value: 'developing', label: 'Developing', color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200' },
    { value: 'secure', label: 'Secure', color: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' },
];

export function FamilyCompletionModal({ isOpen, onClose, session, onSuccess }: FamilyCompletionModalProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notes, setNotes] = useState('');

    // State for child ratings: { [childId]: MasteryLevel }
    // Initialize with 'developing' as default or null
    const [ratings, setRatings] = useState<Record<string, MasteryLevel>>({});

    const handleRatingChange = (childId: string, rating: MasteryLevel) => {
        setRatings(prev => ({
            ...prev,
            [childId]: rating
        }));
    };

    const handleSubmit = async () => {
        if (!session) return;
        setIsSubmitting(true);

        try {
            // Submit observations for each child
            const promises = session.childTiers.map(child => {
                const rating = ratings[child.childId] || 'developing'; // Default if skipped? Or require it? Let's default to developing.

                return observations.create({
                    studentId: child.childId,
                    activityId: session.activity.id,
                    masteryLevel: rating,
                    parentNotes: notes ? `[Family Session] ${notes}` : undefined,
                });
            });

            await Promise.all(promises);

            toast({
                title: "Great job!",
                description: "Activity marked as complete for the whole family.",
            });

            onSuccess();
            onClose();
            // Reset state
            setRatings({});
            setNotes('');
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save observations. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!session) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>How did it go?</DialogTitle>
                    <DialogDescription>
                        Record progress for {session.activity.title}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {session.childTiers.map(child => (
                        <div key={child.childId} className="space-y-3 pb-4 border-b last:border-0 last:pb-0">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="font-semibold flex items-center gap-2">
                                        {child.childName}
                                        <Badge variant="outline" className="text-[10px] font-normal">
                                            {child.tier}
                                        </Badge>
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Goal: {child.expectation}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full">
                                {MASTERY_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleRatingChange(child.childId, option.value)}
                                        className={`flex-1 py-2 px-1 rounded-md border text-xs font-medium transition-all ${ratings[child.childId] === option.value
                                                ? `ring-2 ring-primary ring-offset-1 ${option.color}`
                                                : 'bg-muted/30 border-transparent hover:bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any notable moments or struggles..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="resize-none"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:justify-between">
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Progress
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
