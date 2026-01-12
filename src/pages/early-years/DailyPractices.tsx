import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { activities as activitiesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Baby,
  Heart,
  Sun,
  Moon,
  Flower,
  Drop,
  CircleNotch,
  Clock,
  ArrowRight
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

type DailyPracticeContext = 'feeding' | 'diapering' | 'holding' | 'sleep' | 'outdoor';

interface ContextOption {
  id: DailyPracticeContext;
  label: string;
  icon: React.ElementType;
  description: string;
}

const CONTEXT_OPTIONS: ContextOption[] = [
  { id: 'feeding', label: 'Feeding', icon: Heart, description: 'Mealtime moments' },
  { id: 'diapering', label: 'Diapering', icon: Drop, description: 'Changing time' },
  { id: 'holding', label: 'Holding', icon: Baby, description: 'Cuddle time' },
  { id: 'sleep', label: 'Sleep', icon: Moon, description: 'Rest routines' },
  { id: 'outdoor', label: 'Outdoor', icon: Sun, description: 'Fresh air time' },
];

export default function DailyPractices() {
  const navigate = useNavigate();
  const { children } = useAuth();
  const [selectedContext, setSelectedContext] = useState<DailyPracticeContext | null>(null);

  // Get youngest child to check if they have an infant
  const youngestChild = children?.length > 0 
    ? [...children].sort((a, b) => a.ageInMonths - b.ageInMonths)[0] 
    : null;
  const hasInfant = youngestChild && youngestChild.ageInMonths <= 12;

  const { data: practices, isLoading, error } = useQuery({
    queryKey: ['daily-practices', selectedContext],
    queryFn: () => activitiesApi.list({ 
      formationType: 'daily_practice',
      context: selectedContext || undefined,
      ageMonths: youngestChild?.ageInMonths
    }),
    enabled: !!selectedContext,
  });

  if (!hasInfant) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <EmptyState
          icon={Baby}
          title="Daily Practices for Infants"
          description="This section is designed for families with children under 12 months. Add an infant to your family to access these gentle daily connection activities."
        />
        <div className="flex justify-center mt-6">
          <Button onClick={() => navigate('/settings')}>
            Add a Child
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-2xl border border-primary/10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Baby className="h-8 w-8 text-primary" weight="duotone" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Daily Practices
            </h1>
            <p className="text-muted-foreground">
              Gentle connection activities for {youngestChild?.name}'s first year. 
              No assessments, no pressure—just being present together.
            </p>
          </div>
        </div>
      </div>

      {/* Guidance Banner */}
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Flower className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" weight="fill" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <span className="font-semibold">Remember:</span> These aren't tasks to complete. 
              They're invitations to slow down during everyday moments. Your presence is the curriculum.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context Selector */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Choose a moment
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {CONTEXT_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedContext === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => setSelectedContext(option.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-sm" 
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg",
                  isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="h-5 w-5" weight={isSelected ? "fill" : "duotone"} />
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Activities List */}
      {selectedContext && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            {CONTEXT_OPTIONS.find(c => c.id === selectedContext)?.label} Activities
            {practices && (
              <Badge variant="secondary" className="font-normal">
                {practices.length} ideas
              </Badge>
            )}
          </h2>

          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3 mt-1" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-destructive/20">
              <CardContent className="py-8 text-center">
                <p className="text-destructive">Failed to load activities. Please try again.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : practices && practices.length > 0 ? (
            <div className="grid gap-4">
              {practices.map((practice: any) => (
                <Card 
                  key={practice.id} 
                  className="hover:border-primary/30 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/early-years/activities/${practice.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {practice.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {practice.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {practice.duration_minutes} min
                          </span>
                          <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                            {practice.min_age_months}-{practice.max_age_months} months
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Baby className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" weight="duotone" />
                <h3 className="font-semibold text-foreground mb-1">No activities found</h3>
                <p className="text-sm text-muted-foreground">
                  We don't have {selectedContext} activities for {youngestChild?.ageInMonths} month olds yet.
                  Try a different moment or check back later!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Initial state - no context selected */}
      {!selectedContext && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Baby className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" weight="duotone" />
            <h3 className="font-semibold text-foreground mb-1">Choose a moment above</h3>
            <p className="text-sm text-muted-foreground">
              Select when you'd like activity ideas—during feeding, changing, holding, sleep, or outdoor time.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
