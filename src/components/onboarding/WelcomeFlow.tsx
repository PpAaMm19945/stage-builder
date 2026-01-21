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
import { useMutation } from '@tanstack/react-query';
import { weeklyPlan } from '@/lib/api';
import {
    Sparkles,
    Calendar,
    BarChart3,
    Eye,
    ArrowRight,
    Check
} from 'lucide-react';
import { BookOpen, UsersThree, Heart, Baby, Crown } from '@phosphor-icons/react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

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
    const [balancePreference, setBalancePreference] = useState<'baby_focused' | 'mixed' | 'older_focused'>('mixed');

    const { children, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Generate Mutation
    const generateMutation = useMutation({
        mutationFn: (prefs: { balancePreference: 'baby_focused' | 'mixed' | 'older_focused' }) =>
            weeklyPlan.regenerate(prefs),
        onSuccess: () => {
            handleComplete();
            navigate('/early-years/planner'); // Redirect to planner to see the result
        }
    });

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
        // Move to planning step (Step 3) instead of Quick Tour (Step 4)
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

    const handleGeneratePlan = () => {
        generateMutation.mutate({ balancePreference });
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
                            Welcome to FamilyPath
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            A simple daily rhythm for your family
                        </DialogDescription>
                    </div>

                    <ul className="space-y-3 text-left max-w-sm mx-auto">
                        <li className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <span className="text-foreground">
                                Start each day with a hymn, verse, and prayer
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <span className="text-foreground">
                                Read stories that form hearts and minds
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <span className="text-foreground">
                                Simple activities that fit your family's pace
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
        // Step 3: Plan Generation (New)
        {
            content: (
                <div className="space-y-6 text-center">
                    <div className="space-y-2">
                        <DialogTitle className="text-2xl font-display">
                            Let's Plan Your First Week
                        </DialogTitle>
                        <DialogDescription>
                            We'll create a personalized schedule based on your family.
                        </DialogDescription>
                    </div>

                    <RadioGroup value={balancePreference} onValueChange={(v: any) => setBalancePreference(v)} className="gap-3 text-left">
                        <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                            <RadioGroupItem value="baby_focused" id="r1" />
                            <Label htmlFor="r1" className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-2 font-semibold">
                                    <Baby className="w-4 h-4 text-indigo-500" />
                                    Baby Focused
                                </div>
                                <span className="text-xs text-muted-foreground">Prioritize sensory & bonding. Older kids help lead.</span>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                            <RadioGroupItem value="mixed" id="r2" />
                            <Label htmlFor="r2" className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-2 font-semibold">
                                    <UsersThree className="w-4 h-4 text-green-500" />
                                    Balanced Mix
                                </div>
                                <span className="text-xs text-muted-foreground">Equal focus across all age groups.</span>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                            <RadioGroupItem value="older_focused" id="r3" />
                            <Label htmlFor="r3" className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-2 font-semibold">
                                    <Crown className="w-4 h-4 text-amber-500" />
                                    Older Focused
                                </div>
                                <span className="text-xs text-muted-foreground">More complex activities. Babies observe/tag along.</span>
                            </Label>
                        </div>
                    </RadioGroup>

                    <Button onClick={handleGeneratePlan} size="lg" className="w-full gap-2" disabled={generateMutation.isPending}>
                        {generateMutation.isPending ? 'Creating your plan...' : 'Generate Week'}
                        {!generateMutation.isPending && <ArrowRight className="h-4 w-4" />}
                    </Button>
                </div>
            )
        },
        // Step 4: Quick Tour (Shifted)
        {
            content: (
                <div className="space-y-6 text-center">
                    <div className="space-y-2">
                        <DialogTitle className="text-2xl font-display">
                            Quick Tour
                        </DialogTitle>
                        <DialogDescription>
                            Here's what you can do with FamilyPath
                        </DialogDescription>
                    </div>

                    <div className="space-y-4 text-left">
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium text-foreground">Daily Rhythm</h4>
                                <p className="text-sm text-muted-foreground">
                                    Morning liturgy, activities, and read-alouds in one unified view
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                            <div className="p-2 rounded-lg bg-secondary/10">
                                <BarChart3 className="h-5 w-5 text-secondary" />
                            </div>
                            <div>
                                <h4 className="font-medium text-foreground">Formation Progress</h4>
                                <p className="text-sm text-muted-foreground">
                                    Track growth across activities, reading, and family devotions
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                            <div className="p-2 rounded-lg bg-accent/10">
                                <Eye className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                                <h4 className="font-medium text-foreground">Capture Learning</h4>
                                <p className="text-sm text-muted-foreground">
                                    Record observations and portfolio moments as you go
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

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            // If closed (e.g. by X button or clicking outside), mark as complete/skipped
            // to avoid persistent annoyance
            localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
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
