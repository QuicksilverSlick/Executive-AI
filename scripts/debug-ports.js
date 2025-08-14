#!/usr/bin/env node

/**
 * Debug script to check port configuration and test both 4321 and 4322
 */

import { readFileSync } from 'fs';

console.log('🔍 Port Configuration Debug');
console.log('===========================\n');

// Check .env.local
try {
  const envContent = readFileSync('.env.local', 'utf8');
  const allowedOrigins = envContent.match(/ALLOWED_ORIGINS=(.+)/)?.[1];
  console.log('📁 .env.local ALLOWED_ORIGINS:', allowedOrigins);
} catch (error) {
  console.log('❌ Could not read .env.local:', error.message);
}

// Test both ports
async function testPort(port) {
  const url = `http://localhost:${port}/api/voice-agent/health`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(`✅ Port ${port}: ${data.status} (${response.status})`);
    return true;
  } catch (error) {
    console.log(`❌ Port ${port}: ${error.message}`);
    return false;
  }
}

console.log('\n🌐 Testing server availability:');
await testPort(4321);
await testPort(4322);

console.log('\n💡 If you get 403 errors:');
console.log('1. Make sure ALLOWED_ORIGINS includes your client port');
console.log('2. Check that Origin header matches an allowed origin');
console.log('3. Verify the server is running on the expected port');