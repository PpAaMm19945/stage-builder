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

  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand on new track, but collapse after a while? No, let's keep it simple.
  // Actually, better UX: When a track starts, show a toast or mini-bar. Let user expand if needed.
  // We'll stick to the mini-bar -> expanded drawer model.

  if (!currentTrack) return null;

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* 
         Top Fixed Player Container 
         Z-index needs to be higher than header (usually 50)
      */}
      <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col items-center pointer-events-none">

        {/* COLLAPSED STATE (Mini Player / Loading Bar) */}
        {!isExpanded && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="w-full pointer-events-auto"
          >
            {/* The "Loading Bar" visuals */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Expand audio player"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsExpanded(true);
                }
              }}
              className="group relative h-1.5 w-full bg-border/20 cursor-pointer overflow-hidden hover:h-4 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setIsExpanded(true)}
            >
              {/* Progress Indicator */}
              <div
                className="h-full bg-primary/80 group-hover:bg-primary transition-colors"
                style={{ width: `${progress}%` }}
              />

              {/* Hover info (only visible on hover/larger screens) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-medium text-foreground bg-background/80 px-2 rounded-full shadow-sm">
                  {currentTrack.title} • {formatTime(currentTime)}
                </span>
              </div>
            </div>

            {/* Optional: Small "Now Playing"pill hanging down? 
                  Maybe too cluttery. Let's stick to the bar for "Slick & Modern"
                  But mobile users might miss it. Let's add a small 'handle' or pill.
              */}
            <div className="flex justify-center -mt-px">
              <button
                onClick={() => setIsExpanded(true)}
                aria-label="Expand audio player"
                className="bg-background/95 backdrop-blur border border-t-0 border-border/40 rounded-b-lg px-4 py-1 flex items-center gap-2 shadow-sm hover:bg-muted/50 transition-colors text-xs font-medium"
              >
                <span className={cn("inline-block h-2 w-2 rounded-full", isPlaying ? "bg-green-500 animate-pulse" : "bg-amber-500")} />
                <span className="max-w-[150px] truncate">{currentTrack.title}</span>
                <ArrowsOutSimple className="h-3 w-3 text-muted-foreground ml-1" />
              </button>
            </div>
          </motion.div>
        )}

        {/* EXPANDED STATE (Top Drawer) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full bg-background/95 backdrop-blur-xl border-b border-border shadow-2xl pointer-events-auto"
            >
              <div className="max-w-5xl mx-auto p-4 sm:p-6">
                {/* Top Actions */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <MusicNotes weight="duotone" className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">{currentTrack.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentTrack.artist || "SchoolOS Library"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsExpanded(false)}
                      aria-label="Minimize player"
                    >
                      <ArrowsInSimple className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={closePlayer}
                      className="text-muted-foreground hover:text-red-500"
                      aria-label="Close player"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Progress & Controls */}
                <div className="flex flex-col gap-6">

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Slider
                      value={[currentTime]}
                      max={duration || 100}
                      step={1}
                      onValueChange={(val) => seek(val[0])}
                      className="cursor-pointer py-1"
                      aria-label="Seek"
                    />
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center justify-between sm:justify-center gap-6 sm:gap-10">
                    {/* Mute (Left on desktop) */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className={cn("hidden sm:flex", isMuted && "text-red-500")}
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <SpeakerX weight="fill" className="h-5 w-5" /> : <SpeakerHigh weight="fill" className="h-5 w-5" />}
                    </Button>

                    <div className="flex items-center gap-6">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full border-2"
                        onClick={playPrevious}
                        aria-label="Previous track"
                      >
                        <SkipBack weight="fill" className="h-5 w-5" />
                      </Button>

                      <Button
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform"
                        onClick={togglePlay}
                        aria-label={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? (
                          <Pause weight="fill" className="h-7 w-7" />
                        ) : (
                          <Play weight="fill" className="h-7 w-7 ml-1" />
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full border-2"
                        onClick={playNext}
                        aria-label="Next track"
                      >
                        <SkipForward weight="fill" className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Mobile Mute Toggle */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className={cn("sm:hidden", isMuted && "text-red-500")}
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <SpeakerX weight="fill" className="h-5 w-5" /> : <SpeakerHigh weight="fill" className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>

                {/* Footer Credit */}
                <div className="mt-6 pt-4 border-t border-border/40 text-center">
                  <p className="text-xs text-muted-foreground">
                    Audio provided by <span className="font-semibold text-foreground">Sermon Audio</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
