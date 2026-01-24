
import { useQuery } from '@tanstack/react-query';
import { ai } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Clock } from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';

export function ActionHistory() {
    const { data: actions, isLoading } = useQuery({
        queryKey: ['ai-actions'],
        queryFn: ai.getActions
    });

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg">AI Action Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                    <div className="space-y-4 p-4">
                        {actions?.map((action: any) => (
                            <div key={action.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                                <div className="mt-1">
                                    {action.status === 'confirmed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                    {action.status === 'rejected' && <XCircle className="w-5 h-5 text-red-500" />}
                                    {action.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-sm capitalize">
                                            {action.action_type.replace(/_/g, ' ')}
                                        </p>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{action.reason}</p>
                                    <div className="flex gap-2 mt-1">
                                        <Badge variant={action.status === 'confirmed' ? 'default' : 'secondary'} className="text-[10px]">
                                            {action.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {!isLoading && actions?.length === 0 && (
                            <p className="text-center text-muted-foreground text-sm py-8">No actions recorded yet.</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
