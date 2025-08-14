#!/usr/bin/env node

/**
 * OpenAI Realtime API Verification Script
 * Tests the new session creation endpoint format according to official documentation
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

function logSuccess(message) {
  log(colors.green, `✅ ${message}`);
}

function logError(message) {
  log(colors.red, `❌ ${message}`);
}

function logInfo(message) {
  log(colors.blue, `ℹ️  ${message}`);
}

function logWarning(message) {
  log(colors.yellow, `⚠️  ${message}`);
}

/**
 * Load environment variables
 */
function loadEnvVars() {
  try {
    const envContent = readFileSync(join(projectRoot, '.env'), 'utf-8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return envVars;
  } catch (error) {
    logWarning('Could not load .env file. Make sure OPENAI_API_KEY is set in environment.');
    return {};
  }
}

/**
 * Test OpenAI Realtime API session creation
 */
async function testRealtimeAPI(apiKey) {
  logInfo('Testing OpenAI Realtime API session creation...');
  
  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        modalities: ['audio', 'text'],
        instructions: 'You are a helpful AI assistant for testing purposes.',
      }),
    });

    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      logError(`Failed to parse response: ${responseText}`);
      return {
        success: false,
        status: response.status,
        error: 'Invalid JSON response'
      };
    }

    if (response.ok) {
      logSuccess('Realtime API session created successfully!');
      
      // Validate response structure
      const hasClientSecret = data.client_secret && data.client_secret.value;
      const hasExpiresAt = data.client_secret && data.client_secret.expires_at;
      const hasSessionId = data.id;
      
      if (hasClientSecret && hasExpiresAt && hasSessionId) {
        logSuccess(`Session ID: ${data.id}`);
        logSuccess(`Client Secret: ${data.client_secret.value.substring(0, 15)}...`);
        logSuccess(`Expires At: ${new Date(data.client_secret.expires_at * 1000).toISOString()}`);
        
        return {
          success: true,
          status: response.status,
          sessionId: data.id,
          token: data.client_secret.value,
          expiresAt: data.client_secret.expires_at
        };
      } else {
        logWarning('Response structure is not as expected');
        console.log('Response data:', JSON.stringify(data, null, 2));
        return {
          success: false,
          status: response.status,
          error: 'Unexpected response structure'
        };
      }
    } else {
      logError(`API request failed with status ${response.status}`);
      
      if (response.status === 401) {
        logError('Authentication failed - check your API key');
      } else if (response.status === 403) {
        logError('Access forbidden - Realtime API may not be available on your tier');
      } else if (response.status === 404) {
        logError('Endpoint not found - Realtime API may not be available');
      }
      
      console.log('Error details:', data);
      
      return {
        success: false,
        status: response.status,
        error: data.error?.message || data.message || 'Unknown error'
      };
    }
  } catch (error) {
    logError(`Network error: ${error.message}`);
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
}

/**
 * Test our local token endpoint
 */
async function testLocalEndpoint() {
  logInfo('Testing local token endpoint...');
  
  try {
    const response = await fetch('http://localhost:4321/api/voice-agent/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:4321'
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      logSuccess(`Local endpoint working - Mode: ${data.mode}`);
      if (data.warnings && data.warnings.length > 0) {
        data.warnings.forEach(warning => logWarning(warning));
      }
      return { success: true, data };
    } else {
      logError(`Local endpoint failed: ${data.error}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    logWarning(`Local endpoint not available: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Main verification function
 */
async function main() {
  console.log(`${colors.bold}${colors.blue}🔬 OpenAI Realtime API Verification${colors.reset}\n`);
  
  // Load environment variables
  const envVars = loadEnvVars();
  const apiKey = envVars.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logError('OPENAI_API_KEY not found in environment or .env file');
    logInfo('Please set your OpenAI API key:');
    logInfo('  export OPENAI_API_KEY="your-api-key-here"');
    logInfo('  or add it to your .env file');
    process.exit(1);
  }
  
  logInfo(`Using API key: ${apiKey.substring(0, 10)}...`);
  
  // Test OpenAI Realtime API directly
  console.log(`\n${colors.bold}Direct API Test:${colors.reset}`);
  const directResult = await testRealtimeAPI(apiKey);
  
  if (directResult.success) {
    logSuccess('✨ OpenAI Realtime API is working correctly!');
    logInfo('Your API key has access to the Realtime API');
  } else {
    if (directResult.status === 403 || directResult.status === 404) {
      logWarning('Realtime API not available on your current OpenAI tier');
      logInfo('This is normal for most users - the app will use fallback mode');
    } else {
      logError('Direct API test failed');
    }
  }
  
  // Test local endpoint
  console.log(`\n${colors.bold}Local Endpoint Test:${colors.reset}`);
  const localResult = await testLocalEndpoint();
  
  if (localResult.success) {
    logSuccess('Local token endpoint is working');
  } else {
    logInfo('Start your dev server with "npm run dev" to test the local endpoint');
  }
  
  // Summary
  console.log(`\n${colors.bold}Summary:${colors.reset}`);
  if (directResult.success) {
    log(colors.green, '🎉 You have full Realtime API access!');
  } else if (directResult.status === 403 || directResult.status === 404) {
    log(colors.yellow, '⚡ Fallback mode will be used (Chat API + TTS)');
    log(colors.blue, 'This provides similar functionality with slightly higher latency');
  } else {
    log(colors.red, '🔧 API configuration needs attention');
  }
}

// Run verification
main().catch(error => {
  logError(`Verification failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});