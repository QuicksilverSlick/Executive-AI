/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Global test setup for voice agent testing suite including audio feedback system
 * @version: 1.1.0
 * @init-author: test-agent
 * @init-cc-sessionId: cc-test-20250808-045
 * @init-timestamp: 2025-08-08T17:10:00Z
 * @reasoning:
 * - **Objective:** Setup global test environment and mocks including audio feedback testing
 * - **Strategy:** Configure DOM, WebRTC mocks, audio test utilities, and performance monitoring
 * - **Outcome:** Comprehensive test environment across all test files including audio feedback
 */

import { vi, beforeEach, afterEach, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { VoiceAgentTestUtils, voiceAgentMatchers } from '../utils/voice-agent-test-utils.js';
import { setupAudioTestEnvironment, cleanupAudioTestEnvironment, audioTestAssertions } from './audio-test-utils.js';

// Extend Vitest expect with custom matchers
expect.extend(voiceAgentMatchers);
expect.extend(audioTestAssertions);

// Global test setup
beforeEach(() => {
  // Create mock DOM environment
  VoiceAgentTestUtils.createMockDOM();
  
  // Setup WebRTC mocks
  VoiceAgentTestUtils.createMockWebRTC();
  
  // Mock canvas context
  VoiceAgentTestUtils.mockCanvasContext();
  
  // Mock request animation frame
  VoiceAgentTestUtils.mockRequestAnimationFrame();
  
  // Mock local storage
  VoiceAgentTestUtils.mockLocalStorage();
  
  // Mock console for cleaner test output
  const consoleMock = VoiceAgentTestUtils.mockConsole();
  
  // Store console mock for potential restoration
  globalThis.__consoleMock = consoleMock;
  
  // Mock performance API
  global.performance = {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => [])
  };
  
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn()
  }));
  
  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn()
  }));
  
  // Mock fetch for API calls
  global.fetch = vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      blob: () => Promise.resolve(new Blob())
    })
  );
  
  // Mock URL.createObjectURL
  global.URL.createObjectURL = vi.fn(() => 'mock-object-url');
  global.URL.revokeObjectURL = vi.fn();
  
  // Mock Blob constructor
  global.Blob = class MockBlob {
    constructor(chunks = [], options = {}) {
      this.size = 0;
      this.type = options.type || '';
      this.chunks = chunks;
    }
    
    slice() {
      return new MockBlob();
    }
    
    stream() {
      return new ReadableStream();
    }
    
    text() {
      return Promise.resolve('');
    }
  };
  
  // Mock crypto for secure random values (only if not already defined)
  if (!global.crypto) {
    global.crypto = {
      getRandomValues: vi.fn((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      }),
      randomUUID: vi.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9))
    };
  } else {
    // If crypto exists, just mock the functions we need
    if (!global.crypto.getRandomValues) {
      global.crypto.getRandomValues = vi.fn((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      });
    }
    if (!global.crypto.randomUUID) {
      global.crypto.randomUUID = vi.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9));
    }
  }
  
  // Mock setTimeout and setInterval for testing
  vi.useFakeTimers();
  
  // Setup audio test environment
  setupAudioTestEnvironment();
});

// Global test cleanup
afterEach(() => {
  // Cleanup utilities
  VoiceAgentTestUtils.cleanup();
  
  // Restore timers
  vi.useRealTimers();
  
  // Clear all mocks
  vi.clearAllMocks();
  
  // Restore console if mocked
  if (globalThis.__consoleMock) {
    globalThis.__consoleMock.restore();
    delete globalThis.__consoleMock;
  }
  
  // Clear DOM
  if (global.document && global.document.body) {
    global.document.body.innerHTML = '';
  }
  
  // Reset global variables
  delete global.VoiceAssistantCore;
  delete global.webkitAudioContext;
  
  // Cleanup audio test environment
  cleanupAudioTestEnvironment();
});

// Global error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export utilities for test files
export { VoiceAgentTestUtils };