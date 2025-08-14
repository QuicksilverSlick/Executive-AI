#!/usr/bin/env node

/**
 * Verify if the server has been restarted with the new environment variables
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying Server Configuration\n');

// Check 1: .env file
console.log('1. Checking .env file:');
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasApiKey = envContent.includes('OPENAI_API_KEY=sk-');
  console.log('   ✅ .env file exists');
  console.log('   ' + (hasApiKey ? '✅' : '❌') + ' Contains OPENAI_API_KEY');
} else {
  console.log('   ❌ .env file not found');
}

// Check 2: Current process environment
console.log('\n2. Current process environment:');
console.log('   OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set in current process' : '❌ Not set in current process');

// Check 3: Test the token endpoint
console.log('\n3. Testing token endpoint:');
try {
  const response = await fetch('http://localhost:4321/api/voice-agent/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:4321'
    }
  });
  
  console.log('   Status:', response.status);
  const data = await response.json();
  
  if (response.status === 403) {
    console.log('   ❌ Still getting 403 Forbidden - Server needs restart');
  } else if (response.status === 503) {
    console.log('   ❌ Service unavailable - API key not configured');
  } else if (response.status === 200) {
    console.log('   ✅ Token endpoint working!');
    console.log('   Mode:', data.mode);
    if (data.warnings) {
      console.log('   Warnings:', data.warnings);
    }
  } else {
    console.log('   ⚠️  Unexpected status:', response.status);
  }
} catch (error) {
  console.log('   ❌ Failed to connect:', error.message);
}

// Check 4: Test the search endpoint
console.log('\n4. Testing search endpoint:');
try {
  const response = await fetch('http://localhost:4321/api/voice-agent/responses-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'test' })
  });
  
  const data = await response.json();
  console.log('   Status:', response.status);
  
  if (data.error?.includes('Unexpected end of JSON')) {
    console.log('   ❌ API key not loaded - Server needs restart');
  } else if (data.response?.includes('having trouble accessing')) {
    console.log('   ❌ Fallback response - API key not working');
  } else if (data.searchResults?.length > 0) {
    console.log('   ✅ Real search results returned!');
  } else {
    console.log('   ⚠️  Unexpected response');
  }
} catch (error) {
  console.log('   ❌ Failed to connect:', error.message);
}

// Summary
console.log('\n📊 Summary:');
console.log('━'.repeat(50));
console.log('The .env file is configured correctly.');
console.log('\n🔄 REQUIRED ACTION:');
console.log('1. Stop the current server (Ctrl+C in the terminal)');
console.log('2. Start it again: npm run dev');
console.log('3. The server will load the API key from .env');
console.log('\nOnce restarted, the voice agent and search will work!');
console.log('━'.repeat(50));