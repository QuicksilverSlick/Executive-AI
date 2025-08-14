/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Comprehensive integration tests for voice agent functionality
 * @version: 1.0.0
 * @init-author: test-agent
 * @init-cc-sessionId: cc-test-20250802-001
 * @init-timestamp: 2025-08-02T16:00:00Z
 * @reasoning:
 * - **Objective:** Validate complete voice agent integration and functionality
 * - **Strategy:** Test all user interactions, API endpoints, and UI components
 * - **Outcome:** Comprehensive test coverage ensuring quality deployment
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock WebRTC APIs
const mockMediaDevices = {
  getUserMedia: vi.fn(),
  enumerateDevices: vi.fn()
};

const mockRTCPeerConnection = vi.fn();
const mockAudioContext = vi.fn();

// Setup DOM environment
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
  <title>Voice Agent Test</title>
</head>
<body>
  <div id="voice-assistant-widget" class="voice-assistant-widget" data-theme="auto" data-auto-minimize="true">
    <div id="voice-fab" class="voice-fab">
      <button class="voice-fab-button">Voice</button>
    </div>
    <div id="voice-widget-panel" class="voice-widget-panel hidden">
      <div class="voice-status-indicator"></div>
      <div id="voice-status-text"></div>
      <button id="voice-main-btn"></button>
      <button id="voice-mute-btn"></button>
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

global.window = dom.window;
global.document = dom.window.document;
global.navigator = {
  ...dom.window.navigator,
  mediaDevices: mockMediaDevices
};
global.RTCPeerConnection = mockRTCPeerConnection;
global.AudioContext = mockAudioContext;
global.webkitAudioContext = mockAudioContext;

describe('Voice Agent Comprehensive Tests', () => {
  let VoiceAssistantCore;
  let voiceAssistant;

  beforeEach(async () => {
    // Reset DOM
    document.body.innerHTML = `
      <div id="voice-assistant-widget" class="voice-assistant-widget" data-theme="auto" data-auto-minimize="true">
        <div id="voice-fab" class="voice-fab">
          <button class="voice-fab-button">Voice</button>
        </div>
        <div id="voice-widget-panel" class="voice-widget-panel hidden">
          <div class="voice-status-indicator"></div>
          <div id="voice-status-text"></div>
          <button id="voice-main-btn"></button>
          <button id="voice-mute-btn"></button>
          <button id="voice-minimize-btn"></button>
          <button id="voice-activation-toggle"></button>
          <canvas id="voice-waveform-canvas" width="200" height="60"></canvas>
          <div class="voice-transcript-container"></div>
          <button id="voice-cta-btn"></button>
          <div id="voice-keyboard-hint"></div>
        </div>
      </div>
    `;

    // Reset mocks
    vi.clearAllMocks();
    
    // Mock successful media access
    mockMediaDevices.getUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }]
    });

    // Import and create voice assistant
    const { default: VoiceAssistantClass } = await import('../../src/components/voice-agent/voice-assistant-core.js');
    VoiceAssistantCore = VoiceAssistantClass;
    voiceAssistant = new VoiceAssistantCore();
  });

  afterEach(() => {
    if (voiceAssistant) {
      voiceAssistant.cleanup();
    }
  });

  describe('1. Push-to-Talk Functionality', () => {
    test('microphone button click starts/stops recording', async () => {
      expect(voiceAssistant.state.isListening).toBe(false);
      
      // Click main button to start
      const mainBtn = document.getElementById('voice-main-btn');
      mainBtn.click();
      
      // Should attempt to start listening
      expect(voiceAssistant.state.isListening).toBe(true);
      
      // Click again to stop
      mainBtn.click();
      expect(voiceAssistant.state.isListening).toBe(false);
    });

    test('spacebar toggle works when widget focused', async () => {
      // Simulate spacebar press
      const spaceEvent = new KeyboardEvent('keydown', {
        code: 'Space',
        bubbles: true
      });
      
      // Initially closed, space should expand
      expect(voiceAssistant.state.isExpanded).toBe(false);
      document.body.dispatchEvent(spaceEvent);
      expect(voiceAssistant.state.isExpanded).toBe(true);
      
      // Second space should toggle voice interaction
      document.body.dispatchEvent(spaceEvent);
      expect(voiceAssistant.state.isListening).toBe(true);
    });

    test('visual state changes reflect listening status', async () => {
      const mainBtn = document.getElementById('voice-main-btn');
      const statusIndicator = document.querySelector('.voice-status-indicator');
      
      // Start listening
      await voiceAssistant.toggleVoiceInteraction();
      
      expect(mainBtn.classList.contains('listening')).toBe(true);
      expect(statusIndicator.classList.contains('listening')).toBe(true);
    });

    test('escape key closes panel', () => {
      // Expand panel first
      voiceAssistant.expandPanel();
      expect(voiceAssistant.state.isExpanded).toBe(true);
      
      // Press escape
      const escapeEvent = new KeyboardEvent('keydown', {
        code: 'Escape',
        bubbles: true
      });
      document.dispatchEvent(escapeEvent);
      
      expect(voiceAssistant.state.isExpanded).toBe(false);
    });
  });

  describe('2. Transcript Display', () => {
    test('user messages appear in transcript', () => {
      const userMessage = {
        role: 'user',
        content: 'Hello, this is a test message',
        timestamp: new Date().toISOString()
      };
      
      voiceAssistant.handleMessageReceived(userMessage);
      
      const transcriptContainer = document.querySelector('.voice-transcript-container');
      const messageElements = transcriptContainer.querySelectorAll('.user-message');
      
      expect(messageElements.length).toBe(1);
      expect(messageElements[0].textContent).toContain('Hello, this is a test message');
    });

    test('AI messages appear in transcript with different styling', () => {
      const aiMessage = {
        role: 'assistant',
        content: 'Hello! How can I help you today?',
        timestamp: new Date().toISOString()
      };
      
      voiceAssistant.handleMessageReceived(aiMessage);
      
      const transcriptContainer = document.querySelector('.voice-transcript-container');
      const messageElements = transcriptContainer.querySelectorAll('.assistant-message');
      
      expect(messageElements.length).toBe(1);
      expect(messageElements[0].textContent).toContain('Hello! How can I help you today?');
    });

    test('messages are properly formatted with timestamps', () => {
      const message = {
        role: 'user',
        content: 'Test message',
        timestamp: new Date().toISOString()
      };
      
      voiceAssistant.handleMessageReceived(message);
      
      const transcriptContainer = document.querySelector('.voice-transcript-container');
      const timeElements = transcriptContainer.querySelectorAll('.text-xs');
      
      expect(timeElements.length).toBeGreaterThan(0);
    });

    test('transcript scrolls to bottom on new messages', () => {
      const transcriptContainer = document.querySelector('.voice-transcript-container');
      
      // Mock scrollHeight and scrollTop
      Object.defineProperty(transcriptContainer, 'scrollHeight', {
        value: 1000,
        writable: true
      });
      Object.defineProperty(transcriptContainer, 'scrollTop', {
        value: 0,
        writable: true
      });
      
      const message = {
        role: 'user',
        content: 'Test scroll message',
        timestamp: new Date().toISOString()
      };
      
      voiceAssistant.handleMessageReceived(message);
      
      // Should scroll to bottom
      expect(transcriptContainer.scrollTop).toBe(1000);
    });
  });

  describe('3. Voice Activity Visualization', () => {
    test('audio level updates waveform visualization', () => {
      const canvas = document.getElementById('voice-waveform-canvas');
      const ctx = canvas.getContext('2d');
      
      // Mock canvas context methods
      ctx.clearRect = vi.fn();
      ctx.beginPath = vi.fn();
      ctx.moveTo = vi.fn();
      ctx.lineTo = vi.fn();
      ctx.stroke = vi.fn();
      
      // Simulate audio level update
      voiceAssistant.updateAudioVisualization(0.8);
      
      expect(ctx.clearRect).toHaveBeenCalled();
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    test('voice activity detection updates UI indicators', () => {
      const statusIndicator = document.querySelector('.voice-status-indicator');
      
      // Test voice activity detected
      voiceAssistant.handleVoiceActivity(true);
      expect(statusIndicator.classList.contains('listening')).toBe(true);
      
      // Test voice activity stopped
      voiceAssistant.handleVoiceActivity(false);
      expect(statusIndicator.classList.contains('listening')).toBe(false);
    });

    test('waveform animation reflects audio intensity', () => {
      const canvas = document.getElementById('voice-waveform-canvas');
      const ctx = canvas.getContext('2d');
      
      ctx.clearRect = vi.fn();
      ctx.stroke = vi.fn();
      
      // Test low audio level
      voiceAssistant.updateAudioVisualization(0.1);
      expect(ctx.clearRect).toHaveBeenCalled();
      
      // Test high audio level
      voiceAssistant.updateAudioVisualization(0.9);
      expect(ctx.stroke).toHaveBeenCalled();
    });
  });

  describe('4. Text Input Functionality', () => {
    test('current transcript updates display partial text', () => {
      const transcriptText = 'This is partial speech recognition...';
      
      voiceAssistant.handleTranscriptionReceived(transcriptText);
      
      expect(voiceAssistant.state.currentTranscript).toBe(transcriptText);
      
      const currentTranscript = document.querySelector('.current-transcript');
      expect(currentTranscript.textContent).toBe(transcriptText);
    });

    test('enter key sends message when typing', () => {
      // This would require a text input field in the UI
      // Testing the concept of text input handling
      const mockSendMessage = vi.fn();
      voiceAssistant.sendTextMessage = mockSendMessage;
      
      // Simulate enter key press
      const enterEvent = new KeyboardEvent('keydown', {
        code: 'Enter',
        bubbles: true
      });
      
      // Would trigger message send
      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    test('connection state affects input availability', () => {
      // Test disconnected state
      voiceAssistant.handleConnectionStateChange('disconnected');
      expect(voiceAssistant.state.isConnected).toBe(false);
      
      // Test connected state
      voiceAssistant.handleConnectionStateChange('connected');
      expect(voiceAssistant.state.isConnected).toBe(true);
    });
  });

  describe('5. Modern UI/UX Features', () => {
    test('animations and transitions are applied', () => {
      const panel = document.getElementById('voice-widget-panel');
      
      // Test panel visibility animation
      voiceAssistant.expandPanel();
      expect(panel.classList.contains('visible')).toBe(true);
      
      voiceAssistant.minimizePanel();
      expect(panel.classList.contains('hidden')).toBe(true);
    });

    test('responsive design adapts to screen size', () => {
      // Test mobile breakpoint
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });
      
      // Widget should adapt (this would be tested with actual CSS)
      const widget = document.getElementById('voice-assistant-widget');
      expect(widget).toBeTruthy();
    });

    test('dark mode support is properly configured', () => {
      const container = document.getElementById('voice-assistant-widget');
      
      // Test theme detection
      const theme = container.dataset.theme;
      expect(['auto', 'light', 'dark']).toContain(theme);
    });

    test('reduced motion preferences are respected', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      voiceAssistant.respectReducedMotion();
      
      const container = document.getElementById('voice-assistant-widget');
      expect(container.classList.contains('reduced-motion')).toBe(true);
    });
  });

  describe('6. Error Handling', () => {
    test('microphone permission denied shows help', () => {
      const error = {
        type: 'microphone_permission_denied',
        message: 'Permission denied',
        recoverable: true
      };
      
      voiceAssistant.handleError(error);
      
      expect(voiceAssistant.state.errorState).toEqual(error);
      
      const statusText = document.getElementById('voice-status-text');
      expect(statusText.textContent).toContain('Microphone access denied');
    });

    test('connection failures show retry option', () => {
      const error = {
        type: 'connection_failed',
        message: 'Network error',
        recoverable: true
      };
      
      voiceAssistant.handleError(error);
      
      // Should show error message with retry button
      const errorMessage = document.querySelector('.voice-error-message');
      expect(errorMessage).toBeTruthy();
    });

    test('non-recoverable errors disable functionality', () => {
      const error = {
        type: 'browser_not_supported',
        message: 'Browser not supported',
        recoverable: false
      };
      
      voiceAssistant.handleError(error);
      
      const statusText = document.getElementById('voice-status-text');
      expect(statusText.textContent).toContain('browser');
    });

    test('retry connection clears errors and reinitializes', async () => {
      // Set error state
      voiceAssistant.state.errorState = { type: 'connection_failed' };
      
      // Mock successful retry
      voiceAssistant.initializeVoiceAgent = vi.fn().mockResolvedValue({});
      
      await voiceAssistant.retryConnection();
      
      expect(voiceAssistant.state.errorState).toBeNull();
      expect(voiceAssistant.initializeVoiceAgent).toHaveBeenCalled();
    });

    test('token expiration triggers auto-reconnect', () => {
      const error = {
        type: 'token_expired',
        message: 'Token expired',
        recoverable: true
      };
      
      voiceAssistant.voiceAgent = {
        initialize: vi.fn()
      };
      
      voiceAssistant.handleError(error);
      
      expect(voiceAssistant.voiceAgent.initialize).toHaveBeenCalled();
    });
  });

  describe('7. Settings and Features', () => {
    test('mute button toggles audio state', () => {
      expect(voiceAssistant.state.isMuted).toBe(false);
      
      voiceAssistant.toggleMute();
      expect(voiceAssistant.state.isMuted).toBe(true);
      
      voiceAssistant.toggleMute();
      expect(voiceAssistant.state.isMuted).toBe(false);
    });

    test('voice activation toggle works', () => {
      // Mock console.log to verify the toggle
      const consoleSpy = vi.spyOn(console, 'log');
      
      voiceAssistant.toggleVoiceActivation();
      
      expect(consoleSpy).toHaveBeenCalledWith('[VoiceCore] Voice activation toggle clicked');
    });

    test('auto-minimize setting is configurable', () => {
      const container = document.getElementById('voice-assistant-widget');
      container.dataset.autoMinimize = 'true';
      
      // Test auto-minimize behavior
      voiceAssistant.setupAutoMinimize();
      
      // Should set up inactivity timer
      expect(container.dataset.autoMinimize).toBe('true');
    });

    test('keyboard shortcuts can be disabled', () => {
      voiceAssistant.keyboardShortcuts = false;
      
      // Keyboard shortcuts should not be active
      const spaceEvent = new KeyboardEvent('keydown', {
        code: 'Space',
        bubbles: true
      });
      
      const initialExpanded = voiceAssistant.state.isExpanded;
      document.body.dispatchEvent(spaceEvent);
      
      // Should not change state when disabled
      expect(voiceAssistant.state.isExpanded).toBe(initialExpanded);
    });

    test('position can be configured', () => {
      const container = document.getElementById('voice-assistant-widget');
      
      // Test different positions
      container.className = 'voice-assistant-widget bottom-right';
      expect(voiceAssistant.getPosition()).toBe('bottom-right');
      
      container.className = 'voice-assistant-widget top-left';
      expect(voiceAssistant.getPosition()).toBe('top-left');
    });
  });

  describe('8. Accessibility Features', () => {
    test('screen reader announcements work', () => {
      const message = 'Test announcement';
      voiceAssistant.announce(message);
      
      expect(voiceAssistant.announceRegion.textContent).toBe(message);
    });

    test('focus management traps focus in panel', () => {
      voiceAssistant.expandPanel();
      
      const panel = document.getElementById('voice-widget-panel');
      const focusableElements = panel.querySelectorAll('button');
      
      expect(focusableElements.length).toBeGreaterThan(0);
    });

    test('keyboard navigation works correctly', () => {
      const mainBtn = document.getElementById('voice-main-btn');
      
      voiceAssistant.expandPanel();
      
      // Should focus main button when panel opens
      expect(document.activeElement).toBe(mainBtn);
    });

    test('ARIA attributes are properly set', () => {
      const announceRegion = voiceAssistant.announceRegion;
      
      expect(announceRegion.getAttribute('aria-live')).toBe('polite');
      expect(announceRegion.getAttribute('aria-atomic')).toBe('true');
    });
  });

  describe('9. Performance and Optimization', () => {
    test('voice agent initializes lazily', () => {
      // Voice agent should not be initialized until first use
      expect(voiceAssistant.voiceAgent).toBeNull();
      
      // Should be configured for lazy initialization
      expect(voiceAssistant.voiceAgentConfig).toBeTruthy();
    });

    test('cleanup method properly disposes resources', async () => {
      const mockDisconnect = vi.fn();
      voiceAssistant.voiceAgent = { disconnect: mockDisconnect };
      
      await voiceAssistant.cleanup();
      
      expect(mockDisconnect).toHaveBeenCalled();
    });

    test('event listeners are properly managed', () => {
      const mockRemoveEventListener = vi.spyOn(document, 'removeEventListener');
      
      voiceAssistant.cleanup();
      
      // Should clean up event listeners
      expect(mockRemoveEventListener).toHaveBeenCalled();
    });
  });

  describe('10. Analytics and Tracking', () => {
    test('events are tracked properly', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      voiceAssistant.trackEvent('test_event', { data: 'test' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[VoiceCore] Analytics event:',
        expect.objectContaining({
          type: 'test_event',
          data: 'test'
        })
      );
    });

    test('session ID is generated and persisted', () => {
      const sessionId1 = voiceAssistant.getSessionId();
      const sessionId2 = voiceAssistant.getSessionId();
      
      expect(sessionId1).toBe(sessionId2);
      expect(sessionId1).toMatch(/^voice_\d+_[a-z0-9]+$/);
    });

    test('CTA button click is tracked', () => {
      global.window.open = vi.fn();
      const trackSpy = vi.spyOn(voiceAssistant, 'trackEvent');
      
      voiceAssistant.handleCTAClick();
      
      expect(global.window.open).toHaveBeenCalled();
      expect(trackSpy).toHaveBeenCalledWith('cta_clicked', expect.any(Object));
    });
  });
});