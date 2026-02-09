import React from 'react';
import AnchorCard from './AnchorCard';
import { Loader2 } from 'lucide-react';
import { useAnchor } from '@/hooks/useAnchor';
import { WelcomeFlow } from '@/components/onboarding/WelcomeFlow';
import { anchor as anchorApi } from '@/lib/api';

export const DailyAnchorView: React.FC = () => {
    const { data: anchor, isLoading, error, refetch } = useAnchor();

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-muted-foreground font-medium animate-pulse">Preparing today's learning...</p>
            </div>
        );
    }

    if (error || !anchor) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-destructive">
                    {error?.message || "Could not load today's learning. Please try again."}
                </p>
                <button
                    onClick={() => refetch()}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
                >
                    Retry
                </button>
            </div>
        );
    }

    const handleComplete = async () => {
        try {
            await anchorApi.complete(anchor.date);
            refetch();
        } catch (e) {
            console.error("Completion failed", e);
            alert("Failed to mark as complete. Please try again.");
        }
    };

    return (
        <div className="min-h-screen">
            <WelcomeFlow onComplete={() => refetch()} />
            <AnchorCard anchor={anchor} onComplete={handleComplete} />
        </div>
    );
};

export default DailyAnchorView;
