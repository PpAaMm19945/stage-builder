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
import {
  Search,
  Clock,
  Filter,
  X,
  SearchX
} from 'lucide-react';
import { activities as activitiesApi } from '@/lib/api';
import { DOMAIN_LABELS, type EarlyYearsDomain } from '@/types';

const domainColors: Record<EarlyYearsDomain, string> = {
  'motor': 'bg-domain-motor/10 text-domain-motor border-domain-motor/20',
  'language': 'bg-domain-language/10 text-domain-language border-domain-language/20',
  'cognitive': 'bg-domain-cognitive/10 text-domain-cognitive border-domain-cognitive/20',
  'social-emotional': 'bg-domain-social/10 text-domain-social border-domain-social/20',
  'pre-academic': 'bg-domain-academic/10 text-domain-academic border-domain-academic/20',
};

const domainFilters: { id: EarlyYearsDomain | 'all'; label: string }[] = [
  { id: 'all', label: 'All Domains' },
  { id: 'motor', label: 'Motor' },
  { id: 'language', label: 'Language' },
  { id: 'cognitive', label: 'Cognitive' },
  { id: 'social-emotional', label: 'Social' },
  { id: 'pre-academic', label: 'Pre-Academic' },
];

// Map API response fields to UI expected fields
interface ApiActivity {
  id: string;
  title: string;
  description: string;
  domain: EarlyYearsDomain;
  duration_minutes: number;
  difficulty: number;
  materials: string[];
  instructions: string[];
  min_age_months: number;
  max_age_months: number;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  domain: EarlyYearsDomain;
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
  domain: activity.domain,
  estimatedMinutes: activity.duration_minutes,
  difficultyLevel: activity.difficulty,
  materials: activity.materials || [],
  instructions: activity.instructions || [],
  minAgeMonths: activity.min_age_months,
  maxAgeMonths: activity.max_age_months,
});

export default function Activities() {
  const { selectedChild } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<EarlyYearsDomain | 'all'>('all');
  const [showAgeAppropriate, setShowAgeAppropriate] = useState(true);

  // Build query params for API
  const queryParams: { domain?: string; ageMonths?: number } = {};
  if (selectedDomain !== 'all') {
    queryParams.domain = selectedDomain;
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
        <div className="flex gap-2">
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
          Activity Library
        </h1>
        <p className="text-muted-foreground">
          {showAgeAppropriate && selectedChild
            ? `${filteredActivities.length} activities for ${selectedChild.name}`
            : `${filteredActivities.length} activities available`}
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Domain Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {domainFilters.map((domain) => (
            <Button
              key={domain.id}
              variant={selectedDomain === domain.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDomain(domain.id)}
              className="rounded-full"
            >
              {domain.label}
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
                  <Badge variant="outline" className={domainColors[activity.domain]}>
                    {DOMAIN_LABELS[activity.domain]}
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
                    <Clock className="h-3 w-3" />
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
          icon={SearchX}
          title="No Activities Found"
          description="Try adjusting your filters or browse all activities."
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
