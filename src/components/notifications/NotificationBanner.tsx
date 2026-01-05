import { ReactNode } from 'react';
import { X, Info, CheckCircle, WarningCircle, Sparkle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type NotificationType = 'milestone' | 'alert' | 'encouragement' | 'info';

interface NotificationBannerProps {
    type: NotificationType;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    onDismiss?: () => void;
    dismissible?: boolean;
}

const NOTIFICATION_STYLES: Record<NotificationType, { icon: any; bgColor: string; borderColor: string; iconColor: string; textColor: string }> = {
    milestone: {
        icon: Sparkle,
        bgColor: 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30',
        borderColor: 'border-yellow-200 dark:border-yellow-800/50',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        textColor: 'text-yellow-900 dark:text-yellow-100',
    },
    alert: {
        icon: WarningCircle,
        bgColor: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
        borderColor: 'border-amber-200 dark:border-amber-800/50',
        iconColor: 'text-amber-600 dark:text-amber-400',
        textColor: 'text-amber-900 dark:text-amber-100',
    },
    encouragement: {
        icon: CheckCircle,
        bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
        borderColor: 'border-green-200 dark:border-green-800/50',
        iconColor: 'text-green-600 dark:text-green-400',
        textColor: 'text-green-900 dark:text-green-100',
    },
    info: {
        icon: Info,
        bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
        borderColor: 'border-blue-200 dark:border-blue-800/50',
        iconColor: 'text-blue-600 dark:text-blue-400',
        textColor: 'text-blue-900 dark:text-blue-100',
    },
};

export function NotificationBanner({
    type,
    title,
    message,
    actionLabel,
    onAction,
    onDismiss,
    dismissible = true,
}: NotificationBannerProps) {
    const styles = NOTIFICATION_STYLES[type];
    const Icon = styles.icon;

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl border-2 p-4 transition-all',
                styles.bgColor,
                styles.borderColor
            )}
        >
            <div className="flex items-start gap-4">
                <div className={cn('mt-0.5 shrink-0', styles.iconColor)}>
                    <Icon className="h-6 w-6" weight="duotone" />
                </div>

                <div className="flex-1 space-y-1">
                    <p className={cn('font-semibold', styles.textColor)}>{title}</p>
                    <p className={cn('text-sm leading-relaxed opacity-90', styles.textColor)}>
                        {message}
                    </p>

                    {actionLabel && onAction && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onAction}
                            className={cn(
                                'mt-2 border-current hover:bg-black/5 dark:hover:bg-white/5',
                                styles.textColor
                            )}
                        >
                            {actionLabel}
                        </Button>
                    )}
                </div>

                {dismissible && onDismiss && (
                    <button
                        onClick={onDismiss}
                        className={cn(
                            'ml-auto shrink-0 rounded-md p-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10',
                            styles.textColor
                        )}
                        aria-label="Dismiss notification"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
}

// Example notifications for development
export const EXAMPLE_NOTIFICATIONS = {
    milestone: {
        type: 'milestone' as const,
        title: '🎉 Milestone Reached!',
        message: 'Emma has completed her first 10 activities in the Motor domain!',
        dismissible: true,
    },
    alert: {
        type: 'alert' as const,
        title: 'Coverage Notice',
        message: "It's been 2 weeks since James had a Language-focused activity.",
        actionLabel: 'View Suggestions',
        dismissible: true,
    },
    encouragement: {
        type: 'encouragement' as const,
        title: 'Great Week!',
        message: 'All children have balanced coverage across domains. Keep up the wonderful work!',
        dismissible: true,
    },
    info: {
        type: 'info' as const,
        title: 'New Content Available',
        message: '5 new books have been added to your library for ages 2-4.',
        actionLabel: 'Browse Books',
        dismissible: true,
    },
};
