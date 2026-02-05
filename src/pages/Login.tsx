import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/api';
import { Users, CalendarDots, TrendUp, Path, CircleNotch, LockKey, DownloadSimple, ShieldCheck, ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // Redirect to the real Google OAuth endpoint
    window.location.href = auth.getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Path className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            FamilyPath
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 md:px-6">
        <div className="max-w-md w-full space-y-8 text-center">
          {/* Hero */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Unlock Your Family's Learning Path
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Sign in to create personalized rhythms for your children, track their growth,
              and get age-specific suggestions from our library.
            </p>
          </div>

          {/* Features - What signing in unlocks */}
          <div className="grid grid-cols-3 gap-4 py-8">
            <div className="space-y-2">
              <div className="h-12 w-12 mx-auto rounded-full bg-domain-motor/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-domain-motor" weight="duotone" />
              </div>
              <p className="text-sm text-muted-foreground">Child Profiles</p>
            </div>
            <div className="space-y-2">
              <div className="h-12 w-12 mx-auto rounded-full bg-domain-cognitive/10 flex items-center justify-center">
                <CalendarDots className="h-6 w-6 text-domain-cognitive" weight="duotone" />
              </div>
              <p className="text-sm text-muted-foreground">Weekly Planner</p>
            </div>
            <div className="space-y-2">
              <div className="h-12 w-12 mx-auto rounded-full bg-domain-social/10 flex items-center justify-center">
                <TrendUp className="h-6 w-6 text-domain-social" weight="duotone" />
              </div>
              <p className="text-sm text-muted-foreground">Track Progress</p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 md:gap-8 pb-8 text-xs text-muted-foreground">
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

          <div className="pb-4">
            <Link to="/trust" className="text-sm font-medium text-primary hover:underline flex items-center justify-center gap-1">
              Read our promise to families <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>

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
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </Button>

            <Button variant="ghost" className="w-full text-muted-foreground" asChild>
              <Link to="/library">
                Or continue browsing the library
              </Link>
            </Button>

            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="underline hover:text-foreground">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link to="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 md:p-6 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          © 2024 FamilyPath. Made with love for families.
        </p>
        <div>
          <Link to="/trust" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
            Read our Trust Covenant
          </Link>
        </div>
      </footer>
    </div>
  );
}
