/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Fix import paths in the built Worker file for Cloudflare Workers deployment
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-unknown-20250816-384
 * @init-timestamp: 2025-08-16T11:05:00Z
 * @reasoning:
 * - **Objective:** Fix relative import paths that cause "Could not resolve" errors in Workers
 * - **Strategy:** Replace relative paths with proper absolute paths for the Workers runtime
 * - **Outcome:** Working Worker deployment with proper asset resolution
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const workerPath = join(projectRoot, 'dist', '_worker.js', 'index.js');

if (!existsSync(workerPath)) {
  console.error('❌ Worker file not found at:', workerPath);
  console.log('💡 Make sure to run "npm run build" first');
  process.exit(1);
}

console.log('🔧 Fixing Worker import paths...');

try {
  let workerContent = readFileSync(workerPath, 'utf-8');
  
  // Fix the main problematic import
  const originalImport = 'from"./_astro/_@astrojs-ssr-adapter.';
  const fixedImport = 'from"../_astro/_@astrojs-ssr-adapter.';
  
  if (workerContent.includes(originalImport)) {
    // Replace all occurrences of the problematic import
    workerContent = workerContent.replace(
      /from"\.\/(_astro\/[^"]+)"/g,
      'from"../$1"'
    );
    
    console.log('✅ Fixed relative import paths');
  } else {
    console.log('ℹ️  No problematic imports found');
  }
  
  // Ensure the MessageChannel polyfill is properly positioned
  if (!workerContent.includes('globalThis.MessageChannel')) {
    console.log('⚠️  MessageChannel polyfill not found - it may have been stripped');
  } else {
    console.log('✅ MessageChannel polyfill is present');
  }
  
  // Add compatibility wrapper for Workers runtime
  const compatibilityWrapper = `
// Cloudflare Workers compatibility layer
if (typeof globalThis === 'undefined') {
  var globalThis = self;
}

// Ensure fetch is available globally
if (typeof globalThis.fetch === 'undefined' && typeof fetch !== 'undefined') {
  globalThis.fetch = fetch;
}

`;

  if (!workerContent.includes('Cloudflare Workers compatibility layer')) {
    workerContent = compatibilityWrapper + workerContent;
    console.log('✅ Added Workers compatibility layer');
  }
  
  // Write the fixed content back
  writeFileSync(workerPath, workerContent);
  
  console.log('🎉 Worker import paths fixed successfully!');
  console.log(`📍 Fixed file: ${workerPath}`);
  
} catch (error) {
  console.error('❌ Error fixing Worker imports:', error);
  process.exit(1);
}

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250816-384
 * @timestamp: 2025-08-16T11:05:00Z
 * @reasoning:
 * - **Objective:** Created script to fix Worker import path issues for Cloudflare deployment
 * - **Strategy:** Replace problematic relative imports and add compatibility layer
 * - **Outcome:** Script that ensures Worker can properly resolve its dependencies
 */