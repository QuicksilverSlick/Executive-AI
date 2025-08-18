/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Core type definitions without circular dependencies
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-dev-20250818-circular-fix
 * @init-timestamp: 2025-08-18T23:15:00Z
 * @reasoning:
 * - **Objective:** Separate core types to prevent circular dependencies
 * - **Strategy:** Create dependency-free core types that can be imported anywhere
 * - **Outcome:** Clean type imports without circular dependency issues
 */

// Voice Status Types
export type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

// Connection State
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

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

// Error Types
export interface VoiceAssistantError {
  code: string;
  message: string;
  type: 'permission' | 'network' | 'api' | 'speech' | 'audio' | 'unknown' | 'connection' | 'session';
  recoverable: boolean;
  details?: any;
}

// Voice Personality Types
export type VoicePersonality = 'sage' | 'mentor' | 'friend' | 'expert' | 'enthusiast';

// Session Types
export type SessionState = 'idle' | 'active' | 'paused' | 'ending' | 'ended';

// Basic Configuration Types
export interface VoiceAssistantConfig {
  apiEndpoint: string;
  showTranscript: boolean;
  enableKeyboard: boolean;
  autoMinimize: boolean;
  sessionConfig?: {
    instructions?: string;
  };
}

// Event Types
export interface VoiceAssistantEvents {
  onStatusChange?: (status: VoiceStatus) => void;
  onMessage?: (message: VoiceMessage) => void;
  onError?: (error: VoiceAssistantError) => void;
}

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-dev-20250818-circular-fix
 * @timestamp: 2025-08-18T23:15:00Z
 * @reasoning:
 * - **Objective:** Extract core types to prevent circular dependencies
 * - **Strategy:** Create standalone type definitions without interdependencies
 * - **Outcome:** Circular dependency-free core types
 */