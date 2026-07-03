/**
 * Ephemeral Token Generation Endpoint (OpenAI Realtime API — GA interface)
 *
 * Mints a short-lived ephemeral client secret (`ek_...`) that the browser uses
 * to open a WebRTC call to the Realtime API. The real OPENAI_API_KEY never
 * leaves the server.
 *
 * Migrated 2026-07 to the GA interface (POST /v1/realtime/client_secrets).
 * The prior implementation used the removed beta endpoint and, on failure,
 * returned the raw API key to the browser as a "fallback" — that behaviour has
 * been removed. On failure this endpoint returns an error, never a key.
 */

import type { APIRoute } from 'astro';
import type { TokenResponse } from '../../../features/voice-agent/types';
import { createTokenRateLimiter, createRateLimitMiddleware } from '../../../api/middleware/rateLimiter';
import { registerSession } from './session-manager';
import {
  OPENAI_CLIENT_SECRETS_URL,
  CLIENT_SECRET_TTL_SECONDS,
  buildRealtimeSession,
} from '../../../lib/voice-agent/realtime-config';

// Disable prerendering for this API endpoint
export const prerender = false;

// Environment validation - Cloudflare compatible
function getEnvVar(key: string, locals?: any): string | undefined {
  if (locals?.runtime?.env?.[key]) return locals.runtime.env[key];
  if (typeof process !== 'undefined' && process.env?.[key]) return process.env[key];
  if (import.meta.env[key]) return import.meta.env[key];
  return undefined;
}

function getEnvConfig(locals?: any) {
  const OPENAI_API_KEY = getEnvVar('OPENAI_API_KEY', locals);
  const ALLOWED_ORIGINS_STR = getEnvVar('ALLOWED_ORIGINS', locals);

  const defaultOrigins = [
    'http://localhost:4321',
    'http://localhost:4322',
    'http://localhost:4323',
    'http://localhost:4324',
    'http://localhost:4325',
    'http://localhost:4326',
    'https://executiveaitraining.com',
    'https://www.executiveaitraining.com',
    'https://executive-ai.pages.dev',
  ];

  const ALLOWED_ORIGINS = ALLOWED_ORIGINS_STR
    ? [...defaultOrigins, ...ALLOWED_ORIGINS_STR.split(',').map((s) => s.trim()).filter(Boolean)]
    : defaultOrigins;

  const TOKEN_DURATION = parseInt(getEnvVar('VOICE_AGENT_TOKEN_DURATION', locals) || '1800');
  const RATE_LIMIT_MAX = parseInt(getEnvVar('VOICE_AGENT_RATE_LIMIT', locals) || '10');

  return { OPENAI_API_KEY, ALLOWED_ORIGINS, TOKEN_DURATION, RATE_LIMIT_MAX };
}

/**
 * Mint an ephemeral client secret via the GA client_secrets endpoint.
 * Returns the ephemeral value (`ek_...`) + expiry + resolved session config.
 * Throws on any non-2xx — the raw API key is NEVER returned to the caller.
 */
async function mintClientSecret(apiKey: string): Promise<{ token: string; expiresAt: number; session: any }> {
  const body = {
    expires_after: { anchor: 'created_at', seconds: CLIENT_SECRET_TTL_SECONDS },
    session: buildRealtimeSession(),
  };

  const response = await fetch(OPENAI_CLIENT_SECRETS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`client_secrets ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data: any = await response.json();
  if (!data?.value) {
    throw new Error('client_secrets response missing ephemeral "value"');
  }

  const expiresAt = data.expires_at
    ? data.expires_at * 1000
    : Date.now() + CLIENT_SECRET_TTL_SECONDS * 1000;

  return { token: data.value as string, expiresAt, session: data.session };
}

/**
 * POST /api/voice-agent/token
 * Returns an ephemeral client secret for the browser WebRTC connection.
 */
export const POST: APIRoute = async (context) => {
  const { request, clientAddress, locals } = context;
  const { OPENAI_API_KEY, ALLOWED_ORIGINS, RATE_LIMIT_MAX } = getEnvConfig(locals);
  const startTime = Date.now();

  const clientIP =
    clientAddress ||
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const origin = request.headers.get('origin');

  try {
    // CORS: lenient for our own domains / Cloudflare Pages previews; log unusual origins.
    const isCloudflarePages = origin?.includes('.pages.dev') || origin?.includes('executiveaitraining.com');
    const isLocalhost = origin?.includes('localhost');
    const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin || '');
    if (origin && !isAllowedOrigin && !isCloudflarePages && !isLocalhost) {
      if (!origin.startsWith('https://') && !origin.startsWith('http://localhost')) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid origin' }),
          { status: 403, headers: { 'Content-Type': 'application/json', 'X-Error-Reason': 'CORS-Invalid-Origin' } }
        );
      }
    }

    // Rate limiting
    const tokenRateLimiter = createTokenRateLimiter({
      windowMs: 60 * 1000,
      maxRequests: RATE_LIMIT_MAX,
      onLimitReached: (ip: string, attempts: number) => {
        console.warn(`🚫 Token rate limit exceeded for ${ip} (attempts: ${attempts})`);
      },
    });
    const rateLimitResponse = createRateLimitMiddleware(tokenRateLimiter)(request, clientIP);
    if (rateLimitResponse) return rateLimitResponse;

    if (!OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Service temporarily unavailable' }),
        { status: 503, headers: { 'Content-Type': 'application/json', 'X-Error-Reason': 'Missing-API-Key' } }
      );
    }

    // Mint the ephemeral client secret. On failure we return an error, never the key.
    const { token, expiresAt, session } = await mintClientSecret(OPENAI_API_KEY);

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    registerSession(sessionId, clientIP);

    const response: TokenResponse = {
      success: true,
      token,
      expiresAt,
      sessionId,
      mode: 'realtime',
      ...(session && { sessionConfig: session }),
    };

    const processingTime = Date.now() - startTime;
    console.log(`✅ Ephemeral token issued (${processingTime}ms, session ${sessionId})`);

    const responseHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Processing-Time': processingTime.toString(),
      'X-Session-Id': sessionId,
      'X-Token-Mode': 'realtime',
    };
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      responseHeaders['Access-Control-Allow-Origin'] = origin;
      responseHeaders['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
      responseHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      responseHeaders['Access-Control-Allow-Credentials'] = 'true';
    }

    return new Response(JSON.stringify(response), { status: 200, headers: responseHeaders });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    // Log the reason server-side; never surface the key or full error to the client.
    console.error(`❌ Token generation failed for ${clientIP}:`, error instanceof Error ? error.message : error);
    return new Response(
      JSON.stringify({ success: false, error: 'Unable to start voice session. Please try again shortly.' }),
      { status: 502, headers: { 'Content-Type': 'application/json', 'X-Processing-Time': processingTime.toString() } }
    );
  }
};

/**
 * GET /api/voice-agent/token — wrong method helper.
 */
export const GET: APIRoute = async () =>
  new Response(
    JSON.stringify({
      success: false,
      error: 'Method not allowed. Use POST to generate tokens.',
      hint: 'Make a POST request to this endpoint to generate an ephemeral token.',
    }),
    { status: 405, headers: { 'Content-Type': 'application/json', Allow: 'POST, OPTIONS' } }
  );

/**
 * OPTIONS /api/voice-agent/token — CORS preflight.
 */
export const OPTIONS: APIRoute = async (context) => {
  const { request, locals } = context;
  const origin = request.headers.get('origin');
  const { ALLOWED_ORIGINS } = getEnvConfig(locals);

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  return new Response(null, { status: 404 });
};
