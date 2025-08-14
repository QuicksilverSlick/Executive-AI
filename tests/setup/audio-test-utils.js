/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Audio testing utilities and mocks for comprehensive test suite
 * @version: 1.0.0
 * @init-author: test-agent
 * @init-cc-sessionId: cc-test-20250808-045
 * @init-timestamp: 2025-08-08T17:05:00Z
 * @reasoning:
 * - **Objective:** Provide shared testing utilities for audio feedback system tests
 * - **Strategy:** Mock Web Audio API, provide test data generators, and performance helpers
 * - **Outcome:** Consistent test environment across all audio-related test suites
 */

import { vi } from 'vitest';

// Audio Testing Constants
export const AUDIO_TEST_CONSTANTS = {
  SAMPLE_RATES: [8000, 16000, 24000, 44100, 48000],
  CHUNK_SIZES: [128, 256, 512, 1024, 2048],
  LATENCY_THRESHOLDS: {
    EXCELLENT: 10,
    GOOD: 25,
    ACCEPTABLE: 50,
    POOR: 100
  },
  MEMORY_THRESHOLDS: {
    LOW: 10,
    MEDIUM: 25,
    HIGH: 50
  },
  CPU_THRESHOLDS: {
    LOW: 20,
    MEDIUM: 50,
    HIGH: 80
  }
};

// Mock Audio Context
export class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.sampleRate = 44100;
    this.destination = {
      maxChannelCount: 2,
      channelCount: 2,
      channelCountMode: 'max',
      channelInterpretation: 'speakers'
    };
    this._nodes = new Set();
  }

  createGain() {
    const gain = {
      gain: { 
        value: 1.0, 
        setValueAtTime: vi.fn((value, time) => {
          gain.gain.value = value;
        }),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
      },
      connect: vi.fn((destination) => {
        this._nodes.add({ source: gain, destination });
      }),
      disconnect: vi.fn()
    };
    return gain;
  }

  createBufferSource() {
    const source = {
      buffer: null,
      playbackRate: { value: 1.0, setValueAtTime: vi.fn() },
      detune: { value: 0, setValueAtTime: vi.fn() },
      loop: false,
      loopStart: 0,
      loopEnd: 0,
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn((when = 0, offset = 0, duration = undefined) => {
        setTimeout(() => {
          if (source.onended) source.onended();
        }, (duration || 1) * 1000); // Convert to ms
      }),
      stop: vi.fn(),
      onended: null
    };
    return source;
  }

  createBuffer(channels, length, sampleRate) {
    const buffer = {
      numberOfChannels: channels,
      length,
      sampleRate,
      duration: length / sampleRate,
      getChannelData: vi.fn((channel) => new Float32Array(length)),
      copyToChannel: vi.fn(),
      copyFromChannel: vi.fn()
    };
    return buffer;
  }

  createAnalyser() {
    const analyser = {
      fftSize: 2048,
      frequencyBinCount: 1024,
      minDecibels: -100,
      maxDecibels: -30,
      smoothingTimeConstant: 0.8,
      connect: vi.fn(),
      disconnect: vi.fn(),
      getByteFrequencyData: vi.fn((array) => {
        // Fill with mock frequency data
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 255);
        }
      }),
      getFloatFrequencyData: vi.fn(),
      getByteTimeDomainData: vi.fn(),
      getFloatTimeDomainData: vi.fn((array) => {
        // Fill with mock time domain data
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.sin(2 * Math.PI * 440 * i / 44100) * 0.1;
        }
      })
    };
    return analyser;
  }

  createBiquadFilter() {
    const filter = {
      type: 'lowpass',
      frequency: { value: 350, setValueAtTime: vi.fn() },
      Q: { value: 1, setValueAtTime: vi.fn() },
      gain: { value: 0, setValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
      getFrequencyResponse: vi.fn()
    };
    return filter;
  }

  createDynamicsCompressor() {
    const compressor = {
      threshold: { value: -24, setValueAtTime: vi.fn() },
      knee: { value: 30, setValueAtTime: vi.fn() },
      ratio: { value: 12, setValueAtTime: vi.fn() },
      attack: { value: 0.003, setValueAtTime: vi.fn() },
      release: { value: 0.25, setValueAtTime: vi.fn() },
      reduction: 0,
      connect: vi.fn(),
      disconnect: vi.fn()
    };
    return compressor;
  }

  createMediaStreamSource(stream) {
    const source = {
      mediaStream: stream,
      connect: vi.fn(),
      disconnect: vi.fn()
    };
    return source;
  }

  createMediaStreamDestination() {
    const destination = {
      stream: {
        getTracks: () => [{ kind: 'audio', enabled: true }],
        getAudioTracks: () => [{ kind: 'audio', enabled: true }]
      },
      connect: vi.fn(),
      disconnect: vi.fn()
    };
    return destination;
  }

  async resume() {
    this.state = 'running';
    return Promise.resolve();
  }

  async suspend() {
    this.state = 'suspended';
    return Promise.resolve();
  }

  async close() {
    this.state = 'closed';
    this._nodes.clear();
    return Promise.resolve();
  }

  addEventListener(type, listener) {
    // Mock event listener
  }

  removeEventListener(type, listener) {
    // Mock event listener removal
  }
}

// Mock Media Devices
export const mockMediaDevices = {
  getUserMedia: vi.fn((constraints) => {
    const tracks = [];
    if (constraints.audio) {
      tracks.push({
        kind: 'audio',
        enabled: true,
        readyState: 'live',
        stop: vi.fn(),
        clone: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      });
    }
    
    return Promise.resolve({
      getTracks: () => tracks,
      getAudioTracks: () => tracks.filter(t => t.kind === 'audio'),
      getVideoTracks: () => tracks.filter(t => t.kind === 'video'),
      active: true,
      id: 'mock-media-stream'
    });
  }),
  
  enumerateDevices: vi.fn(() => Promise.resolve([
    {
      deviceId: 'default',
      kind: 'audioinput',
      label: 'Default - Microphone',
      groupId: 'default'
    },
    {
      deviceId: 'default',
      kind: 'audiooutput',
      label: 'Default - Speaker',
      groupId: 'default'
    }
  ])),
  
  getSupportedConstraints: vi.fn(() => ({
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: true,
    channelCount: true
  }))
};

// Audio Test Data Generators
export class AudioTestDataGenerator {
  static generatePCM16(length = 1024, frequency = 440, amplitude = 0.8) {
    const data = new Int16Array(length);
    for (let i = 0; i < length; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / 44100) * amplitude;
      data[i] = Math.max(-32768, Math.min(32767, sample * 32767));
    }
    return data;
  }

  static generateFloat32(length = 1024, frequency = 440, amplitude = 0.8) {
    const data = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      data[i] = Math.sin(2 * Math.PI * frequency * i / 44100) * amplitude;
    }
    return data;
  }

  static generateWhiteNoise(length = 1024, amplitude = 0.1) {
    const data = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * amplitude;
    }
    return data;
  }

  static generateSilence(length = 1024) {
    return new Float32Array(length); // All zeros
  }

  static generateAudioChunk(sequenceId = 0, size = 1024, frequency = 440) {
    return {
      data: this.generatePCM16(size, frequency),
      timestamp: Date.now() + sequenceId * 20,
      sequenceId
    };
  }

  static generateAudioChunkSequence(count = 10, size = 1024, baseFrequency = 440) {
    return Array.from({ length: count }, (_, i) => 
      this.generateAudioChunk(i, size, baseFrequency + i * 10)
    );
  }

  static generateCorruptedChunk(sequenceId = 0) {
    return {
      data: null,
      timestamp: Date.now(),
      sequenceId
    };
  }
}

// Performance Testing Utilities
export class PerformanceTestUtils {
  static async measureLatency(asyncOperation) {
    const start = performance.now();
    await asyncOperation();
    return performance.now() - start;
  }

  static async measureThroughput(items, processor, concurrency = 1) {
    const startTime = performance.now();
    
    if (concurrency === 1) {
      for (const item of items) {
        await processor(item);
      }
    } else {
      const batches = [];
      for (let i = 0; i < items.length; i += concurrency) {
        batches.push(items.slice(i, i + concurrency));
      }
      
      for (const batch of batches) {
        await Promise.all(batch.map(processor));
      }
    }
    
    const totalTime = (performance.now() - startTime) / 1000; // seconds
    return items.length / totalTime; // items per second
  }

  static measureMemory() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize / 1024 / 1024, // MB
        total: performance.memory.totalJSHeapSize / 1024 / 1024,
        limit: performance.memory.jsHeapSizeLimit / 1024 / 1024
      };
    }
    return null;
  }

  static async measureMemoryDuring(asyncOperation) {
    const before = this.measureMemory();
    await asyncOperation();
    const after = this.measureMemory();
    
    if (before && after) {
      return {
        before,
        after,
        delta: after.used - before.used,
        peak: Math.max(before.used, after.used)
      };
    }
    return null;
  }

  static createLatencyDistribution(measurements) {
    const sorted = [...measurements].sort((a, b) => a - b);
    const len = sorted.length;
    
    return {
      min: sorted[0] || 0,
      max: sorted[len - 1] || 0,
      mean: measurements.reduce((a, b) => a + b, 0) / len || 0,
      median: sorted[Math.floor(len / 2)] || 0,
      p95: sorted[Math.floor(len * 0.95)] || 0,
      p99: sorted[Math.floor(len * 0.99)] || 0,
      stdDev: this.calculateStdDev(measurements)
    };
  }

  static calculateStdDev(values) {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
}

// Test Environment Setup
export function setupAudioTestEnvironment() {
  // Mock global audio APIs
  global.AudioContext = MockAudioContext;
  global.webkitAudioContext = MockAudioContext;
  
  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: mockMediaDevices
  });

  // Mock performance API if not available
  if (!global.performance) {
    global.performance = {
      now: () => Date.now(),
      memory: {
        usedJSHeapSize: 50 * 1024 * 1024,
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 500 * 1024 * 1024
      }
    };
  }

  // Mock Web Audio Worklet
  if (typeof AudioWorklet === 'undefined') {
    global.AudioWorklet = class {
      addModule() {
        return Promise.resolve();
      }
    };
  }

  // Mock WebRTC
  global.RTCPeerConnection = class MockRTCPeerConnection {
    constructor() {
      this.connectionState = 'new';
      this.iceConnectionState = 'new';
      this.localDescription = null;
      this.remoteDescription = null;
    }

    async createOffer() {
      return { type: 'offer', sdp: 'mock-sdp' };
    }

    async createAnswer() {
      return { type: 'answer', sdp: 'mock-sdp' };
    }

    async setLocalDescription(desc) {
      this.localDescription = desc;
    }

    async setRemoteDescription(desc) {
      this.remoteDescription = desc;
    }

    addTrack() {
      return {};
    }

    addEventListener() {}
    removeEventListener() {}
    close() {
      this.connectionState = 'closed';
    }
  };

  // Mock WebSocket
  global.WebSocket = class MockWebSocket {
    constructor(url) {
      this.url = url;
      this.readyState = WebSocket.CONNECTING;
      setTimeout(() => {
        this.readyState = WebSocket.OPEN;
        if (this.onopen) this.onopen(new Event('open'));
      }, 0);
    }

    send(data) {
      // Mock send operation
    }

    close() {
      this.readyState = WebSocket.CLOSED;
      if (this.onclose) this.onclose(new CloseEvent('close'));
    }
  };

  Object.assign(WebSocket, {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
  });
}

// Test Cleanup
export function cleanupAudioTestEnvironment() {
  // Reset mocks
  vi.resetAllMocks();
  
  // Clear any global state
  if (global.performance && global.performance.memory) {
    global.performance.memory.usedJSHeapSize = 50 * 1024 * 1024; // Reset to baseline
  }
}

// Audio Test Assertions
export const audioTestAssertions = {
  expectLatencyUnder: (actual, threshold) => {
    expect(actual).toBeLessThan(threshold);
  },

  expectMemoryUnder: (actual, thresholdMB) => {
    expect(actual).toBeLessThan(thresholdMB);
  },

  expectThroughputOver: (actual, minThroughput) => {
    expect(actual).toBeGreaterThan(minThroughput);
  },

  expectAudioQuality: (audioData, minRMS = 0.001, maxClipping = 0.05) => {
    // Calculate RMS
    let sum = 0;
    let clippedSamples = 0;
    
    for (let i = 0; i < audioData.length; i++) {
      const sample = Math.abs(audioData[i]);
      sum += sample * sample;
      if (sample > 0.95) clippedSamples++;
    }
    
    const rms = Math.sqrt(sum / audioData.length);
    const clippingRatio = clippedSamples / audioData.length;
    
    expect(rms).toBeGreaterThan(minRMS);
    expect(clippingRatio).toBeLessThan(maxClipping);
  },

  expectPerformanceDistribution: (distribution, requirements) => {
    if (requirements.maxMean) {
      expect(distribution.mean).toBeLessThan(requirements.maxMean);
    }
    if (requirements.maxP95) {
      expect(distribution.p95).toBeLessThan(requirements.maxP95);
    }
    if (requirements.maxP99) {
      expect(distribution.p99).toBeLessThan(requirements.maxP99);
    }
  }
};

export default {
  AUDIO_TEST_CONSTANTS,
  MockAudioContext,
  mockMediaDevices,
  AudioTestDataGenerator,
  PerformanceTestUtils,
  setupAudioTestEnvironment,
  cleanupAudioTestEnvironment,
  audioTestAssertions
};