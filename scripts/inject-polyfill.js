import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('💉 Injecting MessageChannel polyfill into Worker...');

// Polyfill code to inject
const polyfill = `
// MessageChannel Polyfill for Cloudflare Workers
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
  globalThis.MessagePort = class MessagePort {
    postMessage() {}
    onmessage = null;
    close() {}
  };
}
`;

// Path to the worker file
const workerPath = path.join(__dirname, '..', 'dist', '_worker.js', 'index.js');

// Check if worker file exists
if (fs.existsSync(workerPath)) {
  // Read the current content
  let content = fs.readFileSync(workerPath, 'utf8');
  
  // Inject polyfill at the beginning if not already present
  if (!content.includes('MessageChannel Polyfill')) {
    content = polyfill + '\n' + content;
    fs.writeFileSync(workerPath, content);
    console.log('✅ Polyfill injected successfully!');
  } else {
    console.log('✅ Polyfill already present.');
  }
} else {
  console.log('⚠️  Worker file not found, skipping polyfill injection.');
}