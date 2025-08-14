# WebRTC Session Persistence Documentation

## Overview

The WebRTC Voice Agent now supports complete session persistence, allowing conversation continuity across page navigation and browser reloads. This document describes the implementation and usage.

## Key Features

### 1. Session Restoration
- **Automatic Detection**: On initialization, the system checks for existing sessions
- **Token Management**: Automatic token refresh for expired sessions
- **Conversation History**: Complete message history restoration
- **Connection Recovery**: Automatic reconnection for restored sessions

### 2. Token Persistence
- **Tab-Specific Storage**: Uses sessionStorage for tab-specific token storage
- **Automatic Refresh**: Proactive token refresh before expiration
- **Secure Handling**: Tokens cleared on tab close for security

### 3. Message Persistence
- **Encrypted Storage**: Messages stored in IndexedDB with AES encryption
- **Real-time Sync**: Messages automatically saved during conversation
- **Context Restoration**: Conversation context rebuilt from stored messages

### 4. State Management
- **Connection States**: Tracked and restored (connected, connecting, disconnected)
- **Conversation States**: Tracked and restored (idle, listening, speaking, processing)
- **Session Statistics**: Duration, message count, reconnection attempts

## Architecture

### Core Components

#### 1. EnhancedSessionManager
- **Location**: `src/lib/voice-agent/enhanced-session-manager.ts`
- **Purpose**: Manages complete session lifecycle with persistence
- **Features**:
  - Session creation and restoration
  - Token management with refresh
  - Message and state persistence
  - Tab-specific session tracking

#### 2. WebRTCVoiceAgent (Updated)
- **Location**: `src/lib/voice-agent/webrtc/main.ts`
- **Changes**:
  - Integrated EnhancedSessionManager
  - Restoration-aware initialization
  - Enhanced message handling with persistence
  - Session event emissions

#### 3. React Hook (Updated)
- **Location**: `src/components/voice-agent/hooks/useWebRTCVoiceAssistant.ts`
- **Changes**:
  - Session restoration state tracking
  - Enhanced event handling
  - Statistics integration

#### 4. UI Component (Updated)
- **Location**: `src/components/voice-agent/WebRTCVoiceAssistant.tsx`
- **Changes**:
  - Session restoration indicators
  - Enhanced connection status display
  - Navigation-aware cleanup

## Usage

### Basic Implementation

The session persistence is enabled automatically. No additional configuration is required:

```typescript
// The existing WebRTC Voice Agent automatically includes persistence
const config: VoiceAssistantConfig = {
  apiEndpoint: '/api/voice-agent',
  // ... other config
};

const {
  isSessionRestored, // New: indicates if session was restored
  sessionStats,     // New: session statistics
  // ... existing properties
} = useWebRTCVoiceAssistant(config);
```

### Session Events

The system emits additional events for session management:

```typescript
agent.on('sessionRestored', (sessionData) => {
  console.log('Session restored:', sessionData.sessionId);
  console.log('Messages restored:', sessionData.messages.length);
});

agent.on('sessionExpired', () => {
  console.log('Session expired, please refresh');
});

agent.on('reconnecting', () => {
  console.log('Reconnecting to restore session...');
});

agent.on('reconnected', () => {
  console.log('Successfully reconnected');
});
```

### Session Statistics

Access detailed session information:

```typescript
const stats = agent.getSessionStats();
console.log({
  isActive: stats.isActive,
  sessionId: stats.sessionId,
  messageCount: stats.messageCount,
  duration: stats.duration,
  reconnectAttempts: stats.reconnectAttempts,
  tokenExpiresIn: stats.tokenExpiresIn
});
```

## Behavior

### Page Navigation
1. **Same Tab Navigation**: Session preserved automatically
2. **Page Reload**: Attempts to restore previous session
3. **New Tab**: Starts fresh session
4. **Tab Close**: Ends session but preserves data for restoration

### Session Restoration Flow
1. Check for existing session token in sessionStorage
2. Validate token expiration
3. Refresh token if needed (using callback)
4. Load session data from IndexedDB
5. Restore conversation context and messages
6. Reconnect to WebRTC service
7. Emit restored messages to UI

### Error Handling
- **Token Expired**: Automatic refresh if callback available
- **Restoration Failed**: Falls back to new session creation
- **Network Issues**: Reconnection attempts with backoff
- **Storage Errors**: Graceful degradation without persistence

## Configuration

### Token Refresh Callback

Set up automatic token refresh:

```typescript
sessionManager.setTokenRefreshCallback(async () => {
  const response = await fetch('/api/voice-agent/token', {
    method: 'POST'
  });
  const data = await response.json();
  return {
    token: data.token,
    expiresAt: data.expiresAt,
    sessionId: data.session_id
  };
});
```

### Session Event Callbacks

Handle session lifecycle events:

```typescript
sessionManager.setEventCallbacks({
  onSessionRestored: (sessionData) => {
    // Update UI to show restored state
    showNotification('Previous conversation restored');
  },
  onSessionExpired: () => {
    // Handle expired session
    showError('Session expired, please refresh');
  }
});
```

## Security Considerations

1. **Token Storage**: Tokens stored in sessionStorage (cleared on tab close)
2. **Message Encryption**: Messages encrypted using AES-256-GCM
3. **Key Management**: Encryption keys generated per session
4. **Automatic Cleanup**: Old sessions cleaned up after 7 days
5. **Tab Isolation**: Sessions are tab-specific for security

## Performance

1. **Debounced Saves**: Messages saved with 2-second debounce
2. **Automatic Cleanup**: Old sessions removed to prevent storage bloat
3. **Efficient Queries**: IndexedDB indexes for fast session lookup
4. **Memory Management**: Conversation context limited to last 10 messages

## Testing

Run the session persistence tests:

```bash
npm run test src/tests/session-persistence.test.ts
```

Tests cover:
- Session creation and restoration
- Token expiration handling
- State management
- Message persistence
- Error scenarios
- Cleanup operations

## Troubleshooting

### Common Issues

1. **Session Not Restored**
   - Check browser storage permissions
   - Verify token refresh callback is set
   - Check console for restoration errors

2. **Messages Not Persisting**
   - Verify IndexedDB support
   - Check encryption/decryption errors
   - Ensure session is properly created

3. **Connection Issues After Restoration**
   - Check token validity
   - Verify API endpoint accessibility
   - Review reconnection attempts

### Debug Information

Enable debug logging:

```typescript
// Session statistics
console.log('Session stats:', agent.getSessionStats());

// Session manager state
console.log('Current session:', sessionManager.getCurrentSession());

// Check if reconnection needed
console.log('Needs reconnection:', agent.needsReconnection());
```

## Migration Guide

### From Previous Version

The session persistence is backward compatible. Existing implementations will automatically gain persistence capabilities without code changes.

### New Implementations

For new implementations, the session persistence is enabled by default. Simply use the existing WebRTC Voice Agent API.

## Future Enhancements

1. **Cross-Tab Sync**: Sync sessions across multiple tabs
2. **Cloud Backup**: Optional cloud-based session backup
3. **Advanced Analytics**: Detailed session analytics and insights
4. **Custom Storage**: Pluggable storage backends
5. **Session Sharing**: Share sessions between users (with permissions)