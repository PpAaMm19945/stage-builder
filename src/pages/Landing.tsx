import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Books, MusicNotes, Shapes, ArrowRight } from '@phosphor-icons/react';

export default function Landing() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 md:px-6 py-10">
      <div className="max-w-2xl w-full space-y-10 text-center">
        {/* Hero */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
            Your Family's Library
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
            Hymns to sing. Books to read. Activities to do together.
            A daily rhythm for intentional family formation.
          </p>
        </div>

        {/* Library Preview Cards */}
        <div className="grid grid-cols-3 gap-4 py-6">
          <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-br from-domain-motor/10 to-domain-motor/5 border border-domain-motor/20">
            <div className="h-14 w-14 mx-auto rounded-full bg-domain-motor/20 flex items-center justify-center">
              <MusicNotes className="h-7 w-7 text-domain-motor" weight="duotone" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">50+</p>
              <p className="text-sm text-muted-foreground">Hymns</p>
            </div>
          </div>
          <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-br from-domain-cognitive/10 to-domain-cognitive/5 border border-domain-cognitive/20">
            <div className="h-14 w-14 mx-auto rounded-full bg-domain-cognitive/20 flex items-center justify-center">
              <Books className="h-7 w-7 text-domain-cognitive" weight="duotone" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">100+</p>
              <p className="text-sm text-muted-foreground">Picture Books</p>
            </div>
          </div>
          <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-br from-domain-social/10 to-domain-social/5 border border-domain-social/20">
            <div className="h-14 w-14 mx-auto rounded-full bg-domain-social/20 flex items-center justify-center">
              <Shapes className="h-7 w-7 text-domain-social" weight="duotone" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">200+</p>
              <p className="text-sm text-muted-foreground">Activities</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="w-full sm:w-auto gap-2 h-14 text-base font-medium px-8" asChild>
            <Link to="/library">
              Browse the Library
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 text-base font-medium px-8" asChild>
            <Link to="/login">
              Sign In to Personalize
            </Link>
          </Button>
        </div>

        {/* Subtle Value Prop */}
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Free to browse. Sign in to create personalized learning paths,
          track your family's progress, and get age-specific suggestions.
        </p>
      </div>
    </div>
  );
}
