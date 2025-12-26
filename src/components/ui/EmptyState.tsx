import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
    className?: string;
    children?: ReactNode;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
    className = '',
    children,
}: EmptyStateProps) {
    const navigate = useNavigate();

    const handlePrimaryAction = () => {
        if (onAction) {
            onAction();
        } else if (actionHref) {
            navigate(actionHref);
        }
    };

    return (
        <Card className={className}>
            <CardContent className="py-12 text-center space-y-6">
                <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-muted">
                        <Icon className="h-8 w-8 text-muted-foreground" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                        {title}
                    </h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        {description}
                    </p>
                </div>

                {children}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {(actionLabel && (actionHref || onAction)) && (
                        <Button onClick={handlePrimaryAction}>
                            {actionLabel}
                        </Button>
                    )}
                    {secondaryActionLabel && onSecondaryAction && (
                        <Button variant="outline" onClick={onSecondaryAction}>
                            {secondaryActionLabel}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
