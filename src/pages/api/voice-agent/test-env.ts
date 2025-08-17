import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  // Direct access test
  const apiKey = locals?.runtime?.env?.OPENAI_API_KEY;
  
  return new Response(JSON.stringify({
    success: !!apiKey,
    hasKey: !!apiKey,
    keyLength: apiKey ? apiKey.length : 0,
    keyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'NOT_FOUND'
  }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};