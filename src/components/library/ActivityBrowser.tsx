import { KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { activities as activitiesApi } from '@/lib/api';
import { EarlyYearsDomain, PrimaryVirtue, DOMAIN_TO_VIRTUE } from '@/types';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Clock, CaretRight, Brain, HandPalm, Heart, Shapes, Sparkle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useGuestViewTracker } from './GuestBanner';

const virtueConfigs: Record<PrimaryVirtue, { label: string; icon: any; color: string; bgColor: string; borderColor: string }> = {
    'Wisdom': {
        label: 'Wisdom',
        icon: Brain,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-900/10',
        borderColor: 'border-purple-200 dark:border-purple-800'
    },
    'Stewardship': {
        label: 'Stewardship',
        icon: HandPalm,
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/10',
        borderColor: 'border-emerald-200 dark:border-emerald-800'
    },
    'Love': {
        label: 'Love',
        icon: Heart,
        color: 'text-rose-600 dark:text-rose-400',
        bgColor: 'bg-rose-50 dark:bg-rose-900/10',
        borderColor: 'border-rose-200 dark:border-rose-800'
    },
    'Order': {
        label: 'Order',
        icon: Shapes,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/10',
        borderColor: 'border-amber-200 dark:border-amber-800'
    },
    'Wonder': {
        label: 'Wonder',
        icon: Sparkle,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/10',
        borderColor: 'border-blue-200 dark:border-blue-800'
    }
};

const VIRTUE_ORDER: PrimaryVirtue[] = [
    'Wisdom',
    'Stewardship',
    'Love',
    'Order',
    'Wonder'
];

interface ApiActivity {
    id: string;
    title: string;
    description: string;
    domain?: EarlyYearsDomain;
    primary_virtue?: PrimaryVirtue;
    formation_type?: string;
    duration_minutes: number;
    difficulty: number;
    materials: string[];
    instructions: string[];
    min_age_months: number;
    max_age_months: number;
}

export function ActivityBrowser() {
    const navigate = useNavigate();
    const { trackView } = useGuestViewTracker();
    
    const { data: activities = [], isLoading } = useQuery({
        queryKey: ['activities', 'all'],
        queryFn: () => activitiesApi.list(),
    });

    const handleActivityClick = (activityId: string) => {
        trackView(); // Track for guest conversion banner
        navigate(`/library/activities/${activityId}`);
    };

    const handleKeyDown = (e: KeyboardEvent, activityId: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleActivityClick(activityId);
        }
    };

    if (isLoading) {
        return <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
        </div>;
    }

    // Filter out liturgy and reading items - only show skill/habit activities
    const activityItems = activities.filter((activity: ApiActivity) => {
        const formationType = activity.formation_type || 'skill';
        return formationType === 'skill' || formationType === 'habit';
    });

    // Group activities by virtue (mapping legacy domains if needed)
    const groupedActivities = activityItems.reduce((acc, activity: ApiActivity) => {
        // Determine virtue: explicit or mapped from legacy domain
        const virtue: PrimaryVirtue =
            activity.primary_virtue ||
            (activity.domain ? DOMAIN_TO_VIRTUE[activity.domain as string] : undefined) ||
            'Wisdom';

        if (!acc[virtue]) acc[virtue] = [];
        acc[virtue].push(activity);
        return acc;
    }, {} as Record<PrimaryVirtue, ApiActivity[]>);

    // Sort activities by age within virtues
    Object.keys(groupedActivities).forEach((key) => {
        const virtue = key as PrimaryVirtue;
        groupedActivities[virtue].sort((a, b) => a.min_age_months - b.min_age_months);
    });

    return (
        <div className="space-y-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-muted-foreground">
                    Browse our complete collection of developmentally appropriate activities, categorized by virtue and ordered by age progression.
                </p>
            </div>

            <Accordion type="multiple" defaultValue={['Wisdom']} className="space-y-4">
                {VIRTUE_ORDER.map((virtue) => {
                    const config = virtueConfigs[virtue];
                    const domainActivities = groupedActivities[virtue] || [];

                    return (
                        <AccordionItem
                            key={virtue}
                            value={virtue}
                            className={cn(
                                "border rounded-xl overflow-hidden transition-all duration-200",
                                config.borderColor,
                                config.bgColor
                            )}
                        >
                            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-4 text-left">
                                    <div className={cn("p-2 rounded-lg bg-background shadow-sm ring-1 ring-black/5", config.color)}>
                                        <config.icon className="h-5 w-5" weight="duotone" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-lg leading-none">{config.label}</h3>
                                        <p className="text-sm text-muted-foreground font-normal">
                                            {domainActivities.length} activities
                                        </p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6 pt-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {domainActivities.map((activity) => (
                                        <Card
                                            key={activity.id}
                                            className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all group bg-background/80 hover:bg-background backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            onClick={() => handleActivityClick(activity.id)}
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`View activity: ${activity.title}`}
                                            onKeyDown={(e) => handleKeyDown(e, activity.id)}
                                        >
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <Badge variant="secondary" className="text-[10px] sm:text-xs">
                                                        {activity.min_age_months}-{activity.max_age_months} mo
                                                    </Badge>
                                                    <CaretRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>

                                                <div>
                                                    <h4 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                                        {activity.title}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                        {activity.description}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{activity.duration_minutes} min</span>
                                                    <span className="text-border">|</span>
                                                    <span className="capitalize">{activity.difficulty === 1 ? 'New' : activity.difficulty === 2 ? 'Practicing' : 'Mastering'}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {domainActivities.length === 0 && (
                                        <div className="col-span-full py-8 text-center text-muted-foreground">
                                            No activities found in this domain.
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
}
