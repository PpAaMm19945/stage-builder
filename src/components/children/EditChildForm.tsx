import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { students, API_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Pencil, GraduationCap, FileText, ExternalLink } from 'lucide-react';
import type { Student, PaceOverrides, PaceLevel, PaceSubject } from '@/types';
import { IndependenceSettings } from '../settings/IndependenceSettings';
import { PaceOverrideSettings } from '../settings/PaceOverrideSettings';

const editChildSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
    dateOfBirth: z.string().min(1, 'Date of birth is required').refine((date) => {
        const birthDate = new Date(date);
        const now = new Date();
        const ageMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 +
            (now.getMonth() - birthDate.getMonth());
        return ageMonths >= 0 && ageMonths <= 240; // Extended to 20 years to allow for graduates/older students
    }, 'Child must be between 0 and 20 years old'),
    independence_settings: z.object({
        canMarkComplete: z.boolean(),
        canAskAi: z.boolean(),
        canViewPortfolio: z.boolean(),
    }).optional(),
    pace_overrides: z.record(z.string(), z.enum(['gentle', 'standard', 'accelerated'])).optional(),
    // Graduation fields
    is_graduated: z.boolean().optional(),
    graduation_date: z.string().optional(),
});

type EditChildFormData = z.infer<typeof editChildSchema>;

interface EditChildFormProps {
    child: Student;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
};

export function EditChildForm({ child, open, onOpenChange, onSuccess }: EditChildFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { refreshAuth } = useAuth();

    const form = useForm<EditChildFormData>({
        resolver: zodResolver(editChildSchema),
        defaultValues: {
            name: child.name,
            dateOfBirth: formatDateForInput(child.dateOfBirth),
            independence_settings: child.independence_settings || {
                canMarkComplete: false,
                canAskAi: false,
                canViewPortfolio: false
            },
            pace_overrides: child.pace_overrides || {}
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        getValues,
        formState: { errors },
    } = form;

    // Handle settings update manually
    const handleSettingsUpdate = (key: string, value: boolean) => {
        const currentSettings = getValues('independence_settings') || {
            canMarkComplete: false,
            canAskAi: false,
            canViewPortfolio: false
        };
        setValue('independence_settings', { ...currentSettings, [key]: value }, { shouldDirty: true });
    };

    // Handle pace override update
    const handlePaceUpdate = (subject: PaceSubject, pace: PaceLevel | null) => {
        const currentPace = getValues('pace_overrides') || {};
        if (pace === null) {
            const { [subject]: _, ...rest } = currentPace;
            setValue('pace_overrides', rest, { shouldDirty: true });
        } else {
            setValue('pace_overrides', { ...currentPace, [subject]: pace }, { shouldDirty: true });
        }
    };

    // Reset form when child changes
    useEffect(() => {
        reset({
            name: child.name,
            dateOfBirth: formatDateForInput(child.dateOfBirth),
            independence_settings: child.independence_settings || {
                canMarkComplete: false,
                canAskAi: false,
                canViewPortfolio: false
            },
            pace_overrides: child.pace_overrides || {}
        });
    }, [child, reset]);

    const onSubmit = async (data: EditChildFormData) => {
        setIsSubmitting(true);
        try {
            await students.update(child.id, {
                name: data.name,
                dateOfBirth: data.dateOfBirth,
                independence_settings: data.independence_settings,
                pace_overrides: data.pace_overrides,
                is_graduated: data.is_graduated,
                graduation_date: data.graduation_date
            });

            await refreshAuth();
            toast.success(`${data.name}'s profile has been updated!`);
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update child');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Pencil className="h-5 w-5" />
                        Edit Child Profile
                    </DialogTitle>
                    <DialogDescription>
                        Update {child.name}'s details. Age will be recalculated based on date of birth.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 mb-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const token = localStorage.getItem('schoolos_token');
                            const url = `${API_URL}/api/export/transcript/${child.id}?token=${token}`;
                            window.open(url, '_blank');
                        }}
                        className="gap-2"
                    >
                        <FileText className="h-4 w-4" />
                        Export Transcript
                        <ExternalLink className="h-3 w-3 opacity-50 ml-1" />
                        <span className="sr-only">(opens in a new tab)</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const token = localStorage.getItem('schoolos_token');
                            const url = `${API_URL}/api/export/diploma/${child.id}?token=${token}`;
                            window.open(url, '_blank');
                        }}
                        className="gap-2"
                    >
                        <GraduationCap className="h-4 w-4" />
                        Export Diploma
                        <ExternalLink className="h-3 w-3 opacity-50 ml-1" />
                        <span className="sr-only">(opens in a new tab)</span>
                    </Button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Child's Name</Label>
                        <Input
                            id="edit-name"
                            placeholder="e.g., Emma"
                            {...register('name')}
                            disabled={isSubmitting}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
                        <Input
                            id="edit-dateOfBirth"
                            type="date"
                            max={new Date().toISOString().split('T')[0]}
                            {...register('dateOfBirth')}
                            disabled={isSubmitting}
                        />
                        {errors.dateOfBirth && (
                            <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
                        )}
                    </div>

                    <IndependenceSettings
                        settings={form.watch('independence_settings') || {
                            canMarkComplete: false,
                            canAskAi: false,
                            canViewPortfolio: false
                        }}
                        onUpdate={handleSettingsUpdate}
                        disabled={isSubmitting}
                    />

                    <div className="border-t pt-4">
                        <PaceOverrideSettings
                            settings={form.watch('pace_overrides') || {}}
                            onUpdate={handlePaceUpdate}
                            disabled={isSubmitting}
                        />
                    </div>

                    {!child.is_graduated && (
                        <div className="border-t pt-4">
                            <Label className="text-base font-medium mb-1 block">Milestones</Label>
                            <p className="text-sm text-slate-500 mb-4">
                                Mark major life transitions.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                onClick={() => {
                                    if (confirm(`Are you sure you want to graduate ${child.name}? This will change their profile to Alumni status and remove them from the daily schedule.`)) {
                                        setValue('is_graduated', true, { shouldDirty: true });
                                        setValue('graduation_date', new Date().toISOString(), { shouldDirty: true });
                                    }
                                }}
                                disabled={isSubmitting}
                            >
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Graduate Student
                            </Button>
                            {watch('is_graduated') && (
                                <p className="text-xs text-indigo-600 mt-2 text-center font-medium flex items-center justify-center gap-1">
                                    <GraduationCap className="h-3 w-3" />
                                    Marked for Graduation upon save.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
