/**
 * Environment Variable Debug Endpoint
 * Tests all possible ways to access environment variables in Cloudflare Pages
 */

import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const { request, locals } = context;
  
  // Test all possible environment variable access patterns
  const tests = {
    // Direct context access
    'context.env': (context as any)?.env,
    'context.env.OPENAI_API_KEY': (context as any)?.env?.OPENAI_API_KEY,
    
    // Locals patterns
    'locals': locals,
    'locals.runtime': (locals as any)?.runtime,
    'locals.runtime.env': (locals as any)?.runtime?.env,
    'locals.runtime.env.OPENAI_API_KEY': (locals as any)?.runtime?.env?.OPENAI_API_KEY,
    
    // Import meta
    'import.meta.env': import.meta.env,
    'import.meta.env.OPENAI_API_KEY': import.meta.env.OPENAI_API_KEY,
    
    // Process env (for comparison)
    'process.env exists': typeof process !== 'undefined',
    'process.env.OPENAI_API_KEY': typeof process !== 'undefined' ? process.env?.OPENAI_API_KEY : 'process not defined',
    
    // Check if we're in production
    'import.meta.env.PROD': import.meta.env.PROD,
    'import.meta.env.DEV': import.meta.env.DEV,
    'import.meta.env.MODE': import.meta.env.MODE,
    
    // Check context structure
    'context keys': Object.keys(context),
    'locals keys': locals ? Object.keys(locals) : 'locals undefined',
    
    // Check for Cloudflare-specific patterns
    'context.platform': (context as any)?.platform,
    'context.platform.env': (context as any)?.platform?.env,
    'context.platform.env.OPENAI_API_KEY': (context as any)?.platform?.env?.OPENAI_API_KEY,
    
    // Check request context
    'context.request': !!request,
    'context.clientAddress': context.clientAddress,
  };
  
  // Create a summary
  const hasApiKey = Object.entries(tests).some(([key, value]) => 
    key.includes('OPENAI_API_KEY') && value && value !== 'process not defined' && value !== undefined
  );
  
  const response = {
    timestamp: new Date().toISOString(),
    hasApiKey,
    tests,
    summary: hasApiKey 
      ? 'API key found! Check which access pattern worked above.' 
      : 'API key NOT found. Need to check Cloudflare Pages environment variable configuration.',
    debug: {
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
    }
  };
  
  return new Response(JSON.stringify(response, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
};