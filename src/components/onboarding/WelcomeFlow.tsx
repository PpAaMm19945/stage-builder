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
import { weeklyPlan, profile } from '@/lib/api';
import {
    Sparkles,
    Calendar,
    BarChart3,
    Eye,
    ArrowRight,
    Check,
    Timer,
    CalendarCheck,
    Target
} from 'lucide-react';
import { BookOpen, UsersThree, Heart, Baby, Crown, MoonStars, Sun } from '@phosphor-icons/react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { OnboardingModeSelector, OnboardingMode } from './OnboardingModeSelector';
import { ConversationalOnboarding } from './ConversationalOnboarding'; // Will create next

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
    const [onboardingMode, setOnboardingMode] = useState<OnboardingMode | null>(null);

    // Guided Setup State
    const [morningMinutes, setMorningMinutes] = useState(15);
    const [eveningMinutes, setEveningMinutes] = useState(15);
    const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

    const { children, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Generate Mutation
    const generateMutation = useMutation({
        mutationFn: async (prefs: { balancePreference: 'baby_focused' | 'mixed' | 'older_focused' }) => {
            await profile.update({
                morning_minutes: morningMinutes,
                evening_minutes: eveningMinutes,
                available_days: selectedDays,
                goals: selectedGoals,
                onboarding_mode: onboardingMode || 'guided'
            });
            return weeklyPlan.regenerate(prefs);
        },
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
        if (onboardingMode === 'quick') {
            // Quick Start: Auto-generate and finish
            generateMutation.mutate({ balancePreference: 'mixed' });
        } else {
            // Guided: Move to planning step (Step 3)
            setStep(3);
        }
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

    const handleDayToggle = (day: string) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(prev => prev.filter(d => d !== day));
        } else {
            setSelectedDays(prev => [...prev, day]);
        }
    };

    const handleGoalToggle = (goal: string) => {
        if (selectedGoals.includes(goal)) {
            setSelectedGoals(prev => prev.filter(g => g !== goal));
        } else {
            setSelectedGoals(prev => [...prev, goal]);
        }
    };

    const handleGeneratePlan = () => {
        generateMutation.mutate({ balancePreference });
    };

    const steps = [
        // Step 0: Welcome
        // Step 0: Mode Selection
        {
            content: (
                <div className="py-2">
                    <OnboardingModeSelector onSelect={(mode) => {
                        setOnboardingMode(mode);
                        if (mode === 'quick') {
                            setStep(1); // Go to Add Child directly
                        } else if (mode === 'guided') {
                            setStep(1); // Go to Identity Questions (Need to reorder steps or handle dynamically)
                        } else if (mode === 'chat') {
                            setStep(1); // Go to Chat
                        }
                    }} />
                </div>
            ),
        },
        // Step 1: Guided Setup (Identity & Preferences)
        {
            content: (
                <div className="space-y-6 text-center h-[60vh] overflow-y-auto px-1">
                    <div className="space-y-2">
                        <DialogTitle className="text-2xl font-display">
                            Customize Your Rhythm
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Help us personalize your family's experience
                        </DialogDescription>
                    </div>

                    <div className="space-y-6 text-left">
                        {/* Section 1: Identity */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Family Culture</h4>

                            {/* Scripture Question */}
                            <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-amber-600" weight="duotone" />
                                    <p className="font-medium text-sm">Valid Scripture Grounding?</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant={identityPrefs.scriptureGrounded ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleIdentityAnswer('scriptureGrounded', true)}
                                        className="flex-1 h-8 text-xs"
                                    >
                                        Yes
                                    </Button>
                                    <Button
                                        variant={identityPrefs.scriptureGrounded === false ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => handleIdentityAnswer('scriptureGrounded', false)}
                                        className="flex-1 h-8 text-xs"
                                    >
                                        Not right now
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Time Availability */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Time Availability</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Sun weight="duotone" className="w-4 h-4 text-orange-500" />
                                        <span className="text-sm font-medium">Morning</span>
                                    </div>
                                    <select
                                        className="w-full bg-background border rounded px-2 py-1 text-sm"
                                        value={morningMinutes}
                                        onChange={(e) => setMorningMinutes(Number(e.target.value))}
                                    >
                                        <option value={5}>5 min</option>
                                        <option value={10}>10 min</option>
                                        <option value={15}>15 min</option>
                                        <option value={30}>30 min</option>
                                    </select>
                                </div>
                                <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <MoonStars weight="duotone" className="w-4 h-4 text-indigo-500" />
                                        <span className="text-sm font-medium">Evening</span>
                                    </div>
                                    <select
                                        className="w-full bg-background border rounded px-2 py-1 text-sm"
                                        value={eveningMinutes}
                                        onChange={(e) => setEveningMinutes(Number(e.target.value))}
                                    >
                                        <option value={0}>None</option>
                                        <option value={5}>5 min</option>
                                        <option value={10}>10 min</option>
                                        <option value={15}>15 min</option>
                                        <option value={30}>30 min</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Days */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Available Days</h4>
                            <div className="flex justify-between gap-1">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                    <button
                                        key={day}
                                        onClick={() => handleDayToggle(day)}
                                        className={`w-9 h-9 rounded-full text-xs font-medium transition-colors ${selectedDays.includes(day)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                            }`}
                                    >
                                        {day.charAt(0)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section 4: Goals */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Focus Areas</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {['Catechism', 'Hymns', 'Scripture', 'Habits'].map(goal => (
                                    <button
                                        key={goal}
                                        onClick={() => handleGoalToggle(goal)}
                                        className={`p-2 rounded-md border text-xs font-medium transition-all text-left flex items-center gap-2 ${selectedGoals.includes(goal)
                                            ? 'border-primary bg-primary/5'
                                            : 'border-transparent bg-muted/50 hover:bg-muted'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedGoals.includes(goal) ? 'border-primary bg-primary' : 'border-muted-foreground'
                                            }`}>
                                            {selectedGoals.includes(goal) && <Check className="w-3 h-3 text-primary-foreground" />}
                                        </div>
                                        {goal}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <Button onClick={() => setStep(2)} size="lg" className="gap-2 w-full">
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
        // Step 4: Quick Tour
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
                    </div>
                    <Button onClick={handleStartExploring} size="lg" className="gap-2">
                        Start Exploring
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
        // Step 5: Conversational Onboarding
        {
            content: (
                <ConversationalOnboarding onComplete={handleComplete} />
            )
        }
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
