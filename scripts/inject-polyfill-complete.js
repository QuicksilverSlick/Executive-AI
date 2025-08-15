import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('💉 Injecting MessageChannel polyfill into ALL Worker files...');

// Comprehensive polyfill that covers all cases
const polyfill = `
// MessageChannel Polyfill for Cloudflare Workers - Injected at build time
(function() {
  if (typeof globalThis !== 'undefined' && !globalThis.MessageChannel) {
    class MessagePort {
      constructor() {
        this.onmessage = null;
        this.onmessageerror = null;
        this._otherPort = null;
      }
      
      postMessage(message) {
        if (this._otherPort && this._otherPort.onmessage) {
          setTimeout(() => {
            this._otherPort.onmessage({ data: message });
          }, 0);
        }
      }
      
      close() {
        this.onmessage = null;
        this.onmessageerror = null;
      }
      
      start() {}
    }
    
    class MessageChannel {
      constructor() {
        this.port1 = new MessagePort();
        this.port2 = new MessagePort();
        this.port1._otherPort = this.port2;
        this.port2._otherPort = this.port1;
      }
    }
    
    globalThis.MessageChannel = MessageChannel;
    globalThis.MessagePort = MessagePort;
    
    // Also polyfill on self for Workers
    if (typeof self !== 'undefined') {
      self.MessageChannel = MessageChannel;
      self.MessagePort = MessagePort;
    }
  }
})();
`;

// Files to inject polyfill into
const filesToPatch = [
  path.join(__dirname, '..', 'dist', '_worker.js', 'index.js'),
  path.join(__dirname, '..', 'dist', '_worker.js', 'renderers.mjs'),
  // Also check for the main worker entry
  path.join(__dirname, '..', 'dist', '_worker.js')
];

let injectedCount = 0;

filesToPatch.forEach(filePath => {
  try {
    // Check if it's a file (not directory)
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Only inject if not already present
      if (!content.includes('MessageChannel Polyfill')) {
        // Inject at the very beginning of the file
        content = polyfill + '\n' + content;
        fs.writeFileSync(filePath, content);
        console.log(`✅ Polyfill injected into ${path.basename(filePath)}`);
        injectedCount++;
      } else {
        console.log(`✓ Polyfill already in ${path.basename(filePath)}`);
      }
    }
  } catch (err) {
    // File doesn't exist or is a directory, skip
    if (err.code !== 'ENOENT' && err.code !== 'EISDIR') {
      console.log(`⚠️ Error processing ${filePath}: ${err.message}`);
    }
  }
});

// Also inject into any other .mjs files in the worker directory
const workerDir = path.join(__dirname, '..', 'dist', '_worker.js');
if (fs.existsSync(workerDir)) {
  const files = fs.readdirSync(workerDir);
  files.forEach(file => {
    if (file.endsWith('.mjs') || file.endsWith('.js')) {
      const filePath = path.join(workerDir, file);
      try {
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          let content = fs.readFileSync(filePath, 'utf8');
          if (!content.includes('MessageChannel Polyfill')) {
            content = polyfill + '\n' + content;
            fs.writeFileSync(filePath, content);
            console.log(`✅ Polyfill injected into ${file}`);
            injectedCount++;
          }
        }
      } catch (err) {
        // Skip errors
      }
    }
  });
}

console.log(`\n🎯 Polyfill injection complete! Modified ${injectedCount} files.`);