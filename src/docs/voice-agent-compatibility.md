# Voice Agent API Compatibility Guide

## Overview

The Voice Agent system now includes comprehensive compatibility detection and graceful fallback modes to handle different OpenAI API tiers and availability scenarios.

## API Tier Requirements

### Realtime API (Optimal Experience)
- **Requirements**: OpenAI API account with Realtime API access
- **Features**:
  - Ultra-low latency voice conversations
  - Real-time audio streaming
  - Advanced voice processing
  - Server-side voice activity detection
  - Optimal user experience

### Standard API (Fallback Mode)
- **Requirements**: OpenAI API account with Chat Completions and TTS access
- **Features**:
  - Chat completions with function calling
  - Text-to-speech synthesis
  - Speech-to-text transcription
  - Higher latency but full functionality
  - Automatic fallback when Realtime API unavailable

### Demo Mode (No API Required)
- **Requirements**: None - works without API access
- **Features**:
  - Simulated conversation patterns
  - UI testing and development
  - Function call simulation
  - No actual AI processing

## Automatic Detection

The system automatically detects your API capabilities:

1. **Tier Detection**: Tests Realtime API availability
2. **Feature Mapping**: Determines available features
3. **Mode Selection**: Chooses optimal operating mode
4. **Graceful Degradation**: Falls back to lower tiers as needed

## Error Handling

### Unknown Parameter 'expires_at' Error
This error indicates:
- Realtime API is not available on your current tier
- System automatically falls back to Standard API mode
- No action required - fallback is transparent

### API Key Issues
- Invalid or missing API key triggers demo mode
- Clear error messages guide toward resolution
- Upgrade recommendations provided

## Configuration

### Environment Variables

```bash
# Required for API access
OPENAI_API_KEY=your_api_key_here

# Optional: Force demo mode for testing
VOICE_AGENT_DEMO_MODE=true

# Optional: Configure token duration (seconds)
VOICE_AGENT_TOKEN_DURATION=60

# Optional: Rate limiting
VOICE_AGENT_RATE_LIMIT=10
```

### Client Configuration

```typescript
const tokenManager = createTokenManager({
  compatibilityCheckEnabled: true,
  preferredMode: 'auto', // 'realtime' | 'fallback' | 'demo' | 'auto'
  baseUrl: 'https://your-domain.com'
});

// Listen for mode changes
tokenManager.on('modeChanged', (mode) => {
  console.log(`Operating in ${mode} mode`);
});

// Listen for compatibility results
tokenManager.on('compatibilityChecked', (result) => {
  console.log('API capabilities:', result.features);
  if (result.limitations?.length > 0) {
    console.warn('Limitations:', result.limitations);
  }
});
```

## API Endpoints

### GET /api/voice-agent/compatibility
Check API tier and feature availability.

**Response Example:**
```json
{
  "success": true,
  "tier": "standard",
  "features": {
    "realtimeVoice": false,
    "chatCompletion": true,
    "textToSpeech": true,
    "speechToText": true,
    "functionCalling": true
  },
  "limitations": [
    "Realtime API not available on current tier",
    "Higher latency with Chat API + TTS approach"
  ],
  "recommendations": [
    "Current setup supports Chat API with Text-to-Speech",
    "Consider upgrading for real-time voice features"
  ],
  "upgradeInfo": {
    "required": false,
    "tierName": "Realtime API Access",
    "benefits": [
      "Ultra-low latency voice conversations",
      "Real-time audio streaming"
    ],
    "upgradeUrl": "https://platform.openai.com/docs/guides/realtime"
  }
}
```

### POST /api/voice-agent/token
Generate authentication token with automatic tier detection.

**Response Example:**
```json
{
  "success": true,
  "token": "your_token_here",
  "expiresAt": 1703123456789,
  "sessionId": "session_123",
  "mode": "fallback",
  "warnings": [
    "Realtime API not available on current tier - using Chat API with TTS"
  ]
}
```

### POST /api/voice-agent/chat-fallback
Fallback endpoint using Chat API + TTS.

### POST /api/voice-agent/demo
Demo mode endpoint for testing without API access.

## Troubleshooting

### Common Issues

1. **"Unknown parameter 'expires_at'"**
   - **Cause**: Realtime API not available
   - **Solution**: System automatically uses fallback mode
   - **Action**: None required, or upgrade API tier

2. **"Token generation failed: 401"**
   - **Cause**: Invalid API key
   - **Solution**: Check OPENAI_API_KEY environment variable
   - **Action**: Update API key in environment

3. **"Token generation failed: 403"**
   - **Cause**: API key doesn't have required permissions
   - **Solution**: Check API key permissions or upgrade plan
   - **Action**: Visit OpenAI dashboard to upgrade

4. **Demo mode when API key is set**
   - **Cause**: API connectivity issues or invalid key
   - **Solution**: Check network and API key validity
   - **Action**: Test API key with curl or OpenAI CLI

### Testing Different Modes

```bash
# Test with Realtime API (if available)
curl -X POST http://localhost:4321/api/voice-agent/token

# Force demo mode
VOICE_AGENT_DEMO_MODE=true curl -X POST http://localhost:4321/api/voice-agent/token

# Check compatibility
curl http://localhost:4321/api/voice-agent/compatibility
```

## Migration Guide

### From Previous Version

The system is backward compatible. Existing implementations will:
1. Automatically detect API capabilities
2. Choose optimal mode
3. Provide warnings for sub-optimal configurations
4. Continue working without code changes

### Recommended Updates

1. **Add event listeners** for mode changes and compatibility checks
2. **Handle warnings** in the UI to inform users of limitations
3. **Test fallback modes** to ensure graceful degradation
4. **Update error handling** to handle new response fields

## Best Practices

1. **Enable compatibility checking** for production deployments
2. **Monitor mode changes** to understand user experience
3. **Provide clear messaging** about API limitations
4. **Test all modes** during development
5. **Cache compatibility results** to reduce API calls
6. **Handle network failures** gracefully
7. **Provide upgrade guidance** when beneficial

## Support

For issues related to:
- **API tier detection**: Check compatibility endpoint
- **Fallback mode**: Verify Chat API and TTS access
- **Demo mode**: Ensure it's intentionally enabled
- **Upgrade requirements**: Consult OpenAI documentation

The system provides detailed logging and error messages to help troubleshoot issues.