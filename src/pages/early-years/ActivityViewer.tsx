import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activities as activitiesApi, observations, students } from '@/lib/api';
import { DOMAIN_LABELS, type EarlyYearsDomain, type MasteryLevel } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ErrorState } from '@/components/ui/ErrorState';
import { ObservationModal } from '@/components/early-years/ObservationModal';
import { PortfolioUploadModal } from '@/components/portfolio/PortfolioUploadModal';
import { UpvoteButton } from '@/components/feedback/UpvoteButton';
import { CommentSection } from '@/components/feedback/CommentSection';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Package,
  ListOrdered,
  Target,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Users,
  Book,
  Smile,
  AlertTriangle,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const domainColors: Record<EarlyYearsDomain, string> = {
  'motor': 'bg-domain-motor/10 text-domain-motor border-domain-motor/20',
  'language': 'bg-domain-language/10 text-domain-language border-domain-language/20',
  'cognitive': 'bg-domain-cognitive/10 text-domain-cognitive border-domain-cognitive/20',
  'social-emotional': 'bg-domain-social/10 text-domain-social border-domain-social/20',
  'pre-academic': 'bg-domain-academic/10 text-domain-academic border-domain-academic/20',
};

// Map API response fields to UI expected fields
interface TieredExpectation {
  age_min: number;
  age_max: number;
  tier: string;
  expectation: string;
}

interface ApiActivity {
  id: string;
  title: string;
  description: string;
  domain: EarlyYearsDomain;
  duration_minutes: number;
  difficulty: number;
  materials: string[];
  instructions: string[];
  success_indicators: string[];
  tips: string[];
  easier_variation: string;
  harder_variation: string;
  min_age_months: number;
  max_age_months: number;
  // New fields for family sessions
  activity_type?: 'family_session' | 'individual' | 'daily_practice';
  tiered_expectations?: TieredExpectation[];
  uses_core_kit?: number;
  mess_level?: string;
  setting?: string;
  parent_script?: string;
  // Infancy mode fields
  assessment_prohibited?: number;
  context_embedding?: string;
  // Phase 4 fields
  safety_note?: string;
  cultural_notes?: string;
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
  successIndicators: string[];
  tips: string[];
  easierVariation: string;
  harderVariation: string;
  minAgeMonths: number;
  maxAgeMonths: number;
  // Family session fields
  activityType?: 'family_session' | 'individual' | 'daily_practice';
  tieredExpectations?: TieredExpectation[];
  usesCoreKit?: boolean;
  messLevel?: string;
  setting?: string;
  parentScript?: string;
  // Infancy mode fields
  assessmentProhibited?: boolean;
  contextEmbedding?: 'feeding' | 'diapering' | 'holding' | 'sleep' | 'outdoor' | null;
  // Phase 4 fields
  safetyNote?: string;
  culturalNotes?: string;
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
  successIndicators: activity.success_indicators || [],
  tips: activity.tips || [],
  easierVariation: activity.easier_variation || '',
  harderVariation: activity.harder_variation || '',
  minAgeMonths: activity.min_age_months,
  maxAgeMonths: activity.max_age_months,
  // Family session fields
  activityType: activity.activity_type,
  tieredExpectations: Array.isArray(activity.tiered_expectations) ? activity.tiered_expectations : [],
  usesCoreKit: activity.uses_core_kit === 1,
  messLevel: activity.mess_level,
  setting: activity.setting,
  parentScript: activity.parent_script,
  // Infancy mode fields
  assessmentProhibited: activity.assessment_prohibited === 1,
  contextEmbedding: activity.context_embedding as Activity['contextEmbedding'] || null,
  safetyNote: activity.safety_note,
  culturalNotes: activity.cultural_notes,
});

export default function ActivityViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedChild } = useAuth();
  const queryClient = useQueryClient();

  const [showEasier, setShowEasier] = useState(false);
  const [showHarder, setShowHarder] = useState(false);

  const [observationModalOpen, setObservationModalOpen] = useState(false);
  const [portfolioUploadOpen, setPortfolioUploadOpen] = useState(false);

  // Fetch activity from API
  const { data: activityData, isLoading: isLoadingActivity, isError: isActivityError, error: activityError } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => activitiesApi.get(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch observations for this student
  const { data: observationsData } = useQuery({
    queryKey: ['observations', selectedChild?.id],
    queryFn: () => students.getObservations(selectedChild!.id),
    enabled: !!selectedChild,
    staleTime: 2 * 60 * 1000,
  });

  // Mutation for creating observation
  const createObservationMutation = useMutation({
    mutationFn: (data: { masteryLevel: string; parentNotes?: string }) =>
      observations.create({
        studentId: selectedChild!.id,
        activityId: id!,
        masteryLevel: data.masteryLevel,
        parentNotes: data.parentNotes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations', selectedChild?.id] });
      queryClient.invalidateQueries({ queryKey: ['progress', selectedChild?.id] });
    },
  });

  const activity = activityData ? mapApiActivity(activityData) : undefined;

  // Check if activity was completed by looking at observations
  const previousResult = observationsData?.find(
    (obs: any) => obs.activity_id === id
  );
  const isCompleted = !!previousResult;

  // Loading state
  if (isLoadingActivity) {
    return (
      <div className="space-y-6 max-w-3xl pb-8">
        <Skeleton className="h-8 w-16" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-full" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isActivityError) {
    return (
      <ErrorState
        title="Failed to Load Activity"
        message={activityError instanceof Error ? activityError.message : "We couldn't load this activity. Please try again."}
        onRetry={() => navigate(-1)}
        showHomeButton={true}
      />
    );
  }

  if (!activity) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <p className="text-muted-foreground">Activity not found</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const handleObservationSubmit = async (masteryLevel: MasteryLevel, notes?: string) => {
    if (!selectedChild) return;

    try {
      await createObservationMutation.mutateAsync({ masteryLevel, parentNotes: notes });
      setObservationModalOpen(false);
      toast.success('Great job!', {
        description: `Observation recorded for ${activity.title}`,
      });
    } catch (error) {
      toast.error('Failed to save observation', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl pb-8">
      {/* Back Navigation */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="gap-2 -ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="outline" className={cn(domainColors[activity.domain], 'mb-2')}>
              {DOMAIN_LABELS[activity.domain]}
            </Badge>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {activity.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {activity.description}
            </p>
          </div>
          {isCompleted && (
            <Badge className="bg-mastery-secure/10 text-mastery-secure border-mastery-secure/20 shrink-0 gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </Badge>
          )}
          <UpvoteButton contentType="activity" contentId={activity.id} />
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{activity.estimatedMinutes} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Difficulty:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-2 w-4 rounded-full ${level <= activity.difficultyLevel ? 'bg-primary' : 'bg-muted'
                    }`}
                />
              ))}
            </div>
          </div>
          <span>Ages {activity.minAgeMonths}-{activity.maxAgeMonths} months</span>
        </div>
      </div>

      {/* Safety Note - Critical Warning */}
      {activity.safetyNote && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200">
          <AlertTriangle className="h-4 w-4 stroke-red-600 dark:stroke-red-400" />
          <AlertTitle className="text-red-700 dark:text-red-300">Safety Warning</AlertTitle>
          <AlertDescription>
            {activity.safetyNote}
          </AlertDescription>
        </Alert>
      )}

      {/* Cultural Context */}
      {activity.culturalNotes && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-700 dark:text-blue-300">Cultural Context</AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            {activity.culturalNotes}
          </AlertDescription>
        </Alert>
      )}

      {/* Shepherd's Script */}
      {activity.parentScript && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded-r-lg shadow-sm">
          <div className="flex items-start gap-3">
            <Book className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Shepherd's Script</p>
              <p className="text-amber-900 dark:text-amber-100 italic text-lg leading-relaxed">"{activity.parentScript}"</p>
              <p className="text-xs text-amber-700 dark:text-amber-300/80 pt-1">Read this to your child to connect this activity to God's truth.</p>
            </div>
          </div>
        </div>
      )}

      {/* Materials */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Materials Needed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activity.materials.map((material, idx) => (
              <li key={idx} className="flex items-center gap-2 text-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {material}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ListOrdered className="h-5 w-5 text-primary" />
            Step-by-Step Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {activity.instructions.map((instruction, idx) => (
              <li key={idx} className="flex gap-4">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                  {idx + 1}
                </span>
                <p className="text-foreground pt-0.5">{instruction}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Success Indicators */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            What Success Looks Like
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {activity.successIndicators.map((indicator, idx) => (
              <li key={idx} className="flex items-start gap-2 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-mastery-secure mt-1 shrink-0" />
                {indicator}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Tiered Expectations - Only show for family sessions */}
      {activity.activityType === 'family_session' && activity.tieredExpectations && activity.tieredExpectations.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Users className="h-5 w-5" />
              Age-Appropriate Expectations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This is a family activity! Here's what to expect for different ages:
            </p>
            <div className="space-y-3">
              {activity.tieredExpectations.map((tier, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                  <div className="shrink-0 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                    {tier.tier}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">
                      Ages {tier.age_min}-{tier.age_max} months
                    </p>
                    <p className="text-sm text-foreground">{tier.expectation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      {activity.tips && activity.tips.length > 0 && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-accent">
              <Lightbulb className="h-5 w-5" />
              Tips for Parents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {activity.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-foreground">
                  <Sparkles className="h-4 w-4 text-accent mt-1 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Variations */}
      <div className="space-y-3">
        {activity.easierVariation && (
          <Card className="overflow-hidden">
            <button
              onClick={() => setShowEasier(!showEasier)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium text-foreground flex items-center gap-2">
                <ChevronDown className="h-4 w-4 text-mastery-emerging" />
                Too Hard? Try the Easier Version
              </span>
              {showEasier ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {showEasier && (
              <CardContent className="pt-0 pb-4 border-t bg-muted/30">
                <p className="text-muted-foreground pt-3">{activity.easierVariation}</p>
              </CardContent>
            )}
          </Card>
        )}

        {activity.harderVariation && (
          <Card className="overflow-hidden">
            <button
              onClick={() => setShowHarder(!showHarder)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium text-foreground flex items-center gap-2">
                <ChevronUp className="h-4 w-4 text-mastery-secure" />
                Too Easy? Try the Challenge Version
              </span>
              {showHarder ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {showHarder && (
              <CardContent className="pt-0 pb-4 border-t bg-muted/30">
                <p className="text-muted-foreground pt-3">{activity.harderVariation}</p>
              </CardContent>
            )}
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        {/* Daily practices: No assessment - just a soft acknowledgement */}
        {activity.assessmentProhibited || activity.activityType === 'daily_practice' ? (
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              toast.success('What a lovely moment together!', {
                description: 'These small connections matter more than any milestone.',
              });
              navigate('/early-years/activities');
            }}
            className="w-full sm:w-auto gap-2"
          >
            <Smile className="h-4 w-4" />
            That was lovely
          </Button>
        ) : isCompleted ? (
          <>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setObservationModalOpen(true)}
              className="flex-1"
            >
              Update Observation
            </Button>
            <Button
              size="lg"
              onClick={() => navigate('/early-years/activities')}
              className="flex-1 gap-2"
            >
              Browse Activities
              <ArrowRight className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            size="lg"
            onClick={() => setObservationModalOpen(true)}
            className="w-full sm:w-auto gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Complete Activity
          </Button>
        )}
      </div>

      {/* Previous Result Info */}
      {previousResult && (
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              Last completed on {new Date(previousResult.created_at).toLocaleDateString()}
              {previousResult.parent_notes && (
                <span> — "{previousResult.parent_notes}"</span>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Observation Modal */}
      <ObservationModal
        open={observationModalOpen}
        onOpenChange={setObservationModalOpen}
        activityTitle={activity.title}
        onSubmit={handleObservationSubmit}
        onAddToPortfolio={() => {
          setObservationModalOpen(false);
          setPortfolioUploadOpen(true);
        }}
      />

      <PortfolioUploadModal
        studentId={selectedChild?.id || ''}
        isOpen={portfolioUploadOpen}
        onClose={() => setPortfolioUploadOpen(false)}
        onUploadComplete={() => {
          toast.success('Added to portfolio!');
        }}
        relatedActivityId={activity.id}
        preselectedDomain={activity.domain}
      />

      <div className="pt-8 border-t">
        <CommentSection contentType="activity" contentId={activity.id} />
      </div>
    </div>
  );
}
