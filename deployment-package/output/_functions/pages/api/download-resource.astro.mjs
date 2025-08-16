export { renderers } from '../../renderers.mjs';

// Simple API endpoint for handling resource downloads
// In production, this would integrate with your email service (SendGrid, Mailchimp, etc.)

async function POST({ request }) {
  try {
    const data = await request.json();
    const { email, company, resource_id } = data;

    // Validate input
    if (!email || !company || !resource_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // In production, you would:
    // 1. Add email to your mailing list (e.g., SendGrid, Mailchimp)
    // 2. Send email with download links
    // 3. Track conversion in your CRM
    // 4. Store lead data securely

    // For now, we'll simulate success
    console.log('New resource download:', { email, company, resource_id });

    // Generate mock download URL
    const downloadUrl = `/downloads/${resource_id}.pdf`;

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Resource sent successfully',
      downloadUrl: downloadUrl
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Download error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle other methods
function GET() {
  return new Response('Method not allowed', { status: 405 });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
