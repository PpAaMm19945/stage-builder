import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AddChildForm } from '@/components/children/AddChildForm';
import { useAuth } from '@/contexts/AuthContext';
import {
    Sparkles,
    Calendar,
    BarChart3,
    Eye,
    ArrowRight,
    Check
} from 'lucide-react';

const ONBOARDING_COMPLETE_KEY = 'schoolos_onboarding_complete';

interface WelcomeFlowProps {
    onComplete?: () => void;
}

export function WelcomeFlow({ onComplete }: WelcomeFlowProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);
    const { children, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Show onboarding if:
        // 1. User is authenticated
        // 2. No children registered
        // 3. Onboarding not yet completed
        const isOnboardingComplete = localStorage.getItem(ONBOARDING_COMPLETE_KEY);

        if (isAuthenticated && children.length === 0 && !isOnboardingComplete) {
            setOpen(true);
        }
    }, [isAuthenticated, children.length]);

    const handleComplete = () => {
        localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
        setOpen(false);
        onComplete?.();
    };

    const handleChildAdded = () => {
        // Move to quick tour step
        setStep(2);
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleStartExploring = () => {
        handleComplete();
        navigate('/early-years/today');
    };

    const steps = [
        // Step 0: Welcome
        {
            content: (
                <div className="space-y-6 text-center">
                    <div className="flex justify-center">
                        <div className="p-4 rounded-full bg-primary/10">
                            <Sparkles className="h-12 w-12 text-primary" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <DialogTitle className="text-2xl font-display">
                            Welcome to SchoolOS
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Personalized early learning for your child
                        </DialogDescription>
                    </div>

                    <ul className="space-y-3 text-left max-w-sm mx-auto">
                        <li className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <span className="text-foreground">
                                Daily activities tailored to your child's age and development
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <span className="text-foreground">
                                Track progress across 5 key learning domains
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <span className="text-foreground">
                                Record observations to personalize recommendations
                            </span>
                        </li>
                    </ul>

                    <div className="flex flex-col gap-3 pt-4">
                        <Button onClick={() => setStep(1)} size="lg" className="gap-2">
                            Get Started
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleSkip}>
                            Skip for now
                        </Button>
                    </div>
                </div>
            ),
        },
        // Step 1: Add Child
        {
            content: (
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <DialogTitle className="text-2xl font-display">
                            Add Your Child
                        </DialogTitle>
                        <DialogDescription>
                            Enter your child's details to get personalized activity recommendations
                        </DialogDescription>
                    </div>

                    <div className="py-4">
                        <InlineAddChildForm onSuccess={handleChildAdded} />
                    </div>

                    <div className="flex justify-center">
                        <Button variant="ghost" size="sm" onClick={handleSkip}>
                            I'll do this later
                        </Button>
                    </div>
                </div>
            ),
        },
        // Step 2: Quick Tour
        {
            content: (
                <div className="space-y-6 text-center">
                    <div className="space-y-2">
                        <DialogTitle className="text-2xl font-display">
                            Quick Tour
                        </DialogTitle>
                        <DialogDescription>
                            Here's what you can do with SchoolOS
                        </DialogDescription>
                    </div>

                    <div className="space-y-4 text-left">
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium text-foreground">Today</h4>
                                <p className="text-sm text-muted-foreground">
                                    Your daily recommended activity, personalized for your child
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                            <div className="p-2 rounded-lg bg-secondary/10">
                                <BarChart3 className="h-5 w-5 text-secondary" />
                            </div>
                            <div>
                                <h4 className="font-medium text-foreground">Progress</h4>
                                <p className="text-sm text-muted-foreground">
                                    Track development across motor, language, cognitive, and more
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                            <div className="p-2 rounded-lg bg-accent/10">
                                <Eye className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                                <h4 className="font-medium text-foreground">Observations</h4>
                                <p className="text-sm text-muted-foreground">
                                    Record how activities go to improve future recommendations
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleStartExploring} size="lg" className="gap-2">
                        Start Exploring
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader className="sr-only">
                    <DialogTitle>Onboarding</DialogTitle>
                </DialogHeader>

                {/* Step indicator */}
                <div className="flex justify-center gap-2 mb-4">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 w-2 rounded-full transition-colors ${index === step
                                ? 'bg-primary'
                                : index < step
                                    ? 'bg-primary/40'
                                    : 'bg-muted'
                                }`}
                        />
                    ))}
                </div>

                {steps[step].content}
            </DialogContent>
        </Dialog>
    );
}

export function useOnboardingCheck() {
    return {
        isOnboardingComplete: () => {
            return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
        },
        resetOnboarding: () => {
            localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
        },
    };
}
