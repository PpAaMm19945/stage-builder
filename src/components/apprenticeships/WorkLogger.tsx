import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Clock, CheckCircle, Camera, Upload, Calendar, Briefcase, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Apprenticeship {
    id: string;
    title: string;
    organizationName?: string;
    mentorName?: string;
}

export function WorkLogger({ studentId, onClose }: { studentId?: string; onClose?: () => void }) {
    const [apprenticeships, setApprenticeships] = useState<Apprenticeship[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [selectedApprenticeship, setSelectedApprenticeship] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [hours, setHours] = useState<number | ''>('');
    const [description, setDescription] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');

    useEffect(() => {
        async function loadApprenticeships() {
            try {
                const data = await api.work.getActiveApprenticeships();
                setApprenticeships(data);
                if (data.length === 1) {
                    setSelectedApprenticeship(data[0].id);
                }
            } catch (err) {
                console.error('Failed to load apprenticeships', err);
            } finally {
                setLoading(false);
            }
        }
        loadApprenticeships();
    }, [studentId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApprenticeship || !hours || !description) return;

        setSubmitting(true);
        try {
            await api.work.log({
                apprenticeshipId: selectedApprenticeship,
                date,
                hours: Number(hours),
                description,
                photoUrl: photoUrl || undefined
            });
            setSuccess(true);
            setTimeout(() => {
                if (onClose) onClose();
            }, 2000);
        } catch (err) {
            toast.error('Failed to submit work log');
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-4 text-center text-amber-800">Loading apprenticeships...</div>;
    }

    if (apprenticeships.length === 0) {
        return (
            <div className="p-6 text-center bg-white rounded-xl shadow-sm border border-amber-100">
                <Briefcase className="w-12 h-12 text-amber-200 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-amber-900 mb-2">No Active Apprenticeships</h3>
                <p className="text-amber-700">You don't have any active apprenticeships to log work for.</p>
                {onClose && (
                    <button onClick={onClose} className="mt-4 text-amber-600 hover:text-amber-800 underline">Close</button>
                )}
            </div>
        );
    }

    if (success) {
        return (
            <div className="p-8 text-center bg-green-50 rounded-xl border border-green-100 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">Work Logged!</h3>
                <p className="text-green-700">Your hours have been submitted for approval.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-amber-100 overflow-hidden max-w-md w-full mx-auto">
            <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    Log Work Hours
                </h2>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-amber-400 hover:text-amber-600 hover:bg-amber-100 p-1 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">

                {/* Apprenticeship Selector */}
                <div>
                    <label htmlFor="apprenticeship" className="block text-sm font-medium text-amber-900 mb-1">Apprenticeship</label>
                    <select
                        id="apprenticeship"
                        value={selectedApprenticeship}
                        onChange={(e) => setSelectedApprenticeship(e.target.value)}
                        className="w-full rounded-lg border-amber-200 bg-white px-3 py-2 text-amber-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                        required
                    >
                        <option value="">Select work...</option>
                        {apprenticeships.map(app => (
                            <option key={app.id} value={app.id}>
                                {app.title} {app.organizationName ? `at ${app.organizationName}` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Date */}
                    <div>
                        <label htmlFor="work-date" className="block text-sm font-medium text-amber-900 mb-1">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-amber-400" />
                            <input
                                id="work-date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-9 rounded-lg border-amber-200 bg-white px-3 py-2 text-amber-900 focus:ring-2 focus:ring-amber-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Hours */}
                    <div>
                        <label htmlFor="work-hours" className="block text-sm font-medium text-amber-900 mb-1">Hours</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-2.5 w-4 h-4 text-amber-400" />
                            <input
                                id="work-hours"
                                type="number"
                                step="0.5"
                                min="0.5"
                                value={hours}
                                onChange={(e) => setHours(Number(e.target.value))}
                                className="w-full pl-9 rounded-lg border-amber-200 bg-white px-3 py-2 text-amber-900 focus:ring-2 focus:ring-amber-500 outline-none"
                                placeholder="2.0"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="work-description" className="block text-sm font-medium text-amber-900 mb-1">What did you do?</label>
                    <textarea
                        id="work-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-lg border-amber-200 bg-white px-3 py-2 text-amber-900 focus:ring-2 focus:ring-amber-500 outline-none h-24 resize-none"
                        placeholder="Describe the tasks you completed..."
                        required
                    />
                </div>

                {/* Photo URL (Optional MVP) */}
                <div>
                    <label htmlFor="work-photo" className="block text-sm font-medium text-amber-900 mb-1">Photo (Optional)</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Camera className="absolute left-3 top-2.5 w-4 h-4 text-amber-400" />
                            <input
                                id="work-photo"
                                type="url"
                                value={photoUrl}
                                onChange={(e) => setPhotoUrl(e.target.value)}
                                className="w-full pl-9 rounded-lg border-amber-200 bg-white px-3 py-2 text-amber-900 focus:ring-2 focus:ring-amber-500 outline-none"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                    <p className="text-xs text-amber-500 mt-1">Paste a link to a photo of your work.</p>
                </div>

                <button
                    type="submit"
                    disabled={submitting || !selectedApprenticeship}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Log Work'
                    )}
                </button>

            </form>
        </div>
    );
}
