export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async ({ request }) => {
  const origin = request.headers.get("origin");
  const envCheck = {
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    VITE_OPENAI_API_KEY: !!process.env.VITE_OPENAI_API_KEY,
    PUBLIC_OPENAI_API_KEY: !!process.env.PUBLIC_OPENAI_API_KEY,
    NODE_ENV: process.env.NODE_ENV || process.env.NODE_ENV,
    MODE: process.env.MODE,
    DEV: process.env.DEV,
    PROD: process.env.PROD
  };
  let tokenTest = { success: false, error: null };
  try {
    const tokenResponse = await fetch(new URL("/api/voice-agent/token", request.url).href, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...origin && { "Origin": origin }
      }
    });
    const tokenData = await tokenResponse.json();
    tokenTest = {
      success: tokenResponse.ok,
      status: tokenResponse.status,
      data: tokenResponse.ok ? {
        hasToken: !!tokenData.token,
        mode: tokenData.mode,
        expiresAt: tokenData.expiresAt,
        warnings: tokenData.warnings
      } : tokenData
    };
  } catch (error) {
    tokenTest.error = error instanceof Error ? error.message : "Unknown error";
  }
  return new Response(JSON.stringify({
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: envCheck,
    tokenEndpoint: tokenTest,
    cors: {
      origin: origin || "none",
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:4321"]
    }
  }, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...origin && {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
