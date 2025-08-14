# Cloudflare Pages Deployment Guide

## Prerequisites
- Cloudflare account with Pages access
- Domain configured in Cloudflare DNS
- OpenAI API key with appropriate tier access
- Wrangler CLI installed (`npm install -g wrangler`)

## Local Setup Complete ✅
The application has been configured for Cloudflare Pages deployment with:
- ✅ Cloudflare adapter installed (`@astrojs/cloudflare`)
- ✅ Wrangler CLI installed as dev dependency
- ✅ Configuration updated in `astro.config.mjs`
- ✅ API endpoints updated to use `import.meta.env`
- ✅ Deployment scripts added to `package.json`
- ✅ `wrangler.toml` configuration created

## Deployment Steps

### 1. Build and Test Locally
```bash
# Build the application
npm run build

# Test with Cloudflare's local environment
npm run cf:preview
```

### 2. Login to Cloudflare
```bash
# Authenticate with Cloudflare
wrangler login
```

### 3. Initial Deployment
```bash
# Deploy to production
npm run cf:deploy

# Or deploy to preview branch
npm run cf:deploy:preview
```

### 4. Configure Environment Variables
After the first deployment, configure environment variables in the Cloudflare dashboard:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** > **Your Project** > **Settings** > **Environment variables**
3. Add the following variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `ALLOWED_ORIGINS`: Comma-separated list of allowed origins (e.g., `https://executiveaitraining.com,https://www.executiveaitraining.com`)
   - `VOICE_AGENT_TOKEN_DURATION`: Token duration in seconds (default: 1800)
   - `VOICE_AGENT_RATE_LIMIT`: Rate limit per minute (default: 10)

### 5. Custom Domain Setup
1. In Cloudflare Pages dashboard, go to **Custom domains**
2. Add your domain: `executiveaitraining.com`
3. Add www subdomain: `www.executiveaitraining.com`
4. Cloudflare will automatically configure DNS records

## Available Commands

```bash
# Development
npm run dev              # Local development server

# Building
npm run build           # Production build
npm run build:prod      # Build with analysis

# Cloudflare Deployment
npm run cf:preview      # Preview locally with Wrangler
npm run cf:deploy       # Deploy to production
npm run cf:deploy:preview # Deploy to preview branch

# Testing
npm run test            # Run all tests
npm run test:voice      # Test voice agent
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | - | OpenAI API key for Realtime API |
| `ALLOWED_ORIGINS` | No | localhost | Comma-separated allowed origins |
| `VOICE_AGENT_TOKEN_DURATION` | No | 1800 | Token duration in seconds |
| `VOICE_AGENT_RATE_LIMIT` | No | 10 | Max requests per minute |
| `VOICE_AGENT_DEMO_MODE` | No | false | Enable demo mode without API |

## Monitoring & Debugging

### View Logs
```bash
# View real-time logs
wrangler tail

# View function logs in dashboard
# Go to Workers & Pages > Your Project > Functions > Real-time logs
```

### Check Deployment Status
```bash
# List all deployments
wrangler pages deployment list

# View specific deployment
wrangler pages deployment tail
```

## Troubleshooting

### Common Issues

1. **Environment variables not working**
   - Ensure variables are set in Cloudflare dashboard, not in `.env` file
   - Redeploy after changing environment variables
   - Use `import.meta.env` instead of `process.env`

2. **Build failures**
   - Check Node.js version compatibility (use Node 18+)
   - Clear cache: `npm run clean && npm install`
   - Check for TypeScript errors: `npx tsc --noEmit`

3. **API endpoints returning 404**
   - Verify `output: 'server'` in `astro.config.mjs`
   - Check that SSR is enabled for API routes
   - Ensure `prerender = false` in API files

4. **CORS errors**
   - Update `ALLOWED_ORIGINS` environment variable
   - Include your production domain
   - Check preflight OPTIONS handlers

## Performance Optimization

The deployment is optimized with:
- Edge runtime for low latency
- Automatic caching for static assets
- Compressed builds
- Optimized bundle splitting
- WebRTC for real-time voice

## Security Considerations

- ✅ API keys stored as environment variables
- ✅ CORS protection configured
- ✅ Rate limiting implemented
- ✅ Token-based authentication
- ✅ No client-side API key exposure

## Next Steps

1. Deploy to Cloudflare Pages
2. Configure custom domain
3. Set environment variables
4. Test voice agent functionality
5. Monitor performance and logs
6. Set up alerting for errors

## Support

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)