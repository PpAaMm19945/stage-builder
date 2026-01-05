import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
    Brain,
    Heart,
    BookOpen,
    HandGrabbing,
    ChatCircleText,
    Info,
} from '@phosphor-icons/react';
import { DOMAIN_LABELS, type EarlyYearsDomain } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Scope & Sequence data structure
// This represents the curriculum progression for early years (0-5)
interface MilestoneMarker {
    id: string;
    title: string;
    description: string;
    ageRangeMonths: [number, number];
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

// Sample scope & sequence data based on Reformed/Charlotte Mason approach
const SCOPE_SEQUENCE_DATA: DomainSequence[] = [
    {
        domain: 'motor',
        milestones: [
            { id: 'm1', title: 'Tummy Time & Head Control', description: 'Lifts head and checks during tummy time. Developing core strength for future upright movement.', ageRangeMonths: [0, 4] },
            { id: 'm2', title: 'Sitting & Rolling', description: 'Sits independently and rolls over. Gaining stewardship of the body.', ageRangeMonths: [5, 8] },
            { id: 'm3', title: 'Crawling & First Steps', description: 'Explores the world through crawling and initial walking.', ageRangeMonths: [9, 15] },
            { id: 'm4', title: 'Confident Walker', description: 'Walks and runs with ease. Stewardship of movement in God\'s creation.', ageRangeMonths: [15, 24] },
            { id: 'm5', title: 'Fine Motor Control', description: 'Uses simple tools, beads, and crayons. Preparing hands for service.', ageRangeMonths: [36, 48] },
            { id: 'm6', title: 'Physical Coordination', description: 'Catches balls, balances, climbs. Joyful mastery of the body.', ageRangeMonths: [48, 72] },
        ]
    },
    {
        domain: 'language',
        milestones: [
            { id: 'l1', title: 'Listening & Cooing', description: 'Attends to voices and makes first sounds. The beginning of communication.', ageRangeMonths: [0, 6] },
            { id: 'l2', title: 'First Words', description: 'Says meaningful words (mama, dada). Naming the world.', ageRangeMonths: [9, 12] },
            { id: 'l3', title: 'Language Explosion', description: 'Vocabulary grows rapidly. Imitating the language of the home.', ageRangeMonths: [18, 24] },
            { id: 'l4', title: 'Speaking in Sentences', description: 'Combines words to express thoughts and needs clearly.', ageRangeMonths: [24, 36] },
            { id: 'l5', title: 'Narrator', description: 'Retells simple stories and events. The art of narration begins.', ageRangeMonths: [36, 48] },
            { id: 'l6', title: 'Pre-Reader', description: 'Recognizes letters and rhymes. Developing affection for written words.', ageRangeMonths: [48, 72] },
        ]
    },
    {
        domain: 'cognitive',
        milestones: [
            { id: 'c1', title: 'Observing the World', description: 'Follows objects and recognizes faces. Growing in awareness.', ageRangeMonths: [0, 6] },
            { id: 'c2', title: 'Object Permanence', description: 'Understands unseen things still exist. Trust and memory.', ageRangeMonths: [6, 12] },
            { id: 'c3', title: 'Explorer & Solver', description: 'Solves simple problems and explores cause and effect.', ageRangeMonths: [12, 24] },
            { id: 'c4', title: 'Sorting & Patterns', description: 'Notice order and categories in creation.', ageRangeMonths: [24, 36] },
            { id: 'c5', title: 'Number Sense', description: 'Counts and understands quantity (1-10). Wisdom in numbering.', ageRangeMonths: [36, 48] },
            { id: 'c6', title: 'Logical Thinking', description: 'Understands sequences and simple reasoning.', ageRangeMonths: [48, 72] },
        ]
    },
    {
        domain: 'social-emotional',
        milestones: [
            { id: 's1', title: 'Attachment & Trust', description: 'Bonds with caregivers. Learning foundational trust.', ageRangeMonths: [0, 6] },
            { id: 's2', title: 'Social Engagement', description: 'Responds to others and initiates interaction.', ageRangeMonths: [6, 18] },
            { id: 's3', title: 'Parallel Play', description: 'Plays alongside others. Learning to be in community.', ageRangeMonths: [18, 30] },
            { id: 's4', title: 'Cooperative Play', description: 'Plays with others, sharing and taking turns. Practicing love for neighbor.', ageRangeMonths: [30, 48] },
            { id: 's5', title: 'Empathy & Manners', description: 'Understanding feelings and practicing grace and courtesy.', ageRangeMonths: [48, 60] },
            { id: 's6', title: 'Self-Control', description: 'Growing in patience and managing emotions.', ageRangeMonths: [60, 72] },
        ]
    },
    {
        domain: 'pre-academic',
        milestones: [
            { id: 'p1', title: 'Sensory Exploration', description: 'Learns through touch, sight, and sound.', ageRangeMonths: [0, 12] },
            { id: 'p2', title: 'Practical Life', description: 'Helps with simple tasks (pouring, wiping). Service in the home.', ageRangeMonths: [18, 36] },
            { id: 'p3', title: 'Book Lover', description: 'Enjoys being read to and handling books.', ageRangeMonths: [12, 36] },
            { id: 'p4', title: 'Art & Creativity', description: 'Expresses beauty through drawing and making.', ageRangeMonths: [36, 60] },
            { id: 'p5', title: 'Focus & Attention', description: 'Sustains attention on short tasks (Habit of Attention).', ageRangeMonths: [48, 72] },
        ]
    }
];

export default function ScopeSequencePage() {
    const { children } = useAuth();

    const getChildrenInStage = (min: number, max: number) => {
        // Handle case where children is undefined
        if (!children) return [];
        return children.filter(c => c.ageInMonths >= min && c.ageInMonths <= max);
    };

    // Helper to get initials
    const getInitials = (name: string) => name.charAt(0).toUpperCase();

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Family Learning Map</h1>
                    <p className="text-muted-foreground mt-2">
                        A guide to the developmental journey of your children, rooted in Wisdom, Stature, and Favor.
                        This map helps you see where each child is flourishing.
                    </p>
                </div>

                <Alert className="bg-primary/5 border-primary/20">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-primary/90 text-sm">
                        Consider these age ranges as "seasons" rather than deadlines. Every child grows in their own time,
                        like unique flowers in a garden. Use this map to identify readiness, not to rush growth.
                    </AlertDescription>
                </Alert>
            </div>

            <div className="grid gap-8">
                {SCOPE_SEQUENCE_DATA.map((domainData) => {
                    const Icon = domainIcons[domainData.domain];
                    return (
                        <Card key={domainData.domain} className="overflow-hidden border-none shadow-sm bg-muted/20">
                            <CardHeader className="bg-background border-b rounded-t-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <Icon className="w-6 h-6" weight="duotone" />
                                    </div>
                                    <div>
                                        <CardTitle className="capitalize text-xl">{DOMAIN_LABELS[domainData.domain]}</CardTitle>
                                        <CardDescription>Developmental milestones & formation</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="absolute left-8 top-6 bottom-6 w-0.5 bg-border/50" />

                                    <div className="space-y-0">
                                        {domainData.milestones.map((milestone, index) => {
                                            const activeChildren = getChildrenInStage(milestone.ageRangeMonths[0], milestone.ageRangeMonths[1]);
                                            const isCurrentStage = activeChildren.length > 0;

                                            return (
                                                <div key={milestone.id} className={`group relative flex gap-6 p-6 transition-colors ${isCurrentStage ? 'bg-background hover:bg-muted/30' : 'hover:bg-muted/10'}`}>
                                                    {/* Timeline Dot */}
                                                    <div className={`relative z-10 flex h-4 w-4 translate-y-1 rounded-full border-2 ${isCurrentStage ? 'border-primary bg-primary' : 'border-muted-foreground/30 bg-background'} transition-colors`} />

                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                            <div className="flex items-center gap-3">
                                                                <h4 className={`font-semibold ${isCurrentStage ? 'text-black dark:text-white' : 'text-muted-foreground'}`}>
                                                                    {milestone.title}
                                                                </h4>
                                                                {isCurrentStage && (
                                                                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0 h-5 text-[10px] px-2">
                                                                        current focus
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                                                {milestone.ageRangeMonths[0]}-{milestone.ageRangeMonths[1]} mos
                                                            </span>
                                                        </div>

                                                        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                                                            {milestone.description}
                                                        </p>

                                                        {/* Child Avatars for this stage */}
                                                        {activeChildren.length > 0 && (
                                                            <div className="pt-3 flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                                                <div className="text-xs text-primary font-medium mr-1">Current season for:</div>
                                                                <div className="flex -space-x-2">
                                                                    {activeChildren.map(child => (
                                                                        <TooltipProvider key={child.id}>
                                                                            <Tooltip>
                                                                                <TooltipTrigger>
                                                                                    <div className="h-8 w-8 rounded-full border-2 border-background bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold ring-2 ring-primary/20">
                                                                                        {getInitials(child.name)}
                                                                                    </div>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p>{child.name} ({child.ageInMonths} mo)</p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
