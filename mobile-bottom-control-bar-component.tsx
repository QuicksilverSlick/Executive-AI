/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Mobile-first bottom control bar component for voice assistant
 * @version: 1.0.0
 * @init-author: planner-agent
 * @init-cc-sessionId: cc-plan-20250817-mobile-ui
 * @init-timestamp: 2025-08-17T18:45:00Z
 * @reasoning:
 * - **Objective:** Create fixed bottom control bar that never gets hidden on mobile
 * - **Strategy:** Progressive disclosure with always-visible CTA and voice controls
 * - **Outcome:** Mobile-optimized component with touch gestures and accessibility
 */

import React, { useState, useCallback, useEffect } from 'react';
import { VoiceStatus, VoiceMessage } from '../types';

interface MobileBottomControlBarProps {
  // Voice state
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  isMuted: boolean;
  connectionState: 'connected' | 'connecting' | 'disconnected';
  
  // Control handlers
  onVoiceToggle: () => void;
  onCTAClick: () => void;
  onExpandToggle: () => void;
  
  // UI state
  isTranscriptExpanded: boolean;
  messageCount: number;
  
  // Configuration
  ctaText?: string;
  enableHapticFeedback?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

const MobileBottomControlBar: React.FC<MobileBottomControlBarProps> = ({
  isListening,
  isSpeaking,
  isThinking,
  isMuted,
  connectionState,
  onVoiceToggle,
  onCTAClick,
  onExpandToggle,
  isTranscriptExpanded,
  messageCount,
  ctaText = "Book Discovery Call",
  enableHapticFeedback = true,
  theme = 'auto'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Auto-hide on scroll (optional behavior)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      
      // Only hide if scrolling down significantly and not in an active voice session
      if (isScrollingDown && currentScrollY > 100 && !isListening && !isSpeaking) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    // For now, always keep visible - scroll hiding is optional
    // window.addEventListener('scroll', handleScroll, { passive: true });
    // return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isListening, isSpeaking]);

  // Haptic feedback
  const triggerHapticFeedback = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHapticFeedback || !navigator.vibrate) return;
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30, 10, 30]
    };
    
    navigator.vibrate(patterns[intensity]);
  }, [enableHapticFeedback]);

  // Voice button state
  const getVoiceButtonState = () => {
    if (isMuted) return 'muted';
    if (connectionState !== 'connected') return 'disconnected';
    if (isListening) return 'listening';
    if (isSpeaking) return 'speaking';
    if (isThinking) return 'thinking';
    return 'idle';
  };

  const voiceButtonState = getVoiceButtonState();

  // Voice button click handler
  const handleVoiceClick = useCallback(() => {
    triggerHapticFeedback('medium');
    onVoiceToggle();
  }, [onVoiceToggle, triggerHapticFeedback]);

  // CTA button click handler
  const handleCTAClick = useCallback(() => {
    triggerHapticFeedback('light');
    onCTAClick();
  }, [onCTAClick, triggerHapticFeedback]);

  // Expand toggle handler
  const handleExpandClick = useCallback(() => {
    triggerHapticFeedback('light');
    onExpandToggle();
  }, [onExpandToggle, triggerHapticFeedback]);

  const voiceButtonClasses = {
    base: `
      relative w-14 h-14 rounded-full transition-all duration-300 transform-gpu
      focus:outline-none focus:ring-4 focus:ring-brand-gold/30
      flex items-center justify-center shadow-lg
    `,
    muted: 'bg-gray-400 cursor-not-allowed',
    disconnected: 'bg-gray-500 cursor-not-allowed animate-pulse',
    listening: 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse scale-110 shadow-red-500/30',
    speaking: 'bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse scale-105 shadow-blue-500/30',
    thinking: 'bg-gradient-to-r from-yellow-500 to-yellow-600 animate-bounce shadow-yellow-500/30',
    idle: 'bg-gradient-to-r from-brand-navy to-brand-gold hover:scale-105 shadow-brand-gold/30'
  };

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-[1002] transition-transform duration-300
      ${isVisible ? 'translate-y-0' : 'translate-y-full'}
    `}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-brand-pearl/95 dark:bg-dark-surface/95 backdrop-blur-xl border-t border-brand-navy/10 dark:border-dark-gold/10" />
      
      {/* Content */}
      <div className="relative flex items-center justify-between px-5 py-3" style={{
        paddingBottom: `max(12px, env(safe-area-inset-bottom, 12px))`
      }}>
        
        {/* Left: Expand Toggle */}
        <button
          onClick={handleExpandClick}
          className="
            flex items-center justify-center w-11 h-11 rounded-full
            bg-brand-navy/10 dark:bg-dark-gold/10 hover:bg-brand-navy/20 dark:hover:bg-dark-gold/20
            transition-colors duration-200 touch-manipulation
            focus:outline-none focus:ring-2 focus:ring-brand-gold/50
          "
          aria-label={isTranscriptExpanded ? 'Hide transcript' : 'Show transcript'}
        >
          <svg 
            className={`w-5 h-5 text-brand-charcoal dark:text-dark-text transition-transform duration-200 ${
              isTranscriptExpanded ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M5 15l7-7 7 7" 
            />
          </svg>
          
          {/* Message count indicator */}
          {messageCount > 0 && !isTranscriptExpanded && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-gold text-white text-xs rounded-full flex items-center justify-center font-medium">
              {messageCount > 9 ? '9+' : messageCount}
            </div>
          )}
        </button>

        {/* Center: Voice Button */}
        <button
          onClick={handleVoiceClick}
          disabled={isMuted || connectionState !== 'connected'}
          className={`${voiceButtonClasses.base} ${voiceButtonClasses[voiceButtonState]}`}
          aria-label={
            isMuted ? 'Microphone muted' :
            connectionState !== 'connected' ? 'Not connected' :
            isListening ? 'Stop recording' : 'Start recording'
          }
          title={
            isMuted ? 'Unmute to start recording' :
            connectionState !== 'connected' ? 'Waiting for connection...' :
            isListening ? 'Tap to stop recording' : 'Tap to start recording'
          }
        >
          {/* Connection status indicator */}
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
            connectionState === 'connected' ? 'bg-green-500' : 
            connectionState === 'connecting' ? 'bg-yellow-500 animate-pulse' :
            'bg-red-500'
          }`} />

          {/* Voice icon */}
          {isListening ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 10v2a7 7 0 01-14 0v-2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19v4" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 23h8" />
            </svg>
          )}

          {/* Animated rings for active states */}
          {(isListening || isSpeaking) && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping" />
              <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" style={{ animationDelay: '0.5s' }} />
            </>
          )}
        </button>

        {/* Right: CTA Button */}
        <button
          onClick={handleCTAClick}
          className="
            px-4 py-2.5 bg-gradient-to-r from-brand-navy to-brand-gold text-white
            font-semibold text-sm rounded-full shadow-lg
            hover:shadow-xl hover:scale-105 active:scale-95
            transition-all duration-200 transform-gpu touch-manipulation
            focus:outline-none focus:ring-4 focus:ring-brand-gold/30
            min-w-[120px] text-center
          "
          aria-label="Book discovery call"
        >
          {ctaText}
        </button>
      </div>
    </div>
  );
};

export default MobileBottomControlBar;