import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { students } from '@/lib/api';
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
import { Loader2, Pencil } from 'lucide-react';
import type { Student } from '@/types';

const editChildSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
    dateOfBirth: z.string().min(1, 'Date of birth is required').refine((date) => {
        const birthDate = new Date(date);
        const now = new Date();
        const ageMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 +
            (now.getMonth() - birthDate.getMonth());
        return ageMonths >= 0 && ageMonths <= 72; // 0-6 years for early years
    }, 'Child must be between 0 and 6 years old for early years stage'),
});

type EditChildFormData = z.infer<typeof editChildSchema>;

interface EditChildFormProps {
    child: Student;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function EditChildForm({ child, open, onOpenChange, onSuccess }: EditChildFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { refreshAuth } = useAuth();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<EditChildFormData>({
        resolver: zodResolver(editChildSchema),
        defaultValues: {
            name: child.name,
            dateOfBirth: child.dateOfBirth,
        },
    });

    // Reset form when child changes
    useEffect(() => {
        reset({
            name: child.name,
            dateOfBirth: child.dateOfBirth,
        });
    }, [child, reset]);

    const onSubmit = async (data: EditChildFormData) => {
        setIsSubmitting(true);
        try {
            await students.update(child.id, {
                name: data.name,
                dateOfBirth: data.dateOfBirth,
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
