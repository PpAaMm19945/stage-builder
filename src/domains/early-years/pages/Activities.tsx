import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { 
  Search,
  Clock,
  Filter,
  X
} from 'lucide-react';
import { getActivitiesForAge, getAllActivities } from '../data/activities';
import { DOMAIN_LABELS, DOMAIN_COLORS, type EarlyYearsDomain } from '../types';

const domainFilters: { id: EarlyYearsDomain | 'all'; label: string }[] = [
  { id: 'all', label: 'All Domains' },
  { id: 'motor', label: 'Motor' },
  { id: 'language', label: 'Language' },
  { id: 'cognitive', label: 'Cognitive' },
  { id: 'social-emotional', label: 'Social' },
  { id: 'pre-academic', label: 'Pre-Academic' },
];

export default function Activities() {
  const { selectedChild } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<EarlyYearsDomain | 'all'>('all');
  const [showAgeAppropriate, setShowAgeAppropriate] = useState(true);

  // Get activities based on filter
  const allActivities = getAllActivities();
  const ageAppropriateActivities = selectedChild 
    ? getActivitiesForAge(selectedChild.ageInMonths)
    : allActivities;

  const baseActivities = showAgeAppropriate ? ageAppropriateActivities : allActivities;

  // Apply filters
  const filteredActivities = baseActivities.filter((activity) => {
    const matchesSearch = activity.title.toLowerCase().includes(search.toLowerCase()) ||
      activity.description.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = selectedDomain === 'all' || activity.domain === selectedDomain;
    return matchesSearch && matchesDomain;
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
                  <Badge variant="outline" className={DOMAIN_COLORS[activity.domain]}>
                    {DOMAIN_LABELS[activity.domain]}
                  </Badge>
                  <div className="flex gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 w-2 rounded-full ${
                          level <= activity.difficultyLevel
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
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No activities found matching your filters.
            </p>
            <Button
              variant="link"
              onClick={() => {
                setSearch('');
                setSelectedDomain('all');
              }}
              className="mt-2"
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
