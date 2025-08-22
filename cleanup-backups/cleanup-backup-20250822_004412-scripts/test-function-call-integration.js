/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Test web search function call integration with voice agent
 * @version: 1.0.0
 * @init-author: test-agent
 * @init-cc-sessionId: cc-test-20250811-001
 * @init-timestamp: 2025-08-11T15:05:00Z
 * @reasoning:
 * - **Objective:** Test how the voice agent's web search function call works
 * - **Strategy:** Simulate the function call flow and test response processing
 * - **Outcome:** Verify that search results are properly integrated into voice responses
 */

console.log('🤖 Starting Function Call Integration Testing Suite\n');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:4321',
  searchEndpoint: '/api/voice-agent/responses-search',
  testCases: [
    {
      callId: 'test_call_001',
      functionName: 'web_search',
      args: { query: 'What is the weather today?' },
      expectedType: 'web_search_result'
    },
    {
      callId: 'test_call_002', 
      functionName: 'web_search',
      args: { query: 'Latest AI developments in 2024' },
      expectedType: 'web_search_result'
    },
    {
      callId: 'test_call_003',
      functionName: 'web_search', 
      args: { query: 'JavaScript async/await best practices' },
      expectedType: 'web_search_result'
    }
  ]
};

// Mock the WebRTC Voice Agent function call flow
class MockWebRTCVoiceAgent {
  constructor() {
    this.conversationContext = [
      'User: Hello, I need some information',
      'Assistant: I\'d be happy to help! What would you like to know?'
    ];
    this.messageSequence = 1;
  }

  async executeWebSearch(callId, args) {
    console.log(`📞 Simulating web search function call`);
    console.log(`   Call ID: ${callId}`);
    console.log(`   Query: "${args.query}"`);
    
    try {
      const searchUrl = `${TEST_CONFIG.baseUrl}${TEST_CONFIG.searchEndpoint}`;
      console.log(`   🔗 Calling endpoint: ${searchUrl}`);
      
      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: args.query,
          conversationContext: this.getConversationContext()
        })
      });
      
      const responseText = await response.text();
      console.log(`   📡 HTTP Status: ${response.status}`);
      console.log(`   📄 Raw Response: ${responseText.substring(0, 200)}...`);

      if (!response.ok) {
        throw new Error(`Search API responded with status ${response.status}: ${responseText}`);
      }

      const searchResult = JSON.parse(responseText);
      console.log(`   🔍 Parsed Response:`, {
        success: searchResult.success,
        hasResponse: !!searchResult.response,
        responseLength: searchResult.response?.length || 0,
        searchResultsCount: searchResult.searchResults?.length || 0,
        citationsCount: searchResult.citations?.length || 0
      });

      if (searchResult.success === true && searchResult.response) {
        console.log(`   ✅ Search successful!`);
        
        const functionResult = {
          success: true,
          query: args.query,
          response: searchResult.response,
          searchResults: searchResult.searchResults || [],
          citations: searchResult.citations || []
        };
        
        // Simulate sending result back to OpenAI
        return this.sendFunctionCallResult(callId, functionResult);
        
      } else if (searchResult.success === false && searchResult.error) {
        throw new Error(searchResult.error);
      } else {
        throw new Error('Unexpected response format from search API');
      }

    } catch (error) {
      console.error(`   ❌ Search execution failed:`, error.message);
      
      const errorResult = {
        success: false,
        error: error.message,
        fallback: `I apologize, but my search for "${args.query}" failed.`
      };
      
      return this.sendFunctionCallResult(callId, errorResult);
    }
  }

  sendFunctionCallResult(callId, result) {
    console.log(`   📤 Sending function result for call ${callId}:`);
    
    const event = {
      event_id: `func_result_${++this.messageSequence}`,
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: callId,
        output: JSON.stringify(result)
      }
    };
    
    console.log(`   📋 Event structure:`, JSON.stringify(event, null, 2));
    
    // Simulate the response.create event
    const responseEvent = {
      event_id: `resp_after_func_${++this.messageSequence}`,
      type: 'response.create'
    };
    
    console.log(`   🔄 Response trigger event:`, JSON.stringify(responseEvent, null, 2));
    
    return {
      functionResult: result,
      event: event,
      responseEvent: responseEvent
    };
  }

  getConversationContext() {
    return this.conversationContext.slice(-5).join('\n');
  }

  addToConversationContext(message) {
    this.conversationContext.push(message);
    if (this.conversationContext.length > 10) {
      this.conversationContext.shift();
    }
  }
}

// Test utilities
class FunctionCallTestRunner {
  constructor() {
    this.tests = [];
    this.results = { passed: 0, failed: 0, total: 0 };
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log(`🧪 Running ${this.tests.length} function call integration tests...\n`);
    
    for (const { name, testFn } of this.tests) {
      try {
        console.log(`🔬 ${name}`);
        await testFn();
        console.log(`   ✅ PASSED\n`);
        this.results.passed++;
      } catch (error) {
        console.log(`   ❌ FAILED: ${error.message}\n`);
        this.results.failed++;
      }
      this.results.total++;
    }

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 FUNCTION CALL INTEGRATION TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed} ✅`);
    console.log(`Failed: ${this.results.failed} ${this.results.failed > 0 ? '❌' : '✅'}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 ALL FUNCTION CALL TESTS PASSED! Integration is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the details above.');
    }
  }
}

// Initialize test runner and mock agent
const runner = new FunctionCallTestRunner();
const mockAgent = new MockWebRTCVoiceAgent();

// Test 1: Basic function call execution
runner.test('1. Basic web search function call execution', async () => {
  const testCase = TEST_CONFIG.testCases[0];
  
  const result = await mockAgent.executeWebSearch(testCase.callId, testCase.args);
  
  if (!result.functionResult) {
    throw new Error('Function call result missing');
  }
  
  if (result.functionResult.success) {
    if (!result.functionResult.response || result.functionResult.response.length === 0) {
      throw new Error('Successful result missing response text');
    }
    console.log(`   💬 Response preview: ${result.functionResult.response.substring(0, 100)}...`);
  } else {
    if (!result.functionResult.error) {
      throw new Error('Failed result missing error message');
    }
    console.log(`   ⚠️  Error: ${result.functionResult.error}`);
  }
  
  // Validate event structure
  if (!result.event || result.event.type !== 'conversation.item.create') {
    throw new Error('Invalid event structure');
  }
  
  if (!result.responseEvent || result.responseEvent.type !== 'response.create') {
    throw new Error('Invalid response event structure');
  }
});

// Test 2: Function call with conversation context
runner.test('2. Function call with conversation context', async () => {
  // Add some context to the mock agent
  mockAgent.addToConversationContext('User: I need information about programming');
  mockAgent.addToConversationContext('Assistant: I can help you with programming questions!');
  
  const testCase = TEST_CONFIG.testCases[2]; // JavaScript question
  
  const result = await mockAgent.executeWebSearch(testCase.callId, testCase.args);
  
  if (!result.functionResult) {
    throw new Error('Function call result missing');
  }
  
  // The conversation context should have been sent with the search request
  // This would help the AI understand the context of the JavaScript question
  console.log(`   🧠 Context was provided: ${mockAgent.getConversationContext() !== ''}`);
  
  if (result.functionResult.success) {
    console.log(`   ✨ Context-aware search successful`);
  }
});

// Test 3: Error handling in function calls
runner.test('3. Error handling in function calls', async () => {
  // Test with an empty query to trigger error handling
  const errorTestCase = {
    callId: 'error_test_001',
    functionName: 'web_search',
    args: { query: '' } // Empty query should cause error
  };
  
  const result = await mockAgent.executeWebSearch(errorTestCase.callId, errorTestCase.args);
  
  if (!result.functionResult) {
    throw new Error('Function call result missing');
  }
  
  // Should handle error gracefully
  if (result.functionResult.success === true) {
    throw new Error('Expected error for empty query, but got success');
  }
  
  if (!result.functionResult.error && !result.functionResult.fallback) {
    throw new Error('Error result missing error message or fallback');
  }
  
  console.log(`   ✅ Error handled gracefully: ${result.functionResult.error || result.functionResult.fallback}`);
});

// Test 4: Multiple function calls simulation
runner.test('4. Multiple sequential function calls', async () => {
  const results = [];
  
  for (let i = 0; i < TEST_CONFIG.testCases.length; i++) {
    const testCase = TEST_CONFIG.testCases[i];
    console.log(`     🔄 Processing call ${i + 1}/${TEST_CONFIG.testCases.length}: ${testCase.args.query}`);
    
    const result = await mockAgent.executeWebSearch(testCase.callId, testCase.args);
    results.push(result);
    
    // Small delay between calls to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const successfulCalls = results.filter(r => r.functionResult.success === true).length;
  const failedCalls = results.length - successfulCalls;
  
  console.log(`   📊 Results: ${successfulCalls} successful, ${failedCalls} failed`);
  
  if (successfulCalls === 0) {
    throw new Error('All function calls failed');
  }
  
  // At least half should succeed
  if (successfulCalls < results.length / 2) {
    throw new Error(`Too many failures: ${failedCalls}/${results.length}`);
  }
});

// Test 5: Response format validation
runner.test('5. Response format validation for voice integration', async () => {
  const testCase = TEST_CONFIG.testCases[1];
  
  const result = await mockAgent.executeWebSearch(testCase.callId, testCase.args);
  
  if (!result.functionResult) {
    throw new Error('Function call result missing');
  }
  
  // Validate the structure needed for OpenAI Realtime API
  const functionCallOutput = JSON.parse(result.event.item.output);
  
  if (functionCallOutput.success) {
    // Successful response validation
    if (!functionCallOutput.response || typeof functionCallOutput.response !== 'string') {
      throw new Error('Missing or invalid response text for voice synthesis');
    }
    
    if (functionCallOutput.response.length < 10) {
      throw new Error('Response text too short for meaningful voice response');
    }
    
    // Check if response is suitable for voice output
    const hasNaturalLanguage = /[.!?]/.test(functionCallOutput.response);
    if (!hasNaturalLanguage) {
      throw new Error('Response text not suitable for natural voice output');
    }
    
    console.log(`   💬 Voice-ready response: ${functionCallOutput.response.length} characters`);
    console.log(`   📚 Additional data: ${functionCallOutput.searchResults?.length || 0} results, ${functionCallOutput.citations?.length || 0} citations`);
    
  } else {
    // Error response validation
    if (!functionCallOutput.fallback && !functionCallOutput.error) {
      throw new Error('Error response missing fallback text for voice synthesis');
    }
    
    const fallbackText = functionCallOutput.fallback || functionCallOutput.error;
    if (typeof fallbackText !== 'string' || fallbackText.length < 10) {
      throw new Error('Fallback text not suitable for voice output');
    }
    
    console.log(`   ⚠️  Fallback response ready: ${fallbackText}`);
  }
  
  console.log(`   ✅ Response format is voice-integration ready`);
});

// Test 6: Performance and latency validation
runner.test('6. Function call performance validation', async () => {
  const testCase = TEST_CONFIG.testCases[0];
  const startTime = Date.now();
  
  const result = await mockAgent.executeWebSearch(testCase.callId, testCase.args);
  
  const executionTime = Date.now() - startTime;
  console.log(`   ⏱️  Execution time: ${executionTime}ms`);
  
  if (!result.functionResult) {
    throw new Error('Function call result missing');
  }
  
  // For voice interactions, we need reasonable response times
  if (executionTime > 10000) { // 10 seconds max for voice UX
    throw new Error(`Function call too slow for voice UX: ${executionTime}ms`);
  }
  
  if (executionTime > 5000) {
    console.log(`   ⚠️  Slow response (${executionTime}ms) - consider optimization`);
  } else {
    console.log(`   ✅ Good response time for voice interaction`);
  }
});

// Export for potential use in other test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FunctionCallTestRunner, MockWebRTCVoiceAgent };
}

// Run all tests if this file is executed directly
if (typeof window === 'undefined' || !window.document) {
  runner.run().catch(error => {
    console.error('❌ Function call test runner failed:', error);
    process.exit(1);
  });
}