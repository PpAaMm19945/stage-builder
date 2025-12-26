import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { family } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Sparkles,
  Clock,
  Package,
  Baby,
  Loader2,
  AlertCircle,
  Paintbrush,
  PlayCircle,
  Check,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { FamilyCompletionModal } from '@/components/family/FamilyCompletionModal';
import { FamilySession, MaterialItem } from '@/types';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSession, setSelectedSession] = useState<FamilySession | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
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

  if (!hasChildren) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Baby className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to SchoolOS!</h2>
        <p className="text-muted-foreground mb-8">
          To get started with your personalized family learning plan, please add your first child.
        </p>
        <Button onClick={() => navigate('/settings')} size="lg">
          Add Your First Child
        </Button>
      </div>
    );
  }

  const messLevelLabels: Record<string | number, string> = {
    1: 'No Mess',
    2: 'Low Mess',
    3: 'Medium Mess',
    4: 'High Mess',
    5: 'Very High Mess',
    'low': 'Low Mess',
    'medium': 'Medium Mess',
    'high': 'High Mess',
    'none': 'No Mess'
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-2xl border border-primary/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Calendar className="h-4 w-4" />
              <span>{new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
              Family Learning Plan
              <Sparkles className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="font-semibold text-foreground">{data.familySessions.length} activities</span>
              <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
              <span>~{Math.round(data.totalDuration)} min total</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => navigate('/settings')}>
              <Package className="w-4 h-4" />
              My Materials
            </Button>
          </div>
        </div>
      </div>

      {/* Materials Section */}
      <Card className="border-muted bg-muted/5">
        <CardHeader className="pb-3 border-b border-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Materials for Today
              </CardTitle>
              <CardDescription>
                {data.materials.length} items needed for all sessions
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="text-primary hover:text-primary/80">
              Update My Materials
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {data.materials.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {data.materials.map((m: MaterialItem, idx: number) => (
                <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${m.status === 'have' ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' : m.status === 'willing_to_buy' ? 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400' : 'bg-muted border-dashed border-muted-foreground/30 text-muted-foreground'}`}>
                  {m.status === 'have' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : m.status === 'willing_to_buy' ? (
                    <Circle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                  )}
                  <span className="text-sm font-medium">{m.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic">No specific materials needed today!</p>
          )}
        </CardContent>
      </Card>

      {/* Family Sessions */}
      <div className="space-y-6">
        {data.familySessions.map((session: FamilySession, index: number) => (
          <Card key={index} className="overflow-hidden border-2 hover:border-primary/20 transition-colors">
            <div className="bg-muted/30 p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none">{session.activity.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.activity.duration_minutes} min</span>
                    <span className="flex items-center gap-1"><Paintbrush className="w-3 h-3" /> {messLevelLabels[session.messLevel] || 'Variable Mess'}</span>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-0">
              <div className="p-6 space-y-6">
                <p className="text-foreground/80 leading-relaxed">
                  {session.activity.description}
                </p>

                <div className="space-y-4">
                  {session.childTiers.map(tier => (
                    <div key={tier.childId} className="bg-accent/5 rounded-xl p-4 border border-accent/10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">👶</span>
                        <span className="font-bold text-foreground">
                          {tier.childName}
                        </span>
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 ml-auto opacity-70">
                          {tier.tier}
                        </Badge>
                      </div>
                      <div className="flex gap-3 pl-1">
                        <Sparkles className="w-4 h-4 text-primary mt-1 shrink-0" />
                        <p className="text-sm font-medium text-foreground/80">
                          {tier.expectation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted/10 p-4 border-t flex gap-3">
                <Button className="flex-1 gap-2" variant="default" onClick={() => navigate(`/early-years/activities/${session.activity.id}`)}>
                  <PlayCircle className="w-4 h-4" />
                  Start Activity
                </Button>
                <Button className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={() => setSelectedSession(session)}>
                  <Check className="w-4 h-4" />
                  We Did It!
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {data.familySessions.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground">No family sessions scheduled for today.</p>
            <Button variant="link" onClick={() => window.location.reload()}>Refresh</Button>
          </div>
        )}
      </div>

      <FamilyCompletionModal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        session={selectedSession}
        onSuccess={() => {
          setSelectedSession(null);
          refetch();
        }}
      />
    </div>
  );
}
