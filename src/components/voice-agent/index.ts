/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Voice assistant components index with comprehensive exports
 * @version: 1.1.0
 * @init-author: real-time-ui-agent
 * @init-cc-sessionId: cc-ui-20250801-001
 * @init-timestamp: 2025-08-01T04:26:00Z
 * @reasoning:
 * - **Objective:** Central export point for all voice assistant components
 * - **Strategy:** Organized exports with clear component categories
 * - **Outcome:** Easy import access for consumers of the voice assistant library
 */

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.1.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250802-348
 * @timestamp: 2025-08-02T17:15:00Z
 * @reasoning:
 * - **Objective:** Remove duplicate voice assistant components from exports
 * - **Strategy:** Clean up index exports to reflect removed duplicate components
 * - **Outcome:** Streamlined exports with only necessary components
 * 
 * @changes:
 * - Removed VoiceAssistantReact export (duplicate)
 * - Removed GlassmorphicVoiceWidget export (duplicate)
 * - Removed GlassmorphicVoiceExample export (dependent on removed component)
 * - Kept WebRTCVoiceAssistant as the single, unified voice assistant component
 */

// Main Components
export { default as VoiceAssistantWidget } from './VoiceAssistantWidget.astro';
export { default as VoiceTranscript } from './VoiceTranscript';
export { default as VoiceVisualization } from './VoiceVisualization';
export { default as WebRTCVoiceAssistant } from './WebRTCVoiceAssistant';
export { default as WebRTCVoiceAssistantWrapper } from './WebRTCVoiceAssistantWrapper';

// Glassmorphic Components (removed duplicate components)
export { WaveformVisualizer } from './WaveformVisualizer';
export { VoicePersonalitySelector } from './VoicePersonalitySelector';
export { AccessibilityControls } from './AccessibilityControls';
export { ConversationInterface } from './ConversationInterface';
// Note: Glassmorphic example removed along with duplicate component

// Hooks
export { useVoiceAssistant } from './hooks/useVoiceAssistant';
export { useWebRTCVoiceAssistant } from './hooks/useWebRTCVoiceAssistant';
export { useAudioVisualization } from './hooks/useAudioVisualization';

// Types
export type {
  VoiceStatus,
  VoiceMessage,
  VoiceAssistantConfig,
  VoiceAssistantError,
  VoiceAssistantEvents,
  UseVoiceAssistantReturn,
  UseAudioVisualizationReturn,
  AudioVisualizationData,
  AudioContextState,
  CanvasVisualizationConfig,
  VoiceWidgetProps,
  VoiceVisualizationProps,
  VoiceTranscriptProps,
  VoiceControlsProps,
  VoiceSession,
  VoiceAnalytics,
  APIRequest,
  APIResponse,
  VoiceAction,
  AccessibilityConfig,
  // New glassmorphic types
  VoicePersonality,
  ConnectionState,
  WebRTCConfig,
  EnhancedVoiceAssistantConfig,
  UseWebRTCVoiceAssistantReturn,
  GlassmorphicTheme,
  ParticleEffect
} from './types';

// Constants
export {
  DEFAULT_CONFIG,
  VOICE_ERRORS,
  STATUS_MESSAGES
} from './types';

// Core JavaScript (for Astro components)
export { default as VoiceAssistantCore } from './voice-assistant-core.js';

// Re-export everything for convenience
export * from './types';
export * from './hooks/useVoiceAssistant';
export * from './hooks/useWebRTCVoiceAssistant';
export * from './hooks/useAudioVisualization';