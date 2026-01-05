import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { weeklyPlan as weeklyPlanApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Circle, CaretRight } from '@phosphor-icons/react';

export function MomentumRings() {
    const navigate = useNavigate();
    const { data: planData, isLoading } = useQuery({
        queryKey: ['family-weekly-plan'],
        queryFn: () => weeklyPlanApi.get(),
    });

    if (isLoading) {
        return (
            <Card className="mt-8 border-none bg-muted/20 shadow-none">
                <CardContent className="flex items-center justify-between p-4">
                    <div className="flex gap-2">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-8 w-8 rounded-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const slots = planData?.plan?.slots || [];

    const rings = days.map(day => {
        const hasActivities = slots.some((s: any) => s.day === day && s.activityId);
        return {
            day,
            status: hasActivities ? 'planned' : 'empty'
        };
    });

    return (
        <div
            className="mt-6 mb-12 cursor-pointer group"
            onClick={() => navigate('/early-years/progress')}
        >
            <div className="flex items-center justify-between px-4 py-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Weekly Momentum</h3>
                <div className="flex items-center text-xs text-primary font-medium group-hover:underline">
                    View Progress <CaretRight className="ml-1 w-3 h-3" />
                </div>
            </div>
            <Card className="border-none bg-gradient-to-r from-muted/30 to-muted/10 shadow-sm group-hover:shadow-md transition-all">
                <CardContent className="flex items-center justify-between p-6">
                    <div className="flex gap-3 sm:gap-6 mx-auto">
                        {rings.map((ring, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2">
                                <div className={cn(
                                    "h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center border-2 transition-all",
                                    ring.status === 'planned'
                                        ? "border-primary text-primary bg-primary/10"
                                        : "border-muted text-muted-foreground bg-muted/20"
                                )}>
                                    {ring.status === 'planned' ? (
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                    ) : (
                                        <Circle className="w-2 h-2" weight="fill" />
                                    )}
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{ring.day}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
