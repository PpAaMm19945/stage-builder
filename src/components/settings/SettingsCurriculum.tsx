import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightning } from '@phosphor-icons/react';
import { OverrideManager } from '@/components/overrides/OverrideManager';
import { FormationSettings } from '@/components/settings/FormationSettings';
import { LiturgySettings } from '@/components/liturgy/LiturgySettings';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function SettingsCurriculum() {
    const { token } = useAuth();
    const [focus, setFocus] = useState<'balanced' | 'interests'>('balanced');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const res = await fetch('/api/family/preferences', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.learningFocus) setFocus(data.learningFocus);
            }
        } catch (e) {
            console.error('Failed to load focus settings', e);
        }
    };

    const updateFocus = async (newFocus: 'balanced' | 'interests') => {
        setFocus(newFocus);
        setIsLoading(true);
        try {
            const res = await fetch('/api/family/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    learningFocus: newFocus
                })
            });

            if (res.ok) {
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
            <LiturgySettings />

            {/* Learning Focus */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Lightning className="h-5 w-5" />
                        Learning Focus
                    </CardTitle>
                    <CardDescription>
                         Prioritize specific subjects or interests for the weekly plan.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
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
