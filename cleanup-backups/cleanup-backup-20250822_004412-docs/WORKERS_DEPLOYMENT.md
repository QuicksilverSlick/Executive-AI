# Cloudflare Workers Deployment Guide

<!--
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Complete guide for Cloudflare Workers deployment with all fixes applied
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-unknown-20250816-384
 * @init-timestamp: 2025-08-16T11:50:00Z
 * @reasoning:
 * - **Objective:** Document all deployment fixes and provide clear deployment instructions
 * - **Strategy:** Comprehensive guide covering issues, fixes, and deployment process
 * - **Outcome:** Clear documentation for successful Workers deployment
 -->

## Overview

This application is configured for deployment to Cloudflare Workers using the new 2025 static assets approach. All major deployment issues have been resolved, including import path resolution, MessageChannel compatibility, and proper asset serving.

## Fixed Issues

### ✅ Import Path Resolution
**Problem**: Worker was trying to import from `"./_astro/_@astrojs-ssr-adapter.js"` but files were in `"dist/_astro/"`

**Solution**: 
- Updated `wrangler.toml` to use `dist/_worker.js/index.js` as the main entry point
- Created `scripts/fix-worker-imports.js` to fix relative import paths
- Imports now correctly resolve to `"../_astro/_@astrojs-ssr-adapter.js"`

### ✅ MessageChannel Compatibility
**Problem**: Cloudflare Workers doesn't natively support MessageChannel

**Solution**:
- Added compatibility flags: `["nodejs_compat", "streams_enable_constructors"]`
- Injected MessageChannel polyfill into all Worker files
- Added compatibility layer for Workers runtime

### ✅ Static Assets Configuration  
**Problem**: Worker files were being served as static assets causing conflicts

**Solution**:
- Configured proper assets binding in `wrangler.toml`
- Created `.assetsignore` to exclude Worker files from static serving
- Proper separation between Worker runtime and static assets

## File Structure

```
├── dist/
│   ├── _worker.js/
│   │   ├── index.js          # Main Worker entry point (fixed imports)
│   │   ├── renderers.mjs     # Astro renderers (with polyfills)
│   │   ├── manifest_*.mjs    # Route manifest
│   │   └── pages/            # API route handlers
│   ├── _astro/               # Static assets (CSS, JS)
│   │   ├── _@astrojs-ssr-adapter.*.js  # SSR adapter
│   │   └── *.css, *.js       # Other assets
│   └── *.html                # Static HTML files
├── wrangler.toml             # Workers configuration (updated)
├── .assetsignore             # Exclude Worker files from assets
└── scripts/
    ├── fix-worker-imports.js       # Fix import paths
    ├── inject-polyfill-complete.js # Add MessageChannel polyfill  
    ├── validate-workers-config.js  # Validate deployment readiness
    └── deploy-workers-complete.sh  # Complete deployment script
```

## Configuration

### wrangler.toml
Key configuration changes:
- `main = "dist/_worker.js/index.js"` - Direct to built Worker
- `compatibility_flags = ["nodejs_compat", "streams_enable_constructors"]` - Required for MessageChannel
- `[assets]` section with proper exclusions
- Environment-specific configurations for dev/staging/production

### .assetsignore
Prevents Worker files from being served as static assets:
```
_worker.js/
_worker.js/**
**/*.map
**/manifest*.mjs
```

## Deployment Process

### Quick Deployment
```bash
# Build and validate
npm run build
npm run workers:validate

# Deploy to development
npm run workers:deploy:complete

# Deploy to staging  
npm run workers:deploy:complete:staging

# Deploy to production
npm run workers:deploy:complete:production
```

### Manual Deployment Steps

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Validate configuration**:
   ```bash
   npm run workers:validate
   ```

3. **Deploy**:
   ```bash
   # Development
   wrangler deploy --env development
   
   # Staging
   wrangler deploy --env staging
   
   # Production  
   wrangler deploy
   ```

## Build Process Details

The build process includes several post-build steps that fix deployment issues:

1. **Standard Astro Build**: Creates the Worker and static assets
2. **Optimization**: Compresses files for better performance  
3. **Polyfill Injection**: Adds MessageChannel polyfill to all Worker files
4. **Import Path Fixing**: Corrects relative import paths for Workers runtime

## Testing

### Local Validation
```bash
# Validate all configuration
npm run workers:validate

# Check specific components
node scripts/validate-workers-config.js
```

### Live Testing
```bash
# Monitor deployment logs
wrangler tail

# Test health endpoint
curl https://your-worker.workers.dev/api/voice-agent/health

# Test voice agent functionality
curl -X POST https://your-worker.workers.dev/api/voice-agent/token
```

## Environment Configuration

### Required Secrets
Set these using `wrangler secret put <NAME>`:
```bash
wrangler secret put OPENAI_API_KEY
wrangler secret put ALLOWED_ORIGINS  
wrangler secret put JWT_SECRET
```

### KV Namespaces
Create required namespaces:
```bash
npm run workers:kv:create
```

Required namespaces:
- `SESSIONS` - Session management
- `RATE_LIMITS` - Rate limiting
- `VOICE_TOKENS` - Voice agent tokens
- `PERFORMANCE_LOGS` - Performance monitoring

## Troubleshooting

### Common Issues

**Error: "Could not resolve import"**
- Ensure build completed successfully: `npm run build`
- Check import paths are fixed: Look for `../` instead of `./` in Worker files

**Error: "MessageChannel is not defined"**  
- Verify polyfill injection: Check if Worker files contain MessageChannel polyfill
- Re-run build: `npm run build` will re-inject polyfills

**Error: "Worker file served as static asset"**
- Check `.assetsignore` excludes `_worker.js/`
- Verify `wrangler.toml` assets configuration

**Error: "Invalid binding 'ASSETS'"**
- Update `wrangler.toml` to include assets configuration
- Ensure using Wrangler v3+ with assets support

### Debug Commands
```bash
# Validate everything
npm run workers:validate

# Check build output
ls -la dist/_worker.js/
ls -la dist/_astro/

# Test deployment configuration
wrangler deploy --dry-run

# Monitor live logs
wrangler tail
```

## API Endpoints

Once deployed, these endpoints will be available:

### Voice Agent API
- `GET /api/voice-agent/health` - Health check
- `POST /api/voice-agent/token` - Get access token
- `POST /api/voice-agent/chat-fallback` - Text chat fallback
- `GET /api/voice-agent/compatibility` - Check browser compatibility

### Development/Debug
- `POST /api/dev/clear-rate-limits` - Clear rate limits (dev only)
- `GET /api/voice-agent/debug-env` - Environment debug info

## Performance

The Workers deployment includes several optimizations:
- Gzip compression for all assets
- Asset bundling and minification  
- Efficient routing (API through Worker, static through Assets)
- Rate limiting and session management via KV stores
- Security headers for all responses

## Security

Security features included:
- CORS configuration for voice agent APIs
- Rate limiting (10 requests/minute for general, 50 for APIs)
- Security headers (CSP, XSS protection, etc.)
- JWT token validation for voice agent access

---

## Next Steps

1. **Update DNS**: Point your domain to the Workers deployment
2. **Configure Monitoring**: Set up alerts for errors and performance
3. **Test Voice Agent**: Verify all voice functionality works correctly
4. **Monitor Logs**: Use `wrangler tail` to monitor for any issues

<!--
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250816-384
 * @timestamp: 2025-08-16T11:50:00Z
 * @reasoning:
 * - **Objective:** Created comprehensive deployment documentation covering all fixes
 * - **Strategy:** Document problems, solutions, and complete deployment process
 * - **Outcome:** Complete guide enabling successful Workers deployment
 -->