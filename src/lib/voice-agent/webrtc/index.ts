/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: WebRTC integration exports for OpenAI Realtime API
 * @version: 1.0.0
 * @init-author: engineer-agent
 * @init-cc-sessionId: cc-eng-20250801-001
 * @init-timestamp: 2025-08-01T12:00:00Z
 * @reasoning:
 * - **Objective:** Clean API exports for WebRTC voice communication
 * - **Strategy:** Barrel exports with proper TypeScript support
 * - **Outcome:** Easy integration for consuming applications
 */

// Main integration class
export { WebRTCVoiceAgent, createWebRTCVoiceAgent } from './main';
export type { WebRTCVoiceAgentEvents } from './main';

// Core components
export { WebRTCConnection } from './connection';
export { WebRTCAudioProcessor } from './audio-processor';
export { NetworkMonitor } from './network-monitor';
export { ErrorRecoveryManager } from './error-recovery';

// Types from main types file
export type {
  VoiceAgentConfig,
  EphemeralToken,
  TokenResponse,
  ConnectionState,
  ConversationState,
  SessionConfig,
  RealtimeEvent,
  ConversationMessage,
  ErrorInfo,
  VoiceAgentError,
  AudioProcessor,
  AudioChunk,
  AudioBufferManager,
  NetworkQuality,
  QualitySettings
} from '../../../features/voice-agent/types/index';

// Default configurations
export { 
  DEFAULT_CONFIG, 
  DEFAULT_SESSION_CONFIG 
} from '../../../features/voice-agent/types/index';

/**
 * WebRTC Integration Status
 */
export const WEBRTC_INTEGRATION_INFO = {
  version: '1.0.0',
  features: [
    'OpenAI Realtime API WebRTC connection',
    'Advanced audio processing with worklets',
    'Voice activity detection',
    'Network quality monitoring',
    'Automatic error recovery',
    'Echo cancellation and noise reduction',
    'Adaptive quality control',
    'Professional-grade voice communication'
  ],
  requirements: {
    browser: 'Modern browsers with WebRTC and AudioWorklet support',
    permissions: 'Microphone access required',
    network: 'Stable internet connection recommended'
  },
  audioFormats: {
    input: 'PCM16 at 24kHz (configurable)',
    output: 'PCM16 from OpenAI Realtime API',
    processing: 'Float32 internal processing'
  }
} as const;