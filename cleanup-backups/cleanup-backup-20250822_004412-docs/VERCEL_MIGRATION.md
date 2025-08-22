# Vercel Migration Guide: Executive AI Training Voice Agent

## 🎯 Overview

This guide provides a complete migration path from Cloudflare Pages to Vercel for the Executive AI Training voice agent application. The migration is optimized for **WebRTC voice capabilities**, **OpenAI Realtime API integration**, and **low-latency voice streaming**.

## 📋 Pre-Migration Checklist

### Prerequisites
- [ ] Vercel account created
- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] Node.js 18+ installed
- [ ] OpenAI API key available
- [ ] Domain DNS access (if using custom domain)

### Environment Preparation
- [ ] Review current Cloudflare environment variables
- [ ] Test voice agent functionality locally
- [ ] Backup current deployment
- [ ] Verify API key permissions

## 🚀 Migration Steps

### Step 1: Install Vercel Dependencies

```bash
# Add Vercel adapter to package.json
npm install @astrojs/vercel --save-dev

# Verify installation
npm list @astrojs/vercel
```

### Step 2: Configure Vercel Settings

The migration includes several key configuration files:

#### A. `vercel.json` - Platform Configuration
- **WebSocket Support**: Configured for OpenAI Realtime API
- **Edge Functions**: Optimized for voice processing with 512MB memory
- **CORS Headers**: Properly configured for voice API endpoints
- **Caching**: Static assets cached, voice APIs uncached
- **Regions**: Multi-region deployment for global low latency

#### B. `astro.config.vercel.mjs` - Astro Configuration
- **Serverless Adapter**: Optimized for Vercel's serverless functions
- **Code Splitting**: Intelligent chunking for voice components
- **ISR (Incremental Static Regeneration)**: Excludes voice APIs from caching
- **Analytics**: Vercel Web Analytics and Speed Insights enabled

#### C. Environment Variables (`.env.vercel.example`)
Critical environment variables for voice functionality:
- `OPENAI_API_KEY`: Your OpenAI API key
- `ALLOWED_ORIGINS`: CORS configuration
- `VOICE_AGENT_RATE_LIMIT`: API rate limiting
- `VOICE_AGENT_TOKEN_DURATION`: Session management
- `MAX_WEBSOCKET_CONNECTIONS`: WebSocket limits

### Step 3: Update Build Configuration

```bash
# Copy Vercel-specific Astro config
cp astro.config.vercel.mjs astro.config.mjs

# Update package.json scripts (add these)
npm pkg set scripts.deploy:vercel="./scripts/deploy-vercel.sh"
npm pkg set scripts.deploy:vercel:preview="./scripts/deploy-vercel.sh preview"
npm pkg set scripts.build:vercel="astro build --config astro.config.vercel.mjs"
```

### Step 4: Environment Variables Setup

#### In Vercel Dashboard:
1. Go to **Project Settings** → **Environment Variables**
2. Add all variables from `.env.vercel.example`
3. Set appropriate environments (Production/Preview/Development)

#### Critical Variables for Voice Agent:
```bash
# Required for OpenAI integration
OPENAI_API_KEY=sk-your-key-here

# CORS and security
ALLOWED_ORIGINS=https://yourdomain.com,https://your-vercel-app.vercel.app

# Voice-specific settings
VOICE_AGENT_RATE_LIMIT=100
VOICE_AGENT_TOKEN_DURATION=60
MAX_WEBSOCKET_CONNECTIONS=5
VOICE_SESSION_TIMEOUT=300
```

### Step 5: Deploy Using Automated Script

```bash
# Make deployment script executable
chmod +x scripts/deploy-vercel.sh

# Deploy to preview environment first
./scripts/deploy-vercel.sh preview

# After testing, deploy to production
./scripts/deploy-vercel.sh production
```

## 🔧 Voice Agent Optimizations

### WebSocket Configuration
Vercel's serverless functions support WebSockets with these optimizations:
- **Timeout**: 30 seconds maximum (configured in `vercel.json`)
- **Memory**: 512MB for voice processing functions
- **Regions**: Global edge deployment for low latency

### OpenAI Realtime API Integration
- **Connection Persistence**: Handled through session management
- **Error Handling**: Graceful fallbacks for connection issues
- **Rate Limiting**: Built-in protection against API abuse

### Performance Optimizations
- **Code Splitting**: Voice agent components are bundled separately
- **Static Assets**: Cached with 1-year expiration
- **API Routes**: No caching for real-time voice functionality
- **ISR**: Static pages cached, voice APIs excluded

## 🧪 Testing Migration

### Local Testing
```bash
# Test with Vercel configuration locally
npm run build:vercel
npm run preview

# Test voice agent functionality
open http://localhost:4321/voice-agent-test
```

### Preview Deployment Testing
```bash
# Deploy to preview environment
./scripts/deploy-vercel.sh preview

# Test voice functionality on preview URL
# Check browser console for WebSocket connections
# Verify OpenAI API integration
```

### Production Readiness Checklist
- [ ] Voice agent responds to audio input
- [ ] WebSocket connections establish successfully
- [ ] API rate limiting works correctly
- [ ] CORS headers allow necessary origins
- [ ] Error handling works for API failures
- [ ] Performance metrics are acceptable (< 200ms API response)

## 🔒 Security Considerations

### API Key Management
- Use Vercel's encrypted environment variables
- Rotate API keys regularly
- Use different keys for staging/production
- Monitor API usage through OpenAI dashboard

### CORS Configuration
```javascript
// Proper CORS setup in vercel.json
"headers": [
  {
    "source": "/api/(.*)",
    "headers": [
      {
        "key": "Access-Control-Allow-Origin",
        "value": "https://yourdomain.com"  // Update with your domain
      }
    ]
  }
]
```

### Rate Limiting
- Implemented at function level
- Configurable via environment variables
- Protects against API abuse
- Logs suspicious activity

## 📊 Monitoring and Analytics

### Built-in Monitoring
- **Vercel Analytics**: Automatically enabled
- **Speed Insights**: Performance monitoring
- **Function Logs**: Real-time error tracking
- **Usage Metrics**: API call monitoring

### Voice-Specific Monitoring
Monitor these key metrics:
- WebSocket connection success rate
- Voice processing latency
- API error rates
- Session duration statistics

### Custom Monitoring Setup
```javascript
// Add to your voice agent components
import { Analytics } from '@vercel/analytics/react';

// Track voice interactions
Analytics.track('voice_session_started', {
  duration: sessionDuration,
  success: sessionSuccess
});
```

## 🔄 Rollback Plan

If issues occur during migration:

### Quick Rollback to Cloudflare
```bash
# Restore original configuration
mv astro.config.mjs.backup astro.config.mjs

# Redeploy to Cloudflare
npm run cf:deploy
```

### Gradual Migration Approach
1. Deploy to Vercel preview first
2. Test thoroughly with small user group
3. Update DNS gradually (percentage-based routing)
4. Monitor metrics closely
5. Complete migration only after validation

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### WebSocket Connection Issues
```javascript
// Check WebSocket URL in browser console
// Ensure proper CORS headers
// Verify Vercel function regions match user locations
```

#### API Rate Limiting
```javascript
// Check rate limit configuration
// Monitor OpenAI usage dashboard
// Implement exponential backoff
```

#### Build Failures
```bash
# Clear cache and retry
rm -rf dist .astro node_modules/.cache
npm ci
npm run build:vercel
```

#### Environment Variable Issues
- Verify variables are set in correct Vercel environments
- Check variable names match exactly
- Ensure no trailing spaces in values

### Debug Mode
Enable debug logging in preview environments:
```bash
# Set in Vercel environment variables
DEBUG_VOICE_AGENT=true
VERCEL_ENV=preview
```

## 📈 Performance Optimization

### Voice Application Specific
- **Latency**: Target < 100ms for voice processing
- **Throughput**: Support 100+ concurrent voice sessions
- **Memory**: 512MB allocated for voice functions
- **Regions**: Deploy to multiple regions for global coverage

### Caching Strategy
```javascript
// Static assets: 1 year cache
// API routes: No cache
// HTML pages: ISR with 1 hour expiration
```

### Bundle Size Optimization
- Voice components code-split
- OpenAI SDK optimized for serverless
- WebRTC polyfills loaded conditionally

## 🎉 Post-Migration Tasks

### Immediate (Day 1)
- [ ] Verify all voice functionality
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Test from different geographic regions

### Short-term (Week 1)
- [ ] Analyze user feedback
- [ ] Optimize based on real usage patterns
- [ ] Fine-tune rate limiting
- [ ] Update documentation

### Long-term (Month 1)
- [ ] Review cost optimization opportunities
- [ ] Implement advanced analytics
- [ ] Consider edge computing optimizations
- [ ] Plan for scaling

## 📞 Support and Resources

### Vercel Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Astro Vercel Guide](https://docs.astro.build/en/guides/deploy/vercel/)
- [Vercel Support](https://vercel.com/support)

### Voice Agent Specific
- [OpenAI Realtime API Docs](https://platform.openai.com/docs/guides/realtime)
- [WebRTC Documentation](https://webrtc.org/getting-started/)
- [Voice Agent Test Suite](./src/tests/integration/voice-agent-comprehensive.test.js)

### Emergency Contacts
- **Technical Issues**: Use the rollback plan above
- **API Issues**: Check OpenAI status page
- **Vercel Platform Issues**: Check Vercel status page

---

## 📋 Migration Checklist Summary

- [ ] Install Vercel dependencies
- [ ] Configure `vercel.json` for voice optimization
- [ ] Update Astro config for Vercel adapter
- [ ] Set up environment variables
- [ ] Test preview deployment thoroughly
- [ ] Monitor voice functionality
- [ ] Deploy to production
- [ ] Update DNS records (if using custom domain)
- [ ] Implement monitoring and analytics
- [ ] Document any custom configurations

**Estimated Migration Time**: 2-4 hours for technical setup + testing time

**Downtime**: Minimal (can be zero with proper DNS management)

**Risk Level**: Low (with proper testing and rollback plan)

---

*This migration guide is specifically optimized for voice agent applications with WebRTC and OpenAI Realtime API integration. For questions or issues during migration, refer to the troubleshooting section or contact your technical team.*