import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { PortfolioGallery } from '@/components/portfolio/PortfolioGallery';
import { PortfolioUploadModal } from '@/components/portfolio/PortfolioUploadModal';

export default function PortfolioPage() {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    if (!studentId) {
        return <div>Student ID is required</div>;
    }

    const handleUploadComplete = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
                    <p className="text-muted-foreground">Collection of student work and milestones.</p>
                </div>
                <div className="ml-auto">
                    <Button onClick={() => setIsUploadOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Add Item
                    </Button>
                </div>
            </div>

            <PortfolioGallery studentId={studentId} refreshTrigger={refreshTrigger} />

            <PortfolioUploadModal
                studentId={studentId}
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUploadComplete={handleUploadComplete}
            />
        </div>
    );
}
