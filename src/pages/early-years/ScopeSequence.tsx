import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import {
    Brain,
    Heart,
    BookOpen,
    HandGrabbing,
    ChatCircleText,
    ArrowRight,
    CheckCircle,
    Circle,
    Target,
    Sparkle,
    Info
} from '@phosphor-icons/react';
import { DOMAIN_LABELS, type EarlyYearsDomain } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Scope & Sequence data structure
// This represents the curriculum progression for early years (0-5)
interface MilestoneMarker {
    id: string;
    title: string;
    description: string;
    ageRangeMonths: [number, number];
    isAchieved?: boolean;
}

interface DomainSequence {
    domain: EarlyYearsDomain;
    milestones: MilestoneMarker[];
}

const domainIcons: Record<EarlyYearsDomain, React.ElementType> = {
    'motor': HandGrabbing,
    'language': ChatCircleText,
    'cognitive': Brain,
    'social-emotional': Heart,
    'pre-academic': BookOpen,
};

const domainColors: Record<EarlyYearsDomain, string> = {
    'motor': 'text-emerald-600 dark:text-emerald-400',
    'language': 'text-blue-600 dark:text-blue-400',
    'cognitive': 'text-purple-600 dark:text-purple-400',
    'social-emotional': 'text-pink-600 dark:text-pink-400',
    'pre-academic': 'text-orange-600 dark:text-orange-400',
};

const domainBgColors: Record<EarlyYearsDomain, string> = {
    'motor': 'bg-emerald-50 dark:bg-emerald-950/30',
    'language': 'bg-blue-50 dark:bg-blue-950/30',
    'cognitive': 'bg-purple-50 dark:bg-purple-950/30',
    'social-emotional': 'bg-pink-50 dark:bg-pink-950/30',
    'pre-academic': 'bg-orange-50 dark:bg-orange-950/30',
};

// Sample scope & sequence data based on Reformed/Charlotte Mason approach
const SCOPE_SEQUENCE_DATA: DomainSequence[] = [
    {
        domain: 'motor',
        milestones: [
            { id: 'm1', title: 'Tummy Time Master', description: 'Lifts head and chest during tummy time', ageRangeMonths: [0, 4] },
            { id: 'm2', title: 'Sitting Strong', description: 'Sits independently without support', ageRangeMonths: [5, 8] },
            { id: 'm3', title: 'First Steps', description: 'Takes first independent steps', ageRangeMonths: [9, 15] },
            { id: 'm4', title: 'Confident Walker', description: 'Walks and runs with ease', ageRangeMonths: [15, 24] },
            { id: 'm5', title: 'Fine Motor Skills', description: 'Uses scissors, holds pencil correctly', ageRangeMonths: [36, 48] },
            { id: 'm6', title: 'Physical Coordination', description: 'Catches balls, climbs playground equipment', ageRangeMonths: [48, 60] },
        ]
    },
    {
        domain: 'language',
        milestones: [
            { id: 'l1', title: 'First Sounds', description: 'Coos and babbles in response to speech', ageRangeMonths: [0, 6] },
            { id: 'l2', title: 'First Words', description: 'Says first meaningful words (mama, dada)', ageRangeMonths: [9, 12] },
            { id: 'l3', title: 'Word Explosion', description: 'Vocabulary grows to 50+ words', ageRangeMonths: [18, 24] },
            { id: 'l4', title: 'Simple Sentences', description: 'Combines words into 2-3 word sentences', ageRangeMonths: [24, 30] },
            { id: 'l5', title: 'Storyteller', description: 'Tells simple stories, uses complete sentences', ageRangeMonths: [36, 48] },
            { id: 'l6', title: 'Early Reader', description: 'Recognizes letters, rhymes, and some sight words', ageRangeMonths: [48, 60] },
        ]
    },
    {
        domain: 'cognitive',
        milestones: [
            { id: 'c1', title: 'Object Tracking', description: 'Follows objects with eyes, recognizes faces', ageRangeMonths: [0, 4] },
            { id: 'c2', title: 'Object Permanence', description: 'Understands objects exist when hidden', ageRangeMonths: [6, 12] },
            { id: 'c3', title: 'Problem Solver', description: 'Solves simple problems, stacks blocks', ageRangeMonths: [12, 24] },
            { id: 'c4', title: 'Sorting & Matching', description: 'Sorts by color, shape; matches pairs', ageRangeMonths: [24, 36] },
            { id: 'c5', title: 'Counting Concepts', description: 'Counts to 10, understands quantity', ageRangeMonths: [36, 48] },
            { id: 'c6', title: 'Logical Thinking', description: 'Understands sequences, simple patterns', ageRangeMonths: [48, 60] },
        ]
    },
    {
        domain: 'social-emotional',
        milestones: [
            { id: 's1', title: 'Social Smile', description: 'Smiles in response to faces and voices', ageRangeMonths: [0, 3] },
            { id: 's2', title: 'Attachment', description: 'Shows preference for caregivers', ageRangeMonths: [6, 12] },
            { id: 's3', title: 'Parallel Play', description: 'Plays alongside other children', ageRangeMonths: [18, 30] },
            { id: 's4', title: 'Sharing Begins', description: 'Takes turns with guidance', ageRangeMonths: [30, 42] },
            { id: 's5', title: 'Friendship', description: 'Forms friendships, shows empathy', ageRangeMonths: [42, 54] },
            { id: 's6', title: 'Self-Regulation', description: 'Manages emotions with words', ageRangeMonths: [48, 60] },
        ]
    },
    {
        domain: 'pre-academic',
        milestones: [
            { id: 'p1', title: 'Book Lover', description: 'Enjoys being read to, handles books', ageRangeMonths: [6, 18] },
            { id: 'p2', title: 'Name Recognition', description: 'Recognizes own name in print', ageRangeMonths: [24, 36] },
            { id: 'p3', title: 'Letter Awareness', description: 'Identifies some alphabet letters', ageRangeMonths: [36, 48] },
            { id: 'p4', title: 'Number Sense', description: 'Counts objects, writes numbers 1-5', ageRangeMonths: [42, 54] },
            { id: 'p5', title: 'Writing Ready', description: 'Draws shapes, attempts letters', ageRangeMonths: [48, 60] },
            { id: 'p6', title: 'Kindergarten Ready', description: 'Writes name, knows letter sounds', ageRangeMonths: [54, 66] },
        ]
    },
];

export default function ScopeSequence() {
    const { selectedChild } = useAuth();
    const childAgeMonths = selectedChild?.ageInMonths || 24;

    // Determine milestone status based on child's age
    const getMilestoneStatus = (milestone: MilestoneMarker): 'past' | 'current' | 'future' => {
        if (childAgeMonths > milestone.ageRangeMonths[1]) return 'past';
        if (childAgeMonths >= milestone.ageRangeMonths[0] && childAgeMonths <= milestone.ageRangeMonths[1]) return 'current';
        return 'future';
    };

    const formatAgeRange = (range: [number, number]) => {
        const formatAge = (months: number) => {
            if (months < 12) return `${months}m`;
            const years = Math.floor(months / 12);
            const remaining = months % 12;
            return remaining > 0 ? `${years}y ${remaining}m` : `${years}y`;
        };
        return `${formatAge(range[0])} - ${formatAge(range[1])}`;
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-display font-bold text-foreground">
                    Scope & Sequence
                </h1>
                <p className="text-muted-foreground">
                    A roadmap of developmental milestones for {selectedChild?.name || 'your child'}
                </p>
            </div>

            {/* Info Banner */}
            <Alert className="border-primary/20 bg-primary/5">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary/90">
                    This is a <strong>general guide</strong>, not a checklist. Every child develops at their own pace.
                    The goal is formation, not comparison. Trust your observations as a parent.
                </AlertDescription>
            </Alert>

            {/* Child Age Indicator */}
            {selectedChild && (
                <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
                    <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Target className="h-6 w-6 text-primary" weight="duotone" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-foreground">{selectedChild.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    Currently {Math.floor(childAgeMonths / 12)} years, {childAgeMonths % 12} months old
                                </p>
                            </div>
                            <div className="ml-auto">
                                <Badge variant="outline" className="text-primary border-primary/30">
                                    <Sparkle className="h-3 w-3 mr-1" weight="fill" />
                                    Active Stage
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Domain Sequences */}
            <div className="space-y-6">
                {SCOPE_SEQUENCE_DATA.map((sequence) => {
                    const Icon = domainIcons[sequence.domain];
                    const textColor = domainColors[sequence.domain];
                    const bgColor = domainBgColors[sequence.domain];

                    // Calculate current position in this domain
                    const currentMilestoneIndex = sequence.milestones.findIndex(
                        m => getMilestoneStatus(m) === 'current'
                    );
                    const progressPercent = currentMilestoneIndex >= 0
                        ? ((currentMilestoneIndex + 0.5) / sequence.milestones.length) * 100
                        : sequence.milestones.every(m => getMilestoneStatus(m) === 'past') ? 100 : 0;

                    return (
                        <Card key={sequence.domain} className="overflow-hidden">
                            <CardHeader className={`${bgColor} border-b`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-lg bg-white dark:bg-background flex items-center justify-center shadow-sm`}>
                                            <Icon className={`h-5 w-5 ${textColor}`} weight="duotone" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{DOMAIN_LABELS[sequence.domain]}</CardTitle>
                                            <CardDescription>{sequence.milestones.length} milestones</CardDescription>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-sm font-medium ${textColor}`}>
                                            {Math.round(progressPercent)}% journey
                                        </span>
                                    </div>
                                </div>
                                <Progress value={progressPercent} className="h-1.5 mt-3" />
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {sequence.milestones.map((milestone, idx) => {
                                        const status = getMilestoneStatus(milestone);
                                        const isLast = idx === sequence.milestones.length - 1;

                                        return (
                                            <div
                                                key={milestone.id}
                                                className={`flex items-center gap-4 p-4 transition-colors ${status === 'current'
                                                        ? `${bgColor} border-l-4 ${textColor.replace('text-', 'border-')}`
                                                        : status === 'past'
                                                            ? 'bg-muted/20'
                                                            : 'opacity-60'
                                                    }`}
                                            >
                                                {/* Status icon */}
                                                <div className="shrink-0">
                                                    {status === 'past' ? (
                                                        <CheckCircle className="h-5 w-5 text-green-500" weight="fill" />
                                                    ) : status === 'current' ? (
                                                        <div className={`h-5 w-5 rounded-full ${textColor.replace('text-', 'bg-')} flex items-center justify-center`}>
                                                            <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                                                        </div>
                                                    ) : (
                                                        <Circle className="h-5 w-5 text-muted-foreground/50" />
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-medium ${status === 'past' ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                            {milestone.title}
                                                        </span>
                                                        {status === 'current' && (
                                                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                                                NOW
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-0.5">
                                                        {milestone.description}
                                                    </p>
                                                </div>

                                                {/* Age range */}
                                                <div className="shrink-0 text-right">
                                                    <Badge variant="outline" className={`text-xs ${status === 'current' ? textColor : ''}`}>
                                                        {formatAgeRange(milestone.ageRangeMonths)}
                                                    </Badge>
                                                </div>

                                                {/* Arrow to next */}
                                                {!isLast && (
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground/30 hidden md:block" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Philosophy Note */}
            <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <CardContent className="py-6">
                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                            <BookOpen className="h-5 w-5 text-amber-700 dark:text-amber-400" weight="duotone" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-amber-900 dark:text-amber-200">
                                A Note on Scope & Sequence
                            </h3>
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                In the Charlotte Mason tradition, we believe children are born persons with their own
                                God-given pace of development. This scope and sequence serves as a <em>gentle guide</em>,
                                not a checklist of demands. Your child is not behind if they haven't reached every milestone
                                on schedule – they are exactly where God intends them to be.
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 italic">
                                "The question is not – how much does the youth know? when he has finished his education –
                                but how much does he care?" – Charlotte Mason
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
