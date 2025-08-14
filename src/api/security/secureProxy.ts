/**
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Secure API proxy service to eliminate API key exposure in all modes
 * @version: 1.0.0
 * @init-author: engineer-agent
 * @init-cc-sessionId: cc-eng-20250806-secure-api
 * @init-timestamp: 2025-08-06T00:00:00Z
 * @reasoning:
 * - **Objective:** Create zero-trust proxy architecture preventing API key exposure
 * - **Strategy:** Server-side proxy with signed requests and encrypted communication
 * - **Outcome:** Complete API key protection with fallback modes that never expose secrets
 */

import crypto from 'crypto';
import { getKeyManager } from './keyManager';
import { SecurityAuditor } from '../config/security';

export interface ProxyRequest {
  sessionId: string;
  requestId: string;
  method: 'POST' | 'GET';
  endpoint: string;
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  signature: string;
}

export interface ProxyResponse {
  success: boolean;
  data?: any;
  error?: string;
  requestId: string;
  processingTime: number;
  mode: 'realtime' | 'fallback' | 'proxy';
}

export interface ProxyConfig {
  maxRequestSize: number;
  requestTimeoutMs: number;
  enableRequestSigning: boolean;
  enableResponseCaching: boolean;
  cacheExpirationMs: number;
  allowedEndpoints: string[];
}

/**
 * Secure API Proxy Service
 * Eliminates API key exposure by proxying all requests server-side
 */
export class SecureAPIProxy {
  private responseCache = new Map<string, { data: any; expires: number }>();
  private requestSigningKey: string;

  constructor(private config: ProxyConfig) {
    this.requestSigningKey = process.env.PROXY_SIGNING_KEY || crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate request signature for client
   */
  public generateRequestSignature(
    sessionId: string,
    requestId: string,
    method: string,
    endpoint: string,
    body: any,
    timestamp: number
  ): string {
    const payload = JSON.stringify({
      sessionId,
      requestId,
      method,
      endpoint,
      body: body ? JSON.stringify(body) : '',
      timestamp
    });
    
    return crypto.createHmac('sha256', this.requestSigningKey)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify request signature
   */
  private verifyRequestSignature(request: ProxyRequest): boolean {
    if (!this.config.enableRequestSigning) return true;

    const expectedSignature = this.generateRequestSignature(
      request.sessionId,
      request.requestId,
      request.method,
      request.endpoint,
      request.body,
      request.timestamp
    );

    const isValid = crypto.timingSafeEqual(
      Buffer.from(request.signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    if (!isValid) {
      SecurityAuditor.log({
        timestamp: Date.now(),
        event: 'INVALID_PROXY_SIGNATURE',
        clientIP: 'proxy',
        details: { sessionId: request.sessionId, requestId: request.requestId },
        severity: 'high'
      });
    }

    return isValid;
  }

  /**
   * Check if endpoint is allowed
   */
  private isEndpointAllowed(endpoint: string): boolean {
    return this.config.allowedEndpoints.some(allowed => 
      endpoint.startsWith(allowed) || 
      new RegExp(allowed).test(endpoint)
    );
  }

  /**
   * Get cached response if available and valid
   */
  private getCachedResponse(cacheKey: string): any | null {
    if (!this.config.enableResponseCaching) return null;

    const cached = this.responseCache.get(cacheKey);
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }

    // Clean up expired cache entry
    if (cached) {
      this.responseCache.delete(cacheKey);
    }

    return null;
  }

  /**
   * Cache response
   */
  private cacheResponse(cacheKey: string, data: any): void {
    if (!this.config.enableResponseCaching) return;

    this.responseCache.set(cacheKey, {
      data,
      expires: Date.now() + this.config.cacheExpirationMs
    });
  }

  /**
   * Proxy OpenAI Chat Completions request
   */
  private async proxyChatCompletions(body: any, sessionId: string): Promise<any> {
    const keyManager = getKeyManager();
    const apiKey = keyManager.getKey(
      'openai_primary', // Assuming we store the key with this ID
      'proxy-server',
      'chat-completion'
    );

    if (!apiKey) {
      throw new Error('API key not available');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ExecutiveAI-Proxy/1.0'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Proxy OpenAI Text-to-Speech request
   */
  private async proxyTextToSpeech(body: any, sessionId: string): Promise<ArrayBuffer> {
    const keyManager = getKeyManager();
    const apiKey = keyManager.getKey(
      'openai_primary',
      'proxy-server',
      'text-to-speech'
    );

    if (!apiKey) {
      throw new Error('API key not available');
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ExecutiveAI-Proxy/1.0'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI TTS API error: ${response.status} - ${errorText}`);
    }

    return await response.arrayBuffer();
  }

  /**
   * Proxy OpenAI Speech-to-Text request
   */
  private async proxySpeechToText(formData: FormData, sessionId: string): Promise<any> {
    const keyManager = getKeyManager();
    const apiKey = keyManager.getKey(
      'openai_primary',
      'proxy-server',
      'speech-to-text'
    );

    if (!apiKey) {
      throw new Error('API key not available');
    }

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'ExecutiveAI-Proxy/1.0'
        // Note: Don't set Content-Type for FormData, let fetch set it with boundary
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI STT API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Process proxy request
   */
  public async processRequest(request: ProxyRequest, clientIP: string): Promise<ProxyResponse> {
    const startTime = Date.now();

    try {
      // Validate request signature
      if (!this.verifyRequestSignature(request)) {
        return {
          success: false,
          error: 'Invalid request signature',
          requestId: request.requestId,
          processingTime: Date.now() - startTime,
          mode: 'proxy'
        };
      }

      // Check timestamp freshness (prevent replay attacks)
      const timeDiff = Date.now() - request.timestamp;
      if (timeDiff > 300000) { // 5 minutes
        return {
          success: false,
          error: 'Request timestamp too old',
          requestId: request.requestId,
          processingTime: Date.now() - startTime,
          mode: 'proxy'
        };
      }

      // Validate endpoint
      if (!this.isEndpointAllowed(request.endpoint)) {
        SecurityAuditor.log({
          timestamp: Date.now(),
          event: 'BLOCKED_PROXY_ENDPOINT',
          clientIP,
          details: { 
            endpoint: request.endpoint, 
            sessionId: request.sessionId,
            requestId: request.requestId
          },
          severity: 'medium'
        });

        return {
          success: false,
          error: 'Endpoint not allowed',
          requestId: request.requestId,
          processingTime: Date.now() - startTime,
          mode: 'proxy'
        };
      }

      // Check request size
      const requestSize = JSON.stringify(request.body || {}).length;
      if (requestSize > this.config.maxRequestSize) {
        return {
          success: false,
          error: 'Request too large',
          requestId: request.requestId,
          processingTime: Date.now() - startTime,
          mode: 'proxy'
        };
      }

      // Check cache
      const cacheKey = `${request.endpoint}:${crypto.createHash('sha256').update(JSON.stringify(request.body)).digest('hex')}`;
      const cachedResult = this.getCachedResponse(cacheKey);
      if (cachedResult) {
        return {
          success: true,
          data: cachedResult,
          requestId: request.requestId,
          processingTime: Date.now() - startTime,
          mode: 'proxy'
        };
      }

      // Route request to appropriate handler
      let result: any;

      if (request.endpoint === '/v1/chat/completions') {
        result = await this.proxyChatCompletions(request.body, request.sessionId);
      } else if (request.endpoint === '/v1/audio/speech') {
        const audioBuffer = await this.proxyTextToSpeech(request.body, request.sessionId);
        result = {
          audio: Buffer.from(audioBuffer).toString('base64'),
          contentType: 'audio/mpeg'
        };
      } else if (request.endpoint === '/v1/audio/transcriptions') {
        result = await this.proxySpeechToText(request.body, request.sessionId);
      } else {
        return {
          success: false,
          error: 'Unsupported endpoint',
          requestId: request.requestId,
          processingTime: Date.now() - startTime,
          mode: 'proxy'
        };
      }

      // Cache successful response
      this.cacheResponse(cacheKey, result);

      // Audit successful request
      SecurityAuditor.log({
        timestamp: Date.now(),
        event: 'SUCCESSFUL_PROXY_REQUEST',
        clientIP,
        details: {
          endpoint: request.endpoint,
          sessionId: request.sessionId,
          requestId: request.requestId,
          processingTime: Date.now() - startTime
        },
        severity: 'low'
      });

      return {
        success: true,
        data: result,
        requestId: request.requestId,
        processingTime: Date.now() - startTime,
        mode: 'proxy'
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      SecurityAuditor.log({
        timestamp: Date.now(),
        event: 'PROXY_REQUEST_ERROR',
        clientIP,
        details: {
          endpoint: request.endpoint,
          sessionId: request.sessionId,
          requestId: request.requestId,
          error: errorMessage
        },
        severity: 'medium'
      });

      return {
        success: false,
        error: errorMessage,
        requestId: request.requestId,
        processingTime: Date.now() - startTime,
        mode: 'proxy'
      };
    }
  }

  /**
   * Generate secure fallback token for proxy mode
   * Returns a proxy token that routes through our secure proxy
   */
  public generateSecureProxyToken(sessionId: string): {
    token: string;
    expiresAt: number;
    mode: 'proxy';
    proxyEndpoint: string;
  } {
    // Generate a secure proxy token that identifies the session
    const proxyToken = crypto.createHmac('sha256', this.requestSigningKey)
      .update(`${sessionId}:${Date.now()}:proxy`)
      .digest('hex');

    return {
      token: `proxy_${proxyToken}`,
      expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes
      mode: 'proxy',
      proxyEndpoint: '/api/voice-agent/proxy'
    };
  }

  /**
   * Cleanup expired cache entries
   */
  public cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.responseCache.entries()) {
      if (now >= cached.expires) {
        this.responseCache.delete(key);
      }
    }
  }

  /**
   * Get proxy statistics
   */
  public getStats(): {
    cacheSize: number;
    cacheHitRate: number;
    requestsProcessed: number;
  } {
    // This would be implemented with proper metrics collection
    return {
      cacheSize: this.responseCache.size,
      cacheHitRate: 0, // Would track hits/misses
      requestsProcessed: 0 // Would track total requests
    };
  }
}

/**
 * Default proxy configuration
 */
export const DEFAULT_PROXY_CONFIG: ProxyConfig = {
  maxRequestSize: 1024 * 1024, // 1MB
  requestTimeoutMs: 30000, // 30 seconds
  enableRequestSigning: true,
  enableResponseCaching: true,
  cacheExpirationMs: 5 * 60 * 1000, // 5 minutes
  allowedEndpoints: [
    '/v1/chat/completions',
    '/v1/audio/speech',
    '/v1/audio/transcriptions'
  ]
};

/**
 * Singleton proxy instance
 */
let proxyInstance: SecureAPIProxy | null = null;

export function getSecureProxy(config: ProxyConfig = DEFAULT_PROXY_CONFIG): SecureAPIProxy {
  if (!proxyInstance) {
    proxyInstance = new SecureAPIProxy(config);
  }
  return proxyInstance;
}

export function destroySecureProxy(): void {
  if (proxyInstance) {
    proxyInstance.cleanup();
    proxyInstance = null;
  }
}