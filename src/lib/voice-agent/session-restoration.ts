/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Session restoration utilities for WebRTC voice assistant across page refreshes
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-unknown-20250802-709
 * @init-timestamp: 2025-08-02T21:00:00Z
 * @reasoning:
 * - **Objective:** Handle seamless session restoration across page navigation and refreshes
 * - **Strategy:** Store active session ID in sessionStorage and restore on page load
 * - **Outcome:** Continuous user experience without losing conversation context
 */

import { sessionPersistence, VoicePreferencesManager, type VoiceSessionData } from './session-persistence';

export interface SessionRestorationState {
  sessionId: string | null;
  shouldRestore: boolean;
  lastActivity: number;
  pageLoadTime: number;
}

export class SessionRestoration {
  private static STORAGE_KEY = 'va_active_session';
  private static MAX_RESTORATION_TIME = 10 * 60 * 1000; // 10 minutes
  
  /**
   * Save the current active session for restoration
   */
  static saveActiveSession(sessionId: string): void {
    try {
      const restorationState: SessionRestorationState = {
        sessionId,
        shouldRestore: true,
        lastActivity: Date.now(),
        pageLoadTime: Date.now()
      };
      
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(restorationState));
      console.log('[SessionRestoration] Active session saved:', sessionId);
    } catch (error) {
      console.error('[SessionRestoration] Failed to save active session:', error);
    }
  }
  
  /**
   * Get the session that should be restored on page load
   */
  static getSessionToRestore(): SessionRestorationState | null {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      
      const state: SessionRestorationState = JSON.parse(stored);
      
      // Check if session is too old
      const timeSinceLastActivity = Date.now() - state.lastActivity;
      if (timeSinceLastActivity > this.MAX_RESTORATION_TIME) {
        console.log('[SessionRestoration] Session too old, not restoring');
        this.clearActiveSession();
        return null;
      }
      
      return state;
    } catch (error) {
      console.error('[SessionRestoration] Failed to get session to restore:', error);
      return null;
    }
  }
  
  /**
   * Update the last activity time for the active session
   */
  static updateLastActivity(sessionId: string): void {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;
      
      const state: SessionRestorationState = JSON.parse(stored);
      if (state.sessionId === sessionId) {
        state.lastActivity = Date.now();
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
      }
    } catch (error) {
      console.error('[SessionRestoration] Failed to update last activity:', error);
    }
  }
  
  /**
   * Clear the active session (called when session ends)
   */
  static clearActiveSession(): void {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
      console.log('[SessionRestoration] Active session cleared');
    } catch (error) {
      console.error('[SessionRestoration] Failed to clear active session:', error);
    }
  }
  
  /**
   * Attempt to restore a session with full state
   */
  static async restoreSession(): Promise<{
    sessionData: VoiceSessionData | null;
    preferences: any;
    shouldConnect: boolean;
  }> {
    const result = {
      sessionData: null as VoiceSessionData | null,
      preferences: VoicePreferencesManager.getPreferences(),
      shouldConnect: false
    };
    
    try {
      const restorationState = this.getSessionToRestore();
      if (!restorationState || !restorationState.sessionId) {
        console.log('[SessionRestoration] No session to restore');
        return result;
      }
      
      console.log('[SessionRestoration] Attempting to restore session:', restorationState.sessionId);
      
      // Load session data
      const sessionData = await sessionPersistence.loadSession(restorationState.sessionId);
      if (!sessionData) {
        console.log('[SessionRestoration] Session data not found');
        this.clearActiveSession();
        return result;
      }
      
      // Check if session was recently active
      const timeSinceLastActivity = Date.now() - sessionData.lastActivity;
      const shouldAutoConnect = timeSinceLastActivity < 5 * 60 * 1000; // 5 minutes
      
      result.sessionData = sessionData;
      result.shouldConnect = shouldAutoConnect;
      
      console.log('[SessionRestoration] Session restored successfully:', {
        sessionId: sessionData.sessionId,
        messageCount: sessionData.messages.length,
        shouldConnect: shouldAutoConnect,
        timeSinceLastActivity: Math.round(timeSinceLastActivity / 1000)
      });
      
      // Update restoration state
      this.saveActiveSession(restorationState.sessionId);
      
      return result;
      
    } catch (error) {
      console.error('[SessionRestoration] Failed to restore session:', error);
      this.clearActiveSession();
      return result;
    }
  }
  
  /**
   * Handle page visibility changes to manage session state
   */
  static setupVisibilityHandling(sessionId: string): () => void {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - update last activity
        this.updateLastActivity(sessionId);
      } else {
        // Page is visible - update activity and check for restoration
        this.updateLastActivity(sessionId);
      }
    };
    
    const handleBeforeUnload = () => {
      // Update last activity before page unload
      this.updateLastActivity(sessionId);
    };
    
    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Return cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }
  
  /**
   * Get session restoration statistics
   */
  static getRestorationStats(): {
    hasActiveSession: boolean;
    sessionAge: number;
    isRestorable: boolean;
  } {
    const state = this.getSessionToRestore();
    
    return {
      hasActiveSession: !!state,
      sessionAge: state ? Date.now() - state.lastActivity : 0,
      isRestorable: !!state && (Date.now() - state.lastActivity) < this.MAX_RESTORATION_TIME
    };
  }
}

// Auto-cleanup on page load
if (typeof window !== 'undefined') {
  // Clean up expired sessions on page load
  const restorationState = SessionRestoration.getSessionToRestore();
  if (restorationState) {
    const timeSinceLastActivity = Date.now() - restorationState.lastActivity;
    if (timeSinceLastActivity > 10 * 60 * 1000) { // 10 minutes
      SessionRestoration.clearActiveSession();
    }
  }
}

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250802-709
 * @timestamp: 2025-08-02T21:00:00Z
 * @reasoning:
 * - **Objective:** Create robust session restoration for voice assistant across page refreshes
 * - **Strategy:** Use sessionStorage for active session tracking with automatic cleanup
 * - **Outcome:** Seamless user experience with conversation continuity across navigation
 * 
 * Features implemented:
 * - Active session tracking in sessionStorage
 * - Automatic session expiration (10 minutes)
 * - Page visibility API integration for accurate activity tracking
 * - Graceful degradation when restoration fails
 * - Preference restoration alongside session data
 * - Auto-connection logic based on recent activity
 * - Comprehensive error handling and logging
 */