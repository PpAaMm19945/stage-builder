import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentView } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { FormationCard } from '@/components/formations/FormationCard';
import { AlumniView } from '@/components/dashboard/AlumniView';
import { StudentAiChat } from '@/components/ai/StudentAiChat';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CircleNotch, SignOut } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function StudentPortal() {
    const { user, signOut } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'tasks' | 'portfolio'>('tasks');

    // We assume the user.role is 'student' and user.studentId is present
    const studentId = user?.studentId;

    const { data, isLoading, error } = useQuery({
        queryKey: ['student-view', studentId],
        queryFn: () => studentView.get(studentId!),
        enabled: !!studentId,
    });

    const completeMutation = useMutation({
        mutationFn: (activityId: string) => studentView.markComplete(studentId!, activityId),
        onSuccess: () => {
            toast.success('Great job!');
            queryClient.invalidateQueries({ queryKey: ['student-view', studentId] });
        },
        onError: () => toast.error('Could not mark complete.')
    });

    if (!studentId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Student ID missing. Please log in again.</p>
                <Button onClick={signOut} variant="outline" className="ml-4">Sign Out</Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <CircleNotch className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-destructive">Failed to load student portal.</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }


    const { student, tasks, portfolioItems, permissions } = data;

    if (student.is_graduated) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
                <header className="bg-white dark:bg-slate-900 border-b sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {student.avatarUrl && (
                            <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full bg-slate-200" />
                        )}
                        <div>
                            <h1 className="font-display font-bold text-lg leading-tight">{student.name}</h1>
                            <p className="text-xs text-muted-foreground">Alumni Portal</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={signOut}>
                        <SignOut className="w-5 h-5" />
                    </Button>
                </header>
                <AlumniView student={student} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {student.avatarUrl && (
                        <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full bg-slate-200" />
                    )}
                    <div>
                        <h1 className="font-display font-bold text-lg leading-tight">{student.name}</h1>
                        <p className="text-xs text-muted-foreground">Student Portal</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={signOut}>
                    <SignOut className="w-5 h-5" />
                </Button>
            </header>

            {/* Main Content */}
            <main className="max-w-md mx-auto p-4 space-y-6">

                {/* Welcome / Status */}
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0">
                    <CardContent className="p-6">
                        <h2 className="text-2xl font-bold mb-2">
                            {tasks.length > 0 ? "Let's learn!" : "All done!"}
                        </h2>
                        <p className="text-indigo-100">
                            You have {tasks.length} item{tasks.length !== 1 ? 's' : ''} for today.
                        </p>
                    </CardContent>
                </Card>

                {/* Tasks List */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Today's List</h3>

                    {tasks.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>Nothing assigned right now.</p>
                        </div>
                    )}

                    {tasks.map(task => (
                        <FormationCard
                            key={task.id}
                            formation={task}
                            variant="full"
                            onComplete={permissions.canMarkComplete ? (id) => completeMutation.mutate(id) : undefined}
                        />
                    ))}
                </div>

            </main>

            {/* AI Chat - Only show if student has canAskAi permission */}
            {permissions.canAskAi && (
                <StudentAiChat
                    studentId={studentId}
                    currentSubject={tasks[0]?.cluster_tag || tasks[0]?.primary_virtue}
                />
            )}
        </div>
    );
}
