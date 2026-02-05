import React from 'react';
import AnchorCard from './AnchorCard';
import { Loader2 } from 'lucide-react';
import { useAnchor } from '@/hooks/useAnchor';

export const DailyAnchorView: React.FC = () => {
    const { data: anchor, isLoading, error, refetch } = useAnchor();

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
                <p className="text-slate-500 font-medium animate-pulse">Preparing today's anchor...</p>
            </div>
        );
    }

    if (error || !anchor) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <p className="text-red-500">
                    {error?.message || "Could not retrieve today's anchor. Please try again."}
                </p>
                <button
                    onClick={() => refetch()}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    const handleComplete = async () => {
        try {
            const res = await fetch('/api/anchor/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: anchor?.date }) // Send explicit date if available
            });

            if (!res.ok) throw new Error('Failed to complete anchor');

            // Re-fetch to get updated status (or we could optimistically update local state here)
            // For now, simple re-fetch or just letting the user know is enough.
            // Ideally, the AnchorCard would handle the "completed" visual state if we passed `isCompleted` prop,
            // but AnchorCard seems to only take `onComplete`. 
            // We can just rely on the button action for now.
            // A better UX might be to force a refresh or show a toast.
            refetch();

        } catch (e) {
            console.error("Completion failed", e);
            alert("Failed to mark as complete. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50">
            <AnchorCard anchor={anchor} onComplete={handleComplete} />
        </div>
    );
};

export default DailyAnchorView;
