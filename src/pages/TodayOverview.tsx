import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, TrendingUp } from 'lucide-react';
import { useAnchor } from '@/hooks/useAnchor';
import { Button } from '@/components/ui/button';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

export default function TodayOverview() {
  const { data: anchor, isLoading } = useAnchor();

  return (
    <section className="mx-auto flex h-full w-full max-w-4xl flex-col justify-center gap-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Today</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Your family learning starts here
        </h1>
        <p className="text-muted-foreground">
          {isLoading
            ? 'Loading today’s focus...'
            : `${dateFormatter.format(new Date(anchor?.date ?? Date.now()))} · ${anchor?.theme ?? 'Ready to begin'}`}
        </p>
      </header>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-card-foreground">Next best action</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Open today’s guided session first, then branch into library or progress when needed.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Button asChild size="lg" className="w-full justify-start gap-2">
            <Link to="/session">
              <PlayCircle className="h-5 w-5" />
              Start Session
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full justify-start gap-2">
            <Link to="/library">
              <BookOpen className="h-5 w-5" />
              Open Library
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full justify-start gap-2">
            <Link to="/progress">
              <TrendingUp className="h-5 w-5" />
              View Progress
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
