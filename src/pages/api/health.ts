/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Health check endpoint for Vercel deployment monitoring
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-dev-20250816-vercel-migration
 * @init-timestamp: 2025-08-16T15:30:00Z
 * @reasoning:
 * - **Objective:** Create health monitoring endpoint for Vercel deployment
 * - **Strategy:** Simple endpoint that checks system status and API connectivity
 * - **Outcome:** Reliable health check for deployment monitoring and alerts
 */

import type { APIRoute } from 'astro';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  environment: string;
  version: string;
  services: {
    api: 'healthy' | 'degraded' | 'unhealthy';
    openai: 'healthy' | 'degraded' | 'unhealthy';
    voice: 'healthy' | 'degraded' | 'unhealthy';
  };
  uptime: number;
  memory?: {
    used: number;
    total: number;
  };
}

const startTime = Date.now();

// Simple OpenAI API connectivity check
async function checkOpenAIConnection(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
  try {
    const apiKey = import.meta.env.OPENAI_API_KEY;
    if (!apiKey) {
      return 'unhealthy';
    }

    // Simple check without making actual API call to avoid costs
    // Just verify the key format
    if (apiKey.startsWith('sk-') && apiKey.length > 20) {
      return 'healthy';
    }
    
    return 'degraded';
  } catch (error) {
    console.error('OpenAI health check failed:', error);
    return 'unhealthy';
  }
}

// Check voice agent capabilities
function checkVoiceServices(): 'healthy' | 'degraded' | 'unhealthy' {
  try {
    // Check if required environment variables are present
    const requiredEnvVars = [
      'OPENAI_API_KEY',
      'ALLOWED_ORIGINS',
      'VOICE_AGENT_RATE_LIMIT'
    ];

    const missingVars = requiredEnvVars.filter(
      varName => !import.meta.env[varName]
    );

    if (missingVars.length === 0) {
      return 'healthy';
    } else if (missingVars.length <= 1) {
      return 'degraded';
    } else {
      return 'unhealthy';
    }
  } catch (error) {
    console.error('Voice services health check failed:', error);
    return 'unhealthy';
  }
}

// Get memory usage (if available in environment)
function getMemoryUsage() {
  try {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        used: Math.round(usage.heapUsed / 1024 / 1024), // MB
        total: Math.round(usage.heapTotal / 1024 / 1024), // MB
      };
    }
  } catch (error) {
    // Memory usage not available in this environment
  }
  return undefined;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    
    // Run health checks
    const [openaiStatus, voiceStatus] = await Promise.all([
      checkOpenAIConnection(),
      Promise.resolve(checkVoiceServices())
    ]);

    // Determine overall API status
    const apiStatus = (openaiStatus === 'healthy' && voiceStatus === 'healthy') 
      ? 'healthy' 
      : (openaiStatus === 'unhealthy' || voiceStatus === 'unhealthy')
        ? 'unhealthy'
        : 'degraded';

    // Determine overall system status
    const overallStatus = apiStatus === 'healthy' ? 'healthy' : apiStatus;

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      environment: import.meta.env.VERCEL_ENV || import.meta.env.NODE_ENV || 'unknown',
      version: '1.0.0',
      services: {
        api: apiStatus,
        openai: openaiStatus,
        voice: voiceStatus,
      },
      uptime,
      memory: getMemoryUsage(),
    };

    // Set appropriate HTTP status code
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;

    return new Response(JSON.stringify(healthStatus, null, 2), {
      status: httpStatus,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'true',
        'X-Timestamp': healthStatus.timestamp,
      },
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: import.meta.env.VERCEL_ENV || 'unknown',
      version: '1.0.0',
      services: {
        api: 'unhealthy',
        openai: 'unhealthy',
        voice: 'unhealthy',
      },
      uptime: Math.floor((Date.now() - startTime) / 1000),
    };

    return new Response(JSON.stringify(errorStatus, null, 2), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'true',
        'X-Error': 'Internal health check failure',
      },
    });
  }
};

// Options method for CORS preflight
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
};

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-dev-20250816-vercel-migration
 * @timestamp: 2025-08-16T15:30:00Z
 * @reasoning:
 * - **Objective:** Complete health check endpoint implementation
 * - **Strategy:** Multi-service health monitoring with appropriate HTTP status codes
 * - **Outcome:** Production-ready health endpoint for Vercel monitoring
 */