import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CheckCircle, XCircle, Clock, Briefcase, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkEntry } from '@/types/api-responses';

// Extended type from API response
interface PendingEntry extends WorkEntry {
    apprenticeship_title: string;
    student_name: string;
    student_avatar?: string;
}

export function WorkApprovals() {
    const [entries, setEntries] = useState<PendingEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const loadData = async () => {
        try {
            const data = await api.work.getPending();
            setEntries(data);
            setError(null);
        } catch (err) {
            console.error('Failed to load pending approvals', err);
            // Silent error for dashboard widget, but log it
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            setProcessingId(id);
            setError(null);
            await api.work.approve(id, 'approved');
            setEntries(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            setError('Failed to approve entry. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!rejectReason) return;
        try {
            setProcessingId(id);
            setError(null);
            await api.work.approve(id, 'rejected', rejectReason);
            setEntries(prev => prev.filter(e => e.id !== id));
            setRejectId(null);
            setRejectReason('');
        } catch (err) {
            setError('Failed to reject entry. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-4 space-y-3">
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 animate-pulse" />
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-amber-50 rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-amber-50 rounded w-1/2 animate-pulse" />
                    </div>
                </div>
                <div className="h-16 bg-amber-50/50 rounded animate-pulse" />
            </div>
        );
    }

    if (entries.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-amber-100 bg-amber-50/50 flex justify-between items-center">
                <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-600" />
                    Apprenticeship Approvals
                </h3>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                    {entries.length}
                </span>
            </div>

            {error && (
                <div className="bg-red-50 px-4 py-2 text-xs text-red-600 flex items-center gap-2 border-b border-red-100">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </div>
            )}

            <div className="divide-y divide-amber-50">
                {entries.map(entry => (
                    <div key={entry.id} className="p-4 hover:bg-amber-50/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                {entry.student_avatar ? (
                                    <img
                                        src={entry.student_avatar}
                                        alt={`${entry.student_name}'s avatar`}
                                        className="w-8 h-8 rounded-full border border-amber-200"
                                    />
                                ) : (
                                    <div
                                        className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 text-xs font-bold"
                                        aria-label={`${entry.student_name}'s initials`}
                                    >
                                        {entry.student_name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <div className="text-sm font-medium text-amber-900">{entry.apprenticeship_title}</div>
                                    <div className="text-xs text-amber-600 flex items-center gap-1">
                                        {entry.student_name} &bull; {new Date(entry.date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div
                                className="flex items-center gap-1 text-sm font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded"
                                aria-label={`${entry.hours} hours logged`}
                            >
                                <Clock className="w-3 h-3" />
                                {entry.hours}h
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded border border-gray-100 italic">
                            "{entry.description}"
                        </p>

                        {/* Actions */}
                        {rejectId === entry.id ? (
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-2">
                                <label
                                    htmlFor={`reject-reason-${entry.id}`}
                                    className="block text-xs font-medium text-red-800 mb-1"
                                >
                                    Reason for Rejection:
                                </label>
                                <input
                                    id={`reject-reason-${entry.id}`}
                                    type="text"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full text-sm border-red-200 rounded px-2 py-1 mb-2 focus:ring-red-500 focus:border-red-500"
                                    placeholder="e.g. Needs more detail..."
                                    autoFocus
                                />
                                <div className="flex gap-2 justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setRejectId(null)}
                                        disabled={!!processingId}
                                        className="text-xs text-gray-500 hover:text-gray-700 h-7 px-2"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => handleReject(entry.id)}
                                        disabled={!rejectReason || !!processingId}
                                        variant="destructive"
                                        size="sm"
                                        className="text-xs h-7 px-3 gap-1"
                                        aria-label={`Confirm rejection for ${entry.student_name}'s entry`}
                                    >
                                        {processingId === entry.id ? (
                                            <>
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Confirm Reject'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-end gap-2">
                                <Button
                                    onClick={() => setRejectId(entry.id)}
                                    disabled={!!processingId}
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-500 hover:text-red-600 hover:bg-red-50 h-8 gap-1"
                                    aria-expanded={false}
                                    aria-label={`Reject entry from ${entry.student_name}`}
                                >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                </Button>
                                <Button
                                    onClick={() => handleApprove(entry.id)}
                                    disabled={!!processingId}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 h-8 gap-1 text-white"
                                    aria-label={`Approve entry from ${entry.student_name}`}
                                >
                                    {processingId === entry.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
