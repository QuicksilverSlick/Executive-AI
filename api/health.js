// Health check endpoint
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      nodeVersion: process.version,
      vercel: process.env.VERCEL || false
    }
  });
}