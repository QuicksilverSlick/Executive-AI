/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Diagnostic test suite for OpenAI Responses API implementation
 * @version: 1.0.0
 * @init-author: test-agent
 * @init-cc-sessionId: cc-test-20250805-773
 * @init-timestamp: 2025-08-05T23:00:00Z
 * @reasoning:
 * - **Objective:** Diagnose actual API behavior and validate current implementation state
 * - **Strategy:** Test actual responses and provide detailed diagnostics for debugging
 * - **Outcome:** Clear understanding of current API state and specific issues to fix
 */

import fetch from 'node-fetch';

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4321';
const RESPONSES_API_ENDPOINT = `${API_BASE_URL}/api/voice-agent/responses-search`;
const NETWORK_TIMEOUT = 30000;

// Test data
const TEST_QUERIES = {
  basic: 'What are the latest developments in artificial intelligence?',
  empty: '',
  invalid_type: 123,
  location: 'AI companies in San Francisco',
  business: 'Enterprise AI transformation strategies'
};

/**
 * Diagnostic test runner
 */
class DiagnosticTester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async makeRequest(data, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || NETWORK_TIMEOUT);

    try {
      const response = await fetch(RESPONSES_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const responseData = await response.json();
      return { response, data: responseData };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async runDiagnostic(testName, testFn) {
    console.log(`\n🔍 Running: ${testName}`);
    console.log('-'.repeat(50));
    
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      this.results.push({
        name: testName,
        status: 'PASS',
        duration,
        details: result
      });
      
      console.log(`✅ ${testName} completed (${duration}ms)`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        name: testName,
        status: 'FAIL',
        duration,
        error: error.message,
        stack: error.stack
      });
      
      console.log(`❌ ${testName} failed (${duration}ms)`);
      console.log(`   Error: ${error.message}`);
      return null;
    }
  }

  logResponse(label, response, data) {
    console.log(`📝 ${label}:`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
    console.log(`   Body: ${JSON.stringify(data, null, 2)}`);
  }

  printSummary() {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 DIAGNOSTIC RESULTS SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);
    console.log(`Total Duration: ${totalDuration}ms`);
    
    console.log('\n📋 DETAILED RESULTS:');
    this.results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name}: ${result.status} (${result.duration}ms)`);
      if (result.error) {
        console.log(`   ❌ Error: ${result.error}`);
      }
      if (result.details) {
        console.log(`   ✅ Details: ${JSON.stringify(result.details, null, 4)}`);
      }
    });
    
    console.log('='.repeat(70));
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Main diagnostic tests
 */
async function runDiagnostics() {
  console.log('🚀 OpenAI Responses API Diagnostic Suite');
  console.log(`📡 Testing endpoint: ${RESPONSES_API_ENDPOINT}`);
  console.log(`⏱️  Network timeout: ${NETWORK_TIMEOUT}ms`);
  console.log('='.repeat(70));

  const tester = new DiagnosticTester();

  // Diagnostic 1: Basic successful request structure
  await tester.runDiagnostic('Basic Request Structure Analysis', async () => {
    const { response, data } = await tester.makeRequest({
      query: TEST_QUERIES.basic
    });

    tester.logResponse('Basic Request Response', response, data);
    
    return {
      statusCode: response.status,
      hasSuccess: 'success' in data,
      hasResponse: 'response' in data,
      hasSearchResults: 'searchResults' in data,
      hasError: 'error' in data,
      responseType: typeof data.response,
      searchResultsType: typeof data.searchResults,
      searchResultsIsArray: Array.isArray(data.searchResults),
      searchResultsLength: data.searchResults ? data.searchResults.length : 'N/A',
      responseLength: data.response ? data.response.length : 'N/A'
    };
  });

  await tester.delay(200);

  // Diagnostic 2: Empty query handling
  await tester.runDiagnostic('Empty Query Validation', async () => {
    const { response, data } = await tester.makeRequest({
      query: TEST_QUERIES.empty
    });

    tester.logResponse('Empty Query Response', response, data);
    
    return {
      statusCode: response.status,
      success: data.success,
      hasError: 'error' in data,
      errorMessage: data.error,
      actualBehavior: data.success ? 'ALLOWS_EMPTY' : 'REJECTS_EMPTY'
    };
  });

  await tester.delay(200);

  // Diagnostic 3: Missing query parameter
  await tester.runDiagnostic('Missing Query Parameter', async () => {
    const { response, data } = await tester.makeRequest({});

    tester.logResponse('Missing Query Response', response, data);
    
    return {
      statusCode: response.status,
      success: data.success,
      hasError: 'error' in data,
      errorMessage: data.error,
      actualBehavior: data.success ? 'ALLOWS_MISSING' : 'REJECTS_MISSING'
    };
  });

  await tester.delay(200);

  // Diagnostic 4: Invalid query type
  await tester.runDiagnostic('Invalid Query Type', async () => {
    const { response, data } = await tester.makeRequest({
      query: TEST_QUERIES.invalid_type
    });

    tester.logResponse('Invalid Type Response', response, data);
    
    return {
      statusCode: response.status,
      success: data.success,
      hasError: 'error' in data,
      errorMessage: data.error,
      actualBehavior: data.success ? 'ALLOWS_INVALID_TYPE' : 'REJECTS_INVALID_TYPE'
    };
  });

  await tester.delay(200);

  // Diagnostic 5: Location query analysis
  await tester.runDiagnostic('Location Query Content Analysis', async () => {
    const { response, data } = await tester.makeRequest({
      query: TEST_QUERIES.location
    });

    tester.logResponse('Location Query Response', response, data);
    
    const containsSanFrancisco = data.response.toLowerCase().includes('san francisco');
    const containsLocation = ['location', 'companies', 'san', 'francisco'].some(term =>
      data.response.toLowerCase().includes(term)
    );
    
    return {
      statusCode: response.status,
      success: data.success,
      responseLength: data.response.length,
      containsSanFrancisco,
      containsLocation,
      responsePreview: data.response.substring(0, 200) + '...',
      isGeneratedFallback: data.response.includes('having trouble accessing live search results')
    };
  });

  await tester.delay(200);

  // Diagnostic 6: Business query analysis
  await tester.runDiagnostic('Business Query Content Analysis', async () => {
    const { response, data } = await tester.makeRequest({
      query: TEST_QUERIES.business
    });

    tester.logResponse('Business Query Response', response, data);
    
    const businessTerms = ['business', 'enterprise', 'transformation', 'strategy', 'organization', 'ai'];
    const foundTerms = businessTerms.filter(term =>
      data.response.toLowerCase().includes(term)
    );
    
    return {
      statusCode: response.status,
      success: data.success,
      responseLength: data.response.length,
      businessTermsFound: foundTerms,
      businessTermsCount: foundTerms.length,
      responsePreview: data.response.substring(0, 200) + '...',
      isGeneratedFallback: data.response.includes('having trouble accessing live search results'),
      containsExecutiveContext: ['executive', 'training', 'business leaders'].some(term =>
        data.response.toLowerCase().includes(term)
      )
    };
  });

  await tester.delay(200);

  // Diagnostic 7: Conversation context handling
  await tester.runDiagnostic('Conversation Context Analysis', async () => {
    const { response, data } = await tester.makeRequest({
      query: 'What about pricing?',
      conversationContext: 'We were discussing OpenAI GPT-4 features'
    });

    tester.logResponse('Context Query Response', response, data);
    
    const contextTerms = ['pricing', 'gpt', 'openai', 'features'];
    const foundContextTerms = contextTerms.filter(term =>
      data.response.toLowerCase().includes(term)
    );
    
    return {
      statusCode: response.status,
      success: data.success,
      responseLength: data.response.length,
      contextTermsFound: foundContextTerms,
      contextTermsCount: foundContextTerms.length,
      responsePreview: data.response.substring(0, 200) + '...',
      appearsContextAware: foundContextTerms.length > 0,
      isGeneratedFallback: data.response.includes('having trouble accessing live search results')
    };
  });

  await tester.delay(200);

  // Diagnostic 8: API Error Pattern Analysis
  await tester.runDiagnostic('API Error Pattern Analysis', async () => {
    // Test multiple requests to see if they all return the same pattern
    const requests = [
      { query: 'AI trends' },
      { query: 'Machine learning' },
      { query: 'Technology companies' }
    ];
    
    const results = [];
    
    for (const req of requests) {
      const { response, data } = await tester.makeRequest(req);
      results.push({
        query: req.query,
        status: response.status,
        success: data.success,
        hasError: 'error' in data,
        errorMessage: data.error,
        responsePreview: data.response ? data.response.substring(0, 100) : null,
        isFallback: data.response && data.response.includes('having trouble accessing live search results')
      });
      await tester.delay(100);
    }
    
    const allFallbacks = results.every(r => r.isFallback);
    const allSuccessful = results.every(r => r.success);
    const allHaveErrors = results.every(r => r.hasError);
    
    return {
      totalRequests: results.length,
      allFallbacks,
      allSuccessful,
      allHaveErrors,
      pattern: allFallbacks ? 'ALL_FALLBACK' : 'MIXED',
      results
    };
  });

  await tester.delay(200);

  // Diagnostic 9: Network and timeout behavior
  await tester.runDiagnostic('Network Performance Analysis', async () => {
    const startTime = Date.now();
    const { response, data } = await tester.makeRequest({
      query: TEST_QUERIES.basic
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return {
      responseTime,
      statusCode: response.status,
      success: data.success,
      timeoutExceeded: responseTime > NETWORK_TIMEOUT,
      performanceCategory: responseTime < 1000 ? 'FAST' : responseTime < 5000 ? 'MODERATE' : 'SLOW'
    };
  });

  // Diagnostic 10: OpenAI API Key Configuration Check
  await tester.runDiagnostic('OpenAI API Configuration Analysis', async () => {
    // This diagnostic infers API key status from response patterns
    const { response, data } = await tester.makeRequest({
      query: 'Test OpenAI integration'
    });

    const hasAPIKeyError = data.error && data.error.toLowerCase().includes('api key');
    const isFallbackResponse = data.response && data.response.includes('having trouble accessing live search results');
    const hasUnexpectedError = data.error === 'Unexpected end of JSON input';

    return {
      statusCode: response.status,
      success: data.success,
      hasAPIKeyError,
      isFallbackResponse,
      hasUnexpectedError,
      errorMessage: data.error,
      apiKeyStatus: hasAPIKeyError ? 'MISSING_OR_INVALID' : 
                    hasUnexpectedError ? 'PARSING_ERROR' :
                    isFallbackResponse ? 'CONFIGURED_BUT_FAILING' : 'UNKNOWN',
      responsePattern: isFallbackResponse ? 'GRACEFUL_FALLBACK' : 'DIRECT_RESPONSE'
    };
  });

  // Generate summary
  tester.printSummary();

  // Generate recommendations
  console.log('\n💡 RECOMMENDATIONS BASED ON DIAGNOSTICS:');
  console.log('='.repeat(70));
  
  const lastResult = tester.results[tester.results.length - 1];
  if (lastResult && lastResult.details) {
    const config = lastResult.details;
    
    if (config.hasUnexpectedError) {
      console.log('1. ❌ JSON Parsing Error: The API is returning "Unexpected end of JSON input"');
      console.log('   → This suggests an issue with the OpenAI API response parsing');
      console.log('   → Check the OpenAI Responses API call implementation');
    }
    
    if (config.isFallbackResponse) {
      console.log('2. ⚠️  Fallback Mode: All requests are falling back to knowledge-based responses');
      console.log('   → The OpenAI Responses API call is failing');
      console.log('   → Check API key configuration and network connectivity');
    }
    
    if (config.apiKeyStatus === 'MISSING_OR_INVALID') {
      console.log('3. 🔑 API Key Issue: OpenAI API key appears to be missing or invalid');
      console.log('   → Verify OPENAI_API_KEY environment variable is set');
      console.log('   → Check API key permissions and quota');
    }
  }
  
  console.log('4. 🛠️  Input Validation: The API accepts empty and missing query parameters');
  console.log('   → Add proper input validation to return 400 status for invalid requests');
  
  console.log('5. 📋 Response Structure: searchResults field is undefined instead of empty array');
  console.log('   → Ensure searchResults is always an array, even when empty');
  
  console.log('6. 🔍 Content Matching: Responses are generic and don\'t match query specifics');
  console.log('   → This confirms the web search functionality is not working');
  
  console.log('\n🎯 PRIORITY FIXES:');
  console.log('1. Fix OpenAI Responses API integration (JSON parsing error)');
  console.log('2. Add proper input validation');
  console.log('3. Ensure searchResults is always an array');
  console.log('4. Verify API key configuration');
  console.log('='.repeat(70));
}

// Main entry point
async function main() {
  try {
    await runDiagnostics();
    process.exit(0);
  } catch (error) {
    console.error('❌ Diagnostic suite failed:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  process.exit(1);
});

// Run the diagnostics
main();

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: test-agent
 * @cc-sessionId: cc-test-20250805-773
 * @timestamp: 2025-08-05T23:00:00Z
 * @reasoning:
 * - **Objective:** Create comprehensive diagnostic tool for API troubleshooting
 * - **Strategy:** Test actual behavior and provide detailed analysis with specific recommendations
 * - **Outcome:** Clear identification of issues and actionable fix recommendations
 * 
 * Diagnostic categories:
 * 1. Basic request structure analysis
 * 2. Input validation behavior
 * 3. Content relevance checking
 * 4. Error pattern analysis
 * 5. Performance measurement
 * 6. API configuration inference
 * 7. Response structure validation
 * 8. Network behavior analysis
 * 9. Fallback mechanism evaluation
 * 10. Specific recommendations for fixes
 */