import { useState } from 'react';
import { Star, Check } from '@phosphor-icons/react';
import { feedback } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface SuccessStoryPromptProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    contentType: 'activity' | 'book';
    contentId: string;
    title: string;
}

export function SuccessStoryPrompt({
    isOpen,
    onOpenChange,
    contentType,
    contentId,
    title
}: SuccessStoryPromptProps) {
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!text.trim()) return;

        setSubmitting(true);
        try {
            await feedback.addComment(contentType, contentId, text, true);
            setSubmitted(true);
            toast.success('Success story shared!');
            setTimeout(() => {
                onOpenChange(false);
                setSubmitted(false);
                setText('');
            }, 2000);
        } catch (e) {
            toast.error('Failed to share story');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-display text-primary">
                        <Star weight="fill" className="h-6 w-6 text-yellow-500" />
                        Great job!
                    </DialogTitle>
                </DialogHeader>

                {!submitted ? (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            You just completed <strong>{title}</strong>! Was it a success?
                            Share your experience to help other parents know what to expect.
                        </p>

                        <Textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="What worked well? How did your child react?"
                            className="min-h-[100px]"
                        />

                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button variant="ghost" onClick={() => onOpenChange(false)}>
                                Maybe later
                            </Button>
                            <Button onClick={handleSubmit} disabled={!text.trim() || submitting}>
                                {submitting ? 'Sharing...' : 'Share Success Story'}
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <Check weight="bold" className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Thanks for sharing!</h3>
                            <p className="text-muted-foreground">Your story inspires our community.</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
