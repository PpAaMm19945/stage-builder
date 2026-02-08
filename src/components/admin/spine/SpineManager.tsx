
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, List, LayoutDashboard } from "lucide-react";
import SpineList from './SpineList';
import SpineGenerationForm from './SpineGenerationForm';
import ConflictResolver from './ConflictResolver';
import SpineViewer from './SpineViewer';

const SpineManager = () => {
    const [view, setView] = useState<'list' | 'generate' | 'resolve' | 'view'>('list');
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string>('literacy');

    const handleGenerationSuccess = (version: string) => {
        // After generation, we might want to check conflicts immediately
        // For now, go back to list to see status
        setView('list');
    };

    const handleReviewConflicts = (version: string) => {
        setSelectedVersion(version);
        setView('resolve');
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
                <SpineList
                    onReviewConflicts={handleReviewConflicts}
                    onViewEntries={handleViewEntries}
                />
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

            {view === 'resolve' && selectedVersion && (
                <ConflictResolver
                    version={selectedVersion}
                    onComplete={() => setView('list')}
                />
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
