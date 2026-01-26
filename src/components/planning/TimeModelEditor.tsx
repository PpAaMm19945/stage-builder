import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeModel } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
    Clock,
    CalendarCheck,
    FloppyDisk,
    CircleNotch
} from '@phosphor-icons/react';
import { WeeklyTimeModel, DayOfWeek } from '@/types';

const DAYS: { id: DayOfWeek; label: string }[] = [
    { id: 'Mon', label: 'Monday' },
    { id: 'Tue', label: 'Tuesday' },
    { id: 'Wed', label: 'Wednesday' },
    { id: 'Thu', label: 'Thursday' },
    { id: 'Fri', label: 'Friday' },
    { id: 'Sat', label: 'Saturday' },
    { id: 'Sun', label: 'Sunday' }
];

export function TimeModelEditor() {
    const queryClient = useQueryClient();
    const [model, setModel] = useState<Partial<WeeklyTimeModel>>({
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        minutesPerDay: 45,
        maxSessionsPerDay: 4,
        preferredTimes: ['morning'],
        fieldTripDays: []
    });

    const { data: serverModel, isLoading } = useQuery({
        queryKey: ['time-model'],
        queryFn: timeModel.get,
    });

    useEffect(() => {
        if (serverModel) {
            setModel(serverModel);
        }
    }, [serverModel]);

    const updateMutation = useMutation({
        mutationFn: timeModel.update,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['time-model'] });
            queryClient.invalidateQueries({ queryKey: ['weekly-plan'] }); // Invalidate computed plans
            toast.success('Schedule updated', { description: 'Weekly plan will be regenerated.' });
        },
        onError: (err: any) => {
            toast.error('Failed to save schedule', { description: err.message });
        }
    });

    const handleDayToggle = (day: DayOfWeek) => {
        const current = model.availableDays || [];
        const updated = current.includes(day)
            ? current.filter(d => d !== day)
            : [...current, day];
        setModel(prev => ({ ...prev, availableDays: updated }));
    };

    if (isLoading) {
        return <div className="py-8 text-center text-muted-foreground">Loading schedule settings...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Days of Week */}
                <div className="space-y-3">
                    <Label className="text-base">School Days</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {DAYS.map(day => (
                            <label
                                key={day.id}
                                htmlFor={`day-${day.id}`}
                                className={`
                  flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors
                  ${model.availableDays?.includes(day.id) ? 'bg-primary/10 border-primary/30' : 'bg-muted/30'}
                `}
                            >
                                <Checkbox
                                    id={`day-${day.id}`}
                                    checked={model.availableDays?.includes(day.id)}
                                    onCheckedChange={() => handleDayToggle(day.id)}
                                />
                                <span className="text-sm font-medium">{day.label}</span>
                            </label>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Select days you want activities scheduled.</p>
                </div>

                {/* Time Intensity */}
                <div className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base">Time per Day</Label>
                            <Badge variant="secondary">{model.minutesPerDay} mins</Badge>
                        </div>
                        <Slider
                            value={[model.minutesPerDay || 45]}
                            onValueChange={(val) => setModel(prev => ({ ...prev, minutesPerDay: val[0] }))}
                            min={15}
                            max={180}
                            step={15}
                            className="py-4"
                            aria-label="Time per day"
                        />
                        <p className="text-xs text-muted-foreground">Approximate total time for all activities combined.</p>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-base">Max Sessions</Label>
                            <Badge variant="secondary">{model.maxSessionsPerDay} blocks</Badge>
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5, 6].map(num => (
                                <Button
                                    key={num}
                                    size="sm"
                                    variant={model.maxSessionsPerDay === num ? 'default' : 'outline'}
                                    onClick={() => setModel(prev => ({ ...prev, maxSessionsPerDay: num }))}
                                    className="h-8 w-8 p-0"
                                    aria-pressed={model.maxSessionsPerDay === num}
                                >
                                    {num}
                                </Button>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Maximum distinct activity blocks per day.</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => updateMutation.mutate(model)} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                        <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <FloppyDisk className="w-4 h-4 mr-2" />
                    )}
                    Save Schedule
                </Button>
            </div>
        </div>
    );
}
