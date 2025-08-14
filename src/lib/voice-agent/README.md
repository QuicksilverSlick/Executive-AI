# WebRTC Voice Agent Integration

Professional-grade WebRTC integration for OpenAI Realtime API voice communication.

## Features

### 🎙️ Advanced Audio Processing
- **Real-time noise reduction** using spectral subtraction
- **Echo cancellation** with adaptive filtering  
- **Voice activity detection** with intelligent silence handling
- **Dynamic range compression** for consistent audio levels
- **Professional audio worklet** processing at 24kHz

### 🌐 Robust Network Handling
- **Adaptive quality control** based on network conditions
- **Network quality monitoring** with real-time metrics
- **Automatic bitrate adjustment** for optimal performance
- **Connection health monitoring** with detailed statistics

### 🔧 Error Recovery & Resilience
- **Multi-layered recovery strategies** with exponential backoff
- **Circuit breaker pattern** to prevent cascade failures
- **Automatic reconnection** with token refresh
- **Graceful degradation** to fallback modes

### 📊 Quality Monitoring
- **Real-time latency tracking** for performance optimization
- **Audio quality metrics** with clipping detection
- **Network performance analysis** with recommendations
- **Comprehensive error reporting** with recovery suggestions

## Quick Start

```typescript
import { createWebRTCVoiceAgent } from './lib/voice-agent/webrtc';

// Initialize voice agent
const voiceAgent = createWebRTCVoiceAgent({
  audioConstraints: {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 24000
    }
  },
  maxReconnectAttempts: 3,
  reconnectDelay: 1000
});

// Set up event handlers
voiceAgent.on('connected', () => {
  console.log('Voice agent connected');
});

voiceAgent.on('messageReceived', (message) => {
  console.log('AI response:', message.content);
});

voiceAgent.on('error', (error) => {
  console.error('Voice agent error:', error);
});

// Initialize and start
await voiceAgent.initialize();
voiceAgent.startListening();
```

## Architecture

### Core Components

1. **WebRTCConnection** - Manages peer connection and OpenAI protocol
2. **WebRTCAudioProcessor** - Handles audio processing and worklets
3. **NetworkMonitor** - Monitors connection quality and performance
4. **ErrorRecoveryManager** - Implements recovery strategies

### Audio Processing Pipeline

```
Microphone → Audio Worklet → WebRTC → OpenAI Realtime API
     ↓              ↓              ↓
Voice Activity → Noise Reduction → Quality Adaptation
  Detection        Echo Cancel.      Network Monitor
```

### Recovery Strategies

1. **Simple Reconnect** - Basic connection retry
2. **Token Refresh** - Refresh expired authentication
3. **Audio Restart** - Reinitialize audio system
4. **Quality Adjustment** - Adapt to network conditions
5. **Full Reset** - Complete system restart
6. **Fallback Mode** - Degraded but functional operation

## Configuration

### Audio Settings

```typescript
const audioConfig = {
  audio: {
    echoCancellation: true,      // Hardware echo cancellation
    noiseSuppression: true,      // Hardware noise suppression
    autoGainControl: true,       // Automatic gain control
    sampleRate: 24000,          // Sample rate (8000, 16000, 24000)
    channelCount: 1,            // Mono audio
    googEchoCancellation: true,  // Google-specific enhancements
    googNoiseSuppression: true,
    googAutoGainControl: true
  }
};
```

### Quality Presets

- **Excellent** - 128kbps, 24kHz, full processing
- **Good** - 96kbps, 16kHz, standard processing  
- **Fair** - 64kbps, 16kHz, reduced processing
- **Poor** - 32kbps, 8kHz, minimal processing
- **Critical** - 16kbps, 8kHz, basic functionality

## Events

### Connection Events
- `connectionStateChange` - Connection state updates
- `connected` - Successfully connected
- `disconnected` - Connection lost
- `reconnecting` - Attempting reconnection

### Conversation Events
- `conversationStateChange` - Conversation state updates
- `messageReceived` - New message from AI
- `transcriptionReceived` - Live transcription text
- `voiceActivityDetected` - User speech detection

### Audio Events
- `audioLevelChange` - Real-time audio levels
- `playbackStarted` - AI started speaking
- `playbackFinished` - AI finished speaking
- `recordingStarted` - Started recording user
- `recordingStopped` - Stopped recording user

### Error Events
- `error` - Error occurred
- `recoveryStarted` - Recovery attempt started
- `recoveryCompleted` - Recovery attempt finished
- `fallbackActivated` - Fallback mode engaged

## Error Handling

### Error Types

- `microphone_permission_denied` - User denied microphone access
- `connection_failed` - WebRTC connection failed
- `audio_not_supported` - Browser doesn't support required audio features
- `token_expired` - Authentication token expired
- `network_error` - Network connectivity issues
- `api_error` - OpenAI API error
- `browser_not_supported` - Browser lacks required features
- `session_timeout` - Session timed out

### Recovery Patterns

```typescript
voiceAgent.on('error', async (error) => {
  if (error.recoverable) {
    // Automatic recovery will be attempted
    console.log('Attempting automatic recovery...');
  } else {
    // Manual intervention required
    console.error('Manual recovery needed:', error.type);
    
    switch (error.type) {
      case 'microphone_permission_denied':
        // Show permission instructions
        break;
      case 'browser_not_supported':
        // Show browser compatibility message
        break;
    }
  }
});
```

## Browser Compatibility

### Required Features
- WebRTC peer connections
- AudioWorklet support
- MediaStream API
- Modern JavaScript (ES2020+)

### Supported Browsers
- ✅ Chrome 88+ (recommended)
- ✅ Firefox 84+
- ✅ Safari 14.1+
- ✅ Edge 88+
- ⚠️ Mobile browsers (limited worklet support)

### Fallback Support
- Graceful degradation for older browsers
- Simplified audio processing without worklets
- Basic WebRTC without advanced features

## Performance Optimization

### Audio Worklet Benefits
- **Low latency** - Sub-10ms audio processing
- **High quality** - Professional-grade audio processing
- **CPU efficient** - Dedicated audio thread
- **Real-time** - No blocking of main thread

### Network Optimization
- **Adaptive bitrate** - Automatic quality adjustment
- **Connection pooling** - Efficient WebRTC management
- **Quality monitoring** - Proactive network issue detection
- **Bandwidth management** - Smart resource allocation

## Troubleshooting

### Common Issues

**Connection Fails**
- Check network connectivity
- Verify API token is valid
- Ensure firewall allows WebRTC

**Poor Audio Quality**
- Check microphone permissions
- Verify network bandwidth
- Try different quality settings

**High Latency**
- Check network quality
- Reduce audio processing complexity
- Use wired internet connection

**Echo/Feedback**
- Enable echo cancellation
- Use headphones instead of speakers
- Check microphone placement

### Debug Mode

```typescript
// Enable detailed logging
const voiceAgent = createWebRTCVoiceAgent({
  debug: true,
  logLevel: 'verbose'
});

// Monitor all events
voiceAgent.on('*', (event, data) => {
  console.log(`Event: ${event}`, data);
});
```

## Security Considerations

### Data Handling
- Audio data processed in real-time
- No persistent audio storage
- Secure WebRTC connections (DTLS/SRTP)
- Token-based authentication

### Privacy
- Microphone access with user consent
- Encrypted voice transmission
- No audio data retention
- GDPR compliant processing

### Network Security
- TLS 1.3 for API communication
- WebRTC encryption (DTLS)
- Secure token refresh mechanism
- Protection against replay attacks

## License

Part of the Executive AI Training platform. All rights reserved.