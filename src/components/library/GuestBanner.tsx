import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Sparkle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEY = 'familypath_guest_views';
const DISMISSED_KEY = 'familypath_guest_banner_dismissed';
const VIEW_THRESHOLD = 3;

interface GuestBannerProps {
  /** Increment this when user views a new item */
  incrementView?: boolean;
}

export function GuestBanner({ incrementView = false }: GuestBannerProps) {
  const { isAuthenticated } = useAuth();
  const [show, setShow] = useState(false);
  const [_viewCount, setViewCount] = useState(0);

  useEffect(() => {
    // Don't show for authenticated users
    if (isAuthenticated) {
      setShow(false);
      return;
    }

    // Check if already dismissed this session
    const dismissed = sessionStorage.getItem(DISMISSED_KEY);
    if (dismissed === 'true') {
      setShow(false);
      return;
    }

    // Get current view count
    const stored = localStorage.getItem(STORAGE_KEY);
    let count = stored ? parseInt(stored, 10) : 0;

    // Increment if requested
    if (incrementView) {
      count += 1;
      localStorage.setItem(STORAGE_KEY, String(count));
    }

    setViewCount(count);

    // Show banner if threshold reached
    if (count >= VIEW_THRESHOLD) {
      setShow(true);
    }
  }, [isAuthenticated, incrementView]);

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem(DISMISSED_KEY, 'true');
  };

  // Static version for components that just want to track views
  if (!show) {
    return null;
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:max-w-md"
        >
          <div className="relative rounded-xl border bg-card/95 backdrop-blur-sm p-4 shadow-xl">
            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="flex items-start gap-3 pr-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Sparkle className="h-5 w-5 text-primary" weight="fill" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Enjoying the library?
                </p>
                <p className="text-sm text-muted-foreground">
                  Sign in to save your progress, get personalized suggestions, and track your family's journey.
                </p>
                <div className="flex gap-2 pt-1">
                  <Button asChild size="sm">
                    <Link to="/login">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Free Account
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDismiss}>
                    Maybe Later
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to track guest views without rendering anything
 * Use this in list components to increment the view counter
 */
export function useGuestViewTracker() {
  const { isAuthenticated } = useAuth();

  const trackView = () => {
    if (isAuthenticated) return;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    const count = stored ? parseInt(stored, 10) : 0;
    localStorage.setItem(STORAGE_KEY, String(count + 1));
  };

  return { trackView };
}
