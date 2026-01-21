import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hymns as hymnsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpenText } from '@phosphor-icons/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { HymnAudioPlayer } from './HymnAudioPlayer';
import { HymnContent } from '@/components/liturgy/HymnContent';
import { Hymn, HymnCard } from './HymnCard';
import { PlayHymnButton } from './PlayHymnButton';

export function HymnBrowser() {
    const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);

    const { data: hymns = [], isLoading } = useQuery({
        queryKey: ['hymns', 'all'],
        queryFn: () => hymnsApi.list(),
    });

    const handleHymnSelect = useCallback((hymn: Hymn) => {
        setSelectedHymn(hymn);
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-muted-foreground">
                    A treasury of great hymns of the faith for family worship. Listen, learn, and sing along.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {hymns.map((hymn: Hymn) => (
                    <HymnCard
                        key={hymn.id}
                        hymn={hymn}
                        onClick={handleHymnSelect}
                    />
                ))}
            </div>

            <Sheet open={!!selectedHymn} onOpenChange={(open) => !open && setSelectedHymn(null)}>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                    {selectedHymn && (
                        <div className="space-y-6 pb-10">
                            <SheetHeader className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">#{selectedHymn.sequence_number}</span>
                                        <Separator orientation="vertical" className="h-3" />
                                        <span className="text-xs">{selectedHymn.reference}</span>
                                    </div>
                                    <SheetTitle className="text-2xl font-display">{selectedHymn.title}</SheetTitle>
                                </div>

                                {/* Audio Player Control */}
                                {selectedHymn.audio_url ? (
                                    <div className="bg-muted/50 rounded-xl p-4 border border-border shadow-sm space-y-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <PlayHymnButton
                                                hymn={selectedHymn}
                                            />
                                            <div className="flex-1 text-sm text-muted-foreground">
                                                Play this hymn in the background while you read along.
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-center text-muted-foreground/60 border-t border-border/50 pt-2">
                                            Audio provided by <span className="font-semibold text-muted-foreground/80">Sermon Audio</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-muted/30 rounded-lg text-center text-sm text-muted-foreground italic border border-dashed border-border">
                                        Audio recording coming soon.
                                    </div>
                                )}
                            </SheetHeader>

                            <Separator />

                            <div className="space-y-6">
                                <h3 className="font-medium flex items-center gap-2 text-foreground/80">
                                    <BookOpenText className="h-4 w-4" />
                                    Lyrics
                                </h3>
                                <HymnContent title={selectedHymn.title} fallbackContent={selectedHymn.content} />
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
