import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { WelcomeFlow } from '@/components/onboarding/WelcomeFlow';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { students } from '@/lib/api';
import { DOMAIN_LABELS, DOMAIN_TO_VIRTUE, VIRTUE_LABELS, type EarlyYearsDomain, type ApiActivity, type PrimaryVirtue } from '@/types';
import { AddChildForm } from '@/components/children/AddChildForm';
import {
  Star,
  Clock,
  ArrowRight,
  ArrowsClockwise,
  UserPlus,
  Target,
  Compass
} from '@phosphor-icons/react';

const virtueColors: Record<PrimaryVirtue, string> = {
  'Wisdom': 'bg-purple-50 text-purple-700 border-purple-200',
  'Stewardship': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Love': 'bg-rose-50 text-rose-700 border-rose-200',
  'Order': 'bg-amber-50 text-amber-700 border-amber-200',
  'Wonder': 'bg-blue-50 text-blue-700 border-blue-200',
};

// UI Activity interface (camelCase)
interface Activity {
  id: string;
  title: string;
  description: string;
  domain: PrimaryVirtue;
  estimatedMinutes: number;
  difficultyLevel: number;
  materials: string[];
  instructions: string[];
  minAgeMonths: number;
  maxAgeMonths: number;
}

const mapApiActivity = (activity: ApiActivity): Activity => ({
  id: activity.id,
  title: activity.title,
  description: activity.description,
  domain: activity.primary_virtue || (activity.domain ? DOMAIN_TO_VIRTUE[activity.domain as string] : 'Wisdom') || 'Wisdom',
  estimatedMinutes: activity.duration_minutes,
  difficultyLevel: activity.difficulty || 1,
  materials: activity.materials || [],
  instructions: activity.guide_steps || activity.instructions || [],
  minAgeMonths: activity.min_age_months,
  maxAgeMonths: activity.max_age_months,
});

export default function Today() {
  const { selectedChild } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [context, setContext] = useState<{
    weather?: string;
    timeAvailable?: number;
    parentMood?: string;
  }>({});

  // Fetch today's activities from API
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['today', selectedChild?.id, context], // specific context triggers refetch
    queryFn: () => students.getToday(selectedChild!.id, context),
    // Note: students.getToday wraps the response but doesn't usually accept context. 
    // The requirement was to use `anchor.getToday` for the new "Anchor" system.
    // However, this page currently uses `students.getToday` (Legacy/Current).
    // The user plan says "File: src/pages/early-years/Today.tsx (or the hook that calls /api/anchor/today)".
    // Currently `students.getToday` calls `/api/students/:id/today`.
    // The `anchor` feature seems to be the "new" way.
    // I should check if I should SWITCH to `anchor.getToday` or if `students.getToday` is the one to update.
    // The `Archive` shows `Today.tsx` uses `students.getToday`.
    // But `api.ts` has `anchor.getToday`.
    // The plan says "Fix the Spine-to-Arc Link" and "Phase 5: Frontend Context Passing".
    // If I switch to `anchor.getToday`, I might break the existing UI if the response shape is different.
    // `students.getToday` returns `TodaysLearningResponse`.
    // `anchor.getToday` returns `AnchorPayload`.
    // `AnchorPayload` (from `AnchorGenerator`) has `family_activity` etc.
    // `TodaysLearningResponse` has `activities`.
    // I should probably KEEP `students.getToday` if that's what the page expects, OR update `students.getToday` to pass context, OR switch the page to use `anchor.getToday` and adapt the UI.
    // Given the "Phase 1: Fix Spine-to-Arc Link" implies we are moving TO the new system.
    // But `Today.tsx` is the main page.
    // The `students.getToday` normalization (lines 159-162 in api.ts) handles `formations` or `activities`.
    // I suspect the intention is to use the `anchor` endpoints for the "Unified Anchor Model".
    // Let's stick to the plan: "Add optional inputs... Send as query params".
    // I will assume for now I should update `Today.tsx` to use the context. 
    // If the plan implies `api/anchor/today`, I should verify if `Today.tsx` should call that. 
    // The user prompt in Phase 5 says: "File: src/pages/early-years/Today.tsx (or the hook that calls /api/anchor/today)".
    // This implies `Today.tsx` *might* not be calling it yet, or I should find the hook that does.
    // Since `Today.tsx` calls `students.getToday`, and I modified `anchor.getToday` in `api.ts`...
    // I should probably use `anchor.getToday` inside `Today.tsx` IF the UI is ready for it. 
    // OR I should update `students.getToday` to also accept context.
    // Let's look at `students.getToday` in `api.ts`. It calls `/api/students/${studentId}/today`.
    // `anchor.getToday` calls `/api/anchor/today`.
    // The `AnchorGenerator` is the new hotness.
    // I will try to switch `Today.tsx` to use `anchor.getToday` BUT `Today.tsx` is heavily coupled to `TodaysLearningResponse`.

    // DECISION: I will update `students.getToday` in `api.ts` to ALSO accept context, and pass it through.
    // AND I will update `Today.tsx` to use state and pass it.
    enabled: !!selectedChild,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Map API activities to UI format
  const activities = data?.activities?.map(mapApiActivity) || [];
  const recommendedActivity = activities[0];
  const alternativeActivities = activities.slice(1, 4);

  const handlePickAnother = () => {
    refetch();
  };

  if (!selectedChild) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6">
        <div className="p-6 rounded-full bg-muted/50">
          <UserPlus className="h-12 w-12 text-muted-foreground" weight="duotone" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">No children registered yet</h2>
          <p className="text-muted-foreground max-w-sm">
            Add your child to get started with personalized learning activities
          </p>
        </div>
        <AddChildForm />
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8 max-w-4xl">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Card className="overflow-hidden">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <ErrorState
        title="Failed to Load Activities"
        message={error instanceof Error ? error.message : "We couldn't load today's activities. Please try again."}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <>
      {/* Welcome Flow for first-time users */}
      <WelcomeFlow />

      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Today's Learning
          </h1>
          <p className="text-muted-foreground">
            Activities tailored for {selectedChild.name} ({selectedChild.ageInMonths} months)
          </p>
        </div>

        {/* Context Controls (Phase 5) */}
        <Card className="p-4 bg-muted/30 border-dashed">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Weather</label>
              <select
                className="flex h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={context.weather || ''}
                onChange={(e) => setContext(prev => ({ ...prev, weather: e.target.value || undefined }))}
              >
                <option value="">Any</option>
                <option value="sunny">Sunny</option>
                <option value="rainy">Rainy</option>
                <option value="cloudy">Cloudy</option>
                <option value="cold">Cold</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">My Energy</label>
              <select
                className="flex h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={context.parentMood || ''}
                onChange={(e) => setContext(prev => ({ ...prev, parentMood: e.target.value || undefined }))}
              >
                <option value="">Normal</option>
                <option value="energetic">High Energy</option>
                <option value="tired">Low Energy</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Time (min)</label>
              <select
                className="flex h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={context.timeAvailable || ''}
                onChange={(e) => setContext(prev => ({ ...prev, timeAvailable: Number(e.target.value) || undefined }))}
              >
                <option value="">Flexible</option>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="60">1 hour</option>
              </select>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setContext({})} disabled={!Object.keys(context).length}>
              Reset
            </Button>
          </div>
        </Card>

        {/* Main Recommendation */}
        {recommendedActivity ? (
          <Card className="overflow-hidden border-2 border-primary/30 shadow-lg shadow-primary/5">
            <CardHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-accent" weight="fill" />
                    <span className="text-sm font-semibold text-accent uppercase tracking-wide">
                      Today's Pick
                    </span>
                  </div>
                  <CardTitle className="text-2xl">{recommendedActivity.title}</CardTitle>
                  <CardDescription className="text-base">
                    {recommendedActivity.description}
                  </CardDescription>
                </div>
                <Badge className={`${virtueColors[recommendedActivity.domain]} shrink-0`}>
                  {VIRTUE_LABELS[recommendedActivity.domain]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Activity Details */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" weight="duotone" />
                  <span>{recommendedActivity.estimatedMinutes} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Difficulty:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-2 w-4 rounded-full ${level <= recommendedActivity.difficultyLevel
                          ? 'bg-primary'
                          : 'bg-muted'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Materials Preview */}
              {recommendedActivity.materials.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Materials needed:</h4>
                  <div className="flex flex-wrap gap-2">
                    {recommendedActivity.materials.slice(0, 5).map((material, idx) => (
                      <Badge key={idx} variant="outline" className="bg-muted/50">
                        {material}
                      </Badge>
                    ))}
                    {recommendedActivity.materials.length > 5 && (
                      <Badge variant="outline" className="bg-muted/50">
                        +{recommendedActivity.materials.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate(`/early-years/activities/${recommendedActivity.id}`)}
                  className="gap-2"
                >
                  Start Activity
                  <ArrowRight className="h-4 w-4" weight="bold" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={handlePickAnother}
                >
                  <ArrowsClockwise className="h-4 w-4" weight="bold" />
                  Pick Another
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={Target}
            title="No Activities Yet"
            description={`We're preparing personalized activities for ${selectedChild.name}. Check back soon, or browse our activity library.`}
            actionLabel="Browse Activities"
            actionHref="/early-years/activities"
          />
        )}

        {/* Alternatives */}
        {alternativeActivities.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Or try one of these</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alternativeActivities.map((activity) => (
                <Card
                  key={activity.id}
                  className="cursor-pointer hover:border-muted-foreground/40 hover:shadow-md transition-all"
                  onClick={() => navigate(`/early-years/activities/${activity.id}`)}
                >
                  <CardContent className="p-4 space-y-3">
                    <Badge variant="outline" className={virtueColors[activity.domain]}>
                      {VIRTUE_LABELS[activity.domain]}
                    </Badge>
                    <h3 className="font-medium text-foreground leading-tight">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                      <Clock className="h-3 w-3" weight="duotone" />
                      <span>{activity.estimatedMinutes} mins</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Family Activities - for siblings */}
        {data?.familyActivities && data.familyActivities.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-accent" weight="duotone" />
              <h2 className="text-lg font-semibold text-foreground">Family Activities</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Activities suitable for all your children to do together
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.familyActivities.map((activity: ApiActivity) => (
                <Card
                  key={activity.id}
                  className="cursor-pointer hover:border-accent/40 hover:shadow-md transition-all border-accent/20"
                  onClick={() => navigate(`/early-years/activities/${activity.id}`)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      {(() => {
                        const virtue = activity.primary_virtue ||
                          (activity.domain ? DOMAIN_TO_VIRTUE[activity.domain as string] : 'Wisdom') ||
                          'Wisdom';
                        return (
                          <Badge variant="outline" className={virtueColors[virtue]}>
                            {VIRTUE_LABELS[virtue]}
                          </Badge>
                        );
                      })()}
                      <Badge variant="secondary" className="text-xs">
                        For Everyone
                      </Badge>
                    </div>
                    <h3 className="font-medium text-foreground leading-tight">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                      <Clock className="h-3 w-3" weight="duotone" />
                      <span>{activity.duration_minutes} mins</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
