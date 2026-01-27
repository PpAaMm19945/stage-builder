
import { Card, CardContent } from "@/components/ui/card";
import { CalendarCheck, Basket, ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface Activity {
    title: string;
    type: string;
    time_of_day: string;
}

interface DayPlan {
    day_name: string;
    activities: Activity[];
}

interface PlanProposalProps {
    type: string;
    data: {
        focus: string;
        days: DayPlan[];
        materials: string[];
    };
}

export function PlanProposalCard({ type, data }: PlanProposalProps) {
    if (type !== 'PLAN_PROPOSAL') return null;

    return (
        <div className="w-full max-w-[90%] space-y-3 my-2">
            <div className="flex items-center justify-between">
                <div className="text-xs font-medium uppercase tracking-wider flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-fit">
                    <CalendarCheck className="w-5 h-5" />
                    Weekly Plan Proposal
                </div>
            </div>

            <Card className="overflow-hidden border-indigo-100 shadow-sm">
                <div className="bg-indigo-50/50 p-3 border-b border-indigo-100">
                    <h4 className="font-semibold text-indigo-900">Focus: {data.focus}</h4>
                </div>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        {data.days.slice(0, 3).map((day, i) => ( // Show first 3 days only in preview
                            <div key={i} className="p-3 flex gap-3">
                                <div className="w-12 shrink-0 font-medium text-slate-500 uppercase text-xs pt-1">{day.day_name.slice(0, 3)}</div>
                                <div className="space-y-1">
                                    {day.activities.map((act, j) => (
                                        <div key={j} className="text-sm flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                            {act.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {data.days.length > 3 && (
                            <div className="p-2 text-center text-xs text-muted-foreground bg-slate-50">
                                + {data.days.length - 3} more days
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {data.materials.length > 0 && (
                <Card className="overflow-hidden border-emerald-100 shadow-sm">
                    <div className="bg-emerald-50/50 p-2 border-b border-emerald-100 flex items-center gap-2 text-emerald-800 text-sm font-medium">
                        <Basket className="w-4 h-4" />
                        Required Materials
                    </div>
                    <CardContent className="p-3">
                        <div className="flex flex-wrap gap-2">
                            {data.materials.map((mat, i) => (
                                <span key={i} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-md shadow-sm">
                                    {mat}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex gap-2">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                    Implement Plan
                </Button>
            </div>
        </div>
    );
}
