export { renderers } from '../../renderers.mjs';

const startTime = Date.now();
async function checkOpenAIConnection() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return "unhealthy";
    }
    if (apiKey.startsWith("sk-") && apiKey.length > 20) {
      return "healthy";
    }
    return "degraded";
  } catch (error) {
    console.error("OpenAI health check failed:", error);
    return "unhealthy";
  }
}
function checkVoiceServices() {
  try {
    const requiredEnvVars = [
      "OPENAI_API_KEY",
      "ALLOWED_ORIGINS",
      "VOICE_AGENT_RATE_LIMIT"
    ];
    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );
    if (missingVars.length === 0) {
      return "healthy";
    } else if (missingVars.length <= 1) {
      return "degraded";
    } else {
      return "unhealthy";
    }
  } catch (error) {
    console.error("Voice services health check failed:", error);
    return "unhealthy";
  }
}
function getMemoryUsage() {
  try {
    if (typeof process !== "undefined" && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        used: Math.round(usage.heapUsed / 1024 / 1024),
        // MB
        total: Math.round(usage.heapTotal / 1024 / 1024)
        // MB
      };
    }
  } catch (error) {
  }
  return void 0;
}
const GET = async ({ request }) => {
  try {
    const uptime = Math.floor((Date.now() - startTime) / 1e3);
    const [openaiStatus, voiceStatus] = await Promise.all([
      checkOpenAIConnection(),
      Promise.resolve(checkVoiceServices())
    ]);
    const apiStatus = openaiStatus === "healthy" && voiceStatus === "healthy" ? "healthy" : openaiStatus === "unhealthy" || voiceStatus === "unhealthy" ? "unhealthy" : "degraded";
    const overallStatus = apiStatus === "healthy" ? "healthy" : apiStatus;
    const healthStatus = {
      status: overallStatus,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
      version: "1.0.0",
      services: {
        api: apiStatus,
        openai: openaiStatus,
        voice: voiceStatus
      },
      uptime,
      memory: getMemoryUsage()
    };
    const httpStatus = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503;
    return new Response(JSON.stringify(healthStatus, null, 2), {
      status: httpStatus,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Health-Check": "true",
        "X-Timestamp": healthStatus.timestamp
      }
    });
  } catch (error) {
    console.error("Health check failed:", error);
    const errorStatus = {
      status: "unhealthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.VERCEL_ENV || "unknown",
      version: "1.0.0",
      services: {
        api: "unhealthy",
        openai: "unhealthy",
        voice: "unhealthy"
      },
      uptime: Math.floor((Date.now() - startTime) / 1e3)
    };
    return new Response(JSON.stringify(errorStatus, null, 2), {
      status: 503,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Health-Check": "true",
        "X-Error": "Internal health check failure"
      }
    });
  }
};
const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  OPTIONS
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
