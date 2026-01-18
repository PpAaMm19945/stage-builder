import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { PaceOverrides, PaceLevel, PaceSubject } from '@/types';
import { PACE_SUBJECTS, PACE_LEVEL_LABELS } from '@/types';
import { Gauge } from 'lucide-react';

interface PaceOverrideSettingsProps {
    settings: PaceOverrides;
    onUpdate: (subject: PaceSubject, pace: PaceLevel | null) => void;
    disabled?: boolean;
}

export function PaceOverrideSettings({ settings, onUpdate, disabled }: PaceOverrideSettingsProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-amber-600" />
                <Label className="text-base font-semibold">Per-Subject Pace</Label>
            </div>
            <p className="text-sm text-muted-foreground">
                Customize learning pace for each subject. Leave as "Family Default" to use your global pace setting.
            </p>

            <div className="grid gap-3">
                {PACE_SUBJECTS.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                        <Label htmlFor={`pace-${key}`} className="text-sm font-medium min-w-[120px]">
                            {label}
                        </Label>
                        <Select
                            value={settings?.[key] || 'default'}
                            onValueChange={(value) => {
                                onUpdate(key, value === 'default' ? null : (value as PaceLevel));
                            }}
                            disabled={disabled}
                        >
                            <SelectTrigger id={`pace-${key}`} className="w-[180px]">
                                <SelectValue placeholder="Family Default" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Family Default</SelectItem>
                                {Object.entries(PACE_LEVEL_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ))}
            </div>
        </div>
    );
}
