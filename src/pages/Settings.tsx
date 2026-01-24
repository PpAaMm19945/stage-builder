import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsFamily } from '@/components/settings/SettingsFamily';
import { SettingsSchedule } from '@/components/settings/SettingsSchedule';
import { SettingsCurriculum } from '@/components/settings/SettingsCurriculum';
import { SettingsMaterials } from '@/components/settings/SettingsMaterials';
import { SettingsAccount } from '@/components/settings/SettingsAccount';
import { SettingsErrorBoundary } from '@/components/settings/SettingsErrorBoundary';
import {
  UsersThree,
  Bell,
  BookOpen,
  PaintBrush,
  User
} from '@phosphor-icons/react';

export default function Settings() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('family');

  useEffect(() => {
    // Handle query params or hash
    const tabParam = searchParams.get('tab');
    const quickstart = searchParams.get('quickstart');
    const hash = location.hash.replace('#', '');

    if (quickstart) {
      setActiveTab('materials');
    } else if (tabParam) {
      setActiveTab(tabParam);
    } else if (hash === 'support') {
      setActiveTab('account');
      // Optional: scroll to support section after render
      setTimeout(() => {
        document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [searchParams, location.hash]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 px-4 sm:px-0">
      <div className="py-6 space-y-2">
        <h1 className="text-3xl font-display font-bold text-foreground">Command Center</h1>
        <p className="text-muted-foreground">Your Family's Learning Headquarters</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full h-auto p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="family" aria-label="Family" className="flex flex-col gap-1 py-3 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
            <UsersThree className="h-5 w-5" />
            <span className="hidden sm:inline">Family</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" aria-label="Schedule" className="flex flex-col gap-1 py-3 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
            <Bell className="h-5 w-5" />
            <span className="hidden sm:inline">Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="curriculum" aria-label="Curriculum" className="flex flex-col gap-1 py-3 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
            <BookOpen className="h-5 w-5" />
            <span className="hidden sm:inline">Curriculum</span>
          </TabsTrigger>
          <TabsTrigger value="materials" aria-label="Materials" className="flex flex-col gap-1 py-3 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
            <PaintBrush className="h-5 w-5" />
            <span className="hidden sm:inline">Materials</span>
          </TabsTrigger>
          <TabsTrigger value="account" aria-label="Account" className="flex flex-col gap-1 py-3 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="family" className="animate-in fade-in slide-in-from-left-4 duration-300">
            <SettingsErrorBoundary>
              <SettingsFamily />
            </SettingsErrorBoundary>
          </TabsContent>

          <TabsContent value="schedule" className="animate-in fade-in slide-in-from-left-4 duration-300">
            <SettingsErrorBoundary>
              <SettingsSchedule />
            </SettingsErrorBoundary>
          </TabsContent>

          <TabsContent value="curriculum" className="animate-in fade-in slide-in-from-left-4 duration-300">
            <SettingsErrorBoundary>
              <SettingsCurriculum />
            </SettingsErrorBoundary>
          </TabsContent>

          <TabsContent value="materials" className="animate-in fade-in slide-in-from-left-4 duration-300">
            <SettingsErrorBoundary>
              <SettingsMaterials />
            </SettingsErrorBoundary>
          </TabsContent>

          <TabsContent value="account" className="animate-in fade-in slide-in-from-left-4 duration-300">
            <SettingsErrorBoundary>
              <SettingsAccount />
            </SettingsErrorBoundary>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
