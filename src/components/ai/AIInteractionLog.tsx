import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { ai } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CircleNotch, Robot, ChatCircle, CaretDown, CaretUp, Eye } from '@phosphor-icons/react';
import type { AIInteractionLog } from '@/types';

interface InteractionCardProps {
    log: AIInteractionLog;
    isExpanded: boolean;
    onToggle: () => void;
}

function InteractionCard({ log, isExpanded, onToggle }: InteractionCardProps) {
    const formattedDate = new Date(log.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="border rounded-lg overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                        <ChatCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p className="font-medium text-sm line-clamp-1">{log.question}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {log.studentName && (
                                <>
                                    <span>{log.studentName}</span>
                                    <span>•</span>
                                </>
                            )}
                            <span>{formattedDate}</span>
                            {log.context?.activityTitle && (
                                <>
                                    <span>•</span>
                                    <span className="text-purple-600 dark:text-purple-400">
                                        {log.context.activityTitle as string}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {isExpanded ? (
                    <CaretUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                    <CaretDown className="w-4 h-4 text-muted-foreground" />
                )}
            </button>

            {isExpanded && (
                <div className="p-3 pt-0 space-y-3 border-t bg-muted/20">
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">QUESTION</p>
                        <p className="text-sm">{log.question}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">AI RESPONSE</p>
                        <p className="text-sm whitespace-pre-wrap">{log.answer}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export function AIInteractionLog() {
    const { children } = useAuth();
    const [selectedChild, setSelectedChild] = useState<string>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const { data: logs, isLoading, error } = useQuery({
        queryKey: ['ai-interactions', selectedChild === 'all' ? undefined : selectedChild],
        queryFn: () => ai.getInteractionLog(selectedChild === 'all' ? undefined : selectedChild),
    });

    const getInitials = (name: string) =>
        name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

    return (
        <div className="space-y-4">
            {/* Filter by child */}
            {children.length > 1 && (
                <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <Select value={selectedChild} onValueChange={setSelectedChild}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All children" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All children</SelectItem>
                            {children.map((child) => (
                                <SelectItem key={child.id} value={child.id}>
                                    {child.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <CircleNotch className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            ) : error ? (
                <div className="text-center py-8 text-destructive">
                    <p>Failed to load interaction history</p>
                </div>
            ) : !logs || logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <Robot className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">No AI interactions yet</p>
                    <p className="text-sm">
                        When your children use AI help, their conversations will appear here.
                    </p>
                </div>
            ) : (
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                        {logs.map((log: AIInteractionLog) => (
                            <InteractionCard
                                key={log.id}
                                log={log}
                                isExpanded={expandedId === log.id}
                                onToggle={() =>
                                    setExpandedId(expandedId === log.id ? null : log.id)
                                }
                            />
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>
    );
}
