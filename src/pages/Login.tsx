import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/api';
import { Users, CalendarDots, TrendUp, Path, CircleNotch, LockKey, DownloadSimple, ShieldCheck, ArrowRight, Warning, Books, MusicNotes, PuzzlePiece } from '@phosphor-icons/react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  const handleLogin = () => {
    setIsLoading(true);
    window.location.href = auth.getLoginUrl();
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Column - Login Form */}
      <div className="flex-1 flex flex-col justify-between p-6 md:p-10 lg:p-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Path className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            FamilyPath
          </span>
        </Link>

        {/* Form Content */}
        <div className="max-w-md w-full mx-auto lg:mx-0 space-y-8 py-12">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Unlock Your Family's Learning Path
            </h1>
            <p className="text-base text-muted-foreground">
              Sign in to create personalized learning paths for your children, track their growth,
              and get age-specific suggestions from our library.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="text-left">
              <Warning className="h-4 w-4" />
              <AlertTitle>Authentication Failed</AlertTitle>
              <AlertDescription>
                {message || 'An unknown error occurred. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Login Button */}
          <div className="space-y-4">
            <Button
              onClick={handleLogin}
              size="lg"
              className="w-full gap-3 h-14 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <CircleNotch className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </Button>

            <Button variant="ghost" className="w-full text-muted-foreground" asChild>
              <Link to="/library">
                Or continue browsing the library
              </Link>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <LockKey className="h-4 w-4" aria-hidden="true" />
              <span>Your data is never sold</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DownloadSimple className="h-4 w-4" aria-hidden="true" />
              <span>Export anytime</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>AI you control</span>
            </div>
          </div>

          <Link to="/trust" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 w-fit">
            Read our promise to families <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>

        {/* Footer */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            By signing in, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-foreground">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
          </p>
          <p>© 2025 FamilyPath. Made with love for families.</p>
        </div>
      </div>

      {/* Right Column - Decorative Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-l-3xl items-center justify-center p-16">
        <div className="max-w-sm space-y-10 text-center">
          {/* Feature highlights */}
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-domain-motor/10 flex items-center justify-center">
                  <Users className="h-7 w-7 text-domain-motor" weight="duotone" />
                </div>
                <p className="text-sm font-medium text-foreground">Child Profiles</p>
              </div>
              <div className="space-y-3">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-domain-cognitive/10 flex items-center justify-center">
                  <CalendarDots className="h-7 w-7 text-domain-cognitive" weight="duotone" />
                </div>
                <p className="text-sm font-medium text-foreground">Learning Paths</p>
              </div>
              <div className="space-y-3">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-domain-social/10 flex items-center justify-center">
                  <TrendUp className="h-7 w-7 text-domain-social" weight="duotone" />
                </div>
                <p className="text-sm font-medium text-foreground">Track Progress</p>
              </div>
            </div>
          </div>

          {/* Library stats */}
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground">Your Family's Library</h2>
            <p className="text-sm text-muted-foreground">Hymns to sing. Books to read. Activities to do together.</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-1">
                <MusicNotes className="h-6 w-6 mx-auto text-primary" weight="duotone" />
                <p className="text-lg font-bold text-foreground">50+</p>
                <p className="text-xs text-muted-foreground">Hymns</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-1">
                <Books className="h-6 w-6 mx-auto text-primary" weight="duotone" />
                <p className="text-lg font-bold text-foreground">100+</p>
                <p className="text-xs text-muted-foreground">Books</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-1">
                <PuzzlePiece className="h-6 w-6 mx-auto text-primary" weight="duotone" />
                <p className="text-lg font-bold text-foreground">200+</p>
                <p className="text-xs text-muted-foreground">Activities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}