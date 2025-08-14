# Fixing Voice Agent Port Issue

## Problem
The voice agent is trying to connect to port 4324 instead of the correct port 4321 where the main application is running. This is causing a 403 Forbidden error when trying to get tokens.

## Root Cause
The issue appears to be that the voice agent is running in a different context where `window.location.origin` returns a different port (4324).

## Solution

### Option 1: Force Correct Origin (Recommended)
Update the voice agent configuration to use an absolute URL with the correct port:

```javascript
// In useWebRTCVoiceAssistant.ts, update the agent creation:
const agent = createWebRTCVoiceAgent({
  apiEndpoint: window.location.origin.replace(':4324', ':4321') + '/api/voice-agent',
  // ... other config
});
```

### Option 2: Use Relative URL with Base
Ensure the API endpoint always uses the main application's origin:

```javascript
// Create a helper function
const getApiEndpoint = () => {
  // Always use port 4321 for API calls
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:4321/api/voice-agent`;
};

// Use in configuration
const agent = createWebRTCVoiceAgent({
  apiEndpoint: getApiEndpoint(),
  // ... other config
});
```

### Option 3: Environment Variable
Set the API endpoint via environment variable:

```env
PUBLIC_VOICE_API_ENDPOINT=http://localhost:4321/api/voice-agent
```

## Immediate Fix

Since the server is already restarted with the API key, the quickest fix is to update the hook to force the correct port: