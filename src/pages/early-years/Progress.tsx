import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useQuery } from '@tanstack/react-query';
import { students } from '@/lib/api';
import { DOMAIN_LABELS, type EarlyYearsDomain } from '@/types';
import {
  TrendUp,
  Pulse,
  Brain,
  Heart,
  BookOpen,
  HandGrabbing,
  Sparkle,
  Target,
  ChartBar,
  CalendarBlank,
  CheckCircle,
  ChatCircleText,
  SmileyMelting
} from '@phosphor-icons/react';

const domainIcons: Record<EarlyYearsDomain, React.ElementType> = {
  'motor': HandGrabbing,
  'language': ChatCircleText,
  'cognitive': Brain,
  'social-emotional': Heart, // or SmileyMelting
  'pre-academic': BookOpen,
};

const domainColors: Record<EarlyYearsDomain, { bg: string; text: string; progress: string }> = {
  'motor': { bg: 'bg-domain-motor/10', text: 'text-domain-motor', progress: 'bg-domain-motor' },
  'language': { bg: 'bg-domain-language/10', text: 'text-domain-language', progress: 'bg-domain-language' },
  'cognitive': { bg: 'bg-domain-cognitive/10', text: 'text-domain-cognitive', progress: 'bg-domain-cognitive' },
  'social-emotional': { bg: 'bg-domain-social/10', text: 'text-domain-social', progress: 'bg-domain-social' },
  'pre-academic': { bg: 'bg-domain-academic/10', text: 'text-domain-academic', progress: 'bg-domain-academic' },
};

const domainBadgeColors: Record<EarlyYearsDomain, string> = {
  'motor': 'bg-domain-motor/10 text-domain-motor border-domain-motor/20',
  'language': 'bg-domain-language/10 text-domain-language border-domain-language/20',
  'cognitive': 'bg-domain-cognitive/10 text-domain-cognitive border-domain-cognitive/20',
  'social-emotional': 'bg-domain-social/10 text-domain-social border-domain-social/20',
  'pre-academic': 'bg-domain-academic/10 text-domain-academic border-domain-academic/20',
};

export default function ProgressPage() {
  const { selectedChild } = useAuth();
  const navigate = useNavigate();

  // Fetch progress from API
  const { data: progressData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['progress', selectedChild?.id],
    queryFn: () => students.getProgress(selectedChild!.id),
    enabled: !!selectedChild,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch observations for activity history
  const { data: observationsData } = useQuery({
    queryKey: ['observations', selectedChild?.id],
    queryFn: () => students.getObservations(selectedChild!.id),
    enabled: !!selectedChild,
    staleTime: 2 * 60 * 1000,
  });

  const domains = Object.keys(DOMAIN_LABELS) as EarlyYearsDomain[];
  const totalCompleted = progressData?.totalCompleted || 0;

  // Calculate domains with at least one activity
  const domainsWithProgress = progressData?.byDomain?.filter((d: any) => d.count > 0).length || 0;

  // Get overall progress label based on total completed
  const getOverallProgressLabel = () => {
    if (totalCompleted === 0) return 'Getting Started';
    if (totalCompleted <= 5) return 'Beginning';
    if (totalCompleted <= 20) return 'Good Progress';
    return 'Excellent!';
  };

  // Get insights based on actual domain data
  const getInsights = () => {
    const domainData = progressData?.byDomain || [];
    if (domainData.length === 0) {
      return { strongDomain: null, focusDomain: null };
    }

    // Aggregate counts by domain
    const domainCounts: Record<string, number> = {};
    domainData.forEach((d: any) => {
      domainCounts[d.domain] = (domainCounts[d.domain] || 0) + d.count;
    });

    const sortedDomains = Object.entries(domainCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number));

    if (sortedDomains.length === 0) {
      return { strongDomain: null, focusDomain: null };
    }

    return {
      strongDomain: sortedDomains[0] ? { domain: sortedDomains[0][0], count: sortedDomains[0][1] } : null,
      focusDomain: sortedDomains.length > 1 ? { domain: sortedDomains[sortedDomains.length - 1][0], count: sortedDomains[sortedDomains.length - 1][1] } : null,
    };
  };

  if (!selectedChild) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <p className="text-muted-foreground">Please select a child to view progress</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div>
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-24 mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-2 w-full mt-2" />
                    <Skeleton className="h-4 w-48 mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <ErrorState
        title="Failed to Load Progress"
        message={error instanceof Error ? error.message : "We couldn't load your progress data. Please try again."}
        onRetry={() => refetch()}
      />
    );
  }

  // Empty state - show when no activities completed yet
  if (totalCompleted === 0) {
    return (
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">
            {selectedChild.name}'s Progress
          </h1>
          <p className="text-muted-foreground">
            Development overview across all learning domains
          </p>
        </div>

        <EmptyState
          icon={ChartBar}
          title="Start Your Journey"
          description="Complete your first activity to begin tracking progress. Every small step counts!"
          actionLabel="View Today's Activity"
          actionHref="/early-years/today"
        />
      </div>
    );
  }

  // Helper to get domain progress from API data
  const getDomainProgress = (domain: EarlyYearsDomain) => {
    const domainData = progressData?.byDomain?.filter((d: any) => d.domain === domain) || [];
    const totalCount = domainData.reduce((sum: number, d: any) => sum + (d.count || 0), 0);
    const masteryLevel = domainData.length > 0 ? domainData[0].mastery_level : 'Not Started';
    return {
      level: masteryLevel || 'Not Started',
      completed: totalCount,
    };
  };

  const insights = getInsights();

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-bold text-foreground">
          {selectedChild.name}'s Progress
        </h1>
        <p className="text-muted-foreground">
          Development overview across all learning domains
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendUp className="h-6 w-6 text-primary" weight="duotone" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalCompleted}</p>
                <p className="text-sm text-muted-foreground">Activities Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Pulse className="h-6 w-6 text-secondary" weight="duotone" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{domainsWithProgress}</p>
                <p className="text-sm text-muted-foreground">Domains Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-accent" weight="duotone" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{getOverallProgressLabel()}</p>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Domain Progress */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Progress by Domain</h2>
        <div className="grid gap-4">
          {domains.map((domain) => {
            const Icon = domainIcons[domain];
            const colors = domainColors[domain];
            const progress = getDomainProgress(domain);

            return (
              <Card key={domain} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-4">
                    <div className={`h-12 w-12 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} weight="duotone" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">
                          {DOMAIN_LABELS[domain]}
                        </h3>
                        <span className={`text-sm font-medium ${colors.text}`}>
                          {progress.level}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <Progress
                          value={progress.completed > 0 ? Math.min(progress.completed * 10, 100) : 0}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {progress.completed} {progress.completed === 1 ? 'activity' : 'activities'} completed
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Insights</CardTitle>
          <CardDescription>
            Based on {selectedChild.name}'s recent activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {totalCompleted === 0 ? (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-muted">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Target className="h-4 w-4 text-muted-foreground" weight="duotone" />
              </div>
              <div>
                <p className="font-medium text-foreground">Ready to Begin!</p>
                <p className="text-sm text-muted-foreground">
                  Complete some activities to see personalized insights about {selectedChild.name}'s progress.
                </p>
              </div>
            </div>
          ) : (
            <>
              {insights.strongDomain && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                  <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                    <Sparkle className="h-4 w-4 text-secondary" weight="duotone" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Strong in {DOMAIN_LABELS[insights.strongDomain.domain as EarlyYearsDomain] || insights.strongDomain.domain}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedChild.name} has completed {insights.strongDomain.count} {insights.strongDomain.count === 1 ? 'activity' : 'activities'} in this domain. Keep up the great work!
                    </p>
                  </div>
                </div>
              )}
              {insights.focusDomain && insights.focusDomain.domain !== insights.strongDomain?.domain && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <Target className="h-4 w-4 text-accent" weight="duotone" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Focus Area: {DOMAIN_LABELS[insights.focusDomain.domain as EarlyYearsDomain] || insights.focusDomain.domain}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Try some more activities in this domain to build a well-rounded skill set.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity History */}
      {observationsData && observationsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarBlank className="h-5 w-5 text-primary" weight="duotone" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Activities completed by {selectedChild.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              // Group observations by date
              const grouped = observationsData.reduce((acc: Record<string, any[]>, obs: any) => {
                const date = new Date(obs.created_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                });
                if (!acc[date]) acc[date] = [];
                acc[date].push(obs);
                return acc;
              }, {});

              // Take only first 3 days
              const dates = Object.keys(grouped).slice(0, 3);

              return dates.map((date) => (
                <div key={date} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">{date}</h4>
                  <div className="space-y-2">
                    {grouped[date].slice(0, 3).map((obs: any) => (
                      <div
                        key={obs.id}
                        onClick={() => navigate(`/early-years/activities/${obs.activity_id}`)}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <CheckCircle className="h-4 w-4 text-mastery-secure shrink-0" weight="fill" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {obs.activity_title || 'Activity'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={`text-xs ${domainBadgeColors[obs.domain as EarlyYearsDomain] || ''}`}
                            >
                              {DOMAIN_LABELS[obs.domain as EarlyYearsDomain] || obs.domain}
                            </Badge>
                            <span className="text-xs text-muted-foreground capitalize">
                              {obs.mastery_level}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
