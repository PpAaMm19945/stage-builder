import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeModel } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
    FloppyDisk,
    CircleNotch,
    Sun,
    Moon
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
    const [model, setModel] = useState<Partial<WeeklyTimeModel> & { eveningMinutes?: number }>({
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        minutesPerDay: 45, // Morning Minutes
        eveningMinutes: 0,
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
            setModel({
                ...serverModel,
                eveningMinutes: (serverModel as any).eveningMinutes || 0
            });
        }
    }, [serverModel]);

    const updateMutation = useMutation({
        mutationFn: (data: any) => timeModel.update(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['time-model'] });
            queryClient.invalidateQueries({ queryKey: ['weekly-plan'] });
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
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Days of Week */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <Label className="text-base font-semibold">School Days</Label>
                        <p className="text-sm text-muted-foreground">Select days you want activities scheduled.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {DAYS.map(day => (
                            <label
                                key={day.id}
                                htmlFor={`day-${day.id}`}
                                className={`
                  flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all hover:border-primary/50
                  ${model.availableDays?.includes(day.id) ? 'bg-primary/5 border-primary text-primary' : 'bg-background border-dashed'}
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
                </div>

                {/* Time Intensity */}
                <div className="space-y-6">
                    <div className="space-y-1">
                        <Label className="text-base font-semibold">Daily Frequency</Label>
                        <p className="text-sm text-muted-foreground">How much time per day?</p>
                    </div>

                    {/* Morning Slider */}
                    <div className="space-y-4 p-4 rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sun className="w-5 h-5 text-orange-500" weight="fill" />
                                <Label className="text-sm font-medium">Morning Session</Label>
                            </div>
                            <Badge variant="secondary" className="bg-background">{model.minutesPerDay} mins</Badge>
                        </div>
                        <Slider
                            value={[model.minutesPerDay || 45]}
                            onValueChange={(val) => setModel(prev => ({ ...prev, minutesPerDay: val[0] }))}
                            min={15}
                            max={180}
                            step={15}
                            className="py-2"
                        />
                    </div>

                    {/* Evening Slider */}
                    <div className="space-y-4 p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Moon className="w-5 h-5 text-indigo-500" weight="fill" />
                                <Label className="text-sm font-medium">Evening Session</Label>
                            </div>
                            <Badge variant="secondary" className="bg-background">{model.eveningMinutes || 0} mins</Badge>
                        </div>
                        <Slider
                            value={[model.eveningMinutes || 0]}
                            onValueChange={(val) => setModel(prev => ({ ...prev, eveningMinutes: val[0] }))}
                            min={0}
                            max={120}
                            step={15}
                            className="py-2"
                        />
                        <p className="text-xs text-muted-foreground">Optional: For family reading, history, or bedtime routines.</p>
                    </div>

                    {/* Max Sessions */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Max Limit (Blocks per Day)</Label>
                            <span className="text-xs text-muted-foreground">{model.maxSessionsPerDay} blocks</span>
                        </div>
                        <div className="flex gap-2">
                            {[2, 3, 4, 5, 6].map(num => (
                                <Button
                                    key={num}
                                    size="sm"
                                    variant={model.maxSessionsPerDay === num ? 'default' : 'outline'}
                                    onClick={() => setModel(prev => ({ ...prev, maxSessionsPerDay: num }))}
                                    className="h-8 w-8 p-0"
                                >
                                    {num}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => updateMutation.mutate(model)} disabled={updateMutation.isPending} size="lg">
                    {updateMutation.isPending ? (
                        <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <FloppyDisk className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
