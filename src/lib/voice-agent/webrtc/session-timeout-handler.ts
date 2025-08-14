/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Handle 30-minute session timeout for OpenAI Realtime API
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-dev-20250107-timeout
 * @init-timestamp: 2025-01-07T00:00:00Z
 * @reasoning:
 * - **Objective:** Gracefully handle OpenAI's 30-minute session limit
 * - **Strategy:** Proactive warnings, automatic reconnection, session preservation
 * - **Outcome:** Seamless user experience despite API limitations
 */

import { EventEmitter } from 'eventemitter3';

export interface SessionTimeoutEvents {
  'warning': (remainingMinutes: number) => void;
  'timeout': () => void;
  'reconnecting': () => void;
  'reconnected': () => void;
}

export class SessionTimeoutHandler extends EventEmitter<SessionTimeoutEvents> {
  private sessionStartTime: number = 0;
  private warningTimer?: NodeJS.Timeout;
  private timeoutTimer?: NodeJS.Timeout;
  private checkInterval?: NodeJS.Timeout;
  
  // OpenAI Realtime API limits
  private readonly MAX_SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly WARNING_THRESHOLD = 5 * 60 * 1000; // Warn 5 minutes before timeout
  private readonly RECONNECT_BUFFER = 30 * 1000; // Reconnect 30 seconds before timeout
  
  constructor() {
    super();
  }

  /**
   * Start tracking session time
   */
  startSession(): void {
    this.sessionStartTime = Date.now();
    this.clearTimers();
    
    // Set warning timer - Multiple warnings as session approaches timeout
    // First warning at 25 minutes (5 minutes remaining)
    this.warningTimer = setTimeout(() => {
      const remainingMinutes = 5;
      console.log(`[SessionTimeout] Warning: Session will expire in ${remainingMinutes} minutes`);
      this.emit('warning', remainingMinutes);
      
      // Additional warnings
      // 3 minutes remaining (at 27 minute mark)
      setTimeout(() => {
        console.log(`[SessionTimeout] Warning: Session will expire in 3 minutes`);
        this.emit('warning', 3);
      }, 2 * 60 * 1000); // 2 minutes after first warning
      
      // 1 minute remaining (at 29 minute mark)
      setTimeout(() => {
        console.log(`[SessionTimeout] Warning: Session will expire in 1 minute`);
        this.emit('warning', 1);
      }, 4 * 60 * 1000); // 4 minutes after first warning
    }, this.MAX_SESSION_DURATION - this.WARNING_THRESHOLD);
    
    // Set proactive reconnect timer (29.5 minutes)
    this.timeoutTimer = setTimeout(() => {
      console.log('[SessionTimeout] Proactively reconnecting before 30-minute timeout');
      console.log(`[SessionTimeout] Session duration: ${this.getSessionDuration() / 1000}s, triggering reconnect`);
      this.emit('timeout');
    }, this.MAX_SESSION_DURATION - this.RECONNECT_BUFFER);
    
    // Start periodic check
    this.startPeriodicCheck();
    
    console.log('[SessionTimeout] Session tracking started (30 minute duration)');
    console.log(`[SessionTimeout] Warnings will appear at: 25min, 27min, 29min. Reconnect at: 29.5min`);
  }

  /**
   * Stop tracking session time
   */
  stopSession(): void {
    this.clearTimers();
    this.sessionStartTime = 0;
    console.log('[SessionTimeout] Session tracking stopped');
  }

  /**
   * Get remaining session time in milliseconds
   */
  getRemainingTime(): number {
    if (!this.sessionStartTime) return this.MAX_SESSION_DURATION;
    
    const elapsed = Date.now() - this.sessionStartTime;
    const remaining = Math.max(0, this.MAX_SESSION_DURATION - elapsed);
    return remaining;
  }

  /**
   * Get remaining session time as formatted string
   */
  getRemainingTimeFormatted(): string {
    const remaining = this.getRemainingTime();
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get session duration in milliseconds
   */
  getSessionDuration(): number {
    if (!this.sessionStartTime) return 0;
    return Date.now() - this.sessionStartTime;
  }

  /**
   * Check if session is near timeout
   */
  isNearTimeout(): boolean {
    return this.getRemainingTime() < this.WARNING_THRESHOLD;
  }

  /**
   * Reset session timer (for use after reconnection)
   */
  resetSession(): void {
    console.log('[SessionTimeout] Resetting session timer after reconnection');
    this.startSession();
    this.emit('reconnected');
  }

  /**
   * Start periodic check for session health
   */
  private startPeriodicCheck(): void {
    // Check every minute
    this.checkInterval = setInterval(() => {
      const remaining = this.getRemainingTime();
      const remainingMinutes = Math.floor(remaining / 60000);
      const remainingSeconds = Math.floor((remaining % 60000) / 1000);
      
      // Log status every 5 minutes
      if (remainingMinutes % 5 === 0 && remainingSeconds < 5) {
        console.log(`[SessionTimeout] Status: ${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')} remaining`);
      }
      
      // Check if we should proactively reconnect
      if (remaining < this.RECONNECT_BUFFER && remaining > 0) {
        console.log('[SessionTimeout] Triggering proactive reconnection NOW');
        this.emit('timeout');
        this.clearTimers();
      }
    }, 60 * 1000); // Check every minute
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = undefined;
    }
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = undefined;
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
  }

  /**
   * Handle session timeout error from API
   */
  handleTimeoutError(error: any): boolean {
    if (error.message?.includes('maximum duration of 30 minutes')) {
      console.log('[SessionTimeout] Detected 30-minute timeout error from API');
      this.emit('timeout');
      return true;
    }
    return false;
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    duration: number;
    remaining: number;
    remainingFormatted: string;
    isNearTimeout: boolean;
    percentUsed: number;
  } {
    const duration = this.getSessionDuration();
    const remaining = this.getRemainingTime();
    
    return {
      duration,
      remaining,
      remainingFormatted: this.getRemainingTimeFormatted(),
      isNearTimeout: this.isNearTimeout(),
      percentUsed: Math.min(100, (duration / this.MAX_SESSION_DURATION) * 100)
    };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.clearTimers();
    this.removeAllListeners();
  }
}

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-dev-20250107-timeout
 * @timestamp: 2025-01-07T00:00:00Z
 * @reasoning:
 * - **Objective:** Handle OpenAI's 30-minute session limit gracefully
 * - **Strategy:** Proactive monitoring, warnings, and automatic reconnection
 * - **Outcome:** Better user experience with session continuity
 */