import React, { useState } from 'react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  MusicNotes,
  SpeakerHigh,
  SpeakerX,
  ArrowsOutSimple,
  ArrowsInSimple
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function GlobalAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    closePlayer,
    currentTime,
    duration,
    seek,
    isMuted,
    toggleMute
  } = useAudioPlayer();

  const [isExpanded, setIsExpanded] = useState(true);

  if (!currentTrack) return null;

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            key="collapsed"
          >
            <Button
              size="icon"
              className={cn(
                "h-14 w-14 rounded-full shadow-lg border-2 border-white dark:border-amber-900",
                isPlaying ? "bg-amber-500 hover:bg-amber-600 text-white animate-pulse-slow" : "bg-amber-100 text-amber-900 hover:bg-amber-200"
              )}
              onClick={() => setIsExpanded(true)}
            >
              <MusicNotes weight="fill" className={cn("h-7 w-7", isPlaying && "animate-spin-slow")} />
              <span className="sr-only">Open Player</span>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            key="expanded"
            className="w-80 sm:w-96 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header / Title Area */}
            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 flex items-center justify-between border-b border-amber-100 dark:border-amber-900/50">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="h-8 w-8 rounded bg-amber-200 dark:bg-amber-800 flex items-center justify-center shrink-0">
                  <MusicNotes className="h-4 w-4 text-amber-700 dark:text-amber-300" weight="duotone" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-amber-900 dark:text-amber-100">
                    {currentTrack.title}
                  </p>
                  {currentTrack.artist && (
                    <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50"
                  onClick={() => setIsExpanded(false)}
                >
                  <ArrowsInSimple className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  onClick={closePlayer}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 space-y-4">
              {/* Progress */}
              <div className="space-y-1.5">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={(val) => seek(val[0])}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Main Buttons */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  onClick={toggleMute}
                >
                  {isMuted ? <SpeakerX className="h-5 w-5" /> : <SpeakerHigh className="h-5 w-5" />}
                </Button>

                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={playPrevious}
                    disabled={currentTime < 5} // Logic depends on playlist
                    className="hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  >
                    <SkipBack weight="fill" className="h-5 w-5 text-amber-900 dark:text-amber-100" />
                  </Button>

                  <Button
                    size="icon"
                    className="h-10 w-10 rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-md"
                    onClick={togglePlay}
                  >
                    {isPlaying ? (
                      <Pause weight="fill" className="h-5 w-5" />
                    ) : (
                      <Play weight="fill" className="h-5 w-5 ml-0.5" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={playNext}
                    className="hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  >
                    <SkipForward weight="fill" className="h-5 w-5 text-amber-900 dark:text-amber-100" />
                  </Button>
                </div>

                <div className="w-9" /> {/* Spacer for balance */}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
