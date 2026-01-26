import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Lightning } from '@phosphor-icons/react';
import { OverrideManager } from '@/components/overrides/OverrideManager';
import { FormationSettings } from '@/components/settings/FormationSettings';
import { toast } from 'sonner';
import { formation, profile } from '@/lib/api';

export function SettingsCurriculum() {
    const [focus, setFocus] = useState<'balanced' | 'interests'>('balanced');
    const [goals, setGoals] = useState<string[]>([]);
    const [availableDays, setAvailableDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    const [lighterFridays, setLighterFridays] = useState(false);
    const [preferences, setPreferences] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            // Load Formation Preferences (Focus)
            const formationData = await formation.getPreferences();
            if (formationData && formationData.learningFocus) {
                setFocus(formationData.learningFocus as 'balanced' | 'interests');
            }

            // Load Family Profile (Goals, Schedule, Lighter Fridays)
            const profileData = await profile.get();
            if (profileData) {
                if (Array.isArray(profileData.goals)) setGoals(profileData.goals);
                if (Array.isArray(profileData.available_days)) setAvailableDays(profileData.available_days);

                // Load preferences object which contains lighterFridays
                const prefs = profileData.preferences || {};
                setPreferences(prefs);
                if (prefs.lighterFridays) setLighterFridays(prefs.lighterFridays);
            }

        } catch (e) {
            console.error('Failed to load settings', e);
        }
    };

    const updateFocus = async (newFocus: 'balanced' | 'interests') => {
        setFocus(newFocus);
        setIsLoading(true);
        try {
            const res = await formation.updatePreferences({
                learningFocus: newFocus
            });

            if (res.success) {
                toast.success('Planning strategy updated');
            } else {
                toast.error('Failed to update strategy');
            }
        } catch (e) {
            toast.error('Error saving settings');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleGoal = async (goal: string, checked: boolean) => {
        const newGoals = checked
            ? [...goals, goal]
            : goals.filter(g => g !== goal);

        setGoals(newGoals);
        try {
            await profile.updateGoals(newGoals);
        } catch (e) {
            toast.error('Failed to save goals');
            setGoals(goals); // Revert
        }
    };

    const toggleSundayRest = async (checked: boolean) => {
        // If checked (Rest ON), remove 'Sun'. If unchecked (Rest OFF), add 'Sun'.
        let newDays = [...availableDays];
        if (checked) {
            newDays = newDays.filter(d => d !== 'Sun');
        } else {
            if (!newDays.includes('Sun')) newDays.push('Sun');
        }

        setAvailableDays(newDays);
        try {
            await profile.update({ available_days: newDays });
            toast.success('Schedule updated');
        } catch (e) {
            toast.error('Failed to update schedule');
            setAvailableDays(availableDays); // Revert
        }
    };

    const toggleLighterFridays = async (checked: boolean) => {
        setLighterFridays(checked);
        const newPrefs = { ...preferences, lighterFridays: checked };
        setPreferences(newPrefs);

        try {
            await profile.update({ preferences: newPrefs });
            toast.success('Preferences updated');
        } catch (e) {
            toast.error('Failed to update preferences');
            setLighterFridays(!checked);
            setPreferences(preferences);
        }
    };

    const isSundayRest = !availableDays.includes('Sun');

    return (
        <div className="space-y-6">
            {/* Formation Preferences */}
            <FormationSettings />

            {/* Goals & Focus */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Lightning className="h-5 w-5" />
                        Goals & Focus
                    </CardTitle>
                    <CardDescription>
                        What are your primary formation goals this season?
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Primary Goals</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {['Westminster Catechism', 'Hymn Memorization', 'Scripture Memory', 'Habit Formation', 'Great Books'].map(goal => (
                                <div key={goal} className="flex items-start space-x-2 border p-3 rounded-md hover:bg-muted/50 transition-colors">
                                    <Checkbox
                                        id={`goal-${goal}`}
                                        checked={goals.includes(goal)}
                                        onCheckedChange={(checked) => toggleGoal(goal, checked as boolean)}
                                    />
                                    <div className="space-y-1">
                                        <Label htmlFor={`goal-${goal}`} className="text-sm font-medium leading-none cursor-pointer">
                                            {goal}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Prioritize {goal.toLowerCase()} activities.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <Label className="text-sm font-medium">Weekly Rhythm Preferences</Label>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Lighter Fridays</Label>
                                <p className="text-xs text-muted-foreground">Schedule fewer items on Fridays to ease into the weekend.</p>
                            </div>
                            <Switch
                                checked={lighterFridays}
                                onCheckedChange={toggleLighterFridays}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Sunday Rest</Label>
                                <p className="text-xs text-muted-foreground">Keep Sundays free of academic tasks.</p>
                            </div>
                            <Switch
                                checked={isSundayRest}
                                onCheckedChange={toggleSundayRest}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <div className="flex flex-col gap-2">
                            <Label className="text-sm font-medium">Planning Strategy</Label>
                            <RadioGroup
                                value={focus}
                                onValueChange={(val) => updateFocus(val as 'balanced' | 'interests')}
                                className="flex gap-2"
                            >
                                <div className={cn("flex items-center space-x-2 border p-3 rounded-lg flex-1 hover:bg-muted/50 transition-colors", focus === 'balanced' && "bg-muted border-primary")}>
                                    <RadioGroupItem value="balanced" id="focus-balanced" />
                                    <Label htmlFor="focus-balanced" className="flex-1 cursor-pointer">
                                        <div className="font-medium">Balanced</div>
                                        <div className="text-xs text-muted-foreground">Equal coverage of all domains</div>
                                    </Label>
                                </div>
                                <div className={cn("flex items-center space-x-2 border p-3 rounded-lg flex-1 hover:bg-muted/50 transition-colors", focus === 'interests' && "bg-muted border-primary")}>
                                    <RadioGroupItem value="interests" id="focus-interests" />
                                    <Label htmlFor="focus-interests" className="flex-1 cursor-pointer">
                                        <div className="font-medium">Follow Interests</div>
                                        <div className="text-xs text-muted-foreground">More weight on passion areas</div>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Learning Accommodations */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Lightning className="h-5 w-5" />
                        Learning Accommodations
                    </CardTitle>
                    <CardDescription>
                        Set global preferences for how activities are presented (e.g., "Screen-Free", "Low Prep")
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <OverrideManager />
                </CardContent>
            </Card>
        </div>
    );
}
