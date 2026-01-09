import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { family, books, weeklyPlan, activityCompletions, reading, liturgy } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  CircleNotch,
  WarningCircle,
  Baby,
  Sparkle,
  Calendar,
  CaretDown,
  CaretUp
} from '@phosphor-icons/react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { UpNextCard } from '@/components/dashboard/UpNextCard';
import { toast } from 'sonner';
import { DailyLiturgy } from '@/components/liturgy/DailyLiturgy';
import { TomorrowPreview } from '@/components/planning/TomorrowPreview';
import { DailyRhythm, RhythmItem } from '@/components/planning/DailyRhythm';
import { MaterialItem, Book } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Lightning, Gear } from '@phosphor-icons/react';
import { FamilyProgressMini } from '@/components/dashboard/FamilyProgressMini';
import { NotificationStack } from '@/components/dashboard/NotificationStack';
import { getRecommendedBooks } from '@/lib/recommendations';
import { BookReader } from '@/components/books/BookReader';
import { DownloadPrintButton } from '@/components/ui/DownloadPrintButton';
import { DailyPlanDocument } from '@/components/pdf/documents';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showFullDay, setShowFullDay] = useState(false);

  const { data: liturgyData } = useQuery({
    queryKey: ['liturgy-today'],
    queryFn: liturgy.getToday,
  });

  const { data: todayData, isLoading: todayLoading, error: todayError } = useQuery({
    queryKey: ['family-today'],
    queryFn: family.getToday,
  });

  const youngestChild = todayData?.children ? [...todayData.children].sort((a: any, b: any) => a.ageInMonths - b.ageInMonths)[0] : null;

  const { data: recommendedBooks } = useQuery({
    queryKey: ['todays-book', youngestChild?.ageInMonths],
    queryFn: () => books.list({ ageMonths: youngestChild?.ageInMonths }),
    enabled: !!youngestChild,
  });

  // Fetch reading history to exclude recently read books
  const { data: readingHistory } = useQuery({
    queryKey: ['reading-history-recent'],
    queryFn: () => reading.history(30), // Last 30 sessions
    enabled: !!recommendedBooks && recommendedBooks.length > 0,
  });

  // Smart book selection: exclude recently read & use date-based rotation
  const todaysBook = (() => {
    if (!recommendedBooks || recommendedBooks.length === 0) return null;

    // Get IDs of recently read books
    const recentlyReadIds = new Set(
      (readingHistory || []).map((s: any) => s.book_id)
    );

    // Filter out recently read books
    const unreadBooks = recommendedBooks.filter(
      book => !recentlyReadIds.has(book.id) && !recentlyReadIds.has(`${book.series}/${book.id}`)
    );

    // Use unread books if available, otherwise fall back to all books
    const pool = unreadBooks.length > 0 ? unreadBooks : recommendedBooks;

    // Prioritize recommendation score if we have children context
    if (youngestChild) {
      // Sort pool by recommendation score
      const ranked = getRecommendedBooks(pool, youngestChild);
      return ranked[0];
    }

    // Fallback: Use today's date as seed for deterministic daily rotation
    const today = new Date().toISOString().split('T')[0];
    const seed = today.split('-').reduce((acc, n) => acc + parseInt(n), 0);
    const index = seed % pool.length;
    return pool[index];
  })();

  // Get weekly plan to check completion status
  const { data: weeklyPlanData } = useQuery({
    queryKey: ['family-weekly-plan'],
    queryFn: () => weeklyPlan.get(),
  });

  // Mutation for completing activities
  const completeActivityFitMutation = useMutation({
    mutationFn: async (item: RhythmItem) => {
      // Depending on type, call different API
      if (item.type === 'activity' && item.data?.id) {
        // Use the simple completion endpoint
        await activityCompletions.create({
          activityId: item.data.id,
          notes: 'Completed from Dashboard Rhythm'
        });
        return;
      }
      return Promise.resolve();
    },
    onSuccess: () => {
      toast.success("Activity completed!");
      queryClient.invalidateQueries({ queryKey: ['family-today'] });
      queryClient.invalidateQueries({ queryKey: ['family-weekly-plan'] });
    }
  });


  // Loading State
  if (todayLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <CircleNotch className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Planning your family's day...</p>
      </div>
    );
  }

  // Error State
  if (todayError || !todayData) {
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

  // No Children State
  if (todayData.children.length === 0) {
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

  // First Time User (No Materials)
  const isFirstTimeUser = todayData.materials?.every((m: MaterialItem) => m.status === 'unknown');
  if (isFirstTimeUser && todayData.familySessions?.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="text-center space-y-2">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Sparkle className="h-8 w-8 text-primary" weight="duotone" />
            </div>
            <CardTitle className="text-2xl">Welcome to Your Family Learning Journey!</CardTitle>
            <CardDescription className="text-base">We're excited to help your family learn and grow together.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                To give you the best activity recommendations, we need to know what materials you have at home.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={() => navigate('/settings')} size="lg" className="flex-1 gap-2">
                <Gear className="h-4 w-4" weight="duotone" />
                Set Up Materials
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/settings?quickstart=true')} className="flex-1">
                Quick Start →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Needs Plan State
  if (todayData.needsPlan) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <DailyLiturgy />
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent mt-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Let's Plan Your Week!</CardTitle>
            <CardDescription>{todayData.message || "Generate a schedule to get personalized activities."}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button onClick={() => navigate('/early-years/planner')} size="lg" className="gap-2">
              <Calendar className="w-5 h-5" />
              Generate Weekly Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // BUILD TIMELINE ITEMS
  const timelineItems: RhythmItem[] = [];

  // 1. Liturgy (Morning)
  timelineItems.push({
    id: 'liturgy-morning',
    timeSlot: '08:00',
    title: 'Morning Liturgy',
    description: 'Scripture, hymnal, and catechism.',
    type: 'liturgy',
    status: 'upcoming', // TODO: Check actual completion status from API? Liturgy component handles internal state but dashboard might need to know.
    data: {}
  });

  // 2. Family Sessions
  if (todayData.familySessions) {
    todayData.familySessions.forEach((session: any, index: number) => {
      // Map generic timeSlot "morning" -> realistic time
      let time = '09:00';
      if (session.timeSlot === 'afternoon') time = '14:00';
      // If multiple, stagger them?
      if (index > 0 && time === '09:00') time = '10:00';

      const isCompleted = weeklyPlanData?.completions && weeklyPlanData.completions[session.activity.id];

      timelineItems.push({
        id: `session-${index}`,
        timeSlot: time,
        title: session.activity.title,
        description: session.activity.description,
        type: 'activity',
        status: isCompleted ? 'completed' : 'upcoming',
        data: session.activity
      });
    });
  }

  // 3. Book (Read Aloud)
  if (todaysBook) {
    timelineItems.push({
      id: 'book-reading',
      timeSlot: '11:00',
      title: 'Read Aloud Time',
      description: todaysBook.title,
      type: 'book',
      status: 'upcoming',
      data: todaysBook
    });
  }

  // 4. Daily Practices (Evening/Extras)
  if (todayData.dailyPractices) {
    todayData.dailyPractices.forEach((practice: any, index: number) => {
      timelineItems.push({
        id: `practice-${index}`,
        timeSlot: '18:00',
        title: practice.title,
        description: practice.description,
        type: 'activity', // or specialized 'practice' type
        status: 'upcoming',
        data: practice
      });
    });
  }

  // Sort by time
  timelineItems.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  const nextItem = timelineItems.find(i => i.status !== 'completed') || null;
  const pendingCount = timelineItems.filter(i => i.status !== 'completed').length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 px-4 sm:px-0">
      {/* Greeting */}
      <div className="py-6 space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-display font-semibold text-foreground">
          Hello, {user?.name?.split(' ')[0] || 'Family'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Ready for today's rhythms?
        </p>
      </div>

      <NotificationStack />

      {/* Print Today Button */}
      {todayData && (
        <div className="flex justify-end px-2">
          <DownloadPrintButton
            document={
              <DailyPlanDocument
                day={{
                  date: new Date().toLocaleDateString(),
                  dayName: format(new Date(), 'EEEE'),
                  liturgy: liturgyData?.items || [],
                  activities: todayData.familySessions?.map((s: any) => s.activity) || [],
                  reading: todaysBook || undefined
                }}
                children={todayData.children}
              />
            }
            fileName={`daily_plan_${new Date().toISOString().split('T')[0]}.pdf`}
            label="Print Plan"
            size="sm"
            variant="ghost"
            className="gap-2 text-muted-foreground hover:text-foreground"
          />
        </div>
      )}

      {/* REST DAY Override */}
      {todayData.restDay && (
        <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-xl border border-blue-100 dark:border-blue-900 text-center mb-6">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">Rest Day</h2>
          <p className="text-blue-700 dark:text-blue-200">{todayData.message}</p>
        </div>
      )}

      {/* Up Next Card */}
      <UpNextCard
        item={nextItem}
        onAction={(item) => {
          // For books, we handle directly
          if (item.type === 'book' && todaysBook) setSelectedBook(todaysBook);
          // For others, trigger the sheet by expanding
          setShowFullDay(true);
        }}
        onExpand={() => setShowFullDay(!showFullDay)}
        pendingCount={pendingCount}
      />

      {/* Timeline (Collapsible) */}
      <Collapsible open={showFullDay} onOpenChange={setShowFullDay} className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Full Schedule ({timelineItems.length})
          </h3>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {showFullDay ? (
                <CaretUp className="h-4 w-4" />
              ) : (
                <CaretDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <DailyRhythm
            items={timelineItems}
            onComplete={(item) => completeActivityFitMutation.mutate(item)}
            onBookClick={() => setSelectedBook(todaysBook)}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Book Reader */}
      <BookReader
        book={selectedBook}
        open={!!selectedBook}
        onOpenChange={(open) => !open && setSelectedBook(null)}
        childrenIds={todayData?.children?.map((c: any) => c.id)}
        onComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['todays-book'] });
          queryClient.invalidateQueries({ queryKey: ['reading-history-recent'] });
        }}
      />

      {/* Family Progress */}
      <FamilyProgressMini />
    </div>
  );
}
