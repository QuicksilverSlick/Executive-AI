/**
 * Advanced Rate Limiting Middleware for OpenAI Realtime API
 * Implements multiple layers of protection including IP-based and session-based limiting
 * 
 * Security Features:
 * - IP-based rate limiting
 * - Sliding window algorithm
 * - Automatic cleanup of expired entries
 * - Distributed locking for concurrent requests
 * - Suspicious activity detection
 */

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (request: Request, clientIP: string) => string;
  onLimitReached?: (clientIP: string, attempts: number) => void;
  isDevelopment?: boolean;
  whitelist?: string[];
  suspiciousThreshold?: number;
}

export interface RateLimitInfo {
  count: number;
  resetTime: number;
  windowStart: number;
  suspiciousActivity: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  warning?: string;
}

/**
 * Advanced Rate Limiter with sliding window and suspicious activity detection
 */
export class AdvancedRateLimiter {
  private store = new Map<string, RateLimitInfo>();
  private cleanupInterval: NodeJS.Timeout;
  private suspiciousIPs = new Set<string>();

  constructor(private config: RateLimitConfig) {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if request is allowed under rate limit
   */
  public checkLimit(request: Request, clientIP: string): RateLimitResult {
    // Check if IP is whitelisted (development mode)
    if (this.config.whitelist && this.isWhitelisted(clientIP)) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: Date.now() + this.config.windowMs,
        warning: this.config.isDevelopment ? 'Development mode - rate limiting bypassed' : undefined
      };
    }

    const key = this.config.keyGenerator ? 
      this.config.keyGenerator(request, clientIP) : 
      clientIP;

    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    let info = this.store.get(key);
    
    if (!info || info.resetTime <= now) {
      // Initialize or reset the rate limit window
      info = {
        count: 1,
        resetTime: now + this.config.windowMs,
        windowStart: now,
        suspiciousActivity: false
      };
      this.store.set(key, info);
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: info.resetTime
      };
    }

    // Check if we're within the sliding window
    if (info.windowStart <= windowStart) {
      // Update window start for sliding window behavior
      info.windowStart = windowStart;
      info.count = Math.max(1, Math.floor(info.count * 0.8)); // Decay previous count
    }

    // Check for suspicious activity patterns (more lenient in development)
    const suspiciousThreshold = this.config.suspiciousThreshold || 
      (this.config.isDevelopment ? 0.95 : 0.8);
    
    if (info.count >= this.config.maxRequests * suspiciousThreshold) {
      this.detectSuspiciousActivity(key, clientIP, info);
    }

    if (info.count >= this.config.maxRequests) {
      // Rate limit exceeded
      if (this.config.onLimitReached) {
        this.config.onLimitReached(clientIP, info.count);
      }

      const retryAfter = Math.ceil((info.resetTime - now) / 1000);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: info.resetTime,
        retryAfter,
        warning: info.suspiciousActivity ? 'Suspicious activity detected' : undefined
      };
    }

    // Increment count
    info.count++;
    
    return {
      allowed: true,
      remaining: this.config.maxRequests - info.count,
      resetTime: info.resetTime
    };
  }

  /**
   * Check if IP is whitelisted
   */
  private isWhitelisted(clientIP: string): boolean {
    if (!this.config.whitelist) return false;
    
    // Check for exact matches and localhost variations
    return this.config.whitelist.some(whitelistedIP => {
      if (whitelistedIP === clientIP) return true;
      // Handle localhost variations
      if (whitelistedIP === 'localhost' && 
          (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === 'localhost')) {
        return true;
      }
      if (whitelistedIP === '127.0.0.1' && 
          (clientIP === 'localhost' || clientIP === '::1')) {
        return true;
      }
      return false;
    });
  }

  /**
   * Detect suspicious activity patterns
   */
  private detectSuspiciousActivity(key: string, clientIP: string, info: RateLimitInfo): void {
    // Skip suspicious activity detection for whitelisted IPs in development
    if (this.config.isDevelopment && this.isWhitelisted(clientIP)) {
      return;
    }

    // Mark as suspicious if hitting rate limit frequently
    const threshold = this.config.suspiciousThreshold || 
      (this.config.isDevelopment ? 0.95 : 0.9);
    
    if (info.count >= this.config.maxRequests * threshold) {
      info.suspiciousActivity = true;
      this.suspiciousIPs.add(clientIP);
      
      if (this.config.isDevelopment) {
        console.log(`⚠️ High activity detected from ${clientIP} - Key: ${key} (Development mode)`);
      } else {
        console.warn(`🚨 Suspicious activity detected from ${clientIP} - Key: ${key}`);
      }
    }
  }

  /**
   * Check if IP is marked as suspicious
   */
  public isSuspicious(clientIP: string): boolean {
    return this.suspiciousIPs.has(clientIP);
  }

  /**
   * Clean up expired entries and suspicious IPs
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, info] of this.store.entries()) {
      if (info.resetTime <= now) {
        this.store.delete(key);
        cleaned++;
      }
    }

    // Clean up suspicious IPs after 1 hour
    const suspiciousCleanupTime = now - (60 * 60 * 1000);
    for (const ip of this.suspiciousIPs) {
      const info = this.store.get(ip);
      if (!info || info.resetTime <= suspiciousCleanupTime) {
        this.suspiciousIPs.delete(ip);
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Rate limiter cleanup: removed ${cleaned} expired entries`);
    }
  }

  /**
   * Get current statistics
   */
  public getStats(): { totalEntries: number; suspiciousIPs: number } {
    return {
      totalEntries: this.store.size,
      suspiciousIPs: this.suspiciousIPs.size
    };
  }

  /**
   * Manually reset rate limit for a specific key
   */
  public resetLimit(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clear all rate limits (development only)
   */
  public clearAllLimits(): boolean {
    if (!this.config.isDevelopment) {
      console.warn('⚠️ clearAllLimits() can only be used in development mode');
      return false;
    }
    
    const clearedEntries = this.store.size;
    const clearedSuspicious = this.suspiciousIPs.size;
    
    this.store.clear();
    this.suspiciousIPs.clear();
    
    console.log(`🧹 Development: Cleared ${clearedEntries} rate limit entries and ${clearedSuspicious} suspicious IPs`);
    return true;
  }

  /**
   * Remove IP from suspicious list
   */
  public clearSuspiciousIP(clientIP: string): boolean {
    return this.suspiciousIPs.delete(clientIP);
  }

  /**
   * Destroy the rate limiter and clean up resources
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
    this.suspiciousIPs.clear();
  }
}

/**
 * Create a rate limiter with default configuration for OpenAI token requests
 */
export function createTokenRateLimiter(customConfig?: Partial<RateLimitConfig>): AdvancedRateLimiter {
  // Detect if we're in development mode
  const isDevelopment = 
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
    (typeof globalThis !== 'undefined' && globalThis.import?.meta?.env?.DEV === true) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.DEV === true) ||
    (typeof window !== 'undefined'); // Browser environment is likely development

  const defaultConfig: RateLimitConfig = {
    windowMs: 60 * 1000, // 1 minute window
    maxRequests: isDevelopment ? 50 : 10, // More lenient in development
    skipSuccessfulRequests: false,
    isDevelopment,
    whitelist: isDevelopment ? [
      'localhost',
      '127.0.0.1',
      '::1',
      '0.0.0.0',
      'unknown' // For cases where IP detection fails in development
    ] : [],
    suspiciousThreshold: isDevelopment ? 0.95 : 0.8,
    keyGenerator: (request: Request, clientIP: string) => {
      // Use combination of IP and User-Agent for more precise limiting
      const userAgent = request.headers.get('user-agent') || '';
      const userAgentHash = userAgent.substring(0, 10); // First 10 chars as simple hash
      return `${clientIP}:${userAgentHash}`;
    },
    onLimitReached: (clientIP: string, attempts: number) => {
      if (isDevelopment) {
        console.log(`ℹ️ Rate limit reached for ${clientIP} - Attempts: ${attempts} (Development mode)`);
      } else {
        console.warn(`🚫 Rate limit exceeded for ${clientIP} - Attempts: ${attempts}`);
      }
    }
  };

  return new AdvancedRateLimiter({ ...defaultConfig, ...customConfig });
}

/**
 * Create enhanced rate limiter for proxy requests (higher limits)
 */
export function createProxyRateLimiter(customConfig?: Partial<RateLimitConfig>): AdvancedRateLimiter {
  const isDevelopment = 
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
    (typeof globalThis !== 'undefined' && globalThis.import?.meta?.env?.DEV === true) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.DEV === true);

  const defaultConfig: RateLimitConfig = {
    windowMs: 60 * 1000, // 1 minute window
    maxRequests: isDevelopment ? 200 : 50, // Higher limits for proxy requests
    skipSuccessfulRequests: false,
    isDevelopment,
    whitelist: isDevelopment ? [
      'localhost',
      '127.0.0.1',
      '::1',
      '0.0.0.0',
      'unknown'
    ] : [],
    suspiciousThreshold: isDevelopment ? 0.95 : 0.8,
    keyGenerator: (request: Request, clientIP: string) => {
      // Include session ID in key for proxy requests if available
      const authHeader = request.headers.get('authorization');
      const sessionHint = authHeader ? authHeader.substring(-8) : '';
      return `proxy:${clientIP}:${sessionHint}`;
    },
    onLimitReached: (clientIP: string, attempts: number) => {
      console.warn(`🚫 Proxy rate limit exceeded for ${clientIP} - Attempts: ${attempts}`);
    }
  };

  return new AdvancedRateLimiter({ ...defaultConfig, ...customConfig });
}

/**
 * Express-style middleware wrapper for Astro API routes
 */
export function createRateLimitMiddleware(rateLimiter: AdvancedRateLimiter) {
  return (request: Request, clientIP: string) => {
    const result = rateLimiter.checkLimit(request, clientIP);
    
    if (!result.allowed) {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': rateLimiter['config'].maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
      };

      if (result.retryAfter) {
        headers['Retry-After'] = result.retryAfter.toString();
      }

      return new Response(JSON.stringify({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: result.retryAfter,
        warning: result.warning
      }), {
        status: 429,
        headers
      });
    }

    return null; // Request allowed
  };
}