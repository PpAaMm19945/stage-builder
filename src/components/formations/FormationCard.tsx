import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent
} from '@/components/ui/collapsible';
import {
    Lightning,
    BookOpen,
    Moon,
    CheckSquare,
    CaretDown,
    CaretUp,
    Clock,
    BookBookmark,
    MusicNotes,
    Scroll,
    Hourglass,
    HandFist
} from '@phosphor-icons/react';
import { Formation, FormationType } from '@/types';

// Extended type to support 'reading' if not yet in core types
type ExtendedFormationType = FormationType | 'reading';

interface FormationCardProps {
    formation: Formation;
    onComplete?: (id: string, isCompleted: boolean) => void;
    isCompleted?: boolean;
    variant?: 'full' | 'compact';
    className?: string;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
    skill: Lightning,
    liturgy: BookBookmark, // Default for generic liturgy
    reading: BookOpen,
    habit: CheckSquare,
    rest: Moon,
    service: HandFist,
    // Specific liturgy types if they leak into formation_type
    catechism: BookBookmark,
    hymn: MusicNotes,
    scripture: Scroll,
    history: Hourglass
};

const TYPE_COLORS: Record<string, string> = {
    skill: 'text-amber-600 dark:text-amber-400',
    liturgy: 'text-amber-700 dark:text-amber-300',
    reading: 'text-sky-600 dark:text-sky-400',
    habit: 'text-emerald-600 dark:text-emerald-400',
    rest: 'text-indigo-600 dark:text-indigo-400',
    service: 'text-rose-600 dark:text-rose-400'
};

const CARD_BORDERS: Record<string, string> = {
    skill: 'border-amber-200 dark:border-amber-800',
    liturgy: 'border-amber-200 dark:border-amber-800',
    reading: 'border-sky-200 dark:border-sky-800',
    habit: 'border-emerald-200 dark:border-emerald-800',
    rest: 'border-indigo-200 dark:border-indigo-800',
    service: 'border-rose-200 dark:border-rose-800'
};

export function FormationCard({
    formation,
    onComplete,
    isCompleted = false,
    variant = 'full',
    className
}: FormationCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Cast type to include reading
    const type = formation.formation_type as ExtendedFormationType;
    const Icon = TYPE_ICONS[type] || Lightning;
    const iconColor = TYPE_COLORS[type] || 'text-slate-600';
    const borderColor = CARD_BORDERS[type] || 'border-slate-200';

    const handleToggle = () => {
        if (onComplete) {
            onComplete(formation.id, !isCompleted);
        }
    };

    return (
        <Card
            className={cn(
                "transition-all duration-200",
                borderColor,
                isCompleted ? "opacity-75 bg-slate-50 dark:bg-slate-900/50" : "bg-white dark:bg-slate-950",
                className
            )}
        >
            <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-3">
                    {/* Main Visual & Title */}
                    <div className="flex items-start gap-3 flex-1">
                        <div className={cn("p-2 rounded-lg bg-opacity-10 shrink-0 mt-0.5", iconColor.replace('text-', 'bg-'))}>
                            <Icon weight="duotone" className={cn("w-5 h-5", iconColor)} />
                        </div>

                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className={cn(
                                    "font-medium leading-tight",
                                    isCompleted && "line-through text-muted-foreground"
                                )}>
                                    {formation.title}
                                </h3>
                                {type === 'skill' && formation.duration_minutes && (
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 gap-1 font-normal text-muted-foreground">
                                        <Clock size={12} />
                                        {formation.duration_minutes}m
                                    </Badge>
                                )}
                            </div>

                            {/* Context Anchor / Tagline */}
                            {formation.context_anchor && (
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                                    {formation.context_anchor.replace(/_/g, ' ')}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="flex items-center gap-2 shrink-0">
                        {onComplete && (
                            <Checkbox
                                checked={isCompleted}
                                onCheckedChange={handleToggle}
                                className={cn(
                                    "h-5 w-5 transition-colors",
                                    isCompleted ? "data-[state=checked]:bg-green-600 border-green-600" : ""
                                )}
                            />
                        )}

                        {variant === 'full' && (
                            <CollapsibleTrigger asChild onClick={() => setIsOpen(!isOpen)}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground">
                                    {isOpen ? <CaretUp size={16} /> : <CaretDown size={16} />}
                                </Button>
                            </CollapsibleTrigger>
                        )}
                    </div>
                </div>
            </CardHeader>

            {/* Expandable Content based on Type */}
            <Collapsible open={isOpen || variant === 'full' && type === 'reading'} onOpenChange={setIsOpen}>
                <CollapsibleContent className="p-4 pt-0 text-sm space-y-4 animate-slide-down">

                    {/* DESCRIPTION */}
                    {formation.description && (
                        <p className="text-muted-foreground pt-2">{formation.description}</p>
                    )}

                    {/* LITURGY VIEW */}
                    {type === 'liturgy' && formation.liturgical_script && (
                        <div className="pl-4 border-l-2 border-amber-200 dark:border-amber-800 italic text-muted-foreground my-3">
                            "{formation.liturgical_script}"
                        </div>
                    )}

                    {/* SKILL VIEW: STEPS & MATERIALS */}
                    {type === 'skill' && (
                        <div className="space-y-3 pt-2">
                            {formation.materials && formation.materials.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formation.materials.map((mat, i) => (
                                        <Badge key={i} variant="outline" className="text-xs bg-slate-50 dark:bg-slate-900">
                                            {mat}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {formation.guide_steps && formation.guide_steps.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase text-muted-foreground">Steps</p>
                                    <ul className="space-y-2">
                                        {formation.guide_steps.map((step, idx) => (
                                            <li key={idx} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                <span className="font-mono text-xs text-muted-foreground select-none pt-0.5">{idx + 1}.</span>
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* READING VIEW */}
                    {type === 'reading' && (
                        // @ts-ignore - Assuming formation extendedProps might have reading fields for now, or leveraging description
                        <div className="flex gap-4 pt-2">
                            {/* Fallback Reading Visual or actual cover if mapped */}
                            <div className="w-16 h-24 bg-sky-100 dark:bg-sky-900/30 rounded flex items-center justify-center shrink-0">
                                <BookOpen size={24} className="text-sky-300" weight="duotone" />
                            </div>
                            <div>
                                {/* In a real scenario, we'd map specialized fields here */}
                                <p className="text-sm text-muted-foreground italic">
                                    {formation.description || "Read specifically for this formation."}
                                </p>
                            </div>
                        </div>
                    )}

                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
