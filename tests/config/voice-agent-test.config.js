/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Test configuration for voice agent testing suite
 * @version: 1.0.0
 * @init-author: test-agent
 * @init-cc-sessionId: cc-test-20250802-001
 * @init-timestamp: 2025-08-02T16:45:00Z
 * @reasoning:
 * - **Objective:** Centralized configuration for all voice agent tests
 * - **Strategy:** Define test scenarios, mock configurations, and assertions
 * - **Outcome:** Consistent test setup across all test files
 */

export const TEST_CONFIG = {
  // Test timing configurations
  timeouts: {
    default: 5000,
    animation: 1000,
    networkRequest: 10000,
    voiceProcessing: 3000
  },

  // Mock configurations
  mocks: {
    mediaDevices: {
      getUserMedia: {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
          channelCount: 1
        }
      }
    },
    
    webrtc: {
      connectionStates: ['new', 'connecting', 'connected', 'disconnected', 'failed', 'closed'],
      iceConnectionStates: ['new', 'checking', 'connected', 'completed', 'failed', 'disconnected', 'closed']
    },

    audioContext: {
      sampleRate: 44100,
      fftSize: 2048,
      frequencyBinCount: 1024
    }
  },

  // Test data
  testData: {
    messages: {
      user: [
        "Hello, this is a test message",
        "Can you help me with something?",
        "Testing the voice assistant functionality",
        "This is a longer message to test how the transcript handles more text content"
      ],
      assistant: [
        "Hello! How can I help you today?",
        "Of course! I'd be happy to help you.",
        "I'm here to assist you with your questions.",
        "Thank you for testing the voice assistant. Everything seems to be working well!"
      ]
    },

    errors: {
      microphonePermissionDenied: {
        type: 'microphone_permission_denied',
        message: 'Microphone access denied by user',
        recoverable: true
      },
      connectionFailed: {
        type: 'connection_failed',
        message: 'Failed to connect to voice service',
        recoverable: true
      },
      browserNotSupported: {
        type: 'browser_not_supported',
        message: 'Browser does not support required features',
        recoverable: false
      },
      tokenExpired: {
        type: 'token_expired',
        message: 'Authentication token has expired',
        recoverable: true
      },
      networkError: {
        type: 'network_error',
        message: 'Network connection lost',
        recoverable: true
      }
    },

    audioLevels: [0.0, 0.1, 0.3, 0.5, 0.7, 0.9, 1.0],
    
    voiceStates: ['idle', 'listening', 'processing', 'speaking'],
    
    connectionStates: ['disconnected', 'connecting', 'connected', 'reconnecting', 'failed']
  },

  // UI element selectors
  selectors: {
    widget: '#voice-assistant-widget',
    fab: '#voice-fab',
    panel: '#voice-widget-panel',
    mainButton: '#voice-main-btn',
    muteButton: '#voice-mute-btn',
    minimizeButton: '#voice-minimize-btn',
    activationToggle: '#voice-activation-toggle',
    statusIndicator: '.voice-status-indicator',
    statusText: '#voice-status-text',
    waveformCanvas: '#voice-waveform-canvas',
    transcriptContainer: '.voice-transcript-container',
    ctaButton: '#voice-cta-btn',
    keyboardHint: '#voice-keyboard-hint',
    errorMessage: '.voice-error-message',
    userMessage: '.user-message',
    assistantMessage: '.assistant-message',
    currentTranscript: '.current-transcript'
  },

  // CSS classes for state checking
  stateClasses: {
    hidden: 'hidden',
    visible: 'visible',
    listening: 'listening',
    speaking: 'speaking',
    processing: 'processing',
    error: 'error',
    connected: 'connected',
    disconnected: 'disconnected',
    muted: 'muted'
  },

  // Keyboard shortcuts
  keyboardShortcuts: {
    space: 'Space',
    escape: 'Escape',
    tab: 'Tab',
    enter: 'Enter'
  },

  // Performance benchmarks
  performance: {
    maxInitializationTime: 2000, // ms
    maxResponseTime: 500, // ms
    maxMemoryUsage: 50, // MB
    maxCpuUsage: 80, // %
    minFrameRate: 30, // fps for animations
    maxAudioLatency: 100 // ms
  },

  // Accessibility requirements
  accessibility: {
    requiredAriaAttributes: [
      'aria-label',
      'aria-labelledby',
      'aria-live',
      'aria-atomic'
    ],
    requiredFocusableElements: [
      'button',
      '[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])'
    ],
    colorContrastRatio: 4.5, // WCAG AA standard
    minTouchTargetSize: 44 // pixels (mobile)
  },

  // Network simulation settings
  network: {
    conditions: {
      fast: { downlink: 10, uplink: 10, rtt: 50 }, // Mbps, ms
      slow: { downlink: 0.5, uplink: 0.5, rtt: 2000 },
      offline: { downlink: 0, uplink: 0, rtt: 0 }
    }
  },

  // Browser compatibility matrix
  browsers: {
    chrome: { minVersion: 88, webrtcSupport: true, speechApiSupport: true },
    firefox: { minVersion: 84, webrtcSupport: true, speechApiSupport: false },
    safari: { minVersion: 14, webrtcSupport: true, speechApiSupport: false },
    edge: { minVersion: 88, webrtcSupport: true, speechApiSupport: true }
  },

  // Test scenarios
  scenarios: {
    happyPath: {
      name: 'Happy Path - Complete Voice Interaction',
      steps: [
        'Initialize voice assistant',
        'Expand panel',
        'Start listening',
        'Simulate voice input',
        'Receive AI response',
        'Stop listening',
        'Minimize panel'
      ]
    },
    
    errorRecovery: {
      name: 'Error Recovery - Connection Failure',
      steps: [
        'Initialize voice assistant',
        'Simulate connection failure',
        'Verify error message displayed',
        'Click retry button',
        'Verify successful reconnection'
      ]
    },
    
    accessibilityFlow: {
      name: 'Accessibility - Keyboard Navigation',
      steps: [
        'Tab to voice assistant',
        'Press Space to open',
        'Tab through controls',
        'Press Escape to close',
        'Verify focus management'
      ]
    },
    
    mobileInteraction: {
      name: 'Mobile - Touch Interaction',
      steps: [
        'Set mobile viewport',
        'Touch FAB to open',
        'Touch and hold voice button',
        'Release to stop',
        'Touch outside to close'
      ]
    }
  },

  // Test environment settings
  environment: {
    testUrl: '/test-voice-assistant-comprehensive.html',
    mockApiEndpoints: {
      voiceService: 'ws://localhost:8080/voice',
      auth: 'http://localhost:3000/api/auth',
      analytics: 'http://localhost:3000/api/analytics'
    },
    viewport: {
      desktop: { width: 1200, height: 800 },
      tablet: { width: 768, height: 1024 },
      mobile: { width: 375, height: 667 }
    }
  }
};

// Test assertion helpers
export const ASSERTIONS = {
  // State assertions
  isListening: (voiceAssistant) => voiceAssistant.state.isListening === true,
  isNotListening: (voiceAssistant) => voiceAssistant.state.isListening === false,
  isConnected: (voiceAssistant) => voiceAssistant.state.isConnected === true,
  isExpanded: (voiceAssistant) => voiceAssistant.state.isExpanded === true,
  hasError: (voiceAssistant, errorType = null) => {
    if (errorType) {
      return voiceAssistant.state.errorState?.type === errorType;
    }
    return voiceAssistant.state.errorState !== null;
  },

  // DOM assertions
  elementExists: (selector) => document.querySelector(selector) !== null,
  elementVisible: (selector) => {
    const element = document.querySelector(selector);
    return element && !element.classList.contains('hidden');
  },
  elementHasClass: (selector, className) => {
    const element = document.querySelector(selector);
    return element && element.classList.contains(className);
  },
  elementText: (selector, expectedText) => {
    const element = document.querySelector(selector);
    return element && element.textContent.includes(expectedText);
  },

  // Canvas assertions
  canvasDrawn: (canvasSelector) => {
    const canvas = document.querySelector(canvasSelector);
    if (!canvas) return false;
    
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Check if canvas has any non-transparent pixels
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] > 0) return true;
    }
    return false;
  },

  // Performance assertions
  responseTimeUnder: (actualTime, maxTime) => actualTime < maxTime,
  memoryUsageUnder: (actualUsage, maxUsage) => actualUsage < maxUsage,
  
  // Accessibility assertions
  hasAriaLabel: (selector) => {
    const element = document.querySelector(selector);
    return element && (element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby'));
  },
  isFocusable: (selector) => {
    const element = document.querySelector(selector);
    if (!element) return false;
    
    return element.tabIndex >= 0 || 
           ['button', 'input', 'select', 'textarea', 'a'].includes(element.tagName.toLowerCase());
  }
};

// Mock factories
export const MOCK_FACTORIES = {
  createMockMessage: (role = 'user', content = 'Test message') => ({
    role,
    content,
    timestamp: new Date().toISOString(),
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }),

  createMockError: (type = 'connection_failed', recoverable = true) => ({
    type,
    message: TEST_CONFIG.testData.errors[type]?.message || 'Unknown error',
    recoverable,
    timestamp: Date.now()
  }),

  createMockAudioEvent: (level = 0.5) => ({
    level,
    timestamp: Date.now(),
    frequency: Math.random() * 1000 + 100 // 100-1100 Hz
  }),

  createMockVoiceAgent: () => ({
    initialize: jest.fn().mockResolvedValue(),
    startListening: jest.fn(),
    stopListening: jest.fn(),
    disconnect: jest.fn().mockResolvedValue(),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    state: {
      isConnected: false,
      isListening: false,
      connectionState: 'disconnected'
    }
  })
};

export default TEST_CONFIG;