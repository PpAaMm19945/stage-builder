import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MagicWand, CircleNotch, PaperPlaneRight } from '@phosphor-icons/react';
import { rhythm } from '@/lib/api';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function RhythmPromptBar() {
    const [instruction, setInstruction] = useState('');
    const queryClient = useQueryClient();

    const adjustRhythm = useMutation({
        mutationFn: rhythm.readjust,
        onSuccess: () => {
            toast.success("Rhythm updated!");
            setInstruction('');
            queryClient.invalidateQueries({ queryKey: ['family-today'] });
        },
        onError: () => {
            toast.error("Couldn't adjust rhythm. Please try again.");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!instruction.trim()) return;
        adjustRhythm.mutate(instruction);
    };

    return (
        <Card className="p-1 pl-4 mb-6 shadow-sm border-primary/20 bg-gradient-to-r from-background to-primary/5">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <MagicWand className="h-5 w-5 text-primary shrink-0" weight="duotone" />
                <Input
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="Adjust today... (e.g. 'Start 1 hour later', 'No nap today')"
                    className="border-none shadow-none focus-visible:ring-0 bg-transparent h-10 px-0"
                    disabled={adjustRhythm.isPending}
                />
                <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    disabled={!instruction.trim() || adjustRhythm.isPending}
                    className="shrink-0 text-primary hover:bg-primary/10 rounded-full h-8 w-8 mr-1"
                >
                    {adjustRhythm.isPending ? (
                        <CircleNotch className="h-4 w-4 animate-spin" />
                    ) : (
                        <PaperPlaneRight className="h-4 w-4" weight="fill" />
                    )}
                </Button>
            </form>
        </Card>
    );
}
