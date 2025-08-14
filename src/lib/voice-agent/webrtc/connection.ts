/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: WebRTC connection manager for OpenAI Realtime API
 * @version: 1.0.0
 * @init-author: engineer-agent
 * @init-cc-sessionId: cc-eng-20250801-001
 * @init-timestamp: 2025-08-01T12:00:00Z
 * @reasoning:
 * - **Objective:** Establish reliable WebRTC connection to OpenAI Realtime API
 * - **Strategy:** Implement robust connection management with error handling
 * - **Outcome:** Stable real-time voice communication channel
 */

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.1
 * @author: engineer-agent
 * @cc-sessionId: cc-eng-20250801-002
 * @timestamp: 2025-08-01T14:30:00Z
 * @reasoning:
 * - **Objective:** Fix WebRTC 401 errors and rate limiting issues
 * - **Strategy:** Implement proper ephemeral token flow and exponential backoff
 * - **Outcome:** Robust connection handling with WebSocket signaling
 */

import type { 
  ConnectionState, 
  ConnectionInfo, 
  EphemeralToken,
  VoiceAgentError,
  ErrorInfo,
  SessionConfig
} from '../../../features/voice-agent/types/index';

/**
 * WebRTC Connection Manager for OpenAI Realtime API
 * Handles peer connection setup, token management, and connection state
 */
export class WebRTCConnection {
  private _peerConnection: RTCPeerConnection | null = null;
  private _dataChannel: RTCDataChannel | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private currentToken: EphemeralToken | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;
  private eventListeners: Map<string, Function[]> = new Map();
  private sessionConfig: SessionConfig | null = null;
  private remoteAudioStream: MediaStream | null = null; // Store remote audio stream
  private isConnecting = false; // Prevent multiple simultaneous connections

  constructor(
    private readonly maxReconnects: number = 3,
    private readonly baseReconnectDelay: number = 1000
  ) {
    this.maxReconnectAttempts = maxReconnects;
    this.reconnectDelay = baseReconnectDelay;
  }

  /**
   * Set session configuration
   */
  setSessionConfig(config: SessionConfig): void {
    this.sessionConfig = config;
  }

  /**
   * Initialize WebRTC connection with OpenAI Realtime API
   */
  async connect(token: EphemeralToken, audioStream?: MediaStream, sessionConfig?: SessionConfig): Promise<void> {
    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      console.log('[WebRTC Connection] Connection already in progress, skipping duplicate attempt');
      return;
    }
    
    // Clean up any existing connection first
    if (this._peerConnection) {
      console.log('[WebRTC Connection] Cleaning up existing connection before new attempt');
      await this.disconnect();
    }
    
    this.isConnecting = true;
    
    try {
      this.currentToken = token;
      if (sessionConfig) {
        this.sessionConfig = sessionConfig;
      }
      this.updateConnectionState('connecting');

      // Create peer connection with optimized configuration
      this._peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
      });

      // Set up event handlers
      this.setupPeerConnectionHandlers();

      // Create data channel for OpenAI Realtime protocol
      this._dataChannel = this._peerConnection.createDataChannel('oai-events', {
        ordered: true
      });

      this.setupDataChannelHandlers();

      // Add local audio track BEFORE creating offer (as per OpenAI docs)
      if (audioStream && audioStream.getAudioTracks().length > 0) {
        const audioTrack = audioStream.getAudioTracks()[0];
        const sender = this._peerConnection.addTrack(audioTrack, audioStream);
        console.log('Added local audio track to peer connection:', {
          trackId: audioTrack.id,
          trackState: audioTrack.readyState,
          trackMuted: audioTrack.muted,
          senderActive: sender.track?.enabled
        });
      }

      // Ensure we have an audio transceiver for bidirectional audio
      const transceivers = this._peerConnection.getTransceivers();
      console.log('Current transceivers:', transceivers.length);
      
      // If no audio transceiver exists, add one explicitly
      if (!transceivers.some(t => t.receiver.track?.kind === 'audio')) {
        const transceiver = this._peerConnection.addTransceiver('audio', {
          direction: 'sendrecv'
        });
        console.log('Added audio transceiver with direction: sendrecv');
      }

      // Create offer and connect to OpenAI
      // IMPORTANT: For OpenAI Realtime API, we MUST receive audio to hear responses
      const offer = await this._peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });

      await this._peerConnection.setLocalDescription(offer);
      
      // Log SDP details for debugging
      console.log('SDP Offer created:', {
        hasAudio: offer.sdp?.includes('m=audio'),
        audioCodecs: offer.sdp?.match(/a=rtpmap:\d+ ([\w-]+)\//g)?.map(c => c.split(' ')[1].split('/')[0]),
        hasDataChannel: offer.sdp?.includes('application/webrtc-datachannel')
      });

      // Connect to OpenAI WebRTC endpoint
      await this.connectToOpenAI(offer, token);

    } catch (error) {
      await this.handleConnectionError(error);
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Connect to OpenAI WebRTC endpoint
   * Uses ephemeral token to establish WebRTC connection
   */
  private async connectToOpenAI(offer: RTCSessionDescriptionInit, token: EphemeralToken): Promise<void> {
    try {
      console.log('Connecting to OpenAI Realtime WebRTC...');
      
      // Following the official OpenAI documentation for WebRTC connection
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      
      // Send the SDP offer to OpenAI
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          "Authorization": `Bearer ${token.token}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        console.error('SDP exchange failed:', sdpResponse.status, errorText);
        throw new Error(`WebRTC setup failed: ${sdpResponse.status} - ${errorText}`);
      }

      // Get the SDP answer
      const answerSdp = await sdpResponse.text();
      console.log('Received SDP answer from OpenAI');
      
      // Set the remote description
      const answer: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: answerSdp,
      };

      await this._peerConnection!.setRemoteDescription(answer);
      console.log('Remote description set successfully');
      
      // Log the answer SDP details
      console.log('SDP Answer received:', {
        hasAudio: answer.sdp?.includes('m=audio'),
        audioDirection: answer.sdp?.match(/a=sendrecv|a=sendonly|a=recvonly|a=inactive/g),
        audioCodecs: answer.sdp?.match(/a=rtpmap:\d+ ([\w-]+)\//g)?.map(c => c.split(' ')[1].split('/')[0])
      });
      
      // Check transceivers after setting remote description
      const transceivers = this._peerConnection!.getTransceivers();
      transceivers.forEach((transceiver, index) => {
        console.log(`Transceiver ${index}:`, {
          mid: transceiver.mid,
          direction: transceiver.direction,
          currentDirection: transceiver.currentDirection,
          receiverTrackKind: transceiver.receiver.track?.kind,
          receiverTrackState: transceiver.receiver.track?.readyState
        });
      });
      
      // Don't immediately set to connected - wait for WebRTC peer connection to be established
      // The onconnectionstatechange handler will set the final connected state
      console.log('[WebRTC Connection] SDP exchange complete, waiting for peer connection establishment...');
      this.resetReconnectAttempts();
      
    } catch (error) {
      console.error('OpenAI WebRTC connection failed:', error);
      throw error;
    }
  }



  /**
   * Set up peer connection event handlers
   */
  private setupPeerConnectionHandlers(): void {
    if (!this._peerConnection) return;

    this._peerConnection.onconnectionstatechange = () => {
      const state = this._peerConnection?.connectionState;
      console.log('[WebRTC Connection] Peer connection state changed to:', state);
      
      switch (state) {
        case 'connected':
          console.log('[WebRTC Connection] Successfully connected - emitting connected event');
          this.updateConnectionState('connected');
          this.emit('connected');
          break;
        case 'disconnected':
          console.log('[WebRTC Connection] Disconnected - emitting disconnected event');
          this.updateConnectionState('disconnected');
          this.emit('disconnected');
          this.attemptReconnection();
          break;
        case 'failed':
          console.log('[WebRTC Connection] Connection failed - emitting failed event');
          this.updateConnectionState('failed');
          this.emit('failed');
          this.attemptReconnection();
          break;
        case 'closed':
          console.log('[WebRTC Connection] Connection closed - emitting closed event');
          this.updateConnectionState('disconnected');
          this.emit('closed');
          break;
        default:
          console.log('[WebRTC Connection] Unhandled connection state:', state);
      }
    };

    this._peerConnection.oniceconnectionstatechange = () => {
      const state = this._peerConnection?.iceConnectionState;
      console.log('ICE connection state:', state);
    };

    this._peerConnection.ondatachannel = (event) => {
      const channel = event.channel;
      this.setupDataChannelHandlers(channel);
    };

    this._peerConnection.ontrack = (event) => {
      console.log('[WebRTC Connection] Received remote track event:', {
        trackKind: event.track.kind,
        trackId: event.track.id,
        streamCount: event.streams.length,
        trackState: event.track.readyState
      });
      
      if (event.track.kind === 'audio' && event.streams[0]) {
        console.log('[WebRTC Connection] Emitting audio track for playback');
        // Store the remote audio stream for later use (e.g., during recovery)
        this.remoteAudioStream = event.streams[0];
        // The remote audio track from OpenAI
        // The parent component should connect this to an audio element
        this.emit('audioTrack', event.streams[0]);
      }
    };
  }

  /**
   * Get the stored remote audio stream
   */
  getRemoteAudioStream(): MediaStream | null {
    return this.remoteAudioStream;
  }

  /**
   * Get all remote audio tracks from the peer connection
   */
  getRemoteTracks(): MediaStreamTrack[] {
    const tracks: MediaStreamTrack[] = [];
    
    if (this._peerConnection) {
      // Get all receivers and extract their tracks
      const receivers = this._peerConnection.getReceivers();
      receivers.forEach(receiver => {
        if (receiver.track && receiver.track.kind === 'audio') {
          tracks.push(receiver.track);
        }
      });
    }
    
    return tracks;
  }

  /**
   * Set up data channel handlers for OpenAI events
   */
  private setupDataChannelHandlers(channel?: RTCDataChannel): void {
    const dataChannel = channel || this._dataChannel;
    if (!dataChannel) return;

    dataChannel.onopen = () => {
      console.log('Data channel opened - ready to send/receive Realtime API events');
      this.emit('dataChannelOpen');
      
      // Send initial session configuration using the provided session config
      // The sessionConfig should be set from the connect() call
      if (!this.sessionConfig) {
        console.error('[WebRTCConnection] No session config provided - this should not happen');
        // Use minimal fallback if somehow no config was provided
        this.sessionConfig = {
          modalities: ['text', 'audio'],
          instructions: 'You are a helpful AI assistant.',
          voice: 'shimmer',
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: {
            model: 'whisper-1'
          },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 600
          },
          tools: [],
          tool_choice: 'auto',
          temperature: 0.8,
          max_response_output_tokens: 'inf'
        };
      }
      
      // Send the session configuration
      const sessionUpdate = {
        type: 'session.update',
        session: this.sessionConfig
      };
      
      // Log what instructions are being sent
      console.log('[WebRTCConnection] Sending session update with instructions:', {
        instructionsLength: this.sessionConfig.instructions?.length,
        instructionsPreview: this.sessionConfig.instructions?.substring(0, 200) + '...',
        voice: this.sessionConfig.voice,
        tools: this.sessionConfig.tools?.map(t => t.name)
      });
      
      dataChannel.send(JSON.stringify(sessionUpdate));
      console.log('[WebRTCConnection] Session configuration sent successfully');
    };

    dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit('realtimeEvent', data);
      } catch (error) {
        console.error('Failed to parse realtime event:', error);
      }
    };

    dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
      this.emit('dataChannelError', error);
    };

    dataChannel.onclose = () => {
      console.log('Data channel closed');
      this.emit('dataChannelClose');
    };
  }

  /**
   * Send event through WebSocket connection
   */
  sendEvent(event: any): void {
    // Send events through the WebRTC data channel
    if (this._dataChannel && this._dataChannel.readyState === 'open') {
      try {
        this._dataChannel.send(JSON.stringify(event));
        console.log('Sent event:', event.type);
      } catch (error) {
        console.error('Failed to send event via data channel:', error);
      }
    } else {
      console.warn('Data channel not ready, event not sent:', event);
    }
  }


  /**
   * Attempt reconnection with exponential backoff
   */
  private async attemptReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.updateConnectionState('failed');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    this.updateConnectionState('reconnecting');

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(async () => {
      if (this.currentToken && this.isTokenValid(this.currentToken)) {
        await this.connect(this.currentToken);
      } else {
        // Request new token
        this.emit('tokenExpired');
      }
    }, delay);
  }

  /**
   * Check if token is still valid
   */
  private isTokenValid(token: EphemeralToken): boolean {
    return Date.now() < token.expiresAt - 30000; // 30 second buffer
  }

  /**
   * Reset reconnection attempts
   */
  private resetReconnectAttempts(): void {
    this.reconnectAttempts = 0;
  }

  /**
   * Update connection state and notify listeners
   */
  private updateConnectionState(state: ConnectionState): void {
    const previousState = this.connectionState;
    this.connectionState = state;
    
    if (previousState !== state) {
      this.emit('stateChange', {
        previous: previousState,
        current: state,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle connection errors
   */
  private async handleConnectionError(error: any): Promise<void> {
    console.error('WebRTC connection error:', error);

    let errorType: VoiceAgentError = 'connection_failed';
    
    if (error.name === 'NotAllowedError') {
      errorType = 'microphone_permission_denied';
    } else if (error.message?.includes('token')) {
      errorType = 'token_expired';
    } else if (error.message?.includes('network')) {
      errorType = 'network_error';
    }

    const errorInfo: ErrorInfo = {
      type: errorType,
      message: error.message || 'Unknown connection error',
      timestamp: Date.now(),
      details: error,
      recoverable: errorType !== 'microphone_permission_denied'
    };

    this.updateConnectionState('failed');
    this.emit('error', errorInfo);

    // Attempt recovery if possible
    if (errorInfo.recoverable) {
      await this.attemptReconnection();
    }
  }

  /**
   * Get current connection info
   */
  getConnectionInfo(): ConnectionInfo {
    return {
      state: this.connectionState,
      sessionId: this.currentToken?.sessionId,
      connectedAt: this.connectionState === 'connected' ? Date.now() : undefined,
      reconnectAttempt: this.reconnectAttempts
    };
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    try {
      // Clear connection flags
      this.isConnecting = false;
      
      // Clear stored remote audio stream
      this.remoteAudioStream = null;
      
      // Close WebSocket connection
      const ws = (this as any).webSocket;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
        (this as any).webSocket = null;
      }

      if (this._dataChannel) {
        this._dataChannel.close();
        this._dataChannel = null;
      }

      if (this._peerConnection) {
        this._peerConnection.close();
        this._peerConnection = null;
      }

      this.updateConnectionState('disconnected');
      this.currentToken = null;
      this.resetReconnectAttempts();
      
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }

  /**
   * Event listener management
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * Get connection state
   */
  get state(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if connected
   */
  get isConnected(): boolean {
    return this.connectionState === 'connected';
  }
  
  /**
   * Get peer connection
   */
  get peerConnection(): RTCPeerConnection | null {
    return this._peerConnection;
  }
  
  /**
   * Get data channel
   */
  get dataChannel(): RTCDataChannel | null {
    return this._dataChannel;
  }
}