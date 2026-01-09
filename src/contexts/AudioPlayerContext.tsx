import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';

export interface Track {
  url: string;
  title: string;
  artist?: string;
  duration?: number;
}

interface AudioPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  currentTime: number;
  duration: number;
  isMuted: boolean;
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (time: number) => void;
  toggleMute: () => void;
  closePlayer: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTrack = useCallback((track: Track, newQueue?: Track[]) => {
    // If it's the same track, just toggle play
    if (currentTrack?.url === track.url) {
      if (!isPlaying) {
        setIsPlaying(true);
      }
      return;
    }

    setCurrentTrack(track);
    if (newQueue) {
      setQueue(newQueue);
    } else {
        // If track is not in current queue, replace queue
        const inQueue = queue.some(t => t.url === track.url);
        if (!inQueue) {
            setQueue([track]);
        }
    }
    setIsPlaying(true);
  }, [currentTrack, isPlaying, queue]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const playNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.url === currentTrack.url);
    if (currentIndex < queue.length - 1) {
      // Don't modify queue, just advance
      setCurrentTrack(queue[currentIndex + 1]);
      setIsPlaying(true);
    } else {
        // End of queue
        setIsPlaying(false);
    }
  }, [currentTrack, queue]);

  const playPrevious = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.url === currentTrack.url);
    if (currentIndex > 0) {
      setCurrentTrack(queue[currentIndex - 1]);
      setIsPlaying(true);
    } else {
        // If at start, restart track
        if (audioRef.current) audioRef.current.currentTime = 0;
    }
  }, [currentTrack, queue]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const toggleMute = useCallback(() => {
      setIsMuted(prev => !prev);
  }, []);

  const closePlayer = useCallback(() => {
      setIsPlaying(false);
      setCurrentTrack(null);
      setQueue([]);
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
      }
  }, []);

  const registerAudioRef = useCallback((ref: HTMLAudioElement | null) => {
    audioRef.current = ref;
    if (ref) {
        ref.muted = isMuted;
    }
  }, [isMuted]);

  const updateState = useCallback((playing: boolean, time: number, dur: number) => {
      // We rely on React state for isPlaying to drive the UI, but we sync from audio events too
      // to catch external pauses (like unplugging headphones)
      // However, setting state in tight loops (timeupdate) causes re-renders.
      // We should throttle or be careful.
      // Actually, standard practice is fine for timeupdate every 250ms or so.
      // But `playing` state from event is the truth.
      if (playing !== isPlaying) setIsPlaying(playing);
      setCurrentTime(time);
      if (dur && !isNaN(dur)) setDuration(dur);
  }, [isPlaying]);

  return (
    <AudioPlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      queue,
      currentTime,
      duration,
      isMuted,
      playTrack,
      togglePlay,
      playNext,
      playPrevious,
      seek,
      toggleMute,
      closePlayer
    }}>
      {children}
      <AudioLogicSync
        registerRef={registerAudioRef}
        onUpdate={updateState}
        onEnded={playNext}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        isMuted={isMuted}
      />
    </AudioPlayerContext.Provider>
  );
}

function AudioLogicSync({
    registerRef,
    onUpdate,
    onEnded,
    currentTrack,
    isPlaying,
    isMuted
}: {
    registerRef: (ref: HTMLAudioElement | null) => void,
    onUpdate: (playing: boolean, time: number, dur: number) => void,
    onEnded: () => void,
    currentTrack: Track | null,
    isPlaying: boolean,
    isMuted: boolean
}) {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef.current) {
            registerRef(audioRef.current);
        }
    }, [registerRef]);

    // Handle mute prop changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = isMuted;
        }
    }, [isMuted]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => onUpdate(!audio.paused, audio.currentTime, audio.duration);
        const handlePlay = () => onUpdate(true, audio.currentTime, audio.duration);
        const handlePause = () => onUpdate(false, audio.currentTime, audio.duration);

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', onEnded);
        };
    }, [onUpdate, onEnded]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (currentTrack) {
             const currentSrc = audio.src;
             // Decode URI to handle spaces etc if needed, though usually browser handles matches
             // Using endsWith is safer than exact match if origin is added
             if (!currentSrc.endsWith(currentTrack.url) && currentSrc !== currentTrack.url) {
                 audio.src = currentTrack.url;
                 if (isPlaying) {
                     audio.play().catch(e => console.error("Play failed", e));
                 }
            } else {
                 if (isPlaying && audio.paused) audio.play().catch(e => console.error("Play failed", e));
                 if (!isPlaying && !audio.paused) audio.pause();
            }
        } else {
            audio.pause();
            audio.src = "";
        }
    }, [currentTrack, isPlaying]);

    return <audio ref={audioRef} style={{ display: 'none' }} />;
}


export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
}
