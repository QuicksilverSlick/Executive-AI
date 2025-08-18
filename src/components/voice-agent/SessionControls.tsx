/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Session control UI component with elegant controls and state indicators
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-dev-20250817-001
 * @init-timestamp: 2025-08-17T21:45:00Z
 * @reasoning:
 * - **Objective:** Create elegant session control UI for voice assistant
 * - **Strategy:** Clean controls with smooth animations and accessibility
 * - **Outcome:** Professional session management interface
 */

import React from 'react';
import { Play, Pause, Square, Loader2 } from 'lucide-react';
import type { SessionControls } from './hooks/useSessionState';

interface SessionControlsProps {
  /** Session controls and state from useSessionState hook */
  session: SessionControls;
  /** Whether voice is currently active */
  isVoiceActive: boolean;
  /** Theme for styling */
  theme?: 'auto' | 'light' | 'dark' | 'rainbow';
  /** Accessibility mode */
  accessibilityMode?: 'standard' | 'enhanced' | 'high-contrast';
  /** Callback for session end */
  onSessionEnd?: () => void;
  /** Show timeout warning */
  showTimeoutWarning?: boolean;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  session,
  isVoiceActive,
  theme = 'auto',
  accessibilityMode = 'standard',
  onSessionEnd,
  showTimeoutWarning = false
}) => {
  const { state, timer, timeout, actions } = session;

  const handleEndSession = () => {
    actions.end();
    onSessionEnd?.();
  };

  const handlePauseResume = () => {
    if (state === 'active') {
      actions.pause();
    } else if (state === 'paused') {
      actions.resume();
    }
  };

  // Don't show controls if session hasn't started or has ended
  if (state === 'idle' || state === 'ended') {
    return null;
  }

  const isPaused = state === 'paused';
  const isEnding = state === 'ending';

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-brand-navy/10 dark:bg-dark-gold/10 backdrop-blur-sm border border-brand-navy/20 dark:border-dark-gold/20 transition-all duration-300">
      {/* Session Status & Timer */}
      <div className="flex items-center space-x-3">
        {/* Status Indicator */}
        <div className="relative flex items-center">
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
            isEnding ? 'bg-voice-error animate-pulse' :
            isPaused ? 'bg-yellow-500' :
            isVoiceActive ? 'bg-voice-connected animate-pulse' :
            'bg-voice-processing animate-pulse'
          }`} />
          {isVoiceActive && (
            <div className="absolute inset-0 rounded-full border-2 border-voice-connected/50 animate-ping" />
          )}
        </div>

        {/* Session Info */}
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium transition-colors duration-200 ${
              accessibilityMode === 'high-contrast' 
                ? 'text-black dark:text-white' 
                : 'text-brand-charcoal dark:text-dark-text'
            }`}>
              {isEnding ? 'Ending...' :
               isPaused ? 'Paused' :
               isVoiceActive ? 'Voice Active' :
               'Session Active'}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full transition-colors duration-200 ${
              isPaused ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
              'bg-voice-connected/20 text-voice-connected'
            }`}>
              {timer.formattedDuration}
            </span>
          </div>

          {/* Timeout Warning */}
          {showTimeoutWarning && timeout.showWarning && (
            <div className="text-xs text-voice-error animate-pulse mt-1">
              Session timeout in {Math.ceil(timeout.timeRemaining / 1000)}s
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-2">
        {/* Pause/Resume Button */}
        <button
          onClick={handlePauseResume}
          disabled={isEnding}
          className={`
            p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/50
            ${isEnding 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-brand-navy/20 dark:hover:bg-dark-gold/20'
            }
            ${accessibilityMode === 'high-contrast' ? 'border-2 border-gray-400' : ''}
          `}
          aria-label={isPaused ? 'Resume session' : 'Pause session'}
          title={isPaused ? 'Resume session (Space)' : 'Pause session (Space)'}
        >
          {isPaused ? (
            <Play className="w-4 h-4 text-brand-charcoal dark:text-dark-text" />
          ) : (
            <Pause className="w-4 h-4 text-brand-charcoal dark:text-dark-text" />
          )}
        </button>

        {/* End Session Button */}
        <button
          onClick={handleEndSession}
          disabled={isEnding}
          className={`
            p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-voice-error/50
            ${isEnding 
              ? 'opacity-50 cursor-not-allowed animate-pulse' 
              : 'hover:bg-voice-error/20 text-voice-error hover:text-voice-error'
            }
            ${accessibilityMode === 'high-contrast' ? 'border-2 border-red-400' : ''}
          `}
          aria-label="End session"
          title="End session (Escape)"
        >
          {isEnding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-dev-20250817-001
 * @timestamp: 2025-08-17T21:45:00Z
 * @reasoning:
 * - **Objective:** Initial implementation of session controls UI
 * - **Strategy:** Clean, accessible controls with smooth animations
 * - **Outcome:** Professional session management interface with proper states
 */