/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Hook for tracking session duration and providing timer functionality
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-dev-20250817-001
 * @init-timestamp: 2025-08-17T21:30:00Z
 * @reasoning:
 * - **Objective:** Implement session timer tracking for voice assistant
 * - **Strategy:** Create reusable hook with start/stop/reset functionality
 * - **Outcome:** Clean timer management with formatted display
 */

import { useState, useEffect, useRef } from 'react';

export interface SessionTimerState {
  /** Current session duration in milliseconds */
  duration: number;
  /** Formatted duration string (mm:ss) */
  formattedDuration: string;
  /** Whether the timer is currently running */
  isRunning: boolean;
}

export interface SessionTimerActions {
  /** Start the timer */
  start: () => void;
  /** Stop the timer */
  stop: () => void;
  /** Reset the timer to 0 */
  reset: () => void;
  /** Pause the timer (can be resumed with start()) */
  pause: () => void;
}

export const useSessionTimer = (autoStart = false): SessionTimerState & SessionTimerActions => {
  const [duration, setDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const startTimeRef = useRef<number | null>(null);
  const pausedDurationRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format duration to mm:ss
  const formatDuration = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Start timer
  const start = () => {
    if (!isRunning) {
      startTimeRef.current = Date.now();
      setIsRunning(true);
    }
  };

  // Stop timer
  const stop = () => {
    if (isRunning) {
      if (startTimeRef.current) {
        pausedDurationRef.current += Date.now() - startTimeRef.current;
      }
      setIsRunning(false);
      startTimeRef.current = null;
    }
  };

  // Pause timer (same as stop but semantically different)
  const pause = () => {
    stop();
  };

  // Reset timer
  const reset = () => {
    setIsRunning(false);
    setDuration(0);
    startTimeRef.current = null;
    pausedDurationRef.current = 0;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Update duration when running
  useEffect(() => {
    if (isRunning && startTimeRef.current) {
      intervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        const currentSessionDuration = currentTime - startTimeRef.current!;
        const totalDuration = pausedDurationRef.current + currentSessionDuration;
        setDuration(totalDuration);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // Auto start if requested
  useEffect(() => {
    if (autoStart && !isRunning && duration === 0) {
      start();
    }
  }, [autoStart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    duration,
    formattedDuration: formatDuration(duration),
    isRunning,
    start,
    stop,
    pause,
    reset
  };
};

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-dev-20250817-001
 * @timestamp: 2025-08-17T21:30:00Z
 * @reasoning:
 * - **Objective:** Initial implementation of session timer hook
 * - **Strategy:** Clean timer logic with pause/resume capability
 * - **Outcome:** Reusable timer hook with formatted duration display
 */