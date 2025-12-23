import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useActivityProgress } from '../contexts/ActivityProgressContext';
import { getActivityById, getActivitiesForAge } from '../data/activities';
import { DOMAIN_LABELS, DOMAIN_COLORS, type EarlyYearsDomain, type MasteryLevel } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ObservationModal } from '../components/ObservationModal';
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
} from 'lucide-react';
import { cn } from '@/shared/utils';

export default function ActivityViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedChild } = useAuth();
  const { addObservation, isActivityCompleted, getActivityResult } = useActivityProgress();
  
  const [showEasier, setShowEasier] = useState(false);
  const [showHarder, setShowHarder] = useState(false);
  const [observationModalOpen, setObservationModalOpen] = useState(false);

  const activity = id ? getActivityById(id) : undefined;
  
  const isCompleted = selectedChild && activity 
    ? isActivityCompleted(activity.id, selectedChild.id) 
    : false;
  
  const previousResult = selectedChild && activity 
    ? getActivityResult(activity.id, selectedChild.id) 
    : undefined;

  // Get next recommended activity
  const getNextActivity = () => {
    if (!selectedChild) return undefined;
    const ageActivities = getActivitiesForAge(selectedChild.ageInMonths);
    const currentIndex = ageActivities.findIndex(a => a.id === activity?.id);
    return ageActivities[currentIndex + 1] || ageActivities[0];
  };

  const nextActivity = getNextActivity();

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

  const handleObservationSubmit = (masteryLevel: MasteryLevel, notes?: string) => {
    if (!selectedChild) return;
    
    addObservation(activity.id, selectedChild.id, masteryLevel, notes);
    setObservationModalOpen(false);
    
    toast.success('Great job!', {
      description: `Observation recorded for ${activity.title}`,
    });
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
            <Badge variant="outline" className={cn(DOMAIN_COLORS[activity.domain], 'mb-2')}>
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
                  className={`h-2 w-4 rounded-full ${
                    level <= activity.difficultyLevel ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          <span>Ages {activity.minAgeMonths}-{activity.maxAgeMonths} months</span>
        </div>
      </div>

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
        {isCompleted ? (
          <>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setObservationModalOpen(true)}
              className="flex-1"
            >
              Update Observation
            </Button>
            {nextActivity && (
              <Button 
                size="lg"
                onClick={() => navigate(`/early-years/activities/${nextActivity.id}`)}
                className="flex-1 gap-2"
              >
                Next Activity
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
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
              Last completed on {new Date(previousResult.completedAt).toLocaleDateString()} 
              {previousResult.parentNotes && (
                <span> — "{previousResult.parentNotes}"</span>
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
      />
    </div>
  );
}
