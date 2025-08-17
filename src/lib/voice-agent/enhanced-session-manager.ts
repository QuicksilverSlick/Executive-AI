/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Enhanced WebRTC session manager with complete persistence and restoration
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-unknown-20250809-673
 * @init-timestamp: 2025-08-09T12:00:00Z
 * @reasoning:
 * - **Objective:** Implement complete WebRTC session persistence for voice agent continuity
 * - **Strategy:** Token persistence, session restoration, connection recovery with lifecycle management
 * - **Outcome:** Seamless conversation continuity across page navigation and reloads
 */

import type { VoiceMessage, ConnectionState, ConversationState } from '../../features/voice-agent/types';
import { VoiceSessionPersistence, VoicePreferencesManager } from './session-persistence';

// Enhanced session data interface
export interface WebRTCSessionData {
  sessionId: string;
  token: string;
  tokenExpiresAt: number;
  messages: VoiceMessage[];
  connectionState: ConnectionState;
  conversationState: ConversationState;
  startTime: number;
  lastActivity: number;
  isActive: boolean;
  tabId: string; // Unique tab identifier
  windowId?: string; // Window identifier for multi-window support
  metadata: {
    userAgent: string;
    totalMessages: number;
    totalDuration: number;
    reconnectAttempts: number;
    lastReconnectTime?: number;
    version: string;
  };
}

// Session restoration result
export interface SessionRestorationResult {
  success: boolean;
  sessionData?: WebRTCSessionData;
  reason?: string;
  shouldStartNew: boolean;
  reconnectRequired: boolean;
}

// Token refresh callback type
export type TokenRefreshCallback = () => Promise<{ token: string; expiresAt: number; sessionId: string }>;

/**
 * Enhanced session manager for WebRTC voice agent with complete persistence
 */
export class EnhancedSessionManager {
  private static instance: EnhancedSessionManager | null = null;
  private currentSession: WebRTCSessionData | null = null;
  private sessionPersistence: VoiceSessionPersistence;
  private tabId: string;
  private windowId: string;
  private isRestoring = false;
  private autoSaveInterval: number | null = null;
  private tokenRefreshCallback: TokenRefreshCallback | null = null;
  private onSessionRestored?: (session: WebRTCSessionData) => void;
  private onSessionExpired?: () => void;

  // Session storage keys
  private static readonly ACTIVE_SESSION_KEY = 'webrtc_active_session';
  private static readonly TAB_SESSION_KEY = 'webrtc_tab_session';
  private static readonly TOKEN_KEY = 'webrtc_session_token';
  private static readonly SESSION_VERSION = '1.0.0';

  private constructor() {
    // Defer initialization until after React is ready
    if (typeof window === 'undefined') {
      console.log('[Enhanced Session Manager] Deferring initialization - window not available');
      return;
    }
    
    this.sessionPersistence = new VoiceSessionPersistence();
    this.tabId = this.generateTabId();
    this.windowId = this.generateWindowId();
    
    // Defer event listeners and auto-save to next tick to prevent React hook conflicts
    setTimeout(() => {
      this.setupEventListeners();
      this.startAutoSave();
    }, 0);
    
    console.log('[Enhanced Session Manager] Initialized with tabId:', this.tabId);
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): EnhancedSessionManager | null {
    if (!this.instance && typeof window !== 'undefined') {
      this.instance = new EnhancedSessionManager();
    }
    return this.instance;
  }

  /**
   * Set token refresh callback
   */
  public setTokenRefreshCallback(callback: TokenRefreshCallback): void {
    this.tokenRefreshCallback = callback;
  }

  /**
   * Set session event callbacks
   */
  public setEventCallbacks(callbacks: {
    onSessionRestored?: (session: WebRTCSessionData) => void;
    onSessionExpired?: () => void;
  }): void {
    this.onSessionRestored = callbacks.onSessionRestored;
    this.onSessionExpired = callbacks.onSessionExpired;
  }

  /**
   * Create new session with token persistence
   */
  public async createSession(sessionId: string, token: string, tokenExpiresAt: number): Promise<WebRTCSessionData> {
    console.log('[Enhanced Session Manager] Creating new session:', { sessionId, tokenExpiresAt });

    const sessionData: WebRTCSessionData = {
      sessionId,
      token,
      tokenExpiresAt,
      messages: [],
      connectionState: 'connecting',
      conversationState: 'idle',
      startTime: Date.now(),
      lastActivity: Date.now(),
      isActive: true,
      tabId: this.tabId,
      windowId: this.windowId,
      metadata: {
        userAgent: navigator.userAgent,
        totalMessages: 0,
        totalDuration: 0,
        reconnectAttempts: 0,
        version: EnhancedSessionManager.SESSION_VERSION
      }
    };

    this.currentSession = sessionData;
    
    // Persist token to sessionStorage (tab-specific)
    this.persistToken();
    
    // Mark this tab as active
    this.markTabActive();
    
    // Save to IndexedDB
    await this.saveSession();
    
    console.log('[Enhanced Session Manager] Session created and persisted');
    return sessionData;
  }

  /**
   * Restore session from storage
   */
  public async restoreSession(): Promise<SessionRestorationResult> {
    if (this.isRestoring) {
      console.log('[Enhanced Session Manager] Already restoring, skipping');
      return { success: false, reason: 'Already restoring', shouldStartNew: false, reconnectRequired: false };
    }

    this.isRestoring = true;
    
    try {
      console.log('[Enhanced Session Manager] Attempting session restoration...');
      
      // Check for active session token first
      const tokenData = this.getPersistedToken();
      if (!tokenData) {
        console.log('[Enhanced Session Manager] No persisted token found');
        return { success: false, reason: 'No token found', shouldStartNew: true, reconnectRequired: false };
      }

      // Check token expiration
      if (Date.now() >= tokenData.tokenExpiresAt) {
        console.log('[Enhanced Session Manager] Token expired, attempting refresh');
        
        // Try to refresh token
        if (this.tokenRefreshCallback) {
          try {
            const refreshResult = await this.tokenRefreshCallback();
            tokenData.token = refreshResult.token;
            tokenData.tokenExpiresAt = refreshResult.expiresAt;
            
            // Update session ID if it changed
            if (refreshResult.sessionId !== tokenData.sessionId) {
              tokenData.sessionId = refreshResult.sessionId;
            }
            
            this.persistToken(tokenData);
            console.log('[Enhanced Session Manager] Token refreshed successfully');
          } catch (refreshError) {
            console.error('[Enhanced Session Manager] Token refresh failed:', refreshError);
            this.clearPersistedData();
            if (this.onSessionExpired) {
              this.onSessionExpired();
            }
            return { success: false, reason: 'Token refresh failed', shouldStartNew: true, reconnectRequired: false };
          }
        } else {
          console.log('[Enhanced Session Manager] No token refresh callback available');
          this.clearPersistedData();
          return { success: false, reason: 'Token expired, no refresh available', shouldStartNew: true, reconnectRequired: false };
        }
      }

      // Load session from IndexedDB
      console.log('[Enhanced Session Manager] Loading session from IndexedDB for sessionId:', tokenData.sessionId);
      
      // First try to load by the exact sessionId
      let persistedSession = await this.sessionPersistence.loadSession(tokenData.sessionId);
      
      // If not found, try to get the most recent session
      if (!persistedSession) {
        console.log('[Enhanced Session Manager] No session found for ID, trying to get most recent session');
        const recentSessions = await this.sessionPersistence.getRecentSessions();
        if (recentSessions && recentSessions.length > 0) {
          persistedSession = recentSessions[0];
          console.log('[Enhanced Session Manager] Found recent session:', persistedSession.sessionId);
        }
      }
      
      if (!persistedSession) {
        console.log('[Enhanced Session Manager] No persisted session found in IndexedDB');
        return { 
          success: true, 
          sessionData: await this.createSession(tokenData.sessionId, tokenData.token, tokenData.tokenExpiresAt), 
          shouldStartNew: false, 
          reconnectRequired: true 
        };
      }

      console.log('[Enhanced Session Manager] Loaded persisted session:', {
        sessionId: persistedSession.sessionId,
        messageCount: persistedSession.messages ? persistedSession.messages.length : 0,
        messagesArray: persistedSession.messages,
        hasMessages: !!persistedSession.messages && persistedSession.messages.length > 0
      });

      // Debug each message
      if (persistedSession.messages && persistedSession.messages.length > 0) {
        persistedSession.messages.forEach((msg, idx) => {
          console.log(`[Enhanced Session Manager] Message ${idx + 1}:`, {
            type: msg.type,
            hasContent: !!msg.content,
            contentLength: msg.content ? msg.content.length : 0,
            contentPreview: msg.content ? msg.content.substring(0, 50) : 'NO CONTENT'
          });
        });
      }

      // Sort messages by timestamp to ensure chronological order for history injection
      const sortedMessages = persistedSession.messages ? 
        persistedSession.messages.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ) : [];

      console.log('[Enhanced Session Manager] Sorted messages count:', sortedMessages.length);

      // Reconstruct WebRTC session data
      const restoredSession: WebRTCSessionData = {
        sessionId: tokenData.sessionId,
        token: tokenData.token,
        tokenExpiresAt: tokenData.tokenExpiresAt,
        messages: sortedMessages,
        connectionState: 'disconnected', // Will need to reconnect
        conversationState: 'idle',
        startTime: persistedSession.startTime,
        lastActivity: Date.now(), // Update activity to now
        isActive: true,
        tabId: this.tabId,
        windowId: this.windowId,
        metadata: {
          ...persistedSession.metadata,
          reconnectAttempts: (persistedSession.metadata as any).reconnectAttempts || 0,
          lastReconnectTime: Date.now(),
          version: EnhancedSessionManager.SESSION_VERSION
        }
      };

      this.currentSession = restoredSession;
      this.markTabActive();
      
      console.log('[Enhanced Session Manager] Session restored successfully:', {
        sessionId: restoredSession.sessionId,
        messageCount: restoredSession.messages.length,
        totalDuration: restoredSession.metadata.totalDuration,
        firstMessage: restoredSession.messages[0] || 'NONE',
        lastMessage: restoredSession.messages[restoredSession.messages.length - 1] || 'NONE'
      });

      if (this.onSessionRestored) {
        this.onSessionRestored(restoredSession);
      }

      return { 
        success: true, 
        sessionData: restoredSession, 
        shouldStartNew: false, 
        reconnectRequired: true 
      };

    } catch (error) {
      console.error('[Enhanced Session Manager] Session restoration failed:', error);
      this.clearPersistedData();
      return { success: false, reason: `Restoration error: ${error}`, shouldStartNew: true, reconnectRequired: false };
    } finally {
      this.isRestoring = false;
    }
  }

  /**
   * Add message to current session
   */
  public addMessage(message: VoiceMessage): void {
    if (!this.currentSession) {
      console.warn('[Enhanced Session Manager] Cannot add message - no current session');
      return;
    }

    this.currentSession.messages.push(message);
    this.currentSession.lastActivity = Date.now();
    this.currentSession.metadata.totalMessages++;
    
    // Update in persistence layer
    this.sessionPersistence.addMessage(message);
    
    console.log('[Enhanced Session Manager] Message added:', {
      type: message.type,
      sessionId: this.currentSession.sessionId,
      totalMessages: this.currentSession.messages.length,
      content: message.content ? message.content.substring(0, 50) + '...' : 'NO CONTENT'
    });
    
    // Force save after adding message
    this.saveSession();
  }

  /**
   * Update connection state
   */
  public updateConnectionState(state: ConnectionState): void {
    if (!this.currentSession) return;

    const previousState = this.currentSession.connectionState;
    this.currentSession.connectionState = state;
    this.currentSession.lastActivity = Date.now();

    if (state === 'connected' && previousState !== 'connected') {
      // Reset reconnect attempts on successful connection
      this.currentSession.metadata.reconnectAttempts = 0;
      delete this.currentSession.metadata.lastReconnectTime;
    } else if (state === 'disconnected' && previousState === 'connected') {
      // Increment reconnect attempts
      this.currentSession.metadata.reconnectAttempts++;
      this.currentSession.metadata.lastReconnectTime = Date.now();
    }

    this.sessionPersistence.updateConnectionState(state);
    console.log('[Enhanced Session Manager] Connection state updated:', state);
  }

  /**
   * Update conversation state
   */
  public updateConversationState(state: ConversationState): void {
    if (!this.currentSession) return;

    this.currentSession.conversationState = state;
    this.currentSession.lastActivity = Date.now();
    
    this.sessionPersistence.updateConversationState(state);
  }

  /**
   * Get current session
   */
  public getCurrentSession(): WebRTCSessionData | null {
    return this.currentSession;
  }

  /**
   * Get current token (with refresh if needed)
   */
  public async getCurrentToken(): Promise<{ token: string; expiresAt: number; sessionId: string } | null> {
    if (!this.currentSession) return null;

    // Check if token needs refresh (5 minutes before expiry)
    const refreshThreshold = this.currentSession.tokenExpiresAt - (5 * 60 * 1000);
    
    if (Date.now() >= refreshThreshold && this.tokenRefreshCallback) {
      try {
        console.log('[Enhanced Session Manager] Refreshing token proactively');
        const refreshResult = await this.tokenRefreshCallback();
        
        this.currentSession.token = refreshResult.token;
        this.currentSession.tokenExpiresAt = refreshResult.expiresAt;
        
        if (refreshResult.sessionId !== this.currentSession.sessionId) {
          this.currentSession.sessionId = refreshResult.sessionId;
        }
        
        this.persistToken();
        console.log('[Enhanced Session Manager] Token refreshed proactively');
      } catch (error) {
        console.error('[Enhanced Session Manager] Proactive token refresh failed:', error);
      }
    }

    return {
      token: this.currentSession.token,
      expiresAt: this.currentSession.tokenExpiresAt,
      sessionId: this.currentSession.sessionId
    };
  }

  /**
   * Check if session needs reconnection
   */
  public needsReconnection(): boolean {
    if (!this.currentSession) return false;
    
    // Need reconnection if:
    // 1. Connection state is not connected
    // 2. Last activity was more than 5 minutes ago
    // 3. Token is close to expiry
    
    const now = Date.now();
    const lastActivityThreshold = 5 * 60 * 1000; // 5 minutes
    const tokenExpiryThreshold = 10 * 60 * 1000; // 10 minutes before expiry
    
    return (
      this.currentSession.connectionState !== 'connected' ||
      (now - this.currentSession.lastActivity) > lastActivityThreshold ||
      (this.currentSession.tokenExpiresAt - now) < tokenExpiryThreshold
    );
  }

  /**
   * End current session
   */
  public async endSession(): Promise<void> {
    if (!this.currentSession) return;

    console.log('[Enhanced Session Manager] Ending session:', this.currentSession.sessionId);

    // Mark session as inactive
    this.currentSession.isActive = false;
    this.currentSession.connectionState = 'disconnected';
    this.currentSession.lastActivity = Date.now();

    // Final save
    await this.saveSession();

    // Clear active session markers but preserve data for potential restoration
    this.clearActiveSessionMarkers();
    
    this.currentSession = null;
    console.log('[Enhanced Session Manager] Session ended');
  }

  /**
   * Clear all session data (complete cleanup)
   */
  public clearAllSessionData(): void {
    console.log('[Enhanced Session Manager] Clearing all session data');
    
    if (this.currentSession) {
      this.sessionPersistence.deleteSession(this.currentSession.sessionId);
    }
    
    this.clearPersistedData();
    this.currentSession = null;
  }

  /**
   * Get session statistics
   */
  public getSessionStats(): {
    isActive: boolean;
    sessionId: string | null;
    messageCount: number;
    duration: number;
    reconnectAttempts: number;
    tokenExpiresIn: number;
  } {
    if (!this.currentSession) {
      return {
        isActive: false,
        sessionId: null,
        messageCount: 0,
        duration: 0,
        reconnectAttempts: 0,
        tokenExpiresIn: 0
      };
    }

    return {
      isActive: this.currentSession.isActive,
      sessionId: this.currentSession.sessionId,
      messageCount: this.currentSession.messages.length,
      duration: Date.now() - this.currentSession.startTime,
      reconnectAttempts: this.currentSession.metadata.reconnectAttempts,
      tokenExpiresIn: Math.max(0, this.currentSession.tokenExpiresAt - Date.now())
    };
  }

  /**
   * Private methods
   */

  private generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateWindowId(): string {
    const stored = sessionStorage.getItem('webrtc_window_id');
    if (stored) return stored;
    
    const windowId = `win_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('webrtc_window_id', windowId);
    return windowId;
  }

  private persistToken(tokenData?: { sessionId: string; token: string; tokenExpiresAt: number }): void {
    try {
      const data = tokenData || (this.currentSession ? {
        sessionId: this.currentSession.sessionId,
        token: this.currentSession.token,
        tokenExpiresAt: this.currentSession.tokenExpiresAt
      } : null);

      if (data) {
        sessionStorage.setItem(EnhancedSessionManager.TOKEN_KEY, JSON.stringify(data));
        console.log('[Enhanced Session Manager] Token persisted');
      }
    } catch (error) {
      console.error('[Enhanced Session Manager] Failed to persist token:', error);
    }
  }

  private getPersistedToken(): { sessionId: string; token: string; tokenExpiresAt: number } | null {
    try {
      const stored = sessionStorage.getItem(EnhancedSessionManager.TOKEN_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('[Enhanced Session Manager] Failed to get persisted token:', error);
      return null;
    }
  }

  private markTabActive(): void {
    try {
      const activeData = {
        tabId: this.tabId,
        windowId: this.windowId,
        sessionId: this.currentSession?.sessionId,
        timestamp: Date.now()
      };
      
      sessionStorage.setItem(EnhancedSessionManager.TAB_SESSION_KEY, JSON.stringify(activeData));
      localStorage.setItem(EnhancedSessionManager.ACTIVE_SESSION_KEY, JSON.stringify(activeData));
    } catch (error) {
      console.error('[Enhanced Session Manager] Failed to mark tab active:', error);
    }
  }

  private clearActiveSessionMarkers(): void {
    try {
      sessionStorage.removeItem(EnhancedSessionManager.TAB_SESSION_KEY);
      localStorage.removeItem(EnhancedSessionManager.ACTIVE_SESSION_KEY);
    } catch (error) {
      console.error('[Enhanced Session Manager] Failed to clear active markers:', error);
    }
  }

  private clearPersistedData(): void {
    try {
      sessionStorage.removeItem(EnhancedSessionManager.TOKEN_KEY);
      this.clearActiveSessionMarkers();
      console.log('[Enhanced Session Manager] Persisted data cleared');
    } catch (error) {
      console.error('[Enhanced Session Manager] Failed to clear persisted data:', error);
    }
  }

  private async saveSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      // Store references before any async operations
      const sessionId = this.currentSession.sessionId;
      const messages = this.currentSession.messages || [];
      const messageCount = messages.length;
      
      // Calculate total duration
      this.currentSession.metadata.totalDuration = Date.now() - this.currentSession.startTime;
      
      // Ensure we have the session in the persistence layer
      await this.sessionPersistence.createSession(sessionId);
      
      // Check if session still exists after async operation
      if (!this.currentSession) {
        console.log('[Enhanced Session Manager] Session was cleared during save operation');
        return;
      }
      
      // Update the messages and metadata
      if (messages.length > 0) {
        // Clear existing messages and re-add them to ensure consistency
        const currentSessionData = this.sessionPersistence.getCurrentSession();
        if (currentSessionData) {
          currentSessionData.messages = messages;
          currentSessionData.connectionState = this.currentSession.connectionState;
          currentSessionData.conversationState = this.currentSession.conversationState;
          currentSessionData.lastActivity = this.currentSession.lastActivity;
          currentSessionData.metadata = this.currentSession.metadata;
        }
      }
      
      console.log('[Enhanced Session Manager] Session saved with', messageCount, 'messages');
      
    } catch (error) {
      console.error('[Enhanced Session Manager] Failed to save session:', error);
    }
  }

  private setupEventListeners(): void {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden - save current state
        this.saveSession();
      } else {
        // Page is visible - update activity timestamp
        if (this.currentSession) {
          this.currentSession.lastActivity = Date.now();
        }
      }
    });

    // Handle beforeunload
    window.addEventListener('beforeunload', (event) => {
      // Don't clear session on navigation - only on tab close
      if (this.currentSession) {
        this.saveSession();
      }
    });

    // Handle unload (actual tab close)
    window.addEventListener('unload', () => {
      if (this.currentSession) {
        // Mark session as inactive but don't delete (allows restoration)
        this.currentSession.isActive = false;
        this.clearActiveSessionMarkers();
      }
    });

    // Handle storage events from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === EnhancedSessionManager.ACTIVE_SESSION_KEY) {
        // Another tab became active
        console.log('[Enhanced Session Manager] Another tab became active');
      }
    });
  }

  private startAutoSave(): void {
    this.autoSaveInterval = setInterval(() => {
      if (this.currentSession && this.currentSession.isActive) {
        this.saveSession();
      }
    }, 30000) as unknown as number; // Save every 30 seconds
  }

  /**
   * Cleanup method
   */
  public cleanup(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }

    if (this.currentSession) {
      this.saveSession();
    }

    this.sessionPersistence.cleanup();
    console.log('[Enhanced Session Manager] Cleanup completed');
  }
}

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.1
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250810-234
 * @timestamp: 2025-08-10T23:45:00Z
 * @reasoning:
 * - **Objective:** Enhance session restoration to support proper conversation history injection
 * - **Strategy:** Sort messages chronologically before restoration to ensure proper history replay
 * - **Outcome:** Messages are injected in correct order for natural conversation flow continuation
 * 
 * Key enhancement:
 * - Added chronological sorting of messages in restoreSession() method
 * - Messages sorted by timestamp before being provided to main WebRTC agent
 * - Ensures conversation history injection maintains proper conversation flow
 * 
 * Previous revision (1.0.0):
 * - Complete WebRTC session persistence with restoration capabilities and lifecycle management
 */