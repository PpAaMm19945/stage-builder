import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { family, books, weeklyPlan, activityCompletions, reading, paths, rhythm } from '@/lib/api';
import { TodayPathItem } from '@/types/paths';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { format, startOfDay, isSameDay } from 'date-fns';
import {
  CircleNotch,
  WarningCircle,
  Baby,
  Sparkle,
  Calendar,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { UpNextCard } from '@/components/dashboard/UpNextCard';
import { WeekStrip, getWeekStart } from '@/components/dashboard/WeekStrip';
import { toast } from 'sonner';
import { FormationCard } from '@/components/formations/FormationCard';
import { DailyRhythm, RhythmItem } from '@/components/planning/DailyRhythm';
import { SwapActivitySheet } from '@/components/planning/SwapActivitySheet';
import { MaterialItem, Book } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Gear } from '@phosphor-icons/react';
import { FamilyProgressMini } from '@/components/dashboard/FamilyProgressMini';
import { AiLogViewer } from '@/components/ai/AiLogViewer';
import { getRecommendedBooks } from '@/lib/recommendations';
import { TimeSpentWidget } from '@/components/dashboard/TimeSpentWidget';
import { BookReader } from '@/components/books/BookReader';
import { DownloadPrintButton } from '@/components/ui/DownloadPrintButton';
import { DailyPlanDocument } from '@/components/pdf/documents';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { UsersThree, Crown } from '@phosphor-icons/react';
import { WorkApprovals } from '@/components/dashboard/WorkApprovals';
import { useStableValue } from '@/hooks/useStableValue';
import { Compass } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { PathCompletionModal } from '@/components/paths/PathCompletionModal';
import { EndOfDaySummary } from '@/components/dashboard/EndOfDaySummary';

const EMPTY_WEEK_DATA = {};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State for day navigation
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // State for regenerate dialog
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [balancePreference, setBalancePreference] = useState<'baby_focused' | 'mixed' | 'older_focused'>('mixed');
  const [transferAction, setTransferAction] = useState<'move' | 'skip'>('move');

  // State for swap sheet
  const [swapActivity, setSwapActivity] = useState<{ id: string; title: string } | null>(null);

  // State for active rhythm item (lifted from DailyRhythm)
  const [activeRhythmItem, setActiveRhythmItem] = useState<RhythmItem | null>(null);

  // State for path completion celebration
  const [completedPathInfo, setCompletedPathInfo] = useState<{
    pathName: string;
    totalItems: number;
  } | null>(null);

  // End of Day Summary State
  const [showSummary, setShowSummary] = useState(false);

  const today = startOfDay(new Date());
  const weekStart = getWeekStart(today);
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayName = format(selectedDate, 'EEEE');
  const isToday = isSameDay(selectedDate, today);

  const { data: pathsToday } = useQuery({
    queryKey: ['paths-today'],
    queryFn: paths.getToday,
    enabled: isToday,
  });

  // Fetch day data - use getToday for today, getDay for other days
  // Use keepPreviousData to avoid jarring full-page reloads
  const { data: dayData, isLoading: dayLoading, isFetching: dayFetching, error: dayError } = useQuery({
    queryKey: ['family-day', selectedDateStr],
    queryFn: () => isToday ? rhythm.getToday() : family.getDay(selectedDateStr),
    placeholderData: (previousData) => previousData, // Keep showing previous data while fetching
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Fetch week summary for the week strip
  const { data: weekSummary } = useQuery({
    queryKey: ['family-week-summary', weekStartStr],
    queryFn: () => family.getWeekSummary(weekStartStr),
  });

  // End of Day Check
  useEffect(() => {
    const now = new Date();
    const isEvening = now.getHours() >= 18;
    // Only show if it's "today" (not browsing past/future) and evening
    if (isEvening && isToday) {
      const dateStr = format(now, 'yyyy-MM-dd');
      const shown = localStorage.getItem('daily_summary_shown');
      if (shown !== dateStr) {
        // Small delay to let data load
        const timer = setTimeout(() => setShowSummary(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isToday]);

  // Memoize active children to prevent downstream re-renders (especially PDF generation)
  const activeChildrenRaw = useMemo(() => {
    return dayData?.children?.filter((c: any) => !c.is_graduated) || [];
  }, [dayData?.children]);

  // Make activeChildren stable based on content, not reference
  const activeChildren = useStableValue(activeChildrenRaw);

  const childAges = useMemo(() => {
    return activeChildren.map((c: any) => `${Math.floor(c.age_in_months / 12)}y`) || [];
  }, [activeChildren]);

  const youngestChild = useMemo(() => {
    return activeChildren.length > 0
      ? [...activeChildren].sort((a: any, b: any) =>
        (a.age_in_months ?? a.ageInMonths ?? 0) - (b.age_in_months ?? b.ageInMonths ?? 0)
      )[0]
      : null;
  }, [activeChildren]);

  // Normalize youngest child's age (API returns snake_case, some code expects camelCase)
  const youngestChildAge = (youngestChild as any)?.age_in_months ?? youngestChild?.ageInMonths ?? 0;

  const { data: recommendedBooks } = useQuery({
    queryKey: ['todays-book', youngestChildAge],
    queryFn: () => books.list({ ageMonths: youngestChildAge }),
    enabled: !!youngestChild && youngestChildAge > 0,
  });

  const { data: readingHistory } = useQuery({
    queryKey: ['reading-history-recent'],
    queryFn: () => reading.history(30),
    enabled: !!recommendedBooks && recommendedBooks.length > 0,
  });

  // Smart book selection
  const todaysBook = useMemo(() => {
    if (!recommendedBooks || recommendedBooks.length === 0) return null;
    const recentlyReadIds = new Set((readingHistory || []).map((s: any) => s.book_id));
    const unreadBooks = recommendedBooks.filter(
      book => !recentlyReadIds.has(book.id) && !recentlyReadIds.has(`${book.series}/${book.id}`)
    );
    const pool = unreadBooks.length > 0 ? unreadBooks : recommendedBooks;
    if (youngestChild) {
      // Normalize child data for recommendation engine (expects camelCase)
      const normalizedChild = {
        ...youngestChild,
        ageInMonths: (youngestChild as any).age_in_months ?? youngestChild.ageInMonths ?? 0
      };
      const ranked = getRecommendedBooks(pool, normalizedChild);
      return ranked[0];
    }
    const todayStr = new Date().toISOString().split('T')[0];
    const seed = todayStr.split('-').reduce((acc, n) => acc + parseInt(n), 0);
    return pool[seed % pool.length];
  }, [recommendedBooks, readingHistory, youngestChild]);

  // Stable keys for PDF generation
  // We extract and stabilize only the data needed for the PDF.
  // This prevents expensive PDF regeneration when unrelated dayData fields change (like 'message' or completion status).
  const pdfActivitiesRaw = useMemo(() => {
    return dayData?.familySessions?.map((s: any) => s.formation || s.activity).filter(Boolean) || [];
  }, [dayData?.familySessions]);

  // Stabilize the inputs for the PDF
  const pdfActivities = useStableValue(pdfActivitiesRaw);
  const pdfBook = useStableValue(todaysBook);

  // Memoize PDF document to prevent expensive regeneration on every render
  // This must be declared here to avoid hook ordering issues with early returns
  const pdfDocument = useMemo(() => {
    // Return null if data isn't ready, similar to how we hide the button
    if (!isToday || !dayData) return <></>; // Return empty fragment or handle appropriately

    return (
      <DailyPlanDocument
        day={{
          date: new Date().toLocaleDateString(),
          dayName: format(new Date(), 'EEEE'),
          liturgy: [],
          activities: pdfActivities,
          reading: pdfBook || undefined
        }}
        children={activeChildren}
      />
    );
  }, [isToday, !!dayData, pdfActivities, pdfBook, activeChildren]);

  // Get weekly plan for completion status
  const { data: weeklyPlanData } = useQuery({
    queryKey: ['family-weekly-plan'],
    queryFn: () => weeklyPlan.get(),
  });

  // Regenerate mutation (Switched to AI Rhythm Generator)
  const regenerateMutation = useMutation({
    mutationFn: (vars: { weekStart: string; frozenDays: string[]; additionalContext?: string }) =>
      rhythm.regenerate(vars), // Uses new AI endpoint
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-day'] });
      queryClient.invalidateQueries({ queryKey: ['family-today'] });
      queryClient.invalidateQueries({ queryKey: ['family-week-summary'] });
      queryClient.invalidateQueries({ queryKey: ['family-weekly-plan'] });
      toast.success('Plan regenerated!');
      setIsBalanceDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error('Failed to regenerate', { description: err.message });
    }
  });

  // Complete activity mutation
  const completeActivityMutation = useMutation({
    mutationFn: async (vars: { item: RhythmItem; duration?: number; lovedIt?: boolean }) => {
      const { item, duration, lovedIt } = vars;
      if (item.type === 'activity' && item.data?.id) {
        await activityCompletions.create({
          activityId: item.data.id,
          notes: 'Completed from Dashboard',
          durationMinutes: duration,
          lovedIt: lovedIt
        });
      }
    },
    onSuccess: () => {
      toast.success("Activity completed!");
      queryClient.invalidateQueries({ queryKey: ['family-day'] });
      queryClient.invalidateQueries({ queryKey: ['family-today'] });
      queryClient.invalidateQueries({ queryKey: ['family-week-summary'] });
      queryClient.invalidateQueries({ queryKey: ['family-weekly-plan'] });
      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: ['time-spent-analytics'] });
    }
  });

  const advancePathMutation = useMutation({
    mutationFn: (pathId: string) => paths.advance(pathId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['paths-today'] });
      queryClient.invalidateQueries({ queryKey: ['path-subscriptions'] });
      toast.success(`Progress saved! ${data?.new_position || 1}/${data?.total_items || '?'}`);
      if (data?.is_completed) {
        // Show celebration modal - get path name from the active item
        const currentPathItem = pathsToday?.items?.find((p: TodayPathItem) => p.path_id);
        setCompletedPathInfo({
          pathName: currentPathItem?.path_title || 'Learning Path',
          totalItems: data?.total_items || 0,
        });
      }
    },
    onError: (error: any) => {
      toast.error('Could not save progress. Please try again.');
      console.error('Path advance error:', error);
    },
  });

  const handleRegenerate = useCallback(() => setIsBalanceDialogOpen(true), []);

  // Actual logic to populate frozenDays
  const regenerationContext = useMemo(() => {
    if (!isToday) return { frozenDays: [], missedItems: [] };
    const now = new Date();
    const todayDay = now.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue"
    const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayIdx = daysOrder.indexOf(todayDay);

    if (todayIdx <= 0) return { frozenDays: [], missedItems: [] };

    const frozenDays = daysOrder.slice(0, todayIdx);

    // Find missed items in frozen days
    // Need to parse weeklyPlanData (Phase 3/5 structure)
    // Assuming V2 AI structure: { days: [ { day: 'Mon', morning: [], evening: [] } ] }
    let missed: RhythmItem[] = [];

    if (weeklyPlanData?.plan) { // Plan object
      // Check format
      const days = weeklyPlanData.plan.days || weeklyPlanData.plan; // Handle V2/Legacy
      if (Array.isArray(days)) {
        days.forEach((d: any) => {
          if (frozenDays.includes(d.day)) {
            const allItems = [...(d.morning || []), ...(d.evening || [])];
            allItems.forEach((i: any) => {
              if (i.status !== 'completed' && i.status !== 'skipped' && i.status !== 'transferred') {
                missed.push(i);
              }
            });
          }
        });
      }
    }

    return { frozenDays, missedItems: missed };
  }, [isToday, weeklyPlanData]);

  const confirmRegenerate = () => {
    let context = '';
    const { frozenDays, missedItems } = regenerationContext;

    if (missedItems.length > 0 && transferAction === 'move') {
      context = `Ensure the following activities are moved to tomorrow (${format(selectedDate, 'EEEE')}): ${missedItems.map(i => i.title).join(', ')}.`;
    }

    regenerateMutation.mutate({
      weekStart: weekStartStr,
      frozenDays,
      additionalContext: context
    });
  };

  // Memoized handlers
  const { mutate: completeActivity } = completeActivityMutation;
  const { mutate: advancePath } = advancePathMutation;

  const handleRhythmComplete = useCallback((item: RhythmItem, duration?: number) => {
    // Existing activity completion logic
    if (item.type === 'activity') {
      completeActivity({ item, duration });
    }

    // Path item advancement
    if (item.type === 'path_item' && item.data?.pathId) {
      advancePath(item.data.pathId);
    }
  }, [completeActivity, advancePath]);

  const handleBookClick = useCallback(() => {
    setSelectedBook(todaysBook);
  }, [todaysBook]);

  const handleSwap = useCallback((item: RhythmItem) => {
    if (item.type === 'activity' && item.data?.id) {
      setSwapActivity({ id: item.data.id, title: item.title });
    }
  }, []);

  // BUILD TIMELINE ITEMS (Moved up before conditional returns)
  const timelineItemsRaw = useMemo(() => {
    const items: RhythmItem[] = [];

    // 1. Learning Path Items
    if (isToday && pathsToday?.items && Array.isArray(pathsToday.items)) {
      pathsToday.items
        .filter((pathItem: TodayPathItem) => pathItem && pathItem.path_id)
        .forEach((pathItem: TodayPathItem, index: number) => {
          items.push({
            id: `path-${pathItem.path_id}-${index}`,
            timeSlot: '', // No time by default
            title: pathItem.item_title || pathItem.path_type || 'Path Item',
            description: `${pathItem.position || 1}/${pathItem.total || '?'} in ${pathItem.path_title}`,
            type: 'path_item',
            status: 'upcoming',
            data: {
              ...pathItem,
              pathId: pathItem.path_id,
              pathName: pathItem.path_title,
              content: pathItem.item_data
            }
          });
        });
    }

    // 3. Family Activities (Rhythm V2 & V1 Fallback)
    const rhythmData = dayData as any; // Using any for flexible V1/V2 parsing

    // Handle V2 Structure (morning/evening)
    if (rhythmData?.morning || rhythmData?.evening) {
      const mapRhythmItem = (item: any, slot: string) => ({
        id: item.id,
        timeSlot: slot,
        title: item.title,
        description: item.rationale || item.description || '',
        type: item.type === 'book' ? 'reading' : (item.type || 'activity'),
        status: item.status,
        data: item
      });

      (rhythmData.morning || []).forEach((item: any) => items.push(mapRhythmItem(item, 'Morning')));
      (rhythmData.evening || []).forEach((item: any) => items.push(mapRhythmItem(item, 'Evening')));
    }
    // Legacy V1 Structure (familySessions)
    else if (dayData?.familySessions && Array.isArray(dayData.familySessions)) {
      dayData.familySessions.forEach((session: any, index: number) => {
        // Avoid duplicates if also in paths
        if (items.some(i => i.id === session.formation.id)) return;

        items.push({
          id: session.formation.id || `activity-${index}`,
          timeSlot: session.timeSlot || 'Day',
          title: session.formation.title,
          description: session.reasoning,
          type: 'activity',
          status: session.isCompleted ? 'completed' : 'upcoming',
          data: session.formation
        });
      });
    }

    return items;
  }, [dayData, isToday, pathsToday]);

  // Make timelineItems stable based on content to prevent unnecessary re-renders of DailyRhythm
  const timelineItems = useStableValue(timelineItemsRaw);

  const nextItem = useMemo(() => timelineItems.find(i => i.status !== 'completed' && i.type !== 'section_header') || null, [timelineItems]);
  const pendingCount = useMemo(() => timelineItems.filter(i => i.status !== 'completed' && i.type !== 'section_header').length, [timelineItems]);


  // Loading State
  // Loading State - only show full spinner on initial load (no cached data)
  if (dayLoading && !dayData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <CircleNotch className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Planning your family's day...</p>
      </div>
    );
  }

  // Error State
  if (dayError || !dayData) {
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

  // No Children State (using activeChildren to exclude graduates)
  if (activeChildren.length === 0) {
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

  // Dashboard Content
  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 px-4 sm:px-0">
      {/* Greeting */}
      <div className="py-6 space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-display font-semibold text-foreground">
          Hello, {user?.name?.split(' ')[0] || 'Family'}! 👋
        </h1>
        <p className="text-muted-foreground">
          {isToday ? "Ready for today's rhythms?" : `Viewing ${format(selectedDate, 'EEEE, MMM d')}`}
        </p>
      </div>

      {/* Materials Banner (Optional) */}
      {dayData.materials?.every((m: MaterialItem) => m.status === 'unknown') && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 mb-6">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-900 dark:text-blue-200 flex items-center justify-between">
            <span>To get the best activity recommendations, set up your materials.</span>
            <Button variant="link" size="sm" onClick={() => navigate('/settings')} className="h-auto p-0 ml-2">
              Setup Materials &rarr;
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Week Strip */}
      <WeekStrip
        weekStart={weekStart}
        selectedDay={selectedDate}
        onDaySelect={setSelectedDate}
        onRegenerate={handleRegenerate}
        isRegenerating={regenerateMutation.isPending}
        dayData={weekSummary?.days || {}}
      />

      {/* Print Button */}
      {isToday && dayData && (
        <div className="flex justify-end px-2">
          <DownloadPrintButton
            document={pdfDocument}
            fileName={`daily_plan_${selectedDateStr}.pdf`}
            label="Print Plan"
            size="sm"
            variant="ghost"
            className="gap-2 text-muted-foreground hover:text-foreground"
          />
        </div>
      )}

      {/* REST DAY Override */}
      {dayData.restDay && (
        <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-xl border border-blue-100 dark:border-blue-900 text-center mb-6">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">Rest Day</h2>
          <p className="text-blue-700 dark:text-blue-200">{dayData.message}</p>
        </div>
      )}

      {/* Active Paths Progress */}
      {pathsToday?.active_paths && pathsToday.active_paths.length > 0 && (
        <div className="space-y-3">
          {pathsToday.active_paths.map(path => (
            <div key={path.id} className="flex items-center justify-between text-sm bg-muted/30 p-2 rounded-lg">
              <span className="font-medium flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary" />
                {path.title || path.path_type || 'Learning Path'}
              </span>
              <span className="text-muted-foreground text-xs">
                {path.subscription?.current_position}/{path.total_items}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* No Active Paths Empty State */}
      {isToday && (!pathsToday?.active_paths || pathsToday.active_paths.length === 0) && (
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-dashed">
          <CardContent className="flex flex-col items-center text-center py-6 space-y-3">
            <div className="h-10 w-10 bg-background rounded-full flex items-center justify-center shadow-sm">
              <Compass className="h-5 w-5 text-primary" weight="duotone" />
            </div>
            <div>
              <p className="font-medium">Start a Learning Path</p>
              <p className="text-sm text-muted-foreground">Follow a guided journey through hymns, catechisms, and more.</p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link to="/library/paths">Explore Paths</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Up Next Card - only for today */}
      {isToday && (
        <UpNextCard
          item={nextItem}
          onAction={(item) => {
            setActiveRhythmItem(item);
          }}
          onExpand={() => { }}
          pendingCount={pendingCount}
        />
      )}

      {/* Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {isToday ? `Learning Path (${timelineItems.length})` : `${format(selectedDate, 'EEEE')} Items (${timelineItems.length})`}
            </h3>
            {dayFetching && (
              <CircleNotch className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        <div className={cn("transition-opacity duration-200", dayFetching && "opacity-60")}>
          <DailyRhythm
            items={timelineItems}
            activeItem={activeRhythmItem}
            onSelectItem={setActiveRhythmItem}
            onComplete={handleRhythmComplete}
            onBookClick={handleBookClick}
            onSwap={isToday ? handleSwap : undefined}
          />
        </div>
      </div>

      {/* Book Reader */}
      {/* ⚡ Performance: Conditionally render BookReader to avoid hook overhead when closed */}
      {selectedBook && (
        <BookReader
          book={selectedBook}
          open={!!selectedBook}
          onOpenChange={(open) => !open && setSelectedBook(null)}
          childrenIds={dayData?.children?.map((c: any) => c.id)}
          onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ['todays-book'] });
            queryClient.invalidateQueries({ queryKey: ['reading-history-recent'] });
          }}
        />
      )}



      {/* Swap Activity Sheet */}
      <SwapActivitySheet
        open={!!swapActivity}
        onOpenChange={(open) => !open && setSwapActivity(null)}
        activityId={swapActivity?.id || null}
        activityTitle={swapActivity?.title}
        day={selectedDayName}
        weekStart={weekStartStr}
        onSwapComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['family-day'] });
          queryClient.invalidateQueries({ queryKey: ['family-today'] });
          queryClient.invalidateQueries({ queryKey: ['family-week-summary'] });
        }}
      />

      {/* Apprenticeship Approvals */}
      <WorkApprovals />

      {/* Time Spent Widget */}
      <TimeSpentWidget />

      {/* Family Progress */}
      <FamilyProgressMini />

      {/* AI Interaction Logs (Parent Visibility) */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">AI Safety Monitor</CardTitle>
          <CardDescription>Review what your children are asking the AI</CardDescription>
        </CardHeader>
        <CardContent>
          <AiLogViewer />
        </CardContent>
      </Card>

      <EndOfDaySummary
        date={selectedDate}
        items={timelineItems}
        open={showSummary}
        onClose={() => {
          setShowSummary(false);
          localStorage.setItem('daily_summary_shown', format(new Date(), 'yyyy-MM-dd'));
        }}
      />

      {/* Regenerate Dialog */}
      <Dialog open={isBalanceDialogOpen} onOpenChange={setIsBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customize this Week</DialogTitle>
            <DialogDescription>
              How should we balance activities for your children{childAges.length > 0 ? ` (${childAges.join(', ')})` : ''}?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Missed Items Warning */}
            {regenerationContext.missedItems.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                  I noticed {regenerationContext.missedItems.length} incomplete items from earlier this week.
                </p>
                <RadioGroup value={transferAction} onValueChange={(v: any) => setTransferAction(v)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="move" id="move" />
                    <Label htmlFor="move">Move to tomorrow</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="skip" id="skip" />
                    <Label htmlFor="skip">Skip and continue</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {regenerationContext.frozenDays.length > 0 && (
              <p className="text-xs text-muted-foreground">
                * {regenerationContext.frozenDays.join(', ')} are passed and will be frozen.
              </p>
            )}
          </div>



          <RadioGroup value={balancePreference} onValueChange={(v: any) => setBalancePreference(v)} className="gap-3">
            <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="baby_focused" id="r1" />
              <Label htmlFor="r1" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 font-semibold">
                  <Baby className="w-4 h-4 text-indigo-500" />
                  Baby Focused
                </div>
                <span className="text-xs text-muted-foreground">Prioritize sensory & bonding. Older kids help lead.</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="mixed" id="r2" />
              <Label htmlFor="r2" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 font-semibold">
                  <UsersThree className="w-4 h-4 text-green-500" />
                  Balanced Mix
                </div>
                <span className="text-xs text-muted-foreground">Equal focus across all age groups.</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="older_focused" id="r3" />
              <Label htmlFor="r3" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 font-semibold">
                  <Crown className="w-4 h-4 text-amber-500" />
                  Older Focused
                </div>
                <span className="text-xs text-muted-foreground">More complex activities. Babies observe/tag along.</span>
              </Label>
            </div>
          </RadioGroup>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBalanceDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmRegenerate} disabled={regenerateMutation.isPending}>
              {regenerateMutation.isPending ? 'Generating...' : 'Generate Week'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Path Completion Celebration Modal */}
      <PathCompletionModal
        isOpen={!!completedPathInfo}
        onClose={() => setCompletedPathInfo(null)}
        pathName={completedPathInfo?.pathName || ''}
        totalItems={completedPathInfo?.totalItems || 0}
      />
    </div>
  );
}
