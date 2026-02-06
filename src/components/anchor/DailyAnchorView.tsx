import React, { useState } from 'react';
import AnchorCard from './AnchorCard';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAnchor } from '@/hooks/useAnchor';

export const DailyAnchorView: React.FC = () => {
    const { data: anchor, isLoading, error, refetch } = useAnchor();
    const [isCompleting, setIsCompleting] = useState(false);

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
        setIsCompleting(true);
        try {
            const res = await fetch('/api/anchor/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: anchor?.date }) // Send explicit date if available
            });

            if (!res.ok) throw new Error('Failed to complete anchor');

            toast.success("Anchor completed!");
            refetch();
        } catch (e) {
            console.error("Completion failed", e);
            toast.error("Failed to mark as complete. Please try again.");
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50">
            <AnchorCard
                anchor={anchor}
                onComplete={handleComplete}
                isCompleting={isCompleting}
            />
        </div>
    );
};

export default DailyAnchorView;
