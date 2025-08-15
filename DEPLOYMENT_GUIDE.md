# Executive AI Training - Cloudflare Pages Deployment Guide

## Current Status ✅
- **Repository**: https://github.com/QuicksilverSlick/Executive-AI
- **Latest Commit**: a1cb8ed - CSS fixes for Cloudflare Pages
- **Build Status**: Polyfills and configurations applied
- **Domain**: executiveaitraining.com (configured in Cloudflare)
- **Adapter**: Cloudflare Pages with Worker Functions
- **Status**: ✅ MessageChannel polyfill applied, CSS configuration fixed

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

*Last Updated: December 2024*
*Deployment Guide Version: 2.0 - Cloudflare Pages Edition*