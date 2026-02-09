
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import SpineList from './SpineList';
import SpineGenerationForm from './SpineGenerationForm';
import SpineViewer from './SpineViewer';

const SpineManager = () => {
    const [view, setView] = useState<'list' | 'generate' | 'view'>('list');
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string>('literacy');

    const handleGenerationSuccess = () => {
        setView('list');
    };

    const handleViewEntries = (version: string, subject: string) => {
        setSelectedVersion(version);
        setSelectedSubject(subject);
        setView('view');
    };

    return (
        <div className="space-y-4">
            {view === 'list' && (
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold tracking-tight">Curriculum Spines</h2>
                    <Button onClick={() => setView('generate')} className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        New Generation
                    </Button>
                </div>
            )}

            {view === 'list' && (
                <SpineList onViewEntries={handleViewEntries} />
            )}

            {view === 'generate' && (
                <div className="max-w-2xl mx-auto">
                    <div className="mb-4">
                        <Button variant="ghost" onClick={() => setView('list')} className="mb-2">
                            ← Back to List
                        </Button>
                    </div>
                    <SpineGenerationForm onSuccess={handleGenerationSuccess} />
                </div>
            )}

            {view === 'view' && selectedVersion && (
                <SpineViewer
                    version={selectedVersion}
                    subject={selectedSubject}
                    onBack={() => setView('list')}
                />
            )}
        </div>
    );
};

export default SpineManager;
