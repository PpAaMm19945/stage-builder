
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Archive, Download, CircleNotch, LockKey } from '@phosphor-icons/react';

export const DataArchive: React.FC = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDownload = async () => {
        if (!token || loading) return;

        setLoading(true);
        setError(null);

        try {
            // We use fetch with blob to handle the file download securely with auth headers
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/export/archive`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to generate archive');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Use the filename from the header if available, otherwise default
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `schoolos_archive_${new Date().toISOString().split('T')[0]}.json`;

            if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err: any) {
            console.error('Download error:', err);
            setError('Could not generate archive. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 my-8">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-800 rounded-lg text-amber-400">
                    <Archive size={32} />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                        The Long Goodbye (Data Export)
                    </h3>
                    <p className="text-slate-400 text-sm mt-1 mb-4">
                        We believe your data belongs to you. Generate a complete backup of your family's history, student profiles, and portfolio items.
                    </p>

                    <div className="bg-slate-800/50 p-4 rounded border border-slate-700 mb-4 text-sm text-slate-300">
                        <div className="flex items-center gap-2 mb-2 font-medium text-amber-400">
                            <LockKey size={16} />
                            <span>Secure Media Access</span>
                        </div>
                        <p>
                            Your archive includes a JSON file with all your records. For huge files like photos and videos,
                            the JSON includes <strong>secure, time-limited links (7 days)</strong> for you to download them individually.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleDownload}
                        disabled={loading}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors
              ${loading
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20'}
            `}
                    >
                        {loading ? (
                            <>
                                <CircleNotch size={20} className="animate-spin" />
                                <span>Gathering your history...</span>
                            </>
                        ) : (
                            <>
                                <Download size={20} />
                                <span>Download Full Archive</span>
                            </>
                        )}
                    </button>

                    <p className="text-xs text-slate-500 mt-2">
                        Includes: Profiles, Evidences, Portfolio Metadata, Work Logs, and signed media links.
                    </p>
                </div>
            </div>
        </div>
    );
};
