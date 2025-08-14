/**
 * Test endpoint to debug voice agent connection issues
 */

import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin');
  
  // Check environment variables
  const envCheck = {
    OPENAI_API_KEY: !!import.meta.env.OPENAI_API_KEY,
    VITE_OPENAI_API_KEY: !!import.meta.env.VITE_OPENAI_API_KEY,
    PUBLIC_OPENAI_API_KEY: !!import.meta.env.PUBLIC_OPENAI_API_KEY,
    NODE_ENV: import.meta.env.NODE_ENV || process.env.NODE_ENV,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  };

  // Test token generation
  let tokenTest = { success: false, error: null as any };
  try {
    const tokenResponse = await fetch(new URL('/api/voice-agent/token', request.url).href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(origin && { 'Origin': origin })
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
    tokenTest.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return new Response(JSON.stringify({
    timestamp: new Date().toISOString(),
    environment: envCheck,
    tokenEndpoint: tokenTest,
    cors: {
      origin: origin || 'none',
      allowedOrigins: import.meta.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4321']
    }
  }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...(origin && {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      })
    }
  });
};