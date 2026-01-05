
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { useQuery } from '@tanstack/react-query';
import { students } from '@/lib/api';
import { DOMAIN_LABELS, type EarlyYearsDomain, type Student } from '@/types';
import {
  TrendUp,
  Brain,
  Heart,
  BookOpen,
  HandGrabbing,
  Sparkle,
  ChartBar,
  CaretDown,
  CaretUp,
  ChatCircleText,
  CheckCircle,
  WarningCircle,
  Clock
} from '@phosphor-icons/react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const domainIcons: Record<EarlyYearsDomain, React.ElementType> = {
  'motor': HandGrabbing,
  'language': ChatCircleText,
  'cognitive': Brain,
  'social-emotional': Heart,
  'pre-academic': BookOpen,
};

// Simplified palette (Phase 1/2 requirement: soft colors, not multi-colored analytics)
const getDomainColor = (domain: EarlyYearsDomain) => {
  return 'bg-primary/10 text-primary';
};

function FamilyHealthCheck({ children }: { children: Student[] }) {
  // Mock health check logic for Phase 1 (since we don't have full backend analytics yet)
  const activeChildren = children.length; // Assume all active for now

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800/50 mb-8">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-full shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" weight="fill" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
              Family Growth Snapshot
            </h3>
            <p className="text-green-800/80 dark:text-green-200/80 mt-1">
              All {activeChildren} children are active and growing.
              Remember, "growth is slow and steady, like a tree planted by streams of water."
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChildProgressCard({ child }: { child: Student }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch progress for this specific child
  const { data: progressData, isLoading } = useQuery({
    queryKey: ['progress', child.id],
    queryFn: () => students.getProgress(child.id),
    staleTime: 5 * 60 * 1000,
  });

  const { data: observations } = useQuery({
    queryKey: ['observations', child.id],
    queryFn: () => students.getObservations(child.id),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-xl" />;
  }

  const totalActivities = progressData?.totalCompleted || 0;
  const recentActivity = observations && observations.length > 0 ? observations[0] : null;

  // Calculate domains with activity
  const activeDomains = progressData?.byDomain?.filter((d: any) => d.count > 0).length || 0;

  return (
    <Card className={cn("transition-all duration-200 border-l-4", isOpen ? "border-l-primary shadow-md" : "border-l-transparent hover:border-l-muted-foreground/30")}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {child.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{child.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  {child.ageInMonths} months • {totalActivities} activities completed
                </p>
              </div>
            </div>

            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                {isOpen ? 'Show Less' : 'View Details'}
                {isOpen ? <CaretUp className="w-4 h-4" /> : <CaretDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>

          {!isOpen && recentActivity && (
            <div className="mt-4 pl-[4rem] text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last active: <span className="font-medium text-foreground">{recentActivity.title || 'Unknown Activity'}</span> ({format(new Date(recentActivity.completed_at), 'MMM d')})
            </div>
          )}
        </div>

        <CollapsibleContent>
          <div className="px-6 pb-6 pt-0 space-y-6">
            <div className="h-px bg-border/50 w-full mb-6" />

            {/* Domain Progress Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(DOMAIN_LABELS) as EarlyYearsDomain[]).map((domain) => {
                const Icon = domainIcons[domain];
                const domainData = progressData?.byDomain?.find((d: any) => d.domain === domain);
                const count = domainData?.count || 0;

                // Gentle progress calculation (just based on activity count for now)
                // In Phase 2/3 this will be milestone-based
                const level = count > 10 ? 'Well Practiced' : count > 3 ? 'Growing' : 'Getting Started';
                const progressValue = Math.min((count / 15) * 100, 100); // Cap at 15 for visual fullness

                return (
                  <div key={domain} className="p-4 rounded-lg bg-muted/30 border border-muted/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("p-2 rounded-md", getDomainColor(domain))}>
                        <Icon className="w-5 h-5" weight="duotone" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{DOMAIN_LABELS[domain]}</div>
                        <div className="text-xs text-muted-foreground">{level}</div>
                      </div>
                      <div className="text-xs font-bold text-muted-foreground bg-background px-2 py-1 rounded-full border">
                        {count} acts
                      </div>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                  </div>
                );
              })}
            </div>

            {/* Encouragement / Insights */}
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
              <div className="flex items-start gap-3">
                <Sparkle className="w-5 h-5 text-blue-500 mt-0.5" weight="fill" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <span className="font-semibold">Observation:</span> {child.name} is showing interest in {activeDomains} different learning areas.
                  Continue to offer a broad "feast" of ideas from all domains.
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(`/early-years/portfolio?childId=${child.id}`)}>
                View Full Portfolio <TrendUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function ProgressPage() {
  const { children } = useAuth();

  if (!children || children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-xl font-bold">No children profiles found</h2>
        <p className="text-muted-foreground">Add a child in Settings to start tracking progress.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-bold text-foreground">Family Progress</h1>
        <p className="text-muted-foreground">
          Celebrating growth and faithfulness in the little things.
        </p>
      </div>

      {/* Family Summaries */}
      <FamilyHealthCheck children={children} />

      {/* One Card Per Child */}
      <div className="space-y-4">
        {children.map(child => (
          <ChildProgressCard key={child.id} child={child} />
        ))}
      </div>
    </div>
  );
}
