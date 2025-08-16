/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Workers compatibility testing script for Executive AI Training voice agent application
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-dev-20250815-028
 * @init-timestamp: 2025-08-15T00:00:00Z
 * @reasoning:
 * - **Objective:** Test voice agent compatibility and performance in Workers environment
 * - **Strategy:** Comprehensive testing of API endpoints, WebRTC functionality, and Workers-specific features
 * - **Outcome:** Validation script ensuring smooth migration from Pages to Workers
 */

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Test configuration
 */
const CONFIG = {
  baseUrl: process.env.WORKERS_TEST_URL || 'http://localhost:8787',
  timeout: 30000, // 30 seconds
  retries: 3,
  concurrentTests: 5
};

/**
 * Logger utility with colors
 */
class Logger {
  static info(message) {
    console.log(`\x1b[36mℹ️  ${message}\x1b[0m`);
  }
  
  static success(message) {
    console.log(`\x1b[32m✅ ${message}\x1b[0m`);
  }
  
  static warn(message) {
    console.log(`\x1b[33m⚠️  ${message}\x1b[0m`);
  }
  
  static error(message) {
    console.log(`\x1b[31m❌ ${message}\x1b[0m`);
  }
  
  static test(message) {
    console.log(`\x1b[35m🧪 ${message}\x1b[0m`);
  }
}

/**
 * Test result tracking
 */
class TestResults {
  constructor() {
    this.tests = [];
    this.startTime = Date.now();
  }
  
  add(name, status, duration, details = {}) {
    this.tests.push({
      name,
      status, // 'pass', 'fail', 'warn', 'skip'
      duration,
      details,
      timestamp: new Date().toISOString()
    });
  }
  
  getStats() {
    const total = this.tests.length;
    const passed = this.tests.filter(t => t.status === 'pass').length;
    const failed = this.tests.filter(t => t.status === 'fail').length;
    const warnings = this.tests.filter(t => t.status === 'warn').length;
    const skipped = this.tests.filter(t => t.status === 'skip').length;
    const duration = Date.now() - this.startTime;
    
    return { total, passed, failed, warnings, skipped, duration };
  }
  
  printSummary() {
    const stats = this.getStats();
    
    console.log('\n' + '='.repeat(60));
    console.log('🧪 WORKERS COMPATIBILITY TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${stats.total}`);
    console.log(`✅ Passed: ${stats.passed}`);
    console.log(`❌ Failed: ${stats.failed}`);
    console.log(`⚠️  Warnings: ${stats.warnings}`);
    console.log(`⏸️  Skipped: ${stats.skipped}`);
    console.log(`⏱️  Duration: ${(stats.duration / 1000).toFixed(2)}s`);
    console.log('='.repeat(60));
    
    if (stats.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.tests
        .filter(t => t.status === 'fail')
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.details.error || 'Unknown error'}`);
        });
    }
    
    if (stats.warnings > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.tests
        .filter(t => t.status === 'warn')
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.details.warning || 'Performance warning'}`);
        });
    }
    
    return stats.failed === 0;
  }
}

/**
 * HTTP client with timeout and retry logic
 */
class HttpClient {
  constructor(baseUrl, timeout = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }
  
  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const requestOptions = {
      timeout: this.timeout,
      ...options,
      headers: {
        'User-Agent': 'Workers-Compatibility-Test/1.0',
        ...options.headers
      }
    };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
      
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout (${this.timeout}ms)`);
      }
      throw error;
    }
  }
  
  async get(path, headers = {}) {
    return this.request(path, { method: 'GET', headers });
  }
  
  async post(path, body = null, headers = {}) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (body) {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    
    return this.request(path, options);
  }
}

/**
 * Test suite for basic Workers functionality
 */
class BasicWorkerTests {
  constructor(client, results) {
    this.client = client;
    this.results = results;
  }
  
  async testHealthCheck() {
    Logger.test('Testing basic health check...');
    const start = Date.now();
    
    try {
      const response = await this.client.get('/');
      const duration = Date.now() - start;
      
      if (response.ok) {
        this.results.add('Health Check', 'pass', duration, {
          status: response.status,
          headers: Object.fromEntries(response.headers)
        });
        Logger.success(`Health check passed (${duration}ms)`);
      } else {
        this.results.add('Health Check', 'fail', duration, {
          error: `HTTP ${response.status}`,
          status: response.status
        });
        Logger.error(`Health check failed: HTTP ${response.status}`);
      }
    } catch (error) {
      const duration = Date.now() - start;
      this.results.add('Health Check', 'fail', duration, { error: error.message });
      Logger.error(`Health check failed: ${error.message}`);
    }
  }
  
  async testStaticAssets() {
    Logger.test('Testing static asset serving...');
    const assets = ['/favicon.ico', '/robots.txt'];
    
    for (const asset of assets) {
      const start = Date.now();
      
      try {
        const response = await this.client.get(asset);
        const duration = Date.now() - start;
        
        if (response.ok || response.status === 404) {
          this.results.add(`Static Asset: ${asset}`, 'pass', duration, {
            status: response.status,
            contentType: response.headers.get('content-type')
          });
          Logger.success(`Asset ${asset} handled correctly (${duration}ms)`);
        } else {
          this.results.add(`Static Asset: ${asset}`, 'fail', duration, {
            error: `HTTP ${response.status}`
          });
          Logger.error(`Asset ${asset} failed: HTTP ${response.status}`);
        }
      } catch (error) {
        const duration = Date.now() - start;
        this.results.add(`Static Asset: ${asset}`, 'fail', duration, { error: error.message });
        Logger.error(`Asset ${asset} failed: ${error.message}`);
      }
    }
  }
  
  async testWorkerHeaders() {
    Logger.test('Testing Workers-specific headers...');
    const start = Date.now();
    
    try {
      const response = await this.client.get('/');
      const duration = Date.now() - start;
      
      const workerHeaders = [
        'x-worker-version',
        'x-worker-runtime',
        'x-worker-duration',
        'x-worker-region'
      ];
      
      const foundHeaders = workerHeaders.filter(header => 
        response.headers.has(header)
      );
      
      if (foundHeaders.length >= 2) {
        this.results.add('Worker Headers', 'pass', duration, {
          foundHeaders,
          allHeaders: Object.fromEntries(response.headers)
        });
        Logger.success(`Worker headers present: ${foundHeaders.join(', ')}`);
      } else {
        this.results.add('Worker Headers', 'warn', duration, {
          warning: 'Missing some Worker headers',
          foundHeaders
        });
        Logger.warn(`Only found ${foundHeaders.length} Worker headers`);
      }
    } catch (error) {
      const duration = Date.now() - start;
      this.results.add('Worker Headers', 'fail', duration, { error: error.message });
      Logger.error(`Worker headers test failed: ${error.message}`);
    }
  }
}

/**
 * Test suite for voice agent functionality
 */
class VoiceAgentTests {
  constructor(client, results) {
    this.client = client;
    this.results = results;
  }
  
  async testTokenEndpoint() {
    Logger.test('Testing voice agent token endpoint...');
    const start = Date.now();
    
    try {
      const response = await this.client.post('/api/voice-agent/token', {
        sessionType: 'voice',
        clientId: 'test-client'
      });
      
      const duration = Date.now() - start;
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.token) {
          this.results.add('Voice Token Endpoint', 'pass', duration, {
            tokenLength: data.token.length,
            hasSession: !!data.sessionId
          });
          Logger.success(`Token endpoint working (${duration}ms)`);
        } else {
          this.results.add('Voice Token Endpoint', 'fail', duration, {
            error: 'Invalid response format',
            response: data
          });
          Logger.error('Token endpoint returned invalid format');
        }
      } else {
        const errorText = await response.text();
        this.results.add('Voice Token Endpoint', 'fail', duration, {
          error: `HTTP ${response.status}`,
          response: errorText
        });
        Logger.error(`Token endpoint failed: HTTP ${response.status}`);
      }
    } catch (error) {
      const duration = Date.now() - start;
      this.results.add('Voice Token Endpoint', 'fail', duration, { error: error.message });
      Logger.error(`Token endpoint failed: ${error.message}`);
    }
  }
  
  async testHealthEndpoint() {
    Logger.test('Testing voice agent health endpoint...');
    const start = Date.now();
    
    try {
      const response = await this.client.get('/api/voice-agent/health');
      const duration = Date.now() - start;
      
      if (response.ok) {
        const data = await response.json();
        
        this.results.add('Voice Health Endpoint', 'pass', duration, {
          status: data.status,
          timestamp: data.timestamp
        });
        Logger.success(`Health endpoint working (${duration}ms)`);
      } else {
        this.results.add('Voice Health Endpoint', 'fail', duration, {
          error: `HTTP ${response.status}`
        });
        Logger.error(`Health endpoint failed: HTTP ${response.status}`);
      }
    } catch (error) {
      const duration = Date.now() - start;
      this.results.add('Voice Health Endpoint', 'fail', duration, { error: error.message });
      Logger.error(`Health endpoint failed: ${error.message}`);
    }
  }
  
  async testRateLimiting() {
    Logger.test('Testing rate limiting functionality...');
    const start = Date.now();
    
    try {
      // Make multiple rapid requests to test rate limiting
      const requests = Array.from({ length: 15 }, () => 
        this.client.post('/api/voice-agent/token', { sessionType: 'test' })
      );
      
      const responses = await Promise.allSettled(requests);
      const duration = Date.now() - start;
      
      const successful = responses.filter(r => 
        r.status === 'fulfilled' && r.value.ok
      ).length;
      
      const rateLimited = responses.filter(r => 
        r.status === 'fulfilled' && r.value.status === 429
      ).length;
      
      if (rateLimited > 0) {
        this.results.add('Rate Limiting', 'pass', duration, {
          successful,
          rateLimited,
          total: requests.length
        });
        Logger.success(`Rate limiting working (${rateLimited} blocked)`);
      } else {
        this.results.add('Rate Limiting', 'warn', duration, {
          warning: 'Rate limiting may not be configured',
          successful,
          total: requests.length
        });
        Logger.warn('Rate limiting not detected');
      }
    } catch (error) {
      const duration = Date.now() - start;
      this.results.add('Rate Limiting', 'fail', duration, { error: error.message });
      Logger.error(`Rate limiting test failed: ${error.message}`);
    }
  }
}

/**
 * Performance test suite
 */
class PerformanceTests {
  constructor(client, results) {
    this.client = client;
    this.results = results;
  }
  
  async testColdStart() {
    Logger.test('Testing cold start performance...');
    
    // First request (cold start)
    const coldStart = Date.now();
    try {
      await this.client.get('/');
      const coldDuration = Date.now() - coldStart;
      
      // Warm request
      const warmStart = Date.now();
      await this.client.get('/');
      const warmDuration = Date.now() - warmStart;
      
      const improvement = ((coldDuration - warmDuration) / coldDuration * 100).toFixed(1);
      
      if (coldDuration < 1000) { // Under 1 second
        this.results.add('Cold Start Performance', 'pass', coldDuration, {
          coldStart: coldDuration,
          warmStart: warmDuration,
          improvement: `${improvement}%`
        });
        Logger.success(`Cold start: ${coldDuration}ms, Warm: ${warmDuration}ms`);
      } else {
        this.results.add('Cold Start Performance', 'warn', coldDuration, {
          warning: 'Cold start over 1 second',
          coldStart: coldDuration,
          warmStart: warmDuration
        });
        Logger.warn(`Cold start slow: ${coldDuration}ms`);
      }
    } catch (error) {
      this.results.add('Cold Start Performance', 'fail', 0, { error: error.message });
      Logger.error(`Cold start test failed: ${error.message}`);
    }
  }
  
  async testConcurrency() {
    Logger.test('Testing concurrent request handling...');
    const start = Date.now();
    
    try {
      const concurrentRequests = Array.from({ length: CONFIG.concurrentTests }, () =>
        this.client.get('/')
      );
      
      const responses = await Promise.allSettled(concurrentRequests);
      const duration = Date.now() - start;
      
      const successful = responses.filter(r => 
        r.status === 'fulfilled' && r.value.ok
      ).length;
      
      if (successful === CONFIG.concurrentTests) {
        this.results.add('Concurrency Test', 'pass', duration, {
          concurrent: CONFIG.concurrentTests,
          successful,
          avgDuration: duration / CONFIG.concurrentTests
        });
        Logger.success(`Handled ${successful}/${CONFIG.concurrentTests} concurrent requests`);
      } else {
        this.results.add('Concurrency Test', 'fail', duration, {
          error: `Only ${successful}/${CONFIG.concurrentTests} requests succeeded`,
          successful,
          total: CONFIG.concurrentTests
        });
        Logger.error(`Concurrency test failed: ${successful}/${CONFIG.concurrentTests}`);
      }
    } catch (error) {
      const duration = Date.now() - start;
      this.results.add('Concurrency Test', 'fail', duration, { error: error.message });
      Logger.error(`Concurrency test failed: ${error.message}`);
    }
  }
}

/**
 * Main test runner
 */
async function runCompatibilityTests() {
  Logger.info('🚀 Starting Workers compatibility tests...');
  Logger.info(`Target URL: ${CONFIG.baseUrl}`);
  
  const client = new HttpClient(CONFIG.baseUrl, CONFIG.timeout);
  const results = new TestResults();
  
  try {
    // Initialize test suites
    const basicTests = new BasicWorkerTests(client, results);
    const voiceTests = new VoiceAgentTests(client, results);
    const perfTests = new PerformanceTests(client, results);
    
    // Run basic Worker tests
    console.log('\n🔧 Basic Worker Tests');
    await basicTests.testHealthCheck();
    await basicTests.testStaticAssets();
    await basicTests.testWorkerHeaders();
    
    // Run voice agent tests
    console.log('\n🎤 Voice Agent Tests');
    await voiceTests.testTokenEndpoint();
    await voiceTests.testHealthEndpoint();
    await voiceTests.testRateLimiting();
    
    // Run performance tests
    console.log('\n⚡ Performance Tests');
    await perfTests.testColdStart();
    await perfTests.testConcurrency();
    
    // Print results summary
    const success = results.printSummary();
    
    if (success) {
      Logger.success('🎉 All compatibility tests passed!');
      console.log('\n✅ Your Workers deployment is ready for production');
    } else {
      Logger.error('💥 Some compatibility tests failed');
      console.log('\n❌ Please fix the issues before deploying to production');
    }
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    Logger.error(`Test runner failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompatibilityTests();
}

export { runCompatibilityTests };

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-dev-20250815-028
 * @timestamp: 2025-08-15T00:00:00Z
 * @reasoning:
 * - **Objective:** Created comprehensive Workers compatibility testing suite for voice agent validation
 * - **Strategy:** Test basic Workers functionality, voice agent endpoints, and performance characteristics
 * - **Outcome:** Complete test suite with detailed reporting and validation for Workers migration readiness
 */