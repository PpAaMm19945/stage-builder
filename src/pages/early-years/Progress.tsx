import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { students } from '@/lib/api';
import { DOMAIN_LABELS, type EarlyYearsDomain } from '@/types';
import {
  TrendingUp,
  Activity,
  Brain,
  Heart,
  BookOpen,
  HandMetal,
  AlertCircle
} from 'lucide-react';

const domainIcons: Record<EarlyYearsDomain, React.ElementType> = {
  'motor': HandMetal,
  'language': Activity,
  'cognitive': Brain,
  'social-emotional': Heart,
  'pre-academic': BookOpen,
};

const domainColors: Record<EarlyYearsDomain, { bg: string; text: string; progress: string }> = {
  'motor': { bg: 'bg-domain-motor/10', text: 'text-domain-motor', progress: 'bg-domain-motor' },
  'language': { bg: 'bg-domain-language/10', text: 'text-domain-language', progress: 'bg-domain-language' },
  'cognitive': { bg: 'bg-domain-cognitive/10', text: 'text-domain-cognitive', progress: 'bg-domain-cognitive' },
  'social-emotional': { bg: 'bg-domain-social/10', text: 'text-domain-social', progress: 'bg-domain-social' },
  'pre-academic': { bg: 'bg-domain-academic/10', text: 'text-domain-academic', progress: 'bg-domain-academic' },
};

export default function ProgressPage() {
  const { selectedChild } = useAuth();

  // Fetch progress from API
  const { data: progressData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['progress', selectedChild?.id],
    queryFn: () => students.getProgress(selectedChild!.id),
    enabled: !!selectedChild,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const domains = Object.keys(DOMAIN_LABELS) as EarlyYearsDomain[];
  const totalCompleted = progressData?.totalCompleted || 0;

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
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="p-4 rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Failed to load progress</h2>
          <p className="text-muted-foreground max-w-sm">
            {error instanceof Error ? error.message : 'Please try again later.'}
          </p>
        </div>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  // Helper to get domain progress from API data
  const getDomainProgress = (domain: EarlyYearsDomain) => {
    const domainData = progressData?.byDomain?.find((d: any) => d.domain === domain);
    return {
      level: domainData?.mastery_level || 'Not Started',
      completed: domainData?.count || 0,
      total: 10, // Approximate total activities per domain
    };
  };

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
                <TrendingUp className="h-6 w-6 text-primary" />
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
                <Activity className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-sm text-muted-foreground">Domains Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Great</p>
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
            const percentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

            return (
              <Card key={domain} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-4">
                    <div className={`h-12 w-12 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} />
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
                          value={percentage}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {progress.completed} activities completed
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
          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
            <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
              <Heart className="h-4 w-4 text-secondary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Strong in Social Skills</p>
              <p className="text-sm text-muted-foreground">
                {selectedChild.name} shows excellent progress in social-emotional activities. Keep encouraging group play!
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
            <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="font-medium text-foreground">Focus Area: Pre-Academic</p>
              <p className="text-sm text-muted-foreground">
                Consider more sorting and pattern activities to build early numeracy skills.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
