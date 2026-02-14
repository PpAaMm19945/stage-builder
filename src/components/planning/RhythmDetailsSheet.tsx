import { memo } from 'react';
import DOMPurify from 'dompurify';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { BookOpen, Play, Pause } from '@phosphor-icons/react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { FormationCard } from '@/components/formations/FormationCard';
import { ActivityDetails } from '@/components/early-years/ActivityDetails';
import { getIcon, getTypeColor } from './RhythmItemRow';
import type { DailyRhythmItem as RhythmItem } from '@/types';

// Helper to sanitize HTML content for safe rendering
const sanitizeHtml = (html: string | undefined | null): string => {
    return DOMPurify.sanitize(html || '');
};

interface RhythmDetailsSheetProps {
    activeItem: RhythmItem | null;
    onClose: () => void;
    onComplete?: (item: RhythmItem, duration?: number) => void;
    onBookClick?: () => void;
    onLiturgyToggle?: (id: string, completed: boolean) => void;
    onLiturgyAdvance?: (type: string) => void;
}

export const RhythmDetailsSheet = memo(function RhythmDetailsSheet({
    activeItem,
    onClose,
    onComplete,
    onBookClick,
    onLiturgyToggle,
    onLiturgyAdvance
}: RhythmDetailsSheetProps) {
    const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioPlayer();

    const handleSheetComplete = (duration?: number) => {
        if (activeItem && onComplete) {
            onComplete(activeItem, duration);
            onClose();
        }
    };

    return (
        <Sheet open={!!activeItem} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="bottom" className="h-[95dvh] sm:h-[85vh] rounded-t-[20px] p-0 flex flex-col">
                <SheetHeader className="px-6 pt-6 pb-2 shrink-0 text-left">
                    <SheetTitle className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-full bg-muted/20", getTypeColor(activeItem?.type || 'activity'))}>
                            {activeItem && getIcon(activeItem.type)}
                        </div>
                        {activeItem?.title}
                    </SheetTitle>
                    <SheetDescription>{activeItem?.timeSlot} • {activeItem?.description}</SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 px-6">
                    <div className="pb-8 pt-2">
                        {/* Section Header */}
                        {activeItem?.type === 'section_header' && (
                            <div className="py-4 text-center">
                                <h3 className="font-display text-lg font-bold">{activeItem.title}</h3>
                            </div>
                        )}

                        {/* Render Content Based on Type */}
                        {activeItem?.type === 'path_item' && activeItem.data && (
                            <div className="space-y-6 py-4">
                                {/* Path context badge */}
                                <div className="text-center">
                                    <span className="inline-block text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/50 px-3 py-1 rounded-full">
                                        From: {activeItem.data.pathName || activeItem.data.path_title || 'Learning Path'}
                                    </span>
                                </div>

                                {/* Hymn rendering */}
                                {activeItem.data.item_type === 'hymn' && (
                                    <div className="text-center space-y-4">
                                        <h3 className="text-2xl font-display font-bold">{activeItem.title}</h3>
                                        {activeItem.data.content?.composer && (
                                            <p className="text-sm text-muted-foreground italic">
                                                by {activeItem.data.content.composer}
                                            </p>
                                        )}
                                        <div
                                            className="prose prose-sm dark:prose-invert mx-auto whitespace-pre-line text-left bg-muted/20 p-4 rounded-lg"
                                            dangerouslySetInnerHTML={{
                                                __html: sanitizeHtml(
                                                    activeItem.data.content?.lyrics ||
                                                    activeItem.data.content?.content ||
                                                    activeItem.data.content?.liturgical_script ||
                                                    activeItem.description
                                                )
                                            }}
                                        />
                                        {(activeItem.data.audio_url || activeItem.data.content?.audio_url) && (
                                            <Button
                                                variant="secondary"
                                                className="w-full gap-2"
                                                onClick={() => {
                                                    const url = activeItem.data.audio_url || activeItem.data.content?.audio_url;
                                                    if (currentTrack?.url === url) {
                                                        togglePlay();
                                                    } else {
                                                        playTrack({
                                                            url,
                                                            title: activeItem.title,
                                                            artist: activeItem.data.content?.composer || 'Hymn'
                                                        });
                                                    }
                                                }}
                                            >
                                                {(currentTrack?.url === (activeItem.data.audio_url || activeItem.data.content?.audio_url)) && isPlaying ? (
                                                    <>
                                                        <Pause className="w-4 h-4" /> Pause Hymn
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="w-4 h-4" /> Play Hymn
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            🎵 Sing together as a family
                                        </p>
                                    </div>
                                )}

                                {/* Catechism rendering */}
                                {activeItem.data.item_type === 'catechism' && (
                                    <div className="space-y-4">
                                        <div className="bg-primary/5 border border-primary/10 rounded-lg p-5 space-y-3">
                                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Question</p>
                                            <p className="text-lg font-semibold">{activeItem.title}</p>
                                        </div>
                                        <div className="bg-muted/30 rounded-lg p-5 space-y-3">
                                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Answer</p>
                                            <div
                                                className="prose prose-sm dark:prose-invert whitespace-pre-wrap"
                                                dangerouslySetInnerHTML={{
                                                    __html: sanitizeHtml(
                                                        activeItem.data.item_data?.liturgical_script ||
                                                        activeItem.data.item_data?.description ||
                                                        activeItem.data.content?.content ||
                                                        activeItem.data.content?.liturgical_script ||
                                                        activeItem.description
                                                    )
                                                }}
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground text-center">
                                            📖 Recite together as a family
                                        </p>
                                    </div>
                                )}

                                {/* Story/History rendering */}
                                {activeItem.data.item_type === 'story' && (
                                    <div className="space-y-4 text-center">
                                        <h3 className="text-2xl font-display font-bold">{activeItem.title}</h3>
                                        <div
                                            className="prose prose-sm dark:prose-invert mx-auto text-left"
                                            dangerouslySetInnerHTML={{
                                                __html: sanitizeHtml(
                                                    activeItem.data.content?.content ||
                                                    activeItem.data.content?.description ||
                                                    activeItem.description
                                                )
                                            }}
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            📚 Read aloud together
                                        </p>
                                    </div>
                                )}

                                {/* Book rendering */}
                                {activeItem.data.item_type === 'book' && (
                                    <div className="space-y-4 text-center">
                                        <div className="mx-auto w-32 h-44 bg-muted rounded shadow-sm flex items-center justify-center">
                                            <BookOpen className="h-12 w-12 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-xl font-display font-bold">{activeItem.title}</h3>
                                        {activeItem.data.content?.author && (
                                            <p className="text-sm text-muted-foreground">
                                                by {activeItem.data.content.author}
                                            </p>
                                        )}
                                        <p className="text-muted-foreground">
                                            {activeItem.data.content?.description || 'Grab the book and read together!'}
                                        </p>
                                    </div>
                                )}

                                {/* Activity rendering */}
                                {activeItem.data.item_type === 'activity' && activeItem.data.content && (
                                    <ActivityDetails
                                        activity={{
                                            ...activeItem.data.content,
                                            // Ensure ID and Title are present from parent if missing in content
                                            id: activeItem.data.content.id || activeItem.data.item_id,
                                            title: activeItem.data.content.title || activeItem.title
                                        }}
                                        onComplete={(duration) => {
                                            handleSheetComplete(duration);
                                        }}
                                        hideActions={false}
                                    />
                                )}

                                {/* Fallback for unknown item types */}
                                {!['hymn', 'catechism', 'story', 'book', 'activity'].includes(activeItem.data.item_type) && (
                                    <div className="text-center space-y-4">
                                        <h3 className="text-2xl font-display font-bold">{activeItem.title}</h3>
                                        <div
                                            className="prose prose-sm dark:prose-invert mx-auto"
                                            dangerouslySetInnerHTML={{
                                                __html: sanitizeHtml(
                                                    activeItem.data.content?.content ||
                                                    activeItem.data.content?.description ||
                                                    activeItem.description
                                                )
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Complete button - Hide for activity type as ActivityDetails handles it */}
                                {activeItem.data.item_type !== 'activity' && (
                                    <div className="pt-4">
                                        <Button onClick={() => handleSheetComplete()} size="lg" className="w-full">
                                            Mark Complete
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Liturgy Item (Unified) */}
                        {activeItem?.type === 'liturgy' && !activeItem.data?.items && activeItem.data?.itemType && (
                            <div className="space-y-6 py-4">
                                {/* Catechism */}
                                {activeItem.data.itemType === 'catechism' && (
                                    <div className="space-y-4">
                                        <div className="bg-primary/5 border border-primary/10 rounded-lg p-5 space-y-3">
                                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Question</p>
                                            {/* Use description as question, since index.ts puts question in description */}
                                            <p className="text-lg font-semibold">{activeItem.description}</p>
                                        </div>
                                        <div className="bg-muted/30 rounded-lg p-5 space-y-3">
                                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Answer</p>
                                            {/* Use liturgical_script as answer */}
                                            <div
                                                className="prose prose-sm dark:prose-invert whitespace-pre-wrap"
                                                dangerouslySetInnerHTML={{
                                                    __html: sanitizeHtml(
                                                        activeItem.data.liturgical_script ||
                                                        activeItem.data.content
                                                    )
                                                }}
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground text-center">
                                            📖 Recite together as a family
                                        </p>
                                    </div>
                                )}

                                {/* Hymn */}
                                {activeItem.data.itemType === 'hymn' && (
                                    <div className="text-center space-y-4">
                                        <h3 className="text-2xl font-display font-bold">{activeItem.title}</h3>
                                        <div
                                            className="prose prose-sm dark:prose-invert mx-auto whitespace-pre-line text-left bg-muted/20 p-4 rounded-lg"
                                            dangerouslySetInnerHTML={{
                                                __html: sanitizeHtml(
                                                    activeItem.data.liturgical_script ||
                                                    activeItem.data.content
                                                )
                                            }}
                                        />
                                        {activeItem.data.audio_url && (
                                            <div className="mt-4">
                                                <Button
                                                    variant="secondary"
                                                    className="w-full gap-2"
                                                    onClick={() => {
                                                        if (currentTrack?.url === activeItem.data.audio_url) {
                                                            togglePlay();
                                                        } else {
                                                            playTrack({
                                                                url: activeItem.data.audio_url,
                                                                title: activeItem.title,
                                                                artist: 'Hymn'
                                                            });
                                                        }
                                                    }}
                                                >
                                                    {currentTrack?.url === activeItem.data.audio_url && isPlaying ? (
                                                        <>
                                                            <Pause className="w-4 h-4" /> Pause Hymn
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="w-4 h-4" /> Play Hymn
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            🎵 Sing together as a family
                                        </p>
                                    </div>
                                )}

                                {/* Scripture */}
                                {activeItem.data.itemType === 'scripture' && (
                                    <div className="text-center space-y-4">
                                        <h3 className="text-xl font-display font-bold">{activeItem.title}</h3>
                                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-xl p-6 shadow-sm">
                                            <div
                                                className="prose prose-lg dark:prose-invert mx-auto font-serif italic text-amber-900 dark:text-amber-100"
                                                dangerouslySetInnerHTML={{
                                                    __html: sanitizeHtml(
                                                        activeItem.data.description ||
                                                        activeItem.data.liturgical_script
                                                    )
                                                }}
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            📜 Read and meditate together
                                        </p>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <Button onClick={() => {
                                        handleSheetComplete();
                                        if (onLiturgyAdvance) onLiturgyAdvance(activeItem.data.itemType);
                                    }} size="lg" className="w-full">
                                        Done - Load Next
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeItem?.type === 'liturgy' && activeItem.data?.items && (
                            <div className="space-y-4">
                                {(activeItem.data.items || []).filter((item) => item && item.id).map((item) => (
                                    <FormationCard
                                        key={item.id}
                                        formation={{
                                            id: item.id,
                                            title: item.title || 'Liturgy Item',
                                            description: item.reference || '',
                                            formation_type: item.type || 'catechism',
                                            primary_virtue: 'Wisdom',
                                            context_anchor: 'Morning_Circle',
                                            min_age_months: 0,
                                            max_age_months: 0,
                                            duration_minutes: 5,
                                            guide_steps: [],
                                            parent_posture: '',
                                            materials: [],
                                            liturgical_script: item.content || '',
                                            is_active: 1,
                                            content_source: 'liturgy'
                                        }}
                                        isCompleted={item.completedToday}
                                        onComplete={onLiturgyToggle}
                                    />
                                ))}

                                {activeItem.data.allCompleted && onLiturgyAdvance && (
                                    <div className="pt-4">
                                        <Button
                                            onClick={() => onLiturgyAdvance('catechism')}
                                            className="w-full"
                                            variant="outline"
                                        >
                                            Advance to Next Week
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeItem?.type === 'activity' && activeItem.data && (
                            <ActivityDetails
                                activity={activeItem.data}
                                onComplete={(duration) => {
                                    if (onComplete) onComplete(activeItem, duration);
                                    onClose();
                                }}
                                hideActions={false}
                            />
                        )}

                        {activeItem?.type === 'activity' && !activeItem.data && (
                            <div className="py-12 text-center space-y-4">
                                <p>Details not available.</p>
                                <Button onClick={() => handleSheetComplete()}>Mark Complete</Button>
                            </div>
                        )}

                        {activeItem?.type === 'book' && activeItem.data && (
                            <div className="space-y-4 text-center py-8">
                                <div className="mx-auto w-32 h-44 bg-muted rounded shadow-sm flex items-center justify-center">
                                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-display">{activeItem.data.title}</h3>
                                <p className="text-muted-foreground">Grab the book and read together!</p>
                                <div className="flex flex-col gap-2">
                                    {onBookClick && (
                                        <Button onClick={() => {
                                            onClose();
                                            onBookClick();
                                        }} size="lg" className="w-full">
                                            Read Now
                                        </Button>
                                    )}
                                    <Button onClick={() => handleSheetComplete()} variant={onBookClick ? "outline" : "default"} size="lg" className="w-full">
                                        Mark as Read (Manual)
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Fallback */}
                        {!['liturgy', 'activity', 'book', 'path_item'].includes(activeItem?.type || '') && (
                            <div className="py-12 text-center space-y-4">
                                <p>Details for this item are simple.</p>
                                <Button onClick={() => handleSheetComplete()}>Mark Complete</Button>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
});
