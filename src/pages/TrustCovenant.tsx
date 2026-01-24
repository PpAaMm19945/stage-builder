
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ShieldCheck, Heart, Robot, LockKey, Users } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

export default function TrustCovenant() {
    const navigate = useNavigate();

    return (
        <div className="bg-background">
            {/* Header */}
            <div className="bg-muted/30 border-b">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-4 text-muted-foreground hover:text-foreground"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-display font-bold text-foreground">The FamilyPath Covenant</h1>
                    <p className="text-lg text-muted-foreground mt-2">Our promise to your family.</p>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 py-12 space-y-16">

                {/* Introduction */}
                <div className="prose dark:prose-invert max-w-none">
                    <p className="lead text-xl">
                        Parents in 2024 are rightfully skeptical of apps that collect family data.
                        Before asking for any information about your children, we want to answer the most important question:
                    </p>
                    <blockquote className="text-2xl font-display italic text-primary border-l-4 border-primary pl-4 py-2 my-8">
                        "Why should I trust you with information about my family?"
                    </blockquote>
                </div>

                {/* The 5 Promises */}
                <div className="space-y-12">
                    <section className="flex gap-6">
                        <div className="shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Users weight="duotone" className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-3">1. YOUR CHILDREN ARE NOT PRODUCTS</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We never sell data about your children. Period. Not to advertisers, not to "educational partners," not to anyone.
                                We are supported by your subscription and donations, not by monetizing your family's attention or data.
                            </p>
                        </div>
                    </section>

                    <section className="flex gap-6">
                        <div className="shrink-0 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                            <LockKey weight="duotone" className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-3">2. YOU OWN YOUR DATA</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Export everything anytime. Delete everything anytime. No questions, no waiting periods, no tricks.
                                Your family's memories and records belong to you, not us.
                            </p>
                        </div>
                    </section>

                    <section className="flex gap-6">
                        <div className="shrink-0 w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <Robot weight="duotone" className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-3">3. AI SERVES YOU</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Our AI recommends. You decide. Always. The "Frontdesk Officer" suggests schedules and books based on your goals,
                                but you have the final say. Every AI action is logged for your review and is fully reversible.
                            </p>
                        </div>
                    </section>

                    <section className="flex gap-6">
                        <div className="shrink-0 w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <Heart weight="duotone" className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-3">4. NO DARK PATTERNS</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                No guilt notifications ("You missed a day!"). No streaks that shame. No tricks to keep you engaged longer than necessary.
                                Our goal is to get you <em>off</em> the app and living life with your family.
                            </p>
                        </div>
                    </section>

                    <section className="flex gap-6">
                        <div className="shrink-0 w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                            <ShieldCheck weight="duotone" className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-3">5. TRANSPARENCY</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                If we ever change these terms, we tell you first. You can leave anytime with all your data.
                                We build in public because we have nothing to hide.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Data Collection Table */}
                <Card className="mt-12 bg-muted/20 border-none">
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4">What Data We Collect (And Why)</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-muted-foreground border-b uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-2">Data</th>
                                        <th className="px-4 py-2">Why We Need It</th>
                                        <th className="px-4 py-2">What We Do NOT Do</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    <tr>
                                        <td className="px-4 py-3 font-medium">Child's Name</td>
                                        <td className="px-4 py-3">Personalize experience ("Good morning, Azie!")</td>
                                        <td className="px-4 py-3">Share with third parties</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-medium">Child's Birthdate</td>
                                        <td className="px-4 py-3">Select age-appropriate content</td>
                                        <td className="px-4 py-3">Store beyond what's needed</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-medium">Parent Email</td>
                                        <td className="px-4 py-3">Account recovery only</td>
                                        <td className="px-4 py-3">Send marketing emails (unless opted in)</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-medium">Progress Data</td>
                                        <td className="px-4 py-3">Show accomplishments, plan next steps</td>
                                        <td className="px-4 py-3">Sell to EdTech companies</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

            </main>
        </div>
    );
}
