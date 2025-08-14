/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Advanced audio processing pipeline for WebRTC voice communication
 * @version: 1.0.0
 * @init-author: engineer-agent
 * @init-cc-sessionId: cc-eng-20250801-001
 * @init-timestamp: 2025-08-01T12:00:00Z
 * @reasoning:
 * - **Objective:** High-quality audio processing with echo cancellation and noise suppression
 * - **Strategy:** Web Audio API with custom worklets for real-time processing
 * - **Outcome:** Professional-grade voice communication experience
 */

import type { 
  AudioProcessor, 
  AudioChunk, 
  AudioBufferManager,
  VoiceAgentError,
  ErrorInfo 
} from '../../../features/voice-agent/types/index';

/**
 * Voice Activity Detection (VAD) processor
 */
class VoiceActivityDetector {
  private isActive = false;
  private threshold = 0.01;
  private silenceDuration = 0;
  private maxSilenceDuration = 1000; // ms
  private activityCallback?: (active: boolean) => void;

  constructor(threshold = 0.01, maxSilence = 1000) {
    this.threshold = threshold;
    this.maxSilenceDuration = maxSilence;
  }

  setCallback(callback: (active: boolean) => void): void {
    this.activityCallback = callback;
  }

  process(audioData: Float32Array, sampleRate: number): boolean {
    // Calculate RMS (Root Mean Square) for volume detection
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    const rms = Math.sqrt(sum / audioData.length);
    
    const frameTimeMs = (audioData.length / sampleRate) * 1000;
    
    if (rms > this.threshold) {
      if (!this.isActive) {
        this.isActive = true;
        this.silenceDuration = 0;
        this.activityCallback?.(true);
      }
    } else {
      this.silenceDuration += frameTimeMs;
      
      if (this.isActive && this.silenceDuration > this.maxSilenceDuration) {
        this.isActive = false;
        this.activityCallback?.(false);
      }
    }
    
    return this.isActive;
  }

  reset(): void {
    this.isActive = false;
    this.silenceDuration = 0;
  }
}

/**
 * Advanced Audio Processor for WebRTC Voice Communication
 */
export class WebRTCAudioProcessor implements AudioProcessor {
  public context: AudioContext;
  public workletNode?: AudioWorkletNode;
  public inputGain: GainNode;
  public outputGain: GainNode;
  public isRecording = false;
  public isPlaying = false;

  private mediaStream?: MediaStream;
  private sourceNode?: MediaStreamAudioSourceNode;
  private destinationNode?: MediaStreamAudioDestinationNode;
  private analyserNode: AnalyserNode;
  private compressorNode: DynamicsCompressorNode;
  private filterNode: BiquadFilterNode;
  private vadProcessor: VoiceActivityDetector;
  private bufferManager: AudioBufferManager;
  private eventListeners: Map<string, Function[]> = new Map();

  // Audio quality monitoring
  private latencyMonitor = {
    inputLatency: 0,
    outputLatency: 0,
    roundTripLatency: 0
  };

  constructor(
    private readonly sampleRate = 24000,
    private readonly targetLatency = 75,
    private readonly adaptiveQuality = true
  ) {
    // Initialize Audio Context with optimal settings
    this.context = new AudioContext({
      sampleRate: this.sampleRate,
      latencyHint: 'interactive'
    });

    // Create audio processing nodes
    this.inputGain = this.context.createGain();
    this.outputGain = this.context.createGain();
    this.analyserNode = this.context.createAnalyser();
    this.compressorNode = this.context.createDynamicsCompressor();
    this.filterNode = this.context.createBiquadFilter();

    // Configure audio processing
    this.setupAudioProcessing();

    // Initialize VAD
    this.vadProcessor = new VoiceActivityDetector(0.01, 500);
    this.vadProcessor.setCallback((active) => {
      this.emit('voiceActivity', active);
    });

    // Initialize buffer manager
    this.bufferManager = {
      inputBuffer: [],
      outputBuffer: [],
      bufferSize: 128
    };
  }

  /**
   * Setup audio processing chain with echo cancellation and noise suppression
   */
  private setupAudioProcessing(): void {
    // Configure compressor for dynamic range control
    this.compressorNode.threshold.value = -24;
    this.compressorNode.knee.value = 30;
    this.compressorNode.ratio.value = 12;
    this.compressorNode.attack.value = 0.003;
    this.compressorNode.release.value = 0.25;

    // Configure high-pass filter to remove low-frequency noise
    this.filterNode.type = 'highpass';
    this.filterNode.frequency.value = 80;
    this.filterNode.Q.value = 1;

    // Configure analyser for monitoring
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.8;

    // Set initial gain levels
    this.inputGain.gain.value = 1.0;
    this.outputGain.gain.value = 0.8;
  }

  /**
   * Initialize audio worklet for advanced processing
   */
  private async initializeWorklet(): Promise<void> {
    try {
      // Add audio worklet module
      await this.context.audioWorklet.addModule('/audio-worklets/voice-processor.js');
      
      this.workletNode = new AudioWorkletNode(this.context, 'voice-processor', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [1],
        processorOptions: {
          sampleRate: this.sampleRate,
          enableNoiseReduction: true,
          enableEchoCancellation: true
        }
      });

      // Handle messages from worklet
      this.workletNode.port.onmessage = (event) => {
        const { type, data } = event.data;
        
        switch (type) {
          case 'audioLevel':
            this.emit('audioLevel', data);
            break;
          case 'noiseDetected':
            this.emit('noiseDetected', data);
            break;
          case 'latencyUpdate':
            this.latencyMonitor = { ...this.latencyMonitor, ...data };
            this.emit('latencyUpdate', this.latencyMonitor);
            break;
        }
      };

    } catch (error) {
      console.warn('Audio worklet not available, using fallback processing');
      this.emit('workletError', error);
    }
  }

  /**
   * Initialize microphone input with advanced constraints
   */
  async initializeMicrophone(constraints?: MediaStreamConstraints): Promise<MediaStream> {
    try {
      // Don't call ensureAudioContext here - it will be called when needed with user interaction
      // The getUserMedia call itself counts as user interaction
      
      const defaultConstraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: this.sampleRate,
          channelCount: 1,
          // Advanced constraints for better quality
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googTypingNoiseDetection: true,
          googAudioMirroring: false
        } as any
      };

      const finalConstraints = { ...defaultConstraints, ...constraints };
      this.mediaStream = await navigator.mediaDevices.getUserMedia(finalConstraints);

      // Check context state before creating nodes
      if (!this.context || this.context.state === 'closed') {
        console.log('[WebRTCAudioProcessor] Context closed or missing, creating new context');
        // Create new audio context
        this.context = new AudioContext({
          sampleRate: this.sampleRate,
          latencyHint: 'interactive'
        });
        
        // Recreate audio processing nodes
        this.inputGain = this.context.createGain();
        this.outputGain = this.context.createGain();
        this.analyserNode = this.context.createAnalyser();
        this.compressorNode = this.context.createDynamicsCompressor();
        this.filterNode = this.context.createBiquadFilter();
        
        // Reconfigure audio processing
        this.setupAudioProcessing();
      } else if (this.context.state === 'suspended') {
        // Try to resume the context since we have user interaction from getUserMedia
        try {
          await this.context.resume();
          console.log('[WebRTCAudioProcessor] Audio context resumed');
        } catch (error) {
          console.warn('[WebRTCAudioProcessor] Failed to resume audio context:', error);
        }
      }

      // Create audio processing chain
      this.sourceNode = this.context.createMediaStreamSource(this.mediaStream);
      this.destinationNode = this.context.createMediaStreamDestination();

      // Connect processing chain
      this.connectProcessingChain();

      // Initialize worklet if available
      await this.initializeWorklet();

      this.emit('microphoneInitialized', this.mediaStream);
      return this.mediaStream;

    } catch (error) {
      this.handleAudioError(error);
      throw error;
    }
  }

  /**
   * Connect audio processing chain
   */
  private connectProcessingChain(): void {
    if (!this.sourceNode || !this.destinationNode) return;

    let currentNode: AudioNode = this.sourceNode;

    // Input processing chain
    currentNode.connect(this.inputGain);
    currentNode = this.inputGain;

    // High-pass filter to remove low frequencies
    currentNode.connect(this.filterNode);
    currentNode = this.filterNode;

    // Dynamic range compression
    currentNode.connect(this.compressorNode);
    currentNode = this.compressorNode;

    // Audio worklet (if available)
    if (this.workletNode) {
      currentNode.connect(this.workletNode);
      currentNode = this.workletNode;
    }

    // Analysis node (parallel connection)
    currentNode.connect(this.analyserNode);

    // Output gain and destination
    currentNode.connect(this.outputGain);
    this.outputGain.connect(this.destinationNode);
  }

  /**
   * Start recording audio
   */
  startRecording(): void {
    if (this.isRecording) return;

    this.isRecording = true;
    this.vadProcessor.reset();

    // Start processing audio frames
    this.processAudioFrame();

    this.emit('recordingStarted');
  }

  /**
   * Stop recording audio
   */
  stopRecording(): void {
    if (!this.isRecording) return;

    this.isRecording = false;
    this.vadProcessor.reset();

    this.emit('recordingStopped');
  }

  /**
   * Process audio frame for VAD and quality monitoring
   */
  private processAudioFrame(): void {
    if (!this.isRecording) return;

    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    this.analyserNode.getFloatTimeDomainData(dataArray);

    // Voice activity detection
    const isVoiceActive = this.vadProcessor.process(dataArray, this.sampleRate);

    // Audio quality monitoring
    this.monitorAudioQuality(dataArray);

    // Continue processing
    requestAnimationFrame(() => this.processAudioFrame());
  }

  /**
   * Monitor audio quality metrics
   */
  private monitorAudioQuality(audioData: Float32Array): void {
    // Calculate signal level
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    const rms = Math.sqrt(sum / audioData.length);
    const decibels = 20 * Math.log10(rms);

    // Detect clipping
    let clipping = false;
    for (let i = 0; i < audioData.length; i++) {
      if (Math.abs(audioData[i]) > 0.95) {
        clipping = true;
        break;
      }
    }

    // Calculate dynamic range
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < audioData.length; i++) {
      if (audioData[i] < min) min = audioData[i];
      if (audioData[i] > max) max = audioData[i];
    }
    const dynamicRange = max - min;

    this.emit('audioQuality', {
      level: rms,
      decibels: isFinite(decibels) ? decibels : -Infinity,
      clipping,
      dynamicRange,
      timestamp: Date.now()
    });
  }

  /**
   * Convert audio to PCM16 format for OpenAI
   */
  convertToPCM16(audioData: Float32Array): Int16Array {
    const pcmData = new Int16Array(audioData.length);
    
    for (let i = 0; i < audioData.length; i++) {
      // Convert float32 [-1, 1] to int16 [-32768, 32767]
      const sample = Math.max(-1, Math.min(1, audioData[i]));
      pcmData[i] = sample * 0x7FFF;
    }
    
    return pcmData;
  }

  /**
   * Play audio from PCM16 data
   */
  async playAudio(pcmData: Int16Array): Promise<void> {
    try {
      // Resume audio context if suspended (for autoplay policy)
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }

      this.isPlaying = true;

      // Convert PCM16 to Float32
      const floatData = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        floatData[i] = pcmData[i] / 0x7FFF;
      }

      // Create audio buffer
      const audioBuffer = this.context.createBuffer(1, floatData.length, this.sampleRate);
      audioBuffer.copyToChannel(floatData, 0);

      // Create buffer source and play
      const source = this.context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputGain);
      this.outputGain.connect(this.context.destination);

      source.onended = () => {
        this.isPlaying = false;
        this.emit('playbackFinished');
      };

      source.start();
      this.emit('playbackStarted');

    } catch (error) {
      this.isPlaying = false;
      this.handleAudioError(error);
    }
  }

  /**
   * Handle interruption during playback
   */
  interruptPlayback(): void {
    if (this.isPlaying) {
      // Stop all audio nodes
      this.context.suspend();
      setTimeout(() => {
        this.context.resume();
      }, 100);

      this.isPlaying = false;
      this.emit('playbackInterrupted');
    }
  }

  /**
   * Adjust input gain
   */
  setInputGain(gain: number): void {
    this.inputGain.gain.setValueAtTime(Math.max(0, Math.min(2, gain)), this.context.currentTime);
  }

  /**
   * Adjust output gain
   */
  setOutputGain(gain: number): void {
    this.outputGain.gain.setValueAtTime(Math.max(0, Math.min(2, gain)), this.context.currentTime);
  }

  /**
   * Set muted state for input audio
   */
  setMuted(muted: boolean): void {
    if (muted) {
      this.inputGain.gain.setValueAtTime(0, this.context.currentTime);
    } else {
      this.inputGain.gain.setValueAtTime(1, this.context.currentTime);
    }
  }

  /**
   * Get processed audio stream for WebRTC
   */
  getProcessedStream(): MediaStream | undefined {
    return this.destinationNode?.stream;
  }

  /**
   * Handle audio errors
   */
  private handleAudioError(error: any): void {
    console.error('Audio processing error:', error);

    let errorType: VoiceAgentError = 'audio_not_supported';
    
    if (error.name === 'NotAllowedError') {
      errorType = 'microphone_permission_denied';
    } else if (error.name === 'NotFoundError') {
      errorType = 'audio_not_supported';
    }

    const errorInfo: ErrorInfo = {
      type: errorType,
      message: error.message || 'Audio processing error',
      timestamp: Date.now(),
      details: error,
      recoverable: errorType !== 'microphone_permission_denied'
    };

    this.emit('error', errorInfo);
  }

  /**
   * Get current latency metrics
   */
  getLatencyMetrics(): typeof this.latencyMonitor {
    return { ...this.latencyMonitor };
  }

  /**
   * Reinitialize audio context if it's closed
   * Only resume if there's been user interaction to comply with browser policies
   */
  async ensureAudioContext(hasUserInteraction: boolean = false): Promise<void> {
    if (!this.context || this.context.state === 'closed') {
      console.log('[WebRTCAudioProcessor] Reinitializing closed audio context');
      
      // Create new audio context
      this.context = new AudioContext({
        sampleRate: this.sampleRate,
        latencyHint: 'interactive'
      });
      
      // Recreate audio processing nodes
      this.inputGain = this.context.createGain();
      this.outputGain = this.context.createGain();
      this.analyserNode = this.context.createAnalyser();
      this.compressorNode = this.context.createDynamicsCompressor();
      this.filterNode = this.context.createBiquadFilter();
      
      // Reconfigure audio processing
      this.setupAudioProcessing();
      
      console.log('[WebRTCAudioProcessor] Audio context reinitialized successfully');
    } else if (this.context.state === 'suspended') {
      if (hasUserInteraction) {
        console.log('[WebRTCAudioProcessor] Resuming suspended audio context after user interaction');
        try {
          await this.context.resume();
          console.log('[WebRTCAudioProcessor] Audio context resumed');
        } catch (error) {
          console.warn('[WebRTCAudioProcessor] Failed to resume audio context:', error);
        }
      } else {
        console.log('[WebRTCAudioProcessor] Audio context suspended - waiting for user interaction to resume');
      }
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      this.stopRecording();

      // Stop all media stream tracks
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = undefined;
      }

      // Disconnect worklet node
      if (this.workletNode) {
        this.workletNode.disconnect();
        this.workletNode = undefined;
      }

      // Disconnect all audio nodes before closing context
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode = undefined;
      }
      if (this.destinationNode) {
        this.destinationNode = undefined;
      }

      // Don't close the audio context if it's already closed or closing
      if (this.context && this.context.state !== 'closed') {
        // Save the state before attempting to close
        const contextState = this.context.state;
        console.log(`[WebRTCAudioProcessor] Closing audio context in state: ${contextState}`);
        
        try {
          await this.context.close();
          console.log('[WebRTCAudioProcessor] Audio context closed successfully');
        } catch (closeError) {
          console.warn('[WebRTCAudioProcessor] Error closing audio context:', closeError);
          // Context might already be closing or closed, which is fine
        }
      }

      this.eventListeners.clear();

    } catch (error) {
      console.error('[WebRTCAudioProcessor] Error during audio cleanup:', error);
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
}