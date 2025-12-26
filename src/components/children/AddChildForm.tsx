import { useState } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';

const addChildSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  dateOfBirth: z.string().min(1, 'Date of birth is required').refine((date) => {
    const birthDate = new Date(date);
    const now = new Date();
    const ageMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + 
      (now.getMonth() - birthDate.getMonth());
    return ageMonths >= 0 && ageMonths <= 72; // 0-6 years for early years
  }, 'Child must be between 0 and 6 years old for early years stage'),
});

type AddChildFormData = z.infer<typeof addChildSchema>;

interface AddChildFormProps {
  onSuccess?: () => void;
}

export function AddChildForm({ onSuccess }: AddChildFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshAuth, children } = useAuth();

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
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add child');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAddMore = children.length < 5;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
          disabled={!canAddMore}
        >
          <Plus className="h-4 w-4" />
          Add Child
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a Child</DialogTitle>
          <DialogDescription>
            Enter your child's details. We'll use their age to recommend appropriate activities.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Child's Name</Label>
            <Input
              id="name"
              placeholder="e.g., Emma"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
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
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Child'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
