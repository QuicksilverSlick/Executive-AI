# Voice Agent Debug Guide

## Current Issues & Solutions

### 1. Text Input Not Working

**Problem**: Users can type messages but they don't appear in the chat transcript.

**Root Cause**: The text messages are being sent to the WebRTC agent, but the user transcript event is not being emitted immediately for text messages (only for audio transcripts).

**Solution Applied**: 
- Modified `sendMessage` in `/src/lib/voice-agent/webrtc/main.ts` to emit `userTranscript` event immediately for text messages
- Added comprehensive logging throughout the message flow

### 2. Connection Issues

**Possible Causes**:
1. **Missing API Key**: Check if `OPENAI_API_KEY` environment variable is set
2. **API Tier**: Your OpenAI account may not have access to the Realtime API
3. **CORS**: Origin validation may be blocking requests

**Debug Steps**:

1. **Check Environment Variables**:
   ```bash
   # In your .env file, ensure you have:
   OPENAI_API_KEY=sk-...your-key-here
   
   # NOT VITE_OPENAI_API_KEY or PUBLIC_OPENAI_API_KEY
   ```

2. **Test Connection**:
   Open browser and navigate to: `http://localhost:4321/api/voice-agent/test-connection`
   
   This will show:
   - Environment variable status
   - Token generation test
   - CORS configuration

3. **Check Browser Console**:
   Look for these debug messages:
   ```
   [WebRTC Connection Debug]
   [Text Input] Send attempt:
   [WebRTC Voice Agent] Sending message:
   ```

### 3. Testing the Fixes

**Manual Testing**:
1. Open the voice assistant by clicking the microphone button
2. Wait for "Connected" status (green dot)
3. Type a message and press Enter
4. You should see your message appear immediately in the transcript
5. The AI should respond

**Debug Mode**:
If still having issues, enable force-connected mode in browser console:
```javascript
window.DEBUG_VOICE_AGENT_FORCE_CONNECTED = true;
```

Then reload the page and try again.

### 4. Common Error Messages & Solutions

**"Connecting..." stuck**:
- API key is missing or invalid
- Realtime API not available on your OpenAI tier
- Network/firewall blocking WebSocket connections

**"Failed to send message"**:
- Connection not established
- Check browser console for detailed error

**No transcript appearing**:
- Check if `userTranscript` events are being emitted
- Look for `[WebRTC Voice Agent] Emitting userTranscript` in console

### 5. API Tier Fallback

If you don't have access to OpenAI Realtime API, the system will automatically fall back to:
- Chat Completions API for text
- Text-to-Speech API for audio
- Speech-to-Text API for transcription

You'll see a warning: "Realtime API not available on current tier - using Chat API with TTS"

### 6. Quick Fixes

**Force Refresh Connection**:
```javascript
// In browser console
location.reload();
```

**Clear Session Storage**:
```javascript
sessionStorage.clear();
localStorage.clear();
```

**Check API Status**:
```bash
curl -X POST https://api.openai.com/v1/realtime/sessions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-realtime-preview-2024-12-17",
    "modalities": ["audio", "text"]
  }'
```

### 7. Environment Setup Checklist

- [ ] `.env` file exists in project root
- [ ] `OPENAI_API_KEY=sk-...` is set (not VITE_ prefixed)
- [ ] API key has proper permissions
- [ ] Running on `http://localhost:4321` (default)
- [ ] No ad blockers or privacy extensions blocking WebSockets
- [ ] Browser supports WebRTC (Chrome, Firefox, Edge recommended)

### 8. Still Not Working?

1. Check the test endpoint: http://localhost:4321/api/voice-agent/test-connection
2. Look for any red error messages
3. Ensure `environment.OPENAI_API_KEY` shows `true`
4. Check `tokenEndpoint.success` is `true`

If the token endpoint fails, you'll need to:
- Verify your OpenAI API key
- Check your OpenAI account tier
- Ensure you have API credits available