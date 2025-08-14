/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Programmatic audio generation for voice agent feedback sounds
 * @version: 1.0.0
 * @init-author: real-time-ui-agent
 * @init-cc-sessionId: cc-unknown-20250808-354
 * @init-timestamp: 2025-08-08T16:45:00Z
 * @reasoning:
 * - **Objective:** Generate royalty-free audio files using Web Audio API
 * - **Strategy:** Create procedural audio that matches UI design
 * - **Outcome:** Four high-quality WebM audio files for voice agent states
 */

class AudioFileGenerator {
  constructor() {
    this.audioContext = null;
    this.sampleRate = 44100;
  }

  async init() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: this.sampleRate
    });
    
    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Generate a sine wave tone
  generateTone(frequency, duration, envelope = null) {
    const length = this.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, this.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const time = i / this.sampleRate;
      let amplitude = Math.sin(2 * Math.PI * frequency * time);
      
      // Apply envelope if provided
      if (envelope) {
        amplitude *= envelope(time, duration);
      }
      
      data[i] = amplitude * 0.3; // Reduce volume to prevent clipping
    }

    return buffer;
  }

  // Generate noise (for ambient processing sound)
  generateNoise(duration, type = 'pink') {
    const length = this.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, this.sampleRate);
    const data = buffer.getChannelData(0);

    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

    for (let i = 0; i < length; i++) {
      let white = Math.random() * 2 - 1;
      
      if (type === 'pink') {
        // Pink noise filter
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
        b6 = white * 0.115926;
      } else {
        // White noise
        data[i] = white * 0.1;
      }
    }

    return buffer;
  }

  // Create envelope functions
  static envelopes = {
    // Attack-Decay-Sustain-Release envelope
    adsr: (attackTime, decayTime, sustainLevel, releaseTime) => (time, totalDuration) => {
      if (time < attackTime) {
        // Attack phase
        return time / attackTime;
      } else if (time < attackTime + decayTime) {
        // Decay phase
        return 1 - ((time - attackTime) / decayTime) * (1 - sustainLevel);
      } else if (time < totalDuration - releaseTime) {
        // Sustain phase
        return sustainLevel;
      } else {
        // Release phase
        const releaseStart = totalDuration - releaseTime;
        return sustainLevel * (1 - (time - releaseStart) / releaseTime);
      }
    },

    // Simple fade in/out
    fadeInOut: (fadeTime = 0.1) => (time, totalDuration) => {
      if (time < fadeTime) {
        return time / fadeTime;
      } else if (time > totalDuration - fadeTime) {
        return (totalDuration - time) / fadeTime;
      } else {
        return 1;
      }
    },

    // Bell-like envelope
    bell: () => (time, totalDuration) => {
      return Math.exp(-time * 3) * Math.cos(time * 20);
    }
  };

  // Generate search start sound (pleasant chime)
  async generateSearchStart() {
    const duration = 0.8;
    
    // Create a chord with fundamental and harmonics
    const fundamental = this.generateTone(800, duration, 
      AudioFileGenerator.envelopes.adsr(0.05, 0.2, 0.3, 0.55));
    const harmonic1 = this.generateTone(1200, duration * 0.7, 
      AudioFileGenerator.envelopes.adsr(0.1, 0.15, 0.2, 0.45));
    const harmonic2 = this.generateTone(1600, duration * 0.5, 
      AudioFileGenerator.envelopes.adsr(0.15, 0.1, 0.1, 0.25));

    // Mix the tones
    const mixedBuffer = this.audioContext.createBuffer(1, 
      this.sampleRate * duration, this.sampleRate);
    const mixedData = mixedBuffer.getChannelData(0);
    const fundamentalData = fundamental.getChannelData(0);
    const harmonic1Data = harmonic1.getChannelData(0);
    const harmonic2Data = harmonic2.getChannelData(0);

    for (let i = 0; i < mixedData.length; i++) {
      mixedData[i] = (fundamentalData[i] || 0) * 0.6 + 
                     (harmonic1Data[i] || 0) * 0.3 + 
                     (harmonic2Data[i] || 0) * 0.1;
    }

    return mixedBuffer;
  }

  // Generate processing loop (ambient background)
  async generateProcessingLoop() {
    const duration = 4; // 4 seconds for seamless loop
    
    // Create multiple layers of filtered noise and subtle tones
    const noiseBuffer = this.generateNoise(duration, 'pink');
    const toneBuffer = this.generateTone(200, duration, (time) => {
      return 0.1 * (Math.sin(time * 0.5) * 0.5 + 0.5); // Slow oscillation
    });

    // Mix noise and tone
    const mixedBuffer = this.audioContext.createBuffer(1, 
      this.sampleRate * duration, this.sampleRate);
    const mixedData = mixedBuffer.getChannelData(0);
    const noiseData = noiseBuffer.getChannelData(0);
    const toneData = toneBuffer.getChannelData(0);

    for (let i = 0; i < mixedData.length; i++) {
      mixedData[i] = noiseData[i] * 0.3 + toneData[i] * 0.7;
      
      // Apply fade in/out for seamless looping
      const time = i / this.sampleRate;
      const fadeTime = 0.2;
      if (time < fadeTime) {
        mixedData[i] *= time / fadeTime;
      } else if (time > duration - fadeTime) {
        mixedData[i] *= (duration - time) / fadeTime;
      }
    }

    return mixedBuffer;
  }

  // Generate search complete sound (success chime)
  async generateSearchComplete() {
    const duration = 1.0;
    
    // Ascending arpeggio: C - E - G - C (in Hz)
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    const noteDuration = duration / notes.length;
    
    const completeBuffer = this.audioContext.createBuffer(1, 
      this.sampleRate * duration, this.sampleRate);
    const completeData = completeBuffer.getChannelData(0);

    notes.forEach((frequency, index) => {
      const startSample = Math.floor(index * noteDuration * this.sampleRate);
      const endSample = Math.floor((index + 1) * noteDuration * this.sampleRate);
      
      for (let i = startSample; i < endSample && i < completeData.length; i++) {
        const time = (i - startSample) / this.sampleRate;
        const noteTime = noteDuration;
        const envelope = AudioFileGenerator.envelopes.adsr(0.02, 0.1, 0.4, noteTime - 0.12);
        
        completeData[i] += Math.sin(2 * Math.PI * frequency * time) * 
                          envelope(time, noteTime) * 0.4;
      }
    });

    return completeBuffer;
  }

  // Generate search error sound (gentle error indication)
  async generateSearchError() {
    const duration = 0.7;
    
    // Descending minor chord: A - F - D (in Hz)
    const notes = [880, 698, 587]; // A5, F5, D5
    const noteDuration = 0.25;
    
    const errorBuffer = this.audioContext.createBuffer(1, 
      this.sampleRate * duration, this.sampleRate);
    const errorData = errorBuffer.getChannelData(0);

    notes.forEach((frequency, index) => {
      const startSample = Math.floor(index * noteDuration * this.sampleRate);
      const samples = Math.floor(noteDuration * this.sampleRate);
      
      for (let i = 0; i < samples && startSample + i < errorData.length; i++) {
        const time = i / this.sampleRate;
        const envelope = AudioFileGenerator.envelopes.adsr(0.05, 0.08, 0.3, 0.12);
        
        errorData[startSample + i] += Math.sin(2 * Math.PI * frequency * time) * 
                                     envelope(time, noteDuration) * 0.3;
      }
    });

    return errorBuffer;
  }

  // Convert AudioBuffer to blob for download
  async audioBufferToBlob(buffer, mimeType = 'audio/webm') {
    const offlineContext = new OfflineAudioContext(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineContext.destination);
    source.start(0);

    const renderedBuffer = await offlineContext.startRendering();
    
    // Convert to WAV (WebM encoding would require additional libraries)
    return this.audioBufferToWavBlob(renderedBuffer);
  }

  // Convert AudioBuffer to WAV blob
  audioBufferToWavBlob(buffer) {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    const channels = [buffer.getChannelData(0)];

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);

    // Convert samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channels[0][i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  // Download a blob as a file
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Generate all audio files
  async generateAllFiles() {
    await this.init();
    
    console.log('Generating voice agent audio files...');
    
    try {
      // Generate search-start.wav
      console.log('Generating search-start sound...');
      const startBuffer = await this.generateSearchStart();
      const startBlob = await this.audioBufferToBlob(startBuffer);
      this.downloadBlob(startBlob, 'search-start.wav');

      // Generate processing-loop.wav
      console.log('Generating processing-loop sound...');
      const processingBuffer = await this.generateProcessingLoop();
      const processingBlob = await this.audioBufferToBlob(processingBuffer);
      this.downloadBlob(processingBlob, 'processing-loop.wav');

      // Generate search-complete.wav
      console.log('Generating search-complete sound...');
      const completeBuffer = await this.generateSearchComplete();
      const completeBlob = await this.audioBufferToBlob(completeBuffer);
      this.downloadBlob(completeBlob, 'search-complete.wav');

      // Generate search-error.wav
      console.log('Generating search-error sound...');
      const errorBuffer = await this.generateSearchError();
      const errorBlob = await this.audioBufferToBlob(errorBuffer);
      this.downloadBlob(errorBlob, 'search-error.wav');

      console.log('All audio files generated! Convert WAV files to WebM using ffmpeg:');
      console.log('ffmpeg -i search-start.wav -c:a libopus -b:a 32k search-start.webm');
      console.log('ffmpeg -i processing-loop.wav -c:a libopus -b:a 32k processing-loop.webm');
      console.log('ffmpeg -i search-complete.wav -c:a libopus -b:a 32k search-complete.webm');
      console.log('ffmpeg -i search-error.wav -c:a libopus -b:a 32k search-error.webm');

    } catch (error) {
      console.error('Error generating audio files:', error);
    }
  }
}

// Usage
const generator = new AudioFileGenerator();

// Add button to page for manual generation
document.addEventListener('DOMContentLoaded', () => {
  const button = document.createElement('button');
  button.textContent = 'Generate Voice Agent Audio Files';
  button.style.cssText = `
    padding: 10px 20px;
    font-size: 16px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin: 20px;
  `;
  
  button.onclick = () => {
    button.disabled = true;
    button.textContent = 'Generating...';
    generator.generateAllFiles().finally(() => {
      button.disabled = false;
      button.textContent = 'Generate Voice Agent Audio Files';
    });
  };
  
  document.body.insertBefore(button, document.body.firstChild);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioFileGenerator;
}