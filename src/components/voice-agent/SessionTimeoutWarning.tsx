/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Visual session timeout warning component with countdown and extension options
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-dev-20250818-timeout
 * @init-timestamp: 2025-08-18T20:30:00Z
 * @reasoning:
 * - **Objective:** Implement comprehensive timeout warning UI to prevent runaway API costs
 * - **Strategy:** Visual countdown with audio warnings and one-click session extension
 * - **Outcome:** User-friendly timeout management with clear messaging and easy extension
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Clock, RotateCcw, X } from 'lucide-react';

export interface SessionTimeoutWarningProps {
  /** Whether the warning should be shown */
  isVisible: boolean;
  /** Time remaining in milliseconds */
  timeRemaining: number;
  /** Callback when user extends the session */
  onExtendSession: () => void;
  /** Callback when user dismisses the warning (extends session) */
  onDismiss: () => void;
  /** Callback when timeout reaches zero */
  onTimeout: () => void;
  /** Whether to play audio warnings */
  enableAudio?: boolean;
  /** Theme for styling */
  theme?: 'auto' | 'light' | 'dark';
  /** Custom extension duration in minutes */
  extensionMinutes?: number;
}

const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  isVisible,
  timeRemaining,
  onExtendSession,
  onDismiss,
  onTimeout,
  enableAudio = true,
  theme = 'auto',
  extensionMinutes = 5
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Format time remaining
  const formatTimeRemaining = useCallback((ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Get urgency level based on time remaining
  const getUrgencyLevel = useCallback((ms: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (ms <= 10000) return 'critical'; // Less than 10 seconds
    if (ms <= 30000) return 'high'; // Less than 30 seconds
    if (ms <= 60000) return 'medium'; // Less than 1 minute
    return 'low';
  }, []);

  const urgency = getUrgencyLevel(timeRemaining);

  // Play audio warning based on urgency
  useEffect(() => {
    if (!enableAudio || !isVisible || audioPlayed) return;

    const playAudioWarning = () => {
      // Use different audio tones based on urgency
      const frequencies = {
        low: 600,
        medium: 800,
        high: 1000,
        critical: 1200
      };

      const frequency = frequencies[urgency];
      const duration = urgency === 'critical' ? 500 : 300;

      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);

        setAudioPlayed(true);
      } catch (error) {
        console.warn('[SessionTimeout] Audio warning failed:', error);
      }
    };

    playAudioWarning();
  }, [enableAudio, isVisible, urgency, audioPlayed]);

  // Reset audio played when urgency changes
  useEffect(() => {
    setAudioPlayed(false);
  }, [urgency]);

  // Handle extend session
  const handleExtend = useCallback(() => {
    setIsDismissed(true);
    setIsAnimating(true);
    onExtendSession();
    
    // Hide with animation
    setTimeout(() => {
      onDismiss();
      setIsAnimating(false);
      setIsDismissed(false);
    }, 300);
  }, [onExtendSession, onDismiss]);

  // Handle dismiss (same as extend)
  const handleDismiss = useCallback(() => {
    handleExtend();
  }, [handleExtend]);

  // Handle timeout
  useEffect(() => {
    if (timeRemaining <= 0 && isVisible) {
      onTimeout();
    }
  }, [timeRemaining, isVisible, onTimeout]);

  // Animation classes based on urgency
  const getAnimationClasses = () => {
    switch (urgency) {
      case 'critical':
        return 'animate-pulse bg-red-500/90 border-red-400';
      case 'high':
        return 'animate-pulse bg-orange-500/90 border-orange-400';
      case 'medium':
        return 'bg-yellow-500/90 border-yellow-400';
      default:
        return 'bg-blue-500/90 border-blue-400';
    }
  };

  // Text color based on urgency
  const getTextColor = () => {
    switch (urgency) {
      case 'critical':
      case 'high':
        return 'text-white';
      case 'medium':
        return 'text-gray-900';
      default:
        return 'text-white';
    }
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999]
        transition-all duration-300 transform-gpu
        ${isAnimating ? 'opacity-0 scale-95 translate-y-[-10px]' : 'opacity-100 scale-100 translate-y-0'}
      `}
      role="alert"
      aria-live="assertive"
    >
      {/* Warning Banner */}
      <div
        className={`
          rounded-xl shadow-2xl border-2 p-4 min-w-[300px] max-w-md mx-auto
          backdrop-blur-sm transition-all duration-300
          ${getAnimationClasses()}
          ${getTextColor()}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className={`w-5 h-5 ${urgency === 'critical' ? 'animate-bounce' : ''}`} />
            <h3 className="font-semibold">Session Timeout Warning</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded hover:bg-black/20 transition-colors"
            aria-label="Extend session and dismiss warning"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Countdown Display */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock className={`w-6 h-6 ${urgency === 'critical' ? 'animate-spin' : ''}`} />
            <div className="text-2xl font-mono font-bold">
              {formatTimeRemaining(timeRemaining)}
            </div>
          </div>
          <p className="text-sm opacity-90">
            {urgency === 'critical' 
              ? 'Session ending now!' 
              : urgency === 'high' 
                ? 'Session ending very soon' 
                : 'Your session will end soon to prevent runaway costs'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleExtend}
            className={`
              w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
              flex items-center justify-center space-x-2
              ${urgency === 'critical' || urgency === 'high' 
                ? 'bg-white text-gray-900 hover:bg-gray-100' 
                : 'bg-white/20 hover:bg-white/30 text-current'
              }
              transform hover:scale-[1.02] active:scale-[0.98]
            `}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Extend Session ({extensionMinutes} more minutes)</span>
          </button>
          
          {/* Info text */}
          <p className="text-xs text-center opacity-75 leading-relaxed">
            Sessions are automatically ended to prevent unexpected API costs. 
            Click to extend for {extensionMinutes} more minutes.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="w-full bg-black/20 rounded-full h-2">
            <div
              className={`
                h-2 rounded-full transition-all duration-1000 ease-out
                ${urgency === 'critical' 
                  ? 'bg-red-300' 
                  : urgency === 'high' 
                    ? 'bg-orange-300' 
                    : urgency === 'medium' 
                      ? 'bg-yellow-300' 
                      : 'bg-blue-300'
                }
              `}
              style={{
                width: `${Math.max(0, Math.min(100, (timeRemaining / (5 * 60 * 1000)) * 100))}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Backdrop overlay for mobile */}
      {urgency === 'critical' && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm -z-10"
          onClick={handleDismiss}
        />
      )}
    </div>
  );
};

export default SessionTimeoutWarning;

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-dev-20250818-timeout
 * @timestamp: 2025-08-18T20:30:00Z
 * @reasoning:
 * - **Objective:** Create comprehensive timeout warning UI component
 * - **Strategy:** Multi-level urgency system with visual/audio warnings and easy session extension
 * - **Outcome:** User-friendly timeout prevention with clear messaging and smooth UX
 */