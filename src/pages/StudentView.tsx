import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { studentView } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    CircleNotch,
    CheckCircle,
    Circle,
    ArrowLeft,
    Image,
    Star,
    Clock,
} from '@phosphor-icons/react';
import { ChildExplainButton } from '@/components/ai/ChildExplainButton';
import { toast } from 'sonner';
import type { StudentViewData, ApiActivity, PortfolioItem } from '@/types';

function TaskCard({
    activity,
    canMarkComplete,
    canAskAi,
    studentId,
    onComplete,
    isCompleting,
}: {
    activity: ApiActivity;
    canMarkComplete: boolean;
    canAskAi: boolean;
    studentId: string;
    onComplete: (activityId: string) => void;
    isCompleting: boolean;
}) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg">{activity.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {activity.description}
                        </p>
                        {activity.duration_minutes && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>About {activity.duration_minutes} minutes</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                        {canMarkComplete && (
                            <Button
                                size="sm"
                                onClick={() => onComplete(activity.id)}
                                disabled={isCompleting}
                                className="gap-2"
                            >
                                {isCompleting ? (
                                    <CircleNotch className="w-4 h-4 animate-spin" />
                                ) : (
                                    <CheckCircle className="w-4 h-4" />
                                )}
                                Done!
                            </Button>
                        )}
                    </div>
                </div>

                {/* AI Help button */}
                {canAskAi && (
                    <div className="mt-4 pt-4 border-t">
                        <ChildExplainButton
                            studentId={studentId}
                            activityId={activity.id}
                            activityTitle={activity.title}
                            domain={activity.domain}
                            canAskAi={canAskAi}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function PortfolioPreview({ items }: { items: PortfolioItem[] }) {
    if (items.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Image className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No portfolio items yet</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.slice(0, 6).map((item) => (
                <div
                    key={item.id}
                    className="aspect-square rounded-lg border bg-muted/30 overflow-hidden relative group"
                >
                    {item.itemType === 'image' && item.publicUrl ? (
                        <img
                            src={item.publicUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Image className="w-8 h-8 text-muted-foreground" />
                        </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-white text-xs font-medium truncate">{item.title}</p>
                    </div>
                    {item.milestoneTag && (
                        <Badge className="absolute top-2 right-2 text-xs" variant="secondary">
                            <Star className="w-3 h-3 mr-1" />
                            {item.milestoneTag}
                        </Badge>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function StudentView() {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['student-view', studentId],
        queryFn: () => studentView.get(studentId!),
        enabled: !!studentId,
    });

    const completeMutation = useMutation({
        mutationFn: (activityId: string) =>
            studentView.markComplete(studentId!, activityId),
        onSuccess: () => {
            toast.success('Great job! Task marked as done!');
            refetch();
        },
        onError: (error: any) => {
            if (error.message?.includes('Permission denied')) {
                toast.error("You can't mark this complete", {
                    description: "Ask your parent for help",
                });
            } else {
                toast.error("Something went wrong");
            }
        },
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <CircleNotch className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading your tasks...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-destructive text-lg">Something went wrong</p>
                <Button variant="outline" onClick={() => navigate('/')}>
                    Go Back
                </Button>
            </div>
        );
    }

    const { student, tasks, portfolioItems, permissions } = data;

    const getInitials = (name: string) =>
        name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

    return (
        <div className="max-w-2xl mx-auto pb-20 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/')}
                    className="shrink-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {getInitials(student.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold">{student.name}'s Tasks</h1>
                        <p className="text-sm text-muted-foreground">
                            {new Date().toLocaleDateString(undefined, {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tasks */}
            <section>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Circle className="w-5 h-5 text-primary" />
                    Today's Tasks
                </h2>
                {tasks.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500" />
                            <p className="font-medium">No tasks for today!</p>
                            <p className="text-sm">Enjoy your free time!</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {tasks.map((task: ApiActivity) => (
                            <TaskCard
                                key={task.id}
                                activity={task}
                                canMarkComplete={permissions.canMarkComplete}
                                canAskAi={permissions.canAskAi}
                                studentId={student.id}
                                onComplete={(id) => completeMutation.mutate(id)}
                                isCompleting={completeMutation.isPending}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Portfolio Preview */}
            {permissions.canViewPortfolio && (
                <section>
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Image className="w-5 h-5 text-primary" />
                        My Work
                    </h2>
                    <Card>
                        <CardContent className="p-4">
                            <PortfolioPreview items={portfolioItems} />
                        </CardContent>
                    </Card>
                </section>
            )}
        </div>
    );
}
