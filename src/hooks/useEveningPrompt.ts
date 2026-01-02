import { useState, useEffect } from 'react';

const EVENING_PREP_KEY = 'schoolos_evening_prep_acknowledged';

export function useEveningPrompt() {
    const [shouldShow, setShouldShow] = useState(false);

    useEffect(() => {
        const checkTime = () => {
            const now = new Date();
            const hour = now.getHours();
            const today = now.toISOString().split('T')[0];

            // Show prompt after 7 PM (19:00)
            const isEveningTime = hour >= 19;

            // Check if already acknowledged today
            const lastAcknowledged = localStorage.getItem(EVENING_PREP_KEY);
            const alreadyAcknowledgedToday = lastAcknowledged === today;

            setShouldShow(isEveningTime && !alreadyAcknowledgedToday);
        };

        checkTime();

        // Check every minute
        const interval = setInterval(checkTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const acknowledge = () => {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(EVENING_PREP_KEY, today);
        setShouldShow(false);
    };

    const snooze = () => {
        // Just hide for this session (don't persist)
        setShouldShow(false);
    };

    const reset = () => {
        localStorage.removeItem(EVENING_PREP_KEY);
    };

    return { shouldShow, acknowledge, snooze, reset };
}
