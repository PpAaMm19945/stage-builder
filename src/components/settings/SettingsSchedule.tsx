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
                    Define your family's rhythm. Set available days and time slots.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* 
                     Ideally we would pass props to TimeModelEditor to support split limits 
                     (Morning vs Evening), but for now we'll rely on the existing editor 
                     which mostly handles 'total minutes' and 'sessions'.
                     
                     TODO: Refactor TimeModelEditor to explicitly support 
                     morning_minutes and evening_minutes separation as per Phase 3.
                 */}
                <TimeModelEditor />
            </CardContent>
        </Card>
    );
}
