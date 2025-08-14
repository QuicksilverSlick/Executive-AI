# Audio Feedback System Test Suite

This directory contains comprehensive tests for the audio feedback system integrated with the voice agent. The test suite provides extensive coverage of audio processing, performance benchmarking, and end-to-end user flows.

## Test Structure

```
src/tests/
├── audio/                      # Unit tests for audio feedback components
│   └── AudioFeedbackManager.test.ts
├── integration/                # Integration tests
│   └── voice-agent-audio.test.ts
├── e2e/                       # End-to-end tests
│   └── voice-search-audio.e2e.ts
├── performance/               # Performance benchmarks
│   └── audio-performance.test.ts
└── README.md                  # This file
```

## Test Categories

### 1. Unit Tests (`audio/`)
**File**: `AudioFeedbackManager.test.ts`

Tests the core AudioFeedbackManager functionality:
- ✅ State transitions (idle → playing → paused → stopped)
- ✅ Audio queue management (enqueue, dequeue, overflow handling)
- ✅ Volume control and mute functionality
- ✅ Error handling and recovery
- ✅ Memory cleanup and resource management
- ✅ Event system (listeners, emission, cleanup)

**Key Features Tested**:
- Queue overflow protection (max 10 items)
- Volume range validation (0.0 - 1.0)
- State transition validation
- Memory cleanup on disposal
- Event listener management

### 2. Integration Tests (`integration/`)
**File**: `voice-agent-audio.test.ts`

Tests integration between components:
- ✅ WebRTC audio stream mixing
- ✅ OpenAI Realtime API function call triggers
- ✅ Audio feedback timing (< 50ms response requirement)
- ✅ Progressive update intervals
- ✅ Interruption handling
- ✅ Performance metrics collection

**Key Integration Points**:
- WebRTC ↔ Audio Processor
- OpenAI API ↔ Function Calls
- Audio Queue ↔ Playback System
- Performance Monitoring ↔ All Components

### 3. End-to-End Tests (`e2e/`)
**File**: `voice-search-audio.e2e.ts`

Tests complete user journeys:
- ✅ Full voice search flow with audio feedback
- ✅ User preference persistence (volume, speed, settings)
- ✅ Accessibility features (screen reader, keyboard nav)
- ✅ Mobile/desktop compatibility
- ✅ Network stress and error recovery
- ✅ Multi-device orientation changes

**Test Scenarios**:
- Happy path: Complete search interaction
- Error recovery: Connection failures, audio issues
- Accessibility: Screen reader navigation, keyboard shortcuts
- Responsive: Mobile, tablet, desktop viewports
- Performance: Network stress, concurrent users

### 4. Performance Tests (`performance/`)
**File**: `audio-performance.test.ts`

Comprehensive performance benchmarking:
- ✅ Audio latency measurement (target: < 50ms)
- ✅ Memory usage monitoring (target: < 50MB)
- ✅ CPU impact assessment (target: < 80%)
- ✅ Network bandwidth optimization
- ✅ Stress testing and load scenarios

**Performance Metrics**:
- Latency: Average, P95, P99 percentiles
- Memory: Peak usage, leak detection
- Throughput: Chunks processed per second
- CPU: Usage percentage over time

## Test Configuration

### Setup Files
- **`tests/setup/test-setup.js`**: Global test environment setup
- **`tests/setup/audio-test-utils.js`**: Audio-specific test utilities
- **`tests/config/voice-agent-test.config.js`**: Test configuration constants

### Mock Components
- **AudioContext**: Full Web Audio API mock
- **MediaDevices**: getUserMedia and device enumeration
- **WebRTC**: RTCPeerConnection and related APIs
- **WebSocket**: OpenAI Realtime API connection mock

## Running Tests

### Individual Test Suites
```bash
# Unit tests only
npm run test:audio

# Integration tests
npm run test:audio-integration  

# Performance benchmarks
npm run test:audio-performance

# E2E tests
npm run test:e2e:audio
```

### Complete Audio Test Suite
```bash
# Run all audio-related tests
npm run test:audio-all
```

### With Coverage
```bash
# Run with coverage report
npm run test:coverage
```

### Watch Mode
```bash
# Run tests in watch mode
npm run test:ui
```

## Manual Testing

### Test Harness
A comprehensive manual testing interface is available at:
**URL**: `http://localhost:4321/test-audio`

**Features**:
- ✅ Audio controls (volume, frequency, sample rate)
- ✅ Queue visualization and manipulation
- ✅ Waveform visualization
- ✅ Performance testing tools
- ✅ Error simulation and recovery testing
- ✅ Real-time metrics display
- ✅ Event logging and monitoring

## Performance Requirements

### Latency Targets
- **Excellent**: < 10ms audio processing
- **Good**: < 25ms end-to-end response  
- **Acceptable**: < 50ms user-perceived delay
- **Poor**: > 100ms (requires optimization)

### Memory Targets
- **Low**: < 10MB baseline usage
- **Medium**: < 25MB under normal load
- **High**: < 50MB under stress conditions

### CPU Targets  
- **Low**: < 20% average CPU usage
- **Medium**: < 50% during processing
- **High**: < 80% peak load (brief spikes acceptable)

## Test Data and Utilities

### Audio Test Data Generator
```javascript
// Generate test audio chunks
const chunk = AudioTestDataGenerator.generateAudioChunk(1024, 440); // 1024 samples at 440Hz
const sequence = AudioTestDataGenerator.generateAudioChunkSequence(10, 1024, 440);
const noise = AudioTestDataGenerator.generateWhiteNoise(1024, 0.1);
const silence = AudioTestDataGenerator.generateSilence(1024);
```

### Performance Utilities  
```javascript
// Measure latency
const latency = await PerformanceTestUtils.measureLatency(() => processAudio());

// Measure throughput
const throughput = await PerformanceTestUtils.measureThroughput(chunks, processor, 4);

// Monitor memory
const memoryDelta = await PerformanceTestUtils.measureMemoryDuring(() => heavyOperation());
```

### Custom Assertions
```javascript
// Audio-specific assertions
expect(latency).expectLatencyUnder(50);
expect(memoryUsage).expectMemoryUnder(25);  
expect(audioData).expectAudioQuality(0.001, 0.05);
expect(distribution).expectPerformanceDistribution({ maxP95: 25 });
```

## Continuous Integration

### Test Execution Order
1. Unit tests (fastest, run first)
2. Integration tests (medium duration)
3. Performance benchmarks (longer duration)  
4. E2E tests (slowest, run last)

### Coverage Requirements
- **Unit Tests**: 95% line coverage minimum
- **Integration Tests**: All critical paths covered
- **E2E Tests**: Complete user journeys validated
- **Performance Tests**: All targets validated

### Failure Handling
- **Unit Test Failures**: Block deployment
- **Integration Failures**: Block deployment  
- **Performance Regression**: Warning + investigation
- **E2E Failures**: Block deployment

## Troubleshooting

### Common Issues

#### Audio Context Initialization
```javascript
// Issue: AudioContext fails to initialize
// Solution: Check browser autoplay policies
if (audioContext.state === 'suspended') {
  await audioContext.resume();
}
```

#### Memory Leaks
```javascript
// Issue: Memory usage keeps growing
// Solution: Ensure proper cleanup
await audioProcessor.cleanup();
eventListeners.clear();
```

#### Timing Issues
```javascript
// Issue: Tests are flaky due to timing
// Solution: Use proper async/await patterns
await waitForAudioPlayback();
expect(status).toBe('playing');
```

### Debug Tools
- **Chrome DevTools**: Audio tab for Web Audio debugging
- **Performance Tab**: Memory and CPU profiling
- **Console Logs**: Detailed event logging in test harness
- **Network Tab**: WebSocket message monitoring

## Contributing

When adding new audio features:

1. **Add Unit Tests**: Cover all new functionality
2. **Update Integration Tests**: Test component interactions
3. **Add E2E Scenarios**: Test user-facing features
4. **Benchmark Performance**: Ensure no regressions
5. **Update Documentation**: Keep this README current

### Test Naming Convention
```
describe('ComponentName', () => {
  describe('Feature Category', () => {
    it('should perform expected behavior under normal conditions', () => {
      // Test implementation
    });
    
    it('should handle error conditions gracefully', () => {
      // Error handling test
    });
  });
});
```

## Architecture Integration

The audio feedback system integrates with:
- **Voice Agent Core**: Primary interface for audio processing
- **WebRTC Pipeline**: Real-time audio streaming  
- **OpenAI Realtime API**: Function call triggers and responses
- **UI Components**: Volume controls, status indicators
- **Analytics System**: Performance metrics and usage tracking

This comprehensive test suite ensures the audio feedback system meets all performance, reliability, and usability requirements for production deployment.