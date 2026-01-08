import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightning } from '@phosphor-icons/react';
import { OverrideManager } from '@/components/overrides/OverrideManager';
import { FormationSettings } from '@/components/settings/FormationSettings';
import { LiturgySettings } from '@/components/liturgy/LiturgySettings';

export function SettingsCurriculum() {
    return (
        <div className="space-y-6">
            {/* Formation Preferences */}
            <FormationSettings />

            {/* Daily Liturgy Settings */}
            <LiturgySettings />

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
