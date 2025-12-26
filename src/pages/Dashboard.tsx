import { useQuery } from '@tanstack/react-query';
import { students } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Sparkles,
  Clock,
  Baby,
  Users,
  CheckCircle2,
  Circle,
  ArrowRight,
  Loader2,
  AlertCircle
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
    queryFn: students.getFamilyToday,
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
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Family Activities</h2>
              <p className="text-sm text-muted-foreground">Perfect for {data.children.map(c => c.name).join(' & ')} to do together</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.familyActivities.map((item, idx) => (
              <Card key={idx} className="border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <Badge className="w-fit mb-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200">
                    All Ages
                  </Badge>
                  <CardTitle className="text-lg">{item.activity.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.activity.description}
                  </p>

                  {/* Variations Pill */}
                  <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-2">
                    <p className="font-semibold text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Adjustments needed:
                    </p>
                    <div className="space-y-1">
                      {Object.entries(item.variations).map(([childId, variation]) => {
                        const childName = data.children.find(c => c.id === childId)?.name || 'Child';
                        if (variation === 'standard') return null;
                        return (
                          <div key={childId} className="flex justify-between items-center">
                            <span>{childName}</span>
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                              {variation === 'easier' ? 'Simpler' : 'More Challenge'}
                            </Badge>
                          </div>
                        );
                      })}
                      {Object.values(item.variations).every(v => v === 'standard') && (
                        <span className="text-muted-foreground italic">None - perfect for everyone!</span>
                      )}
                    </div>
                  </div>

                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => navigate(`/early-years/activities/${item.activity.id}`)}
                  >
                    View Activity
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Materials Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Materials Needed
              </CardTitle>
              <CardDescription>
                Gather these for today's plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.sharedMaterials.length > 0 ? (
                <ul className="space-y-3">
                  {data.sharedMaterials.map((material, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm group cursor-pointer">
                      <div className="mt-0.5 rounded-full border border-muted-foreground/30 w-4 h-4 flex items-center justify-center group-hover:border-primary transition-colors">
                        <div className="w-2.5 h-2.5 rounded-full bg-transparent group-active:bg-primary/20" />
                      </div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                        {material}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">No special materials needed today!</p>
              )}
            </CardContent>
          </Card>
        </aside>

        {/* Children Columns */}
        <div className={`lg:col-span-3 grid grid-cols-1 ${data.children.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
          {data.children.map((child) => (
            <div key={child.id} className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                    {child.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{child.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(child.ageInMonths / 12)}y {child.ageInMonths % 12}m • {child.activities.length} activities
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {child.activities.map((activity) => (
                  <Card
                    key={activity.id}
                    className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm group"
                    onClick={() => navigate(`/early-years/activities/${activity.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className={`${domainColors[activity.domain]} text-[10px] px-2 py-0.5 h-5`}>
                          {DOMAIN_LABELS[activity.domain]}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{activity.duration_minutes}m</span>
                        </div>
                      </div>

                      <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {activity.materials.length > 0 && (
                          <span className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-dashed">
                            <span className="font-medium text-foreground/80">Need:</span>
                            {activity.materials.slice(0, 2).join(', ')}
                            {activity.materials.length > 2 && ` +${activity.materials.length - 2}`}
                          </span>
                        )}
                      </p>
                    </CardContent>
                  </Card>
                ))}

                {child.activities.length === 0 && (
                  <div className="text-center py-8 border rounded-lg border-dashed bg-muted/10">
                    <p className="text-sm text-muted-foreground">All caught up for today!</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
