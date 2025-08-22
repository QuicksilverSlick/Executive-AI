# Port Configuration Fix for 403 Errors

## Problem
- Client was trying to connect to port 4322 but server was on port 4321
- CORS configuration only allowed port 4321
- Getting 403 Forbidden errors due to origin mismatch

## Solution Applied

### 1. Updated Environment Configuration
- **File**: `.env.local`
- **Change**: Added `http://localhost:4322` to `ALLOWED_ORIGINS`
- **New value**: `http://localhost:4321,http://localhost:4322,https://executiveaitraining.com`

### 2. Updated API Endpoints CORS Configuration
Updated all voice agent API endpoints to include port 4322 in fallback origins:

- `src/pages/api/voice-agent/token.ts`
- `src/pages/api/voice-agent/refresh-token.ts`
- `src/pages/api/voice-agent/health.ts`
- `src/pages/api/voice-agent/chat-fallback.ts`

### 3. Updated Security Configuration
- **File**: `src/api/config/security.ts`
- **Change**: Added `http://localhost:4322` to development allowed origins

### 4. Added Debug Tools
- **File**: `scripts/debug-ports.js` - Tests both ports and shows configuration
- **Usage**: `node scripts/debug-ports.js`

## How the Fix Works

1. **Dynamic Port Detection**: The client uses `window.location.origin` to automatically detect the correct port
2. **Dual Port Support**: Server now accepts requests from both 4321 and 4322
3. **Environment Override**: `.env.local` can be customized for specific port requirements

## Testing the Fix

```bash
# Test the configuration
node scripts/debug-ports.js

# Test the token endpoint specifically
npm run test-token

# Start development and check what port is actually used
npm run dev
```

## Root Cause Analysis

The issue occurred because:
1. Different development setups might use different ports (4321 vs 4322)
2. CORS validation was too strict, only allowing the default port
3. No fallback handling for port variations in development

## Prevention

- The client now dynamically detects the port using `window.location.origin`
- Server accepts multiple localhost ports in development
- Environment variables can override defaults for specific setups

## Quick Verification

After applying these fixes:
1. Both `http://localhost:4321` and `http://localhost:4322` origins are allowed
2. CORS preflight requests will succeed from either port
3. Token requests will work regardless of which port the client is running on