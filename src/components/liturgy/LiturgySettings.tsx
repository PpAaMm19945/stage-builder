import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  BookOpen,
  BookBookmark,
  MusicNotes,
  Scroll,
} from '@phosphor-icons/react';
import { liturgy } from '@/lib/api';
import { FamilyLiturgySettings } from '@/types';
import { toast } from 'sonner';

export function LiturgySettings() {
  const [settings, setSettings] = useState<FamilyLiturgySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await liturgy.getSettings();
      setSettings(data);
    } catch (error) {
      toast.error('Failed to load liturgy settings');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: keyof FamilyLiturgySettings, value: boolean) => {
    if (!settings) return;

    // Optimistic update
    const previousSettings = { ...settings };
    setSettings({ ...settings, [key]: value });

    try {
      await liturgy.updateSettings({ [key]: value });
      toast.success('Settings updated');
    } catch (error) {
      // Revert on error
      setSettings(previousSettings);
      toast.error('Failed to update settings');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
           <CardTitle className="flex items-center gap-2 text-lg">
             <BookOpen className="h-5 w-5" />
             Daily Liturgy
           </CardTitle>
           <CardDescription>
             Customize your family's morning time rituals
           </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-sm text-muted-foreground">Loading settings...</div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardHeader>
           <CardTitle className="flex items-center gap-2 text-lg">
             <BookOpen className="h-5 w-5" />
             Daily Liturgy
           </CardTitle>
           <CardDescription>
             Customize your family's morning time rituals
           </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-sm text-muted-foreground">Unable to load settings</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5" />
          Daily Liturgy
        </CardTitle>
        <CardDescription>
          Customize your family's morning time rituals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <BookBookmark className="h-5 w-5" weight="duotone" />
            </div>
            <div>
              <Label className="text-base font-medium">Catechism</Label>
              <p className="text-sm text-muted-foreground">
                Weekly Q&A for theological grounding
              </p>
            </div>
          </div>
          <Switch
            checked={settings.catechismEnabled}
            onCheckedChange={(checked) => updateSetting('catechismEnabled', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <MusicNotes className="h-5 w-5" weight="duotone" />
            </div>
            <div>
              <Label className="text-base font-medium">Hymn</Label>
              <p className="text-sm text-muted-foreground">
                Classic hymns with lyrics and audio
              </p>
            </div>
          </div>
          <Switch
            checked={settings.hymnEnabled}
            onCheckedChange={(checked) => updateSetting('hymnEnabled', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Scroll className="h-5 w-5" weight="duotone" />
            </div>
            <div>
              <Label className="text-base font-medium">Scripture</Label>
              <p className="text-sm text-muted-foreground">
                Weekly memory verses
              </p>
            </div>
          </div>
          <Switch
            checked={settings.scriptureEnabled}
            onCheckedChange={(checked) => updateSetting('scriptureEnabled', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
