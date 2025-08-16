#!/usr/bin/env node

/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Vercel configuration validation script
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-dev-20250816-vercel-migration
 * @init-timestamp: 2025-08-16T15:35:00Z
 * @reasoning:
 * - **Objective:** Validate Vercel configuration before deployment
 * - **Strategy:** Check all config files, environment variables, and dependencies
 * - **Outcome:** Comprehensive pre-deployment validation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Check if file exists
function fileExists(filePath) {
  return fs.existsSync(path.join(projectRoot, filePath));
}

// Read JSON file safely
function readJsonFile(filePath) {
  try {
    const fullPath = path.join(projectRoot, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

// Validation tests
const validationTests = [
  {
    name: 'Vercel Configuration File',
    test: () => {
      if (!fileExists('vercel.json')) {
        return { pass: false, message: 'vercel.json not found' };
      }
      
      const config = readJsonFile('vercel.json');
      if (!config) {
        return { pass: false, message: 'vercel.json is not valid JSON' };
      }
      
      // Check essential properties
      const required = ['buildCommand', 'outputDirectory', 'functions'];
      const missing = required.filter(prop => !config[prop]);
      
      if (missing.length > 0) {
        return { pass: false, message: `Missing required properties: ${missing.join(', ')}` };
      }
      
      return { pass: true, message: 'vercel.json is valid and complete' };
    }
  },
  
  {
    name: 'Vercel Astro Configuration',
    test: () => {
      if (!fileExists('astro.config.vercel.mjs')) {
        return { pass: false, message: 'astro.config.vercel.mjs not found' };
      }
      
      const content = fs.readFileSync(path.join(projectRoot, 'astro.config.vercel.mjs'), 'utf8');
      
      // Check for essential imports and configurations
      const checks = [
        { pattern: /import.*vercel.*from.*@astrojs\/vercel/, name: 'Vercel adapter import' },
        { pattern: /adapter:\s*vercel/, name: 'Vercel adapter configuration' },
        { pattern: /output:\s*['"']server['"]/, name: 'Server output mode' },
      ];
      
      for (const check of checks) {
        if (!check.pattern.test(content)) {
          return { pass: false, message: `Missing ${check.name}` };
        }
      }
      
      return { pass: true, message: 'Vercel Astro configuration is valid' };
    }
  },
  
  {
    name: 'Package.json Dependencies',
    test: () => {
      const pkg = readJsonFile('package.json');
      if (!pkg) {
        return { pass: false, message: 'package.json not found or invalid' };
      }
      
      const requiredDeps = ['@astrojs/vercel'];
      const missingDeps = requiredDeps.filter(dep => 
        !pkg.devDependencies[dep] && !pkg.dependencies[dep]
      );
      
      if (missingDeps.length > 0) {
        return { pass: false, message: `Missing dependencies: ${missingDeps.join(', ')}` };
      }
      
      // Check for Vercel scripts
      const requiredScripts = ['build:vercel', 'deploy:vercel'];
      const missingScripts = requiredScripts.filter(script => !pkg.scripts[script]);
      
      if (missingScripts.length > 0) {
        return { pass: false, message: `Missing scripts: ${missingScripts.join(', ')}` };
      }
      
      return { pass: true, message: 'All required dependencies and scripts are present' };
    }
  },
  
  {
    name: 'Environment Variables Template',
    test: () => {
      if (!fileExists('.env.vercel.example')) {
        return { pass: false, message: '.env.vercel.example not found' };
      }
      
      const content = fs.readFileSync(path.join(projectRoot, '.env.vercel.example'), 'utf8');
      
      // Check for essential environment variables
      const requiredVars = [
        'OPENAI_API_KEY',
        'ALLOWED_ORIGINS',
        'VOICE_AGENT_RATE_LIMIT',
        'PUBLIC_SITE_URL'
      ];
      
      const missingVars = requiredVars.filter(varName => !content.includes(varName));
      
      if (missingVars.length > 0) {
        return { pass: false, message: `Missing environment variables: ${missingVars.join(', ')}` };
      }
      
      return { pass: true, message: 'Environment variables template is complete' };
    }
  },
  
  {
    name: 'Deployment Script',
    test: () => {
      if (!fileExists('scripts/deploy-vercel.sh')) {
        return { pass: false, message: 'deploy-vercel.sh script not found' };
      }
      
      const stats = fs.statSync(path.join(projectRoot, 'scripts/deploy-vercel.sh'));
      if (!(stats.mode & parseInt('111', 8))) {
        return { pass: false, message: 'deploy-vercel.sh is not executable' };
      }
      
      const content = fs.readFileSync(path.join(projectRoot, 'scripts/deploy-vercel.sh'), 'utf8');
      
      // Check for essential script components
      const checks = [
        { pattern: /vercel deploy/, name: 'Vercel deploy command' },
        { pattern: /#!\/bin\/bash/, name: 'Bash shebang' },
        { pattern: /set -euo pipefail/, name: 'Error handling' },
      ];
      
      for (const check of checks) {
        if (!check.pattern.test(content)) {
          return { pass: false, message: `Missing ${check.name}` };
        }
      }
      
      return { pass: true, message: 'Deployment script is valid and executable' };
    }
  },
  
  {
    name: 'Voice Agent API Structure',
    test: () => {
      const apiPath = 'src/pages/api';
      if (!fileExists(apiPath)) {
        return { pass: false, message: 'API directory not found' };
      }
      
      // Check for voice agent API files
      const voiceApiPath = path.join(projectRoot, apiPath);
      let hasVoiceAgent = false;
      
      try {
        const apiFiles = fs.readdirSync(voiceApiPath, { recursive: true });
        hasVoiceAgent = apiFiles.some(file => 
          file.toString().includes('voice') || file.toString().includes('openai')
        );
      } catch (error) {
        return { pass: false, message: 'Could not read API directory' };
      }
      
      if (!hasVoiceAgent) {
        return { pass: false, message: 'No voice agent API files found' };
      }
      
      // Check for health endpoint
      if (!fileExists('src/pages/api/health.ts')) {
        return { pass: false, message: 'Health check endpoint not found' };
      }
      
      return { pass: true, message: 'Voice agent API structure is valid' };
    }
  },
  
  {
    name: 'Migration Documentation',
    test: () => {
      if (!fileExists('VERCEL_MIGRATION.md')) {
        return { pass: false, message: 'VERCEL_MIGRATION.md not found' };
      }
      
      const content = fs.readFileSync(path.join(projectRoot, 'VERCEL_MIGRATION.md'), 'utf8');
      
      // Check for essential sections
      const requiredSections = [
        'Migration Steps',
        'Environment Variables',
        'Testing Migration',
        'Troubleshooting'
      ];
      
      const missingSections = requiredSections.filter(section => 
        !content.includes(section)
      );
      
      if (missingSections.length > 0) {
        return { pass: false, message: `Missing documentation sections: ${missingSections.join(', ')}` };
      }
      
      return { pass: true, message: 'Migration documentation is complete' };
    }
  }
];

// Run all validation tests
async function runValidation() {
  log('\n🔍 Vercel Configuration Validation', 'bright');
  log('=' .repeat(50), 'blue');
  
  let passedTests = 0;
  let totalTests = validationTests.length;
  
  for (const test of validationTests) {
    try {
      const result = await test.test();
      
      if (result.pass) {
        logSuccess(`${test.name}: ${result.message}`);
        passedTests++;
      } else {
        logError(`${test.name}: ${result.message}`);
      }
    } catch (error) {
      logError(`${test.name}: Test failed with error - ${error.message}`);
    }
  }
  
  log('\n' + '=' .repeat(50), 'blue');
  
  if (passedTests === totalTests) {
    logSuccess(`All ${totalTests} validation tests passed! ✨`);
    logInfo('Your Vercel configuration is ready for deployment.');
    process.exit(0);
  } else {
    logError(`${totalTests - passedTests} of ${totalTests} tests failed.`);
    logWarning('Please fix the issues above before deploying to Vercel.');
    process.exit(1);
  }
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runValidation().catch(error => {
    logError(`Validation script failed: ${error.message}`);
    process.exit(1);
  });
}

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-dev-20250816-vercel-migration
 * @timestamp: 2025-08-16T15:35:00Z
 * @reasoning:
 * - **Objective:** Complete Vercel configuration validation script
 * - **Strategy:** Comprehensive validation of all migration components
 * - **Outcome:** Reliable pre-deployment validation tool
 */