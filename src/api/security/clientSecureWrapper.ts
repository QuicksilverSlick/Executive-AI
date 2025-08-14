/**
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Client-side secure wrapper for API communications with zero key exposure
 * @version: 1.0.0
 * @init-author: engineer-agent
 * @init-cc-sessionId: cc-eng-20250806-secure-api
 * @init-timestamp: 2025-08-06T00:00:00Z
 * @reasoning:
 * - **Objective:** Provide client-side security layer for secure API communication
 * - **Strategy:** Implement secure request signing and proxy communication
 * - **Outcome:** Client-side SDK that never handles raw API keys and maintains security
 */

import crypto from 'crypto';

export interface SecureClientConfig {
  baseUrl: string;
  enableRequestSigning: boolean;
  enableRetry: boolean;
  maxRetries: number;
  retryDelayMs: number;
  requestTimeoutMs: number;
  enableDebugLogging: boolean;
}

export interface SecureTokenInfo {
  token: string;
  expiresAt: number;
  sessionId: string;
  mode: 'realtime' | 'proxy' | 'demo';
  proxyEndpoint?: string;
  capabilities?: string[];
  warnings?: string[];
}

export interface ProxyRequestOptions {
  endpoint: string;
  method?: 'GET' | 'POST';
  body?: any;
  headers?: Record<string, string>;
}

export interface SecureResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  requestId?: string;
  processingTime?: number;
}

/**
 * Secure Client Wrapper for API Communications
 * Handles all secure communication patterns without exposing API keys
 */
export class SecureAPIClient {
  private currentToken: SecureTokenInfo | null = null;
  private tokenRefreshPromise: Promise<SecureTokenInfo> | null = null;

  constructor(private config: SecureClientConfig) {}

  /**
   * Generate client-side request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate simple client signature (not cryptographically secure, just for basic verification)
   */
  private generateClientSignature(
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
    
    // Use a simple hash since we can't do proper HMAC without server key
    // The server will do proper signature verification
    return btoa(payload).replace(/[^a-zA-Z0-9]/g, '').substr(0, 32);
  }

  /**
   * Request a new secure token from the server
   */
  public async requestToken(): Promise<SecureTokenInfo> {
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.tokenRefreshPromise = this._requestTokenInternal();
    
    try {
      const token = await this.tokenRefreshPromise;
      this.currentToken = token;
      
      if (this.config.enableDebugLogging) {
        console.log('🔐 Secure token acquired:', {
          sessionId: token.sessionId,
          mode: token.mode,
          expiresAt: new Date(token.expiresAt).toISOString(),
          capabilities: token.capabilities
        });
      }
      
      return token;
    } finally {
      this.tokenRefreshPromise = null;
    }
  }

  /**
   * Internal token request implementation
   */
  private async _requestTokenInternal(): Promise<SecureTokenInfo> {
    const response = await fetch(`${this.config.baseUrl}/api/voice-agent/secure-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(this.config.requestTimeoutMs)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Token request failed: ${response.status}`);
    }

    const tokenResponse = await response.json();
    
    if (!tokenResponse.success || !tokenResponse.token) {
      throw new Error(tokenResponse.error || 'Token request failed');
    }

    return {
      token: tokenResponse.token,
      expiresAt: tokenResponse.expiresAt,
      sessionId: tokenResponse.sessionId,
      mode: tokenResponse.mode,
      proxyEndpoint: tokenResponse.proxyEndpoint,
      capabilities: tokenResponse.capabilities,
      warnings: tokenResponse.warnings
    };
  }

  /**
   * Check if current token is valid and not near expiration
   */
  public isTokenValid(): boolean {
    if (!this.currentToken) return false;
    
    const now = Date.now();
    const gracePeriod = 30 * 1000; // 30 seconds grace period
    
    return this.currentToken.expiresAt > (now + gracePeriod);
  }

  /**
   * Get current token info
   */
  public getCurrentToken(): SecureTokenInfo | null {
    return this.currentToken;
  }

  /**
   * Make a secure proxy request
   */
  public async makeProxyRequest<T = any>(options: ProxyRequestOptions): Promise<SecureResponse<T>> {
    // Ensure we have a valid token
    if (!this.isTokenValid()) {
      await this.requestToken();
    }

    if (!this.currentToken) {
      throw new Error('No valid token available');
    }

    // Only proxy mode supports server-side proxying
    if (this.currentToken.mode !== 'proxy') {
      throw new Error('Proxy requests are only supported in proxy mode');
    }

    const requestId = this.generateRequestId();
    const timestamp = Date.now();
    
    const proxyRequestBody = {
      sessionId: this.currentToken.sessionId,
      requestId,
      method: options.method || 'POST',
      endpoint: options.endpoint,
      body: options.body,
      headers: options.headers,
      timestamp,
      signature: this.generateClientSignature(
        this.currentToken.sessionId,
        requestId,
        options.method || 'POST',
        options.endpoint,
        options.body,
        timestamp
      )
    };

    const proxyEndpoint = this.currentToken.proxyEndpoint || '/api/voice-agent/proxy';
    
    try {
      const response = await this.makeRequestWithRetry(
        `${this.config.baseUrl}${proxyEndpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.currentToken.token}`,
            ...options.headers
          },
          body: JSON.stringify(proxyRequestBody)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `Request failed: ${response.status}`,
          requestId: errorData.requestId
        };
      }

      const responseData = await response.json();
      
      if (this.config.enableDebugLogging) {
        console.log(`🔗 Proxy request completed:`, {
          endpoint: options.endpoint,
          requestId: responseData.requestId,
          success: responseData.success,
          processingTime: responseData.processingTime
        });
      }

      return responseData;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (this.config.enableDebugLogging) {
        console.error('❌ Proxy request failed:', error);
      }

      return {
        success: false,
        error: errorMessage,
        requestId
      };
    }
  }

  /**
   * Make a direct realtime connection (for realtime mode)
   */
  public async connectRealtime(): Promise<{
    wsUrl: string;
    token: string;
    sessionId: string;
  }> {
    if (!this.isTokenValid()) {
      await this.requestToken();
    }

    if (!this.currentToken || this.currentToken.mode !== 'realtime') {
      throw new Error('Realtime connection is only available in realtime mode');
    }

    // For realtime mode, we use the token directly with OpenAI's WebSocket
    return {
      wsUrl: 'wss://api.openai.com/v1/realtime',
      token: this.currentToken.token,
      sessionId: this.currentToken.sessionId
    };
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequestWithRetry(url: string, options: RequestInit): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // If successful or client error (4xx), don't retry
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          return response;
        }
        
        throw new Error(`Server error: ${response.status}`);
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on abort (timeout) or client errors
        if (lastError.name === 'AbortError' || lastError.message.includes('4')) {
          break;
        }
        
        // Wait before retrying
        if (attempt < this.config.maxRetries) {
          const delay = this.config.retryDelayMs * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Clear current token
   */
  public clearToken(): void {
    this.currentToken = null;
    if (this.config.enableDebugLogging) {
      console.log('🧹 Token cleared');
    }
  }

  /**
   * Get client status
   */
  public getStatus(): {
    hasToken: boolean;
    tokenMode?: string;
    tokenValid: boolean;
    expiresAt?: number;
    sessionId?: string;
  } {
    return {
      hasToken: !!this.currentToken,
      tokenMode: this.currentToken?.mode,
      tokenValid: this.isTokenValid(),
      expiresAt: this.currentToken?.expiresAt,
      sessionId: this.currentToken?.sessionId
    };
  }
}

/**
 * Default configuration for secure client
 */
export const DEFAULT_SECURE_CLIENT_CONFIG: SecureClientConfig = {
  baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
  enableRequestSigning: true,
  enableRetry: true,
  maxRetries: 3,
  retryDelayMs: 1000,
  requestTimeoutMs: 30000,
  enableDebugLogging: false
};

/**
 * Create a secure API client instance
 */
export function createSecureAPIClient(config?: Partial<SecureClientConfig>): SecureAPIClient {
  const finalConfig = { ...DEFAULT_SECURE_CLIENT_CONFIG, ...config };
  return new SecureAPIClient(finalConfig);
}

/**
 * Singleton instance for convenient access
 */
let globalSecureClient: SecureAPIClient | null = null;

export function getSecureAPIClient(config?: Partial<SecureClientConfig>): SecureAPIClient {
  if (!globalSecureClient) {
    globalSecureClient = createSecureAPIClient(config);
  }
  return globalSecureClient;
}

/**
 * Utility functions for common API operations
 */
export class SecureAPIOperations {
  constructor(private client: SecureAPIClient) {}

  /**
   * Chat completion using secure proxy
   */
  async chatCompletion(messages: any[], options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}): Promise<SecureResponse<any>> {
    return this.client.makeProxyRequest({
      endpoint: '/v1/chat/completions',
      method: 'POST',
      body: {
        model: options.model || 'gpt-4o',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000
      }
    });
  }

  /**
   * Text-to-speech using secure proxy
   */
  async textToSpeech(text: string, options: {
    model?: string;
    voice?: string;
    format?: string;
  } = {}): Promise<SecureResponse<{ audio: string; contentType: string }>> {
    return this.client.makeProxyRequest({
      endpoint: '/v1/audio/speech',
      method: 'POST',
      body: {
        model: options.model || 'tts-1',
        input: text,
        voice: options.voice || 'alloy',
        response_format: options.format || 'mp3'
      }
    });
  }

  /**
   * Speech-to-text using secure proxy
   */
  async speechToText(audioData: FormData, options: {
    model?: string;
    language?: string;
  } = {}): Promise<SecureResponse<any>> {
    // Add model and language to FormData
    audioData.append('model', options.model || 'whisper-1');
    if (options.language) {
      audioData.append('language', options.language);
    }

    return this.client.makeProxyRequest({
      endpoint: '/v1/audio/transcriptions',
      method: 'POST',
      body: audioData,
      headers: {
        // Don't set Content-Type for FormData
      }
    });
  }
}

/**
 * Get secure operations helper
 */
export function getSecureOperations(client?: SecureAPIClient): SecureAPIOperations {
  const apiClient = client || getSecureAPIClient();
  return new SecureAPIOperations(apiClient);
}