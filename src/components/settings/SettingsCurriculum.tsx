import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChatTeardropText, Sparkle, TreeStructure, CircleNotch } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { students } from '@/lib/api';
import { StudentRecord } from '@/types/api-responses';

export function SettingsCurriculum() {
    const { data: children, isLoading } = useQuery<StudentRecord[]>({
        queryKey: ['students'],
        queryFn: students.list,
    });

    return (
        <div className="space-y-6">
            {/* Progress Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <TreeStructure className="h-5 w-5" />
                        Learning Progress
                    </CardTitle>
                    <CardDescription>
                        Each child's current stage in the curriculum.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-6">
                            <CircleNotch className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : children && children.length > 0 ? (
                        <div className="space-y-3">
                            {children.map((child: any) => {
                                const name = child.name || child.first_name || 'Child';
                                const stage = child.currentStage || child.current_stage || 'seedling';
                                const ageMonths = child.ageInMonths || child.age_in_months;
                                const ageLabel = ageMonths
                                    ? ageMonths >= 24
                                        ? `${Math.floor(ageMonths / 12)} years`
                                        : `${ageMonths} months`
                                    : null;

                                const stageLabels: Record<string, string> = {
                                    'seedling': '🌱 Seedling (0–2 yrs)',
                                    'sprout': '🌿 Sprout (2–4 yrs)',
                                    'sapling': '🌳 Sapling (4–7 yrs)',
                                    'tree': '🌲 Tree (7+ yrs)',
                                    'early-years': '🌱 Early Years',
                                };

                                return (
                                    <div key={child.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                        <div>
                                            <p className="text-sm font-medium">{name}</p>
                                            {ageLabel && (
                                                <p className="text-xs text-muted-foreground">{ageLabel}</p>
                                            )}
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {stageLabels[stage] || stage}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Add children in the Family tab to see their progress here.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Conversational Preferences */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-100 dark:border-indigo-900/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-indigo-900 dark:text-indigo-100">
                        <Sparkle className="h-5 w-5 text-indigo-500" weight="fill" />
                        Adjusting Preferences
                    </CardTitle>
                    <CardDescription className="text-indigo-700/80 dark:text-indigo-300/80">
                        Your Daily Guide adapts to what you tell it
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed font-medium">
                        Just tell your Guide things like:
                    </p>
                    <div className="space-y-3 pl-2">
                        {[
                            "We're taking a break from hymns this week.",
                            "Focus more on motor skills for James.",
                            "Keep Fridays light."
                        ].map((example, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="mt-0.5 p-1.5 bg-white dark:bg-indigo-900/50 rounded-full shadow-sm shrink-0">
                                    <ChatTeardropText className="h-4 w-4 text-indigo-500" />
                                </div>
                                <p className="text-sm italic text-muted-foreground pt-1">"{example}"</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
