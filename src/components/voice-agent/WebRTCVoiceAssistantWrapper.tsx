/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Client-only wrapper for WebRTC Voice Assistant to handle SSR
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-dev-20250802-fix
 * @init-timestamp: 2025-08-02T19:30:00Z
 * @reasoning:
 * - **Objective:** Provide SSR-safe wrapper for WebRTC Voice Assistant
 * - **Strategy:** Use client:only directive in Astro to prevent SSR issues
 * - **Outcome:** Voice assistant loads only on client side avoiding document errors
 */

import React from 'react';
import WebRTCVoiceAssistant from './WebRTCVoiceAssistant';

// Re-export the component and its props type
export type { WebRTCVoiceAssistantProps } from './WebRTCVoiceAssistant';
export { default as WebRTCVoiceAssistant } from './WebRTCVoiceAssistant';

// Default export for easier importing
export default WebRTCVoiceAssistant;