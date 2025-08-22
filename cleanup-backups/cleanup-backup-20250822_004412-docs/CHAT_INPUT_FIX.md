# Chat Input Fix Guide

## Quick Solution

### 1. Environment Setup (REQUIRED)
Make sure you have the OpenAI API key in your `.env` file:

```bash
# Create .env file if it doesn't exist
cp .env.example .env

# Add your OpenAI API key
OPENAI_API_KEY=sk-...your-actual-key-here
```

**Important**: It must be `OPENAI_API_KEY`, not `VITE_OPENAI_API_KEY` or anything else.

### 2. Test the Chat Input

1. **Start the dev server**: `npm run dev`
2. **Navigate to test page**: http://localhost:4321/test-voice-chat
3. **Click "Check Connection"** to verify API setup
4. **Open the voice assistant** (bottom-right microphone button)
5. **Wait for "Connected" status** (green dot)
6. **Type a message and press Enter**

### 3. If Chat Input Still Doesn't Work

**Option A: Force Connected Mode**
```javascript
// In browser console:
window.DEBUG_VOICE_AGENT_FORCE_CONNECTED = true;
// Then reload the page
```

**Option B: Check Console Logs**
Look for these messages in browser console:
- `[Text Input] Send attempt:` - Shows when you try to send
- `[Text Input] Sending message:` - Shows the actual message
- `[WebRTC Voice Agent] Emitting userTranscript` - Confirms message was processed

### 4. Common Issues & Solutions

**Issue: "Not connected" error**
- Solution: Check your API key is valid
- Test: http://localhost:4321/api/voice-agent/test-connection

**Issue: Message doesn't appear after sending**
- Solution: The WebRTC agent now emits `userTranscript` events for text messages
- Check: Look for `Emitting userTranscript for text message` in console

**Issue: Input clears but nothing happens**
- Solution: Check if `sendMessage` function is available
- Debug: Console will show `sendMessage: function` or `undefined`

### 5. What We Fixed

1. **Added user transcript emission** in `sendMessage` method:
   ```typescript
   // In src/lib/voice-agent/webrtc/main.ts
   this.emit('userTranscript', { 
     text: text, 
     isFinal: true 
   });
   ```

2. **Enhanced error handling** in chat input:
   - Better connection state checking
   - Debug mode support
   - Comprehensive logging

3. **Improved event handlers** for OpenAI Realtime API:
   - `conversation.item.input_audio_transcription.completed`
   - `conversation.item.input_audio_transcription.delta`
   - `conversation.item.input_audio_transcription.failed`

### 6. Testing Without Realtime API

If you don't have access to OpenAI Realtime API (tier limitation), the system will automatically fall back to:
- Chat Completions API for responses
- Text display only (no voice)

You'll see: "Realtime API not available on current tier - using Chat API with TTS"

### 7. Still Having Issues?

1. **Clear everything and restart**:
   ```bash
   # Stop the dev server (Ctrl+C)
   rm -rf .astro node_modules/.astro
   npm run dev
   ```

2. **Check the test endpoint**:
   - Navigate to: http://localhost:4321/api/voice-agent/test-connection
   - Should show `"OPENAI_API_KEY": true`

3. **Enable verbose logging**:
   ```javascript
   // In browser console before testing:
   localStorage.setItem('debug', 'voice-agent:*');
   ```

The chat input should now work properly. Type a message, press Enter, and it will appear in the transcript!