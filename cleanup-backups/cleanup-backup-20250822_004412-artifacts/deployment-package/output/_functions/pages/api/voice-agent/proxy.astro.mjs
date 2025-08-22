import { g as getSecureProxy, v as validateRequest, a as getSecurityConfig, S as SecurityAuditor, b as getSecurityHeaders } from '../../../_astro/secureProxy.ByfO_XkS.js';
import { c as createProxyRateLimiter, a as createRateLimitMiddleware } from '../../../_astro/rateLimiter.yR3vRFgB.js';
import crypto from 'crypto';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const securityConfig = getSecurityConfig();
const secureProxy = getSecureProxy();
const proxyRateLimiter = createProxyRateLimiter({
  windowMs: 60 * 1e3,
  // 1 minute window
  maxRequests: securityConfig.rateLimit.maxRequests * 2,
  // Allow more requests for proxy mode
  onLimitReached: (clientIP, attempts) => {
    SecurityAuditor.log({
      timestamp: Date.now(),
      event: "PROXY_RATE_LIMIT_EXCEEDED",
      clientIP,
      details: { attempts, endpoint: "/api/voice-agent/proxy" },
      severity: "medium"
    });
  }
});
function validateProxyToken(token, sessionId) {
  if (!token.startsWith("proxy_")) {
    return false;
  }
  const tokenHash = token.substring(6);
  return tokenHash.length === 64 && /^[a-f0-9]+$/.test(tokenHash);
}
const POST = async ({ request, clientAddress }) => {
  const startTime = Date.now();
  const requestId = crypto.randomBytes(8).toString("hex");
  console.log(`🔗 [${requestId}] Proxy request started at ${(/* @__PURE__ */ new Date()).toISOString()}`);
  const clientIP = clientAddress || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const origin = request.headers.get("origin");
  const userAgent = request.headers.get("user-agent") || "unknown";
  try {
    const securityValidation = validateRequest(request, clientIP, securityConfig);
    if (!securityValidation.valid && securityValidation.shouldBlock) {
      console.error(`❌ [${requestId}] Security validation failed: ${securityValidation.reason}`);
      SecurityAuditor.log({
        timestamp: Date.now(),
        event: "PROXY_SECURITY_VALIDATION_FAILED",
        clientIP,
        userAgent,
        details: {
          reason: securityValidation.reason,
          requestId,
          origin
        },
        severity: "high"
      });
      return new Response(JSON.stringify({
        success: false,
        error: "Request blocked by security policy"
      }), {
        status: 403,
        headers: getSecurityHeaders(securityConfig, origin || void 0)
      });
    }
    const rateLimitMiddleware = createRateLimitMiddleware(proxyRateLimiter);
    const rateLimitResponse = rateLimitMiddleware(request, clientIP);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    let proxyRequest;
    try {
      const requestBody = await request.json();
      if (!requestBody.sessionId || !requestBody.requestId || !requestBody.endpoint) {
        return new Response(JSON.stringify({
          success: false,
          error: "Missing required fields: sessionId, requestId, endpoint"
        }), {
          status: 400,
          headers: getSecurityHeaders(securityConfig, origin || void 0)
        });
      }
      proxyRequest = {
        sessionId: requestBody.sessionId,
        requestId: requestBody.requestId,
        method: requestBody.method || "POST",
        endpoint: requestBody.endpoint,
        body: requestBody.body,
        headers: requestBody.headers,
        timestamp: requestBody.timestamp || Date.now(),
        signature: requestBody.signature || ""
      };
    } catch (error) {
      console.error(`❌ [${requestId}] Invalid request body:`, error);
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid request body"
      }), {
        status: 400,
        headers: getSecurityHeaders(securityConfig, origin || void 0)
      });
    }
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing or invalid authorization header"
      }), {
        status: 401,
        headers: getSecurityHeaders(securityConfig, origin || void 0)
      });
    }
    const proxyToken = authHeader.substring(7);
    if (!validateProxyToken(proxyToken, proxyRequest.sessionId)) {
      SecurityAuditor.log({
        timestamp: Date.now(),
        event: "INVALID_PROXY_TOKEN",
        clientIP,
        userAgent,
        details: {
          requestId,
          sessionId: proxyRequest.sessionId
        },
        severity: "high"
      });
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid proxy token"
      }), {
        status: 401,
        headers: getSecurityHeaders(securityConfig, origin || void 0)
      });
    }
    console.log(`✅ [${requestId}] Authorization validated, processing proxy request to ${proxyRequest.endpoint}`);
    const proxyResponse = await secureProxy.processRequest(proxyRequest, clientIP);
    let responseBody;
    let responseHeaders = {
      ...getSecurityHeaders(securityConfig, origin || void 0),
      "Content-Type": "application/json",
      "X-Processing-Time": proxyResponse.processingTime.toString(),
      "X-Request-Id": requestId,
      "X-Proxy-Mode": proxyResponse.mode
    };
    if (proxyResponse.success) {
      if (proxyResponse.data?.contentType === "audio/mpeg") {
        responseHeaders["Content-Type"] = "application/json";
        responseBody = {
          success: true,
          data: {
            audio: proxyResponse.data.audio,
            contentType: proxyResponse.data.contentType
          },
          requestId: proxyResponse.requestId,
          processingTime: proxyResponse.processingTime
        };
      } else {
        responseBody = {
          success: true,
          data: proxyResponse.data,
          requestId: proxyResponse.requestId,
          processingTime: proxyResponse.processingTime
        };
      }
      SecurityAuditor.log({
        timestamp: Date.now(),
        event: "SUCCESSFUL_PROXY_RESPONSE",
        clientIP,
        userAgent,
        details: {
          requestId,
          proxyRequestId: proxyRequest.requestId,
          sessionId: proxyRequest.sessionId,
          endpoint: proxyRequest.endpoint,
          processingTime: proxyResponse.processingTime
        },
        severity: "low"
      });
      console.log(`✅ [${requestId}] Proxy request successful:`, {
        endpoint: proxyRequest.endpoint,
        sessionId: proxyRequest.sessionId,
        processingTime: `${proxyResponse.processingTime}ms`
      });
    } else {
      responseBody = {
        success: false,
        error: proxyResponse.error,
        requestId: proxyResponse.requestId,
        processingTime: proxyResponse.processingTime
      };
      SecurityAuditor.log({
        timestamp: Date.now(),
        event: "FAILED_PROXY_RESPONSE",
        clientIP,
        userAgent,
        details: {
          requestId,
          proxyRequestId: proxyRequest.requestId,
          sessionId: proxyRequest.sessionId,
          endpoint: proxyRequest.endpoint,
          error: proxyResponse.error,
          processingTime: proxyResponse.processingTime
        },
        severity: "medium"
      });
      console.warn(`⚠️ [${requestId}] Proxy request failed:`, {
        endpoint: proxyRequest.endpoint,
        error: proxyResponse.error,
        processingTime: `${proxyResponse.processingTime}ms`
      });
    }
    const statusCode = proxyResponse.success ? 200 : 400;
    return new Response(JSON.stringify(responseBody), {
      status: statusCode,
      headers: responseHeaders
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ [${requestId}] Proxy error:`, error);
    SecurityAuditor.log({
      timestamp: Date.now(),
      event: "PROXY_ERROR",
      clientIP,
      userAgent,
      details: {
        requestId,
        error: errorMessage,
        processingTime
      },
      severity: "high"
    });
    return new Response(JSON.stringify({
      success: false,
      error: "Internal proxy error"
    }), {
      status: 500,
      headers: {
        ...getSecurityHeaders(securityConfig, origin || void 0),
        "Content-Type": "application/json",
        "X-Processing-Time": processingTime.toString(),
        "X-Request-Id": requestId
      }
    });
  }
};
const GET = async ({ request }) => {
  const origin = request.headers.get("origin");
  return new Response(JSON.stringify({
    name: "OpenAI Secure Proxy",
    version: "1.0.0",
    description: "Secure proxy endpoint for OpenAI API calls",
    supportedEndpoints: [
      "/v1/chat/completions",
      "/v1/audio/speech",
      "/v1/audio/transcriptions"
    ],
    authentication: "Bearer token required",
    documentation: "/docs/api/proxy"
  }), {
    status: 200,
    headers: {
      ...getSecurityHeaders(securityConfig, origin || void 0),
      "Content-Type": "application/json"
    }
  });
};
const OPTIONS = async ({ request }) => {
  const origin = request.headers.get("origin");
  return new Response(null, {
    status: 200,
    headers: getSecurityHeaders(securityConfig, origin || void 0)
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  OPTIONS,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
