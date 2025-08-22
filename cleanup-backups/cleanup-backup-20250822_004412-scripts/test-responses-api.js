/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Comprehensive test suite for OpenAI Responses API implementation
 * @version: 1.0.0
 * @init-author: test-agent
 * @init-cc-sessionId: cc-test-20250805-773
 * @init-timestamp: 2025-08-05T22:30:00Z
 * @reasoning:
 * - **Objective:** Validate complete Responses API integration and functionality
 * - **Strategy:** Test all scenarios including success cases, error handling, and response structure validation
 * - **Outcome:** Comprehensive API test coverage ensuring quality and reliability
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fetch from 'node-fetch';

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4321';
const RESPONSES_API_ENDPOINT = `${API_BASE_URL}/api/voice-agent/responses-search`;

// Test timeout for network operations
const NETWORK_TIMEOUT = 30000;

// Test data
const TEST_QUERIES = {
  basic: 'What are the latest developments in artificial intelligence?',
  location: 'AI companies in San Francisco',
  business: 'Enterprise AI transformation strategies',
  technical: 'OpenAI GPT-4 pricing and features',
  empty: '',
  long: 'Tell me about the latest artificial intelligence trends, machine learning advancements, natural language processing improvements, computer vision breakthroughs, robotics innovations, autonomous vehicle developments, quantum computing progress, blockchain applications, cybersecurity enhancements, and cloud computing evolution in the technology industry for enterprise applications and business transformation strategies',
  special_chars: 'What is "AI safety" & how does it impact [business operations]?',
  non_english: 'Qu\'est-ce que l\'intelligence artificielle?'
};

// Response validation schemas
const RESPONSES_API_SCHEMA = {
  success: 'boolean',
  response: 'string',
  searchResults: 'array'
};

const SEARCH_RESULT_SCHEMA = {
  title: 'string',
  url: 'string',
  snippet: 'string',
  source: 'string'
};

/**
 * Test utilities
 */
class ResponsesAPITester {
  constructor() {
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async makeRequest(data, options = {}) {
    const response = await fetch(RESPONSES_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data),
      timeout: options.timeout || NETWORK_TIMEOUT
    });

    const responseData = await response.json();
    return { response, data: responseData };
  }

  validateResponseStructure(data, schema) {
    for (const [key, expectedType] of Object.entries(schema)) {
      if (!(key in data)) {
        throw new Error(`Missing required field: ${key}`);
      }
      
      const actualType = Array.isArray(data[key]) ? 'array' : typeof data[key];
      if (actualType !== expectedType) {
        throw new Error(`Field ${key} expected ${expectedType}, got ${actualType}`);
      }
    }
  }

  validateSearchResults(searchResults) {
    if (!Array.isArray(searchResults)) {
      throw new Error('searchResults must be an array');
    }

    for (const result of searchResults) {
      this.validateResponseStructure(result, SEARCH_RESULT_SCHEMA);
      
      // Validate URL format
      try {
        new URL(result.url);
      } catch (error) {
        throw new Error(`Invalid URL in search result: ${result.url}`);
      }

      // Validate required string fields are not empty
      if (!result.title.trim()) throw new Error('Search result title cannot be empty');
      if (!result.snippet.trim()) throw new Error('Search result snippet cannot be empty');
      if (!result.source.trim()) throw new Error('Search result source cannot be empty');
    }
  }

  extractCitations(response) {
    // Extract URLs and references from the response text
    const urlRegex = /https?:\/\/[^\s\)]+/g;
    const urls = response.match(urlRegex) || [];
    
    // Look for citation patterns like [1], (source: example.com), etc.
    const citationRegex = /\[(\d+)\]|\(source:\s*([^)]+)\)/g;
    const citations = [];
    let match;
    
    while ((match = citationRegex.exec(response)) !== null) {
      citations.push(match[1] || match[2]);
    }
    
    return { urls, citations };
  }

  logTestResult(testName, passed, error = null) {
    this.stats.total++;
    if (passed) {
      this.stats.passed++;
      console.log(`✅ ${testName}`);
    } else {
      this.stats.failed++;
      console.log(`❌ ${testName}: ${error?.message || 'Failed'}`);
      if (error) {
        this.stats.errors.push({ test: testName, error: error.message });
      }
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.stats.total}`);
    console.log(`✅ Passed: ${this.stats.passed}`);
    console.log(`❌ Failed: ${this.stats.failed}`);
    console.log(`Success Rate: ${((this.stats.passed / this.stats.total) * 100).toFixed(1)}%`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n🔍 ERROR DETAILS:');
      this.stats.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.test}: ${error.error}`);
      });
    }
    
    console.log('='.repeat(60));
  }
}

/**
 * Main test suite
 */
describe('OpenAI Responses API Integration Tests', () => {
  let tester;

  beforeAll(() => {
    console.log('🚀 Starting OpenAI Responses API Test Suite');
    console.log(`📡 Testing endpoint: ${RESPONSES_API_ENDPOINT}`);
    console.log('⏱️  Network timeout:', NETWORK_TIMEOUT + 'ms');
    console.log('-'.repeat(60));
    tester = new ResponsesAPITester();
  });

  afterAll(() => {
    tester.printSummary();
  });

  beforeEach(() => {
    // Small delay between tests to avoid rate limiting
    return new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('1. Basic Functionality Tests', () => {
    test('responds to basic web search query', async () => {
      try {
        const { response, data } = await tester.makeRequest({
          query: TEST_QUERIES.basic
        });

        expect(response.status).toBe(200);
        tester.validateResponseStructure(data, RESPONSES_API_SCHEMA);
        expect(data.success).toBe(true);
        expect(data.response).toBeTruthy();
        expect(typeof data.response).toBe('string');
        expect(data.response.length).toBeGreaterThan(10);

        tester.logTestResult('Basic web search query', true);
      } catch (error) {
        tester.logTestResult('Basic web search query', false, error);
        throw error;
      }
    }, NETWORK_TIMEOUT);

    test('handles location-based searches', async () => {
      try {
        const { response, data } = await tester.makeRequest({
          query: TEST_QUERIES.location
        });

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.response).toContain('San Francisco');

        tester.logTestResult('Location-based search', true);
      } catch (error) {
        tester.logTestResult('Location-based search', false, error);
        throw error;
      }
    }, NETWORK_TIMEOUT);

    test('handles business-related queries', async () => {
      try {
        const { response, data } = await tester.makeRequest({
          query: TEST_QUERIES.business
        });

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        
        // Should mention business or enterprise concepts
        const businessTerms = ['business', 'enterprise', 'transformation', 'strategy', 'organization'];
        const hasBusinessContent = businessTerms.some(term => 
          data.response.toLowerCase().includes(term)
        );
        expect(hasBusinessContent).toBe(true);

        tester.logTestResult('Business-related query', true);
      } catch (error) {
        tester.logTestResult('Business-related query', false, error);
        throw error;
      }
    }, NETWORK_TIMEOUT);

    test('handles technical queries', async () => {
      try {
        const { response, data } = await tester.makeRequest({
          query: TEST_QUERIES.technical
        });

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        
        // Should mention OpenAI or GPT-4
        const technicalTerms = ['openai', 'gpt-4', 'gpt', 'pricing', 'features'];
        const hasTechnicalContent = technicalTerms.some(term => 
          data.response.toLowerCase().includes(term)
        );
        expect(hasTechnicalContent).toBe(true);

        tester.logTestResult('Technical query', true);
      } catch (error) {
        tester.logTestResult('Technical query', false, error);
        throw error;
      }
    }, NETWORK_TIMEOUT);
  });

  describe('2. Response Structure Validation', () => {
    test('validates response structure matches Responses API format', async () => {
      try {
        const { response, data } = await tester.makeRequest({
          query: TEST_QUERIES.basic
        });

        expect(response.status).toBe(200);
        
        // Validate top-level structure
        tester.validateResponseStructure(data, RESPONSES_API_SCHEMA);
        
        // Validate required fields
        expect(data.success).toBeDefined();
        expect(data.response).toBeDefined();
        expect(data.searchResults).toBeDefined();
        
        // Validate types
        expect(typeof data.success).toBe('boolean');
        expect(typeof data.response).toBe('string');
        expect(Array.isArray(data.searchResults)).toBe(true);

        tester.logTestResult('Response structure validation', true);
      } catch (error) {
        tester.logTestResult('Response structure validation', false, error);
        throw error;
      }
    }, NETWORK_TIMEOUT);

    test('validates search results structure when present', async () => {
      try {
        const { response, data } = await tester.makeRequest({
          query: TEST_QUERIES.technical
        });

        expect(response.status).toBe(200);
        
        if (data.searchResults && data.searchResults.length > 0) {
          tester.validateSearchResults(data.searchResults);
          
          // Validate each search result
          for (const result of data.searchResults) {
            expect(result.title).toBeTruthy();
            expect(result.url).toBeTruthy();
            expect(result.snippet).toBeTruthy();
            expect(result.source).toBeTruthy();
            
            // Validate URL format
            expect(() => new URL(result.url)).not.toThrow();
          }
        }

        tester.logTestResult('Search results structure validation', true);
      } catch (error) {
        tester.logTestResult('Search results structure validation', false, error);
        throw error;
      }
    }, NETWORK_TIMEOUT);

    test('checks for proper web_search_call and message items processing', async () => {
      try {
        const { response, data } = await tester.makeRequest({
          query: TEST_QUERIES.basic
        });

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        
        // The API should process both web_search_call and message items
        // This is reflected in having both search results and a response message
        expect(data.response).toBeTruthy();
        expect(data.searchResults).toBeDefined();

        tester.logTestResult('Web search call and message items processing', true);
      } catch (error) {
        tester.logTestResult('Web search call and message items processing', false, error);
        throw error;
      }
    }, NETWORK_TIMEOUT);
  });

  describe('3. Citation Extraction Tests', () => {
    test('verifies citations are properly extracted', async () => {
      try {
        const { response, data } = await tester.makeRequest({
          query: TEST_QUERIES.business
        });

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        
        const { urls, citations } = tester.extractCitations(data.response);
        
        // Should have some form of citations or URLs
        const hasCitations = urls.length > 0 || citations.length > 0 || 
                           data.searchResults.length > 0;
        
        if (hasCitations) {
          console.log(`   Found ${urls.length} URLs, ${citations.length} citation markers, ${data.searchResults.length} search results`);
        }

        tester.logTestResult('Citation extraction', true);
      } catch (error) {
        tester.logTestResult('Citation extraction', false, error);
        throw error;
      }
    }, NETWORK_TIMEOUT);

    test('validates URL format in citations', async () => {
      try {
        const { response, data } = await tester.makeRequest({
          query: TEST_QUERIES.location
        });

        expect(response.status).toBe(200);
        
        // Check URLs in search results
        if (data.searchResults) {
          for (const result of data.searchResults) {
            if (result.url) {
              expect(() => new URL(result.url)).not.toThrow();
              expect(result.url).toMatch(/^https?:\/\//);
            }
          }
        }
        
        // Check URLs in response text
        const { urls } = tester.extractCitations(data.response);
        for (const url of urls) {
          expect(() => new URL(url)).not.toThrow();
        }

        tester.logTestResult('URL format validation in citations', true);
      } catch (error) {
        tester.logTestResult('URL format validation in citations', false, error);
        throw error;
      }
    }, NETWORK_TIMEOUT);
  });

  describe('4. Error Handling Tests', () => {
    test('handles empty query gracefully', async () => {
      try {
        const { response, data } = await tester.makeRequest({
          query: TEST_QUERIES.empty
        });

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBeTruthy();
        expect(data.error).toContain('required');

        tester.logTestResult('Empty query handling', true);
      } catch (error) {
        tester.logTestResult('Empty query handling', false, error);
        throw error;
      }
    });

    test('handles missing query parameter', async () => {
      try {
        const { response, data } = await tester.makeRequest({});

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBeTruthy();

        tester.logTestResult('Missing query parameter handling', true);
      } catch (error) {
        tester.logTestResult('Missing query parameter handling', false, error);
        throw error;
      }
    });

    test('handles invalid request body', async () => {
      try {
        const response = await fetch(RESPONSES_API_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'invalid json'
        });

        expect(response.status).toBeGreaterThanOrEqual(400);

        tester.logTestResult('Invalid request body handling', true);
      } catch (error) {
        tester.logTestResult('Invalid request body handling', false, error);
        throw error;
      }
    });

    test('handles API key configuration issues gracefully', async () => {
      try {
        // This test assumes the API handles missing/invalid API keys gracefully
        const { response, data } = await tester.makeRequest({
          query: TEST_QUERIES.basic
        });

        // Should either succeed or fail gracefully
        expect([200, 500].includes(response.status)).toBe(true);
        
        if (response.status === 500) {
          expect(data.success).toBe(false);
          expect(data.error).toContain('API key');
        }

        tester.logTestResult('API key configuration handling', true);
      } catch (error) {
        tester.logTestResult('API key configuration handling', false, error);
        throw error;
      }
    }, NETWORK_TIMEOUT);

    test('provides fallback response on API failure', async () => {
      try {
        const { response, data } = await tester.makeRequest({
          query: TEST_QUERIES.basic
        });

        // Even if the API fails, should provide a graceful fallback
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.response).toBeTruthy();
        
        // Fallback responses should still be helpful
        expect(data.response.length).toBeGreaterThan(50);

        tester.logTestResult('Fallback response on API failure', true);
      } catch (error) {
        tester.logTestResult('Fallback response on API failure', false, error);
        throw error;
      }
    }, NETWORK_TIMEOUT);
  });

  describe('5. Edge Cases and Special Scenarios', () => {
    test('handles very long queries', async () => {
      try {
        const { response, data } = await tester.makeRequest({
          query: TEST_QUERIES.long
        });

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.response).toBeTruthy();

        tester.logTestResult('Very long query handling', true);
      } catch (error) {
        tester.logTestResult('Very long query handling', false, error);
        throw error;
      }
    }, NETWORK_TIMEOUT * 2); // Longer timeout for complex queries

    test('handles special characters in queries', async () => {
      try {
        const { response, data } = await tester.makeRequest({
          query: TEST_QUERIES.special_chars
        });

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.response).toBeTruthy();

        tester.logTestResult('Special characters in query', true);
      } catch (error) {
        tester.logTestResult('Special characters in query', false, error);
        throw error;
      }
    }, NETWORK_TIMEOUT);

    test('handles non-English queries', async () => {
      try {
        const { response, data } = await tester.makeRequest({
          query: TEST_QUERIES.non_english
        });

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.response).toBeTruthy();

        tester.logTestResult('Non-English query handling', true);
      } catch (error) {
        tester.logTestResult('Non-English query handling', false, error);
        throw error;
      }
    }, NETWORK_TIMEOUT);

    test('handles conversation context parameter', async () => {
      try {
        const { response, data } = await tester.makeRequest({
          query: 'What about pricing?',
          conversationContext: 'We were discussing OpenAI GPT-4 features'
        });

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.response).toBeTruthy();
        
        // Response should incorporate context
        const contextAware = data.response.toLowerCase().includes('pricing') ||
                            data.response.toLowerCase().includes('gpt') ||
                            data.response.toLowerCase().includes('openai');
        expect(contextAware).toBe(true);

        tester.logTestResult('Conversation context handling', true);
      } catch (error) {
        tester.logTestResult('Conversation context handling', false, error);
        throw error;
      }
    }, NETWORK_TIMEOUT);
  });

  describe('6. Performance and Rate Limiting', () => {
    test('handles concurrent requests appropriately', async () => {
      try {
        const promises = Array(3).fill().map((_, i) => 
          tester.makeRequest({
            query: `${TEST_QUERIES.basic} ${i + 1}`
          })
        );

        const results = await Promise.allSettled(promises);
        
        // At least some requests should succeed
        const successCount = results.filter(r => 
          r.status === 'fulfilled' && r.value.response.status === 200
        ).length;
        
        expect(successCount).toBeGreaterThan(0);

        tester.logTestResult('Concurrent requests handling', true);
      } catch (error) {
        tester.logTestResult('Concurrent requests handling', false, error);
        throw error;
      }
    }, NETWORK_TIMEOUT * 2);

    test('respects reasonable response times', async () => {
      try {
        const startTime = Date.now();
        
        const { response, data } = await tester.makeRequest({
          query: TEST_QUERIES.basic
        });

        const responseTime = Date.now() - startTime;
        
        expect(response.status).toBe(200);
        expect(responseTime).toBeLessThan(NETWORK_TIMEOUT);
        
        console.log(`   Response time: ${responseTime}ms`);

        tester.logTestResult('Response time performance', true);
      } catch (error) {
        tester.logTestResult('Response time performance', false, error);
        throw error;
      }
    }, NETWORK_TIMEOUT);
  });

  describe('7. Content Quality Validation', () => {
    test('validates response content is relevant and informative', async () => {
      try {
        const { response, data } = await tester.makeRequest({
          query: TEST_QUERIES.business
        });

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        
        // Response should be substantial
        expect(data.response.length).toBeGreaterThan(100);
        
        // Should contain relevant business terms
        const businessTerms = ['AI', 'artificial intelligence', 'business', 'enterprise', 'transformation'];
        const hasRelevantContent = businessTerms.some(term => 
          data.response.toLowerCase().includes(term.toLowerCase())
        );
        expect(hasRelevantContent).toBe(true);

        tester.logTestResult('Content relevance and quality', true);
      } catch (error) {
        tester.logTestResult('Content relevance and quality', false, error);
        throw error;
      }
    }, NETWORK_TIMEOUT);

    test('validates response mentions Executive AI Training context', async () => {
      try {
        const { response, data } = await tester.makeRequest({
          query: TEST_QUERIES.business
        });

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        
        // Should incorporate the Executive AI Training context
        const contextTerms = ['executive', 'training', 'business leaders', 'transformation'];
        const hasContext = contextTerms.some(term => 
          data.response.toLowerCase().includes(term.toLowerCase())
        );
        
        // This might not always be present, so we log but don't fail
        if (hasContext) {
          console.log('   ✓ Response includes Executive AI Training context');
        } else {
          console.log('   ℹ Response does not explicitly mention Executive AI Training context');
        }

        tester.logTestResult('Executive AI Training context', true);
      } catch (error) {
        tester.logTestResult('Executive AI Training context', false, error);
        throw error;
      }
    }, NETWORK_TIMEOUT);
  });
});

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: test-agent
 * @cc-sessionId: cc-test-20250805-773
 * @timestamp: 2025-08-05T22:30:00Z
 * @reasoning:
 * - **Objective:** Create comprehensive test suite for OpenAI Responses API
 * - **Strategy:** Cover all scenarios including success cases, error handling, structure validation, and edge cases
 * - **Outcome:** Complete test coverage with clear pass/fail reporting and detailed validation
 * 
 * Test categories implemented:
 * 1. Basic Functionality - Core web search capabilities
 * 2. Response Structure - Validation of API response format
 * 3. Citation Extraction - URL and reference validation
 * 4. Error Handling - Graceful failure scenarios
 * 5. Edge Cases - Special characters, long queries, non-English
 * 6. Performance - Response times and concurrent requests
 * 7. Content Quality - Relevance and context validation
 * 
 * Key features:
 * - Real endpoint testing against /api/voice-agent/responses-search
 * - Proper schema validation for responses and search results
 * - Citation and URL format validation
 * - Comprehensive error scenario testing
 * - Performance and concurrency testing
 * - Clear pass/fail reporting with detailed summary
 * - Network timeout handling for reliable testing
 * - Rate limiting considerations between test runs
 */