/**
 * Development Only: Clear Rate Limits Endpoint
 * This endpoint allows clearing rate limits during development
 * 
 * IMPORTANT: This endpoint is only available in development mode
 */

import type { APIRoute } from 'astro';

// Only enable in development
const isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';

if (!isDevelopment) {
  console.warn('⚠️ Rate limit clearing endpoint is disabled in production');
}

// We'll need to access the rate limiter instance, so we'll import it
import { createTokenRateLimiter } from '../../../api/middleware/rateLimiter';

// Create a shared rate limiter instance for clearing (development only)
let devRateLimiter: any = null;
if (isDevelopment) {
  devRateLimiter = createTokenRateLimiter();
}

export const prerender = false;

/**
 * POST /api/dev/clear-rate-limits
 * Clear all rate limits (development only)
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Strict development mode check
  if (!isDevelopment) {
    return new Response(JSON.stringify({
      success: false,
      error: 'This endpoint is only available in development mode'
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const clientIP = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    const body = await request.json().catch(() => ({}));
    const { action = 'clear_all', target } = body;

    let result: any = { success: false };

    switch (action) {
      case 'clear_all':
        if (devRateLimiter && typeof devRateLimiter.clearAllLimits === 'function') {
          const success = devRateLimiter.clearAllLimits();
          result = {
            success,
            message: success ? 'All rate limits cleared' : 'Failed to clear rate limits',
            action: 'clear_all'
          };
        } else {
          result = {
            success: false,
            message: 'Rate limiter not available',
            action: 'clear_all'
          };
        }
        break;

      case 'clear_ip':
        if (!target) {
          result = {
            success: false,
            message: 'Target IP required for clear_ip action',
            action: 'clear_ip'
          };
        } else if (devRateLimiter && typeof devRateLimiter.resetLimit === 'function') {
          const success = devRateLimiter.resetLimit(target);
          result = {
            success,
            message: success ? `Rate limit cleared for ${target}` : `No rate limit found for ${target}`,
            action: 'clear_ip',
            target
          };
        } else {
          result = {
            success: false,
            message: 'Rate limiter not available',
            action: 'clear_ip'
          };
        }
        break;

      case 'clear_suspicious':
        if (!target) {
          result = {
            success: false,
            message: 'Target IP required for clear_suspicious action',
            action: 'clear_suspicious'
          };
        } else if (devRateLimiter && typeof devRateLimiter.clearSuspiciousIP === 'function') {
          const success = devRateLimiter.clearSuspiciousIP(target);
          result = {
            success,
            message: success ? `${target} removed from suspicious list` : `${target} was not in suspicious list`,
            action: 'clear_suspicious',
            target
          };
        } else {
          result = {
            success: false,
            message: 'Rate limiter not available',
            action: 'clear_suspicious'
          };
        }
        break;

      case 'status':
        if (devRateLimiter && typeof devRateLimiter.getStats === 'function') {
          const stats = devRateLimiter.getStats();
          result = {
            success: true,
            message: 'Rate limiter status retrieved',
            action: 'status',
            stats
          };
        } else {
          result = {
            success: false,
            message: 'Rate limiter not available',
            action: 'status'
          };
        }
        break;

      default:
        result = {
          success: false,
          message: `Unknown action: ${action}. Available actions: clear_all, clear_ip, clear_suspicious, status`,
          availableActions: ['clear_all', 'clear_ip', 'clear_suspicious', 'status']
        };
    }

    console.log(`🔧 Dev: Rate limit ${action} requested by ${clientIP}`, result);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error(`❌ Dev: Rate limit clear error for ${clientIP}:`, error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to process rate limit clear request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * GET /api/dev/clear-rate-limits
 * Get rate limiter status and usage instructions
 */
export const GET: APIRoute = async ({ clientAddress }) => {
  if (!isDevelopment) {
    return new Response(JSON.stringify({
      success: false,
      error: 'This endpoint is only available in development mode'
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const stats = devRateLimiter && typeof devRateLimiter.getStats === 'function' 
    ? devRateLimiter.getStats() 
    : { totalEntries: 0, suspiciousIPs: 0 };

  const usage = {
    endpoint: '/api/dev/clear-rate-limits',
    method: 'POST',
    availableActions: [
      {
        action: 'clear_all',
        description: 'Clear all rate limits and suspicious IPs',
        example: { action: 'clear_all' }
      },
      {
        action: 'clear_ip',
        description: 'Clear rate limit for specific IP',
        example: { action: 'clear_ip', target: '127.0.0.1' }
      },
      {
        action: 'clear_suspicious',
        description: 'Remove IP from suspicious list',
        example: { action: 'clear_suspicious', target: '127.0.0.1' }
      },
      {
        action: 'status',
        description: 'Get current rate limiter statistics',
        example: { action: 'status' }
      }
    ],
    currentStats: stats
  };

  return new Response(JSON.stringify({
    success: true,
    message: 'Development rate limit management endpoint',
    usage,
    note: 'This endpoint is only available in development mode'
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
};