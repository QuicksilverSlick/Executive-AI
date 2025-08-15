// MessageChannel polyfill for Cloudflare Workers
// This ensures React SSR works in Cloudflare's environment

if (typeof globalThis !== 'undefined' && !globalThis.MessageChannel) {
  globalThis.MessageChannel = class MessageChannel {
    constructor() {
      this.port1 = { 
        postMessage: (msg) => {
          if (this.port2.onmessage) {
            setTimeout(() => this.port2.onmessage({ data: msg }), 0);
          }
        },
        onmessage: null,
        close: () => {}
      };
      this.port2 = { 
        postMessage: (msg) => {
          if (this.port1.onmessage) {
            setTimeout(() => this.port1.onmessage({ data: msg }), 0);
          }
        },
        onmessage: null,
        close: () => {}
      };
    }
  };
}

// Also polyfill MessagePort if needed
if (typeof globalThis !== 'undefined' && !globalThis.MessagePort) {
  globalThis.MessagePort = class MessagePort {
    postMessage() {}
    onmessage = null;
    close() {}
  };
}

export {};