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
