/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Simple integration wrapper for adding audio feedback to existing voice agents
 * @version: 1.0.0
 * @init-author: real-time-ui-agent
 * @init-cc-sessionId: cc-unknown-20250808-354
 * @init-timestamp: 2025-08-08T16:45:00Z
 * @reasoning:
 * - **Objective:** Easy-to-integrate audio feedback for existing voice agent implementations
 * - **Strategy:** Lightweight wrapper that monitors voice agent events and provides audio feedback
 * - **Outcome:** Drop-in audio enhancement for current voice agent pages
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import VoiceAgentAudioFeedback, { AudioState } from './VoiceAgentAudioFeedback';

interface VoiceAgentAudioIntegrationProps {
  /** Whether to show the audio feedback UI */
  visible?: boolean;
  /** Position on screen */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Custom CSS class */
  className?: string;
  /** Whether to show debug info */
  showDebugInfo?: boolean;
  /** Whether to enable audio cues */
  enableAudioCues?: boolean;
  /** Event listeners for voice agent state changes */
  onStateChange?: (state: AudioState) => void;
}

export const VoiceAgentAudioIntegration: React.FC<VoiceAgentAudioIntegrationProps> = ({
  visible = true,
  position = 'bottom-left',
  className = '',
  showDebugInfo = false,
  enableAudioCues = true,
  onStateChange,
}) => {
  // Audio state
  const [audioState, setAudioState] = useState<AudioState>({
    isListening: false,
    isProcessing: false,
    isResponding: false,
    volume: 0.7,
    isMuted: false,
    error: null,
    audioLevel: 0.0,
  });

  // Audio management
  const audioFiles = useRef<Record<string, HTMLAudioElement>>({});
  const isInitialized = useRef(false);

  // Initialize audio files
  useEffect(() => {
    if (!enableAudioCues || isInitialized.current) return;

    const initAudio = () => {
      const sounds = {
        start: '/audio/search-start.webm',
        processing: '/audio/processing-loop.webm',
        complete: '/audio/search-complete.webm',
        error: '/audio/search-error.webm',
      };

      Object.entries(sounds).forEach(([key, url]) => {
        try {
          const audio = new Audio();
          audio.preload = 'metadata';
          audio.volume = audioState.volume;
          audio.src = url;
          audioFiles.current[key] = audio;
        } catch (error) {
          console.warn(`Failed to initialize audio file ${key}:`, error);
        }
      });

      isInitialized.current = true;
    };

    // Delay initialization to allow page to load
    const timer = setTimeout(initAudio, 1000);
    return () => clearTimeout(timer);
  }, [enableAudioCues, audioState.volume]);

  // Listen for voice agent events from the global window
  useEffect(() => {
    const handleVoiceAgentEvent = (event: CustomEvent) => {
      const { type, data } = event.detail;
      
      switch (type) {
        case 'listening-start':
          setAudioState(prev => ({ 
            ...prev, 
            isListening: true, 
            isProcessing: false, 
            isResponding: false,
            error: null 
          }));
          playAudio('start');
          break;
          
        case 'listening-stop':
          setAudioState(prev => ({ 
            ...prev, 
            isListening: false, 
            isProcessing: true 
          }));
          playAudio('processing');
          break;
          
        case 'processing-start':
          setAudioState(prev => ({ 
            ...prev, 
            isProcessing: true,
            isListening: false,
            isResponding: false
          }));
          break;
          
        case 'response-start':
          setAudioState(prev => ({ 
            ...prev, 
            isProcessing: false,
            isResponding: true,
            isListening: false
          }));
          stopAudio('processing');
          break;
          
        case 'response-complete':
          setAudioState(prev => ({ 
            ...prev, 
            isResponding: false,
            isProcessing: false,
            isListening: false
          }));
          playAudio('complete');
          break;
          
        case 'error':
          setAudioState(prev => ({ 
            ...prev, 
            error: data?.message || 'Voice agent error',
            isListening: false,
            isProcessing: false,
            isResponding: false
          }));
          stopAudio('processing');
          playAudio('error');
          break;
          
        case 'audio-level':
          if (typeof data?.level === 'number') {
            setAudioState(prev => ({ 
              ...prev, 
              audioLevel: Math.max(0, Math.min(1, data.level)) 
            }));
          }
          break;
          
        case 'reset':
        case 'idle':
          setAudioState(prev => ({ 
            ...prev, 
            isListening: false,
            isProcessing: false,
            isResponding: false,
            audioLevel: 0,
            error: null
          }));
          stopAllAudio();
          break;
      }
    };

    // Listen for voice agent events
    window.addEventListener('voice-agent-event', handleVoiceAgentEvent as EventListener);
    
    // Also listen for specific event types that might be dispatched separately
    const events = [
      'voice-agent-listening-start',
      'voice-agent-listening-stop', 
      'voice-agent-processing-start',
      'voice-agent-response-start',
      'voice-agent-response-complete',
      'voice-agent-error',
      'voice-agent-audio-level',
      'voice-agent-reset'
    ];

    const handleSpecificEvent = (event: CustomEvent) => {
      handleVoiceAgentEvent({
        detail: {
          type: event.type.replace('voice-agent-', ''),
          data: event.detail
        }
      } as CustomEvent);
    };

    events.forEach(eventName => {
      window.addEventListener(eventName, handleSpecificEvent as EventListener);
    });

    return () => {
      window.removeEventListener('voice-agent-event', handleVoiceAgentEvent as EventListener);
      events.forEach(eventName => {
        window.removeEventListener(eventName, handleSpecificEvent as EventListener);
      });
    };
  }, []);

  // Notify parent component of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(audioState);
    }
  }, [audioState, onStateChange]);

  // Update audio volumes
  useEffect(() => {
    Object.values(audioFiles.current).forEach(audio => {
      audio.volume = audioState.isMuted ? 0 : audioState.volume;
    });
  }, [audioState.volume, audioState.isMuted]);

  // Audio playback functions
  const playAudio = useCallback((type: string) => {
    if (!enableAudioCues) return;
    
    const audio = audioFiles.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.warn(`Failed to play ${type} audio:`, error);
      });
    }
  }, [enableAudioCues]);

  const stopAudio = useCallback((type: string) => {
    const audio = audioFiles.current[type];
    if (audio && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const stopAllAudio = useCallback(() => {
    Object.values(audioFiles.current).forEach(audio => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }, []);

  // Handle volume changes
  const handleVolumeChange = useCallback((volume: number) => {
    setAudioState(prev => ({ ...prev, volume }));
  }, []);

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    setAudioState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  // Handle test sound playback
  const handlePlayTestSound = useCallback((soundType: 'start' | 'processing' | 'complete' | 'error') => {
    playAudio(soundType);
  }, [playAudio]);

  // Get position classes
  const getPositionClasses = () => {
    const positions = {
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
    };
    return positions[position] || positions['bottom-left'];
  };

  if (!visible) {
    return null;
  }

  return (
    <div 
      className={`voice-agent-audio-integration fixed z-50 ${getPositionClasses()} ${className}`}
      role="complementary"
      aria-label="Voice agent audio feedback"
    >
      <VoiceAgentAudioFeedback
        audioState={audioState}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={handleMuteToggle}
        onPlayTestSound={handlePlayTestSound}
        showDebugInfo={showDebugInfo}
        className="integration-feedback"
      />
    </div>
  );
};

// Utility function to dispatch voice agent events
export const dispatchVoiceAgentEvent = (
  type: string, 
  data?: any
) => {
  const event = new CustomEvent('voice-agent-event', {
    detail: { type, data }
  });
  window.dispatchEvent(event);
  
  // Also dispatch specific event for backwards compatibility
  const specificEvent = new CustomEvent(`voice-agent-${type}`, {
    detail: data
  });
  window.dispatchEvent(specificEvent);
};

export default VoiceAgentAudioIntegration;