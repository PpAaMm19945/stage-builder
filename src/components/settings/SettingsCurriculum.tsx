import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Lightning } from '@phosphor-icons/react';
import { DailyLiturgy } from '@/components/liturgy/DailyLiturgy';
import { OverrideManager } from '@/components/overrides/OverrideManager';
import { FormationSettings } from '@/components/settings/FormationSettings';

export function SettingsCurriculum() {
    return (
        <div className="space-y-6">
            {/* Formation Preferences */}
            <FormationSettings />

            {/* Daily Liturgy Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BookOpen className="h-5 w-5" />
                        Daily Liturgy
                    </CardTitle>
                    <CardDescription>
                        Customize your family's morning time rituals
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DailyLiturgy embedded />
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

