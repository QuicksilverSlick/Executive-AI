// Fallback handler for static assets
export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // Check if this is an asset request
  if (url.pathname.startsWith('/_assets/')) {
    // For asset requests, let Cloudflare Pages serve them statically
    // This ensures proper MIME types are set
    return context.next();
  }
  
  // For everything else, pass to the Astro SSR handler
  return context.next();
}