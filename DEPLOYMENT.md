# Deployment Guide

## Overview

The Executive AI Training Platform is built with Astro and uses the Node.js adapter for server-side rendering. It features a voice agent with WebRTC support and intelligent web search capabilities.

## Technology Stack

- **Framework**: Astro with Node.js adapter
- **Frontend**: TypeScript, React, Tailwind CSS
- **Voice Technology**: OpenAI Realtime API, WebRTC
- **Search**: Integrated web search with OpenAI API
- **Testing**: Vitest (unit), Playwright (E2E)

## Production Architecture

### Current Configuration
- **Main App**: Astro Node.js server (standalone mode)
- **Voice Agent**: OpenAI Realtime API with WebRTC
- **Search**: Environment-aware endpoint selection
- **Status**: ✅ Production-ready with comprehensive testing

### Key Components
1. **Voice Agent API** (`/api/voice-agent/token`): Ephemeral token generation
2. **Health Monitoring** (`/api/voice-agent/health`): System health checks  
3. **Search Integration**: Intelligent web search during voice conversations
4. **Rate Limiting**: Configurable protection against abuse
5. **CORS Protection**: Origin validation and security headers

## Environment Configuration

### Required Environment Variables

Create `.env.local` (development) or set production environment variables:

```bash
# OpenAI Configuration (Required)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Voice Agent Configuration
ALLOWED_ORIGINS=http://localhost:4321,https://executiveaitraining.com
VOICE_AGENT_RATE_LIMIT=10
VOICE_AGENT_TOKEN_DURATION=60

# Site Configuration
PUBLIC_SITE_URL=https://executiveaitraining.com
PUBLIC_SITE_NAME="Executive AI Training"

# Optional: Custom Search Endpoint
PUBLIC_SEARCH_API_URL=https://your-search-api.com/search
```

### Environment Variable Details

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key (required) | - |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed origins | localhost + production |
| `VOICE_AGENT_RATE_LIMIT` | Requests per minute per IP | 10 |
| `VOICE_AGENT_TOKEN_DURATION` | Token lifespan in seconds | 60 |
| `VOICE_AGENT_DEMO_MODE` | Enable demo mode (no API calls) | false |
| `PUBLIC_SEARCH_API_URL` | Custom search endpoint | Built-in API route |

## Deployment Options

### Option 1: Node.js Server (Recommended)

The project is configured with the Astro Node adapter for server-side rendering.

```bash
# Build the project
npm run build:prod

# Start production server
node ./dist/server/entry.mjs
```

**Compatible Platforms:**
- Railway
- Render
- DigitalOcean App Platform
- AWS EC2/ECS
- Google Cloud Run
- Any Node.js hosting provider

### Option 2: Vercel Deployment

Replace Node adapter with Vercel adapter:

```bash
npm install @astrojs/vercel
```

Update `astro.config.mjs`:
```javascript
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  // ... rest of config
});
```

### Option 3: Netlify Deployment

Replace Node adapter with Netlify adapter:

```bash
npm install @astrojs/netlify
```

Update `astro.config.mjs`:
```javascript
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'server',
  adapter: netlify(),
  // ... rest of config
});
```

## Search Integration

### Environment-Aware Search

The application automatically selects the appropriate search endpoint:

```typescript
// Development: Uses localhost:3001 (if available)
// Production: Uses configured API URL or built-in route
const searchUrl = import.meta.env.DEV 
  ? 'http://localhost:3001/search'
  : import.meta.env.PUBLIC_SEARCH_API_URL || '/api/voice-agent/responses-search';
```

### Search Deployment Options

#### Option A: Built-in API Route (Default)
- Uses `/api/voice-agent/responses-search` endpoint
- No additional configuration needed
- Integrated with main application

#### Option B: External Search Service
- Deploy search functionality as separate microservice
- Better scalability and independent updates
- Set `PUBLIC_SEARCH_API_URL` environment variable

#### Option C: Serverless Functions
Convert search to platform-specific functions:

**Vercel Function** (`api/search.js`):
```javascript
export default async function handler(req, res) {
  const { query } = req.query;
  // Search implementation
  res.json(results);
}
```

**Netlify Function** (`.netlify/functions/search.js`):
```javascript
exports.handler = async (event, context) => {
  const { query } = event.queryStringParameters;
  // Search implementation
  return { statusCode: 200, body: JSON.stringify(results) };
};
```

## Quick Deployment Commands

### Local Production Testing

```bash
# Build production version
npm run build:prod

# Preview production build
npm run preview

# Access at http://localhost:4321
```

### Platform-Specific Deployments

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

#### Render
```bash
# Create render.yaml in project root
services:
  - type: web
    name: executive-ai-training
    env: node
    buildCommand: npm run build:prod
    startCommand: node ./dist/server/entry.mjs
```

#### DigitalOcean App Platform
```yaml
# .do/app.yaml
name: executive-ai-training
services:
- name: web
  source_dir: /
  github:
    repo: your-username/executive-ai-training
    branch: main
  run_command: node ./dist/server/entry.mjs
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: OPENAI_API_KEY
    value: ${OPENAI_API_KEY}
```

## Security Considerations

### HTTPS Requirement
- WebRTC requires HTTPS in production
- Ensure SSL certificates are properly configured
- Most platforms provide automatic HTTPS

### API Key Security
- Never commit API keys to version control
- Use platform-specific environment variable management
- Rotate keys regularly and monitor usage

### CORS Configuration
- Configure `ALLOWED_ORIGINS` for your production domain
- Remove development origins from production
- Use specific origins, avoid wildcards

### Rate Limiting
- Configure `VOICE_AGENT_RATE_LIMIT` based on expected traffic
- Monitor for abuse patterns
- Consider implementing user-based rate limiting

## Post-Deployment Testing

### Essential Tests

1. **Voice Connection Test**
   ```bash
   # Check token generation
   curl -X POST https://your-domain.com/api/voice-agent/token \
     -H "Content-Type: application/json" \
     -H "Origin: https://your-domain.com"
   ```

2. **Health Check**
   ```bash
   curl https://your-domain.com/api/voice-agent/health
   ```

3. **Search Functionality**
   - Access the voice agent
   - Say "Search for latest AI news"
   - Verify search results are returned

4. **WebRTC Connectivity**
   - Click microphone button
   - Check browser console for WebRTC errors
   - Verify audio input/output works

### Performance Testing

```bash
# Run Lighthouse audit
npm run lighthouse

# Check production build size
npm run build:prod
du -sh dist/
```

## Monitoring and Logging

### Application Logs
- Token generation requests and responses
- API errors and fallback events  
- Rate limiting events
- CORS violations

### Recommended Monitoring
- **Performance**: Response times, error rates
- **Usage**: Token generation frequency, search requests
- **Security**: Failed authentication attempts, origin violations
- **Infrastructure**: Memory usage, CPU utilization

### Error Tracking
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- DataDog for comprehensive monitoring

## Troubleshooting

### Voice Agent Not Connecting
1. Verify HTTPS is enabled (required for WebRTC)
2. Check browser console for errors
3. Confirm OpenAI API key is valid and has Realtime API access
4. Test token endpoint manually

### Search Not Working
1. Check search endpoint configuration
2. Verify OpenAI API rate limits
3. Test with different search queries
4. Check CORS headers if using external search

### Performance Issues
1. Enable build optimizations (`npm run build:prod`)
2. Configure CDN for static assets
3. Monitor API response times
4. Consider edge functions for search

### Common Error Messages

| Error | Cause | Solution |
|-------|--------|----------|
| "Service temporarily unavailable" | Missing API key | Set `OPENAI_API_KEY` |
| "Invalid origin" | CORS misconfiguration | Update `ALLOWED_ORIGINS` |
| "Rate limit exceeded" | Too many requests | Adjust `VOICE_AGENT_RATE_LIMIT` |
| "Realtime API access forbidden" | API tier limitation | Upgrade OpenAI account or use fallback mode |

## Rollback Strategy

### Quick Rollback
1. Keep previous deployment available
2. Use platform-specific rollback features
3. Monitor error rates after deployment
4. Have database migration rollback plan if applicable

### Gradual Deployment
1. Use blue-green deployment where possible
2. Implement feature flags for new functionality
3. Monitor key metrics during rollout
4. Automated rollback triggers for critical errors

## Support and Maintenance

### Regular Maintenance Tasks
- Monitor OpenAI API usage and costs
- Update dependencies monthly
- Review error logs weekly
- Test voice functionality after OpenAI API updates

### Scaling Considerations
- Monitor token generation rate
- Consider implementing session pooling
- Add load balancing for high traffic
- Separate search service for independent scaling

---

**Status**: ✅ **Production Ready** - Comprehensive deployment guide with multi-platform support and security best practices.