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
import { validateSession, updateSession } from './session-manager';

// Disable prerendering for this API endpoint
export const prerender = false;

// Environment validation - Cloudflare compatible
function getEnvVar(key: string, locals?: any): string | undefined {
  if (locals?.runtime?.env?.[key]) {
    return locals.runtime.env[key];
  }
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key];
  }
  if (import.meta.env[key]) {
    return import.meta.env[key];
  }
  return undefined;
}

function getEnvConfig(locals?: any) {
  const OPENAI_API_KEY = getEnvVar('OPENAI_API_KEY', locals);
  const ALLOWED_ORIGINS_STR = getEnvVar('ALLOWED_ORIGINS', locals);
  const defaultOrigins = [
    'http://localhost:4321', 
    'http://localhost:4322',
    'https://executiveaitraining.com'
  ];
  const ALLOWED_ORIGINS = ALLOWED_ORIGINS_STR 
    ? [...defaultOrigins, ...ALLOWED_ORIGINS_STR.split(',')]
    : defaultOrigins;
  const RATE_LIMIT_MAX = parseInt(getEnvVar('REFRESH_RATE_LIMIT', locals) || '5');
  
  return { OPENAI_API_KEY, ALLOWED_ORIGINS, RATE_LIMIT_MAX };
}

/**
 * Generate new ephemeral token for OpenAI Realtime API
 */
async function generateEphemeralToken(apiKey: string): Promise<{ token: string; expiresAt: number; }> {
  const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-realtime-preview',
      voice: 'alloy',
      client_secret: {
        expires_after: {
          seconds: 60,
          anchor: 'created_at'
        }
      }
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
    expiresAt: data.client_secret.expires_at * 1000 // Convert to milliseconds
  };
}

/**
 * POST /api/voice-agent/refresh-token
 * Refreshes expired or expiring tokens for active sessions
 */
export const POST: APIRoute = async ({ request, clientAddress, locals }) => {
  const startTime = Date.now();
  const { OPENAI_API_KEY, ALLOWED_ORIGINS, RATE_LIMIT_MAX } = getEnvConfig(locals);

  // Safe clientAddress handling
  const clientIP = clientAddress || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const origin = request.headers.get('origin');
  
  console.log(`🔄 Token refresh request from ${clientIP} - ${userAgent} - Origin: ${origin}`);
  
  try {
    // CORS validation
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      console.warn(`❌ Invalid origin for refresh: ${origin} from ${clientIP}`);
      return new Response(JSON.stringify({ success: false, error: 'Invalid origin' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Rate limiting
    const refreshRateLimiter = createTokenRateLimiter({
      windowMs: 60 * 1000,
      maxRequests: RATE_LIMIT_MAX,
    });
    const rateLimitMiddleware = createRateLimitMiddleware(refreshRateLimiter);
    const rateLimitResponse = rateLimitMiddleware(request, clientIP);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Environment check
    if (!OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured for refresh');
      return new Response(JSON.stringify({ success: false, error: 'Service temporarily unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { sessionId } = requestBody;
    
    // Validate refresh request
    const validation = validateSession(sessionId, clientIP);
    if (!validation.valid) {
      console.warn(`❌ Invalid refresh request from ${clientIP}: ${validation.reason}`);
      return new Response(JSON.stringify({ success: false, error: validation.reason }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate new token
    const { token, expiresAt } = await generateEphemeralToken(OPENAI_API_KEY);
    
    // Update session tracking
    updateSession(sessionId);
    
    const response: TokenResponse = {
      success: true,
      token,
      expiresAt,
      sessionId
    };
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ Token refreshed for ${clientIP} - Session: ${sessionId} - Processing: ${processingTime}ms`);
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Processing-Time': processingTime.toString(),
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
    
    return new Response(JSON.stringify({ success: false, error: 'Token refresh failed' }), {
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
export const OPTIONS: APIRoute = async ({ request, locals }) => {
  const origin = request.headers.get('origin');
  const { ALLOWED_ORIGINS } = getEnvConfig(locals);
  
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