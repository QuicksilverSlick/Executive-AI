# Vercel Deployment Package

This package contains all necessary files for deploying to Vercel.

## Deployment Steps

1. Log in to Vercel:
   ```bash
   vercel login
   ```

2. Deploy to preview:
   ```bash
   vercel deploy --prebuilt
   ```

3. Deploy to production:
   ```bash
   vercel deploy --prod --prebuilt
   ```

## Build Info

- Timestamp: 2025-08-16 10:24:20
- Git Branch: main
- Git Commit: 08ab51d

## Environment Variables

Make sure to set the following in your Vercel project:
- OPENAI_API_KEY
- ALLOWED_ORIGINS
- VOICE_AGENT_RATE_LIMIT
- PUBLIC_SITE_URL
