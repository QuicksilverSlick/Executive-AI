/**
 * WebRTC Client for OpenAI Realtime API
 * Implements the proper WebRTC connection flow as documented by OpenAI
 * 
 * This client:
 * 1. Fetches an ephemeral token from the server
 * 2. Creates an RTCPeerConnection
 * 3. Sets up audio tracks and data channel
 * 4. Performs SDP exchange with OpenAI
 * 5. Handles real-time events
 */

class OpenAIWebRTCClient {
  constructor(options = {}) {
    this.tokenEndpoint = options.tokenEndpoint || '/api/voice-agent/token';
    this.onMessage = options.onMessage || (() => {});
    this.onStateChange = options.onStateChange || (() => {});
    this.onError = options.onError || (() => {});
    
    this.pc = null;
    this.dataChannel = null;
    this.ephemeralToken = null;
    this.audioElement = null;
    this.mediaStream = null;
  }

  /**
   * Initialize the WebRTC connection
   */
  async connect() {
    try {
      this.onStateChange('connecting');
      
      // Step 1: Get ephemeral token from server
      console.log('[WebRTC Client] Fetching ephemeral token...');
      const tokenResponse = await fetch(this.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        throw new Error(`Failed to get token: ${error}`);
      }
      
      const tokenData = await tokenResponse.json();
      if (!tokenData.success || !tokenData.token) {
        throw new Error('Invalid token response');
      }
      
      this.ephemeralToken = tokenData.token;
      const sessionConfig = tokenData.sessionConfig;
      
      console.log('[WebRTC Client] Got ephemeral token', {
        sessionId: tokenData.sessionId,
        expiresAt: new Date(tokenData.expiresAt).toISOString(),
        mode: tokenData.mode,
        model: sessionConfig?.model
      });
      
      // Check if we're in fallback mode
      if (tokenData.mode === 'fallback' || tokenData.mode === 'demo') {
        console.warn('[WebRTC Client] Running in', tokenData.mode, 'mode - WebRTC may not be available');
        if (tokenData.warnings) {
          tokenData.warnings.forEach(w => console.warn('[WebRTC Client]', w));
        }
      }
      
      // Step 2: Create peer connection
      console.log('[WebRTC Client] Creating RTCPeerConnection...');
      this.pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });
      
      // Step 3: Set up to play remote audio from the model
      this.audioElement = document.createElement('audio');
      this.audioElement.autoplay = true;
      this.pc.ontrack = (e) => {
        console.log('[WebRTC Client] Received remote track:', e.track.kind);
        this.audioElement.srcObject = e.streams[0];
      };
      
      // Step 4: Add local audio track for microphone input
      console.log('[WebRTC Client] Getting user media...');
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 24000,
          channelCount: 1
        } 
      });
      
      const audioTrack = this.mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        this.pc.addTrack(audioTrack, this.mediaStream);
        console.log('[WebRTC Client] Added local audio track');
      }
      
      // Step 5: Set up data channel for sending and receiving events
      console.log('[WebRTC Client] Creating data channel...');
      this.dataChannel = this.pc.createDataChannel('oai-events', {
        ordered: true
      });
      
      this.dataChannel.addEventListener('open', () => {
        console.log('[WebRTC Client] Data channel opened');
        this.onStateChange('connected');
        
        // Send initial session configuration
        this.sendEvent({
          type: 'session.update',
          session: {
            instructions: sessionConfig?.instructions || 'You are a helpful AI assistant.',
            voice: sessionConfig?.voice || 'alloy',
            temperature: 0.8
          }
        });
      });
      
      this.dataChannel.addEventListener('message', (e) => {
        try {
          const event = JSON.parse(e.data);
          console.log('[WebRTC Client] Received event:', event.type, event);
          this.onMessage(event);
        } catch (err) {
          console.error('[WebRTC Client] Failed to parse message:', err);
        }
      });
      
      this.dataChannel.addEventListener('error', (e) => {
        console.error('[WebRTC Client] Data channel error:', e);
        this.onError(e);
      });
      
      this.dataChannel.addEventListener('close', () => {
        console.log('[WebRTC Client] Data channel closed');
        this.onStateChange('disconnected');
      });
      
      // Step 6: Create and send SDP offer
      console.log('[WebRTC Client] Creating SDP offer...');
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      
      // Step 7: Exchange SDP with OpenAI
      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = sessionConfig?.model || 'gpt-4o-realtime-preview-2025-06-03';
      
      console.log('[WebRTC Client] Sending SDP offer to OpenAI...');
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          'Authorization': `Bearer ${this.ephemeralToken}`,
          'Content-Type': 'application/sdp'
        }
      });
      
      if (!sdpResponse.ok) {
        const error = await sdpResponse.text();
        throw new Error(`SDP exchange failed: ${sdpResponse.status} - ${error}`);
      }
      
      const answerSdp = await sdpResponse.text();
      console.log('[WebRTC Client] Received SDP answer');
      
      // Step 8: Set remote description
      const answer = {
        type: 'answer',
        sdp: answerSdp
      };
      
      await this.pc.setRemoteDescription(answer);
      console.log('[WebRTC Client] Remote description set successfully');
      
      // Monitor connection state
      this.pc.onconnectionstatechange = () => {
        console.log('[WebRTC Client] Connection state:', this.pc.connectionState);
        this.onStateChange(this.pc.connectionState);
      };
      
    } catch (error) {
      console.error('[WebRTC Client] Connection failed:', error);
      this.onError(error);
      this.disconnect();
      throw error;
    }
  }
  
  /**
   * Send an event through the data channel
   */
  sendEvent(event) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      console.log('[WebRTC Client] Sending event:', event.type);
      this.dataChannel.send(JSON.stringify(event));
    } else {
      console.warn('[WebRTC Client] Data channel not ready, cannot send event');
    }
  }
  
  /**
   * Send text input
   */
  sendText(text) {
    this.sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: text
          }
        ]
      }
    });
    
    // Trigger response generation
    this.sendEvent({
      type: 'response.create'
    });
  }
  
  /**
   * Disconnect and cleanup
   */
  disconnect() {
    console.log('[WebRTC Client] Disconnecting...');
    
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.audioElement) {
      this.audioElement.srcObject = null;
      this.audioElement = null;
    }
    
    this.ephemeralToken = null;
    this.onStateChange('disconnected');
  }
  
  /**
   * Check if connected
   */
  isConnected() {
    return this.pc?.connectionState === 'connected' && 
           this.dataChannel?.readyState === 'open';
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.OpenAIWebRTCClient = OpenAIWebRTCClient;
}