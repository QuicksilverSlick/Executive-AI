/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Voice agent initialization script for page load setup
 * @version: 1.0.0
 * @init-author: engineer-agent
 * @init-cc-sessionId: cc-eng-20250801-004
 * @init-timestamp: 2025-08-01T16:15:00Z
 * @reasoning:
 * - **Objective:** Ensure voice agent initializes properly across all pages
 * - **Strategy:** Robust initialization with fallbacks and error handling
 * - **Outcome:** Reliable voice agent startup with comprehensive logging
 */

/**
 * Voice Agent Initialization System
 * Handles loading, initialization, and error recovery for the voice agent
 */
class VoiceAgentInitializer {
  constructor() {
    this.initialized = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.healthCheckUrl = '/api/voice-agent/health';
    
    // Start initialization
    this.initialize();
  }

  /**
   * Main initialization method
   */
  async initialize() {
    try {
      console.log('[VoiceInit] Starting voice agent initialization...');
      
      // Step 1: Check if we're on a compatible page
      if (!this.shouldInitialize()) {
        console.log('[VoiceInit] Voice agent not needed on this page');
        return;
      }
      
      // Step 2: Check browser compatibility
      if (!this.checkBrowserSupport()) {
        console.warn('[VoiceInit] Browser not fully compatible with voice features');
        this.showCompatibilityWarning();
        return;
      }
      
      // Step 3: Check backend health
      await this.checkBackendHealth();
      
      // Step 4: Wait for DOM to be ready
      await this.waitForDOM();
      
      // Step 5: Wait for voice agent core to load
      await this.waitForVoiceAgent();
      
      // Step 6: Setup event listeners and monitoring
      this.setupEventListeners();
      this.startHealthMonitoring();
      
      this.initialized = true;
      console.log('[VoiceInit] Voice agent initialization completed successfully');
      
      // Dispatch initialization event
      this.dispatchEvent('voiceAgentReady', { 
        timestamp: Date.now(),
        retries: this.retryCount
      });
      
    } catch (error) {
      console.error('[VoiceInit] Initialization failed:', error);
      await this.handleInitializationError(error);
    }
  }

  /**
   * Check if voice agent should be initialized on current page
   */
  shouldInitialize() {
    // Skip on admin/API pages
    if (window.location.pathname.startsWith('/admin') || 
        window.location.pathname.startsWith('/api')) {
      return false;
    }
    
    // Skip if explicitly disabled
    if (document.querySelector('[data-voice-agent="disabled"]')) {
      return false;
    }
    
    // Skip if user has disabled voice features
    if (localStorage.getItem('voice-agent-disabled') === 'true') {
      return false;
    }
    
    return true;
  }

  /**
   * Check browser compatibility
   */
  checkBrowserSupport() {
    const requirements = {
      webrtc: !!(window.RTCPeerConnection || window.webkitRTCPeerConnection),
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      webAudio: !!(window.AudioContext || window.webkitAudioContext),
      webSockets: !!window.WebSocket,
      fetch: !!window.fetch,
      es6: typeof Symbol !== 'undefined'
    };
    
    const unsupported = Object.entries(requirements)
      .filter(([key, supported]) => !supported)
      .map(([key]) => key);
    
    if (unsupported.length > 0) {
      console.warn('[VoiceInit] Unsupported features:', unsupported);
      return false;
    }
    
    return true;
  }

  /**
   * Check backend health
   */
  async checkBackendHealth() {
    try {
      const response = await fetch(this.healthCheckUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const health = await response.json();
      console.log('[VoiceInit] Backend health check passed:', health);
      
      return health;
      
    } catch (error) {
      console.error('[VoiceInit] Backend health check failed:', error);
      throw new Error(`Backend not available: ${error.message}`);
    }
  }

  /**
   * Wait for DOM to be ready
   */
  async waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  }

  /**
   * Wait for voice agent core to load
   */
  async waitForVoiceAgent() {
    const maxWait = 10000; // 10 seconds
    const checkInterval = 100;
    let elapsed = 0;
    
    return new Promise((resolve, reject) => {
      const checkAgent = () => {
        // Check for WebRTC voice agent instance
        if (window.WebRTCVoiceAgent || document.querySelector('[data-voice-agent-widget]')) {
          console.log('[VoiceInit] Voice agent widget detected');
          resolve(true);
          return;
        }
        
        elapsed += checkInterval;
        if (elapsed >= maxWait) {
          // This is not a critical error for WebRTC implementation
          console.log('[VoiceInit] Voice agent will be initialized by React component');
          resolve(true);
          return;
        }
        
        setTimeout(checkAgent, checkInterval);
      };
      
      checkAgent();
    });
  }

  /**
   * Setup event listeners for monitoring
   */
  setupEventListeners() {
    // Listen for WebRTC voice agent events
    // Monitor connection state
    document.addEventListener('voice-agent-status', (event) => {
      console.log('[VoiceInit] Voice agent status changed:', event.detail);
      this.handleConnectionStateChange(event.detail);
    });
    
    // Monitor errors
    document.addEventListener('voice-agent-error', (event) => {
      console.error('[VoiceInit] Voice agent error:', event.detail);
      this.handleVoiceAgentError(event.detail);
    });
    
    // Monitor ready state
    document.addEventListener('voice-agent-ready', (event) => {
      console.log('[VoiceInit] Voice agent ready:', event.detail);
    });
    
    // Monitor page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('[VoiceInit] Page hidden, pausing voice agent');
        this.pauseVoiceAgent();
      } else {
        console.log('[VoiceInit] Page visible, resuming voice agent');
        this.resumeVoiceAgent();
      }
    });
    
    // Setup global error handling
    window.addEventListener('error', (event) => {
      if (event.filename && event.filename.includes('voice-agent')) {
        console.error('[VoiceInit] Voice agent script error:', event.error);
        this.handleScriptError(event.error);
      }
    });
    
    // Setup unhandled promise rejection handling
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.message && 
          event.reason.message.includes('voice') || 
          event.reason.message.includes('microphone')) {
        console.error('[VoiceInit] Unhandled voice agent promise rejection:', event.reason);
        this.handlePromiseRejection(event.reason);
      }
    });
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    // Check backend health every 5 minutes
    setInterval(async () => {
      try {
        await this.checkBackendHealth();
      } catch (error) {
        console.warn('[VoiceInit] Health monitoring detected backend issue:', error);
        this.handleBackendIssue(error);
      }
    }, 5 * 60 * 1000);
    
    console.log('[VoiceInit] Health monitoring started');
  }

  /**
   * Handle initialization errors with retry logic
   */
  async handleInitializationError(error) {
    this.retryCount++;
    
    if (this.retryCount <= this.maxRetries) {
      console.log(`[VoiceInit] Retrying initialization (${this.retryCount}/${this.maxRetries})...`);
      
      // Exponential backoff
      const delay = this.retryDelay * Math.pow(2, this.retryCount - 1);
      await this.sleep(delay);
      
      return this.initialize();
    } else {
      console.error(`[VoiceInit] Initialization failed after ${this.maxRetries} attempts:`, error);
      this.showInitializationError(error);
      
      // Dispatch failure event
      this.dispatchEvent('voiceAgentInitializationFailed', {
        error: error.message,
        retries: this.retryCount,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle connection state changes
   */
  handleConnectionStateChange(state) {
    switch (state) {
      case 'connected':
        this.clearErrorIndicators();
        break;
      case 'failed':
        this.showConnectionError();
        break;
      case 'reconnecting':
        this.showReconnectingIndicator();
        break;
    }
  }

  /**
   * Handle voice agent errors
   */
  handleVoiceAgentError(error) {
    switch (error.type) {
      case 'microphone_permission_denied':
        this.showMicrophonePermissionError();
        break;
      case 'connection_failed':
        this.showConnectionError();
        break;
      case 'browser_not_supported':
        this.showCompatibilityWarning();
        break;
      default:
        this.showGenericError(error);
    }
  }

  /**
   * Handle script errors
   */
  handleScriptError(error) {
    console.error('[VoiceInit] Script error in voice agent:', error);
    
    // Try to reload the voice agent
    if (this.retryCount < this.maxRetries) {
      setTimeout(() => {
        this.reinitializeVoiceAgent();
      }, 2000);
    }
  }

  /**
   * Handle promise rejections
   */
  handlePromiseRejection(reason) {
    console.error('[VoiceInit] Promise rejection in voice agent:', reason);
    
    // Show user-friendly error
    if (reason.message.includes('Permission denied')) {
      this.showMicrophonePermissionError();
    } else if (reason.message.includes('network') || reason.message.includes('connection')) {
      this.showConnectionError();
    }
  }

  /**
   * Handle backend issues
   */
  handleBackendIssue(error) {
    // Show temporary error indicator
    this.showTemporaryError('Voice features temporarily unavailable');
    
    // Dispatch event to attempt reconnection
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('voice-agent-reconnect'));
    }, 10000);
  }

  /**
   * Pause voice agent when page is hidden
   */
  pauseVoiceAgent() {
    // Dispatch event to pause WebRTC voice agent
    document.dispatchEvent(new CustomEvent('voice-agent-pause'));
  }

  /**
   * Resume voice agent when page becomes visible
   */
  resumeVoiceAgent() {
    // Dispatch event to resume WebRTC voice agent
    document.dispatchEvent(new CustomEvent('voice-agent-resume'));
  }

  /**
   * Reinitialize voice agent
   */
  async reinitializeVoiceAgent() {
    console.log('[VoiceInit] Reinitializing voice agent...');
    
    try {
      // Dispatch cleanup event
      document.dispatchEvent(new CustomEvent('voice-agent-cleanup'));
      
      // Wait a bit before reinitializing
      await this.sleep(1000);
      
      // Reinitialize
      await this.initialize();
      
    } catch (error) {
      console.error('[VoiceInit] Reinitialization failed:', error);
    }
  }

  /**
   * Show compatibility warning
   */
  showCompatibilityWarning() {
    this.showNotification(
      'Your browser may not support all voice features. For the best experience, please use Chrome or Firefox.',
      'warning',
      { persistent: true }
    );
  }

  /**
   * Show initialization error
   */
  showInitializationError(error) {
    this.showNotification(
      'Voice assistant could not be initialized. Please refresh the page to try again.',
      'error',
      { persistent: true, action: { text: 'Refresh', onclick: () => location.reload() } }
    );
  }

  /**
   * Show microphone permission error
   */
  showMicrophonePermissionError() {
    this.showNotification(
      'Microphone access is required for voice features. Please enable microphone permissions and refresh the page.',
      'warning',
      { persistent: true }
    );
  }

  /**
   * Show connection error
   */
  showConnectionError() {
    this.showNotification(
      'Connection to voice services lost. Please check your internet connection.',
      'error',
      { timeout: 5000 }
    );
  }

  /**
   * Show reconnecting indicator
   */
  showReconnectingIndicator() {
    this.showNotification(
      'Reconnecting to voice services...',
      'info',
      { timeout: 3000 }
    );
  }

  /**
   * Show temporary error
   */
  showTemporaryError(message) {
    this.showNotification(message, 'warning', { timeout: 5000 });
  }

  /**
   * Show generic error
   */
  showGenericError(error) {
    this.showNotification(
      `Voice assistant error: ${error.message}`,
      'error',
      { timeout: 5000 }
    );
  }

  /**
   * Clear error indicators
   */
  clearErrorIndicators() {
    // Remove any persistent error notifications
    const notifications = document.querySelectorAll('[data-voice-init-notification]');
    notifications.forEach(notification => {
      if (notification.dataset.persistent !== 'true') {
        notification.remove();
      }
    });
  }

  /**
   * Show notification to user
   */
  showNotification(message, type = 'info', options = {}) {
    // Dispatch notification event for voice assistant to handle
    document.dispatchEvent(new CustomEvent('voice-agent-notification', {
      detail: { message, type }
    }));
    
    // Fallback: create simple notification
    const notification = document.createElement('div');
    notification.setAttribute('data-voice-init-notification', 'true');
    if (options.persistent) {
      notification.setAttribute('data-persistent', 'true');
    }
    
    const colors = {
      info: 'bg-blue-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500'
    };
    
    notification.className = `fixed top-4 right-4 z-[1002] ${colors[type]} text-white p-4 rounded-lg shadow-lg max-w-md`;
    notification.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-1 text-sm">${message}</div>
        ${!options.persistent ? `
          <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        ` : ''}
      </div>
      ${options.action ? `
        <div class="mt-2">
          <button onclick="${options.action.onclick}" class="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm transition-colors">
            ${options.action.text}
          </button>
        </div>
      ` : ''}
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after timeout
    if (options.timeout && !options.persistent) {
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, options.timeout);
    }
  }

  /**
   * Dispatch custom event
   */
  dispatchEvent(name, detail) {
    const event = new CustomEvent(name, { detail });
    document.dispatchEvent(event);
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize when script loads
if (typeof window !== 'undefined') {
  // Create global initializer instance
  window.VoiceAgentInitializer = new VoiceAgentInitializer();
  
  // Export for external access
  window.initializeVoiceAgent = () => {
    return window.VoiceAgentInitializer.initialize();
  };
}

export default VoiceAgentInitializer;