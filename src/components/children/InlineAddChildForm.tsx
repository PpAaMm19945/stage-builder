import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { students } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const addChildSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
    dateOfBirth: z.string().min(1, 'Date of birth is required').refine((date) => {
        const birthDate = new Date(date);
        const now = new Date();
        const ageMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 +
            (now.getMonth() - birthDate.getMonth());
        return ageMonths >= 0 && ageMonths <= 72; // 0-6 years
    }, 'Child must be between 0 and 6 years old'),
});

type AddChildFormData = z.infer<typeof addChildSchema>;

interface InlineAddChildFormProps {
    onSuccess?: () => void;
}

export function InlineAddChildForm({ onSuccess }: InlineAddChildFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { refreshAuth } = useAuth();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AddChildFormData>({
        resolver: zodResolver(addChildSchema),
    });

    const onSubmit = async (data: AddChildFormData) => {
        setIsSubmitting(true);
        try {
            await students.create({
                name: data.name,
                dateOfBirth: data.dateOfBirth,
            });
            await refreshAuth();
            toast.success(`${data.name} has been added!`);
            reset();
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || 'Failed to add child');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm w-full mx-auto">
            <div className="space-y-2 text-left">
                <Label htmlFor="inline-name">Child's Name</Label>
                <Input
                    id="inline-name"
                    placeholder="e.g., Emma"
                    {...register('name')}
                    disabled={isSubmitting}
                />
                {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2 text-left">
                <Label htmlFor="inline-dateOfBirth">Date of Birth</Label>
                <Input
                    id="inline-dateOfBirth"
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    {...register('dateOfBirth')}
                    disabled={isSubmitting}
                />
                {errors.dateOfBirth && (
                    <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
                )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                    </>
                ) : (
                    'Add Child'
                )}
            </Button>
        </form>
    );
}
