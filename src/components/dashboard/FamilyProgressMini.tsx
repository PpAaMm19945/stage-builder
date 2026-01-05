import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { students } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CaretRight } from '@phosphor-icons/react';

export function FamilyProgressMini() {
    const navigate = useNavigate();
    const { data: studentsList, isLoading } = useQuery({
        queryKey: ['students'],
        queryFn: students.list,
    });

    if (isLoading) {
        return (
            <div className="mt-8 flex gap-4 justify-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-12 w-12 rounded-full" />
            </div>
        );
    }

    if (!studentsList || studentsList.length === 0) return null;

    const activeCount = studentsList.length; // Simply counting all for now

    return (
        <div
            className="mt-8 mb-8 cursor-pointer group"
            onClick={() => navigate('/early-years/progress')}
        >
            <div className="flex items-center justify-between px-1 mb-3">
                 <span className="text-sm font-medium text-muted-foreground">
                    {activeCount} {activeCount === 1 ? 'child' : 'children'} active this week
                </span>
                <div className="flex items-center text-xs text-primary font-medium group-hover:underline">
                    View Progress <CaretRight className="ml-1 w-3 h-3" />
                </div>
            </div>

            <Card className="border-none bg-gradient-to-r from-muted/50 to-muted/20 p-4 flex items-center gap-4 overflow-x-auto">
                {studentsList.map((student: any) => (
                    <div key={student.id} className="flex flex-col items-center gap-1 shrink-0">
                        <div className="relative p-0.5 rounded-full border-2 border-green-500/50">
                            <Avatar className="h-12 w-12 border-2 border-background">
                                <AvatarImage src={student.avatarUrl} />
                                <AvatarFallback>{student.name[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                        <span className="text-[10px] font-semibold text-muted-foreground">{student.name.split(' ')[0]}</span>
                    </div>
                ))}
            </Card>
        </div>
    );
}
