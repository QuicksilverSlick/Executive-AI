// Diagnostic endpoint to debug Vercel deployment
export default function handler(req, res) {
  console.log('[DIAGNOSTIC] Request received:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query
  });

  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      status: 'running',
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'not-set',
        VERCEL: process.env.VERCEL || 'not-set',
        VERCEL_ENV: process.env.VERCEL_ENV || 'not-set',
        VERCEL_URL: process.env.VERCEL_URL || 'not-set',
        VERCEL_REGION: process.env.VERCEL_REGION || 'not-set',
        VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || 'not-set',
        VERCEL_GIT_COMMIT_MESSAGE: process.env.VERCEL_GIT_COMMIT_MESSAGE || 'not-set',
      },
      runtime: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
      apiKeys: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT_SET',
        hasEnvVars: Object.keys(process.env).length > 0,
        envVarCount: Object.keys(process.env).length,
      },
      request: {
        method: req.method,
        url: req.url,
        host: req.headers.host,
        userAgent: req.headers['user-agent'],
      },
      cwd: process.cwd(),
      __dirname: typeof __dirname !== 'undefined' ? __dirname : 'not-available',
      importMetaUrl: typeof import.meta !== 'undefined' ? import.meta.url : 'not-available',
    };

    console.log('[DIAGNOSTIC] Sending response:', diagnostics);

    res.status(200).json(diagnostics);
  } catch (error) {
    console.error('[DIAGNOSTIC] Error:', error);
    
    res.status(500).json({
      error: 'Diagnostic failed',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}