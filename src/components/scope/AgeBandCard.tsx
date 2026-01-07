import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Brain,
  Heart,
  BookOpen,
  HandGrabbing,
  ChatCircleText,
} from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AgeBand } from '@/data/scope-sequence';
import { EarlyYearsDomain } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface AgeBandCardProps {
  band: AgeBand;
  childrenInBand: ReturnType<typeof useAuth>['children'];
  isExpandedDefault?: boolean;
}

const domainIcons: Record<EarlyYearsDomain, React.ElementType> = {
  'motor': HandGrabbing,
  'language': ChatCircleText,
  'cognitive': Brain,
  'social-emotional': Heart,
  'pre-academic': BookOpen,
};

const domainLabels: Record<EarlyYearsDomain, string> = {
  'motor': 'Stature',
  'language': 'Language',
  'cognitive': 'Wisdom',
  'social-emotional': 'Favor with God & Man',
  'pre-academic': 'Foundations'
};

const domainColors: Record<EarlyYearsDomain, string> = {
  'motor': 'text-orange-500 bg-orange-50 dark:bg-orange-950/20',
  'language': 'text-blue-500 bg-blue-50 dark:bg-blue-950/20',
  'cognitive': 'text-purple-500 bg-purple-50 dark:bg-purple-950/20',
  'social-emotional': 'text-rose-500 bg-rose-50 dark:bg-rose-950/20',
  'pre-academic': 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
};

export function AgeBandCard({ band, childrenInBand, isExpandedDefault = false }: AgeBandCardProps) {
  const [isOpen, setIsOpen] = useState(isExpandedDefault || (childrenInBand && childrenInBand.length > 0));
  const hasChildren = childrenInBand && childrenInBand.length > 0;
  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "bg-card border rounded-xl overflow-hidden transition-all duration-300",
        isOpen ? "shadow-md ring-1 ring-primary/5" : "shadow-sm hover:shadow-md"
      )}
    >
      <div className="relative">
        {/* Active Child Indicator Strip */}
        {hasChildren && (
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-xl z-10" />
        )}

        <CollapsibleTrigger className="w-full text-left">
          <div className={cn(
            "p-5 flex items-start sm:items-center justify-between gap-4",
             hasChildren ? "pl-7" : ""
          )}>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant={hasChildren ? "default" : "outline"} className={cn("text-sm px-2.5 py-0.5", !hasChildren && "text-muted-foreground border-muted-foreground/30")}>
                  {band.label}
                </Badge>
                <h3 className="font-display font-bold text-xl text-foreground">
                  {band.metaphor}
                </h3>

                {hasChildren && (
                  <div className="flex -space-x-2 ml-2">
                    {childrenInBand.map(child => (
                       <TooltipProvider key={child.id}>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-background border border-background">
                             {getInitials(child.name)}
                           </div>
                         </TooltipTrigger>
                         <TooltipContent>
                           <p>{child.name}</p>
                         </TooltipContent>
                       </Tooltip>
                     </TooltipProvider>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl pt-1">
                {band.summary}
              </p>
            </div>

            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center transition-colors shrink-0",
              isOpen ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
            )}>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="p-5 pt-0 border-t border-border/40">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
              {band.domains.map((item) => {
                const Icon = domainIcons[item.domain];
                return (
                  <Card key={item.domain} className="border border-border/60 shadow-none hover:border-primary/20 transition-colors h-full">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                         <div className={cn("p-1.5 rounded-md", domainColors[item.domain])}>
                           <Icon className="w-4 h-4" weight="duotone" />
                         </div>
                         <span className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                            {domainLabels[item.domain]}
                         </span>
                      </div>

                      <div className="space-y-1.5">
                        <p className="font-medium text-foreground leading-snug">
                          {item.focus}
                        </p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
           </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
