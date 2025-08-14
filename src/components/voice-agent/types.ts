/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: TypeScript types and interfaces for voice assistant components
 * @version: 1.0.0
 * @init-author: real-time-ui-agent
 * @init-cc-sessionId: cc-ui-20250801-001
 * @init-timestamp: 2025-08-01T04:26:00Z
 * @reasoning:
 * - **Objective:** Define comprehensive type system for voice assistant
 * - **Strategy:** Strong typing for better developer experience and error prevention
 * - **Outcome:** Type-safe voice assistant with excellent IDE support
 */

// Voice Status Types
export type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

// Message Types
export interface VoiceMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    confidence?: number;
    duration?: number;
    audioUrl?: string;
    isInterim?: boolean;
  };
}

// Configuration Types
export interface VoiceAssistantConfig {
  apiEndpoint: string;
  showTranscript: boolean;
  enableKeyboard: boolean;
  autoMinimize: boolean;
  waveformColors?: {
    idle: string;
    listening: string;
    thinking: string;
    speaking: string;
    error: string;
  };
  audioConfig?: {
    echoCancellation: boolean;
    noiseSuppression: boolean;
    autoGainControl: boolean;
    sampleRate?: number;
  };
  speechConfig?: {
    language: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives?: number;
  };
  synthConfig?: {
    rate: number;
    pitch: number;
    volume: number;
    voice?: SpeechSynthesisVoice;
  };
}

// API Types
export interface APIRequest {
  message: string;
  sessionId: string;
  timestamp: string;
  metadata?: {
    audioData?: ArrayBuffer;
    confidence?: number;
    language?: string;
  };
}

export interface APIResponse {
  message: string;
  sessionId: string;
  timestamp: string;
  metadata?: {
    audioUrl?: string;
    confidence?: number;
    suggestions?: string[];
    actions?: VoiceAction[];
  };
}

export interface VoiceAction {
  type: 'redirect' | 'modal' | 'download' | 'callback' | 'analytics';
  payload: any;
  label?: string;
}

// Audio Types
export interface AudioVisualizationData {
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
  volume: number;
  isActive: boolean;
}

export interface AudioContextState {
  context: AudioContext | null;
  analyser: AnalyserNode | null;
  mediaStream: MediaStream | null;
  source: MediaStreamAudioSourceNode | null;
  isInitialized: boolean;
}

// Type alias for better compatibility
export type TAudioContextState = AudioContextState;

// Error Types
export interface VoiceAssistantError {
  code: string;
  message: string;
  type: 'permission' | 'network' | 'api' | 'speech' | 'audio' | 'unknown';
  recoverable: boolean;
  details?: any;
}

// Event Types
export interface VoiceAssistantEvents {
  onStatusChange?: (status: VoiceStatus) => void;
  onMessage?: (message: VoiceMessage) => void;
  onError?: (error: VoiceAssistantError) => void;
  onAudioData?: (data: AudioVisualizationData) => void;
  onPermissionChange?: (granted: boolean) => void;
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: (sessionId: string) => void;
}

// Hook Return Types
export interface UseVoiceAssistantReturn {
  // State
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  isVoiceActivationEnabled: boolean;
  status: VoiceStatus;
  statusText: string;
  messages: VoiceMessage[];
  sessionId: string;
  isConnected: boolean;
  audioLevel: number;
  
  // Actions
  startListening: () => Promise<void>;
  stopListening: () => void;
  toggleMute: () => void;
  toggleVoiceActivation: () => void;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  resetSession: () => void;
  
  // Enhanced controls
  changeVoice?: (voice: string) => void;
  setVoiceSpeed?: (speed: number) => void;
  setNoiseReduction?: (mode: 'near_field' | 'far_field' | 'auto') => void;
  getPerformanceMetrics?: () => any;
  getSessionStats?: () => any;
  
  // Utilities
  isSupported: boolean;
  hasPermission: boolean;
  error: VoiceAssistantError | null;
}

export interface UseAudioVisualizationReturn {
  startVisualization: () => void;
  stopVisualization: () => void;
  isVisualizing: boolean;
  audioData: AudioVisualizationData | null;
  error: string | null;
}

// Canvas Types
export interface CanvasVisualizationConfig {
  width: number;
  height: number;
  backgroundColor: string;
  waveformColor: string;
  barWidth: number;
  barSpacing: number;
  smoothing: number;
  responsive: boolean;
}

// Accessibility Types
export interface AccessibilityConfig {
  announceStatus: boolean;
  keyboardShortcuts: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
}

// Session Types
export interface VoiceSession {
  id: string;
  startTime: string;
  endTime?: string;
  messageCount: number;
  duration?: number;
  metadata?: {
    userAgent: string;
    language: string;
    platform: string;
  };
}

// Analytics Types
export interface VoiceAnalytics {
  sessionId: string;
  event: 'session_start' | 'session_end' | 'message_sent' | 'message_received' | 'error' | 'cta_click';
  timestamp: string;
  data?: {
    duration?: number;
    messageLength?: number;
    errorType?: string;
    buttonId?: string;
  };
}

// Component Props Types
export interface VoiceWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'auto' | 'light' | 'dark';
  config: Partial<VoiceAssistantConfig>;
  events?: VoiceAssistantEvents;
  className?: string;
  style?: React.CSSProperties;
}

export interface VoiceVisualizationProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  audioData: AudioVisualizationData | null;
  config?: Partial<CanvasVisualizationConfig>;
  isActive: boolean;
}

export interface VoiceTranscriptProps {
  messages: VoiceMessage[];
  maxMessages?: number;
  showTimestamps?: boolean;
  showMetadata?: boolean;
  onMessageClick?: (message: VoiceMessage) => void;
}

export interface VoiceControlsProps {
  isListening: boolean;
  isMuted: boolean;
  isVoiceActivationEnabled: boolean;
  onToggleListening: () => void;
  onToggleMute: () => void;
  onToggleVoiceActivation: () => void;
  disabled?: boolean;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredConfig = Required<Pick<VoiceAssistantConfig, 'apiEndpoint' | 'showTranscript'>>;

export type OptionalConfig = Partial<Omit<VoiceAssistantConfig, 'apiEndpoint' | 'showTranscript'>>;

// Constants
export const DEFAULT_CONFIG: VoiceAssistantConfig = {
  apiEndpoint: '/api/voice-assistant',
  showTranscript: true,
  enableKeyboard: true,
  autoMinimize: true,
  waveformColors: {
    idle: '#D4A034',
    listening: '#10B981',
    thinking: '#F59E0B',
    speaking: '#3B82F6',
    error: '#F43F5E'
  },
  audioConfig: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 44100
  },
  speechConfig: {
    language: 'en-US',
    continuous: false,
    interimResults: true,
    maxAlternatives: 1
  },
  synthConfig: {
    rate: 0.9,
    pitch: 1.0,
    volume: 0.8
  }
};

export const VOICE_ERRORS = {
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  AUDIO_CAPTURE_FAILED: 'AUDIO_CAPTURE_FAILED',
  SPEECH_RECOGNITION_NOT_SUPPORTED: 'SPEECH_RECOGNITION_NOT_SUPPORTED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  AUDIO_CONTEXT_FAILED: 'AUDIO_CONTEXT_FAILED',
  MICROPHONE_NOT_FOUND: 'MICROPHONE_NOT_FOUND',
  SPEECH_SYNTHESIS_FAILED: 'SPEECH_SYNTHESIS_FAILED'
} as const;

export const STATUS_MESSAGES = {
  idle: 'Click to start speaking',
  listening: 'Listening...',
  thinking: 'Processing...',
  speaking: 'Speaking...',
  error: 'Something went wrong'
} as const;

// Voice Personality Types
export type VoicePersonality = 'sage' | 'mentor' | 'friend' | 'expert' | 'enthusiast';

// WebRTC Types
export interface WebRTCConfig {
  iceServers?: RTCIceServer[];
  targetLatency?: number;
  enableSemanticVAD?: boolean;
  voicePersonality?: VoicePersonality;
}

// Enhanced Configuration with WebRTC
export interface EnhancedVoiceAssistantConfig extends VoiceAssistantConfig {
  voicePersonality?: VoicePersonality;
  enableSemanticVAD?: boolean;
  targetLatency?: number;
  webrtcConfig?: WebRTCConfig;
}

// Connection State
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

// Enhanced Hook Return Types
export interface UseWebRTCVoiceAssistantReturn extends UseVoiceAssistantReturn {
  connectionState: ConnectionState;
  networkQuality: 'poor' | 'fair' | 'good' | 'excellent';
  latency: number;
}

// Component-specific Types
export interface GlassmorphicTheme {
  primary: string;
  secondary: string;
  accent: string;
  glass: {
    blur: number;
    opacity: number;
    saturation: number;
  };
}

export interface ParticleEffect {
  count: number;
  color: string;
  size: { min: number; max: number };
  speed: { min: number; max: number };
  life: { min: number; max: number };
}

// Export all types for easy importing
export type {
  VoiceStatus,
  VoiceMessage,
  VoiceAssistantConfig,
  VoiceAssistantError,
  VoiceAssistantEvents,
  UseVoiceAssistantReturn,
  UseAudioVisualizationReturn,
  VoiceSession,
  VoiceAnalytics,
  AudioContextState,
  AudioVisualizationData,
  CanvasVisualizationConfig,
  VoicePersonality,
  ConnectionState,
  WebRTCConfig,
  EnhancedVoiceAssistantConfig,
  UseWebRTCVoiceAssistantReturn,
  GlassmorphicTheme,
  ParticleEffect
};

