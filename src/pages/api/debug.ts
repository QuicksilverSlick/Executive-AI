export async function GET(request: Request) {
  try {
    // Return debug information
    const debugInfo = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'not-set',
        VERCEL_ENV: process.env.VERCEL_ENV || 'not-set',
        VERCEL_REGION: process.env.VERCEL_REGION || 'not-set',
      },
      envVarsPresent: {
        OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
        ALLOWED_ORIGINS: !!process.env.ALLOWED_ORIGINS,
        VOICE_AGENT_RATE_LIMIT: !!process.env.VOICE_AGENT_RATE_LIMIT,
        PUBLIC_SITE_URL: !!process.env.PUBLIC_SITE_URL,
      },
      headers: {
        'user-agent': request?.headers?.get('user-agent') || 'unknown',
        'host': request?.headers?.get('host') || 'unknown',
      }
    };

    return new Response(JSON.stringify(debugInfo, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Debug endpoint error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}