import { ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StageNavigator() {
  const stages = [
    { name: 'The Garden', age: '0-5', status: 'active', metaphor: 'Novice' },
    { name: 'The Grammar', age: '6-9', status: 'locked', metaphor: 'Apprentice' },
    { name: 'The Logic', age: '10-13', status: 'locked', metaphor: 'Scholar' },
    { name: 'The Rhetoric', age: '14-18', status: 'locked', metaphor: 'Journeyman' },
  ];

  return (
    <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
      <div className="flex items-center min-w-max gap-2 md:gap-4 border-b border-border/50 pb-4">
        {stages.map((stage, index) => (
          <div key={stage.name} className="flex items-center">
            <div
              className={cn(
                "flex flex-col gap-1 px-3 py-2 rounded-lg transition-colors border",
                stage.status === 'active'
                  ? "bg-primary/5 border-primary/20"
                  : "bg-muted/30 border-transparent opacity-60 grayscale"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  stage.status === 'active' ? "text-primary" : "text-muted-foreground"
                )}>
                  {stage.name}
                </span>
                {stage.status === 'locked' && <Lock className="w-3 h-3 text-muted-foreground" />}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold leading-none">{stage.age}</span>
                <span className="text-xs text-muted-foreground font-medium">{stage.metaphor}</span>
              </div>
            </div>

            {index < stages.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground/30 mx-1 md:mx-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
