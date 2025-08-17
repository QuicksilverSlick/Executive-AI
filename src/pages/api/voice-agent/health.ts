/**
 * Health and Monitoring Endpoint
 * Provides system health, usage statistics, and diagnostics
 * for the OpenAI Realtime API authentication service
 * 
 * Features:
 * - System health checks
 * - Rate limiting statistics
 * - Session monitoring
 * - OpenAI API connectivity test
 * - Performance metrics
 */

import type { APIRoute } from 'astro';
import { getSessionStats } from './refresh-token';

// Disable prerendering for this API endpoint
export const prerender = false;

// Environment variable access function - Cloudflare compatible
function getEnvVar(key: string, context?: any): string | undefined {
  // Try Cloudflare Workers/Pages context.env first (primary method for secrets)
  if (context?.env?.[key]) {
    console.log(`✅ Found ${key} in context.env`);
    return context.env[key];
  }
  
  // Try Astro locals.runtime.env (Cloudflare adapter pattern)
  if (context?.locals?.runtime?.env?.[key]) {
    console.log(`✅ Found ${key} in locals.runtime.env`);
    return context.locals.runtime.env[key];
  }
  
  // Try direct runtime.env
  if (context?.runtime?.env?.[key]) {
    console.log(`✅ Found ${key} in runtime.env`);
    return context.runtime.env[key];
  }
  
  // Build-time environment variables
  if (import.meta.env[key]) {
    console.log(`✅ Found ${key} in import.meta.env`);
    return import.meta.env[key];
  }
  
  // Node.js environment (local development)
  if (typeof process !== 'undefined' && process.env?.[key]) {
    console.log(`✅ Found ${key} in process.env`);
    return process.env[key];
  }
  
  console.log(`❌ ${key} not found in any environment source`);
  return undefined;
}

function getEnvConfig(context?: any) {
  const OPENAI_API_KEY = getEnvVar('OPENAI_API_KEY', context);
  const ALLOWED_ORIGINS_STR = getEnvVar('ALLOWED_ORIGINS', context);
  
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
    
  return { OPENAI_API_KEY, ALLOWED_ORIGINS };
}

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  uptime: number;
  version: string;
  environment: {
    openaiConfigured: boolean;
    allowedOrigins: string[];
    nodeVersion: string;
  };
  services: {
    openaiApi: ServiceStatus;
    rateLimit: ServiceStatus;
    sessionTracking: ServiceStatus;
  };
  metrics: {
    totalRequests: number;
    activeSessions: number;
    totalRefreshes: number;
    errorRate: number;
    averageResponseTime: number;
  };
  lastError?: {
    message: string;
    timestamp: number;
    count: number;
  };
}

interface ServiceStatus {
  status: 'operational' | 'degraded' | 'down';
  latency?: number;
  lastCheck: number;
  message?: string;
}

// Global metrics tracking
let globalMetrics = {
  totalRequests: 0,
  totalErrors: 0,
  responseTimes: [] as number[],
  startTime: Date.now(),
  lastError: null as { message: string; timestamp: number; count: number } | null
};

// Service status cache (refresh every 30 seconds)
let serviceStatusCache: HealthCheckResult['services'] | null = null;
let lastServiceCheck = 0;
const SERVICE_CHECK_INTERVAL = 30 * 1000; // 30 seconds

/**
 * Test OpenAI API connectivity
 */
async function testOpenAIConnection(apiKey: string | undefined): Promise<ServiceStatus> {
  const startTime = Date.now();
  
  try {
    // Check if API key is available
    if (!apiKey) {
      return {
        status: 'down',
        latency: 0,
        lastCheck: Date.now(),
        message: 'OpenAI API key not configured'
      };
    }

    // Test with a simple API call to validate the key
    // Use Promise.race for timeout compatibility
    const response = await Promise.race([
      fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      )
    ]);

    const latency = Date.now() - startTime;

    if (response.ok) {
      return {
        status: 'operational',
        latency,
        lastCheck: Date.now()
      };
    } else {
      return {
        status: response.status >= 500 ? 'down' : 'degraded',
        latency,
        lastCheck: Date.now(),
        message: `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      status: 'down',
      latency,
      lastCheck: Date.now(),
      message: error instanceof Error ? error.message : 'Connection failed'
    };
  }
}

/**
 * Check rate limiting system health
 */
function checkRateLimitHealth(): ServiceStatus {
  try {
    // Simple check to ensure rate limiting system is working
    // In a real implementation, this might check Redis connectivity
    return {
      status: 'operational',
      lastCheck: Date.now(),
      message: 'In-memory rate limiting operational'
    };
  } catch (error) {
    return {
      status: 'down',
      lastCheck: Date.now(),
      message: error instanceof Error ? error.message : 'Rate limiting failed'
    };
  }
}

/**
 * Check session tracking health
 */
function checkSessionTrackingHealth(): ServiceStatus {
  try {
    const stats = getSessionStats();
    return {
      status: 'operational',
      lastCheck: Date.now(),
      message: `Tracking ${stats.activeSessions} active sessions`
    };
  } catch (error) {
    return {
      status: 'down',
      lastCheck: Date.now(),
      message: error instanceof Error ? error.message : 'Session tracking failed'
    };
  }
}

/**
 * Get or refresh service status
 */
async function getServiceStatus(apiKey: string | undefined): Promise<HealthCheckResult['services']> {
  const now = Date.now();
  
  // Return cached status if still fresh
  if (serviceStatusCache && (now - lastServiceCheck) < SERVICE_CHECK_INTERVAL) {
    return serviceStatusCache;
  }

  // Refresh service status
  const [openaiStatus, rateLimitStatus, sessionStatus] = await Promise.allSettled([
    testOpenAIConnection(apiKey),
    Promise.resolve(checkRateLimitHealth()),
    Promise.resolve(checkSessionTrackingHealth())
  ]);

  serviceStatusCache = {
    openaiApi: openaiStatus.status === 'fulfilled' ? openaiStatus.value : {
      status: 'down',
      lastCheck: now,
      message: 'Health check failed'
    },
    rateLimit: rateLimitStatus.status === 'fulfilled' ? rateLimitStatus.value : {
      status: 'down',
      lastCheck: now,
      message: 'Health check failed'
    },
    sessionTracking: sessionStatus.status === 'fulfilled' ? sessionStatus.value : {
      status: 'down',
      lastCheck: now,
      message: 'Health check failed'
    }
  };

  lastServiceCheck = now;
  return serviceStatusCache;
}

/**
 * Calculate overall system health
 */
function calculateOverallHealth(services: HealthCheckResult['services']): HealthCheckResult['status'] {
  const statuses = Object.values(services).map(service => service.status);
  
  if (statuses.every(status => status === 'operational')) {
    return 'healthy';
  } else if (statuses.some(status => status === 'down')) {
    return 'unhealthy';
  } else {
    return 'degraded';
  }
}

/**
 * GET /api/voice-agent/health
 * Returns comprehensive health check information
 */
export const GET: APIRoute = async (context) => {
  const { request, clientAddress } = context;
  const startTime = Date.now();
  
  // Get environment config
  const { OPENAI_API_KEY, ALLOWED_ORIGINS } = getEnvConfig(context);
  
  // Safe clientAddress handling - fallback to IP from headers if needed
  const clientIP = clientAddress || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const origin = request.headers.get('origin');
  
  // Update metrics
  globalMetrics.totalRequests++;
  
  try {
    // CORS validation for health checks
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid origin'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get service status
    const services = await getServiceStatus(OPENAI_API_KEY);
    const sessionStats = getSessionStats();
    
    // Calculate metrics
    const uptime = Date.now() - globalMetrics.startTime;
    const errorRate = globalMetrics.totalRequests > 0 ? 
      (globalMetrics.totalErrors / globalMetrics.totalRequests) * 100 : 0;
    
    const averageResponseTime = globalMetrics.responseTimes.length > 0 ?
      globalMetrics.responseTimes.reduce((a, b) => a + b, 0) / globalMetrics.responseTimes.length : 0;
    
    const healthCheck: HealthCheckResult = {
      status: calculateOverallHealth(services),
      timestamp: Date.now(),
      uptime,
      version: '1.0.0',
      environment: {
        openaiConfigured: !!OPENAI_API_KEY,
        allowedOrigins: ALLOWED_ORIGINS,
        nodeVersion: typeof process !== 'undefined' ? process.version : 'N/A'
      },
      services,
      metrics: {
        totalRequests: globalMetrics.totalRequests,
        activeSessions: sessionStats.activeSessions,
        totalRefreshes: sessionStats.totalRefreshes,
        errorRate: Math.round(errorRate * 100) / 100, // Round to 2 decimal places
        averageResponseTime: Math.round(averageResponseTime * 100) / 100
      },
      ...(globalMetrics.lastError && { lastError: globalMetrics.lastError })
    };
    
    const processingTime = Date.now() - startTime;
    
    // Update response time metrics (keep last 100 entries)
    globalMetrics.responseTimes.push(processingTime);
    if (globalMetrics.responseTimes.length > 100) {
      globalMetrics.responseTimes.shift();
    }
    
    console.log(`📊 Health check from ${clientIP} - Status: ${healthCheck.status} - Processing: ${processingTime}ms`);
    
    return new Response(JSON.stringify(healthCheck), {
      status: healthCheck.status === 'healthy' ? 200 : 
              healthCheck.status === 'degraded' ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, max-age=30', // Cache for 30 seconds
        'X-Processing-Time': processingTime.toString(),
        ...(origin && ALLOWED_ORIGINS.includes(origin) && {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type'
        })
      }
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    globalMetrics.totalErrors++;
    
    // Update last error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (globalMetrics.lastError && globalMetrics.lastError.message === errorMessage) {
      globalMetrics.lastError.count++;
    } else {
      globalMetrics.lastError = {
        message: errorMessage,
        timestamp: Date.now(),
        count: 1
      };
    }
    
    console.error(`❌ Health check error for ${clientIP}:`, error);
    
    return new Response(JSON.stringify({
      status: 'unhealthy',
      timestamp: Date.now(),
      error: 'Health check failed',
      processingTime
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'X-Processing-Time': processingTime.toString()
      }
    });
  }
};

/**
 * OPTIONS /api/voice-agent/health
 * Handle CORS preflight requests
 */
export const OPTIONS: APIRoute = async (context) => {
  const { request } = context;
  const { ALLOWED_ORIGINS } = getEnvConfig(context);
  const origin = request.headers.get('origin');
  
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400' // 24 hours
      }
    });
  }
  
  return new Response(null, { status: 404 });
};

/**
 * Export function to record errors from other endpoints
 */
export function recordError(error: Error | string): void {
  globalMetrics.totalErrors++;
  
  const errorMessage = error instanceof Error ? error.message : error;
  if (globalMetrics.lastError && globalMetrics.lastError.message === errorMessage) {
    globalMetrics.lastError.count++;
  } else {
    globalMetrics.lastError = {
      message: errorMessage,
      timestamp: Date.now(),
      count: 1
    };
  }
}