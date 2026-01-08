import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SpeakerHigh, SpeakerX } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface HymnPlayerProps {
  url: string;
  title: string;
  className?: string;
}

export function HymnPlayer({ url, title, className }: HymnPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Determine if this is a direct audio file or an embed
  // This is a simple heuristic; in production, we might want stronger validation
  const isDirectAudio = /\.(mp3|m4a|wav|aac)($|\?)/i.test(url);

  // Handle time formatting
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // 1. Direct Audio Player (Native UX)
  if (isDirectAudio) {
    return (
      <div className={cn("w-full bg-amber-100/80 dark:bg-amber-900/40 rounded-lg p-3 border border-amber-200 dark:border-amber-800/50", className)}>
        <audio ref={audioRef} src={url} preload="metadata" />

        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-full bg-amber-200/50 hover:bg-amber-300/50 dark:bg-amber-800/50 dark:hover:bg-amber-700/50 text-amber-900 dark:text-amber-100 shrink-0"
            onClick={togglePlay}
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
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="cursor-pointer"
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
