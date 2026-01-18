import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { HabitStage, HABIT_STAGE_LABELS, HABIT_STAGE_DESCRIPTIONS } from '@/types';
import { Sparkles, Sprout, Grape, CheckCircle2 } from 'lucide-react'; // Updated icons
import { cn } from '@/lib/utils';

interface ObservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityTitle: string;
  onSubmit: (stage: HabitStage, notes?: string) => void;
  onAddToPortfolio?: () => void;
}

const stageOptions: { level: HabitStage; icon: typeof Sparkles; color: string }[] = [
  {
    level: 'Seeding',
    icon: Sparkles,
    color: 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
  },
  {
    level: 'Rooting',
    icon: Sprout,
    color: 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
  },
  {
    level: 'Fruiting',
    icon: Grape,
    color: 'border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100'
  },
];

export function ObservationModal({
  open,
  onOpenChange,
  activityTitle,
  onSubmit,
  onAddToPortfolio
}: ObservationModalProps) {
  const [selectedStage, setSelectedStage] = useState<HabitStage | null>(null);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (selectedStage) {
      onSubmit(selectedStage, notes || undefined);
      // Reset state
      setSelectedStage(null);
      setNotes('');
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedStage(null);
      setNotes('');
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">How did it go?</DialogTitle>
          <DialogDescription>
            Record your observation for <span className="font-medium text-foreground">{activityTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Stage Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Select formation stage
            </label>
            <div className="grid grid-cols-1 gap-3">
              {stageOptions.map(({ level, icon: Icon, color }) => (
                <button
                  key={level}
                  onClick={() => setSelectedStage(level)}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all',
                    selectedStage === level
                      ? color + ' border-current'
                      : 'border-border hover:border-muted-foreground/40 bg-card'
                  )}
                >
                  <Icon className={cn(
                    'h-5 w-5 mt-0.5 shrink-0',
                    selectedStage === level ? 'text-current' : 'text-muted-foreground'
                  )} />
                  <div className="space-y-1">
                    <div className={cn(
                      'font-medium',
                      selectedStage === level ? 'text-current' : 'text-foreground'
                    )}>
                      {HABIT_STAGE_LABELS[level]}
                    </div>
                    <div className={cn(
                      'text-sm',
                      selectedStage === level ? 'text-current/80' : 'text-muted-foreground'
                    )}>
                      {HABIT_STAGE_DESCRIPTIONS[level]}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              placeholder="Any observations, highlights, or things to remember..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-between items-center w-full">
          {onAddToPortfolio && (
            <Button type="button" variant="secondary" onClick={onAddToPortfolio} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Add to Portfolio
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedStage}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Save Observation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
