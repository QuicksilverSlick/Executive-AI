import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    // Simple test endpoint to verify Vercel serverless functions work
    const response = {
      status: 'ok',
      message: 'Vercel serverless function is working!',
      timestamp: new Date().toISOString(),
      runtime: 'nodejs18.x',
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'production',
        VERCEL: process.env.VERCEL || 'false',
        VERCEL_ENV: process.env.VERCEL_ENV || 'unknown',
        VERCEL_REGION: process.env.VERCEL_REGION || 'unknown'
      }
    };

    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Vercel test endpoint error:', error);
    
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    return new Response(JSON.stringify({
      status: 'ok',
      message: 'POST request received',
      received: body,
      timestamp: new Date().toISOString()
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Failed to process POST request',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};