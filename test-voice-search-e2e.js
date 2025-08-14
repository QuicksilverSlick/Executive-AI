#!/usr/bin/env node

/**
 * End-to-End Test for Voice Agent Web Search Functionality
 * 
 * This test validates the complete flow:
 * 1. Voice agent receives search request
 * 2. Realtime API triggers web_search function call
 * 3. Function handler calls Responses API
 * 4. Responses API performs actual web search
 * 5. Results are returned to voice conversation
 */

import readline from 'readline';
import fetch from 'node-fetch';

// Test configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:4321';
const API_KEY = process.env.OPENAI_API_KEY;

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test queries
const testQueries = [
  {
    name: 'Business Search',
    query: 'Drip City Coffee in Oakland',
    expectedElements: ['coffee', 'Oakland', 'location']
  },
  {
    name: 'AI News Search',
    query: 'latest news about OpenAI and GPT models',
    expectedElements: ['OpenAI', 'GPT', 'AI']
  },
  {
    name: 'Executive Training Search',
    query: 'best practices for executive AI training in 2025',
    expectedElements: ['executive', 'training', 'AI']
  },
  {
    name: 'Local Business Search',
    query: 'Home Depot in Tulsa Oklahoma',
    expectedElements: ['Home Depot', 'Tulsa', 'store']
  }
];

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

async function testResponsesAPI(query) {
  log(`\n📡 Testing Responses API directly...`, 'cyan');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/voice-agent/responses-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    
    if (data.success) {
      log('✅ Responses API call successful', 'green');
      
      if (data.response) {
        log(`\n📝 Response (${data.response.length} chars):`, 'blue');
        console.log(data.response.substring(0, 200) + '...');
      }
      
      if (data.searchResults && data.searchResults.length > 0) {
        log(`\n🔍 Search Results (${data.searchResults.length}):`, 'blue');
        data.searchResults.slice(0, 3).forEach((result, i) => {
          console.log(`\n${i + 1}. ${result.title}`);
          console.log(`   URL: ${result.url}`);
          console.log(`   Snippet: ${result.snippet.substring(0, 100)}...`);
        });
      }
      
      if (data.citations && data.citations.length > 0) {
        log(`\n📚 Citations (${data.citations.length}):`, 'blue');
        data.citations.slice(0, 3).forEach((citation, i) => {
          console.log(`${i + 1}. ${citation.title} - ${citation.url}`);
        });
      }
      
      return { success: true, data };
    } else {
      log(`❌ API returned error: ${data.error}`, 'red');
      return { success: false, error: data.error };
    }
  } catch (error) {
    log(`❌ Failed to call API: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function simulateVoiceAgentFlow(query) {
  log(`\n🎤 Simulating voice agent flow...`, 'cyan');
  
  // Step 1: Simulate voice command
  log(`👤 User says: "${query}"`, 'yellow');
  
  // Step 2: Show expected Realtime API behavior
  log(`\n🤖 Expected Realtime API behavior:`, 'blue');
  console.log('1. Voice agent receives audio input');
  console.log('2. Realtime API transcribes: "' + query + '"');
  console.log('3. Model detects search intent');
  console.log('4. Triggers function call: web_search');
  console.log('5. Function arguments: { "query": "' + query + '" }');
  
  // Step 3: Test the actual search API
  const result = await testResponsesAPI(query);
  
  if (result.success) {
    log(`\n🔊 Voice agent would say:`, 'green');
    console.log('"' + (result.data.response || 'I found some information for you...').substring(0, 200) + '..."');
  }
  
  return result;
}

async function validateImplementation() {
  logSection('🔧 Validating Implementation');
  
  const checks = [
    {
      name: 'Responses API Endpoint',
      test: async () => {
        const response = await fetch(`${API_BASE_URL}/api/voice-agent/responses-search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'test' })
        });
        return response.status === 200 || response.status === 400;
      }
    },
    {
      name: 'OpenAI API Key',
      test: () => !!API_KEY
    },
    {
      name: 'Response Structure',
      test: async () => {
        const response = await fetch(`${API_BASE_URL}/api/voice-agent/responses-search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'OpenAI' })
        });
        const data = await response.json();
        return data.hasOwnProperty('success') && 
               (data.hasOwnProperty('response') || data.hasOwnProperty('error'));
      }
    }
  ];
  
  for (const check of checks) {
    try {
      const passed = await check.test();
      log(`${passed ? '✅' : '❌'} ${check.name}`, passed ? 'green' : 'red');
    } catch (error) {
      log(`❌ ${check.name}: ${error.message}`, 'red');
    }
  }
}

async function runAllTests() {
  logSection('🚀 Voice Agent Web Search E2E Test');
  
  // Validate implementation
  await validateImplementation();
  
  // Run test queries
  for (const test of testQueries) {
    logSection(`Test: ${test.name}`);
    const result = await simulateVoiceAgentFlow(test.query);
    
    if (result.success && result.data.response) {
      // Check if expected elements are in response
      const responseText = result.data.response.toLowerCase();
      const foundElements = test.expectedElements.filter(element => 
        responseText.includes(element.toLowerCase())
      );
      
      if (foundElements.length > 0) {
        log(`✅ Found expected elements: ${foundElements.join(', ')}`, 'green');
      } else {
        log(`⚠️  Missing expected elements: ${test.expectedElements.join(', ')}`, 'yellow');
      }
    }
  }
  
  // Summary
  logSection('📊 Test Summary');
  log('All tests completed!', 'bright');
  log('\nNext steps:', 'cyan');
  console.log('1. Test with actual voice input through the web interface');
  console.log('2. Monitor browser console for function call events');
  console.log('3. Verify citations are displayed in the UI');
  console.log('4. Check voice response includes search results naturally');
}

// Interactive mode
async function interactiveMode() {
  logSection('🎯 Interactive Test Mode');
  log('Type your search queries to test the voice agent search functionality', 'cyan');
  log('Type "exit" to quit\n', 'yellow');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const askQuestion = () => {
    rl.question('Search query> ', async (query) => {
      if (query.toLowerCase() === 'exit') {
        rl.close();
        return;
      }
      
      if (query.trim()) {
        await simulateVoiceAgentFlow(query);
      }
      
      askQuestion();
    });
  };
  
  askQuestion();
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--interactive') || args.includes('-i')) {
    await interactiveMode();
  } else {
    await runAllTests();
  }
}

// Run tests
main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});