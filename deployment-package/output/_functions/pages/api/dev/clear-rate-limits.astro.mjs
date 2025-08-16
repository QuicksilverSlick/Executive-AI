export { renderers } from '../../../renderers.mjs';

{
  console.warn("⚠️ Rate limit clearing endpoint is disabled in production");
}
const prerender = false;
const POST = async ({ request, clientAddress }) => {
  {
    return new Response(JSON.stringify({
      success: false,
      error: "This endpoint is only available in development mode"
    }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const GET = async ({ clientAddress }) => {
  {
    return new Response(JSON.stringify({
      success: false,
      error: "This endpoint is only available in development mode"
    }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
