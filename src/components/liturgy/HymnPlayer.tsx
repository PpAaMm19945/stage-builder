import React from 'react';
import { Play, Pause, SpeakerHigh, SpeakerX } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useAudioPlayer, Track } from '@/contexts/AudioPlayerContext';
import { toast } from 'sonner';
import { liturgy } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface HymnPlayerProps {
  url: string;
  title: string;
  className?: string;
  queue?: Track[];
  activityId?: string; // Added for auto-completion
}

export function HymnPlayer({ url, title, className, queue, activityId }: HymnPlayerProps) {
  const {
    currentTrack,
    isPlaying: globalIsPlaying,
    currentTime: globalCurrentTime,
    duration: globalDuration,
    isMuted,
    playTrack,
    togglePlay: globalTogglePlay,
    seek,
    toggleMute
  } = useAudioPlayer();

  const queryClient = useQueryClient();
  const [completed, setCompleted] = React.useState(false);

  // Monitor playback for auto-completion
  React.useEffect(() => {
    if (!activityId || completed) return;

    const isCurrentTrack = currentTrack?.url === url;
    if (!isCurrentTrack) return;

    // Completion Logic: If played more than 30s or ended
    const progressPercent = globalDuration > 0 ? (globalCurrentTime / globalDuration) : 0;
    const isEnded = progressPercent > 0.95; // Rough end check
    const significantListen = globalCurrentTime > 30;

    if (significantListen || isEnded) {
      setCompleted(true);
      liturgy.complete(activityId).then(() => {
        toast.success('Hymn marked complete ✓', {
          duration: 5000,
          action: {
            label: 'Undo',
            onClick: () => {
              liturgy.uncomplete(activityId);
              setCompleted(false);
              toast.info('Completion undone');
              queryClient.invalidateQueries({ queryKey: ['family-day'] });
            }
          }
        });
        queryClient.invalidateQueries({ queryKey: ['family-day'] });
      });
    }
  }, [globalCurrentTime, globalDuration, currentTrack, url, activityId, completed]);

  // Determine if this is a direct audio file or an embed
  const isDirectAudio = /\.(mp3|m4a|wav|aac)($|\?)/i.test(url);

  // Check if this specific hymn is currently playing
  const isCurrentTrack = currentTrack?.url === url;
  const isPlaying = isCurrentTrack && globalIsPlaying;
  const currentTime = isCurrentTrack ? globalCurrentTime : 0;
  // Use global duration if current track, otherwise we don't know it until load (or could prefetch)
  // For simplicity, we just show 0 or last known if not active.
  const duration = isCurrentTrack ? globalDuration : 0;

  // Handle time formatting
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    if (isCurrentTrack) {
      globalTogglePlay();
    } else {
      playTrack({ url, title }, queue);
    }
  };

  const handleSeek = (value: number[]) => {
    if (isCurrentTrack) {
      seek(value[0]);
    }
  };

  // 1. Direct Audio Player (Native UX)
  // Now delegates to global player
  if (isDirectAudio) {
    return (
      <div className={cn("w-full bg-amber-100/80 dark:bg-amber-900/40 rounded-lg p-3 border border-amber-200 dark:border-amber-800/50", className)}>

        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-full bg-amber-200/50 hover:bg-amber-300/50 dark:bg-amber-800/50 dark:hover:bg-amber-700/50 text-amber-900 dark:text-amber-100 shrink-0"
            onClick={handlePlay}
          >
            {isPlaying ? (
              <Pause weight="fill" className="h-5 w-5" />
            ) : (
              <Play weight="fill" className="h-5 w-5 ml-0.5" />
            )}
            <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
          </Button>

          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-xs font-medium text-amber-800 dark:text-amber-200">
              <span>{title}</span>
              <span>{isCurrentTrack ? `${formatTime(currentTime)} / ${formatTime(duration)}` : title}</span>
            </div>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              disabled={!isCurrentTrack}
              className={cn("cursor-pointer", !isCurrentTrack && "opacity-50")}
            />
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 shrink-0"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <SpeakerX weight="regular" className="h-5 w-5" />
            ) : (
              <SpeakerHigh weight="regular" className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  // 2. Embed Player (Fallback)
  return (
    <div className={cn("w-full overflow-hidden rounded-lg border border-amber-200 dark:border-amber-800/50 bg-black/5 aspect-video relative", className)}>
      <iframe
        src={url}
        title={title}
        className="w-full h-full absolute top-0 left-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      {/* Overlay to encourage external link if embed fails? No, simpler is better. */}
    </div>
  );
}
