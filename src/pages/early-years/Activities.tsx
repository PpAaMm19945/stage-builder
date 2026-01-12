import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlass, Clock, Funnel, X, MagnifyingGlassMinus } from '@phosphor-icons/react';
import { activities as activitiesApi } from '@/lib/api';
import { DOMAIN_LABELS, DOMAIN_TO_VIRTUE, VIRTUE_LABELS, type EarlyYearsDomain, type PrimaryVirtue } from '@/types';

const virtueColors: Record<PrimaryVirtue, string> = {
  'Wisdom': 'bg-purple-50 text-purple-700 border-purple-200',
  'Stewardship': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Love': 'bg-rose-50 text-rose-700 border-rose-200',
  'Order': 'bg-amber-50 text-amber-700 border-amber-200',
  'Wonder': 'bg-blue-50 text-blue-700 border-blue-200',
};

const virtueFilters: { id: PrimaryVirtue | 'all'; label: string }[] = [
  { id: 'all', label: 'All Virtues' },
  { id: 'Wisdom', label: 'Wisdom' },
  { id: 'Stewardship', label: 'Stewardship' },
  { id: 'Love', label: 'Love' },
  { id: 'Order', label: 'Order' },
  { id: 'Wonder', label: 'Wonder' },
];

// Map API response fields to UI expected fields
interface ApiActivity {
  id: string;
  title: string;
  description: string;
  domain?: EarlyYearsDomain;
  primary_virtue?: PrimaryVirtue;
  duration_minutes: number;
  difficulty: number;
  materials: string[];
  instructions: string[];
  guide_steps?: string[];
  min_age_months: number;
  max_age_months: number;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  domain: PrimaryVirtue;
  estimatedMinutes: number;
  difficultyLevel: number;
  materials: string[];
  instructions: string[];
  minAgeMonths: number;
  maxAgeMonths: number;
}

const mapApiActivity = (activity: ApiActivity): Activity => ({
  id: activity.id,
  title: activity.title,
  description: activity.description,
  domain: activity.primary_virtue || (activity.domain ? DOMAIN_TO_VIRTUE[activity.domain as string] : 'Wisdom') || 'Wisdom',
  estimatedMinutes: activity.duration_minutes,
  difficultyLevel: activity.difficulty,
  materials: activity.materials || [],
  instructions: activity.guide_steps || activity.instructions || [],
  minAgeMonths: activity.min_age_months,
  maxAgeMonths: activity.max_age_months,
});

export default function Activities() {
  const { selectedChild } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<PrimaryVirtue | 'all'>('all');
  const [showAgeAppropriate, setShowAgeAppropriate] = useState(true);

  // Build query params for API
  const queryParams: { primary_virtue?: string; ageMonths?: number } = {};
  if (selectedDomain !== 'all') {
    queryParams.primary_virtue = selectedDomain;
  }
  if (showAgeAppropriate && selectedChild) {
    queryParams.ageMonths = selectedChild.ageInMonths;
  }

  // Fetch activities from API
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['activities', queryParams],
    queryFn: () => activitiesApi.list(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <ErrorState
        title="Failed to Load Activities"
        message={error instanceof Error ? error.message : "We couldn't load the activity library. Please try again."}
        onRetry={() => refetch()}
      />
    );
  }

  // Map API activities and apply client-side search filter
  const allActivities = (data || []).map(mapApiActivity);
  const filteredActivities = allActivities.filter((activity) => {
    const matchesSearch = activity.title.toLowerCase().includes(search.toLowerCase()) ||
      activity.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-bold text-foreground">
          Formation Library
        </h1>
        <p className="text-muted-foreground">
          {showAgeAppropriate && selectedChild
            ? `${filteredActivities.length} formations for ${selectedChild.name}`
            : `${filteredActivities.length} formations available`}
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" weight="duotone" />
          <Input
            placeholder="Search formations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" weight="bold" />
            </button>
          )}
        </div>

        {/* Virtue Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Funnel className="h-4 w-4 text-muted-foreground" weight="duotone" />
          {virtueFilters.map((virtue) => (
            <Button
              key={virtue.id}
              variant={selectedDomain === virtue.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDomain(virtue.id)}
              className="rounded-full"
            >
              {virtue.label}
            </Button>
          ))}
        </div>

        {/* Age Toggle */}
        {selectedChild && (
          <div className="flex items-center gap-2">
            <Button
              variant={showAgeAppropriate ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setShowAgeAppropriate(!showAgeAppropriate)}
            >
              {showAgeAppropriate ? 'Age-appropriate only' : 'Showing all ages'}
            </Button>
          </div>
        )}
      </div>

      {/* Activity Grid */}
      {filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map((activity) => (
            <Card
              key={activity.id}
              className="cursor-pointer hover:border-muted-foreground/40 hover:shadow-md transition-all group"
              onClick={() => navigate(`/early-years/activities/${activity.id}`)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className={virtueColors[activity.domain]}>
                    {VIRTUE_LABELS[activity.domain]}
                  </Badge>
                  <div className="flex gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 w-2 rounded-full ${level <= activity.difficultyLevel
                          ? 'bg-primary/70'
                          : 'bg-muted'
                          }`}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="font-medium text-foreground leading-tight group-hover:text-primary transition-colors">
                  {activity.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {activity.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" weight="duotone" />
                    <span>{activity.estimatedMinutes} mins</span>
                  </div>
                  <span>•</span>
                  <span>{activity.minAgeMonths}-{activity.maxAgeMonths} months</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MagnifyingGlassMinus}
          title="No Formations Found"
          description="Try adjusting your filters or browse all formations."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedDomain('all');
          }}
        />
      )}
    </div>
  );
}
