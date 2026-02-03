
import React, { useState, useEffect } from 'react';
import AnchorCard, { AnchorPayload } from './AnchorCard';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const DailyAnchorView: React.FC = () => {
    const { user } = useAuth();
    const [anchor, setAnchor] = useState<AnchorPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // In a real app, check if we have today's anchor in local storage or DB
        // For MVP/Demo, we generate on load if missing
        generateAnchor();
    }, []);

    const generateAnchor = async () => {
        try {
            setLoading(true);
            setError(null);

            // Call our new Cloudflare Endpoint
            // Note: The /api/ai/anchor endpoint needs to be exposed or we use a cortex wrapper
            // For now, let's assume we use the execute action payload that triggers it?
            // Actually, we should add a dedicated endpoint in cloudflare or use the chat execute.
            // Let's assume we added /api/ai/generate-anchor in routes/ai.ts (Need to do this!)

            // Use existing chat execute for now if endpoint isn't ready, or better, add the route.
            // Let's try to fetch from a new endpoint we will add.
            const res = await fetch('/api/ai/anchor/daily', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) throw new Error('Failed to generate');

            const data = await res.json();
            setAnchor(data);
        } catch (e) {
            console.error(e);
            setError("Could not retrieve today's anchor. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
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
                <p className="text-red-500">{error}</p>
                <button
                    onClick={generateAnchor}
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
