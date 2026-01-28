import { useState, useEffect } from 'react';

/**
 * Hook to detect mobile keyboard height using the visualViewport API.
 * Returns the keyboard height in pixels, useful for adjusting input positioning.
 */
export function useKeyboardHeight() {
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport) return;

        const handleResize = () => {
            // Keyboard height = difference between window inner height and viewport height
            const height = window.innerHeight - viewport.height;
            setKeyboardHeight(Math.max(0, height));
        };

        // Initial check
        handleResize();

        viewport.addEventListener('resize', handleResize);
        viewport.addEventListener('scroll', handleResize);

        return () => {
            viewport.removeEventListener('resize', handleResize);
            viewport.removeEventListener('scroll', handleResize);
        };
    }, []);

    return keyboardHeight;
}

/**
 * Hook to detect if the viewport is at a mobile breakpoint
 */
export function useIsMobile(breakpoint: number = 768) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, [breakpoint]);

    return isMobile;
}
