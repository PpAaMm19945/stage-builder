import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { family } from '@/lib/api';
import { 
  Calendar, 
  Sparkles,
  Clock,
  Users,
  Package,
  Baby,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { DOMAIN_LABELS, type EarlyYearsDomain } from '@/types';

const domainColors: Record<EarlyYearsDomain, string> = {
  'motor': 'bg-domain-motor/10 text-domain-motor border-domain-motor/20',
  'language': 'bg-domain-language/10 text-domain-language border-domain-language/20',
  'cognitive': 'bg-domain-cognitive/10 text-domain-cognitive border-domain-cognitive/20',
  'social-emotional': 'bg-domain-social/10 text-domain-social border-domain-social/20',
  'pre-academic': 'bg-domain-academic/10 text-domain-academic border-domain-academic/20',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['family-today'],
    queryFn: family.getToday,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Planning your family's day...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold">Unable to load dashboard</h3>
        <p className="text-muted-foreground mb-4">We couldn't get today's plan. Please try again.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const hasChildren = data.children.length > 0;
  const showFamilySection = data.children.length > 1 && data.familyActivities.length > 0;

  if (!hasChildren) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Baby className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to SchoolOS!</h2>
        <p className="text-muted-foreground mb-8">
          To get started with your personalized daily learning plan, please add your first child.
        </p>
        <Button onClick={() => navigate('/settings')} size="lg">
          Add Your First Child
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Calendar className="h-4 w-4" />
            <span>{new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            Family Command Center
            <Sparkles className="h-6 w-6 text-accent" />
          </h1>
          <p className="text-muted-foreground">
            You have a total of <span className="font-semibold text-foreground">{Math.round(data.totalDuration)} mins</span> of learning planned today.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/early-years/progress')}>
            View Progress
          </Button>
          <Button onClick={() => navigate('/early-years/activities')}>
            Browse Library
          </Button>
        </div>
      </div>

      {/* Family Activities Section */}
      {showFamilySection && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Family Activities</h2>
              <p className="text-sm text-muted-foreground">Perfect for {data.children.map(c => c.name).join(' & ')} to do together</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.familyActivities.map((item, idx) => (
              <Card key={idx} className="border-indigo-100 dark:border-indigo-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/early-years/activities/${item.activity.id}`)}>
                <CardHeader className="pb-3">
                  <Badge className="w-fit mb-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border-indigo-200 dark:border-indigo-800">
                    All Ages
                  </Badge>
                  <CardTitle className="text-lg">{item.activity.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.activity.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{item.activity.duration_minutes || 15} mins</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {data.children.map(child => (
                      <Badge key={child.id} variant="outline" className="text-xs">
                        {child.name}: {item.variations[child.id] || 'standard'}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Materials for Today */}
      {data.sharedMaterials.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
              <Package className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Materials for Today</h2>
              <p className="text-sm text-muted-foreground">Everything you need for today's activities</p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {data.sharedMaterials.map((material, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm py-1.5 px-3">
                    {material}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Per-Child Activity Streams */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Individual Learning Plans</h2>
        <div className={`grid gap-6 ${data.children.length === 1 ? 'grid-cols-1 max-w-2xl' : 'grid-cols-1 md:grid-cols-2'}`}>
          {data.children.map((child) => (
            <div key={child.id} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {child.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{child.name}</h3>
                  <p className="text-sm text-muted-foreground">{child.ageInMonths} months • {child.activities.length} activities</p>
                </div>
              </div>

              <div className="space-y-3">
                {child.activities.map((activity, idx) => (
                  <Card 
                    key={idx} 
                    className="cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => navigate(`/early-years/activities/${activity.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={domainColors[activity.domain as EarlyYearsDomain]}>
                              {DOMAIN_LABELS[activity.domain as EarlyYearsDomain]}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {activity.duration_minutes || 15} mins
                            </span>
                          </div>
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {activity.description}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {child.activities.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No activities scheduled for today
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
