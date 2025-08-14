# Voice Agent Session Timeout Handling

## Overview
OpenAI's Realtime API has a **30-minute maximum session duration**. After 30 minutes, the session automatically terminates with an error. This document describes how the voice agent handles this limitation gracefully.

## The Problem
Without proper handling, users would experience:
- Abrupt disconnection after 30 minutes
- Loss of conversation context
- Confusing error messages
- Need to manually restart the conversation

## The Solution
We've implemented a `SessionTimeoutHandler` that:
1. **Tracks session duration** from the moment it's created
2. **Warns users** before timeout (at 25, 28, and 29 minutes)
3. **Proactively reconnects** before the 30-minute limit
4. **Preserves conversation** across reconnections
5. **Handles timeout errors** gracefully if they occur

## Implementation Details

### Session Timeout Handler
**File**: `src/lib/voice-agent/webrtc/session-timeout-handler.ts`

Key features:
- Starts tracking when session.created event is received
- Emits warning events at configurable intervals
- Triggers proactive reconnection 30 seconds before timeout
- Handles timeout errors from the API

### Integration Points

#### 1. Session Creation
```typescript
case 'session.created':
  this.isSessionCreated = true;
  // Start session timeout tracking
  this.timeoutHandler.startSession();
  console.log('[WebRTC Voice Agent] Session timeout tracking started (30-minute limit)');
```

#### 2. Warning Messages
Users receive friendly warnings:
- **5 minutes before**: "Our session will need to refresh in about 5 minutes. Don't worry, I'll handle it seamlessly."
- **2 minutes before**: "Our session will need to refresh in about 2 minutes..."
- **1 minute before**: "Just a heads up - our session will need to reconnect in about a minute to continue our conversation."

#### 3. Proactive Reconnection
At 29.5 minutes, the system:
1. Saves the current session state
2. Informs the user: "I'm refreshing our connection to continue our conversation. This will just take a moment..."
3. Disconnects the current connection
4. Gets a new authentication token
5. Reconnects with conversation history preserved
6. Confirms: "Perfect! I'm ready to continue our conversation. How can I help you?"

#### 4. Error Recovery
If a timeout error occurs despite proactive measures:
```typescript
if (this.timeoutHandler.handleTimeoutError(event.error)) {
  // Let the timeout handler manage reconnection
  return;
}
```

## User Experience

### Timeline Example
```
0:00 - Session starts
25:00 - Warning: "Session will refresh in 5 minutes"
28:00 - Warning: "Session will refresh in 2 minutes"
29:00 - Warning: "Session will reconnect in 1 minute"
29:30 - Automatic reconnection begins
29:35 - New session established, conversation continues
```

### What Users See
1. **Smooth conversation** for the first 25 minutes
2. **Advance warnings** about upcoming refresh
3. **Brief reconnection** (5-10 seconds)
4. **Seamless continuation** of the conversation

### What Users DON'T See
- Error messages about session timeout
- Loss of conversation context
- Need to manually reconnect
- Interruption of their workflow

## Configuration

### Timing Configuration
```typescript
private readonly MAX_SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
private readonly WARNING_THRESHOLD = 5 * 60 * 1000; // Warn 5 minutes before
private readonly RECONNECT_BUFFER = 30 * 1000; // Reconnect 30 seconds before
```

### Session Statistics
The handler provides real-time statistics:
```typescript
const stats = this.timeoutHandler.getSessionStats();
// Returns:
// {
//   duration: 1500000,        // 25 minutes in ms
//   remaining: 300000,         // 5 minutes remaining
//   remainingFormatted: "5:00",
//   isNearTimeout: true,
//   percentUsed: 83.33
// }
```

## Testing

### Manual Testing
1. Start a voice conversation
2. Keep it active for 30+ minutes
3. Observe:
   - Warning messages appear at correct times
   - Proactive reconnection occurs before timeout
   - Conversation continues seamlessly

### Simulated Testing
```javascript
// Force a timeout for testing
this.timeoutHandler.emit('timeout');

// Simulate timeout error
const timeoutError = {
  message: 'Your session hit the maximum duration of 30 minutes.'
};
this.timeoutHandler.handleTimeoutError(timeoutError);
```

## Monitoring

### Logs to Watch
```
[SessionTimeout] Session tracking started
[SessionTimeout] Warning: Session will expire in 5 minutes
[SessionTimeout] Proactively reconnecting before 30-minute timeout
[WebRTC Voice Agent] Session timeout detected, handler will manage reconnection
[SessionTimeout] Resetting session timer after reconnection
```

### Metrics to Track
- Average session duration before timeout
- Number of proactive reconnections
- Success rate of reconnections
- User experience during reconnection

## Edge Cases Handled

1. **User speaks during reconnection**
   - Audio is buffered and processed after reconnection

2. **Network issues during reconnection**
   - Falls back to standard error recovery

3. **Multiple timeout warnings**
   - Prevents duplicate warnings

4. **Session ends before timeout**
   - Timeout handler is properly cleaned up

## Future Improvements

1. **Configurable warning intervals**
   - Allow customization of when warnings appear

2. **Session extension**
   - Investigate if sessions can be extended before timeout

3. **Conversation summarization**
   - Provide a summary before long sessions timeout

4. **Metrics dashboard**
   - Track timeout patterns and user behavior

## Related Files
- `src/lib/voice-agent/webrtc/session-timeout-handler.ts` - Timeout handler implementation
- `src/lib/voice-agent/webrtc/main.ts` - Integration with main voice agent
- `src/lib/voice-agent/enhanced-session-manager.ts` - Session persistence

## Summary
The session timeout handler ensures users have a smooth experience even with OpenAI's 30-minute session limit. Through proactive warnings, automatic reconnection, and conversation preservation, users can have extended conversations without disruption.