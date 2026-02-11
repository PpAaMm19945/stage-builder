import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, CircleNotch } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { ExecutionSteps } from './ThinkingMessage';
import { ExecutionStep } from '@/components/chat/hooks/useChatState';

interface ActionConfirmCardProps {
    type: string;
    reason: string;
    isExecuting?: boolean;
    executionSteps?: ExecutionStep[];
    onConfirm: () => void;
    onReject: () => void;
    className?: string;
}

/**
 * Action confirmation card for AI-proposed actions that require user approval.
 */
export function ActionConfirmCard({
    type,
    reason,
    isExecuting,
    executionSteps,
    onConfirm,
    onReject,
    className,
}: ActionConfirmCardProps) {
    const formattedType = type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    if (isExecuting && executionSteps) {
        return (
            <Card className={cn("bg-background border-primary/20 shadow-md", className)}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base text-primary flex items-center gap-2">
                        <CircleNotch className="w-4 h-4 animate-spin" />
                        Executing Action
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                    <ExecutionSteps steps={executionSteps} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("bg-background border-primary/20 shadow-md", className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-base text-primary">Proposed Action</CardTitle>
            </CardHeader>
            <CardContent className="text-sm pb-2">
                <p className="font-medium">{formattedType}</p>
                <p className="text-muted-foreground mt-1">{reason}</p>
            </CardContent>
            <CardFooter className="flex gap-2 pt-2">
                <Button
                    size="sm"
                    onClick={onConfirm}
                >
                    <Check className="mr-1 w-4 h-4" />
                    Confirm
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onReject}
                >
                    <X className="mr-1 w-4 h-4" />
                    Reject
                </Button>
            </CardFooter>
        </Card>
    );
}
