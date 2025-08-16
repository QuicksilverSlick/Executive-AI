export async function GET() {
  console.log('[ECHO] GET request received');
  
  return new Response(JSON.stringify({
    message: 'Echo test successful',
    timestamp: new Date().toISOString(),
    method: 'GET'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function POST({ request }: { request: Request }) {
  console.log('[ECHO] POST request received');
  
  let body = null;
  try {
    body = await request.json();
  } catch (e) {
    console.log('[ECHO] No JSON body or parse error');
  }
  
  return new Response(JSON.stringify({
    message: 'Echo test successful',
    timestamp: new Date().toISOString(),
    method: 'POST',
    received: body
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}