/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Build script for Workers deployment with proper static assets handling
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-unknown-20250815-296
 * @init-timestamp: 2025-08-15T17:30:00Z
 * @reasoning:
 * - **Objective:** Create build script that properly prepares assets for Workers static assets deployment
 * - **Strategy:** Build Astro app, organize assets, and prepare Worker entry point
 * - **Outcome:** Clean build process that outputs proper structure for Workers deployment
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');

function log(message) {
  console.log(`🔧 [Build Workers] ${message}`);
}

function error(message) {
  console.error(`❌ [Build Workers] ${message}`);
}

function success(message) {
  console.log(`✅ [Build Workers] ${message}`);
}

/**
 * Clean previous build
 */
function cleanBuild() {
  log('Cleaning previous build...');
  try {
    execSync('rm -rf dist .astro', { stdio: 'inherit' });
    success('Build cleaned');
  } catch (err) {
    error(`Failed to clean build: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Build the Astro application with Workers configuration
 */
function buildAstro() {
  log('Building Astro application for Workers...');
  try {
    execSync('astro build --config astro.config.workers.mjs', { 
      stdio: 'inherit',
      env: { 
        ...process.env, 
        NODE_ENV: 'production',
        WORKERS_ENV: 'true'
      }
    });
    success('Astro build completed');
  } catch (err) {
    error(`Astro build failed: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Verify the Worker entry point exists
 */
function verifyWorkerEntry() {
  log('Verifying Worker entry point...');
  
  const workerEntryPath = path.join(DIST_DIR, '_worker.js', 'index.js');
  if (!existsSync(workerEntryPath)) {
    error(`Worker entry point not found at ${workerEntryPath}`);
    process.exit(1);
  }
  
  const srcWorkerPath = path.join(PROJECT_ROOT, 'src', 'worker.js');
  if (!existsSync(srcWorkerPath)) {
    error(`Source worker file not found at ${srcWorkerPath}`);
    process.exit(1);
  }
  
  success('Worker entry points verified');
}

/**
 * Create assets manifest for debugging
 */
function createAssetsManifest() {
  log('Creating assets manifest...');
  
  const manifest = {
    buildTime: new Date().toISOString(),
    assetCount: 0,
    assets: []
  };
  
  function scanDirectory(dir, basePath = '') {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(basePath, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip _worker.js directory as it's not a static asset
        if (item !== '_worker.js') {
          scanDirectory(fullPath, relativePath);
        }
      } else {
        manifest.assets.push({
          path: relativePath.replace(/\\/g, '/'),
          size: stat.size,
          modified: stat.mtime.toISOString()
        });
        manifest.assetCount++;
      }
    }
  }
  
  if (existsSync(DIST_DIR)) {
    scanDirectory(DIST_DIR);
  }
  
  const manifestPath = path.join(DIST_DIR, 'assets-manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  success(`Assets manifest created: ${manifest.assetCount} assets`);
}

/**
 * Validate Workers compatibility
 */
function validateWorkersCompatibility() {
  log('Validating Workers compatibility...');
  
  const workerEntryPath = path.join(DIST_DIR, '_worker.js', 'index.js');
  const content = readFileSync(workerEntryPath, 'utf-8');
  
  // Check for Node.js specific imports that won't work in Workers
  const problematicPatterns = [
    /require\s*\(\s*['"]fs['"]\s*\)/,
    /require\s*\(\s*['"]path['"]\s*\)/,
    /require\s*\(\s*['"]os['"]\s*\)/,
    /import.*from\s*['"]fs['"]/,
    /import.*from\s*['"]path['"]/,
    /import.*from\s*['"]os['"]/
  ];
  
  const issues = [];
  for (const pattern of problematicPatterns) {
    if (pattern.test(content)) {
      issues.push(`Found problematic import: ${pattern.source}`);
    }
  }
  
  if (issues.length > 0) {
    error('Workers compatibility issues found:');
    issues.forEach(issue => console.error(`  - ${issue}`));
    process.exit(1);
  }
  
  success('Workers compatibility validated');
}

/**
 * Optimize build for Workers
 */
function optimizeBuild() {
  log('Optimizing build for Workers...');
  
  try {
    // Run optimization script if it exists
    if (existsSync(path.join(PROJECT_ROOT, 'scripts', 'optimize-build.js'))) {
      execSync('node scripts/optimize-build.js', { stdio: 'inherit' });
    }
    
    success('Build optimization completed');
  } catch (err) {
    error(`Build optimization failed: ${err.message}`);
    // Don't exit, optimization is optional
  }
}

/**
 * Generate deployment info
 */
function generateDeploymentInfo() {
  log('Generating deployment info...');
  
  const deploymentInfo = {
    buildTime: new Date().toISOString(),
    buildType: 'workers-with-static-assets',
    nodeVersion: process.version,
    environment: 'production',
    features: {
      staticAssets: true,
      apiRoutes: true,
      rateLimiting: true,
      corsEnabled: true,
      securityHeaders: true
    }
  };
  
  const infoPath = path.join(DIST_DIR, 'deployment-info.json');
  writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));
  
  success('Deployment info generated');
}

/**
 * Main build process
 */
function main() {
  console.log('🚀 Building Executive AI Training for Cloudflare Workers with Static Assets\n');
  
  try {
    cleanBuild();
    buildAstro();
    verifyWorkerEntry();
    createAssetsManifest();
    validateWorkersCompatibility();
    optimizeBuild();
    generateDeploymentInfo();
    
    console.log('\n🎉 Workers build completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update KV namespace IDs in wrangler.toml');
    console.log('2. Set secrets: wrangler secret put OPENAI_API_KEY');
    console.log('3. Deploy: npm run workers:deploy');
    
  } catch (err) {
    error(`Build failed: ${err.message}`);
    process.exit(1);
  }
}

// Run the build process
main();

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250815-296
 * @timestamp: 2025-08-15T17:30:00Z
 * @reasoning:
 * - **Objective:** Created comprehensive build script for Workers deployment with static assets
 * - **Strategy:** Clean build process with validation, optimization, and proper asset organization
 * - **Outcome:** Reliable build script that ensures proper Workers deployment structure
 */