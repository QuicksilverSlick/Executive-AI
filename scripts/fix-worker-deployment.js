#!/usr/bin/env node

/**
 * Fix Worker deployment imports by converting relative imports to absolute paths
 */

import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const workerDir = join(projectRoot, 'dist', '_worker.js');
const astroDir = join(projectRoot, 'dist', '_astro');

/**
 * Process a single file and fix imports
 */
async function processFile(filePath) {
  try {
    let content = await readFile(filePath, 'utf-8');
    let modified = false;
    
    // Fix imports from "../_astro/" to absolute imports
    if (content.includes('from"../_astro/') || content.includes('from "../_astro/')) {
      // Get list of actual files in _astro directory
      const astroFiles = await readdir(astroDir);
      const astroFileMap = new Map();
      
      for (const file of astroFiles) {
        astroFileMap.set(file, true);
      }
      
      // Replace imports with bundled content or external references
      content = content.replace(/from\s*["']\.\.?\/_astro\/([^"']+)["']/g, (match, fileName) => {
        // For now, we'll create stub modules for these imports
        // In production, these would be properly bundled
        return `from"./${fileName}"`;
      });
      
      modified = true;
    }
    
    // Fix imports from "./_astro/" 
    if (content.includes('from"./_astro/') || content.includes('from "./_astro/')) {
      content = content.replace(/from\s*["']\.?\/_astro\/([^"']+)["']/g, (match, fileName) => {
        return `from"./${fileName}"`;
      });
      modified = true;
    }
    
    if (modified) {
      await writeFile(filePath, content);
      console.log(`✓ Fixed imports in: ${filePath.replace(projectRoot, '')}`);
    }
    
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Copy asset files to Worker directory for bundling
 */
async function copyAssets() {
  console.log('📦 Copying critical assets to Worker directory...');
  
  const criticalAssets = [
    'index.Cdy8Mkle.js',
    '_@astro-renderers.CZs0comK.js',
    '_@astrojs-ssr-adapter.CvxT8xLx.js',
    'astro/server.DOXa8ECX.js',
    'noop-middleware.C2jbySJD.js',
    'cloudflare-kv-binding.DMly_2Gl.js',
    'Layout.5tmSQZyb.js',
    'Button.CcXw_8lH.js',
    'AnimatedSection.C3UDcaAM.js',
    'index.C41Gem23.js',
    'rateLimiter.BWo6qOOx.js',
    'secureProxy.Yg0KILEl.js',
    'refresh-token.CPv5Y03w.js',
    'vnode-children.B1mRAAxo.js'
  ];
  
  for (const asset of criticalAssets) {
    try {
      const srcPath = join(astroDir, asset);
      const destPath = join(workerDir, asset);
      
      // Check if it's in a subdirectory
      if (asset.includes('/')) {
        const subdir = dirname(asset);
        const subdirPath = join(workerDir, subdir);
        await stat(subdirPath).catch(() => {
          const { mkdir } = require('fs').promises;
          return mkdir(subdirPath, { recursive: true });
        });
      }
      
      const content = await readFile(srcPath, 'utf-8');
      
      // Create a stub module that exports the necessary functions
      let stubContent = content;
      
      // If the file has imports from other _astro files, make them relative
      stubContent = stubContent.replace(/from\s*["']\.?\/_astro\/([^"']+)["']/g, 'from"./$1"');
      
      await writeFile(destPath, stubContent);
      console.log(`  ✓ Copied: ${asset}`);
      
    } catch (error) {
      console.log(`  ⚠ Skipped: ${asset} (${error.message})`);
    }
  }
}

/**
 * Process all files in the Worker directory
 */
async function processWorkerFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await processWorkerFiles(fullPath);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) {
      await processFile(fullPath);
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔧 Fixing Worker deployment imports...\n');
  
  try {
    // First copy critical assets
    await copyAssets();
    
    console.log('\n📝 Processing Worker files...');
    
    // Then fix imports in Worker files
    await processWorkerFiles(workerDir);
    
    console.log('\n✅ Worker deployment fixes complete!');
    console.log('   You can now run: npx wrangler deploy --env=""');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();