import { g as getSessionStats } from '../../../chunks/refresh-token_B3YlMXTR.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:4321",
  "http://localhost:4322",
  "http://localhost:4323",
  "http://localhost:4324",
  "http://localhost:4325",
  "http://localhost:4326",
  "https://executiveaitraining.com"
];
if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY environment variable is required for health checks");
}
let globalMetrics = {
  totalRequests: 0,
  totalErrors: 0,
  responseTimes: [],
  startTime: Date.now(),
  lastError: null
};
let serviceStatusCache = null;
let lastServiceCheck = 0;
const SERVICE_CHECK_INTERVAL = 30 * 1e3;
async function testOpenAIConnection() {
  const startTime = Date.now();
  try {
    if (!OPENAI_API_KEY) {
      return {
        status: "down",
        latency: 0,
        lastCheck: Date.now(),
        message: "OpenAI API key not configured"
      };
    }
    const response = await Promise.race([
      fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }),
      new Promise(
        (_, reject) => setTimeout(() => reject(new Error("Request timeout")), 5e3)
      )
    ]);
    const latency = Date.now() - startTime;
    if (response.ok) {
      return {
        status: "operational",
        latency,
        lastCheck: Date.now()
      };
    } else {
      return {
        status: response.status >= 500 ? "down" : "degraded",
        latency,
        lastCheck: Date.now(),
        message: `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      status: "down",
      latency,
      lastCheck: Date.now(),
      message: error instanceof Error ? error.message : "Connection failed"
    };
  }
}
function checkRateLimitHealth() {
  try {
    return {
      status: "operational",
      lastCheck: Date.now(),
      message: "In-memory rate limiting operational"
    };
  } catch (error) {
    return {
      status: "down",
      lastCheck: Date.now(),
      message: error instanceof Error ? error.message : "Rate limiting failed"
    };
  }
}
function checkSessionTrackingHealth() {
  try {
    const stats = getSessionStats();
    return {
      status: "operational",
      lastCheck: Date.now(),
      message: `Tracking ${stats.activeSessions} active sessions`
    };
  } catch (error) {
    return {
      status: "down",
      lastCheck: Date.now(),
      message: error instanceof Error ? error.message : "Session tracking failed"
    };
  }
}
async function getServiceStatus() {
  const now = Date.now();
  if (serviceStatusCache && now - lastServiceCheck < SERVICE_CHECK_INTERVAL) {
    return serviceStatusCache;
  }
  const [openaiStatus, rateLimitStatus, sessionStatus] = await Promise.allSettled([
    testOpenAIConnection(),
    Promise.resolve(checkRateLimitHealth()),
    Promise.resolve(checkSessionTrackingHealth())
  ]);
  serviceStatusCache = {
    openaiApi: openaiStatus.status === "fulfilled" ? openaiStatus.value : {
      status: "down",
      lastCheck: now,
      message: "Health check failed"
    },
    rateLimit: rateLimitStatus.status === "fulfilled" ? rateLimitStatus.value : {
      status: "down",
      lastCheck: now,
      message: "Health check failed"
    },
    sessionTracking: sessionStatus.status === "fulfilled" ? sessionStatus.value : {
      status: "down",
      lastCheck: now,
      message: "Health check failed"
    }
  };
  lastServiceCheck = now;
  return serviceStatusCache;
}
function calculateOverallHealth(services) {
  const statuses = Object.values(services).map((service) => service.status);
  if (statuses.every((status) => status === "operational")) {
    return "healthy";
  } else if (statuses.some((status) => status === "down")) {
    return "unhealthy";
  } else {
    return "degraded";
  }
}
const GET = async ({ request, clientAddress }) => {
  const startTime = Date.now();
  const clientIP = clientAddress || request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const origin = request.headers.get("origin");
  globalMetrics.totalRequests++;
  try {
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid origin"
      }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const services = await getServiceStatus();
    const sessionStats = getSessionStats();
    const uptime = Date.now() - globalMetrics.startTime;
    const errorRate = globalMetrics.totalRequests > 0 ? globalMetrics.totalErrors / globalMetrics.totalRequests * 100 : 0;
    const averageResponseTime = globalMetrics.responseTimes.length > 0 ? globalMetrics.responseTimes.reduce((a, b) => a + b, 0) / globalMetrics.responseTimes.length : 0;
    const healthCheck = {
      status: calculateOverallHealth(services),
      timestamp: Date.now(),
      uptime,
      version: "1.0.0",
      environment: {
        openaiConfigured: !!OPENAI_API_KEY,
        allowedOrigins: ALLOWED_ORIGINS,
        nodeVersion: process.version
      },
      services,
      metrics: {
        totalRequests: globalMetrics.totalRequests,
        activeSessions: sessionStats.activeSessions,
        totalRefreshes: sessionStats.totalRefreshes,
        errorRate: Math.round(errorRate * 100) / 100,
        // Round to 2 decimal places
        averageResponseTime: Math.round(averageResponseTime * 100) / 100
      },
      ...globalMetrics.lastError && { lastError: globalMetrics.lastError }
    };
    const processingTime = Date.now() - startTime;
    globalMetrics.responseTimes.push(processingTime);
    if (globalMetrics.responseTimes.length > 100) {
      globalMetrics.responseTimes.shift();
    }
    console.log(`📊 Health check from ${clientIP} - Status: ${healthCheck.status} - Processing: ${processingTime}ms`);
    return new Response(JSON.stringify(healthCheck), {
      status: healthCheck.status === "healthy" ? 200 : healthCheck.status === "degraded" ? 200 : 503,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, max-age=30",
        // Cache for 30 seconds
        "X-Processing-Time": processingTime.toString(),
        ...origin && ALLOWED_ORIGINS.includes(origin) && {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      }
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    globalMetrics.totalErrors++;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
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
      status: "unhealthy",
      timestamp: Date.now(),
      error: "Health check failed",
      processingTime
    }), {
      status: 503,
      headers: {
        "Content-Type": "application/json",
        "X-Processing-Time": processingTime.toString()
      }
    });
  }
};
const OPTIONS = async ({ request }) => {
  const origin = request.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400"
        // 24 hours
      }
    });
  }
  return new Response(null, { status: 404 });
};
function recordError(error) {
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  OPTIONS,
  prerender,
  recordError
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
