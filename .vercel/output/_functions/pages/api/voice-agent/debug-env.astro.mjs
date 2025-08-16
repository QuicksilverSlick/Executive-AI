export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async () => {
  const envCheck = {
    // Check different ways environment variables might be loaded
    importMetaEnv: {
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      length: process.env.OPENAI_API_KEY?.length || 0,
      prefix: process.env.OPENAI_API_KEY?.substring(0, 10) || "not-set",
      mode: process.env.MODE,
      isDev: process.env.DEV
    },
    isDev: process.env.DEV,
    mode: process.env.MODE,
    // Combined check
    apiKeyAvailable: !!process.env.OPENAI_API_KEY
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
