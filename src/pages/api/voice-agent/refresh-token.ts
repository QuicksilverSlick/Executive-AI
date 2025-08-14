/**
 * Token Refresh Endpoint
 * Handles automatic token renewal for OpenAI Realtime API
 * 
 * Security Features:
 * - Session validation
 * - Rate limiting
 * - Token expiration checks
 * - Secure session management
 */

import type { APIRoute } from 'astro';
import type { TokenResponse } from '../../../features/voice-agent/types';
import { createTokenRateLimiter, createRateLimitMiddleware } from '../../../api/middleware/rateLimiter';

// Disable prerendering for this API endpoint
export const prerender = false;

// Environment validation
const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY;
const ALLOWED_ORIGINS = import.meta.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:4321', 
  'http://localhost:4322',
  'https://executiveaitraining.com'
];

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is required');
}

// Rate limiter for refresh requests (more restrictive than initial token requests)
const refreshRateLimiter = createTokenRateLimiter({
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: import.meta.env.DEV ? 20 : 5, // More lenient in development
  onLimitReached: (clientIP: string, attempts: number) => {
    const isDev = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';
    if (isDev) {
      console.log(`ℹ️ Token refresh rate limit reached for ${clientIP} - Attempts: ${attempts} (Development mode)`);
    } else {
      console.warn(`🚫 Token refresh rate limit exceeded for ${clientIP} - Attempts: ${attempts}`);
    }
  }
});

// Session store for tracking active sessions
const activeSessions = new Map<string, {
  sessionId: string;
  clientIP: string;
  createdAt: number;
  lastRefresh: number;
  refreshCount: number;
}>();

// Cleanup expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  const expiredSessions: string[] = [];
  
  for (const [sessionId, session] of activeSessions.entries()) {
    // Remove sessions older than 10 minutes or with excessive refresh attempts
    if (now - session.createdAt > 10 * 60 * 1000 || session.refreshCount > 20) {
      expiredSessions.push(sessionId);
    }
  }
  
  expiredSessions.forEach(sessionId => {
    activeSessions.delete(sessionId);
  });
  
  if (expiredSessions.length > 0) {
    console.log(`🧹 Cleaned up ${expiredSessions.length} expired sessions`);
  }
}, 5 * 60 * 1000);

/**
 * Validate refresh request
 */
function validateRefreshRequest(sessionId: string, clientIP: string): {
  valid: boolean;
  reason?: string;
} {
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

/**
 * Generate new ephemeral token for OpenAI Realtime API
 */
async function generateEphemeralToken(): Promise<{ token: string; expiresAt: number; }> {
  const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-realtime-preview',
      voice: 'alloy',
      expires_at: Math.floor(Date.now() / 1000) + 60, // 60 seconds from now
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI token generation failed:', response.status, errorText);
    throw new Error(`Token generation failed: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    token: data.client_secret.value,
    expiresAt: data.expires_at * 1000 // Convert to milliseconds
  };
}

/**
 * POST /api/voice-agent/refresh-token
 * Refreshes expired or expiring tokens for active sessions
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const startTime = Date.now();
  // Safe clientAddress handling - fallback to IP from headers if needed
  const clientIP = clientAddress || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const origin = request.headers.get('origin');
  
  console.log(`🔄 Token refresh request from ${clientIP} - ${userAgent} - Origin: ${origin}`);
  
  try {
    // CORS validation
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      console.warn(`❌ Invalid origin for refresh: ${origin} from ${clientIP}`);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid origin'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Rate limiting
    const rateLimitMiddleware = createRateLimitMiddleware(refreshRateLimiter);
    const rateLimitResponse = rateLimitMiddleware(request, clientIP);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Environment check
    if (!OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured for refresh');
      return new Response(JSON.stringify({
        success: false,
        error: 'Service temporarily unavailable'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid request body'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { sessionId } = requestBody;
    
    // Validate refresh request
    const validation = validateRefreshRequest(sessionId, clientIP);
    if (!validation.valid) {
      console.warn(`❌ Invalid refresh request from ${clientIP}: ${validation.reason}`);
      return new Response(JSON.stringify({
        success: false,
        error: validation.reason
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate new token
    const { token, expiresAt } = await generateEphemeralToken();
    
    // Update session tracking
    const session = activeSessions.get(sessionId)!;
    session.lastRefresh = Date.now();
    session.refreshCount++;
    
    const response: TokenResponse = {
      success: true,
      token,
      expiresAt,
      sessionId
    };
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ Token refreshed for ${clientIP} - Session: ${sessionId} - Refresh #${session.refreshCount} - Processing: ${processingTime}ms`);
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Processing-Time': processingTime.toString(),
        'X-Refresh-Count': session.refreshCount.toString(),
        ...(origin && ALLOWED_ORIGINS.includes(origin) && {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        })
      }
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Token refresh error for ${clientIP}:`, error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Token refresh failed'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Processing-Time': processingTime.toString()
      }
    });
  }
};

/**
 * OPTIONS /api/voice-agent/refresh-token
 * Handle CORS preflight requests
 */
export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin');
  
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400' // 24 hours
      }
    });
  }
  
  return new Response(null, { status: 404 });
};

/**
 * Export session management functions for use in other endpoints
 */
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