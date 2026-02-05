import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChatTeardropText, Sparkle } from '@phosphor-icons/react';

export function SettingsCurriculum() {
    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-100 dark:border-indigo-900/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-indigo-900 dark:text-indigo-100">
                        <Sparkle className="h-5 w-5 text-indigo-500" weight="fill" />
                        Curriculum & Preferences
                    </CardTitle>
                    <CardDescription className="text-indigo-700/80 dark:text-indigo-300/80">
                        Powered by Gemini 3
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed font-medium">
                        Preferences are now conversational. Just tell your Formation Coach things like:
                    </p>
                    <div className="space-y-3 pl-2">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 bg-white dark:bg-indigo-900/50 rounded-full shadow-sm">
                                <ChatTeardropText className="h-4 w-4 text-indigo-500" />
                            </div>
                            <p className="text-sm italic text-muted-foreground pt-1">"We're taking a break from hymns this week."</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 bg-white dark:bg-indigo-900/50 rounded-full shadow-sm">
                                <ChatTeardropText className="h-4 w-4 text-indigo-500" />
                            </div>
                            <p className="text-sm italic text-muted-foreground pt-1">"Focus more on motor skills for James."</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 bg-white dark:bg-indigo-900/50 rounded-full shadow-sm">
                                <ChatTeardropText className="h-4 w-4 text-indigo-500" />
                            </div>
                            <p className="text-sm italic text-muted-foreground pt-1">"Keep Fridays light."</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
