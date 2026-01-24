
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lightning, ClipboardText, ChatCircle, ArrowRight, Check } from '@phosphor-icons/react';
import { AddChildForm } from '@/components/children/AddChildForm';
import { FrontdeskChat } from '@/components/coach/FrontdeskChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function Onboarding() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<'select' | 'guided' | 'chat'>('select');

    if (mode === 'chat') {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => setMode('select')}>&larr; Back</Button>
                </div>
                <FrontdeskChat />
            </div>
        );
    }

    if (mode === 'guided') {
        return <GuidedSetup onBack={() => setMode('select')} onComplete={() => navigate('/dashboard')} />;
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-display font-bold">Welcome to FamilyPath!</h1>
                <p className="text-muted-foreground text-lg">How would you like to get started?</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* 1. Quick Start */}
                <Card className="hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden group">
                    <CardHeader>
                        <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Lightning weight="duotone" className="w-6 h-6" />
                        </div>
                        <CardTitle>Quick Start</CardTitle>
                        <CardDescription>Just add your children. We'll figure out the rest together.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Takes about 1 minute.</p>
                        <AddChildForm onSuccess={() => navigate('/dashboard')} />
                    </CardContent>
                </Card>

                {/* 2. Guided Setup */}
                <Card
                    className="hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden group"
                    onClick={() => setMode('guided')}
                >
                    <CardHeader>
                        <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ClipboardText weight="duotone" className="w-6 h-6" />
                        </div>
                        <CardTitle>Guided Setup</CardTitle>
                        <CardDescription>Answer a few questions for personalized planning from day one.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Takes about 5 minutes.</p>
                        <Button className="w-full">Start Setup</Button>
                    </CardContent>
                </Card>

                {/* 3. Chat */}
                <Card
                    className="hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden group"
                    onClick={() => setMode('chat')}
                >
                    <CardHeader>
                        <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ChatCircle weight="duotone" className="w-6 h-6" />
                        </div>
                        <CardTitle>Chat with Us</CardTitle>
                        <CardDescription>Tell us about your family in conversation. Natural and easy.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Interactive AI setup.</p>
                        <Button variant="outline" className="w-full">Start Chat</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function GuidedSetup({ onBack, onComplete }: { onBack: () => void, onComplete: () => void }) {
    const [step, setStep] = useState(1);
    const [childrenAdded, setChildrenAdded] = useState(false);

    // Mock data collection (you would normally hook this up to context/API)
    const handleNext = () => {
        if (step < 4) setStep(step + 1);
        else {
            toast.success("Setup complete!");
            onComplete();
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <Button variant="ghost" onClick={onBack} className="mb-6">&larr; Back</Button>

            <div className="mb-8">
                <div className="flex gap-2 mb-2">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
                    ))}
                </div>
                <p className="text-sm text-muted-foreground text-right">Step {step} of 4</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {step === 1 && "Who are the learners?"}
                        {step === 2 && "Your Availability"}
                        {step === 3 && "Your Goals"}
                        {step === 4 && "Final Preferences"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 && "Add your children so we can recommend age-appropriate books."}
                        {step === 2 && "When do you want to do formation?"}
                        {step === 3 && "What are you hoping to achieve?"}
                        {step === 4 && "Any special requests?"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {step === 1 && (
                        <div className="text-center py-8">
                            <AddChildForm onSuccess={() => setChildrenAdded(true)} />
                            {childrenAdded && <p className="mt-4 text-green-600 flex items-center justify-center gap-2"><Check /> Child added!</p>}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>Morning Time (Minutes)</Label>
                                <Slider defaultValue={[15]} max={60} step={5} />
                                <p className="text-xs text-muted-foreground">We recommend 15 mins to start.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Evening Time (Minutes)</Label>
                                <Slider defaultValue={[10]} max={30} step={5} />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-3">
                            {['Learn the Catechism', 'Memorize Hymns', 'Read Great Books', 'Daily Devotions'].map(goal => (
                                <div key={goal} className="flex items-center space-x-2">
                                    <Checkbox id={goal} />
                                    <Label htmlFor={goal}>{goal}</Label>
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="skip-sunday" />
                                <Label htmlFor="skip-sunday">Skip Sundays (Church Day)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="light-fridays" />
                                <Label htmlFor="light-fridays">Lighter Fridays</Label>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleNext}>
                        {step === 4 ? "Complete Setup" : "Next"} <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
