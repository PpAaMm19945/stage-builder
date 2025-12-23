import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Compass, 
  BarChart3, 
  ArrowRight,
  Sparkles,
  Clock,
  Star
} from 'lucide-react';
import { getActivitiesForAge } from '@/data/activities';
import { DOMAIN_LABELS, type EarlyYearsDomain } from '@/types';

const domainColors: Record<EarlyYearsDomain, string> = {
  'motor': 'bg-domain-motor/10 text-domain-motor border-domain-motor/20',
  'language': 'bg-domain-language/10 text-domain-language border-domain-language/20',
  'cognitive': 'bg-domain-cognitive/10 text-domain-cognitive border-domain-cognitive/20',
  'social-emotional': 'bg-domain-social/10 text-domain-social border-domain-social/20',
  'pre-academic': 'bg-domain-academic/10 text-domain-academic border-domain-academic/20',
};

export default function Dashboard() {
  const { selectedChild } = useAuth();
  const navigate = useNavigate();

  // Get activities for selected child's age
  const activities = selectedChild 
    ? getActivitiesForAge(selectedChild.ageInMonths)
    : [];
  
  // Simple recommendation: pick first activity as primary, next 2 as alternatives
  const recommendedActivity = activities[0];
  const alternativeActivities = activities.slice(1, 4);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <span className="text-sm font-medium text-accent">Good morning!</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          {selectedChild ? `${selectedChild.name}'s Learning Journey` : 'Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          Here's what we recommend for today
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:border-primary/50 transition-colors group"
          onClick={() => navigate('/early-years/today')}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Today's Activity</p>
              <p className="text-sm text-muted-foreground">Start your daily routine</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-secondary/50 transition-colors group"
          onClick={() => navigate('/early-years/activities')}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
              <Compass className="h-6 w-6 text-secondary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Browse Activities</p>
              <p className="text-sm text-muted-foreground">{activities.length} available</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-colors" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-accent/50 transition-colors group"
          onClick={() => navigate('/early-years/progress')}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <BarChart3 className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">View Progress</p>
              <p className="text-sm text-muted-foreground">Track development</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
          </CardContent>
        </Card>
      </div>

      {/* Recommended Activity */}
      {recommendedActivity && (
        <Card className="overflow-hidden border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent fill-accent" />
                  <span className="text-sm font-medium text-accent">Recommended for today</span>
                </div>
                <CardTitle className="text-xl">{recommendedActivity.title}</CardTitle>
                <CardDescription>{recommendedActivity.description}</CardDescription>
              </div>
              <Badge className={domainColors[recommendedActivity.domain]}>
                {DOMAIN_LABELS[recommendedActivity.domain]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{recommendedActivity.estimatedMinutes} mins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Difficulty:</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1.5 w-3 rounded-full ${
                        level <= recommendedActivity.difficultyLevel
                          ? 'bg-primary'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <Button 
              onClick={() => navigate(`/early-years/activities/${recommendedActivity.id}`)}
              className="gap-2"
            >
              Start Activity
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Alternative Activities */}
      {alternativeActivities.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">More options for today</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alternativeActivities.map((activity) => (
              <Card 
                key={activity.id}
                className="cursor-pointer hover:border-muted-foreground/30 transition-colors"
                onClick={() => navigate(`/early-years/activities/${activity.id}`)}
              >
                <CardContent className="p-4 space-y-3">
                  <Badge variant="outline" className={domainColors[activity.domain]}>
                    {DOMAIN_LABELS[activity.domain]}
                  </Badge>
                  <h3 className="font-medium text-foreground">{activity.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
