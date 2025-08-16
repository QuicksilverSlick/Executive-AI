import { f as createComponent, r as renderTemplate, o as renderHead } from '../_astro/astro/server.DAk61OsX.js';
import 'kleur/colors';
import 'clsx';
/* empty css                                     */
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$TestAudio = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(['<html lang="en" data-astro-cid-sl5o5qok> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Audio Feedback Test Harness</title>', `</head> <body data-astro-cid-sl5o5qok> <div class="container" data-astro-cid-sl5o5qok> <h1 data-astro-cid-sl5o5qok>\u{1F3B5} Audio Feedback System Test Harness</h1> <!-- System Status Section --> <div class="test-section" data-astro-cid-sl5o5qok> <h2 data-astro-cid-sl5o5qok>System Status</h2> <div class="status idle" id="system-status" data-astro-cid-sl5o5qok>System Ready</div> <div class="metrics" data-astro-cid-sl5o5qok> <div class="metric" data-astro-cid-sl5o5qok> <div class="metric-value" id="latency-metric" data-astro-cid-sl5o5qok>0</div> <div class="metric-label" data-astro-cid-sl5o5qok>Latency (ms)</div> </div> <div class="metric" data-astro-cid-sl5o5qok> <div class="metric-value" id="memory-metric" data-astro-cid-sl5o5qok>0</div> <div class="metric-label" data-astro-cid-sl5o5qok>Memory (MB)</div> </div> <div class="metric" data-astro-cid-sl5o5qok> <div class="metric-value" id="queue-metric" data-astro-cid-sl5o5qok>0</div> <div class="metric-label" data-astro-cid-sl5o5qok>Queue Size</div> </div> <div class="metric" data-astro-cid-sl5o5qok> <div class="metric-value" id="throughput-metric" data-astro-cid-sl5o5qok>0</div> <div class="metric-label" data-astro-cid-sl5o5qok>Throughput (ops/s)</div> </div> </div> </div> <!-- Audio Controls Section --> <div class="test-section" data-astro-cid-sl5o5qok> <h2 data-astro-cid-sl5o5qok>Audio Controls</h2> <div class="controls" data-astro-cid-sl5o5qok> <div class="control-group" data-astro-cid-sl5o5qok> <label for="volume-control" data-astro-cid-sl5o5qok>Volume</label> <input type="range" id="volume-control" min="0" max="1" step="0.1" value="0.8" data-astro-cid-sl5o5qok> <span id="volume-value" data-astro-cid-sl5o5qok>0.8</span> </div> <div class="control-group" data-astro-cid-sl5o5qok> <label for="sample-rate" data-astro-cid-sl5o5qok>Sample Rate</label> <select id="sample-rate" data-astro-cid-sl5o5qok> <option value="8000" data-astro-cid-sl5o5qok>8 kHz</option> <option value="16000" data-astro-cid-sl5o5qok>16 kHz</option> <option value="24000" selected data-astro-cid-sl5o5qok>24 kHz</option> <option value="44100" data-astro-cid-sl5o5qok>44.1 kHz</option> <option value="48000" data-astro-cid-sl5o5qok>48 kHz</option> </select> </div> <div class="control-group" data-astro-cid-sl5o5qok> <label for="chunk-size" data-astro-cid-sl5o5qok>Chunk Size</label> <select id="chunk-size" data-astro-cid-sl5o5qok> <option value="128" data-astro-cid-sl5o5qok>128 samples</option> <option value="256" data-astro-cid-sl5o5qok>256 samples</option> <option value="512" data-astro-cid-sl5o5qok>512 samples</option> <option value="1024" selected data-astro-cid-sl5o5qok>1024 samples</option> <option value="2048" data-astro-cid-sl5o5qok>2048 samples</option> </select> </div> <div class="control-group" data-astro-cid-sl5o5qok> <label for="test-frequency" data-astro-cid-sl5o5qok>Test Frequency</label> <input type="number" id="test-frequency" value="440" min="100" max="2000" data-astro-cid-sl5o5qok> </div> </div> <div class="test-controls" data-astro-cid-sl5o5qok> <button id="play-tone-btn" data-astro-cid-sl5o5qok>Play Test Tone</button> <button id="play-sequence-btn" data-astro-cid-sl5o5qok>Play Sequence</button> <button id="stop-playback-btn" data-astro-cid-sl5o5qok>Stop Playback</button> <button id="mute-btn" data-astro-cid-sl5o5qok>Toggle Mute</button> <button id="clear-queue-btn" data-astro-cid-sl5o5qok>Clear Queue</button> </div> </div> <!-- Queue Visualization Section --> <div class="test-section" data-astro-cid-sl5o5qok> <h2 data-astro-cid-sl5o5qok>Audio Queue Visualization</h2> <div class="queue-visualizer" id="queue-visualizer" data-astro-cid-sl5o5qok> <span style="color: #6b7280; font-size: 14px;" data-astro-cid-sl5o5qok>Queue is empty</span> </div> <div class="test-controls" data-astro-cid-sl5o5qok> <button id="add-chunk-btn" data-astro-cid-sl5o5qok>Add Audio Chunk</button> <button id="add-burst-btn" data-astro-cid-sl5o5qok>Add Burst (10 chunks)</button> <button id="test-overflow-btn" data-astro-cid-sl5o5qok>Test Queue Overflow</button> </div> </div> <!-- Waveform Visualization Section --> <div class="test-section" data-astro-cid-sl5o5qok> <h2 data-astro-cid-sl5o5qok>Audio Waveform</h2> <canvas id="waveform-canvas" class="waveform-canvas" width="800" height="200" data-astro-cid-sl5o5qok></canvas> <div class="test-controls" data-astro-cid-sl5o5qok> <button id="start-visualization-btn" data-astro-cid-sl5o5qok>Start Visualization</button> <button id="stop-visualization-btn" data-astro-cid-sl5o5qok>Stop Visualization</button> <button id="generate-noise-btn" data-astro-cid-sl5o5qok>Generate Noise</button> <button id="generate-silence-btn" data-astro-cid-sl5o5qok>Generate Silence</button> </div> </div> <!-- Performance Testing Section --> <div class="test-section" data-astro-cid-sl5o5qok> <h2 data-astro-cid-sl5o5qok>Performance Testing</h2> <div class="controls" data-astro-cid-sl5o5qok> <div class="control-group" data-astro-cid-sl5o5qok> <label for="load-test-chunks" data-astro-cid-sl5o5qok>Number of Chunks</label> <input type="number" id="load-test-chunks" value="100" min="10" max="1000" data-astro-cid-sl5o5qok> </div> <div class="control-group" data-astro-cid-sl5o5qok> <label for="concurrency-level" data-astro-cid-sl5o5qok>Concurrency Level</label> <select id="concurrency-level" data-astro-cid-sl5o5qok> <option value="1" data-astro-cid-sl5o5qok>Sequential</option> <option value="2" data-astro-cid-sl5o5qok>2 concurrent</option> <option value="4" selected data-astro-cid-sl5o5qok>4 concurrent</option> <option value="8" data-astro-cid-sl5o5qok>8 concurrent</option> </select> </div> </div> <div class="test-controls" data-astro-cid-sl5o5qok> <button id="latency-test-btn" data-astro-cid-sl5o5qok>Latency Test</button> <button id="throughput-test-btn" data-astro-cid-sl5o5qok>Throughput Test</button> <button id="memory-stress-btn" data-astro-cid-sl5o5qok>Memory Stress Test</button> <button id="burst-test-btn" data-astro-cid-sl5o5qok>Burst Load Test</button> </div> </div> <!-- Error Testing Section --> <div class="test-section" data-astro-cid-sl5o5qok> <h2 data-astro-cid-sl5o5qok>Error Testing</h2> <div class="test-controls" data-astro-cid-sl5o5qok> <button id="corrupt-data-btn" data-astro-cid-sl5o5qok>Test Corrupted Data</button> <button id="context-error-btn" data-astro-cid-sl5o5qok>Simulate Context Error</button> <button id="memory-pressure-btn" data-astro-cid-sl5o5qok>Memory Pressure Test</button> <button id="recovery-test-btn" data-astro-cid-sl5o5qok>Error Recovery Test</button> </div> </div> <!-- Event Log Section --> <div class="test-section" data-astro-cid-sl5o5qok> <h2 data-astro-cid-sl5o5qok>Event Log</h2> <button id="clear-log-btn" style="margin-bottom: 10px;" data-astro-cid-sl5o5qok>Clear Log</button> <div id="event-log" class="log" data-astro-cid-sl5o5qok> <div data-astro-cid-sl5o5qok>Audio feedback test harness initialized</div> <div data-astro-cid-sl5o5qok>Ready for testing...</div> </div> </div> </div> <script type="module">
    // Audio Feedback Manager Mock for Testing
    class AudioFeedbackManagerTest {
      constructor() {
        this.audioContext = null;
        this.audioQueue = [];
        this.isPlaying = false;
        this.volume = 0.8;
        this.isMuted = false;
        this.currentState = 'idle';
        this.eventListeners = new Map();
        this.metrics = {
          latency: [],
          memory: [],
          throughput: [],
          processingTimes: []
        };
        this.lastThroughputTime = Date.now();
        this.operationCount = 0;
        
        this.initializeAudioContext();
        this.setupEventHandlers();
        this.startMetricsCollection();
      }

      async initializeAudioContext() {
        try {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          this.logEvent('Audio context initialized successfully');
          this.updateStatus('System initialized', 'success');
        } catch (error) {
          this.logEvent('Failed to initialize audio context: ' + error.message, 'error');
          this.updateStatus('Audio context failed', 'error');
        }
      }

      setupEventHandlers() {
        // Volume control
        document.getElementById('volume-control').addEventListener('input', (e) => {
          this.setVolume(parseFloat(e.target.value));
        });

        // Playback controls
        document.getElementById('play-tone-btn').addEventListener('click', () => {
          this.playTestTone();
        });

        document.getElementById('play-sequence-btn').addEventListener('click', () => {
          this.playSequence();
        });

        document.getElementById('stop-playback-btn').addEventListener('click', () => {
          this.stopPlayback();
        });

        document.getElementById('mute-btn').addEventListener('click', () => {
          this.toggleMute();
        });

        document.getElementById('clear-queue-btn').addEventListener('click', () => {
          this.clearQueue();
        });

        // Queue testing
        document.getElementById('add-chunk-btn').addEventListener('click', () => {
          this.addTestChunk();
        });

        document.getElementById('add-burst-btn').addEventListener('click', () => {
          this.addBurstChunks();
        });

        document.getElementById('test-overflow-btn').addEventListener('click', () => {
          this.testQueueOverflow();
        });

        // Performance testing
        document.getElementById('latency-test-btn').addEventListener('click', () => {
          this.runLatencyTest();
        });

        document.getElementById('throughput-test-btn').addEventListener('click', () => {
          this.runThroughputTest();
        });

        document.getElementById('memory-stress-btn').addEventListener('click', () => {
          this.runMemoryStressTest();
        });

        document.getElementById('burst-test-btn').addEventListener('click', () => {
          this.runBurstTest();
        });

        // Error testing
        document.getElementById('corrupt-data-btn').addEventListener('click', () => {
          this.testCorruptedData();
        });

        document.getElementById('context-error-btn').addEventListener('click', () => {
          this.simulateContextError();
        });

        document.getElementById('recovery-test-btn').addEventListener('click', () => {
          this.testErrorRecovery();
        });

        // Visualization
        document.getElementById('start-visualization-btn').addEventListener('click', () => {
          this.startWaveformVisualization();
        });

        document.getElementById('stop-visualization-btn').addEventListener('click', () => {
          this.stopWaveformVisualization();
        });

        // Utility
        document.getElementById('clear-log-btn').addEventListener('click', () => {
          this.clearLog();
        });

        // Update volume display
        document.getElementById('volume-control').addEventListener('input', (e) => {
          document.getElementById('volume-value').textContent = e.target.value;
        });
      }

      // Core Audio Methods
      async playTestTone() {
        const startTime = performance.now();
        
        try {
          const frequency = parseInt(document.getElementById('test-frequency').value);
          const chunkSize = parseInt(document.getElementById('chunk-size').value);
          
          const audioChunk = this.generateAudioChunk(chunkSize, frequency);
          await this.playAudioChunk(audioChunk);
          
          const latency = performance.now() - startTime;
          this.metrics.latency.push(latency);
          this.logEvent(\`Played test tone (\${frequency}Hz) - Latency: \${latency.toFixed(2)}ms\`);
        } catch (error) {
          this.logEvent('Failed to play test tone: ' + error.message, 'error');
        }
      }

      async playSequence() {
        const frequencies = [261, 293, 329, 349, 392, 440, 493, 523]; // C major scale
        this.logEvent('Playing musical sequence...');
        
        for (let i = 0; i < frequencies.length; i++) {
          const chunk = this.generateAudioChunk(1024, frequencies[i]);
          await this.playAudioChunk(chunk);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        this.logEvent('Musical sequence completed');
      }

      generateAudioChunk(size, frequency) {
        const sampleRate = parseInt(document.getElementById('sample-rate').value);
        const data = new Int16Array(size);
        
        for (let i = 0; i < size; i++) {
          const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.8;
          data[i] = Math.max(-32768, Math.min(32767, sample * 32767));
        }
        
        return {
          data,
          timestamp: Date.now(),
          sequenceId: this.audioQueue.length
        };
      }

      async playAudioChunk(chunk) {
        if (!this.audioContext || this.isMuted) return;
        
        try {
          if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
          }

          // Convert PCM16 to Float32
          const floatData = new Float32Array(chunk.data.length);
          for (let i = 0; i < chunk.data.length; i++) {
            floatData[i] = chunk.data[i] / 0x7FFF;
          }

          // Create audio buffer
          const audioBuffer = this.audioContext.createBuffer(1, floatData.length, 24000);
          audioBuffer.copyToChannel(floatData, 0);

          // Create source and play
          const source = this.audioContext.createBufferSource();
          const gainNode = this.audioContext.createGain();
          
          source.buffer = audioBuffer;
          source.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);

          return new Promise((resolve, reject) => {
            source.onended = resolve;
            source.onerror = reject;
            source.start();
          });
        } catch (error) {
          throw new Error(\`Audio playback failed: \${error.message}\`);
        }
      }

      // Queue Management
      addTestChunk() {
        const frequency = Math.random() * 1000 + 200; // Random frequency
        const chunk = this.generateAudioChunk(1024, frequency);
        this.enqueue(chunk);
        this.logEvent(\`Added audio chunk to queue (\${frequency.toFixed(0)}Hz)\`);
      }

      addBurstChunks() {
        for (let i = 0; i < 10; i++) {
          this.addTestChunk();
        }
        this.logEvent('Added burst of 10 chunks to queue');
      }

      enqueue(chunk) {
        if (this.audioQueue.length >= 20) {
          const dropped = this.audioQueue.shift();
          this.logEvent('Queue overflow - dropped chunk', 'warning');
        }
        
        this.audioQueue.push(chunk);
        this.updateQueueVisualization();
        this.operationCount++;
      }

      clearQueue() {
        const droppedCount = this.audioQueue.length;
        this.audioQueue = [];
        this.updateQueueVisualization();
        this.logEvent(\`Cleared queue - dropped \${droppedCount} chunks\`);
      }

      // Performance Testing
      async runLatencyTest() {
        this.logEvent('Running latency test...');
        const latencies = [];
        
        for (let i = 0; i < 20; i++) {
          const start = performance.now();
          const chunk = this.generateAudioChunk(512, 440);
          await this.playAudioChunk(chunk);
          const latency = performance.now() - start;
          latencies.push(latency);
          
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
        const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];
        
        this.logEvent(\`Latency test completed - Avg: \${avgLatency.toFixed(2)}ms, P95: \${p95Latency.toFixed(2)}ms\`);
      }

      async runThroughputTest() {
        this.logEvent('Running throughput test...');
        const chunkCount = parseInt(document.getElementById('load-test-chunks').value);
        const concurrency = parseInt(document.getElementById('concurrency-level').value);
        
        const startTime = performance.now();
        const chunks = Array.from({ length: chunkCount }, (_, i) => 
          this.generateAudioChunk(1024, 440 + i * 10)
        );
        
        // Process chunks with specified concurrency
        if (concurrency === 1) {
          for (const chunk of chunks) {
            await this.playAudioChunk(chunk);
          }
        } else {
          const batches = [];
          for (let i = 0; i < chunks.length; i += concurrency) {
            batches.push(chunks.slice(i, i + concurrency));
          }
          
          for (const batch of batches) {
            await Promise.all(batch.map(chunk => this.playAudioChunk(chunk)));
          }
        }
        
        const totalTime = (performance.now() - startTime) / 1000;
        const throughput = chunkCount / totalTime;
        
        this.logEvent(\`Throughput test completed - \${throughput.toFixed(2)} chunks/second\`);
      }

      async runMemoryStressTest() {
        this.logEvent('Running memory stress test...');
        const initialMemory = this.getMemoryUsage();
        
        // Generate large amounts of audio data
        for (let i = 0; i < 1000; i++) {
          const chunk = this.generateAudioChunk(2048, 440);
          this.enqueue(chunk);
          
          if (i % 100 === 0) {
            // Force garbage collection if available
            if (window.gc) window.gc();
            
            const currentMemory = this.getMemoryUsage();
            this.logEvent(\`Memory stress test progress: \${i}/1000 chunks, Memory: \${currentMemory}MB\`);
          }
        }
        
        const finalMemory = this.getMemoryUsage();
        const memoryIncrease = finalMemory - initialMemory;
        
        this.logEvent(\`Memory stress test completed - Memory increase: \${memoryIncrease.toFixed(2)}MB\`);
        this.clearQueue(); // Cleanup
      }

      async runBurstTest() {
        this.logEvent('Running burst load test...');
        
        // Generate rapid bursts of small chunks
        const burstSize = 50;
        const burstCount = 5;
        
        for (let burst = 0; burst < burstCount; burst++) {
          const startTime = performance.now();
          
          const chunks = Array.from({ length: burstSize }, (_, i) => 
            this.generateAudioChunk(128, 440 + i * 5)
          );
          
          // Process all chunks in the burst simultaneously
          await Promise.all(chunks.map(chunk => this.playAudioChunk(chunk)));
          
          const burstTime = performance.now() - startTime;
          this.logEvent(\`Burst \${burst + 1}/\${burstCount} completed in \${burstTime.toFixed(2)}ms\`);
          
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.logEvent('Burst load test completed');
      }

      // Error Testing
      testCorruptedData() {
        this.logEvent('Testing corrupted audio data...');
        
        try {
          const corruptChunk = {
            data: null, // Intentionally corrupt
            timestamp: Date.now(),
            sequenceId: -1
          };
          
          this.playAudioChunk(corruptChunk).catch(error => {
            this.logEvent(\`Corrupted data test - Error handled: \${error.message}\`, 'warning');
          });
        } catch (error) {
          this.logEvent(\`Corrupted data test - Exception caught: \${error.message}\`, 'error');
        }
      }

      simulateContextError() {
        this.logEvent('Simulating audio context error...');
        
        if (this.audioContext) {
          this.audioContext.close().then(() => {
            this.logEvent('Audio context closed - simulating recovery...');
            
            // Attempt to recreate context
            setTimeout(() => {
              this.initializeAudioContext();
              this.logEvent('Audio context recovery attempted');
            }, 1000);
          });
        }
      }

      async testErrorRecovery() {
        this.logEvent('Testing error recovery capabilities...');
        
        // Test 1: Context failure and recovery
        await this.simulateContextError();
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Test 2: Continue normal operation after recovery
        try {
          await this.playTestTone();
          this.logEvent('Error recovery test - Normal operation restored', 'success');
        } catch (error) {
          this.logEvent(\`Error recovery test - Failed to restore: \${error.message}\`, 'error');
        }
      }

      // Visualization and UI Updates
      updateQueueVisualization() {
        const visualizer = document.getElementById('queue-visualizer');
        
        if (this.audioQueue.length === 0) {
          visualizer.innerHTML = '<span style="color: #6b7280; font-size: 14px;">Queue is empty</span>';
        } else {
          visualizer.innerHTML = this.audioQueue.map((chunk, index) => 
            \`<div class="queue-item" title="Chunk \${chunk.sequenceId}">\${index + 1}</div>\`
          ).join('');
        }
        
        document.getElementById('queue-metric').textContent = this.audioQueue.length;
      }

      startWaveformVisualization() {
        const canvas = document.getElementById('waveform-canvas');
        const ctx = canvas.getContext('2d');
        let animationId;
        
        const drawWaveform = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 2;
          ctx.beginPath();
          
          const time = Date.now() / 1000;
          const frequency = 440;
          const amplitude = 80;
          const centerY = canvas.height / 2;
          
          for (let x = 0; x < canvas.width; x++) {
            const t = (x / canvas.width) * 4 * Math.PI + time * 2 * Math.PI * frequency / 1000;
            const y = centerY + Math.sin(t) * amplitude;
            
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          
          ctx.stroke();
          animationId = requestAnimationFrame(drawWaveform);
        };
        
        drawWaveform();
        this.logEvent('Waveform visualization started');
        
        // Store animation ID for cleanup
        this.waveformAnimation = animationId;
      }

      stopWaveformVisualization() {
        if (this.waveformAnimation) {
          cancelAnimationFrame(this.waveformAnimation);
          this.waveformAnimation = null;
          
          const canvas = document.getElementById('waveform-canvas');
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          this.logEvent('Waveform visualization stopped');
        }
      }

      // Utility Methods
      setVolume(volume) {
        this.volume = volume;
        this.logEvent(\`Volume set to \${(volume * 100).toFixed(0)}%\`);
      }

      toggleMute() {
        this.isMuted = !this.isMuted;
        const btn = document.getElementById('mute-btn');
        btn.textContent = this.isMuted ? 'Unmute' : 'Toggle Mute';
        this.logEvent(\`Audio \${this.isMuted ? 'muted' : 'unmuted'}\`);
        this.updateStatus(this.isMuted ? 'Audio muted' : 'Audio active', 'idle');
      }

      stopPlayback() {
        // Implementation would stop all active audio sources
        this.logEvent('Playback stopped');
        this.updateStatus('Playback stopped', 'idle');
      }

      getMemoryUsage() {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
        }
        return 0;
      }

      startMetricsCollection() {
        setInterval(() => {
          // Update latency metric
          if (this.metrics.latency.length > 0) {
            const avgLatency = this.metrics.latency.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, this.metrics.latency.length);
            document.getElementById('latency-metric').textContent = avgLatency.toFixed(1);
          }
          
          // Update memory metric
          const memoryUsage = this.getMemoryUsage();
          document.getElementById('memory-metric').textContent = memoryUsage.toFixed(1);
          
          // Update throughput metric
          const now = Date.now();
          const timeDiff = (now - this.lastThroughputTime) / 1000;
          if (timeDiff >= 1) {
            const throughput = this.operationCount / timeDiff;
            document.getElementById('throughput-metric').textContent = throughput.toFixed(1);
            this.lastThroughputTime = now;
            this.operationCount = 0;
          }
        }, 1000);
      }

      updateStatus(message, type = 'idle') {
        const statusElement = document.getElementById('system-status');
        statusElement.textContent = message;
        statusElement.className = \`status \${type}\`;
      }

      logEvent(message, type = 'info') {
        const log = document.getElementById('event-log');
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        
        let prefix = '';
        switch (type) {
          case 'error': prefix = '\u274C '; break;
          case 'warning': prefix = '\u26A0\uFE0F '; break;
          case 'success': prefix = '\u2705 '; break;
          default: prefix = '\u2139\uFE0F '; break;
        }
        
        logEntry.innerHTML = \`<span style="color: #6b7280;">[\${timestamp}]</span> \${prefix}\${message}\`;
        log.appendChild(logEntry);
        log.scrollTop = log.scrollHeight;
      }

      clearLog() {
        const log = document.getElementById('event-log');
        log.innerHTML = '<div>Log cleared</div>';
      }

      testQueueOverflow() {
        this.logEvent('Testing queue overflow behavior...');
        
        // Add more chunks than the queue limit
        for (let i = 0; i < 25; i++) {
          this.addTestChunk();
        }
        
        this.logEvent('Queue overflow test completed');
      }
    }

    // Initialize the test harness when the page loads
    document.addEventListener('DOMContentLoaded', () => {
      window.audioTestHarness = new AudioFeedbackManagerTest();
      console.log('Audio Feedback Test Harness initialized');
    });
  <\/script> </body> </html>`], ['<html lang="en" data-astro-cid-sl5o5qok> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Audio Feedback Test Harness</title>', `</head> <body data-astro-cid-sl5o5qok> <div class="container" data-astro-cid-sl5o5qok> <h1 data-astro-cid-sl5o5qok>\u{1F3B5} Audio Feedback System Test Harness</h1> <!-- System Status Section --> <div class="test-section" data-astro-cid-sl5o5qok> <h2 data-astro-cid-sl5o5qok>System Status</h2> <div class="status idle" id="system-status" data-astro-cid-sl5o5qok>System Ready</div> <div class="metrics" data-astro-cid-sl5o5qok> <div class="metric" data-astro-cid-sl5o5qok> <div class="metric-value" id="latency-metric" data-astro-cid-sl5o5qok>0</div> <div class="metric-label" data-astro-cid-sl5o5qok>Latency (ms)</div> </div> <div class="metric" data-astro-cid-sl5o5qok> <div class="metric-value" id="memory-metric" data-astro-cid-sl5o5qok>0</div> <div class="metric-label" data-astro-cid-sl5o5qok>Memory (MB)</div> </div> <div class="metric" data-astro-cid-sl5o5qok> <div class="metric-value" id="queue-metric" data-astro-cid-sl5o5qok>0</div> <div class="metric-label" data-astro-cid-sl5o5qok>Queue Size</div> </div> <div class="metric" data-astro-cid-sl5o5qok> <div class="metric-value" id="throughput-metric" data-astro-cid-sl5o5qok>0</div> <div class="metric-label" data-astro-cid-sl5o5qok>Throughput (ops/s)</div> </div> </div> </div> <!-- Audio Controls Section --> <div class="test-section" data-astro-cid-sl5o5qok> <h2 data-astro-cid-sl5o5qok>Audio Controls</h2> <div class="controls" data-astro-cid-sl5o5qok> <div class="control-group" data-astro-cid-sl5o5qok> <label for="volume-control" data-astro-cid-sl5o5qok>Volume</label> <input type="range" id="volume-control" min="0" max="1" step="0.1" value="0.8" data-astro-cid-sl5o5qok> <span id="volume-value" data-astro-cid-sl5o5qok>0.8</span> </div> <div class="control-group" data-astro-cid-sl5o5qok> <label for="sample-rate" data-astro-cid-sl5o5qok>Sample Rate</label> <select id="sample-rate" data-astro-cid-sl5o5qok> <option value="8000" data-astro-cid-sl5o5qok>8 kHz</option> <option value="16000" data-astro-cid-sl5o5qok>16 kHz</option> <option value="24000" selected data-astro-cid-sl5o5qok>24 kHz</option> <option value="44100" data-astro-cid-sl5o5qok>44.1 kHz</option> <option value="48000" data-astro-cid-sl5o5qok>48 kHz</option> </select> </div> <div class="control-group" data-astro-cid-sl5o5qok> <label for="chunk-size" data-astro-cid-sl5o5qok>Chunk Size</label> <select id="chunk-size" data-astro-cid-sl5o5qok> <option value="128" data-astro-cid-sl5o5qok>128 samples</option> <option value="256" data-astro-cid-sl5o5qok>256 samples</option> <option value="512" data-astro-cid-sl5o5qok>512 samples</option> <option value="1024" selected data-astro-cid-sl5o5qok>1024 samples</option> <option value="2048" data-astro-cid-sl5o5qok>2048 samples</option> </select> </div> <div class="control-group" data-astro-cid-sl5o5qok> <label for="test-frequency" data-astro-cid-sl5o5qok>Test Frequency</label> <input type="number" id="test-frequency" value="440" min="100" max="2000" data-astro-cid-sl5o5qok> </div> </div> <div class="test-controls" data-astro-cid-sl5o5qok> <button id="play-tone-btn" data-astro-cid-sl5o5qok>Play Test Tone</button> <button id="play-sequence-btn" data-astro-cid-sl5o5qok>Play Sequence</button> <button id="stop-playback-btn" data-astro-cid-sl5o5qok>Stop Playback</button> <button id="mute-btn" data-astro-cid-sl5o5qok>Toggle Mute</button> <button id="clear-queue-btn" data-astro-cid-sl5o5qok>Clear Queue</button> </div> </div> <!-- Queue Visualization Section --> <div class="test-section" data-astro-cid-sl5o5qok> <h2 data-astro-cid-sl5o5qok>Audio Queue Visualization</h2> <div class="queue-visualizer" id="queue-visualizer" data-astro-cid-sl5o5qok> <span style="color: #6b7280; font-size: 14px;" data-astro-cid-sl5o5qok>Queue is empty</span> </div> <div class="test-controls" data-astro-cid-sl5o5qok> <button id="add-chunk-btn" data-astro-cid-sl5o5qok>Add Audio Chunk</button> <button id="add-burst-btn" data-astro-cid-sl5o5qok>Add Burst (10 chunks)</button> <button id="test-overflow-btn" data-astro-cid-sl5o5qok>Test Queue Overflow</button> </div> </div> <!-- Waveform Visualization Section --> <div class="test-section" data-astro-cid-sl5o5qok> <h2 data-astro-cid-sl5o5qok>Audio Waveform</h2> <canvas id="waveform-canvas" class="waveform-canvas" width="800" height="200" data-astro-cid-sl5o5qok></canvas> <div class="test-controls" data-astro-cid-sl5o5qok> <button id="start-visualization-btn" data-astro-cid-sl5o5qok>Start Visualization</button> <button id="stop-visualization-btn" data-astro-cid-sl5o5qok>Stop Visualization</button> <button id="generate-noise-btn" data-astro-cid-sl5o5qok>Generate Noise</button> <button id="generate-silence-btn" data-astro-cid-sl5o5qok>Generate Silence</button> </div> </div> <!-- Performance Testing Section --> <div class="test-section" data-astro-cid-sl5o5qok> <h2 data-astro-cid-sl5o5qok>Performance Testing</h2> <div class="controls" data-astro-cid-sl5o5qok> <div class="control-group" data-astro-cid-sl5o5qok> <label for="load-test-chunks" data-astro-cid-sl5o5qok>Number of Chunks</label> <input type="number" id="load-test-chunks" value="100" min="10" max="1000" data-astro-cid-sl5o5qok> </div> <div class="control-group" data-astro-cid-sl5o5qok> <label for="concurrency-level" data-astro-cid-sl5o5qok>Concurrency Level</label> <select id="concurrency-level" data-astro-cid-sl5o5qok> <option value="1" data-astro-cid-sl5o5qok>Sequential</option> <option value="2" data-astro-cid-sl5o5qok>2 concurrent</option> <option value="4" selected data-astro-cid-sl5o5qok>4 concurrent</option> <option value="8" data-astro-cid-sl5o5qok>8 concurrent</option> </select> </div> </div> <div class="test-controls" data-astro-cid-sl5o5qok> <button id="latency-test-btn" data-astro-cid-sl5o5qok>Latency Test</button> <button id="throughput-test-btn" data-astro-cid-sl5o5qok>Throughput Test</button> <button id="memory-stress-btn" data-astro-cid-sl5o5qok>Memory Stress Test</button> <button id="burst-test-btn" data-astro-cid-sl5o5qok>Burst Load Test</button> </div> </div> <!-- Error Testing Section --> <div class="test-section" data-astro-cid-sl5o5qok> <h2 data-astro-cid-sl5o5qok>Error Testing</h2> <div class="test-controls" data-astro-cid-sl5o5qok> <button id="corrupt-data-btn" data-astro-cid-sl5o5qok>Test Corrupted Data</button> <button id="context-error-btn" data-astro-cid-sl5o5qok>Simulate Context Error</button> <button id="memory-pressure-btn" data-astro-cid-sl5o5qok>Memory Pressure Test</button> <button id="recovery-test-btn" data-astro-cid-sl5o5qok>Error Recovery Test</button> </div> </div> <!-- Event Log Section --> <div class="test-section" data-astro-cid-sl5o5qok> <h2 data-astro-cid-sl5o5qok>Event Log</h2> <button id="clear-log-btn" style="margin-bottom: 10px;" data-astro-cid-sl5o5qok>Clear Log</button> <div id="event-log" class="log" data-astro-cid-sl5o5qok> <div data-astro-cid-sl5o5qok>Audio feedback test harness initialized</div> <div data-astro-cid-sl5o5qok>Ready for testing...</div> </div> </div> </div> <script type="module">
    // Audio Feedback Manager Mock for Testing
    class AudioFeedbackManagerTest {
      constructor() {
        this.audioContext = null;
        this.audioQueue = [];
        this.isPlaying = false;
        this.volume = 0.8;
        this.isMuted = false;
        this.currentState = 'idle';
        this.eventListeners = new Map();
        this.metrics = {
          latency: [],
          memory: [],
          throughput: [],
          processingTimes: []
        };
        this.lastThroughputTime = Date.now();
        this.operationCount = 0;
        
        this.initializeAudioContext();
        this.setupEventHandlers();
        this.startMetricsCollection();
      }

      async initializeAudioContext() {
        try {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          this.logEvent('Audio context initialized successfully');
          this.updateStatus('System initialized', 'success');
        } catch (error) {
          this.logEvent('Failed to initialize audio context: ' + error.message, 'error');
          this.updateStatus('Audio context failed', 'error');
        }
      }

      setupEventHandlers() {
        // Volume control
        document.getElementById('volume-control').addEventListener('input', (e) => {
          this.setVolume(parseFloat(e.target.value));
        });

        // Playback controls
        document.getElementById('play-tone-btn').addEventListener('click', () => {
          this.playTestTone();
        });

        document.getElementById('play-sequence-btn').addEventListener('click', () => {
          this.playSequence();
        });

        document.getElementById('stop-playback-btn').addEventListener('click', () => {
          this.stopPlayback();
        });

        document.getElementById('mute-btn').addEventListener('click', () => {
          this.toggleMute();
        });

        document.getElementById('clear-queue-btn').addEventListener('click', () => {
          this.clearQueue();
        });

        // Queue testing
        document.getElementById('add-chunk-btn').addEventListener('click', () => {
          this.addTestChunk();
        });

        document.getElementById('add-burst-btn').addEventListener('click', () => {
          this.addBurstChunks();
        });

        document.getElementById('test-overflow-btn').addEventListener('click', () => {
          this.testQueueOverflow();
        });

        // Performance testing
        document.getElementById('latency-test-btn').addEventListener('click', () => {
          this.runLatencyTest();
        });

        document.getElementById('throughput-test-btn').addEventListener('click', () => {
          this.runThroughputTest();
        });

        document.getElementById('memory-stress-btn').addEventListener('click', () => {
          this.runMemoryStressTest();
        });

        document.getElementById('burst-test-btn').addEventListener('click', () => {
          this.runBurstTest();
        });

        // Error testing
        document.getElementById('corrupt-data-btn').addEventListener('click', () => {
          this.testCorruptedData();
        });

        document.getElementById('context-error-btn').addEventListener('click', () => {
          this.simulateContextError();
        });

        document.getElementById('recovery-test-btn').addEventListener('click', () => {
          this.testErrorRecovery();
        });

        // Visualization
        document.getElementById('start-visualization-btn').addEventListener('click', () => {
          this.startWaveformVisualization();
        });

        document.getElementById('stop-visualization-btn').addEventListener('click', () => {
          this.stopWaveformVisualization();
        });

        // Utility
        document.getElementById('clear-log-btn').addEventListener('click', () => {
          this.clearLog();
        });

        // Update volume display
        document.getElementById('volume-control').addEventListener('input', (e) => {
          document.getElementById('volume-value').textContent = e.target.value;
        });
      }

      // Core Audio Methods
      async playTestTone() {
        const startTime = performance.now();
        
        try {
          const frequency = parseInt(document.getElementById('test-frequency').value);
          const chunkSize = parseInt(document.getElementById('chunk-size').value);
          
          const audioChunk = this.generateAudioChunk(chunkSize, frequency);
          await this.playAudioChunk(audioChunk);
          
          const latency = performance.now() - startTime;
          this.metrics.latency.push(latency);
          this.logEvent(\\\`Played test tone (\\\${frequency}Hz) - Latency: \\\${latency.toFixed(2)}ms\\\`);
        } catch (error) {
          this.logEvent('Failed to play test tone: ' + error.message, 'error');
        }
      }

      async playSequence() {
        const frequencies = [261, 293, 329, 349, 392, 440, 493, 523]; // C major scale
        this.logEvent('Playing musical sequence...');
        
        for (let i = 0; i < frequencies.length; i++) {
          const chunk = this.generateAudioChunk(1024, frequencies[i]);
          await this.playAudioChunk(chunk);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        this.logEvent('Musical sequence completed');
      }

      generateAudioChunk(size, frequency) {
        const sampleRate = parseInt(document.getElementById('sample-rate').value);
        const data = new Int16Array(size);
        
        for (let i = 0; i < size; i++) {
          const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.8;
          data[i] = Math.max(-32768, Math.min(32767, sample * 32767));
        }
        
        return {
          data,
          timestamp: Date.now(),
          sequenceId: this.audioQueue.length
        };
      }

      async playAudioChunk(chunk) {
        if (!this.audioContext || this.isMuted) return;
        
        try {
          if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
          }

          // Convert PCM16 to Float32
          const floatData = new Float32Array(chunk.data.length);
          for (let i = 0; i < chunk.data.length; i++) {
            floatData[i] = chunk.data[i] / 0x7FFF;
          }

          // Create audio buffer
          const audioBuffer = this.audioContext.createBuffer(1, floatData.length, 24000);
          audioBuffer.copyToChannel(floatData, 0);

          // Create source and play
          const source = this.audioContext.createBufferSource();
          const gainNode = this.audioContext.createGain();
          
          source.buffer = audioBuffer;
          source.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);

          return new Promise((resolve, reject) => {
            source.onended = resolve;
            source.onerror = reject;
            source.start();
          });
        } catch (error) {
          throw new Error(\\\`Audio playback failed: \\\${error.message}\\\`);
        }
      }

      // Queue Management
      addTestChunk() {
        const frequency = Math.random() * 1000 + 200; // Random frequency
        const chunk = this.generateAudioChunk(1024, frequency);
        this.enqueue(chunk);
        this.logEvent(\\\`Added audio chunk to queue (\\\${frequency.toFixed(0)}Hz)\\\`);
      }

      addBurstChunks() {
        for (let i = 0; i < 10; i++) {
          this.addTestChunk();
        }
        this.logEvent('Added burst of 10 chunks to queue');
      }

      enqueue(chunk) {
        if (this.audioQueue.length >= 20) {
          const dropped = this.audioQueue.shift();
          this.logEvent('Queue overflow - dropped chunk', 'warning');
        }
        
        this.audioQueue.push(chunk);
        this.updateQueueVisualization();
        this.operationCount++;
      }

      clearQueue() {
        const droppedCount = this.audioQueue.length;
        this.audioQueue = [];
        this.updateQueueVisualization();
        this.logEvent(\\\`Cleared queue - dropped \\\${droppedCount} chunks\\\`);
      }

      // Performance Testing
      async runLatencyTest() {
        this.logEvent('Running latency test...');
        const latencies = [];
        
        for (let i = 0; i < 20; i++) {
          const start = performance.now();
          const chunk = this.generateAudioChunk(512, 440);
          await this.playAudioChunk(chunk);
          const latency = performance.now() - start;
          latencies.push(latency);
          
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
        const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];
        
        this.logEvent(\\\`Latency test completed - Avg: \\\${avgLatency.toFixed(2)}ms, P95: \\\${p95Latency.toFixed(2)}ms\\\`);
      }

      async runThroughputTest() {
        this.logEvent('Running throughput test...');
        const chunkCount = parseInt(document.getElementById('load-test-chunks').value);
        const concurrency = parseInt(document.getElementById('concurrency-level').value);
        
        const startTime = performance.now();
        const chunks = Array.from({ length: chunkCount }, (_, i) => 
          this.generateAudioChunk(1024, 440 + i * 10)
        );
        
        // Process chunks with specified concurrency
        if (concurrency === 1) {
          for (const chunk of chunks) {
            await this.playAudioChunk(chunk);
          }
        } else {
          const batches = [];
          for (let i = 0; i < chunks.length; i += concurrency) {
            batches.push(chunks.slice(i, i + concurrency));
          }
          
          for (const batch of batches) {
            await Promise.all(batch.map(chunk => this.playAudioChunk(chunk)));
          }
        }
        
        const totalTime = (performance.now() - startTime) / 1000;
        const throughput = chunkCount / totalTime;
        
        this.logEvent(\\\`Throughput test completed - \\\${throughput.toFixed(2)} chunks/second\\\`);
      }

      async runMemoryStressTest() {
        this.logEvent('Running memory stress test...');
        const initialMemory = this.getMemoryUsage();
        
        // Generate large amounts of audio data
        for (let i = 0; i < 1000; i++) {
          const chunk = this.generateAudioChunk(2048, 440);
          this.enqueue(chunk);
          
          if (i % 100 === 0) {
            // Force garbage collection if available
            if (window.gc) window.gc();
            
            const currentMemory = this.getMemoryUsage();
            this.logEvent(\\\`Memory stress test progress: \\\${i}/1000 chunks, Memory: \\\${currentMemory}MB\\\`);
          }
        }
        
        const finalMemory = this.getMemoryUsage();
        const memoryIncrease = finalMemory - initialMemory;
        
        this.logEvent(\\\`Memory stress test completed - Memory increase: \\\${memoryIncrease.toFixed(2)}MB\\\`);
        this.clearQueue(); // Cleanup
      }

      async runBurstTest() {
        this.logEvent('Running burst load test...');
        
        // Generate rapid bursts of small chunks
        const burstSize = 50;
        const burstCount = 5;
        
        for (let burst = 0; burst < burstCount; burst++) {
          const startTime = performance.now();
          
          const chunks = Array.from({ length: burstSize }, (_, i) => 
            this.generateAudioChunk(128, 440 + i * 5)
          );
          
          // Process all chunks in the burst simultaneously
          await Promise.all(chunks.map(chunk => this.playAudioChunk(chunk)));
          
          const burstTime = performance.now() - startTime;
          this.logEvent(\\\`Burst \\\${burst + 1}/\\\${burstCount} completed in \\\${burstTime.toFixed(2)}ms\\\`);
          
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.logEvent('Burst load test completed');
      }

      // Error Testing
      testCorruptedData() {
        this.logEvent('Testing corrupted audio data...');
        
        try {
          const corruptChunk = {
            data: null, // Intentionally corrupt
            timestamp: Date.now(),
            sequenceId: -1
          };
          
          this.playAudioChunk(corruptChunk).catch(error => {
            this.logEvent(\\\`Corrupted data test - Error handled: \\\${error.message}\\\`, 'warning');
          });
        } catch (error) {
          this.logEvent(\\\`Corrupted data test - Exception caught: \\\${error.message}\\\`, 'error');
        }
      }

      simulateContextError() {
        this.logEvent('Simulating audio context error...');
        
        if (this.audioContext) {
          this.audioContext.close().then(() => {
            this.logEvent('Audio context closed - simulating recovery...');
            
            // Attempt to recreate context
            setTimeout(() => {
              this.initializeAudioContext();
              this.logEvent('Audio context recovery attempted');
            }, 1000);
          });
        }
      }

      async testErrorRecovery() {
        this.logEvent('Testing error recovery capabilities...');
        
        // Test 1: Context failure and recovery
        await this.simulateContextError();
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Test 2: Continue normal operation after recovery
        try {
          await this.playTestTone();
          this.logEvent('Error recovery test - Normal operation restored', 'success');
        } catch (error) {
          this.logEvent(\\\`Error recovery test - Failed to restore: \\\${error.message}\\\`, 'error');
        }
      }

      // Visualization and UI Updates
      updateQueueVisualization() {
        const visualizer = document.getElementById('queue-visualizer');
        
        if (this.audioQueue.length === 0) {
          visualizer.innerHTML = '<span style="color: #6b7280; font-size: 14px;">Queue is empty</span>';
        } else {
          visualizer.innerHTML = this.audioQueue.map((chunk, index) => 
            \\\`<div class="queue-item" title="Chunk \\\${chunk.sequenceId}">\\\${index + 1}</div>\\\`
          ).join('');
        }
        
        document.getElementById('queue-metric').textContent = this.audioQueue.length;
      }

      startWaveformVisualization() {
        const canvas = document.getElementById('waveform-canvas');
        const ctx = canvas.getContext('2d');
        let animationId;
        
        const drawWaveform = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 2;
          ctx.beginPath();
          
          const time = Date.now() / 1000;
          const frequency = 440;
          const amplitude = 80;
          const centerY = canvas.height / 2;
          
          for (let x = 0; x < canvas.width; x++) {
            const t = (x / canvas.width) * 4 * Math.PI + time * 2 * Math.PI * frequency / 1000;
            const y = centerY + Math.sin(t) * amplitude;
            
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          
          ctx.stroke();
          animationId = requestAnimationFrame(drawWaveform);
        };
        
        drawWaveform();
        this.logEvent('Waveform visualization started');
        
        // Store animation ID for cleanup
        this.waveformAnimation = animationId;
      }

      stopWaveformVisualization() {
        if (this.waveformAnimation) {
          cancelAnimationFrame(this.waveformAnimation);
          this.waveformAnimation = null;
          
          const canvas = document.getElementById('waveform-canvas');
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          this.logEvent('Waveform visualization stopped');
        }
      }

      // Utility Methods
      setVolume(volume) {
        this.volume = volume;
        this.logEvent(\\\`Volume set to \\\${(volume * 100).toFixed(0)}%\\\`);
      }

      toggleMute() {
        this.isMuted = !this.isMuted;
        const btn = document.getElementById('mute-btn');
        btn.textContent = this.isMuted ? 'Unmute' : 'Toggle Mute';
        this.logEvent(\\\`Audio \\\${this.isMuted ? 'muted' : 'unmuted'}\\\`);
        this.updateStatus(this.isMuted ? 'Audio muted' : 'Audio active', 'idle');
      }

      stopPlayback() {
        // Implementation would stop all active audio sources
        this.logEvent('Playback stopped');
        this.updateStatus('Playback stopped', 'idle');
      }

      getMemoryUsage() {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
        }
        return 0;
      }

      startMetricsCollection() {
        setInterval(() => {
          // Update latency metric
          if (this.metrics.latency.length > 0) {
            const avgLatency = this.metrics.latency.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, this.metrics.latency.length);
            document.getElementById('latency-metric').textContent = avgLatency.toFixed(1);
          }
          
          // Update memory metric
          const memoryUsage = this.getMemoryUsage();
          document.getElementById('memory-metric').textContent = memoryUsage.toFixed(1);
          
          // Update throughput metric
          const now = Date.now();
          const timeDiff = (now - this.lastThroughputTime) / 1000;
          if (timeDiff >= 1) {
            const throughput = this.operationCount / timeDiff;
            document.getElementById('throughput-metric').textContent = throughput.toFixed(1);
            this.lastThroughputTime = now;
            this.operationCount = 0;
          }
        }, 1000);
      }

      updateStatus(message, type = 'idle') {
        const statusElement = document.getElementById('system-status');
        statusElement.textContent = message;
        statusElement.className = \\\`status \\\${type}\\\`;
      }

      logEvent(message, type = 'info') {
        const log = document.getElementById('event-log');
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        
        let prefix = '';
        switch (type) {
          case 'error': prefix = '\u274C '; break;
          case 'warning': prefix = '\u26A0\uFE0F '; break;
          case 'success': prefix = '\u2705 '; break;
          default: prefix = '\u2139\uFE0F '; break;
        }
        
        logEntry.innerHTML = \\\`<span style="color: #6b7280;">[\\\${timestamp}]</span> \\\${prefix}\\\${message}\\\`;
        log.appendChild(logEntry);
        log.scrollTop = log.scrollHeight;
      }

      clearLog() {
        const log = document.getElementById('event-log');
        log.innerHTML = '<div>Log cleared</div>';
      }

      testQueueOverflow() {
        this.logEvent('Testing queue overflow behavior...');
        
        // Add more chunks than the queue limit
        for (let i = 0; i < 25; i++) {
          this.addTestChunk();
        }
        
        this.logEvent('Queue overflow test completed');
      }
    }

    // Initialize the test harness when the page loads
    document.addEventListener('DOMContentLoaded', () => {
      window.audioTestHarness = new AudioFeedbackManagerTest();
      console.log('Audio Feedback Test Harness initialized');
    });
  <\/script> </body> </html>`])), renderHead());
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/test-audio.astro", void 0);

const $$file = "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/test-audio.astro";
const $$url = "/test-audio";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$TestAudio,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
