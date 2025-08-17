/**
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Secure Token Generation Endpoint with Zero API Key Exposure
 * @version: 1.0.0
 * @init-author: engineer-agent
 * @init-cc-sessionId: cc-eng-20250806-secure-api
 * @init-timestamp: 2025-08-06T00:00:00Z
 * @reasoning:
 * - **Objective:** Replace existing token endpoint with secure zero-exposure architecture
 * - **Strategy:** Eliminate API key exposure in all modes using secure proxy tokens
 * - **Outcome:** Complete API key protection with maintaining all existing functionality
 */

import type { APIRoute } from 'astro';
import type { TokenResponse } from '../../../features/voice-agent/types';
import { createTokenRateLimiter, createRateLimitMiddleware } from '../../../api/middleware/rateLimiter';
import { getSecurityConfig, getSecurityHeaders, validateRequest } from '../../../api/config/security';
import { getKeyManager } from '../../../api/security/keyManager';
import { getSecureProxy } from '../../../api/security/secureProxy';
import { initializeSecureEnvironment } from '../../../api/security/envValidator';
import { SecurityAuditor } from '../../../api/config/security';
import crypto from 'crypto';

// Disable prerendering for this API endpoint
export const prerender = false;

// Initialize secure environment on module load
let environmentValidation: any;
try {
  environmentValidation = initializeSecureEnvironment();
} catch (error) {
  console.error('❌ Environment validation failed:', error);
  // In production, we might want to fail hard here
  environmentValidation = { isValid: false, errors: [(error as Error).message] };
}

// Security configuration
const securityConfig = getSecurityConfig();
const keyManager = getKeyManager(process.env.NODE_ENV as 'development' | 'production');
const secureProxy = getSecureProxy();

// Rate limiter with enhanced security
const tokenRateLimiter = createTokenRateLimiter({
  windowMs: securityConfig.rateLimit.windowMs,
  maxRequests: securityConfig.rateLimit.maxRequests,
  onLimitReached: (clientIP: string, attempts: number) => {
    SecurityAuditor.log({
      timestamp: Date.now(),
      event: 'RATE_LIMIT_EXCEEDED',
      clientIP,
      details: { attempts, endpoint: '/api/voice-agent/secure-token' },
      severity: 'medium'
    });
  }
});

/**
 * Detect API capabilities and determine optimal mode
 */
async function detectAPICapabilities(): Promise<{
  mode: 'realtime' | 'proxy' | 'demo';
  capabilities: string[];
  warnings: string[];
}> {
  const warnings: string[] = [];
  
  // Demo mode override
  if (process.env.VOICE_AGENT_DEMO_MODE === 'true') {
    return {
      mode: 'demo',
      capabilities: ['demo'],
      warnings: ['Running in demo mode - no actual API calls will be made']
    };
  }

  // Check if we have API key available
  const apiKey = keyManager.getKey('openai_primary', 'system', 'capability-check');
  if (!apiKey) {
    return {
      mode: 'demo',
      capabilities: ['demo'],
      warnings: ['No API key available - using demo mode']
    };
  }

  try {
    // Test Realtime API availability
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        modalities: ['audio', 'text'],
        instructions: 'Test connection',
      }),
    });

    if (response.ok) {
      return {
        mode: 'realtime',
        capabilities: ['realtime', 'voice', 'text'],
        warnings: []
      };
    } else if (response.status === 403 || response.status === 404) {
      // Realtime not available, fall back to proxy mode
      warnings.push('Realtime API not available - using secure proxy mode');
      return {
        mode: 'proxy',
        capabilities: ['chat', 'tts', 'stt'],
        warnings
      };
    } else {
      throw new Error(`API test failed: ${response.status}`);
    }
  } catch (error) {
    warnings.push('API connectivity issues - using secure proxy mode');
    return {
      mode: 'proxy',
      capabilities: ['chat', 'tts', 'stt'],
      warnings
    };
  }
}

/**
 * Generate secure ephemeral token for OpenAI Realtime API
 */
async function generateRealtimeToken(): Promise<{
  token: string;
  expiresAt: number;
  sessionId: string;
}> {
  const apiKey = keyManager.getKey('openai_primary', 'system', 'realtime-token');
  if (!apiKey) {
    throw new Error('API key not available');
  }

  const requestBody = {
    model: 'gpt-4o-realtime-preview-2024-12-17',
    modalities: ['audio', 'text'],
    instructions: 'You are a helpful AI assistant for executive training. Provide clear, professional responses with a warm and engaging tone. You have access to web search to provide current information.',
    voice: 'sage',
    input_audio_format: 'pcm16',
    output_audio_format: 'pcm16',
    input_audio_transcription: {
      model: 'whisper-1'
    },
    turn_detection: {
      type: 'server_vad',
      threshold: 0.5,
      prefix_padding_ms: 300,
      silence_duration_ms: 200
    },
    tools: [{
      type: 'function',
      function: {
        name: 'web_search',
        description: 'Search the web for current information',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'The search query' }
          },
          required: ['query']
        }
      }
    }]
  };
  
  const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Realtime token generation failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.client_secret?.value || !data.client_secret?.expires_at) {
    throw new Error('Invalid token response structure from OpenAI API');
  }
  
  return {
    token: data.client_secret.value,
    expiresAt: data.client_secret.expires_at * 1000,
    sessionId: data.id || `session_${Date.now()}`
  };
}

/**
 * Generate secure proxy token (replaces unsafe fallback mode)
 */
async function generateSecureProxyToken(sessionId: string): Promise<{
  token: string;
  expiresAt: number;
  sessionId: string;
  proxyEndpoint: string;
}> {
  const proxyToken = secureProxy.generateSecureProxyToken(sessionId);
  
  return {
    token: proxyToken.token,
    expiresAt: proxyToken.expiresAt,
    sessionId,
    proxyEndpoint: proxyToken.proxyEndpoint
  };
}

/**
 * Generate demo token for testing
 */
async function generateDemoToken(): Promise<{
  token: string;
  expiresAt: number;
  sessionId: string;
}> {
  return {
    token: `demo_${crypto.randomBytes(16).toString('hex')}`,
    expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes
    sessionId: `demo_session_${Date.now()}`
  };
}

/**
 * POST /api/voice-agent/secure-token
 * Secure token generation with zero API key exposure
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const startTime = Date.now();
  const requestId = crypto.randomBytes(8).toString('hex');
  
  console.log(`🔐 [${requestId}] Secure token request started at ${new Date().toISOString()}`);

  // Extract client information
  const clientIP = clientAddress || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const origin = request.headers.get('origin');
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    // Environment validation check
    if (!environmentValidation.isValid) {
      console.error(`❌ [${requestId}] Environment validation failed`);
      return new Response(JSON.stringify({
        success: false,
        error: 'Service configuration error'
      }), {
        status: 503,
        headers: getSecurityHeaders(securityConfig, origin || undefined)
      });
    }

    // Security validation
    const securityValidation = validateRequest(request, clientIP, securityConfig);
    if (!securityValidation.valid) {
      console.error(`❌ [${requestId}] Security validation failed: ${securityValidation.reason}`);
      
      SecurityAuditor.log({
        timestamp: Date.now(),
        event: 'SECURITY_VALIDATION_FAILED',
        clientIP,
        userAgent,
        details: { 
          reason: securityValidation.reason, 
          requestId,
          origin 
        },
        severity: securityValidation.shouldBlock ? 'high' : 'medium'
      });

      if (securityValidation.shouldBlock) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Request blocked by security policy'
        }), {
          status: 403,
          headers: getSecurityHeaders(securityConfig, origin || undefined)
        });
      }
    }

    // Rate limiting
    const rateLimitMiddleware = createRateLimitMiddleware(tokenRateLimiter);
    const rateLimitResponse = rateLimitMiddleware(request, clientIP);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    console.log(`✅ [${requestId}] Security checks passed, detecting API capabilities...`);

    // Detect API capabilities and determine mode
    const { mode, capabilities, warnings } = await detectAPICapabilities();
    
    console.log(`🎯 [${requestId}] Detected mode: ${mode}, capabilities: ${capabilities.join(', ')}`);

    // Generate appropriate token based on mode
    let tokenData: any;
    let responseWarnings = warnings;

    const sessionId = `session_${requestId}_${Date.now()}`;

    switch (mode) {
      case 'realtime':
        try {
          const realtimeToken = await generateRealtimeToken();
          tokenData = {
            token: realtimeToken.token,
            expiresAt: realtimeToken.expiresAt,
            sessionId: realtimeToken.sessionId,
            mode: 'realtime',
            capabilities
          };
        } catch (error) {
          console.warn(`⚠️ [${requestId}] Realtime token generation failed, falling back to proxy mode`);
          const proxyToken = await generateSecureProxyToken(sessionId);
          tokenData = {
            token: proxyToken.token,
            expiresAt: proxyToken.expiresAt,
            sessionId: proxyToken.sessionId,
            proxyEndpoint: proxyToken.proxyEndpoint,
            mode: 'proxy',
            capabilities: ['chat', 'tts', 'stt']
          };
          responseWarnings.push('Realtime API temporarily unavailable - using secure proxy mode');
        }
        break;

      case 'proxy':
        const proxyToken = await generateSecureProxyToken(sessionId);
        tokenData = {
          token: proxyToken.token,
          expiresAt: proxyToken.expiresAt,
          sessionId: proxyToken.sessionId,
          proxyEndpoint: proxyToken.proxyEndpoint,
          mode: 'proxy',
          capabilities
        };
        break;

      case 'demo':
        const demoToken = await generateDemoToken();
        tokenData = {
          token: demoToken.token,
          expiresAt: demoToken.expiresAt,
          sessionId: demoToken.sessionId,
          mode: 'demo',
          capabilities
        };
        break;

      default:
        throw new Error(`Unsupported mode: ${mode}`);
    }

    // Prepare response
    const response: TokenResponse = {
      success: true,
      token: tokenData.token,
      expiresAt: tokenData.expiresAt,
      sessionId: tokenData.sessionId,
      mode: tokenData.mode,
      ...(tokenData.proxyEndpoint && { proxyEndpoint: tokenData.proxyEndpoint }),
      ...(tokenData.capabilities && { capabilities: tokenData.capabilities }),
      ...(responseWarnings.length > 0 && { warnings: responseWarnings })
    };

    const processingTime = Date.now() - startTime;
    
    // Audit successful token generation
    SecurityAuditor.log({
      timestamp: Date.now(),
      event: 'SECURE_TOKEN_GENERATED',
      clientIP,
      userAgent,
      details: {
        requestId,
        sessionId: response.sessionId,
        mode: response.mode,
        processingTime,
        capabilities: tokenData.capabilities
      },
      severity: 'low'
    });

    console.log(`✅ [${requestId}] Secure token generated successfully:`, {
      sessionId: response.sessionId,
      mode: response.mode,
      processingTime: `${processingTime}ms`,
      expiresAt: new Date(response.expiresAt).toISOString()
    });

    const responseHeaders = {
      ...getSecurityHeaders(securityConfig, origin || undefined),
      'Content-Type': 'application/json',
      'X-Processing-Time': processingTime.toString(),
      'X-Session-Id': response.sessionId!,
      'X-Token-Mode': response.mode!,
      'X-Request-Id': requestId
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: responseHeaders
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error(`❌ [${requestId}] Token generation error:`, error);
    
    SecurityAuditor.log({
      timestamp: Date.now(),
      event: 'SECURE_TOKEN_ERROR',
      clientIP,
      userAgent,
      details: {
        requestId,
        error: errorMessage,
        processingTime
      },
      severity: 'high'
    });

    return new Response(JSON.stringify({
      success: false,
      error: 'Token generation failed'
    }), {
      status: 500,
      headers: {
        ...getSecurityHeaders(securityConfig, origin || undefined),
        'Content-Type': 'application/json',
        'X-Processing-Time': processingTime.toString(),
        'X-Request-Id': requestId
      }
    });
  }
};

/**
 * GET /api/voice-agent/secure-token
 * Returns helpful error message for incorrect method
 */
export const GET: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin');
  
  return new Response(JSON.stringify({
    success: false,
    error: 'Method not allowed. Use POST to generate secure tokens.',
    hint: 'This endpoint generates secure tokens that never expose API keys.',
    documentation: '/docs/api/secure-token'
  }), {
    status: 405,
    headers: {
      ...getSecurityHeaders(securityConfig, origin || undefined),
      'Content-Type': 'application/json',
      'Allow': 'POST, OPTIONS'
    }
  });
};

/**
 * OPTIONS /api/voice-agent/secure-token
 * Handle CORS preflight requests
 */
export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin');
  
  return new Response(null, {
    status: 200,
    headers: getSecurityHeaders(securityConfig, origin || undefined)
  });
};