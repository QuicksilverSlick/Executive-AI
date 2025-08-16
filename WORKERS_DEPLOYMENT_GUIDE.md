# Cloudflare Workers Deployment Guide

## Executive AI Training - Workers with Static Assets (2025)

This guide covers deploying the Executive AI Training voice agent application to Cloudflare Workers using the new 2025 static assets approach.

## Overview

This deployment uses:
- **Cloudflare Workers** (not Pages) for server-side rendering and API routes
- **Static Assets binding** for serving static files directly from Workers
- **KV storage** for session management and rate limiting
- **Proper routing** with API routes handled by Worker and static files by Assets

## Prerequisites

1. **Cloudflare Account** with Workers enabled
2. **Domain configured** in Cloudflare (optional, can use *.workers.dev)
3. **Wrangler CLI** installed and authenticated
4. **OpenAI API Key** for voice agent functionality

## Installation

```bash
# Install Wrangler globally
npm install -g wrangler

# Authenticate with Cloudflare
wrangler auth login

# Install project dependencies
npm install
```

## Setup Process

### 1. Create KV Namespaces

```bash
# Create all required KV namespaces automatically
npm run workers:kv:create
```

This script will:
- Create KV namespaces for sessions, rate limits, voice tokens, and performance logs
- Create separate namespaces for production, development, and staging
- Update `wrangler.toml` with the actual namespace IDs

### 2. Configure Secrets

Set up the required secrets for your Workers deployment:

```bash
# Set OpenAI API key
wrangler secret put OPENAI_API_KEY

# Set allowed origins for CORS
wrangler secret put ALLOWED_ORIGINS

# Set JWT secret for session management
wrangler secret put JWT_SECRET
```

### 3. Update Domain Configuration (Optional)

If using a custom domain, update the `zone_id` values in `wrangler.toml`:

```toml
[[routes]]
pattern = "yourdomain.com/api/*"
zone_id = "your-actual-zone-id"
```

Get your zone ID from the Cloudflare dashboard under your domain settings.

## Build and Deployment

### Development Deployment

```bash
# Build and deploy to development environment
npm run workers:deploy:dev
```

### Staging Deployment

```bash
# Build and deploy to staging environment
npm run workers:deploy:staging
```

### Production Deployment

```bash
# Build and deploy to production
npm run workers:deploy
```

## Local Development

### Run Workers Locally

```bash
# Start local Workers development server
npm run workers:dev
```

### Build for Workers

```bash
# Build the application for Workers deployment
npm run workers:build
```

### Clean Build

```bash
# Clean and rebuild everything
npm run workers:build:clean
```

## Architecture Details

### File Structure

```
dist/
├── _astro/          # Static assets (CSS, JS, images)
├── _worker.js/      # Astro-generated Worker code
├── images/          # Static images
├── audio/           # Audio files
├── robots.txt       # Static files
└── sitemap.xml      # Static files

src/
└── worker.js        # Main Worker entry point
```

### Routing Strategy

The Workers deployment uses a sophisticated routing strategy:

1. **API Routes** (`/api/*`): Handled by the Worker for server-side processing
2. **Static Assets**: Served directly through the ASSETS binding
3. **SPA Fallback**: Non-API routes serve the main application for client-side routing

### Key Features

- **Rate Limiting**: Implemented using KV storage
- **CORS Handling**: Proper headers for voice agent API
- **Security Headers**: CSP, XSS protection, and other security measures
- **Error Handling**: Comprehensive error handling and logging
- **Session Management**: KV-based session storage for voice agent state

## Environment Variables

The following environment variables are configured in `wrangler.toml`:

- `ENVIRONMENT`: Deployment environment (production, staging, development)
- `API_VERSION`: API version identifier
- `VOICE_AGENT_VERSION`: Voice agent version
- `MAX_CONCURRENT_SESSIONS`: Maximum concurrent voice sessions
- `SESSION_TIMEOUT_MINUTES`: Session timeout duration
- `RATE_LIMIT_WINDOW_SECONDS`: Rate limiting window
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window
- `WORKERS_ASSETS_MODE`: Enables static assets mode

## KV Namespaces

The deployment uses four KV namespaces:

1. **SESSIONS**: Voice agent session data
2. **RATE_LIMITS**: Rate limiting counters
3. **VOICE_TOKENS**: Voice authentication tokens
4. **PERFORMANCE_LOGS**: Performance monitoring data

## Monitoring and Debugging

### View Logs

```bash
# Tail production logs
npm run workers:tail

# Tail staging logs
npm run workers:tail:staging
```

### Performance Monitoring

The deployment includes built-in performance monitoring:
- Response time tracking
- Error rate monitoring
- Session usage statistics
- Rate limiting metrics

### Debug Information

Each deployment includes a `deployment-info.json` file in the dist folder with:
- Build timestamp
- Environment configuration
- Feature flags
- Build metadata

## Troubleshooting

### Common Issues

1. **KV Namespace Errors**
   - Ensure all KV namespaces are created: `npm run workers:kv:create`
   - Check that namespace IDs in `wrangler.toml` are correct

2. **OpenAI API Issues**
   - Verify the OpenAI API key is set: `wrangler secret list`
   - Check API key has sufficient credits and permissions

3. **CORS Errors**
   - Ensure `ALLOWED_ORIGINS` secret is set with correct domains
   - Check that the domain is included in the allowed origins list

4. **Static Asset Issues**
   - Verify the build completed successfully: `npm run workers:build`
   - Check that the `dist` directory contains both `_worker.js` and static assets

### Getting Help

If you encounter issues:

1. Check the Workers logs: `npm run workers:tail`
2. Verify the build output: `npm run workers:build`
3. Test locally first: `npm run workers:dev`
4. Review the deployment info: Check `dist/deployment-info.json`

## Deployment URLs

After successful deployment, your application will be available at:

- **Production**: `https://executive-ai-training.workers.dev` or your custom domain
- **Staging**: `https://executive-ai-training-staging.workers.dev`
- **Development**: `https://executive-ai-training-dev.workers.dev`

## Differences from Pages Deployment

This Workers deployment differs from the previous Pages approach:

1. **Server-Side Rendering**: Full SSR support with proper API routing
2. **Static Assets**: Direct serving through Workers instead of Pages
3. **Better Performance**: Optimized routing and caching
4. **Proper SSL**: No SSL certificate issues like with Pages
5. **More Control**: Full control over request handling and routing

## Next Steps

After successful deployment:

1. Test all voice agent functionality
2. Monitor performance and error rates
3. Set up custom domain (if not already done)
4. Configure monitoring and alerting
5. Set up CI/CD pipeline for automatic deployments

---

*This deployment guide ensures a reliable, scalable Workers deployment with proper static asset handling and voice agent functionality.*