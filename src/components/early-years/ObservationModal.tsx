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
import { MasteryLevel, MASTERY_LABELS, MASTERY_DESCRIPTIONS } from '@/types';
import { Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ObservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityTitle: string;
  onSubmit: (masteryLevel: MasteryLevel, notes?: string) => void;
}

const masteryOptions: { level: MasteryLevel; icon: typeof Sparkles; color: string }[] = [
  { 
    level: 'emerging', 
    icon: Sparkles, 
    color: 'border-mastery-emerging text-mastery-emerging bg-mastery-emerging/10 hover:bg-mastery-emerging/20' 
  },
  { 
    level: 'developing', 
    icon: TrendingUp, 
    color: 'border-mastery-developing text-mastery-developing bg-mastery-developing/10 hover:bg-mastery-developing/20' 
  },
  { 
    level: 'secure', 
    icon: CheckCircle2, 
    color: 'border-mastery-secure text-mastery-secure bg-mastery-secure/10 hover:bg-mastery-secure/20' 
  },
];

export function ObservationModal({ 
  open, 
  onOpenChange, 
  activityTitle, 
  onSubmit 
}: ObservationModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<MasteryLevel | null>(null);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (selectedLevel) {
      onSubmit(selectedLevel, notes || undefined);
      // Reset state
      setSelectedLevel(null);
      setNotes('');
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedLevel(null);
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
          {/* Mastery Level Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Select mastery level
            </label>
            <div className="grid grid-cols-1 gap-3">
              {masteryOptions.map(({ level, icon: Icon, color }) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all',
                    selectedLevel === level
                      ? color + ' border-current'
                      : 'border-border hover:border-muted-foreground/40 bg-card'
                  )}
                >
                  <Icon className={cn(
                    'h-5 w-5 mt-0.5 shrink-0',
                    selectedLevel === level ? 'text-current' : 'text-muted-foreground'
                  )} />
                  <div className="space-y-1">
                    <div className={cn(
                      'font-medium',
                      selectedLevel === level ? 'text-current' : 'text-foreground'
                    )}>
                      {MASTERY_LABELS[level]}
                    </div>
                    <div className={cn(
                      'text-sm',
                      selectedLevel === level ? 'text-current/80' : 'text-muted-foreground'
                    )}>
                      {MASTERY_DESCRIPTIONS[level]}
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
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedLevel}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Save Observation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
