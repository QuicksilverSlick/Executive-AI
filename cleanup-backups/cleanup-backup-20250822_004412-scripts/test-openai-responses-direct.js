#!/usr/bin/env node

/**
 * Direct test of OpenAI Responses API
 * Tests the actual API endpoint to verify it exists and works
 */

import fetch from 'node-fetch';

async function testResponsesAPI() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY environment variable is not set');
    console.log('\nTo set it:');
    console.log('export OPENAI_API_KEY="your-api-key-here"');
    return;
  }

  console.log('🔍 Testing OpenAI Responses API directly...\n');

  const testQuery = 'What is OpenAI and how does it work?';
  
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        input: testQuery,
        tools: [{
          type: 'web_search',
          search_context_size: 'medium'
        }],
        tool_choice: { type: 'web_search' }
      })
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('\nRaw Response:', responseText);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('\n✅ Parsed Response:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('\n❌ JSON Parse Error:', parseError.message);
      }
    } else {
      console.error('\n❌ API Error:', responseText);
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

// Also test standard Chat Completions for comparison
async function testChatCompletions() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) return;
  
  console.log('\n\n🔍 Testing standard Chat Completions API for comparison...\n');
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'user', content: 'Say hello' }
        ],
        max_tokens: 50
      })
    });

    console.log('Chat Completions Status:', response.status);
    const data = await response.json();
    console.log('Chat Completions Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Chat Completions Error:', error.message);
  }
}

// Run tests
async function main() {
  await testResponsesAPI();
  await testChatCompletions();
}

main();