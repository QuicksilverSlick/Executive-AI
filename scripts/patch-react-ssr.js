// Patch script to fix React SSR for Cloudflare Workers
// This patches react-dom to use browser-compatible rendering

const fs = require('fs');
const path = require('path');

console.log('🔧 Patching React SSR for Cloudflare compatibility...');

// Polyfill for MessageChannel if not available
if (typeof globalThis !== 'undefined' && !globalThis.MessageChannel) {
  console.log('Adding MessageChannel polyfill...');
  
  class MessageChannel {
    constructor() {
      this.port1 = { postMessage: () => {} };
      this.port2 = { postMessage: () => {} };
    }
  }
  
  globalThis.MessageChannel = MessageChannel;
}

// Create a simple polyfill file
const polyfillContent = `
// MessageChannel polyfill for Cloudflare Workers
if (typeof globalThis !== 'undefined' && !globalThis.MessageChannel) {
  globalThis.MessageChannel = class MessageChannel {
    constructor() {
      this.port1 = { 
        postMessage: (msg) => {
          if (this.port2.onmessage) {
            setTimeout(() => this.port2.onmessage({ data: msg }), 0);
          }
        },
        onmessage: null
      };
      this.port2 = { 
        postMessage: (msg) => {
          if (this.port1.onmessage) {
            setTimeout(() => this.port1.onmessage({ data: msg }), 0);
          }
        },
        onmessage: null
      };
    }
  };
}
`;

// Write polyfill file
fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'polyfills.js'),
  polyfillContent
);

console.log('✅ React SSR patch complete!');