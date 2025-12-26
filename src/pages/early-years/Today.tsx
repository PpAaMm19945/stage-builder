import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Clock,
  Star,
  RefreshCw,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { students } from '@/lib/api';
import { DOMAIN_LABELS, type EarlyYearsDomain } from '@/types';
import { AddChildForm } from '@/components/children/AddChildForm';

const domainColors: Record<EarlyYearsDomain, string> = {
  'motor': 'bg-domain-motor/10 text-domain-motor border-domain-motor/20',
  'language': 'bg-domain-language/10 text-domain-language border-domain-language/20',
  'cognitive': 'bg-domain-cognitive/10 text-domain-cognitive border-domain-cognitive/20',
  'social-emotional': 'bg-domain-social/10 text-domain-social border-domain-social/20',
  'pre-academic': 'bg-domain-academic/10 text-domain-academic border-domain-academic/20',
};

// Map API response fields to UI expected fields
interface ApiActivity {
  id: string;
  title: string;
  description: string;
  domain: EarlyYearsDomain;
  duration_minutes: number;
  difficulty: number;
  materials: string[];
  instructions: string[];
  min_age_months: number;
  max_age_months: number;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  domain: EarlyYearsDomain;
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
  domain: activity.domain,
  estimatedMinutes: activity.duration_minutes,
  difficultyLevel: activity.difficulty,
  materials: activity.materials || [],
  instructions: activity.instructions || [],
  minAgeMonths: activity.min_age_months,
  maxAgeMonths: activity.max_age_months,
});

export default function Today() {
  const { selectedChild } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch today's activities from API
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['today', selectedChild?.id],
    queryFn: () => students.getToday(selectedChild!.id),
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
          <UserPlus className="h-12 w-12 text-muted-foreground" />
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
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="p-4 rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Failed to load activities</h2>
          <p className="text-muted-foreground max-w-sm">
            {error instanceof Error ? error.message : 'Please try again later.'}
          </p>
        </div>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
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

      {/* Main Recommendation */}
      {recommendedActivity ? (
        <Card className="overflow-hidden border-2 border-primary/30 shadow-lg shadow-primary/5">
          <CardHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-accent fill-accent" />
                  <span className="text-sm font-semibold text-accent uppercase tracking-wide">
                    Today's Pick
                  </span>
                </div>
                <CardTitle className="text-2xl">{recommendedActivity.title}</CardTitle>
                <CardDescription className="text-base">
                  {recommendedActivity.description}
                </CardDescription>
              </div>
              <Badge className={`${domainColors[recommendedActivity.domain]} shrink-0`}>
                {DOMAIN_LABELS[recommendedActivity.domain]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Activity Details */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
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
            <div className="flex items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate(`/early-years/activities/${recommendedActivity.id}`)}
                className="gap-2"
              >
                Start Activity
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={handlePickAnother}
              >
                <RefreshCw className="h-4 w-4" />
                Pick Another
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No activities available for this age range.</p>
          </CardContent>
        </Card>
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
                  <Badge variant="outline" className={domainColors[activity.domain]}>
                    {DOMAIN_LABELS[activity.domain]}
                  </Badge>
                  <h3 className="font-medium text-foreground leading-tight">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                    <Clock className="h-3 w-3" />
                    <span>{activity.estimatedMinutes} mins</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
