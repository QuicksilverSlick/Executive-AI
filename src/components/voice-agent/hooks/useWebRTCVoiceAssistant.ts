/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: React hook for WebRTC-based voice assistant using OpenAI Realtime API
 * @version: 1.1.0
 * @init-author: engineer-agent
 * @init-cc-sessionId: cc-eng-20250801-003  
 * @init-timestamp: 2025-08-01T15:00:00Z
 * @reasoning:
 * - **Objective:** Integrate WebRTC voice agent with React components
 * - **Strategy:** Create a clean hook interface for the WebRTC implementation
 * - **Outcome:** Seamless voice assistant experience with WebRTC
 */

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.1.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250803-812
 * @timestamp: 2025-08-03T22:06:00Z
 * @reasoning:
 * - **Objective:** Fix duplicate React keys error in message rendering
 * - **Strategy:** Implement unique key generation with counter and timestamp
 * - **Outcome:** Eliminated duplicate key errors by ensuring uniqueness across rapid message generation
 * 
 * CRITICAL FIXES APPLIED:
 * - FIXED: Duplicate React keys error by adding messageIdCounter to generateId()
 * - IMPROVED: Key generation now uses timestamp + counter + random string for guaranteed uniqueness
 * - ENSURED: No duplicate keys even when multiple messages are generated in rapid succession
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { createWebRTCVoiceAgent, WebRTCVoiceAgent } from '../../../lib/voice-agent/webrtc/main';
import { sessionPersistence, VoicePreferencesManager } from '../../../lib/voice-agent/session-persistence';
import type { 
  VoiceStatus, 
  VoiceMessage, 
  VoiceAssistantConfig,
  VoiceAssistantError,
  VoiceAssistantEvents,
  UseVoiceAssistantReturn
} from '../types';
import type { ConnectionState, ConversationState, ErrorInfo } from '../../../features/voice-agent/types';

export const useWebRTCVoiceAssistant = (
  config: Partial<VoiceAssistantConfig> = {},
  events: VoiceAssistantEvents = {},
  onActivityReset?: () => void // New parameter for activity tracking
): UseVoiceAssistantReturn & { 
  sessionStats: any;
  isSessionRestored: boolean;
} => {
  // State
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVoiceActivationEnabled, setIsVoiceActivationEnabled] = useState(false);
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [statusText, setStatusText] = useState('Ready to assist');
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [sessionId, setSessionId] = useState(() => generateSessionId());
  const [error, setError] = useState<VoiceAssistantError | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const [isSessionRestored, setIsSessionRestored] = useState(false);
  const [sessionStats, setSessionStats] = useState<any>({
    isActive: false,
    sessionId: null,
    messageCount: 0,
    duration: 0,
    reconnectAttempts: 0,
    tokenExpiresIn: 0
  });

  // Refs
  const voiceAgentRef = useRef<WebRTCVoiceAgent | null>(null);
  const isInitializedRef = useRef(false);
  const isInitializingRef = useRef(false);
  const initializationAttempts = useRef(0);
  const userTranscriptBuffer = useRef<string>('');
  const assistantTranscriptBuffer = useRef<string>('');

  // Initialize session - removed old session restoration logic
  // The enhanced session manager in WebRTCVoiceAgent will handle restoration
  useEffect(() => {
    setIsSessionLoaded(true);
    console.log('[WebRTC Hook] Session management delegated to WebRTCVoiceAgent');
  }, []);

  // Update session statistics periodically
  useEffect(() => {
    const updateStats = () => {
      if (voiceAgentRef.current) {
        const stats = voiceAgentRef.current.getSessionStats();
        setSessionStats(stats);
      }
    };

    const interval = setInterval(updateStats, 5000); // Update every 5 seconds
    updateStats(); // Initial update

    return () => clearInterval(interval);
  }, [isConnected]);

  // Initialize WebRTC Voice Agent (wait for session to load first)
  useEffect(() => {
    const initializeVoiceAgent = async () => {
      // Wait for session to be loaded first
      if (!isSessionLoaded) {
        console.log('[WebRTC Hook] Waiting for session to load before initializing voice agent');
        return;
      }

      // Prevent concurrent initialization attempts
      if (isInitializingRef.current || isInitializedRef.current || voiceAgentRef.current) {
        console.log('[WebRTC Hook] Skipping initialization - already initialized or in progress');
        return;
      }
      
      // Prevent infinite recursion with max attempts
      if (initializationAttempts.current >= 3) {
        console.error('[WebRTC Hook] Max initialization attempts reached, stopping');
        setError({
          code: 'MAX_INIT_ATTEMPTS',
          message: 'Failed to initialize after 3 attempts',
          type: 'connection',
          recoverable: false,
          details: 'Maximum initialization attempts exceeded'
        });
        return;
      }
      
      isInitializingRef.current = true;
      initializationAttempts.current++;
      
      try {
        console.log(`[WebRTC Hook] Initializing WebRTC Voice Agent (attempt ${initializationAttempts.current})...`);
        
        // Create the voice agent instance
        // Fix: Force correct port for API endpoint
        const apiEndpoint = (() => {
          // If running on localhost, use the current port from window.location
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Use the actual port the app is running on
            return `${window.location.protocol}//${window.location.host}/api/voice-agent`;
          }
          // For production, use the provided endpoint or default
          return config.apiEndpoint || '/api/voice-agent';
        })();
        
        const agent = createWebRTCVoiceAgent({
          apiEndpoint,
          maxReconnectAttempts: 3,
          reconnectDelay: 1000,
          audioConstraints: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        // Set up event handlers before initialization
        agent.on('connectionStateChanged', handleConnectionStateChange);
        agent.on('conversationStateChanged', handleConversationStateChange);
        agent.on('userTranscript', handleUserTranscript);
        agent.on('assistantTranscript', handleAssistantTranscript);
        agent.on('speechStarted', handleSpeechStarted);
        agent.on('playbackStarted', handlePlaybackStarted);
        agent.on('playbackFinished', handlePlaybackFinished);
        agent.on('error', handleError);
        agent.on('voiceActivityDetected', handleVoiceActivity);
        agent.on('audioLevel', handleAudioLevel);
        
        // Session restoration event handlers
        agent.on('sessionRestored', handleSessionRestored);
        agent.on('sessionExpired', handleSessionExpired);
        agent.on('reconnecting', handleReconnecting);
        agent.on('reconnected', handleReconnected);

        voiceAgentRef.current = agent;
        
        // Register activity reset callback if provided
        if (onActivityReset) {
          const unsubscribe = agent.onActivityReset(onActivityReset);
          
          // Store unsubscribe function for cleanup
          (agent as any)._activityUnsubscribe = unsubscribe;
        }
        
        // Initialize the connection
        await agent.initialize();
        
        // Mark as successfully initialized only after connection is established
        isInitializedRef.current = true;
        console.log('[WebRTC Hook] WebRTC Voice Agent initialized successfully');
        
      } catch (initError) {
        console.error('[WebRTC Hook] Failed to initialize WebRTC Voice Agent:', initError);
        
        // Clean up failed instance
        if (voiceAgentRef.current) {
          try {
            await voiceAgentRef.current.disconnect();
          } catch (disconnectError) {
            console.error('[WebRTC Hook] Error during cleanup:', disconnectError);
          }
          voiceAgentRef.current = null;
        }
        
        setError({
          code: 'INITIALIZATION_ERROR',
          message: 'Failed to initialize voice assistant',
          type: 'connection',
          recoverable: initializationAttempts.current < 3,
          details: initError
        });
      } finally {
        isInitializingRef.current = false;
      }
    };

    // Only initialize once - remove config.apiEndpoint dependency to prevent re-initialization
    if (!isInitializedRef.current && !isInitializingRef.current) {
      initializeVoiceAgent();
    }

    // Cleanup on unmount
    return () => {
      isInitializingRef.current = false;
      if (voiceAgentRef.current) {
        voiceAgentRef.current.disconnect().catch(console.error);
        voiceAgentRef.current = null;
        isInitializedRef.current = false;
        initializationAttempts.current = 0;
      }
    };
  }, [isSessionLoaded]); // Wait for session to load before initialization

  // Event Handlers
  const handleConnectionStateChange = useCallback((state: ConnectionState) => {
    console.log('[Hook] Connection state changed from', isConnected ? 'connected' : 'disconnected', 'to', state);
    
    const wasConnected = isConnected;
    const willBeConnected = state === 'connected';
    
    setIsConnected(willBeConnected);
    
    // Update session persistence
    sessionPersistence.updateConnectionState(state);
    
    // Clear any errors when successfully connecting
    if (willBeConnected && !wasConnected) {
      console.log('[Hook] Successfully connected - clearing errors and updating state');
      setError(null);
      setHasPermission(true);
    }
    
    // Map connection state to voice status
    switch (state) {
      case 'connected':
        setStatus('idle');
        setStatusText('Ready to assist');
        setHasPermission(true);
        break;
      case 'connecting':
        setStatus('idle');
        setStatusText('Connecting...');
        break;
      case 'disconnected':
        setStatus('idle');
        setStatusText('Disconnected');
        break;
      case 'failed':
        setStatus('error');
        setStatusText('Connection failed');
        break;
      case 'reconnecting':
        setStatus('idle');
        setStatusText('Reconnecting...');
        break;
    }
    
    // Log final state for debugging
    console.log('[Hook] Connection state update complete:', {
      newState: state,
      isConnected: willBeConnected,
      status: state === 'connected' ? 'idle' : state === 'failed' ? 'error' : 'idle',
      hasPermission: state === 'connected'
    });
  }, [isConnected]);

  const handleConversationStateChange = useCallback((state: ConversationState) => {
    console.log('Conversation state changed:', state);
    
    // Update session persistence
    sessionPersistence.updateConversationState(state);
    
    switch (state) {
      case 'listening':
        setIsListening(true);
        setIsThinking(false);
        setIsSpeaking(false);
        setStatus('listening');
        setStatusText('Listening...');
        break;
      case 'processing':
        setIsListening(false);
        setIsThinking(true);
        setIsSpeaking(false);
        setStatus('thinking');
        setStatusText('Processing...');
        break;
      case 'speaking':
        setIsListening(false);
        setIsThinking(false);
        setIsSpeaking(true);
        setStatus('speaking');
        setStatusText('Speaking...');
        break;
      case 'idle':
        setIsListening(false);
        setIsThinking(false);
        setIsSpeaking(false);
        setStatus('idle');
        setStatusText('Ready to assist');
        break;
      case 'interrupted':
        setIsListening(false);
        setIsThinking(false);
        setIsSpeaking(false);
        setStatus('idle');
        setStatusText('Interrupted');
        break;
    }
  }, []);

  const handleUserTranscript = useCallback((data: { text: string; isFinal: boolean }) => {
    console.log('[Hook] handleUserTranscript called:', { text: data.text, isFinal: data.isFinal });
    
    if (data.isFinal) {
      // Add final user message
      const message: VoiceMessage = {
        id: generateId(),
        type: 'user',
        content: data.text,
        timestamp: new Date().toISOString()
      };
      
      console.log('[Hook] Adding final user message to state:', message);
      setMessages(prev => {
        const newMessages = [...prev.slice(-49), message];
        console.log('[Hook] Updated messages array after user transcript, length:', newMessages.length);
        return newMessages;
      });
      
      // Add to session persistence
      sessionPersistence.addMessage(message);
      
      events.onMessage?.(message);
      
      // Reset buffer
      userTranscriptBuffer.current = '';
    } else {
      // Update buffer with interim results
      userTranscriptBuffer.current = data.text;
      setStatusText(`Listening: "${data.text}"`);
      console.log('[Hook] Updated interim user transcript:', data.text);
    }
  }, [events]);

  const handleAssistantTranscript = useCallback((data: { text: string; isFinal: boolean }) => {
    console.log('[Hook] handleAssistantTranscript called:', { text: data.text, isFinal: data.isFinal });
    
    if (data.isFinal) {
      // Add final assistant message
      const fullText = assistantTranscriptBuffer.current + data.text;
      const message: VoiceMessage = {
        id: generateId(),
        type: 'assistant',
        content: fullText,
        timestamp: new Date().toISOString()
      };
      
      console.log('[Hook] Adding final assistant message to state:', message);
      setMessages(prev => {
        const newMessages = [...prev.slice(-49), message];
        console.log('[Hook] Updated messages array after assistant transcript, length:', newMessages.length);
        return newMessages;
      });
      
      // Add to session persistence
      sessionPersistence.addMessage(message);
      
      events.onMessage?.(message);
      
      // Reset buffer
      assistantTranscriptBuffer.current = '';
    } else {
      // Accumulate transcript
      assistantTranscriptBuffer.current += data.text;
      console.log('[Hook] Accumulated assistant transcript:', assistantTranscriptBuffer.current);
    }
  }, [events]);

  const handleSpeechStarted = useCallback(() => {
    console.log('User started speaking');
    userTranscriptBuffer.current = '';
  }, []);

  const handlePlaybackStarted = useCallback(() => {
    console.log('Assistant started speaking');
    assistantTranscriptBuffer.current = '';
  }, []);

  const handlePlaybackFinished = useCallback(() => {
    console.log('Assistant finished speaking');
    // Ensure any remaining transcript is saved
    if (assistantTranscriptBuffer.current) {
      const message: VoiceMessage = {
        id: generateId(),
        type: 'assistant',
        content: assistantTranscriptBuffer.current,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev.slice(-49), message]);
      
      // Add to session persistence
      sessionPersistence.addMessage(message);
      
      events.onMessage?.(message);
      assistantTranscriptBuffer.current = '';
    }
  }, [events]);

  const handleError = useCallback((errorInfo: ErrorInfo) => {
    console.error('Voice agent error:', errorInfo);
    
    const voiceError: VoiceAssistantError = {
      code: errorInfo.type.toUpperCase(),
      message: errorInfo.message,
      type: errorInfo.type === 'microphone_permission_denied' ? 'permission' : 
            errorInfo.type === 'connection_failed' ? 'connection' :
            errorInfo.type === 'api_error' ? 'api' : 'unknown',
      recoverable: errorInfo.recoverable,
      details: errorInfo.details
    };
    
    setError(voiceError);
    events.onError?.(voiceError);
    
    // Update status
    setStatus('error');
    setStatusText(errorInfo.message);
  }, [events]);

  const handleVoiceActivity = useCallback((active: boolean) => {
    // Voice activity indicator - could be used for visual feedback
    console.log('Voice activity:', active);
  }, []);

  const handleAudioLevel = useCallback((level: number) => {
    // Update audio level for visualization
    setAudioLevel(level);
  }, []);

  // Public API
  const startListening = useCallback(async () => {
    if (!voiceAgentRef.current || !isConnected || isListening || isMuted) {
      console.warn('Cannot start listening:', { 
        hasAgent: !!voiceAgentRef.current, 
        isConnected, 
        isListening, 
        isMuted 
      });
      return;
    }
    
    try {
      voiceAgentRef.current.startListening();
    } catch (error) {
      console.error('Failed to start listening:', error);
      handleError({
        type: 'audio_error',
        message: 'Failed to start listening',
        timestamp: Date.now(),
        details: error,
        recoverable: true
      });
    }
  }, [isConnected, isListening, isMuted, handleError]);

  const stopListening = useCallback(() => {
    if (!voiceAgentRef.current || !isListening) return;
    
    try {
      voiceAgentRef.current.stopListening();
    } catch (error) {
      console.error('Failed to stop listening:', error);
    }
  }, [isListening]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    
    // Stop listening if muting
    if (!isMuted && isListening) {
      stopListening();
    }
    
    // Interrupt if speaking
    if (!isMuted && isSpeaking && voiceAgentRef.current) {
      voiceAgentRef.current.interrupt();
    }
  }, [isMuted, isListening, isSpeaking, stopListening]);

  const toggleVoiceActivation = useCallback(() => {
    setIsVoiceActivationEnabled(prev => !prev);
    // TODO: Implement voice activation detection
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    console.log('[Hook] sendMessage called:', {
      message,
      hasAgent: !!voiceAgentRef.current,
      isConnected,
      currentMessages: messages.length
    });
    
    if (!voiceAgentRef.current || !isConnected) {
      console.warn('[Hook] Cannot send message - no agent or not connected');
      return;
    }
    
    try {
      // Send to voice agent first - the WebRTC implementation will handle the userTranscript event
      // which will add the message to state through handleUserTranscript
      console.log('[Hook] Sending message to voice agent:', message);
      voiceAgentRef.current.sendMessage(message);
      console.log('[Hook] Message sent to voice agent successfully');
    } catch (error) {
      console.error('[Hook] Failed to send message:', error);
    }
  }, [isConnected, events, messages.length]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const resetSession = useCallback(async () => {
    if (voiceAgentRef.current) {
      await voiceAgentRef.current.disconnect();
      await voiceAgentRef.current.initialize();
    }
    
    clearMessages();
    setError(null);
    setStatus('idle');
    setStatusText('Ready to assist');
  }, [clearMessages]);

  // Session control methods
  const pauseSession = useCallback(() => {
    if (voiceAgentRef.current && isConnected) {
      voiceAgentRef.current.pauseSession();
    }
  }, [isConnected]);

  const resumeSession = useCallback(() => {
    if (voiceAgentRef.current && isConnected) {
      voiceAgentRef.current.resumeSession();
    }
  }, [isConnected]);

  const endSession = useCallback(async () => {
    if (voiceAgentRef.current) {
      await voiceAgentRef.current.endSession();
    }
  }, []);

  const isSessionPaused = useCallback(() => {
    return voiceAgentRef.current ? voiceAgentRef.current.isSessionPaused() : false;
  }, []);

  // Enhanced voice controls
  const changeVoice = useCallback((voice: string) => {
    if (voiceAgentRef.current && isConnected) {
      voiceAgentRef.current.changeVoice(voice as any);
    }
  }, [isConnected]);

  const setVoiceSpeed = useCallback((speed: number) => {
    if (voiceAgentRef.current && isConnected) {
      voiceAgentRef.current.setVoiceSpeed(speed);
    }
  }, [isConnected]);

  const setNoiseReduction = useCallback((mode: 'near_field' | 'far_field' | 'auto') => {
    if (voiceAgentRef.current && isConnected) {
      voiceAgentRef.current.setNoiseReduction(mode);
    }
  }, [isConnected]);

  const getPerformanceMetrics = useCallback(() => {
    if (voiceAgentRef.current) {
      return voiceAgentRef.current.getPerformanceMetrics();
    }
    return null;
  }, []);

  const getSessionStats = useCallback(() => {
    if (voiceAgentRef.current) {
      return voiceAgentRef.current.getSessionStats();
    }
    return null;
  }, []);

  // Session restoration event handlers
  const handleSessionRestored = useCallback((sessionData: any) => {
    console.log('[Hook] Session restored:', sessionData);
    
    setIsSessionRestored(true);
    setSessionId(sessionData.sessionId);
    setStatusText('Session restored - reconnecting...');
    
    // Don't manually restore messages here - the WebRTC agent will emit them
    // through userTranscript and assistantTranscript events
    
    // Update session stats
    const stats = sessionData.metadata || {};
    setSessionStats({
      isActive: sessionData.isActive,
      sessionId: sessionData.sessionId,
      messageCount: sessionData.messages.length,
      duration: stats.totalDuration || 0,
      reconnectAttempts: stats.reconnectAttempts || 0,
      tokenExpiresIn: sessionData.tokenExpiresAt ? Math.max(0, sessionData.tokenExpiresAt - Date.now()) : 0
    });
    
    events.onMessage && events.onMessage({
      id: generateId(),
      type: 'system',
      content: 'Previous conversation restored',
      timestamp: new Date().toISOString()
    });
  }, [events]);

  const handleSessionExpired = useCallback(() => {
    console.log('[Hook] Session expired');
    
    setIsSessionRestored(false);
    setStatusText('Session expired - please refresh');
    setError({
      code: 'SESSION_EXPIRED',
      message: 'Your session has expired. Please refresh the page.',
      type: 'session',
      recoverable: true
    });
  }, []);

  const handleReconnecting = useCallback(() => {
    console.log('[Hook] Reconnecting...');
    setStatusText('Reconnecting...');
    setStatus('idle');
  }, []);

  const handleReconnected = useCallback(() => {
    console.log('[Hook] Reconnected successfully');
    setStatusText('Reconnected successfully');
    setStatus('idle');
    
    setTimeout(() => {
      setStatusText('Ready to assist');
    }, 2000);
  }, []);

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
    isConnected,
    audioLevel,
    
    // Session restoration state
    sessionStats,
    isSessionRestored,
    
    // Actions
    startListening,
    stopListening,
    toggleMute,
    toggleVoiceActivation,
    sendMessage,
    clearMessages,
    resetSession,
    
    // Session control actions
    pauseSession,
    resumeSession,
    endSession,
    isSessionPaused,
    
    // Enhanced controls
    changeVoice,
    setVoiceSpeed,
    setNoiseReduction,
    getPerformanceMetrics,
    getSessionStats,
    
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

let messageIdCounter = 0;
const generateId = (): string => {
  // Use a combination of timestamp, counter, and random string to ensure uniqueness
  // even when multiple messages are generated in rapid succession
  messageIdCounter = (messageIdCounter + 1) % 10000; // Reset counter every 10k messages
  return `msg-${Date.now()}-${messageIdCounter}-${Math.random().toString(36).substr(2, 9)}`;
};