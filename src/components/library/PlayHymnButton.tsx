import { Button } from '@/components/ui/button';
import { Play, Pause } from '@phosphor-icons/react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Hymn } from './HymnCard';

interface PlayHymnButtonProps {
    hymn: Hymn;
    variant?: "default" | "secondary" | "outline" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
}

export function PlayHymnButton({ hymn, variant = "default", size = "icon", className }: PlayHymnButtonProps) {
    const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioPlayer();

    if (!hymn.audio_url) return null;

    const isCurrentTrack = currentTrack?.url === hymn.audio_url;
    const isActive = isCurrentTrack && isPlaying;

    const handlePlay = () => {
        if (isCurrentTrack) {
            togglePlay();
        } else {
            playTrack({
                url: hymn.audio_url!,
                title: hymn.title,
                artist: 'Sermon Audio', // Static credit as requested
            });
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handlePlay}
            aria-label={isActive ? "Pause" : "Play"}
        >
            {isActive ? (
                <Pause weight="fill" className="h-4 w-4" />
            ) : (
                <Play weight="fill" className="h-4 w-4" />
            )}
        </Button>
    );
}
