# 🚀 Quick Deployment Guide

You're almost there! The KV namespaces are already created. Here's what to do:

## 1. Set the OpenAI API Key Secret

For **production** deployment:
```bash
npx wrangler secret put OPENAI_API_KEY --env=""
```

When prompted, paste your OpenAI API key.

## 2. Deploy to Workers

```bash
npm run workers:deploy
```

This will:
- Build the application
- Deploy to Cloudflare Workers
- Give you a live URL

## 3. Test Your Deployment

Once deployed, you'll get a URL like:
```
https://executive-ai-training.{your-subdomain}.workers.dev
```

Visit this URL to test your voice agent!

## Optional: Set Additional Secrets

If you want to set up JWT and admin password:

```bash
# Generate a secure JWT secret
openssl rand -base64 32

# Set JWT secret
npx wrangler secret put JWT_SECRET --env=""

# Set admin password
npx wrangler secret put ADMIN_PASSWORD --env=""
```

## That's it! 🎉

Your voice agent is now live on Cloudflare Workers with:
- ✅ Ultra-low latency
- ✅ Global edge deployment
- ✅ WebRTC voice support
- ✅ OpenAI Realtime API integration