import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Lightning } from '@phosphor-icons/react';
import { OverrideManager } from '@/components/overrides/OverrideManager';
import { FormationSettings } from '@/components/settings/FormationSettings';
// import { LiturgySettings } from '@/components/liturgy/LiturgySettings';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formation } from '@/lib/api';

export function SettingsCurriculum() {
    const [focus, setFocus] = useState<'balanced' | 'interests'>('balanced');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const data = await formation.getPreferences();
            if (data && data.learningFocus) {
                setFocus(data.learningFocus as 'balanced' | 'interests');
            }
        } catch (e) {
            console.error('Failed to load focus settings', e);
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

    return (
        <div className="space-y-6">
            {/* Formation Preferences */}
            <FormationSettings />

            {/* Daily Liturgy Settings */}
            {/* <LiturgySettings /> */}

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
                        <label className="text-sm font-medium">Primary Goals</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {['Westminster Catechism', 'Hymn Memorization', 'Scripture Memory', 'Habit Formation', 'Great Books'].map(goal => (
                                <div key={goal} className="flex items-start space-x-2 border p-3 rounded-md hover:bg-muted/50 transition-colors">
                                    <Checkbox id={`goal-${goal}`} />
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
                        <label className="text-sm font-medium">Weekly Rhythm Preferences</label>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Lighter Fridays</Label>
                                <p className="text-xs text-muted-foreground">Schedule fewer items on Fridays to ease into the weekend.</p>
                            </div>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Sunday Rest</Label>
                                <p className="text-xs text-muted-foreground">Keep Sundays free of academic tasks.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Planning Strategy</label>
                            <div className="flex gap-2">
                                <div
                                    className={`flex items-center gap-2 border p-3 rounded-lg flex-1 cursor-pointer transition-colors ${focus === 'balanced' ? 'bg-muted border-primary' : 'hover:bg-muted/50'}`}
                                    onClick={() => updateFocus('balanced')}
                                >
                                    <div className={`h-4 w-4 rounded-full border border-primary flex items-center justify-center ${focus === 'balanced' ? 'bg-primary' : ''}`}>
                                        {focus === 'balanced' && <div className="h-2 w-2 rounded-full bg-white" />}
                                    </div>
                                    <div>
                                        <div className="font-medium">Balanced</div>
                                        <div className="text-xs text-muted-foreground">Equal coverage of all domains</div>
                                    </div>
                                </div>
                                <div
                                    className={`flex items-center gap-2 border p-3 rounded-lg flex-1 cursor-pointer transition-colors ${focus === 'interests' ? 'bg-muted border-primary' : 'hover:bg-muted/50'}`}
                                    onClick={() => updateFocus('interests')}
                                >
                                    <div className={`h-4 w-4 rounded-full border border-primary flex items-center justify-center ${focus === 'interests' ? 'bg-primary' : ''}`}>
                                        {focus === 'interests' && <div className="h-2 w-2 rounded-full bg-white" />}
                                    </div>
                                    <div>
                                        <div className="font-medium">Follow Interests</div>
                                        <div className="text-xs text-muted-foreground">More weight on passion areas</div>
                                    </div>
                                </div>
                            </div>
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
