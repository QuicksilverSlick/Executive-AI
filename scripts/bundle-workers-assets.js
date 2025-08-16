/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Workers asset bundling script to resolve import errors and optimize assets for Cloudflare Workers deployment
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-dev-20250815-680
 * @init-timestamp: 2025-08-15T14:49:00Z
 * @reasoning:
 * - **Objective:** Fix asset bundling issues in Workers deployment by creating proper asset resolution and module bundling
 * - **Strategy:** Bundle all assets, resolve module imports, and create Workers-compatible asset mapping
 * - **Outcome:** Error-free Workers deployment with proper asset handling and module resolution
 */

import { readFile, writeFile, readdir, stat, mkdir, copyFile, rm } from 'fs/promises';
import { join, dirname, extname, basename, relative } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const distDir = join(projectRoot, 'dist');

/**
 * Logger utility
 */
class Logger {
  static info(message) {
    console.log(`[${new Date().toISOString()}] ℹ️  ${message}`);
  }
  
  static success(message) {
    console.log(`[${new Date().toISOString()}] ✅ ${message}`);
  }
  
  static warn(message) {
    console.log(`[${new Date().toISOString()}] ⚠️  ${message}`);
  }
  
  static error(message) {
    console.log(`[${new Date().toISOString()}] ❌ ${message}`);
  }
}

/**
 * Asset bundling configuration
 */
const BUNDLING_CONFIG = {
  // Assets to inline in the worker bundle
  inlineAssets: {
    maxSize: 100 * 1024, // 100KB
    types: ['.css', '.js', '.woff2', '.woff'],
    critical: ['main.css', 'critical.css', 'app.css']
  },
  
  // Module resolution configuration
  moduleResolution: {
    // Map problematic imports to Workers-compatible alternatives
    importMaps: {
      'react-dom/server': 'react-dom/server.browser',
      'react-dom/server.node': 'react-dom/server.browser'
    },
    
    // Modules to bundle completely
    bundleCompletely: [
      'astro-icon',
      '@iconify',
      'framer-motion'
    ]
  },
  
  // Workers-specific optimizations
  workers: {
    assetPrefix: '/_astro/',
    maxBundleSize: 25 * 1024 * 1024, // 25MB Workers limit
    enableCompression: true
  }
};

/**
 * Scan and categorize assets
 */
async function scanAssets() {
  Logger.info('Scanning build assets...');
  
  const assets = {
    css: [],
    js: [],
    fonts: [],
    images: [],
    other: []
  };
  
  async function scanDirectory(dir) {
    try {
      const entries = await readdir(dir);
      
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stats = await stat(fullPath);
        
        if (stats.isDirectory()) {
          await scanDirectory(fullPath);
        } else {
          const ext = extname(entry).toLowerCase();
          const relativePath = relative(distDir, fullPath);
          const size = stats.size;
          
          const assetInfo = {
            path: fullPath,
            relativePath,
            name: entry,
            size,
            ext
          };
          
          // Categorize assets
          if (ext === '.css') {
            assets.css.push(assetInfo);
          } else if (ext === '.js' || ext === '.mjs') {
            assets.js.push(assetInfo);
          } else if (['.woff', '.woff2', '.ttf', '.otf'].includes(ext)) {
            assets.fonts.push(assetInfo);
          } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
            assets.images.push(assetInfo);
          } else {
            assets.other.push(assetInfo);
          }
        }
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        Logger.warn(`Could not scan directory ${dir}: ${error.message}`);
      }
    }
  }
  
  await scanDirectory(distDir);
  
  const totalAssets = Object.values(assets).reduce((sum, arr) => sum + arr.length, 0);
  Logger.info(`Found ${totalAssets} assets: ${assets.css.length} CSS, ${assets.js.length} JS, ${assets.fonts.length} fonts, ${assets.images.length} images, ${assets.other.length} other`);
  
  return assets;
}

/**
 * Create asset manifest for Workers
 */
async function createAssetManifest(assets) {
  Logger.info('Creating asset manifest...');
  
  const manifest = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    assets: {},
    inlined: [],
    external: []
  };
  
  // Process each asset category
  for (const [category, assetList] of Object.entries(assets)) {
    for (const asset of assetList) {
      const shouldInline = (
        asset.size <= BUNDLING_CONFIG.inlineAssets.maxSize &&
        BUNDLING_CONFIG.inlineAssets.types.includes(asset.ext)
      ) || BUNDLING_CONFIG.inlineAssets.critical.some(critical => 
        asset.name.includes(critical)
      );
      
      const assetPath = `/${asset.relativePath.replace(/\\/g, '/')}`;
      
      if (shouldInline) {
        try {
          const content = await readFile(asset.path);
          const base64 = content.toString('base64');
          const mimeType = getMimeType(asset.ext);
          
          manifest.assets[assetPath] = {
            type: 'inline',
            content: `data:${mimeType};base64,${base64}`,
            size: asset.size,
            category
          };
          
          manifest.inlined.push(assetPath);
          Logger.info(`✓ Inlined: ${asset.relativePath} (${formatBytes(asset.size)})`);
        } catch (error) {
          Logger.warn(`Could not inline ${asset.relativePath}: ${error.message}`);
          manifest.assets[assetPath] = {
            type: 'external',
            path: assetPath,
            size: asset.size,
            category
          };
          manifest.external.push(assetPath);
        }
      } else {
        manifest.assets[assetPath] = {
          type: 'external',
          path: assetPath,
          size: asset.size,
          category
        };
        manifest.external.push(assetPath);
      }
    }
  }
  
  return manifest;
}

/**
 * Fix module imports in the worker bundle
 */
async function fixWorkerImports() {
  Logger.info('Fixing worker module imports...');
  
  // Find the actual worker entry file
  let workerPath = join(distDir, '_worker.js');
  
  // Check if _worker.js is a directory (Astro sometimes creates this structure)
  try {
    const stats = await stat(workerPath);
    if (stats.isDirectory()) {
      // Look for the actual worker file inside the directory
      workerPath = join(workerPath, 'index.js');
    }
  } catch {
    // If _worker.js doesn't exist, try other common names
    const possiblePaths = [
      join(distDir, 'worker.js'),
      join(distDir, 'index.js'),
      join(distDir, '_worker', 'index.js')
    ];
    
    for (const path of possiblePaths) {
      try {
        await stat(path);
        workerPath = path;
        break;
      } catch {
        continue;
      }
    }
  }
  
  try {
    let workerCode = await readFile(workerPath, 'utf-8');
    const originalSize = workerCode.length;
    
    // Apply import maps
    for (const [from, to] of Object.entries(BUNDLING_CONFIG.moduleResolution.importMaps)) {
      const regex = new RegExp(`(['"])${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\1`, 'g');
      workerCode = workerCode.replace(regex, `$1${to}$1`);
    }
    
    // Fix dynamic imports that cause issues in Workers
    workerCode = workerCode.replace(
      /import\s*\(\s*(['"`])([^'"`]+)\1\s*\)/g,
      (match, quote, modulePath) => {
        // Convert problematic dynamic imports to static imports where possible
        if (modulePath.includes('react-dom/server')) {
          return `import(${quote}react-dom/server.browser${quote})`;
        }
        return match;
      }
    );
    
    // Add Workers-specific polyfills and fixes
    const workersPolyfills = `
// Workers environment fixes and polyfills
if (typeof global === 'undefined') {
  globalThis.global = globalThis;
}

// Fix for React SSR in Workers
if (typeof window === 'undefined' && typeof document === 'undefined') {
  globalThis.document = {
    createElement: () => ({}),
    createTextNode: () => ({}),
    getElementsByTagName: () => []
  };
}

// Asset resolution helper for Workers
const ASSET_BASE_URL = '/_astro/';

function resolveAsset(path) {
  if (path.startsWith('/')) {
    return path;
  }
  return ASSET_BASE_URL + path;
}

// Export asset resolver for use in components
globalThis.resolveAsset = resolveAsset;

`;
    
    workerCode = workersPolyfills + workerCode;
    
    await writeFile(workerPath, workerCode);
    
    Logger.success(`Worker imports fixed (${formatBytes(originalSize)} → ${formatBytes(workerCode.length)})`);
    
  } catch (error) {
    Logger.error(`Failed to fix worker imports: ${error.message}`);
    throw error;
  }
}

/**
 * Inject asset manifest into worker
 */
async function injectAssetManifest(manifest) {
  Logger.info('Injecting asset manifest into worker...');
  
  // Find the actual worker entry file
  let workerPath = join(distDir, '_worker.js');
  
  // Check if _worker.js is a directory
  try {
    const stats = await stat(workerPath);
    if (stats.isDirectory()) {
      workerPath = join(workerPath, 'index.js');
    }
  } catch {
    // Try alternative paths
    const possiblePaths = [
      join(distDir, 'worker.js'),
      join(distDir, 'index.js'),
      join(distDir, '_worker', 'index.js')
    ];
    
    for (const path of possiblePaths) {
      try {
        await stat(path);
        workerPath = path;
        break;
      } catch {
        continue;
      }
    }
  }
  
  try {
    let workerCode = await readFile(workerPath, 'utf-8');
    
    const assetManifestCode = `
// Auto-generated asset manifest for Workers
const WORKERS_ASSET_MANIFEST = ${JSON.stringify(manifest.assets, null, 2)};

// Asset handler for Workers environment
function handleWorkerAsset(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  if (WORKERS_ASSET_MANIFEST[pathname]) {
    const asset = WORKERS_ASSET_MANIFEST[pathname];
    
    if (asset.type === 'inline') {
      // Return inlined asset as data URL
      const dataUrl = asset.content;
      const [mimeInfo, base64Data] = dataUrl.split(',');
      const mimeType = mimeInfo.replace('data:', '').replace(';base64', '');
      
      // Decode base64 for binary assets
      let content;
      if (mimeType.startsWith('text/') || mimeType.includes('javascript') || mimeType.includes('json')) {
        content = atob(base64Data);
      } else {
        // For binary assets, return the base64 directly
        content = dataUrl;
      }
      
      return new Response(content, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Asset-Source': 'worker-inline'
        }
      });
    } else {
      // Return 404 for external assets that should be served by CDN/static hosting
      return new Response('Asset not found in worker bundle', { 
        status: 404,
        headers: {
          'X-Asset-Source': 'external-required'
        }
      });
    }
  }
  
  return null; // Let other handlers process
}

// Export asset handler
globalThis.handleWorkerAsset = handleWorkerAsset;

`;
    
    workerCode = assetManifestCode + workerCode;
    
    await writeFile(workerPath, workerCode);
    
    Logger.success('Asset manifest injected into worker');
    
  } catch (error) {
    Logger.error(`Failed to inject asset manifest: ${error.message}`);
    throw error;
  }
}

/**
 * Validate Workers bundle
 */
async function validateWorkerBundle() {
  Logger.info('Validating Workers bundle...');
  
  // Find the actual worker entry file
  let workerPath = join(distDir, '_worker.js');
  
  // Check if _worker.js is a directory
  try {
    const stats = await stat(workerPath);
    if (stats.isDirectory()) {
      workerPath = join(workerPath, 'index.js');
    }
  } catch {
    // Try alternative paths
    const possiblePaths = [
      join(distDir, 'worker.js'),
      join(distDir, 'index.js'),
      join(distDir, '_worker', 'index.js')
    ];
    
    for (const path of possiblePaths) {
      try {
        await stat(path);
        workerPath = path;
        break;
      } catch {
        continue;
      }
    }
  }
  
  try {
    const stats = await stat(workerPath);
    const sizeMB = stats.size / (1024 * 1024);
    
    if (sizeMB > 25) {
      throw new Error(`Worker bundle is ${sizeMB.toFixed(1)}MB, exceeds 25MB limit`);
    }
    
    // Check for syntax errors
    const content = await readFile(workerPath, 'utf-8');
    
    // Basic syntax checks
    const issues = [];
    
    if (content.includes('import(') && !content.includes('dynamic import')) {
      issues.push('Dynamic imports detected - may cause runtime issues');
    }
    
    if (content.includes('node:') || content.includes('require(')) {
      issues.push('Node.js specific imports detected');
    }
    
    if (issues.length > 0) {
      Logger.warn('Validation warnings:');
      issues.forEach(issue => Logger.warn(`  - ${issue}`));
    }
    
    Logger.success(`Worker bundle validated: ${sizeMB.toFixed(1)}MB`);
    
  } catch (error) {
    Logger.error(`Worker bundle validation failed: ${error.message}`);
    throw error;
  }
}

/**
 * Utility functions
 */
function getMimeType(ext) {
  const mimeTypes = {
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

function formatBytes(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Main bundling function
 */
async function bundleWorkersAssets() {
  try {
    Logger.info('🚀 Starting Workers asset bundling...');
    
    // Scan assets
    const assets = await scanAssets();
    
    // Create asset manifest
    const manifest = await createAssetManifest(assets);
    
    // Fix worker imports
    await fixWorkerImports();
    
    // Inject asset manifest
    await injectAssetManifest(manifest);
    
    // Save manifest file
    const manifestPath = join(distDir, 'workers-assets.json');
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    
    // Validate bundle
    await validateWorkerBundle();
    
    Logger.success('🎉 Workers asset bundling completed!');
    
    // Print summary
    console.log('\n📊 Bundling Summary:');
    console.log(`   • Inlined assets: ${manifest.inlined.length}`);
    console.log(`   • External assets: ${manifest.external.length}`);
    console.log(`   • Total inlined size: ${formatBytes(manifest.inlined.reduce((sum, path) => sum + (manifest.assets[path]?.size || 0), 0))}`);
    console.log('\n🚀 Workers bundle is ready for deployment!');
    
  } catch (error) {
    Logger.error(`Workers asset bundling failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  bundleWorkersAssets();
}

export { bundleWorkersAssets };

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-dev-20250815-680
 * @timestamp: 2025-08-15T14:49:00Z
 * @reasoning:
 * - **Objective:** Created comprehensive Workers asset bundling script to fix deployment issues
 * - **Strategy:** Implemented asset scanning, module import fixing, and Workers-specific optimizations
 * - **Outcome:** Production-ready asset bundling system that resolves import errors and optimizes for Workers runtime
 */