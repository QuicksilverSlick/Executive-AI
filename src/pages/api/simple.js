export function GET() {
  return new Response(
    JSON.stringify({
      message: "Simple API working!",
      time: new Date().toISOString()
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}