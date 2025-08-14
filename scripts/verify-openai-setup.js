#!/usr/bin/env node

/**
 * OpenAI API Key Verification Script
 * Tests the OpenAI API key configuration and token generation endpoint
 */

import { readFileSync } from 'fs';
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
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`${colors.blue}[${step}]${colors.reset} ${message}`);
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

/**
 * Load environment variables from .env.local
 */
function loadEnvFile() {
  try {
    const envPath = join(projectRoot, '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      }
    });
    
    return envVars;
  } catch (error) {
    logError(`Failed to load .env.local: ${error.message}`);
    return null;
  }
}

/**
 * Validate OpenAI API Key format
 */
function validateApiKeyFormat(apiKey) {
  if (!apiKey) {
    return { valid: false, reason: 'API key is empty or undefined' };
  }
  
  if (!apiKey.startsWith('sk-')) {
    return { valid: false, reason: 'API key must start with "sk-"' };
  }
  
  if (apiKey.length < 50) {
    return { valid: false, reason: 'API key appears to be too short' };
  }
  
  return { valid: true };
}

/**
 * Test OpenAI API connectivity
 */
async function testOpenAIConnection(apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: await response.text()
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      modelsCount: data.data?.length || 0
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test ephemeral token generation
 */
async function testTokenGeneration(apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview',
        voice: 'alloy',
        expires_at: Math.floor(Date.now() / 1000) + 60, // 1 minute
      }),
    });
    
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: await response.text()
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      tokenPreview: data.client_secret?.value?.substring(0, 10) + '...',
      expiresAt: new Date(data.expires_at * 1000).toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check security configuration
 */
function checkSecurityConfig(envVars) {
  const checks = [];
  
  // Check if .env.local exists and API key is not in .env.example
  checks.push({
    name: 'Environment file security',
    passed: !!envVars && envVars.OPENAI_API_KEY && !envVars.OPENAI_API_KEY.includes('your-openai-api-key-here'),
    message: envVars ? 'API key properly configured in .env.local' : 'No .env.local file found'
  });
  
  // Check rate limiting configuration
  checks.push({
    name: 'Rate limiting',
    passed: envVars?.VOICE_AGENT_RATE_LIMIT && parseInt(envVars.VOICE_AGENT_RATE_LIMIT) > 0,
    message: `Rate limit set to ${envVars?.VOICE_AGENT_RATE_LIMIT || 'undefined'} requests/minute`
  });
  
  // Check token duration
  checks.push({
    name: 'Token duration',
    passed: envVars?.VOICE_AGENT_TOKEN_DURATION && parseInt(envVars.VOICE_AGENT_TOKEN_DURATION) <= 300,
    message: `Token duration set to ${envVars?.VOICE_AGENT_TOKEN_DURATION || 'undefined'} seconds`
  });
  
  // Check allowed origins
  checks.push({
    name: 'CORS configuration',
    passed: envVars?.ALLOWED_ORIGINS && envVars.ALLOWED_ORIGINS.includes('localhost'),
    message: `Allowed origins: ${envVars?.ALLOWED_ORIGINS || 'undefined'}`
  });
  
  return checks;
}

/**
 * Main verification function
 */
async function main() {
  console.log(`${colors.bold}${colors.blue}🔐 OpenAI API Key Verification${colors.reset}\n`);
  
  // Step 1: Load environment variables
  logStep('1/6', 'Loading environment configuration...');
  const envVars = loadEnvFile();
  if (!envVars) {
    logError('Cannot proceed without .env.local file');
    process.exit(1);
  }
  logSuccess('.env.local file loaded successfully');
  
  // Step 2: Validate API key format
  logStep('2/6', 'Validating API key format...');
  const formatCheck = validateApiKeyFormat(envVars.OPENAI_API_KEY);
  if (!formatCheck.valid) {
    logError(`Invalid API key format: ${formatCheck.reason}`);
    process.exit(1);
  }
  logSuccess('API key format is valid');
  
  // Step 3: Test OpenAI connection
  logStep('3/6', 'Testing OpenAI API connectivity...');
  const connectionTest = await testOpenAIConnection(envVars.OPENAI_API_KEY);
  if (!connectionTest.success) {
    logError(`OpenAI API connection failed: ${connectionTest.error || 'Unknown error'}`);
    if (connectionTest.status === 401) {
      logError('Invalid API key - please check your OpenAI API key');
    }
    process.exit(1);
  }
  logSuccess(`OpenAI API connection successful (${connectionTest.modelsCount} models available)`);
  
  // Step 4: Test token generation
  logStep('4/6', 'Testing ephemeral token generation...');
  const tokenTest = await testTokenGeneration(envVars.OPENAI_API_KEY);
  if (!tokenTest.success) {
    logError(`Token generation failed: ${tokenTest.error || 'Unknown error'}`);
    if (tokenTest.status === 400) {
      logWarning('Realtime API may not be available on your account tier');
    }
  } else {
    logSuccess(`Token generation successful (token: ${tokenTest.tokenPreview}, expires: ${tokenTest.expiresAt})`);
  }
  
  // Step 5: Security configuration check
  logStep('5/6', 'Checking security configuration...');
  const securityChecks = checkSecurityConfig(envVars);
  securityChecks.forEach(check => {
    if (check.passed) {
      logSuccess(`${check.name}: ${check.message}`);
    } else {
      logWarning(`${check.name}: ${check.message}`);
    }
  });
  
  // Step 6: Final summary
  logStep('6/6', 'Verification complete');
  const allPassed = securityChecks.every(check => check.passed) && connectionTest.success;
  
  if (allPassed && tokenTest.success) {
    log(colors.green, `\n🎉 ${colors.bold}Setup Complete!${colors.reset}${colors.green} Your OpenAI API key is properly configured and working.`);
  } else if (allPassed && !tokenTest.success) {
    log(colors.yellow, `\n⚡ ${colors.bold}Partial Success!${colors.reset}${colors.yellow} API key works but Realtime API may not be available.`);
  } else {
    log(colors.red, `\n❌ ${colors.bold}Setup Issues Found${colors.reset}${colors.red} - Please review the warnings above.`);
  }
  
  console.log(`\n${colors.blue}Next steps:${colors.reset}`);
  console.log('1. Run: npm run dev');
  console.log('2. Test the voice agent at: http://localhost:4321');
  console.log('3. Check browser console for any authentication errors');
}

// Run verification
main().catch(error => {
  logError(`Verification failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});