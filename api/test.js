export default function handler(req, res) {
  res.status(200).json({
    message: 'Basic Vercel API route works!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}