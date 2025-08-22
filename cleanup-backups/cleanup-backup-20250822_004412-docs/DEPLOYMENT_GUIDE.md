# Executive AI Training - Multi-Platform Deployment Guide (August 2025)

## Current Status & Issues
- **Repository**: https://github.com/QuicksilverSlick/Executive-AI
- **Primary Issue**: Serverless function crashes on Vercel (FUNCTION_INVOCATION_FAILED)
- **Domain**: executiveaitraining.com
- **Voice Agent**: OpenAI Realtime API with WebRTC requirements
- **Status**: Cloudflare deployment issues, Vercel migration attempted with serverless crashes

## Cloudflare Pages Configuration

### Build Settings
Configure these in your Cloudflare Pages dashboard:
- **Framework preset**: None
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave empty)
- **Node version**: 18

### Environment Variables Configuration

#### Required Variables
You must set these in your Cloudflare Pages dashboard:

1. **Navigate to Environment Variables**
   - Go to your Cloudflare Pages project
   - Click Settings → Environment Variables
   - Add variables for both Production and Preview environments

2. **Add These Variables**:

```bash
# REQUIRED - Your OpenAI API key for voice agent
OPENAI_API_KEY=sk-...your-actual-key-here...

# OPTIONAL - Defaults will be used if not set
ALLOWED_ORIGINS=https://executiveaitraining.com,https://www.executiveaitraining.com
VOICE_AGENT_TOKEN_DURATION=1800
VOICE_AGENT_RATE_LIMIT=10
VOICE_AGENT_DEMO_MODE=false
NODE_VERSION=18
```

## Deployment Checklist

### ✅ Completed Tasks
- [x] GitHub repository connected
- [x] API keys removed from git history  
- [x] MessageChannel polyfill implemented
- [x] React SSR configuration fixed
- [x] CSS loading configuration fixed
- [x] Dev/Prod configurations separated
- [x] CSP headers updated for assets
- [x] Build configuration optimized for Cloudflare

### 🔄 Pending Tasks
- [ ] Set OPENAI_API_KEY in Cloudflare Pages dashboard
- [ ] Verify CSS loads correctly after deployment
- [ ] Test voice agent functionality on production
- [ ] Monitor browser console for any runtime errors

## Testing the Deployment

### 1. Verify Static Assets
After deployment completes, check:
- CSS styles are applied correctly
- Fonts load properly (Geist Sans and Geist Mono)
- Images display correctly
- JavaScript bundles load without errors

### 2. Test Voice Agent
1. Navigate to your deployed site at https://executiveaitraining.com
2. Look for the voice agent button (microphone icon in bottom right)
3. Click to start a conversation
4. Verify:
   - Connection establishes successfully
   - Audio input/output works
   - Session management functions properly
   - Timeout warnings appear after ~25 minutes (28 min warning, 30 min end)

### 3. Check Browser Console
Open DevTools (F12) and check for:
- No "MessageChannel is not defined" errors
- No CSP violations
- Successful WebSocket connections
- Proper asset loading from /_assets/ path

### 4. Test Search Functionality
The search API is integrated into the voice agent:
1. Start a voice conversation
2. Say "Search for latest AI news" or similar
3. Verify search results are returned in the voice response

## Troubleshooting

### CSS Not Loading
If CSS still doesn't load after deployment:
1. Check Network tab in DevTools for 404s on CSS files
2. Verify _headers file is being deployed
3. Check if CSS files exist in dist/_assets/ folder
4. Ensure _routes.json excludes /_assets/* from function processing

### Voice Agent Not Working
If voice agent fails:
1. Verify OPENAI_API_KEY is set in Cloudflare dashboard
2. Check browser console for WebSocket errors  
3. Ensure microphone permissions are granted
4. Check if token generation endpoint returns valid response
5. Verify HTTPS is enabled (WebRTC requirement)

### MessageChannel Errors
If MessageChannel errors return:
1. Verify postbuild script ran: `npm run postbuild`
2. Check if polyfill exists in dist/_worker.js/
3. Manually run: `node scripts/inject-polyfill-complete.js`
4. Check build logs for polyfill injection confirmation

### Search Not Working
If search functionality fails:
1. Check browser console for API errors
2. Verify OpenAI API key has access to required models
3. Check rate limits on OpenAI dashboard
4. Monitor Cloudflare Pages Functions logs

## Monitoring

### Build Logs
Monitor build logs in Cloudflare Pages dashboard for:
- Successful polyfill injection messages
- No build errors  
- Assets generated in correct directories

### Runtime Logs
Use Cloudflare Pages Functions logs to monitor:
- API token generation requests
- WebSocket connection attempts
- Any server-side errors

### Performance Monitoring
- Check Core Web Vitals in Cloudflare Analytics
- Monitor function execution times
- Track error rates and types

## Local Development

To run locally after deployment configuration:
```bash
# Use dev configuration (avoids production-specific settings)
npm run dev

# Build for production testing
npm run build
npm run preview
```

## Support Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)
- [Astro + Cloudflare Guide](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime)
- [GitHub Repository](https://github.com/QuicksilverSlick/Executive-AI)

## Next Steps

1. **Immediate**: Set OPENAI_API_KEY in Cloudflare dashboard
2. **After Deployment**: Verify CSS and functionality
3. **Ongoing**: Monitor for any issues and optimize performance

---

## Alternative Deployment Options (August 2025 Best Practices)

### Option 1: Vercel with Fixed Configuration

**Status**: Configuration fixed but requires testing

**Key Changes Made**:
1. Updated `astro.config.mjs` to use `@astrojs/vercel/serverless` adapter
2. Added `includeFiles` for problematic dependencies
3. Created middleware for CORS handling
4. Simplified `vercel.json` configuration

**Deploy Commands**:
```bash
# Install dependencies
npm install

# Build project
npm run build

# Deploy to Vercel
vercel --prod

# Test endpoint
curl https://your-app.vercel.app/api/vercel-test
```

### Option 2: Railway (Recommended for Voice Agents)

**Why Railway?**
- Full Node.js runtime (no serverless limitations)
- WebSocket support for real-time voice
- No function duration limits
- Better for persistent connections

**Configuration**: `railway.json` and `astro.config.node.mjs` created

**Deploy Commands**:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set env vars in Railway dashboard
```

### Option 3: Render

**Benefits**:
- Simple deployment process
- Good documentation
- Supports both static and dynamic content

**Configuration**: `render.yaml` created with web service and static site definitions

### Option 4: LiveKit + Platform Hybrid (Production Recommended)

**Architecture for Voice Agents**:
1. **Frontend**: Deploy to Vercel/Cloudflare for edge performance
2. **Voice Processing**: Use LiveKit (cloud or self-hosted)
3. **API**: Deploy to Railway/Render for WebSocket support

**Why This Approach?**
- LiveKit is specifically designed for WebRTC and real-time communication
- Integrates directly with OpenAI Realtime API
- Handles echo cancellation and audio processing
- Production-ready with enterprise support

## Critical Fixes Applied

### 1. Vercel Adapter Fix
```javascript
// OLD (causing crashes)
import vercel from '@astrojs/vercel';

// NEW (correct for SSR)
import vercel from '@astrojs/vercel/serverless';
```

### 2. Module Bundling Fix
```javascript
adapter: vercel({
  includeFiles: [
    './node_modules/react/**/*',
    './node_modules/react-dom/**/*',
    './node_modules/framer-motion/**/*'
  ]
})
```

### 3. Environment Variables Fix
```javascript
// OLD (import.meta.env - doesn't work in serverless)
const apiKey = import.meta.env.OPENAI_API_KEY;

// NEW (process.env - works in serverless)
const apiKey = process.env.OPENAI_API_KEY;
```

## Deployment Recommendations by Use Case

### For Development/Testing
- **Platform**: Vercel
- **Reason**: Fast iteration, good DX, automatic previews

### For Production Voice Agent
- **Platform**: Railway or LiveKit Hybrid
- **Reason**: WebSocket support, no duration limits, real-time optimized

### For Cost-Conscious Deployment
- **Platform**: Render (with limitations)
- **Reason**: Free tier available, but has cold starts

### For Enterprise
- **Platform**: LiveKit Cloud + Vercel Edge
- **Reason**: Best performance, scalability, and support

## Next Immediate Steps

1. **For Vercel**: 
   - Run `npm install` to update dependencies
   - Commit and push the fixed configuration
   - Monitor function logs for any remaining errors

2. **For Railway** (Recommended):
   - Sign up for Railway account
   - Use `astro.config.node.mjs` configuration
   - Deploy using Railway CLI
   - Set OPENAI_API_KEY in dashboard

3. **For Production**:
   - Evaluate LiveKit for voice agent handling
   - Consider hybrid deployment strategy
   - Implement proper monitoring and logging

*Last Updated: August 2025*
*Deployment Guide Version: 3.0 - Multi-Platform Edition with Voice Agent Focus*