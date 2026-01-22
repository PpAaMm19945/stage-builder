import { motion } from 'framer-motion';
import { 
  MusicNotes, 
  Book, 
  Cross, 
  Globe, 
  Baby, 
  BookOpen,
  CheckCircle,
  Pause,
  Play,
  ArrowRight
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { LearningPath, PathSubscription } from '@/types/paths';

interface PathCardProps {
  path: LearningPath;
  subscription?: PathSubscription;
  onSubscribe?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onView?: () => void;
  isAuthenticated?: boolean;
  isLoading?: boolean;
}

const pathIcons: Record<string, typeof MusicNotes> = {
  hymn_journey: MusicNotes,
  catechism: Cross,
  liturgy: Cross,
  history_young: Globe,
  history_full: Globe,
  pastor_curtis: BookOpen,
  toddler_dev: Baby,
  early_reading: Book,
  custom: BookOpen,
};

const pathColors: Record<string, string> = {
  hymn_journey: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  catechism: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  liturgy: 'from-rose-500/20 to-rose-600/10 border-rose-500/30',
  history_young: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
  history_full: 'from-emerald-600/20 to-emerald-700/10 border-emerald-600/30',
  pastor_curtis: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  toddler_dev: 'from-pink-500/20 to-pink-600/10 border-pink-500/30',
  early_reading: 'from-sky-500/20 to-sky-600/10 border-sky-500/30',
  custom: 'from-slate-500/20 to-slate-600/10 border-slate-500/30',
};

const paceLabels: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  self_paced: 'Self-paced',
};

export function PathCard({
  path,
  subscription,
  onSubscribe,
  onPause,
  onResume,
  onView,
  isAuthenticated = false,
  isLoading = false,
}: PathCardProps) {
  const Icon = pathIcons[path.path_type] || BookOpen;
  const colorClass = pathColors[path.path_type] || pathColors.custom;
  
  const isSubscribed = !!subscription;
  const isPaused = subscription?.is_paused;
  const isCompleted = !!subscription?.completed_at;
  
  const progressPercent = path.total_items && subscription
    ? Math.round((subscription.current_position / path.total_items) * 100)
    : 0;

  // Age range display
  const minYears = Math.floor(path.min_age_months / 12);
  const maxYears = Math.floor(path.max_age_months / 12);
  const ageRange = minYears === 0 
    ? `Up to ${maxYears} years`
    : maxYears >= 18 
      ? `${minYears}+ years`
      : `${minYears}-${maxYears} years`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative rounded-xl border bg-gradient-to-br p-5 transition-all hover:shadow-lg',
        colorClass,
        isSubscribed && !isPaused && 'ring-2 ring-primary/50'
      )}
    >
      {/* Status Badge */}
      {isSubscribed && (
        <div className="absolute top-3 right-3">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-600">
              <CheckCircle weight="fill" className="h-3 w-3" />
              Complete
            </span>
          ) : isPaused ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600">
              <Pause weight="fill" className="h-3 w-3" />
              Paused
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
              Active
            </span>
          )}
        </div>
      )}

      {/* Icon & Title */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-background/80 shadow-sm">
          <Icon className="h-6 w-6 text-foreground" weight="duotone" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground leading-tight">{path.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{path.description}</p>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        <span className="inline-flex items-center rounded-full bg-background/60 px-2 py-0.5 text-muted-foreground">
          {paceLabels[path.pace]}
        </span>
        <span className="inline-flex items-center rounded-full bg-background/60 px-2 py-0.5 text-muted-foreground">
          {ageRange}
        </span>
        {path.total_items && (
          <span className="inline-flex items-center rounded-full bg-background/60 px-2 py-0.5 text-muted-foreground">
            {path.total_items} items
          </span>
        )}
      </div>

      {/* Progress Bar (if subscribed) */}
      {isSubscribed && path.total_items && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{subscription.current_position} of {path.total_items}</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!isSubscribed ? (
          <Button
            onClick={onSubscribe}
            disabled={isLoading || !isAuthenticated}
            className="flex-1"
            variant={isAuthenticated ? 'default' : 'secondary'}
          >
            {!isAuthenticated ? 'Sign in to Start' : isLoading ? 'Starting...' : 'Start Path'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <>
            <Button
              onClick={onView}
              variant="secondary"
              className="flex-1"
            >
              View Today's
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {!isCompleted && (
              isPaused ? (
                <Button
                  onClick={onResume}
                  variant="outline"
                  size="icon"
                  disabled={isLoading}
                >
                  <Play className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={onPause}
                  variant="outline"
                  size="icon"
                  disabled={isLoading}
                >
                  <Pause className="h-4 w-4" />
                </Button>
              )
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
