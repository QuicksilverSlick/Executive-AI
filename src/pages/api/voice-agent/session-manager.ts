/**
 * Session Management for Voice Agent
 * Handles tracking and cleanup of active sessions
 */

const activeSessions = new Map<string, {
  sessionId: string;
  clientIP: string;
  createdAt: number;
  lastRefresh: number;
  refreshCount: number;
}>();

export function registerSession(sessionId: string, clientIP: string): void {
  activeSessions.set(sessionId, {
    sessionId,
    clientIP,
    createdAt: Date.now(),
    lastRefresh: Date.now(),
    refreshCount: 0
  });
  
  console.log(`📝 Registered new session: ${sessionId} from ${clientIP}`);
}

export function getSessionStats(): {
  activeSessions: number;
  totalRefreshes: number;
} {
  let totalRefreshes = 0;
  for (const session of activeSessions.values()) {
    totalRefreshes += session.refreshCount;
  }
  
  return {
    activeSessions: activeSessions.size,
    totalRefreshes
  };
}

export function validateSession(sessionId: string, clientIP: string): { valid: boolean; reason?: string } {
  if (!sessionId || typeof sessionId !== 'string') {
    return { valid: false, reason: 'Invalid session ID' };
  }

  const session = activeSessions.get(sessionId);
  if (!session) {
    return { valid: false, reason: 'Session not found or expired' };
  }

  // Verify client IP matches (basic session hijacking protection)
  if (session.clientIP !== clientIP) {
    console.warn(`🚨 Session hijacking attempt: Session ${sessionId} from ${clientIP}, expected ${session.clientIP}`);
    return { valid: false, reason: 'Session validation failed' };
  }

  // Check refresh frequency (prevent abuse)
  const now = Date.now();
  const minRefreshInterval = 30 * 1000; // Minimum 30 seconds between refreshes
  
  if (now - session.lastRefresh < minRefreshInterval) {
    return { valid: false, reason: 'Refresh too frequent' };
  }

  return { valid: true };
}

export function updateSession(sessionId: string): void {
  const session = activeSessions.get(sessionId);
  if (session) {
    session.lastRefresh = Date.now();
    session.refreshCount++;
  }
}
