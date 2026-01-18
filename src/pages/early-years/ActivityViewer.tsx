import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activities as activitiesApi, evidences, students } from '@/lib/api';
import { DOMAIN_LABELS, type EarlyYearsDomain, type HabitStage, type FormationStage } from '@/types';
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

const virtueColors: Record<string, string> = {
  'Wisdom': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'Stewardship': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  'Love': 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
  'Order': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  'Wonder': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
};

// Map API response fields to UI expected fields
interface TieredExpectation {
  age_min: number;
  age_max: number;
  tier: string;
  expectation: string;
}

interface ApiFormation {
  id: string;
  title: string;
  description: string;
  primary_virtue: string;
  formation_type: 'habit' | 'skill' | 'liturgy' | 'service' | 'rest' | 'family_session' | 'daily_practice'; // Inclusive
  parent_posture: string;
  context_anchor: string;
  guide_steps: string[];
  duration_minutes: number;
  difficulty: number;
  materials: string[];
  success_indicators: string[];
  tips: string[];
  easier_variation: string;
  harder_variation: string;
  min_age_months: number;
  max_age_months: number;
  cultural_notes?: string;
  safety_note?: string;
  parent_script?: string;
  tiered_expectations?: TieredExpectation[];
  uses_core_kit?: number;
  mess_level?: string;
  setting?: string;
  assessment_prohibited?: number;
  context_embedding?: string;
}

interface Formation {
  id: string;
  title: string;
  description: string;
  primaryVirtue: string;
  estimatedMinutes: number;
  difficultyLevel: number;
  materials: string[];
  guideSteps: string[];
  successIndicators: string[];
  tips: string[];
  easierVariation: string;
  harderVariation: string;
  minAgeMonths: number;
  maxAgeMonths: number;
  // Formation specific
  formationType: string;
  parentPosture: string;
  contextAnchor: string;

  // Legacy support fields
  tieredExpectations?: TieredExpectation[];
  usesCoreKit?: boolean;
  messLevel?: string;
  setting?: string;
  parentScript?: string;
  assessmentProhibited?: boolean;
  contextEmbedding?: string | null;
  safetyNote?: string;
  culturalNotes?: string;
}

const mapApiFormation = (formation: ApiFormation): Formation => ({
  id: formation.id,
  title: formation.title,
  description: formation.description,
  primaryVirtue: formation.primary_virtue,
  estimatedMinutes: formation.duration_minutes,
  difficultyLevel: formation.difficulty,
  materials: formation.materials || [],
  guideSteps: formation.guide_steps || [],
  successIndicators: formation.success_indicators || [],
  tips: formation.tips || [],
  easierVariation: formation.easier_variation || '',
  harderVariation: formation.harder_variation || '',
  minAgeMonths: formation.min_age_months,
  maxAgeMonths: formation.max_age_months,

  formationType: formation.formation_type,
  parentPosture: formation.parent_posture,
  contextAnchor: formation.context_anchor,

  // Legacy mappings
  tieredExpectations: Array.isArray(formation.tiered_expectations) ? formation.tiered_expectations : [],
  usesCoreKit: formation.uses_core_kit === 1,
  messLevel: formation.mess_level,
  setting: formation.setting,
  parentScript: formation.parent_script,
  assessmentProhibited: formation.assessment_prohibited === 1,
  contextEmbedding: formation.context_embedding || null,
  safetyNote: formation.safety_note,
  culturalNotes: formation.cultural_notes,
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

  // Mutation for creating evidence
  const createEvidenceMutation = useMutation({
    mutationFn: (data: { stage: FormationStage; note?: string }) =>
      evidences.create({
        studentId: selectedChild!.id,
        formationId: id!,
        stage: data.stage,
        note: data.note,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations', selectedChild?.id] }); // Legacy key for now
      queryClient.invalidateQueries({ queryKey: ['progress', selectedChild?.id] });
    },
  });

  const activity = activityData ? mapApiFormation(activityData as any) : undefined;

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

  const handleObservationSubmit = async (stage: FormationStage, notes?: string) => {
    if (!selectedChild) return;

    try {
      await createEvidenceMutation.mutateAsync({ stage, note: notes });
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
            <Badge variant="outline" className={cn(virtueColors[activity.primaryVirtue] || 'bg-slate-100', 'mb-2')}>
              {activity.primaryVirtue}
            </Badge>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {activity.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {activity.description}
            </p>
          </div>
          {isCompleted && (
            <Badge className="bg-green-100 text-green-700 border-green-200 shrink-0 gap-1">
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
            Formation Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {activity.guideSteps.map((instruction, idx) => (
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
      {activity.formationType === 'family_session' && activity.tieredExpectations && activity.tieredExpectations.length > 0 && (
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
        {activity.assessmentProhibited || activity.formationType === 'daily_practice' ? (
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
        preselectedDomain={activity.primaryVirtue as any}
      />

      <div className="pt-8 border-t">
        <CommentSection contentType="activity" contentId={activity.id} />
      </div>
    </div>
  );
}
