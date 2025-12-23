import { useParams } from 'react-router-dom';
import { Lock, GraduationCap, BookOpen, School } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStageInfo } from '@/config/featureFlags';
import { LearningStage } from '@/types';

const stageIcons: Record<LearningStage, React.ElementType> = {
  'early-years': GraduationCap,
  'lower-primary': BookOpen,
  'middle-school': School,
  'upper-school': GraduationCap,
};

export default function LockedStage() {
  const { stage } = useParams<{ stage: string }>();
  const stageInfo = getStageInfo(stage as LearningStage);
  const Icon = stageIcons[stageInfo.id];

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-12 pb-8 px-8 space-y-6">
          <div className="relative mx-auto w-fit">
            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center">
              <Icon className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background border-2 border-muted flex items-center justify-center">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
              Coming Soon
            </Badge>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {stageInfo.label}
            </h1>
            <p className="text-muted-foreground">
              {stageInfo.description}
            </p>
          </div>

          <div className="pt-4 space-y-2 text-sm text-muted-foreground">
            <p className="font-medium">{stageInfo.ageRange}</p>
            {stageInfo.gradeRange && (
              <p>{stageInfo.gradeRange}</p>
            )}
          </div>

          <div className="pt-4 text-sm text-muted-foreground/70">
            We're working hard to bring you this stage. Stay tuned!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
