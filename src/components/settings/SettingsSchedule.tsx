import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from '@phosphor-icons/react';
import { TimeModelEditor } from '@/components/planning/TimeModelEditor';

export function SettingsSchedule() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="h-5 w-5" />
                    Weekly Schedule
                </CardTitle>
                <CardDescription>
                    Set your family's availability and pacing preferences
                </CardDescription>
            </CardHeader>
            <CardContent>
                <TimeModelEditor />
            </CardContent>
        </Card>
    );
}
