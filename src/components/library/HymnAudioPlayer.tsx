import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SpeakerHigh, SpeakerX } from '@phosphor-icons/react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface HymnAudioPlayerProps {
    src?: string;
    title: string;
    autoPlay?: boolean;
}

export function HymnAudioPlayer({ src, title, autoPlay = false }: HymnAudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);

    // Handle autoplay when src changes
    useEffect(() => {
        if (src && autoPlay) {
            // Small timeout to ensure DOM is ready and avoid race conditions
            const timeout = setTimeout(() => {
                audioRef.current?.play().then(() => setIsPlaying(true)).catch(e => console.log('Autoplay blocked', e));
            }, 100);
            return () => clearTimeout(timeout);
        } else {
            setIsPlaying(false);
        }
    }, [src, autoPlay]);

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

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value[0];
            setCurrentTime(value[0]);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!src) return null;

    return (
        <div className="bg-muted/50 rounded-xl p-4 border border-border shadow-sm space-y-4">
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            />

            <div className="flex items-center justify-between gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full shrink-0"
                    onClick={togglePlay}
                >
                    {isPlaying ? (
                        <Pause className="h-5 w-5 fill-primary text-primary" weight="fill" />
                    ) : (
                        <Play className="h-5 w-5 fill-primary text-primary ml-0.5" weight="fill" />
                    )}
                </Button>

                <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground font-medium">
                        <span>{formatTime(currentTime)}</span>
                        <span className="truncate max-w-[150px] mx-2 text-foreground">{title}</span>
                        <span>{formatTime(duration)}</span>
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
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                    onClick={toggleMute}
                >
                    {isMuted ? (
                        <SpeakerX className="h-5 w-5" />
                    ) : (
                        <SpeakerHigh className="h-5 w-5" />
                    )}
                </Button>
            </div>

            <div className="text-[10px] text-center text-muted-foreground/60 border-t border-border/50 pt-2">
                Audio provided by <span className="font-semibold text-muted-foreground/80">Sermon Audio</span>
            </div>
        </div>
    );
}
