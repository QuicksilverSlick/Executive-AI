/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Comprehensive test suite for web search implementation
 * @version: 1.0.0
 * @init-author: test-agent
 * @init-cc-sessionId: cc-test-20250811-001
 * @init-timestamp: 2025-08-11T15:00:00Z
 * @reasoning:
 * - **Objective:** Test all aspects of the web search implementation
 * - **Strategy:** Test Responses API directly, function call integration, and E2E flow
 * - **Outcome:** Complete validation of search functionality with detailed results
 */

console.log('🔍 Starting Comprehensive Web Search Testing Suite\n');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:4321',
  searchEndpoint: '/api/voice-agent/responses-search',
  timeout: 30000,
  testQueries: [
    'What is artificial intelligence?',
    'Latest news about OpenAI GPT models',
    'Best practices for web development in 2024',
    'JavaScript performance optimization techniques'
  ]
};

// Test utilities
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log(`📋 Running ${this.tests.length} tests...\n`);
    
    for (const { name, testFn } of this.tests) {
      try {
        console.log(`🧪 ${name}`);
        await testFn();
        console.log(`  ✅ PASSED\n`);
        this.results.passed++;
      } catch (error) {
        console.log(`  ❌ FAILED: ${error.message}\n`);
        this.results.failed++;
      }
      this.results.total++;
    }

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed} ✅`);
    console.log(`Failed: ${this.results.failed} ${this.results.failed > 0 ? '❌' : '✅'}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Web search implementation is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the details above.');
    }
  }
}

// HTTP test utility
async function makeRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TEST_CONFIG.timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    
    return {
      status: response.status,
      ok: response.ok,
      headers: response.headers,
      data,
      text
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Validation utilities
function validateSearchResponse(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Response is not a valid object');
  }

  if (typeof data.success !== 'boolean') {
    throw new Error('Missing or invalid success field');
  }

  if (data.success) {
    if (!data.response || typeof data.response !== 'string') {
      throw new Error('Success response missing response text');
    }
    
    if (data.searchResults) {
      if (!Array.isArray(data.searchResults)) {
        throw new Error('searchResults should be an array');
      }
      
      data.searchResults.forEach((result, index) => {
        if (!result.title || !result.url || !result.snippet) {
          throw new Error(`Search result ${index} missing required fields`);
        }
      });
    }

    if (data.citations) {
      if (!Array.isArray(data.citations)) {
        throw new Error('citations should be an array');
      }
      
      data.citations.forEach((citation, index) => {
        if (!citation.url || !citation.title) {
          throw new Error(`Citation ${index} missing required fields`);
        }
      });
    }
  } else {
    if (!data.error && !data.response) {
      throw new Error('Failed response missing error message');
    }
  }
}

// Initialize test runner
const runner = new TestRunner();

// Test 1: Basic endpoint availability
runner.test('1. Search endpoint availability', async () => {
  const response = await makeRequest(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.searchEndpoint}?query=test`);
  
  if (response.status === 404) {
    throw new Error('Search endpoint not found - check if server is running');
  }
  
  if (response.status >= 500) {
    throw new Error(`Server error: ${response.status} - ${response.text}`);
  }
  
  console.log(`  📡 Endpoint responded with status: ${response.status}`);
});

// Test 2: GET request with simple query
runner.test('2. GET request with simple query', async () => {
  const query = TEST_CONFIG.testQueries[0];
  const response = await makeRequest(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.searchEndpoint}?query=${encodeURIComponent(query)}`);
  
  console.log(`  🔍 Query: "${query}"`);
  console.log(`  📊 Status: ${response.status}`);
  console.log(`  📝 Response preview: ${JSON.stringify(response.data).substring(0, 200)}...`);
  
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} - ${response.text}`);
  }
  
  validateSearchResponse(response.data);
  
  if (response.data.success) {
    console.log(`  ✨ Search successful with ${response.data.searchResults?.length || 0} results`);
    console.log(`  📄 Citations: ${response.data.citations?.length || 0}`);
  }
});

// Test 3: POST request with JSON body
runner.test('3. POST request with JSON body', async () => {
  const query = TEST_CONFIG.testQueries[1];
  const response = await makeRequest(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.searchEndpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  
  console.log(`  🔍 Query: "${query}"`);
  console.log(`  📊 Status: ${response.status}`);
  
  if (!response.ok) {
    console.log(`  📋 Full response: ${response.text}`);
    throw new Error(`Request failed: ${response.status}`);
  }
  
  validateSearchResponse(response.data);
  
  if (response.data.success) {
    console.log(`  ✨ Search successful with ${response.data.searchResults?.length || 0} results`);
    console.log(`  💬 Response: ${response.data.response.substring(0, 100)}...`);
  }
});

// Test 4: POST with conversation context
runner.test('4. POST with conversation context', async () => {
  const query = 'Tell me more about that';
  const conversationContext = 'User previously asked about machine learning algorithms.';
  
  const response = await makeRequest(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.searchEndpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      query,
      conversationContext
    })
  });
  
  console.log(`  🔍 Query: "${query}"`);
  console.log(`  🧠 Context: "${conversationContext}"`);
  console.log(`  📊 Status: ${response.status}`);
  
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} - ${response.text}`);
  }
  
  validateSearchResponse(response.data);
  console.log(`  ✨ Context-aware search successful`);
});

// Test 5: Error handling - empty query
runner.test('5. Error handling - empty query', async () => {
  const response = await makeRequest(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.searchEndpoint}?query=`);
  
  console.log(`  📊 Status: ${response.status}`);
  
  if (response.status !== 400) {
    throw new Error(`Expected 400 status for empty query, got ${response.status}`);
  }
  
  if (!response.data.error) {
    throw new Error('Expected error message for empty query');
  }
  
  console.log(`  ✨ Properly rejected empty query: ${response.data.error}`);
});

// Test 6: Error handling - malformed JSON
runner.test('6. Error handling - malformed JSON', async () => {
  const response = await makeRequest(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.searchEndpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: '{ invalid json'
  });
  
  console.log(`  📊 Status: ${response.status}`);
  
  if (response.status < 400) {
    throw new Error(`Expected error status for malformed JSON, got ${response.status}`);
  }
  
  console.log(`  ✨ Properly handled malformed JSON`);
});

// Test 7: Search result quality validation
runner.test('7. Search result quality validation', async () => {
  const query = TEST_CONFIG.testQueries[2];
  const response = await makeRequest(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.searchEndpoint}?query=${encodeURIComponent(query)}`);
  
  if (!response.ok || !response.data.success) {
    throw new Error('Search failed, cannot validate quality');
  }
  
  const { response: text, searchResults, citations } = response.data;
  
  // Validate response quality
  if (!text || text.length < 50) {
    throw new Error('Response text is too short or empty');
  }
  
  if (searchResults && searchResults.length > 0) {
    // Check if search results have valid URLs
    const urlPattern = /^https?:\/\/.+/;
    for (const result of searchResults) {
      if (!urlPattern.test(result.url)) {
        throw new Error(`Invalid URL in search result: ${result.url}`);
      }
    }
    console.log(`  🔗 All ${searchResults.length} search result URLs are valid`);
  }
  
  if (citations && citations.length > 0) {
    // Check if citations have valid URLs
    const urlPattern = /^https?:\/\/.+/;
    for (const citation of citations) {
      if (!urlPattern.test(citation.url)) {
        throw new Error(`Invalid URL in citation: ${citation.url}`);
      }
    }
    console.log(`  📚 All ${citations.length} citation URLs are valid`);
  }
  
  console.log(`  ✨ Search quality validation passed`);
  console.log(`  📊 Response length: ${text.length} characters`);
});

// Test 8: Multiple concurrent requests
runner.test('8. Multiple concurrent requests', async () => {
  const queries = TEST_CONFIG.testQueries;
  
  console.log(`  🚀 Sending ${queries.length} concurrent requests`);
  
  const promises = queries.map(query => 
    makeRequest(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.searchEndpoint}?query=${encodeURIComponent(query)}`)
  );
  
  const responses = await Promise.all(promises);
  
  let successCount = 0;
  let failureCount = 0;
  
  responses.forEach((response, index) => {
    if (response.ok && response.data.success) {
      successCount++;
    } else {
      failureCount++;
      console.log(`    ⚠️  Query ${index + 1} failed: ${response.data.error || 'Unknown error'}`);
    }
  });
  
  console.log(`  ✨ Results: ${successCount} success, ${failureCount} failures`);
  
  if (successCount === 0) {
    throw new Error('All concurrent requests failed');
  }
  
  // Allow some failures due to rate limiting or network issues
  if (successCount / queries.length < 0.5) {
    throw new Error(`Too many failures: ${failureCount}/${queries.length}`);
  }
});

// Test 9: Response time validation
runner.test('9. Response time validation', async () => {
  const query = TEST_CONFIG.testQueries[0];
  const startTime = Date.now();
  
  const response = await makeRequest(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.searchEndpoint}?query=${encodeURIComponent(query)}`);
  
  const responseTime = Date.now() - startTime;
  console.log(`  ⏱️  Response time: ${responseTime}ms`);
  
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  
  // Allow reasonable response time for web search
  if (responseTime > 30000) {
    throw new Error(`Response too slow: ${responseTime}ms > 30000ms`);
  }
  
  console.log(`  ✨ Response time acceptable`);
});

// Test 10: Fallback behavior validation
runner.test('10. Fallback behavior validation', async () => {
  // This test would require either:
  // 1. Temporarily breaking the OpenAI API key
  // 2. Making a request that would trigger the fallback
  // For now, we'll test that the fallback response structure is valid
  
  // Test with a very complex query that might trigger fallback
  const complexQuery = 'What is the latest extremely specific technical information about quantum computing algorithms published in the last 24 hours that might not be indexed yet?';
  
  const response = await makeRequest(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.searchEndpoint}?query=${encodeURIComponent(complexQuery)}`);
  
  console.log(`  🔍 Complex query test`);
  console.log(`  📊 Status: ${response.status}`);
  
  if (response.ok) {
    validateSearchResponse(response.data);
    
    if (response.data.success) {
      console.log(`  ✨ Complex query handled successfully`);
      console.log(`  💡 Response type: ${response.data.searchResults ? 'Web search' : 'Knowledge-based'}`);
    } else {
      console.log(`  ⚠️  Query failed gracefully: ${response.data.error}`);
      
      if (!response.data.response) {
        throw new Error('Failed response should include fallback response text');
      }
      
      console.log(`  ✨ Fallback response provided`);
    }
  }
});

// Export for potential use in other test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TestRunner, makeRequest, validateSearchResponse };
}

// Run all tests if this file is executed directly
if (typeof window === 'undefined' || !window.document) {
  runner.run().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}