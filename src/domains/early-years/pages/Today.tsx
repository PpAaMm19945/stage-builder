import { useAuth } from '@/shared/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight,
  Clock,
  Star,
  RefreshCw
} from 'lucide-react';
import { getActivitiesForAge } from '../data/activities';
import { DOMAIN_LABELS, DOMAIN_COLORS, type EarlyYearsDomain } from '../types';

export default function Today() {
  const { selectedChild } = useAuth();
  const navigate = useNavigate();

  // Get activities for selected child's age
  const activities = selectedChild 
    ? getActivitiesForAge(selectedChild.ageInMonths)
    : [];
  
  const recommendedActivity = activities[0];
  const alternativeActivities = activities.slice(1, 4);

  if (!selectedChild) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <p className="text-muted-foreground">Please select a child to see today's activities</p>
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
              <Badge className={`${DOMAIN_COLORS[recommendedActivity.domain]} shrink-0`}>
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
                      className={`h-2 w-4 rounded-full ${
                        level <= recommendedActivity.difficultyLevel
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
                  <Badge variant="outline" className={DOMAIN_COLORS[activity.domain]}>
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
