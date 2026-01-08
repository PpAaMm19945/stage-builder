import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { CaretDown, CaretUp, PersonSimpleRun, GraduationCap, CheckCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface PaceSetting {
    id: string;
    studentId: string;
    domain: string;
    stageOverride?: string;
    tierOverride?: string;
    reason?: string;
}

const DOMAINS = [
    { id: 'math', label: 'Math' },
    { id: 'language', label: 'Language & Reading' },
    { id: 'cognitive', label: 'Cognitive Skills' },
    { id: 'motor', label: 'Physical Development' },
];

const STAGES = [
    { id: 'early-years', label: 'Early Years (Ages 2-5)' },
    { id: 'lower-primary', label: 'Lower Primary (Ages 6-9)' },
    { id: 'middle-school', label: 'Middle School (Ages 10-13)' },
    { id: 'upper-school', label: 'Upper School (Ages 14+)' },
];

export function PaceSettings() {
    const { children, token } = useAuth();
    const [openChildId, setOpenChildId] = useState<string | null>(null);
    const [settings, setSettings] = useState<Record<string, PaceSetting[]>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (openChildId) {
            loadPaceSettings(openChildId);
        }
    }, [openChildId]);

    const loadPaceSettings = async (studentId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/family/pace/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSettings(prev => ({ ...prev, [studentId]: data }));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (studentId: string, domain: string, stage: string) => {
        try {
            const res = await fetch('/api/family/pace', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId,
                    domain,
                    stageOverride: stage === 'default' ? null : stage,
                    reason: 'Parent override via Settings'
                })
            });

            if (res.ok) {
                toast.success('Pace updated');
                loadPaceSettings(studentId);
            }
        } catch (e) {
            toast.error('Failed to update pace');
        }
    };

    if (children.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <PersonSimpleRun className="h-5 w-5" />
                    Pace & Advancement
                </CardTitle>
                <CardDescription>
                    Manage stage progression and pacing for each child
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {children.map(child => {
                    const isOpen = openChildId === child.id;
                    const childSettings = settings[child.id] || [];

                    return (
                        <div key={child.id} className="border rounded-lg p-4">
                            <Collapsible
                                open={isOpen}
                                onOpenChange={() => setOpenChildId(isOpen ? null : child.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {child.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{child.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {child.currentStage.replace('-', ' ')}
                                            </p>
                                        </div>
                                    </div>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            {isOpen ? <CaretUp /> : <CaretDown />}
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>

                                <CollapsibleContent className="pt-4 space-y-4">
                                    <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md mb-4">
                                        <GraduationCap className="inline mr-1 -mt-0.5" />
                                        Adjust the learning stage for specific subjects if {child.name} is ready for more advanced material.
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {DOMAINS.map(domain => {
                                            const currentSetting = childSettings.find(s => s.domain === domain.id);
                                            const currentStage = currentSetting?.stageOverride || 'default';

                                            return (
                                                <div key={domain.id} className="space-y-2">
                                                    <Label className="text-xs font-medium uppercase text-muted-foreground">
                                                        {domain.label}
                                                    </Label>
                                                    <Select
                                                        value={currentStage}
                                                        onValueChange={(val) => handleUpdate(child.id, domain.id, val)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Default (Age-based)" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="default">Default (Age-based)</SelectItem>
                                                            {STAGES.map(stage => (
                                                                <SelectItem key={stage.id} value={stage.id}>
                                                                    {stage.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {currentStage !== 'default' && (
                                                        <div className="flex items-center gap-1 text-xs text-emerald-600">
                                                            <CheckCircle weight="fill" />
                                                            Custom pace active
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
