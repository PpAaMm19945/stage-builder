import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PaperPlaneRight } from '@phosphor-icons/react';

export function ConversationalOnboarding({ onComplete }: { onComplete: () => void }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<{ role: 'ai' | 'user', content: string }[]>([
        { role: 'ai', content: "Welcome! I'm here to help set up your family's formation rhythm. To start, who are the children in your family?" }
    ]);

    const handleSend = () => {
        if (!message.trim()) return;
        setMessages(prev => [...prev, { role: 'user', content: message }]);
        setMessage('');

        // Mock response for now
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ai', content: "Thanks! I'm learning to help you better. (This is a placeholder for the real AI integration)." }]);
        }, 1000);
    };

    return (
        <div className="space-y-4 h-[400px] flex flex-col">
            <div className="text-center space-y-2">
                <DialogTitle className="text-xl font-display">
                    Tell us about your family
                </DialogTitle>
                <DialogDescription>
                    Chat with us to build your profile.
                </DialogDescription>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-muted/20">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg text-sm ${m.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-muted rounded-tl-none'
                            }`}>
                            {m.content}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your answer..."
                    className="flex-1 bg-background border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button size="icon" onClick={handleSend}>
                    <PaperPlaneRight weight="fill" />
                </Button>
            </div>

            <div className="flex justify-center pt-2">
                <Button variant="ghost" size="sm" onClick={onComplete}>
                    finish (simulated)
                </Button>
            </div>
        </div>
    );
}
