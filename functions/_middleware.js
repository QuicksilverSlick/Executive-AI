// Cloudflare Pages Middleware - MessageChannel Polyfill
// This ensures React SSR works in Cloudflare Workers environment

// Polyfill MessageChannel for React 18 compatibility
if (typeof globalThis.MessageChannel === 'undefined') {
  globalThis.MessageChannel = class MessageChannel {
    constructor() {
      const channel = this;
      this.port1 = {
        postMessage(data) {
          if (channel.port2.onmessage) {
            setTimeout(() => channel.port2.onmessage({ data }), 0);
          }
        },
        onmessage: null,
        close() {}
      };
      this.port2 = {
        postMessage(data) {
          if (channel.port1.onmessage) {
            setTimeout(() => channel.port1.onmessage({ data }), 0);
          }
        },
        onmessage: null,
        close() {}
      };
    }
  };
}

// Export middleware that applies to all routes
export async function onRequest(context) {
  // Continue to the next middleware or route handler
  return context.next();
}