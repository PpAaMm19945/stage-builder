import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, Download, Brain, EyeOff, FileText, ArrowLeft } from "lucide-react";

export default function TrustCovenant() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-4xl space-y-8">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <ShieldCheck className="h-12 w-12 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        The FamilyPath Covenant
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Before you share anything about your family, we want you to know exactly how we handle your data.
                        These are our 5 unshakeable promises to you.
                    </p>
                </div>

                {/* Separator */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-muted" />
                    </div>
                </div>

                {/* Promises Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                    {/* Promise 1 */}
                    <Card className="border-2 border-primary/10 hover:border-primary/20 transition-colors">
                        <CardContent className="pt-6 space-y-4">
                            <div className="p-3 bg-primary/10 w-fit rounded-lg">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">1. Your Children Are Not Products</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    We never sell data about your children. We never build advertising profiles based on their activity. Your family's growth is private, not a commodity.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Promise 2 */}
                    <Card className="border-2 border-primary/10 hover:border-primary/20 transition-colors">
                        <CardContent className="pt-6 space-y-4">
                            <div className="p-3 bg-primary/10 w-fit rounded-lg">
                                <Download className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">2. You Own Your Data</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Export everything anytime. Delete everything anytime. We are stewards of your data, but you remain the owner. No lock-in, ever.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Promise 3 */}
                    <Card className="border-2 border-primary/10 hover:border-primary/20 transition-colors">
                        <CardContent className="pt-6 space-y-4">
                            <div className="p-3 bg-primary/10 w-fit rounded-lg">
                                <Brain className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">3. AI Serves You</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Our AI recommends, but you decide. Always. We use AI to support your parental authority, never to replace it or undermine your decisions.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Promise 4 */}
                    <Card className="border-2 border-primary/10 hover:border-primary/20 transition-colors">
                        <CardContent className="pt-6 space-y-4">
                            <div className="p-3 bg-primary/10 w-fit rounded-lg">
                                <EyeOff className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">4. No Dark Patterns</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    No guilt notifications. No manipulation to keep you engaged. We want you spending time with your family, not glued to our app.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Promise 5 */}
                    <Card className="border-2 border-primary/10 hover:border-primary/20 transition-colors md:col-span-2 lg:col-span-2">
                        <CardContent className="pt-6 space-y-4">
                            <div className="p-3 bg-primary/10 w-fit rounded-lg">
                                <Lock className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">5. Radical Transparency</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    If we ever need to change these terms, we will tell you first and give you a clear way to leave. We operate in the light.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* CTA Section */}
                <div className="text-center pt-8 space-y-6">
                    <Link to="/auth">
                        <Button size="lg" className="w-full sm:w-auto min-w-[250px] text-lg h-12">
                            I Understand — Continue to Sign Up
                        </Button>
                    </Link>

                    <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
                        <span>Already have an account?</span>
                        <Link to="/auth" className="text-primary hover:underline font-medium">Log in</Link>
                    </div>

                    <div className="pt-8">
                        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
