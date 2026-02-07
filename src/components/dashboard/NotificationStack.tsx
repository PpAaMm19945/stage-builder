import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notifications } from '@/lib/api';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Sparkle, WarningCircle, CheckCircle, Info } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Notification } from '@/types/api-responses';

export function NotificationStack() {
    const { data: notifs, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: notifications.list,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    const [visibleNotifs, setVisibleNotifs] = useState<Notification[]>([]);

    useEffect(() => {
        if (notifs) {
            // Filter out dismissed ones from localStorage
            const dismissed = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
            setVisibleNotifs(notifs.filter((n: Notification) => !dismissed.includes(n.id)));
        }
    }, [notifs]);

    const dismiss = (id: string) => {
        setVisibleNotifs(prev => prev.filter(n => n.id !== id));
        const dismissed = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
        localStorage.setItem('dismissed_notifications', JSON.stringify([...dismissed, id]));
    };

    if (isLoading || !visibleNotifs.length) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'milestone': return <Sparkle weight="duotone" className="text-amber-500" />;
            case 'alert': return <WarningCircle weight="duotone" className="text-red-500" />;
            case 'encouragement': return <CheckCircle weight="duotone" className="text-green-500" />;
            default: return <Info weight="duotone" className="text-blue-500" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'milestone': return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
            case 'alert': return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
            case 'encouragement': return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
            default: return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
        }
    };

    return (
        <div className="space-y-2 mb-6">
            <AnimatePresence>
                {visibleNotifs.map((n) => (
                    <motion.div
                        key={n.id}
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, x: -100, height: 0 }}
                        className={cn(
                            "relative p-3 rounded-lg border flex gap-3 items-start shadow-sm pr-8",
                            getBgColor(n.type)
                        )}
                    >
                        <div className="mt-0.5 shrink-0">
                            {getIcon(n.type)}
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold">{n.title}</h4>
                            <p className="text-xs text-muted-foreground">{n.message}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => dismiss(n.id)}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            aria-label="Dismiss notification"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
