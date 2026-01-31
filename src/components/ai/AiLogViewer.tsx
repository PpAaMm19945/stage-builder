import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { ai } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CircleNotch, Robot, ChatCircle, CaretDown, CaretUp, Eye, CalendarBlank } from '@phosphor-icons/react';
import type { AIInteractionLog } from '@/types';

interface InteractionCardProps {
    log: AIInteractionLog;
    isExpanded: boolean;
    onToggle: () => void;
}

function InteractionCard({ log, isExpanded, onToggle }: InteractionCardProps) {
    const formattedTime = new Date(log.createdAt).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="border rounded-lg overflow-hidden bg-card">
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
                                    <span className="font-medium text-primary">{log.studentName}</span>
                                    <span>•</span>
                                </>
                            )}
                            <span>{formattedTime}</span>
                            {log.context?.activityTitle && (
                                <>
                                    <span>•</span>
                                    <span className="text-purple-600 dark:text-purple-400">
                                        {log.context.activityTitle}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                        {log.interactionType}
                    </Badge>
                    {isExpanded ? (
                        <CaretUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                        <CaretDown className="w-4 h-4 text-muted-foreground" />
                    )}
                </div>
            </button>

            {isExpanded && (
                <div className="p-4 pt-0 space-y-3 border-t bg-muted/20">
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">QUESTION</p>
                        <p className="text-sm bg-background p-2 rounded">{log.question}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">AI RESPONSE</p>
                        <p className="text-sm whitespace-pre-wrap bg-background p-2 rounded">{log.answer}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

interface DateGroup {
    label: string;
    date: string;
    logs: AIInteractionLog[];
}

export function AiLogViewer() {
    const { children } = useAuth();
    const [selectedChild, setSelectedChild] = useState<string>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const { data: logs, isLoading, error } = useQuery({
        queryKey: ['ai-interactions', selectedChild === 'all' ? undefined : selectedChild],
        queryFn: () => ai.getInteractionLog(selectedChild === 'all' ? undefined : selectedChild),
    });

    // Group logs by date
    const groupedLogs = useMemo<DateGroup[]>(() => {
        if (!logs || logs.length === 0) return [];

        const groups: Record<string, AIInteractionLog[]> = {};

        logs.forEach((log: AIInteractionLog) => {
            // [PHASE 4] Filter out test/placeholder logs
            if (log.question.toLowerCase() === 'lions') return;

            const date = new Date(log.createdAt).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(log);
        });

        return Object.entries(groups).map(([label, logs]) => ({
            label,
            date: logs[0].createdAt,
            logs,
        }));
    }, [logs]);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">AI Interaction History</h3>
                </div>

                {/* Filter by child */}
                {children.length > 1 && (
                    <Select value={selectedChild} onValueChange={setSelectedChild}>
                        <SelectTrigger className="w-[160px]">
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
                )}
            </div>

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
                <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
                    <Robot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No AI interactions yet</p>
                    <p className="text-sm mt-1">
                        When your children use AI help, their conversations will appear here for your review.
                    </p>
                </div>
            ) : (
                <ScrollArea className="h-[450px] pr-4">
                    <div className="space-y-6">
                        {groupedLogs.map((group) => (
                            <div key={group.date}>
                                {/* Date Header */}
                                <div className="flex items-center gap-2 mb-3 pb-1 border-b">
                                    <CalendarBlank className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {group.label}
                                    </span>
                                    <Badge variant="secondary" className="text-xs ml-auto">
                                        {group.logs.length} {group.logs.length === 1 ? 'interaction' : 'interactions'}
                                    </Badge>
                                </div>

                                {/* Logs for this date */}
                                <div className="space-y-2">
                                    {group.logs.map((log) => (
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
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>
    );
}
