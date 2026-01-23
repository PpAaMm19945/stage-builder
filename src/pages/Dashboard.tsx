import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { family, books, weeklyPlan, activityCompletions, reading, liturgy, paths } from '@/lib/api';
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
  CaretDown,
  CaretUp
} from '@phosphor-icons/react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { UpNextCard } from '@/components/dashboard/UpNextCard';
import { WeekStrip, getWeekStart } from '@/components/dashboard/WeekStrip';
import { toast } from 'sonner';
import { FormationCard } from '@/components/formations/FormationCard';
import { DailyRhythm, RhythmItem } from '@/components/planning/DailyRhythm';
import { SwapActivitySheet } from '@/components/planning/SwapActivitySheet';
import { MaterialItem, Book, LiturgyType } from '@/types';
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

const EMPTY_WEEK_DATA = {};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State for day navigation
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showFullDay, setShowFullDay] = useState(false);

  // State for regenerate dialog
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [balancePreference, setBalancePreference] = useState<'baby_focused' | 'mixed' | 'older_focused'>('mixed');

  // State for swap sheet
  const [swapActivity, setSwapActivity] = useState<{ id: string; title: string } | null>(null);

  const today = startOfDay(new Date());
  const weekStart = getWeekStart(today);
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = isSameDay(selectedDate, today);

  const { data: liturgyData } = useQuery({
    queryKey: ['liturgy-today'],
    queryFn: liturgy.getToday,
  });

  const { data: pathsToday } = useQuery({
    queryKey: ['paths-today'],
    queryFn: paths.getToday,
    enabled: isToday,
  });

  // Fetch day data - use getToday for today, getDay for other days
  // Use keepPreviousData to avoid jarring full-page reloads
  const { data: dayData, isLoading: dayLoading, isFetching: dayFetching, error: dayError } = useQuery({
    queryKey: ['family-day', selectedDateStr],
    queryFn: () => isToday ? family.getToday() : family.getDay(selectedDateStr),
    placeholderData: (previousData) => previousData, // Keep showing previous data while fetching
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Fetch week summary for the week strip
  const { data: weekSummary } = useQuery({
    queryKey: ['family-week-summary', weekStartStr],
    queryFn: () => family.getWeekSummary(weekStartStr),
  });

  const { data: childrenData } = useQuery({
    queryKey: ['students'],
    queryFn: () => family.getToday().then(d => d.children),
    enabled: isBalanceDialogOpen,
  });

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

  const pdfLiturgyRaw = liturgyData?.items || [];

  // Stabilize the inputs for the PDF
  const pdfActivities = useStableValue(pdfActivitiesRaw);
  const pdfLiturgy = useStableValue(pdfLiturgyRaw);
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
          liturgy: pdfLiturgy,
          activities: pdfActivities,
          reading: pdfBook || undefined
        }}
        children={activeChildren}
      />
    );
  }, [isToday, !!dayData, pdfLiturgy, pdfActivities, pdfBook, activeChildren]);

  // Get weekly plan for completion status
  const { data: weeklyPlanData } = useQuery({
    queryKey: ['family-weekly-plan'],
    queryFn: () => weeklyPlan.get(),
  });

  // Regenerate mutation
  const regenerateMutation = useMutation({
    mutationFn: (prefs: { balancePreference: 'baby_focused' | 'mixed' | 'older_focused'; weekStart: string }) =>
      weeklyPlan.regenerate(prefs),
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
        toast.success('🎉 Congratulations! You completed this path!');
      }
    },
    onError: (error: any) => {
      toast.error('Could not save progress. Please try again.');
      console.error('Path advance error:', error);
    },
  });

  const handleRegenerate = useCallback(() => setIsBalanceDialogOpen(true), []);

  const confirmRegenerate = () => {
    regenerateMutation.mutate({ balancePreference, weekStart: weekStartStr });
  };

  // Liturgy Mutations
  const completeLiturgyMutation = useMutation({
    mutationFn: liturgy.complete,
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['liturgy-today'] });
      const previousData = queryClient.getQueryData(['liturgy-today']);
      queryClient.setQueryData(['liturgy-today'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) =>
            item.id === itemId ? { ...item, completedToday: true } : item
          ),
        };
      });
      return { previousData };
    },
    onError: (err, itemId, context: any) => {
      queryClient.setQueryData(['liturgy-today'], context.previousData);
      toast.error('Failed to mark as complete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liturgy-today'] });
      toast.success('Marked as complete!');
    },
  });

  const uncompleteLiturgyMutation = useMutation({
    mutationFn: liturgy.uncomplete,
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['liturgy-today'] });
      const previousData = queryClient.getQueryData(['liturgy-today']);
      queryClient.setQueryData(['liturgy-today'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) =>
            item.id === itemId ? { ...item, completedToday: false } : item
          ),
        };
      });
      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liturgy-today'] });
    },
  });

  const advanceLiturgyMutation = useMutation({
    mutationFn: liturgy.advance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liturgy-today'] });
      toast.success('Advanced to next week!');
    },
  });

  const { mutate: completeLiturgy } = completeLiturgyMutation;
  const { mutate: uncompleteLiturgy } = uncompleteLiturgyMutation;

  const handleLiturgyToggle = useCallback((id: string, completed: boolean) => {
    if (completed) {
      completeLiturgy(id);
    } else {
      uncompleteLiturgy(id);
    }
  }, [completeLiturgy, uncompleteLiturgy]);

  const { mutate: advanceLiturgy } = advanceLiturgyMutation;

  const handleLiturgyAdvance = useCallback((type: string) => {
    advanceLiturgy(type as LiturgyType);
  }, [advanceLiturgy]);

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
  const timelineItems = useMemo(() => {
    if (!dayData) return []; // Safety check for early returns

    const rawItems: RhythmItem[] = [];

    // 1. Liturgy (Morning)
    if (isToday) {
      const liturgyItems = liturgyData?.items || [];
      const allLiturgyCompleted = liturgyItems.length > 0 && liturgyItems.every((i: any) => i.completedToday);

      rawItems.push({
        id: 'liturgy-morning',
        timeSlot: '08:00',
        title: 'Morning Liturgy',
        description: 'Scripture, hymnal, and catechism.',
        type: 'liturgy',
        status: allLiturgyCompleted ? 'completed' : 'upcoming',
        data: {
          context_anchor: 'Morning Circle',
          items: liturgyItems,
          allCompleted: allLiturgyCompleted
        }
      });

      // Add Path Items (Hymns, Catechism from active paths)
      if (pathsToday?.items && Array.isArray(pathsToday.items)) {
        pathsToday.items
          .filter((pathItem: TodayPathItem) => pathItem && pathItem.path_id)
          .forEach((pathItem: TodayPathItem, index: number) => {
            rawItems.push({
              id: `path-${pathItem.path_id}-${index}`,
              timeSlot: pathItem.item_type === 'hymn' ? '08:15' : '08:30',
              title: pathItem.item_title || pathItem.path_type || 'Path Item',
              description: pathItem.path_title || '',
              type: 'path_item',
            status: 'upcoming',
            data: {
              ...pathItem,
              context_anchor: 'Morning Circle',
              pathId: pathItem.path_id,
              pathName: pathItem.path_title,
              content: pathItem.item_data
            }
          });
        });
      }
    }

    // 2. Family Sessions
    if (dayData.familySessions && Array.isArray(dayData.familySessions)) {
      dayData.familySessions.forEach((session: any, index: number) => {
        if (!session) return;
        const activity = session.formation || session.activity;
        if (!activity || !activity.id) return;

        let time = '09:00';
        if (session.timeSlot === 'afternoon') time = '14:00';

        const isCompleted = session.isCompleted ||
          (weeklyPlanData?.completions && weeklyPlanData.completions[activity.id]);

        // Determine context anchor
        const context = activity.context_anchor ||
          (activity.formation_type === 'daily_practice' ? 'Walk By The Way' : 'Table Fellowship');

        rawItems.push({
          id: `session-${index}`,
          timeSlot: time,
          title: activity.title || 'Untitled Activity',
          description: activity.description || '',
          type: 'activity',
          status: isCompleted ? 'completed' : 'upcoming',
          data: { ...activity, context_anchor: context }
        });
      });
    }

    // 3. Book (Read Aloud)
    if (isToday && todaysBook) {
      rawItems.push({
        id: 'book-reading',
        timeSlot: '11:00',
        title: 'Read Aloud Time',
        description: todaysBook.title || 'Book',
        type: 'book',
        status: 'upcoming',
        data: { ...todaysBook, context_anchor: 'Morning Circle' }
      });
    }

    // 4. Daily Practices
    if (isToday && dayData.dailyPractices && Array.isArray(dayData.dailyPractices)) {
      dayData.dailyPractices.forEach((practice: any, index: number) => {
        if (!practice || !practice.id) return;
        rawItems.push({
          id: `practice-${index}`,
          timeSlot: '18:00',
          title: practice.title || 'Daily Practice',
          description: practice.description || '',
          type: 'activity',
          status: 'upcoming',
          data: { ...practice, context_anchor: 'Walk By The Way' }
        });
      });
    }

    // Sort raw items by time first to ensure order within groups
    rawItems.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

    // Group by Context Anchor
    const groups: Record<string, RhythmItem[]> = {
      'Morning Circle': [],
      'Table Fellowship': [],
      'Walk By The Way': [],
      'Other': []
    };

    rawItems.forEach(item => {
      const context = item.data?.context_anchor;
      if (context && groups[context]) {
        groups[context].push(item);
      } else if (context) {
        // Handle custom contexts dynamically if needed, or fallback
        if (!groups[context]) groups[context] = [];
        groups[context].push(item);
      } else {
        // Fallback mapping based on type
        if (item.type === 'liturgy' || item.type === 'book') groups['Morning Circle'].push(item);
        else if (item.type === 'activity') groups['Table Fellowship'].push(item); // Default for sessions
        else groups['Walk By The Way'].push(item);
      }
    });

    // Flatten into timelineItems with Headers
    const flattenedItems: RhythmItem[] = [];
    const orderedContexts = ['Morning Circle', 'Table Fellowship', 'Walk By The Way'];

    // Add any custom contexts found
    Object.keys(groups).forEach(k => {
      if (!orderedContexts.includes(k) && k !== 'Other') orderedContexts.push(k);
    });
    orderedContexts.push('Other');

    orderedContexts.forEach(context => {
      const items = groups[context];
      if (items && items.length > 0) {
        // Add Header
        flattenedItems.push({
          id: `header-${context}`,
          timeSlot: 'Header',
          title: context,
          type: 'section_header',
          status: 'upcoming' // not used for header
        });
        // Add Items
        items.forEach(item => flattenedItems.push(item));
      }
    });

    return flattenedItems;
  }, [isToday, dayData, weeklyPlanData, todaysBook, liturgyData, pathsToday]);

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

  // First Time User (No Materials)
  const isFirstTimeUser = dayData.materials?.every((m: MaterialItem) => m.status === 'unknown');
  if (isFirstTimeUser && dayData.familySessions?.length === 0) {
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
  if (dayData.needsPlan) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-bold text-center mb-4">Daily Liturgy</h2>
          {(liturgyData?.items || []).filter((item: any) => item && item.id).map((item: any) => (
            <FormationCard
              key={item.id}
              formation={{
                id: item.id,
                title: item.title || 'Liturgy Item',
                description: item.reference || '',
                formation_type: item.type, // types like 'catechism' work with FormationCard
                primary_virtue: 'Wisdom',
                context_anchor: 'Morning_Circle',
                min_age_months: 0,
                max_age_months: 0,
                duration_minutes: 5,
                guide_steps: [],
                parent_posture: '',
                materials: [],
                liturgical_script: item.content,
                is_active: 1,
                content_source: 'liturgy'
              }}
              isCompleted={item.completedToday}
              onComplete={handleLiturgyToggle}
            />
          ))}
          {liturgyData?.items?.length > 0 && liturgyData.items.every((i: any) => i && i.completedToday) && (
            <Button onClick={() => handleLiturgyAdvance('catechism')} variant="outline" className="w-full">
              Advance Liturgy
            </Button>
          )}
        </div>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent mt-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Let's Plan Your Week!</CardTitle>
            <CardDescription>{dayData.message || "Generate a schedule to get personalized activities."}</CardDescription>
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

  // Build day data for week strip
  const weekDayData = weekSummary?.days || EMPTY_WEEK_DATA;

  // Get day name for swap
  const selectedDayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][selectedDate.getDay()];

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

      {/* Week Strip */}
      <WeekStrip
        weekStart={weekStart}
        selectedDay={selectedDate}
        onDaySelect={setSelectedDate}
        onRegenerate={handleRegenerate}
        isRegenerating={regenerateMutation.isPending}
        dayData={weekDayData}
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
            if (item.type === 'book' && todaysBook) setSelectedBook(todaysBook);
            setShowFullDay(true);
          }}
          onExpand={() => setShowFullDay(!showFullDay)}
          pendingCount={pendingCount}
        />
      )}

      {/* Timeline */}
      <Collapsible open={showFullDay || !isToday} onOpenChange={setShowFullDay} className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {isToday ? `Full Schedule (${timelineItems.length})` : `${format(selectedDate, 'EEEE')} Activities (${timelineItems.length})`}
            </h3>
            {dayFetching && (
              <CircleNotch className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
          </div>
          {isToday && (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {showFullDay ? (
                  <CaretUp className="h-4 w-4" />
                ) : (
                  <CaretDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          )}
        </div>

        <CollapsibleContent forceMount={!isToday ? true : undefined}>
          <div className={cn("transition-opacity duration-200", dayFetching && "opacity-60")}>
            <DailyRhythm
              items={timelineItems}
              onComplete={handleRhythmComplete}
              onBookClick={handleBookClick}
              onSwap={isToday ? handleSwap : undefined}
              onLiturgyToggle={handleLiturgyToggle}
              onLiturgyAdvance={handleLiturgyAdvance}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Book Reader */}
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

      {/* Regenerate Dialog */}
      <Dialog open={isBalanceDialogOpen} onOpenChange={setIsBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customize this Week</DialogTitle>
            <DialogDescription>
              How should we balance activities for your children{childAges.length > 0 ? ` (${childAges.join(', ')})` : ''}?
            </DialogDescription>
          </DialogHeader>

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
    </div>
  );
}
