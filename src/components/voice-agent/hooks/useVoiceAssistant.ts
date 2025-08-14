/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Main voice assistant React hook with speech recognition and synthesis
 * @version: 1.0.0
 * @init-author: real-time-ui-agent
 * @init-cc-sessionId: cc-ui-20250801-001
 * @init-timestamp: 2025-08-01T04:26:00Z
 * @reasoning:
 * - **Objective:** Core voice assistant functionality as a React hook
 * - **Strategy:** Modern hooks pattern with proper state management and error handling
 * - **Outcome:** Reusable hook for voice assistant features across components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  VoiceStatus,
  VoiceMessage,
  VoiceAssistantConfig,
  VoiceAssistantError,
  VoiceAssistantEvents,
  UseVoiceAssistantReturn,
  DEFAULT_CONFIG,
  VOICE_ERRORS,
  STATUS_MESSAGES
} from '../types';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useVoiceAssistant = (
  config: Partial<VoiceAssistantConfig> = {},
  events: VoiceAssistantEvents = {}
): UseVoiceAssistantReturn => {
  // Merge config with defaults
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  // State
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVoiceActivationEnabled, setIsVoiceActivationEnabled] = useState(false);
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [statusText, setStatusText] = useState(STATUS_MESSAGES.idle);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [sessionId] = useState(() => generateSessionId());
  const [error, setError] = useState<VoiceAssistantError | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Refs
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize speech APIs
  useEffect(() => {
    const initializeSpeechAPIs = async () => {
      try {
        // Check for Speech Recognition support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = fullConfig.speechConfig?.continuous || false;
          recognition.interimResults = fullConfig.speechConfig?.interimResults || true;
          recognition.lang = fullConfig.speechConfig?.language || 'en-US';
          recognition.maxAlternatives = fullConfig.speechConfig?.maxAlternatives || 1;

          // Set up event handlers
          recognition.onstart = handleRecognitionStart;
          recognition.onresult = handleRecognitionResult;
          recognition.onerror = handleRecognitionError;
          recognition.onend = handleRecognitionEnd;

          recognitionRef.current = recognition;
        }

        // Check for Speech Synthesis support
        if ('speechSynthesis' in window) {
          synthesisRef.current = window.speechSynthesis;
        }

        // Check microphone permission
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setHasPermission(true);
          stream.getTracks().forEach(track => track.stop());
        } catch (permissionError) {
          setHasPermission(false);
        }

        setIsSupported(!!SpeechRecognition);
        isInitializedRef.current = true;

      } catch (initError) {
        console.error('Failed to initialize speech APIs:', initError);
        setError({
          code: VOICE_ERRORS.SPEECH_RECOGNITION_NOT_SUPPORTED,
          message: 'Speech recognition is not supported in this browser',
          type: 'speech',
          recoverable: false
        });
      }
    };

    if (!isInitializedRef.current) {
      initializeSpeechAPIs();
    }
  }, [fullConfig.speechConfig]);

  // Update status and notify
  const updateStatus = useCallback((newStatus: VoiceStatus, newStatusText?: string) => {
    setStatus(newStatus);
    const text = newStatusText || STATUS_MESSAGES[newStatus];
    setStatusText(text);
    events.onStatusChange?.(newStatus);
  }, [events]);

  // Handle recognition events
  const handleRecognitionStart = useCallback(() => {
    setIsListening(true);
    updateStatus('listening');
  }, [updateStatus]);

  const handleRecognitionResult = useCallback((event: SpeechRecognitionEvent) => {
    let transcript = '';
    let confidence = 0;

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      transcript += result[0].transcript;
      confidence = result[0].confidence || 0;
    }

    if (event.results[event.resultIndex].isFinal) {
      // Final result - process the message
      if (transcript.trim()) {
        const message: VoiceMessage = {
          id: generateId(),
          type: 'user',
          content: transcript.trim(),
          timestamp: new Date().toISOString(),
          metadata: { confidence }
        };
        
        addMessage(message);
        processUserMessage(transcript.trim());
      }
    } else {
      // Interim result - update status
      updateStatus('listening', `Listening: "${transcript}"`);
    }
  }, [updateStatus]);

  const handleRecognitionError = useCallback((event: SpeechRecognitionErrorEvent) => {
    console.error('Speech recognition error:', event.error);
    
    const errorMap: Record<string, VoiceAssistantError> = {
      'no-speech': {
        code: 'NO_SPEECH',
        message: 'No speech was detected',
        type: 'speech',
        recoverable: true
      },
      'audio-capture': {
        code: VOICE_ERRORS.AUDIO_CAPTURE_FAILED,
        message: 'Audio capture failed',
        type: 'audio',
        recoverable: true
      },
      'not-allowed': {
        code: VOICE_ERRORS.PERMISSION_DENIED,
        message: 'Microphone permission denied',
        type: 'permission',
        recoverable: false
      },
      'network': {
        code: VOICE_ERRORS.NETWORK_ERROR,
        message: 'Network error occurred',
        type: 'network',
        recoverable: true
      }
    };

    const voiceError = errorMap[event.error] || {
      code: 'UNKNOWN_ERROR',
      message: event.message || 'Unknown speech recognition error',
      type: 'unknown',
      recoverable: true
    };

    setError(voiceError);
    events.onError?.(voiceError);
    updateStatus('error');
    
    setIsListening(false);
  }, [updateStatus, events]);

  const handleRecognitionEnd = useCallback(() => {
    setIsListening(false);
    if (status === 'listening') {
      updateStatus('idle');
    }
  }, [status, updateStatus]);

  // Message handling
  const addMessage = useCallback((message: VoiceMessage) => {
    setMessages(prev => {
      const updated = [...prev, message];
      // Keep only last 50 messages
      return updated.slice(-50);
    });
    events.onMessage?.(message);
  }, [events]);

  const processUserMessage = useCallback(async (content: string) => {
    setIsThinking(true);
    updateStatus('thinking');

    try {
      const response = await fetch(fullConfig.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId
        },
        body: JSON.stringify({
          message: content,
          sessionId,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: VoiceMessage = {
        id: generateId(),
        type: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        metadata: data.metadata
      };

      addMessage(assistantMessage);

      // Speak the response if synthesis is available and not muted
      if (synthesisRef.current && !isMuted) {
        speakMessage(data.message);
      } else {
        updateStatus('idle');
      }

    } catch (apiError) {
      console.error('API error:', apiError);
      
      const voiceError: VoiceAssistantError = {
        code: VOICE_ERRORS.API_ERROR,
        message: 'Failed to get response from assistant',
        type: 'api',
        recoverable: true,
        details: apiError
      };

      setError(voiceError);
      events.onError?.(voiceError);
      updateStatus('error');
      
      // Add error message
      const errorMessage: VoiceMessage = {
        id: generateId(),
        type: 'system',
        content: 'Sorry, I\'m having trouble connecting. Please try again.',
        timestamp: new Date().toISOString()
      };
      addMessage(errorMessage);
    } finally {
      setIsThinking(false);
    }
  }, [fullConfig.apiEndpoint, sessionId, isMuted, updateStatus, addMessage, events]);

  // Speech synthesis
  const speakMessage = useCallback((text: string) => {
    if (!synthesisRef.current || isMuted) return;

    setIsSpeaking(true);
    updateStatus('speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = fullConfig.synthConfig?.rate || 0.9;
    utterance.pitch = fullConfig.synthConfig?.pitch || 1.0;
    utterance.volume = fullConfig.synthConfig?.volume || 0.8;

    if (fullConfig.synthConfig?.voice) {
      utterance.voice = fullConfig.synthConfig.voice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      updateStatus('idle');
    };

    utterance.onerror = (synthError) => {
      console.error('Speech synthesis error:', synthError);
      setIsSpeaking(false);
      updateStatus('idle');
    };

    synthesisRef.current.speak(utterance);
  }, [isMuted, fullConfig.synthConfig, updateStatus]);

  // Public API
  const startListening = useCallback(async () => {
    if (!recognitionRef.current || isListening || isMuted) return;
    
    try {
      // Request microphone permission if not already granted
      if (!hasPermission) {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
          audio: fullConfig.audioConfig 
        });
        setHasPermission(true);
      }

      recognitionRef.current.start();
    } catch (startError) {
      console.error('Failed to start listening:', startError);
      
      const voiceError: VoiceAssistantError = {
        code: VOICE_ERRORS.AUDIO_CAPTURE_FAILED,
        message: 'Failed to access microphone',
        type: 'permission',
        recoverable: false,
        details: startError
      };

      setError(voiceError);
      events.onError?.(voiceError);
      updateStatus('error');
    }
  }, [isListening, isMuted, hasPermission, fullConfig.audioConfig, updateStatus, events]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  }, [isListening]);

  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Stop listening if muting
    if (newMutedState && isListening) {
      stopListening();
    }
    
    // Stop speaking if muting
    if (newMutedState && isSpeaking && synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
      updateStatus('idle');
    }
  }, [isMuted, isListening, isSpeaking, stopListening, updateStatus]);

  const toggleVoiceActivation = useCallback(() => {
    setIsVoiceActivationEnabled(prev => !prev);
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    const userMessage: VoiceMessage = {
      id: generateId(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    addMessage(userMessage);
    await processUserMessage(message);
  }, [addMessage, processUserMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const resetSession = useCallback(() => {
    stopListening();
    clearMessages();
    setError(null);
    updateStatus('idle');
    
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    
    setIsSpeaking(false);
    setIsThinking(false);
  }, [stopListening, clearMessages, updateStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, [stopListening]);

  return {
    // State
    isListening,
    isThinking,
    isSpeaking,
    isMuted,
    isVoiceActivationEnabled,
    status,
    statusText,
    messages,
    sessionId,
    
    // Actions
    startListening,
    stopListening,
    toggleMute,
    toggleVoiceActivation,
    sendMessage,
    clearMessages,
    resetSession,
    
    // Utilities
    isSupported,
    hasPermission,
    error
  };
};

// Utility functions
const generateSessionId = (): string => {
  return 'va-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

const generateId = (): string => {
  return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};