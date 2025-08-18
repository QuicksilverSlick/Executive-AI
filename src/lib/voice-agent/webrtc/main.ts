/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Main WebRTC Voice Agent implementation for OpenAI Realtime API
 * @version: 2.1.0
 * @init-author: engineer-agent
 * @init-cc-sessionId: cc-eng-20250801-002
 * @init-timestamp: 2025-08-01T14:30:00Z
 * @reasoning:
 * - **Objective:** Production-ready WebRTC voice agent using OpenAI's Realtime API
 * - **Strategy:** Event-driven architecture with comprehensive error handling
 * - **Outcome:** Robust voice assistant with network resilience and fallback support
 */

import { EventEmitter } from 'eventemitter3';
import { WebRTCConnection } from './connection';
import { WebRTCAudioProcessor } from './audio-processor';
import { NetworkMonitor } from './network-monitor';
import { ErrorRecoveryManager as ErrorRecovery } from './error-recovery';
import { EnhancedSessionManager } from '../enhanced-session-manager';
import { SessionTimeoutHandler } from './session-timeout-handler';
// Note: audioFeedback import removed - OpenAI model now handles acknowledgments naturally
import type {
  VoiceAssistantError,
  VoiceStatus,
  ConnectionState,
  ConversationState,
  RealtimeEvent,
  VoiceAssistantConfig as VoiceConfig,
  SessionConfig,
  VoiceMessage,
  templatizeInstructions
} from '../../../features/voice-agent/types';
import { DEFAULT_SESSION_CONFIG } from '../../../features/voice-agent/types';
import { templatizeInstructions } from '../utils';

export interface WebRTCVoiceAgentEvents {
  // Connection events
  connectionStateChanged: (state: ConnectionState) => void;
  conversationStateChanged: (state: ConversationState) => void;
  
  // Session events
  sessionRestored: (sessionData: any) => void;
  sessionExpired: () => void;
  reconnecting: () => void;
  reconnected: () => void;
  sessionPaused: () => void;
  sessionResumed: () => void;
  sessionEnded: () => void;
  
  // Audio events
  recordingStarted: () => void;
  recordingStopped: () => void;
  speechStarted: () => void;
  speechEnded: () => void;
  playbackStarted: () => void;
  playbackFinished: () => void;
  audioLevel: (level: number) => void;
  
  // Transcript events
  userTranscript: (data: { text: string; isFinal: boolean }) => void;
  assistantTranscript: (data: { text: string; isFinal: boolean }) => void;
  
  // Error events
  error: (error: VoiceAssistantError) => void;
  warning: (message: string) => void;
  
  // Status events
  statusUpdate: (status: VoiceStatus) => void;
  fallbackActivated: () => void;
}

export class WebRTCVoiceAgent extends EventEmitter<WebRTCVoiceAgentEvents> {
  // Core components
  private connection: WebRTCConnection;
  private audioProcessor: WebRTCAudioProcessor;
  private networkMonitor: NetworkMonitor;
  private errorRecovery: ErrorRecovery;
  private sessionManager: EnhancedSessionManager | null;
  
  // State management
  private connectionState: ConnectionState = 'disconnected';
  private conversationState: ConversationState = 'idle';
  private messageSequence = 0;
  
  // Audio management
  private localStream: MediaStream | null = null;
  
  // Configuration
  private config: VoiceConfig;
  private sessionConfig: SessionConfig;
  private sessionId: string = '';
  
  // Initialization guards
  private isInitializing = false;
  private isInitialized = false;
  private isRestoring = false;
  
  // State management
  private conversationContext: string[] = [];
  private sessionMemory: Map<string, any> = new Map();
  private performanceMetrics = {
    latency: 0,
    audioQuality: 0,
    connectionStability: 0
  };
  
  // Session restoration
  private pendingHistoryInjection: VoiceMessage[] = [];
  private isSessionCreated = false;
  private isSessionPaused = false;

  // Search acknowledgment management
  
  // Response tracking for timeout warnings
  private activeResponseId: string | null = null;
  private isResponseInProgress: boolean = false;
  private currentRateLimits: any = null;
  
  // Session timeout handling
  private timeoutHandler: SessionTimeoutHandler;
  
  // Token management
  private tokenManager: {
    token: string | null;
    expiresAt: number;
    refreshTimer?: NodeJS.Timeout;
  } = {
    token: null,
    expiresAt: 0
  };

  constructor(config: VoiceConfig) {
    super();
    this.config = config;
    
    // Merge session configuration with defaults
    this.sessionConfig = {
      ...DEFAULT_SESSION_CONFIG,
      ...config.sessionConfig
    };
    
    // Initialize session timeout handler
    this.timeoutHandler = new SessionTimeoutHandler();
    this.setupTimeoutHandlerEvents();
    
    // Initialize session manager (only available on client-side)
    this.sessionManager = EnhancedSessionManager.getInstance();
    if (this.sessionManager) {
      this.sessionManager.setTokenRefreshCallback(async () => {
        await this.refreshToken();
        return {
          token: this.tokenManager.token!,
          expiresAt: this.tokenManager.expiresAt,
          sessionId: this.sessionId
        };
      });
      
      this.sessionManager.setEventCallbacks({
        onSessionRestored: (sessionData) => {
          console.log('[WebRTC Voice Agent] Session restored:', sessionData.sessionId);
          this.handleSessionRestored(sessionData);
        },
        onSessionExpired: () => {
          console.log('[WebRTC Voice Agent] Session expired');
          this.emit('sessionExpired');
        }
      });
    } else {
      console.log('[WebRTC Voice Agent] Session manager not available (SSR mode)');
    }
    
    // Initialize components with enhanced configuration
    this.connection = new WebRTCConnection(
      config.maxReconnectAttempts || 3,
      config.reconnectDelay || 1000
    );
    
    // Initialize audio processor with adaptive quality settings
    this.audioProcessor = new WebRTCAudioProcessor(
      24000, // Sample rate for optimal quality
      config.targetLatency || 75,
      config.adaptiveQuality !== false
    );
    
    this.networkMonitor = new NetworkMonitor();
    
    // Initialize error recovery with required callbacks
    this.errorRecovery = new ErrorRecovery(
      () => this.connection,
      () => this.audioProcessor,
      () => this.networkMonitor,
      async () => {
        const tokenData = this.sessionManager ? await this.sessionManager.getCurrentToken() : null;
        if (!tokenData) {
          await this.refreshToken();
          return {
            token: this.tokenManager.token!,
            expiresAt: this.tokenManager.expiresAt,
            sessionId: this.sessionId
          };
        }
        return tokenData;
      }
    );
    
    // Initialize search acknowledgment manager

    this.setupEventHandlers();
    this.initializePerformanceMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    // Note: Ping is not supported by OpenAI Realtime API
    // We'll monitor connection quality through other means
    
    // Monitor connection stability
    this.networkMonitor.on('connectionQualityChange', (quality: any) => {
      this.performanceMetrics.connectionStability = quality.score;
      
      // Adaptive quality adjustment
      if (this.config.adaptiveQuality) {
        this.adjustQualityBasedOnNetwork(quality);
      }
    });
  }

  /**
   * Measure end-to-end latency
   * Note: OpenAI Realtime API doesn't support ping events
   * We estimate latency based on response times instead
   */
  private async measureLatency(): Promise<void> {
    // Track latency through actual message round-trips
    // Store timestamp when sending messages and calculate on response
    const currentTime = performance.now();
    this.sessionMemory.set('last_measurement_time', currentTime);
    
    // Update performance metrics based on recent interactions
    const recentLatencies = this.sessionMemory.get('recent_latencies') || [];
    if (recentLatencies.length > 0) {
      const avgLatency = recentLatencies.reduce((a: number, b: number) => a + b, 0) / recentLatencies.length;
      this.performanceMetrics.latency = Math.round(avgLatency);
    }
  }

  /**
   * Adjust quality based on network conditions
   */
  private adjustQualityBasedOnNetwork(quality: any): void {
    const targetLatency = this.config.targetLatency || 75;
    
    if (quality.score < 0.5) {
      // Poor network - reduce quality
      this.sessionConfig.turn_detection.silence_duration_ms = 1200;
      this.audioProcessor.setInputGain(0.8);
    } else if (quality.score > 0.8) {
      // Good network - enhance quality
      this.sessionConfig.turn_detection.silence_duration_ms = 600;
      this.audioProcessor.setInputGain(1.0);
    }
  }

  /**
   * Initialize the voice agent with session restoration support
   */
  async initialize(): Promise<void> {
    // Guard against concurrent initialization
    if (this.isInitializing || this.isRestoring) {
      console.log('[WebRTC Voice Agent] Already initializing or restoring, skipping duplicate call');
      return;
    }
    
    // Guard against re-initialization
    if (this.isInitialized && this.connectionState === 'connected') {
      console.log('[WebRTC Voice Agent] Already initialized and connected');
      return;
    }
    
    this.isInitializing = true;
    
    try {
      console.log('[WebRTC Voice Agent] Initializing with session restoration support...');
      
      // Step 1: Attempt session restoration first
      console.log('[WebRTC Voice Agent] Attempting session restoration...');
      const restorationResult = this.sessionManager ? await this.sessionManager.restoreSession() : 
        { success: false, reason: 'No session manager', shouldStartNew: true, reconnectRequired: false };
      
      if (restorationResult?.success && restorationResult.sessionData) {
        console.log('[WebRTC Voice Agent] Session restoration successful');
        
        // Use restored session data
        this.sessionId = restorationResult.sessionData.sessionId;
        this.tokenManager.token = restorationResult.sessionData.token;
        this.tokenManager.expiresAt = restorationResult.sessionData.tokenExpiresAt;
        
        // Restore conversation context from messages
        this.restoreConversationContext(restorationResult.sessionData.messages);
        
        // Emit session restored event
        this.emit('sessionRestored', restorationResult.sessionData);
        
        if (restorationResult.reconnectRequired) {
          console.log('[WebRTC Voice Agent] Reconnection required for restored session');
          this.emit('reconnecting');
          await this.performConnection(true);
        }
        
      } else if (restorationResult.shouldStartNew) {
        console.log('[WebRTC Voice Agent] Starting new session:', restorationResult.reason);
        
        // Clear any pending history injection for new sessions
        this.pendingHistoryInjection = [];
        this.isSessionCreated = false;
        
        // Step 2: Get fresh authentication token
        console.log('[WebRTC Voice Agent] Getting authentication token...');
        await this.refreshToken();
        
        // Create new session
        if (this.sessionManager) {
          await this.sessionManager.createSession(this.sessionId, this.tokenManager.token!, this.tokenManager.expiresAt);
        }
        
        // Perform initial connection
        await this.performConnection(false);
        
      } else {
        console.log('[WebRTC Voice Agent] Session restoration failed, starting fresh');
        
        // Clear any pending history injection for new sessions
        this.pendingHistoryInjection = [];
        this.isSessionCreated = false;
        
        await this.refreshToken();
        if (this.sessionManager) {
          await this.sessionManager.createSession(this.sessionId, this.tokenManager.token!, this.tokenManager.expiresAt);
        }
        await this.performConnection(false);
      }
      
      // Mark as initialized
      this.isInitialized = true;
      
    } catch (error) {
      // Reset initialization state on error
      this.isInitialized = false;
      
      await this.handleError({
        type: 'connection_failed',
        message: error instanceof Error ? error.message : 'Initialization failed',
        timestamp: Date.now(),
        details: error,
        recoverable: true
      });
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Perform the actual WebRTC connection
   */
  private async performConnection(isReconnection: boolean): Promise<void> {
    console.log(`[WebRTC Voice Agent] ${isReconnection ? 'Reconnecting' : 'Connecting'} to OpenAI...`);
    
    // Ensure audio context is ready before initializing microphone
    // Note: Audio context will be suspended until user interaction
    await this.audioProcessor.ensureAudioContext(false);
    
    // Initialize microphone with our audio processor
    this.localStream = await this.audioProcessor.initializeMicrophone();
    
    // Connect to OpenAI
    const ephemeralToken = {
      token: this.tokenManager.token!,
      expiresAt: this.tokenManager.expiresAt,
      sessionId: this.sessionId
    };

    // Templatize instructions before connecting
    const personalizedInstructions = templatizeInstructions(this.sessionConfig.instructions, {
      ownerfirstName: 'Valued Customer',
      businessName: 'your business',
      businessIndustry: 'your industry'
    });

    const personalizedSessionConfig = {
      ...this.sessionConfig,
      instructions: personalizedInstructions
    };
    
    await this.connection.connect(ephemeralToken, this.localStream, personalizedSessionConfig);
    
    // Start monitoring
    if (this.connection.peerConnection) {
      this.networkMonitor.startMonitoring(this.connection.peerConnection);
    }
    
    // The connection.ts file already sends a session configuration when the data channel opens
    console.log('[WebRTC Voice Agent] Connection established, session configuration will be sent when data channel opens');
    
    // Update connection state and emit events
    this.updateConnectionState('connected');
    console.log('[WebRTC Voice Agent] Emitting connectionStateChanged event: connected');
    this.emit('connectionStateChanged', 'connected');
    
    if (isReconnection) {
      this.emit('reconnected');
    }
    
    // Start continuous recording for server-side VAD
    console.log('[WebRTC Voice Agent] Starting continuous audio streaming for server-side VAD');
    this.audioProcessor.startRecording();
    this.updateConversationState('listening');
    this.emit('recordingStarted');
  }

  /**
   * Handle session restoration
   */
  private handleSessionRestored(sessionData: any): void {
    // This is called when session manager restores a session
    console.log('[WebRTC Voice Agent] Handling session restoration with', sessionData.messages.length, 'messages');
    
    // Update internal state to match restored session
    this.sessionId = sessionData.sessionId;
    this.restoreConversationContext(sessionData.messages);
    
    // Emit restored messages for UI update
    sessionData.messages.forEach((message: VoiceMessage) => {
      if (message.type === 'user') {
        this.emit('userTranscript', { text: message.content, isFinal: true });
      } else if (message.type === 'assistant') {
        this.emit('assistantTranscript', { text: message.content, isFinal: true });
      }
    });
  }

  /**
   * Restore conversation context from messages
   */
  private restoreConversationContext(messages: VoiceMessage[]): void {
    console.log('[WebRTC Voice Agent] Starting conversation context restoration');
    console.log('[WebRTC Voice Agent] Input messages array:', messages);
    console.log('[WebRTC Voice Agent] Number of messages to restore:', messages ? messages.length : 0);
    
    this.conversationContext = [];
    
    // Store messages for injection after session.created event
    this.pendingHistoryInjection = [...messages];
    
    // Log each message being restored
    messages.forEach((message, index) => {
      console.log(`[WebRTC Voice Agent] Message ${index + 1}:`, {
        type: message.type,
        hasContent: !!message.content,
        contentLength: message.content ? message.content.length : 0,
        contentPreview: message.content ? message.content.substring(0, 100) : 'NO CONTENT',
        timestamp: message.timestamp
      });
      
      if (message.type === 'user' && message.content) {
        this.conversationContext.push(`User: ${message.content}`);
      } else if (message.type === 'assistant' && message.content) {
        this.conversationContext.push(`Assistant: ${message.content}`);
      } else {
        console.warn('[WebRTC Voice Agent] Skipping message without content or invalid type:', message);
      }
    });
    
    // Keep only the last 10 messages for context
    if (this.conversationContext.length > 10) {
      this.conversationContext = this.conversationContext.slice(-10);
    }
    
    console.log('[WebRTC Voice Agent] Conversation context restored:', {
      contextEntries: this.conversationContext.length,
      pendingInjectionCount: this.pendingHistoryInjection.length,
      firstMessage: this.conversationContext[0] || 'NONE',
      lastMessage: this.conversationContext[this.conversationContext.length - 1] || 'NONE'
    });
  }

  /**
   * Process conversation history for restoration
   * This approach updates the session instructions with conversation context
   * to maintain continuity across sessions.
   */
  private async injectConversationHistory(): Promise<void> {
    console.log('[WebRTC Voice Agent] Processing conversation history restoration');
    console.log('[WebRTC Voice Agent] Pending history messages:', this.pendingHistoryInjection?.length || 0);
    
    if (!this.pendingHistoryInjection || this.pendingHistoryInjection.length === 0) {
      console.log('[WebRTC Voice Agent] No conversation history to restore');
      return;
    }

    try {
      // Build a conversation summary from the historical messages
      const conversationSummary = this.pendingHistoryInjection.map((msg, index) => {
        const role = msg.type === 'user' ? 'User' : 'Assistant';
        return `${role}: ${msg.content}`;
      }).join('\n');

      // Create an enhanced instruction that includes the conversation context
      const enhancedInstructions = `${this.sessionConfig.instructions}

IMPORTANT: This is a restored conversation session. Here is the conversation history from the previous session:

${conversationSummary}

Please continue the conversation naturally from where it left off, maintaining awareness of all previous context and any information that was discussed.`;

      // Update the session with the enhanced instructions
      const sessionUpdateEvent = {
        type: 'session.update',
        session: {
          instructions: enhancedInstructions,
          // Keep other session settings the same
          modalities: this.sessionConfig.modalities,
          voice: this.sessionConfig.voice,
          input_audio_format: this.sessionConfig.input_audio_format,
          output_audio_format: this.sessionConfig.output_audio_format,
          input_audio_transcription: this.sessionConfig.input_audio_transcription,
          turn_detection: this.sessionConfig.turn_detection,
          tools: this.sessionConfig.tools,
          tool_choice: this.sessionConfig.tool_choice,
          temperature: this.sessionConfig.temperature,
          max_response_output_tokens: this.sessionConfig.max_response_output_tokens
        }
      };

      // Send the session update to establish context
      console.log('[WebRTC Voice Agent] Updating session with conversation context');
      this.connection.sendEvent(sessionUpdateEvent);

      // Store messages locally for UI consistency and update conversation context
      this.pendingHistoryInjection.forEach(msg => {
        const contextEntry = `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`;
        this.addToConversationContext(contextEntry);
      });

      const messageCount = this.pendingHistoryInjection.length;
      console.log(`[WebRTC Voice Agent] Context established with ${messageCount} historical messages`);
      
      // Clear pending injection
      this.pendingHistoryInjection = [];
      
      // Ensure agent is ready to continue conversation
      setTimeout(() => {
        console.log('[WebRTC Voice Agent] Agent ready for continued conversation');
        this.restoreListeningState();
      }, 500); // Give a bit more time for the context to be processed
      
    } catch (error) {
      console.error('[WebRTC Voice Agent] Failed to restore conversation context:', error);
      // Clear pending injection even on error
      this.pendingHistoryInjection = [];
      // Still restore listening state so the session is usable
      this.restoreListeningState();
    }
  }

  /**
   * Start listening for user input
   */
  async startListening(): Promise<void> {
    if (this.connectionState !== 'connected') {
      throw new Error('Cannot start listening: not connected');
    }
    
    // Resume audio context on user interaction
    await this.audioProcessor.ensureAudioContext(true);
    
    // In continuous mode, recording is already active
    // Just update UI state
    console.log('[WebRTC Voice Agent] Start listening called but already in continuous mode');
    this.updateConversationState('listening');
    this.emit('recordingStarted');
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    // In continuous mode, we don't actually stop recording
    // Just update UI state
    console.log('[WebRTC Voice Agent] Stop listening called but maintaining continuous audio stream');
    this.emit('recordingStopped');
  }

  /**
   * Send text message to the assistant
   */
  sendMessage(text: string): void {
    if (this.connectionState !== 'connected') {
      throw new Error('Cannot send message: not connected');
    }
    
    console.log('[WebRTC Voice Agent] Sending text message:', text);
    
    // Track message send time for latency measurement
    const sendTime = performance.now();
    const messageId = `msg_${++this.messageSequence}`;
    
    // Create message object for session persistence
    const userMessage: VoiceMessage = {
      id: messageId,
      type: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    
    // Add to session manager
    if (this.sessionManager) {
      this.sessionManager.addMessage(userMessage);
    }
    
    // Immediately emit user transcript for text messages to show in UI
    console.log('[WebRTC Voice Agent] Emitting userTranscript for text message');
    this.emit('userTranscript', { 
      text: text, 
      isFinal: true 
    });
    
    // Add to conversation context for search awareness
    this.addToConversationContext(`User: ${text}`);
    
    const event: RealtimeEvent = {
      event_id: messageId,
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{
          type: 'input_text',
          text
        }]
      }
    };
    
    console.log('[WebRTC Voice Agent] Sending conversation.item.create event:', event);
    this.connection.sendEvent(event);
    
    // Store send time for latency calculation
    this.sessionMemory.set(`message_sent_${messageId}`, sendTime);
    
    // Create a response
    const responseEvent: RealtimeEvent = {
      event_id: `resp_${++this.messageSequence}`,
      type: 'response.create'
    };
    
    console.log('[WebRTC Voice Agent] Sending response.create event:', responseEvent);
    this.connection.sendEvent(responseEvent);
  }

  /**
   * Interrupt the assistant's current speech
   */
  interrupt(): void {
    if (this.connectionState !== 'connected') {
      console.warn('Cannot interrupt: not connected');
      return;
    }
    
    const event: RealtimeEvent = {
      event_id: `interrupt_${++this.messageSequence}`,
      type: 'response.cancel'
    };
    
    this.connection.sendEvent(event);
    
    // Also clear the audio buffer
    const clearEvent: RealtimeEvent = {
      event_id: `clear_${++this.messageSequence}`,
      type: 'output_audio_buffer.clear'
    };
    
    this.connection.sendEvent(clearEvent);
    
    // Update state
    this.updateConversationState('idle');
    this.emit('playbackFinished');
  }

  /**
   * Pause the voice session
   */
  pauseSession(): void {
    if (this.connectionState !== 'connected') {
      console.warn('Cannot pause: not connected');
      return;
    }

    console.log('[WebRTC Voice Agent] Pausing session...');
    
    try {
      // ONLY send cancel/clear events if there's an active response
      if (this.isResponseInProgress && this.activeResponseId) {
        console.log('[WebRTC Voice Agent] Canceling active response during pause:', this.activeResponseId);
        
        // First cancel the response
        this.connection.sendEvent({
          type: 'response.cancel',
          event_id: `cancel_${Date.now()}`,
          response_id: this.activeResponseId
        });
        
        // Then clear the audio buffer (only for WebRTC and only after cancel)
        this.connection.sendEvent({
          type: 'output_audio_buffer.clear',
          event_id: `clear_${Date.now()}`
        });
      } else {
        console.log('[WebRTC Voice Agent] No active response - pausing without sending cancel/clear events');
      }
      
      // Update conversation state BEFORE stopping audio
      this.updateConversationState('idle');
      
      // Stop audio processing but keep connection alive
      this.audioProcessor.stopRecording();
      
      // Mark as paused internally
      this.isSessionPaused = true;
      
      // Emit pause event
      this.emit('sessionPaused');
      
      console.log('[WebRTC Voice Agent] Session paused successfully');
      
    } catch (error) {
      console.error('[WebRTC Voice Agent] Error pausing session:', error);
      this.handleError({
        type: 'session_pause_failed',
        message: 'Failed to pause session',
        timestamp: Date.now(),
        details: error,
        recoverable: true
      });
    }
  }

  /**
   * Resume the voice session
   */
  resumeSession(): void {
    if (this.connectionState !== 'connected') {
      console.warn('Cannot resume: not connected');
      return;
    }

    if (!this.isSessionPaused) {
      console.warn('Session is not paused');
      return;
    }

    console.log('[WebRTC Voice Agent] Resuming session...');
    
    try {
      // Clear paused state first
      this.isSessionPaused = false;
      
      // Resume audio processing
      this.audioProcessor.startRecording();
      
      // Update conversation state
      this.updateConversationState('listening');
      
      // Send a session update to ensure OpenAI knows we're ready for input
      // This helps restore responsiveness after pause
      const sessionUpdateEvent = {
        event_id: `session_resume_${Date.now()}`,
        type: 'session.update',
        session: {
          // Keep existing session config but ensure turn detection is active
          turn_detection: this.sessionConfig.turn_detection
        }
      };
      
      console.log('[WebRTC Voice Agent] Sending session update to restore responsiveness after resume');
      this.connection.sendEvent(sessionUpdateEvent);
      
      // Emit resume event
      this.emit('sessionResumed');
      
      console.log('[WebRTC Voice Agent] Session resumed successfully');
      
    } catch (error) {
      console.error('[WebRTC Voice Agent] Error resuming session:', error);
      this.isSessionPaused = true; // Reset state on error
      this.handleError({
        type: 'session_resume_failed',
        message: 'Failed to resume session',
        timestamp: Date.now(),
        details: error,
        recoverable: true
      });
    }
  }

  /**
   * End the session gracefully
   */
  async endSession(): Promise<void> {
    console.log('[WebRTC Voice Agent] Ending session gracefully...');
    
    try {
      // Stop timeout tracking
      this.timeoutHandler.stopSession();
      
      // Interrupt any current speech
      this.interrupt();
      
      // End session but preserve data for potential restoration
      if (this.sessionManager) {
        await this.sessionManager.endSession();
      }
      
      // End the connection gracefully
      await this.connection.endSession();
      
      // Update states
      this.updateConversationState('idle');
      this.updateConnectionState('disconnected');
      
      // Emit session ended event
      this.emit('sessionEnded');
      
      console.log('[WebRTC Voice Agent] Session ended successfully');
      
    } catch (error) {
      console.error('[WebRTC Voice Agent] Error ending session:', error);
      this.handleError({
        type: 'session_end_failed',
        message: 'Failed to end session gracefully',
        timestamp: Date.now(),
        details: error,
        recoverable: false
      });
    }
  }

  /**
   * Check if session is paused
   */
  getSessionPausedState(): boolean {
    return this.isSessionPaused;
  }

  /**
   * Test function to trigger a response
   */
  testResponse(): void {
    console.log('[WebRTC Voice Agent] Manually triggering test response');
    
    // First, create a test message
    const messageEvent: RealtimeEvent = {
      event_id: `test_msg_${++this.messageSequence}`,
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{
          type: 'input_text',
          text: 'Hello, can you hear me? Please respond with voice.'
        }]
      }
    };
    
    this.connection.sendEvent(messageEvent);
    
    // Then trigger a response
    setTimeout(() => {
      const responseEvent: RealtimeEvent = {
        event_id: `test_resp_${++this.messageSequence}`,
        type: 'response.create',
        response: {
          modalities: ['text', 'audio'],
          instructions: 'Respond with a friendly greeting using voice.'
        }
      };
      
      console.log('[WebRTC Voice Agent] Sending test response.create event');
      this.connection.sendEvent(responseEvent);
    }, 500);
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Connection events
    this.connection.on('connected', () => {
      console.log('[WebRTC Main] Connection connected event received');
      this.updateConnectionState('connected');
      this.emit('connectionStateChanged', 'connected');
    });
    
    this.connection.on('disconnected', () => {
      console.log('[WebRTC Main] Connection disconnected event received');
      this.updateConnectionState('disconnected');
      this.emit('connectionStateChanged', 'disconnected');
    });
    
    this.connection.on('paused', () => {
      console.log('[WebRTC Main] Connection paused event received');
      this.emit('sessionPaused');
    });
    
    this.connection.on('resumed', () => {
      console.log('[WebRTC Main] Connection resumed event received');
      this.emit('sessionResumed');
    });
    
    this.connection.on('sessionEnded', () => {
      console.log('[WebRTC Main] Session ended event received');
      this.emit('sessionEnded');
    });
    
    this.connection.on('error', (error: any) => {
      this.handleError({
        type: 'connection_failed',
        message: error.message || 'Connection error',
        timestamp: Date.now(),
        details: error,
        recoverable: true
      });
    });
    
    this.connection.on('realtimeEvent', (event: RealtimeEvent) => {
      this.handleRealtimeEvent(event);
    });
    
    this.connection.on('audioTrack', (stream: MediaStream) => {
      this.handleIncomingAudio(stream);
    });

    // Data channel error handling
    this.connection.on('dataChannelError', (error: any) => {
      console.error('[WebRTC Voice Agent] Data channel error:', error);
      this.handleError({
        type: 'data_channel_error',
        message: error.message || 'Data channel communication error',
        timestamp: Date.now(),
        details: error,
        recoverable: true
      });
    });

    this.connection.on('dataChannelClose', () => {
      console.warn('[WebRTC Voice Agent] Data channel closed unexpectedly');
      this.handleError({
        type: 'data_channel_closed',
        message: 'Data channel closed during operation',
        timestamp: Date.now(),
        details: { reason: 'Data channel closed' },
        recoverable: true
      });
    });
    
    // Audio processor events
    this.audioProcessor.on('audioLevel', (level: number) => {
      this.emit('audioLevel', level);
    });
    
    this.audioProcessor.on('vadStateChange', (state: any) => {
      if (state.isSpeaking) {
        this.emit('speechStarted');
      } else {
        this.emit('speechEnded');
      }
    });
    
    // Network monitor events
    this.networkMonitor.on('connectionQualityChange', (quality: any) => {
      if (quality.score < 0.5) {
        this.emit('warning', 'Poor network connection detected');
      }
    });
    
    // Error recovery events
    this.errorRecovery.on('recoveryAttempt', (attempt: any) => {
      console.log(`Recovery attempt ${attempt.attemptNumber}/${attempt.maxAttempts}`);
    });
    
    this.errorRecovery.on('recoverySuccess', async () => {
      console.log('Successfully recovered from error');
      // Re-establish audio after successful recovery
      await this.ensureAudioPlayback();
      
      // Ensure the agent is ready to receive new input after recovery
      this.restoreListeningState();
    });
    
    this.errorRecovery.on('recoveryFailed', () => {
      console.error('Failed to recover from error, activating fallback');
      this.emit('fallbackActivated');
    });
  }

  /**
   * Handle OpenAI Realtime events
   */
  private handleRealtimeEvent(event: RealtimeEvent): void {
    // Log all events for debugging
    console.log('[WebRTC Voice Agent] Realtime event:', event.type, event);
    
    switch (event.type) {
      case 'session.created':
        console.log('Session created:', event);
        this.isSessionCreated = true;
        
        // Start session timeout tracking
        this.timeoutHandler.startSession();
        console.log('[WebRTC Voice Agent] Session timeout tracking started (30-minute limit)');
        
        // Inject conversation history asynchronously
        this.injectConversationHistory().catch(error => {
          console.error('[WebRTC Voice Agent] Failed to inject conversation history:', error);
        });
        break;
        
      case 'conversation.item.created':
        this.handleMessageCreated(event);
        break;
        
      case 'response.audio.delta':
        // In WebRTC mode, audio comes through the peer connection, not data channel
        // These events are for WebSocket mode only
        console.log('[WebRTC Voice Agent] Ignoring audio delta event in WebRTC mode');
        break;
        
      case 'response.audio.done':
        // This event is also for WebSocket mode
        console.log('[WebRTC Voice Agent] Audio done event (WebSocket mode)');
        break;
        
      case 'response.text.delta':
        this.handleTextDelta(event);
        break;
        
      case 'response.text.done':
        this.handleTextDone(event);
        break;
        
      case 'response.function_call_arguments.delta':
        this.handleFunctionCallDelta(event);
        break;
        
      case 'response.function_call_arguments.done':
        this.handleFunctionCallDone(event);
        break;
        
      case 'input_audio_buffer.speech_started':
        console.log('User started speaking');
        this.emit('speechStarted');
        break;
        
      case 'input_audio_buffer.speech_stopped':
        // OpenAI automatically creates a response when speech stops with server-side VAD
        console.log('[WebRTC Voice Agent] Speech stopped - server VAD will trigger response automatically');
        this.updateConversationState('processing');
        break;
        
      case 'output_audio_buffer.started':
        console.log('[WebRTC Voice Agent] Audio buffer started - beginning playback');
        this.updateConversationState('speaking');
        this.emit('playbackStarted');
        break;
        
      case 'output_audio_buffer.stopped':
        console.log('[WebRTC Voice Agent] Audio buffer stopped - playback complete');
        this.updateConversationState('idle');
        this.emit('playbackFinished');
        break;
        
      case 'output_audio_buffer.cleared':
        console.log('[WebRTC Voice Agent] Audio buffer cleared');
        break;
        
      case 'response.audio_transcript.delta':
        // Handle incremental assistant transcript updates
        if (event.delta) {
          this.emit('assistantTranscript', { 
            text: event.delta, 
            isFinal: false 
          });
        }
        break;
        
      case 'response.audio_transcript.done':
        console.log('[WebRTC Voice Agent] Assistant transcript completed:', event.transcript);
        if (event.transcript) {
          this.emit('assistantTranscript', { 
            text: event.transcript, 
            isFinal: true 
          });
          
          // Save assistant transcript as a message
          const assistantMessage: VoiceMessage = {
            id: event.item_id || `assistant_transcript_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'assistant',
            content: event.transcript,
            timestamp: new Date().toISOString()
          };
          
          // Add to session manager for persistence
          if (this.sessionManager) {
            console.log('[WebRTC Voice Agent] Saving assistant transcript to session manager:', assistantMessage.content);
            this.sessionManager.addMessage(assistantMessage);
          }
          
          // Add to conversation context for search awareness
          this.addToConversationContext(`Assistant: ${event.transcript}`);
        }
        break;
        
      case 'conversation.item.input_audio_transcription.completed':
        this.handleUserTranscriptCompleted(event);
        break;
        
      case 'conversation.item.input_audio_transcription.failed':
        this.handleUserTranscriptFailed(event);
        break;
        
      case 'conversation.item.input_audio_transcription.delta':
        this.handleUserTranscriptDelta(event);
        break;
        
      case 'response.created':
        // Track that a response is in progress
        this.activeResponseId = event.response?.id || null;
        this.isResponseInProgress = true;
        console.log('[WebRTC Voice Agent] Response started:', this.activeResponseId);
        break;
        
      case 'response.done':
      case 'response.cancelled':
      case 'response.interrupted':
        // Response is no longer in progress
        if (!this.activeResponseId || event.response?.id === this.activeResponseId) {
          this.isResponseInProgress = false;
          this.activeResponseId = null;
          console.log('[WebRTC Voice Agent] Response ended:', event.type, event.response?.id);
        }
        break;
        
        
      case 'error':
        // Reset response tracking on errors
        if (event.error?.message?.includes('active response in progress')) {
          console.log('[WebRTC Voice Agent] Resetting response tracking due to error');
          this.isResponseInProgress = false;
          this.activeResponseId = null;
        }
        this.handleRealtimeError(event);
        break;
        
      case 'rate_limits.updated':
        // This is just informational - don't trigger any connection changes
        console.log('[WebRTC Voice Agent] Rate limits updated:', {
          totalTokens: event.rate_limits?.total_tokens,
          totalTokensLimit: event.rate_limits?.total_token_limit,
          remainingTokens: event.rate_limits?.total_token_limit - event.rate_limits?.total_tokens
        });
        // Store rate limit info but don't disconnect
        if (event.rate_limits) {
          this.currentRateLimits = event.rate_limits;
        }
        break;
        
      default:
        console.log('Unhandled realtime event:', event.type, event);
    }
  }

  /**
   * Handle message creation events
   */
  private handleMessageCreated(event: any): void {
    console.log('[WebRTC Voice Agent] Message created event received:', event);
    const { item } = event;
    
    // Skip if no item or it's not a message type
    if (!item || item.type !== 'message') {
      console.log('[WebRTC Voice Agent] Skipping non-message item:', item?.type);
      return;
    }
    
    // Extract text content from various possible formats
    let messageText: string | null = null;
    
    if (item.role === 'user') {
      console.log('[WebRTC Voice Agent] Processing user message:', JSON.stringify(item, null, 2));
      
      // Try different content extraction methods
      if (Array.isArray(item.content)) {
        // Content is an array - find text content
        const textContent = item.content.find((c: any) => 
          c.type === 'input_text' || 
          c.type === 'text' || 
          c.type === 'input_audio_transcription'
        );
        
        if (textContent) {
          messageText = textContent.text || textContent.transcript || textContent.content;
        }
      } else if (typeof item.content === 'string') {
        // Content is a direct string
        messageText = item.content;
      } else if (item.content && typeof item.content === 'object') {
        // Content is an object - try to extract text
        messageText = item.content.text || item.content.transcript || item.content.content;
      }
      
      // Also check for formatted_content or transcript at the item level
      if (!messageText && item.formatted_content) {
        messageText = item.formatted_content;
      }
      if (!messageText && item.transcript) {
        messageText = item.transcript;
      }
      
      if (messageText) {
        console.log('[WebRTC Voice Agent] Extracted user message text:', messageText);
        this.emit('userTranscript', { text: messageText, isFinal: true });
        
        // Create message object and save to session manager
        const userMessage: VoiceMessage = {
          id: item.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'user',
          content: messageText,
          timestamp: new Date().toISOString()
        };
        
        // Add to session manager for persistence
        if (this.sessionManager) {
          console.log('[WebRTC Voice Agent] Saving user message to session manager:', userMessage.content);
          this.sessionManager.addMessage(userMessage);
        }
        
        // Add to conversation context for search awareness
        this.addToConversationContext(`User: ${messageText}`);
      } else {
        console.log('[WebRTC Voice Agent] Could not extract text from user message');
        console.log('[WebRTC Voice Agent] Item structure:', JSON.stringify(item, null, 2));
      }
      
    } else if (item.role === 'assistant') {
      console.log('[WebRTC Voice Agent] Processing assistant message:', JSON.stringify(item, null, 2));
      
      // Try different content extraction methods
      if (Array.isArray(item.content)) {
        // Content is an array - find text content
        const textContent = item.content.find((c: any) => 
          c.type === 'text' || 
          c.type === 'audio' // Sometimes audio items have transcript
        );
        
        if (textContent) {
          messageText = textContent.text || textContent.transcript || textContent.content;
        }
      } else if (typeof item.content === 'string') {
        // Content is a direct string
        messageText = item.content;
      } else if (item.content && typeof item.content === 'object') {
        // Content is an object - try to extract text
        messageText = item.content.text || item.content.transcript || item.content.content;
      }
      
      // Also check for formatted_content or transcript at the item level
      if (!messageText && item.formatted_content) {
        messageText = item.formatted_content;
      }
      if (!messageText && item.transcript) {
        messageText = item.transcript;
      }
      
      if (messageText) {
        console.log('[WebRTC Voice Agent] Extracted assistant message text:', messageText);
        this.emit('assistantTranscript', { text: messageText, isFinal: true });
        
        // Create message object and save to session manager
        const assistantMessage: VoiceMessage = {
          id: item.id || `assistant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'assistant',
          content: messageText,
          timestamp: new Date().toISOString()
        };
        
        // Add to session manager for persistence
        if (this.sessionManager) {
          console.log('[WebRTC Voice Agent] Saving assistant message to session manager:', assistantMessage.content);
          this.sessionManager.addMessage(assistantMessage);
        }
        
        // Add to conversation context for search awareness
        this.addToConversationContext(`Assistant: ${messageText}`);
      } else {
        console.log('[WebRTC Voice Agent] Could not extract text from assistant message');
        console.log('[WebRTC Voice Agent] Item structure:', JSON.stringify(item, null, 2));
      }
      
    } else if (item.role === 'system') {
      // Skip system messages - these are for context only
      console.log('[WebRTC Voice Agent] Skipping system message');
    } else {
      console.log('[WebRTC Voice Agent] Unhandled message role:', item.role);
    }
  }


  /**
   * Handle text delta events
   */
  private handleTextDelta(event: any): void {
    if (event.delta) {
      // Track first response for latency measurement
      if (event.response_id && !this.sessionMemory.has(`response_received_${event.response_id}`)) {
        const receiveTime = performance.now();
        this.sessionMemory.set(`response_received_${event.response_id}`, receiveTime);
        
        // Calculate latency if we have a corresponding send time
        const recentSends = Array.from(this.sessionMemory.keys())
          .filter(key => key.startsWith('message_sent_'))
          .map(key => ({ key, time: this.sessionMemory.get(key) as number }))
          .sort((a, b) => b.time - a.time);
        
        if (recentSends.length > 0) {
          const latency = receiveTime - recentSends[0].time;
          
          // Update recent latencies
          const recentLatencies = this.sessionMemory.get('recent_latencies') || [];
          recentLatencies.push(latency);
          
          // Keep only last 10 measurements
          if (recentLatencies.length > 10) {
            recentLatencies.shift();
          }
          
          this.sessionMemory.set('recent_latencies', recentLatencies);
          console.log(`[WebRTC Voice Agent] Response latency: ${Math.round(latency)}ms`);
        }
      }
      
      this.emit('assistantTranscript', { text: event.delta, isFinal: false });
    }
  }

  /**
   * Handle text completion events
   */
  private handleTextDone(event: any): void {
    if (event.text) {
      // Note: Message persistence is now handled in handleMessageCreated
      // This method only handles UI updates and conversation context
      
      this.emit('assistantTranscript', { text: event.text, isFinal: true });
      
      // Add to conversation context for search awareness
      this.addToConversationContext(`Assistant: ${event.text}`);
    }
  }

  /**
   * Handle function call arguments delta (streaming)
   */
  private handleFunctionCallDelta(event: any): void {
    console.log('[WebRTC Voice Agent] Function call arguments delta:', event);
    
    // Store partial function call data
    if (event.call_id && event.delta) {
      const existingCall = this.sessionMemory.get(`function_call_${event.call_id}`) || {
        name: event.name || '',
        arguments: ''
      };
      
      existingCall.arguments += event.delta;
      this.sessionMemory.set(`function_call_${event.call_id}`, existingCall);
    }
  }

  /**
   * Handle function call completion
   */
  private handleFunctionCallDone(event: any): void {
    console.log('[WebRTC Voice Agent] Function call done:', event);
    
    if (!event.call_id) {
      console.error('[WebRTC Voice Agent] Function call done event missing call_id');
      return;
    }

    try {
      // Get the complete function call data
      const storedCall = this.sessionMemory.get(`function_call_${event.call_id}`);
      let functionName = event.name;
      let functionArgs = event.arguments || '';

      // If we have stored data from delta events, use that
      if (storedCall) {
        functionName = storedCall.name || functionName;
        functionArgs = storedCall.arguments || functionArgs;
      }

      console.log('[WebRTC Voice Agent] Executing function call:', {
        name: functionName,
        arguments: functionArgs,
        callId: event.call_id
      });

      // Parse arguments
      let parsedArgs;
      try {
        parsedArgs = JSON.parse(functionArgs);
      } catch (parseError) {
        console.error('[WebRTC Voice Agent] Failed to parse function arguments:', parseError);
        this.sendFunctionCallError(event.call_id, 'Invalid function arguments format');
        return;
      }

      // Execute the function based on its name
      if (functionName === 'web_search') {
        this.executeWebSearch(event.call_id, parsedArgs);
      } else {
        console.error('[WebRTC Voice Agent] Unknown function name:', functionName);
        this.sendFunctionCallError(event.call_id, `Unknown function: ${functionName}`);
      }

      // Clean up stored data
      this.sessionMemory.delete(`function_call_${event.call_id}`);

    } catch (error) {
      console.error('[WebRTC Voice Agent] Error handling function call:', error);
      this.sendFunctionCallError(event.call_id, 'Function execution failed');
    }
  }

  /**
   * Execute web search function call
   * Note: Acknowledgment is now handled naturally by the OpenAI model through enhanced system prompts
   */
  private async executeWebSearch(callId: string, args: { query: string }): Promise<void> {
    try {
      console.log(`[WebRTC Voice Agent] Executing web search for query: "${args.query}"`);
      
      // Note: Audio feedback removed - OpenAI model now handles acknowledgments naturally
      // through enhanced system prompt instructions

      // Use environment-appropriate search endpoint
      const searchUrl = this.getSearchEndpoint();
      console.log('[WebRTC Voice Agent] Calling search endpoint:', searchUrl);
      
      // Make POST request with JSON body
      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: args.query
        })
      });
      
      const responseText = await response.text();
      console.log('[WebRTC Voice Agent] Received raw search result:', responseText);

      if (!response.ok) {
        throw new Error(`Search API responded with status ${response.status}: ${responseText}`);
      }

      const searchResult = JSON.parse(responseText);

      // Handle Responses API format with full search results
      if (searchResult.success === true && searchResult.response) {
        // Note: Success audio feedback removed - OpenAI model provides natural response
        
        // Send the complete search results including citations
        this.sendFunctionCallResult(callId, {
          success: true,
          query: args.query,
          response: searchResult.response,
          searchResults: searchResult.searchResults || [],
          citations: searchResult.citations || []
        });
      } else if (searchResult.success === false && searchResult.error) {
        throw new Error(searchResult.error);
      } else {
        throw new Error('Unexpected response format from search API');
      }

    } catch (error) {
      console.error('[WebRTC Voice Agent] Web search execution failed:', error);
      
      // Note: Error audio feedback removed - OpenAI model handles error communication
      
      this.sendFunctionCallResult(callId, {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred during the web search.',
        fallback: `I apologize, but my attempt to search for "${args.query}" failed.`
      });
    }
  }

    /**
   * Send function call result back to OpenAI
   */
    private sendFunctionCallResult(callId: string, result: any): void {
      const event: RealtimeEvent = {
        event_id: `func_result_${++this.messageSequence}`,
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output: JSON.stringify(result)
        }
      };
  
      console.log('[WebRTC Voice Agent] Sending function call result:', event);
      this.connection.sendEvent(event);
  
      // After providing the function result, we must explicitly ask the model to generate a new response.
      const responseEvent: RealtimeEvent = {
        event_id: `resp_after_func_${++this.messageSequence}`,
        type: 'response.create'
      };
      
      console.log('[WebRTC Voice Agent] Sending response.create event to process function result');
      this.connection.sendEvent(responseEvent);
    }

  /**
   * Get the appropriate search endpoint based on environment
   */
  private getSearchEndpoint(): string {
    // Use the Responses API endpoint with corrected web search implementation
    // This now properly implements the OpenAI Responses API with web_search tool
    return '/api/voice-agent/responses-search';
  }

  /**
   * Send function call error back to OpenAI
   */
  private sendFunctionCallError(callId: string, errorMessage: string): void {
    this.sendFunctionCallResult(callId, {
      success: false,
      error: errorMessage
    });
  }

  /**
   * Handle user transcript completion events
   */
  private handleUserTranscriptCompleted(event: any): void {
    console.log('[WebRTC Voice Agent] User transcript completed:', event);
    
    if (event.transcript) {
      this.emit('userTranscript', { 
        text: event.transcript, 
        isFinal: true 
      });
      console.log('[WebRTC Voice Agent] Emitted userTranscript (final):', event.transcript);
      
      // Also save this transcript as a message if we have an item_id
      // This ensures we capture transcripts even if conversation.item.created doesn't fire
      if (event.item_id) {
        const userMessage: VoiceMessage = {
          id: event.item_id || `user_transcript_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'user',
          content: event.transcript,
          timestamp: new Date().toISOString()
        };
        
        // Add to session manager for persistence
        if (this.sessionManager) {
          console.log('[WebRTC Voice Agent] Saving user transcript to session manager:', userMessage.content);
          this.sessionManager.addMessage(userMessage);
        }
      }
      
      // Add to conversation context for search awareness
      this.addToConversationContext(`User: ${event.transcript}`);
    }
  }

  /**
   * Handle user transcript delta events (streaming)
   */
  private handleUserTranscriptDelta(event: any): void {
    console.log('[WebRTC Voice Agent] User transcript delta:', event);
    
    if (event.delta) {
      this.emit('userTranscript', { 
        text: event.delta, 
        isFinal: false 
      });
      console.log('[WebRTC Voice Agent] Emitted userTranscript (partial):', event.delta);
    }
  }

  /**
   * Handle user transcript failure events
   */
  private handleUserTranscriptFailed(event: any): void {
    console.error('[WebRTC Voice Agent] User transcript failed:', event);
    
    const error: VoiceAssistantError = {
      code: 'transcription_failed',
      type: 'audio',
      message: event.error?.message || 'User audio transcription failed',
      recoverable: true,
      details: event
    };
    
    this.emit('error', error);
  }


  /**
   * Add message to conversation context
   */
  private addToConversationContext(message: string): void {
    this.conversationContext.push(message);
    
    // Keep only the last 10 messages to prevent context from getting too large
    if (this.conversationContext.length > 10) {
      this.conversationContext.shift();
    }
    
    console.log('[WebRTC Voice Agent] Updated conversation context:', this.conversationContext.slice(-3));
  }

  /**
   * Get conversation context for search
   */
  private getConversationContext(): string {
    // Return a summary of recent conversation for context
    // This helps the search API understand what the user is looking for
    return this.conversationContext.slice(-5).join('\n');
  }


  /**
   * Handle Realtime API errors
   */
  private handleRealtimeError(event: any): void {
    // Check if this is a session timeout error
    if (this.timeoutHandler.handleTimeoutError(event.error)) {
      console.log('[WebRTC Voice Agent] Session timeout detected, handler will manage reconnection');
      return; // Let the timeout handler manage this
    }
    
    const error = {
      type: 'api_error',
      message: event.error?.message || 'Unknown error',
      timestamp: Date.now(),
      details: event,
      recoverable: event.error?.code !== 'invalid_api_key'
    };
    
    this.handleError(error);
  }

  /**
   * Restore listening state after error recovery
   */
  private restoreListeningState(): void {
    console.log('[WebRTC Voice Agent] Restoring listening state after recovery');
    
    try {
      // Ensure microphone is still active and listening
      if (this.audioProcessor && this.connectionState === 'connected') {
        // Check if we need to restart listening
        const isCurrentlyListening = this.audioProcessor.isListening?.() || false;
        
        if (!isCurrentlyListening) {
          console.log('[WebRTC Voice Agent] Restarting microphone listening after recovery');
          this.audioProcessor.startListening?.();
        }
        
        // Send a session update to ensure the AI knows we're ready for input
        const sessionUpdateEvent = {
          event_id: `session_update_${++this.messageSequence}`,
          type: 'session.update',
          session: {
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 200
            }
          }
        };
        
        console.log('[WebRTC Voice Agent] Sending session update to restore responsiveness');
        this.connection.sendEvent(sessionUpdateEvent);
        
        // Also enable input audio buffer to ensure we can capture user speech
        const inputBufferEvent = {
          event_id: `input_buffer_enable_${++this.messageSequence}`,
          type: 'input_audio_buffer.clear'
        };
        
        this.connection.sendEvent(inputBufferEvent);
        
        // Emit a status event to let the UI know we're ready
        this.emit('agentReady', {
          message: 'Agent is now ready to receive input after recovery',
          timestamp: Date.now()
        });
        
      }
    } catch (error) {
      console.error('[WebRTC Voice Agent] Error restoring listening state:', error);
    }
  }

  /**
   * Update session configuration dynamically
   */
  updateSessionConfig(config: Partial<SessionConfig>): void {
    this.sessionConfig = {
      ...this.sessionConfig,
      ...config
    };

    // Send updated configuration if connected
    if (this.connectionState === 'connected') {
      const sessionUpdate: RealtimeEvent = {
        event_id: `session_update_${Date.now()}`,
        type: 'session.update',
        session: this.sessionConfig
      };
      
      this.connection.sendEvent(sessionUpdate);
      console.log('Updated session configuration:', config);
    }
  }

  /**
   * Change voice personality
   */
  changeVoice(voice: SessionConfig['voice']): void {
    this.updateSessionConfig({ voice });
  }

  /**
   * Adjust voice speed
   */
  setVoiceSpeed(speed: number): void {
    const clampedSpeed = Math.max(0.25, Math.min(1.5, speed));
    this.updateSessionConfig({ speed: clampedSpeed });
  }

  /**
   * Set noise reduction mode
   * Note: OpenAI Realtime API supports input_audio_noise_reduction parameter
   */
  setNoiseReduction(mode: 'near_field' | 'far_field' | 'auto'): void {
    if (mode === 'auto') {
      // Auto mode is not supported by the API, default to near_field
      console.log('Auto mode not supported by API, defaulting to near_field');
      this.updateSessionConfig({ 
        input_audio_noise_reduction: { type: 'near_field' }
      });
    } else {
      this.updateSessionConfig({ 
        input_audio_noise_reduction: { type: mode }
      });
    }
  }

  /**
   * Enable/disable session memory
   * Note: Session memory is managed locally, not via API parameter
   */
  setSessionMemory(enabled: boolean): void {
    // Session memory is not a server-side parameter in OpenAI Realtime API
    // We manage conversation context locally
    if (enabled) {
      // Persist conversation context locally
      this.conversationContext = this.conversationContext.slice(-10); // Keep last 10 exchanges
      console.log('Session memory enabled (local management)');
    } else {
      this.conversationContext = [];
      console.log('Session memory disabled');
    }
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): typeof this.performanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get session statistics (enhanced version)
   */
  getSessionStats(): any {
    const sessionManagerStats = this.sessionManager ? this.sessionManager.getSessionStats() : {
      isActive: false,
      sessionId: null,
      messageCount: 0,
      duration: 0,
      reconnectAttempts: 0,
      tokenExpiresIn: 0
    };
    const localStats = {
      sessionId: this.sessionId,
      duration: Date.now() - (this.sessionMemory.get('session_start') || Date.now()),
      messageCount: this.messageSequence,
      errors: this.sessionMemory.get('error_count') || 0,
      avgLatency: this.performanceMetrics.latency
    };
    
    // Merge session manager stats with local stats
    return {
      ...sessionManagerStats,
      ...localStats,
      messageCount: Math.max(sessionManagerStats.messageCount, localStats.messageCount)
    };
  }

  /**
   * Handle incoming audio stream
   */
  private handleIncomingAudio(stream: MediaStream): void {
    console.log('[WebRTC Voice Agent] Incoming audio stream received, setting up playback');
    
    // Create or get audio element for playback
    let audioElement = document.getElementById('voice-agent-audio') as HTMLAudioElement;
    
    if (!audioElement) {
      audioElement = document.createElement('audio');
      audioElement.id = 'voice-agent-audio';
      audioElement.autoplay = true;
      audioElement.muted = false; // Ensure not muted
      audioElement.volume = 1.0; // Ensure full volume
      audioElement.setAttribute('playsinline', 'true'); // For iOS
      // Add to body but hidden (audio only)
      audioElement.style.display = 'none';
      document.body.appendChild(audioElement);
      
      // Add event listeners for debugging
      audioElement.addEventListener('play', () => {
        console.log('[WebRTC Voice Agent] Audio element started playing');
      });
      
      audioElement.addEventListener('pause', () => {
        console.log('[WebRTC Voice Agent] Audio element paused');
      });
      
      audioElement.addEventListener('error', (e) => {
        console.error('[WebRTC Voice Agent] Audio element error:', e);
      });
    }
    
    // Connect the stream to the audio element
    audioElement.srcObject = stream;
    
    // Ensure playback starts
    audioElement.play().catch(async (error) => {
      console.error('[WebRTC Voice Agent] Error starting audio playback:', error);
      
      // Try to resume audio context first
      if (this.audioProcessor.context.state === 'suspended') {
        try {
          await this.audioProcessor.context.resume();
          console.log('[WebRTC Voice Agent] Audio context resumed');
          // Retry playback
          audioElement.play().catch((retryError) => {
            console.error('[WebRTC Voice Agent] Retry failed:', retryError);
          });
        } catch (resumeError) {
          console.error('[WebRTC Voice Agent] Failed to resume audio context:', resumeError);
        }
      }
      
      // Some browsers require user interaction first
      this.emit('error', {
        code: 'audio_playback_failed',
        type: 'audio',
        message: 'Audio playback requires user interaction',
        details: error,
        recoverable: true
      });
    });
    
    console.log('[WebRTC Voice Agent] Audio playback configured for WebRTC stream');
  }

  /**
   * Handle errors with recovery
   */
  private async handleError(error: { type: string; message: string; timestamp: number; details?: any; recoverable: boolean }): Promise<void> {
    console.error('WebRTC Voice Agent Error:', error);
    
    // Convert to VoiceAssistantError format for the event
    const assistantError: VoiceAssistantError = {
      code: error.type,
      message: error.message,
      type: error.type as any,
      recoverable: error.recoverable,
      details: error.details
    };
    
    this.emit('error', assistantError);
    
    // Don't attempt recovery if we're already initializing or disconnected
    if (this.isInitializing || this.connectionState === 'disconnected') {
      console.log('[WebRTC Voice Agent] Skipping error recovery - already initializing or disconnected');
      return;
    }
    
    if (error.recoverable) {
      try {
        await this.errorRecovery.handleError(error as any);
      } catch (recoveryError) {
        console.error('Recovery failed:', recoveryError);
      }
    }
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<void> {
    try {
      // Clear existing timer
      if (this.tokenManager.refreshTimer) {
        clearTimeout(this.tokenManager.refreshTimer);
      }
      
      const response = await fetch(`${this.config.apiEndpoint}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: this.sessionId || undefined
        })
      });
      
      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      this.tokenManager.token = data.token;
      // Use the actual expiration from the server (30 minutes) minus 5 minutes buffer
      this.tokenManager.expiresAt = data.expiresAt || (Date.now() + (25 * 60 * 1000));
      this.sessionId = data.session_id || this.sessionId;
      
      // Schedule next refresh - 5 minutes before actual expiry
      const refreshIn = Math.max(
        (this.tokenManager.expiresAt - Date.now()) - (5 * 60 * 1000),
        60 * 1000 // Minimum 1 minute delay
      );
      this.tokenManager.refreshTimer = setTimeout(() => {
        this.refreshToken().catch(console.error);
      }, refreshIn);
      
      console.log('Token refreshed successfully (mode: realtime)');
      
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  }

  /**
   * Reconnect to the service
   */
  async reconnect(): Promise<void> {
    // Prevent recursive reconnection
    if (this.isInitializing) {
      console.log('[WebRTC Voice Agent] Already reconnecting, skipping');
      return;
    }
    
    await this.disconnect();
    // Small delay to ensure clean disconnect
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.initialize();
  }

  /**
   * Update connection state
   */
  private updateConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      const previousState = this.connectionState;
      this.connectionState = state;
      
      // Update session manager with connection state
      if (this.sessionManager) {
        this.sessionManager.updateConnectionState(state);
      }
      
      this.emit('connectionStateChanged', state);
      
      console.log(`[WebRTC Voice Agent] Connection state changed: ${previousState} -> ${state}`);
    }
  }

  /**
   * Update conversation state
   */
  private updateConversationState(state: ConversationState): void {
    if (this.conversationState !== state) {
      const previousState = this.conversationState;
      this.conversationState = state;
      
      // Update session manager with conversation state
      if (this.sessionManager) {
        this.sessionManager.updateConversationState(state);
      }
      
      this.emit('conversationStateChanged', state);
      
      console.log(`[WebRTC Voice Agent] Conversation state changed: ${previousState} -> ${state}`);
    }
  }

  /**
   * Get current status
   */
  getStatus(): {
    connectionState: ConnectionState;
    conversationState: ConversationState;
    networkQuality: any;
    audioLevel: number;
    recoveryStatus: any;
  } {
    return {
      connectionState: this.connectionState,
      conversationState: this.conversationState,
      networkQuality: null, // this.networkMonitor.getQualityMetrics(),
      audioLevel: 0, // Get from audio processor
      recoveryStatus: this.errorRecovery.getRecoveryStatus()
    };
  }

  /**
   * Ensure audio playback is working after recovery
   */
  private async ensureAudioPlayback(): Promise<void> {
    console.log('[WebRTC Voice Agent] Ensuring audio playback after recovery');
    
    // Check if we have an audio element
    const audioElement = document.getElementById('voice-agent-audio') as HTMLAudioElement;
    
    if (audioElement) {
      // Check if we have a valid source
      if (!audioElement.srcObject || (audioElement.srcObject as MediaStream).getTracks().length === 0) {
        console.warn('[WebRTC Voice Agent] Audio element has no valid source, attempting to restore');
        
        // First try to get the stored remote stream from the connection
        const remoteStream = this.connection?.getRemoteAudioStream?.();
        if (remoteStream && remoteStream.getTracks().length > 0) {
          console.log('[WebRTC Voice Agent] Restoring audio stream from connection');
          audioElement.srcObject = remoteStream;
        } else {
          // Fallback: try to get tracks from peer connection
          const remoteTracks = this.connection?.getRemoteTracks?.();
          if (remoteTracks && remoteTracks.length > 0) {
            console.log('[WebRTC Voice Agent] Creating new stream from remote tracks');
            const newStream = new MediaStream(remoteTracks);
            audioElement.srcObject = newStream;
          } else {
            console.error('[WebRTC Voice Agent] No remote audio available for restoration');
          }
        }
      }
      
      // Check if audio is paused
      if (audioElement.paused) {
        console.log('[WebRTC Voice Agent] Audio was paused, attempting to resume');
        audioElement.play().then(() => {
          console.log('[WebRTC Voice Agent] Audio playback resumed successfully');
        }).catch(error => {
          console.warn('[WebRTC Voice Agent] Failed to resume audio:', error);
        });
      }
      
      // Ensure volume is up
      if (audioElement.volume < 1.0) {
        console.log('[WebRTC Voice Agent] Restoring audio volume to 1.0');
        audioElement.volume = 1.0;
      }
      
      // Ensure not muted
      if (audioElement.muted) {
        console.log('[WebRTC Voice Agent] Unmuting audio');
        audioElement.muted = false;
      }
    } else {
      console.warn('[WebRTC Voice Agent] No audio element found during recovery, creating new one');
      
      // Try to create audio element with remote stream
      const remoteStream = this.connection?.getRemoteAudioStream?.();
      if (remoteStream && remoteStream.getTracks().length > 0) {
        console.log('[WebRTC Voice Agent] Creating audio element with stored remote stream');
        this.handleIncomingAudio(remoteStream);
      } else {
        // Fallback: try to recreate from remote tracks
        const remoteTracks = this.connection?.getRemoteTracks?.();
        if (remoteTracks && remoteTracks.length > 0) {
          console.log('[WebRTC Voice Agent] Creating audio element with remote tracks');
          const newStream = new MediaStream(remoteTracks);
          this.handleIncomingAudio(newStream);
        } else {
          console.error('[WebRTC Voice Agent] Cannot restore audio - no remote stream or tracks available');
        }
      }
    }
    
    // Ensure audio context is ready (recreate if closed, resume if suspended)
    // Don't try to resume suspended context during recovery - wait for user interaction
    if (this.audioProcessor) {
      await this.audioProcessor.ensureAudioContext(false);
    }
    
    // DO NOT send a test message after recovery - it confuses the conversation flow
    // The agent should be ready to respond to actual user input instead
    console.log('[WebRTC Voice Agent] Audio recovery complete - agent ready for user input');
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    try {
      console.log('[WebRTC Voice Agent] Disconnecting...');
      
      // Reset initialization flags
      this.isInitialized = false;
      this.isInitializing = false;
      
      // Reset session restoration flags
      this.isSessionCreated = false;
      this.pendingHistoryInjection = [];
      
      // Stop timeout tracking
      this.timeoutHandler.stopSession();
      
      // Stop recording before disconnecting
      this.audioProcessor.stopRecording();
      this.updateConversationState('idle');
      this.updateConnectionState('disconnected');
      
      // End session but preserve data for potential restoration
      if (this.sessionManager) {
        await this.sessionManager.endSession();
      }
      
      // Clean up audio element
      const audioElement = document.getElementById('voice-agent-audio') as HTMLAudioElement;
      if (audioElement) {
        audioElement.pause();
        audioElement.srcObject = null;
        audioElement.remove();
      }
      
      await this.connection.disconnect();
      await this.audioProcessor.cleanup();
      this.networkMonitor.cleanup();
      this.errorRecovery.cleanup();
      
      console.log('[WebRTC Voice Agent] Disconnected successfully');
      
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }


  /**
   * Setup timeout handler events with voice-aware messaging
   */
  private setupTimeoutHandlerEvents(): void {
    // Warning event - use voice to notify user
    this.timeoutHandler.on('warning', async (remainingMinutes) => {
      console.log(`[WebRTC Voice Agent] Session timeout warning: ${remainingMinutes} minutes remaining`);
      
      // Inject warning with proper response tracking
      await this.injectTimeoutWarning(remainingMinutes);
    });
    
    // Timeout event - trigger proactive reconnection with voice announcement
    this.timeoutHandler.on('timeout', async () => {
      console.log('[WebRTC Voice Agent] Session timeout reached, initiating proactive reconnection');
      
      // Announce reconnection via voice
      await this.injectReconnectionMessage();
      
      // Save current session state
      if (this.sessionManager) {
        await this.sessionManager.saveSession();
      }
      
      // Small delay to allow voice message to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Trigger reconnection
      await this.handleSessionTimeout();
    });
    
    // Reconnected event with voice confirmation
    this.timeoutHandler.on('reconnected', () => {
      console.log('[WebRTC Voice Agent] Session successfully refreshed after timeout');
      
      // Wait a moment for connection to stabilize before speaking
      setTimeout(async () => {
        await this.injectReconnectionSuccessMessage();
      }, 1000);
    });
  }

  /**
   * Inject timeout warning message for voice output
   */
  private async injectTimeoutWarning(remainingMinutes: number): Promise<void> {
    if (this.connectionState !== 'connected' || !this.connection.sendEvent) {
      console.log('[WebRTC Voice Agent] Cannot inject timeout warning - not connected');
      return;
    }

    // Wait for any active response to complete first
    if (this.isResponseInProgress) {
      console.log('[WebRTC Voice Agent] Waiting for active response to complete before injecting warning');
      await this.waitForResponseCompletion();
    }

    try {
      const warningText = remainingMinutes === 1 
        ? "Just to let you know, our session will need to refresh in about 1 minute to continue our conversation. Don't worry, I'll handle it seamlessly and we can pick up right where we left off."
        : `Just to let you know, our session will need to refresh in about ${remainingMinutes} minutes to continue our conversation. I'll take care of it automatically when the time comes.`;

      // Create an assistant message directly - this will be spoken by the voice agent
      const assistantMessageEvent: RealtimeEvent = {
        event_id: `timeout_warning_${++this.messageSequence}`,
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'assistant',
          content: [{
            type: 'text',
            text: warningText
          }]
        }
      };

      console.log('[WebRTC Voice Agent] Injecting timeout warning as assistant message:', warningText);
      console.log('[WebRTC Voice Agent] Sending conversation.item.create event:', assistantMessageEvent);
      this.connection.sendEvent(assistantMessageEvent);

      // Create and send a response.create event to trigger the assistant to speak
      const responseEvent: RealtimeEvent = {
        event_id: `timeout_warning_resp_${++this.messageSequence}`,
        type: 'response.create'
      };

      // Small delay to ensure the message is created before triggering response
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('[WebRTC Voice Agent] Triggering voice response for timeout warning');
      this.connection.sendEvent(responseEvent);

    } catch (error) {
      console.error('[WebRTC Voice Agent] Failed to inject timeout warning:', error);
    }
  }
  
  /**
   * Wait for any active response to complete
   */
  private async waitForResponseCompletion(maxWaitMs: number = 10000): Promise<void> {
    const startTime = Date.now();
    
    while (this.isResponseInProgress && (Date.now() - startTime) < maxWaitMs) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (this.isResponseInProgress) {
      console.log('[WebRTC Voice Agent] Warning: Response still in progress after waiting');
    }
  }

  /**
   * Inject reconnection message for voice output
   */
  private async injectReconnectionMessage(): Promise<void> {
    if (this.connectionState !== 'connected' || !this.connection.sendEvent) {
      console.log('[WebRTC Voice Agent] Cannot inject reconnection message - not connected');
      return;
    }

    // Wait for any active response to complete first
    if (this.isResponseInProgress) {
      console.log('[WebRTC Voice Agent] Waiting for active response to complete before reconnection message');
      await this.waitForResponseCompletion();
    }

    try {
      const reconnectText = "I'm refreshing our connection now to continue our conversation smoothly. This will just take a moment.";

      // Create assistant message directly - this will be spoken by the voice agent
      const assistantMessageEvent: RealtimeEvent = {
        event_id: `reconnect_msg_${++this.messageSequence}`,
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'assistant',
          content: [{
            type: 'text',
            text: reconnectText
          }]
        }
      };

      console.log('[WebRTC Voice Agent] Injecting reconnection assistant message');
      this.connection.sendEvent(assistantMessageEvent);

      // Create and send a response.create event to trigger the assistant to speak
      const responseEvent: RealtimeEvent = {
        event_id: `reconnect_resp_${++this.messageSequence}`,
        type: 'response.create'
      };

      // Small delay to ensure the message is created before triggering response
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('[WebRTC Voice Agent] Triggering voice response for reconnection message');
      this.connection.sendEvent(responseEvent);

    } catch (error) {
      console.error('[WebRTC Voice Agent] Failed to inject reconnection message:', error);
    }
  }

  /**
   * Inject reconnection success message for voice output
   */
  private async injectReconnectionSuccessMessage(): Promise<void> {
    if (this.connectionState !== 'connected' || !this.connection.sendEvent) {
      console.log('[WebRTC Voice Agent] Cannot inject success message - not connected');
      return;
    }

    // Wait for any active response to complete first
    if (this.isResponseInProgress) {
      console.log('[WebRTC Voice Agent] Waiting for active response to complete before success message');
      await this.waitForResponseCompletion();
    }

    try {
      const successText = "Perfect! I'm ready to continue our conversation. How can I help you?";

      // Create assistant message directly - this will be spoken by the voice agent
      const assistantMessageEvent: RealtimeEvent = {
        event_id: `success_msg_${++this.messageSequence}`,
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'assistant',
          content: [{
            type: 'text',
            text: successText
          }]
        }
      };

      console.log('[WebRTC Voice Agent] Injecting reconnection success assistant message');
      this.connection.sendEvent(assistantMessageEvent);

      // Create and send a response.create event to trigger the assistant to speak
      const responseEvent: RealtimeEvent = {
        event_id: `success_resp_${++this.messageSequence}`,
        type: 'response.create'
      };

      // Small delay to ensure the message is created before triggering response
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('[WebRTC Voice Agent] Triggering voice response for reconnection success');
      this.connection.sendEvent(responseEvent);

    } catch (error) {
      console.error('[WebRTC Voice Agent] Failed to inject success message:', error);
    }
  }
  
  /**
   * Handle session timeout
   */
  private async handleSessionTimeout(): Promise<void> {
    try {
      // Stop current session gracefully
      this.timeoutHandler.stopSession();
      
      // Disconnect current connection
      await this.connection.disconnect();
      
      // Get new token
      await this.refreshToken();
      
      // Reconnect with new session
      await this.performConnection(true); // Resume existing conversation
      
      // Reset timeout handler for new session
      this.timeoutHandler.resetSession();
      
    } catch (error) {
      console.error('[WebRTC Voice Agent] Failed to handle session timeout:', error);
      await this.handleError({
        type: 'connection_failed',
        message: 'Failed to refresh session after timeout',
        timestamp: Date.now(),
        details: error,
        recoverable: true
      });
    }
  }

  /**
   * Check if reconnection is needed
   */
  needsReconnection(): boolean {
    return this.sessionManager ? this.sessionManager.needsReconnection() : false;
  }

  /**
   * Clean up everything (complete reset)
   */
  async cleanup(): Promise<void> {
    console.log('[WebRTC Voice Agent] Complete cleanup initiated');
    
    // Clean up timeout handler
    this.timeoutHandler.destroy();
    
    await this.disconnect();
    if (this.sessionManager) {
      this.sessionManager.clearAllSessionData();
      this.sessionManager.cleanup();
    }
    
    console.log('[WebRTC Voice Agent] Complete cleanup finished');
  }

}

// Export factory function
export function createWebRTCVoiceAgent(config: VoiceConfig): WebRTCVoiceAgent {
  return new WebRTCVoiceAgent(config);
}

// Export for global access during debugging
if (typeof window !== 'undefined') {
  (window as any).WebRTCVoiceAgent = WebRTCVoiceAgent;
}

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 12.0.0
 * @author: engineer-agent  
 * @cc-sessionId: cc-eng-20250817-pause-fix
 * @timestamp: 2025-08-17T14:00:00Z
 * @reasoning:
 * - **Objective:** Fix critical WebRTC pause/resume data channel disconnection issue
 * - **Strategy:** Conditional event sending based on active response state + proper OpenAI protocol compliance
 * - **Outcome:** Pause/resume now works without breaking WebRTC connection or triggering auto-recovery
 * 
 * Critical fixes implemented:
 * - Fixed pauseSession() to only send response.cancel + output_audio_buffer.clear when there's an active response
 * - Added response_id parameter to response.cancel events as per OpenAI documentation
 * - Enhanced resumeSession() with session.update to restore OpenAI responsiveness
 * - Fixed method naming conflict (isSessionPaused -> getSessionPausedState)
 * - Added proper response tracking for output_audio_buffer.cleared events
 * 
 * Root cause analysis:
 * - OpenAI Realtime API treats response.cancel/output_audio_buffer.clear as errors when no response is active
 * - This causes immediate data channel closure and connection termination
 * - Previous implementation always sent these events regardless of response state
 * 
 * Technical implementation:
 * - Response state validation: Only send cancel/clear if this.isResponseInProgress && this.activeResponseId
 * - Proper event sequence: response.cancel with response_id, then output_audio_buffer.clear
 * - Session restoration: session.update event on resume to ensure OpenAI knows we're ready
 * - Enhanced logging for debugging pause/resume behavior
 * 
 * Compliance with OpenAI documentation:
 * - "This event should be preceded by a response.cancel client event" - now properly implemented
 * - No events sent when no response is active - prevents data channel errors
 * - Maintains WebRTC connection during pause - only stops local audio processing
 * 
 * Previous revision (11.0.0):
 * - Voice-aware session timeout handling
 * - Improved timeout warnings and reconnection messages
 */