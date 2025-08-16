/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Validate Cloudflare Workers configuration and deployment readiness
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-unknown-20250816-384
 * @init-timestamp: 2025-08-16T11:40:00Z
 * @reasoning:
 * - **Objective:** Validate Workers configuration before deployment
 * - **Strategy:** Check all required files, imports, and configuration settings
 * - **Outcome:** Deployment readiness validation with helpful error messages
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔍 Validating Cloudflare Workers configuration...\n');

const checks = [
  {
    name: 'Wrangler Configuration',
    check: () => {
      const wranglerPath = join(projectRoot, 'wrangler.toml');
      if (!existsSync(wranglerPath)) {
        throw new Error('wrangler.toml not found');
      }
      
      const config = readFileSync(wranglerPath, 'utf-8');
      
      if (!config.includes('main = "dist/_worker.js/index.js"')) {
        throw new Error('Main entry point not correctly configured');
      }
      
      if (!config.includes('[assets]')) {
        throw new Error('Assets configuration missing');
      }
      
      if (!config.includes('compatibility_flags = ["nodejs_compat", "streams_enable_constructors"]')) {
        throw new Error('Required compatibility flags missing');
      }
      
      return 'Valid wrangler.toml with correct main entry and assets configuration';
    }
  },
  
  {
    name: 'Worker Entry Point',
    check: () => {
      const workerPath = join(projectRoot, 'dist', '_worker.js', 'index.js');
      if (!existsSync(workerPath)) {
        throw new Error('Worker entry point not found - run "npm run build" first');
      }
      
      const workerContent = readFileSync(workerPath, 'utf-8');
      
      if (!workerContent.includes('MessageChannel')) {
        throw new Error('MessageChannel polyfill missing from worker');
      }
      
      if (!workerContent.includes('globalThis.process')) {
        throw new Error('Process polyfill missing from worker');
      }
      
      if (workerContent.includes('from"./_astro/')) {
        throw new Error('Unresolved relative import paths found');
      }
      
      return 'Worker entry point exists with proper polyfills and import paths';
    }
  },
  
  {
    name: 'Static Assets',
    check: () => {
      const distPath = join(projectRoot, 'dist');
      if (!existsSync(distPath)) {
        throw new Error('Dist directory not found - run "npm run build" first');
      }
      
      const astroPath = join(distPath, '_astro');
      if (!existsSync(astroPath)) {
        throw new Error('_astro directory not found');
      }
      
      const adapterPath = join(astroPath, '_@astrojs-ssr-adapter.kgKaI2oF.js');
      if (!existsSync(adapterPath)) {
        throw new Error('Astro SSR adapter not found');
      }
      
      return 'Static assets properly built and accessible';
    }
  },
  
  {
    name: 'Assets Ignore Configuration',
    check: () => {
      const assetsIgnorePath = join(projectRoot, '.assetsignore');
      if (!existsSync(assetsIgnorePath)) {
        throw new Error('.assetsignore file missing');
      }
      
      const ignoreContent = readFileSync(assetsIgnorePath, 'utf-8');
      if (!ignoreContent.includes('_worker.js/')) {
        throw new Error('.assetsignore does not exclude worker files');
      }
      
      return 'Assets ignore configuration properly excludes worker files';
    }
  },
  
  {
    name: 'Required Dependencies',
    check: () => {
      const requiredFiles = [
        'dist/_worker.js/renderers.mjs',
        'dist/_worker.js/manifest_YRcNJz0a.mjs',
        'dist/_worker.js/_astro-internal_middleware.mjs',
        'dist/_worker.js/_noop-actions.mjs'
      ];
      
      for (const file of requiredFiles) {
        const filePath = join(projectRoot, file);
        if (!existsSync(filePath)) {
          throw new Error(`Required dependency missing: ${file}`);
        }
      }
      
      return 'All required Worker dependencies present';
    }
  }
];

let allPassed = true;

for (const { name, check } of checks) {
  try {
    const result = check();
    console.log(`✅ ${name}: ${result}`);
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    allPassed = false;
  }
}

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Your Workers deployment is ready.');
  console.log('\n📋 Deployment commands:');
  console.log('  npm run workers:deploy:manual:dev    # Deploy to development');
  console.log('  npm run workers:deploy:manual:staging # Deploy to staging');
  console.log('  npm run workers:deploy:manual        # Deploy to production');
} else {
  console.log('❌ Some checks failed. Please fix the issues above before deploying.');
  process.exit(1);
}

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250816-384
 * @timestamp: 2025-08-16T11:40:00Z
 * @reasoning:
 * - **Objective:** Created comprehensive validation script for Workers deployment
 * - **Strategy:** Check all critical components and configurations for proper setup
 * - **Outcome:** Reliable validation tool to prevent deployment issues
 */