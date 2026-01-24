import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

export function NotificationBell() {
    const { notifications, dismissNotification, markAsRead, clearAll } = useNotifications();
    const navigate = useNavigate();

    // Filter out any that might be in dismissedIds if we didn't filter them in state (our hook logic does filter, but good to be safe)
    // Actually the hook removes them from the array ON dismiss.

    const unreadCount = notifications.filter((n) => !n.read).length;
    const hasNotifications = notifications.length > 0;

    const handleAction = (n: any) => {
        markAsRead(n.id);
        if (n.actionUrl) {
            navigate(n.actionUrl);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
                >
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                        <span
                            className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background"
                            aria-hidden="true"
                        />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h4 className="text-sm font-semibold">Notifications</h4>
                    {hasNotifications && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto py-1 px-2"
                            onClick={clearAll}
                        >
                            Clear all
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {hasNotifications ? (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 transition-colors hover:bg-muted/50",
                                        !notification.read && "bg-muted/10"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1 space-y-1">
                                            <p className={cn("text-sm font-medium leading-none", !notification.read && "text-primary")}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {notification.description}
                                            </p>
                                            {notification.actionLabel && (
                                                <Button
                                                    variant="link"
                                                    className="px-0 h-auto text-xs mt-2"
                                                    onClick={() => handleAction(notification)}
                                                >
                                                    {notification.actionLabel} →
                                                </Button>
                                            )}
                                        </div>
                                        {notification.dismissible && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 -mt-1 -mr-2 text-muted-foreground hover:text-foreground"
                                                onClick={() => dismissNotification(notification.id)}
                                            >
                                                <Check className="h-3 w-3" />
                                                <span className="sr-only">Dismiss</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[200px] text-center px-4">
                            <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                            <p className="text-sm text-muted-foreground">No new notifications</p>
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
