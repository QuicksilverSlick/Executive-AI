/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Generate minimal placeholder audio files for testing
 * @version: 1.0.0
 * @init-author: real-time-ui-agent
 * @init-cc-sessionId: cc-unknown-20250808-354
 * @init-timestamp: 2025-08-08T16:45:00Z
 * @reasoning:
 * - **Objective:** Create minimal audio files to prevent 404 errors during development
 * - **Strategy:** Generate silent WebM files with proper headers
 * - **Outcome:** Working placeholders until real audio files are added
 */

// This script creates minimal placeholder WebM files
// Run this in a browser console or as a Node.js script with appropriate polyfills

class PlaceholderAudioGenerator {
  constructor() {
    this.sampleRate = 44100;
  }

  // Generate silent audio buffer
  generateSilentBuffer(durationSeconds) {
    if (typeof AudioContext === 'undefined') {
      throw new Error('AudioContext not available. Run this in a browser.');
    }

    const audioContext = new AudioContext({ sampleRate: this.sampleRate });
    const length = this.sampleRate * durationSeconds;
    const buffer = audioContext.createBuffer(1, length, this.sampleRate);
    
    // Fill with silence (all zeros)
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = 0;
    }

    audioContext.close();
    return buffer;
  }

  // Convert AudioBuffer to WAV blob (simplified)
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

    // Convert samples to 16-bit PCM (all silence)
    let offset = 44;
    for (let i = 0; i < length; i++) {
      view.setInt16(offset, 0, true); // Silent sample
      offset += 2;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  // Download blob as file
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

  // Generate all placeholder files
  generatePlaceholderFiles() {
    try {
      console.log('Generating placeholder audio files...');

      // Generate different duration files
      const files = [
        { name: 'search-start.wav', duration: 0.8 },
        { name: 'processing-loop.wav', duration: 4.0 },
        { name: 'search-complete.wav', duration: 1.0 },
        { name: 'search-error.wav', duration: 0.7 }
      ];

      files.forEach(({ name, duration }) => {
        console.log(`Generating ${name} (${duration}s)...`);
        const buffer = this.generateSilentBuffer(duration);
        const blob = this.audioBufferToWavBlob(buffer);
        this.downloadBlob(blob, name);
      });

      console.log('Placeholder files generated!');
      console.log('Note: Convert to WebM using ffmpeg:');
      console.log('ffmpeg -i search-start.wav -c:a libopus -b:a 32k search-start.webm');

    } catch (error) {
      console.error('Error generating placeholder files:', error);
    }
  }
}

// Usage instructions
console.log('Voice Agent Audio Placeholder Generator');
console.log('=====================================');
console.log('');
console.log('This script generates silent placeholder audio files to prevent');
console.log('404 errors during development of the voice agent audio system.');
console.log('');
console.log('To use:');
console.log('1. Open this page in a browser');
console.log('2. Open browser developer console');
console.log('3. Run: new PlaceholderAudioGenerator().generatePlaceholderFiles()');
console.log('4. Convert downloaded WAV files to WebM using ffmpeg');
console.log('');
console.log('Alternative: Use the audio generation script for real sounds.');

// Export for use
if (typeof window !== 'undefined') {
  window.PlaceholderAudioGenerator = PlaceholderAudioGenerator;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlaceholderAudioGenerator;
}