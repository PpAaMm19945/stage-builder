import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Timer, Pause, Play } from '@phosphor-icons/react';

interface FormationTimerProps {
    isRunning: boolean;
    onTimeUpdate?: (seconds: number) => void;
    className?: string;
    showControls?: boolean;
    onToggle?: () => void;
}

/**
 * A simple timer component that tracks elapsed time.
 * - Starts/stops based on `isRunning` prop
 * - Returns elapsed seconds via `onTimeUpdate` callback
 * - Displays MM:SS format
 */
export function FormationTimer({
    isRunning,
    onTimeUpdate,
    className,
    showControls = false,
    onToggle
}: FormationTimerProps) {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        if (isRunning) {
            // Record start time if not already set
            if (!startTimeRef.current) {
                startTimeRef.current = Date.now() - (elapsedSeconds * 1000);
            }

            intervalRef.current = setInterval(() => {
                const now = Date.now();
                const newElapsed = Math.floor((now - (startTimeRef.current || now)) / 1000);
                setElapsedSeconds(newElapsed);
                onTimeUpdate?.(newElapsed);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, onTimeUpdate]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getElapsedMinutes = (): number => {
        return Math.ceil(elapsedSeconds / 60);
    };

    return (
        <div className={cn(
            "flex items-center gap-2 text-sm font-mono",
            isRunning ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
            className
        )}>
            <Timer
                weight={isRunning ? "fill" : "regular"}
                className={cn(
                    "w-4 h-4",
                    isRunning && "animate-pulse"
                )}
            />
            <span className="tabular-nums">{formatTime(elapsedSeconds)}</span>

            {showControls && onToggle && (
                <button
                    onClick={(e) => { e.stopPropagation(); onToggle(); }}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                    aria-label={isRunning ? "Pause timer" : "Start timer"}
                >
                    {isRunning ? (
                        <Pause weight="fill" className="w-3 h-3" />
                    ) : (
                        <Play weight="fill" className="w-3 h-3" />
                    )}
                </button>
            )}
        </div>
    );
}

// Helper hook for managing timer state
export function useFormationTimer() {
    const [isRunning, setIsRunning] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    const start = () => {
        setStartTime(Date.now());
        setIsRunning(true);
    };

    const stop = () => {
        setIsRunning(false);
    };

    const reset = () => {
        setIsRunning(false);
        setStartTime(null);
        setElapsedSeconds(0);
    };

    const getElapsedMinutes = (): number => {
        return Math.ceil(elapsedSeconds / 60);
    };

    const handleTimeUpdate = (seconds: number) => {
        setElapsedSeconds(seconds);
    };

    return {
        isRunning,
        elapsedSeconds,
        start,
        stop,
        reset,
        getElapsedMinutes,
        handleTimeUpdate
    };
}
