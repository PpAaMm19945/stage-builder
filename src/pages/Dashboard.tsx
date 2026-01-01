import { useState } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { family } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  CalendarBlank,
  Sparkle,
  Clock,
  Baby,
  Cube,
  PaintBrush,
  PlayCircle,
  CheckCircle,
  Gear,
  BookOpen,
  Smiley,
  CircleNotch,
  WarningCircle,
  Circle,
  Info,
  Lightning,
  Question,
  BookBookmark
} from '@phosphor-icons/react';
import { FamilyCompletionModal } from '@/components/family/FamilyCompletionModal';
import { FamilySession, MaterialItem, Book } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { books } from '@/lib/api';
import { BookReader } from '@/components/books/BookReader';
import { UpvoteButton } from '@/components/feedback/UpvoteButton';
import { DailyLiturgy } from '@/components/liturgy/DailyLiturgy';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSession, setSelectedSession] = useState<FamilySession | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['family-today'],
    queryFn: family.getToday,
  });

  const [readerBook, setReaderBook] = useState<Book | null>(null);

  // Get youngest child for age-appropriate recommendations
  const youngestChild = data?.children ? [...data.children].sort((a: any, b: any) => a.ageInMonths - b.ageInMonths)[0] : null;

  const { data: recommendedBooks } = useQuery({
    queryKey: ['todays-book', youngestChild?.ageInMonths],
    queryFn: () => books.list({ ageMonths: youngestChild?.ageInMonths }),
    enabled: !!youngestChild,
  });

  const todaysBook = recommendedBooks && recommendedBooks.length > 0 ? recommendedBooks[0] : null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <CircleNotch className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Planning your family's day...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <WarningCircle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold">Unable to load dashboard</h3>
        <p className="text-muted-foreground mb-4">We couldn't get today's plan. Please try again.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const hasChildren = data.children.length > 0;

  // No children state
  if (!hasChildren) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Baby className="h-8 w-8 text-primary" weight="duotone" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to SchoolOS!</h2>
        <p className="text-muted-foreground mb-8">
          To get started with your personalized family learning plan, please add your first child.
        </p>
        <Button onClick={() => navigate('/settings')} size="lg">
          Add Your First Child
        </Button>
      </div>
    );
  }

  // Check if user is first-time (all materials are unknown)
  const isFirstTimeUser = data.materials.every((m: MaterialItem) => m.status === 'unknown');

  // First-time user onboarding
  if (isFirstTimeUser && data.familySessions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="text-center space-y-2">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Sparkle className="h-8 w-8 text-primary" weight="duotone" />
            </div>
            <CardTitle className="text-2xl">Welcome to Your Family Learning Journey!</CardTitle>
            <CardDescription className="text-base">
              We're excited to help your family learn and grow together.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                To give you the best activity recommendations, we need to know what materials you have at home.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Lightning className="h-4 w-4 text-orange-500" />
                Quick Setup (2 minutes)
              </h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">1.</span>
                  <span>Tell us what materials you have (blocks, crayons, books, etc.)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">2.</span>
                  <span>We'll instantly recommend activities your family can do today</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">3.</span>
                  <span>Track progress and watch your children grow!</span>
                </li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={() => navigate('/settings')} size="lg" className="flex-1 gap-2">
                <Gear className="h-4 w-4" weight="duotone" />
                Set Up Materials (2 min)
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  // Quick start: mark common basics as "have"
                  navigate('/settings?quickstart=true');
                }}
                className="flex-1"
              >
                Quick Start →
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground italic">
              💡 Takes just 2 minutes and unlocks personalized family activities!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if materials need setup
  const unknownOrNotInterestedMaterials = data.materials.filter(
    (m: MaterialItem) => m.status === 'unknown' || m.status === 'not_interested'
  );
  const needsMaterialsSetup = unknownOrNotInterestedMaterials.length > 0;

  const messLevelLabels: Record<string | number, string> = {
    1: 'No Mess',
    2: 'Low Mess',
    3: 'Medium Mess',
    4: 'High Mess',
    5: 'Very High Mess',
    'low': 'Low Mess',
    'medium': 'Medium Mess',
    'high': 'High Mess',
    'none': 'No Mess'
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-2xl border border-primary/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-medium">
              <CalendarBlank className="h-4 w-4" weight="duotone" />
              <span>{new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
              {youngestChild?.ageInMonths <= 12 ? 'Gentle Moments for Today' : 'Family Learning Plan'}
              <Sparkle className="h-6 w-6 text-yellow-500" weight="duotone" />
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {data.familySessions.length} {youngestChild?.ageInMonths <= 12 ? 'ideas' : 'activities'}
              </span>
              <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
              <span>~{Math.round(data.totalDuration)} min total</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => navigate('/settings')}>
              <Cube className="w-4 h-4" weight="duotone" />
              My Materials
            </Button>
          </div>
        </div>
      </div>

      {/* Daily Liturgy */}
      <DailyLiturgy />

      {/* Materials Reminder Banner */}
      {needsMaterialsSetup && (
        <Alert className="border-orange-200 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-900">
            <strong>Update your materials:</strong> Some activities need materials you haven't set.
            <Button
              variant="link"
              className="h-auto p-0 ml-1 text-orange-900 underline font-semibold"
              onClick={() => navigate('/settings')}
            >
              Review Materials
            </Button> to improve suggestions.
          </AlertDescription>
        </Alert>
      )}

      {/* Materials Section */}
      <Card className="border-muted bg-muted/5">
        <CardHeader className="pb-3 border-b border-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Cube className="h-5 w-5 text-primary" weight="duotone" />
                Materials for Today
              </CardTitle>
              <CardDescription>
                {data.materials.length} items needed for all sessions
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="text-primary hover:text-primary/80">
              Update My Materials
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {data.materials.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {data.materials.map((m: MaterialItem, idx: number) => (
                <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${m.status === 'have' ? 'bg-green-500/10 border-green-500/20 text-green-700' : 'bg-muted border-dashed border-muted-foreground/30 text-muted-foreground'}`}>
                  {m.status === 'have' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" weight="fill" />
                  ) : m.status === 'willing_to_buy' ? (
                    <Circle className="w-4 h-4" />
                  ) : (
                    <WarningCircle className="w-4 h-4 text-orange-500" />
                  )}
                  <span className="text-sm font-medium">{m.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic">No specific materials needed today!</p>
          )}
        </CardContent>
      </Card>

      {/* Today's Reading */}
      {todaysBook && youngestChild && (
        <Card className="border-2 border-indigo-100 bg-indigo-50/30 dark:bg-indigo-900/10 dark:border-indigo-800 overflow-hidden">
          <CardHeader className="pb-3 border-b border-indigo-100/50 dark:border-indigo-800">
            <CardTitle className="text-lg flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
              <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" weight="duotone" />
              Today's Reading
            </CardTitle>
            <CardDescription className="text-indigo-900/60 dark:text-indigo-300">
              Selected for {youngestChild.name}'s age ({Math.floor(youngestChild.ageInMonths / 12)}y)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              {/* Book Cover */}
              <div className="relative w-32 sm:w-40 shadow-lg rounded-lg overflow-hidden shrink-0 transform transition-transform hover:scale-105 duration-300">
                <div className="aspect-[3/4] bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <img
                    src={books.getCoverUrl(todaysBook.series, todaysBook.id)}
                    alt={todaysBook.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails
                      (e.target as HTMLImageElement).src = 'https://placehold.co/300x400?text=Book+Cover';
                    }}
                  />
                </div>
              </div>

              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div>
                  <Badge variant="secondary" className="mb-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-200 dark:border-indigo-700">
                    {todaysBook.series} Series
                  </Badge>
                  <h3 className="text-xl font-bold text-indigo-950 mb-1 dark:text-indigo-50">{todaysBook.title}</h3>
                  <p className="text-indigo-900/70 text-sm leading-relaxed max-w-xl dark:text-indigo-200/80">
                    {todaysBook.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Button
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none gap-2"
                    onClick={() => setReaderBook(todaysBook)}
                  >
                    <BookOpen className="h-4 w-4" weight="duotone" />
                    Read Together
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Family Sessions */}
      <div className="space-y-6">
        {data.familySessions.map((session, index) => {
          const isInfancyMode = youngestChild?.ageInMonths <= 12;
          const isDailyPractice = session.activity.activity_type === 'daily_practice';
          // Use daily practice type if available, otherwise assume standard
          // Note: activity_type might not be populated yet until API is updated, 
          // but we can trust age check for now to change the UI wrapper.

          return (
            <Card key={index} className={`overflow-hidden border-2 transition-colors ${isInfancyMode ? 'border-primary/10 hover:border-primary/20' : 'hover:border-primary/20'}`}>
              <div className="bg-muted/30 p-4 border-b flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg leading-none">{session.activity.title}</h3>
                      {session.reasoning && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Question className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">{session.reasoning}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" weight="duotone" /> {session.activity.duration_minutes} min</span>
                      {session.activity.context_embedding && (
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal capitalize">
                          {session.activity.context_embedding}
                        </Badge>
                      )}
                      {!isInfancyMode && (
                        <span className="flex items-center gap-1"><PaintBrush className="w-3 h-3" weight="duotone" /> {messLevelLabels[session.messLevel as string] || 'Variable Mess'}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UpvoteButton contentType="activity" contentId={session.activity.id} variant="minimal" />
                </div>
              </div>

              <CardContent className="p-0">
                <div className="p-6 space-y-6">
                  {/* Shepherd's Script */}
                  {session.activity.parent_script && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        <BookBookmark className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" weight="duotone" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Shepherd's Script</p>
                          <p className="text-amber-900 dark:text-amber-100 italic">"{session.activity.parent_script}"</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-foreground/80 leading-relaxed">
                    {session.activity.description}
                  </p>

                  <div className="space-y-4">
                    {session.childTiers.map(tier => (
                      <div key={tier.childId} className="bg-accent/5 rounded-xl p-4 border border-accent/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Baby className="h-5 w-5 text-slate-600 dark:text-slate-400" weight="duotone" />
                          <span className="font-bold text-foreground">
                            {tier.childName}
                          </span>
                          {!isInfancyMode && (
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 ml-auto opacity-70">
                              {tier.tier}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-3 pl-1">
                          <Sparkle className="w-4 h-4 text-indigo-500 mt-1 shrink-0" weight="duotone" />
                          <p className={`text-sm font-medium ${isInfancyMode ? 'text-foreground/80' : 'text-indigo-900/80 dark:text-indigo-200/80'}`}>
                            {tier.expectation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/10 p-4 border-t flex gap-3">
                  {isInfancyMode ? (
                    // Soft UI for Infancy
                    <Button
                      className="w-full gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-primary/10 shadow-none"
                      variant="outline"
                      onClick={() => {
                        // Just a feel-good click, no API call intended for daily practices
                        // Once API protects it, this button is just UI candy or could dismiss the item locally
                        toast.success("That was lovely!");
                      }}
                    >
                      <Smiley className="w-4 h-4" weight="duotone" />
                      That was lovely
                    </Button>
                  ) : (
                    // Standard UI
                    <>
                      <Button className="flex-1 gap-2" variant="default" onClick={() => navigate(`/early-years/activities/${session.activity.id}`)}>
                        <PlayCircle className="w-4 h-4" weight="duotone" />
                        Start Activity
                      </Button>
                      <Button className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={() => setSelectedSession(session)}>
                        <CheckCircle className="w-4 h-4" weight="fill" />
                        We Did It!
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {data.familySessions.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-xl space-y-4">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">
                {youngestChild?.ageInMonths <= 12 ? 'No daily practices for today' : 'No activities matched your family today'}
              </p>
              <p className="text-sm text-muted-foreground">
                {youngestChild?.ageInMonths <= 12 ? 'Enjoy some quiet time with your little one.' : "This usually means we need more info about your materials, or we're still adding activities for your children's ages."}
              </p>
            </div>
            {!youngestChild || youngestChild.ageInMonths > 12 && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button onClick={() => navigate('/settings')} size="lg" className="gap-2">
                  <Cube className="w-4 h-4" weight="duotone" />
                  Update My Materials
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Refresh
                </Button>
              </div>
            )}
            {youngestChild && youngestChild.ageInMonths <= 12 && (
              <Button variant="ghost" onClick={() => window.location.reload()}>
                Check again
              </Button>
            )}
            <p className="text-xs text-muted-foreground italic">
              💡 We're adding more family activities soon!
            </p>
          </div>
        )}
      </div>

      <FamilyCompletionModal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        session={selectedSession}
        onSuccess={() => {
          setSelectedSession(null);
          refetch();
        }}
      />

      {
        readerBook && (
          <BookReader
            open={!!readerBook}
            onOpenChange={(open) => !open && setReaderBook(null)}
            book={readerBook}
            childrenIds={data?.children?.map((c: any) => c.id) || []}
          />
        )
      }
    </div >
  );
}
