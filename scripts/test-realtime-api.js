#!/usr/bin/env node

/**
 * Test script to verify OpenAI Realtime API access
 * This tests if the API key has proper access to create ephemeral tokens
 */

import fetch from 'node-fetch';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read API key from .env.local
const envPath = join(dirname(__dirname), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const apiKeyMatch = envContent.match(/OPENAI_API_KEY=(.+)/);

if (!apiKeyMatch) {
  console.error('❌ OPENAI_API_KEY not found in .env.local');
  process.exit(1);
}

const OPENAI_API_KEY = apiKeyMatch[1].trim();
console.log('🔑 API Key found (first 10 chars):', OPENAI_API_KEY.substring(0, 10) + '...');

async function testRealtimeAPI() {
  console.log('\n🧪 Testing OpenAI Realtime API access...\n');

  try {
    // Test 1: Create a session (generate ephemeral token)
    console.log('1️⃣ Testing session creation...');
    const sessionResponse = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'realtime=v1'
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        modalities: ['audio', 'text'],
        instructions: 'You are a helpful assistant.'
      })
    });

    const statusCode = sessionResponse.status;
    console.log('   Response status:', statusCode);

    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      console.log('   ✅ Session created successfully!');
      console.log('   Session ID:', sessionData.id);
      console.log('   Model:', sessionData.model);
      console.log('   Ephemeral token:', sessionData.client_secret?.value?.substring(0, 20) + '...');
      console.log('   Expires at:', new Date(sessionData.client_secret?.expires_at * 1000).toISOString());
      
      // Test 2: Try to get models
      console.log('\n2️⃣ Testing models endpoint...');
      const modelsResponse = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        }
      });

      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        const realtimeModels = modelsData.data.filter(m => m.id.includes('realtime'));
        console.log('   ✅ Models endpoint accessible');
        console.log('   Realtime models found:', realtimeModels.length);
        realtimeModels.forEach(m => console.log('   -', m.id));
      }

      console.log('\n✅ SUCCESS: Your API key has access to the Realtime API!');
      
    } else {
      const errorText = await sessionResponse.text();
      console.log('   ❌ Failed to create session');
      console.log('   Error response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      if (statusCode === 401) {
        console.log('\n❌ AUTHENTICATION ERROR: API key is invalid or expired');
      } else if (statusCode === 403) {
        console.log('\n❌ ACCESS DENIED: Your API key does not have access to the Realtime API');
        console.log('   This typically means your OpenAI account tier does not include Realtime API access');
      } else if (statusCode === 404) {
        console.log('\n❌ NOT FOUND: The Realtime API endpoint was not found');
        console.log('   This might indicate the API is not available in your region');
      } else if (statusCode === 400) {
        if (errorData.error?.code === 'model_not_found') {
          console.log('\n❌ MODEL NOT AVAILABLE: The Realtime model is not available on your tier');
        } else {
          console.log('\n❌ BAD REQUEST:', errorData.error?.message || errorText);
        }
      } else {
        console.log('\n❌ UNEXPECTED ERROR:', errorData.error?.message || errorText);
      }

      // Test regular API access
      console.log('\n3️⃣ Testing regular Chat API access...');
      const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Say hello' }],
          max_tokens: 10
        })
      });

      if (chatResponse.ok) {
        console.log('   ✅ Regular Chat API works fine');
        console.log('\n💡 RECOMMENDATION: Use fallback mode (Chat API + TTS) instead of Realtime API');
      } else {
        console.log('   ❌ Chat API also failed - check your API key');
      }
    }

  } catch (error) {
    console.error('\n❌ Network or other error:', error.message);
  }
}

// Run the test
testRealtimeAPI().catch(console.error);