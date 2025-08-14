#!/usr/bin/env node

/**
 * Development Utility: Clear Rate Limits
 * 
 * This script helps developers clear rate limits during development.
 * Usage:
 *   node scripts/clear-rate-limits.js [action] [target]
 * 
 * Actions:
 *   - clear-all: Clear all rate limits (default)
 *   - clear-ip <ip>: Clear rate limit for specific IP
 *   - clear-suspicious <ip>: Remove IP from suspicious list
 *   - status: Show current rate limiter status
 */

import http from 'http';
import https from 'https';

// Configuration
const DEV_SERVER_URL = process.env.DEV_SERVER_URL || 'http://localhost:4321';
const ENDPOINT = '/api/dev/clear-rate-limits';

// Parse command line arguments
const args = process.argv.slice(2);
const action = args[0] || 'clear-all';
const target = args[1];

// Validate arguments
const validActions = ['clear-all', 'clear-ip', 'clear-suspicious', 'status'];
if (!validActions.includes(action)) {
  console.error(`❌ Invalid action: ${action}`);
  console.error(`Valid actions: ${validActions.join(', ')}`);
  process.exit(1);
}

if (['clear-ip', 'clear-suspicious'].includes(action) && !target) {
  console.error(`❌ Action ${action} requires a target IP address`);
  console.error(`Example: node scripts/clear-rate-limits.js ${action} 127.0.0.1`);
  process.exit(1);
}

// Prepare request data
const requestData = JSON.stringify({
  action,
  ...(target && { target })
});

// Parse URL
const url = new URL(DEV_SERVER_URL + ENDPOINT);
const isHttps = url.protocol === 'https:';
const client = isHttps ? https : http;

// Request options
const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestData)
  }
};

console.log(`🔧 Clearing rate limits: ${action}${target ? ` for ${target}` : ''}`);
console.log(`📡 Connecting to: ${DEV_SERVER_URL}${ENDPOINT}`);

// Make the request
const req = client.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.success) {
        console.log(`✅ ${response.message}`);
        
        if (response.stats) {
          console.log(`📊 Current stats:`, response.stats);
        }
        
        if (response.action === 'status' && response.stats) {
          console.log(`📈 Total entries: ${response.stats.totalEntries}`);
          console.log(`🚨 Suspicious IPs: ${response.stats.suspiciousIPs}`);
        }
      } else {
        console.error(`❌ ${response.message || response.error}`);
        
        if (response.availableActions) {
          console.error(`Available actions: ${response.availableActions.join(', ')}`);
        }
        
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Failed to parse response:', error.message);
      console.error('Raw response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  
  if (error.code === 'ECONNREFUSED') {
    console.error('💡 Make sure your development server is running on', DEV_SERVER_URL);
    console.error('💡 You can set a different URL with DEV_SERVER_URL environment variable');
  }
  
  process.exit(1);
});

// Send the request
req.write(requestData);
req.end();