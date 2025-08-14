/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Test utilities and helpers for voice agent testing
 * @version: 1.0.0
 * @init-author: test-agent
 * @init-cc-sessionId: cc-test-20250802-001
 * @init-timestamp: 2025-08-02T16:30:00Z
 * @reasoning:
 * - **Objective:** Provide reusable testing utilities for voice agent tests
 * - **Strategy:** Create mock factories, test helpers, and assertion utilities
 * - **Outcome:** Streamlined test development with consistent patterns
 */

import { vi } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Test Utilities for Voice Agent Testing
 */
export class VoiceAgentTestUtils {
  /**
   * Create a mock DOM environment for testing
   */
  static createMockDOM() {
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Voice Agent Test</title>
        <style>
          .hidden { display: none; }
          .visible { display: block; }
          .listening { background-color: green; }
          .speaking { background-color: blue; }
          .error { background-color: red; }
        </style>
      </head>
      <body>
        <div id="voice-assistant-widget" class="voice-assistant-widget" data-theme="auto" data-auto-minimize="true">
          <div id="voice-fab" class="voice-fab">
            <button class="voice-fab-button">Voice</button>
          </div>
          <div id="voice-widget-panel" class="voice-widget-panel hidden">
            <div class="voice-status-indicator"></div>
            <div id="voice-status-text">Ready</div>
            <button id="voice-main-btn" class="voice-pulse-ring"></button>
            <button id="voice-mute-btn">
              <svg><path></path></svg>
            </button>
            <button id="voice-minimize-btn"></button>
            <button id="voice-activation-toggle"></button>
            <canvas id="voice-waveform-canvas" width="200" height="60"></canvas>
            <div class="voice-transcript-container"></div>
            <button id="voice-cta-btn"></button>
            <div id="voice-keyboard-hint"></div>
          </div>
        </div>
      </body>
      </html>
    `, { url: 'http://localhost:3000' });

    // Setup global DOM objects
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.Event = dom.window.Event;
    global.KeyboardEvent = dom.window.KeyboardEvent;
    global.MouseEvent = dom.window.MouseEvent;

    return dom;
  }

  /**
   * Create mock WebRTC APIs
   */
  static createMockWebRTC() {
    const mockMediaStream = {
      getTracks: vi.fn(() => [{ stop: vi.fn() }]),
      getAudioTracks: vi.fn(() => [{ stop: vi.fn() }]),
      addTrack: vi.fn(),
      removeTrack: vi.fn()
    };

    const mockMediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue(mockMediaStream),
      enumerateDevices: vi.fn().mockResolvedValue([
        { deviceId: 'default', kind: 'audioinput', label: 'Default Microphone' }
      ])
    };

    const mockRTCPeerConnection = vi.fn().mockImplementation(() => ({
      createOffer: vi.fn().mockResolvedValue({}),
      createAnswer: vi.fn().mockResolvedValue({}),
      setLocalDescription: vi.fn().mockResolvedValue(),
      setRemoteDescription: vi.fn().mockResolvedValue(),
      addTrack: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      connectionState: 'connected',
      iceConnectionState: 'connected'
    }));

    const mockAudioContext = vi.fn().mockImplementation(() => ({
      createAnalyser: vi.fn(() => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        fftSize: 2048,
        frequencyBinCount: 1024,
        getByteFrequencyData: vi.fn()
      })),
      createMediaStreamSource: vi.fn(() => ({
        connect: vi.fn(),
        disconnect: vi.fn()
      })),
      createGain: vi.fn(() => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        gain: { value: 1 }
      })),
      destination: {},
      sampleRate: 44100,
      close: vi.fn()
    }));

    // Setup global WebRTC objects
    global.navigator = {
      ...global.navigator,
      mediaDevices: mockMediaDevices
    };
    global.RTCPeerConnection = mockRTCPeerConnection;
    global.AudioContext = mockAudioContext;
    global.webkitAudioContext = mockAudioContext;

    return {
      mockMediaStream,
      mockMediaDevices,
      mockRTCPeerConnection,
      mockAudioContext
    };
  }

  /**
   * Create a mock voice agent instance
   */
  static createMockVoiceAgent() {
    return {
      initialize: vi.fn().mockResolvedValue(),
      startListening: vi.fn(),
      stopListening: vi.fn(),
      disconnect: vi.fn().mockResolvedValue(),
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      audioProcessor: {
        setMuted: vi.fn(),
        getVolume: vi.fn(() => 0.5),
        setVolume: vi.fn()
      },
      state: {
        isConnected: false,
        isListening: false,
        connectionState: 'disconnected'
      }
    };
  }

  /**
   * Create test message objects
   */
  static createTestMessage(role = 'user', content = 'Test message') {
    return {
      role,
      content,
      timestamp: new Date().toISOString(),
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  /**
   * Create test error objects
   */
  static createTestError(type = 'connection_failed', recoverable = true) {
    const errorMessages = {
      connection_failed: 'Connection to server failed',
      microphone_permission_denied: 'Microphone access denied',
      browser_not_supported: 'Browser not supported',
      token_expired: 'Authentication token expired',
      network_error: 'Network connection error'
    };

    return {
      type,
      message: errorMessages[type] || 'Unknown error',
      recoverable,
      timestamp: Date.now()
    };
  }

  /**
   * Simulate user interactions
   */
  static simulateClick(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(event);
    }
  }

  static simulateKeyPress(code, target = document.body) {
    const event = new KeyboardEvent('keydown', {
      code,
      bubbles: true,
      cancelable: true
    });
    target.dispatchEvent(event);
  }

  static simulateKeyUp(code, target = document.body) {
    const event = new KeyboardEvent('keyup', {
      code,
      bubbles: true,
      cancelable: true
    });
    target.dispatchEvent(event);
  }

  /**
   * Animation and timing utilities
   */
  static async waitForAnimation(duration = 300) {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  static mockRequestAnimationFrame() {
    global.requestAnimationFrame = vi.fn().mockImplementation(callback => {
      setTimeout(callback, 16); // ~60fps
      return 1;
    });
    
    global.cancelAnimationFrame = vi.fn();
  }

  /**
   * Canvas testing utilities
   */
  static mockCanvasContext() {
    const mockContext = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      })),
      measureText: vi.fn(() => ({ width: 100 }))
    };

    // Mock getContext for canvas elements
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);
    
    return mockContext;
  }

  /**
   * Accessibility testing utilities
   */
  static checkAccessibility(element) {
    const issues = [];

    // Check for ARIA attributes
    if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
      issues.push('Missing aria-label or aria-labelledby');
    }

    // Check for focus management
    if (element.tabIndex < 0 && element.tagName === 'BUTTON') {
      issues.push('Button not focusable');
    }

    // Check for keyboard support
    if (element.tagName === 'BUTTON' && !element.onclick && !element.addEventListener) {
      issues.push('Button missing click handler');
    }

    return issues;
  }

  /**
   * Performance testing utilities
   */
  static measurePerformance(fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    return {
      result,
      duration: end - start
    };
  }

  static async measureAsyncPerformance(fn) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    return {
      result,
      duration: end - start
    };
  }

  /**
   * State assertion utilities
   */
  static assertVoiceAgentState(voiceAssistant, expectedState) {
    const state = voiceAssistant.state;
    
    Object.keys(expectedState).forEach(key => {
      if (state[key] !== expectedState[key]) {
        throw new Error(`Expected ${key} to be ${expectedState[key]}, but got ${state[key]}`);
      }
    });
  }

  static assertDOMState(elementId, expectedClasses = [], unexpectedClasses = []) {
    const element = document.getElementById(elementId);
    
    if (!element) {
      throw new Error(`Element with id '${elementId}' not found`);
    }

    expectedClasses.forEach(className => {
      if (!element.classList.contains(className)) {
        throw new Error(`Expected element '${elementId}' to have class '${className}'`);
      }
    });

    unexpectedClasses.forEach(className => {
      if (element.classList.contains(className)) {
        throw new Error(`Expected element '${elementId}' not to have class '${className}'`);
      }
    });
  }

  /**
   * Mock console methods for testing
   */
  static mockConsole() {
    const originalConsole = { ...console };
    
    global.console = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn()
    };

    return {
      restore: () => {
        global.console = originalConsole;
      },
      getLogs: () => global.console.log.mock.calls,
      getErrors: () => global.console.error.mock.calls,
      getWarnings: () => global.console.warn.mock.calls
    };
  }

  /**
   * Network simulation utilities
   */
  static simulateNetworkConditions(condition = 'online') {
    const conditions = {
      online: { online: true, effectiveType: '4g' },
      offline: { online: false, effectiveType: null },
      slow: { online: true, effectiveType: 'slow-2g' },
      fast: { online: true, effectiveType: '4g' }
    };

    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: conditions[condition].online
    });

    if (navigator.connection) {
      Object.defineProperty(navigator.connection, 'effectiveType', {
        writable: true,
        value: conditions[condition].effectiveType
      });
    }
  }

  /**
   * Local storage mocking
   */
  static mockLocalStorage() {
    const store = {};
    
    global.localStorage = {
      getItem: vi.fn(key => store[key] || null),
      setItem: vi.fn((key, value) => { store[key] = value; }),
      removeItem: vi.fn(key => { delete store[key]; }),
      clear: vi.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
      key: vi.fn(index => Object.keys(store)[index] || null),
      get length() { return Object.keys(store).length; }
    };

    return store;
  }

  /**
   * Cleanup utility
   */
  static cleanup() {
    // Clear all timers
    vi.clearAllTimers();
    
    // Restore original console if mocked
    if (global.console.log && global.console.log.mock) {
      global.console = console;
    }
    
    // Clear DOM
    if (global.document && global.document.body) {
      global.document.body.innerHTML = '';
    }
    
    // Clear global mocks
    vi.clearAllMocks();
  }
}

/**
 * Custom matchers for voice agent testing
 */
export const voiceAgentMatchers = {
  toBeListening(voiceAssistant) {
    const isListening = voiceAssistant.state.isListening;
    return {
      pass: isListening,
      message: () => `Expected voice assistant ${isListening ? 'not ' : ''}to be listening`
    };
  },

  toBeConnected(voiceAssistant) {
    const isConnected = voiceAssistant.state.isConnected;
    return {
      pass: isConnected,
      message: () => `Expected voice assistant ${isConnected ? 'not ' : ''}to be connected`
    };
  },

  toHaveError(voiceAssistant, errorType = null) {
    const hasError = voiceAssistant.state.errorState !== null;
    const hasCorrectType = !errorType || voiceAssistant.state.errorState?.type === errorType;
    
    return {
      pass: hasError && hasCorrectType,
      message: () => {
        if (!hasError) return 'Expected voice assistant to have an error';
        if (!hasCorrectType) return `Expected error type '${errorType}', got '${voiceAssistant.state.errorState.type}'`;
        return `Expected voice assistant not to have error${errorType ? ` of type '${errorType}'` : ''}`;
      }
    };
  },

  toBeExpanded(voiceAssistant) {
    const isExpanded = voiceAssistant.state.isExpanded;
    return {
      pass: isExpanded,
      message: () => `Expected voice assistant panel ${isExpanded ? 'not ' : ''}to be expanded`
    };
  }
};

export default VoiceAgentTestUtils;