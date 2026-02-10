import { useState } from 'react';
import { VIRTUE_LABELS, type PrimaryVirtue, type EarlyYearsDomain, DOMAIN_LABELS } from '@/types';
import { FormationTimer, useFormationTimer } from '@/components/formations/FormationTimer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { UpvoteButton } from '@/components/feedback/UpvoteButton';
import {
    Clock,
    CheckCircle2,
    Package,
    ListOrdered,
    Target,
    ChevronDown,
    ChevronUp,
    Lightbulb,
    ArrowRight,
    Sparkles,
    Users,
    Book,
    Smile,
    AlertTriangle,
    Globe,
    ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

import { ApiActivity } from '@/types';

const virtueColors: Record<PrimaryVirtue, string> = {
    'Wisdom': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300',
    'Stewardship': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300',
    'Love': 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300',
    'Order': 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300',
    'Wonder': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300',
};

// Fallback for legacy domains
const domainColors: Record<string, string> = {
    'motor': 'bg-domain-motor/10 text-domain-motor border-domain-motor/20',
    'language': 'bg-domain-language/10 text-domain-language border-domain-language/20',
    'cognitive': 'bg-domain-cognitive/10 text-domain-cognitive border-domain-cognitive/20',
    'social-emotional': 'bg-domain-social/10 text-domain-social border-domain-social/20',
    'pre-academic': 'bg-domain-academic/10 text-domain-academic border-domain-academic/20',
};

// Local interfaces to resolve any types
export interface TieredExpectation {
    tier: string | number;
    age_min: number;
    age_max: number;
    expectation: string;
}

export interface ActivityResult {
    created_at: string;
    parent_notes?: string;
}

// Interface compatible with both API and simplified objects
export interface ActivityDetailsProps {
    activity: {
        id: string;
        title: string;
        description: string;
        primary_virtue?: PrimaryVirtue;
        domain?: EarlyYearsDomain; // Legacy support
        parent_posture?: string;
        formation_type?: string;
        context_anchor?: string;
        liturgical_script?: string;

        estimatedMinutes?: number;
        duration_minutes?: number; // Handle both
        difficultyLevel?: number;
        difficulty?: number;
        materials: string[];
        instructions?: string[];
        guide_steps?: string[]; // New
        successIndicators?: string[];
        success_indicators?: string[];
        tips?: string[];
        minAgeMonths?: number;
        min_age_months?: number;
        maxAgeMonths?: number;
        max_age_months?: number;
        activityType?: string;
        activity_type?: string;
        tieredExpectations?: TieredExpectation[];
        tiered_expectations?: TieredExpectation[];
        safetyNote?: string;
        safety_note?: string;
        culturalNotes?: string;
        cultural_notes?: string;
        parentScript?: string;
        parent_script?: string;
        assessmentProhibited?: number;
        assessment_prohibited?: number;
    };
    isCompleted?: boolean;
    onComplete?: (duration?: number) => void;
    onObservation?: () => void;
    showBack?: boolean;
    onBack?: () => void;
    previousResult?: ActivityResult;
    hideActions?: boolean;
}

export function ActivityDetails({
    activity,
    isCompleted = false,
    onComplete,
    onObservation,
    showBack = false,
    onBack,
    previousResult,
    hideActions = false
}: ActivityDetailsProps) {
    const navigate = useNavigate();

    // Timer Logic
    const {
        isRunning,
        start,
        stop,
        getElapsedMinutes,
        elapsedSeconds
    } = useFormationTimer();

    // Auto-start if not completed and viewing? Maybe manual is better for details view.
    // Let's stick to manual for details view unless it's a specific "Do It" mode.
    // FormationCard auto-starts on expand. Here we are in a sheet. Let's auto-start if it's "upcoming" or "current"? 
    // Actually, user might just be reading. Let's provide controls.

    // Normalize fields
    const duration = activity.estimatedMinutes || activity.duration_minutes || 15;
    const minAge = activity.minAgeMonths || activity.min_age_months || 0;
    const maxAge = activity.maxAgeMonths || activity.max_age_months || 60;
    const difficulty = activity.difficultyLevel || activity.difficulty || 1;
    const successIndicators = activity.successIndicators || activity.success_indicators || [];
    const tips = activity.tips || [];
    const type = activity.activityType || activity.activity_type || activity.formation_type;
    const tiers = activity.tieredExpectations || activity.tiered_expectations || [];
    const safety = activity.safetyNote || activity.safety_note;
    const script = activity.liturgical_script || activity.parentScript || activity.parent_script;
    const culture = activity.culturalNotes || activity.cultural_notes;
    const noAssessment = activity.assessmentProhibited === 1 || activity.assessment_prohibited === 1 || type === 'daily_practice';

    // Formation specific
    const virtue = activity.primary_virtue || (activity.domain as PrimaryVirtue);
    const posture = activity.parent_posture;
    const steps = activity.guide_steps || activity.instructions || [];

    const virtueColor = virtueColors[virtue] || domainColors[virtue] || 'bg-primary/10 text-primary';

    const handleComplete = () => {
        stop();
        if (onComplete) {
            // If timer was running, use that. Otherwise undefined (or maybe 0?)
            // If elapsed > 1 minute, use it.
            const elapsed = getElapsedMinutes();
            onComplete(elapsed > 0 ? elapsed : undefined);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl pb-8">
            {/* Back Navigation */}
            {showBack && (
                <Button variant="ghost" size="sm" onClick={onBack || (() => navigate(-1))} className="gap-2 -ml-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            )}

            {/* Header */}
            <div className="space-y-4">

                {/* PARENT POSTURE BANNER */}
                {posture && (
                    <div className="bg-blue-50 dark:bg-blue-950/40 border-l-4 border-blue-400 p-4 rounded-r-lg mb-4">
                        <div className="flex items-start gap-3">
                            <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                                    Parent Posture
                                </h3>
                                <p className="text-blue-900 dark:text-blue-100 font-medium text-lg italic leading-relaxed">
                                    "{posture}"
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <Badge variant="outline" className={cn(virtueColor, 'mb-2')}>
                            {VIRTUE_LABELS[virtue] || virtue}
                        </Badge>
                        <h1 className="text-3xl font-display font-bold text-foreground">
                            {activity.title}
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            {activity.description}
                        </p>
                    </div>
                    {isCompleted && (
                        <Badge className="bg-mastery-secure/10 text-mastery-secure border-mastery-secure/20 shrink-0 gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                        </Badge>
                    )}
                    <div className="flex items-center gap-2">

                        <UpvoteButton contentType="activity" contentId={activity.id} />
                    </div>
                </div>

                {/* Timer & Meta info */}
                <div className="flex flex-col gap-3">
                    {/* Active Timer Control */}
                    {!isCompleted && (
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border">
                            <FormationTimer
                                isRunning={isRunning}
                                showControls={true}
                                onToggle={() => isRunning ? stop() : start()}
                                className="text-2xl font-mono font-bold w-full justify-center" // Prominent
                            />
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Est. {duration} minutes</span>
                        </div>
                        {/* ... rest of existing meta ... */}
                        <div className="flex items-center gap-2">
                            <span>Difficulty:</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <div
                                        key={level}
                                        className={`h-2 w-4 rounded-full ${level <= difficulty ? 'bg-primary' : 'bg-muted'}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <span>Ages {minAge}-{maxAge} months</span>
                    </div>
                </div>

                {/* Safety Note */}
                {safety && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200">
                        <AlertTriangle className="h-4 w-4 stroke-red-600 dark:stroke-red-400" />
                        <AlertTitle className="text-red-700 dark:text-red-300">Safety Warning</AlertTitle>
                        <AlertDescription>{safety}</AlertDescription>
                    </Alert>
                )}

                {/* Cultural Context */}
                {culture && (
                    <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                        <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertTitle className="text-blue-700 dark:text-blue-300">Cultural Context</AlertTitle>
                        <AlertDescription className="text-blue-800 dark:text-blue-200">{culture}</AlertDescription>
                    </Alert>
                )}

                {/* Shepherd's Script */}
                {script && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded-r-lg shadow-sm">
                        <div className="flex items-start gap-3">
                            <Book className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Shepherd's Script</p>
                                <p className="text-amber-900 dark:text-amber-100 italic text-lg leading-relaxed">"{script}"</p>
                                <p className="text-xs text-amber-700 dark:text-amber-300/80 pt-1">Read this to your child to connect this activity to God's truth.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Materials */}
                {activity.materials && activity.materials.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                Materials Needed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {activity.materials.map((material, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-foreground">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                        {material}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Instructions / Guide Steps */}
                {steps && steps.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ListOrdered className="h-5 w-5 text-primary" />
                                Formation Guide
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ol className="space-y-4">
                                {steps.map((step, idx) => (
                                    <li key={idx} className="flex gap-4">
                                        <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                                            {idx + 1}
                                        </span>
                                        <p className="text-foreground pt-0.5">{step}</p>
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>
                )}

                {/* Success Indicators */}
                {successIndicators.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                What Success Looks Like
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {successIndicators.map((indicator, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-foreground">
                                        <CheckCircle2 className="h-4 w-4 text-mastery-secure mt-1 shrink-0" />
                                        {indicator}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Tiered Expectations */}
                {type === 'family_session' && tiers.length > 0 && (
                    <Card className="border-primary/30 bg-primary/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2 text-primary">
                                <Users className="h-5 w-5" />
                                Age-Appropriate Expectations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                This is a family activity! Here's what to expect for different ages:
                            </p>
                            <div className="space-y-3">
                                {tiers.map((tier, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                                        <div className="shrink-0 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                                            {tier.tier}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground mb-1">
                                                Ages {tier.age_min}-{tier.age_max} months
                                            </p>
                                            <p className="text-sm text-foreground">{tier.expectation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tips and Variations - Omitted for brevity in this refactor, can keep adding if needed */}
                {tips.length > 0 && (
                    <Card className="border-accent/30 bg-accent/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2 text-accent">
                                <Lightbulb className="h-5 w-5" />
                                Tips for Parents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {tips.map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-foreground">
                                        <Sparkles className="h-4 w-4 text-accent mt-1 shrink-0" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}


                {/* Action Buttons */}
                {!hideActions && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        {noAssessment ? (
                            <Button size="lg" variant="outline" onClick={handleComplete} className="w-full sm:w-auto gap-2">
                                <Smile className="h-4 w-4" />
                                That was lovely
                            </Button>
                        ) : isCompleted ? (
                            <>
                                <Button size="lg" variant="outline" onClick={onObservation} className="flex-1">
                                    Update Observation
                                </Button>
                                <Button size="lg" onClick={() => navigate('/early-years/activities')} className="flex-1 gap-2">
                                    Browse Activities <ArrowRight className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <Button size="lg" onClick={handleComplete} className="w-full sm:w-auto gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Complete Activity
                            </Button>
                        )}
                    </div>
                )}

                {/* Previous Result Info */}
                {previousResult && (
                    <Card className="bg-muted/30">
                        <CardContent className="py-4">
                            <p className="text-sm text-muted-foreground">
                                Last completed on {new Date(previousResult.created_at).toLocaleDateString()}
                                {previousResult.parent_notes && (
                                    <span> — "{previousResult.parent_notes}"</span>
                                )}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
