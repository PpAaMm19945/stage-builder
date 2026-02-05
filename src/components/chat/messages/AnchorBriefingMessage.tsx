
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
    Sun,
    BookOpen,
    HandsPraying,
    MusicNotes,
    Scroll,
    CaretDown,
    CaretUp,
    Sparkle,
    Check,
    PencilSimple
} from '@phosphor-icons/react';
import { AnchorPayload } from '@/types/ChatTypes';
import { cn } from '@/lib/utils';

interface AnchorBriefingMessageProps {
    data: AnchorPayload;
    onLooksGood?: () => void;
    onAdjust?: () => void;
}

export function AnchorBriefingMessage({ data, onLooksGood, onAdjust }: AnchorBriefingMessageProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Helper to render liturgy items if they exist
    const renderLiturgyItem = (
        icon: React.ReactNode,
        label: string,
        item?: { title: string; content?: string; reference?: string }
    ) => {
        if (!item) return null;
        return (
            <div className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 text-primary/70 shrink-0">{icon}</div>
                <div className="flex-1">
                    <span className="font-medium text-foreground/80">{label}: </span>
                    <span className="text-foreground">{item.title}</span>
                    {item.reference && (
                        <span className="text-muted-foreground ml-1">({item.reference})</span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Card className="w-full max-w-md border-primary/20 bg-primary/5 shadow-sm overflow-hidden">
            {/* Header */}
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-3 pt-4 border-b border-primary/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sun className="w-5 h-5 text-amber-500 fill-amber-500" weight="fill" />
                        <CardTitle className="text-base font-semibold text-primary/90">
                            Morning Briefing
                        </CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs font-normal border-primary/20 text-primary/80 bg-background/50">
                        Day {data.dayOfSequence} of {data.totalDays}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 font-medium">
                    {data.theme}
                </p>
            </CardHeader>

            <CardContent className="p-4 space-y-5">

                {/* Liturgy Section */}
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <HandsPraying className="w-3.5 h-3.5" />
                        Morning Liturgy
                    </h4>
                    <div className="space-y-2.5 bg-background/40 p-3 rounded-lg border border-border/40">
                        {renderLiturgyItem(<MusicNotes className="w-4 h-4" />, "Hymn", data.liturgy.hymn)}
                        {renderLiturgyItem(<Scroll className="w-4 h-4" />, "Proverb", data.liturgy.scripture)}
                        {renderLiturgyItem(<BookOpen className="w-4 h-4" />, "Catechism", data.liturgy.catechism)}
                    </div>
                </div>

                <Separator className="bg-primary/10" />

                {/* Activity Section */}
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkle className="w-3.5 h-3.5" />
                        Family Activity
                    </h4>

                    <div className="space-y-2">
                        <div className="font-medium text-sm text-foreground">
                            {data.activity.title}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {data.activity.description}
                        </p>

                        {/* Materials */}
                        {data.activity.materials.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {data.activity.materials.map((m, i) => (
                                    <Badge key={i} variant="secondary" className="text-[10px] px-1.5 h-5 bg-background/60 text-muted-foreground border-border/40 font-normal">
                                        {m}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Child Roles */}
                        {data.activity.roles.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {data.activity.roles.map((role, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs bg-background/30 p-1.5 rounded border border-border/30">
                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[9px]">
                                            {role.childName.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground/90">{role.childName}</span>
                                            <span className="text-[10px] text-muted-foreground">{role.role}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Reasoning Collapsible */}
                {data.reasoning && (
                    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between h-8 px-2 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 mt-2"
                            >
                                <span className="flex items-center gap-1.5">
                                    <Sparkle className="w-3.5 h-3.5" />
                                    Why this plan? (AI Insight)
                                </span>
                                {isOpen ? <CaretUp className="w-3.5 h-3.5" /> : <CaretDown className="w-3.5 h-3.5" />}
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="mt-2 p-3 text-xs leading-relaxed text-muted-foreground bg-amber-50/50 dark:bg-amber-900/10 rounded-md border border-amber-100/50 dark:border-amber-900/20">
                                {data.reasoning}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </CardContent>

            <CardFooter className="p-3 bg-background/30 border-t border-primary/10 flex gap-2">
                <Button
                    variant="ghost"
                    className="flex-1 h-9 text-xs sm:text-sm hover:bg-destructive/10 hover:text-destructive"
                    onClick={onAdjust}
                >
                    <PencilSimple className="w-4 h-4 mr-1.5" />
                    Adjust
                </Button>
                <Button
                    variant="default"
                    className="flex-1 h-9 text-xs sm:text-sm shadow-sm"
                    onClick={onLooksGood}
                >
                    <Check className="w-4 h-4 mr-1.5" />
                    Looks Good
                </Button>
            </CardFooter>
        </Card>
    );
}
