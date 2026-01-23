import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Trophy, Confetti, ArrowRight } from '@phosphor-icons/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PathCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pathName: string;
  totalItems: number;
}

export function PathCompletionModal({
  isOpen,
  onClose,
  pathName,
  totalItems,
}: PathCompletionModalProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      // Fire confetti when modal opens
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#FFD700', '#FFA500', '#FF6347'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#FFD700', '#FFA500', '#FF6347'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [isOpen]);

  const handleStartAnother = () => {
    onClose();
    navigate('/library/paths');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Trophy className="h-10 w-10 text-white" weight="fill" />
            </div>
            <Confetti 
              className="absolute -top-2 -right-2 h-8 w-8 text-amber-500 animate-bounce" 
              weight="fill" 
            />
          </div>
          <DialogTitle className="text-2xl font-display">
            Journey Complete!
          </DialogTitle>
          <DialogDescription className="text-base">
            Congratulations! You've completed the entire{' '}
            <span className="font-semibold text-foreground">{pathName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
            <span className="text-2xl font-bold text-primary">{totalItems}</span>
            <span className="text-muted-foreground">items completed</span>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button 
            onClick={handleStartAnother} 
            className="w-full"
            size="lg"
          >
            Start Another Path
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full"
          >
            Return to Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
