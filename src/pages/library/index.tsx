import { useEffect, useState } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Books,
    MusicNotes,
    Shapes,
    Compass
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { ActivityBrowser } from '@/components/library/ActivityBrowser';
import { HymnBrowser } from '@/components/library/HymnBrowser';
import { BookLibrary } from '@/components/books/BookLibrary';
import { GuestBanner } from '@/components/library/GuestBanner';

export default function LibraryPage() {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Determine active tab from URL path or query param
    const getInitialTab = () => {
        // Check path-based routing first
        if (location.pathname === '/library/books') return 'books';
        if (location.pathname === '/library/hymns') return 'hymns';
        if (location.pathname === '/library/activities') return 'activities';
        
        // Fall back to query param for backward compatibility
        const tabParam = searchParams.get('tab');
        if (tabParam && ['activities', 'books', 'hymns'].includes(tabParam)) {
            return tabParam;
        }
        return 'activities';
    };
    
    const [activeTab, setActiveTab] = useState(getInitialTab);

    // Sync tab state with URL
    useEffect(() => {
        setActiveTab(getInitialTab());
    }, [location.pathname, searchParams]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        // Use clean URLs instead of query params
        // But keep query param for now for backward compatibility
        setSearchParams({ tab: value });
    };

    return (
        <div className="space-y-6 pb-24">
            <div className="py-2 space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">Library</h1>
                        <p className="text-muted-foreground">Resources for your family's formation and delight.</p>
                    </div>
                    <Button asChild variant="outline" className="hidden sm:flex">
                        <Link to="/library/paths">
                            <Compass className="mr-2 h-4 w-4" />
                            Learning Paths
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="grid grid-cols-3 w-full h-auto p-1 bg-muted/50 rounded-xl max-w-md">
                    <TabsTrigger value="activities" className="flex flex-col sm:flex-row items-center gap-2 py-2.5 sm:py-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
                        <Shapes className="h-5 w-5" weight={activeTab === 'activities' ? 'fill' : 'duotone'} />
                        <span>Formations</span>
                    </TabsTrigger>
                    <TabsTrigger value="books" className="flex flex-col sm:flex-row items-center gap-2 py-2.5 sm:py-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
                        <Books className="h-5 w-5" weight={activeTab === 'books' ? 'fill' : 'duotone'} />
                        <span>Books</span>
                    </TabsTrigger>
                    <TabsTrigger value="hymns" className="flex flex-col sm:flex-row items-center gap-2 py-2.5 sm:py-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
                        <MusicNotes className="h-5 w-5" weight={activeTab === 'hymns' ? 'fill' : 'duotone'} />
                        <span>Hymns</span>
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="activities" className="animate-in fade-in slide-in-from-left-4 duration-300 focus-visible:outline-none">
                        <ActivityBrowser />
                    </TabsContent>

                    <TabsContent value="books" className="animate-in fade-in slide-in-from-left-4 duration-300 focus-visible:outline-none">
                        <BookLibrary />
                    </TabsContent>

                    <TabsContent value="hymns" className="animate-in fade-in slide-in-from-left-4 duration-300 focus-visible:outline-none">
                        <HymnBrowser />
                    </TabsContent>
                </div>
            </Tabs>

            {/* Mobile-only Learning Paths Link */}
            <div className="sm:hidden">
                <Button asChild variant="outline" className="w-full">
                    <Link to="/library/paths">
                        <Compass className="mr-2 h-4 w-4" />
                        Explore Learning Paths
                    </Link>
                </Button>
            </div>

            {/* Guest Conversion Banner */}
            <GuestBanner incrementView />
        </div>
    );
}
