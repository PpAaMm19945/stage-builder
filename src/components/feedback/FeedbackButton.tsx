import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ChatCircle, EnvelopeSimple, WhatsappLogo, PaperPlaneTilt, CircleNotch } from '@phosphor-icons/react';
import { toast } from 'sonner';

type FeedbackType = 'bug' | 'suggestion' | 'question' | 'other';

const feedbackTypes: { value: FeedbackType; label: string }[] = [
    { value: 'bug', label: '🐛 Bug Report' },
    { value: 'suggestion', label: '💡 Suggestion' },
    { value: 'question', label: '❓ Question' },
    { value: 'other', label: '📝 Other' },
];

export function FeedbackButton() {
    const [open, setOpen] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [feedbackType, setFeedbackType] = useState<FeedbackType>('suggestion');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!description.trim()) {
            toast.error('Please enter a description');
            return;
        }

        setIsSubmitting(true);

        try {
            // For MVP: Use mailto link
            const subject = encodeURIComponent(`SchoolOS Feedback: ${feedbackTypes.find(t => t.value === feedbackType)?.label || 'Feedback'}`);
            const body = encodeURIComponent(
                `Type: ${feedbackTypes.find(t => t.value === feedbackType)?.label}\n\nDescription:\n${description}\n\nPage: ${window.location.pathname}\nTime: ${new Date().toISOString()}`
            );

            // Open mailto link
            window.open(`mailto:antmwes104.1@gmail.com?subject=${subject}&body=${body}`, '_blank');

            toast.success('Thank you for your feedback!', {
                description: 'Your email client should open with the feedback details.',
            });

            // Reset form
            setDescription('');
            setOpen(false);
        } catch (error) {
            toast.error('Failed to submit feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWhatsApp = () => {
        const message = encodeURIComponent(
            `Hi SchoolOS Team! I'm reaching out from the app.\n\nPage: ${window.location.pathname}\n\nMy feedback/question:\n`
        );
        window.open(`https://wa.me/256781888609?text=${message}`, '_blank');
        setPopoverOpen(false);
        toast.success('Opening WhatsApp...');
    };

    const handleEmail = () => {
        setPopoverOpen(false);
        setOpen(true);
    };

    return (
        <>
            {/* Floating Action Button with Popover */}
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <button
                        className="fixed bottom-20 lg:bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        aria-label="Send feedback"
                    >
                        <ChatCircle className="h-6 w-6" weight="fill" />
                    </button>
                </PopoverTrigger>
                <PopoverContent side="top" align="end" className="w-48 p-2">
                    <div className="flex flex-col gap-1">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 h-10"
                            onClick={handleEmail}
                        >
                            <EnvelopeSimple className="h-5 w-5 text-blue-600" weight="duotone" />
                            Email Us
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 h-10"
                            onClick={handleWhatsApp}
                        >
                            <WhatsappLogo className="h-5 w-5 text-green-600" weight="fill" />
                            WhatsApp
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Feedback Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ChatCircle className="h-5 w-5 text-primary" weight="duotone" />
                            Send Feedback
                        </DialogTitle>
                        <DialogDescription>
                            Help us improve SchoolOS! Report bugs, suggest features, or ask questions.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-4">
                        {/* Feedback Type */}
                        <div className="space-y-2">
                            <Label htmlFor="feedback-type">What type of feedback?</Label>
                            <Select
                                value={feedbackType}
                                onValueChange={(value) => setFeedbackType(value as FeedbackType)}
                            >
                                <SelectTrigger id="feedback-type">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {feedbackTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="feedback-description">Description</Label>
                            <Textarea
                                id="feedback-description"
                                placeholder="Tell us what's on your mind..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !description.trim()}
                                className="gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <CircleNotch className="h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <PaperPlaneTilt className="h-4 w-4" weight="fill" />
                                        Send Feedback
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
