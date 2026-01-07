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
import { HymnPlayer } from './HymnPlayer';
import { HymnContent } from './HymnContent';

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
      tip: 'Young Children (4-6)',
      approach: 'Encourage them to memorize short verses or answers. Discuss the meaning simply. Let them lead parts they know well. Focus on hiding God\'s word in their hearts.'
    };
  }
};

interface DailyLiturgyProps {
  embedded?: boolean;
}

export function DailyLiturgy({ embedded = false }: DailyLiturgyProps) {
  const { children } = useAuth();
  const queryClient = useQueryClient();
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
    onMutate: async (itemId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['liturgy-today'] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['liturgy-today']);

      // Optimistically update
      queryClient.setQueryData(['liturgy-today'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) =>
            item.id === itemId ? { ...item, completedToday: true } : item
          ),
        };
      });

      return { previousData };
    },
    onError: (err, itemId, context: any) => {
      // Rollback on error
      queryClient.setQueryData(['liturgy-today'], context.previousData);
      toast.error('Failed to mark as complete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liturgy-today'] });
      toast.success('Marked as complete!');
    },
  });

  const uncompleteMutation = useMutation({
    mutationFn: liturgy.uncomplete,
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['liturgy-today'] });
      const previousData = queryClient.getQueryData(['liturgy-today']);

      queryClient.setQueryData(['liturgy-today'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) =>
            item.id === itemId ? { ...item, completedToday: false } : item
          ),
        };
      });

      return { previousData };
    },
    onError: (err, itemId, context: any) => {
      queryClient.setQueryData(['liturgy-today'], context.previousData);
      toast.error('Failed to update');
    },
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
                {ageGuidance.approach}
              </div>
            </div>
          </div>
        )}

        {/* Liturgy Items List */}
        <div className="divide-y divide-amber-100 dark:divide-amber-900/30">
          {data.items.map((item) => {
            const Icon = ICONS[item.type];
            const label = LABELS[item.type];
            const isExpanded = expandedItem === item.id;

            return (
              <Collapsible
                key={item.id}
                open={isExpanded}
                onOpenChange={(open) => setExpandedItem(open ? item.id : null)}
              >
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={item.completedToday}
                      onCheckedChange={() => handleToggle(item)}
                      className="border-amber-300 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                    />
                    <CollapsibleTrigger className="flex-1 flex items-center justify-between text-left">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" weight="duotone" />
                        <div>
                          <p className={`font-medium text-sm ${item.completedToday ? 'line-through text-muted-foreground' : ''}`}>
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{label}</p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <CaretUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <CaretDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent className="pt-4 pl-8 space-y-4">
                    {/* Audio Player for Hymns (or any item with audio_url) */}
                    {item.audio_url && (
                      <HymnPlayer
                        url={item.audio_url}
                        title={item.title}
                      />
                    )}

                    {item.type === 'hymn' ? (
                      <HymnContent title={item.title} fallbackContent={item.content} />
                    ) : (
                      <div className="text-sm whitespace-pre-wrap bg-amber-50/50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800/30">
                        {item.content}
                      </div>
                    )}

                    {item.reference && (
                      <p className="text-xs text-muted-foreground italic mt-2">{item.reference}</p>
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>

        {/* Advance Button */}
        {allCompleted && (
          <div className="p-4 border-t border-amber-100 dark:border-amber-900/30">
            <Button
              variant="outline"
              size="sm"
              onClick={() => advanceMutation.mutate('catechism')}
              disabled={advanceMutation.isPending}
              className="w-full border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-900/30"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Advance to Next Week
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
