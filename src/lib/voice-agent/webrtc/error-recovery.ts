/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Comprehensive error recovery and reconnection system for WebRTC
 * @version: 1.0.0
 * @init-author: engineer-agent
 * @init-cc-sessionId: cc-eng-20250801-001
 * @init-timestamp: 2025-08-01T12:00:00Z
 * @reasoning:
 * - **Objective:** Bulletproof error handling and automatic recovery
 * - **Strategy:** Multi-layered recovery strategies with fallback mechanisms
 * - **Outcome:** Seamless user experience even under adverse conditions
 */

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.1
 * @author: engineer-agent
 * @cc-sessionId: cc-eng-20250801-002
 * @timestamp: 2025-08-01T14:30:00Z
 * @reasoning:
 * - **Objective:** Fix TypeError issues in error recovery strategies
 * - **Strategy:** Add comprehensive null checking and function validation
 * - **Outcome:** Bulletproof error recovery with no runtime TypeErrors
 */

import type { 
  VoiceAgentError, 
  ErrorInfo, 
  ConnectionState,
  EphemeralToken 
} from '../../../features/voice-agent/types/index';

/**
 * Recovery strategy definition
 */
interface RecoveryStrategy {
  name: string;
  priority: number;
  applicable: (error: ErrorInfo) => boolean;
  execute: () => Promise<boolean>;
  maxAttempts: number;
  delayMs: number;
}

/**
 * Recovery state tracking
 */
interface RecoveryState {
  strategy: string;
  attempt: number;
  maxAttempts: number;
  lastAttempt: number;
  totalAttempts: number;
  successful: boolean;
  error?: ErrorInfo;
}

/**
 * Comprehensive Error Recovery System
 */
export class ErrorRecoveryManager {
  private recoveryStrategies: RecoveryStrategy[] = [];
  private activeRecovery?: RecoveryState;
  private eventListeners: Map<string, Function[]> = new Map();
  private recoveryHistory: RecoveryState[] = [];
  private circuitBreakerState: 'closed' | 'open' | 'half-open' = 'closed';
  private circuitBreakerFailures = 0;
  private circuitBreakerTimeout?: NodeJS.Timeout;
  private isRecovering = false;

  // Circuit breaker thresholds
  private readonly circuitBreakerThreshold = 5;
  private readonly circuitBreakerTimeoutMs = 30000; // 30 seconds

  constructor(
    private readonly getConnection: () => any,
    private readonly getAudioProcessor: () => any,
    private readonly getNetworkMonitor: () => any,
    private readonly refreshToken: () => Promise<EphemeralToken>
  ) {
    this.initializeRecoveryStrategies();
  }

  /**
   * Initialize recovery strategies in priority order
   */
  private initializeRecoveryStrategies(): void {
    this.recoveryStrategies = [
      // High priority: Simple reconnection
      {
        name: 'simple-reconnect',
        priority: 1,
        applicable: (error) => error.type === 'connection_failed' || error.type === 'network_error',
        execute: this.executeSimpleReconnect.bind(this),
        maxAttempts: 3,
        delayMs: 1000
      },

      // High priority: Token refresh
      {
        name: 'token-refresh',
        priority: 1,
        applicable: (error) => error.type === 'token_expired',
        execute: this.executeTokenRefresh.bind(this),
        maxAttempts: 2,
        delayMs: 500
      },

      // Medium priority: Audio system restart
      {
        name: 'audio-restart',
        priority: 2,
        applicable: (error) => error.type === 'audio_not_supported' || error.type === 'microphone_permission_denied',
        execute: this.executeAudioRestart.bind(this),
        maxAttempts: 2,
        delayMs: 2000
      },

      // Medium priority: Network quality adjustment
      {
        name: 'quality-adjustment',
        priority: 2,
        applicable: (error) => error.type === 'network_error',
        execute: this.executeQualityAdjustment.bind(this),
        maxAttempts: 3,
        delayMs: 1000
      },

      // Low priority: Full system reset
      {
        name: 'full-reset',
        priority: 3,
        applicable: () => true, // Always applicable as last resort
        execute: this.executeFullReset.bind(this),
        maxAttempts: 1,
        delayMs: 5000
      },

      // Last resort: Fallback mode
      {
        name: 'fallback-mode',
        priority: 4,
        applicable: () => true,
        execute: this.executeFallbackMode.bind(this),
        maxAttempts: 1,
        delayMs: 0
      }
    ];
  }

  /**
   * Handle error with appropriate recovery strategy
   */
  async handleError(error: ErrorInfo): Promise<boolean> {
    // Prevent multiple concurrent recovery attempts
    if (this.isRecovering) {
      console.log('[ErrorRecoveryManager] Already recovering, skipping duplicate error');
      return false;
    }

    // Check circuit breaker
    if (this.circuitBreakerState === 'open') {
      this.emit('circuitBreakerOpen', { error });
      return false;
    }

    // Skip recovery for non-recoverable errors
    if (!error.recoverable) {
      this.emit('nonRecoverableError', { error });
      return false;
    }
    
    this.isRecovering = true;

    // Find applicable recovery strategies
    const applicableStrategies = this.recoveryStrategies
      .filter(strategy => strategy.applicable(error))
      .sort((a, b) => a.priority - b.priority);

    if (applicableStrategies.length === 0) {
      this.emit('noRecoveryStrategy', { error });
      this.isRecovering = false;
      return false;
    }

    try {
      // Try each strategy
      for (const strategy of applicableStrategies) {
        const success = await this.executeRecoveryStrategy(strategy, error);
        
        if (success) {
          this.circuitBreakerFailures = 0;
          this.circuitBreakerState = 'closed';
          this.isRecovering = false;
          return true;
        }
      }

      // All strategies failed
      this.handleRecoveryFailure();
      return false;
    } finally {
      this.isRecovering = false;
    }
  }

  /**
   * Execute a specific recovery strategy
   */
  private async executeRecoveryStrategy(strategy: RecoveryStrategy, error: ErrorInfo): Promise<boolean> {
    this.activeRecovery = {
      strategy: strategy.name,
      attempt: 0,
      maxAttempts: strategy.maxAttempts,
      lastAttempt: Date.now(),
      totalAttempts: 0,
      successful: false,
      error
    };

    this.emit('recoveryStarted', { strategy: strategy.name, error });

    for (let attempt = 1; attempt <= strategy.maxAttempts; attempt++) {
      this.activeRecovery.attempt = attempt;
      this.activeRecovery.totalAttempts++;

      try {
        // Add delay before retry (except first attempt)
        if (attempt > 1) {
          const delay = strategy.delayMs * Math.pow(2, attempt - 2); // Exponential backoff
          await this.delay(delay);
        }

        this.emit('recoveryAttempt', { 
          strategy: strategy.name, 
          attempt, 
          maxAttempts: strategy.maxAttempts 
        });

        const success = await strategy.execute();

        if (success) {
          this.activeRecovery.successful = true;
          this.recoveryHistory.push({ ...this.activeRecovery });
          this.activeRecovery = undefined;

          this.emit('recoverySuccess', { strategy: strategy.name, attempt });
          return true;
        }

      } catch (recoveryError) {
        console.error(`Recovery strategy ${strategy.name} failed:`, recoveryError);
        this.emit('recoveryError', { 
          strategy: strategy.name, 
          attempt, 
          error: recoveryError 
        });
      }
    }

    // Strategy exhausted
    this.activeRecovery.successful = false;
    this.recoveryHistory.push({ ...this.activeRecovery });
    this.activeRecovery = undefined;

    this.emit('recoveryExhausted', { strategy: strategy.name });
    return false;
  }

  /**
   * Simple reconnection strategy
   */
  private async executeSimpleReconnect(): Promise<boolean> {
    try {
      const connection = this.getConnection();
      
      if (connection && typeof connection.disconnect === 'function' && typeof connection.connect === 'function') {
        await connection.disconnect();
        await this.delay(1000);
        
        // Get fresh token if needed
        const token = await this.refreshToken();
        await connection.connect(token);
        
        return connection.isConnected || false;
      }
      
      return false;
    } catch (error) {
      console.error('Simple reconnect failed:', error);
      return false;
    }
  }

  /**
   * Token refresh strategy
   */
  private async executeTokenRefresh(): Promise<boolean> {
    try {
      const connection = this.getConnection();
      
      if (connection && typeof connection.connect === 'function') {
        const newToken = await this.refreshToken();
        await connection.connect(newToken);
        
        return connection.isConnected || false;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Audio system restart strategy
   */
  private async executeAudioRestart(): Promise<boolean> {
    try {
      const audioProcessor = this.getAudioProcessor();
      
      if (audioProcessor) {
        // Stop current audio processing if available
        if (typeof audioProcessor.stopRecording === 'function') {
          audioProcessor.stopRecording();
        }
        
        // Don't cleanup the audio context during restart - just reinitialize
        // This prevents the "context closed" errors
        
        // Wait before reinitializing
        await this.delay(1000);
        
        // Don't call ensureAudioContext here - initializeMicrophone will handle it
        
        // Reinitialize with fallback constraints
        const fallbackConstraints = {
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: 16000
          }
        };
        
        if (typeof audioProcessor.initializeMicrophone === 'function') {
          await audioProcessor.initializeMicrophone(fallbackConstraints);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Audio restart failed:', error);
      return false;
    }
  }

  /**
   * Network quality adjustment strategy
   */
  private async executeQualityAdjustment(): Promise<boolean> {
    try {
      const networkMonitor = this.getNetworkMonitor();
      
      if (networkMonitor && typeof networkMonitor.getCurrentQuality === 'function') {
        const quality = await networkMonitor.getCurrentQuality();
        
        // Force lower quality settings for poor network
        if (typeof networkMonitor.getAdaptiveSettings === 'function') {
          const lowQualitySettings = networkMonitor.getAdaptiveSettings('poor');
          
          // Apply settings (this would typically involve reconfiguring the connection)
          this.emit('qualityAdjusted', { settings: lowQualitySettings, quality });
        }
        
        // Try reconnecting with new settings
        return await this.executeSimpleReconnect();
      }
      
      return false;
    } catch (error) {
      console.error('Quality adjustment failed:', error);
      return false;
    }
  }

  /**
   * Full system reset strategy
   */
  private async executeFullReset(): Promise<boolean> {
    try {
      const connection = this.getConnection();
      const audioProcessor = this.getAudioProcessor();
      const networkMonitor = this.getNetworkMonitor();

      // Clean shutdown of all systems
      if (connection && typeof connection.disconnect === 'function') {
        await connection.disconnect();
      }
      
      if (audioProcessor && typeof audioProcessor.cleanup === 'function') {
        await audioProcessor.cleanup();
      }
      
      if (networkMonitor && typeof networkMonitor.stopMonitoring === 'function') {
        networkMonitor.stopMonitoring();
      }

      // Wait for cleanup
      await this.delay(3000);

      // Reinitialize everything
      const token = await this.refreshToken();
      
      if (audioProcessor && typeof audioProcessor.initializeMicrophone === 'function') {
        await audioProcessor.initializeMicrophone();
      }
      
      if (connection && typeof connection.connect === 'function') {
        await connection.connect(token);
      }
      
      if (networkMonitor && typeof networkMonitor.startMonitoring === 'function' && connection && connection.peerConnection) {
        networkMonitor.startMonitoring(connection.peerConnection);
      }

      return connection?.isConnected || false;
      
    } catch (error) {
      console.error('Full reset failed:', error);
      return false;
    }
  }

  /**
   * Fallback mode strategy
   */
  private async executeFallbackMode(): Promise<boolean> {
    try {
      // Activate fallback UI mode (text-only, degraded experience)
      this.emit('fallbackModeActivated', {
        reason: 'All recovery strategies exhausted',
        timestamp: Date.now()
      });

      // This doesn't actually "recover" the connection,
      // but provides a degraded but functional experience
      return true;
      
    } catch (error) {
      console.error('Fallback mode activation failed:', error);
      return false;
    }
  }

  /**
   * Handle complete recovery failure
   */
  private handleRecoveryFailure(): void {
    this.circuitBreakerFailures++;
    
    if (this.circuitBreakerFailures >= this.circuitBreakerThreshold) {
      // Open circuit breaker
      this.circuitBreakerState = 'open';
      
      this.emit('circuitBreakerTripped', {
        failures: this.circuitBreakerFailures,
        threshold: this.circuitBreakerThreshold
      });

      // Set timeout to try half-open state
      this.circuitBreakerTimeout = setTimeout(() => {
        this.circuitBreakerState = 'half-open';
        this.emit('circuitBreakerHalfOpen');
      }, this.circuitBreakerTimeoutMs);
    }
  }

  /**
   * Get recovery status
   */
  getRecoveryStatus(): {
    active: boolean;
    currentStrategy?: string;
    attempt?: number;
    maxAttempts?: number;
    circuitBreakerState: string;
    totalRecoveries: number;
    successfulRecoveries: number;
  } {
    const successful = this.recoveryHistory.filter(r => r.successful).length;
    
    return {
      active: !!this.activeRecovery,
      currentStrategy: this.activeRecovery?.strategy,
      attempt: this.activeRecovery?.attempt,
      maxAttempts: this.activeRecovery?.maxAttempts,
      circuitBreakerState: this.circuitBreakerState,
      totalRecoveries: this.recoveryHistory.length,
      successfulRecoveries: successful
    };
  }

  /**
   * Reset circuit breaker manually
   */
  resetCircuitBreaker(): void {
    this.circuitBreakerState = 'closed';
    this.circuitBreakerFailures = 0;
    
    if (this.circuitBreakerTimeout) {
      clearTimeout(this.circuitBreakerTimeout);
      this.circuitBreakerTimeout = undefined;
    }
    
    this.emit('circuitBreakerReset');
  }

  /**
   * Utility: Delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Event management
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.circuitBreakerTimeout) {
      clearTimeout(this.circuitBreakerTimeout);
    }
    
    this.eventListeners.clear();
    this.recoveryHistory = [];
    this.activeRecovery = undefined;
  }
}