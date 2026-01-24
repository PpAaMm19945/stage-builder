import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType =
    | 'profile_incomplete'
    | 'weekly_report_ready'
    | 'ai_suggestion'
    | 'uncompleted_activity'
    | 'system_message';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    description: string;
    actionUrl?: string;
    actionLabel?: string;
    dismissible: boolean;
    createdAt: string; // ISO string
    read: boolean;
}

interface NotificationState {
    notifications: Notification[];
    dismissedIds: string[];

    addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
    dismissNotification: (id: string) => void;
    markAsRead: (id: string) => void;
    clearAll: () => void;

    // Computed helpers could go here if using a getter, but Zustand is simple state
}

export const useNotifications = create<NotificationState>()(
    persist(
        (set) => ({
            notifications: [],
            dismissedIds: [],

            addNotification: (notification) =>
                set((state) => {
                    // Prevent duplicates based on title + type if needed, but for now simple add
                    const newNotification: Notification = {
                        ...notification,
                        id: crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                        read: false,
                    };
                    return { notifications: [newNotification, ...state.notifications] };
                }),

            dismissNotification: (id) =>
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                    dismissedIds: [...state.dismissedIds, id],
                })),

            markAsRead: (id) =>
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, read: true } : n
                    ),
                })),

            clearAll: () => set({ notifications: [] }),
        }),
        {
            name: 'familypath-notifications',
            partialize: (state) => ({
                dismissedIds: state.dismissedIds,
                // We might persist notifications or fetch them. For now, let's persist them locally.
                notifications: state.notifications
            }),
        }
    )
);

export const checkWeeklyReportNotification = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday
    const hour = now.getHours();

    // Check if it's Sunday after 6pm (18:00)
    if (day === 0 && hour >= 18) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 6); // Monday of this week (approx)
        const weekStartStr = weekStart.toISOString().split('T')[0];

        const lastNotified = localStorage.getItem('familypath_report_notification_week');

        if (lastNotified !== weekStartStr) {
            useNotifications.getState().addNotification({
                type: 'weekly_report_ready',
                title: 'Weekly Report Ready',
                description: 'Your family formation report for this week is ready to view.',
                actionUrl: '/reports',
                actionLabel: 'View Report',
                dismissible: true
            });
            localStorage.setItem('familypath_report_notification_week', weekStartStr);
        }
    }
};
