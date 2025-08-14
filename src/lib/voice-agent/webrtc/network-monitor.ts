/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Network quality monitoring and adaptive streaming for WebRTC
 * @version: 1.0.0
 * @init-author: engineer-agent
 * @init-cc-sessionId: cc-eng-20250801-001
 * @init-timestamp: 2025-08-01T12:00:00Z
 * @reasoning:
 * - **Objective:** Monitor network conditions and optimize audio quality
 * - **Strategy:** Real-time network metrics with adaptive quality control
 * - **Outcome:** Optimal voice communication under varying network conditions
 */

/**
 * Network quality metrics
 */
export interface NetworkQuality {
  // Connection metrics
  connectionType: string;
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  downlink: number; // Mbps
  rtt: number; // milliseconds
  
  // WebRTC metrics
  packetsLost: number;
  packetsReceived: number;
  bytesReceived: number;
  bytesSent: number;
  jitter: number;
  
  // Quality indicators
  qualityScore: number; // 1-5 scale
  recommendation: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  
  // Timestamps
  timestamp: number;
  measurementDuration: number;
}

/**
 * Adaptive quality settings
 */
export interface QualitySettings {
  audiobitrate: number;
  sampleRate: number;
  bufferSize: number;
  enableNoiseReduction: boolean;
  enableEchoCancellation: boolean;
  aggressiveOptimization: boolean;
}

/**
 * Network Monitor for WebRTC Quality Optimization
 */
export class NetworkMonitor {
  private peerConnection?: RTCPeerConnection;
  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring = false;
  private baselineMetrics?: NetworkQuality;
  private eventListeners: Map<string, Function[]> = new Map();
  
  // Quality thresholds
  private readonly qualityThresholds = {
    excellent: { rtt: 50, packetsLost: 0.01, jitter: 10 },
    good: { rtt: 100, packetsLost: 0.05, jitter: 20 },
    fair: { rtt: 200, packetsLost: 0.1, jitter: 40 },
    poor: { rtt: 400, packetsLost: 0.2, jitter: 80 },
    critical: { rtt: 800, packetsLost: 0.5, jitter: 150 }
  };

  // Adaptive quality presets
  private readonly qualityPresets: Record<string, QualitySettings> = {
    excellent: {
      audiobitrate: 128000,
      sampleRate: 24000,
      bufferSize: 256,
      enableNoiseReduction: true,
      enableEchoCancellation: true,
      aggressiveOptimization: false
    },
    good: {
      audiobitrate: 96000,
      sampleRate: 16000,
      bufferSize: 512,
      enableNoiseReduction: true,
      enableEchoCancellation: true,
      aggressiveOptimization: false
    },
    fair: {
      audiobitrate: 64000,
      sampleRate: 16000,
      bufferSize: 1024,
      enableNoiseReduction: false,
      enableEchoCancellation: true,
      aggressiveOptimization: true
    },
    poor: {
      audiobitrate: 32000,
      sampleRate: 8000,
      bufferSize: 2048,
      enableNoiseReduction: false,
      enableEchoCancellation: false,
      aggressiveOptimization: true
    },
    critical: {
      audiobitrate: 16000,
      sampleRate: 8000,
      bufferSize: 4096,
      enableNoiseReduction: false,
      enableEchoCancellation: false,
      aggressiveOptimization: true
    }
  };

  constructor(private readonly monitoringIntervalMs = 2000) {}

  /**
   * Start monitoring network quality
   */
  startMonitoring(peerConnection: RTCPeerConnection): void {
    this.peerConnection = peerConnection;
    this.isMonitoring = true;

    // Initial baseline measurement
    this.measureNetworkQuality().then(metrics => {
      this.baselineMetrics = metrics;
      this.emit('baselineEstablished', metrics);
    });

    // Start periodic monitoring
    this.monitoringInterval = setInterval(async () => {
      if (this.isMonitoring && this.peerConnection) {
        const metrics = await this.measureNetworkQuality();
        this.emit('qualityUpdate', metrics);
        
        // Check for quality degradation
        this.checkQualityDegradation(metrics);
      }
    }, this.monitoringIntervalMs);
  }

  /**
   * Stop network monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  /**
   * Measure current network quality
   */
  private async measureNetworkQuality(): Promise<NetworkQuality> {
    const startTime = Date.now();
    
    // Get network information from browser APIs
    const networkInfo = this.getNetworkInformation();
    
    // Get WebRTC statistics
    const webrtcStats = await this.getWebRTCStatistics();
    
    // Calculate quality score
    const qualityScore = this.calculateQualityScore(networkInfo, webrtcStats);
    const recommendation = this.getQualityRecommendation(qualityScore, networkInfo, webrtcStats);
    
    const metrics: NetworkQuality = {
      connectionType: networkInfo.connectionType || 'unknown',
      effectiveType: networkInfo.effectiveType || 'unknown',
      downlink: networkInfo.downlink || 0,
      rtt: networkInfo.rtt || 0,
      packetsLost: webrtcStats.packetsLost || 0,
      packetsReceived: webrtcStats.packetsReceived || 0,
      bytesReceived: webrtcStats.bytesReceived || 0,
      bytesSent: webrtcStats.bytesSent || 0,
      jitter: webrtcStats.jitter || 0,
      qualityScore,
      recommendation,
      timestamp: Date.now(),
      measurementDuration: Date.now() - startTime
    };

    return metrics;
  }

  /**
   * Get network information from browser APIs
   */
  private getNetworkInformation(): Partial<NetworkQuality> {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      return {
        connectionType: connection.type || 'unknown',
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0
      };
    }

    // Fallback for browsers without Network Information API
    return {
      connectionType: 'unknown',
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0
    };
  }

  /**
   * Get WebRTC statistics
   */
  private async getWebRTCStatistics(): Promise<Partial<NetworkQuality>> {
    if (!this.peerConnection) {
      return {
        packetsLost: 0,
        packetsReceived: 0,
        bytesReceived: 0,
        bytesSent: 0,
        jitter: 0
      };
    }

    try {
      const stats = await this.peerConnection.getStats();
      let audioStats = {
        packetsLost: 0,
        packetsReceived: 0,
        bytesReceived: 0,
        bytesSent: 0,
        jitter: 0
      };

      stats.forEach((report) => {
        if (report.type === 'inbound-rtp' && report.mediaType === 'audio') {
          audioStats.packetsLost += report.packetsLost || 0;
          audioStats.packetsReceived += report.packetsReceived || 0;
          audioStats.bytesReceived += report.bytesReceived || 0;
          audioStats.jitter += report.jitter || 0;
        } else if (report.type === 'outbound-rtp' && report.mediaType === 'audio') {
          audioStats.bytesSent += report.bytesSent || 0;
        }
      });

      return audioStats;
    } catch (error) {
      console.error('Failed to get WebRTC statistics:', error);
      return {
        packetsLost: 0,
        packetsReceived: 0,
        bytesReceived: 0,
        bytesSent: 0,
        jitter: 0
      };
    }
  }

  /**
   * Calculate overall quality score (1-5)
   */
  private calculateQualityScore(
    networkInfo: Partial<NetworkQuality>, 
    webrtcStats: Partial<NetworkQuality>
  ): number {
    const weights = {
      rtt: 0.3,
      packetsLost: 0.3,
      jitter: 0.2,
      downlink: 0.2
    };

    // RTT score (lower is better)
    const rttScore = Math.max(1, 5 - (networkInfo.rtt || 0) / 100);
    
    // Packet loss score (lower is better)
    const packetLossRate = webrtcStats.packetsReceived ? 
      (webrtcStats.packetsLost || 0) / webrtcStats.packetsReceived : 0;
    const packetLossScore = Math.max(1, 5 - packetLossRate * 20);
    
    // Jitter score (lower is better)
    const jitterScore = Math.max(1, 5 - (webrtcStats.jitter || 0) / 20);
    
    // Bandwidth score (higher is better, up to a point)
    const bandwidthScore = Math.min(5, 1 + (networkInfo.downlink || 0) / 2);

    const totalScore = 
      rttScore * weights.rtt +
      packetLossScore * weights.packetsLost +
      jitterScore * weights.jitter +
      bandwidthScore * weights.downlink;

    return Math.max(1, Math.min(5, Math.round(totalScore * 10) / 10));
  }

  /**
   * Get quality recommendation based on metrics
   */
  private getQualityRecommendation(
    score: number,
    networkInfo: Partial<NetworkQuality>,
    webrtcStats: Partial<NetworkQuality>
  ): NetworkQuality['recommendation'] {
    const rtt = networkInfo.rtt || 0;
    const packetLossRate = webrtcStats.packetsReceived ? 
      (webrtcStats.packetsLost || 0) / webrtcStats.packetsReceived : 0;
    const jitter = webrtcStats.jitter || 0;

    // Check against thresholds
    if (rtt < this.qualityThresholds.excellent.rtt && 
        packetLossRate < this.qualityThresholds.excellent.packetsLost &&
        jitter < this.qualityThresholds.excellent.jitter) {
      return 'excellent';
    } else if (rtt < this.qualityThresholds.good.rtt && 
               packetLossRate < this.qualityThresholds.good.packetsLost &&
               jitter < this.qualityThresholds.good.jitter) {
      return 'good';
    } else if (rtt < this.qualityThresholds.fair.rtt && 
               packetLossRate < this.qualityThresholds.fair.packetsLost &&
               jitter < this.qualityThresholds.fair.jitter) {
      return 'fair';
    } else if (rtt < this.qualityThresholds.poor.rtt && 
               packetLossRate < this.qualityThresholds.poor.packetsLost &&
               jitter < this.qualityThresholds.poor.jitter) {
      return 'poor';
    } else {
      return 'critical';
    }
  }

  /**
   * Check for quality degradation and recommend actions
   */
  private checkQualityDegradation(currentMetrics: NetworkQuality): void {
    if (!this.baselineMetrics) return;

    const qualityDrop = this.baselineMetrics.qualityScore - currentMetrics.qualityScore;
    
    // Significant quality drop detected
    if (qualityDrop > 1) {
      this.emit('qualityDegradation', {
        current: currentMetrics,
        baseline: this.baselineMetrics,
        degradation: qualityDrop
      });

      // Recommend quality adjustments
      const recommendedSettings = this.getAdaptiveSettings(currentMetrics.recommendation);
      this.emit('qualityAdjustmentRecommended', recommendedSettings);
    }

    // Update baseline periodically
    if (Date.now() - this.baselineMetrics.timestamp > 60000) { // 1 minute
      this.baselineMetrics = currentMetrics;
      this.emit('baselineUpdated', currentMetrics);
    }
  }

  /**
   * Get adaptive quality settings based on network conditions
   */
  getAdaptiveSettings(quality: NetworkQuality['recommendation']): QualitySettings {
    return { ...this.qualityPresets[quality] };
  }

  /**
   * Get current network quality snapshot
   */
  async getCurrentQuality(): Promise<NetworkQuality> {
    return await this.measureNetworkQuality();
  }

  /**
   * Test network latency to specific endpoint
   */
  async testLatency(endpoint: string = 'https://api.openai.com'): Promise<number> {
    const startTime = performance.now();
    
    try {
      await fetch(`${endpoint}/ping`, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      return Math.round(performance.now() - startTime);
    } catch (error) {
      // Fallback to image ping
      return new Promise((resolve) => {
        const img = new Image();
        const start = performance.now();
        
        img.onload = img.onerror = () => {
          resolve(Math.round(performance.now() - start));
        };
        
        img.src = `${endpoint}/favicon.ico?t=${Date.now()}`;
      });
    }
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
    this.stopMonitoring();
    this.eventListeners.clear();
    this.peerConnection = undefined;
    this.baselineMetrics = undefined;
  }
}