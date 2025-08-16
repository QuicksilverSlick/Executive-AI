export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async () => {
  const envCheck = {
    // Check different ways environment variables might be loaded
    importMetaEnv: {
      hasOpenAI: true,
      length: "sk-your-openai-api-key-here"?.length || 0,
      prefix: "sk-your-openai-api-key-here"?.substring(0, 10) || "not-set",
      mode: "production",
      isDev: false
    },
    isDev: false,
    mode: "production",
    // Combined check
    apiKeyAvailable: true
  };
  return new Response(JSON.stringify(envCheck, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
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
