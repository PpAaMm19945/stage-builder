import React from 'react';
import AnchorCard from './AnchorCard';
import { useAnchor } from '@/hooks/useAnchor';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/PageLoader';
import { AlertCircle } from 'lucide-react';

export const DailyAnchorView: React.FC = () => {
    const { data: anchor, isLoading, error, refetch } = useAnchor();

    if (isLoading) {
        return <PageLoader />;
    }

    if (error || !anchor) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 p-4 text-center">
                <div className="bg-red-50 p-4 rounded-full">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-slate-900">Unable to load anchor</h3>
                    <p className="text-slate-500 max-w-sm">
                        {error?.message || "Could not retrieve today's anchor. Please check your connection and try again."}
                    </p>
                </div>
                <Button onClick={() => refetch()} variant="default">
                    Try Again
                </Button>
            </div>
        );
    }

    const handleComplete = async () => {
        try {
            const res = await fetch('/api/anchor/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: anchor?.date })
            });

            if (!res.ok) throw new Error('Failed to complete anchor');

            toast.success("Anchor completed!", {
                description: "Great job completing today's devotion."
            });
            refetch();

        } catch (e) {
            console.error("Completion failed", e);
            toast.error("Failed to mark as complete", {
                description: "Please try again later."
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50">
            <AnchorCard anchor={anchor} onComplete={handleComplete} />
        </div>
    );
};

export default DailyAnchorView;
