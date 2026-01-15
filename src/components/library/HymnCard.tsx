import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MusicNotes, PlayCircle, BookOpenText } from '@phosphor-icons/react';

export interface Hymn {
    id: string;
    title: string;
    content: string; // Lyrics
    reference: string; // Author/Year
    sequence_number: number;
    metadata?: string;
    audio_url?: string;
}

interface HymnCardProps {
    hymn: Hymn;
    onClick: (hymn: Hymn) => void;
}

export const HymnCard = memo(function HymnCard({ hymn, onClick }: HymnCardProps) {
    return (
        <Card
            className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group"
            onClick={() => onClick(hymn)}
        >
            <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors relative">
                    <MusicNotes className="h-5 w-5 text-primary" weight="duotone" />
                    {hymn.audio_url && (
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm border border-border">
                            <PlayCircle className="h-4 w-4 text-emerald-600 fill-emerald-600" weight="fill" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {hymn.sequence_number}. {hymn.title}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                        {hymn.reference}
                    </p>
                </div>
                <BookOpenText className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary/70" />
            </CardContent>
        </Card>
    );
});
