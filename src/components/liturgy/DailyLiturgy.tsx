import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  BookBookmark,
  MusicNotes,
  Scroll,
  CaretDown,
  CaretUp,
  CheckCircle,
  ArrowRight,
  Info
} from '@phosphor-icons/react';
import { liturgy } from '@/lib/api';
import { LiturgyItem, LiturgyType } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const ICONS: Record<LiturgyType, any> = {
  catechism: BookBookmark,
  hymn: MusicNotes,
  scripture: Scroll,
};

const LABELS: Record<LiturgyType, string> = {
  catechism: 'Catechism',
  hymn: 'Hymn of the Week',
  scripture: 'Memory Verse',
};

// Age-appropriate guidance based on youngest child's age
const getAgeGuidance = (ageMonths: number): { tip: string; approach: string } => {
  if (ageMonths < 24) {
    return {
      tip: 'Infants & Toddlers (0-2)',
      approach: 'Simply read aloud in a calm, rhythmic voice. Your baby absorbs tone, cadence, and the comfort of your voice. Don\'t worry about comprehension—this is planting seeds.'
    };
  } else if (ageMonths < 48) {
    return {
      tip: 'Toddlers & Preschoolers (2-4)',
      approach: 'Read slowly and have your child repeat short phrases after you. Use hand motions for hymns. They\'re learning rhythm, language patterns, and the joy of participating—not memorizing yet.'
    };
  } else {
    return {
      tip: 'Preschoolers & Kindergarteners (4-5)',
      approach: 'Encourage them to recite parts they remember. Ask simple questions like "Who made you?" Point to words as you read. They can start learning first answers and short verses.'
    };
  }
};

export function DailyLiturgy() {
  const queryClient = useQueryClient();
  const { children } = useAuth();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Get youngest child for age-appropriate guidance
  const youngestChild = children?.length > 0 
    ? [...children].sort((a, b) => a.ageInMonths - b.ageInMonths)[0] 
    : null;
  const ageGuidance = youngestChild ? getAgeGuidance(youngestChild.ageInMonths) : null;

  const { data, isLoading } = useQuery({
    queryKey: ['liturgy-today'],
    queryFn: liturgy.getToday,
  });

  const completeMutation = useMutation({
    mutationFn: liturgy.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liturgy-today'] });
    },
  });

  const uncompleteMutation = useMutation({
    mutationFn: liturgy.uncomplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liturgy-today'] });
    },
  });

  const advanceMutation = useMutation({
    mutationFn: liturgy.advance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liturgy-today'] });
      toast.success('Advanced to next week!');
    },
  });

  if (isLoading || !data) return null;
  if (!data.items || data.items.length === 0) return null;

  const allCompleted = data.items.every((item) => item.completedToday);

  const handleToggle = (item: LiturgyItem) => {
    if (item.completedToday) {
      uncompleteMutation.mutate(item.id);
    } else {
      completeMutation.mutate(item.id);
    }
  };

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-transparent dark:border-amber-800/50 overflow-hidden">
      <CardHeader className="pb-3 border-b border-amber-100 dark:border-amber-900/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-amber-900 dark:text-amber-100">
            <BookBookmark className="h-5 w-5 text-amber-600 dark:text-amber-400" weight="duotone" />
            Daily Liturgy
          </CardTitle>
          {allCompleted && (
            <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold dark:bg-green-900/30 dark:text-green-300">
              <CheckCircle weight="fill" className="w-4 h-4" />
              Complete
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Age-appropriate guidance banner */}
        {ageGuidance && (
          <div className="px-4 py-3 bg-amber-100/50 dark:bg-amber-900/20 border-b border-amber-200/50 dark:border-amber-800/30">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" weight="fill" />
              <div className="text-xs text-amber-800 dark:text-amber-200">
                <span className="font-semibold">{ageGuidance.tip}:</span>{' '}
                <span className="text-amber-700 dark:text-amber-300">{ageGuidance.approach}</span>
              </div>
            </div>
          </div>
        )}
        {data.items.map((item) => {
          const Icon = ICONS[item.type as LiturgyType];
          const isExpanded = expandedItem === item.id;

          return (
            <div
              key={item.id}
              className={`border-b last:border-0 border-amber-100 dark:border-amber-900/30 transition-colors ${
                item.completedToday ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
              }`}
            >
              <Collapsible
                open={isExpanded}
                onOpenChange={() => setExpandedItem(isExpanded ? null : item.id)}
              >
                <div className="flex items-start p-4 gap-3">
                  <Checkbox
                    checked={!!item.completedToday}
                    onCheckedChange={() => handleToggle(item)}
                    className="mt-1 border-amber-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-600/80 dark:text-amber-400 uppercase tracking-wider">
                      <Icon weight="duotone" className="w-3.5 h-3.5" />
                      {LABELS[item.type as LiturgyType]}
                    </div>
                    <div className="font-medium text-amber-950 dark:text-amber-50">
                      {item.title}
                    </div>
                  </div>

                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-amber-800 hover:text-amber-900 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900/50">
                      {isExpanded ? (
                        <CaretUp className="h-4 w-4" />
                      ) : (
                        <CaretDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  <div className="px-4 pb-4 pl-11 space-y-4">
                    <div className="text-sm leading-relaxed whitespace-pre-line text-amber-900/90 dark:text-amber-100/90 bg-white/50 dark:bg-black/20 p-3 rounded-md border border-amber-100 dark:border-amber-900/30">
                      {item.content}
                    </div>

                    <div className="flex items-center justify-between">
                      {item.reference && (
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                          — {item.reference}
                        </span>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => advanceMutation.mutate(item.type as LiturgyType)}
                        disabled={advanceMutation.isPending}
                        className="h-7 text-xs gap-1 ml-auto text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/40"
                      >
                        Next Week <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
