import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { independence } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CircleNotch, User, Check, ShieldCheck, Robot, Eye } from '@phosphor-icons/react';
import { toast } from 'sonner';
import type {
    IndependenceSettings,
    IndependenceLevel,
    IndependenceSubject,
    INDEPENDENCE_LEVEL_LABELS,
    INDEPENDENCE_LEVEL_DESCRIPTIONS,
    SUBJECT_LABELS,
} from '@/types';

// Import the constants directly
const INDEPENDENCE_LEVEL_OPTIONS: { value: IndependenceLevel; label: string; description: string }[] = [
    { value: 'parent_led', label: 'Parent-Led', description: 'Parent leads all activities' },
    { value: 'guided', label: 'Guided', description: 'Child works with oversight' },
    { value: 'independent', label: 'Independent', description: 'Child works on their own' },
];

const SUBJECT_OPTIONS: { value: IndependenceSubject; label: string }[] = [
    { value: 'all', label: 'All Subjects' },
    { value: 'bible', label: 'Bible & Faith' },
    { value: 'history', label: 'History' },
    { value: 'math', label: 'Math' },
    { value: 'reading', label: 'Reading' },
    { value: 'motor', label: 'Physical Skills' },
    { value: 'language', label: 'Language' },
    { value: 'cognitive', label: 'Thinking Skills' },
];

interface ChildSettingsProps {
    childId: string;
    childName: string;
    settings: IndependenceSettings[];
    onUpdate: (subject: IndependenceSubject, updates: Partial<IndependenceSettings>) => Promise<void>;
    isUpdating: boolean;
}

function ChildSettings({ childId, childName, settings, onUpdate, isUpdating }: ChildSettingsProps) {
    const getSetting = (subject: IndependenceSubject) =>
        settings.find((s) => s.subject === subject);

    const allSetting = getSetting('all');
    const effectiveLevel = allSetting?.level || 'parent_led';
    const canMarkComplete = allSetting?.canMarkComplete || false;
    const canAskAi = allSetting?.canAskAi || false;

    return (
        <div className="space-y-4">
            {/* Overall Level */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium">Overall Independence Level</p>
                    <p className="text-sm text-muted-foreground">
                        Sets the default for all subjects
                    </p>
                </div>
                <Select
                    value={effectiveLevel}
                    onValueChange={(value) =>
                        onUpdate('all', { level: value as IndependenceLevel })
                    }
                    disabled={isUpdating}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {INDEPENDENCE_LEVEL_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Permissions */}
            <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Permissions
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Can mark tasks complete</span>
                    </div>
                    <Switch
                        checked={canMarkComplete}
                        onCheckedChange={(checked) =>
                            onUpdate('all', { canMarkComplete: checked })
                        }
                        disabled={isUpdating}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Robot className="w-4 h-4 text-purple-600" />
                        <span className="text-sm">Can ask AI questions</span>
                    </div>
                    <Switch
                        checked={canAskAi}
                        onCheckedChange={(checked) =>
                            onUpdate('all', { canAskAi: checked })
                        }
                        disabled={isUpdating}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">Can view portfolio</span>
                    </div>
                    <Switch
                        checked={allSetting?.canViewPortfolio ?? true}
                        onCheckedChange={(checked) =>
                            onUpdate('all', { canViewPortfolio: checked })
                        }
                        disabled={isUpdating}
                    />
                </div>
            </div>

            {/* Per-subject settings (optional, collapsed by default) */}
            <details className="group">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    ▸ Advanced: Per-subject settings
                </summary>
                <div className="mt-3 space-y-2">
                    {SUBJECT_OPTIONS.filter((s) => s.value !== 'all').map((subject) => {
                        const subjectSetting = getSetting(subject.value);
                        return (
                            <div
                                key={subject.value}
                                className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
                            >
                                <span className="text-sm">{subject.label}</span>
                                <Select
                                    value={subjectSetting?.level || 'parent_led'}
                                    onValueChange={(value) =>
                                        onUpdate(subject.value, { level: value as IndependenceLevel })
                                    }
                                    disabled={isUpdating}
                                >
                                    <SelectTrigger className="w-[140px] h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INDEPENDENCE_LEVEL_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        );
                    })}
                </div>
            </details>
        </div>
    );
}

export function IndependenceManager() {
    const { children } = useAuth();
    const queryClient = useQueryClient();
    const [updatingChild, setUpdatingChild] = useState<string | null>(null);

    // Fetch settings for all children
    const settingsQueries = children.map((child) => {
        return useQuery({
            queryKey: ['independence-settings', child.id],
            queryFn: () => independence.get(child.id),
            enabled: !!child.id,
        });
    });

    const updateMutation = useMutation({
        mutationFn: async ({
            studentId,
            subject,
            updates,
        }: {
            studentId: string;
            subject: IndependenceSubject;
            updates: Partial<IndependenceSettings>;
        }) => {
            // Merge with existing settings
            const existing = settingsQueries
                .find((q) => q.data?.some((s: IndependenceSettings) => s.studentId === studentId))
                ?.data?.find((s: IndependenceSettings) => s.subject === subject);

            return independence.update(studentId, {
                subject,
                level: updates.level || existing?.level || 'parent_led',
                canMarkComplete: updates.canMarkComplete ?? existing?.canMarkComplete ?? false,
                canAskAi: updates.canAskAi ?? existing?.canAskAi ?? false,
                canViewPortfolio: updates.canViewPortfolio ?? existing?.canViewPortfolio ?? true,
            });
        },
        onSuccess: (_, { studentId }) => {
            queryClient.invalidateQueries({ queryKey: ['independence-settings', studentId] });
            toast.success('Settings updated');
        },
        onError: (error: any) => {
            toast.error('Failed to update settings', { description: error.message });
        },
        onSettled: () => {
            setUpdatingChild(null);
        },
    });

    const handleUpdate = async (
        studentId: string,
        subject: IndependenceSubject,
        updates: Partial<IndependenceSettings>
    ) => {
        setUpdatingChild(studentId);
        await updateMutation.mutateAsync({ studentId, subject, updates });
    };

    const getInitials = (name: string) =>
        name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

    if (children.length === 0) {
        return (
            <div className="text-center py-6 text-muted-foreground">
                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No children registered yet.</p>
                <p className="text-sm">Add a child in the Children section above.</p>
            </div>
        );
    }

    return (
        <Accordion type="single" collapsible className="w-full">
            {children.map((child, index) => {
                const query = settingsQueries[index];
                const settings = query.data || [];
                const isLoading = query.isLoading;
                const isUpdating = updatingChild === child.id;

                return (
                    <AccordionItem key={child.id} value={child.id}>
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                        {getInitials(child.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                    <p className="font-medium">{child.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {settings.find((s: IndependenceSettings) => s.subject === 'all')?.level === 'independent'
                                            ? 'Independent'
                                            : settings.find((s: IndependenceSettings) => s.subject === 'all')?.level === 'guided'
                                                ? 'Guided'
                                                : 'Parent-Led'}
                                    </p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            {isLoading ? (
                                <div className="flex justify-center py-4">
                                    <CircleNotch className="w-5 h-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <ChildSettings
                                    childId={child.id}
                                    childName={child.name}
                                    settings={settings}
                                    onUpdate={(subject, updates) => handleUpdate(child.id, subject, updates)}
                                    isUpdating={isUpdating}
                                />
                            )}
                        </AccordionContent>
                    </AccordionItem>
                );
            })}
        </Accordion>
    );
}
