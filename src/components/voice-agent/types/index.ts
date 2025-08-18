/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Consolidated type definitions for voice agent components
 * @version: 2.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-dev-20250818-circular-fix
 * @init-timestamp: 2025-08-18T22:00:00Z
 * @reasoning:
 * - **Objective:** Fix circular dependency issues by consolidating types
 * - **Strategy:** Move all shared types to a single location to prevent circular imports
 * - **Outcome:** Cleaner type system without circular dependencies
 */

// Re-export all existing types to maintain backward compatibility
export * from '../types';

// Additional utility types for avoiding circular dependencies
export interface SessionModules {
  VoicePreferencesManager: any;
  sessionPersistence: any;
  SessionRestoration: any;
}

export interface ComponentState {
  isClient: boolean;
  modules: SessionModules | null;
  isMinimized: boolean;
  showKeyboardHint: boolean;
  currentPersonality: string;
  showSettings: boolean;
  glassIntensity: number;
  animationState: 'idle' | 'listening' | 'thinking' | 'speaking';
  textInput: string;
  isSendingText: boolean;
  isVisualizationExpanded: boolean;
  isMobile: boolean;
}

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 2.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-dev-20250818-circular-fix
 * @timestamp: 2025-08-18T22:00:00Z
 * @reasoning:
 * - **Objective:** Create consolidated type definitions to prevent circular dependencies
 * - **Strategy:** Centralize type definitions and re-export existing types
 * - **Outcome:** Cleaner imports without circular dependency issues
 */