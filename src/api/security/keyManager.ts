/**
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Advanced API Key Management System with encryption, rotation, and monitoring
 * @version: 1.0.0
 * @init-author: engineer-agent
 * @init-cc-sessionId: cc-eng-20250806-secure-api
 * @init-timestamp: 2025-08-06T00:00:00Z
 * @reasoning:
 * - **Objective:** Implement enterprise-grade API key security following 2025 best practices
 * - **Strategy:** Multi-layered security with encryption, rotation, monitoring, and zero-trust architecture
 * - **Outcome:** Secure API key management system preventing exposure and enabling audit trails
 */

import crypto from 'crypto';
import { SecurityAuditor, type SecurityAuditLog } from '../config/security';

export interface SecureKeyConfig {
  encryptionKey: string;
  keyRotationIntervalHours: number;
  maxKeyAge: number;
  enableAutoRotation: boolean;
  enableUsageMonitoring: boolean;
  alertThresholds: {
    unusualUsage: number;
    suspiciousActivity: number;
    errorRate: number;
  };
}

export interface KeyMetadata {
  keyId: string;
  createdAt: number;
  lastUsed: number;
  usageCount: number;
  isActive: boolean;
  rotationScheduled?: number;
  environment: 'development' | 'staging' | 'production';
}

export interface KeyUsageEvent {
  timestamp: number;
  keyId: string;
  clientIP: string;
  operation: string;
  success: boolean;
  errorCode?: string;
  requestSignature: string;
}

/**
 * Secure API Key Manager with encryption, rotation, and comprehensive monitoring
 * Implements zero-trust security model with defense-in-depth approach
 */
export class SecureKeyManager {
  private keys: Map<string, { encrypted: string; metadata: KeyMetadata }> = new Map();
  private usageHistory: KeyUsageEvent[] = [];
  private rotationTimer: NodeJS.Timeout | null = null;
  private readonly algorithm = 'aes-256-gcm';

  constructor(private config: SecureKeyConfig) {
    this.initializeRotationScheduler();
    this.startUsageMonitoring();
  }

  /**
   * Encrypt API key using AES-256-GCM
   */
  private encrypt(plaintext: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.config.encryptionKey);
    cipher.setAAD(Buffer.from('apikey'));

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  /**
   * Decrypt API key using AES-256-GCM
   */
  private decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = crypto.createDecipher(this.algorithm, this.config.encryptionKey);
    decipher.setAAD(Buffer.from('apikey'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate secure key ID
   */
  private generateKeyId(): string {
    return `key_${crypto.randomBytes(16).toString('hex')}`;
  }

  /**
   * Generate request signature for additional security
   */
  public generateRequestSignature(
    keyId: string,
    timestamp: number,
    clientIP: string,
    operation: string
  ): string {
    const payload = `${keyId}:${timestamp}:${clientIP}:${operation}`;
    return crypto.createHmac('sha256', this.config.encryptionKey)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify request signature
   */
  public verifyRequestSignature(
    signature: string,
    keyId: string,
    timestamp: number,
    clientIP: string,
    operation: string
  ): boolean {
    const expectedSignature = this.generateRequestSignature(keyId, timestamp, clientIP, operation);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }

  /**
   * Store API key securely with encryption
   */
  public storeKey(
    plainApiKey: string,
    environment: 'development' | 'staging' | 'production' = 'production'
  ): string {
    const keyId = this.generateKeyId();
    const encryptedKey = this.encrypt(plainApiKey);
    
    const metadata: KeyMetadata = {
      keyId,
      createdAt: Date.now(),
      lastUsed: 0,
      usageCount: 0,
      isActive: true,
      environment
    };

    this.keys.set(keyId, {
      encrypted: JSON.stringify(encryptedKey),
      metadata
    });

    // Schedule rotation if auto-rotation is enabled
    if (this.config.enableAutoRotation) {
      metadata.rotationScheduled = Date.now() + (this.config.keyRotationIntervalHours * 60 * 60 * 1000);
    }

    // Audit log
    SecurityAuditor.log({
      timestamp: Date.now(),
      event: 'API_KEY_STORED',
      clientIP: 'system',
      details: { keyId, environment },
      severity: 'medium'
    });

    console.log(`🔐 API key stored securely: ${keyId} (${environment})`);
    return keyId;
  }

  /**
   * Retrieve and decrypt API key with usage tracking
   */
  public getKey(
    keyId: string,
    clientIP: string,
    operation: string,
    requestSignature?: string
  ): string | null {
    const keyData = this.keys.get(keyId);
    if (!keyData || !keyData.metadata.isActive) {
      this.logUsageEvent(keyId, clientIP, operation, false, 'KEY_NOT_FOUND');
      return null;
    }

    // Verify request signature if provided
    if (requestSignature) {
      const isValidSignature = this.verifyRequestSignature(
        requestSignature,
        keyId,
        Date.now(),
        clientIP,
        operation
      );
      
      if (!isValidSignature) {
        this.logUsageEvent(keyId, clientIP, operation, false, 'INVALID_SIGNATURE');
        SecurityAuditor.log({
          timestamp: Date.now(),
          event: 'INVALID_REQUEST_SIGNATURE',
          clientIP,
          details: { keyId, operation },
          severity: 'high'
        });
        return null;
      }
    }

    // Check if key has expired
    if (this.isKeyExpired(keyData.metadata)) {
      this.deactivateKey(keyId, 'EXPIRED');
      this.logUsageEvent(keyId, clientIP, operation, false, 'KEY_EXPIRED');
      return null;
    }

    try {
      const encryptedData = JSON.parse(keyData.encrypted);
      const plainKey = this.decrypt(encryptedData);
      
      // Update usage metadata
      keyData.metadata.lastUsed = Date.now();
      keyData.metadata.usageCount++;
      
      this.logUsageEvent(keyId, clientIP, operation, true);
      
      // Check for unusual usage patterns
      this.checkUsagePatterns(keyId, clientIP);
      
      return plainKey;
    } catch (error) {
      this.logUsageEvent(keyId, clientIP, operation, false, 'DECRYPTION_ERROR');
      SecurityAuditor.log({
        timestamp: Date.now(),
        event: 'KEY_DECRYPTION_FAILED',
        clientIP,
        details: { keyId, error: error instanceof Error ? error.message : 'Unknown error' },
        severity: 'critical'
      });
      return null;
    }
  }

  /**
   * Check for unusual usage patterns and flag suspicious activity
   */
  private checkUsagePatterns(keyId: string, clientIP: string): void {
    const recentEvents = this.usageHistory
      .filter(event => 
        event.keyId === keyId && 
        event.timestamp > Date.now() - 60000 && // Last minute
        event.clientIP === clientIP
      );

    const requestCount = recentEvents.length;
    const errorRate = recentEvents.filter(event => !event.success).length / requestCount;

    // Check for unusual usage volume
    if (requestCount > this.config.alertThresholds.unusualUsage) {
      SecurityAuditor.log({
        timestamp: Date.now(),
        event: 'UNUSUAL_USAGE_PATTERN',
        clientIP,
        details: { keyId, requestCount, timeWindow: '1m' },
        severity: 'medium'
      });
    }

    // Check for high error rate
    if (errorRate > this.config.alertThresholds.errorRate) {
      SecurityAuditor.log({
        timestamp: Date.now(),
        event: 'HIGH_ERROR_RATE',
        clientIP,
        details: { keyId, errorRate, requestCount },
        severity: 'high'
      });
    }

    // Check for suspicious activity (multiple failed attempts)
    const failedAttempts = recentEvents.filter(event => !event.success).length;
    if (failedAttempts > this.config.alertThresholds.suspiciousActivity) {
      this.temporarilyBlockKey(keyId, 300000); // 5 minutes
      SecurityAuditor.log({
        timestamp: Date.now(),
        event: 'SUSPICIOUS_ACTIVITY_DETECTED',
        clientIP,
        details: { keyId, failedAttempts, action: 'key_temporarily_blocked' },
        severity: 'critical'
      });
    }
  }

  /**
   * Log key usage event
   */
  private logUsageEvent(
    keyId: string,
    clientIP: string,
    operation: string,
    success: boolean,
    errorCode?: string
  ): void {
    const event: KeyUsageEvent = {
      timestamp: Date.now(),
      keyId,
      clientIP,
      operation,
      success,
      errorCode,
      requestSignature: this.generateRequestSignature(keyId, Date.now(), clientIP, operation)
    };

    this.usageHistory.push(event);
    
    // Keep only recent events (last 24 hours)
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    this.usageHistory = this.usageHistory.filter(e => e.timestamp > cutoff);

    if (this.config.enableUsageMonitoring) {
      console.log(`📊 Key usage: ${keyId} | ${operation} | ${success ? '✅' : '❌'} | ${clientIP}`);
    }
  }

  /**
   * Check if key has expired
   */
  private isKeyExpired(metadata: KeyMetadata): boolean {
    return Date.now() - metadata.createdAt > this.config.maxKeyAge;
  }

  /**
   * Deactivate key with reason
   */
  public deactivateKey(keyId: string, reason: string): void {
    const keyData = this.keys.get(keyId);
    if (keyData) {
      keyData.metadata.isActive = false;
      
      SecurityAuditor.log({
        timestamp: Date.now(),
        event: 'API_KEY_DEACTIVATED',
        clientIP: 'system',
        details: { keyId, reason },
        severity: 'medium'
      });
      
      console.log(`🚫 API key deactivated: ${keyId} (${reason})`);
    }
  }

  /**
   * Temporarily block key for security purposes
   */
  private temporarilyBlockKey(keyId: string, durationMs: number): void {
    this.deactivateKey(keyId, 'TEMPORARY_SECURITY_BLOCK');
    
    // Reactivate after duration
    setTimeout(() => {
      const keyData = this.keys.get(keyId);
      if (keyData) {
        keyData.metadata.isActive = true;
        console.log(`🔓 API key unblocked: ${keyId}`);
      }
    }, durationMs);
  }

  /**
   * Rotate API key (manual trigger)
   */
  public async rotateKey(keyId: string, newPlainKey: string): Promise<string> {
    const oldKeyData = this.keys.get(keyId);
    if (!oldKeyData) {
      throw new Error(`Key ${keyId} not found`);
    }

    // Create new key
    const newKeyId = this.storeKey(newPlainKey, oldKeyData.metadata.environment);
    
    // Schedule old key for deactivation (grace period)
    setTimeout(() => {
      this.deactivateKey(keyId, 'ROTATED');
    }, 30000); // 30 second grace period

    SecurityAuditor.log({
      timestamp: Date.now(),
      event: 'API_KEY_ROTATED',
      clientIP: 'system',
      details: { oldKeyId: keyId, newKeyId },
      severity: 'low'
    });

    console.log(`🔄 API key rotated: ${keyId} → ${newKeyId}`);
    return newKeyId;
  }

  /**
   * Initialize automatic key rotation scheduler
   */
  private initializeRotationScheduler(): void {
    if (!this.config.enableAutoRotation) return;

    this.rotationTimer = setInterval(() => {
      const now = Date.now();
      
      for (const [keyId, keyData] of this.keys.entries()) {
        if (keyData.metadata.rotationScheduled && now >= keyData.metadata.rotationScheduled) {
          console.log(`⚠️ API key ${keyId} requires rotation - manual intervention needed`);
          
          SecurityAuditor.log({
            timestamp: Date.now(),
            event: 'API_KEY_ROTATION_REQUIRED',
            clientIP: 'system',
            details: { keyId, environment: keyData.metadata.environment },
            severity: 'medium'
          });
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Start usage monitoring
   */
  private startUsageMonitoring(): void {
    if (!this.config.enableUsageMonitoring) return;

    // Generate usage report every hour
    setInterval(() => {
      const report = this.generateUsageReport();
      console.log('📈 API Key Usage Report:', report);
    }, 60 * 60 * 1000);
  }

  /**
   * Generate usage report
   */
  public generateUsageReport(): {
    totalKeys: number;
    activeKeys: number;
    totalRequests: number;
    successRate: number;
    topOperations: Array<{ operation: string; count: number }>;
  } {
    const totalKeys = this.keys.size;
    const activeKeys = Array.from(this.keys.values()).filter(k => k.metadata.isActive).length;
    const totalRequests = this.usageHistory.length;
    const successfulRequests = this.usageHistory.filter(e => e.success).length;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;

    // Count operations
    const operationCounts = new Map<string, number>();
    this.usageHistory.forEach(event => {
      const count = operationCounts.get(event.operation) || 0;
      operationCounts.set(event.operation, count + 1);
    });

    const topOperations = Array.from(operationCounts.entries())
      .map(([operation, count]) => ({ operation, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalKeys,
      activeKeys,
      totalRequests,
      successRate,
      topOperations
    };
  }

  /**
   * Get key metadata (for monitoring)
   */
  public getKeyMetadata(keyId: string): KeyMetadata | null {
    const keyData = this.keys.get(keyId);
    return keyData ? { ...keyData.metadata } : null;
  }

  /**
   * List all active keys (metadata only)
   */
  public listActiveKeys(): KeyMetadata[] {
    return Array.from(this.keys.values())
      .filter(k => k.metadata.isActive)
      .map(k => ({ ...k.metadata }));
  }

  /**
   * Cleanup expired and inactive keys
   */
  public cleanup(): void {
    const now = Date.now();
    const expiredKeyIds: string[] = [];

    for (const [keyId, keyData] of this.keys.entries()) {
      if (!keyData.metadata.isActive && (now - keyData.metadata.lastUsed > 7 * 24 * 60 * 60 * 1000)) {
        // Remove keys that have been inactive for more than 7 days
        expiredKeyIds.push(keyId);
      }
    }

    expiredKeyIds.forEach(keyId => {
      this.keys.delete(keyId);
      console.log(`🗑️ Removed expired key: ${keyId}`);
    });

    // Cleanup old usage events
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days
    this.usageHistory = this.usageHistory.filter(e => e.timestamp > cutoff);

    if (expiredKeyIds.length > 0) {
      SecurityAuditor.log({
        timestamp: Date.now(),
        event: 'EXPIRED_KEYS_CLEANED',
        clientIP: 'system',
        details: { removedCount: expiredKeyIds.length },
        severity: 'low'
      });
    }
  }

  /**
   * Destroy manager and cleanup resources
   */
  public destroy(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
    }
    
    // Clear sensitive data
    this.keys.clear();
    this.usageHistory = [];
    
    console.log('🧹 SecureKeyManager destroyed');
  }
}

/**
 * Default configuration for different environments
 */
export const DEFAULT_KEY_CONFIGS = {
  development: {
    encryptionKey: process.env.KEY_ENCRYPTION_SECRET || crypto.randomBytes(32).toString('hex'),
    keyRotationIntervalHours: 24 * 7, // 1 week
    maxKeyAge: 24 * 60 * 60 * 1000 * 30, // 30 days
    enableAutoRotation: false,
    enableUsageMonitoring: true,
    alertThresholds: {
      unusualUsage: 100,
      suspiciousActivity: 10,
      errorRate: 0.5
    }
  },
  production: {
    encryptionKey: process.env.KEY_ENCRYPTION_SECRET!,
    keyRotationIntervalHours: 24 * 3, // 3 days
    maxKeyAge: 24 * 60 * 60 * 1000 * 7, // 7 days
    enableAutoRotation: true,
    enableUsageMonitoring: true,
    alertThresholds: {
      unusualUsage: 50,
      suspiciousActivity: 5,
      errorRate: 0.3
    }
  }
} as const;

/**
 * Singleton instance manager
 */
let keyManagerInstance: SecureKeyManager | null = null;

export function getKeyManager(environment: 'development' | 'production' = 'production'): SecureKeyManager {
  if (!keyManagerInstance) {
    const config = DEFAULT_KEY_CONFIGS[environment];
    keyManagerInstance = new SecureKeyManager(config);
  }
  return keyManagerInstance;
}

export function destroyKeyManager(): void {
  if (keyManagerInstance) {
    keyManagerInstance.destroy();
    keyManagerInstance = null;
  }
}