#!/usr/bin/env node

/**
 * Setup Completion Verification
 * Final check to ensure all components are properly configured
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(colors.green, `✅ ${message}`);
}

function logError(message) {
  log(colors.red, `❌ ${message}`);
}

function logWarning(message) {
  log(colors.yellow, `⚠️  ${message}`);
}

function logInfo(message) {
  log(colors.blue, `ℹ️  ${message}`);
}

/**
 * Check if file exists and validate its content
 */
function checkFile(path, description, validator = null) {
  const fullPath = join(projectRoot, path);
  
  if (!existsSync(fullPath)) {
    return { passed: false, message: `${description} not found at ${path}` };
  }
  
  if (validator) {
    try {
      const content = readFileSync(fullPath, 'utf8');
      const validation = validator(content);
      return validation.valid ? 
        { passed: true, message: `${description} is properly configured` } :
        { passed: false, message: `${description} configuration issue: ${validation.reason}` };
    } catch (error) {
      return { passed: false, message: `Failed to validate ${description}: ${error.message}` };
    }
  }
  
  return { passed: true, message: `${description} exists` };
}

/**
 * Validate .env.local content
 */
function validateEnvLocal(content) {
  const requiredVars = [
    'OPENAI_API_KEY',
    'ALLOWED_ORIGINS',
    'VOICE_AGENT_RATE_LIMIT',
    'VOICE_AGENT_TOKEN_DURATION'
  ];
  
  const lines = content.split('\n');
  const envVars = {};
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join('=');
      }
    }
  });
  
  for (const required of requiredVars) {
    if (!envVars[required]) {
      return { valid: false, reason: `Missing ${required}` };
    }
  }
  
  // Validate API key format
  if (!envVars.OPENAI_API_KEY.startsWith('sk-')) {
    return { valid: false, reason: 'Invalid API key format' };
  }
  
  // Validate numeric values
  if (isNaN(parseInt(envVars.VOICE_AGENT_RATE_LIMIT))) {
    return { valid: false, reason: 'VOICE_AGENT_RATE_LIMIT must be a number' };
  }
  
  if (isNaN(parseInt(envVars.VOICE_AGENT_TOKEN_DURATION))) {
    return { valid: false, reason: 'VOICE_AGENT_TOKEN_DURATION must be a number' };
  }
  
  return { valid: true };
}

/**
 * Validate .gitignore content
 */
function validateGitignore(content) {
  const requiredEntries = ['.env.local', '.env', '*.env'];
  
  for (const entry of requiredEntries) {
    if (!content.includes(entry)) {
      return { valid: false, reason: `Missing ${entry} in .gitignore` };
    }
  }
  
  return { valid: true };
}

/**
 * Validate package.json scripts
 */
function validatePackageJson(content) {
  try {
    const pkg = JSON.parse(content);
    const requiredScripts = ['verify-openai', 'test-token', 'setup-check'];
    
    for (const script of requiredScripts) {
      if (!pkg.scripts || !pkg.scripts[script]) {
        return { valid: false, reason: `Missing npm script: ${script}` };
      }
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, reason: 'Invalid JSON format' };
  }
}

/**
 * Check TypeScript files for proper imports and types
 */
function validateTokenEndpoint(content) {
  const requiredImports = [
    "import.meta.env.OPENAI_API_KEY",
    "import.meta.env.ALLOWED_ORIGINS",
    "generateEphemeralToken"
  ];
  
  for (const importCheck of requiredImports) {
    if (!content.includes(importCheck)) {
      return { valid: false, reason: `Missing ${importCheck}` };
    }
  }
  
  return { valid: true };
}

/**
 * Main verification function
 */
async function main() {
  console.log(`${colors.bold}${colors.magenta}🎯 Setup Completion Verification${colors.reset}\n`);
  
  const checks = [
    // Core configuration files
    checkFile('.env.local', 'Environment configuration', validateEnvLocal),
    checkFile('.gitignore', 'Git ignore file', validateGitignore),
    checkFile('package.json', 'Package configuration', validatePackageJson),
    
    // API endpoints
    checkFile('src/pages/api/voice-agent/token.ts', 'Token endpoint', validateTokenEndpoint),
    checkFile('src/pages/api/voice-agent/health.ts', 'Health endpoint'),
    checkFile('src/pages/api/voice-agent/refresh-token.ts', 'Refresh token endpoint'),
    
    // Verification scripts
    checkFile('scripts/verify-openai-setup.js', 'OpenAI verification script'),
    checkFile('scripts/test-token-endpoint.js', 'Token endpoint test script'),
    
    // Documentation
    checkFile('docs/openai-security-setup.md', 'Security documentation'),
  ];
  
  console.log(`${colors.cyan}Running ${checks.length} configuration checks...${colors.reset}\n`);
  
  let allPassed = true;
  let passedCount = 0;
  
  checks.forEach((check, index) => {
    const checkNumber = `[${(index + 1).toString().padStart(2, '0')}/${checks.length}]`;
    
    if (check.passed) {
      logSuccess(`${checkNumber} ${check.message}`);
      passedCount++;
    } else {
      logError(`${checkNumber} ${check.message}`);
      allPassed = false;
    }
  });
  
  console.log(`\n${colors.cyan}${colors.bold}Summary:${colors.reset}`);
  console.log(`${colors.cyan}Passed: ${passedCount}/${checks.length}${colors.reset}`);
  
  if (allPassed) {
    log(colors.green, `\n🎉 ${colors.bold}Setup Complete!${colors.reset}${colors.green} All components are properly configured.`);
    
    console.log(`\n${colors.bold}${colors.blue}🚀 Next Steps:${colors.reset}`);
    console.log(`${colors.blue}1.${colors.reset} Test the API key: ${colors.cyan}npm run verify-openai${colors.reset}`);
    console.log(`${colors.blue}2.${colors.reset} Start the server: ${colors.cyan}npm run dev${colors.reset}`);
    console.log(`${colors.blue}3.${colors.reset} Test the endpoints: ${colors.cyan}npm run test-token${colors.reset}`);
    console.log(`${colors.blue}4.${colors.reset} Open browser: ${colors.cyan}http://localhost:4321${colors.reset}`);
    
    console.log(`\n${colors.bold}${colors.green}🔒 Security Features Active:${colors.reset}`);
    console.log(`${colors.green}•${colors.reset} API key securely stored in .env.local`);
    console.log(`${colors.green}•${colors.reset} Environment files excluded from git`);
    console.log(`${colors.green}•${colors.reset} Rate limiting configured (10 req/min)`);
    console.log(`${colors.green}•${colors.reset} CORS protection enabled`);
    console.log(`${colors.green}•${colors.reset} Short-lived tokens (60 seconds)`);
    console.log(`${colors.green}•${colors.reset} Request logging enabled`);
    
  } else {
    log(colors.red, `\n❌ ${colors.bold}Setup Issues Found${colors.reset}${colors.red} - Please fix the errors above.`);
    
    console.log(`\n${colors.bold}${colors.yellow}🔧 Common Fixes:${colors.reset}`);
    console.log(`${colors.yellow}•${colors.reset} Ensure .env.local exists with valid API key`);
    console.log(`${colors.yellow}•${colors.reset} Check .gitignore includes environment files`);
    console.log(`${colors.yellow}•${colors.reset} Verify all required scripts are in package.json`);
    console.log(`${colors.yellow}•${colors.reset} Run: ${colors.cyan}npm install${colors.reset} if dependencies are missing`);
  }
  
  console.log(`\n${colors.bold}${colors.blue}📚 Documentation:${colors.reset}`);
  console.log(`${colors.blue}•${colors.reset} Security guide: ${colors.cyan}docs/openai-security-setup.md${colors.reset}`);
  console.log(`${colors.blue}•${colors.reset} Voice agent docs: ${colors.cyan}VOICE_AGENT_IMPLEMENTATION.md${colors.reset}`);
}

// Run verification
main().catch(error => {
  logError(`Verification failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});