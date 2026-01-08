import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Books,
    MusicNotes,
    Shapes
} from '@phosphor-icons/react';
import { ActivityBrowser } from '@/components/library/ActivityBrowser';
import { HymnBrowser } from '@/components/library/HymnBrowser';
import { BookLibrary } from '@/components/books/BookLibrary';

export default function Library() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('activities');

    // Sync tab state with URL query param
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam && ['activities', 'books', 'hymns'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setSearchParams({ tab: value });
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-24 px-4 sm:px-0">
            <div className="py-6 space-y-2">
                <h1 className="text-3xl font-display font-bold text-foreground">Library</h1>
                <p className="text-muted-foreground">Resources for your family's formation and delight.</p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="grid grid-cols-3 w-full h-auto p-1 bg-muted/50 rounded-xl max-w-md">
                    <TabsTrigger value="activities" className="flex flex-col sm:flex-row items-center gap-2 py-2.5 sm:py-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
                        <Shapes className="h-5 w-5" weight={activeTab === 'activities' ? 'fill' : 'duotone'} />
                        <span>Activities</span>
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
        </div>
    );
}
