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
import { InlineAddChildForm } from '@/components/children/InlineAddChildForm';
import { useAuth } from '@/contexts/AuthContext';
import {
    Sparkles,
    Calendar,
    BarChart3,
    Eye,
    ArrowRight,
    Check
} from 'lucide-react';
import { BookOpen, UsersThree, Heart } from '@phosphor-icons/react';

const ONBOARDING_COMPLETE_KEY = 'schoolos_onboarding_complete';
const IDENTITY_PREFS_KEY = 'schoolos_identity_prefs';

interface IdentityPrefs {
    scriptureGrounded: boolean;
    siblingLearning: boolean;
    godlyCharacter: boolean;
}

interface WelcomeFlowProps {
    onComplete?: () => void;
}

export function WelcomeFlow({ onComplete }: WelcomeFlowProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [identityPrefs, setIdentityPrefs] = useState<IdentityPrefs>({
        scriptureGrounded: false,
        siblingLearning: false,
        godlyCharacter: false,
    });
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
        localStorage.setItem(IDENTITY_PREFS_KEY, JSON.stringify(identityPrefs));
        setOpen(false);
        onComplete?.();
    };

    const handleChildAdded = () => {
        // Move to quick tour step (now step 3 after identity step)
        setStep(3);
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleStartExploring = () => {
        handleComplete();
        navigate('/');
    };

    const handleIdentityAnswer = (key: keyof IdentityPrefs, value: boolean) => {
        setIdentityPrefs(prev => ({ ...prev, [key]: value }));
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
        // Step 1: Identity Questions
        {
            content: (
                <div className="space-y-6 text-center">
                    <div className="space-y-2">
                        <DialogTitle className="text-2xl font-display">
                            Before we begin...
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Help us personalize your family's experience
                        </DialogDescription>
                    </div>

                    <div className="space-y-4 text-left">
                        {/* Scripture Question */}
                        <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                    <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" weight="duotone" />
                                </div>
                                <p className="font-medium text-foreground">Is raising children grounded in Scripture important to you?</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={identityPrefs.scriptureGrounded ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleIdentityAnswer('scriptureGrounded', true)}
                                    className="flex-1"
                                >
                                    Yes
                                </Button>
                                <Button
                                    variant={identityPrefs.scriptureGrounded === false ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => handleIdentityAnswer('scriptureGrounded', false)}
                                    className="flex-1"
                                >
                                    Not right now
                                </Button>
                            </div>
                        </div>

                        {/* Sibling Learning Question */}
                        <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <UsersThree className="h-5 w-5 text-blue-600 dark:text-blue-400" weight="duotone" />
                                </div>
                                <p className="font-medium text-foreground">Do you want your children to learn alongside their siblings?</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={identityPrefs.siblingLearning ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleIdentityAnswer('siblingLearning', true)}
                                    className="flex-1"
                                >
                                    Yes
                                </Button>
                                <Button
                                    variant={identityPrefs.siblingLearning === false ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => handleIdentityAnswer('siblingLearning', false)}
                                    className="flex-1"
                                >
                                    Not right now
                                </Button>
                            </div>
                        </div>

                        {/* Godly Character Question */}
                        <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30">
                                    <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" weight="duotone" />
                                </div>
                                <p className="font-medium text-foreground">Is developing godly character a priority in your home?</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={identityPrefs.godlyCharacter ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleIdentityAnswer('godlyCharacter', true)}
                                    className="flex-1"
                                >
                                    Yes
                                </Button>
                                <Button
                                    variant={identityPrefs.godlyCharacter === false ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => handleIdentityAnswer('godlyCharacter', false)}
                                    className="flex-1"
                                >
                                    Not right now
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <Button onClick={() => setStep(2)} size="lg" className="gap-2">
                            Continue
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleSkip}>
                            Skip for now
                        </Button>
                    </div>
                </div>
            ),
        },
        // Step 2: Add Child
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
        // Step 3: Quick Tour
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
