/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Hook for comprehensive session state management and lifecycle control
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-dev-20250817-001
 * @init-timestamp: 2025-08-17T21:40:00Z
 * @reasoning:
 * - **Objective:** Centralized session state management with pause/resume/end functionality
 * - **Strategy:** Combine timer, timeout, and session controls into unified interface
 * - **Outcome:** Single hook for all session management needs
 */

import { useState, useCallback, useEffect } from 'react';
import { useSessionTimer } from './useSessionTimer';
import { useAutoTimeout } from './useAutoTimeout';
import type { VoiceStatus, SessionState } from '../types/core';

// Remove duplicate type definition - now imported from core.ts

export interface SessionStateConfig {
  /** Auto-start the session */
  autoStart?: boolean;
  /** Auto-timeout configuration */
  timeout?: {
    enabled?: boolean;
    timeoutMs?: number;
    warningMs?: number;
  };
  /** Session callbacks */
  callbacks?: {
    onSessionStart?: () => void;
    onSessionPause?: () => void;
    onSessionResume?: () => void;
    onSessionEnd?: () => void;
    onTimeoutWarning?: (timeRemaining: number) => void;
    onTimeout?: () => void;
  };
}

export interface SessionControls {
  /** Current session state */
  state: SessionState;
  /** Timer information */
  timer: {
    duration: number;
    formattedDuration: string;
    isRunning: boolean;
  };
  /** Timeout information */
  timeout: {
    timeRemaining: number;
    showWarning: boolean;
    hasTimedOut: boolean;
    isActive: boolean;
  };
  /** Session actions */
  actions: {
    start: () => void;
    pause: () => void;
    resume: () => void;
    end: () => void;
    resetActivity: () => void;
    extendSession: (additionalMinutes?: number) => void;
  };
}

export const useSessionState = (config: SessionStateConfig = {}): SessionControls => {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [isEnding, setIsEnding] = useState(false);

  const { callbacks = {}, timeout: timeoutConfig = {}, autoStart = false } = config;

  // Session timer
  const timer = useSessionTimer(false);

  // Auto-timeout
  const timeout = useAutoTimeout(
    {
      enabled: timeoutConfig.enabled !== false,
      timeoutMs: timeoutConfig.timeoutMs || 5 * 60 * 1000, // 5 minutes default
      warningMs: timeoutConfig.warningMs || 1 * 60 * 1000   // 1 minute warning default
    },
    {
      onWarning: (timeRemaining) => {
        callbacks.onTimeoutWarning?.(timeRemaining);
      },
      onTimeout: () => {
        callbacks.onTimeout?.();
        handleEnd();
      }
    }
  );

  // Start session
  const start = useCallback(() => {
    if (sessionState === 'idle' || sessionState === 'ended') {
      setSessionState('active');
      timer.start();
      timeout.start();
      callbacks.onSessionStart?.();
    }
  }, [sessionState, timer, timeout, callbacks]);

  // Pause session
  const pause = useCallback(() => {
    if (sessionState === 'active') {
      setSessionState('paused');
      timer.pause();
      timeout.stop();
      callbacks.onSessionPause?.();
    }
  }, [sessionState, timer, timeout, callbacks]);

  // Resume session
  const resume = useCallback(() => {
    if (sessionState === 'paused') {
      setSessionState('active');
      timer.start();
      timeout.start();
      callbacks.onSessionResume?.();
    }
  }, [sessionState, timer, timeout, callbacks]);

  // End session
  const handleEnd = useCallback(() => {
    if (isEnding) return; // Prevent double execution
    
    setIsEnding(true);
    setSessionState('ending');
    
    timer.stop();
    timeout.stop();
    
    // Small delay to show ending state before transitioning to ended
    setTimeout(() => {
      setSessionState('ended');
      setIsEnding(false);
      callbacks.onSessionEnd?.();
    }, 300);
  }, [isEnding, timer, timeout, callbacks]);

  // Reset activity (for timeout management)
  const resetActivity = useCallback(() => {
    if (sessionState === 'active') {
      timeout.resetTimer();
    }
  }, [sessionState, timeout]);

  // Extend session
  const extendSession = useCallback((additionalMinutes?: number) => {
    if (sessionState === 'active' || sessionState === 'paused') {
      timeout.extendSession(additionalMinutes);
    }
  }, [sessionState, timeout]);

  // Auto-start if configured
  useEffect(() => {
    if (autoStart && sessionState === 'idle') {
      start();
    }
  }, [autoStart, sessionState, start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timer.stop();
      timeout.stop();
    };
  }, [timer, timeout]);

  return {
    state: sessionState,
    timer: {
      duration: timer.duration,
      formattedDuration: timer.formattedDuration,
      isRunning: timer.isRunning
    },
    timeout: {
      timeRemaining: timeout.timeRemaining,
      showWarning: timeout.showWarning,
      hasTimedOut: timeout.hasTimedOut,
      isActive: timeout.isActive
    },
    actions: {
      start,
      pause,
      resume,
      end: handleEnd,
      resetActivity,
      extendSession
    }
  };
};

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 2.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-dev-20250818-timeout
 * @timestamp: 2025-08-18T20:50:00Z
 * @reasoning:
 * - **Objective:** Add session extension functionality to prevent timeout
 * - **Strategy:** Expose timeout extension method through session actions
 * - **Outcome:** Users can extend sessions to prevent unexpected termination
 * 
 * Previous revision:
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-dev-20250817-001
 * @timestamp: 2025-08-17T21:40:00Z
 * @reasoning:
 * - **Objective:** Initial implementation of unified session state hook
 * - **Strategy:** Combine timer and timeout hooks with session lifecycle management
 * - **Outcome:** Comprehensive session control with proper state transitions
 */