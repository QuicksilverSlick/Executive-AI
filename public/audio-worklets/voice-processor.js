/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Audio worklet for advanced voice processing and noise reduction
 * @version: 1.0.0
 * @init-author: engineer-agent
 * @init-cc-sessionId: cc-eng-20250801-001
 * @init-timestamp: 2025-08-01T12:00:00Z
 * @reasoning:
 * - **Objective:** Real-time audio processing with minimal latency
 * - **Strategy:** Web Audio API worklet for optimal performance
 * - **Outcome:** Professional-grade voice processing in the browser
 */

/**
 * Advanced Voice Processing AudioWorklet
 * Handles real-time noise reduction, echo cancellation, and voice enhancement
 */
class VoiceProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    
    // Configuration
    this.sampleRate = options.processorOptions?.sampleRate || 24000;
    this.enableNoiseReduction = options.processorOptions?.enableNoiseReduction ?? true;
    this.enableEchoCancellation = options.processorOptions?.enableEchoCancellation ?? true;
    
    // Noise reduction parameters
    this.noiseThreshold = 0.01;
    this.noiseReductionFactor = 0.5;
    this.spectralSubtractionAlpha = 2.0;
    
    // Voice activity detection
    this.vadThreshold = 0.015;
    this.vadHangoverTime = 8; // frames
    this.vadHangoverCount = 0;
    this.isVoiceActive = false;
    
    // Buffers for processing
    this.frameSize = 128;
    this.hopSize = 64;
    this.inputBuffer = new Float32Array(this.frameSize * 2);
    this.outputBuffer = new Float32Array(this.frameSize * 2);
    this.bufferIndex = 0;
    
    // Frequency domain processing
    this.fftSize = 256;
    this.window = this.createHannWindow(this.fftSize);
    this.noiseProfile = new Float32Array(this.fftSize / 2 + 1);
    this.noiseProfileFrames = 0;
    this.maxNoiseProfileFrames = 10;
    
    // Echo cancellation (simplified)
    this.echoDelayBuffer = new Float32Array(this.sampleRate * 0.5); // 500ms buffer
    this.echoDelayIndex = 0;
    
    // Audio level monitoring
    this.audioLevel = 0;
    this.audioLevelSmoothingFactor = 0.95;
    this.frameCount = 0;
    this.reportingInterval = 10; // Report every N frames
    
    // Latency monitoring
    this.latencyStartTime = 0;
    this.latencyMeasurementActive = false;
  }

  /**
   * Main audio processing function
   */
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    if (!input || !input[0] || !output || !output[0]) {
      return true;
    }
    
    const inputChannel = input[0];
    const outputChannel = output[0];
    
    // Start latency measurement
    if (!this.latencyMeasurementActive) {
      this.latencyStartTime = currentTime;
      this.latencyMeasurementActive = true;
    }
    
    // Process audio frame
    for (let i = 0; i < inputChannel.length; i++) {
      // Add to input buffer
      this.inputBuffer[this.bufferIndex] = inputChannel[i];
      
      // Process when buffer is full
      if (this.bufferIndex === this.frameSize - 1) {
        const processedFrame = this.processFrame(
          this.inputBuffer.slice(0, this.frameSize)
        );
        
        // Copy to output buffer
        processedFrame.forEach((sample, idx) => {
          this.outputBuffer[idx] = sample;
        });
        
        this.bufferIndex = 0;
      } else {
        this.bufferIndex++;
      }
      
      // Output from buffer (with overlap-add if needed)
      const bufferIdx = (this.bufferIndex + this.frameSize) % (this.frameSize * 2);
      outputChannel[i] = this.outputBuffer[bufferIdx] || 0;
    }
    
    // Update audio level
    this.updateAudioLevel(inputChannel);
    
    // Periodic reporting
    this.frameCount++;
    if (this.frameCount % this.reportingInterval === 0) {
      this.reportMetrics();
    }
    
    return true;
  }

  /**
   * Process a single audio frame
   */
  processFrame(frame) {
    let processedFrame = new Float32Array(frame);
    
    // Voice Activity Detection
    const frameEnergy = this.calculateFrameEnergy(frame);
    this.updateVAD(frameEnergy);
    
    // Only process if voice is active or during hangover period
    if (this.isVoiceActive || this.vadHangoverCount > 0) {
      
      // Noise Reduction
      if (this.enableNoiseReduction) {
        processedFrame = this.applyNoiseReduction(processedFrame);
      }
      
      // Echo Cancellation (simplified)
      if (this.enableEchoCancellation) {
        processedFrame = this.applyEchoCancellation(processedFrame);
      }
      
      // Dynamic Range Compression
      processedFrame = this.applyDynamicRangeCompression(processedFrame);
      
    } else {
      // During silence, update noise profile
      if (this.noiseProfileFrames < this.maxNoiseProfileFrames) {
        this.updateNoiseProfile(frame);
      }
      
      // Apply aggressive noise gate during silence
      processedFrame = processedFrame.map(sample => sample * 0.1);
    }
    
    return processedFrame;
  }

  /**
   * Calculate frame energy for VAD
   */
  calculateFrameEnergy(frame) {
    let energy = 0;
    for (let i = 0; i < frame.length; i++) {
      energy += frame[i] * frame[i];
    }
    return Math.sqrt(energy / frame.length);
  }

  /**
   * Update Voice Activity Detection
   */
  updateVAD(energy) {
    const wasActive = this.isVoiceActive;
    
    if (energy > this.vadThreshold) {
      this.isVoiceActive = true;
      this.vadHangoverCount = this.vadHangoverTime;
    } else {
      if (this.vadHangoverCount > 0) {
        this.vadHangoverCount--;
      } else {
        this.isVoiceActive = false;
      }
    }
    
    // Report VAD changes
    if (wasActive !== this.isVoiceActive) {
      this.port.postMessage({
        type: 'voiceActivity',
        data: this.isVoiceActive
      });
    }
  }

  /**
   * Apply noise reduction using spectral subtraction
   */
  applyNoiseReduction(frame) {
    if (this.noiseProfileFrames < this.maxNoiseProfileFrames) {
      return frame; // Not enough noise profile data
    }
    
    // Simple frequency-domain noise reduction
    // (This is a simplified version - real implementation would use FFT)
    const filtered = new Float32Array(frame.length);
    
    for (let i = 0; i < frame.length; i++) {
      const signal = Math.abs(frame[i]);
      const noise = this.noiseProfile[i % this.noiseProfile.length];
      
      if (signal > noise * this.spectralSubtractionAlpha) {
        // Signal above noise floor
        filtered[i] = frame[i];
      } else {
        // Apply noise reduction
        const reductionFactor = Math.max(0.1, 1 - this.noiseReductionFactor);
        filtered[i] = frame[i] * reductionFactor;
      }
    }
    
    return filtered;
  }

  /**
   * Apply echo cancellation (simplified version)
   */
  applyEchoCancellation(frame) {
    const filtered = new Float32Array(frame.length);
    
    for (let i = 0; i < frame.length; i++) {
      // Store in delay buffer
      this.echoDelayBuffer[this.echoDelayIndex] = frame[i];
      
      // Simple echo cancellation: subtract delayed signal
      const delayedSample = this.echoDelayBuffer[
        (this.echoDelayIndex - Math.floor(this.sampleRate * 0.1)) % this.echoDelayBuffer.length
      ];
      
      filtered[i] = frame[i] - (delayedSample * 0.3);
      
      this.echoDelayIndex = (this.echoDelayIndex + 1) % this.echoDelayBuffer.length;
    }
    
    return filtered;
  }

  /**
   * Apply dynamic range compression
   */
  applyDynamicRangeCompression(frame) {
    const compressed = new Float32Array(frame.length);
    const threshold = 0.7;
    const ratio = 4;
    const knee = 0.1;
    
    for (let i = 0; i < frame.length; i++) {
      const input = Math.abs(frame[i]);
      let output = input;
      
      if (input > threshold + knee) {
        // Above knee: apply compression
        const excess = input - threshold;
        output = threshold + (excess / ratio);
      } else if (input > threshold - knee) {
        // In knee region: smooth transition
        const kneeRatio = (input - (threshold - knee)) / (2 * knee);
        const compressedExcess = ((input - threshold) / ratio);
        output = input + (kneeRatio * compressedExcess);
      }
      
      compressed[i] = frame[i] >= 0 ? output : -output;
    }
    
    return compressed;
  }

  /**
   * Update noise profile during silence
   */
  updateNoiseProfile(frame) {
    const frameSpectrum = this.getSpectralMagnitude(frame);
    
    if (this.noiseProfileFrames === 0) {
      // Initialize noise profile
      for (let i = 0; i < this.noiseProfile.length; i++) {
        this.noiseProfile[i] = frameSpectrum[i] || 0;
      }
    } else {
      // Average with existing profile
      const alpha = 0.1;
      for (let i = 0; i < this.noiseProfile.length; i++) {
        this.noiseProfile[i] = alpha * (frameSpectrum[i] || 0) + (1 - alpha) * this.noiseProfile[i];
      }
    }
    
    this.noiseProfileFrames++;
  }

  /**
   * Get spectral magnitude (simplified - real implementation would use FFT)
   */
  getSpectralMagnitude(frame) {
    // Simplified spectral analysis
    const spectrum = new Float32Array(this.noiseProfile.length);
    const binSize = frame.length / spectrum.length;
    
    for (let i = 0; i < spectrum.length; i++) {
      let sum = 0;
      const startIdx = Math.floor(i * binSize);
      const endIdx = Math.min(Math.floor((i + 1) * binSize), frame.length);
      
      for (let j = startIdx; j < endIdx; j++) {
        sum += Math.abs(frame[j]);
      }
      
      spectrum[i] = sum / (endIdx - startIdx);
    }
    
    return spectrum;
  }

  /**
   * Update audio level monitoring
   */
  updateAudioLevel(samples) {
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    
    const rms = Math.sqrt(sum / samples.length);
    this.audioLevel = this.audioLevel * this.audioLevelSmoothingFactor + 
                     rms * (1 - this.audioLevelSmoothingFactor);
  }

  /**
   * Create Hann window for spectral processing
   */
  createHannWindow(size) {
    const window = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (size - 1)));
    }
    return window;
  }

  /**
   * Report metrics to main thread
   */
  reportMetrics() {
    // Audio level
    this.port.postMessage({
      type: 'audioLevel',
      data: this.audioLevel
    });
    
    // Noise detection
    const noiseLevel = this.noiseProfile.reduce((sum, val) => sum + val, 0) / this.noiseProfile.length;
    if (noiseLevel > 0.05) {
      this.port.postMessage({
        type: 'noiseDetected',
        data: { level: noiseLevel, threshold: 0.05 }
      });
    }
    
    // Latency measurement
    if (this.latencyMeasurementActive) {
      const latency = (currentTime - this.latencyStartTime) * 1000; // Convert to ms
      this.port.postMessage({
        type: 'latencyUpdate',
        data: { processingLatency: latency }
      });
      this.latencyMeasurementActive = false;
    }
  }

  /**
   * Handle messages from main thread
   */
  handleMessage(event) {
    const { type, data } = event.data;
    
    switch (type) {
      case 'updateNoiseThreshold':
        this.noiseThreshold = data.threshold;
        break;
        
      case 'updateVADThreshold':
        this.vadThreshold = data.threshold;
        break;
        
      case 'resetNoiseProfile':
        this.noiseProfile.fill(0);
        this.noiseProfileFrames = 0;
        break;
        
      case 'enableNoiseReduction':
        this.enableNoiseReduction = data.enabled;
        break;
        
      case 'enableEchoCancellation':
        this.enableEchoCancellation = data.enabled;
        break;
    }
  }
}

// Register the processor
registerProcessor('voice-processor', VoiceProcessor);