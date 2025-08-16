export async function GET() {
  try {
    return new Response(JSON.stringify({
      message: "API is working!",
      time: new Date().toISOString(),
      env: {
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        nodeEnv: process.env.NODE_ENV || "not-set"
      }
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Test endpoint failed",
      message: error?.toString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}