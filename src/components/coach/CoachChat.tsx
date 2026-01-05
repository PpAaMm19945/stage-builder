import { useState, useRef, useEffect } from 'react';
import { PaperPlaneRight, Sparkle, ChatCircleDots } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ai } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function CoachChat() {
    const { user, children } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I'm your SchoolOS Pedagogical Coach. I can help you with curriculum ideas, habit training, or adapting lessons for your children." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const stream = await ai.chat(userMessage, {
                children: children?.map((c: any) => ({ name: c.name, age: c.ageInMonths })),
                user: user?.name
            });

            if (!stream) throw new Error("No stream returned");

            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';

            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                const lines = buffer.split('\n');

                // Process all complete lines
                buffer = lines.pop() || ''; // Keep the last partial line in buffer

                for (const line of lines) {
                    if (line.trim().startsWith('data: ')) {
                        const data = line.trim().slice(6);
                        if (data === '[DONE]') continue;
                        try {
                            const parsed = JSON.parse(data);
                            const token = parsed.response;
                            if (token) {
                                assistantMessage += token;
                                setMessages(prev => {
                                    const newMsgs = [...prev];
                                    newMsgs[newMsgs.length - 1].content = assistantMessage;
                                    return newMsgs;
                                });
                            }
                        } catch (e) {
                            // Ignore parse errors (middle of stream)
                        }
                    }
                }
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full shadow-sm bg-indigo-50 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950 dark:border-indigo-800">
                    <Sparkle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" weight="fill" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[100vw] sm:w-[540px] flex flex-col p-0 h-[100dvh]">
                <SheetHeader className="p-4 border-b bg-muted/20">
                    <SheetTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                        <Sparkle className="w-5 h-5" weight="fill" />
                        Pedagogical Coach
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50" ref={scrollRef}>
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={cn(
                                "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                                m.role === 'user'
                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                    : "bg-white dark:bg-muted border rounded-bl-none"
                            )}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-muted px-4 py-2 rounded-full text-xs text-muted-foreground animate-pulse flex items-center gap-2">
                                <ChatCircleDots className="w-4 h-4 animate-bounce" /> Thinking...
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t mt-auto bg-background">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask about lessons, habits, or routine..."
                            disabled={isLoading}
                            className="rounded-full"
                        />
                        <Button type="submit" size="icon" disabled={isLoading} className="rounded-full shrink-0">
                            <PaperPlaneRight className="w-4 h-4" weight="fill" />
                        </Button>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
