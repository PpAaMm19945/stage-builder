import { useQuery } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { family } from '@/lib/api';
import { useEveningPrompt } from '@/hooks/useEveningPrompt';
import {
    Moon,
    CheckCircle,
    Package,
    Sparkle,
    Clock,
    ArrowRight
} from '@phosphor-icons/react';
import { useState } from 'react';

export function TomorrowsPrepModal() {
    const { shouldShow, acknowledge, snooze } = useEveningPrompt();
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

    const { data } = useQuery({
        queryKey: ['family-today'],
        queryFn: family.getToday,
        enabled: shouldShow,
    });

    if (!shouldShow || !data) return null;

    const materials = data.materials || [];
    const sessions = data.familySessions || [];

    const hasItems = materials.length > 0 || sessions.length > 0;

    const toggleItem = (name: string) => {
        setCheckedItems(prev => {
            const next = new Set(prev);
            if (next.has(name)) {
                next.delete(name);
            } else {
                next.add(name);
            }
            return next;
        });
    };

    const allChecked = materials.length > 0 && materials.every(m => checkedItems.has(m.name));

    return (
        <Dialog open={shouldShow} onOpenChange={(open) => !open && snooze()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                            <Moon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" weight="duotone" />
                        </div>
                    </div>
                    <DialogTitle className="text-xl font-display">
                        Tomorrow's Table
                    </DialogTitle>
                    <DialogDescription>
                        Here's what you'll need for tomorrow's learning
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Activities Preview */}
                    {sessions.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                <Sparkle className="h-4 w-4 text-amber-500" weight="duotone" />
                                Tomorrow's Activities
                            </p>
                            <div className="space-y-1">
                                {sessions.slice(0, 3).map((session: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded-lg">
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" weight="duotone" />
                                        <span className="font-medium">{session.activity.title}</span>
                                        <span className="text-muted-foreground ml-auto">{session.activity.duration_minutes} min</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Materials Checklist */}
                    {materials.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                <Package className="h-4 w-4 text-primary" weight="duotone" />
                                Materials to Prepare
                            </p>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {materials.map((material: any) => (
                                    <label
                                        key={material.name}
                                        className="flex items-center gap-3 p-2 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                                    >
                                        <Checkbox
                                            checked={checkedItems.has(material.name)}
                                            onCheckedChange={() => toggleItem(material.name)}
                                        />
                                        <span className="text-sm font-medium">{material.name}</span>
                                        {material.status === 'have' && (
                                            <CheckCircle className="h-4 w-4 text-green-500 ml-auto" weight="fill" />
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {!hasItems && (
                        <div className="text-center py-6 text-muted-foreground">
                            <Sparkle className="h-8 w-8 mx-auto mb-2 text-amber-400" weight="duotone" />
                            <p>No specific prep needed for tomorrow!</p>
                            <p className="text-sm">Enjoy your evening.</p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Button
                        onClick={acknowledge}
                        className="gap-2"
                        size="lg"
                    >
                        {allChecked || !hasItems ? (
                            <>
                                <CheckCircle className="h-4 w-4" weight="fill" />
                                I'm Ready for Tomorrow
                            </>
                        ) : (
                            <>
                                Got It
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={snooze}
                        className="text-muted-foreground"
                    >
                        Remind me later
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
