/**
 * Token Manager for Voice Agent API
 * Handles token lifecycle with automatic refresh and mode management
 * 
 * Features:
 * - Support for Realtime, Fallback, and Demo modes
 * - API tier detection and compatibility checking
 * - Automatic token refresh before expiration
 * - Retry logic with exponential backoff
 * - Event-driven architecture for token updates
 * - Secure token storage (memory only)
 * - Error handling and fallback strategies
 */

import type { TokenResponse, EphemeralToken } from '../types';

export interface TokenManagerConfig {
  baseUrl: string;
  refreshThresholdSeconds: number;
  maxRetryAttempts: number;
  retryDelayMs: number;
  maxRetryDelayMs: number;
  enableAutoRefresh: boolean;
  compatibilityCheckEnabled: boolean;
  preferredMode?: 'realtime' | 'fallback' | 'demo' | 'auto';
}

export interface TokenManagerEvents {
  tokenRefreshed: (token: EphemeralToken & { mode?: string; warnings?: string[] }) => void;
  tokenExpired: () => void;
  tokenError: (error: Error) => void;
  refreshStarted: () => void;
  refreshCompleted: () => void;
  modeChanged: (mode: 'realtime' | 'fallback' | 'demo') => void;
  compatibilityChecked: (result: any) => void;
}

export type TokenManagerEventType = keyof TokenManagerEvents;

/**
 * Advanced Token Manager with automatic refresh and error handling
 */
export class TokenManager {
  private currentToken: EphemeralToken | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private eventListeners: Map<TokenManagerEventType, Function[]> = new Map();
  private isRefreshing = false;
  private retryCount = 0;
  private currentMode: 'realtime' | 'fallback' | 'demo' = 'realtime';
  private compatibilityCache: any = null;
  private lastCompatibilityCheck = 0;

  constructor(private config: TokenManagerConfig) {
    this.initializeEventListeners();
  }

  /**
   * Initialize event listener storage
   */
  private initializeEventListeners(): void {
    const eventTypes: TokenManagerEventType[] = [
      'tokenRefreshed',
      'tokenExpired',
      'tokenError',
      'refreshStarted',
      'refreshCompleted',
      'modeChanged',
      'compatibilityChecked'
    ];

    eventTypes.forEach(eventType => {
      this.eventListeners.set(eventType, []);
    });
  }

  /**
   * Add event listener
   */
  public on<T extends TokenManagerEventType>(
    event: T,
    listener: TokenManagerEvents[T]
  ): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(listener);
    this.eventListeners.set(event, listeners);
  }

  /**
   * Remove event listener
   */
  public off<T extends TokenManagerEventType>(
    event: T,
    listener: TokenManagerEvents[T]
  ): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Emit event to all listeners
   */
  private emit<T extends TokenManagerEventType>(
    event: T,
    ...args: Parameters<TokenManagerEvents[T]>
  ): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        (listener as any)(...args);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  /**
   * Check API compatibility and determine best mode
   */
  public async checkCompatibility(): Promise<any> {
    const now = Date.now();
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes

    // Use cached result if available and fresh
    if (this.compatibilityCache && (now - this.lastCompatibilityCheck) < cacheExpiry) {
      return this.compatibilityCache;
    }

    console.log('🔍 Checking API compatibility...');

    try {
      const response = await fetch(`${this.config.baseUrl}/api/voice-agent/compatibility`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Compatibility check failed: ${response.status}`);
      }

      const compatibilityResult = await response.json();
      
      // Cache the result
      this.compatibilityCache = compatibilityResult;
      this.lastCompatibilityCheck = now;

      // Determine optimal mode based on compatibility
      let optimalMode: 'realtime' | 'fallback' | 'demo' = 'demo';
      
      if (compatibilityResult.features?.realtimeVoice && compatibilityResult.tier === 'realtime') {
        optimalMode = 'realtime';
      } else if (compatibilityResult.features?.chatCompletion && compatibilityResult.features?.textToSpeech) {
        optimalMode = 'fallback';
      }

      // Apply mode preference if specified
      if (this.config.preferredMode && this.config.preferredMode !== 'auto') {
        optimalMode = this.config.preferredMode;
      }

      // Update current mode if it changed
      if (this.currentMode !== optimalMode) {
        const previousMode = this.currentMode;
        this.currentMode = optimalMode;
        this.emit('modeChanged', optimalMode);
        console.log(`🔄 Mode changed: ${previousMode} → ${optimalMode}`);
      }

      this.emit('compatibilityChecked', compatibilityResult);
      console.log(`✅ Compatibility check complete - Mode: ${optimalMode}, Tier: ${compatibilityResult.tier}`);

      return compatibilityResult;
    } catch (error) {
      console.error('❌ Compatibility check failed:', error);
      
      // Fallback to demo mode on error
      if (this.currentMode !== 'demo') {
        this.currentMode = 'demo';
        this.emit('modeChanged', 'demo');
      }

      const fallbackResult = {
        success: false,
        tier: 'unknown',
        features: {
          realtimeVoice: false,
          chatCompletion: false,
          textToSpeech: false,
          speechToText: false,
          functionCalling: false
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.compatibilityCache = fallbackResult;
      this.lastCompatibilityCheck = now;
      this.emit('compatibilityChecked', fallbackResult);

      return fallbackResult;
    }
  }

  /**
   * Get current operating mode
   */
  public getCurrentMode(): 'realtime' | 'fallback' | 'demo' {
    return this.currentMode;
  }

  /**
   * Manually set operating mode
   */
  public setMode(mode: 'realtime' | 'fallback' | 'demo'): void {
    if (this.currentMode !== mode) {
      const previousMode = this.currentMode;
      this.currentMode = mode;
      this.emit('modeChanged', mode);
      console.log(`🔄 Mode manually changed: ${previousMode} → ${mode}`);
    }
  }

  /**
   * Request initial token from server with compatibility checking
   */
  public async requestToken(): Promise<EphemeralToken> {
    console.log('🎫 Requesting initial token...');
    
    // Check compatibility first if enabled
    if (this.config.compatibilityCheckEnabled) {
      await this.checkCompatibility();
    }
    
    try {
      const response = await fetch(`${this.config.baseUrl}/api/voice-agent/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-realtime-preview-2024-10-01'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const tokenResponse: TokenResponse = await response.json();
      
      if (!tokenResponse.success || !tokenResponse.token) {
        throw new Error(tokenResponse.error || 'Token request failed');
      }

      // Update mode based on response
      if (tokenResponse.mode && tokenResponse.mode !== this.currentMode) {
        const previousMode = this.currentMode;
        this.currentMode = tokenResponse.mode;
        this.emit('modeChanged', tokenResponse.mode);
        console.log(`🔄 Mode updated from server: ${previousMode} → ${tokenResponse.mode}`);
      }

      // Log any warnings
      if (tokenResponse.warnings && tokenResponse.warnings.length > 0) {
        tokenResponse.warnings.forEach(warning => {
          console.warn(`⚠️ ${warning}`);
        });
      }

      const token: EphemeralToken & { mode?: string; warnings?: string[] } = {
        token: tokenResponse.token,
        expiresAt: tokenResponse.expiresAt!,
        sessionId: tokenResponse.sessionId!,
        mode: tokenResponse.mode,
        warnings: tokenResponse.warnings
      };

      this.setToken(token);
      this.retryCount = 0; // Reset retry count on success
      
      console.log(`✅ Token acquired - Mode: ${tokenResponse.mode || 'realtime'}, Session: ${token.sessionId}, Expires: ${new Date(token.expiresAt).toISOString()}`);
      
      return token;
    } catch (error) {
      const tokenError = error instanceof Error ? error : new Error('Token request failed');
      console.error('❌ Token request failed:', tokenError);
      this.emit('tokenError', tokenError);
      throw tokenError;
    }
  }

  /**
   * Refresh current token
   */
  public async refreshToken(): Promise<EphemeralToken> {
    if (!this.currentToken) {
      throw new Error('No current token to refresh');
    }

    if (this.isRefreshing) {
      throw new Error('Token refresh already in progress');
    }

    this.isRefreshing = true;
    this.emit('refreshStarted');

    console.log(`🔄 Refreshing token for session: ${this.currentToken.sessionId}`);

    try {
      const response = await fetch(`${this.config.baseUrl}/api/voice-agent/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.currentToken.sessionId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const tokenResponse: TokenResponse = await response.json();
      
      if (!tokenResponse.success || !tokenResponse.token) {
        throw new Error(tokenResponse.error || 'Token refresh failed');
      }

      const newToken: EphemeralToken = {
        token: tokenResponse.token,
        expiresAt: tokenResponse.expiresAt!,
        sessionId: tokenResponse.sessionId!
      };

      this.setToken(newToken);
      this.retryCount = 0; // Reset retry count on success
      this.emit('refreshCompleted');
      
      console.log(`✅ Token refreshed - Session: ${newToken.sessionId}, Expires: ${new Date(newToken.expiresAt).toISOString()}`);
      
      return newToken;
    } catch (error) {
      const tokenError = error instanceof Error ? error : new Error('Token refresh failed');
      console.error('❌ Token refresh failed:', tokenError);
      this.emit('tokenError', tokenError);
      
      // Try to get a new token if refresh fails
      if (this.retryCount < this.config.maxRetryAttempts) {
        console.log(`🔄 Attempting to get new token (attempt ${this.retryCount + 1}/${this.config.maxRetryAttempts})`);
        await this.retryWithBackoff();
        return this.requestToken();
      }
      
      throw tokenError;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Set current token and schedule refresh
   */
  private setToken(token: EphemeralToken): void {
    this.currentToken = token;
    this.emit('tokenRefreshed', token);
    
    if (this.config.enableAutoRefresh) {
      this.scheduleRefresh();
    }
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.currentToken) {
      return;
    }

    const now = Date.now();
    const expiresAt = this.currentToken.expiresAt;
    const refreshThreshold = this.config.refreshThresholdSeconds * 1000;
    const refreshTime = expiresAt - refreshThreshold;
    const delay = Math.max(0, refreshTime - now);

    console.log(`⏰ Scheduling token refresh in ${Math.round(delay / 1000)}s`);

    this.refreshTimer = setTimeout(async () => {
      try {
        await this.refreshToken();
      } catch (error) {
        console.error('❌ Scheduled refresh failed:', error);
        this.emit('tokenExpired');
      }
    }, delay);
  }

  /**
   * Retry with exponential backoff
   */
  private async retryWithBackoff(): Promise<void> {
    this.retryCount++;
    const delay = Math.min(
      this.config.retryDelayMs * Math.pow(2, this.retryCount - 1),
      this.config.maxRetryDelayMs
    );

    console.log(`⏳ Retrying in ${delay}ms (attempt ${this.retryCount}/${this.config.maxRetryAttempts})`);
    
    return new Promise(resolve => {
      setTimeout(resolve, delay);
    });
  }

  /**
   * Get current token
   */
  public getCurrentToken(): EphemeralToken | null {
    return this.currentToken;
  }

  /**
   * Check if current token is valid
   */
  public isTokenValid(): boolean {
    if (!this.currentToken) {
      return false;
    }

    const now = Date.now();
    const gracePeriod = 5 * 1000; // 5 second grace period
    return this.currentToken.expiresAt > (now + gracePeriod);
  }

  /**
   * Get time until token expires (in milliseconds)
   */
  public getTimeUntilExpiration(): number {
    if (!this.currentToken) {
      return 0;
    }

    return Math.max(0, this.currentToken.expiresAt - Date.now());
  }

  /**
   * Force refresh current token
   */
  public async forceRefresh(): Promise<EphemeralToken> {
    console.log('🔄 Force refreshing token...');
    return this.refreshToken();
  }

  /**
   * Clear current token and cancel refresh
   */
  public clearToken(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    this.currentToken = null;
    this.isRefreshing = false;
    this.retryCount = 0;
    
    console.log('🧹 Token cleared');
  }

  /**
   * Destroy token manager and clean up resources
   */
  public destroy(): void {
    this.clearToken();
    this.eventListeners.clear();
    console.log('🗑️ Token manager destroyed');
  }

  /**
   * Get manager status for debugging
   */
  public getStatus(): {
    hasToken: boolean;
    isValid: boolean;
    expiresAt?: number;
    timeUntilExpiration: number;
    sessionId?: string;
    isRefreshing: boolean;
    retryCount: number;
  } {
    return {
      hasToken: !!this.currentToken,
      isValid: this.isTokenValid(),
      expiresAt: this.currentToken?.expiresAt,
      timeUntilExpiration: this.getTimeUntilExpiration(),
      sessionId: this.currentToken?.sessionId,
      isRefreshing: this.isRefreshing,
      retryCount: this.retryCount
    };
  }
}

/**
 * Create token manager with default configuration
 */
export function createTokenManager(customConfig?: Partial<TokenManagerConfig>): TokenManager {
  const defaultConfig: TokenManagerConfig = {
    baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
    refreshThresholdSeconds: 30, // Refresh 30 seconds before expiration
    maxRetryAttempts: 3,
    retryDelayMs: 1000, // Start with 1 second
    maxRetryDelayMs: 10000, // Max 10 seconds
    enableAutoRefresh: true,
    compatibilityCheckEnabled: true,
    preferredMode: 'auto'
  };

  return new TokenManager({ ...defaultConfig, ...customConfig });
}

/**
 * Singleton token manager instance
 */
let globalTokenManager: TokenManager | null = null;

/**
 * Get or create global token manager instance
 */
export function getTokenManager(config?: Partial<TokenManagerConfig>): TokenManager {
  if (!globalTokenManager) {
    globalTokenManager = createTokenManager(config);
  }
  return globalTokenManager;
}

/**
 * Destroy global token manager instance
 */
export function destroyTokenManager(): void {
  if (globalTokenManager) {
    globalTokenManager.destroy();
    globalTokenManager = null;
  }
}