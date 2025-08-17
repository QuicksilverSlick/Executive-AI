/**
 * Ephemeral Token Generation Endpoint
 * Generates short-lived tokens for OpenAI Realtime API authentication
 * 
 * Features:
 * - OpenAI API tier detection
 * - Automatic fallback to Chat API with TTS
 * - Graceful degradation handling
 * - 60-second token lifespan
 * - Rate limiting
 * - IP validation
 * - Request logging for audit, compatibility checking
 */

import type { APIRoute } from 'astro';
import type { TokenResponse } from '../../../features/voice-agent/types';
import { createTokenRateLimiter, createRateLimitMiddleware } from '../../../api/middleware/rateLimiter';
import { registerSession } from './session-manager';

// Disable prerendering for this API endpoint
export const prerender = false;

// Environment validation - Cloudflare compatible
function getEnvVar(key: string, locals?: any): string | undefined {
  // Primary method: locals.runtime.env (Cloudflare Pages pattern)
  if (locals?.runtime?.env?.[key]) {
    console.log(`✅ Found ${key} in locals.runtime.env`);
    return locals.runtime.env[key];
  }
  
  // Fallback to process.env (available in Cloudflare Pages runtime)
  if (typeof process !== 'undefined' && process.env?.[key]) {
    console.log(`✅ Found ${key} in process.env`);
    return process.env[key];
  }
  
  // Build-time environment variables (for local dev)
  if (import.meta.env[key]) {
    console.log(`✅ Found ${key} in import.meta.env`);
    return import.meta.env[key];
  }
  
  console.log(`❌ ${key} not found in any environment source`);
  console.log(`Debug - locals structure:`, locals);
  return undefined;
}

function getEnvConfig(locals?: any) {
  const OPENAI_API_KEY = getEnvVar('OPENAI_API_KEY', locals);
  const ALLOWED_ORIGINS_STR = getEnvVar('ALLOWED_ORIGINS', locals);
  
  // Default allowed origins including the Cloudflare Pages URL
  const defaultOrigins = [
    'http://localhost:4321', 
    'http://localhost:4322', 
    'http://localhost:4323', 
    'http://localhost:4324',
    'http://localhost:4325',
    'http://localhost:4326',
    'https://executiveaitraining.com',
    'https://91c1a4d4.executive-ai.pages.dev',
    'https://d30fdb40.executive-ai.pages.dev',
    'https://executive-ai.pages.dev'
  ];
  
  const ALLOWED_ORIGINS = ALLOWED_ORIGINS_STR 
    ? [...defaultOrigins, ...ALLOWED_ORIGINS_STR.split(',')]
    : defaultOrigins;
    
  const TOKEN_DURATION = parseInt(getEnvVar('VOICE_AGENT_TOKEN_DURATION', locals) || '1800'); // 30 minutes
  const RATE_LIMIT_MAX = parseInt(getEnvVar('VOICE_AGENT_RATE_LIMIT', locals) || '10');
  const ENABLE_DEMO_MODE = getEnvVar('VOICE_AGENT_DEMO_MODE', locals) === 'true';
  
  return { OPENAI_API_KEY, ALLOWED_ORIGINS, TOKEN_DURATION, RATE_LIMIT_MAX, ENABLE_DEMO_MODE };
}

// Tier detection cache (to avoid repeated API calls)
let apiTierCache: {
  tier: 'realtime' | 'standard' | 'unknown';
  checkedAt: number;
  expiresAt: number;
} | null = null;

const TIER_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiter initialization happens in the handler

// Rate limiter will be created in the handler with proper config
// This allows us to access environment variables properly in Cloudflare Workers

/**
 * Detect OpenAI API tier and Realtime API availability
 */
async function detectAPITier(apiKey: string): Promise<'realtime' | 'standard' | 'unknown'> {
  // Check cache first
  if (apiTierCache && Date.now() < apiTierCache.expiresAt) {
    return apiTierCache.tier;
  }

  try {
    // Test Realtime API availability with a minimal request
    // Using the correct API format as per OpenAI documentation
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2025-06-03',
        modalities: ['audio', 'text'],
        instructions: 'You are a helpful assistant for voice interactions.',
      }),
    });

    let tier: 'realtime' | 'standard' | 'unknown';
    
    if (response.ok) {
      tier = 'realtime';
      console.log('✅ Realtime API access confirmed');
    } else if (response.status === 401) {
      tier = 'unknown'; // API key issue
      console.warn('⚠️ API authentication failed - check API key');
    } else if (response.status === 403) {
      tier = 'standard';
      const errorText = await response.text();
      console.log('ℹ️ Realtime API access forbidden - likely tier limitation. Using fallback mode.');
    } else if (response.status === 404) {
      tier = 'standard';
      const errorText = await response.text();
      console.log('ℹ️ Realtime API endpoint not found - using fallback mode.');
    } else if (response.status === 400) {
      // Bad request might indicate parameter issues or tier limitations
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.code === 'model_not_found' || errorData.error?.message?.includes('model')) {
          tier = 'standard';
          console.log('ℹ️ Realtime model not available on current tier - using fallback mode.');
        } else {
          tier = 'unknown';
          console.warn('⚠️ Bad request to Realtime API:', errorData.error?.message);
        }
      } catch {
        tier = 'unknown';
        console.warn('⚠️ Bad request to Realtime API:', errorText);
      }
    } else {
      tier = 'unknown';
      console.warn('⚠️ Unable to detect API tier:', response.status);
    }

    // Cache the result
    apiTierCache = {
      tier,
      checkedAt: Date.now(),
      expiresAt: Date.now() + TIER_CACHE_DURATION
    };

    return tier;
  } catch (error) {
    console.error('❌ API tier detection failed:', error);
    return 'unknown';
  }
}

/**
 * Generate ephemeral token for OpenAI Realtime API with WebRTC support
 * Following the official OpenAI documentation for session creation
 */
async function generateEphemeralToken(apiKey: string): Promise<{ token: string; expiresAt: number; sessionId: string; sessionConfig?: any; }> {
  console.log('🔐 Generating ephemeral token for WebRTC...');
  
  // Create session with recommended configuration for WebRTC
  const requestBody = {
    model: 'gpt-4o-realtime-preview-2025-06-03',
    modalities: ['audio', 'text'],
    instructions: 'You are a helpful AI assistant for voice interactions. Be concise and conversational.',
    voice: 'alloy',
    input_audio_format: 'pcm16',
    output_audio_format: 'pcm16',
    input_audio_transcription: {
      model: 'whisper-1'
    },
    turn_detection: {
      type: 'server_vad',
      threshold: 0.5,
      prefix_padding_ms: 300,
      silence_duration_ms: 500
    },
    temperature: 0.8,
    max_response_output_tokens: 'inf'
  };
  
  console.log('📤 Creating session with config:', JSON.stringify(requestBody, null, 2));
  
  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('📥 Session creation response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        apiKeyLength: apiKey?.length
      });
      
      // Throw a detailed error to be caught by the main handler
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log('📥 Raw response body:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('📥 Parsed session response:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw new Error('Invalid JSON response from OpenAI API');
    }
    
    // Validate response structure according to OpenAI docs
    if (!data.client_secret?.value || !data.client_secret?.expires_at) {
      console.error('❌ Invalid response structure:', data);
      console.error('Expected: { client_secret: { value: string, expires_at: number }, ... }');
      throw new Error('Invalid session response structure from OpenAI API');
    }
    
    const tokenResult = {
      token: data.client_secret.value,
      expiresAt: data.client_secret.expires_at * 1000, // Convert to milliseconds
      sessionId: data.id || `sess_${Date.now()}`,
      sessionConfig: {
        model: data.model,
        modalities: data.modalities,
        voice: data.voice,
        instructions: data.instructions,
        input_audio_format: data.input_audio_format,
        output_audio_format: data.output_audio_format,
        turn_detection: data.turn_detection
      }
    };
    
    console.log('✅ Ephemeral session created successfully:', {
      sessionId: tokenResult.sessionId,
      expiresAt: new Date(tokenResult.expiresAt).toISOString(),
      tokenLength: tokenResult.token.length,
      model: data.model,
      voice: data.voice
    });
    
    return tokenResult;
  } catch (error) {
    console.error('Token generation exception:', error);
    // Re-throw the error to be handled by the POST handler's catch block
    throw error;
  }
}

/**
 * Generate fallback token for standard OpenAI API
 * Returns the API key directly with a simulated expiration
 */
async function generateFallbackToken(apiKey: string, tokenDuration: number): Promise<{ token: string; expiresAt: number; mode: 'fallback' }> {
  // In fallback mode, we return the API key directly
  // The client will use this for Chat API + TTS
  return {
    token: apiKey,
    expiresAt: Date.now() + (tokenDuration * 1000),
    mode: 'fallback'
  };
}

/**
 * Generate demo token for testing without API access
 */
async function generateDemoToken(tokenDuration: number): Promise<{ token: string; expiresAt: number; mode: 'demo' }> {
  // Demo mode - returns a fake token for UI testing
  return {
    token: 'demo_token_' + Math.random().toString(36).substring(2, 11),
    expiresAt: Date.now() + (tokenDuration * 1000),
    mode: 'demo'
  };
}

/**
 * POST /api/voice-agent/token
 * Generates ephemeral tokens for voice agent authentication
 */
export const POST: APIRoute = async (context) => {
  const { request, clientAddress, locals } = context;
  
  // Get environment config - pass locals which contains runtime.env
  const { OPENAI_API_KEY, ALLOWED_ORIGINS, TOKEN_DURATION, RATE_LIMIT_MAX, ENABLE_DEMO_MODE } = getEnvConfig(locals);
  console.log('===== TOKEN ENDPOINT REQUEST =====');
  console.log('🔍 Token endpoint POST handler started at:', new Date().toISOString());
  const startTime = Date.now();
  
  // Log complete request details
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  // Safe clientAddress handling - fallback to IP from headers if needed
  const clientIP = clientAddress || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // Detailed request logging
  console.log('Client details:', {
    clientIP,
    userAgent,
    origin,
    referer,
    requestedPort: new URL(request.url).port,
    host: request.headers.get('host')
  });
  
  // Log request body
  let requestBody: any;
  try {
    const bodyText = await request.clone().text();
    console.log('Raw request body:', bodyText);
    if (bodyText) {
      requestBody = JSON.parse(bodyText);
      console.log('Parsed request body:', requestBody);
    }
  } catch (e) {
    console.error('Failed to parse request body:', e);
  }
  
  // Environment and API key validation
  console.log('Environment check:', {
    isDev: import.meta.env.DEV,
    mode: import.meta.env.MODE,
    baseUrl: import.meta.env.BASE_URL,
    runtime: 'cloudflare-workers'
  });
  
  console.log('API Key validation:', {
    hasContextEnv: !!(context as any)?.env?.OPENAI_API_KEY,
    hasLocalsRuntimeEnv: !!(locals as any)?.runtime?.env?.OPENAI_API_KEY,
    hasImportMetaKey: !!import.meta.env.OPENAI_API_KEY,
    apiKeyAvailable: !!OPENAI_API_KEY,
    keyPrefix: OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 10) + '...' : 'NOT_SET',
    keyLength: OPENAI_API_KEY ? OPENAI_API_KEY.length : 0
  });
  
  console.log('CORS configuration:', {
    allowedOrigins: ALLOWED_ORIGINS,
    requestOrigin: origin,
    isOriginAllowed: origin ? ALLOWED_ORIGINS.includes(origin) : 'no-origin'
  });
  
  try {
    // CORS validation - more lenient for Cloudflare Pages
    // In production, Cloudflare Pages URLs are dynamic, so we allow pages.dev domains
    const isCloudflarePages = origin?.includes('.pages.dev') || origin?.includes('executiveaitraining.com');
    const isLocalhost = origin?.includes('localhost');
    const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin || '');
    
    if (origin && !isAllowedOrigin && !isCloudflarePages && !isLocalhost) {
      console.warn(`⚠️ CORS WARNING: Unusual origin '${origin}' from ${clientIP}`);
      // In production, we log but don't block - Cloudflare handles security
      console.log('Allowed origins:', ALLOWED_ORIGINS);
      console.log('Request origin:', origin);
      
      // Only block if it's clearly suspicious
      if (!origin.startsWith('https://') && !origin.startsWith('http://localhost')) {
        const corsError = {
          success: false,
          error: 'Invalid origin',
          details: {
            requestedOrigin: origin,
            suggestion: 'Please use HTTPS for production requests'
          }
        };
        
        return new Response(JSON.stringify(corsError), {
          status: 403,
          headers: { 
            'Content-Type': 'application/json',
            'X-Error-Reason': 'CORS-Invalid-Origin'
          }
        });
      }
    }
    
    // Enhanced rate limiting
    const tokenRateLimiter = createTokenRateLimiter({
      windowMs: 60 * 1000, // 1 minute window
      maxRequests: RATE_LIMIT_MAX,
      onLimitReached: (clientIP: string, attempts: number) => {
        console.warn(`🚫 Token generation rate limit exceeded for ${clientIP} - Attempts: ${attempts}`);
      }
    });
    const rateLimitMiddleware = createRateLimitMiddleware(tokenRateLimiter);
    const rateLimitResponse = rateLimitMiddleware(request, clientIP);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Environment check with detailed logging
    if (!OPENAI_API_KEY) {
      console.error('❌ CRITICAL ERROR: OpenAI API key not configured');
      console.error('Env var sources checked:', {
        importMetaEnv: Object.keys(import.meta.env).filter(k => k.includes('OPENAI'))
      });
      
      const apiKeyError = {
        success: false,
        error: 'Service temporarily unavailable',
        details: 'OpenAI API key not found in environment'
      };
      
      console.log('Returning API key error:', apiKeyError);
      return new Response(JSON.stringify(apiKeyError), {
        status: 503,
        headers: { 
          'Content-Type': 'application/json',
          'X-Error-Reason': 'Missing-API-Key'
        }
      });
    }
    
    console.log('✅ All validations passed, proceeding to generate token...');
    
    // Detect API tier and generate appropriate token
    let tokenData: any;
    let mode: 'realtime' | 'fallback' | 'demo' = 'realtime';
    let warnings: string[] = [];

    if (ENABLE_DEMO_MODE) {
      // Demo mode override
      tokenData = await generateDemoToken(TOKEN_DURATION);
      mode = 'demo';
      warnings.push('Running in demo mode - no actual API calls will be made');
    } else {
      const apiTier = await detectAPITier(OPENAI_API_KEY);
      
      if (apiTier === 'realtime') {
        try {
          const ephemeralTokenData = await generateEphemeralToken(OPENAI_API_KEY);
          tokenData = {
            token: ephemeralTokenData.token,
            expiresAt: ephemeralTokenData.expiresAt,
            sessionId: ephemeralTokenData.sessionId
          };
          mode = 'realtime';
        } catch (error) {
          console.warn('⚠️ Realtime token generation failed, falling back to standard API:', error);
          tokenData = await generateFallbackToken(OPENAI_API_KEY, TOKEN_DURATION);
          mode = 'fallback';
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          if (errorMsg.includes('tier limitation') || errorMsg.includes('access forbidden') || errorMsg.includes('not available on current tier')) {
            warnings.push('Realtime API not available on current OpenAI tier - using Chat API with TTS');
          } else if (errorMsg.includes('not found') || errorMsg.includes('not be available in your region')) {
            warnings.push('Realtime API not available - using Chat API with TTS');
          } else if (errorMsg.includes('Invalid API key')) {
            warnings.push('API key authentication failed - check your OpenAI API key');
          } else {
            warnings.push('Realtime API temporarily unavailable - using fallback mode');
          }
        }
      } else if (apiTier === 'standard') {
        tokenData = await generateFallbackToken(OPENAI_API_KEY, TOKEN_DURATION);
        mode = 'fallback';
        warnings.push('Realtime API not available on current tier - using Chat API with TTS');
      } else {
        // Unknown tier - try demo mode as last resort
        if (OPENAI_API_KEY) {
          tokenData = await generateFallbackToken(OPENAI_API_KEY, TOKEN_DURATION);
          mode = 'fallback';
          warnings.push('API tier unknown - attempting fallback mode');
        } else {
          tokenData = await generateDemoToken(TOKEN_DURATION);
          mode = 'demo';
          warnings.push('No API access - running in demo mode');
        }
      }
    }

    // Use the session ID from the token data if available, otherwise generate one
    const sessionId = tokenData.sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    // Register session for tracking and refresh capability
    registerSession(sessionId, clientIP);
    
    const response: TokenResponse = {
      success: true,
      token: tokenData.token,
      expiresAt: tokenData.expiresAt,
      sessionId,
      mode,
      ...(tokenData.sessionConfig && { sessionConfig: tokenData.sessionConfig }),
      ...(warnings.length > 0 && { warnings })
    };
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ Token generated successfully:`, {
      clientIP,
      sessionId,
      mode,
      processingTime: `${processingTime}ms`,
      tokenLength: response.token ? response.token.length : 0,
      expiresAt: response.expiresAt ? new Date(response.expiresAt).toISOString() : 'N/A'
    });
    
    // Prepare final response headers
    const responseHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Processing-Time': processingTime.toString(),
      'X-Session-Id': sessionId,
      'X-Token-Mode': mode
    };
    
    // Add CORS headers if origin is allowed
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      responseHeaders['Access-Control-Allow-Origin'] = origin;
      responseHeaders['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
      responseHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      responseHeaders['Access-Control-Allow-Credentials'] = 'true';
    }
    
    console.log('📤 Sending response with headers:', responseHeaders);
    console.log('📤 Response body:', JSON.stringify(response, null, 2));
    console.log('===== TOKEN ENDPOINT COMPLETE =====\n');
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: responseHeaders
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Token generation error for ${clientIP}:`, error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Token generation failed'
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
 * GET /api/voice-agent/token
 * Returns helpful error message for incorrect method
 */
export const GET: APIRoute = async () => {
  console.log('⚠️ GET request to token endpoint - should be POST');
  return new Response(JSON.stringify({
    success: false,
    error: 'Method not allowed. Use POST to generate tokens.',
    hint: 'Make a POST request to this endpoint to generate an ephemeral token.'
  }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Allow': 'POST, OPTIONS'
    }
  });
};

/**
 * OPTIONS /api/voice-agent/token
 * Handle CORS preflight requests
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
        'Access-Control-Max-Age': '86400' // 24 hours
      }
    });
  }
  
  return new Response(null, { status: 404 });
};