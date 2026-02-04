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

    return (
        <div className="min-h-screen bg-slate-50/50">
            <AnchorCard anchor={anchor} />
        </div>
    );
};

export default DailyAnchorView;
