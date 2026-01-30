import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { students } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CaretRight, BookOpen, MusicNotes, Compass } from '@phosphor-icons/react';

interface FamilyProgressMiniProps {
    activePaths?: any[];
}

export function FamilyProgressMini({ activePaths = [] }: FamilyProgressMiniProps) {
    const { data: studentsList, isLoading } = useQuery({
        queryKey: ['students'],
        queryFn: students.list,
    });

    if (isLoading) return null;

    return (
        <div className="mt-8 mb-8 space-y-4">
            {/* 1. The Children (Avatars) */}
            <div className="flex items-center justify-center gap-4">
                {studentsList?.map((student: any) => (
                    <div key={student.id} className="flex flex-col items-center gap-1 shrink-0">
                        <div className="relative p-0.5 rounded-full border-2 border-border">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={student.avatarUrl} alt={student.name} />
                                <AvatarFallback>{student.name[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. The Basket Contents (Subtle Progress) */}
            {activePaths.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {activePaths.map((path: any) => (
                        <div key={path.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/30 text-xs text-muted-foreground border border-border/50">
                            {path.path_type === 'hymn' && <MusicNotes className="w-3.5 h-3.5" />}
                            {path.path_type === 'catechism' && <BookOpen className="w-3.5 h-3.5" />}
                            {path.path_type === 'habit' && <Compass className="w-3.5 h-3.5" />}
                            <span className="font-medium">{path.title || path.path_type}</span>
                            <span className="opacity-50 ml-1">
                                {path.subscription?.current_position}/{path.total_items}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <div className="text-center">
                <Link
                    to="/early-years/progress"
                    className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
                >
                    View Full Portfolio <CaretRight className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );
}
