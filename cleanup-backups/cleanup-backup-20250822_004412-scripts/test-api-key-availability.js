#!/usr/bin/env node

/**
 * Test if the API key is available to the server
 */

// Test 1: Check if API key is set in current shell
console.log('🔍 Testing API Key Availability\n');

console.log('1. Current Shell Environment:');
console.log('   OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set');

// Test 2: Check if .env file exists and is readable
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
console.log('\n2. .env File:');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasApiKey = envContent.includes('OPENAI_API_KEY=');
  console.log('   Contains OPENAI_API_KEY:', hasApiKey ? '✅ Yes' : '❌ No');
} else {
  console.log('   ❌ .env file does not exist');
}

// Test 3: Direct test of the API endpoint
console.log('\n3. Testing API Endpoint:');
import fetch from 'node-fetch';

async function testEndpoint() {
  try {
    const response = await fetch('http://localhost:4321/api/voice-agent/responses-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'test query' })
    });
    
    const data = await response.json();
    console.log('   Response status:', response.status);
    console.log('   Has error about API key?:', data.error?.includes('API key') ? '❌ Yes' : '✅ No');
    console.log('   Is fallback response?:', data.response?.includes('having trouble accessing') ? '❌ Yes' : '✅ No');
    
    if (data.error) {
      console.log('   Error:', data.error);
    }
  } catch (error) {
    console.log('   ❌ Failed to connect:', error.message);
  }
}

await testEndpoint();

console.log('\n📝 Summary:');
console.log('If the server is running without the API key, you need to:');
console.log('1. Stop the server (Ctrl+C)');
console.log('2. Start it again with: npm run dev');
console.log('3. The .env file will be loaded automatically by Astro');