/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Test the fixed OpenAI Responses API web search implementation
 * @version: 1.0.0
 * @author: engineer-agent
 * @reasoning:
 * - **Objective:** Validate that the Responses API now returns actual search results
 * - **Strategy:** Test the corrected tool configuration and response parsing
 * - **Outcome:** Verify search results and citations are properly extracted
 */

import fetch from 'node-fetch';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4321';
const RESPONSES_API_ENDPOINT = `${API_BASE_URL}/api/voice-agent/responses-search`;

async function testResponsesAPIFix() {
  console.log('🔍 Testing Fixed OpenAI Responses API Implementation');
  console.log(`📡 Testing endpoint: ${RESPONSES_API_ENDPOINT}`);
  console.log('-'.repeat(60));

  try {
    // Test with a current events query that should trigger web search
    const testQuery = 'Latest developments in artificial intelligence 2025';
    
    console.log(`🚀 Testing query: "${testQuery}"`);
    
    const response = await fetch(RESPONSES_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: testQuery
      })
    });

    console.log(`📥 Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const data = await response.json();
    
    console.log('\n📊 RESPONSE ANALYSIS:');
    console.log(`✅ Success: ${data.success}`);
    console.log(`📝 Has response text: ${!!data.response}`);
    console.log(`🔍 Search results count: ${data.searchResults ? data.searchResults.length : 0}`);
    console.log(`🔗 Citations count: ${data.citations ? data.citations.length : 0}`);

    if (data.response) {
      console.log('\n📄 Response Text (first 200 chars):');
      console.log(data.response.substring(0, 200) + '...');
    }

    if (data.searchResults && data.searchResults.length > 0) {
      console.log('\n🔍 Search Results:');
      data.searchResults.forEach((result, index) => {
        console.log(`${index + 1}. ${result.title}`);
        console.log(`   URL: ${result.url}`);
        console.log(`   Source: ${result.source}`);
        console.log(`   Snippet: ${result.snippet.substring(0, 100)}...`);
        console.log('');
      });
    }

    if (data.citations && data.citations.length > 0) {
      console.log('\n🔗 Citations:');
      data.citations.forEach((citation, index) => {
        console.log(`${index + 1}. ${citation.title || 'Untitled'}`);
        console.log(`   URL: ${citation.url}`);
        console.log(`   Text range: ${citation.start_index}-${citation.end_index}`);
        console.log('');
      });
    }

    // Validate the fix was successful
    if (data.success && (data.searchResults?.length > 0 || data.citations?.length > 0)) {
      console.log('✅ FIX SUCCESSFUL: The Responses API is now returning actual search results!');
    } else {
      console.log('⚠️  FIX INCOMPLETE: The API responded but may not have search results yet.');
      console.log('   This could be due to:');
      console.log('   - The query not triggering web search');
      console.log('   - API rate limiting');
      console.log('   - Model not using the web search tool');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if server is running first
async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/`, { timeout: 5000 });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking server health...');
  const serverRunning = await checkServerHealth();
  
  if (!serverRunning) {
    console.log(`❌ Server not running at ${API_BASE_URL}`);
    console.log('💡 Please start the development server with: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running\n');
  
  await testResponsesAPIFix();
}

main().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});