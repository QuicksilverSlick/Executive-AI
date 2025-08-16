/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Test script for Cloudflare Pages deployment verification
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-unknown-20250816-590
 * @init-timestamp: 2025-08-16T12:15:00Z
 * @reasoning:
 * - **Objective:** Create deployment verification script for Pages
 * - **Strategy:** Check build output and verify all required files are present
 * - **Outcome:** Comprehensive pre-deployment validation
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const distDir = join(projectRoot, 'dist');

console.log('🔍 Testing Cloudflare Pages deployment readiness...\n');

// Test results accumulator
const tests = [];
const addTest = (name, passed, message) => {
  tests.push({ name, passed, message });
  console.log(`${passed ? '✅' : '❌'} ${name}: ${message}`);
};

// 1. Check build directory exists
addTest(
  'Build Directory',
  existsSync(distDir),
  existsSync(distDir) ? 'Build directory exists' : 'Build directory not found'
);

// 2. Check Worker directory
const workerDir = join(distDir, '_worker.js');
addTest(
  'Worker Functions',
  existsSync(workerDir),
  existsSync(workerDir) ? 'Worker directory found' : 'Worker directory missing'
);

// 3. Check static assets
const astroDir = join(distDir, '_astro');
addTest(
  'Static Assets',
  existsSync(astroDir),
  existsSync(astroDir) ? '_astro static assets found' : '_astro directory missing'
);

// 4. Check _routes.json
const routesFile = join(distDir, '_routes.json');
let routesValid = false;
if (existsSync(routesFile)) {
  try {
    const routes = JSON.parse(readFileSync(routesFile, 'utf8'));
    routesValid = routes.version === 1 && Array.isArray(routes.include) && Array.isArray(routes.exclude);
  } catch (e) {
    routesValid = false;
  }
}
addTest(
  'Routes Configuration',
  routesValid,
  routesValid ? 'Valid _routes.json found' : 'Invalid or missing _routes.json'
);

// 5. Check _headers file
const headersFile = join(distDir, '_headers');
addTest(
  'Headers Configuration',
  existsSync(headersFile),
  existsSync(headersFile) ? 'Headers file found' : 'Headers file missing'
);

// 6. Check _redirects file
const redirectsFile = join(distDir, '_redirects');
addTest(
  'Redirects Configuration',
  existsSync(redirectsFile),
  existsSync(redirectsFile) ? 'Redirects file found' : 'Redirects file missing'
);

// 7. Check main worker entry point
const mainWorkerFile = join(workerDir, 'index.js');
addTest(
  'Worker Entry Point',
  existsSync(mainWorkerFile),
  existsSync(mainWorkerFile) ? 'Main worker entry point found' : 'Worker entry point missing'
);

// 8. Check for static HTML files
const htmlFiles = readdirSync(distDir).filter(file => file.endsWith('.html'));
addTest(
  'Static HTML Files',
  htmlFiles.length > 0,
  `Found ${htmlFiles.length} static HTML files`
);

// 9. Check bundle size (for performance)
if (existsSync(astroDir)) {
  const astroFiles = readdirSync(astroDir);
  const jsFiles = astroFiles.filter(file => file.endsWith('.js'));
  const cssFiles = astroFiles.filter(file => file.endsWith('.css'));
  
  let totalSize = 0;
  [...jsFiles, ...cssFiles].forEach(file => {
    const filePath = join(astroDir, file);
    if (existsSync(filePath)) {
      totalSize += statSync(filePath).size;
    }
  });
  
  const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
  addTest(
    'Bundle Size',
    totalSize > 0,
    `Total asset size: ${sizeInMB}MB (${jsFiles.length} JS, ${cssFiles.length} CSS files)`
  );
}

// 10. Check for potential import issues
if (existsSync(mainWorkerFile)) {
  const workerContent = readFileSync(mainWorkerFile, 'utf8');
  const hasExternalImports = workerContent.includes('../_astro/') && !workerContent.includes('import("');
  addTest(
    'Import Resolution',
    !hasExternalImports,
    hasExternalImports ? 'Potential external import issues detected' : 'No external import issues detected'
  );
}

// Summary
console.log('\n📊 Test Summary:');
const passed = tests.filter(t => t.passed).length;
const failed = tests.filter(t => !t.passed).length;

console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   📋 Total: ${tests.length}`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! Ready for deployment.');
  console.log('\n🚀 Deploy with:');
  console.log('   npm run pages:deploy');
  console.log('   or');
  console.log('   wrangler pages deploy ./dist');
} else {
  console.log('\n⚠️  Some tests failed. Please fix issues before deployment.');
  process.exit(1);
}

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250816-590
 * @timestamp: 2025-08-16T12:15:00Z
 * @reasoning:
 * - **Objective:** Comprehensive deployment verification script
 * - **Strategy:** Test all critical deployment requirements for Pages
 * - **Outcome:** Automated pre-deployment validation system
 */