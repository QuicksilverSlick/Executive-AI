import type { APIRoute } from 'astro';

// Disable prerendering for this API endpoint
export const prerender = false;

export const GET: APIRoute = async () => {
  const envCheck = {
    // Check different ways environment variables might be loaded
    importMetaEnv: {
      hasOpenAI: !!import.meta.env.OPENAI_API_KEY,
      length: import.meta.env.OPENAI_API_KEY?.length || 0,
      prefix: import.meta.env.OPENAI_API_KEY?.substring(0, 10) || 'not-set',
      mode: import.meta.env.MODE,
      isDev: import.meta.env.DEV
    },
    isDev: import.meta.env.DEV,
    mode: import.meta.env.MODE,
    // Combined check
    apiKeyAvailable: !!(import.meta.env.OPENAI_API_KEY)
  };

  return new Response(JSON.stringify(envCheck, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  });
};