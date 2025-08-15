// Fallback handler for static assets that might be missing
export async function onRequest(context) {
  // Don't handle assets - let them be served statically
  const url = new URL(context.request.url);
  
  // Check if this is an asset request
  if (url.pathname.startsWith('/_assets/') || 
      url.pathname.endsWith('.css') || 
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.woff') ||
      url.pathname.endsWith('.woff2')) {
    // Let Cloudflare Pages serve these statically
    return context.next();
  }
  
  // For everything else, pass to the Astro SSR handler
  return context.next();
}