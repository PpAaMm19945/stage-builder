import { useAuth } from '@/contexts/AuthContext';
import { AGE_BANDS } from '@/data/scope-sequence';
import { FamilyPositionBar } from '@/components/scope/FamilyPositionBar';
import { StageNavigator } from '@/components/scope/StageNavigator';
import { AgeBandCard } from '@/components/scope/AgeBandCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function ScopeSequencePage() {
    const { children } = useAuth();

    const getChildrenInBand = (min: number, max: number) => {
        if (!children) return [];
        return children.filter(c => c.ageInMonths >= min && c.ageInMonths < max);
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20 px-4 sm:px-6 md:px-8 pt-6">
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-display font-bold text-foreground">Family Learning Map</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        A guide to your children's developmental journey through The Garden years.
                    </p>
                </div>

                {/* Stage Navigator - Shows the big picture (0-18) */}
                <StageNavigator />

                <Alert className="bg-primary/5 border-primary/20">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-primary/90 text-sm">
                        Consider these age ranges as "seasons" rather than deadlines. Every child grows in their own time,
                        like unique flowers in a garden. Use this map to identify readiness, not to rush growth.
                    </AlertDescription>
                </Alert>

                {/* Family Position Bar - "You are here" */}
                <FamilyPositionBar childrenData={children} />
            </div>

            <div className="space-y-4">
                <h2 className="font-semibold text-lg text-foreground px-1">Milestones by Age</h2>
                <div className="grid gap-4">
                    {AGE_BANDS.map((band) => {
                        const activeChildren = getChildrenInBand(band.ageRangeMonths[0], band.ageRangeMonths[1]);
                        return (
                            <AgeBandCard
                                key={band.id}
                                band={band}
                                childrenInBand={activeChildren}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
