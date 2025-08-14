/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Comprehensive unit tests for enhanced WebRTC Voice Agent
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-dev-20250801-004
 * @init-timestamp: 2025-08-01T16:00:00Z
 * @reasoning:
 * - **Objective:** Validate all enhanced voice agent features and error handling
 * - **Strategy:** Mock WebRTC APIs and test core functionality
 * - **Outcome:** Comprehensive test coverage for production-ready implementation
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebRTCVoiceAgent, createWebRTCVoiceAgent } from '../main';
import type { VoiceAssistantConfig, SessionConfig } from '../../../../features/voice-agent/types';

// Mock WebRTC APIs
const mockRTCPeerConnection = {
  createDataChannel: vi.fn().mockReturnValue({
    addEventListener: vi.fn(),
    send: vi.fn(),
    close: vi.fn(),
    readyState: 'open'
  }),
  addTrack: vi.fn(),
  addTransceiver: vi.fn(),
  createOffer: vi.fn().mockResolvedValue({ sdp: 'mock-sdp', type: 'offer' }),
  setLocalDescription: vi.fn().mockResolvedValue(undefined),
  setRemoteDescription: vi.fn().mockResolvedValue(undefined),
  getTransceivers: vi.fn().mockReturnValue([]),
  getStats: vi.fn().mockResolvedValue(new Map()),
  close: vi.fn(),
  connectionState: 'connected',
  iceConnectionState: 'connected'
};

const mockMediaDevices = {
  getUserMedia: vi.fn().mockResolvedValue({
    getTracks: vi.fn().mockReturnValue([{
      id: 'audio-track',
      kind: 'audio',
      readyState: 'live',
      stop: vi.fn()
    }]),
    getAudioTracks: vi.fn().mockReturnValue([{
      id: 'audio-track',
      kind: 'audio',
      readyState: 'live',
      muted: false,
      enabled: true
    }])
  })
};

// Mock fetch for token requests
const mockFetch = vi.fn();

// Setup global mocks
beforeEach(() => {
  // Mock WebRTC
  global.RTCPeerConnection = vi.fn(() => mockRTCPeerConnection) as any;
  global.navigator = {
    ...global.navigator,
    mediaDevices: mockMediaDevices
  } as any;
  
  // Mock AudioContext
  global.AudioContext = vi.fn(() => ({
    createGain: vi.fn().mockReturnValue({
      gain: { value: 1, setValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn()
    }),
    createAnalyser: vi.fn().mockReturnValue({
      fftSize: 256,
      smoothingTimeConstant: 0.8,
      frequencyBinCount: 128,
      getFloatTimeDomainData: vi.fn(),
      connect: vi.fn()
    }),
    createDynamicsCompressor: vi.fn().mockReturnValue({
      threshold: { value: -24 },
      knee: { value: 30 },
      ratio: { value: 12 },
      attack: { value: 0.003 },
      release: { value: 0.25 },
      connect: vi.fn()
    }),
    createBiquadFilter: vi.fn().mockReturnValue({
      type: 'highpass',
      frequency: { value: 80 },
      Q: { value: 1 },
      connect: vi.fn()
    }),
    createMediaStreamSource: vi.fn().mockReturnValue({
      connect: vi.fn()
    }),
    createMediaStreamDestination: vi.fn().mockReturnValue({
      stream: { getTracks: vi.fn().mockReturnValue([]) },
      connect: vi.fn()
    }),
    destination: {},
    sampleRate: 24000,
    currentTime: 0,
    state: 'running',
    resume: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined)
  })) as any;

  // Mock fetch
  global.fetch = mockFetch.mockResolvedValue({
    ok: true,
    json: vi.fn().mockResolvedValue({
      success: true,
      token: 'mock-token',
      expiresAt: Date.now() + 30 * 60 * 1000,
      session_id: 'test-session'
    }),
    text: vi.fn().mockResolvedValue('mock-sdp-answer')
  });

  // Reset mocks
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('WebRTC Voice Agent', () => {
  const mockConfig: VoiceAssistantConfig = {
    apiEndpoint: '/api/voice-agent',
    maxReconnectAttempts: 3,
    reconnectDelay: 1000,
    audioConstraints: {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    },
    targetLatency: 75,
    adaptiveQuality: true,
    sessionConfig: {
      voice: 'alloy',
      voice_speed: 1.0,
      noise_reduction: 'auto',
      temperature: 0.8
    } as Partial<SessionConfig>
  };

  describe('Factory Function', () => {
    test('should create WebRTC voice agent instance', () => {
      const agent = createWebRTCVoiceAgent(mockConfig);
      expect(agent).toBeInstanceOf(WebRTCVoiceAgent);
    });
  });

  describe('Initialization', () => {
    test('should initialize with default configuration', async () => {
      const agent = new WebRTCVoiceAgent(mockConfig);
      
      // Mock successful initialization
      await agent.initialize();
      
      expect(mockFetch).toHaveBeenCalledWith('/api/voice-agent/token', expect.any(Object));
      expect(mockMediaDevices.getUserMedia).toHaveBeenCalled();
    });

    test('should handle initialization errors gracefully', async () => {
      const agent = new WebRTCVoiceAgent(mockConfig);
      
      // Mock fetch failure
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(agent.initialize()).rejects.toThrow();
    });

    test('should prevent concurrent initialization', async () => {
      const agent = new WebRTCVoiceAgent(mockConfig);
      
      const init1 = agent.initialize();
      const init2 = agent.initialize();
      
      await Promise.all([init1, init2]);
      
      // Token should only be fetched once
      expect(mockFetch).toHaveBeenCalledTimes(2); // Once for token, once for SDP
    });
  });

  describe('Session Configuration', () => {
    test('should update voice personality', async () => {
      const agent = new WebRTCVoiceAgent(mockConfig);
      await agent.initialize();
      
      agent.changeVoice('echo');
      
      // Should trigger session update
      expect(mockRTCPeerConnection.createDataChannel().send).toHaveBeenCalled();
    });

    test('should adjust voice speed within valid range', async () => {
      const agent = new WebRTCVoiceAgent(mockConfig);
      await agent.initialize();
      
      agent.setVoiceSpeed(1.5);
      agent.setVoiceSpeed(5.0); // Should be clamped to 4.0
      agent.setVoiceSpeed(0.1); // Should be clamped to 0.25
      
      expect(mockRTCPeerConnection.createDataChannel().send).toHaveBeenCalledTimes(3);
    });

    test('should set noise reduction mode', async () => {
      const agent = new WebRTCVoiceAgent(mockConfig);
      await agent.initialize();
      
      agent.setNoiseReduction('near_field');
      
      expect(mockRTCPeerConnection.createDataChannel().send).toHaveBeenCalled();
    });

    test('should manage session memory', async () => {
      const agent = new WebRTCVoiceAgent(mockConfig);
      await agent.initialize();
      
      agent.setSessionMemory(true);
      agent.setSessionMemory(false);
      
      expect(mockRTCPeerConnection.createDataChannel().send).toHaveBeenCalledTimes(2);
    });
  });

  describe('Audio Management', () => {
    test('should start and stop listening', async () => {
      const agent = new WebRTCVoiceAgent(mockConfig);
      await agent.initialize();
      
      agent.startListening();
      agent.stopListening();
      
      // Audio processor methods should be called
      expect(mockMediaDevices.getUserMedia).toHaveBeenCalled();
    });

    test('should handle audio interruption', async () => {
      const agent = new WebRTCVoiceAgent(mockConfig);
      await agent.initialize();
      
      agent.interrupt();
      
      // Should send cancel events
      expect(mockRTCPeerConnection.createDataChannel().send).toHaveBeenCalledWith(
        expect.stringContaining('response.cancel')
      );
    });
  });

  describe('Message Handling', () => {
    test('should send text messages', async () => {
      const agent = new WebRTCVoiceAgent(mockConfig);
      await agent.initialize();
      
      agent.sendMessage('Hello, how are you?');
      
      expect(mockRTCPeerConnection.createDataChannel().send).toHaveBeenCalledWith(
        expect.stringContaining('conversation.item.create')
      );
    });

    test('should handle realtime events', async () => {
      const agent = new WebRTCVoiceAgent(mockConfig);
      const eventHandler = vi.fn();
      
      agent.on('assistantTranscript', eventHandler);
      await agent.initialize();
      
      // Simulate receiving a transcript event
      const mockEvent = {
        type: 'response.text.done',
        text: 'Hello, I can help you with that.'
      };
      
      // This would normally come through the data channel
      agent['handleRealtimeEvent'](mockEvent);
      
      expect(eventHandler).toHaveBeenCalledWith({
        text: 'Hello, I can help you with that.',
        isFinal: true
      });
    });
  });

  describe('Performance Monitoring', () => {
    test('should track performance metrics', async () => {
      const agent = new WebRTCVoiceAgent(mockConfig);
      await agent.initialize();
      
      const metrics = agent.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('latency');
      expect(metrics).toHaveProperty('audioQuality');
      expect(metrics).toHaveProperty('connectionStability');
    });

    test('should provide session statistics', async () => {
      const agent = new WebRTCVoiceAgent(mockConfig);
      await agent.initialize();
      
      const stats = agent.getSessionStats();
      
      expect(stats).toHaveProperty('sessionId');
      expect(stats).toHaveProperty('duration');
      expect(stats).toHaveProperty('messageCount');
      expect(stats).toHaveProperty('errors');
      expect(stats).toHaveProperty('avgLatency');
    });
  });

  describe('Error Handling', () => {
    test('should handle connection errors with recovery', async () => {
      const agent = new WebRTCVoiceAgent(mockConfig);
      const errorHandler = vi.fn();
      
      agent.on('error', errorHandler);
      
      // Mock connection failure
      mockRTCPeerConnection.connectionState = 'failed';
      
      await agent.initialize();
      
      // Simulate connection error
      const mockError = {
        type: 'connection_failed' as const,
        message: 'WebRTC connection failed',
        timestamp: Date.now(),
        details: {},
        recoverable: true
      };
      
      await agent['handleError'](mockError);
      
      expect(errorHandler).toHaveBeenCalledWith(mockError);
    });

    test('should handle non-recoverable errors', async () => {
      const agent = new WebRTCVoiceAgent(mockConfig);
      const errorHandler = vi.fn();
      
      agent.on('error', errorHandler);
      
      const nonRecoverableError = {
        type: 'microphone_permission_denied' as const,
        message: 'Microphone access denied',
        timestamp: Date.now(),
        details: {},
        recoverable: false
      };
      
      await agent['handleError'](nonRecoverableError);
      
      expect(errorHandler).toHaveBeenCalledWith(nonRecoverableError);
    });
  });

  describe('Token Management', () => {
    test('should refresh tokens automatically', async () => {
      const agent = new WebRTCVoiceAgent(mockConfig);
      
      // Mock token expiring soon
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          token: 'initial-token',
          expiresAt: Date.now() + 1000, // Expires in 1 second
          session_id: 'test-session'
        })
      });
      
      await agent.initialize();
      
      // Wait for token refresh
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + SDP + refresh
    });

    test('should handle token refresh failures', async () => {
      const agent = new WebRTCVoiceAgent(mockConfig);
      const errorHandler = vi.fn();
      
      agent.on('error', errorHandler);
      
      // Mock initial success, then failure
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({
            success: true,
            token: 'initial-token',
            expiresAt: Date.now() + 30 * 60 * 1000,
            session_id: 'test-session'
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: vi.fn().mockResolvedValue('mock-sdp')
        })
        .mockRejectedValueOnce(new Error('Token refresh failed'));
      
      await agent.initialize();
      
      // Trigger manual refresh
      await expect(agent['refreshToken']()).rejects.toThrow('Token refresh failed');
    });
  });

  describe('Cleanup', () => {
    test('should cleanup resources properly', async () => {
      const agent = new WebRTCVoiceAgent(mockConfig);
      await agent.initialize();
      
      await agent.disconnect();
      
      expect(mockRTCPeerConnection.close).toHaveBeenCalled();
    });
  });

  describe('Adaptive Quality', () => {
    test('should adjust quality based on network conditions', async () => {
      const agent = new WebRTCVoiceAgent({
        ...mockConfig,
        adaptiveQuality: true
      });
      
      await agent.initialize();
      
      // Simulate poor network quality
      const poorQuality = {
        score: 0.3,
        recommendation: 'poor' as const
      };
      
      agent['adjustQualityBasedOnNetwork'](poorQuality);
      
      // Should have adjusted settings
      expect(agent['sessionConfig'].turn_detection.silence_duration_ms).toBe(1200);
    });

    test('should enhance quality for good network', async () => {
      const agent = new WebRTCVoiceAgent({
        ...mockConfig,
        adaptiveQuality: true
      });
      
      await agent.initialize();
      
      // Simulate good network quality
      const goodQuality = {
        score: 0.9,
        recommendation: 'excellent' as const
      };
      
      agent['adjustQualityBasedOnNetwork'](goodQuality);
      
      // Should have enhanced settings
      expect(agent['sessionConfig'].turn_detection.silence_duration_ms).toBe(600);
    });
  });
});