import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Sparkle } from '@phosphor-icons/react';
import { paths as pathsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PathCard } from '@/components/paths/PathCard';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { LearningPath, PathSubscription, PathWithProgress } from '@/types/paths';

export default function PathsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  // Fetch all available paths
  const { data: allPaths, isLoading: isLoadingPaths } = useQuery({
    queryKey: ['learning-paths'],
    queryFn: pathsApi.list,
  });

  // Fetch user's subscriptions (only if authenticated)
  const { data: subscriptions, isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ['path-subscriptions'],
    queryFn: pathsApi.getSubscriptions,
    enabled: isAuthenticated,
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: (pathId: string) => pathsApi.subscribe(pathId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['path-subscriptions'] });
      toast.success('Path started! Check your dashboard for today\'s content.');
      setLoadingPath(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to start path');
      setLoadingPath(null);
    },
  });

  // Pause mutation
  const pauseMutation = useMutation({
    mutationFn: (pathId: string) => pathsApi.pause(pathId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['path-subscriptions'] });
      toast.success('Path paused');
      setLoadingPath(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to pause path');
      setLoadingPath(null);
    },
  });

  // Resume mutation
  const resumeMutation = useMutation({
    mutationFn: (pathId: string) => pathsApi.resume(pathId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['path-subscriptions'] });
      toast.success('Path resumed');
      setLoadingPath(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to resume path');
      setLoadingPath(null);
    },
  });

  // Merge paths with subscriptions
  const pathsWithProgress: PathWithProgress[] = (allPaths || []).map((path: LearningPath) => {
    const subscription = subscriptions?.find((sub: PathSubscription) => sub.path_id === path.id);
    const progress_percent = path.total_items && subscription
      ? Math.round((subscription.current_position / path.total_items) * 100)
      : undefined;
    return { ...path, subscription, progress_percent };
  });

  // Separate active and available paths
  const activePaths = pathsWithProgress.filter(p => p.subscription && !p.subscription.is_paused);
  const pausedPaths = pathsWithProgress.filter(p => p.subscription?.is_paused);
  const availablePaths = pathsWithProgress.filter(p => !p.subscription);

  const handleSubscribe = (pathId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoadingPath(pathId);
    subscribeMutation.mutate(pathId);
  };

  const handlePause = (pathId: string) => {
    setLoadingPath(pathId);
    pauseMutation.mutate(pathId);
  };

  const handleResume = (pathId: string) => {
    setLoadingPath(pathId);
    resumeMutation.mutate(pathId);
  };

  const handleView = () => {
    navigate('/dashboard');
  };

  const isLoading = isLoadingPaths || (isAuthenticated && isLoadingSubscriptions);

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="py-2 space-y-2">
        <div className="flex items-center gap-3">
          <Compass className="h-8 w-8 text-primary" weight="duotone" />
          <h1 className="text-3xl font-display font-bold text-foreground">Learning Paths</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Choose your family's journey. Each path provides a structured rhythm of content 
          tailored to your children's ages—delivered daily or weekly to your dashboard.
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && (
        <>
          {/* Active Paths */}
          {activePaths.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                <Sparkle className="h-5 w-5 text-primary" weight="fill" />
                Your Active Paths
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activePaths.map((path, index) => (
                  <motion.div
                    key={path.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PathCard
                      path={path}
                      subscription={path.subscription}
                      onPause={() => handlePause(path.id)}
                      onView={handleView}
                      isAuthenticated={isAuthenticated}
                      isLoading={loadingPath === path.id}
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Paused Paths */}
          {pausedPaths.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-muted-foreground mb-4">
                Paused Paths
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pausedPaths.map((path, index) => (
                  <motion.div
                    key={path.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PathCard
                      path={path}
                      subscription={path.subscription}
                      onResume={() => handleResume(path.id)}
                      onView={handleView}
                      isAuthenticated={isAuthenticated}
                      isLoading={loadingPath === path.id}
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Available Paths */}
          {availablePaths.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {isAuthenticated ? 'Available Paths' : 'Explore Learning Paths'}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availablePaths.map((path, index) => (
                  <motion.div
                    key={path.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PathCard
                      path={path}
                      onSubscribe={() => handleSubscribe(path.id)}
                      isAuthenticated={isAuthenticated}
                      isLoading={loadingPath === path.id}
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {pathsWithProgress.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Compass className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No learning paths available yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
