import { useState, useRef, useEffect } from 'react';
import { ai } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChatCircle, X, PaperPlaneRight, CircleNotch } from '@phosphor-icons/react';

interface StudentAiChatProps {
    studentId: string;
    currentSubject?: string;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function StudentAiChat({ studentId, currentSubject }: StudentAiChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const context = {
                studentId,
                currentSubject: currentSubject || 'general',
            };

            const stream = await ai.chat(userMessage, context, 'student');

            if (!stream) {
                throw new Error('No response stream');
            }

            // Read the SSE stream
            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';

            // Add empty assistant message that we'll update
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.response) {
                                assistantMessage += parsed.response;
                                setMessages(prev => {
                                    const updated = [...prev];
                                    updated[updated.length - 1] = { role: 'assistant', content: assistantMessage };
                                    return updated;
                                });
                            }
                        } catch {
                            // Handle raw text chunks (Llama streaming format)
                            if (data.trim()) {
                                assistantMessage += data;
                                setMessages(prev => {
                                    const updated = [...prev];
                                    updated[updated.length - 1] = { role: 'assistant', content: assistantMessage };
                                    return updated;
                                });
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: "I'm having trouble connecting. Please try again!" }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white z-50"
                size="icon"
            >
                <ChatCircle className="w-7 h-7" weight="fill" />
            </Button>
        );
    }

    return (
        <Card className="fixed bottom-6 right-6 w-80 sm:w-96 h-[28rem] flex flex-col shadow-2xl z-50 border-0 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ChatCircle className="w-5 h-5" weight="fill" />
                    <span className="font-semibold">Ask a Question</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 h-8 w-8"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                        <p className="text-sm">Hi! I'm your learning helper.</p>
                        <p className="text-xs mt-2">Ask me anything and I'll help you figure it out!</p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user'
                                    ? 'bg-indigo-500 text-white rounded-br-md'
                                    : 'bg-white dark:bg-slate-800 border shadow-sm rounded-bl-md'
                                }`}
                        >
                            {msg.content || (
                                <span className="inline-flex items-center gap-1">
                                    <CircleNotch className="w-4 h-4 animate-spin" />
                                    Thinking...
                                </span>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t bg-white dark:bg-slate-950">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question..."
                        className="flex-1 px-3 py-2 text-sm rounded-full border bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        className="rounded-full bg-indigo-500 hover:bg-indigo-600 text-white h-10 w-10"
                    >
                        {isLoading ? (
                            <CircleNotch className="w-5 h-5 animate-spin" />
                        ) : (
                            <PaperPlaneRight className="w-5 h-5" />
                        )}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
