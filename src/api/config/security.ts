/**
 * Security Configuration for OpenAI Realtime API Authentication Service
 * 
 * Implements comprehensive security measures following OWASP guidelines
 * and OpenAI security best practices for ephemeral token handling
 */

export interface SecurityConfig {
  cors: {
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    maxAge: number;
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    maxRequestsPerSession: number;
    suspiciousActivityThreshold: number;
    blockDuration: number;
  };
  token: {
    defaultDuration: number;
    maxDuration: number;
    minRefreshInterval: number;
    maxRefreshAttempts: number;
  };
  headers: {
    security: Record<string, string>;
    cache: Record<string, string>;
  };
  monitoring: {
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    enableMetrics: boolean;
    enableAuditLog: boolean;
    retentionDays: number;
  };
  validation: {
    enableStrictValidation: boolean;
    requireUserAgent: boolean;
    enableGeoBlocking: boolean;
    blockedCountries: string[];
  };
}

/**
 * Production security configuration
 */
export const PRODUCTION_CONFIG: SecurityConfig = {
  cors: {
    allowedOrigins: [
      'https://executiveaitraining.com',
      'https://www.executiveaitraining.com'
    ],
    allowedMethods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // 24 hours
    credentials: false
  },
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // Conservative limit for production
    maxRequestsPerSession: 20, // Max refreshes per session
    suspiciousActivityThreshold: 3, // Flag after 3 near-limit attempts
    blockDuration: 15 * 60 * 1000 // 15 minutes
  },
  token: {
    defaultDuration: 60, // 60 seconds
    maxDuration: 120, // Max 2 minutes
    minRefreshInterval: 30 * 1000, // 30 seconds between refreshes
    maxRefreshAttempts: 10 // Max 10 refreshes per session
  },
  headers: {
    security: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'none'; connect-src 'self'"
    },
    cache: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  monitoring: {
    logLevel: 'warn',
    enableMetrics: true,
    enableAuditLog: true,
    retentionDays: 30
  },
  validation: {
    enableStrictValidation: true,
    requireUserAgent: true,
    enableGeoBlocking: false,
    blockedCountries: []
  }
};

/**
 * Development security configuration
 */
export const DEVELOPMENT_CONFIG: SecurityConfig = {
  cors: {
    allowedOrigins: [
      'http://localhost:4321',
      'http://localhost:4322',
      'http://localhost:3000',
      'http://127.0.0.1:4321',
      'https://executiveaitraining.com'
    ],
    allowedMethods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 300, // 5 minutes
    credentials: false
  },
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // Very lenient for development
    maxRequestsPerSession: 200,
    suspiciousActivityThreshold: 50, // Much higher threshold in development
    blockDuration: 1 * 60 * 1000 // 1 minute only
  },
  token: {
    defaultDuration: 60, // 60 seconds
    maxDuration: 300, // Max 5 minutes for development
    minRefreshInterval: 10 * 1000, // 10 seconds between refreshes
    maxRefreshAttempts: 50
  },
  headers: {
    security: {
      'X-Content-Type-Options': 'nosniff'
    },
    cache: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  },
  monitoring: {
    logLevel: 'debug',
    enableMetrics: true,
    enableAuditLog: false,
    retentionDays: 7
  },
  validation: {
    enableStrictValidation: false,
    requireUserAgent: false,
    enableGeoBlocking: false,
    blockedCountries: []
  }
};

/**
 * Get security configuration based on environment
 */
export function getSecurityConfig(): SecurityConfig {
  const isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';
  return isDevelopment ? DEVELOPMENT_CONFIG : PRODUCTION_CONFIG;
}

/**
 * Validate origin against allowed origins
 */
export function validateOrigin(origin: string | null, config: SecurityConfig): boolean {
  if (!origin) return false;
  return config.cors.allowedOrigins.includes(origin);
}

/**
 * Generate security headers for responses
 */
export function getSecurityHeaders(config: SecurityConfig, origin?: string): Record<string, string> {
  const headers: Record<string, string> = {
    ...config.headers.security,
    ...config.headers.cache
  };

  // Add CORS headers if origin is allowed
  if (origin && validateOrigin(origin, config)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = config.cors.allowedMethods.join(', ');
    headers['Access-Control-Allow-Headers'] = config.cors.allowedHeaders.join(', ');
    headers['Access-Control-Max-Age'] = config.cors.maxAge.toString();
    
    if (config.cors.credentials) {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
  }

  return headers;
}

/**
 * Validate request against security policies
 */
export interface SecurityValidationResult {
  valid: boolean;
  reason?: string;
  shouldBlock?: boolean;
  shouldLog?: boolean;
}

export function validateRequest(
  request: Request, 
  clientIP: string, 
  config: SecurityConfig
): SecurityValidationResult {
  const origin = request.headers.get('origin');
  const userAgent = request.headers.get('user-agent');
  const contentType = request.headers.get('content-type');

  // Origin validation
  if (origin && !validateOrigin(origin, config)) {
    return {
      valid: false,
      reason: 'Invalid origin',
      shouldBlock: true,
      shouldLog: true
    };
  }

  // User-Agent validation (if required)
  if (config.validation.requireUserAgent && !userAgent) {
    return {
      valid: false,
      reason: 'Missing User-Agent header',
      shouldBlock: config.validation.enableStrictValidation,
      shouldLog: true
    };
  }

  // Content-Type validation for POST requests
  if (request.method === 'POST') {
    if (!contentType || !contentType.includes('application/json')) {
      return {
        valid: false,
        reason: 'Invalid Content-Type',
        shouldBlock: config.validation.enableStrictValidation,
        shouldLog: true
      };
    }
  }

  // Suspicious User-Agent patterns
  if (userAgent) {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /wget/i,
      /curl/i
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
    if (isSuspicious && config.validation.enableStrictValidation) {
      return {
        valid: false,
        reason: 'Suspicious User-Agent',
        shouldBlock: false,
        shouldLog: true
      };
    }
  }

  return { valid: true };
}

/**
 * IP address utilities for geo-blocking and validation
 */
export class IPValidator {
  private static readonly PRIVATE_IP_RANGES = [
    /^10\./,
    /^192\.168\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^127\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/
  ];

  /**
   * Check if IP is private/local
   */
  static isPrivateIP(ip: string): boolean {
    return this.PRIVATE_IP_RANGES.some(range => range.test(ip));
  }

  /**
   * Basic IP validation
   */
  static isValidIP(ip: string): boolean {
    // IPv4 regex
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // IPv6 regex (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Extract real IP from various headers
   */
  static extractRealIP(request: Request): string {
    // Check various headers for real IP
    const headers = [
      'x-forwarded-for',
      'x-real-ip',
      'x-client-ip',
      'cf-connecting-ip', // Cloudflare
      'x-forwarded',
      'forwarded-for',
      'forwarded'
    ];

    for (const header of headers) {
      const value = request.headers.get(header);
      if (value) {
        // Take first IP if comma-separated
        const ip = value.split(',')[0].trim();
        if (this.isValidIP(ip) && !this.isPrivateIP(ip)) {
          return ip;
        }
      }
    }

    return 'unknown';
  }
}

/**
 * Audit logging for security events
 */
export interface SecurityAuditLog {
  timestamp: number;
  event: string;
  clientIP: string;
  userAgent?: string;
  origin?: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class SecurityAuditor {
  private static logs: SecurityAuditLog[] = [];
  private static readonly MAX_LOGS = 1000;

  /**
   * Log security event
   */
  static log(event: SecurityAuditLog): void {
    this.logs.push(event);
    
    // Keep only recent logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Console log for high/critical events
    if (event.severity === 'high' || event.severity === 'critical') {
      console.warn(`🚨 Security Event [${event.severity.toUpperCase()}]: ${event.event}`, event);
    }
  }

  /**
   * Get recent security logs
   */
  static getLogs(limit: number = 100): SecurityAuditLog[] {
    return this.logs.slice(-limit);
  }

  /**
   * Get logs by severity
   */
  static getLogsBySeverity(severity: SecurityAuditLog['severity']): SecurityAuditLog[] {
    return this.logs.filter(log => log.severity === severity);
  }

  /**
   * Clear old logs
   */
  static cleanup(retentionMs: number): void {
    const cutoff = Date.now() - retentionMs;
    this.logs = this.logs.filter(log => log.timestamp > cutoff);
  }
}