/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Test suite for WebRTC session persistence functionality
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-unknown-20250809-673
 * @init-timestamp: 2025-08-09T12:30:00Z
 * @reasoning:
 * - **Objective:** Validate session persistence and restoration functionality
 * - **Strategy:** Test enhanced session manager and WebRTC integration
 * - **Outcome:** Ensure reliable session continuity across navigation and reloads
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedSessionManager } from '../lib/voice-agent/enhanced-session-manager';

describe('Enhanced Session Manager', () => {
  let sessionManager: EnhancedSessionManager;
  
  beforeEach(() => {
    // Clear storage before each test
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.clear();
    }
    sessionManager = EnhancedSessionManager.getInstance();
  });

  afterEach(() => {
    sessionManager.cleanup();
  });

  it('should create a new session with token persistence', async () => {
    const sessionId = 'test-session-1';
    const token = 'test-token-123';
    const tokenExpiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

    const sessionData = await sessionManager.createSession(sessionId, token, tokenExpiresAt);

    expect(sessionData.sessionId).toBe(sessionId);
    expect(sessionData.token).toBe(token);
    expect(sessionData.tokenExpiresAt).toBe(tokenExpiresAt);
    expect(sessionData.isActive).toBe(true);
    expect(sessionData.messages).toEqual([]);
  });

  it('should restore session from storage', async () => {
    // First, create a session
    const sessionId = 'test-session-2';
    const token = 'test-token-456';
    const tokenExpiresAt = Date.now() + 30 * 60 * 1000;

    await sessionManager.createSession(sessionId, token, tokenExpiresAt);
    
    // Add a message
    sessionManager.addMessage({
      id: 'msg-1',
      type: 'user',
      content: 'Hello world',
      timestamp: new Date().toISOString()
    });

    // Simulate page reload by getting a new instance
    const newSessionManager = EnhancedSessionManager.getInstance();
    
    // Attempt restoration
    const restorationResult = await newSessionManager.restoreSession();

    expect(restorationResult.success).toBe(true);
    expect(restorationResult.sessionData?.sessionId).toBe(sessionId);
    expect(restorationResult.sessionData?.messages).toHaveLength(1);
    expect(restorationResult.sessionData?.messages[0].content).toBe('Hello world');
  });

  it('should handle token expiration during restoration', async () => {
    // Create session with expired token
    const sessionId = 'test-session-3';
    const token = 'expired-token';
    const tokenExpiresAt = Date.now() - 1000; // Already expired

    await sessionManager.createSession(sessionId, token, tokenExpiresAt);

    // Mock token refresh callback
    let refreshCalled = false;
    sessionManager.setTokenRefreshCallback(async () => {
      refreshCalled = true;
      return {
        token: 'new-token-789',
        expiresAt: Date.now() + 30 * 60 * 1000,
        sessionId
      };
    });

    const restorationResult = await sessionManager.restoreSession();

    expect(refreshCalled).toBe(true);
    expect(restorationResult.success).toBe(true);
  });

  it('should handle restoration failure gracefully', async () => {
    // Attempt restoration with no existing session
    const restorationResult = await sessionManager.restoreSession();

    expect(restorationResult.success).toBe(false);
    expect(restorationResult.shouldStartNew).toBe(true);
    expect(restorationResult.reason).toContain('No token found');
  });

  it('should update connection and conversation states', async () => {
    const sessionId = 'test-session-4';
    const token = 'test-token';
    const tokenExpiresAt = Date.now() + 30 * 60 * 1000;

    await sessionManager.createSession(sessionId, token, tokenExpiresAt);

    // Update states
    sessionManager.updateConnectionState('connected');
    sessionManager.updateConversationState('listening');

    const session = sessionManager.getCurrentSession();
    
    expect(session?.connectionState).toBe('connected');
    expect(session?.conversationState).toBe('listening');
  });

  it('should provide accurate session statistics', async () => {
    const sessionId = 'test-session-5';
    const token = 'test-token';
    const tokenExpiresAt = Date.now() + 30 * 60 * 1000;

    await sessionManager.createSession(sessionId, token, tokenExpiresAt);
    
    // Add messages
    sessionManager.addMessage({
      id: 'msg-1',
      type: 'user',
      content: 'Message 1',
      timestamp: new Date().toISOString()
    });
    
    sessionManager.addMessage({
      id: 'msg-2',
      type: 'assistant',
      content: 'Response 1',
      timestamp: new Date().toISOString()
    });

    const stats = sessionManager.getSessionStats();

    expect(stats.isActive).toBe(true);
    expect(stats.sessionId).toBe(sessionId);
    expect(stats.messageCount).toBe(2);
    expect(stats.duration).toBeGreaterThan(0);
    expect(stats.tokenExpiresIn).toBeGreaterThan(0);
  });

  it('should end session properly while preserving data', async () => {
    const sessionId = 'test-session-6';
    const token = 'test-token';
    const tokenExpiresAt = Date.now() + 30 * 60 * 1000;

    await sessionManager.createSession(sessionId, token, tokenExpiresAt);
    
    // Add a message
    sessionManager.addMessage({
      id: 'msg-1',
      type: 'user',
      content: 'Test message',
      timestamp: new Date().toISOString()
    });

    await sessionManager.endSession();

    // Session should be ended but data preserved for restoration
    const currentSession = sessionManager.getCurrentSession();
    expect(currentSession).toBeNull();

    // Should be able to restore
    const restorationResult = await sessionManager.restoreSession();
    expect(restorationResult.success).toBe(true);
  });

  it('should clear all session data completely', async () => {
    const sessionId = 'test-session-7';
    const token = 'test-token';
    const tokenExpiresAt = Date.now() + 30 * 60 * 1000;

    await sessionManager.createSession(sessionId, token, tokenExpiresAt);
    
    sessionManager.clearAllSessionData();

    // Should not be able to restore after complete clear
    const restorationResult = await sessionManager.restoreSession();
    expect(restorationResult.success).toBe(false);
    expect(restorationResult.shouldStartNew).toBe(true);
  });
});

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250809-673
 * @timestamp: 2025-08-09T12:30:00Z
 * @reasoning:
 * - **Objective:** Comprehensive test coverage for WebRTC session persistence
 * - **Strategy:** Test all major session lifecycle operations and edge cases
 * - **Outcome:** Validated session creation, restoration, state management, and cleanup
 * 
 * Test coverage includes:
 * - Session creation with token persistence
 * - Session restoration from storage
 * - Token expiration handling and refresh
 * - Graceful restoration failure handling
 * - Connection and conversation state updates
 * - Session statistics accuracy
 * - Proper session ending with data preservation
 * - Complete data clearing functionality
 */