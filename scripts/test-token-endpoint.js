#!/usr/bin/env node

/**
 * Local Token Endpoint Test Script
 * Tests the /api/voice-agent/token endpoint locally
 */

import { spawn } from 'child_process';
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

/**
 * Wait for server to be ready
 */
async function waitForServer(url, maxAttempts = 30, interval = 1000) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.status !== 500) { // Even 404 means server is running
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  return false;
}

/**
 * Test the token endpoint
 */
async function testTokenEndpoint(baseUrl) {
  const tests = [];
  
  // Test 1: Valid token request
  try {
    const response = await fetch(`${baseUrl}/api/voice-agent/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:4321' // Server supports both 4321 and 4322
      }
    });
    
    const data = await response.json();
    
    // Enhanced validation for new response format
    const hasValidStructure = data.success && data.token && data.expiresAt && data.sessionId && data.mode;
    const tokenPreview = data.token ? `${data.token.substring(0, 15)}...` : 'none';
    
    let details = '';
    if (response.ok) {
      details = `Token: ${tokenPreview}, Mode: ${data.mode}, Session: ${data.sessionId}`;
      if (data.warnings && data.warnings.length > 0) {
        details += `, Warnings: ${data.warnings.join(', ')}`;
      }
    } else {
      details = `Error: ${data.error}`;
    }
    
    tests.push({
      name: 'Token generation',
      passed: response.ok && hasValidStructure,
      details,
      status: response.status
    });
  } catch (error) {
    tests.push({
      name: 'Token generation',
      passed: false,
      details: `Request failed: ${error.message}`,
      status: 'ERROR'
    });
  }
  
  // Test 2: Invalid origin
  try {
    const response = await fetch(`${baseUrl}/api/voice-agent/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://malicious-site.com'
      }
    });
    
    const data = await response.json();
    
    tests.push({
      name: 'CORS protection',
      passed: !response.ok && response.status === 403,
      details: response.status === 403 ? 'Correctly blocked invalid origin' : `Unexpected response: ${response.status}`,
      status: response.status
    });
  } catch (error) {
    tests.push({
      name: 'CORS protection',
      passed: false,
      details: `Test failed: ${error.message}`,
      status: 'ERROR'
    });
  }
  
  // Test 3: OPTIONS request (CORS preflight)
  try {
    const response = await fetch(`${baseUrl}/api/voice-agent/token`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:4321'
      }
    });
    
    tests.push({
      name: 'CORS preflight',
      passed: response.ok && response.headers.get('Access-Control-Allow-Origin'),
      details: response.ok ? 'CORS headers present' : 'CORS preflight failed',
      status: response.status
    });
  } catch (error) {
    tests.push({
      name: 'CORS preflight',
      passed: false,
      details: `Test failed: ${error.message}`,
      status: 'ERROR'
    });
  }
  
  return tests;
}

/**
 * Test the health endpoint
 */
async function testHealthEndpoint(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/api/voice-agent/health`);
    const data = await response.json();
    
    return {
      name: 'Health check',
      passed: response.ok && data.status === 'healthy',
      details: response.ok ? `Service healthy (${data.uptime})` : `Health check failed: ${data.error}`,
      status: response.status
    };
  } catch (error) {
    return {
      name: 'Health check',
      passed: false,
      details: `Health check failed: ${error.message}`,
      status: 'ERROR'
    };
  }
}

/**
 * Start development server
 */
function startDevServer() {
  return new Promise((resolve, reject) => {
    logInfo('Starting development server...');
    
    const server = spawn('npm', ['run', 'dev'], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let serverReady = false;
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') && !serverReady) {
        serverReady = true;
        setTimeout(() => resolve(server), 2000); // Give it a moment to fully start
      }
    });
    
    server.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Error') || output.includes('error')) {
        console.error('Server error:', output);
      }
    });
    
    server.on('error', (error) => {
      reject(new Error(`Failed to start server: ${error.message}`));
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (!serverReady) {
        server.kill();
        reject(new Error('Server startup timeout'));
      }
    }, 30000);
  });
}

/**
 * Main test function
 */
async function main() {
  console.log(`${colors.bold}${colors.blue}🧪 Token Endpoint Test Suite${colors.reset}\n`);
  
  let server;
  
  try {
    // Start the development server
    server = await startDevServer();
    logSuccess('Development server started');
    
    // Wait for server to be fully ready
    logInfo('Waiting for server to be ready...');
    const serverReady = await waitForServer('http://localhost:4321');
    if (!serverReady) {
      throw new Error('Server failed to become ready');
    }
    logSuccess('Server is ready');
    
    // Test health endpoint first
    logInfo('Testing health endpoint...');
    const healthTest = await testHealthEndpoint('http://localhost:4321');
    if (healthTest.passed) {
      logSuccess(`${healthTest.name}: ${healthTest.details}`);
    } else {
      logError(`${healthTest.name}: ${healthTest.details}`);
    }
    
    // Test token endpoint
    logInfo('Testing token endpoint...');
    const tokenTests = await testTokenEndpoint('http://localhost:4321');
    
    console.log(`\n${colors.bold}Test Results:${colors.reset}`);
    let allPassed = healthTest.passed;
    
    [healthTest, ...tokenTests].forEach(test => {
      if (test.passed) {
        logSuccess(`${test.name}: ${test.details} (Status: ${test.status})`);
      } else {
        logError(`${test.name}: ${test.details} (Status: ${test.status})`);
        allPassed = false;
      }
    });
    
    if (allPassed) {
      log(colors.green, `\n🎉 ${colors.bold}All tests passed!${colors.reset}${colors.green} Your token endpoint is working correctly.`);
    } else {
      log(colors.red, `\n❌ ${colors.bold}Some tests failed${colors.reset}${colors.red} - Please check the configuration.`);
    }
    
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
    console.error(error);
  } finally {
    // Clean up: kill the server
    if (server) {
      logInfo('Stopping development server...');
      server.kill('SIGTERM');
      
      // Force kill after 5 seconds if graceful shutdown fails
      setTimeout(() => {
        try {
          server.kill('SIGKILL');
        } catch (e) {
          // Process might already be dead
        }
      }, 5000);
    }
  }
}

// Run tests
main().catch(error => {
  logError(`Test suite crashed: ${error.message}`);
  console.error(error);
  process.exit(1);
});