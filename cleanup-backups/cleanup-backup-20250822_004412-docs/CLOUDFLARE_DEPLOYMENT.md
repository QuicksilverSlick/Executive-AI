# Cloudflare Pages Deployment Guide for Executive AI Training with WebRTC Voice Agent

## Overview
This guide covers deploying the Executive AI Training application with OpenAI Realtime API WebRTC voice agent to Cloudflare Pages.

## Prerequisites
1. OpenAI API account with Realtime API access (Tier 3 or higher)
2. Cloudflare account
3. Domain configured in Cloudflare (optional)

## Environment Variables Setup

### Required Variables
Add these in Cloudflare Pages dashboard under Settings > Environment Variables:

```bash
# OpenAI Configuration (MUST be added as encrypted/secret)
OPENAI_API_KEY=sk-...

# Optional: Custom allowed origins (comma-separated)
ALLOWED_ORIGINS=https://yourdomain.com,https://staging.yourdomain.com

# Optional: Voice agent settings
VOICE_AGENT_TOKEN_DURATION=1800  # 30 minutes
VOICE_AGENT_RATE_LIMIT=10        # requests per minute
VOICE_AGENT_DEMO_MODE=false      # set to true for testing without API
```

## Build Configuration

### Build Settings in Cloudflare Pages
- **Framework preset**: Astro
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`
- **Node version**: 18 or higher

### wrangler.toml Configuration
Already configured in the project:
```toml
name = "executive-ai-training"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

[site]
bucket = "./dist"

[build]
command = "npm run build"

[build.upload]
format = "service-worker"
```

## Deployment Steps

### 1. Initial Setup
```bash
# Install dependencies
npm install

# Test build locally
npm run build

# Preview with Wrangler
npx wrangler pages dev dist
```

### 2. Deploy to Cloudflare Pages

#### Option A: Via Cloudflare Dashboard
1. Go to Cloudflare Pages dashboard
2. Create new project or select existing
3. Connect GitHub repository
4. Configure build settings (see above)
5. Add environment variables as secrets
6. Deploy

#### Option B: Via Wrangler CLI
```bash
# Login to Cloudflare
npx wrangler login

# Deploy to Pages
npx wrangler pages deploy dist --project-name=executive-ai-training

# Deploy to specific environment
npx wrangler pages deploy dist --project-name=executive-ai-training --branch=production
```

### 3. Post-Deployment Verification

#### Check API Health
```bash
# Replace with your deployment URL
curl https://your-project.pages.dev/api/health
```

#### Test Voice Agent Token Generation
```bash
curl -X POST https://your-project.pages.dev/api/voice-agent/token \
  -H "Content-Type: application/json" \
  -H "Origin: https://your-project.pages.dev"
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Blank Page After Deployment
**Solution**: Already fixed - site URL is configured in astro.config.mjs

#### 2. Token Endpoint 500 Error
**Possible Causes**:
- Missing OPENAI_API_KEY environment variable
- API key not added as encrypted secret
- Incorrect API key format

**Debug Steps**:
1. Check Cloudflare Pages Functions logs
2. Verify environment variables are set
3. Test with debug endpoint: `/api/voice-agent/debug-env`

#### 3. WebRTC Connection Failures
**Possible Causes**:
- OpenAI account doesn't have Realtime API access
- Browser doesn't support WebRTC
- CORS issues

**Solutions**:
- Verify OpenAI tier supports Realtime API
- Test in Chrome/Edge (best WebRTC support)
- Check browser console for specific errors

#### 4. PerformanceMonitor Errors
**Solution**: Already fixed - added error handling and fallbacks

#### 5. Missing Script Files (404)
**Solution**: Already fixed - moved scripts to public directory

### Voice Agent Modes

The application supports three modes based on your OpenAI API tier:

1. **Realtime Mode** (Tier 3+)
   - Full WebRTC support
   - Low latency voice interactions
   - Best user experience

2. **Fallback Mode** (Standard tier)
   - Uses Chat API + TTS
   - Higher latency but functional
   - Automatic detection and switching

3. **Demo Mode** (No API)
   - For testing UI without API calls
   - Set `VOICE_AGENT_DEMO_MODE=true`

### Security Best Practices

1. **API Key Security**
   - Always add OPENAI_API_KEY as encrypted secret
   - Never commit API keys to repository
   - Use ephemeral tokens for client connections

2. **CORS Configuration**
   - Default allows Cloudflare Pages domains
   - Add specific domains via ALLOWED_ORIGINS
   - Blocks non-HTTPS origins in production

3. **Rate Limiting**
   - Default: 10 requests/minute per IP
   - Adjust via VOICE_AGENT_RATE_LIMIT
   - Prevents abuse and controls costs

## Monitoring

### Cloudflare Analytics
- Monitor in Pages dashboard
- Check Functions logs for errors
- Review Web Analytics for usage

### Application Logs
Key log prefixes to search for:
- `[WebRTC Connection]` - Connection issues
- `[Token]` - Authentication problems
- `[VoiceInit]` - Initialization errors
- `[Relay]` - Relay server issues

## Performance Optimization

### Already Implemented
- MessageChannel polyfill for Workers
- Lazy loading of web-vitals
- Error boundaries and fallbacks
- Automatic reconnection logic
- Exponential backoff for retries

### Recommended Settings
- Enable Cloudflare caching
- Use Cloudflare CDN
- Enable Auto Minify in Cloudflare
- Use Cloudflare Web Analytics

## Support Resources

### OpenAI Realtime API
- [Documentation](https://platform.openai.com/docs/guides/realtime)
- [WebRTC Guide](https://platform.openai.com/docs/guides/realtime-webrtc)
- Check tier requirements

### Cloudflare Pages
- [Documentation](https://developers.cloudflare.com/pages/)
- [Functions docs](https://developers.cloudflare.com/pages/platform/functions/)
- [Debugging guide](https://developers.cloudflare.com/pages/platform/debugging/)

## Testing Checklist

Before going live, verify:
- [ ] Environment variables set in Cloudflare
- [ ] API health endpoint returns 200
- [ ] Token generation works
- [ ] Voice agent loads without errors
- [ ] WebRTC connection establishes (if Tier 3+)
- [ ] Fallback mode works (if Standard tier)
- [ ] No console errors in production
- [ ] Performance metrics tracking
- [ ] Rate limiting active

## Current Deployment Status
- **URL**: https://91c1a4d4.executive-ai.pages.dev/
- **Branch**: main
- **Last Updated**: January 2025

## Next Steps
1. Verify OPENAI_API_KEY is set in Cloudflare dashboard
2. Test voice agent on deployed URL
3. Monitor logs for any remaining issues
4. Configure custom domain if desired