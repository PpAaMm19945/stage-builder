import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { observations, activityCompletions, family } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle2, ImagePlus } from 'lucide-react';
import { FamilySession, MasteryLevel, getChildRole } from '@/types';
import { SuccessStoryPrompt } from '@/components/feedback/SuccessStoryPrompt';
import { PortfolioUploadModal } from '@/components/portfolio/PortfolioUploadModal';

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
    const [showStoryPrompt, setShowStoryPrompt] = useState(false);
    const [showPortfolioModal, setShowPortfolioModal] = useState(false);
    const [selectedStudentForPortfolio, setSelectedStudentForPortfolio] = useState<string | null>(null);
    const [passionSignals, setPassionSignals] = useState<Record<string, boolean>>({});

    // Initial effect to handle simple completion (Daily Practice) immediately or showing modal
    // Actually, react component shouldn't have side effects in render.
    // We'll handle this in the useEffect when session changes if needed, but better to let user click "Complete"
    // in Dashboard which opens this modal, and this modal decides what to show.

    const isDailyPractice = session?.activity.activity_type === 'daily_practice';

    const handleRatingChange = (childId: string, rating: MasteryLevel) => {
        setRatings(prev => ({
            ...prev,
            [childId]: rating
        }));
    };

    const handleSimpleCompletion = async () => {
        if (!session) return;
        setIsSubmitting(true);
        try {
            await activityCompletions.create({
                activityId: session.activity.id,
                notes: notes || undefined
            });
            toast({
                title: "That was lovely!",
                description: "Activity marked as complete.",
            });
            onSuccess();
            onClose();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save completion.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (!session) return;

        // Branch for daily practice
        if (isDailyPractice) {
            await handleSimpleCompletion();
            return;
        }

        setIsSubmitting(true);

        try {
            // Submit observations for each child
            const promises = session.childTiers.map(child => {
                // If child is observer, we might skip rating or auto-set to emerging/developing?
                // Or just use whatever is selected.
                // If role is observer, maybe we don't need a rating?
                // The prompt says: "In mastery modal, for Observer-role children: ... (Observer) — watching and learning"

                const role = getChildRole(child.childAge);
                let rating = ratings[child.childId];

                // If no rating selected:
                if (!rating) {
                    if (role === 'Observer') {
                        rating = 'emerging'; // Default for observer? Or maybe we don't record mastery for observer?
                        // For now, let's record emerging so it counts as done.
                    } else {
                        rating = 'developing';
                    }
                }

                return observations.create({
                    studentId: child.childId,
                    activityId: session.activity.id,
                    masteryLevel: rating,
                    parentNotes: notes ? `[Family Session] ${notes}` : undefined,
                    tier: child.tier, // Include tier for progress tracking,
                });
            });

            await Promise.all(promises);

            // Send passion signals for children who "loved it"
            const passionPromises = session.childTiers
                .filter(child => passionSignals[child.childId])
                .map(child =>
                    family.sendPassionSignal({
                        studentId: child.childId,
                        domain: session.activity.domain,
                        activityId: session.activity.id
                    }).catch(err => console.error('Passion signal failed:', err))
                );

            if (passionPromises.length > 0) {
                await Promise.all(passionPromises);
            }

            toast({
                title: "Great job!",
                description: "Activity marked as complete for the whole family.",
            });

            // Transition to success story
            setShowStoryPrompt(true);
            setRatings({});
            setNotes('');
            setPassionSignals({});
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save observations. Please try again.",
                variant: "destructive",
            });
            setIsSubmitting(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQuickComplete = async () => {
        if (!session) return;
        setIsSubmitting(true);

        try {
            // Submit observations for each child with default 'developing' rating
            const promises = session.childTiers.map(child => {
                return observations.create({
                    studentId: child.childId,
                    activityId: session.activity.id,
                    masteryLevel: 'developing', // Default rating
                    parentNotes: '[Family Session] Completed',
                    tier: child.tier,
                });
            });

            await Promise.all(promises);

            toast({
                title: "Activity completed!",
                description: "Marked as complete with default progress ratings.",
            });

            // Transition to success story
            setShowStoryPrompt(true);
            setRatings({});
            setNotes('');
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save observations. Please try again.",
                variant: "destructive",
            });
            setIsSubmitting(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!session) return null;

    // Special view for Daily Practice (Simple completion)
    if (isDailyPractice) {
        return (
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Lovely!</DialogTitle>
                        <DialogDescription>
                            Glad you enjoyed this moment. Add a note if you like?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <Label htmlFor="notes" className="sr-only">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any sweet moments to remember..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="resize-none"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSimpleCompletion} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    const onAllDone = () => {
        onSuccess();
        onClose();
        setShowStoryPrompt(false);
    };

    return (
        <>
            <SuccessStoryPrompt
                isOpen={showStoryPrompt}
                onOpenChange={(open) => {
                    if (!open) onAllDone();
                }}
                contentType="activity"
                contentId={session.activity.id}
                title={session.activity.title}
            />

            <Dialog open={isOpen && !showStoryPrompt} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>How did it go?</DialogTitle>
                        <DialogDescription>
                            Record progress for {session.activity.title}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {session.childTiers.map(child => {
                            const role = getChildRole(child.childAge);
                            const isObserver = role === 'Observer';

                            return (
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
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs flex items-center gap-1 cursor-pointer select-none text-muted-foreground hover:text-primary transition-colors">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-primary focus:ring-primary h-3 w-3"
                                                    checked={!!passionSignals[child.childId]}
                                                    onChange={(e) => setPassionSignals(prev => ({ ...prev, [child.childId]: e.target.checked }))}
                                                />
                                                Loved it!
                                            </label>
                                        </div>
                                    </div>

                                    {isObserver ? (
                                        <div className="text-sm text-muted-foreground italic bg-muted/20 p-2 rounded text-center">
                                            Watching and learning (Observer)
                                        </div>
                                    ) : (
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
                                    )}
                                </div>
                            );
                        })}

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                {session.childTiers.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-xs text-primary gap-1"
                                        onClick={() => {
                                            setSelectedStudentForPortfolio(session.childTiers[0].childId); // Default to first child or handle selection
                                            setShowPortfolioModal(true);
                                        }}
                                    >
                                        <ImagePlus className="h-3 w-3" />
                                        Add Photo to Portfolio
                                    </Button>
                                )}
                            </div>
                            <Textarea
                                id="notes"
                                placeholder="Any notable moments or struggles..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:justify-between flex-col sm:flex-row">
                        <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <div className="flex gap-2 flex-1 sm:flex-initial">
                            <Button
                                variant="outline"
                                onClick={handleQuickComplete}
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-initial"
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Quick Complete
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-initial"
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Progress
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {selectedStudentForPortfolio && (
                <PortfolioUploadModal
                    studentId={selectedStudentForPortfolio}
                    isOpen={showPortfolioModal}
                    onClose={() => {
                        setShowPortfolioModal(false);
                        setSelectedStudentForPortfolio(null);
                    }}
                    onUploadComplete={() => {
                        toast({ title: "Added to portfolio" });
                    }}
                    relatedActivityId={session.activity.id}
                    preselectedDomain={session.activity.domain}
                />
            )}
        </>
    );
}
