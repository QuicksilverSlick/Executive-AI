/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Hook for auto-timeout detection and session inactivity management
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-dev-20250817-001
 * @init-timestamp: 2025-08-17T21:35:00Z
 * @reasoning:
 * - **Objective:** Implement auto-timeout functionality for voice sessions
 * - **Strategy:** Track user activity and automatically end sessions after inactivity
 * - **Outcome:** Configurable timeout with warnings and graceful session termination
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface AutoTimeoutConfig {
  /** Timeout duration in milliseconds (default: 5 minutes) */
  timeoutMs?: number;
  /** Warning time before timeout in milliseconds (default: 1 minute) */
  warningMs?: number;
  /** Whether auto-timeout is enabled */
  enabled?: boolean;
}

export interface AutoTimeoutState {
  /** Time remaining until timeout in milliseconds */
  timeRemaining: number;
  /** Whether a warning should be shown */
  showWarning: boolean;
  /** Whether the timeout has been triggered */
  hasTimedOut: boolean;
  /** Whether auto-timeout is currently active */
  isActive: boolean;
}

export interface AutoTimeoutActions {
  /** Reset the timeout timer (call when user activity is detected) */
  resetTimer: () => void;
  /** Start the auto-timeout */
  start: () => void;
  /** Stop the auto-timeout */
  stop: () => void;
  /** Manually trigger timeout */
  triggerTimeout: () => void;
}

export interface AutoTimeoutCallbacks {
  /** Called when timeout warning should be shown */
  onWarning?: (timeRemaining: number) => void;
  /** Called when timeout occurs */
  onTimeout?: () => void;
}

const DEFAULT_CONFIG: Required<AutoTimeoutConfig> = {
  timeoutMs: 5 * 60 * 1000, // 5 minutes
  warningMs: 1 * 60 * 1000, // 1 minute warning
  enabled: true
};

export const useAutoTimeout = (
  config: AutoTimeoutConfig = {},
  callbacks: AutoTimeoutCallbacks = {}
): AutoTimeoutState & AutoTimeoutActions => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { onWarning, onTimeout } = callbacks;

  const [timeRemaining, setTimeRemaining] = useState(finalConfig.timeoutMs);
  const [showWarning, setShowWarning] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const warningTriggeredRef = useRef(false);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start the auto-timeout
  const start = useCallback(() => {
    if (!finalConfig.enabled) return;

    clearTimers();
    setIsActive(true);
    setHasTimedOut(false);
    setShowWarning(false);
    setTimeRemaining(finalConfig.timeoutMs);
    warningTriggeredRef.current = false;
    lastActivityRef.current = Date.now();

    // Update timer every second
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;
      const remaining = Math.max(0, finalConfig.timeoutMs - elapsed);
      
      setTimeRemaining(remaining);

      // Check for warning
      if (!warningTriggeredRef.current && remaining <= finalConfig.warningMs && remaining > 0) {
        warningTriggeredRef.current = true;
        setShowWarning(true);
        onWarning?.(remaining);
      }

      // Check for timeout
      if (remaining === 0) {
        clearTimers();
        setHasTimedOut(true);
        setIsActive(false);
        onTimeout?.();
      }
    }, 1000);
  }, [finalConfig, onWarning, onTimeout, clearTimers]);

  // Stop the auto-timeout
  const stop = useCallback(() => {
    clearTimers();
    setIsActive(false);
    setShowWarning(false);
    setTimeRemaining(finalConfig.timeoutMs);
    warningTriggeredRef.current = false;
  }, [finalConfig.timeoutMs, clearTimers]);

  // Reset the timer (call on user activity)
  const resetTimer = useCallback(() => {
    if (!isActive) return;

    lastActivityRef.current = Date.now();
    setTimeRemaining(finalConfig.timeoutMs);
    setShowWarning(false);
    warningTriggeredRef.current = false;
  }, [isActive, finalConfig.timeoutMs]);

  // Manually trigger timeout
  const triggerTimeout = useCallback(() => {
    clearTimers();
    setHasTimedOut(true);
    setIsActive(false);
    setTimeRemaining(0);
    onTimeout?.();
  }, [onTimeout, clearTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    timeRemaining,
    showWarning,
    hasTimedOut,
    isActive,
    resetTimer,
    start,
    stop,
    triggerTimeout
  };
};

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-dev-20250817-001
 * @timestamp: 2025-08-17T21:35:00Z
 * @reasoning:
 * - **Objective:** Initial implementation of auto-timeout hook
 * - **Strategy:** Activity-based timeout with configurable warnings
 * - **Outcome:** Robust timeout management with callback support
 */