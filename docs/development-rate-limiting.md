# Development Rate Limiting Guide

## Overview

The rate limiter has been enhanced for a better development experience. It now automatically detects development mode and applies more lenient settings.

## Development Mode Features

### Automatic Detection
The rate limiter automatically detects development mode using:
- `import.meta.env.DEV === true`
- `NODE_ENV === 'development'`
- `process.env.NODE_ENV === 'development'`

### Development-Friendly Settings
When in development mode:
- **Rate limit**: 100 requests/minute (vs 10 in production)
- **Whitelist**: Localhost IPs are automatically whitelisted
- **Suspicious threshold**: 95% (vs 80% in production)
- **Logging**: More informative, less alarming messages
- **Block duration**: 1 minute (vs 15 minutes in production)

### Whitelisted IPs in Development
The following IPs are automatically whitelisted in development:
- `localhost`
- `127.0.0.1`
- `::1` (IPv6 localhost)
- `0.0.0.0`
- `unknown` (for cases where IP detection fails)

## Clearing Rate Limits

### Method 1: Development API Endpoint

**Get Status:**
```bash
curl http://localhost:4321/api/dev/clear-rate-limits
```

**Clear All Rate Limits:**
```bash
curl -X POST http://localhost:4321/api/dev/clear-rate-limits \
  -H "Content-Type: application/json" \
  -d '{"action": "clear_all"}'
```

**Clear Rate Limit for Specific IP:**
```bash
curl -X POST http://localhost:4321/api/dev/clear-rate-limits \
  -H "Content-Type: application/json" \
  -d '{"action": "clear_ip", "target": "127.0.0.1"}'
```

**Remove IP from Suspicious List:**
```bash
curl -X POST http://localhost:4321/api/dev/clear-rate-limits \
  -H "Content-Type: application/json" \
  -d '{"action": "clear_suspicious", "target": "127.0.0.1"}'
```

**Get Current Statistics:**
```bash
curl -X POST http://localhost:4321/api/dev/clear-rate-limits \
  -H "Content-Type: application/json" \
  -d '{"action": "status"}'
```

### Method 2: Convenience Script

Use the provided Node.js script for easier management:

```bash
# Clear all rate limits
node scripts/clear-rate-limits.js

# Clear rate limit for specific IP
node scripts/clear-rate-limits.js clear-ip 127.0.0.1

# Remove IP from suspicious list
node scripts/clear-rate-limits.js clear-suspicious 127.0.0.1

# Get status
node scripts/clear-rate-limits.js status
```

## Environment Variables

Update your `.env.local` for development:

```env
# Development-friendly rate limiting
VOICE_AGENT_RATE_LIMIT=100
NODE_ENV=development
```

## Rate Limiting Behavior

### Production Mode
- **Rate limit**: 10 requests/minute
- **Suspicious threshold**: 80%
- **Block duration**: 15 minutes
- **No whitelist**
- **Strict logging**

### Development Mode
- **Rate limit**: 100 requests/minute (configurable via `VOICE_AGENT_RATE_LIMIT`)
- **Suspicious threshold**: 95%
- **Block duration**: 1 minute
- **Localhost whitelist**: Automatic
- **Informative logging**

## Troubleshooting

### "Suspicious activity detected"
In development, this threshold is much higher (95% vs 80%). If you still see this:
1. Use the clear-rate-limits script
2. Check if you're hitting the API too frequently
3. Consider increasing `VOICE_AGENT_RATE_LIMIT` in `.env.local`

### Rate limit still too strict
1. Increase `VOICE_AGENT_RATE_LIMIT` in `.env.local`
2. Restart your development server
3. Clear existing rate limits using the script

### Clear rate limits script not working
1. Ensure your dev server is running on `http://localhost:4321`
2. If using a different port, set `DEV_SERVER_URL`:
   ```bash
   DEV_SERVER_URL=http://localhost:4322 node scripts/clear-rate-limits.js
   ```

## Security Notes

- The development endpoint (`/api/dev/clear-rate-limits`) is **only available in development mode**
- It returns a 403 error in production
- The whitelist feature is only active in development
- All development features are automatically disabled in production

## API Response Examples

### Successful Clear All
```json
{
  "success": true,
  "message": "All rate limits cleared",
  "action": "clear_all"
}
```

### Rate Limiter Status
```json
{
  "success": true,
  "message": "Rate limiter status retrieved",
  "action": "status",
  "stats": {
    "totalEntries": 0,
    "suspiciousIPs": 0
  }
}
```

### Development Warning (when whitelisted)
```json
{
  "success": true,
  "token": "...",
  "expiresAt": 1234567890,
  "sessionId": "...",
  "mode": "realtime",
  "warnings": ["Development mode - rate limiting bypassed"]
}
```