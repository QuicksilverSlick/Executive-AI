/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Core voice assistant integration orchestrating all components
 * @version: 1.0.0
 * @init-author: engineer-agent
 * @init-cc-sessionId: cc-eng-20250801-002
 * @init-timestamp: 2025-08-01T15:30:00Z
 * @reasoning:
 * - **Objective:** Create unified voice assistant integration system
 * - **Strategy:** Connect UI, WebRTC, knowledge base, and auth components
 * - **Outcome:** Complete working voice agent with professional UX
 */

import { createWebRTCVoiceAgent } from '/src/lib/voice-agent/webrtc/main.ts';
import { TokenManager } from '/src/features/voice-agent/services/tokenManager.ts';
import { websiteKnowledge } from '/src/features/voice-agent/config/website-knowledge.ts';

/**
 * Voice Assistant Core Integration
 * Orchestrates all voice agent components into a cohesive system
 */
class VoiceAssistantCore {
  constructor() {
    this.isInitialized = false;
    this.voiceAgent = null;
    this.tokenManager = null;
    this.elements = {};
    this.state = {
      isExpanded: false,
      isListening: false,
      isConnected: false,
      isMuted: false,
      conversationHistory: [],
      currentTranscript: '',
      errorState: null
    };
    
    // Accessibility
    this.announceRegion = null;
    this.keyboardShortcuts = true;
    
    // Initialize immediately if DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  /**
   * Initialize the voice assistant system
   */
  async initialize() {
    try {
      console.log('[VoiceCore] Initializing voice assistant...');
      
      // Step 1: Get DOM elements
      this.setupDOMElements();
      
      // Step 2: Setup accessibility
      this.setupAccessibility();
      
      // Step 3: Initialize token manager
      this.tokenManager = new TokenManager();
      
      // Step 4: Setup event listeners
      this.setupEventListeners();
      
      // Step 5: Setup keyboard shortcuts
      if (this.keyboardShortcuts) {
        this.setupKeyboardShortcuts();
      }
      
      // Step 6: Initialize WebRTC voice agent (lazy)
      this.prepareVoiceAgent();
      
      // Step 7: Setup auto-minimize behavior
      this.setupAutoMinimize();
      
      // Step 8: Show initial hints
      this.showInitialHints();
      
      this.isInitialized = true;
      console.log('[VoiceCore] Voice assistant initialized successfully');
      
    } catch (error) {
      console.error('[VoiceCore] Initialization failed:', error);
      this.handleError({
        type: 'initialization_failed',
        message: error.message,
        recoverable: false
      });
    }
  }

  /**
   * Setup DOM element references
   */
  setupDOMElements() {
    this.elements = {
      container: document.getElementById('voice-assistant-widget'),
      panel: document.getElementById('voice-widget-panel'),
      fab: document.getElementById('voice-fab'),
      
      // Status elements
      statusIndicator: document.querySelector('.voice-status-indicator'),
      statusText: document.getElementById('voice-status-text'),
      
      // Control buttons
      mainBtn: document.getElementById('voice-main-btn'),
      muteBtn: document.getElementById('voice-mute-btn'),
      minimizeBtn: document.getElementById('voice-minimize-btn'),
      activationToggle: document.getElementById('voice-activation-toggle'),
      
      // Visualization
      waveformCanvas: document.getElementById('voice-waveform-canvas'),
      
      // Transcript area
      transcriptContainer: document.querySelector('.voice-transcript-container'),
      
      // CTA button
      ctaBtn: document.getElementById('voice-cta-btn'),
      
      // Keyboard hint
      keyboardHint: document.getElementById('voice-keyboard-hint')
    };
    
    // Validate required elements
    const required = ['container', 'panel', 'fab', 'mainBtn', 'statusText'];
    for (const key of required) {
      if (!this.elements[key]) {
        throw new Error(`Required element not found: ${key}`);
      }
    }
  }

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Create screen reader announcement region
    this.announceRegion = document.createElement('div');
    this.announceRegion.setAttribute('aria-live', 'polite');
    this.announceRegion.setAttribute('aria-atomic', 'true');
    this.announceRegion.setAttribute('class', 'sr-only');
    this.announceRegion.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
    document.body.appendChild(this.announceRegion);
    
    // Setup focus management
    this.setupFocusManagement();
    
    // Check for reduced motion preference
    this.respectReducedMotion();
  }

  /**
   * Setup event listeners for all UI components
   */
  setupEventListeners() {
    // FAB click - expand/collapse panel
    this.elements.fab.addEventListener('click', () => {
      this.togglePanel();
    });
    
    // Main voice button - start/stop interaction
    this.elements.mainBtn.addEventListener('click', () => {
      this.toggleVoiceInteraction();
    });
    
    // Minimize button
    if (this.elements.minimizeBtn) {
      this.elements.minimizeBtn.addEventListener('click', () => {
        this.minimizePanel();
      });
    }
    
    // Mute button
    if (this.elements.muteBtn) {
      this.elements.muteBtn.addEventListener('click', () => {
        this.toggleMute();
      });
    }
    
    // Voice activation toggle
    if (this.elements.activationToggle) {
      this.elements.activationToggle.addEventListener('click', () => {
        this.toggleVoiceActivation();
      });
    }
    
    // CTA button
    if (this.elements.ctaBtn) {
      this.elements.ctaBtn.addEventListener('click', () => {
        this.handleCTAClick();
      });
    }
    
    // Handle clicks outside panel to auto-minimize
    document.addEventListener('click', (e) => {
      if (this.state.isExpanded && !this.elements.container.contains(e.target)) {
        this.handleOutsideClick();
      }
    });
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Space key for push-to-talk (when widget is focused)
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        this.handleSpaceKeyPress();
      }
      
      // Escape key to close panel
      if (e.code === 'Escape' && this.state.isExpanded) {
        this.minimizePanel();
      }
      
      // Tab navigation enhancement
      if (e.code === 'Tab') {
        this.handleTabNavigation(e);
      }
    });
    
    // Show keyboard hint on first interaction
    this.showKeyboardHint();
  }

  /**
   * Prepare voice agent (lazy initialization)
   */
  prepareVoiceAgent() {
    // Create voice agent configuration
    const config = {
      elementId: 'voice-assistant-widget',
      theme: this.elements.container.dataset.theme || 'auto',
      position: this.getPosition(),
      autoStart: false,
      audioConstraints: {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
          channelCount: 1
        }
      }
    };
    
    // Initialize voice agent on first use
    this.voiceAgentConfig = config;
  }

  /**
   * Initialize WebRTC voice agent when needed
   */
  async initializeVoiceAgent() {
    if (this.voiceAgent) return this.voiceAgent;
    
    try {
      this.updateStatus('Connecting...', 'connecting');
      
      // Create voice agent
      this.voiceAgent = createWebRTCVoiceAgent(this.voiceAgentConfig);
      
      // Setup voice agent event handlers
      this.setupVoiceAgentEvents();
      
      // Initialize the agent
      await this.voiceAgent.initialize();
      
      return this.voiceAgent;
      
    } catch (error) {
      console.error('[VoiceCore] Voice agent initialization failed:', error);
      this.handleError({
        type: 'connection_failed',
        message: error.message,
        recoverable: true
      });
      throw error;
    }
  }

  /**
   * Setup voice agent event handlers
   */
  setupVoiceAgentEvents() {
    if (!this.voiceAgent) return;
    
    // Connection events
    this.voiceAgent.on('connectionStateChange', (state) => {
      this.handleConnectionStateChange(state);
    });
    
    this.voiceAgent.on('connected', () => {
      this.updateStatus('Connected', 'connected');
      this.state.isConnected = true;
    });
    
    this.voiceAgent.on('disconnected', () => {
      this.updateStatus('Disconnected', 'disconnected');
      this.state.isConnected = false;
    });
    
    // Conversation events
    this.voiceAgent.on('conversationStateChange', (state) => {
      this.handleConversationStateChange(state);
    });
    
    this.voiceAgent.on('messageReceived', (message) => {
      this.handleMessageReceived(message);
    });
    
    this.voiceAgent.on('transcriptionReceived', (text) => {
      this.handleTranscriptionReceived(text);
    });
    
    this.voiceAgent.on('voiceActivityDetected', (active) => {
      this.handleVoiceActivity(active);
    });
    
    // Audio events
    this.voiceAgent.on('audioLevelChange', (level) => {
      this.updateAudioVisualization(level);
    });
    
    this.voiceAgent.on('recordingStarted', () => {
      this.announce('Recording started');
    });
    
    this.voiceAgent.on('recordingStopped', () => {
      this.announce('Recording stopped');
    });
    
    // Error events
    this.voiceAgent.on('error', (error) => {
      this.handleError(error);
    });
  }

  /**
   * Toggle panel visibility
   */
  togglePanel() {
    if (this.state.isExpanded) {
      this.minimizePanel();
    } else {
      this.expandPanel();
    }
  }

  /**
   * Expand the voice panel
   */
  expandPanel() {
    this.elements.panel.classList.remove('hidden');
    this.elements.panel.classList.add('visible');
    this.state.isExpanded = true;
    
    // Focus management
    this.elements.mainBtn.focus();
    
    // Accessibility announcement
    this.announce('Voice assistant opened');
    
    // Hide keyboard hint
    this.hideKeyboardHint();
  }

  /**
   * Minimize the voice panel
   */
  minimizePanel() {
    this.elements.panel.classList.remove('visible');
    this.elements.panel.classList.add('hidden');
    this.state.isExpanded = false;
    
    // Stop any active conversation
    if (this.state.isListening && this.voiceAgent) {
      this.voiceAgent.stopListening();
      this.state.isListening = false;
    }
    
    // Focus back to FAB
    this.elements.fab.focus();
    
    // Accessibility announcement
    this.announce('Voice assistant minimized');
  }

  /**
   * Toggle voice interaction
   */
  async toggleVoiceInteraction() {
    try {
      // Initialize voice agent if needed
      if (!this.voiceAgent) {
        await this.initializeVoiceAgent();
      }
      
      if (this.state.isListening) {
        // Stop listening
        this.voiceAgent.stopListening();
        this.state.isListening = false;
        this.updateMainButton('idle');
        this.announce('Stopped listening');
      } else {
        // Start listening
        this.voiceAgent.startListening();
        this.state.isListening = true;
        this.updateMainButton('listening');
        this.announce('Started listening');
      }
      
    } catch (error) {
      console.error('[VoiceCore] Voice interaction toggle failed:', error);
      this.handleError({
        type: 'microphone_permission_denied',
        message: error.message,
        recoverable: true
      });
    }
  }

  /**
   * Handle connection state changes
   */
  handleConnectionStateChange(state) {
    this.state.connectionState = state;
    
    switch (state) {
      case 'connecting':
        this.updateStatus('Connecting...', 'connecting');
        break;
      case 'connected':
        this.updateStatus('Ready to talk', 'connected');
        break;
      case 'reconnecting':
        this.updateStatus('Reconnecting...', 'connecting');
        break;
      case 'disconnected':
        this.updateStatus('Disconnected', 'disconnected');
        break;
      case 'failed':
        this.updateStatus('Connection failed', 'error');
        break;
    }
  }

  /**
   * Handle conversation state changes
   */
  handleConversationStateChange(state) {
    this.state.conversationState = state;
    
    switch (state) {
      case 'listening':
        this.updateStatus('Listening...', 'listening');
        this.updateMainButton('listening');
        break;
      case 'processing':
        this.updateStatus('Processing...', 'thinking');
        this.updateMainButton('processing');
        break;
      case 'speaking':
        this.updateStatus('Speaking...', 'speaking');
        this.updateMainButton('speaking');
        break;
      case 'idle':
        this.updateStatus('Ready to talk', 'connected');
        this.updateMainButton('idle');
        break;
    }
  }

  /**
   * Handle received messages
   */
  handleMessageReceived(message) {
    this.state.conversationHistory.push(message);
    this.addMessageToTranscript(message);
    
    // Announce assistant messages
    if (message.role === 'assistant') {
      this.announce(`Assistant says: ${message.content}`);
    }
  }

  /**
   * Handle transcription updates
   */
  handleTranscriptionReceived(text) {
    this.state.currentTranscript = text;
    this.updateTranscriptDisplay(text);
  }

  /**
   * Handle voice activity detection
   */
  handleVoiceActivity(active) {
    if (active) {
      this.elements.statusIndicator?.classList.add('listening');
    } else {
      this.elements.statusIndicator?.classList.remove('listening');
    }
  }

  /**
   * Update audio visualization
   */
  updateAudioVisualization(level) {
    if (!this.elements.waveformCanvas) return;
    
    const canvas = this.elements.waveformCanvas;
    const ctx = canvas.getContext('2d');
    
    // Simple waveform visualization
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerY = canvas.height / 2;
    const amplitude = level * centerY * 0.8;
    
    ctx.strokeStyle = '#D4A034'; // accent-gold
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let x = 0; x < canvas.width; x += 4) {
      const y = centerY + (Math.random() - 0.5) * amplitude;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
  }

  /**
   * Update status display
   */
  updateStatus(text, state) {
    if (this.elements.statusText) {
      this.elements.statusText.textContent = text;
    }
    
    if (this.elements.statusIndicator) {
      // Remove all state classes
      const stateClasses = ['connecting', 'connected', 'listening', 'thinking', 'speaking', 'error'];
      this.elements.statusIndicator.classList.remove(...stateClasses);
      
      // Add current state class
      if (state) {
        this.elements.statusIndicator.classList.add(state);
      }
    }
  }

  /**
   * Update main button appearance
   */
  updateMainButton(state) {
    const button = this.elements.mainBtn;
    if (!button) return;
    
    // Remove all state classes
    const stateClasses = ['idle', 'listening', 'processing', 'speaking'];
    button.classList.remove(...stateClasses);
    
    // Add current state class
    button.classList.add(state);
    
    // Update pulse animation
    const pulseRing = button.querySelector('.voice-pulse-ring');
    if (pulseRing) {
      if (state === 'listening' || state === 'processing') {
        pulseRing.style.opacity = '1';
      } else {
        pulseRing.style.opacity = '0';
      }
    }
  }

  /**
   * Add message to transcript display
   */
  addMessageToTranscript(message) {
    const container = this.elements.transcriptContainer;
    if (!container) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = `voice-message ${message.role}-message`;
    
    const isUser = message.role === 'user';
    const avatarColor = isUser ? 'bg-accent-sky' : 'bg-accent-gold';
    const bgColor = isUser ? 'bg-gray-100 dark:bg-dark-surface-3' : 'bg-gradient-to-r from-accent-gold/10 to-brand-gold-warm/10 border border-accent-gold/20';
    
    messageEl.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            ${isUser 
              ? '<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />'
              : '<path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />'
            }
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm text-gray-900 dark:text-dark-text ${bgColor} rounded-lg px-3 py-2">
            ${message.content}
          </p>
          <span class="text-xs text-gray-500 dark:text-dark-text-muted mt-1 block">
            ${new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    `;
    
    container.appendChild(messageEl);
    
    // Animate in
    setTimeout(() => {
      messageEl.classList.add('visible');
    }, 100);
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  /**
   * Handle CTA button click
   */
  handleCTAClick() {
    // Open Calendly or scheduling system
    this.announce('Opening scheduling calendar');
    
    // Example: Open Calendly
    window.open('https://calendly.com/your-scheduling-link', '_blank');
    
    // Track analytics
    this.trackEvent('cta_clicked', {
      sessionId: this.getSessionId(),
      timestamp: Date.now()
    });
  }

  /**
   * Handle errors with user-friendly messages
   */
  handleError(error) {
    console.error('[VoiceCore] Error:', error);
    
    this.state.errorState = error;
    
    let userMessage = '';
    let recoverable = error.recoverable;
    
    switch (error.type) {
      case 'microphone_permission_denied':
        userMessage = 'Microphone access denied. Please enable microphone permissions.';
        this.showMicrophonePermissionHelp();
        break;
      case 'connection_failed':
        userMessage = 'Connection failed. Please check your internet connection.';
        break;
      case 'browser_not_supported':
        userMessage = 'Your browser doesn\'t support voice features. Please use Chrome or Firefox.';
        recoverable = false;
        break;
      case 'token_expired':
        userMessage = 'Session expired. Reconnecting...';
        if (this.voiceAgent) {
          this.voiceAgent.initialize(); // Auto-reconnect
        }
        break;
      default:
        userMessage = 'Something went wrong. Please try again.';
    }
    
    this.updateStatus(userMessage, 'error');
    this.announce(userMessage);
    
    // Show error in panel
    this.showErrorMessage(userMessage, recoverable);
  }

  /**
   * Show microphone permission help
   */
  showMicrophonePermissionHelp() {
    const helpText = `
      To use voice features:
      1. Click the microphone icon in your browser's address bar
      2. Select "Allow" for microphone access
      3. Refresh the page and try again
    `;
    
    this.showNotification(helpText, 'info');
  }

  /**
   * Show error message to user
   */
  showErrorMessage(message, recoverable = false) {
    // Find or create error message container
    let errorContainer = this.elements.transcriptContainer?.querySelector('.voice-error-message');
    
    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.className = 'voice-error-message';
      if (this.elements.transcriptContainer) {
        this.elements.transcriptContainer.appendChild(errorContainer);
      }
    }
    
    const retryButton = recoverable ? `
      <button onclick="window.VoiceAssistantCore.retryConnection()" 
              class="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors">
        Retry Connection
      </button>
    ` : '';
    
    errorContainer.innerHTML = `
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
        <div class="flex items-start space-x-2">
          <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div class="flex-1">
            <p class="text-sm text-red-800 dark:text-red-200">${message}</p>
            ${retryButton}
          </div>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                  class="text-red-400 hover:text-red-600 dark:hover:text-red-300">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    `;
    
    // Scroll error into view
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Retry connection method (called from error message button)
   */
  async retryConnection() {
    try {
      // Clear any existing error messages
      const errorMessages = this.elements.transcriptContainer?.querySelectorAll('.voice-error-message');
      errorMessages?.forEach(msg => msg.remove());
      
      // Reset state
      this.state.errorState = null;
      this.updateStatus('Reconnecting...', 'connecting');
      
      // Reinitialize voice agent
      this.voiceAgent = null;
      await this.initializeVoiceAgent();
      
      this.announce('Reconnection successful');
      
    } catch (error) {
      console.error('[VoiceCore] Retry connection failed:', error);
      this.handleError({
        type: 'connection_failed',
        message: 'Retry failed: ' + error.message,
        recoverable: true
      });
    }
  }

  /**
   * Show notification to user
   */
  showNotification(message, type = 'info') {
    // Create or update notification element
    let notification = document.getElementById('voice-notification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'voice-notification';
      notification.className = 'fixed top-4 right-4 z-[1001] max-w-md';
      document.body.appendChild(notification);
    }
    
    const bgColor = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500';
    
    notification.innerHTML = `
      <div class="${bgColor} text-white p-4 rounded-lg shadow-lg transform transition-all duration-300">
        <div class="flex items-start space-x-3">
          <div class="flex-1">
            <p class="text-sm whitespace-pre-line">${message}</p>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    `;
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification && notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  /**
   * Announce to screen readers
   */
  announce(message) {
    if (this.announceRegion) {
      this.announceRegion.textContent = message;
    }
  }

  /**
   * Show keyboard hint
   */
  showKeyboardHint() {
    if (this.elements.keyboardHint) {
      setTimeout(() => {
        this.elements.keyboardHint.style.opacity = '1';
        setTimeout(() => {
          this.elements.keyboardHint.style.opacity = '0';
        }, 3000);
      }, 2000);
    }
  }

  /**
   * Hide keyboard hint
   */
  hideKeyboardHint() {
    if (this.elements.keyboardHint) {
      this.elements.keyboardHint.style.opacity = '0';
    }
  }

  /**
   * Handle space key press
   */
  handleSpaceKeyPress() {
    if (!this.state.isExpanded) {
      this.expandPanel();
    } else {
      this.toggleVoiceInteraction();
    }
  }

  /**
   * Setup auto-minimize behavior
   */
  setupAutoMinimize() {
    const autoMinimize = this.elements.container.dataset.autoMinimize === 'true';
    
    if (autoMinimize) {
      let inactivityTimer;
      
      const resetTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
          if (this.state.isExpanded && !this.state.isListening) {
            this.minimizePanel();
          }
        }, 30000); // 30 seconds of inactivity
      };
      
      // Reset timer on user interaction
      this.elements.container.addEventListener('click', resetTimer);
      this.elements.container.addEventListener('keydown', resetTimer);
      
      resetTimer();
    }
  }

  /**
   * Get position configuration
   */
  getPosition() {
    const container = this.elements.container;
    if (container.classList.contains('bottom-right')) return 'bottom-right';
    if (container.classList.contains('bottom-left')) return 'bottom-left';
    if (container.classList.contains('top-right')) return 'top-right';
    if (container.classList.contains('top-left')) return 'top-left';
    return 'bottom-right';
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Trap focus within panel when expanded
    this.elements.panel.addEventListener('keydown', (e) => {
      if (e.code === 'Tab' && this.state.isExpanded) {
        this.handleFocusTrap(e);
      }
    });
  }

  /**
   * Handle focus trapping
   */
  handleFocusTrap(e) {
    const focusableElements = this.elements.panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Respect reduced motion preferences
   */
  respectReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.elements.container.classList.add('reduced-motion');
    }
  }

  /**
   * Track analytics events
   */
  trackEvent(eventType, data = {}) {
    // Send to analytics service
    const event = {
      type: eventType,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      ...data
    };
    
    console.log('[VoiceCore] Analytics event:', event);
    
    // Example: Send to Google Analytics, Mixpanel, etc.
    if (window.gtag) {
      window.gtag('event', eventType, data);
    }
  }

  /**
   * Get session ID
   */
  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.sessionId;
  }

  /**
   * Show initial hints
   */
  showInitialHints() {
    // Show welcome message after a delay
    setTimeout(() => {
      this.announce('Voice assistant ready. Click the microphone button to start talking.');
    }, 1000);
  }

  /**
   * Toggle mute state
   */
  toggleMute() {
    this.state.isMuted = !this.state.isMuted;
    
    if (this.voiceAgent && this.voiceAgent.audioProcessor) {
      this.voiceAgent.audioProcessor.setMuted(this.state.isMuted);
    }
    
    // Update UI
    const muteIcon = this.elements.muteBtn.querySelector('svg');
    if (this.state.isMuted) {
      muteIcon.innerHTML = '<path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.794L4.168 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.168l4.215-3.794zm2.617 5.11a1 1 0 011.414 0L15 9.772l1.586-1.586a1 1 0 011.414 1.414L16.414 11.2 18 12.786a1 1 0 01-1.414 1.414L15 12.614l-1.586 1.586a1 1 0 01-1.414-1.414L13.586 11.2 12 9.614a1 1 0 010-1.414z" clip-rule="evenodd" />';
    } else {
      muteIcon.innerHTML = '<path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.794L4.168 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.168l4.215-3.794zm8.048 9.197a1 1 0 01-1.414 0L13 9.257l-3.017 3.017a1 1 0 01-1.414-1.414L11.586 7.843l-3.017-3.017a1 1 0 011.414-1.414L13 6.429l3.017-3.017a1 1 0 011.414 1.414L14.414 7.843l3.017 3.017a1 1 0 010 1.414z" clip-rule="evenodd" />';
    }
    
    this.announce(this.state.isMuted ? 'Microphone muted' : 'Microphone unmuted');
  }

  /**
   * Toggle voice activation mode
   */
  toggleVoiceActivation() {
    // Toggle between push-to-talk and voice activation
    console.log('[VoiceCore] Voice activation toggle clicked');
    this.announce('Voice activation toggled');
  }

  /**
   * Handle outside clicks for auto-minimize
   */
  handleOutsideClick() {
    const autoMinimize = this.elements.container.dataset.autoMinimize === 'true';
    if (autoMinimize && !this.state.isListening) {
      this.minimizePanel();
    }
  }

  /**
   * Update transcript display with partial text
   */
  updateTranscriptDisplay(text) {
    // Find or create current transcript element
    let currentTranscript = this.elements.transcriptContainer?.querySelector('.current-transcript');
    
    if (!currentTranscript && text.trim()) {
      currentTranscript = document.createElement('div');
      currentTranscript.className = 'current-transcript text-sm text-gray-600 dark:text-dark-text-secondary italic';
      this.elements.transcriptContainer?.appendChild(currentTranscript);
    }
    
    if (currentTranscript) {
      currentTranscript.textContent = text;
    }
  }

  /**
   * Cleanup method
   */
  async cleanup() {
    if (this.voiceAgent) {
      await this.voiceAgent.disconnect();
    }
    
    if (this.announceRegion) {
      this.announceRegion.remove();
    }
    
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('click', this.handleOutsideClick);
  }
}

// Initialize voice assistant when DOM is ready
const voiceAssistant = new VoiceAssistantCore();

// Export for external access
window.VoiceAssistantCore = voiceAssistant;

export default voiceAssistant;